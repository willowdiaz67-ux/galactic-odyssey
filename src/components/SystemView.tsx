import React, { useState, useEffect, useRef } from 'react';
import { StarSystem, CelestialBody, Resources, ShipStats, SpatialAnomaly } from '../types/game';
import { sounds } from '../services/soundEffects';
import { 
  Scan, 
  Pickaxe, 
  Building2, 
  Store, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  Crown,
  Landmark
} from 'lucide-react';

interface SystemViewProps {
  system: StarSystem;
  resources: Resources;
  shipStats: ShipStats;
  onScanBody: (body: CelestialBody) => void;
  onMineBody: (body: CelestialBody) => void;
  onFoundColony: (body: CelestialBody) => void;
  onDockStation: () => void;
  onBackToMap: () => void;
  onManageColony: (body: CelestialBody) => void;
  onOpenKingsChamber?: () => void;
  onOpenKingdoms?: () => void;
  activeAnomaly?: SpatialAnomaly | null;
}

export const SystemView: React.FC<SystemViewProps> = ({
  system,
  resources,
  shipStats,
  onScanBody,
  onMineBody,
  onFoundColony,
  onDockStation,
  onBackToMap,
  onManageColony,
  onOpenKingsChamber,
  onOpenKingdoms,
  activeAnomaly
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedBodyId, setSelectedBodyId] = useState<string>(system.bodies[0]?.id || '');
  const [scanning, setScanning] = useState<boolean>(false);

  const selectedBody = system.bodies.find(b => b.id === selectedBodyId) || system.bodies[0];

  // Orbital Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Deep Space subtle translucent vignette over live parallax starfield
      const sysGrad = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, canvas.width * 0.7);
      sysGrad.addColorStop(0, 'rgba(6, 8, 18, 0.25)');
      sysGrad.addColorStop(1, 'rgba(4, 6, 14, 0.55)');
      ctx.fillStyle = sysGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Central Star
      const starGlow = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 90);
      starGlow.addColorStop(0, system.starColor);
      starGlow.addColorStop(0.3, `${system.starColor}66`);
      starGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = starGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 90, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = system.starColor;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 32, 0, Math.PI * 2);
      ctx.fill();

      // Render Orbits & Bodies
      system.bodies.forEach((body) => {
        // Orbit ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, body.orbitRadius * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Calculate current position along orbit
        const curAngle = body.angle + time * body.orbitSpeed * 8;
        const bx = centerX + Math.cos(curAngle) * (body.orbitRadius * 1.5);
        const by = centerY + Math.sin(curAngle) * (body.orbitRadius * 1.5);

        // Selection ring
        if (body.id === selectedBodyId) {
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(bx, by, body.size + 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Body glow
        const bodyGlow = ctx.createRadialGradient(bx, by, 2, bx, by, body.size * 2);
        bodyGlow.addColorStop(0, body.color);
        bodyGlow.addColorStop(0.6, `${body.color}44`);
        bodyGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = bodyGlow;
        ctx.beginPath();
        ctx.arc(bx, by, body.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Body sphere
        ctx.fillStyle = body.color;
        ctx.beginPath();
        ctx.arc(bx, by, body.size, 0, Math.PI * 2);
        ctx.fill();

        // Rings for Gas Giants
        if (body.type === 'gas_giant') {
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(bx, by, body.size * 1.8, body.size * 0.5, 0.4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Asteroid belt scatter
        if (body.type === 'asteroid_belt') {
          for (let a = 0; a < 8; a++) {
            const rockX = bx + (Math.sin(a * 4) * 16);
            const rockY = by + (Math.cos(a * 4) * 16);
            ctx.fillStyle = '#94A3B8';
            ctx.beginPath();
            ctx.arc(rockX, rockY, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Label
        ctx.fillStyle = body.id === selectedBodyId ? '#FFFFFF' : '#94A3B8';
        ctx.font = '500 11px Chakra Petch';
        ctx.textAlign = 'center';
        ctx.fillText(body.name, bx, by + body.size + 14);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [system, selectedBodyId]);

  const handleTriggerScan = () => {
    if (!selectedBody) return;
    setScanning(true);
    sounds.playScanPing();
    setTimeout(() => {
      setScanning(false);
      onScanBody(selectedBody);
    }, 800);
  };

  const handleTriggerMine = () => {
    if (!selectedBody) return;
    sounds.playLaser();
    onMineBody(selectedBody);
  };

  return (
    <div className="relative w-full h-full bg-transparent flex flex-col md:flex-row overflow-hidden">
      {/* Top Left Navigation Header */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <button
          onClick={onBackToMap}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 text-xs font-medium backdrop-blur-md transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>К Карте Галактики</span>
        </button>
        <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded text-xs font-mono text-slate-300 backdrop-blur-md">
          СИСТЕМА: <span className="font-semibold text-cyan-400">{system.name}</span>
        </div>
        {onOpenKingsChamber && (
          <button
            onClick={onOpenKingsChamber}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 rounded border border-amber-600/70 text-xs font-mono font-bold backdrop-blur-md transition-all cursor-pointer shadow-md shadow-amber-950"
            title="Запросить аудиенцию с правителями или NPC"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Аудиенция (Короли & NPC)</span>
          </button>
        )}
        {onOpenKingdoms && (
          <button
            onClick={onOpenKingdoms}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-950/80 hover:bg-purple-900 text-purple-300 rounded border border-purple-600/70 text-xs font-mono font-bold backdrop-blur-md transition-all cursor-pointer shadow-md shadow-purple-950"
            title="Карта держав и казна великих королевств"
          >
            <Landmark className="w-3.5 h-3.5 text-purple-400" />
            <span>Королевства</span>
          </button>
        )}

        {activeAnomaly && (
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-mono backdrop-blur-md shadow-md animate-pulse"
            style={{
              backgroundColor: `${activeAnomaly.visualColor}20`,
              borderColor: `${activeAnomaly.visualColor}80`,
              color: activeAnomaly.visualColor
            }}
            title={activeAnomaly.effectDescription}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-bold">АНОМАЛИЯ: {activeAnomaly.title}</span>
          </div>
        )}
      </div>

      {/* Main Viewport Stage */}
      <div 
        className="flex-1 relative flex items-center justify-center overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          width={900}
          height={750}
          className="w-full h-full block"
        />

        {/* Bottom Body Selector Carousel */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-2 overflow-x-auto pb-1">
          {system.bodies.map((body) => (
            <button
              key={body.id}
              onClick={() => {
                sounds.playScanPing();
                setSelectedBodyId(body.id);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium backdrop-blur-md border transition-all whitespace-nowrap ${
                body.id === selectedBodyId
                  ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50 shadow-md shadow-cyan-950'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <div 
                className="w-2.5 h-2.5 rounded-full shrink-0" 
                style={{ backgroundColor: body.color }} 
              />
              <span>{body.name}</span>
              {body.colony && (
                <span className="text-[10px] text-emerald-400 font-mono">● КОЛОНИЯ</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right Control & Exploration Terminal */}
      <div className="w-full md:w-96 border-l border-slate-800 bg-[#080C16]/95 backdrop-blur-lg flex flex-col p-5 overflow-y-auto z-20">
        {selectedBody ? (
          <>
            <div className="pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 tracking-wider">
                  {selectedBody.typeName.toUpperCase()}
                </span>
                {selectedBody.scanned ? (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> СКАНИРОВАНО
                  </span>
                ) : (
                  <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> НЕИЗВЕСТНО
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold font-heading text-slate-100 mt-1">
                {selectedBody.name}
              </h2>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed mt-4">
              {selectedBody.description}
            </p>

            {/* Scanned Details or Obscured */}
            {selectedBody.scanned ? (
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-3 font-mono text-xs">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                  Данные спектрометрии:
                </div>

                {selectedBody.resourcesYield && (
                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800 space-y-1.5">
                    <div className="text-slate-400 text-[10px]">ЗАЛЕЖИ РЕСУРСОВ:</div>
                    <div className="grid grid-cols-2 gap-2 text-slate-200">
                      {selectedBody.resourcesYield.alloys && (
                        <div>Сплавы: <span className="text-emerald-400">+{selectedBody.resourcesYield.alloys}</span></div>
                      )}
                      {selectedBody.resourcesYield.fuel && (
                        <div>Гелий-3: <span className="text-sky-400">+{selectedBody.resourcesYield.fuel}</span></div>
                      )}
                      {selectedBody.resourcesYield.science && (
                        <div>Наука: <span className="text-purple-400">+{selectedBody.resourcesYield.science}</span></div>
                      )}
                      {selectedBody.resourcesYield.antimatter && (
                        <div>Антиматерия: <span className="text-fuchsia-400">+{selectedBody.resourcesYield.antimatter}</span></div>
                      )}
                      {selectedBody.resourcesYield.credits && (
                        <div>Кредиты: <span className="text-amber-400">+{selectedBody.resourcesYield.credits}</span></div>
                      )}
                      {selectedBody.resourcesYield.food && (
                        <div>Пища: <span className="text-green-400">+{selectedBody.resourcesYield.food}</span></div>
                      )}
                    </div>
                  </div>
                )}

                {selectedBody.colony && (
                  <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded">
                    <div className="text-emerald-400 font-semibold">
                      Колония: {selectedBody.colony.name}
                    </div>
                    <div className="text-slate-300 text-[11px] mt-1">
                      Население: {selectedBody.colony.population} колонистов · Счастье: {selectedBody.colony.happiness}%
                    </div>
                    <button
                      onClick={() => onManageColony(selectedBody)}
                      className="mt-2 text-xs py-1 px-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded border border-emerald-500/40 font-medium transition-colors"
                    >
                      Управление Колонией →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 pt-3 border-t border-slate-800 text-center py-6">
                <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <div className="text-xs text-slate-400 font-mono">
                  Спектрографические датчики не откалиброваны. Требуется глубокое сканирование орбиты.
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-auto pt-6 flex flex-col gap-2">
              {!selectedBody.scanned ? (
                <button
                  disabled={scanning}
                  onClick={handleTriggerScan}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40"
                >
                  <Scan className="w-4 h-4" />
                  {scanning ? 'Сканирование орбиты...' : 'Сканировать Объект (+15 Науки)'}
                </button>
              ) : (
                <>
                  {selectedBody.canMine && !selectedBody.minedOut && (
                    <button
                      onClick={handleTriggerMine}
                      className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
                    >
                      <Pickaxe className="w-4 h-4" />
                      Добыть Ресурсы Буровыми Зондами
                    </button>
                  )}

                  {selectedBody.minedOut && (
                    <div className="text-center py-2 text-xs font-mono text-slate-500 border border-slate-800 rounded">
                      Месторождения исчерпаны
                    </div>
                  )}

                  {selectedBody.canColonize && !selectedBody.colony && (
                    <button
                      disabled={resources.colonists < 10 || resources.alloys < 30}
                      onClick={() => onFoundColony(selectedBody)}
                      className={`w-full py-2.5 px-4 font-semibold rounded text-sm transition-all flex items-center justify-center gap-2 ${
                        resources.colonists >= 10 && resources.alloys >= 30
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/40'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      Основать Колонию (10 Поселенцев, 30 Сплавов)
                    </button>
                  )}

                  {selectedBody.hasStation && (
                    <button
                      onClick={onDockStation}
                      className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40"
                    >
                      <Store className="w-4 h-4" />
                      Стыковаться со Станцией (Торговля и Доки)
                    </button>
                  )}

                  {selectedBody.type === 'alien_ruin' && (
                    <button
                      onClick={handleTriggerMine}
                      className="w-full py-2.5 px-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-semibold rounded text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-950/40"
                    >
                      <Sparkles className="w-4 h-4" />
                      Исследовать Реликвии Предтеч
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
