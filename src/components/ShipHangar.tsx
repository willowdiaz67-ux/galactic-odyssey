import React, { useState } from 'react';
import { ShipStats, ShipUpgrade, CrewMember, Resources, PlayableShip } from '../types/game';
import { PLAYABLE_SHIPS } from '../data/shipsData';
import { sounds } from '../services/soundEffects';
import { 
  Rocket, 
  Shield, 
  Zap, 
  Wrench, 
  Compass, 
  Users, 
  Crosshair, 
  Check, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowUpRight,
  ChevronRight,
  Flame,
  Award,
  CircleDollarSign
} from 'lucide-react';

interface ShipHangarProps {
  shipStats: ShipStats;
  resources: Resources;
  availableUpgrades: ShipUpgrade[];
  availableCrew: CrewMember[];
  hiredCrew: CrewMember[];
  ownedShipIds?: string[];
  onInstallUpgrade: (upgrade: ShipUpgrade) => void;
  onHireCrew: (crew: CrewMember) => void;
  onFireCrew: (crewId: string) => void;
  onRepairHull: () => void;
  onRefuelShip: () => void;
  onUpdatePowerAllocation: (allocation: { weapons: number; shields: number; engines: number }) => void;
  onBuyShip?: (ship: PlayableShip) => void;
  onSwitchShip?: (shipId: string) => void;
  initialTab?: 'status' | 'upgrades' | 'crew' | 'shipyard';
}

export const ShipHangar: React.FC<ShipHangarProps> = ({
  shipStats,
  resources,
  availableUpgrades,
  availableCrew,
  hiredCrew,
  ownedShipIds = ['normandy_x'],
  onInstallUpgrade,
  onHireCrew,
  onFireCrew,
  onRepairHull,
  onRefuelShip,
  onUpdatePowerAllocation,
  onBuyShip,
  onSwitchShip,
  initialTab = 'status'
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'upgrades' | 'crew' | 'shipyard'>(initialTab);
  const [shipyardFilter, setShipyardFilter] = useState<'all' | 'light' | 'medium' | 'heavy' | 'owned'>('all');
  const [selectedPreviewShip, setSelectedPreviewShip] = useState<PlayableShip | null>(() => {
    return PLAYABLE_SHIPS.find(s => s.id === shipStats.id) || PLAYABLE_SHIPS[0];
  });

  const repairCost = Math.round((shipStats.maxHull - shipStats.hull) * 3);
  const refuelCost = Math.round((resources.maxFuel - resources.fuel) * 2);

  const handlePowerChange = (type: 'weapons' | 'shields' | 'engines', value: number) => {
    const cur = { ...shipStats.powerAllocation };
    cur[type] = value;
    // Normalize to 100%
    const total = cur.weapons + cur.shields + cur.engines;
    if (total === 100) {
      onUpdatePowerAllocation(cur);
    }
  };

  const getFactionBadge = (factionId: string) => {
    switch (factionId) {
      case 'terran':
        return { name: 'Федерация Земли', color: 'text-sky-400 border-sky-500/30 bg-sky-950/40' };
      case 'syndicate':
        return { name: 'Синдикат Гелиос', color: 'text-rose-400 border-rose-500/30 bg-rose-950/40' };
      case 'precursors':
        return { name: 'Наследие Зодчих', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40' };
      case 'miners':
        return { name: 'Шахтёрский Альянс', color: 'text-amber-400 border-amber-500/30 bg-amber-950/40' };
      default:
        return { name: 'Независимые', color: 'text-slate-400 border-slate-700 bg-slate-900' };
    }
  };

  const filteredShips = PLAYABLE_SHIPS.filter(ship => {
    if (shipyardFilter === 'owned') {
      return ownedShipIds.includes(ship.id);
    }
    if (shipyardFilter === 'light') {
      return ship.tier <= 2;
    }
    if (shipyardFilter === 'medium') {
      return ship.tier === 3;
    }
    if (shipyardFilter === 'heavy') {
      return ship.tier >= 4;
    }
    return true;
  });

  return (
    <div className="w-full h-full bg-[#050711] flex flex-col overflow-y-auto p-4 md:p-6 pb-28 md:pb-12 overscroll-contain">
      {/* Top Header */}
      <div className="max-w-[1500px] w-full mx-auto pb-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
            <span>ОРБИТАЛЬНЫЙ АНГАР И ВЕРФЬ</span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400 font-semibold">{ownedShipIds.length} из 10 кораблей в ангаре</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-100 mt-1 flex items-center gap-3">
            <span>{shipStats.name}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              Флагман
            </span>
          </h1>
          <div className="text-xs text-slate-400 font-mono">
            {shipStats.className}
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeTab === 'status' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Системы и Питание
          </button>
          <button
            onClick={() => setActiveTab('shipyard')}
            className={`relative px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
              activeTab === 'shipyard' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Rocket className="w-3.5 h-3.5 text-amber-400" />
            <span>Верфь Флота (10)</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </button>
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeTab === 'upgrades' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Модернизация Модулей
          </button>
          <button
            onClick={() => setActiveTab('crew')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeTab === 'crew' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Экипаж ({hiredCrew.length})
          </button>
        </div>
      </div>

      <div className="max-w-[1500px] w-full mx-auto mt-6">
        {/* ===================== TAB 1: SHIP STATUS ===================== */}
        {activeTab === 'status' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Quick banner to Shipyard */}
            <div className="lg:col-span-12 bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-slate-950 border border-cyan-500/30 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <Rocket className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100 font-heading">
                    Орбитальная Верфь Галактики — Доступно 10 мощных кораблей
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Перехватчики, боевые фрегаты, плазменные дредноуты и древние реликтовые корабли Предтеч.
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playScanPing();
                  setActiveTab('shipyard');
                }}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
              >
                <span>Каталог 10 Кораблей</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Left: Ship Diagram & Vitals */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-lg p-5 flex flex-col gap-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-heading font-bold text-sm text-slate-200">
                  Состояние Корабля и Реактора
                </span>
                <div className="flex items-center gap-2">
                  {repairCost > 0 && (
                    <button
                      disabled={resources.credits < repairCost}
                      onClick={() => {
                        sounds.playLaser();
                        onRepairHull();
                      }}
                      className="px-3 py-1 text-xs font-semibold rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-colors"
                    >
                      Починить Корпус ({repairCost} ⬡)
                    </button>
                  )}
                  {resources.fuel < resources.maxFuel && (
                    <button
                      disabled={resources.credits < refuelCost}
                      onClick={() => {
                        sounds.playCreditsChime();
                        onRefuelShip();
                      }}
                      className="px-3 py-1 text-xs font-semibold rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition-colors"
                    >
                      Заправить Баки ({refuelCost} ⬡)
                    </button>
                  )}
                </div>
              </div>

              {/* Flagship Visual Showcase */}
              <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-950 shadow-lg shadow-cyan-950/30 group">
                <div className="aspect-[16/9] w-full max-h-56 sm:max-h-72 overflow-hidden relative">
                  <img
                    src={selectedPreviewShip?.image || '/src/assets/images/flagship_astraea_1790243922711.jpg'}
                    alt={shipStats.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Sci-fi Overlay Gradients & Scanlines */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1D] via-transparent to-slate-950/40 pointer-events-none" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-cyan-950/20 to-black/60 pointer-events-none" />
                  
                  {/* Corner Sci-fi brackets */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
                  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

                  {/* Top-left Telemetry Tag */}
                  <div className="absolute top-3 left-8 flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-950/80 border border-cyan-500/40 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[11px] font-mono text-cyan-300 font-semibold tracking-wider">
                      {shipStats.name.toUpperCase()}
                    </span>
                  </div>

                  {/* Top-right Status */}
                  <div className="absolute top-3 right-8 px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-700 backdrop-blur-md text-[10px] font-mono text-slate-300">
                    ВАРП-ДВИГАТЕЛЬ: <span className="text-cyan-400 font-bold">{shipStats.warpRange} СВ. ЛЕТ</span>
                  </div>

                  {/* Bottom Stats Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-950/85 border border-slate-800/90 backdrop-blur-md">
                    <div className="flex items-center gap-4 text-[11px]">
                      <span className="text-slate-400">СИСТЕМЫ: <span className="text-emerald-400 font-bold">ОНЛАЙН</span></span>
                      <span className="text-slate-400">ЩИТ: <span className="text-cyan-300 font-bold">{shipStats.shields}/{shipStats.maxShields} SP</span></span>
                      <span className="text-slate-400">КОРПУС: <span className="text-rose-300 font-bold">{shipStats.hull}/{shipStats.maxHull} HP</span></span>
                    </div>
                    <span className="text-[10px] text-cyan-400/80 hidden sm:inline">
                      ОРБИТАЛЬНЫЙ ТЕЛЕМЕТРИЧЕСКИЙ СКАН
                    </span>
                  </div>
                </div>
              </div>

              {/* Special Perk Callout */}
              {shipStats.specialPerk && (
                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3">
                  <div className="p-2 rounded bg-cyan-500/20 text-cyan-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-cyan-300 font-mono uppercase tracking-wide">
                      Уникальная способность корабля: {shipStats.specialPerk.title}
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      {shipStats.specialPerk.description}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5"><Rocket className="w-3.5 h-3.5 text-rose-400" /> Прочность Корпуса</span>
                    <span className="tabular-nums font-semibold">{shipStats.hull} / {shipStats.maxHull} HP</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-300 ${shipStats.hull < 30 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${(shipStats.hull / shipStats.maxHull) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-cyan-400" /> Защитные Поля (Щиты)</span>
                    <span className="tabular-nums font-semibold text-cyan-300">{shipStats.shields} / {shipStats.maxShields} SP</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-cyan-400 transition-all duration-300" 
                      style={{ width: `${(shipStats.shields / shipStats.maxShields) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Ёмкость Топливных Баков</span>
                    <span className="tabular-nums font-semibold text-sky-400">{resources.fuel} / {resources.maxFuel} He-3</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-sky-400 transition-all duration-300" 
                      style={{ width: `${(resources.fuel / resources.maxFuel) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Subsystems Breakdown */}
              <div className="pt-4 border-t border-slate-800">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-3">
                  Бортовые Подсистемы:
                </span>
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  {Object.entries(shipStats.subsystems).map(([key, sys]) => (
                    <div key={key} className="bg-slate-950/70 p-3 rounded border border-slate-800">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>{sys.name}</span>
                        <span className="text-emerald-400">{sys.health}%</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Функционирует штатно</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Tactical Reactor Power Matrix */}
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <span className="font-heading font-bold text-sm text-slate-200 block pb-3 border-b border-slate-800">
                  Распределение Энергии Реактора
                </span>

                <div className="space-y-6 mt-4">
                  {/* Weapons */}
                  <div>
                    <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
                      <span className="flex items-center gap-2">
                        <Crosshair className="w-4 h-4 text-rose-400" />
                        Орудийные Системы
                      </span>
                      <span className="text-rose-400 font-bold">{shipStats.powerAllocation.weapons}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="70"
                      value={shipStats.powerAllocation.weapons}
                      onChange={(e) => handlePowerChange('weapons', parseInt(e.target.value))}
                      className="w-full accent-rose-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="text-[11px] text-slate-400 mt-1">
                      Огневая мощь: <span className="text-slate-200 font-mono font-semibold">{shipStats.weaponsPower} ед.</span> (бонус к урону лазеров и торпед).
                    </div>
                  </div>

                  {/* Shields */}
                  <div>
                    <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
                      <span className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-cyan-400" />
                        Генератор Щитов
                      </span>
                      <span className="text-cyan-400 font-bold">{shipStats.powerAllocation.shields}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="70"
                      value={shipStats.powerAllocation.shields}
                      onChange={(e) => handlePowerChange('shields', parseInt(e.target.value))}
                      className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="text-[11px] text-slate-400 mt-1">
                      Регенерация: <span className="text-slate-200 font-mono font-semibold">{shipStats.powerAllocation.shields > 35 ? '+15 SP в ход' : '+5 SP в ход'}</span>.
                    </div>
                  </div>

                  {/* Engines */}
                  <div>
                    <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
                      <span className="flex items-center gap-2">
                        <Rocket className="w-4 h-4 text-amber-400" />
                        Импульсные Двигатели
                      </span>
                      <span className="text-amber-400 font-bold">{shipStats.powerAllocation.engines}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="70"
                      value={shipStats.powerAllocation.engines}
                      onChange={(e) => handlePowerChange('engines', parseInt(e.target.value))}
                      className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="text-[11px] text-slate-400 mt-1">
                      Уклонение: <span className="text-slate-200 font-mono font-semibold">{shipStats.evasion}%</span>, Тактическая скорость в бою: <span className="text-slate-200 font-mono font-semibold">{shipStats.powerAllocation.engines >= 45 ? '6 MP' : '4 MP'}</span>.
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Specs List */}
              <div className="pt-6 border-t border-slate-800 mt-6 font-mono text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Трюм для Ресурсов:</span>
                  <span className="text-slate-200 font-semibold">{shipStats.cargoCapacity} ед.</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Дальность Варп-Прыжка:</span>
                  <span className="text-cyan-400 font-semibold">{shipStats.warpRange} св. лет</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Базовая Мощность Орудий:</span>
                  <span className="text-rose-400 font-semibold">{shipStats.weaponsPower} ед.</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Корабли в Ангаре:</span>
                  <span className="text-emerald-400 font-semibold">{ownedShipIds.length} / 10 моделей</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: SHIPYARD (10 SHIPS) ===================== */}
        {activeTab === 'shipyard' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold font-heading text-slate-100">
                    Галактическая Верфь: Каталог 10 Кораблей
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    10 Моделей
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Приобретайте новые классы кораблей за Кредиты, Сплавы, Науку и редкую Антиматерию. Все купленные корабли сохраняются в ангаре навсегда!
                </p>
              </div>

              {/* Filter controls */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg">
                <button
                  onClick={() => setShipyardFilter('all')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    shipyardFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Все (10)
                </button>
                <button
                  onClick={() => setShipyardFilter('owned')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    shipyardFilter === 'owned' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  В Ангаре ({ownedShipIds.length})
                </button>
                <button
                  onClick={() => setShipyardFilter('light')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    shipyardFilter === 'light' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Лёгкие
                </button>
                <button
                  onClick={() => setShipyardFilter('medium')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    shipyardFilter === 'medium' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Средние
                </button>
                <button
                  onClick={() => setShipyardFilter('heavy')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    shipyardFilter === 'heavy' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Тяжёлые / Титаны
                </button>
              </div>
            </div>

            {/* Ship Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {filteredShips.map((ship, index) => {
                const isOwned = ownedShipIds.includes(ship.id);
                const isActive = shipStats.id === ship.id || (ship.id === 'normandy_x' && !shipStats.id);
                const faction = getFactionBadge(ship.faction);

                const canAfford = 
                  resources.credits >= ship.price.credits &&
                  resources.alloys >= ship.price.alloys &&
                  (!ship.price.science || resources.science >= ship.price.science) &&
                  (!ship.price.antimatter || resources.antimatter >= ship.price.antimatter);

                // Delta comparisons against current active ship
                const hullDelta = ship.baseStats.hull - shipStats.maxHull;
                const shieldDelta = ship.baseStats.shields - shipStats.maxShields;
                const weaponsDelta = ship.baseStats.weaponsPower - shipStats.weaponsPower;
                const warpDelta = ship.baseStats.warpRange - shipStats.warpRange;
                const cargoDelta = ship.baseStats.cargoCapacity - shipStats.cargoCapacity;

                return (
                  <div
                    key={ship.id}
                    className={`relative rounded-xl border flex flex-col justify-between overflow-hidden transition-all ${
                      isActive
                        ? 'bg-slate-900/90 border-cyan-400 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                        : isOwned
                        ? 'bg-slate-900/70 border-emerald-500/40 hover:border-emerald-400'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Header bar of ship card */}
                    <div className="p-4 pb-3 border-b border-slate-800/80 bg-slate-950/40">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${faction.color}`}>
                          {faction.name}
                        </span>

                        <div className="flex items-center gap-1 text-amber-400 text-xs">
                          {Array.from({ length: ship.tier }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                          <span className="text-[10px] font-mono text-slate-500 ml-1">Ранг {ship.tier}</span>
                        </div>
                      </div>

                      <div className="mt-2 flex items-baseline justify-between">
                        <h3 className="text-lg font-bold font-heading text-slate-100">
                          {ship.name}
                        </h3>
                        {isActive ? (
                          <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950 border border-cyan-700 px-2 py-0.5 rounded">
                            ФЛАГМАН
                          </span>
                        ) : isOwned ? (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                            В АНГАРЕ
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
                            К ПОКУПКЕ #{index + 1}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {ship.className}
                      </div>
                      <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                        Роль: {ship.role}
                      </div>
                    </div>

                    {/* Ship Details & Stats */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                      {/* Lore Snippet */}
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {ship.description}
                      </p>

                      {/* Special Perk Banner */}
                      <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>{ship.specialPerk.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1">
                          {ship.specialPerk.description}
                        </div>
                      </div>

                      {/* Tactical Specs & Deltas */}
                      <div className="space-y-1.5 font-mono text-xs pt-2 border-t border-slate-800/80">
                        {/* Hull */}
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Rocket className="w-3.5 h-3.5 text-rose-400" /> Корпус (HP):
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-100 font-semibold">{ship.baseStats.hull}</span>
                            {!isActive && (
                              <span className={`text-[10px] ${hullDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                ({hullDelta >= 0 ? `+${hullDelta}` : hullDelta})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Shields */}
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-cyan-400" /> Щиты (SP):
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-cyan-300 font-semibold">{ship.baseStats.shields}</span>
                            {!isActive && (
                              <span className={`text-[10px] ${shieldDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                ({shieldDelta >= 0 ? `+${shieldDelta}` : shieldDelta})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Weapons Power */}
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Crosshair className="w-3.5 h-3.5 text-rose-400" /> Огневая мощь:
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-rose-300 font-semibold">{ship.baseStats.weaponsPower} ед.</span>
                            {!isActive && (
                              <span className={`text-[10px] ${weaponsDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                ({weaponsDelta >= 0 ? `+${weaponsDelta}` : weaponsDelta})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Warp Range */}
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-sky-400" /> Варп-прыжок:
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sky-300 font-semibold">{ship.baseStats.warpRange} св. л.</span>
                            {!isActive && (
                              <span className={`text-[10px] ${warpDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                ({warpDelta >= 0 ? `+${warpDelta}` : warpDelta})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Cargo */}
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-amber-400" /> Трюм:
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-amber-300 font-semibold">{ship.baseStats.cargoCapacity} ед.</span>
                            {!isActive && (
                              <span className={`text-[10px] ${cargoDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                ({cargoDelta >= 0 ? `+${cargoDelta}` : cargoDelta})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Evasion */}
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-emerald-400" /> Уклонение:
                          </span>
                          <span className="text-emerald-300 font-semibold">{ship.baseStats.evasion}%</span>
                        </div>
                      </div>

                      {/* Price Section (if not owned) */}
                      {!isOwned && (
                        <div className="pt-3 border-t border-slate-800">
                          <div className="text-[10px] font-mono text-slate-400 mb-1.5 uppercase">
                            Стоимость постройки на верфи:
                          </div>
                          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                            <span className={resources.credits >= ship.price.credits ? 'text-amber-300' : 'text-rose-400'}>
                              {ship.price.credits.toLocaleString()} ⬡
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className={resources.alloys >= ship.price.alloys ? 'text-emerald-300' : 'text-rose-400'}>
                              {ship.price.alloys} Сплавов
                            </span>
                            {ship.price.science ? (
                              <>
                                <span className="text-slate-600">·</span>
                                <span className={resources.science >= ship.price.science ? 'text-sky-300' : 'text-rose-400'}>
                                  {ship.price.science} Науки
                                </span>
                              </>
                            ) : null}
                            {ship.price.antimatter ? (
                              <>
                                <span className="text-slate-600">·</span>
                                <span className={resources.antimatter >= ship.price.antimatter ? 'text-fuchsia-300' : 'text-rose-400'}>
                                  {ship.price.antimatter} Антиматерии
                                </span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Action Button */}
                    <div className="p-4 pt-2 border-t border-slate-800/80 bg-slate-950/60">
                      {isActive ? (
                        <button
                          disabled
                          className="w-full py-2 px-3 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-default"
                        >
                          <Check className="w-4 h-4 text-cyan-400" />
                          <span>Текущий Активный Флагман</span>
                        </button>
                      ) : isOwned ? (
                        <button
                          onClick={() => {
                            sounds.playCreditsChime();
                            onSwitchShip?.(ship.id);
                          }}
                          className="w-full py-2 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          <Rocket className="w-4 h-4 text-emerald-400" />
                          <span>Пересесть на этот корабль</span>
                        </button>
                      ) : (
                        <button
                          disabled={!canAfford}
                          onClick={() => {
                            sounds.playCreditsChime();
                            onBuyShip?.(ship);
                          }}
                          className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                            canAfford
                              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-lg shadow-cyan-950/50'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          <CircleDollarSign className="w-4 h-4" />
                          <span>{canAfford ? 'Купить и Ввести во Флот' : 'Недостаточно ресурсов'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================== TAB 3: UPGRADES ===================== */}
        {activeTab === 'upgrades' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableUpgrades.map((upgrade) => {
              const canAfford = 
                (!upgrade.cost.credits || resources.credits >= upgrade.cost.credits) &&
                (!upgrade.cost.alloys || resources.alloys >= upgrade.cost.alloys) &&
                (!upgrade.cost.antimatter || resources.antimatter >= upgrade.cost.antimatter);

              return (
                <div
                  key={upgrade.id}
                  className={`bg-slate-900/60 border rounded-lg p-4 flex flex-col justify-between transition-all ${
                    upgrade.installed
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-cyan-400 uppercase tracking-wider">{upgrade.categoryName}</span>
                      <span className="text-slate-500">Уровень {upgrade.tier}</span>
                    </div>

                    <h3 className="font-heading font-bold text-base text-slate-100 flex items-center gap-2">
                      {upgrade.name}
                      {upgrade.installed && <Check className="w-4 h-4 text-emerald-400" />}
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      {upgrade.description}
                    </p>

                    <div className="mt-3 p-2 bg-slate-950/80 rounded border border-slate-800/80 text-xs font-mono text-cyan-300">
                      Эффект: {upgrade.effect}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between">
                    <div className="text-xs font-mono text-slate-300">
                      {upgrade.cost.credits && <span className="text-amber-400 mr-2">{upgrade.cost.credits} ⬡</span>}
                      {upgrade.cost.alloys && <span className="text-emerald-400 mr-2">{upgrade.cost.alloys} Сплавов</span>}
                      {upgrade.cost.antimatter && <span className="text-fuchsia-400">{upgrade.cost.antimatter} Антиматерии</span>}
                    </div>

                    <button
                      disabled={upgrade.installed || !canAfford}
                      onClick={() => {
                        sounds.playCreditsChime();
                        onInstallUpgrade(upgrade);
                      }}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                        upgrade.installed
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : canAfford
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-md shadow-cyan-950/40'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      {upgrade.installed ? 'Установлено' : 'Установить'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===================== TAB 4: CREW ===================== */}
        {activeTab === 'crew' && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-3">
                Командный Состав на Борту ({hiredCrew.length} / 5):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hiredCrew.map((member) => (
                  <div key={member.id} className="bg-slate-900/60 border border-emerald-500/30 rounded-lg p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-emerald-400 uppercase">
                          {member.roleName}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {member.salary} ⬡ / цикл
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-base text-slate-100 mt-1">
                        {member.name}
                      </h3>
                      <p className="text-xs text-slate-300 mt-2 bg-slate-950/80 p-2.5 rounded border border-slate-800">
                        {member.bonusText}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        sounds.playAlert();
                        onFireCrew(member.id);
                      }}
                      className="mt-4 text-xs font-mono text-rose-400 hover:text-rose-300 self-start"
                    >
                      Расторгнуть контракт
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-3">
                Доступные Специалисты на Станциях:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableCrew
                  .filter(c => !hiredCrew.some(h => h.id === c.id))
                  .map((candidate) => (
                    <div key={candidate.id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-cyan-400 uppercase">
                            {candidate.roleName}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            Зарплата: {candidate.salary} ⬡
                          </span>
                        </div>
                        <h3 className="font-heading font-bold text-base text-slate-100 mt-1">
                          {candidate.name}
                        </h3>
                        <p className="text-xs text-slate-300 mt-2 bg-slate-950/80 p-2.5 rounded border border-slate-800">
                          {candidate.bonusText}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          sounds.playCreditsChime();
                          onHireCrew(candidate);
                        }}
                        className="mt-4 w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded text-xs transition-colors"
                      >
                        Нанять в Экипаж
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
