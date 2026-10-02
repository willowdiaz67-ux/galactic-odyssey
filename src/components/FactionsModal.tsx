import React, { useState, useEffect } from 'react';
import { Faction, FactionId, Resources, DiplomaticMission, DiplomaticPact, DiplomaticLogEntry, FactionWar } from '../types/game';
import { 
  DIPLOMATIC_MISSIONS, 
  INITIAL_DIPLOMATIC_PACTS, 
  getReputationStatus 
} from '../data/diplomacyData';
import { INITIAL_FACTION_WARS, getWarStatusBadge } from '../data/factionWarsData';
import { sounds } from '../services/soundEffects';
import { 
  X, 
  Shield, 
  Award, 
  Users2, 
  Send, 
  Scroll, 
  Scale, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Zap, 
  Coins, 
  Flame, 
  Handshake, 
  Radio, 
  Eye, 
  Skull, 
  History, 
  Lock, 
  Unlock,
  ChevronRight,
  Info,
  Swords,
  Bomb,
  Crosshair
} from 'lucide-react';

export interface FactionsModalProps {
  factions: Record<string, Faction>;
  resources: Resources;
  stardate?: number;
  onClose: () => void;
  onUpdateFactions: (factions: Record<string, Faction>) => void;
  onUpdateResources: (resources: Resources | ((prev: Resources) => Resources)) => void;
  onShowToast?: (message: string) => void;
}

export const FactionsModal: React.FC<FactionsModalProps> = ({
  factions,
  resources,
  stardate = 2184.2,
  onClose,
  onUpdateFactions,
  onUpdateResources,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'missions' | 'pacts' | 'wars' | 'history'>('overview');
  const [selectedFactionId, setSelectedFactionId] = useState<FactionId>('terran');
  const [missionFilter, setMissionFilter] = useState<'all' | 'improve' | 'worsen' | 'covert'>('all');

  // Faction Wars state
  const [factionWars, setFactionWars] = useState<FactionWar[]>(() => {
    try {
      const saved = localStorage.getItem('astraea_faction_wars_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_FACTION_WARS;
  });

  const [nukeStrikeResult, setNukeStrikeResult] = useState<{
    warName: string;
    targetName: string;
    allyName: string;
    bountyCredits: number;
    newControl: number;
  } | null>(null);
  
  // Diplomatic Pacts state persisted in localStorage
  const [pacts, setPacts] = useState<DiplomaticPact[]>(() => {
    try {
      const saved = localStorage.getItem('astraea_diplomatic_pacts_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DIPLOMATIC_PACTS;
  });

  // Diplomatic Log history
  const [diplomaticLog, setDiplomaticLog] = useState<DiplomaticLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('astraea_diplomatic_log_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'init_log_1',
        stardate: 2184.1,
        factionId: 'terran',
        factionName: 'Объединённая Федерация Земли',
        missionTitle: 'Ратификация исследовательского мандата',
        intent: 'improve',
        reputationDelta: 25,
        resultingReputation: 25,
        summary: 'ОФЗ выдала официальное разрешение экспедиционному судну Astraea на навигацию в секторе.',
        timestamp: Date.now() - 3600000
      }
    ];
  });

  // Recent transmission receipt modal state
  const [activeTransmission, setActiveTransmission] = useState<{
    mission: DiplomaticMission;
    faction: Faction;
    effectiveDelta: number;
    responseMessage: string;
    rivalEffect?: { factionName: string; delta: number };
  } | null>(null);

  // Sync pacts and log changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('astraea_diplomatic_pacts_v1', JSON.stringify(pacts));
    } catch {}
  }, [pacts]);

  useEffect(() => {
    try {
      localStorage.setItem('astraea_diplomatic_log_v1', JSON.stringify(diplomaticLog));
    } catch {}
  }, [diplomaticLog]);

  const targetFaction = factions[selectedFactionId] || Object.values(factions)[0];

  // Check if player can afford mission costs
  const canAfford = (cost: Partial<Resources>): boolean => {
    if (cost.credits && resources.credits < cost.credits) return false;
    if (cost.fuel && resources.fuel < cost.fuel) return false;
    if (cost.alloys && resources.alloys < cost.alloys) return false;
    if (cost.science && resources.science < cost.science) return false;
    if (cost.antimatter && resources.antimatter < cost.antimatter) return false;
    if (cost.food && resources.food < cost.food) return false;
    if (cost.colonists && resources.colonists < cost.colonists) return false;
    return true;
  };

  // Execute Diplomatic Mission
  const handleDispatchMission = (mission: DiplomaticMission) => {
    if (!canAfford(mission.cost)) {
      sounds.playAlert();
      onShowToast?.('Недостаточно ресурсов для снаряжения этой дипломатической миссии!');
      return;
    }

    // Calculate effective reputation change
    let effectiveDelta = mission.reputationDelta;
    if (mission.bonusForFaction && mission.bonusForFaction.factionId === selectedFactionId) {
      effectiveDelta += mission.bonusForFaction.extraReputation;
    }

    // Deduct resources & add rewards
    onUpdateResources(prev => {
      return {
        ...prev,
        credits: Math.max(0, prev.credits - (mission.cost.credits || 0) + (mission.resourceReward?.credits || 0)),
        fuel: Math.max(0, prev.fuel - (mission.cost.fuel || 0) + (mission.resourceReward?.fuel || 0)),
        alloys: Math.max(0, prev.alloys - (mission.cost.alloys || 0) + (mission.resourceReward?.alloys || 0)),
        science: Math.max(0, prev.science - (mission.cost.science || 0) + (mission.resourceReward?.science || 0)),
        antimatter: Math.max(0, prev.antimatter - (mission.cost.antimatter || 0) + (mission.resourceReward?.antimatter || 0)),
        food: Math.max(0, prev.food - (mission.cost.food || 0) + (mission.resourceReward?.food || 0)),
        colonists: Math.max(0, prev.colonists - (mission.cost.colonists || 0) + (mission.resourceReward?.colonists || 0))
      };
    });

    // Update target faction and ripple effect on rival faction
    const updatedFactions = { ...factions };
    const curTarget = updatedFactions[selectedFactionId];
    if (curTarget) {
      const newRep = Math.max(-100, Math.min(100, curTarget.reputation + effectiveDelta));
      updatedFactions[selectedFactionId] = {
        ...curTarget,
        reputation: newRep
      };
    }

    let rivalEffectInfo: { factionName: string; delta: number } | undefined = undefined;
    if (mission.rivalReputationChange) {
      const rivalId = mission.rivalReputationChange.rivalFactionId;
      const rivalFac = updatedFactions[rivalId];
      if (rivalFac && rivalId !== selectedFactionId) {
        const rivalNewRep = Math.max(-100, Math.min(100, rivalFac.reputation + mission.rivalReputationChange.delta));
        updatedFactions[rivalId] = {
          ...rivalFac,
          reputation: rivalNewRep
        };
        rivalEffectInfo = {
          factionName: rivalFac.name,
          delta: mission.rivalReputationChange.delta
        };
      }
    }

    onUpdateFactions(updatedFactions);

    // Create log message response
    let responseText = '';
    if (effectiveDelta > 0) {
      sounds.playCreditsChime();
      responseText = `Посольский совет ${targetFaction.name} выразил официальную признательность за предпринятые шаги. Отношения улучшены на +${effectiveDelta} пунктов!`;
    } else {
      sounds.playAlert();
      responseText = `Верховный комиссариат ${targetFaction.name} выразил глубокое возмущение вашими действиями. Отношения упали на ${effectiveDelta} пунктов!`;
    }

    // Append to log
    const newLogEntry: DiplomaticLogEntry = {
      id: `log_${Date.now()}`,
      stardate: Number(stardate.toFixed(1)),
      factionId: selectedFactionId,
      factionName: targetFaction.name,
      missionTitle: mission.title,
      intent: mission.intent,
      reputationDelta: effectiveDelta,
      resultingReputation: updatedFactions[selectedFactionId]?.reputation ?? 0,
      summary: responseText,
      timestamp: Date.now()
    };
    setDiplomaticLog(prev => [newLogEntry, ...prev].slice(0, 30));

    // Show transmission dispatch receipt
    setActiveTransmission({
      mission,
      faction: targetFaction,
      effectiveDelta,
      responseMessage: responseText,
      rivalEffect: rivalEffectInfo
    });

    onShowToast?.(`Миссия «${mission.title}» исполнена! Репутация с ${targetFaction.shortName}: ${effectiveDelta > 0 ? `+${effectiveDelta}` : effectiveDelta}.`);
  };

  // Sign or Revoke Diplomatic Pact
  const handleTogglePact = (pact: DiplomaticPact) => {
    const faction = factions[pact.factionId];
    if (!faction) return;

    if (pact.active) {
      // Revoke pact
      sounds.playAlert();
      const penalty = -25;
      const updatedFactions = {
        ...factions,
        [pact.factionId]: {
          ...faction,
          reputation: Math.max(-100, Math.min(100, faction.reputation + penalty))
        }
      };
      onUpdateFactions(updatedFactions);

      setPacts(prev => prev.map(p => p.id === pact.id ? { ...p, active: false, signedStardate: undefined } : p));

      const newLogEntry: DiplomaticLogEntry = {
        id: `log_revoke_${Date.now()}`,
        stardate: Number(stardate.toFixed(1)),
        factionId: pact.factionId,
        factionName: faction.name,
        missionTitle: `Односторонний разрыв: «${pact.title}»`,
        intent: 'revoke',
        reputationDelta: penalty,
        resultingReputation: updatedFactions[pact.factionId].reputation,
        summary: `Вы денонсировали соглашение. Фракция восприняла разрыв как предательство доверия (${penalty} репутации).`,
        timestamp: Date.now()
      };
      setDiplomaticLog(prev => [newLogEntry, ...prev].slice(0, 30));
      onShowToast?.(`Пакт «${pact.title}» расторгнут! Репутация с ${faction.shortName} упала на ${penalty}.`);
      return;
    }

    // Sign pact
    if (faction.reputation < pact.minReputation) {
      sounds.playAlert();
      onShowToast?.(`Требуется уровень репутации не ниже +${pact.minReputation} (текущий: ${faction.reputation})!`);
      return;
    }

    if (!canAfford(pact.cost)) {
      sounds.playAlert();
      onShowToast?.('Недостаточно ресурсов для подписания соглашения!');
      return;
    }

    // Deduct cost
    onUpdateResources(prev => ({
      ...prev,
      credits: Math.max(0, prev.credits - (pact.cost.credits || 0)),
      fuel: Math.max(0, prev.fuel - (pact.cost.fuel || 0)),
      alloys: Math.max(0, prev.alloys - (pact.cost.alloys || 0)),
      science: Math.max(0, prev.science - (pact.cost.science || 0)),
      antimatter: Math.max(0, prev.antimatter - (pact.cost.antimatter || 0)),
      food: Math.max(0, prev.food - (pact.cost.food || 0))
    }));

    sounds.playVictoryFanfare();
    setPacts(prev => prev.map(p => p.id === pact.id ? { ...p, active: true, signedStardate: Number(stardate.toFixed(1)) } : p));

    const newLogEntry: DiplomaticLogEntry = {
      id: `log_sign_${Date.now()}`,
      stardate: Number(stardate.toFixed(1)),
      factionId: pact.factionId,
      factionName: faction.name,
      missionTitle: `Подписание: «${pact.title}»`,
      intent: 'treaty',
      reputationDelta: 5,
      resultingReputation: faction.reputation + 5,
      summary: `Официальный пакт ратифицирован обеими сторонами. Вступили в силу особые привилегии!`,
      timestamp: Date.now()
    };
    setDiplomaticLog(prev => [newLogEntry, ...prev].slice(0, 30));

    // Small bonus reputation for signing treaty
    onUpdateFactions({
      ...factions,
      [pact.factionId]: {
        ...faction,
        reputation: Math.min(100, faction.reputation + 5)
      }
    });

    onShowToast?.(`Пакт «${pact.title}» успешно ратифицирован! Привилегии активированы.`);
  };

  // War Handlers
  const handleLaunchNukeAtWar = (war: FactionWar, supportedFactionId: FactionId) => {
    if ((resources.nukes ?? 0) < 1) {
      sounds.playAlert();
      onShowToast?.('У вас нет термоядерных боеголовок! Произведите или купите ядерку.');
      return;
    }

    const enemyFactionId = supportedFactionId === war.attackerFaction ? war.defenderFaction : war.attackerFaction;
    const allyName = factions[supportedFactionId]?.name || supportedFactionId;
    const enemyName = factions[enemyFactionId]?.name || enemyFactionId;

    // Deduct 1 nuke & grant war bounty
    sounds.playExplosion();
    onUpdateResources(prev => ({
      ...prev,
      nukes: Math.max(0, (prev.nukes ?? 0) - 1),
      credits: prev.credits + 600,
      alloys: prev.alloys + 40
    }));

    // Shift frontline
    const shiftDelta = supportedFactionId === war.attackerFaction ? 22 : -22;
    let newControl = 50;
    setFactionWars(prev => prev.map(w => {
      if (w.id !== war.id) return w;
      newControl = Math.max(5, Math.min(95, w.frontlineControl + shiftDelta));
      return { ...w, frontlineControl: newControl };
    }));

    // Update reputations
    const curAllyRep = factions[supportedFactionId]?.reputation ?? 0;
    const curEnemyRep = factions[enemyFactionId]?.reputation ?? 0;
    onUpdateFactions({
      ...factions,
      [supportedFactionId]: {
        ...factions[supportedFactionId],
        reputation: Math.min(100, curAllyRep + 35)
      },
      [enemyFactionId]: {
        ...factions[enemyFactionId],
        reputation: Math.max(-100, curEnemyRep - 40)
      }
    });

    // Diplomatic log
    const newLogEntry: DiplomaticLogEntry = {
      id: `log_war_nuke_${Date.now()}`,
      stardate: Number(stardate.toFixed(1)),
      factionId: supportedFactionId,
      factionName: allyName,
      missionTitle: `☢ Термоядерный Удар на фронте «${war.name}»`,
      intent: 'worsen',
      reputationDelta: 35,
      resultingReputation: Math.min(100, curAllyRep + 35),
      summary: `Вы нанесли стратегический ядерный удар по армаде ${enemyName}! Фронт сдвинут на 22% в пользу ${allyName}. Награда: +600 ⬡ и +40 сплавов.`,
      timestamp: Date.now()
    };
    setDiplomaticLog(prev => [newLogEntry, ...prev].slice(0, 30));

    setNukeStrikeResult({
      warName: war.name,
      targetName: enemyName,
      allyName,
      bountyCredits: 600,
      newControl
    });

    onShowToast?.(`☢ ЯДЕРНЫЙ УДАР НАНЕСЁН! Фронт сдвинут в пользу ${factions[supportedFactionId]?.shortName}!`);
  };

  const handleCraftNuke = () => {
    const costCredits = 450;
    const costAlloys = 25;
    if (resources.credits < costCredits || resources.alloys < costAlloys) {
      sounds.playAlert();
      onShowToast?.('Недостаточно ресурсов для производства ядерки (требуется 450 ⬡ и 25 сплавов)!');
      return;
    }
    sounds.playCreditsChime();
    onUpdateResources(prev => ({
      ...prev,
      credits: prev.credits - costCredits,
      alloys: prev.alloys - costAlloys,
      nukes: (prev.nukes ?? 0) + 1
    }));
    onShowToast?.('Термоядерная боеголовка «Царь-Звезда» собрана и загружена в пусковой отсек (+1 ЯДЕРКА)!');
  };

  const handleSendFleetSupport = (war: FactionWar, supportedFactionId: FactionId) => {
    if (resources.fuel < 20 || resources.alloys < 20) {
      sounds.playAlert();
      onShowToast?.('Недостаточно топлива и сплавов для отправки флота (требуется 20 топлива и 20 сплавов)!');
      return;
    }
    const enemyFactionId = supportedFactionId === war.attackerFaction ? war.defenderFaction : war.attackerFaction;
    sounds.playScanPing();
    onUpdateResources(prev => ({
      ...prev,
      fuel: prev.fuel - 20,
      alloys: prev.alloys - 20
    }));

    const shiftDelta = supportedFactionId === war.attackerFaction ? 10 : -10;
    setFactionWars(prev => prev.map(w => {
      if (w.id !== war.id) return w;
      return { ...w, frontlineControl: Math.max(5, Math.min(95, w.frontlineControl + shiftDelta)) };
    }));

    const curAllyRep = factions[supportedFactionId]?.reputation ?? 0;
    const curEnemyRep = factions[enemyFactionId]?.reputation ?? 0;
    onUpdateFactions({
      ...factions,
      [supportedFactionId]: {
        ...factions[supportedFactionId],
        reputation: Math.min(100, curAllyRep + 15)
      },
      [enemyFactionId]: {
        ...factions[enemyFactionId],
        reputation: Math.max(-100, curEnemyRep - 15)
      }
    });
    onShowToast?.(`Боевая эскадра направлена на фронт! Контроль рубежа вырос на 10%.`);
  };

  // Filtered missions
  const filteredMissions = DIPLOMATIC_MISSIONS.filter(m => {
    if (missionFilter === 'all') return true;
    return m.intent === missionFilter;
  });

  return (
    <div className="fixed inset-0 bg-[#030611]/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#0A0E1F] border border-cyan-950/80 rounded-xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[94vh] overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-sm shadow-purple-950">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-100">
                  Галактическая Дипломатия & Корпус Миссий
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                  ДАТА {stardate.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Управление внешнеполитическими связями, влияние на фракции и подписание пактов
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playStep();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
            title="Закрыть терминал дипломатии"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Treasury Strip */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg px-3 py-2 flex items-center justify-between text-xs font-mono overflow-x-auto gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 whitespace-nowrap">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Казна экспедиции:</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300 whitespace-nowrap">
            <span className="flex items-center gap-1 text-amber-300 font-bold">
              {resources.credits.toLocaleString()} ⬡
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-cyan-300">
              {resources.fuel} Топливо
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-slate-300">
              {resources.alloys} Сплавы
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-purple-300">
              {resources.science} Наука
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-emerald-300">
              {resources.food} Еда
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-sky-300">
              {resources.colonists} Людей
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1.5 text-amber-300 font-bold bg-amber-950/70 px-2 py-0.5 rounded border border-amber-600/70 shadow-sm animate-pulse">
              <span className="text-sm">☢</span>
              <span>{resources.nukes ?? 0} Ядерок</span>
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-800 pb-2 flex-wrap">
          <button
            onClick={() => {
              sounds.playScanPing();
              setActiveTab('overview');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-purple-950/60 text-purple-200 border border-purple-500/50 shadow-sm shadow-purple-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>Обзор Фракций</span>
          </button>

          <button
            onClick={() => {
              sounds.playScanPing();
              setActiveTab('missions');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
              activeTab === 'missions'
                ? 'bg-cyan-950/70 text-cyan-200 border border-cyan-500/50 shadow-sm shadow-cyan-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Дипломатические Миссии</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </button>

          <button
            onClick={() => {
              sounds.playScanPing();
              setActiveTab('pacts');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'pacts'
                ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-500/50 shadow-sm shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>Пакты & Договоры</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              {pacts.filter(p => p.active).length} акт.
            </span>
          </button>

          <button
            onClick={() => {
              sounds.playScanPing();
              setActiveTab('wars');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
              activeTab === 'wars'
                ? 'bg-rose-950/90 text-rose-200 border border-rose-500/80 shadow-md shadow-rose-950 animate-pulse'
                : 'text-rose-400 hover:text-rose-200 hover:bg-slate-900 border border-rose-950/60'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-rose-400" />
            <span>Войны Фракций (Фронт)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-900/80 text-rose-200 border border-rose-600">
              {factionWars.length} ВОЙНЫ
            </span>
          </button>

          <button
            onClick={() => {
              sounds.playScanPing();
              setActiveTab('history');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-slate-800 text-slate-200 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Архив Депеш ({diplomaticLog.length})</span>
          </button>
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {Object.values(factions).map((faction) => {
                const repPercent = Math.max(0, Math.min(100, (faction.reputation + 100) / 2));
                const repStatus = getReputationStatus(faction.reputation);
                const activePactsCount = pacts.filter(p => p.factionId === faction.id && p.active).length;

                return (
                  <div 
                    key={faction.id}
                    className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-3.5 h-3.5 rounded-full shadow-sm" 
                            style={{ backgroundColor: faction.color }} 
                          />
                          <h3 className="font-heading font-bold text-sm text-slate-100">
                            {faction.name}
                          </h3>
                        </div>
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${repStatus.badgeBg}`}>
                          {repStatus.label} ({faction.reputation > 0 ? `+${faction.reputation}` : faction.reputation})
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-2">
                        {faction.description}
                      </p>
                    </div>

                    {/* Gauge */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>Вражда (-100)</span>
                        <span className="text-slate-300">Репутация: {faction.reputation}</span>
                        <span>Союз (+100)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 relative">
                        {/* Center marker */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-700 z-10" />
                        <div 
                          className="h-full transition-all duration-300"
                          style={{ 
                            width: `${repPercent}%`,
                            backgroundColor: faction.reputation >= 0 ? faction.color : '#F43F5E' 
                          }}
                        />
                      </div>
                    </div>

                    {/* Active Perk */}
                    <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/90 text-xs font-mono flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-slate-400">Бонус отношений: </span>
                        <span className="text-emerald-300">{faction.perk}</span>
                      </div>
                    </div>

                    {/* Bottom action bar */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Scroll className="w-3 h-3 text-emerald-400" />
                        {activePactsCount > 0 ? `Действует пактов: ${activePactsCount}` : 'Нет подписанных пактов'}
                      </span>

                      <button
                        onClick={() => {
                          sounds.playScanPing();
                          setSelectedFactionId(faction.id);
                          setActiveTab('missions');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.2 rounded-lg text-xs font-medium text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/60 border border-cyan-500/40 transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        <span>Направить миссию</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: DIPLOMATIC MISSIONS */}
        {activeTab === 'missions' && (
          <div className="flex-1 flex flex-col gap-3 overflow-hidden">
            {/* Target Faction Selector Pills */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-mono">Целевая фракция:</span>
                <div className="flex items-center gap-1.5">
                  {Object.values(factions).map(fac => {
                    const isSelected = fac.id === selectedFactionId;
                    return (
                      <button
                        key={fac.id}
                        onClick={() => {
                          sounds.playScanPing();
                          setSelectedFactionId(fac.id);
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-slate-800 text-slate-100 border border-cyan-500 shadow-sm shadow-cyan-950 font-bold'
                            : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        <div 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: fac.color }} 
                        />
                        <span>{fac.shortName}</span>
                        <span className="text-[10px] font-mono text-cyan-400">
                          ({fac.reputation > 0 ? `+${fac.reputation}` : fac.reputation})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Intent Filter */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setMissionFilter('all')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    missionFilter === 'all' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => setMissionFilter('improve')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                    missionFilter === 'improve' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-emerald-400/80 hover:text-emerald-300'
                  }`}
                >
                  <TrendingUp className="w-3 h-3" />
                  Улучшение
                </button>
                <button
                  onClick={() => setMissionFilter('worsen')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                    missionFilter === 'worsen' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'text-rose-400/80 hover:text-rose-300'
                  }`}
                >
                  <TrendingDown className="w-3 h-3" />
                  Ухудшение
                </button>
                <button
                  onClick={() => setMissionFilter('covert')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                    missionFilter === 'covert' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'text-purple-400/80 hover:text-purple-300'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  Диверсии
                </button>
              </div>
            </div>

            {/* Target Faction Banner */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: targetFaction.color }} 
                />
                <span className="font-heading font-bold text-slate-100">{targetFaction.name}</span>
                <span className="text-slate-500 font-mono">— {targetFaction.shortName}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-400">Текущие отношения:</span>
                <span className="text-cyan-300 font-bold">
                  {targetFaction.reputation > 0 ? `+${targetFaction.reputation}` : targetFaction.reputation}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getReputationStatus(targetFaction.reputation).badgeBg}`}>
                  {getReputationStatus(targetFaction.reputation).label}
                </span>
              </div>
            </div>

            {/* Missions List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredMissions.map((mission) => {
                const affordable = canAfford(mission.cost);
                const hasAffinity = mission.bonusForFaction && mission.bonusForFaction.factionId === selectedFactionId;
                const effectiveRep = mission.reputationDelta + (hasAffinity ? mission.bonusForFaction!.extraReputation : 0);

                return (
                  <div
                    key={mission.id}
                    className={`bg-slate-900/60 border rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 transition-all ${
                      hasAffinity 
                        ? 'border-cyan-500/60 bg-cyan-950/20 shadow-sm shadow-cyan-950' 
                        : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          mission.intent === 'improve'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : mission.intent === 'worsen'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-purple-950 text-purple-300 border border-purple-800'
                        }`}>
                          {mission.intent === 'improve' ? 'Укрепление' : mission.intent === 'worsen' ? 'Давление / Вражда' : 'Тайная диверсия'}
                        </span>

                        <h4 className="font-heading font-bold text-sm text-slate-100">
                          {mission.title}
                        </h4>

                        {/* Reputation Delta Badge */}
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                          effectiveRep > 0
                            ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/60'
                            : 'bg-rose-900/40 text-rose-300 border border-rose-700/60'
                        }`}>
                          {effectiveRep > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {effectiveRep > 0 ? `+${effectiveRep}` : effectiveRep} репутации
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {mission.description}
                      </p>

                      {/* Affinity Bonus Box */}
                      {hasAffinity && (
                        <div className="bg-cyan-950/60 border border-cyan-500/40 rounded p-1.5 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{mission.bonusForFaction!.explanation}</span>
                        </div>
                      )}

                      {/* Resource Reward Box (e.g. Sabotage) */}
                      {mission.resourceReward && (
                        <div className="bg-purple-950/60 border border-purple-500/40 rounded p-1.5 text-[11px] font-mono text-purple-300 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>Трофеи операции: {mission.resourceReward.science ? `+${mission.resourceReward.science} Науки ` : ''}{mission.resourceReward.credits ? `+${mission.resourceReward.credits} ⬡` : ''}</span>
                        </div>
                      )}

                      {/* Ripple Effect Hint */}
                      {mission.rivalReputationChange && (
                        <div className="text-[11px] font-mono text-amber-400/90 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{mission.rivalReputationChange.explanation}</span>
                        </div>
                      )}

                      {/* Required Resources Costs */}
                      <div className="flex items-center gap-2 pt-1 text-[11px] font-mono flex-wrap">
                        <span className="text-slate-500">Затраты на миссию:</span>
                        {mission.cost.credits && (
                          <span className={resources.credits >= mission.cost.credits ? 'text-amber-300 font-bold' : 'text-rose-400 line-through'}>
                            {mission.cost.credits} ⬡
                          </span>
                        )}
                        {mission.cost.fuel && (
                          <span className={resources.fuel >= mission.cost.fuel ? 'text-cyan-300 font-bold' : 'text-rose-400 line-through'}>
                            {mission.cost.fuel} Топлива
                          </span>
                        )}
                        {mission.cost.alloys && (
                          <span className={resources.alloys >= mission.cost.alloys ? 'text-slate-300 font-bold' : 'text-rose-400 line-through'}>
                            {mission.cost.alloys} Сплавов
                          </span>
                        )}
                        {mission.cost.science && (
                          <span className={resources.science >= mission.cost.science ? 'text-purple-300 font-bold' : 'text-rose-400 line-through'}>
                            {mission.cost.science} Науки
                          </span>
                        )}
                        {mission.cost.food && (
                          <span className={resources.food >= mission.cost.food ? 'text-emerald-300 font-bold' : 'text-rose-400 line-through'}>
                            {mission.cost.food} Еды
                          </span>
                        )}
                        {mission.cost.colonists && (
                          <span className={resources.colonists >= mission.cost.colonists ? 'text-sky-300 font-bold' : 'text-rose-400 line-through'}>
                            {mission.cost.colonists} Делегатов
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0 w-full sm:w-auto">
                      <button
                        onClick={() => handleDispatchMission(mission)}
                        disabled={!affordable}
                        className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
                          affordable
                            ? mission.intent === 'improve'
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-950 cursor-pointer active:scale-95'
                              : mission.intent === 'worsen'
                              ? 'bg-rose-600 hover:bg-rose-500 text-slate-100 shadow-rose-950 cursor-pointer active:scale-95'
                              : 'bg-purple-600 hover:bg-purple-500 text-slate-100 shadow-purple-950 cursor-pointer active:scale-95'
                            : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Отправить миссию</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: PACTS & TREATIES */}
        {activeTab === 'pacts' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-100">
                  Галактические Пакты и Двусторонние Соглашения
                </p>
                <p className="text-slate-400 mt-0.5">
                  Заключение соглашений требует высокого доверия целевой фракции и стартовых взносов. 
                  Односторонний разрыв соглашений мгновенно обрушивает репутацию (-25) и ведёт к потере привилегий!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pacts.map((pact) => {
                const faction = factions[pact.factionId];
                const affordable = canAfford(pact.cost);
                const hasReputation = faction ? faction.reputation >= pact.minReputation : false;

                return (
                  <div
                    key={pact.id}
                    className={`border rounded-xl p-4 flex flex-col justify-between gap-3 transition-all ${
                      pact.active
                        ? 'bg-emerald-950/20 border-emerald-500/60 shadow-md shadow-emerald-950/30'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: faction?.color || '#38BDF8' }} 
                          />
                          <span className="text-[11px] font-mono text-slate-400">
                            {faction?.name || pact.factionId}
                          </span>
                        </div>

                        {pact.active ? (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            РАТИФИЦИРОВАН (ДАТА {pact.signedStardate || stardate.toFixed(1)})
                          </span>
                        ) : (
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            hasReputation ? 'bg-cyan-950 text-cyan-300 border-cyan-800' : 'bg-slate-950 text-slate-500 border-slate-800'
                          }`}>
                            Требуется репутация ≥ +{pact.minReputation}
                          </span>
                        )}
                      </div>

                      <h4 className="font-heading font-bold text-sm text-slate-100 flex items-center gap-2">
                        {pact.title}
                      </h4>

                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {pact.description}
                      </p>
                    </div>

                    {/* Benefit Box */}
                    <div className="bg-slate-950/90 rounded-lg p-2.5 border border-slate-800/80 text-xs font-mono space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Привилегия пакта:</span>
                      </div>
                      <p className="text-slate-300 font-sans text-xs">
                        {pact.benefit}
                      </p>
                    </div>

                    {/* Costs / Status and Toggle Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 flex-wrap gap-2 text-xs">
                      {!pact.active ? (
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-slate-500">Стоимость:</span>
                          {pact.cost.credits && <span className="text-amber-300 font-bold">{pact.cost.credits} ⬡</span>}
                          {pact.cost.alloys && <span className="text-slate-300 font-bold">{pact.cost.alloys} Сплавов</span>}
                          {pact.cost.fuel && <span className="text-cyan-300 font-bold">{pact.cost.fuel} Топлива</span>}
                          {pact.cost.science && <span className="text-purple-300 font-bold">{pact.cost.science} Науки</span>}
                          {pact.cost.antimatter && <span className="text-rose-300 font-bold">{pact.cost.antimatter} Антиматерии</span>}
                          {pact.cost.food && <span className="text-emerald-300 font-bold">{pact.cost.food} Еды</span>}
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-emerald-400">
                          Пакт действует бессрочно
                        </span>
                      )}

                      <button
                        onClick={() => handleTogglePact(pact)}
                        disabled={!pact.active && (!affordable || !hasReputation)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          pact.active
                            ? 'bg-rose-950/80 hover:bg-rose-900/90 text-rose-300 border border-rose-700/60 cursor-pointer'
                            : affordable && hasReputation
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-950 cursor-pointer active:scale-95'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        {pact.active ? (
                          <>
                            <X className="w-3.5 h-3.5" />
                            <span>Денонсировать (Разрыв)</span>
                          </>
                        ) : (
                          <>
                            <Handshake className="w-3.5 h-3.5" />
                            <span>Заключить пакт</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: LOG ARCHIVE */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {diplomaticLog.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                Архив дипломатических депеш пуст. Направьте миссии, чтобы начать формирование хроники.
              </div>
            ) : (
              diplomaticLog.map((log) => {
                const fac = factions[log.factionId];
                return (
                  <div
                    key={log.id}
                    className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-3 flex flex-col gap-1.5 text-xs font-sans"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                          ДАТА {log.stardate.toFixed(1)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: fac?.color || '#38BDF8' }} 
                          />
                          <span className="font-heading font-bold text-slate-200">
                            {log.factionName}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                        log.reputationDelta > 0
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          : log.reputationDelta < 0
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}>
                        {log.reputationDelta > 0 ? `+${log.reputationDelta}` : log.reputationDelta} репутации (Итог: {log.resultingReputation})
                      </span>
                    </div>

                    <div className="text-slate-100 font-semibold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-purple-400" />
                      <span>{log.missionTitle}</span>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed">
                      {log.summary}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 5: FACTION WARS FRONT */}
        {activeTab === 'wars' && (
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {/* Top War Briefing Banner */}
            <div className="bg-gradient-to-r from-rose-950/70 via-slate-900/90 to-amber-950/50 border border-rose-500/40 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-950 border border-rose-500/60 flex items-center justify-center text-rose-400 shadow-md shadow-rose-950 animate-pulse">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-100 flex items-center gap-2">
                    <span>Театры Военных Действий в Галактике</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900/80 text-rose-200 border border-rose-600">
                      ВОЕННОЕ ПОЛОЖЕНИЕ
                    </span>
                  </h3>
                  <p className="text-slate-300 font-sans text-xs mt-0.5">
                    Фракции ведут ожесточённые бои за рубежи. Вы можете вмешаться ядерным ударом, поддержать флот или сковать мир!
                  </p>
                </div>
              </div>

              {/* Nuclear Arsenal Quick Assembly */}
              <div className="flex items-center gap-2 font-mono">
                <button
                  onClick={handleCraftNuke}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-950/80 hover:bg-amber-900 border border-amber-500/70 text-amber-300 shadow-md shadow-amber-950 cursor-pointer transition-all active:scale-95"
                  title="Произвести ядерную боеголовку (450 ⬡ и 25 Сплавов)"
                >
                  <span className="text-sm">☢</span>
                  <span>Произвести Ядерку (450⬡ + 25 спл.)</span>
                </button>
              </div>
            </div>

            {/* Wars Grid */}
            <div className="space-y-4">
              {factionWars.map((war) => {
                const attacker = factions[war.attackerFaction];
                const defender = factions[war.defenderFaction];
                const badge = getWarStatusBadge(war.intensity);
                const hasNukes = (resources.nukes ?? 0) > 0;

                return (
                  <div
                    key={war.id}
                    className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-3.5 shadow-xl transition-all hover:border-slate-700"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${badge.badgeClass}`}>
                            {badge.label}
                          </span>
                          <span className="text-[11px] font-mono text-cyan-400 font-bold">
                            {war.codename}
                          </span>
                        </div>
                        <h4 className="font-heading font-bold text-base text-slate-100 mt-1">
                          {war.name}
                        </h4>
                      </div>

                      <div className="text-right text-xs font-mono">
                        <span className="text-slate-400">Награда за перелом:</span>
                        <div className="text-amber-300 font-bold">
                          +{war.warBounty.credits} ⬡ · +{war.warBounty.alloys} Сплавов
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {war.description}
                    </p>

                    {/* Frontline Control Dual Meter */}
                    <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold" style={{ color: attacker?.color || '#38BDF8' }}>
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: attacker?.color || '#38BDF8' }} />
                          <span>{attacker?.name}</span>
                          <span className="text-slate-200">({war.frontlineControl}%)</span>
                        </div>

                        <div className="text-slate-500 font-bold text-[10px]">
                          БАЛАНС СИЛ ФРОНТА
                        </div>

                        <div className="flex items-center gap-1.5 font-bold" style={{ color: defender?.color || '#F59E0B' }}>
                          <span className="text-slate-200">({100 - war.frontlineControl}%)</span>
                          <span>{defender?.name}</span>
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: defender?.color || '#F59E0B' }} />
                        </div>
                      </div>

                      {/* Visual Dual Progress Bar */}
                      <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 flex relative">
                        <div
                          className="h-full transition-all duration-500 shadow-sm"
                          style={{
                            width: `${war.frontlineControl}%`,
                            backgroundColor: attacker?.color || '#38BDF8'
                          }}
                        />
                        <div
                          className="h-full transition-all duration-500 shadow-sm"
                          style={{
                            width: `${100 - war.frontlineControl}%`,
                            backgroundColor: defender?.color || '#F59E0B'
                          }}
                        />
                        {/* Center marker */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/70 z-10" />
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>Господство {attacker?.shortName}</span>
                        <span>Господство {defender?.shortName}</span>
                      </div>
                    </div>

                    {/* Battleground Hotspot Systems */}
                    <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                      <span className="text-slate-400">Системы в огне:</span>
                      {war.targetSystemIds.map((sysId: string) => (
                        <span key={sysId} className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300 text-[11px] font-bold">
                          ⚡ {sysId}
                        </span>
                      ))}
                    </div>

                    {/* Military Intervention Action Strip */}
                    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5">
                      <div className="text-[11px] font-mono text-slate-300 font-bold flex items-center justify-between">
                        <span>ВМЕШАТЕЛЬСТВО ЭКСПЕДИЦИИ:</span>
                        <span className="text-amber-400">В арсенале: {resources.nukes ?? 0} Ядерок</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {/* Strike Side 1 */}
                        <button
                          disabled={!hasNukes}
                          onClick={() => handleLaunchNukeAtWar(war, war.attackerFaction)}
                          className={`p-2 rounded-lg text-xs font-bold font-mono flex items-center justify-between gap-1 transition-all ${
                            hasNukes
                              ? 'bg-rose-950/80 hover:bg-rose-900 border border-rose-500/70 text-rose-200 cursor-pointer shadow-md shadow-rose-950'
                              : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="text-sm">☢</span>
                            <span>ЯДЕРНЫЙ УДАР за {attacker?.shortName}</span>
                          </span>
                          <span className="text-[10px] text-amber-300">-1 Ядерка (+22%)</span>
                        </button>

                        {/* Strike Side 2 */}
                        <button
                          disabled={!hasNukes}
                          onClick={() => handleLaunchNukeAtWar(war, war.defenderFaction)}
                          className={`p-2 rounded-lg text-xs font-bold font-mono flex items-center justify-between gap-1 transition-all ${
                            hasNukes
                              ? 'bg-rose-950/80 hover:bg-rose-900 border border-rose-500/70 text-rose-200 cursor-pointer shadow-md shadow-rose-950'
                              : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="text-sm">☢</span>
                            <span>ЯДЕРНЫЙ УДАР за {defender?.shortName}</span>
                          </span>
                          <span className="text-[10px] text-amber-300">-1 Ядерка (+22%)</span>
                        </button>

                        {/* Conventional Support Side 1 */}
                        <button
                          disabled={resources.fuel < 20 || resources.alloys < 20}
                          onClick={() => handleSendFleetSupport(war, war.attackerFaction)}
                          className="p-2 rounded-lg text-xs font-mono flex items-center justify-between gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <span>Эскадра за {attacker?.shortName}</span>
                          <span className="text-[10px] text-cyan-400">20 топл. · 20 спл. (+10%)</span>
                        </button>

                        {/* Conventional Support Side 2 */}
                        <button
                          disabled={resources.fuel < 20 || resources.alloys < 20}
                          onClick={() => handleSendFleetSupport(war, war.defenderFaction)}
                          className="p-2 rounded-lg text-xs font-mono flex items-center justify-between gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <span>Эскадра за {defender?.shortName}</span>
                          <span className="text-[10px] text-cyan-400">20 топл. · 20 спл. (+10%)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Transmission Receipt Overlay Modal */}
        {activeTransmission && (
          <div className="absolute inset-0 bg-[#040714]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0B1026] border border-cyan-500/50 rounded-xl max-w-lg w-full p-5 shadow-2xl flex flex-col gap-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-950">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                  Входящая депеша • Квантовая связь
                </span>
                <h3 className="font-heading font-bold text-lg text-slate-100 mt-1">
                  Ответ Высшего Совета {activeTransmission.faction.name}
                </h3>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 text-xs text-slate-300 leading-relaxed font-sans text-left">
                <p className="italic">
                  «{activeTransmission.responseMessage}»
                </p>
                {activeTransmission.rivalEffect && (
                  <p className="mt-2 text-amber-300/90 font-mono text-[11px]">
                    Внимание: {activeTransmission.rivalEffect.factionName} зафиксировала вашу акцию ({activeTransmission.rivalEffect.delta > 0 ? `+${activeTransmission.rivalEffect.delta}` : activeTransmission.rivalEffect.delta} к репутации).
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    sounds.playScanPing();
                    setActiveTransmission(null);
                  }}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-cyan-950 bg-cyan-400 hover:bg-cyan-300 transition-colors cursor-pointer shadow-md shadow-cyan-950"
                >
                  Принять депешу и продолжить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Nuclear Strike Victory Receipt Overlay Modal */}
        {nukeStrikeResult && (
          <div className="absolute inset-0 bg-[#040714]/95 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#120B0B] border-2 border-amber-500/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-950 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-xl shadow-amber-950 animate-bounce">
                <span className="text-3xl">☢</span>
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                  СТРАТЕГИЧЕСКИЙ ТЕРМОЯДЕРНЫЙ ЗАЛП
                </span>
                <h3 className="font-heading font-bold text-xl text-slate-100 mt-1">
                  Армада {nukeStrikeResult.targetName} Испепелена!
                </h3>
              </div>

              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed font-sans text-left space-y-2">
                <p>
                  Термоядерная боеголовка субсветового ускорения детонировала в самом сердце боевого построения флота. 
                  Корабельные группировки противника распылены на элементарные частицы.
                </p>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-mono text-amber-300 text-xs">
                  <span>Выплачена военная премия:</span>
                  <span className="font-bold">+{nukeStrikeResult.bountyCredits} ⬡ · +40 сплавов</span>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playScanPing();
                  setNukeStrikeResult(null);
                }}
                className="px-6 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer shadow-lg shadow-amber-950 font-mono"
              >
                Принять боевой отчёт
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
