import React, { useState } from 'react';
import { Kingdom, KingdomId, RoyalPrivilege, RoyalPetition, AllegianceRank, KingdomTitle } from '../types/kingdom';
import { StarSystem, Resources, ShipStats, CommanderProgression } from '../types/game';
import { sounds } from '../services/soundEffects';
import {
  Crown,
  Sparkles,
  Shield,
  Coins,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Gift,
  Scroll,
  ArrowUpRight,
  TrendingUp,
  Award,
  Zap,
  Swords,
  ChevronDown,
  ChevronUp,
  Landmark,
  ShieldAlert,
  Compass,
  FileCheck
} from 'lucide-react';

interface KingdomsViewProps {
  kingdoms: Kingdom[];
  currentSystem: StarSystem;
  resources: Resources;
  shipStats: ShipStats;
  commander: CommanderProgression;
  onInvestInKingdom: (kingdomId: KingdomId, amount: number) => void;
  onUnlockPrivilege: (kingdomId: KingdomId, privilege: RoyalPrivilege) => void;
  onCompletePetition: (kingdomId: KingdomId, petition: RoyalPetition) => void;
  onSwearAllegiance: (kingdomId: KingdomId, rank: AllegianceRank) => void;
  onJumpToSystem: (systemId: string) => void;
  onOpenAudienceWithKing: (monarchNpcId: string) => void;
  onShowToast: (msg: string) => void;
  playerName?: string;
  activeTitle?: KingdomTitle | null;
  onSelectActiveTitle?: (title: KingdomTitle | null) => void;
}

export const KingdomsView: React.FC<KingdomsViewProps> = ({
  kingdoms,
  currentSystem,
  resources,
  shipStats,
  commander,
  onInvestInKingdom,
  onUnlockPrivilege,
  onCompletePetition,
  onSwearAllegiance,
  onJumpToSystem,
  onOpenAudienceWithKing,
  onShowToast,
  playerName = 'Командир Астреи',
  activeTitle = null,
  onSelectActiveTitle
}) => {
  const [selectedKingdomId, setSelectedKingdomId] = useState<KingdomId>(kingdoms[0]?.id || 'soul_society');
  const [activeTab, setActiveTab] = useState<'overview' | 'privileges' | 'petitions' | 'titles' | 'treasury'>('overview');
  const [titleKingdomFilter, setTitleKingdomFilter] = useState<'all' | KingdomId>('all');
  const [investmentAmount, setInvestmentAmount] = useState<number>(500);

  const kingdom = kingdoms.find(k => k.id === selectedKingdomId) || kingdoms[0];

  const totalUnlockedTitlesCount = React.useMemo(() => {
    let count = 0;
    kingdoms.forEach(k => {
      k.titles.forEach(t => {
        if (k.reputation >= t.minReputation) count++;
      });
    });
    return count;
  }, [kingdoms]);

  const handleScrollTop = () => {
    const el = document.getElementById('kingdoms-scroll-container');
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollBottom = () => {
    const el = document.getElementById('kingdoms-scroll-container');
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

  const getReputationBadge = (rep: number) => {
    if (rep >= 50) {
      return (
        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/80 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> СОЮЗНИК КОРОНЫ ({rep}%)
        </span>
      );
    }
    if (rep >= 15) {
      return (
        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-700/80 flex items-center gap-1">
          <Award className="w-3 h-3" /> ДРУЖЕСТВЕННЫЙ ({rep}%)
        </span>
      );
    }
    if (rep >= 0) {
      return (
        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700">
          НЕЙТРАЛИТЕТ ({rep}%)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-950/80 text-rose-400 border border-rose-700/80 flex items-center gap-1">
        <ShieldAlert className="w-3 h-3" /> ОХЛАЖДЕНИЕ ({rep}%)
      </span>
    );
  };

  const getAllegianceTitle = (rank: AllegianceRank) => {
    switch (rank) {
      case 'grand_champion': return 'Верховный Чемпион Короны';
      case 'lord_protector': return 'Лорд-Протектор Сектора';
      case 'baron': return 'Королевский Барон';
      case 'knight': return 'Рыцарь Ордена Королевства';
      case 'friend': return 'Привилегированный Союзник';
      default: return 'Вольный Скиталец';
    }
  };

  const handleInvest = (amount: number) => {
    if (resources.credits < amount) {
      sounds.playAlert();
      onShowToast(`Недостаточно кредитов для инвестиции! Требуется ${amount} ⬡.`);
      return;
    }
    sounds.playCreditsChime();
    onInvestInKingdom(kingdom.id, amount);
    onShowToast(`Вложено ${amount} ⬡ в королевскую казну «${kingdom.shortName}»! Репутация и статус возросли!`);
  };

  const handleUnlock = (priv: RoyalPrivilege) => {
    if (priv.costCredits && resources.credits < priv.costCredits) {
      sounds.playAlert();
      onShowToast(`Недостаточно кредитов! Требуется ${priv.costCredits} ⬡.`);
      return;
    }
    if (priv.costScience && resources.science < priv.costScience) {
      sounds.playAlert();
      onShowToast(`Недостаточно науки! Требуется ${priv.costScience} ед.`);
      return;
    }
    if (priv.costAlloys && resources.alloys < priv.costAlloys) {
      sounds.playAlert();
      onShowToast(`Недостаточно сплавов! Требуется ${priv.costAlloys} ед.`);
      return;
    }
    if (priv.costAntimatter && resources.antimatter < priv.costAntimatter) {
      sounds.playAlert();
      onShowToast(`Недостаточно антиматерии! Требуется ${priv.costAntimatter} ед.`);
      return;
    }

    sounds.playVictoryFanfare();
    onUnlockPrivilege(kingdom.id, priv);
    onShowToast(`Королевская привилегия «${priv.title}» дарована монархом! Бонусы активированы!`);
  };

  const handlePetitionSubmit = (pet: RoyalPetition) => {
    if (pet.cost?.credits && resources.credits < pet.cost.credits) {
      sounds.playAlert();
      onShowToast(`Недостаточно кредитов! Требуется ${pet.cost.credits} ⬡.`);
      return;
    }
    if (pet.cost?.science && resources.science < pet.cost.science) {
      sounds.playAlert();
      onShowToast(`Недостаточно науки! Требуется ${pet.cost.science} ед.`);
      return;
    }
    if (pet.cost?.alloys && resources.alloys < pet.cost.alloys) {
      sounds.playAlert();
      onShowToast(`Недостаточно сплавов! Требуется ${pet.cost.alloys} ед.`);
      return;
    }
    if (pet.cost?.antimatter && resources.antimatter < pet.cost.antimatter) {
      sounds.playAlert();
      onShowToast(`Недостаточно антиматерии! Требуется ${pet.cost.antimatter} ед.`);
      return;
    }
    if (pet.cost?.food && resources.food < pet.cost.food) {
      sounds.playAlert();
      onShowToast(`Недостаточно продовольствия! Требуется ${pet.cost.food} ед.`);
      return;
    }

    sounds.playVictoryFanfare();
    onCompletePetition(kingdom.id, pet);
    onShowToast(`Петиция «${pet.title}» высочайше принята! Награды зачислены на борт!`);
  };

  return (
    <div 
      id="kingdoms-scroll-container"
      className="w-full h-full bg-[#050711] flex flex-col overflow-y-auto p-3 sm:p-5 md:p-6 pb-28 md:pb-16 select-none relative scroll-smooth overscroll-contain"
    >
      {/* Floating Scroll Navigation Fast Controls (fixes user request: "не работает фуннкция скролла") */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={handleScrollTop}
          title="Прокрутить к началу"
          className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500 hover:bg-slate-800 transition-all shadow-xl backdrop-blur-md cursor-pointer"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={handleScrollBottom}
          title="Прокрутить вниз"
          className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500 hover:bg-slate-800 transition-all shadow-xl backdrop-blur-md cursor-pointer"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Top Main Banner Header */}
      <div className="max-w-[1500px] w-full mx-auto pb-4 border-b border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-amber-400 tracking-wider flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>ВЕЛИКИЕ КОРОЛЕВСТВА, СУВЕРЕННЫЕ ДЕРЖАВЫ И МОНАРХИИ</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-100 mt-1 flex items-center gap-2">
            <span>Королевства Галактики</span>
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-3xl">
            Вступайте в дипломатические союзы со Священным Королевством Душ (Bleach), Царством Намек (Dragon Ball), Солнечным Королевством Терры и владыками Синдиката. Получайте королевские привилегии, инвестируйте в казну и выполняйте монаршие петиции!
          </p>
        </div>

        {/* Quick Current System Banner */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <div className="text-slate-400 text-[10px]">ТЕКУЩАЯ СИСТЕМА:</div>
            <div className="text-cyan-300 font-bold">{currentSystem.name}</div>
          </div>
          <div className="ml-2 pl-3 border-l border-slate-800 text-[11px] text-amber-300">
            {kingdoms.length} Великих Королевств
          </div>
        </div>
      </div>

      {/* Kingdom Selector Carousel / Cards */}
      <div className="max-w-[1500px] w-full mx-auto mt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {kingdoms.map((k) => {
            const isSelected = k.id === selectedKingdomId;
            return (
              <button
                key={k.id}
                onClick={() => {
                  sounds.playScanPing();
                  setSelectedKingdomId(k.id);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'shadow-xl shadow-cyan-950/40 border-2'
                    : 'bg-slate-900/70 hover:bg-slate-800/70 border-slate-800 opacity-80 hover:opacity-100'
                }`}
                style={{
                  borderColor: isSelected ? k.color : undefined,
                  backgroundColor: isSelected ? k.accentBg : undefined
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{k.bannerEmoji}</span>
                    <div>
                      <div 
                        className="text-[10px] font-mono font-bold uppercase tracking-wider"
                        style={{ color: k.color }}
                      >
                        {k.universeName}
                      </div>
                      <div className="text-xs font-bold font-heading text-slate-100 leading-tight">
                        {k.shortName}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span 
                      className="w-2 h-2 rounded-full shrink-0 animate-ping"
                      style={{ backgroundColor: k.color }}
                    />
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Влияние: <strong className="text-slate-200">{k.territorySharePercent}%</strong></span>
                  <span className="font-bold" style={{ color: k.color }}>{k.reputation >= 0 ? `+${k.reputation}` : k.reputation}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Kingdom Master Banner */}
      <div 
        className="max-w-[1500px] w-full mx-auto mt-5 rounded-2xl border-2 p-5 sm:p-6 shadow-2xl relative overflow-hidden"
        style={{
          borderColor: kingdom.color,
          backgroundColor: kingdom.accentBg
        }}
      >
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl shadow-2xl border shrink-0 bg-slate-950/80"
              style={{ borderColor: kingdom.color }}
            >
              <span>{kingdom.bannerEmoji}</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span 
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase"
                  style={{
                    color: kingdom.color,
                    borderColor: `${kingdom.color}66`,
                    backgroundColor: `${kingdom.color}22`
                  }}
                >
                  {kingdom.universeName}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                  {kingdom.governmentType}
                </span>
                {getReputationBadge(kingdom.reputation)}
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-100 mt-1">
                {kingdom.name}
              </h2>

              <div className="text-xs text-slate-300 font-sans mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Монарх: <strong className="text-amber-300">{kingdom.monarchName}</strong></span>
                <span>Столица: <strong className="text-cyan-300">{kingdom.capitalName}</strong></span>
                <span>Командир: <strong className="text-slate-100">{playerName}</strong></span>
                <span className="flex items-center gap-1">
                  <span>Активный титул:</span>
                  {activeTitle ? (
                    <span 
                      className="inline-flex items-center gap-1 font-bold px-1.5 py-0.2 rounded border"
                      style={{
                        color: activeTitle.color,
                        borderColor: `${activeTitle.color}66`,
                        backgroundColor: `${activeTitle.color}22`
                      }}
                    >
                      <span>{activeTitle.badgeEmoji}</span>
                      <span>«{activeTitle.title}»</span>
                    </span>
                  ) : (
                    <strong className="text-slate-400 italic">Вольный Скиталец</strong>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions with Monarch */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
            <button
              onClick={() => {
                sounds.playScanPing();
                setActiveTab('titles');
              }}
              className="flex-1 lg:flex-initial py-2.5 px-4 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-950"
            >
              <Crown className="w-4 h-4 text-slate-950" />
              <span>Титулы Короны</span>
            </button>

            <button
              onClick={() => onOpenAudienceWithKing(kingdom.monarchNpcId)}
              className="flex-1 lg:flex-initial py-2.5 px-4 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-600/70"
            >
              <Award className="w-4 h-4" />
              <span>Аудиенция</span>
            </button>

            <button
              onClick={() => {
                sounds.playScanPing();
                onJumpToSystem(kingdom.capitalSystemId);
              }}
              className="flex-1 lg:flex-initial py-2.5 px-4 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Столичная Система</span>
            </button>
          </div>
        </div>

        {/* Anthem Quote */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs italic text-slate-300 font-sans">
          {kingdom.anthemQuote}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="max-w-[1500px] w-full mx-auto mt-5 flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Обзор & Государство</span>
        </button>

        <button
          onClick={() => setActiveTab('titles')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'titles'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-950'
              : 'text-amber-400 hover:text-amber-200 hover:bg-amber-950/40'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>Титулы Короны ({totalUnlockedTitlesCount}/25)</span>
        </button>

        <button
          onClick={() => setActiveTab('privileges')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'privileges'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950'
              : 'text-amber-400 hover:text-amber-200 hover:bg-amber-950/40'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Королевские Привилегии ({kingdom.privileges.filter(p => p.unlocked).length}/{kingdom.privileges.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('petitions')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'petitions'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950'
              : 'text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950/40'
          }`}
        >
          <Scroll className="w-3.5 h-3.5" />
          <span>Петиции & Поручения Короны ({kingdom.petitions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('treasury')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'treasury'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
              : 'text-purple-400 hover:text-purple-200 hover:bg-purple-950/40'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Казна & Инвестиции</span>
        </button>
      </div>

      {/* Main Tab Panels */}
      <div className="max-w-[1500px] w-full mx-auto mt-5">

        {/* 1. OVERVIEW & REALM STATS */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Lore and State description */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <h3 className="text-base font-bold font-heading text-slate-100 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-cyan-400" />
                  <span>История, Лор и Государственный Строй</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {kingdom.lore}
                </p>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-2">
                  <div className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                    ГОСУДАРСТВЕННАЯ ДОКТРИНА:
                  </div>
                  <div className="text-slate-200">{kingdom.ideology}</div>
                </div>

                {/* Subjugated & Protected Systems */}
                <div className="pt-2">
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Подконтрольные Звёздные Системы Королевства:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {kingdom.controlledSystemIds.map((sysId) => (
                      <div 
                        key={sysId}
                        className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs font-mono"
                      >
                        <span className="text-slate-200 font-semibold">{sysId.replace(/_/g, ' ').toUpperCase()}</span>
                        <button
                          onClick={() => onJumpToSystem(sysId)}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                        >
                          <span>К системе</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Allegiance & Knightly Oath Section */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <h3 className="text-base font-bold font-heading text-slate-100 flex items-center gap-2">
                  <Swords className="w-4 h-4 text-amber-400" />
                  <span>Клятва Верности Королевству (Вассалитет и Титулы)</span>
                </h3>
                <p className="text-xs text-slate-300 font-sans">
                  Принесение священной присяги укрепляет союз с монархом, дарует гербовую защиту и повышает статус во всех звёздных портах королевства.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      sounds.playVictoryFanfare();
                      onSwearAllegiance(kingdom.id, 'friend');
                      onShowToast(`Вы признаны «Союзником» короны «${kingdom.shortName}»!`);
                    }}
                    className={`p-3 rounded-xl border text-xs font-mono text-left transition-all cursor-pointer ${
                      kingdom.allegiance === 'friend'
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400 uppercase">Статус I</div>
                    <div className="font-bold text-slate-100 mt-0.5">Союзник Короны</div>
                    <div className="text-[10px] text-slate-400 mt-1">Требуется 10+ репутации</div>
                  </button>

                  <button
                    onClick={() => {
                      if (kingdom.reputation < 35) {
                        sounds.playAlert();
                        onShowToast('Требуется не менее 35% репутации королевства для посвящения в рыцари!');
                        return;
                      }
                      sounds.playVictoryFanfare();
                      onSwearAllegiance(kingdom.id, 'knight');
                      onShowToast(`Вы посвящены в «Рыцари Королевства ${kingdom.shortName}»!`);
                    }}
                    className={`p-3 rounded-xl border text-xs font-mono text-left transition-all cursor-pointer ${
                      kingdom.allegiance === 'knight'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400 uppercase">Статус II</div>
                    <div className="font-bold text-slate-100 mt-0.5">Рыцарь Ордена</div>
                    <div className="text-[10px] text-slate-400 mt-1">Требуется 35+ репутации</div>
                  </button>

                  <button
                    onClick={() => {
                      if (kingdom.reputation < 70) {
                        sounds.playAlert();
                        onShowToast('Требуется не менее 70% репутации королевства для звания Лорда-Протектора!');
                        return;
                      }
                      sounds.playVictoryFanfare();
                      onSwearAllegiance(kingdom.id, 'lord_protector');
                      onShowToast(`Вы провозглашены «Лордом-Протектором ${kingdom.shortName}»!`);
                    }}
                    className={`p-3 rounded-xl border text-xs font-mono text-left transition-all cursor-pointer ${
                      kingdom.allegiance === 'lord_protector'
                        ? 'bg-purple-950/60 border-purple-500 text-purple-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400 uppercase">Статус III</div>
                    <div className="font-bold text-slate-100 mt-0.5">Лорд-Протектор</div>
                    <div className="text-[10px] text-slate-400 mt-1">Требуется 70+ репутации</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Telemetry Column */}
            <div className="space-y-5">
              {/* Power & Treasury Cards */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <h3 className="text-sm font-bold font-heading text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Мощь и Казна Королевства</span>
                </h3>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                      <span>ВОЕННАЯ МОЩЬ ФЛОТА:</span>
                      <strong className="text-rose-400">{kingdom.militaryPower.toLocaleString()}</strong>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-500"
                        style={{ width: `${Math.min(100, (kingdom.militaryPower / 200000) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                      <span>КОРОЛЕВСКАЯ КАЗНА:</span>
                      <strong className="text-amber-400">{kingdom.treasury.toLocaleString()} ⬡</strong>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                        style={{ width: `${Math.min(100, (kingdom.treasury / 700000) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                      <span>ДОЛЯ ВЛИЯНИЯ В ГАЛАКТИКЕ:</span>
                      <strong className="text-cyan-400">{kingdom.territorySharePercent}%</strong>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-cyan-400"
                        style={{ width: `${kingdom.territorySharePercent * 2.5}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setActiveTab('treasury')}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Инвестировать в Казну</span>
                  </button>
                </div>
              </div>

              {/* Monarch Persona Profile */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border shrink-0 bg-slate-950"
                    style={{ borderColor: kingdom.color }}
                  >
                    <span>{kingdom.bannerEmoji}</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-amber-400 font-bold uppercase">ВЕНЦЕНОСНЫЙ ПРАВИТЕЛЬ:</div>
                    <div className="text-sm font-bold font-heading text-slate-100">{kingdom.monarchName}</div>
                    <div className="text-[11px] text-slate-400 font-sans">{kingdom.monarchTitle}</div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onOpenAudienceWithKing(kingdom.monarchNpcId)}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-950"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Запросить Аудиенцию у Монарха</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ROYAL PRIVILEGES */}
        {activeTab === 'privileges' && (
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-base font-bold font-heading text-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Монаршие Привилегии, Грамоты и Патенты</span>
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-1">
                Разблокируйте вечные дары короны: усиление щитов, орудийных калибров, снижение торговых пошлин и регулярные выплаты ресурсов!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                {kingdom.privileges.map((priv) => {
                  const meetsRep = kingdom.reputation >= priv.minReputation;

                  return (
                    <div 
                      key={priv.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                        priv.unlocked
                          ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold font-heading text-slate-100 flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{priv.title}</span>
                          </h4>
                          {priv.unlocked && (
                            <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> ДАРОВАНО
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 font-sans leading-relaxed">
                          {priv.description}
                        </p>

                        <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-600/40 text-xs font-mono text-amber-300 font-bold">
                          Эффект: {priv.effectSummary}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                        {/* Cost & Requirements */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                          <span>Требуется: Репутация {priv.minReputation}%</span>
                          {priv.costCredits && <span className="text-amber-300">{priv.costCredits} ⬡</span>}
                          {priv.costAlloys && <span className="text-emerald-300">{priv.costAlloys} Сплавов</span>}
                          {priv.costScience && <span className="text-purple-300">{priv.costScience} Науки</span>}
                          {priv.costAntimatter && <span className="text-fuchsia-300">{priv.costAntimatter} Антиматерии</span>}
                        </div>

                        {priv.unlocked ? (
                          <div className="py-2 text-center text-xs font-mono text-emerald-400 font-bold bg-emerald-950/40 rounded-lg border border-emerald-800/60">
                            Привилегия активна
                          </div>
                        ) : (
                          <button
                            disabled={!meetsRep}
                            onClick={() => handleUnlock(priv)}
                            className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              meetsRep
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-950'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 opacity-60'
                            }`}
                          >
                            <Gift className="w-3.5 h-3.5" />
                            <span>{meetsRep ? 'Принять Королевский Патент' : `Требуется ${priv.minReputation}% репутации`}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. ROYAL PETITIONS & QUESTS */}
        {activeTab === 'petitions' && (
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-base font-bold font-heading text-slate-100 flex items-center gap-2">
                <Scroll className="w-4 h-4 text-emerald-400" />
                <span>Официальные Петиции и Поручения Короны</span>
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-1">
                Подавайте прошения и выполняйте стратегические запросы монарха: укрепляйте оборону королевства и получайте колоссальные награды!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                {kingdom.petitions.map((pet) => (
                  <div 
                    key={pet.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      pet.completed
                        ? 'bg-slate-950/40 border-slate-800 opacity-60'
                        : 'bg-slate-950/80 border-slate-800 shadow-md'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold font-heading text-slate-100 flex items-center gap-1.5">
                          <FileCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{pet.title}</span>
                        </h4>
                        {pet.completed && (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> ВЫПОЛНЕНО
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        {pet.description}
                      </p>

                      <div className="text-xs font-mono text-cyan-300 font-bold bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-800/40">
                        {pet.requirementText}
                      </div>

                      <div className="text-xs font-mono text-amber-300 font-bold bg-amber-950/30 p-2.5 rounded-lg border border-amber-800/40">
                        Награда: {pet.rewardSummary}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800">
                      {pet.completed ? (
                        <div className="py-2 text-center text-xs font-mono text-slate-400">
                          Петиция высочайше утверждена
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePetitionSubmit(pet)}
                          className="w-full py-2.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Передать ресурсы и Утвердить Петицию</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. CROWN TITLES & NOBILITY RANKS */}
        {activeTab === 'titles' && (
          <div className="space-y-6">
            {/* Active Equipped Title Hero Showcase */}
            <div className="rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-cyan-950/40 p-5 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-950/80 border-2 border-amber-400 flex items-center justify-center text-4xl sm:text-5xl shadow-xl shadow-amber-950 shrink-0">
                    {activeTitle ? activeTitle.badgeEmoji : '👑'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-950 px-2 py-0.5 rounded border border-amber-700">
                        ТЕКУЩИЙ КОРОЛЕВСКИЙ ТИТУЛ
                      </span>
                      {activeTitle && (
                        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                          {activeTitle.kingdomName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-bold font-heading text-slate-100">
                        {playerName}
                      </h3>
                      {activeTitle ? (
                        <span 
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-sm font-mono font-bold border shadow-md"
                          style={{
                            color: activeTitle.color,
                            borderColor: `${activeTitle.color}66`,
                            backgroundColor: `${activeTitle.color}22`
                          }}
                        >
                          <span>{activeTitle.badgeEmoji}</span>
                          <span>«{activeTitle.title}»</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          (Титул не выбран — отображается «Вольный Скиталец»)
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                      {activeTitle
                        ? activeTitle.description
                        : 'Вы пока не выбрали королевский титул. Повышайте репутацию с монархами, открывайте дворянские ранги и надевайте титулы для получения постоянных бонусов к флагману!'}
                    </p>

                    {activeTitle?.perk && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-mono text-amber-300 bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-800/80 shadow-inner">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Активные постоянные бонусы титула: <strong>{activeTitle.bonusSummary}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {activeTitle && onSelectActiveTitle && (
                  <button
                    onClick={() => {
                      sounds.playScanPing();
                      onSelectActiveTitle(null);
                      onShowToast('Королевский титул снят.');
                    }}
                    className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs font-bold transition-all border border-slate-700 cursor-pointer whitespace-nowrap shadow-md"
                  >
                    Снять титул
                  </button>
                )}
              </div>
            </div>

            {/* Kingdom Filter Tabs */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3 flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                <button
                  onClick={() => setTitleKingdomFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                    titleKingdomFilter === 'all'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                  }`}
                >
                  Все королевства ({totalUnlockedTitlesCount}/25 открыто)
                </button>

                {kingdoms.map(k => {
                  const isCurrent = titleKingdomFilter === k.id;
                  const kUnlocked = k.titles.filter(t => k.reputation >= t.minReputation).length;
                  return (
                    <button
                      key={k.id}
                      onClick={() => setTitleKingdomFilter(k.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        isCurrent
                          ? 'text-slate-950 shadow-md'
                          : 'text-slate-300 hover:text-slate-100 bg-slate-900 border border-slate-800'
                      }`}
                      style={{
                        backgroundColor: isCurrent ? k.color : undefined
                      }}
                    >
                      <span>{k.bannerEmoji}</span>
                      <span>{k.shortName}</span>
                      <span className="text-[10px] opacity-80">({kUnlocked}/5)</span>
                    </button>
                  );
                })}
              </div>

              <div className="text-xs font-mono text-slate-400">
                Титул отображается рядом с именем игрока в интерфейсе и на Доске Почёта
              </div>
            </div>

            {/* Titles Matrix Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kingdoms
                .filter(k => titleKingdomFilter === 'all' || titleKingdomFilter === k.id)
                .flatMap(k => k.titles.map(t => ({ title: t, kingdom: k })))
                .map(({ title, kingdom: parentKingdom }) => {
                  const isCurrentActive = activeTitle?.id === title.id;
                  const isReputationMet = parentKingdom.reputation >= title.minReputation;
                  const repProgress = Math.min(100, Math.max(0, Math.round((parentKingdom.reputation / title.minReputation) * 100)));

                  return (
                    <div
                      key={title.id}
                      className={`rounded-2xl border-2 p-4 transition-all flex flex-col justify-between shadow-xl relative overflow-hidden ${
                        isCurrentActive
                          ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/80 shadow-amber-950/60'
                          : isReputationMet
                          ? 'bg-slate-900/90 border-slate-700 hover:border-slate-600'
                          : 'bg-slate-950/60 border-slate-800/80 opacity-75'
                      }`}
                    >
                      {/* Top Header */}
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xl">{title.badgeEmoji}</span>
                            <span 
                              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase"
                              style={{ color: title.color, backgroundColor: `${title.color}18` }}
                            >
                              {parentKingdom.shortName}
                            </span>
                          </div>

                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                            {title.rank === 'grand_champion' ? 'РАНГ V' :
                             title.rank === 'lord_protector' ? 'РАНГ IV' :
                             title.rank === 'baron' ? 'РАНГ III' :
                             title.rank === 'knight' ? 'РАНГ II' : 'РАНГ I'}
                          </span>
                        </div>

                        {/* Title Name & Description */}
                        <div className="mt-3">
                          <h4 
                            className="font-heading font-bold text-base text-slate-100"
                            style={{ color: isReputationMet ? title.color : undefined }}
                          >
                            «{title.title}»
                          </h4>
                          <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                            {title.description}
                          </p>
                        </div>

                        {/* Bonus Perk Pill */}
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-1">
                          <div className="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>БОНУСЫ ТИТУЛА:</span>
                          </div>
                          <div className="text-emerald-300 font-semibold text-[11px]">
                            {title.bonusSummary}
                          </div>
                        </div>

                        {/* Reputation Requirement Bar */}
                        <div className="mt-3 space-y-1 text-xs font-mono">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Требуемая репутация:</span>
                            <strong className={isReputationMet ? 'text-emerald-400' : 'text-amber-400'}>
                              {parentKingdom.reputation}% / {title.minReputation}%
                            </strong>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                isReputationMet ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${repProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80">
                        {isCurrentActive ? (
                          <div className="py-2.5 px-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold font-mono text-xs text-center flex items-center justify-center gap-1.5 shadow-sm">
                            <CheckCircle2 className="w-4 h-4 text-amber-400" />
                            <span>АКТИВНЫЙ ТИТУЛ</span>
                          </div>
                        ) : isReputationMet ? (
                          <button
                            onClick={() => {
                              sounds.playVictoryFanfare();
                              if (parentKingdom.allegiance !== title.rank) {
                                onSwearAllegiance(parentKingdom.id, title.rank);
                              }
                              onSelectActiveTitle?.(title);
                              onShowToast(`Титул «${title.title}» успешно надет рядом с именем!`);
                            }}
                            className="w-full py-2.5 px-3 rounded-xl font-bold font-mono text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-950 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Crown className="w-4 h-4 text-slate-950" />
                            <span>Надеть этот титул</span>
                          </button>
                        ) : (
                          <div className="py-2 px-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-500 font-mono text-xs text-center">
                            Нужно ещё +{title.minReputation - parentKingdom.reputation}% репутации
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* 4. TREASURY & INVESTMENT */}
        {activeTab === 'treasury' && (
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-base font-bold font-heading text-slate-100 flex items-center gap-2">
                <Coins className="w-4 h-4 text-purple-400" />
                <span>Инвестиционный Фонд Королевской Казны</span>
              </h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Инвестируйте излишки кредитов в государственные фонды «{kingdom.name}». Каждая инвестиция перманентно повышает репутацию с монархом, усиливает военную мощь королевства и приносит дивиденды каждый цикл!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                  <div className="text-slate-400 text-[10px]">ВАШИ ИНВЕСТИЦИИ:</div>
                  <div className="text-lg font-bold text-amber-400">{kingdom.playerInvestment.toLocaleString()} ⬡</div>
                  <div className="text-[10px] text-emerald-400">+{(kingdom.playerInvestment * 0.08).toFixed(0)} ⬡ дивидендов за цикл</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                  <div className="text-slate-400 text-[10px]">КАЗНА КОРОНЫ:</div>
                  <div className="text-lg font-bold text-cyan-400">{kingdom.treasury.toLocaleString()} ⬡</div>
                  <div className="text-[10px] text-slate-400">Стабильность: Высшая</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                  <div className="text-slate-400 text-[10px]">РЕПУТАЦИОННЫЙ РАНГ:</div>
                  <div className="text-lg font-bold text-purple-400">{getAllegianceTitle(kingdom.allegiance)}</div>
                  <div className="text-[10px] text-slate-400">Лояльность: {kingdom.reputation}%</div>
                </div>
              </div>

              {/* Investment Buttons */}
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                  Выберите сумму взноса в казну:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleInvest(500)}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="font-bold text-amber-300">500 ⬡ Кредитов</span>
                    <span className="text-[10px] text-emerald-400">+10% Репутации Королевства</span>
                  </button>

                  <button
                    onClick={() => handleInvest(1500)}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/50 text-xs font-mono transition-all flex flex-col items-center justify-center gap-1 cursor-pointer shadow-md shadow-amber-950/30"
                  >
                    <span className="font-bold text-amber-300">1,500 ⬡ Кредитов</span>
                    <span className="text-[10px] text-emerald-400">+25% Репутации, +250 XP</span>
                  </button>

                  <button
                    onClick={() => handleInvest(5000)}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/60 text-xs font-mono transition-all flex flex-col items-center justify-center gap-1 cursor-pointer shadow-md shadow-purple-950/30"
                  >
                    <span className="font-bold text-purple-300">5,000 ⬡ Кредитов</span>
                    <span className="text-[10px] text-emerald-400">+60% Репутации, +1000 XP</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
