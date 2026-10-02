import React, { useState } from 'react';
import { 
  HonorCommander, 
  getHonorLeaderboard,
  PlayerHonorData 
} from '../data/galacticHonorBoardData';
import { CommanderProgression, ShipStats, Resources } from '../types/game';
import { Kingdom, KingdomTitle } from '../types/kingdom';
import { sounds } from '../services/soundEffects';
import { 
  Award, 
  Crown, 
  Shield, 
  Swords, 
  TrendingUp, 
  Sparkles, 
  ChevronRight, 
  X, 
  Zap, 
  Flame, 
  Target, 
  Info,
  Medal,
  ChevronUp,
  UserCheck,
  Compass
} from 'lucide-react';

interface GalacticHonorBoardWidgetProps {
  playerName?: string;
  activeTitle?: KingdomTitle | null;
  commander?: CommanderProgression;
  shipStats?: ShipStats;
  resources?: Resources;
  kingdoms?: Kingdom[];
  onOpenCommanderModal?: () => void;
  onOpenKingdomsTitles?: () => void;
}

export const GalacticHonorBoardWidget: React.FC<GalacticHonorBoardWidgetProps> = ({
  playerName = 'Командир Астреи',
  activeTitle = null,
  commander,
  shipStats,
  resources,
  kingdoms,
  onOpenCommanderModal,
  onOpenKingdomsTitles
}) => {
  const [filter, setFilter] = useState<'all' | 'top5' | 'kings' | 'bleach' | 'dragon_ball' | 'galaxy'>('all');
  const [selectedCommander, setSelectedCommander] = useState<HonorCommander | null>(null);

  const { leaderboard, playerEntry, playerStats } = React.useMemo(() => {
    return getHonorLeaderboard(
      playerName,
      activeTitle,
      commander,
      shipStats,
      resources,
      kingdoms
    );
  }, [playerName, activeTitle, commander, shipStats, resources, kingdoms]);

  // Filtered commanders list
  const filteredCommanders = React.useMemo(() => {
    return leaderboard.filter(c => {
      if (filter === 'top5') return c.rank <= 5;
      if (filter === 'kings') return c.level >= 35 || c.name.includes('Король') || c.name.includes('Монарх') || c.name.includes('Император') || c.name.includes('Патриарх');
      if (filter === 'bleach') return c.universe === 'bleach';
      if (filter === 'dragon_ball') return c.universe === 'dragon_ball';
      if (filter === 'galaxy') return c.universe === 'galaxy';
      return true;
    });
  }, [leaderboard, filter]);

  const top3 = leaderboard.slice(0, 3);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 font-bold flex items-center justify-center text-xs shadow-md shadow-amber-950 border border-amber-300">
          🥇 1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 font-bold flex items-center justify-center text-xs shadow-md shadow-slate-800 border border-white">
          🥈 2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-700 to-orange-800 text-amber-100 font-bold flex items-center justify-center text-xs shadow-md shadow-amber-950 border border-amber-600">
          🥉 3
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-mono font-bold flex items-center justify-center text-xs">
        #{rank}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Introduction */}
      <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-cyan-950/40 p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 text-2xl shadow-lg shadow-amber-950 border border-amber-300 shrink-0">
              <Award className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-950/90 px-2 py-0.5 rounded border border-amber-700/80">
                  РЕЕСТР СЛАВЫ ОФЗ
                </span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  {playerStats.totalCommanders} КОМАНДИРОВ
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-slate-100 mt-0.5">
                Галактическая Доска Почёта
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Официальный рейтинг известнейших командующих, монархов и асов пяти великих держав и параллельных миров.
              </p>
            </div>
          </div>

          {/* Quick Player Standing Ribbon */}
          <div className="flex items-center gap-3 bg-slate-950/90 border border-cyan-500/40 px-3.5 py-2.5 rounded-xl text-xs font-mono shadow-md w-full md:w-auto justify-between md:justify-start">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Ваш текущий ранг:</div>
              <div className="text-base font-bold text-amber-300 flex items-center gap-1.5">
                <span>Ранг #{playerStats.rank}</span>
                <span className="text-xs font-normal text-slate-400">из {playerStats.totalCommanders}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Очки славы:</div>
              <div className="text-base font-bold text-cyan-300 tabular-nums">
                {playerStats.score.toLocaleString()} ⬡
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player's Highlight Card with Overtake Progress */}
      <div className="rounded-2xl border-2 border-cyan-500/60 bg-gradient-to-r from-cyan-950/50 via-slate-900/90 to-blue-950/50 p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border-2 border-cyan-400 flex items-center justify-center text-3xl shadow-lg shadow-cyan-950 shrink-0">
              {playerEntry.avatarEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/50">
                  ВЫ НА ДОСКЕ ПОЧЁТА
                </span>
                <span className="text-xs font-bold text-amber-400">
                  {playerStats.tierName}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <h4 className="text-lg font-bold font-heading text-slate-100">
                  {playerName}
                </h4>
                {activeTitle ? (
                  <span 
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold border shadow-sm"
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
                    (Без королевского титула)
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-300 font-sans mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Флагман: <strong className="text-cyan-300">{playerEntry.flagshipName}</strong></span>
                <span>Уровень: <strong className="text-amber-300">{playerEntry.level}</strong></span>
                <span>Боевая мощь: <strong className="text-rose-400">{playerStats.militaryPower.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          {/* Overtake Progress Metric */}
          <div className="w-full lg:w-80 bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ближайший соперник:</span>
              </span>
              {playerStats.nextCommander ? (
                <span className="text-amber-300 font-bold truncate max-w-[140px]">
                  #{playerStats.nextCommander.rank} {playerStats.nextCommander.name}
                </span>
              ) : (
                <span className="text-emerald-400 font-bold">Вы на вершине славы!</span>
              )}
            </div>

            {playerStats.nextCommander && (
              <>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((playerStats.score / playerStats.nextCommander.score) * 100))}%`
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>До обгона ранга #{playerStats.nextCommander.rank}:</span>
                  <strong className="text-amber-400 tabular-nums">+{playerStats.pointsToNextRank.toLocaleString()} очков</strong>
                </div>
              </>
            )}

            <div className="pt-1 flex items-center gap-2">
              {onOpenCommanderModal && (
                <button
                  onClick={() => {
                    sounds.playScanPing();
                    onOpenCommanderModal();
                  }}
                  className="flex-1 py-1 px-2 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-[11px] font-bold text-center transition-colors"
                >
                  Прокачать Навыки
                </button>
              )}
              {onOpenKingdomsTitles && (
                <button
                  onClick={() => {
                    sounds.playScanPing();
                    onOpenKingdomsTitles();
                  }}
                  className="flex-1 py-1 px-2 rounded bg-amber-950 hover:bg-amber-900 border border-amber-700/60 text-amber-300 text-[11px] font-bold text-center transition-colors"
                >
                  Титулы Короны
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium (1st, 2nd, 3rd) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {top3.map((cmd) => {
          const isPlayer = cmd.isPlayer;
          const medal = cmd.rank === 1 ? '🥇' : cmd.rank === 2 ? '🥈' : '🥉';
          const pedestalColor = 
            cmd.rank === 1 ? 'border-amber-400 bg-amber-950/20' : 
            cmd.rank === 2 ? 'border-slate-300 bg-slate-900/60' : 
            'border-amber-700 bg-orange-950/20';

          return (
            <div 
              key={cmd.id}
              onClick={() => {
                sounds.playScanPing();
                setSelectedCommander(cmd);
              }}
              className={`rounded-2xl border-2 p-4 transition-all cursor-pointer relative overflow-hidden shadow-xl hover:scale-[1.02] ${pedestalColor} ${
                isPlayer ? 'ring-2 ring-cyan-400' : ''
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-2xl">{medal}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase" style={{ color: cmd.themeColor, backgroundColor: `${cmd.themeColor}22` }}>
                  {cmd.universeLabel}
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  УР. {cmd.level}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <div 
                  className="w-12 h-12 rounded-xl border flex items-center justify-center text-2xl shadow-md shrink-0 bg-slate-950"
                  style={{ borderColor: cmd.themeColor }}
                >
                  {cmd.avatarEmoji}
                </div>
                <div className="min-w-0">
                  <h5 className="font-heading font-bold text-sm text-slate-100 truncate">
                    {cmd.name}
                  </h5>
                  <p className="text-[11px] font-sans text-slate-400 truncate">
                    {cmd.title}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Очки рейтинга:</span>
                <strong className="text-amber-400 tabular-nums">{cmd.score.toLocaleString()} ⬡</strong>
              </div>

              <div className="mt-1 text-[11px] text-slate-500 font-mono truncate">
                Флагман: <span className="text-slate-300">{cmd.flagshipName}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
            }`}
          >
            Все командующие ({leaderboard.length})
          </button>
          <button
            onClick={() => setFilter('top5')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'top5'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950'
                : 'text-amber-400 hover:text-amber-200 bg-slate-900 border border-slate-800'
            }`}
          >
            👑 Топ-5 Асов
          </button>
          <button
            onClick={() => setFilter('kings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'kings'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950'
                : 'text-purple-400 hover:text-purple-200 bg-slate-900 border border-slate-800'
            }`}
          >
            Монархи & Короли
          </button>
          <button
            onClick={() => setFilter('bleach')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'bleach'
                ? 'bg-sky-500 text-slate-950'
                : 'text-sky-400 hover:text-sky-200 bg-slate-900 border border-slate-800'
            }`}
          >
            🌸 Bleach: Сообщество Душ
          </button>
          <button
            onClick={() => setFilter('dragon_ball')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'dragon_ball'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-emerald-400 hover:text-emerald-200 bg-slate-900 border border-slate-800'
            }`}
          >
            ✨ Dragon Ball: Намек
          </button>
          <button
            onClick={() => setFilter('galaxy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'galaxy'
                ? 'bg-blue-600 text-white'
                : 'text-blue-400 hover:text-blue-200 bg-slate-900 border border-slate-800'
            }`}
          >
            🚀 Галактика ОФЗ
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Нажмите на командира для просмотра досье
        </div>
      </div>

      {/* Main Leaderboard Table / Cards List */}
      <div className="space-y-2.5">
        {filteredCommanders.map((cmd) => {
          const isPlayer = cmd.isPlayer;

          return (
            <div
              key={cmd.id}
              onClick={() => {
                sounds.playScanPing();
                setSelectedCommander(cmd);
              }}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isPlayer
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/80 hover:bg-cyan-950/60'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              {/* Left Zone: Rank, Avatar, Name & Title */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="shrink-0">
                  {getRankBadge(cmd.rank)}
                </div>

                <div 
                  className="w-10 h-10 rounded-xl border flex items-center justify-center text-xl shrink-0 bg-slate-900"
                  style={{ borderColor: cmd.themeColor }}
                >
                  {cmd.avatarEmoji}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className="font-heading font-bold text-sm text-slate-100 truncate">
                      {cmd.name}
                    </h5>
                    {isPlayer && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/50">
                        ВЫ
                      </span>
                    )}
                    <span 
                      className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded uppercase"
                      style={{ color: cmd.themeColor, backgroundColor: `${cmd.themeColor}18` }}
                    >
                      {cmd.universeLabel}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 font-sans truncate">
                    {cmd.title}
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono mt-0.5 hidden sm:block">
                    Флагман: <span className="text-slate-200">{cmd.flagshipName}</span>
                  </div>
                </div>
              </div>

              {/* Right Zone: Telemetry, Rating & Score */}
              <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 font-mono text-xs">
                <div className="text-left sm:text-right">
                  <div className="text-[10px] text-slate-500">УРОВЕНЬ</div>
                  <div className="font-bold text-slate-200">
                    УР. {cmd.level}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-[10px] text-slate-500">БОЕВАЯ МОЩЬ</div>
                  <div className="font-bold text-rose-400 tabular-nums">
                    {cmd.militaryPower.toLocaleString()}
                  </div>
                </div>

                <div className="text-right min-w-[90px]">
                  <div className="text-[10px] text-slate-500">РЕЙТИНГ</div>
                  <div className="text-sm font-bold text-amber-400 tabular-nums">
                    {cmd.score.toLocaleString()} ⬡
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-500 hidden sm:block" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Commander Dossier Modal */}
      {selectedCommander && (
        <div className="fixed inset-0 bg-[#03050C]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn select-none">
          <div className="bg-[#090D1C] border border-cyan-500/60 rounded-2xl max-w-xl w-full flex flex-col shadow-2xl shadow-cyan-950 overflow-hidden">
            {/* Header */}
            <div 
              className="p-5 border-b border-slate-800 flex items-center justify-between"
              style={{ backgroundColor: `${selectedCommander.themeColor}15` }}
            >
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-3xl shadow-xl bg-slate-950"
                  style={{ borderColor: selectedCommander.themeColor }}
                >
                  {selectedCommander.avatarEmoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase"
                      style={{
                        color: selectedCommander.themeColor,
                        borderColor: `${selectedCommander.themeColor}66`,
                        backgroundColor: `${selectedCommander.themeColor}22`
                      }}
                    >
                      {selectedCommander.universeLabel}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      Ранг #{selectedCommander.rank} в Галактике
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-heading text-slate-100 mt-1">
                    {selectedCommander.name}
                  </h3>
                  <p className="text-xs text-slate-300 font-sans">
                    {selectedCommander.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCommander(null)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs font-mono overflow-y-auto max-h-[70vh]">
              {/* Quote */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 italic text-slate-200 font-sans text-xs">
                «{selectedCommander.quote}»
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-500">УРОВЕНЬ</div>
                  <div className="text-sm font-bold text-slate-100 mt-0.5">УР. {selectedCommander.level}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-500">ОЧКИ РЕЙТИНГА</div>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">{selectedCommander.score.toLocaleString()} ⬡</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-500">БОЕВАЯ МОЩЬ</div>
                  <div className="text-sm font-bold text-rose-400 mt-0.5">{selectedCommander.militaryPower.toLocaleString()}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-500">ПОБЕД В БОЯХ</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">{selectedCommander.battlesWon}</div>
                </div>
              </div>

              {/* Flagship Section */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-cyan-300">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" /> Флагман Командующего:
                  </span>
                  <span className="text-slate-200 font-bold">{selectedCommander.flagshipName}</span>
                </div>

                {selectedCommander.flagshipSpecs && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div>
                      <span className="text-slate-500">Корпус:</span> <strong className="text-slate-200">{selectedCommander.flagshipSpecs.hull} HP</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Щиты:</span> <strong className="text-cyan-400">{selectedCommander.flagshipSpecs.shields} SP</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Орудия:</span> <strong className="text-rose-400">{selectedCommander.flagshipSpecs.weapons} PWR</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Speciality */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  ТАКТИЧЕСКАЯ СПЕЦИАЛИЗАЦИЯ И СТИЛЬ БОЯ:
                </div>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  {selectedCommander.speciality}
                </p>
              </div>

              {/* Status Role */}
              <div className="text-[11px] text-slate-400">
                Официальный статус: <strong className="text-slate-200">{selectedCommander.role}</strong>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-slate-800 bg-slate-950/90 flex justify-end">
              <button
                onClick={() => setSelectedCommander(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors font-bold text-xs font-mono"
              >
                Закрыть досье
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
