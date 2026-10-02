import React, { useState } from 'react';
import { StarSystem, PlanetColony, ColonyBuilding, Resources } from '../types/game';
import { sounds } from '../services/soundEffects';
import { 
  Building2, 
  Users, 
  Smile, 
  ShieldCheck, 
  Zap, 
  Coins, 
  Plus, 
  Hammer, 
  ArrowRight,
  TrendingUp,
  Activity,
  Boxes,
  FlaskConical,
  Sprout,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ColonyResourceSparkline } from './ColonyResourceSparkline';
import { 
  getColony5CycleProductionHistory, 
  getCurrentColonyProduction, 
  calculateTrend 
} from '../utils/colonySparklines';

interface ColonyManagerProps {
  systems: StarSystem[];
  resources: Resources;
  onBuildStructure: (systemId: string, planetId: string, buildingId: string) => void;
  onAdvanceCycle: () => void;
  stardate?: number;
}

export const ColonyManager: React.FC<ColonyManagerProps> = ({
  systems,
  resources,
  onBuildStructure,
  onAdvanceCycle,
  stardate = 2184.2
}) => {
  // Collect all active colonies across all systems
  const coloniesWithInfo = systems.flatMap(sys => 
    sys.bodies
      .filter(b => !!b.colony)
      .map(b => ({
        system: sys,
        body: b,
        colony: b.colony!
      }))
  );

  const [selectedColonyIndex, setSelectedColonyIndex] = useState<number>(0);
  const [resourceFilter, setResourceFilter] = useState<'all' | 'credits' | 'alloys' | 'science' | 'fuel' | 'food'>('all');
  const [showCycleMatrix, setShowCycleMatrix] = useState<boolean>(true);

  const activeColony = coloniesWithInfo[selectedColonyIndex];
  const currentCycleNumber = Math.round(stardate);

  // 5-Cycle Production History for Active Colony
  const activeColonyHistory = activeColony 
    ? getColony5CycleProductionHistory(activeColony.colony, currentCycleNumber)
    : [];

  const creditsSeries = activeColonyHistory.map(h => h.credits);
  const alloysSeries = activeColonyHistory.map(h => h.alloys);
  const scienceSeries = activeColonyHistory.map(h => h.science);
  const fuelSeries = activeColonyHistory.map(h => h.fuel);
  const foodSeries = activeColonyHistory.map(h => h.food);
  const totalSeries = activeColonyHistory.map(h => h.totalOutput || (h.credits + h.alloys * 2 + h.science * 3 + h.fuel * 2 + h.food));

  const totalTrend = calculateTrend(totalSeries);
  const creditsTrend = calculateTrend(creditsSeries);
  const alloysTrend = calculateTrend(alloysSeries);

  // Available blueprints to build
  const availableBuildingTemplates: Omit<ColonyBuilding, 'built'>[] = [
    {
      id: 'fusion_plant',
      name: 'Термоядерный Реактор',
      description: 'Обеспечивает стабильное энергоснабжение всей колониальной инфраструктуры.',
      cost: { credits: 200, alloys: 40 },
      production: { fuel: 8 },
      energyCost: -25 // Generates power
    },
    {
      id: 'mining_complex',
      name: 'Горно-Обогатительный Комбинат',
      description: 'Глубокая добыча сверхпрочных сплавов и редких минералов из коры планеты.',
      cost: { credits: 250, alloys: 30 },
      production: { alloys: 12, credits: 15 },
      energyCost: 10
    },
    {
      id: 'hydroponic_dome',
      name: 'Гидропонный Биосферный Купол',
      description: 'Производит свежую пищу, повышает уровень счастья и стимулирует прирост населения.',
      cost: { credits: 180, alloys: 25 },
      production: { food: 20 },
      energyCost: 8
    },
    {
      id: 'quantum_lab',
      name: 'Квантовая Лаборатория Зодчих',
      description: 'Изучает планетарные аномалии и генерирует научные данные для технологического древа.',
      cost: { credits: 300, alloys: 50, science: 20 },
      production: { science: 14 },
      energyCost: 12
    },
    {
      id: 'defense_grid',
      name: 'Орбитальная Батарея ПКО',
      description: 'Защищает поселенцев от пиратских набегов и гарантирует безопасность торговых путей.',
      cost: { credits: 350, alloys: 70 },
      production: { credits: 25 },
      energyCost: 15
    }
  ];

  const handleBuild = (templateId: string) => {
    if (!activeColony) return;
    const template = availableBuildingTemplates.find(b => b.id === templateId);
    if (!template) return;

    if (resources.credits < template.cost.credits || resources.alloys < template.cost.alloys) {
      sounds.playAlert();
      return;
    }

    sounds.playCreditsChime();
    onBuildStructure(activeColony.system.id, activeColony.body.id, templateId);
  };

  return (
    <div className="w-full h-full bg-[#050711] flex flex-col overflow-y-auto p-4 md:p-6 pb-24 md:pb-12 overscroll-contain">
      {/* Top Banner & Strategy Summary */}
      <div className="max-w-[1500px] w-full mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono text-cyan-400 tracking-wider">
            СТРАТЕГИЧЕСКИЙ КОМАНДНЫЙ ЦЕНТР
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-100 mt-1">
            Управление Межзвёздными Колониями
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Развивайте инфраструктуру колоний, собирайте налоги и ресурсы каждый звёздный цикл.
          </p>
        </div>

        {/* End Turn / Advance Cycle Button */}
        <button
          onClick={() => {
            sounds.playWarpJump();
            onAdvanceCycle();
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold rounded shadow-lg shadow-emerald-950/40 text-sm transition-all cursor-pointer whitespace-nowrap"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Следующий Звёздный Цикл (+Доходы)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {coloniesWithInfo.length === 0 ? (
        <div className="max-w-md mx-auto my-auto text-center py-16">
          <Building2 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h2 className="text-lg font-bold font-heading text-slate-200">
            Нет Действующих Колоний
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Исследуйте звёздные системы, сканируйте планеты с подходящей атмосферой (Океанические, Земного типа, Вулканические) и основывайте первые колонии с помощью поселенцев и титановых сплавов!
          </p>
        </div>
      ) : (
        <div className="max-w-[1500px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left Colony List */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Все ваши колонии ({coloniesWithInfo.length}):
            </span>
            <div className="space-y-2">
              {coloniesWithInfo.map((info, idx) => {
                const isSelected = idx === selectedColonyIndex;
                return (
                  <button
                    key={`${info.system.id}-${info.body.id}`}
                    onClick={() => {
                      sounds.playScanPing();
                      setSelectedColonyIndex(idx);
                    }}
                    className={`w-full text-left p-4 rounded border transition-all ${
                      isSelected
                        ? 'bg-slate-900/90 border-cyan-500/50 shadow-md shadow-cyan-950/50'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-sm text-slate-100">
                        {info.colony.name}
                      </span>
                      <span className="text-xs font-mono text-cyan-400">
                        {info.system.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-2">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-200 tabular-nums">{info.colony.population}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Smile className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-slate-200 tabular-nums">{info.colony.happiness}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-slate-200 tabular-nums">{info.colony.defenseRating}</span>
                      </div>
                    </div>

                    {/* 5-Cycle Production Mini Sparkline for this Colony */}
                    {(() => {
                      const colHist = getColony5CycleProductionHistory(info.colony, currentCycleNumber);
                      const colTotals = colHist.map(h => h.totalOutput || (h.credits + h.alloys * 2));
                      return (
                        <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <Activity className="w-3 h-3 text-cyan-400" />
                            <span>Динамика 5 циклов:</span>
                          </span>
                          <ColonyResourceSparkline
                            label="Выпуск"
                            data={colTotals}
                            unit="ед"
                            color="#06B6D4"
                            width={100}
                            height={24}
                            compact={true}
                          />
                        </div>
                      );
                    })()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Selected Colony Detail & Building Grid */}
          {activeColony && (
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Colony Overview Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold font-heading text-slate-100">
                      {activeColony.colony.name}
                    </h2>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      Планета: <span className="text-cyan-300">{activeColony.body.name}</span> · Тип: <span className="text-slate-200">{activeColony.body.typeName}</span>
                    </div>
                  </div>

                  {/* Vitals */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="bg-slate-950/80 px-3 py-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">НАСЕЛЕНИЕ</span>
                      <span className="text-sm font-semibold text-slate-100 tabular-nums">
                        {activeColony.colony.population}
                      </span>
                    </div>
                    <div className="bg-slate-950/80 px-3 py-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">СЧАСТЬЕ</span>
                      <span className="text-sm font-semibold text-amber-400 tabular-nums">
                        {activeColony.colony.happiness}%
                      </span>
                    </div>
                    <div className="bg-slate-950/80 px-3 py-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">ОБОРОНА</span>
                      <span className="text-sm font-semibold text-emerald-400 tabular-nums">
                        {activeColony.colony.defenseRating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Built Structures in Colony */}
                <div className="mt-5">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-3">
                    Построенные комплексы ({activeColony.colony.buildings.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeColony.colony.buildings.map((b) => (
                      <div 
                        key={b.id}
                        className="bg-slate-950/70 border border-slate-800 rounded p-3 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-heading font-semibold text-xs text-slate-200">
                              {b.name}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400">АКТИВНО</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                            {b.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-300 mt-3 pt-2 border-t border-slate-900">
                          {b.production.alloys && <span className="text-emerald-400">+{b.production.alloys} Сплавы/цикл</span>}
                          {b.production.credits && <span className="text-amber-400">+{b.production.credits} ⬡/цикл</span>}
                          {b.production.science && <span className="text-purple-400">+{b.production.science} Наука/цикл</span>}
                          {b.production.food && <span className="text-green-400">+{b.production.food} Пища/цикл</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5-Cycle Resource Production Dynamics (Sparklines) */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
                        <Activity className="w-4 h-4" />
                      </div>
                      <h3 className="font-heading font-bold text-base text-slate-100">
                        Динамика Производства за Последние 5 Циклов
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                        Sparklines
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Мониторинг выработки колонии по циклам с интерактивным анализом тренда эффективности и динамики доходности.
                    </p>
                  </div>

                  {/* Summary Trend Pill & Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border ${
                      totalTrend.direction === 'up' 
                        ? 'bg-emerald-950/70 border-emerald-700/70 text-emerald-300' 
                        : totalTrend.direction === 'down' 
                        ? 'bg-rose-950/70 border-rose-700/70 text-rose-300' 
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}>
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Общий выпуск: {totalTrend.formatted}</span>
                    </div>

                    <button
                      onClick={() => setShowCycleMatrix(prev => !prev)}
                      className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Показать / скрыть детальную матрицу циклов"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{showCycleMatrix ? 'Скрыть таблицу' : 'Таблица циклов'}</span>
                    </button>
                  </div>
                </div>

                {/* Resource Category Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-slate-800/60 scrollbar-none text-xs font-mono">
                  <button
                    onClick={() => setResourceFilter('all')}
                    className={`px-3 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                      resourceFilter === 'all'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    Все ресурсы (6)
                  </button>
                  <button
                    onClick={() => setResourceFilter('credits')}
                    className={`px-3 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      resourceFilter === 'credits'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-950/70 text-amber-300/80 hover:text-amber-200 border border-slate-800'
                    }`}
                  >
                    <Coins className="w-3 h-3 text-amber-400" />
                    <span>Кредиты ({creditsSeries[creditsSeries.length - 1] ?? 0} ⬡)</span>
                  </button>
                  <button
                    onClick={() => setResourceFilter('alloys')}
                    className={`px-3 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      resourceFilter === 'alloys'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-950/70 text-emerald-300/80 hover:text-emerald-200 border border-slate-800'
                    }`}
                  >
                    <Boxes className="w-3 h-3 text-emerald-400" />
                    <span>Сплавы (+{alloysSeries[alloysSeries.length - 1] ?? 0})</span>
                  </button>
                  <button
                    onClick={() => setResourceFilter('science')}
                    className={`px-3 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      resourceFilter === 'science'
                        ? 'bg-purple-500 text-slate-950 font-bold'
                        : 'bg-slate-950/70 text-purple-300/80 hover:text-purple-200 border border-slate-800'
                    }`}
                  >
                    <FlaskConical className="w-3 h-3 text-purple-400" />
                    <span>Наука (+{scienceSeries[scienceSeries.length - 1] ?? 0})</span>
                  </button>
                  <button
                    onClick={() => setResourceFilter('fuel')}
                    className={`px-3 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      resourceFilter === 'fuel'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-950/70 text-cyan-300/80 hover:text-cyan-200 border border-slate-800'
                    }`}
                  >
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span>Топливо (+{fuelSeries[fuelSeries.length - 1] ?? 0})</span>
                  </button>
                  <button
                    onClick={() => setResourceFilter('food')}
                    className={`px-3 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      resourceFilter === 'food'
                        ? 'bg-lime-500 text-slate-950 font-bold'
                        : 'bg-slate-950/70 text-lime-300/80 hover:text-lime-200 border border-slate-800'
                    }`}
                  >
                    <Sprout className="w-3 h-3 text-lime-400" />
                    <span>Пища (+{foodSeries[foodSeries.length - 1] ?? 0})</span>
                  </button>
                </div>

                {/* Sparklines Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 mt-4">
                  {(resourceFilter === 'all' || resourceFilter === 'credits') && (
                    <ColonyResourceSparkline
                      label="Кредиты (Налоги)"
                      icon={<Coins className="w-3.5 h-3.5" />}
                      data={creditsSeries}
                      unit="⬡/цикл"
                      color="#F59E0B"
                      subLabel="База + Население"
                    />
                  )}

                  {(resourceFilter === 'all' || resourceFilter === 'alloys') && (
                    <ColonyResourceSparkline
                      label="Титановые Сплавы"
                      icon={<Boxes className="w-3.5 h-3.5" />}
                      data={alloysSeries}
                      unit="т/цикл"
                      color="#10B981"
                      subLabel="Горнорудный комплекс"
                    />
                  )}

                  {(resourceFilter === 'all' || resourceFilter === 'science') && (
                    <ColonyResourceSparkline
                      label="Научные Данные"
                      icon={<FlaskConical className="w-3.5 h-3.5" />}
                      data={scienceSeries}
                      unit="ед./цикл"
                      color="#8B5CF6"
                      subLabel="Лаборатории Зодчих"
                    />
                  )}

                  {(resourceFilter === 'all' || resourceFilter === 'fuel') && (
                    <ColonyResourceSparkline
                      label="Гелий-3 / Энергия"
                      icon={<Zap className="w-3.5 h-3.5" />}
                      data={fuelSeries}
                      unit="He-3/цикл"
                      color="#06B6D4"
                      subLabel="Термоядерный синтез"
                    />
                  )}

                  {(resourceFilter === 'all' || resourceFilter === 'food') && (
                    <ColonyResourceSparkline
                      label="Пища и Биомасса"
                      icon={<Sprout className="w-3.5 h-3.5" />}
                      data={foodSeries}
                      unit="т/цикл"
                      color="#84CC16"
                      subLabel="Биосферные купола"
                    />
                  )}

                  {(resourceFilter === 'all') && (
                    <ColonyResourceSparkline
                      label="Совокупная Мощность"
                      icon={<TrendingUp className="w-3.5 h-3.5" />}
                      data={totalSeries}
                      unit="пунктов"
                      color="#EC4899"
                      subLabel="Сводный индекс базы"
                    />
                  )}
                </div>

                {/* 5-Cycle Trajectory Breakdown Matrix */}
                {showCycleMatrix && activeColonyHistory.length > 0 && (
                  <div className="mt-4 p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-850 text-xs font-mono">
                      <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Поцикловая детализация выработки (T-4 ... T-0):</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {activeColonyHistory.length} циклов зафиксировано
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-mono text-left">
                        <thead>
                          <tr className="border-b border-slate-800/60 text-slate-400 text-[10px]">
                            <th className="py-1 px-2">Параметр</th>
                            {activeColonyHistory.map((h, i) => (
                              <th key={i} className="py-1 px-2 text-right">
                                {i === activeColonyHistory.length - 1 ? (
                                  <span className="text-cyan-400 font-bold">Тек. (№{h.cycle})</span>
                                ) : (
                                  <span>T-{activeColonyHistory.length - 1 - i} (№{h.cycle})</span>
                                )}
                              </th>
                            ))}
                            <th className="py-1 px-2 text-right">Тренд (5ц)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850/60 text-[11px]">
                          <tr>
                            <td className="py-1 px-2 text-amber-400 font-medium flex items-center gap-1">
                              <Coins className="w-3 h-3" />
                              <span>Кредиты</span>
                            </td>
                            {activeColonyHistory.map((h, i) => (
                              <td key={i} className="py-1 px-2 text-right tabular-nums text-slate-200">
                                +{h.credits} ⬡
                              </td>
                            ))}
                            <td className="py-1 px-2 text-right font-bold text-amber-400">
                              {creditsTrend.formatted}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2 text-emerald-400 font-medium flex items-center gap-1">
                              <Boxes className="w-3 h-3" />
                              <span>Сплавы</span>
                            </td>
                            {activeColonyHistory.map((h, i) => (
                              <td key={i} className="py-1 px-2 text-right tabular-nums text-slate-200">
                                +{h.alloys} т
                              </td>
                            ))}
                            <td className="py-1 px-2 text-right font-bold text-emerald-400">
                              {alloysTrend.formatted}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2 text-purple-400 font-medium flex items-center gap-1">
                              <FlaskConical className="w-3 h-3" />
                              <span>Наука</span>
                            </td>
                            {activeColonyHistory.map((h, i) => (
                              <td key={i} className="py-1 px-2 text-right tabular-nums text-slate-200">
                                +{h.science}
                              </td>
                            ))}
                            <td className="py-1 px-2 text-right font-bold text-purple-400">
                              {calculateTrend(scienceSeries).formatted}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2 text-cyan-400 font-medium flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              <span>Гелий-3</span>
                            </td>
                            {activeColonyHistory.map((h, i) => (
                              <td key={i} className="py-1 px-2 text-right tabular-nums text-slate-200">
                                +{h.fuel}
                              </td>
                            ))}
                            <td className="py-1 px-2 text-right font-bold text-cyan-400">
                              {calculateTrend(fuelSeries).formatted}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2 text-lime-400 font-medium flex items-center gap-1">
                              <Sprout className="w-3 h-3" />
                              <span>Пища</span>
                            </td>
                            {activeColonyHistory.map((h, i) => (
                              <td key={i} className="py-1 px-2 text-right tabular-nums text-slate-200">
                                +{h.food} т
                              </td>
                            ))}
                            <td className="py-1 px-2 text-right font-bold text-lime-400">
                              {calculateTrend(foodSeries).formatted}
                            </td>
                          </tr>
                          <tr className="bg-slate-900/60 font-semibold">
                            <td className="py-1.5 px-2 text-pink-400 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>Индекс Выпуска</span>
                            </td>
                            {activeColonyHistory.map((h, i) => (
                              <td key={i} className="py-1.5 px-2 text-right tabular-nums text-pink-300">
                                {h.totalOutput || (h.credits + h.alloys * 2)}
                              </td>
                            ))}
                            <td className="py-1.5 px-2 text-right font-bold text-pink-400">
                              {totalTrend.formatted}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Governor Tactical Report */}
                    <div className="mt-3 pt-2.5 border-t border-slate-850 flex items-start gap-2 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-slate-300 leading-relaxed font-mono">
                        <span className="text-cyan-300 font-semibold">Доклад колониального губернатора: </span>
                        {totalTrend.percent > 0 ? (
                          <span>
                            Производственные мощности колонии «{activeColony.colony.name}» демонстрируют стабильный рост (+{totalTrend.percent}% за 5 циклов). Инфраструктура расширяется в соответствии со стратегическим планом.
                          </span>
                        ) : totalTrend.percent < 0 ? (
                          <span className="text-rose-300">
                            Темп выработки снизился ({totalTrend.formatted}). Рекомендуется заложить новые горно-обогатительные или биосферные комплексы для компенсации дефицита.
                          </span>
                        ) : (
                          <span>
                            Выпуск ресурсов колонии «{activeColony.colony.name}» зафиксирован на стабильном уровне ({totalTrend.formatted}). Мощности полностью сбалансированы.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-3">
                  Доступные проекты для строительства:
                </span>
                <div className="space-y-3">
                  {availableBuildingTemplates.map((template) => {
                    const isAlreadyBuilt = activeColony.colony.buildings.some(b => b.id === template.id);
                    const canAfford = resources.credits >= template.cost.credits && resources.alloys >= template.cost.alloys;

                    return (
                      <div
                        key={template.id}
                        className="bg-slate-950/70 border border-slate-800/80 rounded p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-heading font-semibold text-sm text-slate-100">
                              {template.name}
                            </h3>
                            {isAlreadyBuilt && (
                              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 rounded">
                                Уже построено
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs font-mono text-cyan-400 mt-2">
                            <span>Стоимость:</span>
                            <span className="text-amber-400">{template.cost.credits} ⬡</span>
                            <span className="text-emerald-400">{template.cost.alloys} Сплавов</span>
                          </div>
                        </div>

                        <button
                          disabled={isAlreadyBuilt || !canAfford}
                          onClick={() => handleBuild(template.id)}
                          className={`px-4 py-2 rounded text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            isAlreadyBuilt
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : canAfford
                              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-md shadow-cyan-950/40'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          <Hammer className="w-3.5 h-3.5" />
                          <span>Построить Объект</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
