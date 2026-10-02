import React from 'react';
import { CombatLogEntry } from '../types/game';
import { 
  Shield, 
  Zap, 
  Flame, 
  Crosshair, 
  Skull, 
  HeartPulse, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Radio,
  History
} from 'lucide-react';

interface CombatAftermathLogProps {
  logs: CombatLogEntry[];
  combatOutcome: 'victory' | 'defeat';
  enemiesSummary?: Array<{
    id: string;
    name: string;
    hull: number;
    maxHull: number;
    shields: number;
    maxShields: number;
  }>;
  playerSummary?: {
    name: string;
    hull: number;
    maxHull: number;
    shields: number;
    maxShields: number;
  };
}

export const CombatAftermathLog: React.FC<CombatAftermathLogProps> = ({
  logs,
  combatOutcome,
  enemiesSummary = [],
  playerSummary
}) => {
  // Filter for actual tactical combat action logs (attacks, hits, abilities) or take last 5 entries
  const actionLogs = logs
    .filter(log => log.type === 'player_attack' || log.type === 'enemy_attack' || log.type === 'hull_damage' || log.type === 'shield_hit' || log.damageDealt !== undefined)
    .slice(0, 5);

  // If there are fewer than 5 action-specific logs, fallback to the latest 5 non-system logs or general logs
  const displayLogs = actionLogs.length >= 3 
    ? actionLogs 
    : logs.filter(l => l.type !== 'system').slice(0, 5);

  const getStatusBadge = (status?: string, remainingHull?: number, maxHull?: number) => {
    if (status === 'destroyed' || (remainingHull !== undefined && remainingHull <= 0)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-400 border border-rose-800/60 shadow-sm shadow-rose-950/50">
          <Skull className="w-3 h-3 text-rose-400" />
          УНИЧТОЖЕН
        </span>
      );
    }
    if (status === 'critical' || (remainingHull !== undefined && maxHull && remainingHull < maxHull * 0.3)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          КРИТИЧЕСКИЙ УРОН
        </span>
      );
    }
    if (status === 'shield_broken') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
          <Shield className="w-3 h-3 text-cyan-400" />
          ЩИТЫ ПРОБИТЫ
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
        <Activity className="w-3 h-3 text-emerald-400" />
        В СТРОЮ
      </span>
    );
  };

  return (
    <div className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 text-left shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-heading text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <span>Лог последних 5 боевых действий</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/40">
                ТАКТИЧЕСКИЙ АНАЛИЗ
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 font-sans">
              Нанесённый урон, критические попадания и состояние целей после боя
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded border ${
            combatOutcome === 'victory'
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-600/50'
              : 'bg-rose-950/60 text-rose-400 border-rose-600/50'
          }`}>
            {combatOutcome === 'victory' ? 'ПОБЕДА ФЛОТА' : 'ПОРАЖЕНИЕ'}
          </span>
        </div>
      </div>

      {/* List of last 5 actions */}
      <div className="space-y-2 mb-3.5">
        {displayLogs.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-500 font-mono">
            Боевые действия отсутствуют в журнале бортового регистратора
          </div>
        ) : (
          displayLogs.map((log, index) => {
            const isPlayerAttack = log.type === 'player_attack' || (log.initiatorName && !log.initiatorName.includes('Враг') && !log.initiatorName.includes('Корсар'));
            const isDefeat = log.type === 'defeat';
            const isCrit = log.isCritical || log.text.includes('КРИТИЧЕСКИЙ') || log.text.includes('крит');

            return (
              <div 
                key={log.id || index}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-lg p-2.5 transition-all text-xs font-mono"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <span className="text-[10px] text-slate-500 font-mono pt-0.5 shrink-0">
                      #{index + 1}
                    </span>

                    <div className="p-1 rounded bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                      {isPlayerAttack ? (
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      ) : isDefeat ? (
                        <Skull className="w-3.5 h-3.5 text-rose-500" />
                      ) : (
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-200">
                          {log.initiatorName || (isPlayerAttack ? 'Флагман игрока' : 'Вражеский корабль')}
                        </span>
                        <span className="text-slate-500 text-[10px]">➜</span>
                        <span className="text-cyan-300 font-medium">
                          {log.targetName || (isPlayerAttack ? 'Вражеская цель' : 'Ваш флагман')}
                        </span>
                        {log.actionName && (
                          <span className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">
                            {log.actionName}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-300 font-sans mt-0.5 leading-snug">
                        {log.text}
                      </p>
                    </div>
                  </div>

                  {/* Damage and Status Column */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {log.damageDealt !== undefined ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-sans">Урон:</span>
                        <span className={`font-bold font-mono text-xs ${isCrit ? 'text-amber-300 animate-pulse' : 'text-rose-400'}`}>
                          -{log.damageDealt} {isCrit ? '💥 (КРИТ)' : 'HP'}
                        </span>
                      </div>
                    ) : null}

                    {getStatusBadge(
                      log.targetStatus, 
                      log.targetHullRemaining,
                      log.targetHullRemaining !== undefined ? 100 : undefined
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Final Target Statuses Summary (Enemies + Player) */}
      {(enemiesSummary.length > 0 || playerSummary) && (
        <div className="pt-2.5 border-t border-slate-800/80">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Radio className="w-3 h-3 text-cyan-400" />
            <span>Финальное состояние участников боя:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {playerSummary && (
              <div className="bg-slate-900/60 border border-cyan-900/30 rounded-lg p-2 flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-semibold text-[11px] flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5 text-cyan-400" />
                    {playerSummary.name} (Вы)
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Щиты: <span className="text-cyan-300 font-bold">{Math.max(0, playerSummary.shields)}/{playerSummary.maxShields}</span> | Корпус: <span className="text-emerald-400 font-bold">{Math.max(0, playerSummary.hull)}/{playerSummary.maxHull}</span>
                  </div>
                </div>
                {getStatusBadge(playerSummary.hull <= 0 ? 'destroyed' : playerSummary.hull < playerSummary.maxHull * 0.3 ? 'critical' : 'operational', playerSummary.hull, playerSummary.maxHull)}
              </div>
            )}

            {enemiesSummary.map(e => (
              <div key={e.id} className="bg-slate-900/60 border border-rose-900/30 rounded-lg p-2 flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-semibold text-[11px] flex items-center gap-1">
                    <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                    {e.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Щиты: <span className="text-cyan-300 font-bold">{Math.max(0, e.shields)}/{e.maxShields}</span> | Корпус: <span className="text-rose-400 font-bold">{Math.max(0, e.hull)}/{e.maxHull}</span>
                  </div>
                </div>
                {getStatusBadge(e.hull <= 0 ? 'destroyed' : e.hull < e.maxHull * 0.3 ? 'critical' : 'operational', e.hull, e.maxHull)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
