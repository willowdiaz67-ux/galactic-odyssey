import React, { useState } from 'react';
import { ExpeditionLogEntry, ExpeditionActionType, StarSystem } from '../types/game';
import { getActionTypeColor, getActionTypeLabel } from '../data/expeditionLogsData';
import { sounds } from '../services/soundEffects';
import {
  ScrollText,
  Swords,
  Rocket,
  Globe2,
  Store,
  Coins,
  ShieldAlert,
  Clock,
  MapPin,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Building2,
  ExternalLink,
  Sparkles,
  Zap,
  Award,
  Users
} from 'lucide-react';

interface GalacticExpeditionLogSectionProps {
  logs: ExpeditionLogEntry[];
  currentSystem: StarSystem;
  onNavigateToMarket?: () => void;
  onNavigateToColonies?: () => void;
  onNavigateToSystemMap?: () => void;
  onCloseModal?: () => void;
}

export const GalacticExpeditionLogSection: React.FC<GalacticExpeditionLogSectionProps> = ({
  logs,
  currentSystem,
  onNavigateToMarket,
  onNavigateToColonies,
  onNavigateToSystemMap,
  onCloseModal
}) => {
  const [filter, setFilter] = useState<'all' | ExpeditionActionType>('all');

  const displayLogs = logs.slice(0, 10);
  const filteredLogs = filter === 'all' 
    ? displayLogs 
    : displayLogs.filter(log => log.type === filter);

  const countDocking = displayLogs.filter(l => l.type === 'docking').length;
  const countCombat = displayLogs.filter(l => l.type === 'combat').length;
  const countColony = displayLogs.filter(l => l.type === 'colony').length;
  const countTrade = displayLogs.filter(l => l.type === 'trade').length;
  const countAnomaly = displayLogs.filter(l => l.type === 'anomaly').length;

  const getTypeIcon = (type: ExpeditionActionType) => {
    switch (type) {
      case 'docking':
        return <Rocket className="w-4 h-4 text-cyan-400" />;
      case 'combat':
        return <Swords className="w-4 h-4 text-rose-400" />;
      case 'colony':
        return <Globe2 className="w-4 h-4 text-emerald-400" />;
      case 'trade':
        return <Store className="w-4 h-4 text-amber-400" />;
      case 'anomaly':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section Header & Briefing */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 p-4 rounded-2xl border border-emerald-500/30 shadow-lg shadow-emerald-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950/90 rounded-xl border border-emerald-600/60 text-emerald-400 shadow-md shadow-emerald-950">
              <ScrollText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  ХРОНИКА ЭКСПЕДИЦИИ
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ПОСЛЕДНИЕ {displayLogs.length} СОБЫТИЙ
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-slate-100 mt-0.5">
                Бортовой журнал флагмана «Астрея»
              </h3>
            </div>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-[11px] text-slate-400 block font-mono">
              Локация флагмана:
            </span>
            <span className="text-xs font-bold text-cyan-300 font-mono flex items-center sm:justify-end gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              {currentSystem.name} ({currentSystem.sectorName})
            </span>
          </div>
        </div>

        {/* 4 Summary Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3.5 border-t border-slate-800/80 text-xs font-mono">
          <div 
            onClick={() => {
              sounds.playScanPing();
              setFilter(filter === 'docking' ? 'all' : 'docking');
            }}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              filter === 'docking' 
                ? 'bg-cyan-950/70 border-cyan-500 shadow-md shadow-cyan-950' 
                : 'bg-slate-950/60 border-slate-800/80 hover:border-cyan-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                <Rocket className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Стыковки</span>
                <span className="font-bold text-cyan-300 text-sm">{countDocking}</span>
              </div>
            </div>
            <span className="text-[10px] text-cyan-500 font-mono">Швартовки</span>
          </div>

          <div 
            onClick={() => {
              sounds.playScanPing();
              setFilter(filter === 'combat' ? 'all' : 'combat');
            }}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              filter === 'combat' 
                ? 'bg-rose-950/70 border-rose-500 shadow-md shadow-rose-950' 
                : 'bg-slate-950/60 border-slate-800/80 hover:border-rose-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-950 text-rose-400 border border-rose-800">
                <Swords className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Битвы</span>
                <span className="font-bold text-rose-300 text-sm">{countCombat}</span>
              </div>
            </div>
            <span className="text-[10px] text-rose-500 font-mono">Бои</span>
          </div>

          <div 
            onClick={() => {
              sounds.playScanPing();
              setFilter(filter === 'colony' ? 'all' : 'colony');
            }}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              filter === 'colony' 
                ? 'bg-emerald-950/70 border-emerald-500 shadow-md shadow-emerald-950' 
                : 'bg-slate-950/60 border-slate-800/80 hover:border-emerald-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                <Globe2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Колонии</span>
                <span className="font-bold text-emerald-300 text-sm">{countColony}</span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-500 font-mono">Форпосты</span>
          </div>

          <div 
            onClick={() => {
              sounds.playScanPing();
              setFilter(filter === 'trade' ? 'all' : 'trade');
            }}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              filter === 'trade' 
                ? 'bg-amber-950/70 border-amber-500 shadow-md shadow-amber-950' 
                : 'bg-slate-950/60 border-slate-800/80 hover:border-amber-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                <Store className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Торговля</span>
                <span className="font-bold text-amber-300 text-sm">{countTrade}</span>
              </div>
            </div>
            <span className="text-[10px] text-amber-500 font-mono">Сделки</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              sounds.playScanPing();
              setFilter('all');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              filter === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Все действия ({displayLogs.length})
          </button>

          <button
            onClick={() => {
              sounds.playScanPing();
              setFilter('docking');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              filter === 'docking'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950'
                : 'bg-slate-900 text-slate-400 hover:text-cyan-300 border border-slate-800'
            }`}
          >
            <Rocket className="w-3 h-3 text-cyan-400" />
            <span>Стыковки ({countDocking})</span>
          </button>

          <button
            onClick={() => {
              sounds.playScanPing();
              setFilter('combat');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              filter === 'combat'
                ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-950'
                : 'bg-slate-900 text-slate-400 hover:text-rose-300 border border-slate-800'
            }`}
          >
            <Swords className="w-3 h-3 text-rose-400" />
            <span>Битвы ({countCombat})</span>
          </button>

          <button
            onClick={() => {
              sounds.playScanPing();
              setFilter('colony');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              filter === 'colony'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950'
                : 'bg-slate-900 text-slate-400 hover:text-emerald-300 border border-slate-800'
            }`}
          >
            <Globe2 className="w-3 h-3 text-emerald-400" />
            <span>Колонии ({countColony})</span>
          </button>

          <button
            onClick={() => {
              sounds.playScanPing();
              setFilter('trade');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              filter === 'trade'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950'
                : 'bg-slate-900 text-slate-400 hover:text-amber-300 border border-slate-800'
            }`}
          >
            <Store className="w-3 h-3 text-amber-400" />
            <span>Торговля ({countTrade})</span>
          </button>

          <button
            onClick={() => {
              sounds.playScanPing();
              setFilter('anomaly');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              filter === 'anomaly'
                ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-950'
                : 'bg-slate-900 text-slate-400 hover:text-purple-300 border border-slate-800'
            }`}
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Аномалии ({countAnomaly})</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-mono">
          Отображено: {filteredLogs.length} из {displayLogs.length}
        </span>
      </div>

      {/* Log Entries List */}
      <div className="space-y-3.5">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 border border-slate-800/80 rounded-2xl">
            <ScrollText className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-bounce" />
            <h4 className="text-sm font-bold text-slate-300">Нет записей по данному фильтру</h4>
            <p className="text-xs text-slate-500 mt-1">
              В последних 10 действиях флагмана пока нет событий выбранной категории. Продолжайте экспедицию!
            </p>
          </div>
        ) : (
          filteredLogs.map((entry, index) => {
            const colors = getActionTypeColor(entry.type);
            const isFirst = index === 0;

            return (
              <div
                key={entry.id}
                className={`p-4 rounded-xl border transition-all ${colors.bg} ${colors.border} relative overflow-hidden group shadow-md ${colors.glow}`}
              >
                {/* Index ribbon */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Index badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isFirst 
                        ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/50' 
                        : 'bg-slate-900 text-slate-300 border border-slate-700'
                    }`}>
                      #{index + 1} {isFirst && '· ПОСЛЕДНЕЕ ДЕЙСТВИЕ'}
                    </span>

                    {/* Action category pill */}
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${colors.badgeBg}`}>
                      {getTypeIcon(entry.type)}
                      <span>{getActionTypeLabel(entry.type).toUpperCase()}</span>
                    </span>

                    {/* Secondary badge if present */}
                    {entry.badge && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-700">
                        {entry.badge}
                      </span>
                    )}
                  </div>

                  {/* Timestamp & Location */}
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {entry.timestamp}
                    </span>
                    {(entry.systemName || entry.sectorName) && (
                      <>
                        <span className="text-slate-600">·</span>
                        <span className="flex items-center gap-1 text-slate-300 font-semibold">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          {entry.systemName || 'Система'} {entry.sectorName ? `(${entry.sectorName})` : ''}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Entry Title & Lore Narrative */}
                <div className="mt-2.5">
                  <h4 className="font-heading font-bold text-sm sm:text-base text-slate-100 group-hover:text-cyan-200 transition-colors">
                    {entry.title}
                  </h4>
                  <p className="text-xs text-slate-300 font-sans mt-1.5 leading-relaxed">
                    {entry.description}
                  </p>
                </div>

                {/* Metrics & Outcome tags */}
                {entry.metrics && Object.keys(entry.metrics).length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate-400 font-semibold">Итоги операции:</span>

                      {entry.metrics.credits !== undefined && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold border ${
                          entry.metrics.credits >= 0 
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' 
                            : 'bg-rose-950/80 text-rose-300 border-rose-800'
                        }`}>
                          {entry.metrics.credits >= 0 ? (
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-rose-400" />
                          )}
                          <span>
                            {entry.metrics.credits >= 0 ? `+${entry.metrics.credits}` : `${entry.metrics.credits}`} ⬡
                          </span>
                        </span>
                      )}

                      {entry.metrics.alloys !== undefined && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold bg-slate-900 text-cyan-300 border border-cyan-800">
                          <span>{entry.metrics.alloys >= 0 ? `+${entry.metrics.alloys}` : entry.metrics.alloys} сплавов</span>
                        </span>
                      )}

                      {entry.metrics.science !== undefined && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold bg-purple-950/80 text-purple-300 border border-purple-800">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>+{entry.metrics.science} науки</span>
                        </span>
                      )}

                      {entry.metrics.colonists !== undefined && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                          <Users className="w-3 h-3 text-emerald-400" />
                          <span>{entry.metrics.colonists} поселенцев</span>
                        </span>
                      )}

                      {entry.metrics.xp !== undefined && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
                          <Award className="w-3 h-3 text-amber-400" />
                          <span>+{entry.metrics.xp} XP командира</span>
                        </span>
                      )}

                      {entry.metrics.outcome && (
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 font-bold uppercase">
                          {entry.metrics.outcome === 'victory' ? 'Победа' :
                           entry.metrics.outcome === 'profit' ? 'Прибыль' :
                           entry.metrics.outcome === 'investment' ? 'Инвестиция' :
                           entry.metrics.outcome === 'flee' ? 'Отступление' : 'Завершено'}
                        </span>
                      )}
                    </div>

                    {/* Contextual navigation link */}
                    <div className="flex items-center gap-2">
                      {entry.type === 'trade' && onNavigateToMarket && (
                        <button
                          onClick={() => {
                            sounds.playScanPing();
                            if (onCloseModal) onCloseModal();
                            onNavigateToMarket();
                          }}
                          className="px-2.5 py-1 rounded bg-amber-950/90 hover:bg-amber-900 text-amber-300 border border-amber-700/60 font-bold transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <Store className="w-3 h-3" />
                          <span>В терминал рынка</span>
                        </button>
                      )}

                      {entry.type === 'colony' && onNavigateToColonies && (
                        <button
                          onClick={() => {
                            sounds.playScanPing();
                            if (onCloseModal) onCloseModal();
                            onNavigateToColonies();
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 font-bold transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <Building2 className="w-3 h-3" />
                          <span>К колониям</span>
                        </button>
                      )}

                      {entry.type === 'docking' && onNavigateToSystemMap && (
                        <button
                          onClick={() => {
                            sounds.playScanPing();
                            if (onCloseModal) onCloseModal();
                            onNavigateToSystemMap();
                          }}
                          className="px-2.5 py-1 rounded bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 font-bold transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <Rocket className="w-3 h-3" />
                          <span>На орбиту</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Lore Briefing */}
      <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Бортовой журнал экспедиции непрерывно фиксирует последние 10 действий флагмана. Все записи синхронизированы с квантовым реестром ОФЗ.
          </span>
        </div>
      </div>
    </div>
  );
};
