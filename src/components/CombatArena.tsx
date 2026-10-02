import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  EnemyShip, 
  ShipStats, 
  Resources, 
  CombatLogEntry, 
  TacticalTileItem, 
  TacticalMission, 
  CommanderProgression 
} from '../types/game';
import { CAMPAIGN_LEVELS } from '../data/tacticalCampaignLevels';
import { CampaignLevelSelector } from './CampaignLevelSelector';
import { CombatAftermathLog } from './CombatAftermathLog';
import { sounds } from '../services/soundEffects';
import { 
  Shield, 
  Crosshair, 
  Zap, 
  Flame, 
  RotateCcw, 
  AlertOctagon, 
  Award,
  ArrowRight,
  Footprints,
  Bomb,
  Radio,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Package,
  HeartPulse,
  FlameKindling,
  Compass,
  Swords,
  Info,
  Crown,
  Star,
  Layers,
  ShieldAlert,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';

const GRID_COLS = 10;
const GRID_ROWS = 7;
const COL_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

interface CombatArenaProps {
  enemy: EnemyShip;
  playerShip: ShipStats;
  resources: Resources;
  onCombatVictory: (reward: EnemyShip['reward']) => void;
  onCombatDefeat: () => void;
  onFleeCombat: () => void;
  onDamagePlayerHull: (damage: number) => void;
  onConsumeNuke?: () => void;
  onStartCustomMission?: (mission: TacticalMission) => void;
  commander?: CommanderProgression;
  onAddCommanderXp?: (xp: number) => void;
  onOpenCommanderModal?: () => void;
  completedCampaignLevels?: Record<number, { stars: number }>;
  onRecordLevelCompletion?: (levelNumber: number, stars: number) => void;
  onArrestPirate?: () => void;
  brigHasSpace?: boolean;
}

interface TacticalEnemy extends EnemyShip {
  gridX: number;
  gridY: number;
  shipType: 'interceptor' | 'frigate' | 'dreadnought' | 'drone' | 'turret';
  range: number;
  movementPoints: number;
}

interface ProjectileBeam {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  type: 'laser' | 'torpedo' | 'emp';
}

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

export const CombatArena: React.FC<CombatArenaProps> = ({
  enemy,
  playerShip,
  resources,
  onCombatVictory,
  onCombatDefeat,
  onFleeCombat,
  onDamagePlayerHull,
  onConsumeNuke,
  commander,
  onAddCommanderXp,
  onOpenCommanderModal,
  completedCampaignLevels = {},
  onRecordLevelCompletion,
  onArrestPirate,
  brigHasSpace = true
}) => {
  // Campaign level (1 to 40)
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(() => {
    const foundLvl = CAMPAIGN_LEVELS.find(lvl => lvl.enemies.some(e => e.id === enemy.id));
    return foundLvl?.levelNumber ?? 1;
  });
  const [isLevelSelectorOpen, setIsLevelSelectorOpen] = useState<boolean>(false);

  // Max movement points based on Engine Allocation + Commander engine skill
  const maxMP = useMemo(() => {
    const enginePct = playerShip.powerAllocation.engines;
    let base = 4;
    if (enginePct >= 45) base = 6;
    else if (enginePct >= 35) base = 5;
    if (commander) {
      base += Math.floor(commander.skills.engines / 3);
    }
    return base;
  }, [playerShip.powerAllocation.engines, commander]);

  // Max Action Points (Reactor skill rank 5+ grants 3 AP)
  const maxAP = useMemo(() => {
    if (commander && commander.skills.reactor >= 5) return 3;
    return 2;
  }, [commander]);

  // Player tactical position & resources
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 1, y: 3 });
  const [playerFacing, setPlayerFacing] = useState<'right' | 'left' | 'up' | 'down'>('right');
  const [playerShields, setPlayerShields] = useState<number>(() => {
    return playerShip.shields + (commander ? commander.skills.shields * 15 : 0);
  });
  const [movementPoints, setMovementPoints] = useState<number>(maxMP);
  const [actionPoints, setActionPoints] = useState<number>(maxAP);
  const [turnNumber, setTurnNumber] = useState<number>(1);
  const [isEnemyTurn, setIsEnemyTurn] = useState<boolean>(false);

  // Selected action mode: 'move' (walk) | 'laser' | 'torpedo' | 'emp' | 'mine' | 'repair'
  const [selectedAction, setSelectedAction] = useState<'move' | 'laser' | 'torpedo' | 'emp' | 'mine' | 'repair'>('move');
  const [selectedTargetEnemyId, setSelectedTargetEnemyId] = useState<string | null>(null);

  // Enemies state list
  const [enemies, setEnemies] = useState<TacticalEnemy[]>(() => {
    return [
      {
        ...enemy,
        gridX: enemy.gridX ?? 8,
        gridY: enemy.gridY ?? 3,
        shipType: enemy.shipType ?? (enemy.hull > 100 ? 'dreadnought' : 'frigate'),
        range: enemy.range ?? 5,
        movementPoints: enemy.movementPoints ?? 2
      }
    ];
  });

  // Terrain and Interactive items
  const [tacticalItems, setTacticalItems] = useState<TacticalTileItem[]>([
    { id: 'ast_1', type: 'asteroid', x: 3, y: 1 },
    { id: 'ast_2', type: 'asteroid', x: 4, y: 4 },
    { id: 'ast_3', type: 'asteroid', x: 6, y: 2 },
    { id: 'ast_4', type: 'asteroid', x: 5, y: 5 },
    { id: 'crate_1', type: 'cargo_crate', x: 3, y: 3, value: { credits: 120, alloys: 15 } },
    { id: 'crate_2', type: 'cargo_crate', x: 6, y: 6, value: { credits: 180, alloys: 25, fuel: 10 } },
    { id: 'repair_1', type: 'nano_repair', x: 1, y: 5 },
    { id: 'barrel_1', type: 'plasma_barrel', x: 5, y: 3, health: 30 },
  ]);

  // Projectiles & FX
  const [activeBeam, setActiveBeam] = useState<ProjectileBeam | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [combatFinished, setCombatFinished] = useState<'victory' | 'defeat' | null>(null);
  const [collectedLoot, setCollectedLoot] = useState<{ credits: number; alloys: number; science: number; antimatter: number }>({
    credits: 0,
    alloys: 0,
    science: 0,
    antimatter: 0
  });

  // Logs
  const [combatLogs, setCombatLogs] = useState<CombatLogEntry[]>([
    {
      id: '1',
      timestamp: '00:01',
      text: `Тактическая сетка 10x7 инициализирована. Ваша позиция B4. Используйте перемещение («ходить») по клеткам, чтобы занять выгодную позицию и обойти врага с фланга!`,
      type: 'system'
    }
  ]);

  const addLog = useCallback((text: string, type: CombatLogEntry['type'], meta?: Partial<CombatLogEntry>) => {
    const timeStr = `00:${combatLogs.length + 1 < 10 ? '0' : ''}${combatLogs.length + 1}`;
    setCombatLogs(prev => [
      { id: Math.random().toString(), timestamp: timeStr, text, type, ...meta },
      ...prev.slice(0, 40)
    ]);
  }, [combatLogs.length]);

  const addFloatingText = (x: number, y: number, text: string, color: string) => {
    const id = Math.random().toString();
    setFloatingTexts(prev => [...prev, { id, x, y, text, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(item => item.id !== id));
    }, 1200);
  };

  // Check if tile is occupied by asteroid
  const isAsteroidAt = useCallback((x: number, y: number) => {
    return tacticalItems.some(i => i.x === x && i.y === y && i.type === 'asteroid');
  }, [tacticalItems]);

  // Check if tile is occupied by an alive enemy
  const getEnemyAt = useCallback((x: number, y: number) => {
    return enemies.find(e => e.gridX === x && e.gridY === y && e.hull > 0);
  }, [enemies]);

  // Distance helper (Chebyshev / Manhattan distance)
  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
  };

  // Check if player is flanking an enemy (e.g. attacking from above/below or from the back)
  const isFlanking = (px: number, py: number, ex: number, ey: number) => {
    // If enemy is facing left (standard for enemies on the right side), attacking from behind (px > ex) or flank (|py - ey| >= 2) is a flank
    return px > ex || Math.abs(py - ey) >= 2;
  };

  // Has cover: is there an adjacent asteroid providing defense?
  const hasCover = (x: number, y: number) => {
    return [
      { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
    ].some(({ dx, dy }) => isAsteroidAt(x + dx, y + dy));
  };

  // Calculate Reachable Cells for Movement ("Ходить")
  const reachableCells = useMemo(() => {
    if (movementPoints <= 0 || isEnemyTurn || !!combatFinished) return [];
    const cells: { x: number; y: number; cost: number }[] = [];

    // Simple BFS/Dijkstra to find reachable unobstructed tiles
    const queue: { x: number; y: number; cost: number }[] = [{ x: playerPos.x, y: playerPos.y, cost: 0 }];
    const visited = new Set<string>();
    visited.add(`${playerPos.x},${playerPos.y}`);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.cost > 0) {
        cells.push(current);
      }

      if (current.cost < movementPoints) {
        const neighbors = [
          { x: current.x + 1, y: current.y },
          { x: current.x - 1, y: current.y },
          { x: current.x, y: current.y + 1 },
          { x: current.x, y: current.y - 1 }
        ];

        for (const n of neighbors) {
          if (n.x >= 0 && n.x < GRID_COLS && n.y >= 0 && n.y < GRID_ROWS) {
            const key = `${n.x},${n.y}`;
            if (!visited.has(key)) {
              visited.add(key);
              // Cannot step through asteroids or living enemies
              if (!isAsteroidAt(n.x, n.y) && !getEnemyAt(n.x, n.y)) {
                queue.push({ x: n.x, y: n.y, cost: current.cost + 1 });
              }
            }
          }
        }
      }
    }

    return cells;
  }, [movementPoints, isEnemyTurn, combatFinished, playerPos.x, playerPos.y, isAsteroidAt, getEnemyAt]);

  // Step-by-Step Walk Action ("Ходить")
  const walkToTile = useCallback((targetX: number, targetY: number) => {
    if (isEnemyTurn || !!combatFinished) return;
    if (targetX === playerPos.x && targetY === playerPos.y) return;

    const reachable = reachableCells.find(c => c.x === targetX && c.y === targetY);
    if (!reachable) {
      sounds.playAlert();
      addLog(`Клетка [${COL_LETTERS[targetX]}${targetY + 1}] недостижима в этот ход. Недостаточно очков движения (MP).`, 'system');
      return;
    }

    const stepCost = reachable.cost;
    sounds.playStep();

    // Determine facing direction
    if (targetX > playerPos.x) setPlayerFacing('right');
    else if (targetX < playerPos.x) setPlayerFacing('left');
    else if (targetY > playerPos.y) setPlayerFacing('down');
    else if (targetY < playerPos.y) setPlayerFacing('up');

    setPlayerPos({ x: targetX, y: targetY });
    setMovementPoints(prev => Math.max(0, prev - stepCost));
    addLog(`Корабль переместился («ход») на позицию ${COL_LETTERS[targetX]}${targetY + 1} (потрачено ${stepCost} MP).`, 'system');

    // Check tactical items on the stepped cell
    const itemsOnCell = tacticalItems.filter(i => i.x === targetX && i.y === targetY);
    if (itemsOnCell.length > 0) {
      itemsOnCell.forEach(item => {
        if (item.type === 'cargo_crate') {
          sounds.playPickup();
          const cr = item.value?.credits ?? 100;
          const al = item.value?.alloys ?? 15;
          const fu = item.value?.fuel ?? 0;
          setCollectedLoot(prev => ({ ...prev, credits: prev.credits + cr, alloys: prev.alloys + al }));
          addFloatingText(targetX, targetY, `+${cr} ⬡ +${al} сплавов`, '#34D399');
          addLog(`Подобран контейнер с грузом! Получено: +${cr} кредитов, +${al} сплавов.`, 'system');
        } else if (item.type === 'nano_repair') {
          sounds.playPickup();
          const healedShields = 35;
          const healedHull = 20;
          setPlayerShields(prev => Math.min(playerShip.maxShields, prev + healedShields));
          onDamagePlayerHull(-healedHull);
          addFloatingText(targetX, targetY, `+${healedShields} Щит / +${healedHull} Корпус`, '#38BDF8');
          addLog(`Активирован нано-ремонтный док! Восстановлено +${healedShields} SP щитов и +${healedHull} HP корпуса.`, 'system');
        } else if (item.type === 'mine') {
          sounds.playExplosion();
          const mineDamage = 40;
          setPlayerShields(prev => {
            if (prev >= mineDamage) return prev - mineDamage;
            const rem = mineDamage - prev;
            onDamagePlayerHull(rem);
            return 0;
          });
          addFloatingText(targetX, targetY, `ВЗРЫВ МИНЫ -${mineDamage}`, '#F43F5E');
          addLog(`Внимание! Корабль наступил на мину! Нанесено ${mineDamage} ед. урона!`, 'hull_damage');
        }
      });

      // Remove consumed single-use items from ground
      setTacticalItems(prev => prev.filter(i => !(i.x === targetX && i.y === targetY && (i.type === 'cargo_crate' || i.type === 'nano_repair' || i.type === 'mine'))));
    }
  }, [isEnemyTurn, combatFinished, playerPos.x, playerPos.y, reachableCells, addLog, tacticalItems, onDamagePlayerHull, playerShip.maxShields]);

  // Single step movement via D-Pad or Keyboard (W, A, S, D / Arrows)
  const stepDirection = useCallback((dx: number, dy: number) => {
    if (movementPoints < 1 || isEnemyTurn || !!combatFinished) return;
    const nx = playerPos.x + dx;
    const ny = playerPos.y + dy;

    if (nx < 0 || nx >= GRID_COLS || ny < 0 || ny >= GRID_ROWS) return;
    if (isAsteroidAt(nx, ny) || getEnemyAt(nx, ny)) {
      sounds.playAlert();
      return;
    }

    walkToTile(nx, ny);
  }, [movementPoints, isEnemyTurn, combatFinished, playerPos.x, playerPos.y, isAsteroidAt, getEnemyAt, walkToTile]);

  // Keyboard controls listener (WASD and Arrows for walking)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEnemyTurn || !!combatFinished) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === 'ц' || e.key === 'Ц') {
        e.preventDefault();
        stepDirection(0, -1);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'ы' || e.key === 'Ы') {
        e.preventDefault();
        stepDirection(0, 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'ф' || e.key === 'Ф') {
        e.preventDefault();
        stepDirection(-1, 0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 'в' || e.key === 'В') {
        e.preventDefault();
        stepDirection(1, 0);
      } else if (e.key === ' ' || e.key === 'Enter') {
        // Space to end turn if desired
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnemyTurn, combatFinished, stepDirection]);

  // Auto-select first alive enemy if not selected
  useEffect(() => {
    const aliveEnemies = enemies.filter(e => e.hull > 0);
    if (aliveEnemies.length > 0 && (!selectedTargetEnemyId || !aliveEnemies.some(e => e.id === selectedTargetEnemyId))) {
      setSelectedTargetEnemyId(aliveEnemies[0].id);
    }
  }, [enemies, selectedTargetEnemyId]);

  // Player Attack or Ability Action
  const executeCombatAction = (actionType: 'laser' | 'torpedo' | 'emp' | 'mine' | 'repair' | 'overdrive' | 'railgun' | 'nuke' | 'tachyon' | 'cluster') => {
    if (isEnemyTurn || !!combatFinished) return;

    if (actionType === 'overdrive') {
      if (actionPoints < 1) {
        sounds.playAlert();
        addLog('Недостаточно очков действий (AP) для форсажа!', 'system');
        return;
      }
      sounds.playScanPing();
      setActionPoints(prev => prev - 1);
      setMovementPoints(prev => prev + 3);
      addFloatingText(playerPos.x, playerPos.y, '+3 MP ФОРСАЖ', '#38BDF8');
      addLog('Активирован экстренный форсаж двигателей! Получено +3 очка движения (MP).', 'system');
      return;
    }

    if (actionType === 'repair') {
      if (actionPoints < 1) {
        sounds.playAlert();
        addLog('Недостаточно очков действий (AP) для нано-ремонта!', 'system');
        return;
      }
      sounds.playShieldHit();
      setActionPoints(prev => prev - 1);
      const repShields = 30;
      const repHull = 15;
      setPlayerShields(prev => Math.min(playerShip.maxShields, prev + repShields));
      onDamagePlayerHull(-repHull);
      addFloatingText(playerPos.x, playerPos.y, `+${repShields} Щит / +${repHull} Корпус`, '#10B981');
      addLog(`Полевые наноботы восстановили +${repShields} SP щитов и устранили микротрещины корпуса (+${repHull} HP).`, 'system');
      return;
    }

    if (actionType === 'mine') {
      if (actionPoints < 1) {
        sounds.playAlert();
        addLog('Недостаточно AP для сброса мины!', 'system');
        return;
      }
      // Drop mine on adjacent empty tile or current tile
      sounds.playMine();
      setActionPoints(prev => prev - 1);
      const mineX = playerPos.x;
      const mineY = playerPos.y;
      setTacticalItems(prev => [
        ...prev,
        { id: `mine_${Date.now()}`, type: 'mine', x: mineX, y: mineY, owner: 'player' }
      ]);
      addFloatingText(mineX, mineY, 'МИНА УСТАНОВЛЕНА', '#F59E0B');
      addLog(`Плазменная мина с датчиком приближения установлена на клетке ${COL_LETTERS[mineX]}${mineY + 1}!`, 'system');
      return;
    }

    // Weapons need a targeted enemy
    const targetEnemy = enemies.find(e => e.id === selectedTargetEnemyId && e.hull > 0);
    if (!targetEnemy) {
      sounds.playAlert();
      addLog('Выберите цель для атаки на тактической сетке!', 'system');
      return;
    }

    const dist = getDistance(playerPos.x, playerPos.y, targetEnemy.gridX, targetEnemy.gridY);
    const weaponsAllocBonus = playerShip.powerAllocation.weapons / 35; // power allocation multiplier
    const commanderWeaponsMult = 1 + (commander ? commander.skills.weapons * 0.06 : 0);
    const weaponsBonus = weaponsAllocBonus * commanderWeaponsMult;
    const flanking = isFlanking(playerPos.x, playerPos.y, targetEnemy.gridX, targetEnemy.gridY);
    const commanderTacticsMult = 1.35 + (commander ? commander.skills.tactics * 0.06 : 0);
    const flankMultiplier = flanking ? commanderTacticsMult : 1.0;

    if (actionType === 'laser') {
      if (actionPoints < 1) {
        sounds.playAlert();
        addLog('Недостаточно очков действий (AP) для выстрела!', 'system');
        return;
      }
      if (dist > 4) {
        sounds.playAlert();
        addLog(`Цель ${targetEnemy.name} слишком далеко для лазера (дальность 4 клетки, текущая дистанция: ${dist}). Подойдите ближе!`, 'system');
        return;
      }

      sounds.playLaser();
      setActionPoints(prev => prev - 1);

      // Trigger visual beam
      setActiveBeam({
        fromX: playerPos.x,
        fromY: playerPos.y,
        toX: targetEnemy.gridX,
        toY: targetEnemy.gridY,
        color: '#38BDF8',
        type: 'laser'
      });
      setTimeout(() => setActiveBeam(null), 350);

      const baseDmg = (playerShip.weaponsPower + Math.floor(Math.random() * 8)) * weaponsBonus;
      const finalDmg = Math.round(baseDmg * flankMultiplier);

      applyDamageToEnemy(targetEnemy.id, finalDmg, flanking ? 'КРИТ (ФЛАНГ)!' : '');
      const estEnemyHull = Math.max(0, targetEnemy.hull - Math.max(0, finalDmg - targetEnemy.shields));
      addLog(
        `Лазерный импульс по [${targetEnemy.name}]: ${finalDmg} урона ${flanking ? '(+35% фланговый обход!)' : ''}.`,
        'player_attack',
        {
          actionName: 'Импульсный лазер',
          initiatorName: playerShip.name,
          targetName: targetEnemy.name,
          damageDealt: finalDmg,
          isCritical: flanking,
          targetHullRemaining: estEnemyHull,
          targetStatus: estEnemyHull <= 0 ? 'destroyed' : estEnemyHull < targetEnemy.maxHull * 0.35 ? 'critical' : 'damaged'
        }
      );
    } else if (actionType === 'torpedo') {
      if (actionPoints < 1) {
        sounds.playAlert();
        addLog('Недостаточно AP для пуска торпеды!', 'system');
        return;
      }
      if (dist > 6) {
        sounds.playAlert();
        addLog(`Дистанция до цели слишком велика (макс. дальность торпеды: 6 клеток). Подойдите ближе!`, 'system');
        return;
      }

      sounds.playLaser();
      setActionPoints(prev => prev - 1);

      setActiveBeam({
        fromX: playerPos.x,
        fromY: playerPos.y,
        toX: targetEnemy.gridX,
        toY: targetEnemy.gridY,
        color: '#F43F5E',
        type: 'torpedo'
      });
      setTimeout(() => setActiveBeam(null), 450);

      const baseDmg = (playerShip.weaponsPower * 1.6 + Math.floor(Math.random() * 12)) * weaponsBonus;
      const finalDmg = Math.round(baseDmg * flankMultiplier);

      applyDamageToEnemy(targetEnemy.id, finalDmg, 'ТОРПЕДНЫЙ УДАР!');
      const estEnemyHull = Math.max(0, targetEnemy.hull - Math.max(0, finalDmg - targetEnemy.shields));
      addLog(
        `Тяжёлая плазменная торпеда разорвала броню [${targetEnemy.name}] на ${finalDmg} ед. урона!`,
        'player_attack',
        {
          actionName: 'Плазменная торпеда',
          initiatorName: playerShip.name,
          targetName: targetEnemy.name,
          damageDealt: finalDmg,
          isCritical: true,
          targetHullRemaining: estEnemyHull,
          targetStatus: estEnemyHull <= 0 ? 'destroyed' : estEnemyHull < targetEnemy.maxHull * 0.35 ? 'critical' : 'damaged'
        }
      );
    } else if (actionType === 'emp') {
      if (actionPoints < 1) {
        sounds.playAlert();
        addLog('Недостаточно AP для ЭМИ-волны!', 'system');
        return;
      }
      if (dist > 3) {
        sounds.playAlert();
        addLog('ЭМИ-волна поражает цели в радиусе до 3 клеток. Подойдите ближе!', 'system');
        return;
      }

      sounds.playShieldHit();
      setActionPoints(prev => prev - 1);

      setActiveBeam({
        fromX: playerPos.x,
        fromY: playerPos.y,
        toX: targetEnemy.gridX,
        toY: targetEnemy.gridY,
        color: '#A855F7',
        type: 'emp'
      });
      setTimeout(() => setActiveBeam(null), 400);

      // EMP shreds shields directly and reduces enemy MP
      setEnemies(prev => prev.map(e => {
        if (e.id === targetEnemy.id) {
          const newShields = Math.max(0, e.shields - 45);
          return { ...e, shields: newShields, movementPoints: Math.max(0, e.movementPoints - 2) };
        }
        return e;
      }));

      addFloatingText(targetEnemy.gridX, targetEnemy.gridY, 'ЩИТЫ ПЕРЕГРУЖЕНЫ (-45)', '#C084FC');
      addLog(
        `ЭМИ-удар обесточил энергощиты [${targetEnemy.name}] (-45 SP) и замедлил его приводы!`,
        'player_attack',
        {
          actionName: 'ЭМИ-разряд',
          initiatorName: playerShip.name,
          targetName: targetEnemy.name,
          damageDealt: 45,
          targetShieldRemaining: Math.max(0, targetEnemy.shields - 45),
          targetStatus: 'shield_broken'
        }
      );
    } else if (actionType === 'railgun') {
      if (actionPoints < 1) {
        sounds.playAlert();
        addLog('Недостаточно AP для залпа рельсотрона!', 'system');
        return;
      }
      if (dist > 6) {
        sounds.playAlert();
        addLog('Цель вне эффективной дальности рельсотрона (макс. 6 клеток)!', 'system');
        return;
      }

      sounds.playLaser();
      setActionPoints(prev => prev - 1);

      setActiveBeam({
        fromX: playerPos.x,
        fromY: playerPos.y,
        toX: targetEnemy.gridX,
        toY: targetEnemy.gridY,
        color: '#38BDF8',
        type: 'laser'
      });
      setTimeout(() => setActiveBeam(null), 380);

      // Railgun bypasses enemy shields entirely!
      const railBaseDmg = (playerShip.weaponsPower * 1.9 + 35 + Math.floor(Math.random() * 18)) * weaponsBonus;
      const finalRailDmg = Math.round(railBaseDmg * flankMultiplier);

      setEnemies(prev => prev.map(e => {
        if (e.id !== targetEnemy.id) return e;
        const newHull = Math.max(0, e.hull - finalRailDmg);
        addFloatingText(e.gridX, e.gridY, `ПРОБИТИЕ ЩИТОВ -${finalRailDmg}`, '#38BDF8');
        if (newHull <= 0) {
          sounds.playExplosion();
          addLog(`Бронебойный снаряд рельсотрона детонировал ядро [${e.name}]!`, 'victory');
        }
        return { ...e, hull: newHull };
      }));

      addLog(
        `⚡ Гиперзвуковой вольфрамовый снаряд рельсотрона пробил щиты и насквозь прошил корпус [${targetEnemy.name}] на ${finalRailDmg} ед.!`,
        'player_attack',
        {
          actionName: 'Рельсотрон "Танатос"',
          initiatorName: playerShip.name,
          targetName: targetEnemy.name,
          damageDealt: finalRailDmg,
          isCritical: true,
          targetHullRemaining: Math.max(0, targetEnemy.hull - finalRailDmg),
          targetStatus: 'damaged'
        }
      );
    } else if (actionType === 'tachyon') {
      if (actionPoints < 1) {
        sounds.playAlert();
        addLog('Недостаточно AP для тахионного луча!', 'system');
        return;
      }
      if (dist > 7) {
        sounds.playAlert();
        addLog('Цель вне зоны действия тахионного дезинтегратора (макс. 7 клеток)!', 'system');
        return;
      }

      sounds.playLaser();
      setActionPoints(prev => prev - 1);

      setActiveBeam({
        fromX: playerPos.x,
        fromY: playerPos.y,
        toX: targetEnemy.gridX,
        toY: targetEnemy.gridY,
        color: '#10B981',
        type: 'laser'
      });
      setTimeout(() => setActiveBeam(null), 400);

      const baseDmg = (playerShip.weaponsPower * 2.2 + 45 + Math.floor(Math.random() * 25)) * weaponsBonus;
      const finalDmg = Math.round(baseDmg * flankMultiplier);

      applyDamageToEnemy(targetEnemy.id, finalDmg, '⚡ ТАХИОННЫЙ РАСПАД!');
      const estEnemyHull = Math.max(0, targetEnemy.hull - Math.max(0, finalDmg - targetEnemy.shields));
      addLog(
        `⚡ Тахионный дезинтегратор расщепил защитные поля и обшивку [${targetEnemy.name}] на ${finalDmg} ед.!`,
        'player_attack',
        {
          actionName: 'Тахионный дезинтегратор',
          initiatorName: playerShip.name,
          targetName: targetEnemy.name,
          damageDealt: finalDmg,
          isCritical: true,
          targetHullRemaining: estEnemyHull,
          targetStatus: estEnemyHull <= 0 ? 'destroyed' : 'damaged'
        }
      );
    } else if (actionType === 'cluster') {
      if (actionPoints < 1) {
        sounds.playAlert();
        addLog('Недостаточно AP для кассетного залпа!', 'system');
        return;
      }
      if (dist > 5) {
        sounds.playAlert();
        addLog('Цель слишком далеко для кассетной батареи (макс. 5 клеток)!', 'system');
        return;
      }

      sounds.playExplosion();
      setActionPoints(prev => prev - 1);

      setActiveBeam({
        fromX: playerPos.x,
        fromY: playerPos.y,
        toX: targetEnemy.gridX,
        toY: targetEnemy.gridY,
        color: '#F97316',
        type: 'torpedo'
      });
      setTimeout(() => setActiveBeam(null), 450);

      const clusterBaseDmg = (playerShip.weaponsPower * 1.8 + 25 + Math.floor(Math.random() * 20)) * weaponsBonus;
      const finalClusterDmg = Math.round(clusterBaseDmg * flankMultiplier);

      applyDamageToEnemy(targetEnemy.id, finalClusterDmg, '💥 КАССЕТНЫЙ УДАР!');

      // Hits nearby targets within 1 cell
      enemies.forEach(e => {
        if (e.id !== targetEnemy.id && e.hull > 0) {
          const splashDist = getDistance(targetEnemy.gridX, targetEnemy.gridY, e.gridX, e.gridY);
          if (splashDist <= 1) {
            const splashDmg = Math.round(finalClusterDmg * 0.5);
            applyDamageToEnemy(e.id, splashDmg, '💥 ОСКОЛКИ');
            addFloatingText(e.gridX, e.gridY, `💥 ОСКОЛКИ -${splashDmg}`, '#F97316');
          }
        }
      });

      const estEnemyHull = Math.max(0, targetEnemy.hull - Math.max(0, finalClusterDmg - targetEnemy.shields));
      addLog(
        `💥 Кластерная батарея накрыла сектор [${targetEnemy.name}], нанеся ${finalClusterDmg} ед. урона и поразив окружение!`,
        'player_attack',
        {
          actionName: 'Кластерный шквал',
          initiatorName: playerShip.name,
          targetName: targetEnemy.name,
          damageDealt: finalClusterDmg,
          isCritical: true,
          targetHullRemaining: estEnemyHull,
          targetStatus: estEnemyHull <= 0 ? 'destroyed' : 'damaged'
        }
      );
    } else if (actionType === 'nuke') {
      if (actionPoints < 1) {
        sounds.playAlert();
        addLog('Недостаточно AP для пуска ядерной боеголовки!', 'system');
        return;
      }
      const playerNukes = resources.nukes || 0;
      if (playerNukes <= 0 && (!resources.antimatter || resources.antimatter <= 0)) {
        sounds.playAlert();
        addLog('НЕТ ТЕРМОЯДЕРНЫХ БОЕГОЛОВОК (ЯДЕРОК)! Пополните запас на верфи или в секторе боевых действий.', 'system');
        return;
      }

      sounds.playExplosion();
      setActionPoints(prev => prev - 1);
      onConsumeNuke?.();

      setActiveBeam({
        fromX: playerPos.x,
        fromY: playerPos.y,
        toX: targetEnemy.gridX,
        toY: targetEnemy.gridY,
        color: '#FACC15',
        type: 'torpedo'
      });
      setTimeout(() => setActiveBeam(null), 550);

      const nukeBaseDmg = (playerShip.weaponsPower * 3.4 + 130 + Math.floor(Math.random() * 40)) * weaponsBonus;
      const finalNukeDmg = Math.round(nukeBaseDmg * flankMultiplier);

      // Primary devastation
      applyDamageToEnemy(targetEnemy.id, finalNukeDmg, '☢ ТЕРМОЯДЕРНЫЙ ВЗРЫВ');

      // Devastating nuclear blast wave to all nearby enemies within 2 cells
      enemies.forEach(e => {
        if (e.id !== targetEnemy.id && e.hull > 0) {
          const splashDist = getDistance(targetEnemy.gridX, targetEnemy.gridY, e.gridX, e.gridY);
          if (splashDist <= 2) {
            const splashDmg = Math.round(finalNukeDmg * 0.45);
            applyDamageToEnemy(e.id, splashDmg, '☢ УДАРНАЯ ВОЛНА');
            addFloatingText(e.gridX, e.gridY, `☢ ВОЛНА -${splashDmg}`, '#FBBF24');
          }
        }
      });

      const estEnemyHull = Math.max(0, targetEnemy.hull - Math.max(0, finalNukeDmg - targetEnemy.shields));
      addLog(
        `☢ ТЕРМОЯДЕРНЫЙ ЗАЛП (ЯДЕРКА)! Радиоактивный сверхвзрыв стёр [${targetEnemy.name}] на ${finalNukeDmg} ед. урона!`,
        'player_attack',
        {
          actionName: 'Термоядерная Боеголовка (Ядерка)',
          initiatorName: playerShip.name,
          targetName: targetEnemy.name,
          damageDealt: finalNukeDmg,
          isCritical: true,
          targetHullRemaining: estEnemyHull,
          targetStatus: estEnemyHull <= 0 ? 'destroyed' : 'critical'
        }
      );
    }
  };

  // Damage Enemy Helper
  const applyDamageToEnemy = (enemyId: string, damage: number, labelPrefix?: string) => {
    setEnemies(prev => prev.map(e => {
      if (e.id !== enemyId) return e;

      let newShields = e.shields;
      let newHull = e.hull;

      if (newShields > 0) {
        if (newShields >= damage) {
          newShields -= damage;
        } else {
          const rem = damage - newShields;
          newShields = 0;
          newHull = Math.max(0, newHull - rem);
        }
      } else {
        newHull = Math.max(0, newHull - damage);
      }

      addFloatingText(e.gridX, e.gridY, `${labelPrefix ? labelPrefix + ' ' : ''}-${damage}`, '#F43F5E');

      if (newHull <= 0) {
        sounds.playExplosion();
        addLog(`Вражеский корабль [${e.name}] уничтожен взрывом реактора!`, 'victory');
        // Drop salvage crate where enemy died, amplified by commander tactics skill
        const lootMult = 1 + (commander ? commander.skills.tactics * 0.08 : 0);
        setTacticalItems(items => [
          ...items,
          {
            id: `wreck_${Date.now()}`,
            type: 'cargo_crate',
            x: e.gridX,
            y: e.gridY,
            value: { 
              credits: Math.round(e.reward.credits * lootMult), 
              alloys: Math.round(e.reward.alloys * lootMult) 
            }
          }
        ]);
      }

      return { ...e, shields: newShields, hull: newHull };
    }));
  };

  const currentMission = useMemo(() => {
    return CAMPAIGN_LEVELS.find(lvl => (lvl.levelNumber ?? 1) === currentLevelNumber) || CAMPAIGN_LEVELS[0];
  }, [currentLevelNumber]);

  // Check Victory Condition
  useEffect(() => {
    const allDefeated = enemies.length > 0 && enemies.every(e => e.hull <= 0);
    if (allDefeated && !combatFinished) {
      setTimeout(() => {
        sounds.playCreditsChime();
        setCombatFinished('victory');
        addLog(`Все цели нейтрализованы! Уровень ${currentLevelNumber} из 40 пройден!`, 'victory');

        // Star rating
        const hullRatio = playerShip.hull / playerShip.maxHull;
        const stars = hullRatio >= 0.75 ? 3 : hullRatio >= 0.35 ? 2 : 1;
        
        onRecordLevelCompletion?.(currentLevelNumber, stars);
        const xpEarned = currentMission?.xpReward || (100 + currentLevelNumber * 25);
        onAddCommanderXp?.(xpEarned);
      }, 700);
    }
  }, [enemies, combatFinished, addLog, currentLevelNumber, currentMission, onRecordLevelCompletion, onAddCommanderXp, playerShip.hull, playerShip.maxHull]);

  // Turn Switch: End Player Turn -> Process Enemy Turn ("Враги тоже ходят и стреляют")
  const handleEndTurn = () => {
    if (isEnemyTurn || !!combatFinished) return;
    setIsEnemyTurn(true);
    addLog(`Завершение хода ${turnNumber}. Передача инициативы вражеской флотилии...`, 'system');

    const livingEnemies = enemies.filter(e => e.hull > 0);
    if (livingEnemies.length === 0) {
      setIsEnemyTurn(false);
      return;
    }

    let delay = 600;

    livingEnemies.forEach((currentEnemy, idx) => {
      setTimeout(() => {
        // 1. Enemy Walks / Moves ("Ходит")
        let curX = currentEnemy.gridX;
        let curY = currentEnemy.gridY;
        const distToPlayer = getDistance(curX, curY, playerPos.x, playerPos.y);

        // If too far or want optimal firing position, move towards player
        if (distToPlayer > 2 && currentEnemy.movementPoints > 0) {
          const stepX = curX > playerPos.x ? -1 : curX < playerPos.x ? 1 : 0;
          const stepY = curY > playerPos.y ? -1 : curY < playerPos.y ? 1 : 0;

          // Prefer X step, then Y
          let nextX = curX + stepX;
          let nextY = curY;
          if (isAsteroidAt(nextX, nextY) || (nextX === playerPos.x && nextY === playerPos.y)) {
            nextX = curX;
            nextY = curY + stepY;
          }

          if (!isAsteroidAt(nextX, nextY) && !(nextX === playerPos.x && nextY === playerPos.y)) {
            sounds.playStep();
            curX = nextX;
            curY = nextY;

            // Check if enemy stepped on a player mine!
            const mineOnTile = tacticalItems.find(i => i.x === curX && i.y === curY && i.type === 'mine');
            if (mineOnTile) {
              sounds.playExplosion();
              setTacticalItems(items => items.filter(i => i.id !== mineOnTile.id));
              applyDamageToEnemy(currentEnemy.id, 55, 'ВЗРЫВ МИНЫ!');
              addLog(`[${currentEnemy.name}] наступил на вашу мину на ${COL_LETTERS[curX]}${curY + 1}! Взрыв на 55 урона!`, 'player_attack');
            } else {
              addLog(`[${currentEnemy.name}] перемещается («ход») на позицию ${COL_LETTERS[curX]}${curY + 1}.`, 'system');
            }

            setEnemies(prev => prev.map(e => e.id === currentEnemy.id ? { ...e, gridX: curX, gridY: curY } : e));
          }
        }

        // 2. Enemy Attacks Player if in range
        const newDist = getDistance(curX, curY, playerPos.x, playerPos.y);
        if (newDist <= currentEnemy.range) {
          // Check player evasion
          const evasionChance = playerShip.evasion + (playerShip.powerAllocation.engines * 0.35);
          const hitRoll = Math.random() * 100;

          // Check if player has asteroid cover
          const coverActive = hasCover(playerPos.x, playerPos.y);

          // Projectile beam animation from enemy to player
          setActiveBeam({
            fromX: curX,
            fromY: curY,
            toX: playerPos.x,
            toY: playerPos.y,
            color: '#F43F5E',
            type: 'laser'
          });
          setTimeout(() => setActiveBeam(null), 350);

          if (hitRoll < evasionChance) {
            sounds.playScanPing();
            addFloatingText(playerPos.x, playerPos.y, 'ПРОМАХ!', '#38BDF8');
            addLog(`Залп [${currentEnemy.name}] прошёл мимо! Маневровые двигатели увели корабль.`, 'system');
          } else {
            sounds.playShieldHit();
            let enemyDmg = Math.round(currentEnemy.weaponsPower + Math.floor(Math.random() * 8));
            if (coverActive) {
              enemyDmg = Math.round(enemyDmg * 0.65);
            }

            // Apply damage to player
            setPlayerShields(prev => {
              if (prev >= enemyDmg) {
                return prev - enemyDmg;
              } else {
                const rem = enemyDmg - prev;
                onDamagePlayerHull(rem);
                if (playerShip.hull - rem <= 0) {
                  sounds.playExplosion();
                  setCombatFinished('defeat');
                }
                return 0;
              }
            });

            addFloatingText(playerPos.x, playerPos.y, `-${enemyDmg} ${coverActive ? '(УКРЫТИЕ)' : ''}`, '#F43F5E');
            addLog(
              `[${currentEnemy.name}] открыл огонь: нанесено ${enemyDmg} урона ${coverActive ? '(астероид поглотил 35% удара)' : ''}!`,
              'enemy_attack',
              {
                actionName: 'Орудийный залп',
                initiatorName: currentEnemy.name,
                targetName: playerShip.name,
                damageDealt: enemyDmg,
                targetHullRemaining: Math.max(0, playerShip.hull),
                targetStatus: playerShip.hull <= 0 ? 'destroyed' : playerShip.hull < playerShip.maxHull * 0.3 ? 'critical' : 'damaged'
              }
            );
          }
        }

        // If last enemy finished turn, reset to player
        if (idx === livingEnemies.length - 1) {
          setTimeout(() => {
            setIsEnemyTurn(false);
            setTurnNumber(prev => prev + 1);
            setActionPoints(maxAP);
            setMovementPoints(maxMP);
            // Passive shield regen if shield power > 35 + commander shield skill bonus
            if (playerShip.powerAllocation.shields >= 35) {
              const bonusRegen = (commander ? commander.skills.shields * 4 : 0);
              setPlayerShields(s => Math.min(playerShip.maxShields, s + 15 + bonusRegen));
            }
            addLog(`Начался ход ${turnNumber + 1}. Очки действий (AP) и движения (MP) восстановлены!`, 'system');
          }, 600);
        }
      }, delay);

      delay += 850;
    });
  };

  // Start a mission from the 40 campaign levels
  const loadMission = (mission: TacticalMission) => {
    sounds.playScanPing();
    const lvlNum = mission.levelNumber ?? 1;
    setCurrentLevelNumber(lvlNum);

    setEnemies(mission.enemies.map(e => ({
      ...e,
      gridX: e.gridX ?? 8,
      gridY: e.gridY ?? 3,
      shipType: e.shipType ?? (e.hull > 100 ? 'dreadnought' : 'frigate'),
      range: e.range ?? 4,
      movementPoints: e.movementPoints ?? 2
    })));

    setPlayerPos({ x: 1, y: 3 });
    setPlayerShields(playerShip.shields + (commander ? commander.skills.shields * 15 : 0));
    setActionPoints(maxAP);
    setMovementPoints(maxMP);
    setTurnNumber(1);
    setIsEnemyTurn(false);
    setCombatFinished(null);
    setSelectedTargetEnemyId(mission.enemies[0]?.id || null);

    // Setup themed terrain items from mission or procedural per level
    if (mission.initialItems && mission.initialItems.length > 0) {
      setTacticalItems(mission.initialItems);
    } else {
      const generatedItems: TacticalTileItem[] = [
        { id: `ast_1_${lvlNum}`, type: 'asteroid', x: 3, y: 1 },
        { id: `ast_2_${lvlNum}`, type: 'asteroid', x: 5, y: 4 },
        { id: `ast_3_${lvlNum}`, type: 'asteroid', x: 6, y: 2 },
        { id: `crate_1_${lvlNum}`, type: 'cargo_crate', x: 4, y: 3, value: { credits: 160 + lvlNum * 15, alloys: 20 + lvlNum * 4 } },
        { id: `repair_1_${lvlNum}`, type: 'nano_repair', x: 2, y: 5 },
      ];
      if (lvlNum % 2 === 0) {
        generatedItems.push({ id: `barrel_1_${lvlNum}`, type: 'plasma_barrel', x: 5, y: 2, health: 30 });
      }
      setTacticalItems(generatedItems);
    }

    addLog(`Загружен Уровень ${lvlNum} / 40: «${mission.title}». Защитные и боевые системы в боевой готовности.`, 'system');
  };

  // Flee from combat
  const handleFlee = () => {
    const fleeChance = 35 + (playerShip.powerAllocation.engines * 0.65);
    if (Math.random() * 100 < fleeChance) {
      sounds.playWarpJump();
      onFleeCombat();
    } else {
      sounds.playAlert();
      addLog(`Варп-двигатели перегреты! Противник заглушил прыжок. Получен встречный залп!`, 'system');
      const enemyDmg = 18;
      onDamagePlayerHull(enemyDmg);
      addFloatingText(playerPos.x, playerPos.y, `-${enemyDmg}`, '#F43F5E');
    }
  };

  // Grand total rewards on victory
  const totalVictoryRewards = useMemo(() => {
    let cr = collectedLoot.credits;
    let al = collectedLoot.alloys;
    let sc = collectedLoot.science;
    let an = collectedLoot.antimatter;

    enemies.forEach(e => {
      cr += e.reward.credits;
      al += e.reward.alloys;
      sc += e.reward.science || 0;
      an += e.reward.antimatter || 0;
    });

    return { credits: cr, alloys: al, science: sc, antimatter: an };
  }, [enemies, collectedLoot]);

  const activeTargetEnemy = enemies.find(e => e.id === selectedTargetEnemyId && e.hull > 0);

  const cycleTargetEnemy = () => {
    sounds.playScanPing();
    const alive = enemies.filter(e => e.hull > 0);
    if (alive.length === 0) return;
    const currentIdx = alive.findIndex(e => e.id === selectedTargetEnemyId);
    const nextIdx = (currentIdx + 1) % alive.length;
    setSelectedTargetEnemyId(alive[nextIdx].id);
  };

  return (
    <div className="w-full h-[calc(100vh-98px)] bg-[#04060C] flex flex-col p-2 sm:p-3 md:p-5 overflow-y-auto lg:overflow-hidden select-none">
      {/* Top Banner with HUD Stats and Mission Selector */}
      <div className="max-w-[1600px] w-full mx-auto flex flex-wrap items-center justify-between pb-2.5 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40">
            <Swords className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold font-heading text-rose-400 tracking-wider">
                ТАКТИЧЕСКИЙ БОЙ С ПЕРЕМЕЩЕНИЕМ
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                ХОД #{turnNumber} • {isEnemyTurn ? 'ХОД ВРАГА' : 'ВАШ ХОД'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono hidden sm:block">
              Управление: клик по клетке поля («ходить») | клавиши WASD / стрелки | D-Pad справа
            </p>
          </div>
        </div>

        {/* Tactical Campaign 40-Level Navigation & Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Previous level button */}
          <button
            disabled={currentLevelNumber <= 1}
            onClick={() => {
              const prev = CAMPAIGN_LEVELS.find(l => (l.levelNumber ?? 1) === currentLevelNumber - 1);
              if (prev) loadMission(prev);
            }}
            title="Предыдущий уровень"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>

          {/* Current Level Pill (Click to open selector) */}
          <button
            onClick={() => {
              sounds.playScanPing();
              setIsLevelSelectorOpen(true);
            }}
            title="Открыть список всех 40 уровней кампании"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/50 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 transition-all font-mono text-xs shadow-sm shadow-cyan-950"
          >
            {currentMission?.isBossLevel && <Crown className="w-3.5 h-3.5 text-amber-400" />}
            <span className="font-bold">УРОВЕНЬ {currentLevelNumber} / 40</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
              currentMission?.difficulty === 'БОСС'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                : 'bg-cyan-900/60 text-cyan-400 border-cyan-700/50'
            }`}>
              {currentMission?.difficulty || 'Норма'}
            </span>
          </button>

          {/* Next level button */}
          <button
            disabled={currentLevelNumber >= 40}
            onClick={() => {
              const next = CAMPAIGN_LEVELS.find(l => (l.levelNumber ?? 1) === currentLevelNumber + 1);
              if (next) loadMission(next);
            }}
            title="Следующий уровень"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>

          {/* All 40 Levels button */}
          <button
            onClick={() => {
              sounds.playScanPing();
              setIsLevelSelectorOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-950/30 hover:bg-purple-900/40 text-purple-300 font-mono text-xs transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="font-bold">Все 40 уровней ({Object.keys(completedCampaignLevels).length}/40)</span>
          </button>

          {/* Commander profile mini button in combat */}
          {commander && onOpenCommanderModal && (
            <button
              onClick={() => {
                sounds.playScanPing();
                onOpenCommanderModal();
              }}
              title="Навыки и опыт командира"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 font-mono text-xs transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Командир: {commander.level} ур.</span>
              {commander.skillPoints > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Tactical Grid & Sidebar Layout */}
      <div className="max-w-[1600px] w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 my-2.5 min-h-0 overflow-hidden">
        
        {/* Left / Center: Tactical Battlefield Grid */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950/90 border border-slate-800 rounded-xl p-3 sm:p-4 relative overflow-hidden shadow-2xl">
          
          {/* Top Status Bar of Field: Action Points & Movement Points */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-xs font-mono">
            {/* Action Points (AP) */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> AP (Очки действий):
              </span>
              <div className="flex items-center gap-1">
                {[1, 2].map(pip => (
                  <div
                    key={pip}
                    className={`w-3.5 h-3.5 rounded-sm transition-all ${
                      actionPoints >= pip ? 'bg-amber-400 shadow-[0_0_8px_#F59E0B]' : 'bg-slate-800 border border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Movement Points (MP) */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-cyan-400" /> MP (Шаги / Ходить):
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: maxMP }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-3 h-3.5 rounded-sm transition-all ${
                      movementPoints > idx ? 'bg-cyan-400 shadow-[0_0_8px_#38BDF8]' : 'bg-slate-800 border border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* End Turn Button */}
            <button
              disabled={isEnemyTurn || !!combatFinished}
              onClick={handleEndTurn}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                isEnemyTurn
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              }`}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isEnemyTurn ? 'animate-spin' : ''}`} />
              <span>Завершить Ход</span>
            </button>
          </div>

          {/* Tactical Arena Grid (10x7 Matrix) */}
          <div className="flex-1 relative flex flex-col justify-center items-center bg-[#070B16] rounded-lg p-1.5 sm:p-2 border border-slate-800/80 overflow-x-auto overflow-y-hidden w-full scrollbar-none">
            
            {/* Grid Container */}
            <div className="relative w-full h-full min-w-[480px] sm:min-w-[560px] lg:min-w-0 grid grid-cols-10 grid-rows-7 gap-1 max-w-[1000px] max-h-[520px]">
              
              {/* SVG Layer for Animated Laser Beams & Torpedo Tracers */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
                {activeBeam && (
                  <line
                    x1={`${((activeBeam.fromX + 0.5) / GRID_COLS) * 100}%`}
                    y1={`${((activeBeam.fromY + 0.5) / GRID_ROWS) * 100}%`}
                    x2={`${((activeBeam.toX + 0.5) / GRID_COLS) * 100}%`}
                    y2={`${((activeBeam.toY + 0.5) / GRID_ROWS) * 100}%`}
                    stroke={activeBeam.color}
                    strokeWidth={activeBeam.type === 'torpedo' ? 5 : 3}
                    strokeDasharray={activeBeam.type === 'emp' ? '6 3' : undefined}
                    className="animate-pulse"
                  />
                )}
              </svg>

              {/* Floating Damage & Action Text Overlays */}
              {floatingTexts.map(ft => (
                <div
                  key={ft.id}
                  className="absolute z-40 font-mono font-bold text-xs pointer-events-none transition-all duration-1000 -translate-y-4 animate-bounce"
                  style={{
                    left: `${((ft.x + 0.5) / GRID_COLS) * 100}%`,
                    top: `${((ft.y + 0.2) / GRID_ROWS) * 100}%`,
                    color: ft.color,
                    textShadow: '0 0 8px rgba(0,0,0,0.9)'
                  }}
                >
                  {ft.text}
                </div>
              ))}
              {Array.from({ length: GRID_ROWS }).map((_, rIdx) => (
                <React.Fragment key={`row_${rIdx}`}>
                  {Array.from({ length: GRID_COLS }).map((_, cIdx) => {
                    const isPlayerHere = playerPos.x === cIdx && playerPos.y === rIdx;
                    const enemyOnCell = getEnemyAt(cIdx, rIdx);
                    const asteroid = tacticalItems.find(i => i.x === cIdx && i.y === rIdx && i.type === 'asteroid');
                    const crate = tacticalItems.find(i => i.x === cIdx && i.y === rIdx && i.type === 'cargo_crate');
                    const nanoRepair = tacticalItems.find(i => i.x === cIdx && i.y === rIdx && i.type === 'nano_repair');
                    const barrel = tacticalItems.find(i => i.x === cIdx && i.y === rIdx && i.type === 'plasma_barrel');
                    const mine = tacticalItems.find(i => i.x === cIdx && i.y === rIdx && i.type === 'mine');
                    const reachable = reachableCells.find(c => c.x === cIdx && c.y === rIdx);
                    const isTargeted = enemyOnCell && enemyOnCell.id === selectedTargetEnemyId;

                    return (
                      <div
                        key={`cell_${cIdx}_${rIdx}`}
                        onClick={() => {
                          if (enemyOnCell) {
                            setSelectedTargetEnemyId(enemyOnCell.id);
                          } else if (reachable) {
                            walkToTile(cIdx, rIdx);
                          }
                        }}
                        className={`relative rounded-md border flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${
                          isPlayerHere
                            ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.4)] z-20'
                            : enemyOnCell
                            ? isTargeted
                              ? 'bg-rose-950/50 border-rose-400 ring-2 ring-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.4)] z-20'
                              : 'bg-rose-950/20 border-rose-800/60 hover:border-rose-400'
                            : asteroid
                            ? 'bg-slate-900 border-slate-700/80 cursor-not-allowed'
                            : reachable
                            ? 'bg-cyan-500/10 border-cyan-500/40 hover:bg-cyan-500/25 hover:border-cyan-300'
                            : 'bg-slate-950/60 border-slate-900 hover:border-slate-800'
                        }`}
                      >
                        {/* Cell Coordinate Tag (e.g. A1, B4) */}
                        <span className="absolute top-0.5 left-1 text-[8px] font-mono text-slate-600 select-none">
                          {COL_LETTERS[cIdx]}{rIdx + 1}
                        </span>

                        {/* Player Unit Representation */}
                        {isPlayerHere && (
                          <div className="flex flex-col items-center justify-center">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center animate-pulse">
                                <Crosshair 
                                  className={`w-5 h-5 text-cyan-300 transition-transform ${
                                    playerFacing === 'right' ? 'rotate-0' : playerFacing === 'down' ? 'rotate-90' : playerFacing === 'left' ? 'rotate-180' : '-rotate-90'
                                  }`} 
                                />
                              </div>
                              {/* Shield Bubble indicator */}
                              {playerShields > 0 && (
                                <div className="absolute -inset-1 rounded-full border border-cyan-300/40 pointer-events-none" />
                              )}
                            </div>
                            <span className="text-[9px] font-bold font-mono text-cyan-300 mt-0.5 leading-none">
                              {playerShip.name.split(' ')[0]}
                            </span>
                            <div className="w-9 h-1 bg-slate-900 rounded-full mt-0.5 overflow-hidden flex">
                              <div className="h-full bg-cyan-400" style={{ width: `${(playerShields / playerShip.maxShields) * 100}%` }} />
                            </div>
                          </div>
                        )}

                        {/* Enemy Unit Representation */}
                        {enemyOnCell && !isPlayerHere && (
                          <div className="flex flex-col items-center justify-center">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-400 flex items-center justify-center">
                                <AlertOctagon className="w-5 h-5 text-rose-400" />
                              </div>
                              {enemyOnCell.shields > 0 && (
                                <div className="absolute -inset-1 rounded-full border border-amber-400/50 pointer-events-none" />
                              )}
                            </div>
                            <span className="text-[9px] font-bold font-mono text-rose-300 mt-0.5 leading-none truncate max-w-[60px]">
                              {enemyOnCell.name.split(' ')[0]}
                            </span>
                            {/* Enemy Mini Health/Shield Bar */}
                            <div className="w-9 h-1 bg-slate-900 rounded-full mt-0.5 overflow-hidden flex">
                              <div className="h-full bg-rose-500" style={{ width: `${(enemyOnCell.hull / enemyOnCell.maxHull) * 100}%` }} />
                            </div>
                          </div>
                        )}

                        {/* Obstacles & Interactive Items on Ground */}
                        {!isPlayerHere && !enemyOnCell && (
                          <>
                            {asteroid && (
                              <div className="flex flex-col items-center justify-center text-slate-400">
                                <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shadow-inner">
                                  <span className="text-[10px] font-mono">🪨</span>
                                </div>
                                <span className="text-[8px] text-slate-500 font-mono mt-0.5">Укрытие</span>
                              </div>
                            )}

                            {crate && (
                              <div className="flex flex-col items-center justify-center text-amber-400 animate-pulse">
                                <Package className="w-5 h-5 text-amber-300" />
                                <span className="text-[8px] text-amber-300 font-mono">Груз</span>
                              </div>
                            )}

                            {nanoRepair && (
                              <div className="flex flex-col items-center justify-center text-emerald-400 animate-pulse">
                                <HeartPulse className="w-5 h-5 text-emerald-400" />
                                <span className="text-[8px] text-emerald-400 font-mono">Ремонт</span>
                              </div>
                            )}

                            {barrel && (
                              <div className="flex flex-col items-center justify-center text-rose-400">
                                <FlameKindling className="w-5 h-5 text-rose-400 animate-pulse" />
                                <span className="text-[8px] text-rose-400 font-mono">Плазма</span>
                              </div>
                            )}

                            {mine && (
                              <div className="flex flex-col items-center justify-center text-amber-500 animate-ping">
                                <Bomb className="w-4 h-4 text-amber-400" />
                              </div>
                            )}

                            {/* Reachable Cell Walking Guide Pip */}
                            {reachable && !asteroid && !crate && !nanoRepair && !barrel && !mine && (
                              <div className="w-2 h-2 rounded-full bg-cyan-400/50 group-hover:scale-125 transition-transform" />
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            {/* Victory / Defeat Overlay */}
            {combatFinished && (
              <div className="absolute inset-0 bg-[#04060C]/95 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 text-center overflow-hidden">
                {/* Background battle art for dramatic climax */}
                <div className="absolute inset-0 pointer-events-none opacity-25">
                  <img
                    src="/src/assets/images/space_combat_epic_1790243941884.jpg"
                    alt="Итоги космического боя"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04060C] via-[#04060C]/70 to-[#04060C]" />
                </div>

                <div className="relative z-10 flex flex-col items-center max-w-2xl w-full max-h-[85vh] overflow-y-auto px-2">
                  {combatFinished === 'victory' ? (
                    <>
                      <Award className="w-14 h-14 text-amber-400 mb-1 animate-bounce" />
                    <div className="flex items-center gap-1.5 mb-1 text-amber-400">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold font-heading text-emerald-400">
                      УРОВЕНЬ {currentLevelNumber} ИЗ 40 ПРОЙДЕН!
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-md text-center">
                      {currentLevelNumber === 40 ? (
                        <span className="text-amber-300 font-bold">
                          ЛЕГЕНДАРНЫЙ ТРИУМФ! Вы уничтожили Омега-Ядро Левиафана и прошли все 40 уровней кампании!
                        </span>
                      ) : (
                        `Сектор зачищен от флота противника. Опыт командира начислен, трофеи перемещены в грузовой трюм!`
                      )}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-mono text-cyan-300 my-2.5 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <span className="text-amber-400 font-bold">+{totalVictoryRewards.credits} ⬡ Кредитов</span>
                      <span className="text-cyan-300">+{totalVictoryRewards.alloys} Сплавов</span>
                      {totalVictoryRewards.science > 0 && <span className="text-purple-300">+{totalVictoryRewards.science} Науки</span>}
                      {totalVictoryRewards.antimatter > 0 && <span className="text-rose-400">+{totalVictoryRewards.antimatter} Антиматерии</span>}
                      <span className="text-emerald-400 font-bold border-l border-slate-700 pl-2">
                        +{currentMission?.xpReward || (100 + currentLevelNumber * 25)} XP
                      </span>
                    </div>

                    {/* Tactical Combat Aftermath Log Component (Last 5 actions & target statuses) */}
                    <div className="w-full my-2">
                      <CombatAftermathLog
                        logs={combatLogs}
                        combatOutcome="victory"
                        enemiesSummary={enemies.map(e => ({
                          id: e.id,
                          name: e.name,
                          hull: e.hull,
                          maxHull: e.maxHull,
                          shields: e.shields,
                          maxShields: e.maxShields
                        }))}
                        playerSummary={{
                          name: playerShip.name,
                          hull: playerShip.hull,
                          maxHull: playerShip.maxHull,
                          shields: playerShields,
                          maxShields: playerShip.maxShields
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2 mb-2">
                      {currentLevelNumber < 40 && (
                        <button
                          onClick={() => {
                            const nextMission = CAMPAIGN_LEVELS.find(l => (l.levelNumber ?? 1) === currentLevelNumber + 1);
                            if (nextMission) {
                              onCombatVictory(totalVictoryRewards);
                              loadMission(nextMission);
                            }
                          }}
                          className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg text-xs sm:text-sm transition-all shadow-lg shadow-cyan-950/40 flex items-center gap-2"
                        >
                          <span>Следующий уровень (Ур. {currentLevelNumber + 1} / 40)</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onCombatVictory(totalVictoryRewards);
                          setIsLevelSelectorOpen(true);
                        }}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Layers className="w-4 h-4 text-purple-400" />
                        <span>Выбрать из 40 уровней</span>
                      </button>

                      {brigHasSpace && onArrestPirate && (
                        <button
                          onClick={() => {
                            sounds.playScanPing();
                            onArrestPirate();
                          }}
                          className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md shadow-amber-950 flex items-center gap-1.5"
                          title="Поместить выжившего главаря корсаров в карцер корабля"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>Арестовать главаря в карцер</span>
                        </button>
                      )}

                      <button
                        onClick={() => onCombatVictory(totalVictoryRewards)}
                        className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold rounded-lg text-xs transition-colors"
                      >
                        Вернуться на Карту
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertOctagon className="w-16 h-16 text-rose-500 mb-2 animate-pulse" />
                    <h2 className="text-2xl font-bold font-heading text-rose-500">
                      КОРАБЛЬ РАЗБИТ!
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-md text-center">
                      Системы жизнеобеспечения катапультировали экипаж. Аварийный маяк активирован.
                    </p>

                    {/* Tactical Combat Aftermath Log Component (Last 5 actions & target statuses) */}
                    <div className="w-full my-2.5">
                      <CombatAftermathLog
                        logs={combatLogs}
                        combatOutcome="defeat"
                        enemiesSummary={enemies.map(e => ({
                          id: e.id,
                          name: e.name,
                          hull: e.hull,
                          maxHull: e.maxHull,
                          shields: e.shields,
                          maxShields: e.maxShields
                        }))}
                        playerSummary={{
                          name: playerShip.name,
                          hull: 0,
                          maxHull: playerShip.maxHull,
                          shields: 0,
                          maxShields: playerShip.maxShields
                        }}
                      />
                    </div>

                    <button
                      onClick={onCombatDefeat}
                      className="mt-2 mb-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-sm transition-all shadow-lg shadow-rose-950/40"
                    >
                      Активировать Страховой Протокол
                    </button>
                  </>
                )}
                </div>
              </div>
            )}
          </div>

          {/* Action Command Bar & Walk Hotkeys Bar */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
            
            {/* Tactical Weapon / Skill Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              <button
                disabled={actionPoints < 1 || isEnemyTurn || !!combatFinished}
                onClick={() => executeCombatAction('laser')}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-300 text-cyan-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Импульсный Лазер (1 AP)</span>
              </button>

              <button
                disabled={actionPoints < 1 || isEnemyTurn || !!combatFinished}
                onClick={() => executeCombatAction('torpedo')}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-rose-500/40 hover:border-rose-300 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <Flame className="w-4 h-4 text-rose-400" />
                <span>Торпеда (1 AP)</span>
              </button>

              <button
                disabled={actionPoints < 1 || isEnemyTurn || !!combatFinished}
                onClick={() => executeCombatAction('emp')}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-purple-500/40 hover:border-purple-300 text-purple-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <Radio className="w-4 h-4 text-purple-400" />
                <span>ЭМИ-Удар (1 AP)</span>
              </button>

              <button
                disabled={actionPoints < 1 || isEnemyTurn || !!combatFinished}
                onClick={() => executeCombatAction('railgun')}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-sky-400/50 hover:border-sky-300 text-sky-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <Crosshair className="w-4 h-4 text-sky-400" />
                <span>Рельсотрон (1 AP)</span>
              </button>

              <button
                disabled={actionPoints < 1 || isEnemyTurn || !!combatFinished}
                onClick={() => executeCombatAction('tachyon')}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-emerald-500/50 hover:border-emerald-300 text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Тахионный Луч (1 AP)</span>
              </button>

              <button
                disabled={actionPoints < 1 || isEnemyTurn || !!combatFinished}
                onClick={() => executeCombatAction('cluster')}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-orange-500/50 hover:border-orange-300 text-orange-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>Кассетный Залп (1 AP)</span>
              </button>

              <button
                disabled={actionPoints < 1 || isEnemyTurn || !!combatFinished || ((resources.nukes ?? 0) <= 0 && (!resources.antimatter || resources.antimatter <= 0))}
                onClick={() => executeCombatAction('nuke')}
                title="Термоядерный сокрушительный удар! Наносит колоссальный урон цели и ударную волну по соседним кораблям."
                className="px-3 py-2 bg-gradient-to-r from-amber-950/80 to-rose-950/80 hover:from-amber-900/90 hover:to-rose-900/90 border border-amber-500/70 hover:border-amber-400 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-950 disabled:opacity-40 animate-pulse"
              >
                <span className="text-base leading-none">☢</span>
                <span>ЯДЕРКА ({resources.nukes ?? 0})</span>
              </button>

              <button
                disabled={actionPoints < 1 || isEnemyTurn || !!combatFinished}
                onClick={() => executeCombatAction('mine')}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-300 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <Bomb className="w-4 h-4 text-amber-400" />
                <span>Сброс Мины (1 AP)</span>
              </button>

              <button
                disabled={actionPoints < 1 || isEnemyTurn || !!combatFinished}
                onClick={() => executeCombatAction('overdrive')}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-sky-500/40 hover:border-sky-300 text-sky-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <Footprints className="w-4 h-4 text-sky-400" />
                <span>Форсаж (+3 MP)</span>
              </button>

              <button
                disabled={actionPoints < 1 || isEnemyTurn || !!combatFinished}
                onClick={() => executeCombatAction('repair')}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-300 text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Нано-ремонт (1 AP)</span>
              </button>
            </div>

            {/* Flee Combat */}
            <button
              disabled={isEnemyTurn || !!combatFinished}
              onClick={handleFlee}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span>Экстренный Варп</span>
            </button>
          </div>

          {/* Mobile Quick Action & Step Controls (Thumb-friendly for smartphone play) */}
          <div className="lg:hidden w-full bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 mt-2 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={cycleTargetEnemy}
                className="flex-1 py-1.5 px-2.5 bg-slate-900 border border-rose-500/40 rounded-lg text-xs font-mono text-slate-200 flex items-center justify-between hover:bg-slate-850"
                title="Нажмите для переключения цели"
              >
                <span className="text-slate-400">Цель:</span>
                <span className="text-rose-400 font-bold truncate mx-1">{activeTargetEnemy?.name || 'Нет цели'}</span>
                <span className="text-[10px] text-cyan-400 shrink-0">🎯 След.</span>
              </button>

              {/* Mobile D-Pad mini buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  disabled={movementPoints < 1 || isEnemyTurn || !!combatFinished}
                  onClick={() => stepDirection(-1, 0)}
                  className="w-8 h-8 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center disabled:opacity-30 active:bg-cyan-500/20"
                >
                  ◀
                </button>
                <div className="flex flex-col gap-1">
                  <button
                    disabled={movementPoints < 1 || isEnemyTurn || !!combatFinished}
                    onClick={() => stepDirection(0, -1)}
                    className="w-8 h-8 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center disabled:opacity-30 active:bg-cyan-500/20"
                  >
                    ▲
                  </button>
                  <button
                    disabled={movementPoints < 1 || isEnemyTurn || !!combatFinished}
                    onClick={() => stepDirection(0, 1)}
                    className="w-8 h-8 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center disabled:opacity-30 active:bg-cyan-500/20"
                  >
                    ▼
                  </button>
                </div>
                <button
                  disabled={movementPoints < 1 || isEnemyTurn || !!combatFinished}
                  onClick={() => stepDirection(1, 0)}
                  className="w-8 h-8 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center disabled:opacity-30 active:bg-cyan-500/20"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Mobile Quick Action Buttons */}
            <div className="grid grid-cols-5 gap-1 pt-1 border-t border-slate-800/80">
              <button
                disabled={actionPoints < 1 || isEnemyTurn || !!combatFinished}
                onClick={() => executeCombatAction('laser')}
                className="py-2 bg-slate-900 hover:bg-slate-800 border border-cyan-500/50 text-cyan-300 rounded-lg text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 disabled:opacity-30"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Лазер</span>
              </button>
              <button
                disabled={actionPoints < 1 || isEnemyTurn || !!combatFinished}
                onClick={() => executeCombatAction('torpedo')}
                className="py-2 bg-slate-900 hover:bg-slate-800 border border-rose-500/50 text-rose-300 rounded-lg text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 disabled:opacity-30"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Торпеда</span>
              </button>
              <button
                disabled={actionPoints < 1 || isEnemyTurn || !!combatFinished}
                onClick={() => executeCombatAction('railgun')}
                className="py-2 bg-slate-900 hover:bg-slate-800 border border-sky-400/50 text-sky-300 rounded-lg text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 disabled:opacity-30"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Рельс</span>
              </button>
              <button
                disabled={actionPoints < 1 || isEnemyTurn || !!combatFinished || ((resources.nukes ?? 0) <= 0 && (!resources.antimatter || resources.antimatter <= 0))}
                onClick={() => executeCombatAction('nuke')}
                className="py-2 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/70 text-amber-300 rounded-lg text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 disabled:opacity-30 animate-pulse"
                title="Термоядерный удар (Ядерка)"
              >
                <span className="text-xs leading-none">☢</span>
                <span>Ядерка ({resources.nukes ?? 0})</span>
              </button>
              <button
                disabled={isEnemyTurn || !!combatFinished}
                onClick={handleEndTurn}
                className="py-2 bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/60 text-emerald-300 rounded-lg text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 disabled:opacity-30"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ход</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Tactical Info, Selected Enemy & Walking D-Pad */}
        <div className="lg:col-span-4 flex flex-col gap-3 min-h-0 overflow-y-auto">
          
          {/* Target Enemy & Tactical Flanking Radar */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block pb-1 border-b border-slate-800 flex items-center justify-between">
              <span>Целеуказание:</span>
              {activeTargetEnemy && (
                <span className="text-rose-400 font-bold">{activeTargetEnemy.name}</span>
              )}
            </span>

            {activeTargetEnemy ? (
              <div className="space-y-2 text-xs font-mono">
                {/* Hull Bar */}
                <div>
                  <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                    <span>КОРПУС ВРАГА</span>
                    <span className="text-rose-400 font-bold">{activeTargetEnemy.hull} / {activeTargetEnemy.maxHull}</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 transition-all duration-300" 
                      style={{ width: `${(activeTargetEnemy.hull / activeTargetEnemy.maxHull) * 100}%` }} 
                    />
                  </div>
                </div>

                {/* Shield Bar */}
                <div>
                  <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                    <span>ЩИТЫ ВРАГА</span>
                    <span className="text-amber-400 font-bold">{activeTargetEnemy.shields} / {activeTargetEnemy.maxShields}</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 transition-all duration-300" 
                      style={{ width: `${(activeTargetEnemy.shields / activeTargetEnemy.maxShields) * 100}%` }} 
                    />
                  </div>
                </div>

                {/* Tactical Advantage Indicators */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">ДИСТАНЦИЯ:</span>
                    <span className="text-slate-200 font-bold">
                      {getDistance(playerPos.x, playerPos.y, activeTargetEnemy.gridX, activeTargetEnemy.gridY)} клеток
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">ПОЗИЦИЯ:</span>
                    {isFlanking(playerPos.x, playerPos.y, activeTargetEnemy.gridX, activeTargetEnemy.gridY) ? (
                      <span className="text-emerald-400 font-bold">ФЛАНГ (+35% УРОНА)</span>
                    ) : (
                      <span className="text-slate-400">ФРОНТ (0%)</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-mono py-2 text-center">
                Все цели на поле боя нейтрализованы.
              </p>
            )}

            {/* Virtual Walking D-Pad for manual single-step movement */}
            <div className="pt-2 border-t border-slate-800 flex flex-col items-center">
              <span className="text-[10px] font-mono text-slate-500 mb-1.5 flex items-center gap-1">
                <Footprints className="w-3 h-3 text-cyan-400" />
                ШАГОВЫЙ КОНТРОЛЛЕР ХОДЬБЫ (W, A, S, D):
              </span>
              <div className="grid grid-cols-3 gap-1 w-32">
                <div />
                <button
                  disabled={movementPoints < 1 || isEnemyTurn || !!combatFinished}
                  onClick={() => stepDirection(0, -1)}
                  className="p-2 bg-slate-900 hover:bg-cyan-500/20 text-cyan-300 rounded border border-slate-700 flex items-center justify-center disabled:opacity-30"
                  title="Шаг вверх (W)"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <div />
                <button
                  disabled={movementPoints < 1 || isEnemyTurn || !!combatFinished}
                  onClick={() => stepDirection(-1, 0)}
                  className="p-2 bg-slate-900 hover:bg-cyan-500/20 text-cyan-300 rounded border border-slate-700 flex items-center justify-center disabled:opacity-30"
                  title="Шаг влево (A)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={movementPoints < 1 || isEnemyTurn || !!combatFinished}
                  onClick={() => stepDirection(0, 1)}
                  className="p-2 bg-slate-900 hover:bg-cyan-500/20 text-cyan-300 rounded border border-slate-700 flex items-center justify-center disabled:opacity-30"
                  title="Шаг вниз (S)"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  disabled={movementPoints < 1 || isEnemyTurn || !!combatFinished}
                  onClick={() => stepDirection(1, 0)}
                  className="p-2 bg-slate-900 hover:bg-cyan-500/20 text-cyan-300 rounded border border-slate-700 flex items-center justify-center disabled:opacity-30"
                  title="Шаг вправо (D)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Combat Log */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 flex-1 flex flex-col min-h-[160px] overflow-hidden">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block pb-1 border-b border-slate-800">
              Журнал Тактического Боя:
            </span>

            <div className="flex-1 overflow-y-auto space-y-1.5 py-2 pr-1 text-xs font-mono">
              {combatLogs.map(log => (
                <div
                  key={log.id}
                  className={`p-2 rounded border text-[11px] leading-relaxed ${
                    log.type === 'player_attack'
                      ? 'bg-cyan-950/20 border-cyan-800/40 text-cyan-200'
                      : log.type === 'enemy_attack'
                      ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                      : log.type === 'victory'
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-slate-500 mr-1.5">[{log.timestamp}]</span>
                  {log.text}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex justify-between">
              <span>СТАТУС: {isEnemyTurn ? 'ХОД ПРОТИВНИКА' : 'ВАШ ХОД'}</span>
              <span>ТАКТИЧЕСКИЙ РЕЖИМ 2.0</span>
            </div>
          </div>

        </div>
      </div>

      {/* 40-Level Campaign Selector Modal */}
      <CampaignLevelSelector
        levels={CAMPAIGN_LEVELS}
        currentLevelNumber={currentLevelNumber}
        completedLevels={completedCampaignLevels}
        isOpen={isLevelSelectorOpen}
        onClose={() => setIsLevelSelectorOpen(false)}
        onSelectLevel={(lvl) => loadMission(lvl)}
      />
    </div>
  );
};
