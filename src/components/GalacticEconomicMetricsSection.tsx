import React, { useState } from 'react';
import { CycleEconomicSnapshot, StarSystem, Resources } from '../types/game';
import { sounds } from '../services/soundEffects';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Coins,
  Layers,
  BarChart3,
  LineChart as LineChartIcon,
  Store,
  Building2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Info,
  Scale,
  SlidersHorizontal,
  ChevronRight,
  History,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface GalacticEconomicMetricsSectionProps {
  history: CycleEconomicSnapshot[];
  currentSystem: StarSystem;
  resources?: Resources;
  onNavigateToMarket?: () => void;
  onNavigateToColonies?: () => void;
  onCloseModal?: () => void;
}

export const GalacticEconomicMetricsSection: React.FC<GalacticEconomicMetricsSectionProps> = ({
  history,
  currentSystem,
  resources,
  onNavigateToMarket,
  onNavigateToColonies,
  onCloseModal
}) => {
  // Main view tab: 'comparison' (colony income difference vs past 10 cycles) or 'dynamics' (5-cycle credits & alloys)
  const [activeSection, setActiveSection] = useState<'comparison' | 'dynamics'>('comparison');
  const [chartView, setChartView] = useState<'combined' | 'credits' | 'alloys' | 'delta'>('combined');
  const [colonyChartMode, setColonyChartMode] = useState<'side_by_side' | 'delta_only'>('side_by_side');

  // Total recorded cycles available
  const allSnapshots = history && history.length > 0 ? history : [];
  const currentCycle = allSnapshots[allSnapshots.length - 1] || {
    cycle: 11,
    stardate: 2184.2,
    cycleLabel: 'Текущий цикл',
    credits: resources?.credits || 850,
    alloys: resources?.alloys || 75,
    colonyProductionCredits: 165,
    colonyProductionAlloys: 38,
    colonyProductionScience: 54,
    colonyProductionFood: 65,
    colonyProductionFuel: 36
  };

  // Up to 10 past recorded cycles prior to current
  const pastCycles = allSnapshots.slice(0, -1).slice(-10);

  // Selected past cycle for comparison (defaults to most recent past cycle)
  const [selectedPastCycleId, setSelectedPastCycleId] = useState<number>(
    pastCycles.length > 0 ? pastCycles[pastCycles.length - 1].cycle : 10
  );

  const selectedPastCycle = pastCycles.find(c => c.cycle === selectedPastCycleId) || pastCycles[pastCycles.length - 1] || {
    cycle: 10,
    stardate: 2183.2,
    cycleLabel: 'Цикл 10',
    credits: 780,
    alloys: 68,
    colonyProductionCredits: 145,
    colonyProductionAlloys: 34,
    colonyProductionScience: 48,
    colonyProductionFood: 58,
    colonyProductionFuel: 32
  };

  // Distance in cycles between current and selected past cycle
  const cyclesAgo = Math.max(1, currentCycle.cycle - selectedPastCycle.cycle);

  // Last 5 cycles for the 5-cycle dynamics chart
  const last5CyclesData = allSnapshots.slice(-5);
  const firstOf5 = last5CyclesData[0] || { credits: 0, alloys: 0 };
  const latestOf5 = last5CyclesData[last5CyclesData.length - 1] || { credits: 0, alloys: 0 };

  const creditsDiff5 = latestOf5.credits - firstOf5.credits;
  const creditsPercent5 = firstOf5.credits > 0 ? Math.round((creditsDiff5 / firstOf5.credits) * 100) : 0;
  const alloysDiff5 = latestOf5.alloys - firstOf5.alloys;
  const alloysPercent5 = firstOf5.alloys > 0 ? Math.round((alloysDiff5 / firstOf5.alloys) * 100) : 0;

  // Comparison data for Colony Income Difference Bar Chart
  const currentColonyCredits = currentCycle.colonyProductionCredits ?? 165;
  const pastColonyCredits = selectedPastCycle.colonyProductionCredits ?? 145;
  const diffColonyCredits = currentColonyCredits - pastColonyCredits;
  const percentColonyCredits = pastColonyCredits > 0 ? Math.round((diffColonyCredits / pastColonyCredits) * 100) : 0;

  const currentColonyAlloys = currentCycle.colonyProductionAlloys ?? 38;
  const pastColonyAlloys = selectedPastCycle.colonyProductionAlloys ?? 34;
  const diffColonyAlloys = currentColonyAlloys - pastColonyAlloys;
  const percentColonyAlloys = pastColonyAlloys > 0 ? Math.round((diffColonyAlloys / pastColonyAlloys) * 100) : 0;

  const currentColonyScience = currentCycle.colonyProductionScience ?? 54;
  const pastColonyScience = selectedPastCycle.colonyProductionScience ?? 48;
  const diffColonyScience = currentColonyScience - pastColonyScience;

  const currentColonyFood = currentCycle.colonyProductionFood ?? 65;
  const pastColonyFood = selectedPastCycle.colonyProductionFood ?? 58;
  const diffColonyFood = currentColonyFood - pastColonyFood;

  const currentColonyFuel = currentCycle.colonyProductionFuel ?? 36;
  const pastColonyFuel = selectedPastCycle.colonyProductionFuel ?? 32;
  const diffColonyFuel = currentColonyFuel - pastColonyFuel;

  // Bar Chart dataset for colony comparison
  const colonyComparisonData = [
    {
      category: 'Кредиты (⬡)',
      shortName: 'Кредиты',
      pastValue: pastColonyCredits,
      currentValue: currentColonyCredits,
      deltaValue: diffColonyCredits,
      unit: '⬡',
      color: '#F59E0B'
    },
    {
      category: 'Сплавы (т)',
      shortName: 'Сплавы',
      pastValue: pastColonyAlloys,
      currentValue: currentColonyAlloys,
      deltaValue: diffColonyAlloys,
      unit: 'т',
      color: '#38BDF8'
    },
    {
      category: 'Наука (ед)',
      shortName: 'Наука',
      pastValue: pastColonyScience,
      currentValue: currentColonyScience,
      deltaValue: diffColonyScience,
      unit: 'ед',
      color: '#A855F7'
    },
    {
      category: 'Пайки (ед)',
      shortName: 'Питание',
      pastValue: pastColonyFood,
      currentValue: currentColonyFood,
      deltaValue: diffColonyFood,
      unit: 'ед',
      color: '#10B981'
    },
    {
      category: 'Топливо (ед)',
      shortName: 'Гелий-3',
      pastValue: pastColonyFuel,
      currentValue: currentColonyFuel,
      deltaValue: diffColonyFuel,
      unit: 'ед',
      color: '#FB923C'
    }
  ];

  // Tooltip for Colony Comparison Bar Chart
  const ColonyComparisonTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const item = colonyComparisonData.find(d => d.category === label) || payload[0]?.payload;
    if (!item) return null;

    return (
      <div className="bg-[#070B19]/95 border border-emerald-500/70 p-3.5 rounded-xl shadow-2xl shadow-emerald-950/80 backdrop-blur-md font-mono text-xs max-w-xs select-none">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 gap-3">
          <span className="text-emerald-300 font-bold flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            {item.category}
          </span>
          <span className="text-[10px] text-slate-400">
            Сравнение циклов
          </span>
        </div>

        <div className="mt-2.5 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              Цикл {selectedPastCycle.cycle} ({selectedPastCycle.stardate.toFixed(1)}):
            </span>
            <span className="font-bold text-slate-300 tabular-nums">
              {item.pastValue} {item.unit}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Текущий цикл ({currentCycle.stardate.toFixed(1)}):
            </span>
            <span className="font-bold text-emerald-300 tabular-nums">
              {item.currentValue} {item.unit}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-4">
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              Разница (Δ прирост):
            </span>
            <span className={`font-bold tabular-nums ${item.deltaValue >= 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
              {item.deltaValue >= 0 ? `+${item.deltaValue}` : item.deltaValue} {item.unit}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Tooltip for 5-Cycle Trend Chart
  const CustomTooltip5 = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const snapshot = last5CyclesData.find(d => d.cycleLabel === label) || payload[0]?.payload;

    return (
      <div className="bg-[#070B19]/95 border border-cyan-500/70 p-3.5 rounded-xl shadow-2xl shadow-cyan-950/80 backdrop-blur-md font-mono text-xs max-w-xs select-none">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 gap-3">
          <span className="text-cyan-300 font-bold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            {snapshot?.cycleLabel || label}
          </span>
          <span className="text-[10px] text-slate-400">
            Зв. дата {snapshot?.stardate?.toFixed(1)}
          </span>
        </div>

        <div className="mt-2.5 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              Кредиты:
            </span>
            <div className="text-right">
              <span className="font-bold text-amber-300 tabular-nums">
                {snapshot?.credits?.toLocaleString() || 0} ⬡
              </span>
              {snapshot?.creditsDelta !== undefined && snapshot.creditsDelta !== 0 && (
                <span className={`block text-[10px] ${snapshot.creditsDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {snapshot.creditsDelta > 0 ? `+${snapshot.creditsDelta}` : snapshot.creditsDelta} ⬡
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-sky-300 font-semibold">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Сплавы:
            </span>
            <div className="text-right">
              <span className="font-bold text-sky-300 tabular-nums">
                {snapshot?.alloys?.toLocaleString() || 0} т
              </span>
              {snapshot?.alloysDelta !== undefined && snapshot.alloysDelta !== 0 && (
                <span className={`block text-[10px] ${snapshot.alloysDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {snapshot.alloysDelta > 0 ? `+${snapshot.alloysDelta}` : snapshot.alloysDelta} т
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Briefing */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0A142A] to-slate-900 p-4 sm:p-5 rounded-2xl border border-cyan-500/40 shadow-xl shadow-cyan-950/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950/90 rounded-xl border border-cyan-500/60 text-cyan-400 shadow-md shadow-cyan-950">
              <BarChart3 className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  ДЕПАРТАМЕНТ ЭКОНОМИКИ ОФЗ
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  АНАЛИТИКА 10 ЗАПИСАННЫХ ЦИКЛОВ
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-slate-100 mt-0.5">
                Экономические показатели: доходы колоний и динамика ресурсов
              </h3>
            </div>
          </div>

          {/* Section Mode Switcher Buttons */}
          <div className="flex items-center p-1 bg-slate-950 border border-cyan-900/60 rounded-xl">
            <button
              onClick={() => {
                sounds.playScanPing();
                setActiveSection('comparison');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeSection === 'comparison'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950'
                  : 'text-emerald-400 hover:text-emerald-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Сравнение колоний</span>
            </button>

            <button
              onClick={() => {
                sounds.playScanPing();
                setActiveSection('dynamics');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeSection === 'dynamics'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950'
                  : 'text-cyan-400 hover:text-cyan-200'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Динамика 5 циклов</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs font-mono">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-500/30">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Coins className="w-3.5 h-3.5" />
                Кредиты экспедиции
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                +{creditsPercent5}%
              </span>
            </div>
            <div className="text-lg font-bold text-amber-300 tabular-nums">
              {currentCycle.credits.toLocaleString()} ⬡
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Баланс казны флагмана
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-sky-500/30">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span className="flex items-center gap-1 text-sky-400 font-semibold">
                <Layers className="w-3.5 h-3.5" />
                Запас титановых сплавов
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                +{alloysPercent5}%
              </span>
            </div>
            <div className="text-lg font-bold text-sky-300 tabular-nums">
              {currentCycle.alloys.toLocaleString()} т
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Промышленный резерв
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-emerald-500/30">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                Доход колоний (цикл)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">+{percentColonyCredits}%</span>
            </div>
            <div className="text-lg font-bold text-emerald-300 tabular-nums">
              +{currentColonyCredits} ⬡ / цикл
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Сплавов: <strong className="text-sky-300">+{currentColonyAlloys} т/цикл</strong>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-purple-500/30">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span className="flex items-center gap-1 text-purple-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Научный потенциал
              </span>
              <span className="text-[10px] text-purple-300 bg-purple-950 px-1.5 py-0.2 rounded border border-purple-800">
                +{diffColonyScience} ед
              </span>
            </div>
            <div className="text-lg font-bold text-purple-300">
              +{currentColonyScience} науки/цикл
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Прирост исследований
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: COLONY INCOME DIFFERENCE COMPARISON WITH PAST 10 CYCLES */}
      {activeSection === 'comparison' && (
        <div className="bg-slate-950/90 border border-emerald-500/40 p-4 sm:p-5 rounded-2xl space-y-4 shadow-xl shadow-emerald-950/20">
          
          {/* Header of Colony Comparison with Switcher Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                  СТОЛБЧАТАЯ ДИАГРАММА RECHARTS
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Сравнение текущего цикла с предыдущими
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold font-heading text-slate-100 mt-1 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Разница в доходах колоний: Текущий цикл vs Цикл {selectedPastCycle.cycle}</span>
              </h4>
            </div>

            {/* Past Cycle Switcher (Переключатель) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-slate-700/80">
              <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5 whitespace-nowrap pl-1">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                Сравнить с:
              </span>

              {/* Dropdown Switcher */}
              <select
                value={selectedPastCycleId}
                onChange={(e) => {
                  sounds.playScanPing();
                  setSelectedPastCycleId(Number(e.target.value));
                }}
                className="bg-slate-950 text-cyan-300 font-mono text-xs font-bold px-3 py-1.5 rounded-lg border border-cyan-600/70 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer shadow-sm"
              >
                {pastCycles.map((pCycle, idx) => {
                  const dist = currentCycle.cycle - pCycle.cycle;
                  return (
                    <option key={pCycle.cycle} value={pCycle.cycle} className="bg-slate-950 text-slate-200">
                      Цикл {pCycle.cycle} (Зв. дата {pCycle.stardate.toFixed(1)}) — {dist} цикл{dist === 1 ? '' : dist < 5 ? 'а' : 'ов'} назад
                    </option>
                  );
                })}
              </select>

              {/* Quick shortcut pills */}
              <div className="flex items-center gap-1">
                {pastCycles.length >= 1 && (
                  <button
                    onClick={() => {
                      sounds.playScanPing();
                      setSelectedPastCycleId(pastCycles[pastCycles.length - 1].cycle);
                    }}
                    title="Предыдущий цикл (-1)"
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                      selectedPastCycleId === pastCycles[pastCycles.length - 1].cycle
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    -1 ц.
                  </button>
                )}
                {pastCycles.length >= 3 && (
                  <button
                    onClick={() => {
                      sounds.playScanPing();
                      setSelectedPastCycleId(pastCycles[Math.max(0, pastCycles.length - 3)].cycle);
                    }}
                    title="3 цикла назад (-3)"
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                      selectedPastCycleId === pastCycles[Math.max(0, pastCycles.length - 3)].cycle
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    -3 ц.
                  </button>
                )}
                {pastCycles.length >= 5 && (
                  <button
                    onClick={() => {
                      sounds.playScanPing();
                      setSelectedPastCycleId(pastCycles[Math.max(0, pastCycles.length - 5)].cycle);
                    }}
                    title="5 циклов назад (-5)"
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                      selectedPastCycleId === pastCycles[Math.max(0, pastCycles.length - 5)].cycle
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    -5 ц.
                  </button>
                )}
                {pastCycles.length >= 10 && (
                  <button
                    onClick={() => {
                      sounds.playScanPing();
                      setSelectedPastCycleId(pastCycles[0].cycle);
                    }}
                    title="10 циклов назад (-10)"
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                      selectedPastCycleId === pastCycles[0].cycle
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    -10 ц.
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Delta Headline Stats between the two cycles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Кредиты колоний:</span>
              <span className={`font-bold tabular-nums ${diffColonyCredits >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {diffColonyCredits >= 0 ? `+${diffColonyCredits}` : diffColonyCredits} ⬡ ({diffColonyCredits >= 0 ? `+${percentColonyCredits}%` : `${percentColonyCredits}%`})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Сплавы колоний:</span>
              <span className={`font-bold tabular-nums ${diffColonyAlloys >= 0 ? 'text-sky-300' : 'text-rose-400'}`}>
                {diffColonyAlloys >= 0 ? `+${diffColonyAlloys}` : diffColonyAlloys} т ({diffColonyAlloys >= 0 ? `+${percentColonyAlloys}%` : `${percentColonyAlloys}%`})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Научные данные:</span>
              <span className="font-bold text-purple-300 tabular-nums">
                +{diffColonyScience} ед.
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Дистанция сравнения:</span>
              <span className="font-bold text-amber-300 tabular-nums">
                {cyclesAgo} цикл{cyclesAgo === 1 ? '' : cyclesAgo < 5 ? 'а' : 'ов'} назад
              </span>
            </div>
          </div>

          {/* Chart Display Mode Switcher */}
          <div className="flex items-center justify-between gap-2 pt-1 text-xs font-mono">
            <span className="text-slate-400 text-[11px]">
              Выбранный прошлый цикл: <strong className="text-slate-200">#{selectedPastCycle.cycle} (Зв. дата {selectedPastCycle.stardate.toFixed(1)})</strong> · Событие: <em className="text-slate-400">{selectedPastCycle.eventDescription || 'Базовое развитие'}</em>
            </span>

            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
              <button
                onClick={() => setColonyChartMode('side_by_side')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  colonyChartMode === 'side_by_side'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Параллельно (Прошлый vs Текущий)
              </button>

              <button
                onClick={() => setColonyChartMode('delta_only')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  colonyChartMode === 'delta_only'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Чистая разница (Δ Прирост)
              </button>
            </div>
          </div>

          {/* RECHARTS BAR CHART: Colony Income Difference */}
          <div className="h-[290px] sm:h-[330px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              {colonyChartMode === 'side_by_side' ? (
                <BarChart data={colonyComparisonData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis 
                    dataKey="category" 
                    stroke="#94A3B8" 
                    fontSize={11} 
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#94A3B8" 
                    fontSize={11} 
                    tickLine={false}
                    domain={[0, 'auto']}
                  />
                  <Tooltip content={<ColonyComparisonTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    formatter={(value) => (
                      <span className="text-slate-300 font-mono">
                        {value === 'pastValue' 
                          ? `Прошлый (Цикл ${selectedPastCycle.cycle} · Зв. ${selectedPastCycle.stardate.toFixed(1)})` 
                          : value === 'currentValue'
                            ? `Текущий цикл (${currentCycle.stardate.toFixed(1)})`
                            : 'Разница (Δ прирост)'}
                      </span>
                    )}
                  />
                  {/* Past Cycle Bar */}
                  <Bar 
                    dataKey="pastValue" 
                    name="pastValue" 
                    fill="#475569" 
                    radius={[4, 4, 0, 0]} 
                  />
                  {/* Current Cycle Bar */}
                  <Bar 
                    dataKey="currentValue" 
                    name="currentValue" 
                    fill="#10B981" 
                    radius={[4, 4, 0, 0]} 
                  />
                  {/* Difference Bar */}
                  <Bar 
                    dataKey="deltaValue" 
                    name="deltaValue" 
                    fill="#38BDF8" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              ) : (
                <BarChart data={colonyComparisonData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis 
                    dataKey="category" 
                    stroke="#94A3B8" 
                    fontSize={11} 
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#38BDF8" 
                    fontSize={11} 
                    tickLine={false}
                    tickFormatter={(val) => `${val > 0 ? '+' : ''}${val}`}
                  />
                  <Tooltip content={<ColonyComparisonTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    formatter={() => (
                      <span className="text-cyan-300 font-mono font-bold">
                        Чистый прирост доходов колоний (Текущий цикл минус Цикл {selectedPastCycle.cycle})
                      </span>
                    )}
                  />
                  <Bar dataKey="deltaValue" radius={[6, 6, 0, 0]}>
                    {colonyComparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Comparison Ledger Table */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden text-xs font-mono">
            <table className="w-full text-left">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Ресурс колоний</th>
                  <th className="py-2.5 px-3">Цикл {selectedPastCycle.cycle} (Зв. {selectedPastCycle.stardate.toFixed(1)})</th>
                  <th className="py-2.5 px-3">Текущий цикл ({currentCycle.stardate.toFixed(1)})</th>
                  <th className="py-2.5 px-3">Разница (Δ)</th>
                  <th className="py-2.5 px-3">Относительный прирост</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {colonyComparisonData.map((row, idx) => {
                  const percent = row.pastValue > 0 ? Math.round((row.deltaValue / row.pastValue) * 100) : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-100 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
                        <span>{row.category}</span>
                      </td>
                      <td className="py-2 px-3 tabular-nums text-slate-400">
                        {row.pastValue} {row.unit}
                      </td>
                      <td className="py-2 px-3 tabular-nums font-bold text-emerald-300">
                        {row.currentValue} {row.unit}
                      </td>
                      <td className="py-2 px-3 tabular-nums font-bold">
                        <span className={`inline-flex items-center gap-0.5 ${row.deltaValue >= 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
                          {row.deltaValue >= 0 ? `+${row.deltaValue}` : row.deltaValue} {row.unit}
                        </span>
                      </td>
                      <td className="py-2 px-3 tabular-nums">
                        <span className={`inline-flex items-center gap-1 font-bold ${percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {percent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{percent >= 0 ? `+${percent}%` : `${percent}%`}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: 5-CYCLE DYNAMICS (CREDITS & ALLOYS AREA/BAR CHARTS) */}
      {activeSection === 'dynamics' && (
        <div className="bg-slate-950/80 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h4 className="text-sm font-bold font-heading text-slate-100 flex items-center gap-2">
                <LineChartIcon className="w-4 h-4 text-cyan-400" />
                <span>Динамика кредитов и сплавов за 5 звёздных циклов</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Мониторинг общего состояния казны и промышленных резервов экспедиции.
              </p>
            </div>

            {/* Chart Type Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl flex-wrap">
              <button
                onClick={() => {
                  sounds.playScanPing();
                  setChartView('combined');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  chartView === 'combined'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Совмещённый (Области)
              </button>

              <button
                onClick={() => {
                  sounds.playScanPing();
                  setChartView('credits');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  chartView === 'credits'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-amber-400 hover:text-amber-200'
                }`}
              >
                Кредиты (⬡)
              </button>

              <button
                onClick={() => {
                  sounds.playScanPing();
                  setChartView('alloys');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  chartView === 'alloys'
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-sky-400 hover:text-sky-200'
                }`}
              >
                Сплавы (т)
              </button>

              <button
                onClick={() => {
                  sounds.playScanPing();
                  setChartView('delta');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  chartView === 'delta'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-emerald-400 hover:text-emerald-200'
                }`}
              >
                Прирост за цикл
              </button>
            </div>
          </div>

          {/* Recharts Canvas */}
          <div className="h-[280px] sm:h-[320px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'combined' ? (
                <AreaChart data={last5CyclesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="creditsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="alloysGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="cycleLabel" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis 
                    yAxisId="left"
                    stroke="#F59E0B" 
                    fontSize={11} 
                    tickLine={false}
                    domain={[0, 'auto']}
                    tickFormatter={(val) => `${val}⬡`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#38BDF8" 
                    fontSize={11} 
                    tickLine={false}
                    domain={[0, 'auto']}
                    tickFormatter={(val) => `${val}т`}
                  />
                  <Tooltip content={<CustomTooltip5 />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    formatter={(value) => (
                      <span className="text-slate-300 font-mono">
                        {value === 'credits' ? 'Баланс кредитов (⬡)' : 'Запас сплавов (т)'}
                      </span>
                    )}
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="credits" 
                    name="credits"
                    stroke="#F59E0B" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#creditsGradient)" 
                    activeDot={{ r: 6, fill: '#F59E0B', stroke: '#FFF' }}
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="alloys" 
                    name="alloys"
                    stroke="#38BDF8" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#alloysGradient)" 
                    activeDot={{ r: 6, fill: '#38BDF8', stroke: '#FFF' }}
                  />
                </AreaChart>
              ) : chartView === 'credits' ? (
                <AreaChart data={last5CyclesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="creditsSingleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="cycleLabel" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke="#F59E0B" 
                    fontSize={11} 
                    tickLine={false}
                    domain={[0, 'auto']}
                    tickFormatter={(val) => `${val} ⬡`}
                  />
                  <Tooltip content={<CustomTooltip5 />} />
                  <Area 
                    type="monotone" 
                    dataKey="credits" 
                    stroke="#F59E0B" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#creditsSingleGradient)" 
                    activeDot={{ r: 7, fill: '#F59E0B', stroke: '#FFF', strokeWidth: 2 }}
                  />
                </AreaChart>
              ) : chartView === 'alloys' ? (
                <BarChart data={last5CyclesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="cycleLabel" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke="#38BDF8" 
                    fontSize={11} 
                    tickLine={false}
                    domain={[0, 'auto']}
                    tickFormatter={(val) => `${val} т`}
                  />
                  <Tooltip content={<CustomTooltip5 />} />
                  <Bar 
                    dataKey="alloys" 
                    fill="#38BDF8" 
                    radius={[6, 6, 0, 0]}
                    name="Сплавы (т)"
                  />
                </BarChart>
              ) : (
                <BarChart data={last5CyclesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="cycleLabel" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke="#10B981" 
                    fontSize={11} 
                    tickLine={false}
                    tickFormatter={(val) => `${val > 0 ? '+' : ''}${val}`}
                  />
                  <Tooltip content={<CustomTooltip5 />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    formatter={(value) => (
                      <span className="text-slate-300 font-mono">
                        {value === 'creditsDelta' ? 'Прирост кредитов (⬡)' : 'Прирост сплавов (т)'}
                      </span>
                    )}
                  />
                  <Bar 
                    dataKey="creditsDelta" 
                    name="creditsDelta"
                    fill="#F59E0B" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="alloysDelta" 
                    name="alloysDelta"
                    fill="#38BDF8" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Interactive Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Используйте переключатель циклов, чтобы сравнивать доходы колоний с любым моментом истории экспедиции.
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onNavigateToMarket && (
            <button
              onClick={() => {
                sounds.playScanPing();
                if (onCloseModal) onCloseModal();
                onNavigateToMarket();
              }}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Торговый Терминал</span>
            </button>
          )}

          {onNavigateToColonies && (
            <button
              onClick={() => {
                sounds.playScanPing();
                if (onCloseModal) onCloseModal();
                onNavigateToColonies();
              }}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Управление Колониями</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
