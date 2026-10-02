import React, { useRef, useEffect, useState, useMemo } from 'react';
import { StarSystem, Resources, ShipStats, GalacticNewsItem, FactionWar, SpatialAnomaly, MarketEvent } from '../types/game';
import { TradeRoute, calculateGalaxyTradeRoutes, getSystemTradeOpportunities } from '../utils/tradeRoutes';
import { INITIAL_FACTION_WARS } from '../data/factionWarsData';
import { getAnomalyPolarityBadge } from '../data/anomaliesData';
import { sounds } from '../services/soundEffects';
import { 
  Zap, 
  ShieldAlert, 
  Compass, 
  MapPin, 
  Radio, 
  Fuel, 
  Orbit,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronUp,
  ChevronDown,
  Info,
  X,
  Skull,
  ArrowRightLeft,
  TrendingUp,
  Coins,
  Store,
  Package,
  ArrowRight,
  Sparkles,
  Layers,
  Swords,
  Bomb,
  AlertTriangle,
  Atom,
  Clock,
  Flame
} from 'lucide-react';

interface GalaxyMapProps {
  systems: StarSystem[];
  currentSystemId: string;
  resources: Resources;
  shipStats: ShipStats;
  onWarpJump: (targetSystem: StarSystem) => void;
  onEnterSystem: (system: StarSystem) => void;
  pirateHeat?: number;
  activeNews?: GalacticNewsItem[];
  onOpenTradeStation?: () => void;
  onOpenWars?: () => void;
  anomalies?: SpatialAnomaly[];
  onScanAnomalies?: () => void;
  onOpenExpeditionLog?: () => void;
  activeMarketEvents?: MarketEvent[];
}

export const GalaxyMap: React.FC<GalaxyMapProps> = ({
  systems,
  currentSystemId,
  resources,
  shipStats,
  onWarpJump,
  onEnterSystem,
  pirateHeat = 0,
  activeNews = [],
  onOpenTradeStation,
  onOpenWars,
  anomalies = [],
  onScanAnomalies,
  onOpenExpeditionLog,
  activeMarketEvents = []
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedSystemId, setSelectedSystemId] = useState<string>(currentSystemId);
  const [filterSector, setFilterSector] = useState<'all' | 'alpha' | 'beta' | 'gamma' | 'soul_society'>('all');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [touchMoved, setTouchMoved] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  // Trade Route Visualization States
  const [showTradeRoutes, setShowTradeRoutes] = useState<boolean>(true);
  const [tradeFilter, setTradeFilter] = useState<'all' | 'from_current' | 'top_profitable' | 'contraband'>('all');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'telemetry' | 'trade'>('trade');

  // Spatial Anomaly Visualization States
  const [showAnomalies, setShowAnomalies] = useState<boolean>(true);
  const [showAnomalyListModal, setShowAnomalyListModal] = useState<boolean>(false);

  // Calculate dynamic trade routes taking into account Galactic Herald news and Market Events
  const allTradeRoutes = useMemo(() => {
    return calculateGalaxyTradeRoutes(systems, activeNews, shipStats.cargoCapacity, activeMarketEvents);
  }, [systems, activeNews, shipStats.cargoCapacity, activeMarketEvents]);

  // Filtered trade routes for canvas rendering
  const displayedTradeRoutes = useMemo(() => {
    if (!showTradeRoutes) return [];
    if (tradeFilter === 'from_current') {
      return allTradeRoutes.filter(r => r.fromSystem.id === currentSystemId);
    }
    if (tradeFilter === 'top_profitable') {
      return allTradeRoutes.filter(r => r.tier === 'legendary' || r.profitMarginPercent >= 50);
    }
    if (tradeFilter === 'contraband') {
      return allTradeRoutes.filter(r => r.isContraband);
    }
    // 'all': show top 14 most profitable to maintain visual elegance
    return allTradeRoutes.slice(0, 14);
  }, [allTradeRoutes, showTradeRoutes, tradeFilter, currentSystemId]);

  const currentSystem = useMemo(() => {
    return systems.find(s => s.id === currentSystemId) || systems[0];
  }, [systems, currentSystemId]);

  const selectedSystem = useMemo(() => {
    return systems.find(s => s.id === selectedSystemId) || currentSystem;
  }, [systems, selectedSystemId, currentSystem]);

  // Active Spatial Anomaly for selected system
  const selectedSystemAnomaly = useMemo(() => {
    return anomalies.find(a => a.systemId === selectedSystem.id);
  }, [anomalies, selectedSystem.id]);

  // Active Spatial Anomaly for current system
  const currentSystemAnomaly = useMemo(() => {
    return anomalies.find(a => a.systemId === currentSystem.id);
  }, [anomalies, currentSystem.id]);

  // Speed boost bonus check: destination or current origin has tachyon speed boost
  const hasSpeedBoost = useMemo(() => {
    return (
      selectedSystemAnomaly?.type === 'speed_boost' || 
      currentSystemAnomaly?.type === 'speed_boost'
    );
  }, [selectedSystemAnomaly, currentSystemAnomaly]);

  // Active Faction Wars
  const factionWars: FactionWar[] = useMemo(() => {
    try {
      const saved = localStorage.getItem('astraea_faction_wars_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_FACTION_WARS;
  }, []);

  const selectedSystemWar = useMemo(() => {
    return factionWars.find(w => w.active && w.targetSystemIds.includes(selectedSystem.id));
  }, [factionWars, selectedSystem.id]);

  // Selected system trade opportunities
  const selectedSystemTrades = useMemo(() => {
    return getSystemTradeOpportunities(selectedSystem.id, allTradeRoutes);
  }, [selectedSystem.id, allTradeRoutes]);

  const selectedSystemMarketEvents = useMemo(() => {
    return activeMarketEvents.filter(e => e.systemId === selectedSystem.id);
  }, [activeMarketEvents, selectedSystem.id]);

  const currentSystemTrades = useMemo(() => {
    return getSystemTradeOpportunities(currentSystem.id, allTradeRoutes);
  }, [currentSystem.id, allTradeRoutes]);

  // Distance calculation in light years
  const distanceToSelected = useMemo(() => {
    if (!currentSystem || !selectedSystem) return 0;
    const dx = selectedSystem.x - currentSystem.x;
    const dy = selectedSystem.y - currentSystem.y;
    return Math.round(Math.sqrt(dx * dx + dy * dy));
  }, [currentSystem, selectedSystem]);

  // Fuel calculation (1 fuel per 10 light-years) - waived (0 He-3) if tachyon speed boost anomaly is active!
  const fuelCost = useMemo(() => {
    if (hasSpeedBoost) return 0;
    return Math.max(5, Math.round(distanceToSelected / 10));
  }, [distanceToSelected, hasSpeedBoost]);

  const canJump = useMemo(() => {
    if (selectedSystem.id === currentSystem.id) return false;
    if (distanceToSelected > shipStats.warpRange) return false;
    if (fuelCost > 0 && resources.fuel < fuelCost) return false;
    return true;
  }, [selectedSystem.id, currentSystem.id, distanceToSelected, shipStats.warpRange, resources.fuel, fuelCost]);

  // Pre-generate background nebula particles
  const backgroundStars = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 400; i++) {
      stars.push({
        x: Math.random() * 1200,
        y: Math.random() * 800,
        size: Math.random() * 1.8 + 0.3,
        alpha: Math.random() * 0.7 + 0.2
      });
    }
    return stars;
  }, []);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep space background gradient (translucent blend over parallax starfield)
      const bgGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 50,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      bgGrad.addColorStop(0, 'rgba(10, 15, 29, 0.45)');
      bgGrad.addColorStop(0.6, 'rgba(6, 8, 16, 0.55)');
      bgGrad.addColorStop(1, 'rgba(3, 4, 8, 0.65)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Apply pan & zoom
      ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-500, -350); // Center around 500, 350 in galaxy coordinates

      // Draw faint galactic coordinate grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= 1100; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 700);
        ctx.stroke();
      }
      for (let y = 0; y <= 700; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1100, y);
        ctx.stroke();
      }

      // Draw dust clouds / nebula hints
      const nebulaGrad = ctx.createRadialGradient(620, 380, 20, 620, 380, 260);
      nebulaGrad.addColorStop(0, 'rgba(129, 140, 248, 0.08)');
      nebulaGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.04)');
      nebulaGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = nebulaGrad;
      ctx.beginPath();
      ctx.arc(620, 380, 260, 0, Math.PI * 2);
      ctx.fill();

      // Draw deep core accretion glow
      const coreGrad = ctx.createRadialGradient(880, 440, 5, 880, 440, 180);
      coreGrad.addColorStop(0, 'rgba(192, 132, 252, 0.15)');
      coreGrad.addColorStop(0.6, 'rgba(236, 72, 153, 0.05)');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(880, 440, 180, 0, Math.PI * 2);
      ctx.fill();

      // Draw Soul Society spiritual nexus glow (Bleach realm)
      const soulGrad = ctx.createRadialGradient(980, 200, 10, 980, 200, 240);
      soulGrad.addColorStop(0, 'rgba(168, 85, 247, 0.16)');
      soulGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.1)');
      soulGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = soulGrad;
      ctx.beginPath();
      ctx.arc(980, 200, 240, 0, Math.PI * 2);
      ctx.fill();

      // Draw Namek triad sun emerald-golden glow (Dragon Ball realm)
      const namekGrad = ctx.createRadialGradient(390, 160, 5, 390, 160, 150);
      namekGrad.addColorStop(0, 'rgba(52, 211, 153, 0.18)');
      namekGrad.addColorStop(0.45, 'rgba(251, 191, 36, 0.06)');
      namekGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = namekGrad;
      ctx.beginPath();
      ctx.arc(390, 160, 150, 0, Math.PI * 2);
      ctx.fill();

      // Render static background starfield
      backgroundStars.forEach((star) => {
        ctx.fillStyle = `rgba(226, 232, 240, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Warp jump range circle from current player system
      if (currentSystem) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(currentSystem.x, currentSystem.y, shipStats.warpRange, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.stroke();

        const rangeFill = ctx.createRadialGradient(
          currentSystem.x, currentSystem.y, 20,
          currentSystem.x, currentSystem.y, shipStats.warpRange
        );
        rangeFill.addColorStop(0, 'rgba(56, 189, 248, 0.03)');
        rangeFill.addColorStop(1, 'rgba(56, 189, 248, 0.005)');
        ctx.fillStyle = rangeFill;
        ctx.fill();
        ctx.restore();
      }

      // Draw hyperlane connections between nearby systems
      for (let i = 0; i < systems.length; i++) {
        for (let j = i + 1; j < systems.length; j++) {
          const s1 = systems[i];
          const s2 = systems[j];
          const dx = s1.x - s2.x;
          const dy = s1.y - s2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 260) {
            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Render Active Trade Routes & Cargo Convoys
      if (showTradeRoutes && displayedTradeRoutes.length > 0) {
        displayedTradeRoutes.forEach((route, idx) => {
          const s1 = route.fromSystem;
          const s2 = route.toSystem;
          const dx = s2.x - s1.x;
          const dy = s2.y - s1.y;
          const dist = Math.hypot(dx, dy);
          if (dist === 0) return;

          const normalX = -dy / dist;
          const normalY = dx / dist;

          // Curvature: directional arc
          const curvature = 26;
          const ctrlX = (s1.x + s2.x) / 2 + normalX * curvature;
          const ctrlY = (s1.y + s2.y) / 2 + normalY * curvature;

          const isRouteSelected = selectedRouteId === route.id;
          const isRouteHovered = hoveredRouteId === route.id;

          // Determine line style and color based on tier & contraband
          let strokeColor = 'rgba(56, 189, 248, 0.4)';
          let glowColor = 'rgba(56, 189, 248, 0.2)';
          let lineWidth = 1.6;

          if (route.tier === 'legendary') {
            strokeColor = isRouteSelected || isRouteHovered ? '#10B981' : 'rgba(16, 185, 129, 0.8)';
            glowColor = 'rgba(16, 185, 129, 0.45)';
            lineWidth = isRouteSelected || isRouteHovered ? 3.5 : 2.5;
          } else if (route.isContraband) {
            strokeColor = isRouteSelected || isRouteHovered ? '#E879F9' : 'rgba(232, 121, 249, 0.75)';
            glowColor = 'rgba(232, 121, 249, 0.4)';
            lineWidth = isRouteSelected || isRouteHovered ? 3.2 : 2.2;
          } else if (route.tier === 'high') {
            strokeColor = isRouteSelected || isRouteHovered ? '#38BDF8' : 'rgba(56, 189, 248, 0.7)';
            glowColor = 'rgba(56, 189, 248, 0.35)';
            lineWidth = isRouteSelected || isRouteHovered ? 3 : 2;
          } else {
            strokeColor = isRouteSelected || isRouteHovered ? '#CBD5E1' : 'rgba(148, 163, 184, 0.35)';
            glowColor = 'rgba(148, 163, 184, 0.15)';
            lineWidth = isRouteSelected || isRouteHovered ? 2.5 : 1.2;
          }

          ctx.save();

          // Outer aura glow
          if (route.tier === 'legendary' || isRouteSelected || isRouteHovered || route.isContraband) {
            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.quadraticCurveTo(ctrlX, ctrlY, s2.x, s2.y);
            ctx.strokeStyle = glowColor;
            ctx.lineWidth = lineWidth + 4;
            ctx.stroke();
          }

          // Main trade route line
          ctx.beginPath();
          ctx.moveTo(s1.x, s1.y);
          ctx.quadraticCurveTo(ctrlX, ctrlY, s2.x, s2.y);
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = lineWidth;
          if (route.isContraband) {
            ctx.setLineDash([5, 4]);
          } else {
            ctx.setLineDash([8, 4]);
          }
          ctx.stroke();
          ctx.setLineDash([]);

          // Animated cargo transport shuttle moving along quadratic bezier curve
          const speed = 0.22;
          const u = ((t * speed + idx * 0.18) % 1);
          const pu = Math.max(0, Math.min(1, u));
          const oneMinusU = 1 - pu;
          const px = oneMinusU * oneMinusU * s1.x + 2 * oneMinusU * pu * ctrlX + pu * pu * s2.x;
          const py = oneMinusU * oneMinusU * s1.y + 2 * oneMinusU * pu * ctrlY + pu * pu * s2.y;

          // Tangent angle along curve
          const tx = 2 * (1 - pu) * (ctrlX - s1.x) + 2 * pu * (s2.x - ctrlX);
          const ty = 2 * (1 - pu) * (ctrlY - s1.y) + 2 * pu * (s2.y - ctrlY);
          const angle = Math.atan2(ty, tx);

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(angle);

          // Shuttle body
          ctx.fillStyle = route.tier === 'legendary' ? '#34D399' : route.isContraband ? '#F472B6' : '#7DD3FC';
          ctx.beginPath();
          ctx.moveTo(4, 0);
          ctx.lineTo(-4, -3);
          ctx.lineTo(-2, 0);
          ctx.lineTo(-4, 3);
          ctx.closePath();
          ctx.fill();

          // Shuttle light glow
          ctx.fillStyle = glowColor;
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          // Midpoint Badge on prominent trade routes (top 6 or if selected/hovered)
          if (idx < 6 || isRouteSelected || isRouteHovered) {
            const midPointX = 0.25 * s1.x + 0.5 * ctrlX + 0.25 * s2.x;
            const midPointY = 0.25 * s1.y + 0.5 * ctrlY + 0.25 * s2.y;

            const labelText = `${route.item.name}: +${route.profitPerUnit} ⬡ (+${route.profitMarginPercent}%)`;
            ctx.font = isRouteSelected ? 'bold 10px JetBrains Mono' : '9px JetBrains Mono';
            const textWidth = ctx.measureText(labelText).width;
            const badgeW = textWidth + 14;
            const badgeH = 18;
            const bx = midPointX - badgeW / 2;
            const by = midPointY - badgeH / 2;

            ctx.fillStyle = isRouteSelected ? 'rgba(8, 13, 26, 0.95)' : 'rgba(5, 8, 17, 0.85)';
            ctx.strokeStyle = route.tier === 'legendary' ? '#10B981' : route.isContraband ? '#E879F9' : '#38BDF8';
            ctx.lineWidth = isRouteSelected ? 2 : 1;

            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(bx, by, badgeW, badgeH, 4);
            } else {
              ctx.rect(bx, by, badgeW, badgeH);
            }
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = route.tier === 'legendary' ? '#34D399' : route.isContraband ? '#F472B6' : '#E2E8F0';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(labelText, midPointX, midPointY);
          }

          ctx.restore();
        });
      }

      // If a jump target is selected, draw vector line from current to selected
      if (selectedSystem && selectedSystem.id !== currentSystem.id) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(currentSystem.x, currentSystem.y);
        ctx.lineTo(selectedSystem.x, selectedSystem.y);
        ctx.strokeStyle = canJump ? '#38BDF8' : '#F43F5E';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        // Pulsing animated energy photon along jump route
        const progress = (t * 0.5) % 1;
        const px = currentSystem.x + (selectedSystem.x - currentSystem.x) * progress;
        const py = currentSystem.y + (selectedSystem.y - currentSystem.y) * progress;
        ctx.fillStyle = canJump ? '#38BDF8' : '#F43F5E';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render Temporary Spatial Anomalies
      if (showAnomalies && anomalies.length > 0) {
        anomalies.forEach((anom) => {
          const anomPulse = Math.sin(t * anom.pulseSpeed + anom.x * 0.05);
          const baseRadius = 26;

          ctx.save();
          // Outer gravitational ripple aura
          const auraGrad = ctx.createRadialGradient(
            anom.x, anom.y, 4,
            anom.x, anom.y, baseRadius * 2.2 + anomPulse * 5
          );
          auraGrad.addColorStop(0, anom.visualColor);
          auraGrad.addColorStop(0.35, anom.visualGlow);
          auraGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(anom.x, anom.y, baseRadius * 2.2 + anomPulse * 5, 0, Math.PI * 2);
          ctx.fill();

          // Rotating accretion elliptical vortex
          ctx.strokeStyle = anom.visualColor;
          ctx.lineWidth = 1.8;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.ellipse(
            anom.x, anom.y,
            baseRadius * 1.5, baseRadius * 0.85,
            t * anom.pulseSpeed * 0.7, 0, Math.PI * 2
          );
          ctx.stroke();

          // Counter-rotating quantum harmonic ring
          ctx.strokeStyle = anom.polarity === 'bonus' ? '#34D399' : anom.polarity === 'penalty' ? '#F43F5E' : '#C084FC';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([3, 5]);
          ctx.beginPath();
          ctx.ellipse(
            anom.x, anom.y,
            baseRadius * 1.8, baseRadius * 1.1,
            -t * anom.pulseSpeed * 0.5, 0, Math.PI * 2
          );
          ctx.stroke();
          ctx.setLineDash([]);

          // Glowing singularity core
          ctx.fillStyle = anom.visualColor;
          ctx.beginPath();
          ctx.arc(anom.x, anom.y, 4 + Math.abs(anomPulse) * 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        });
      }

      // Render Each Star System
      systems.forEach((sys) => {
        const isCurrent = sys.id === currentSystemId;
        const isSelected = sys.id === selectedSystemId;
        const isFiltered = filterSector !== 'all' && sys.sector !== filterSector;

        ctx.save();
        if (isFiltered) {
          ctx.globalAlpha = 0.25;
        }

        // Star corona pulsation
        const pulse = Math.sin(t * 2 + sys.x * 0.1) * 2;
        const radius = isCurrent ? 14 : isSelected ? 12 : 9;

        // Outer glow
        const glow = ctx.createRadialGradient(sys.x, sys.y, 2, sys.x, sys.y, radius * 3.5 + pulse);
        glow.addColorStop(0, sys.starColor);
        glow.addColorStop(0.4, `${sys.starColor}44`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sys.x, sys.y, radius * 3.5 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Core star sphere
        ctx.fillStyle = sys.starColor;
        ctx.beginPath();
        ctx.arc(sys.x, sys.y, radius + (pulse * 0.4), 0, Math.PI * 2);
        ctx.fill();

        // Black hole accretion ring special effect
        if (sys.starClass === 'black_hole') {
          ctx.fillStyle = '#060810';
          ctx.beginPath();
          ctx.arc(sys.x, sys.y, radius - 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#E879F9';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(sys.x, sys.y, radius * 2.2, radius * 0.8, t, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Triple star triad orbit (Namek 3 suns)
        if (sys.starClass === 'triple_star') {
          for (let s = 0; s < 3; s++) {
            const angle = t * 1.6 + (s * (Math.PI * 2) / 3);
            const sx = sys.x + Math.cos(angle) * (radius * 1.7);
            const sy = sys.y + Math.sin(angle) * (radius * 1.7);
            ctx.fillStyle = s === 0 ? '#34D399' : s === 1 ? '#FBBF24' : '#60A5FA';
            ctx.beginPath();
            ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Spirit core Reishi nexus (Soul Society)
        if (sys.starClass === 'spirit_core') {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(sys.x, sys.y, radius * 2.2, radius * 1.1, -t * 0.9, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(192, 132, 252, 0.8)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(sys.x, sys.y, radius * 1.7, radius * 0.8, t * 1.3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Selected Target Reticle
        if (isSelected) {
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(sys.x, sys.y, radius + 10, 0, Math.PI * 2);
          ctx.stroke();

          // Reticle tick marks
          const r = radius + 14;
          const ticks = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
          ticks.forEach(angle => {
            const tx = sys.x + Math.cos(angle) * r;
            const ty = sys.y + Math.sin(angle) * r;
            ctx.beginPath();
            ctx.moveTo(tx - Math.cos(angle) * 4, ty - Math.sin(angle) * 4);
            ctx.lineTo(tx + Math.cos(angle) * 4, ty + Math.sin(angle) * 4);
            ctx.stroke();
          });
        }

        // Current Location Indicator (Player Ship Icon Beacon)
        if (isCurrent) {
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sys.x, sys.y, radius + 6, 0, Math.PI * 2);
          ctx.stroke();

          // Beacon text
          ctx.fillStyle = '#10B981';
          ctx.font = '600 10px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText('▼ ФЛАГМАН', sys.x, sys.y - radius - 12);
        }

        // Active Faction War Front Indicator
        const sysWar = factionWars.find(w => w.active && w.targetSystemIds.includes(sys.id));
        if (sysWar) {
          ctx.save();
          ctx.strokeStyle = '#F43F5E';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.arc(sys.x, sys.y, radius + 15 + Math.sin(t * 3.5 + sys.x) * 2.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#FDA4AF';
          ctx.font = 'bold 8.5px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('⚔ ФРОНТ ВОЙНЫ', sys.x, sys.y - radius - (isCurrent ? 24 : 12));
          ctx.restore();
        }

        // Spatial Anomaly Host Beacon Indicator
        if (showAnomalies) {
          const sysAnomaly = anomalies.find(a => a.systemId === sys.id);
          if (sysAnomaly) {
            ctx.save();
            ctx.strokeStyle = sysAnomaly.visualColor;
            ctx.lineWidth = 1.8;
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.arc(sys.x, sys.y, radius + 15 + Math.sin(t * 3.2 + sys.x) * 2.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Anomaly polarity indicator tag above star
            const badgeLabel = sysAnomaly.polarity === 'bonus' 
              ? '🌀 БОНУС' 
              : sysAnomaly.polarity === 'penalty' 
                ? '⚠ ШТРАФ' 
                : '🔮 АНОМАЛИЯ';
            ctx.fillStyle = sysAnomaly.visualColor;
            ctx.font = 'bold 8.5px JetBrains Mono';
            ctx.textAlign = 'center';
            const offsetY = (isCurrent ? 24 : 12) + (sysWar ? 12 : 0);
            ctx.fillText(badgeLabel, sys.x, sys.y - radius - offsetY);
            ctx.restore();
          }
        }

        // System Label
        ctx.fillStyle = isSelected ? '#FFFFFF' : '#CBD5E1';
        ctx.font = isSelected ? '600 12px Chakra Petch' : '500 11px Chakra Petch';
        ctx.textAlign = 'center';
        ctx.fillText(sys.name, sys.x, sys.y + radius + 16);

        // Hazard badge text
        if (sys.hazardLevel >= 3) {
          ctx.fillStyle = sys.hazardLevel >= 4 ? '#F43F5E' : '#F59E0B';
          ctx.font = '500 9px JetBrains Mono';
          ctx.fillText(`УГРОЗА ${sys.hazardLevel}`, sys.x, sys.y + radius + 27);
        }

        ctx.restore();
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [systems, currentSystemId, selectedSystemId, filterSector, zoom, pan, backgroundStars, currentSystem, selectedSystem, shipStats, canJump, showTradeRoutes, displayedTradeRoutes, selectedRouteId, hoveredRouteId, showAnomalies, anomalies]);

  // Click on Canvas to select Star or Trade Route
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouse coordinates back to galaxy space
    const centerOffsetX = canvas.width / 2 + pan.x;
    const centerOffsetY = canvas.height / 2 + pan.y;
    const galX = (mouseX - centerOffsetX) / zoom + 500;
    const galY = (mouseY - centerOffsetY) / zoom + 350;

    let closestSystem: StarSystem | null = null;
    let minDist = 35 / zoom; // clickable threshold

    systems.forEach((sys) => {
      const dist = Math.hypot(sys.x - galX, sys.y - galY);
      if (dist < minDist) {
        minDist = dist;
        closestSystem = sys;
      }
    });

    if (closestSystem) {
      sounds.playScanPing();
      setSelectedSystemId((closestSystem as StarSystem).id);
      setSelectedRouteId(null);
      return;
    }

    // Check if clicked near a trade route badge or curve
    if (showTradeRoutes && displayedTradeRoutes.length > 0) {
      let closestRoute: TradeRoute | null = null;
      let minRouteDist = 45 / zoom;

      for (const r of displayedTradeRoutes) {
        const s1 = r.fromSystem;
        const s2 = r.toSystem;
        const dx = s2.x - s1.x;
        const dy = s2.y - s1.y;
        const dist = Math.hypot(dx, dy);
        if (dist === 0) continue;
        const normalX = -dy / dist;
        const normalY = dx / dist;
        const ctrlX = (s1.x + s2.x) / 2 + normalX * 26;
        const ctrlY = (s1.y + s2.y) / 2 + normalY * 26;
        const midPointX = 0.25 * s1.x + 0.5 * ctrlX + 0.25 * s2.x;
        const midPointY = 0.25 * s1.y + 0.5 * ctrlY + 0.25 * s2.y;

        const d = Math.hypot(galX - midPointX, galY - midPointY);
        if (d < minRouteDist) {
          minRouteDist = d;
          closestRoute = r;
        }
      }

      if (closestRoute) {
        sounds.playScanPing();
        setSelectedRouteId(closestRoute.id);
        setSelectedSystemId(closestRoute.toSystem.id);
        setSidebarTab('trade');
        if (window.innerWidth < 768) {
          setIsMobilePanelOpen(true);
        }
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }

    // Detect hover on trade route badge
    if (showTradeRoutes && displayedTradeRoutes.length > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const centerOffsetX = canvas.width / 2 + pan.x;
      const centerOffsetY = canvas.height / 2 + pan.y;
      const galX = (mouseX - centerOffsetX) / zoom + 500;
      const galY = (mouseY - centerOffsetY) / zoom + 350;

      let foundRouteId: string | null = null;
      for (const r of displayedTradeRoutes) {
        const s1 = r.fromSystem;
        const s2 = r.toSystem;
        const dx = s2.x - s1.x;
        const dy = s2.y - s1.y;
        const dist = Math.hypot(dx, dy);
        if (dist === 0) continue;
        const normalX = -dy / dist;
        const normalY = dx / dist;
        const ctrlX = (s1.x + s2.x) / 2 + normalX * 26;
        const ctrlY = (s1.y + s2.y) / 2 + normalY * 26;
        const midPointX = 0.25 * s1.x + 0.5 * ctrlX + 0.25 * s2.x;
        const midPointY = 0.25 * s1.y + 0.5 * ctrlY + 0.25 * s2.y;

        if (Math.hypot(galX - midPointX, galY - midPointY) < 30 / zoom) {
          foundRouteId = r.id;
          break;
        }
      }

      if (foundRouteId !== hoveredRouteId) {
        setHoveredRouteId(foundRouteId);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setTouchMoved(false);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    setTouchMoved(true);
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    // If user tapped without dragging, detect clicked star system!
    if (!touchMoved && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      const centerOffsetX = canvas.width / 2 + pan.x;
      const centerOffsetY = canvas.height / 2 + pan.y;
      const galX = (touchX - centerOffsetX) / zoom + 500;
      const galY = (touchY - centerOffsetY) / zoom + 350;

      let closestSystem: StarSystem | null = null;
      let minDist = 48 / zoom; // generous touch hit area for mobile thumbs

      systems.forEach((sys) => {
        const dist = Math.hypot(sys.x - galX, sys.y - galY);
        if (dist < minDist) {
          minDist = dist;
          closestSystem = sys;
        }
      });

      if (closestSystem) {
        sounds.playScanPing();
        setSelectedSystemId((closestSystem as StarSystem).id);
      }
    }
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(2.2, Math.max(0.6, prev + delta)));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-[calc(100vh-98px)] bg-transparent flex overflow-hidden">
      {/* Top Left Toolbars: Sector Filters & Trade Route Visualization */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto z-20 flex flex-col gap-2 max-w-full pointer-events-auto">
        {/* Sector filter tabs on top-left: horizontally scrollable on phone */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-lg backdrop-blur-md overflow-x-auto scrollbar-none shadow-md">
          <span className="text-xs font-mono text-slate-400 px-2 shrink-0">СЕКТОР:</span>
          <button
            onClick={() => setFilterSector('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors shrink-0 ${
              filterSector === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilterSector('alpha')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors shrink-0 ${
              filterSector === 'alpha' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Альфа (Ядро)
          </button>
          <button
            onClick={() => setFilterSector('beta')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors shrink-0 ${
              filterSector === 'beta' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Бета (Туманность)
          </button>
          <button
            onClick={() => setFilterSector('gamma')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors shrink-0 ${
              filterSector === 'gamma' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Гамма (Врата)
          </button>
          <button
            onClick={() => setFilterSector('soul_society')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors shrink-0 flex items-center gap-1.5 ${
              filterSector === 'soul_society' 
                ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50 shadow-sm shadow-purple-950 font-bold' 
                : 'text-purple-400/80 hover:text-purple-200 hover:bg-purple-950/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Сообщество Душ (Bleach)</span>
          </button>
        </div>

        {/* Trade Routes Visualization Toolbar */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/95 border border-cyan-900/60 rounded-lg backdrop-blur-md overflow-x-auto scrollbar-none shadow-xl">
          <button
            onClick={() => {
              sounds.playScanPing();
              setShowTradeRoutes(prev => !prev);
            }}
            className={`px-2.5 py-1 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              showTradeRoutes
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
            title="Включить или скрыть визуализацию торговых маршрутов"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Торговые Маршруты: {showTradeRoutes ? 'ВКЛ' : 'ВЫКЛ'}</span>
            <span className="text-[10px] bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800 text-emerald-300 font-bold">
              {displayedTradeRoutes.length}
            </span>
          </button>

          {showTradeRoutes && (
            <>
              <div className="h-4 w-px bg-slate-800 shrink-0" />
              <button
                onClick={() => {
                  sounds.playScanPing();
                  setTradeFilter('all');
                }}
                className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors shrink-0 cursor-pointer ${
                  tradeFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Все ({allTradeRoutes.length})
              </button>
              <button
                onClick={() => {
                  sounds.playScanPing();
                  setTradeFilter('from_current');
                }}
                className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors shrink-0 cursor-pointer ${
                  tradeFilter === 'from_current' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Из {currentSystem.name.split(' ')[0]}
              </button>
              <button
                onClick={() => {
                  sounds.playScanPing();
                  setTradeFilter('top_profitable');
                }}
                className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors shrink-0 cursor-pointer ${
                  tradeFilter === 'top_profitable' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Сверхприбыль (+50%+)
              </button>
              <button
                onClick={() => {
                  sounds.playScanPing();
                  setTradeFilter('contraband');
                }}
                className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors shrink-0 cursor-pointer ${
                  tradeFilter === 'contraband' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Контрабанда
              </button>
            </>
          )}
        </div>

        {/* Spatial Anomalies Control Toolbar */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/95 border border-purple-900/60 rounded-lg backdrop-blur-md overflow-x-auto scrollbar-none shadow-xl">
          <button
            onClick={() => {
              sounds.playScanPing();
              setShowAnomalies(prev => !prev);
            }}
            className={`px-2.5 py-1 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              showAnomalies
                ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50 shadow-sm shadow-purple-950'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
            title="Включить или скрыть пространственные аномалии на карте"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Аномалии: {showAnomalies ? 'ВКЛ' : 'ВЫКЛ'}</span>
            <span className="text-[10px] bg-purple-950 px-1.5 py-0.2 rounded border border-purple-800 text-purple-300 font-bold">
              {anomalies.length}
            </span>
          </button>

          {onScanAnomalies && (
            <button
              onClick={() => {
                sounds.playScanPing();
                onScanAnomalies();
              }}
              className="px-2.5 py-1 text-xs font-mono rounded bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-700/80 flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors shadow-sm shadow-cyan-950"
              title="Произвести сканирование глубокого космоса и сгенерировать новые аномалии"
            >
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>Глубокое сканирование</span>
            </button>
          )}

          {anomalies.length > 0 && (
            <button
              onClick={() => {
                sounds.playScanPing();
                setShowAnomalyListModal(true);
              }}
              className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
              title="Открыть сводный реестр всех активных аномалий"
            >
              <Compass className="w-3 h-3 text-amber-400" />
              <span>Реестр ({anomalies.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Trade Routes Legend */}
      {showTradeRoutes && (
        <div className="absolute top-3 right-3 md:right-[405px] z-20 hidden xl:flex items-center gap-3 px-3 py-1.5 bg-slate-950/85 border border-slate-800 rounded-xl text-[10px] font-mono text-slate-300 backdrop-blur-md shadow-xl pointer-events-auto">
          <span className="text-slate-400 font-bold uppercase tracking-wider">Маршруты:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
            <span>Сверхприбыль &gt;70%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#38BDF8]" />
            <span>Высокая &gt;35%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_#C084FC]" />
            <span>Контрабанда</span>
          </div>
        </div>
      )}

      {/* Zoom and Map View Controls */}
      <div className="absolute bottom-28 md:bottom-6 left-3 md:left-6 z-20 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1 backdrop-blur-md">
        <button
          onClick={() => handleZoom(0.2)}
          title="Приблизить"
          className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-0.2)}
          title="Отдалить"
          className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          title="Сбросить масштаб"
          className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Interactive Canvas with Touch Controls */}
      <div 
        className="flex-1 relative cursor-crosshair touch-none"
        onWheel={(e) => {
          e.preventDefault();
          handleZoom(e.deltaY < 0 ? 0.15 : -0.15);
        }}
      >
        <canvas
          ref={canvasRef}
          width={1280}
          height={800}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={(e) => {
            e.preventDefault();
            handleZoom(e.deltaY < 0 ? 0.15 : -0.15);
          }}
          className="w-full h-full block"
        />
      </div>

      {/* Mobile Floating Quick Action Bar (Bottom, above bottom navigation) */}
      <div className="md:hidden fixed bottom-14 left-2 right-2 z-30 bg-[#080C16]/95 border border-cyan-500/40 rounded-xl p-2.5 backdrop-blur-lg flex items-center justify-between gap-2 shadow-2xl">
        <div 
          onClick={() => setIsMobilePanelOpen(true)}
          className="flex-1 min-w-0 cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedSystem.starColor }} />
            <span className="font-bold text-sm text-slate-100 truncate">{selectedSystem.name}</span>
            {selectedSystem.id === currentSystem.id && (
              <span className="text-[10px] text-emerald-400 font-mono">ЗДЕСЬ</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
            <span>{distanceToSelected} св. л.</span>
            <span>•</span>
            <span className="text-cyan-300">{fuelCost} He-3</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsMobilePanelOpen(true)}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300 hover:bg-slate-700"
            title="Инфо"
          >
            <Info className="w-4 h-4" />
          </button>

          {selectedSystem.id === currentSystem.id ? (
            <button
              onClick={() => onEnterSystem(selectedSystem)}
              className="py-2 px-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-md shadow-cyan-950"
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>Войти</span>
            </button>
          ) : (
            <button
              disabled={!canJump}
              onClick={() => onWarpJump(selectedSystem)}
              className={`py-2 px-3 font-bold rounded-lg text-xs flex items-center gap-1 shadow-md ${
                canJump
                  ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-950 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Прыжок</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Slide-Up Full Telemetry Drawer */}
      {isMobilePanelOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm">
          <div 
            onClick={() => setIsMobilePanelOpen(false)}
            className="flex-1"
          />
          <div className="w-full max-h-[82vh] bg-[#080C16] border-t border-cyan-500/40 rounded-t-2xl flex flex-col p-4 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-cyan-400 tracking-wider">
                  {selectedSystem.sectorName.toUpperCase()}
                </span>
                <h2 className="text-xl font-bold font-heading text-slate-100">
                  {selectedSystem.name}
                </h2>
              </div>
              <button
                onClick={() => setIsMobilePanelOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Deep Space Optical Scent Preview */}
            <div className="mt-3 rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950 relative">
              <div className="aspect-[16/9] w-full max-h-36 overflow-hidden relative">
                <img
                  src="/src/assets/images/galaxy_deep_nebula_1790243957744.jpg"
                  alt="Оптический скан сектора туманности"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080C16] via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-[10px] font-mono text-cyan-300">
                  ОПТИЧЕСКИЙ СКАН СЕКТОРА
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              {selectedSystem.loreSnippet}
            </p>

            {/* Active Faction War Front Indicator Mobile */}
            {selectedSystemWar && (
              <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-rose-950/90 via-slate-900 to-slate-900 border border-rose-500/70 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    <span>ФРОНТ ГАЛАКТИЧЕСКОЙ ВОЙНЫ</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700">
                    ТОТАЛЬНАЯ ВОЙНА
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-100 font-heading">
                  {selectedSystemWar.name}
                </div>
                <button
                  onClick={() => {
                    setIsMobilePanelOpen(false);
                    onOpenWars?.();
                  }}
                  className="mt-1 w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950"
                >
                  <Bomb className="w-3.5 h-3.5" />
                  <span>Штаб Войн: Нанести ядерный удар / Поддержать</span>
                </button>
              </div>
            )}

            {/* Spatial Anomaly Indicator Mobile */}
            {selectedSystemAnomaly && (
              <div 
                className="mt-3 p-3 rounded-xl border flex flex-col gap-2 relative overflow-hidden"
                style={{
                  backgroundColor: `${selectedSystemAnomaly.visualColor}15`,
                  borderColor: `${selectedSystemAnomaly.visualColor}70`,
                  boxShadow: `0 0 15px ${selectedSystemAnomaly.visualGlow}`
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: selectedSystemAnomaly.visualColor }}>
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>ПРОСТРАНСТВЕННАЯ АНОМАЛИЯ</span>
                  </span>
                  {(() => {
                    const badge = getAnomalyPolarityBadge(selectedSystemAnomaly.polarity);
                    return (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100 font-heading">
                    {selectedSystemAnomaly.name}
                  </div>
                  <div className="text-[11px] font-medium text-slate-300 mt-0.5">
                    «{selectedSystemAnomaly.title}»
                  </div>
                </div>
                <div className="p-2 rounded bg-black/50 border border-slate-800 text-[11px] text-slate-200 leading-snug">
                  <span className="text-cyan-400 font-bold">Эффект: </span>
                  {selectedSystemAnomaly.effectDescription}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>СТАБИЛЬНОСТЬ:</span>
                  <span className="text-amber-300 font-bold">{selectedSystemAnomaly.durationJumps} варп-перехода</span>
                </div>
              </div>
            )}

            {/* Active Market Events Indicator Mobile */}
            {selectedSystemMarketEvents.length > 0 && (
              <div className="mt-3 space-y-2">
                {selectedSystemMarketEvents.map((evt) => (
                  <div 
                    key={evt.id}
                    className="p-3 rounded-xl border flex flex-col gap-2 relative overflow-hidden bg-slate-900/90"
                    style={{
                      borderColor: `${evt.color}80`,
                      boxShadow: `0 0 12px ${evt.color}25`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5"
                        style={{ color: evt.color }}
                      >
                        <Flame className="w-3.5 h-3.5 animate-pulse" />
                        <span>РЫНОЧНОЕ СОБЫТИЕ</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>{evt.remainingCycles} ц.</span>
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100 font-heading">
                        {evt.title}
                      </div>
                      <div className="text-[11px] text-slate-300 font-sans mt-0.5">
                        {evt.description}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                      {evt.modifiers.map((mod, i) => (
                        <span 
                          key={i}
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                          style={{
                            backgroundColor: mod.multiplier > 1 ? '#10B98120' : '#F43F5E20',
                            borderColor: mod.multiplier > 1 ? '#10B98160' : '#F43F5E60',
                            color: mod.multiplier > 1 ? '#34D399' : '#FB7185'
                          }}
                        >
                          {mod.label}
                        </span>
                      ))}
                    </div>
                    {evt.flavorTip && (
                      <div className="text-[10px] font-mono text-cyan-300 italic pt-1 border-t border-slate-800/80">
                        Совет: {evt.flavorTip}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 mt-3 font-mono text-xs">
              <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                <div className="text-slate-400 text-[10px]">ДИСТАНЦИЯ</div>
                <div className="text-sm font-semibold text-slate-100">{distanceToSelected} св. л.</div>
              </div>
              <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                <div className="text-slate-400 text-[10px]">РАСХОД ТОПЛИВА</div>
                <div className={`text-sm font-semibold ${hasSpeedBoost ? 'text-emerald-300 font-bold' : resources.fuel >= fuelCost ? 'text-sky-400' : 'text-rose-400'}`}>
                  {hasSpeedBoost ? '0 He-3 (ВАРП x2)' : `${fuelCost} He-3`}
                </div>
              </div>
              <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                <div className="text-slate-400 text-[10px]">ОПАСНОСТЬ</div>
                <div className="text-sm font-semibold text-amber-400">КЛАСС {selectedSystem.hazardLevel}</div>
              </div>
              <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                <div className="text-slate-400 text-[10px]">ОБЪЕКТОВ</div>
                <div className="text-sm font-semibold text-purple-400">{selectedSystem.bodies.length}</div>
              </div>
            </div>

            {/* Bodies list */}
            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 uppercase mb-2">Обнаруженные планеты:</div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {selectedSystem.bodies.map(b => (
                  <div key={b.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                      <span className="text-slate-200">{b.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{b.typeName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              {selectedSystem.id === currentSystem.id ? (
                <button
                  onClick={() => {
                    setIsMobilePanelOpen(false);
                    onEnterSystem(selectedSystem);
                  }}
                  className="w-full py-3 bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-950"
                >
                  <Orbit className="w-4 h-4" />
                  <span>Войти на Орбиту Системы</span>
                </button>
              ) : (
                <div className="space-y-2">
                  {pirateHeat > 0 && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-950/80 border border-rose-600/70 text-rose-300 text-xs font-mono animate-pulse">
                      <Skull className="w-4 h-4 text-rose-400 shrink-0" />
                      <div>
                        <div className="font-bold text-[11px]">РИСК ВАРП-ПЕРЕХВАТА: {pirateHeat}%</div>
                        <div className="text-[10px] text-slate-300 font-sans">
                          Пираты отслеживают контрабанду на борту!
                        </div>
                      </div>
                    </div>
                  )}
                  <button
                    disabled={!canJump}
                    onClick={() => {
                      setIsMobilePanelOpen(false);
                      onWarpJump(selectedSystem);
                    }}
                    className={`w-full py-3 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg ${
                      canJump
                        ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-950 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Совершить Варп-Прыжок ({hasSpeedBoost ? '0 He-3 • Удвоение скорости!' : `${fuelCost} He-3`})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Right Telemetry Inspector Panel (Desktop md+) */}
      <div className="hidden md:flex w-96 border-l border-slate-800 bg-[#080C16]/95 backdrop-blur-lg flex-col p-5 overflow-y-auto z-20">
        <div className="pb-3 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400 tracking-wider">
              {selectedSystem.sectorName.toUpperCase()}
            </span>
            {selectedSystem.id === currentSystem.id && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> ВЫ ЗДЕСЬ
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-100 mt-1">
            {selectedSystem.name}
          </h2>
          <div className="text-xs text-slate-400 font-mono mt-0.5">
            Класс: <span className="text-slate-200">{selectedSystem.starClassName}</span>
          </div>
        </div>

        {/* Deep Space Sector Optical Sensor Preview */}
        <div className="mt-4 rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950 relative group shadow-md shadow-cyan-950/20">
          <div className="aspect-[16/9] w-full max-h-36 overflow-hidden relative">
            <img
              src="/src/assets/images/galaxy_deep_nebula_1790243957744.jpg"
              alt="Оптический скан сектора туманности"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080C16] via-transparent to-transparent pointer-events-none" />
            
            {/* Sector scan crosshair tag */}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700/80 text-[10px] font-mono text-cyan-300 backdrop-blur-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>ОПТИЧЕСКИЙ СКАН СЕКТОРА</span>
            </div>

            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono text-slate-400">
              [{selectedSystem.x}, {selectedSystem.y}]
            </div>
          </div>
        </div>

        {/* System Lore & Summary */}
        <p className="text-xs text-slate-300 leading-relaxed mt-3">
          {selectedSystem.loreSnippet}
        </p>

        {/* Active Faction War Front Indicator Desktop */}
        {selectedSystemWar && (
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-rose-950/90 via-slate-900 to-slate-900 border border-rose-500/70 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>ФРОНТ ГАЛАКТИЧЕСКОЙ ВОЙНЫ</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700">
                ТОТАЛЬНАЯ ВОЙНА
              </span>
            </div>
            <div className="text-xs font-bold text-slate-100 font-heading">
              {selectedSystemWar.name}
            </div>
            <div className="text-[11px] text-slate-300 leading-snug">
              {selectedSystemWar.description}
            </div>
            <button
              onClick={() => onOpenWars?.()}
              className="mt-1 w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950 transition-all cursor-pointer"
            >
              <Bomb className="w-3.5 h-3.5" />
              <span>Штаб Войн: Нанести ядерный удар / Поддержать</span>
            </button>
          </div>
        )}

        {/* Spatial Anomaly Indicator Desktop */}
        {selectedSystemAnomaly && (
          <div 
            className="mt-3 p-3 rounded-xl border flex flex-col gap-2 relative overflow-hidden"
            style={{
              backgroundColor: `${selectedSystemAnomaly.visualColor}15`,
              borderColor: `${selectedSystemAnomaly.visualColor}70`,
              boxShadow: `0 0 15px ${selectedSystemAnomaly.visualGlow}`
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: selectedSystemAnomaly.visualColor }}>
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>ПРОСТРАНСТВЕННАЯ АНОМАЛИЯ</span>
              </span>
              {(() => {
                const badge = getAnomalyPolarityBadge(selectedSystemAnomaly.polarity);
                return (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
                    {badge.label}
                  </span>
                );
              })()}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 font-heading">
                {selectedSystemAnomaly.name}
              </div>
              <div className="text-[11px] font-medium text-slate-300 mt-0.5">
                «{selectedSystemAnomaly.title}»
              </div>
            </div>
            <div className="p-2.5 rounded bg-black/50 border border-slate-800 text-[11px] text-slate-200 leading-snug">
              <span className="text-cyan-400 font-bold">Эффект: </span>
              {selectedSystemAnomaly.effectDescription}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
              <span>СТАБИЛЬНОСТЬ:</span>
              <span className="text-amber-300 font-bold">{selectedSystemAnomaly.durationJumps} варп-перехода</span>
            </div>
          </div>
        )}

        {/* Active Market Events Indicator Desktop */}
        {selectedSystemMarketEvents.length > 0 && (
          <div className="mt-3 space-y-2">
            {selectedSystemMarketEvents.map((evt) => (
              <div 
                key={evt.id}
                className="p-3 rounded-xl border flex flex-col gap-2 relative overflow-hidden bg-slate-900/90"
                style={{
                  borderColor: `${evt.color}80`,
                  boxShadow: `0 0 12px ${evt.color}25`
                }}
              >
                <div className="flex items-center justify-between">
                  <span 
                    className="text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5"
                    style={{ color: evt.color }}
                  >
                    <Flame className="w-3.5 h-3.5 animate-pulse" />
                    <span>РЫНОЧНОЕ СОБЫТИЕ</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{evt.remainingCycles} ц.</span>
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100 font-heading">
                    {evt.title}
                  </div>
                  <div className="text-[11px] text-slate-300 font-sans mt-0.5">
                    {evt.description}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1 mt-0.5">
                  {evt.modifiers.map((mod, i) => (
                    <span 
                      key={i}
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor: mod.multiplier > 1 ? '#10B98120' : '#F43F5E20',
                        borderColor: mod.multiplier > 1 ? '#10B98160' : '#F43F5E60',
                        color: mod.multiplier > 1 ? '#34D399' : '#FB7185'
                      }}
                    >
                      {mod.label}
                    </span>
                  ))}
                </div>
                {evt.flavorTip && (
                  <div className="text-[10px] font-mono text-cyan-300 italic pt-1 border-t border-slate-800/80">
                    Совет: {evt.flavorTip}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 font-mono text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
            <div className="text-slate-400 text-[10px]">ДИСТАНЦИЯ</div>
            <div className="text-base font-semibold text-slate-100 tabular-nums mt-0.5">
              {distanceToSelected} <span className="text-xs font-normal text-slate-400">св. л.</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
            <div className="text-slate-400 text-[10px]">РАСХОД ТОПЛИВА</div>
            <div className={`text-base font-semibold tabular-nums mt-0.5 ${hasSpeedBoost ? 'text-emerald-300 font-bold' : resources.fuel >= fuelCost ? 'text-sky-400' : 'text-rose-400'}`}>
              {hasSpeedBoost ? '0' : fuelCost} <span className="text-xs font-normal text-slate-400">{hasSpeedBoost ? 'He-3 (ВАРП x2)' : 'He-3'}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
            <div className="text-slate-400 text-[10px]">УРОВЕНЬ ОПАСНОСТИ</div>
            <div className={`text-base font-semibold tabular-nums mt-0.5 ${selectedSystem.hazardLevel >= 4 ? 'text-rose-400' : selectedSystem.hazardLevel >= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
              КЛАСС {selectedSystem.hazardLevel}
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
            <div className="text-slate-400 text-[10px]">НЕБЕСНЫХ ТЕЛ</div>
            <div className="text-base font-semibold text-purple-400 tabular-nums mt-0.5">
              {selectedSystem.bodies.length} ОБЪЕКТА
            </div>
          </div>
        </div>

        {/* Celestial Bodies Mini-List */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Обнаруженные объекты:
          </span>
          <div className="space-y-1.5 mt-2">
            {selectedSystem.bodies.map((body) => (
              <div 
                key={body.id}
                className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-slate-900/40 border border-slate-800/60"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: body.color }} 
                  />
                  <span className="font-medium text-slate-200">{body.name}</span>
                </div>
                <span className="text-slate-400 text-[10px] font-mono">
                  {body.typeName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Warp Jump & Enter Actions */}
        <div className="mt-auto pt-6 flex flex-col gap-2">
          {selectedSystem.id === currentSystem.id ? (
            <button
              onClick={() => onEnterSystem(selectedSystem)}
              className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40"
            >
              <Orbit className="w-4 h-4" />
              Войти на Орбиту Системы
            </button>
          ) : (
            <>
              {pirateHeat > 0 && (
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-rose-950/80 border border-rose-600/70 text-rose-300 text-xs font-mono mb-1 animate-pulse">
                  <Skull className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <div className="font-bold text-[11px]">РИСК ВАРП-ПЕРЕХВАТА: {pirateHeat}%</div>
                    <div className="text-[10px] text-slate-300 font-sans">
                      Пираты Синдиката отслеживают контрабанду на борту!
                    </div>
                  </div>
                </div>
              )}

              <button
                disabled={!canJump}
                onClick={() => onWarpJump(selectedSystem)}
                className={`w-full py-2.5 px-4 font-semibold rounded text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                  canJump
                    ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-950/50 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <Zap className="w-4 h-4" />
                Совершить Варп-Прыжок ({hasSpeedBoost ? '0 He-3 • Удвоение скорости!' : `${fuelCost} He-3`})
              </button>

              {distanceToSelected > shipStats.warpRange && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-mono mt-1">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Превышен радиус варп-двигателя ({shipStats.warpRange} св. л.)</span>
                </div>
              )}

              {!hasSpeedBoost && resources.fuel < fuelCost && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-mono mt-1">
                  <Fuel className="w-3.5 h-3.5 shrink-0" />
                  <span>Недостаточно Гелия-3 (требуется {fuelCost})</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Active Anomalies Registry Modal */}
      {showAnomalyListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl border border-purple-500/50 bg-[#080C16] shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[88vh]">
            <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500" />
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-600/60 text-purple-300">
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-heading text-slate-100">
                    Реестр Пространственных Аномалий
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Обнаружено {anomalies.length} активных разломов в секторах галактики
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAnomalyListModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
              {anomalies.map((anom) => {
                const badge = getAnomalyPolarityBadge(anom.polarity);
                const isSelected = anom.systemId === selectedSystemId;
                return (
                  <div
                    key={anom.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-purple-950/50 border-purple-500 shadow-md shadow-purple-950'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0 shadow-[0_0_8px]"
                          style={{ backgroundColor: anom.visualColor, boxShadow: `0 0 8px ${anom.visualColor}` }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-100 font-heading">
                              {anom.name}
                            </span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
                              {badge.label}
                            </span>
                          </div>
                          <span className="text-xs text-slate-300 font-medium">
                            «{anom.title}»
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => {
                            sounds.playScanPing();
                            setSelectedSystemId(anom.systemId);
                            setShowAnomalyListModal(false);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Навести: {anom.systemName}</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-slate-300 bg-black/40 p-2 rounded border border-slate-800/80 leading-relaxed">
                      <span className="text-cyan-400 font-semibold">Эффект: </span>
                      {anom.effectDescription}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Сектор: {anom.sectorName}</span>
                      <span className="text-amber-300 font-bold">Стабильность: {anom.durationJumps} варп-прыжков</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                При прохождении или входе в сектор аномалия активирует эффект автоматически
              </span>
              <button
                onClick={() => setShowAnomalyListModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
