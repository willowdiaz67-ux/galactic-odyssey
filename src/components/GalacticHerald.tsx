import React, { useState, useEffect, useRef } from 'react';
import { GalacticNewsItem, StarSystem, MarketItem, CommanderProgression, ShipStats, Resources, ExpeditionLogEntry, CycleEconomicSnapshot } from '../types/game';
import { Kingdom, KingdomTitle } from '../types/kingdom';
import { calculateItemPrice } from '../data/galacticNewsData';
import { getHonorLeaderboard } from '../data/galacticHonorBoardData';
import { INITIAL_EXPEDITION_LOGS } from '../data/expeditionLogsData';
import { generateDefaultEconomicHistory } from '../data/economicMetricsData';
import { GalacticHonorBoardWidget } from './GalacticHonorBoardWidget';
import { GalacticExpeditionLogSection } from './GalacticExpeditionLogSection';
import { GalacticEconomicMetricsSection } from './GalacticEconomicMetricsSection';
import { sounds } from '../services/soundEffects';
import { 
  Radio, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Flame, 
  Sparkles, 
  ShieldAlert, 
  Newspaper, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  ExternalLink, 
  RefreshCw, 
  X, 
  Store, 
  Zap, 
  Globe2,
  Clock,
  Layers,
  Award,
  Crown,
  ScrollText,
  BarChart3
} from 'lucide-react';

interface GalacticHeraldProps {
  newsList: GalacticNewsItem[];
  currentSystem: StarSystem;
  onRefreshNews?: () => void;
  onNavigateToMarket?: () => void;
  onNavigateToColonies?: () => void;
  onNavigateToSystemMap?: () => void;
  playerName?: string;
  activeTitle?: KingdomTitle | null;
  commander?: CommanderProgression;
  shipStats?: ShipStats;
  resources?: Resources;
  kingdoms?: Kingdom[];
  onOpenCommanderModal?: () => void;
  onOpenKingdomsTitles?: () => void;
  actionLogs?: ExpeditionLogEntry[];
  economicHistory?: CycleEconomicSnapshot[];
}

export const GalacticHerald: React.FC<GalacticHeraldProps> = ({
  newsList,
  currentSystem,
  onRefreshNews,
  onNavigateToMarket,
  onNavigateToColonies,
  onNavigateToSystemMap,
  playerName = 'Командир Астреи',
  activeTitle = null,
  commander,
  shipStats,
  resources,
  kingdoms,
  onOpenCommanderModal,
  onOpenKingdomsTitles,
  actionLogs,
  economicHistory
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<'news' | 'honor' | 'log' | 'economy'>('news');
  const timerRef = useRef<number | null>(null);

  const [localLogs] = useState<ExpeditionLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('astraea_expedition_logs_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 10);
      }
    } catch {}
    return INITIAL_EXPEDITION_LOGS;
  });

  const displayLogs = (actionLogs && actionLogs.length > 0) ? actionLogs.slice(0, 10) : localLogs.slice(0, 10);

  const [localEconomyHistory] = useState<CycleEconomicSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem('astraea_economic_history_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return generateDefaultEconomicHistory(resources?.credits || 850, resources?.alloys || 75, 2184.2);
  });

  const displayEconomyHistory = (economicHistory && economicHistory.length > 0)
    ? economicHistory
    : (localEconomyHistory && localEconomyHistory.length > 0)
      ? localEconomyHistory
      : generateDefaultEconomicHistory(resources?.credits || 850, resources?.alloys || 75, 2184.2);

  const { playerStats } = React.useMemo(() => {
    return getHonorLeaderboard(
      playerName,
      activeTitle,
      commander,
      shipStats,
      resources,
      kingdoms
    );
  }, [playerName, activeTitle, commander, shipStats, resources, kingdoms]);

  // Auto-cycle through news items every 8 seconds if autoplay enabled
  useEffect(() => {
    if (!isAutoPlay || newsList.length <= 1) return;

    timerRef.current = window.setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % newsList.length);
    }, 8500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlay, newsList.length]);

  if (newsList.length === 0) return null;

  const currentNews = newsList[currentIndex] || newsList[0];

  const isSectorAffected = 
    currentNews.targetSector === 'all' || 
    currentNews.targetSector === currentSystem.sector ||
    currentNews.targetSystemId === currentSystem.id;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playScanPing();
    setCurrentIndex(prev => (prev - 1 + newsList.length) % newsList.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playScanPing();
    setCurrentIndex(prev => (prev + 1) % newsList.length);
  };

  const toggleAutoPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAutoPlay(prev => !prev);
  };

  const getCategoryBadge = (category: GalacticNewsItem['category'], urgency: GalacticNewsItem['urgency']) => {
    switch (category) {
      case 'crisis':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/90 text-rose-300 border border-rose-800">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            КРИЗИС
          </span>
        );
      case 'boom':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-800">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            БУМ
          </span>
        );
      case 'military':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-800">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            СВОДКА
          </span>
        );
      case 'science':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950/90 text-purple-300 border border-purple-800">
            <Sparkles className="w-3 h-3 text-purple-400" />
            ПРОРЫВ
          </span>
        );
      case 'anomaly':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-800">
            <Zap className="w-3 h-3 text-cyan-400" />
            АНОМАЛИЯ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700">
            <Newspaper className="w-3 h-3 text-cyan-400" />
            ИНФО
          </span>
        );
    }
  };

  const getSectorLabel = (sector: GalacticNewsItem['targetSector']) => {
    switch (sector) {
      case 'alpha': return 'Сектор Альфа (Ядро)';
      case 'beta': return 'Сектор Бета (Экспансия)';
      case 'gamma': return 'Сектор Гамма (Рубеж)';
      default: return 'Вся Галактика';
    }
  };

  return (
    <>
      {/* Top Banner / Ticker Component */}
      <div className="w-full bg-[#080C19] border-b border-cyan-950/90 relative z-30 select-none shadow-md">
        <div className="max-w-[1700px] mx-auto px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2.5 text-xs font-mono">
          
          {/* Brand Tag */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                sounds.playScanPing();
                setModalTab('news');
                setIsModalOpen(true);
              }}
              className="group flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 transition-all cursor-pointer shadow-sm shadow-cyan-950"
              title="Открыть сводку Галактического Вестника и влияние на цены"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse group-hover:scale-110 transition-transform" />
              <span className="font-bold tracking-wider text-[11px] text-cyan-200">
                ВЕСТНИК
              </span>
            </button>

            {/* Galactic Board of Honor Quick Widget Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                sounds.playScanPing();
                setModalTab('honor');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gradient-to-r from-amber-950/90 to-amber-900/90 hover:from-amber-900 hover:to-amber-800 border border-amber-500/70 text-amber-200 transition-all cursor-pointer shadow-sm shadow-amber-950 font-bold text-[11px]"
              title="Галактическая доска почёта: текущий ранг среди известных командующих"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">ДОСКА ПОЧЁТА:</span>
              <span className="text-amber-300 font-mono">#{playerStats.rank}</span>
            </button>

            {/* Expedition Action Log Quick Widget Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                sounds.playScanPing();
                setModalTab('log');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gradient-to-r from-emerald-950/90 to-teal-950/90 hover:from-emerald-900 hover:to-teal-900 border border-emerald-500/70 text-emerald-200 transition-all cursor-pointer shadow-sm shadow-emerald-950 font-bold text-[11px]"
              title="Журнал событий экспедиции: последние 10 действий флагмана (стыковки, битвы, колонии, торговля)"
            >
              <ScrollText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">ЖУРНАЛ:</span>
              <span className="text-emerald-300 font-mono">{displayLogs.length}</span>
            </button>

            {/* Economic Indicators Quick Widget Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                sounds.playScanPing();
                setModalTab('economy');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gradient-to-r from-blue-950/90 to-cyan-950/90 hover:from-blue-900 hover:to-cyan-900 border border-cyan-500/70 text-cyan-200 transition-all cursor-pointer shadow-sm shadow-cyan-950 font-bold text-[11px]"
              title="Экономические показатели: динамика кредитов и сплавов за 5 звёздных циклов"
            >
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">ЭКОНОМИКА:</span>
              <span className="text-cyan-300 font-mono">5 ЦИКЛОВ</span>
            </button>

            {/* Current news category */}
            <div className="hidden sm:inline-flex">
              {getCategoryBadge(currentNews.category, currentNews.urgency)}
            </div>

            {/* Sector matching badge */}
            {isSectorAffected ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse">
                <span>В ЭТОМ СЕКТОРЕ</span>
              </span>
            ) : (
              <span className="hidden xl:inline text-[10px] text-slate-500">
                ({getSectorLabel(currentNews.targetSector)})
              </span>
            )}
          </div>

          {/* Headline & Price tags (Main Ticker content) */}
          <div 
            onClick={() => {
              sounds.playScanPing();
              setIsModalOpen(true);
            }}
            className="flex-1 min-w-0 cursor-pointer flex items-center gap-2 overflow-hidden hover:opacity-90 transition-opacity"
            title="Нажмите, чтобы прочитать подробности события и прогноз цен"
          >
            <span className="text-slate-200 truncate font-sans text-xs sm:text-[13px] font-medium">
              <strong className="text-cyan-300 font-mono font-semibold hidden md:inline mr-1">
                [{currentNews.source}]:
              </strong>
              {currentNews.headline}
            </span>

            {/* Price impact pill */}
            {currentNews.priceModifiers.length > 0 && (
              <div className="hidden lg:flex items-center gap-1.5 shrink-0">
                {currentNews.priceModifiers.slice(0, 2).map((mod, i) => (
                  <span 
                    key={i}
                    className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                      mod.multiplier >= 1.0 
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' 
                        : 'bg-rose-950/80 text-rose-300 border-rose-800'
                    }`}
                  >
                    {mod.multiplier >= 1.0 ? (
                      <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-2.5 h-2.5 text-rose-400" />
                    )}
                    <span>{mod.label}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Controls: Prev, Next, Play/Pause, Details Modal */}
          <div className="flex items-center gap-1 shrink-0 text-slate-400">
            <span className="text-[10px] text-slate-500 tabular-nums px-1 hidden sm:inline">
              {currentIndex + 1}/{newsList.length}
            </span>

            <button
              onClick={handlePrev}
              className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors"
              title="Предыдущая новость"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleNext}
              className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors"
              title="Следующая новость"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={toggleAutoPlay}
              className={`p-1 rounded transition-colors hidden sm:block ${
                isAutoPlay ? 'text-cyan-400 hover:bg-cyan-950' : 'text-slate-500 hover:bg-slate-800'
              }`}
              title={isAutoPlay ? 'Приостановить автопрокрутку' : 'Включить автопрокрутку'}
            >
              {isAutoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>

            <button
              onClick={() => {
                sounds.playScanPing();
                setIsModalOpen(true);
              }}
              className="px-2 py-0.5 rounded text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1 transition-colors"
              title="Сводка и влияние на цены"
            >
              <span className="hidden md:inline">Сводка цен</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Galactic Herald Economic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#03050C]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn select-none">
          <div className="bg-[#080D1C] border border-cyan-500/50 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-950 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-cyan-950 bg-gradient-to-r from-slate-950 via-[#0A1024] to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-950/80 rounded-xl border border-cyan-600/60 text-cyan-400 shadow-md shadow-cyan-950">
                  {modalTab === 'honor' ? (
                    <Award className="w-6 h-6 text-amber-400 animate-pulse" />
                  ) : modalTab === 'log' ? (
                    <ScrollText className="w-6 h-6 text-emerald-400 animate-pulse" />
                  ) : modalTab === 'economy' ? (
                    <BarChart3 className="w-6 h-6 text-cyan-400 animate-pulse" />
                  ) : (
                    <Radio className="w-6 h-6 animate-pulse" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      ГАЛАКТИЧЕСКИЙ ВЕСТНИК
                    </span>
                    <span className="text-[10px] font-mono text-amber-400">
                      {modalTab === 'honor' 
                        ? 'РЕЕСТР СЛАВЫ ОФЗ' 
                        : modalTab === 'log' 
                          ? 'ХРОНИКА ЭКСПЕДИЦИИ «АСТРЕЯ»' 
                          : modalTab === 'economy'
                            ? 'ДЕПАРТАМЕНТ ФИНАНСОВ ОФЗ'
                            : 'ЭКОНОМИЧЕСКИЙ БЮЛЛЕТЕНЬ'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-100 mt-0.5">
                    {modalTab === 'honor' 
                      ? 'Галактическая доска почёта' 
                      : modalTab === 'log' 
                        ? 'Журнал событий: последние 10 действий' 
                        : modalTab === 'economy'
                          ? 'Экономические показатели (5 звёздных циклов)'
                          : 'Сводка новостей и влияние на рынок'}
                  </h2>
                </div>
              </div>

              {/* Tab Selector & Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl flex-wrap">
                  <button
                    onClick={() => {
                      sounds.playScanPing();
                      setModalTab('news');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      modalTab === 'news'
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Newspaper className="w-3.5 h-3.5" />
                    <span>Новости & Цены</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playScanPing();
                      setModalTab('honor');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      modalTab === 'honor'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950'
                        : 'text-amber-400 hover:text-amber-200'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Доска Почёта (#{playerStats.rank})</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playScanPing();
                      setModalTab('log');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      modalTab === 'log'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950'
                        : 'text-emerald-400 hover:text-emerald-200'
                    }`}
                  >
                    <ScrollText className="w-3.5 h-3.5" />
                    <span>Журнал событий ({displayLogs.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playScanPing();
                      setModalTab('economy');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      modalTab === 'economy'
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950'
                        : 'text-cyan-400 hover:text-cyan-200'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Экономические показатели</span>
                  </button>
                </div>

                {modalTab === 'news' && onRefreshNews && (
                  <button
                    onClick={() => {
                      sounds.playScanPing();
                      onRefreshNews();
                    }}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-mono font-semibold"
                    title="Перехватить свежие сводки из гиперэфира"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Новая передача</span>
                  </button>
                )}

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Scrollable list of news, Board of Honor, Expedition Action Log, or Economic Indicators */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs font-mono">
              {modalTab === 'honor' ? (
                <GalacticHonorBoardWidget
                  playerName={playerName}
                  activeTitle={activeTitle}
                  commander={commander}
                  shipStats={shipStats}
                  resources={resources}
                  kingdoms={kingdoms}
                  onOpenCommanderModal={onOpenCommanderModal}
                  onOpenKingdomsTitles={onOpenKingdomsTitles}
                />
              ) : modalTab === 'log' ? (
                <GalacticExpeditionLogSection
                  logs={displayLogs}
                  currentSystem={currentSystem}
                  onNavigateToMarket={onNavigateToMarket}
                  onNavigateToColonies={onNavigateToColonies}
                  onNavigateToSystemMap={onNavigateToSystemMap}
                  onCloseModal={() => setIsModalOpen(false)}
                />
              ) : modalTab === 'economy' ? (
                <GalacticEconomicMetricsSection
                  history={displayEconomyHistory}
                  currentSystem={currentSystem}
                  resources={resources}
                  onNavigateToMarket={onNavigateToMarket}
                  onNavigateToColonies={onNavigateToColonies}
                  onCloseModal={() => setIsModalOpen(false)}
                />
              ) : (
                <>
              
              {/* Section 1: Active News Feed */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <h3 className="text-sm font-bold font-heading text-slate-100 flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-cyan-400" />
                    <span>Свежие передачи в гиперэфире ({newsList.length})</span>
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Текущая позиция: <strong className="text-cyan-300">{currentSystem.name} ({currentSystem.sectorName})</strong>
                  </span>
                </div>

                <div className="space-y-3">
                  {newsList.map((item, index) => {
                    const isRelevant = item.targetSector === 'all' || item.targetSector === currentSystem.sector || item.targetSystemId === currentSystem.id;
                    const isSelected = index === currentIndex;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          sounds.playScanPing();
                          setCurrentIndex(index);
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900/90 border-cyan-500/80 shadow-lg shadow-cyan-950/40'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-slate-800/80">
                          <div className="flex items-center gap-2">
                            {getCategoryBadge(item.category, item.urgency)}
                            <span className="text-slate-400 font-mono text-[11px]">
                              {item.source}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-slate-500 text-[10px]">
                              {item.timestamp}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isRelevant ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                                ВЛИЯЕТ НА ТЕКУЩИЙ СЕКТОР
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">
                                {getSectorLabel(item.targetSector)}
                              </span>
                            )}
                          </div>
                        </div>

                        <h4 className="font-heading font-bold text-sm text-slate-100 mt-2">
                          {item.headline}
                        </h4>

                        <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                          {item.summary}
                        </p>

                        {/* Modifiers List */}
                        {item.priceModifiers.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-mono">
                              Влияние на рынок:
                            </span>
                            {item.priceModifiers.map((mod, i) => (
                              <span 
                                key={i}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                                  mod.multiplier >= 1.0 
                                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' 
                                    : 'bg-rose-950/80 text-rose-300 border-rose-800'
                                }`}
                              >
                                {mod.multiplier >= 1.0 ? (
                                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <TrendingDown className="w-3 h-3 text-rose-400" />
                                )}
                                <span>{mod.label}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Local Station Price Table Affected by Herald */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <h3 className="text-sm font-bold font-heading text-slate-100 flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-400" />
                    <span>Цены на станции «{currentSystem.name}» с поправкой Вестника</span>
                  </h3>

                  {onNavigateToMarket && (
                    <button
                      onClick={() => {
                        sounds.playScanPing();
                        setIsModalOpen(false);
                        onNavigateToMarket();
                      }}
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Открыть Торговый Терминал</span>
                    </button>
                  )}
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Товар</th>
                        <th className="py-2.5 px-3">Базовая цена</th>
                        <th className="py-2.5 px-3">Текущая цена (Вестник)</th>
                        <th className="py-2.5 px-3">Изменение</th>
                        <th className="py-2.5 px-3">Причина (Сводка)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {currentSystem.market.map((item) => {
                        const priceInfo = calculateItemPrice(item, currentSystem, newsList);

                        return (
                          <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-2.5 px-3 font-medium text-slate-100">
                              <span className={item.isContraband ? "text-rose-300 font-bold" : "text-slate-100"}>
                                {item.name}
                              </span>
                              {item.isContraband && (
                                <span className="ml-1.5 text-[9px] text-rose-400 bg-rose-950 px-1.5 py-0.2 rounded border border-rose-800">
                                  Контрабанда
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 tabular-nums text-slate-400">
                              {priceInfo.baseBuyPrice} ⬡ / {priceInfo.baseSellPrice} ⬡
                            </td>
                            <td className="py-2.5 px-3 tabular-nums font-bold text-amber-400">
                              {priceInfo.finalBuyPrice} ⬡ (покупка) / <span className="text-emerald-400">{priceInfo.finalSellPrice} ⬡ (продажа)</span>
                            </td>
                            <td className="py-2.5 px-3 tabular-nums">
                              {priceInfo.percentageChange !== 0 ? (
                                <span className={`inline-flex items-center gap-1 font-bold ${
                                  priceInfo.percentageChange > 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}>
                                  {priceInfo.percentageChange > 0 ? (
                                    <TrendingUp className="w-3 h-3" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3" />
                                  )}
                                  {priceInfo.percentageChange > 0 ? `+${priceInfo.percentageChange}%` : `${priceInfo.percentageChange}%`}
                                </span>
                              ) : (
                                <span className="text-slate-500 font-normal">Стабильно</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-400 font-sans">
                              {priceInfo.affectingNews.length > 0 ? (
                                <span className="text-cyan-300">
                                  {priceInfo.affectingNews[0].headline.substring(0, 48)}...
                                </span>
                              ) : (
                                <span className="text-slate-600">Стандартный рыночный спрос</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Сводки Вестника обновляются автоматически при варп-прыжках или по запросу.</span>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors font-bold"
              >
                Закрыть бюллетень
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
