import React, { useState } from 'react';
import { 
  StarSystem, 
  MarketItem, 
  Resources, 
  ShipStats, 
  GalacticNewsItem, 
  MarketEvent,
  ComprehensivePriceInfo
} from '../types/game';
import { 
  getSystemEconomyProfile, 
  calculateComprehensiveItemPrice 
} from '../data/marketEventsData';
import { sounds } from '../services/soundEffects';
import { 
  Store, 
  Package, 
  ArrowUpDown, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Skull,
  ShieldAlert,
  Flame,
  PackageX,
  Sparkles,
  Info,
  Radio,
  CheckCircle2,
  Lock,
  Newspaper,
  Bomb,
  Crosshair,
  Rocket,
  Swords,
  Zap,
  Clock,
  Factory,
  Pickaxe,
  UtensilsCrossed,
  HeartPulse,
  Sprout,
  Cpu,
  ChevronDown,
  ChevronUp,
  Activity,
  Boxes,
  HelpCircle,
  Compass,
  X
} from 'lucide-react';

interface TradeStationProps {
  currentSystem: StarSystem;
  resources: Resources;
  shipStats: ShipStats;
  playerCargo: Record<string, number>;
  pirateHeat: number;
  activeNews?: GalacticNewsItem[];
  marketEvents?: MarketEvent[];
  allSystems?: StarSystem[];
  onBuyCommodity: (item: MarketItem, quantity: number, totalCost: number) => void;
  onSellCommodity: (item: MarketItem, quantity: number, totalEarned: number) => void;
  onJettisonContraband?: () => void;
  onBuyNukes?: (count: number, costCredits: number, costAlloys: number) => void;
  onOpenShipyard?: () => void;
  onSynthesizeAntimatter?: (count: number, costCredits: number, costScience: number) => void;
  onNavigateToSystem?: (systemId: string) => void;
}

export const TradeStation: React.FC<TradeStationProps> = ({
  currentSystem,
  resources,
  shipStats,
  playerCargo,
  pirateHeat,
  activeNews = [],
  marketEvents = [],
  allSystems = [],
  onBuyCommodity,
  onSellCommodity,
  onJettisonContraband,
  onBuyNukes,
  onOpenShipyard,
  onSynthesizeAntimatter,
  onNavigateToSystem
}) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'all' | 'legal' | 'contraband' | 'high_demand' | 'surplus' | 'events' | 'arsenal'>('all');
  const [confirmContrabandBuyItem, setConfirmContrabandBuyItem] = useState<{ item: MarketItem; effectiveBuyPrice: number } | null>(null);
  const [inspectPriceItem, setInspectPriceItem] = useState<{ item: MarketItem; priceInfo: ComprehensivePriceInfo } | null>(null);
  const [showOtherEvents, setShowOtherEvents] = useState<boolean>(false);
  const [showEconomyDetails, setShowEconomyDetails] = useState<boolean>(false);

  // System Economy Profile
  const sysEcon = getSystemEconomyProfile(currentSystem);

  // Active Market Events in Current System & Other Systems
  const activeSystemEvents = marketEvents.filter(e => e.systemId === currentSystem.id);
  const otherSystemEvents = marketEvents.filter(e => e.systemId !== currentSystem.id);

  // Total cargo used by summing all items in ship's cargo hold
  const totalCargoUsed = Object.values(playerCargo).reduce((acc, qty) => acc + qty, 0);

  // Contraband items in player hold
  const contrabandUnitsInHold = currentSystem.market
    .filter(item => item.isContraband)
    .reduce((sum, item) => sum + (playerCargo[item.id] || 0), 0);

  const handleQtyChange = (itemId: string, delta: number, maxAvailable: number) => {
    setQuantities(prev => {
      const cur = prev[itemId] || 1;
      const next = Math.max(1, Math.min(maxAvailable, cur + delta));
      return { ...prev, [itemId]: next };
    });
  };

  const handleBuy = (item: MarketItem, effectiveBuyPrice: number) => {
    const qty = quantities[item.id] || 1;
    const totalCost = qty * effectiveBuyPrice;
    if (resources.credits < totalCost || totalCargoUsed + qty > shipStats.cargoCapacity) {
      sounds.playAlert();
      return;
    }

    if (item.isContraband) {
      setConfirmContrabandBuyItem({ item, effectiveBuyPrice });
      return;
    }

    sounds.playCreditsChime();
    onBuyCommodity({ ...item, buyPrice: effectiveBuyPrice }, qty, totalCost);
  };

  const executeContrabandBuy = (item: MarketItem, effectiveBuyPrice: number) => {
    const qty = quantities[item.id] || 1;
    const totalCost = qty * effectiveBuyPrice;
    sounds.playCreditsChime();
    onBuyCommodity({ ...item, buyPrice: effectiveBuyPrice }, qty, totalCost);
    setConfirmContrabandBuyItem(null);
  };

  const handleSell = (item: MarketItem, effectiveSellPrice: number) => {
    const playerQty = playerCargo[item.id] || 0;
    const qty = Math.min(playerQty, quantities[item.id] || 1);
    const totalEarned = qty * effectiveSellPrice;
    if (playerQty < qty || qty <= 0) {
      sounds.playAlert();
      return;
    }
    sounds.playCreditsChime();
    onSellCommodity({ ...item, sellPrice: effectiveSellPrice }, qty, totalEarned);
  };

  // Pre-calculate price info for all items to enable smart filtering
  const marketWithPrices = currentSystem.market.map(item => ({
    item,
    priceInfo: calculateComprehensiveItemPrice(item, currentSystem, activeNews, marketEvents)
  }));

  // Filtered market list
  const filteredMarket = marketWithPrices.filter(({ item, priceInfo }) => {
    if (activeTab === 'legal') return !item.isContraband;
    if (activeTab === 'contraband') return item.isContraband;
    if (activeTab === 'high_demand') return priceInfo.demandLevel === 'critical_high' || priceInfo.demandLevel === 'high';
    if (activeTab === 'surplus') return priceInfo.supplyLevel === 'surplus' || priceInfo.multiplier < 0.90;
    if (activeTab === 'events') return priceInfo.activeEvents.length > 0;
    return true;
  });

  const getHeatBadge = (heat: number) => {
    if (heat === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
          <CheckCircle2 className="w-3.5 h-3.5" />
          ЧИСТЫЙ ГРУЗ (0%)
        </span>
      );
    }
    if (heat < 35) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/80">
          <AlertCircle className="w-3.5 h-3.5" />
          НИЗКИЙ РИСК ({heat}%)
        </span>
      );
    }
    if (heat < 70) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-orange-950/90 text-orange-400 border border-orange-700/80 animate-pulse">
          <Flame className="w-3.5 h-3.5" />
          ВЫСОКАЯ УГРОЗА ({heat}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-950/90 text-rose-400 border border-rose-600/80 animate-bounce shadow-lg shadow-rose-950">
        <Skull className="w-3.5 h-3.5 text-rose-400" />
        ОХОТА КОРСАРОВ ({heat}%)
      </span>
    );
  };

  const renderEconomyIcon = (iconName: string) => {
    switch (iconName) {
      case 'Factory': return <Factory className="w-3.5 h-3.5" />;
      case 'Cpu': return <Cpu className="w-3.5 h-3.5" />;
      case 'Pickaxe': return <Pickaxe className="w-3.5 h-3.5" />;
      case 'Skull': return <Skull className="w-3.5 h-3.5" />;
      case 'Sparkles': return <Sparkles className="w-3.5 h-3.5" />;
      case 'Zap': return <Zap className="w-3.5 h-3.5" />;
      case 'Radio': return <Radio className="w-3.5 h-3.5" />;
      case 'Sprout': default: return <Sprout className="w-3.5 h-3.5" />;
    }
  };

  const renderEventIcon = (icon: string) => {
    switch (icon) {
      case 'UtensilsCrossed': return <UtensilsCrossed className="w-5 h-5 text-rose-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'Pickaxe': return <Pickaxe className="w-5 h-5 text-emerald-400" />;
      case 'HeartPulse': return <HeartPulse className="w-5 h-5 text-pink-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'Apple': return <Sprout className="w-5 h-5 text-lime-400" />;
      case 'Swords': return <Swords className="w-5 h-5 text-orange-400" />;
      default: return <Activity className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="w-full h-full bg-[#050711] flex flex-col overflow-y-auto p-4 md:p-6 pb-28 md:pb-16 select-none overscroll-contain">
      
      {/* Top Header & Overview Bar */}
      <div className="max-w-[1500px] w-full mx-auto pb-4 border-b border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
            <span>ОРБИТАЛЬНЫЙ ТОРГОВЫЙ ХАБ И ДИНАМИЧЕСКИЙ РЫНОК</span>
            {contrabandUnitsInHold > 0 && (
              <span className="text-[10px] font-bold text-rose-400 bg-rose-950/90 px-2 py-0.5 rounded border border-rose-800 animate-pulse">
                КОНТРАБАНДА НА БОРТУ
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-100 mt-1 flex items-center gap-3">
            <span>Рыночный Терминал: {currentSystem.name}</span>
            
            {/* System Economy Specialization Badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border shadow-sm ${sysEcon.badgeColor}`}>
              {renderEconomyIcon(sysEcon.iconName)}
              <span>{sysEcon.shortTag}</span>
            </span>
          </h1>

          {/* Subtitle with Sector and Economy Advice Toggle */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono mt-1">
            <span>Сектор: <strong className="text-cyan-300 font-semibold">{currentSystem.sectorName}</strong></span>
            <span>·</span>
            <button
              onClick={() => setShowEconomyDetails(prev => !prev)}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 underline underline-offset-2 cursor-pointer transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>{showEconomyDetails ? 'Скрыть профиль экономики' : 'Профиль экономики & Советы'}</span>
            </button>
          </div>
        </div>

        {/* Meters: Cargo and Pirate Heat */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Pirate Heat Tracker */}
          <div className="bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3 text-xs font-mono">
            <div className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-400">
              <Skull className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] font-sans">УГРОЗА ПИРАТОВ (ВАРП-ЗАСАДЫ):</div>
              <div className="mt-0.5">{getHeatBadge(pirateHeat)}</div>
            </div>
          </div>

          {/* Cargo capacity meter */}
          <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-4 text-xs font-mono">
            <Package className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-slate-400 text-[10px] font-sans">ЗАГРУЗКА ТРЮМА:</div>
              <div className="text-slate-200 font-semibold tabular-nums">
                {totalCargoUsed} / {shipStats.cargoCapacity} <span className="text-slate-400 text-[10px]">ед.</span>
              </div>
            </div>
            <div className="w-24 bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-300 ${
                  totalCargoUsed >= shipStats.cargoCapacity 
                    ? 'bg-rose-500' 
                    : contrabandUnitsInHold > 0 
                      ? 'bg-gradient-to-r from-amber-400 to-rose-500' 
                      : 'bg-cyan-400'
                }`}
                style={{ width: `${Math.min(100, (totalCargoUsed / shipStats.cargoCapacity) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* System Economy Detailed Profile Box (Collapsible) */}
      {showEconomyDetails && (
        <div className="max-w-[1500px] w-full mx-auto mt-4 p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 shadow-xl text-xs font-mono space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
              <Factory className="w-4 h-4 text-amber-400" />
              <span>Экономическая Специфика Системы: {sysEcon.name}</span>
            </div>
            <button 
              onClick={() => setShowEconomyDetails(false)}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-300 font-sans leading-relaxed">
            {sysEcon.description}
          </p>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-slate-300 font-sans">
              <strong className="text-emerald-300 font-mono">Торговый ориентир: </strong>
              {sysEcon.tradingAdvice}
            </div>
          </div>
        </div>
      )}

      {/* Contraband Alert Banner (if carrying contraband) */}
      {contrabandUnitsInHold > 0 && (
        <div className="max-w-[1500px] w-full mx-auto mt-4 bg-gradient-to-r from-rose-950/80 via-slate-900/90 to-rose-950/70 border border-rose-600/60 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl shadow-rose-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-900/60 rounded-lg text-rose-300 border border-rose-700/60 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="font-heading font-bold text-sm text-rose-200 flex items-center gap-2">
                <span>ВНИМАНИЕ: В ТРЮМЕ НАХОДИТСЯ {contrabandUnitsInHold} ЕД. КОНТРАБАНДЫ!</span>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Излучение запрещённых грузов привлекает корсаров Синдиката. Вероятность перехвата в варп-прыжке: <strong className="text-rose-400 font-mono">{pirateHeat}%</strong>.
              </p>
            </div>
          </div>

          {onJettisonContraband && (
            <button
              onClick={() => {
                sounds.playAlert();
                onJettisonContraband();
              }}
              className="px-3.5 py-2 bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-600 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-md shadow-rose-950"
            >
              <PackageX className="w-4 h-4 text-rose-300" />
              <span>Сбросить за борт (0% Угрозы)</span>
            </button>
          )}
        </div>
      )}

      {/* ACTIVE TEMPORARY MARKET EVENTS IN THIS SYSTEM */}
      {activeSystemEvents.length > 0 && (
        <div className="max-w-[1500px] w-full mx-auto mt-4 space-y-3">
          {activeSystemEvents.map((event) => (
            <div 
              key={event.id}
              className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-2 rounded-xl p-4 shadow-xl relative overflow-hidden"
              style={{ borderColor: `${event.color}80` }}
            >
              {/* Background accent glow */}
              <div 
                className="absolute -right-8 -top-8 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-20"
                style={{ backgroundColor: event.color }}
              />

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 relative z-10 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2.5 rounded-xl border flex items-center justify-center shrink-0"
                    style={{ 
                      backgroundColor: `${event.color}20`, 
                      borderColor: `${event.color}60` 
                    }}
                  >
                    {renderEventIcon(event.icon)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border" style={{ color: event.color, borderColor: `${event.color}50`, backgroundColor: `${event.color}15` }}>
                        ВРЕМЕННОЕ РЫНОЧНОЕ СОБЫТИЕ
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>Осталось циклов: <strong className="text-cyan-300 font-bold">{event.remainingCycles}</strong></span>
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-base text-slate-100 mt-1">
                      {event.title}
                    </h3>
                  </div>
                </div>

                {/* Event Urgency & Tag */}
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                    event.urgency === 'critical'
                      ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
                      : event.urgency === 'high'
                      ? 'bg-amber-950 text-amber-300 border-amber-600'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  }`}>
                    {event.urgency === 'critical' ? 'ЭКСТРЕННЫЙ СПРОС' : event.urgency === 'high' ? 'ВЫСОКИЙ ИМПУЛЬС' : 'РЫНОЧНЫЙ СДВИГ'}
                  </span>
                </div>
              </div>

              {/* Event Description & Price Modifiers Pills */}
              <div className="mt-3 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                <p className="text-slate-300 font-sans leading-relaxed flex-1">
                  {event.description}
                </p>

                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  {event.modifiers.map((mod, i) => (
                    <span 
                      key={i}
                      className="px-2.5 py-1 rounded text-xs font-mono font-bold border flex items-center gap-1.5"
                      style={{ 
                        backgroundColor: mod.multiplier > 1.0 ? '#10B98125' : '#F43F5E25',
                        borderColor: mod.multiplier > 1.0 ? '#10B98160' : '#F43F5E60',
                        color: mod.multiplier > 1.0 ? '#34D399' : '#FB7185'
                      }}
                    >
                      {mod.multiplier > 1.0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>{mod.label}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Trader Flavor Tip */}
              {event.flavorTip && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-2 text-xs font-mono text-cyan-300">
                  <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Совет трейдера: <strong className="text-slate-200">{event.flavorTip}</strong></span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* GALAXY-WIDE MARKET RUMORS (Events in Other Star Systems) */}
      {otherSystemEvents.length > 0 && (
        <div className="max-w-[1500px] w-full mx-auto mt-4">
          <button
            onClick={() => setShowOtherEvents(prev => !prev)}
            className="w-full p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono transition-all text-slate-300 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Слухи о рынках других звёздных систем ({otherSystemEvents.length} активных событий):</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <span>{showOtherEvents ? 'Скрыть события' : 'Раскрыть возможности арбитража'}</span>
              {showOtherEvents ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showOtherEvents && (
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 animate-fadeIn">
              {otherSystemEvents.map((oe) => (
                <div 
                  key={oe.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-2 shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                        {oe.systemName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>{oe.remainingCycles} ц.</span>
                      </span>
                    </div>
                    <h4 className="font-heading font-bold text-xs text-slate-100 mt-1">
                      {oe.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-sans mt-1 line-clamp-2">
                      {oe.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono">
                    <div className="text-emerald-400 font-bold">
                      {oe.modifiers[0]?.label}
                    </div>
                    {oe.flavorTip && (
                      <span className="text-slate-400 italic">
                        Совет: {oe.flavorTip.substring(0, 36)}...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Galactic Herald News Impulse Banner */}
      {(() => {
        const sectorNews = activeNews.filter(n => n.targetSector === 'all' || n.targetSector === currentSystem.sector || n.targetSystemId === currentSystem.id);
        if (sectorNews.length === 0) return null;

        return (
          <div className="max-w-[1500px] w-full mx-auto mt-4 p-3 bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-slate-900/50 border border-cyan-700/40 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
              <div>
                <span className="font-bold text-cyan-200 flex items-center gap-1.5">
                  <span>НОВОСТНОЙ ИМПУЛЬС «ГАЛАКТИЧЕСКОГО ВЕСТНИКА»:</span>
                </span>
                <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                  Торговые котировки синхронизированы со свежими репортажами информбюро.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {sectorNews.flatMap(n => n.priceModifiers).map((mod, i) => (
                <span 
                  key={i}
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                    mod.multiplier >= 1.0 
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                      : 'bg-rose-950 text-rose-300 border-rose-800'
                  }`}
                >
                  {mod.multiplier >= 1.0 ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
                  <span>{mod.label}</span>
                </span>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Market Category and Smart Indicators Selector */}
      <div className="max-w-[1500px] w-full mx-auto mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto max-w-full scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Все товары ({currentSystem.market.length})
          </button>
          
          <button
            onClick={() => setActiveTab('high_demand')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'high_demand'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950'
                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/40'
            }`}
            title="Товары с высоким или критическим спросом — выгодная продажа со станции"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>🔥 Высокий спрос</span>
          </button>

          <button
            onClick={() => setActiveTab('surplus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'surplus'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40'
            }`}
            title="Товары в избытке предложения — низкая цена закупки"
          >
            <Package className="w-3.5 h-3.5" />
            <span>📦 Избыток предложения</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'events'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                : 'text-purple-400 hover:text-purple-300 hover:bg-purple-950/40'
            }`}
            title="Товары, затронутые временными событиями"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ События</span>
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'legal'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Легальные
          </button>

          <button
            onClick={() => setActiveTab('contraband')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'contraband'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/40'
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            <span>Контрабанда ({currentSystem.market.filter(m => m.isContraband).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('arsenal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'arsenal'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950'
                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/40'
            }`}
          >
            <Bomb className="w-3.5 h-3.5" />
            <span>☢ Арсенал ({resources.nukes ?? 0})</span>
          </button>
        </div>

        {/* Dynamic Trade Strategy Advice */}
        <div className="text-xs text-slate-400 font-mono hidden xl:flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Спрос и предложение зависят от профиля системы («{sysEcon.name}») и активных событий!</span>
        </div>
      </div>

      {/* Arsenal & Nukes Depot OR Market Commodity Table */}
      {activeTab === 'arsenal' ? (
        <div className="max-w-[1500px] w-full mx-auto mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Thermonuclear Warhead (Nuke) Single & Pack */}
          <div className="bg-slate-900/80 border-2 border-amber-500/50 rounded-xl p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600 font-mono text-[10px] font-bold">
                  СТРАТЕГИЧЕСКИЙ БОЕПРИПАС
                </span>
                <span className="text-amber-400 font-mono text-xs font-bold">В наличии: {resources.nukes ?? 0} шт.</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 font-heading mt-2 flex items-center gap-2">
                <span className="text-xl">☢</span>
                <span>Термоядерная Боеголовка «Ядерка»</span>
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">
                Сверхмощный тактический ядерный заряд субсветового ускорения. В бою наносит до 300+ прямого урона и генерирует разрушительную ударную волну по всем соседним кораблям.
              </p>
              <div className="mt-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Стоимость 1 шт.:</span>
                  <span className="text-amber-400 font-bold">850 ⬡ + 50 Сплавов</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Место в трюме:</span>
                  <span className="text-emerald-400 font-bold">0 ед. (В оружейных шахтах)</span>
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2">
              <button
                disabled={resources.credits < 850 || resources.alloys < 50}
                onClick={() => {
                  sounds.playCreditsChime();
                  onBuyNukes?.(1, 850, 50);
                }}
                className="flex-1 py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer shadow-lg shadow-amber-950"
              >
                <span>Купить 1 Ядерку (850 ⬡)</span>
              </button>
              <button
                disabled={resources.credits < 2400 || resources.alloys < 135}
                onClick={() => {
                  sounds.playCreditsChime();
                  onBuyNukes?.(3, 2400, 135);
                }}
                className="py-2.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer shadow-lg shadow-amber-950"
                title="Пакет из 3 боеголовок со скидкой"
              >
                <span>Пакет ×3 (2400 ⬡)</span>
              </button>
            </div>
          </div>

          {/* Card 2: Antimatter Synthesis */}
          <div className="bg-slate-900/80 border-2 border-purple-500/50 rounded-xl p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-600 font-mono text-[10px] font-bold">
                  КВАНТОВЫЙ СИНТЕЗ
                </span>
                <span className="text-fuchsia-400 font-mono text-xs font-bold">Запас: {resources.antimatter} ед.</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 font-heading mt-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span>Заряд Стабилизированной Антиматерии</span>
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">
                Высокоэнергетический компонент для тяжёлых торпед сингулярности и перегрузки щитов. Используется для мощных тактических атак и питания гиперреакторов флагманов.
              </p>
              <div className="mt-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Стоимость +5 ед.:</span>
                  <span className="text-purple-300 font-bold">600 ⬡ + 40 Науки</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Стабильность:</span>
                  <span className="text-emerald-400 font-bold">100% герметично</span>
                </div>
              </div>
            </div>
            <div className="mt-5">
              <button
                disabled={resources.credits < 600 || resources.science < 40}
                onClick={() => {
                  sounds.playScanPing();
                  onSynthesizeAntimatter?.(5, 600, 40);
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer shadow-lg shadow-purple-950"
              >
                <span>Синтезировать +5 Антиматерии (600 ⬡)</span>
              </button>
            </div>
          </div>

          {/* Card 3: Warship Shipyard Direct Link */}
          <div className="bg-slate-900/80 border-2 border-cyan-500/50 rounded-xl p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-600 font-mono text-[10px] font-bold">
                  МАГАЗИН КОРАБЛЕЙ
                </span>
                <span className="text-cyan-400 font-mono text-xs font-bold">Орбитальные Доки</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 font-heading mt-2 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-cyan-400" />
                <span>Покупка Боевых Кораблей и Дредноутов</span>
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">
                Доступ к каталогу кораблей: от лёгких перехватчиков «Сапсан» до сверхтяжёлых линкоров класса «Аполлон» и «Зодчий Предтеч».
              </p>
            </div>
            <div className="mt-5">
              <button
                onClick={() => {
                  sounds.playScanPing();
                  onOpenShipyard?.();
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-cyan-950"
              >
                <span>Перейти в Корабельный Ангар</span>
              </button>
            </div>
          </div>
        </div>
      ) : (

      /* Market Commodity Table with Demand/Supply Indicators */
      <div className="max-w-[1500px] w-full mx-auto mt-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Товар / Категория</th>
                  <th className="py-3.5 px-4">Спрос и Предложение</th>
                  <th className="py-3.5 px-4">В Наличии</th>
                  <th className="py-3.5 px-4">Покупка</th>
                  <th className="py-3.5 px-4">Продажа</th>
                  <th className="py-3.5 px-4">В Трюме</th>
                  <th className="py-3.5 px-4 text-center">Количество</th>
                  <th className="py-3.5 px-4 text-right">Сделка</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredMarket.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      Нет товаров, соответствующих выбранному фильтру.
                    </td>
                  </tr>
                ) : (
                  filteredMarket.map(({ item, priceInfo }) => {
                    const playerStock = playerCargo[item.id] || 0;
                    const qty = quantities[item.id] || 1;
                    const effectiveBuyPrice = priceInfo.finalBuyPrice;
                    const effectiveSellPrice = priceInfo.finalSellPrice;
                    const canBuy = resources.credits >= qty * effectiveBuyPrice && totalCargoUsed + qty <= shipStats.cargoCapacity && item.stock >= qty;
                    const canSell = playerStock >= qty && qty > 0;

                    return (
                      <tr 
                        key={item.id} 
                        className={`transition-colors ${
                          item.isContraband 
                            ? 'bg-rose-950/15 hover:bg-rose-950/30 border-l-2 border-l-rose-500' 
                            : 'hover:bg-slate-800/30'
                        }`}
                      >
                        {/* Name & Description */}
                        <td className="py-3.5 px-4 font-medium text-slate-100 max-w-xs">
                          <div className="flex items-center gap-2">
                            {item.isContraband ? (
                              <span className="p-1 rounded bg-rose-950 border border-rose-700/80 text-rose-400 shrink-0">
                                <Skull className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="p-1 rounded bg-slate-950 border border-slate-800 text-cyan-400 shrink-0">
                                <Package className="w-3.5 h-3.5" />
                              </span>
                            )}
                            <span className={`font-heading text-sm ${item.isContraband ? 'text-rose-200 font-bold' : 'text-slate-100'}`}>
                              {item.name}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 font-sans mt-1 line-clamp-2">
                            {item.description}
                          </div>

                          {/* Extra Badges: Events / Demand hints */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {priceInfo.activeEvents.length > 0 && (
                              <span className="text-[10px] text-purple-300 font-mono bg-purple-950/80 px-2 py-0.5 rounded border border-purple-700/70 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-purple-400" />
                                <span>{priceInfo.activeEvents[0].title}</span>
                              </span>
                            )}

                            {priceInfo.affectingNews.length > 0 && (
                              <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700/70 flex items-center gap-1">
                                <Radio className="w-3 h-3 text-cyan-400" />
                                <span>Вестник: {priceInfo.affectingNews[0].headline.substring(0, 28)}...</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* SUPPLY & DEMAND INDICATOR COLUMN */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1.5 min-w-[150px]">
                            {/* Demand Indicator Badge */}
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] text-slate-400 font-mono">СПРОС:</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                                priceInfo.demandLevel === 'critical_high'
                                  ? 'bg-rose-950/90 text-rose-300 border-rose-600 animate-pulse'
                                  : priceInfo.demandLevel === 'high'
                                  ? 'bg-amber-950/90 text-amber-300 border-amber-600'
                                  : priceInfo.demandLevel === 'low'
                                  ? 'bg-slate-950 text-slate-400 border-slate-800'
                                  : 'bg-slate-900 text-slate-300 border-slate-700'
                              }`}>
                                {priceInfo.demandLevel === 'critical_high' && <Flame className="w-3 h-3 text-rose-400" />}
                                {priceInfo.demandLevel === 'high' && <TrendingUp className="w-3 h-3 text-amber-400" />}
                                {priceInfo.demandLevel === 'low' && <TrendingDown className="w-3 h-3 text-slate-500" />}
                                <span>{priceInfo.demandLabel}</span>
                              </span>
                            </div>

                            {/* Supply Indicator Badge */}
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] text-slate-400 font-mono">ПРЕДЛОЖЕНИЕ:</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                                priceInfo.supplyLevel === 'critical_deficit'
                                  ? 'bg-rose-950/90 text-rose-300 border-rose-700'
                                  : priceInfo.supplyLevel === 'surplus'
                                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600'
                                  : priceInfo.supplyLevel === 'low'
                                  ? 'bg-orange-950/80 text-orange-300 border-orange-700'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}>
                                {priceInfo.supplyLevel === 'surplus' && <Package className="w-3 h-3 text-emerald-400" />}
                                {priceInfo.supplyLevel === 'critical_deficit' && <AlertCircle className="w-3 h-3 text-rose-400" />}
                                <span>{priceInfo.supplyLabel}</span>
                              </span>
                            </div>

                            {/* Interactive Price Breakdown Trigger */}
                            <button
                              onClick={() => setInspectPriceItem({ item, priceInfo })}
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-0.5 underline underline-offset-2 cursor-pointer self-start"
                            >
                              <HelpCircle className="w-3 h-3" />
                              <span>Детализация расчёта цены</span>
                            </button>
                          </div>
                        </td>

                        {/* Stock on Station */}
                        <td className="py-3.5 px-4 tabular-nums">
                          {item.stock > 0 ? (
                            <span className="text-slate-200 font-semibold">{item.stock} шт.</span>
                          ) : (
                            <span className="text-slate-500 italic">0 шт. (Только скупка)</span>
                          )}
                        </td>

                        {/* Buy Price with Economy & Event Modifiers */}
                        <td className="py-3.5 px-4 tabular-nums">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-amber-400 text-sm">
                              {effectiveBuyPrice} ⬡
                            </span>
                            {priceInfo.percentageChange !== 0 && (
                              <span 
                                title={`Базовая закупка: ${item.buyPrice} ⬡`}
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                  priceInfo.percentageChange > 0 
                                    ? 'bg-rose-950/70 text-rose-300 border-rose-800' 
                                    : 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                                }`}
                              >
                                {priceInfo.percentageChange > 0 ? `+${priceInfo.percentageChange}%` : `${priceInfo.percentageChange}%`}
                              </span>
                            )}
                          </div>
                          {priceInfo.percentageChange !== 0 && (
                            <span className="text-[10px] text-slate-500 line-through block mt-0.5">
                              базовая: {item.buyPrice} ⬡
                            </span>
                          )}
                        </td>

                        {/* Sell Price with Economy & Event Modifiers */}
                        <td className="py-3.5 px-4 tabular-nums">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-emerald-400 text-sm">
                              {effectiveSellPrice} ⬡
                            </span>
                            {priceInfo.percentageChange !== 0 && (
                              <span 
                                title={`Базовая скупка: ${item.sellPrice} ⬡`}
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                  priceInfo.percentageChange > 0 
                                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800' 
                                    : 'bg-rose-950/70 text-rose-300 border-rose-800'
                                }`}
                              >
                                {priceInfo.percentageChange > 0 ? `+${priceInfo.percentageChange}%` : `${priceInfo.percentageChange}%`}
                              </span>
                            )}
                          </div>
                          {priceInfo.percentageChange !== 0 && (
                            <span className="text-[10px] text-slate-500 line-through block mt-0.5">
                              базовая: {item.sellPrice} ⬡
                            </span>
                          )}
                        </td>

                        {/* Player Stock in Cargo Hold */}
                        <td className="py-3.5 px-4 tabular-nums">
                          {playerStock > 0 ? (
                            <span className={`font-bold px-2 py-0.5 rounded border ${
                              item.isContraband 
                                ? 'bg-rose-950/80 text-rose-300 border-rose-700/80' 
                                : 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80'
                            }`}>
                              {playerStock} шт.
                            </span>
                          ) : (
                            <span className="text-slate-600 font-mono">0 шт.</span>
                          )}
                        </td>

                        {/* Quantity Controls */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                            <button
                              onClick={() => handleQtyChange(item.id, -1, 50)}
                              className="px-2 py-0.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-8 text-center tabular-nums text-slate-100 font-bold">
                              {qty}
                            </span>
                            <button
                              onClick={() => handleQtyChange(item.id, 1, 50)}
                              className="px-2 py-0.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            >
                              +
                            </button>
                            <button
                              onClick={() => handleQtyChange(item.id, 5, 50)}
                              className="px-1.5 py-0.5 text-[10px] text-cyan-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            >
                              +5
                            </button>
                          </div>
                        </td>

                        {/* Deal Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              disabled={!canBuy}
                              onClick={() => handleBuy(item, effectiveBuyPrice)}
                              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                                canBuy
                                  ? item.isContraband
                                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950 cursor-pointer font-bold'
                                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-950 cursor-pointer'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                              }`}
                            >
                              Купить ({qty * effectiveBuyPrice} ⬡)
                            </button>

                            <button
                              disabled={!canSell}
                              onClick={() => handleSell(item, effectiveSellPrice)}
                              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                                canSell
                                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-950 cursor-pointer font-bold'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                              }`}
                            >
                              Продать (+{qty * effectiveSellPrice} ⬡)
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* PRICE BREAKDOWN AND SUPPLY/DEMAND DETAIL MODAL */}
      {inspectPriceItem && (
        <div className="fixed inset-0 bg-[#04060C]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#0D111E] border-2 border-cyan-500/70 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-cyan-950/80 flex flex-col gap-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-600/70 text-cyan-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase">
                    АНАЛИЗ СПРОСА, ПРЕДЛОЖЕНИЯ И ЦЕНООБРАЗОВАНИЯ
                  </span>
                  <h3 className="text-lg font-bold font-heading text-slate-100 mt-0.5">
                    {inspectPriceItem.item.name}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setInspectPriceItem(null)}
                className="text-slate-400 hover:text-slate-100 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Rates Summary Card */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">ТЕКУЩАЯ ЗАКУПКА:</span>
                <span className="text-lg font-bold text-amber-400 tabular-nums">
                  {inspectPriceItem.priceInfo.finalBuyPrice} ⬡
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Базовая: {inspectPriceItem.priceInfo.baseBuyPrice} ⬡
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">ТЕКУЩАЯ СКУПКА (ПРОДАЖА):</span>
                <span className="text-lg font-bold text-emerald-400 tabular-nums">
                  {inspectPriceItem.priceInfo.finalSellPrice} ⬡
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Базовая: {inspectPriceItem.priceInfo.baseSellPrice} ⬡
                </span>
              </div>
            </div>

            {/* Demand & Supply Assessment */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">ИНДИКАТОР СПРОСА:</span>
                <div className="font-bold text-slate-100 flex items-center gap-1.5">
                  {inspectPriceItem.priceInfo.demandLevel === 'critical_high' && <Flame className="w-4 h-4 text-rose-400" />}
                  {inspectPriceItem.priceInfo.demandLevel === 'high' && <TrendingUp className="w-4 h-4 text-amber-400" />}
                  <span>{inspectPriceItem.priceInfo.demandLabel}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">ИНДИКАТОР ПРЕДЛОЖЕНИЯ:</span>
                <div className="font-bold text-slate-100 flex items-center gap-1.5">
                  {inspectPriceItem.priceInfo.supplyLevel === 'surplus' && <Package className="w-4 h-4 text-emerald-400" />}
                  {inspectPriceItem.priceInfo.supplyLevel === 'critical_deficit' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                  <span>{inspectPriceItem.priceInfo.supplyLabel}</span>
                </div>
              </div>
            </div>

            {/* Price Component Breakdown */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Факторы влияния на коэффициенты:
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {inspectPriceItem.priceInfo.breakdown.map((b, i) => (
                  <div 
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-3 text-xs font-mono"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{b.title}</div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5">{b.description}</div>
                    </div>
                    <span className={`font-bold px-2 py-0.5 rounded text-[11px] whitespace-nowrap shrink-0 ${
                      b.factor > 1.0 
                        ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                        : b.factor < 1.0 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {b.factor > 1.0 ? `+${Math.round((b.factor - 1.0) * 100)}%` : b.factor < 1.0 ? `${Math.round((b.factor - 1.0) * 100)}%` : 'База'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tactical Advice */}
            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/50 flex items-start gap-2 text-xs font-mono text-cyan-200">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-300">Рекомендация: </strong>
                {inspectPriceItem.priceInfo.multiplier > 1.20 ? (
                  <span>В этой системе действует высокая наценка скупки! Сбывайте данный товар из трюма для извлечения максимальной маржи.</span>
                ) : inspectPriceItem.priceInfo.multiplier < 0.85 ? (
                  <span>Станция перенасыщена предложением! Закупайте этот товар по сниженным оптовым расценкам для экспорта в другие звёздные сектора.</span>
                ) : (
                  <span>Цены на товар находятся на балансном уровне. Следите за свежими событиями в Галактическом Вестнике.</span>
                )}
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectPriceItem(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer"
              >
                Закрыть окно анализа
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contraband Purchase Warning Modal */}
      {confirmContrabandBuyItem && (
        <div className="fixed inset-0 bg-[#04060C]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#0F0B17] border-2 border-rose-500/70 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-rose-950/80 flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-3 border-b border-rose-900/60">
              <div className="p-3 bg-rose-950 rounded-xl border border-rose-600/70 text-rose-400 animate-pulse">
                <Skull className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-rose-400 tracking-wider uppercase">
                  ПРЕДУПРЕЖДЕНИЕ: ПОКУПКА КОНТРАБАНДЫ
                </span>
                <h3 className="text-lg font-bold font-heading text-slate-100 mt-0.5">
                  {confirmContrabandBuyItem.item.name}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Вы собираетесь приобрести нелегальный груз в количестве <strong className="text-amber-400 font-mono">{quantities[confirmContrabandBuyItem.item.id] || 1} шт.</strong> за <strong className="text-amber-400 font-mono">{(quantities[confirmContrabandBuyItem.item.id] || 1) * confirmContrabandBuyItem.effectiveBuyPrice} ⬡</strong>.
            </p>

            <div className="bg-rose-950/50 border border-rose-900/60 rounded-xl p-3 text-xs text-rose-200 space-y-1.5 font-mono">
              <div className="flex items-center gap-2 text-rose-300 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>РИСК ПЕРЕХВАТА ПИРАТАМИ В ВАРПЕ:</span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans">
                Каждая единица повышает уровень угрозы корсаров на <strong>+{confirmContrabandBuyItem.item.contrabandRisk || 15}%</strong>. Корсары и мародёры будут устраивать засады при совершении гиперпрыжков!
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmContrabandBuyItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={() => executeContrabandBuy(confirmContrabandBuyItem.item, confirmContrabandBuyItem.effectiveBuyPrice)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-lg shadow-rose-950 cursor-pointer"
              >
                Подтвердить покупку груза
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
