import React, { useState } from 'react';
import { 
  Compass, 
  Orbit, 
  Building2, 
  Rocket, 
  Store, 
  Cpu, 
  Volume2, 
  VolumeX, 
  Save, 
  Users2,
  Swords,
  Award,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Lock,
  Skull,
  Crown,
  Landmark,
  Sparkle
} from 'lucide-react';
import { ActiveScreen, Resources, ShipStats, CommanderProgression } from '../types/game';
import { KingdomTitle } from '../types/kingdom';
import { sounds } from '../services/soundEffects';

interface TopBarProps {
  activeScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  resources: Resources;
  shipStats: ShipStats;
  stardate: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSaveGame: () => void;
  onOpenFactions: () => void;
  commander?: CommanderProgression;
  onOpenCommanderModal?: () => void;
  pirateHeat?: number;
  contrabandCount?: number;
  arrestedPiratesCount?: number;
  playerName?: string;
  activeTitle?: KingdomTitle | null;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeScreen,
  onSelectScreen,
  resources,
  shipStats,
  stardate,
  soundEnabled,
  onToggleSound,
  onSaveGame,
  onOpenFactions,
  commander,
  onOpenCommanderModal,
  pirateHeat = 0,
  contrabandCount = 0,
  arrestedPiratesCount = 0,
  playerName = 'Командир Астреи',
  activeTitle = null
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveScreen; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'GALAXY_MAP', label: 'Карта Галактики', icon: <Compass className="w-4 h-4" /> },
    { id: 'SYSTEM_VIEW', label: 'Система', icon: <Orbit className="w-4 h-4" /> },
    { id: 'COLONY_MANAGER', label: 'Колонии', icon: <Building2 className="w-4 h-4" /> },
    { 
      id: 'SHIP_HANGAR', 
      label: 'Верфь & Корабль', 
      icon: <Rocket className="w-4 h-4 text-cyan-400" />,
      badge: 'ВЕРФЬ'
    },
    { id: 'TRADE_STATION', label: 'Рынок', icon: <Store className="w-4 h-4" /> },
    { 
      id: 'POLICE_PRISON', 
      label: 'Полиция и Тюрьма', 
      icon: <Lock className="w-4 h-4 text-amber-400" />, 
      badge: arrestedPiratesCount > 0 ? `${arrestedPiratesCount} ЗЭК` : undefined 
    },
    { id: 'RESEARCH', label: 'Наука', icon: <Cpu className="w-4 h-4" /> },
    { 
      id: 'KINGS_NPC', 
      label: 'Короли & NPC', 
      icon: <Crown className="w-4 h-4 text-amber-400" />, 
      badge: '👑 МОНАРХИ' 
    },
    { 
      id: 'KINGDOMS', 
      label: 'Королевства', 
      icon: <Landmark className="w-4 h-4 text-amber-400" />, 
      badge: '5 ДЕРЖАВ' 
    },
    { id: 'COMBAT', label: 'Тактический Бой', icon: <Swords className="w-4 h-4 text-rose-400" />, badge: '40 УР.' },
  ];

  return (
    <>
      <header className="flex flex-col border-b border-slate-800 bg-[#090D1A]/95 backdrop-blur-md sticky top-0 z-50">
        {/* Upper Zone */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 max-w-[1700px] w-full mx-auto gap-2">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span 
              onClick={() => onSelectScreen('GALAXY_MAP')}
              className="text-base sm:text-lg font-bold tracking-wider text-cyan-400 font-heading cursor-pointer hover:text-cyan-300 transition-colors whitespace-nowrap"
            >
              ASTRAEA
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 font-mono">
              ДАТА: {stardate.toFixed(1)}
            </span>
          </div>

          {/* Zone 2: Desktop Navigation Links (hidden on mobile, shown on md+) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sounds.playScanPing();
                    onSelectScreen(item.id);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span className="hidden lg:inline">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Player Name & Kingdom Title Badge */}
            <button
              onClick={() => {
                sounds.playScanPing();
                if (onOpenCommanderModal) onOpenCommanderModal();
              }}
              title={activeTitle ? `Командир: ${playerName} · Титул: ${activeTitle.title} (${activeTitle.kingdomName})` : `Командир: ${playerName}`}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyan-500/50 transition-all text-xs select-none shadow-sm cursor-pointer"
            >
              <span className="font-semibold text-slate-200 hidden md:inline truncate max-w-[120px]">
                {playerName}
              </span>
              {activeTitle ? (
                <span 
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold border truncate max-w-[170px]"
                  style={{
                    color: activeTitle.color,
                    borderColor: `${activeTitle.color}66`,
                    backgroundColor: `${activeTitle.color}22`
                  }}
                >
                  <span className="shrink-0">{activeTitle.badgeEmoji}</span>
                  <span className="truncate">«{activeTitle.title}»</span>
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-mono hidden lg:inline">
                  Вольный
                </span>
              )}
            </button>

            {commander && onOpenCommanderModal && (
              <button
                onClick={() => {
                  sounds.playScanPing();
                  onOpenCommanderModal();
                }}
                title="Профиль и навыки командира (Уровень 1-40)"
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-950/70 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 transition-all shadow-sm shadow-cyan-950"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>УР.{commander.level}</span>
                {commander.skillPoints > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>
            )}

            <button
              onClick={() => {
                sounds.playScanPing();
                onSelectScreen('SHIP_HANGAR');
              }}
              title="Корабельная Верфь: покупка кораблей и смена флагмана"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-300 bg-amber-950/70 hover:bg-amber-900/70 border border-amber-500/50 shadow-sm shadow-amber-950 transition-all cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>Купить Корабль</span>
            </button>

            <button
              onClick={() => {
                sounds.playScanPing();
                onOpenFactions();
              }}
              title="Фракции, Дипломатия и Галактические Войны"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors"
            >
              <Users2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden lg:inline">Фракции & Войны</span>
            </button>

            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              onClick={() => {
                sounds.playCreditsChime();
                onSaveGame();
              }}
              title="Сохранить прогресс"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded text-xs font-semibold text-cyan-950 bg-cyan-400 hover:bg-cyan-300 transition-colors whitespace-nowrap shadow-sm shadow-cyan-900/50"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Сохранить</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="md:hidden p-1.5 rounded text-slate-300 hover:text-cyan-400 hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Меню навигации"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-rose-400" /> : <Menu className="w-5 h-5 text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* Lower Telemetry Ribbon: Responsive scroll on mobile */}
        <div className="border-t border-slate-850/80 bg-[#060913]/95 px-3 sm:px-4 py-1.5 text-xs text-slate-300 overflow-x-auto scrollbar-none">
          <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-3 font-mono min-w-max sm:min-w-0">
            <div className="flex items-center gap-3 sm:gap-6 flex-nowrap whitespace-nowrap">
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-[11px] sm:text-xs">КРЕД:</span>
                <span className="font-semibold text-amber-400 tabular-nums">{resources.credits}⬡</span>
              </div>
              <span className="text-slate-700" aria-hidden="true">·</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-[11px] sm:text-xs">ТОПЛИВО:</span>
                <span className={`font-semibold tabular-nums ${resources.fuel < 25 ? 'text-rose-400' : 'text-sky-400'}`}>
                  {resources.fuel}/{resources.maxFuel}
                </span>
              </div>
              <span className="text-slate-700" aria-hidden="true">·</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-[11px] sm:text-xs">СПЛАВЫ:</span>
                <span className="font-semibold text-emerald-400 tabular-nums">{resources.alloys}</span>
              </div>
              <span className="text-slate-700" aria-hidden="true">·</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-[11px] sm:text-xs">НАУКА:</span>
                <span className="font-semibold text-purple-400 tabular-nums">{resources.science}</span>
              </div>
              <span className="text-slate-700" aria-hidden="true">·</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-[11px] sm:text-xs">АНТИМАТ:</span>
                <span className="font-semibold text-fuchsia-400 tabular-nums">{resources.antimatter}</span>
              </div>
              <span className="text-slate-700" aria-hidden="true">·</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-[11px] sm:text-xs">КОЛОНИСТЫ:</span>
                <span className="font-semibold text-slate-200 tabular-nums">{resources.colonists}</span>
              </div>
              <span className="text-slate-700" aria-hidden="true">·</span>
              <div 
                onClick={() => onOpenFactions()}
                title="Термоядерные боеголовки (Ядерки) для тактических ударов в бою и на фронтах галактических войн!"
                className="flex items-center gap-1 font-bold text-amber-300 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-600/50 cursor-pointer hover:bg-amber-900/60 transition-colors"
              >
                <span className="text-[11px] sm:text-xs">☢ ЯДЕРКИ:</span>
                <span className="font-semibold text-amber-400 tabular-nums">{resources.nukes ?? 0}</span>
              </div>
              {pirateHeat > 0 && (
                <>
                  <span className="text-slate-700" aria-hidden="true">·</span>
                  <div 
                    onClick={() => onSelectScreen('TRADE_STATION')}
                    title={`На борту ${contrabandCount} ед. нелегального груза! Вероятность пиратской засады при варпе: ${pirateHeat}%`}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-600/80 text-rose-300 cursor-pointer animate-pulse hover:bg-rose-900"
                  >
                    <Skull className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-[10px] sm:text-[11px] font-bold font-mono">
                      УГРОЗА: {pirateHeat}% ({contrabandCount} ед.)
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="hidden xl:flex items-center gap-5 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">КОРПУС:</span>
                <span className={`tabular-nums font-semibold ${shipStats.hull < 30 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {shipStats.hull}/{shipStats.maxHull}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">ЩИТЫ:</span>
                <span className="tabular-nums font-semibold text-cyan-400">
                  {shipStats.shields}/{shipStats.maxShields}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">РАДИУС ВАРПА:</span>
                <span className="tabular-nums font-semibold text-emerald-400">
                  {shipStats.warpRange} св. л.
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Drawer Content */}
          <div className="relative ml-auto w-4/5 max-w-sm h-full bg-[#090D1A] border-l border-cyan-500/30 shadow-2xl flex flex-col p-5 overflow-y-auto z-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-cyan-400 font-heading">
                  МЕНЮ ЭКСПЕДИЦИИ
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Navigation List */}
            <div className="py-4 space-y-1.5 flex-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                ОСНОВНЫЕ РАЗДЕЛЫ
              </div>
              {navItems.map(item => {
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      sounds.playScanPing();
                      onSelectScreen(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all min-h-[46px] ${
                      isActive 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        {item.icon}
                      </div>
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                );
              })}

              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-5 mb-2">
                УПРАВЛЕНИЕ И СИСТЕМЫ
              </div>

              {/* Player Profile & Active Title in Drawer */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-xl shrink-0">
                    {activeTitle ? activeTitle.badgeEmoji : '🧑‍🚀'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-100 truncate">{playerName}</div>
                    {activeTitle ? (
                      <div 
                        className="text-[11px] font-mono font-bold truncate"
                        style={{ color: activeTitle.color }}
                      >
                        «{activeTitle.title}»
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 font-mono">Вольный Скиталец</div>
                    )}
                  </div>
                </div>

                {activeTitle && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold shrink-0 bg-slate-950 border border-slate-800" style={{ color: activeTitle.color }}>
                    {activeTitle.kingdomName}
                  </span>
                )}
              </div>

              {commander && onOpenCommanderModal && (
                <button
                  onClick={() => {
                    sounds.playScanPing();
                    onOpenCommanderModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all min-h-[46px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-900/40 border border-cyan-500/40 text-amber-400">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold">Профиль Командира</div>
                      <div className="text-[11px] text-slate-400 font-mono">Уровень {commander.level} • {commander.skillPoints} очков</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-cyan-500" />
                </button>
              )}

              <button
                onClick={() => {
                  sounds.playScanPing();
                  onOpenFactions();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/80 border border-slate-850 min-h-[46px]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-purple-400">
                    <Users2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Фракции и Дипломатия</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Quick Actions in Drawer */}
            <div className="pt-4 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => {
                  sounds.playCreditsChime();
                  onSaveGame();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950"
              >
                <Save className="w-4 h-4" />
                <span>Сохранить игру</span>
              </button>

              <button
                onClick={onToggleSound}
                className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
                title="Переключить звук"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar (Phone thumb-friendly) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070B16]/95 border-t border-slate-800/90 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl">
        <button
          onClick={() => {
            sounds.playScanPing();
            onSelectScreen('GALAXY_MAP');
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all min-w-[56px] min-h-[46px] ${
            activeScreen === 'GALAXY_MAP'
              ? 'text-cyan-300 font-bold bg-cyan-500/15 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Карта</span>
        </button>

        <button
          onClick={() => {
            sounds.playScanPing();
            onSelectScreen('SYSTEM_VIEW');
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all min-w-[56px] min-h-[46px] ${
            activeScreen === 'SYSTEM_VIEW'
              ? 'text-cyan-300 font-bold bg-cyan-500/15 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Orbit className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Система</span>
        </button>

        <button
          onClick={() => {
            sounds.playLaser();
            onSelectScreen('COMBAT');
          }}
          className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl transition-all min-w-[56px] min-h-[46px] ${
            activeScreen === 'COMBAT'
              ? 'text-rose-300 font-bold bg-rose-500/20 border border-rose-500/40 shadow-sm shadow-rose-950'
              : 'text-rose-400 hover:text-rose-300'
          }`}
        >
          <Swords className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Бой 40★</span>
          <span className="absolute -top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        </button>

        <button
          onClick={() => {
            sounds.playScanPing();
            onSelectScreen('SHIP_HANGAR');
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all min-w-[56px] min-h-[46px] ${
            activeScreen === 'SHIP_HANGAR'
              ? 'text-cyan-300 font-bold bg-cyan-500/15 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Rocket className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Корабль</span>
        </button>

        <button
          onClick={() => {
            sounds.playScanPing();
            setIsMobileMenuOpen(true);
          }}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all min-w-[56px] min-h-[46px]"
        >
          <Menu className="w-5 h-5 text-cyan-400" />
          <span className="text-[10px] mt-0.5">Ещё...</span>
        </button>
      </nav>
    </>
  );
};

