import React, { useEffect } from 'react';
import { SpatialAnomaly } from '../types/game';
import { getAnomalyPolarityBadge } from '../data/anomaliesData';
import { sounds } from '../services/soundEffects';
import { 
  Zap, 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle, 
  Fuel, 
  Coins, 
  Layers, 
  Atom, 
  Award, 
  MapPin, 
  X,
  Compass,
  ArrowRight
} from 'lucide-react';

interface SpatialAnomalyModalProps {
  anomaly: SpatialAnomaly;
  onClose: () => void;
  onViewExpeditionLog?: () => void;
}

export const SpatialAnomalyModal: React.FC<SpatialAnomalyModalProps> = ({
  anomaly,
  onClose,
  onViewExpeditionLog
}) => {
  const badge = getAnomalyPolarityBadge(anomaly.polarity);

  useEffect(() => {
    if (anomaly.polarity === 'bonus' || anomaly.polarity === 'quantum') {
      sounds.playVictoryFanfare();
    } else if (anomaly.polarity === 'penalty') {
      sounds.playAlert();
    } else {
      sounds.playScanPing();
    }
  }, [anomaly.polarity]);

  const { effectValues } = anomaly;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg rounded-2xl border bg-[#080C16] shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]"
        style={{
          borderColor: `${anomaly.visualColor}80`,
          boxShadow: `0 0 35px ${anomaly.visualGlow}`
        }}
      >
        {/* Top Glowing Header Strip */}
        <div 
          className="h-2 w-full transition-all"
          style={{
            background: `linear-gradient(90deg, transparent, ${anomaly.visualColor}, transparent)`
          }}
        />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/60 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div 
              className="p-3 rounded-xl border flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${anomaly.visualColor}20`,
                borderColor: `${anomaly.visualColor}60`,
                color: anomaly.visualColor
              }}
            >
              {anomaly.polarity === 'bonus' ? (
                <Zap className="w-6 h-6 animate-pulse" />
              ) : anomaly.polarity === 'penalty' ? (
                <ShieldAlert className="w-6 h-6 animate-bounce" />
              ) : anomaly.polarity === 'quantum' ? (
                <Sparkles className="w-6 h-6 animate-spin" />
              ) : (
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}>
                  {badge.label}
                </span>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  {anomaly.systemName} • {anomaly.sectorName}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-100 mt-1">
                {anomaly.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Subtitle / Title banner */}
          <div 
            className="p-3 rounded-xl border flex items-center justify-between gap-3"
            style={{
              backgroundColor: `${anomaly.visualColor}10`,
              borderColor: `${anomaly.visualColor}40`
            }}
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 shrink-0" style={{ color: anomaly.visualColor }} />
              <span className="font-bold text-slate-200">
                {anomaly.title}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest shrink-0">
              ВАРП-ПЕРЕХОД
            </span>
          </div>

          {/* Lore description */}
          <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
            {anomaly.description}
          </p>

          {/* Applied Impact Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block font-bold">
              Воздействие аномалии на экспедицию:
            </span>
            <div className="text-sm font-semibold text-slate-100 flex items-start gap-2">
              <span className="text-cyan-400 text-base leading-none">◈</span>
              <span>{anomaly.effectDescription}</span>
            </div>

            {/* Metrics Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 font-mono text-xs">
              {effectValues.freeFuel && (
                <div className="p-2 rounded bg-cyan-950/60 border border-cyan-800/70 text-cyan-300 flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-cyan-400" />
                  <span>0 He-3 (Варп x2)</span>
                </div>
              )}

              {effectValues.shieldDelta !== undefined && (
                <div className={`p-2 rounded border flex items-center gap-1.5 ${
                  effectValues.shieldDelta > 0 
                    ? 'bg-emerald-950/60 border-emerald-800/70 text-emerald-300' 
                    : 'bg-rose-950/60 border-rose-800/70 text-rose-300'
                }`}>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>
                    {effectValues.shieldDelta > 0 ? `+${effectValues.shieldDelta}` : effectValues.shieldDelta} Щиты HP
                  </span>
                </div>
              )}

              {effectValues.hullDelta !== undefined && (
                <div className="p-2 rounded bg-orange-950/60 border border-orange-800/70 text-orange-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                  <span>{effectValues.hullDelta} Корпус HP</span>
                </div>
              )}

              {effectValues.scienceReward !== undefined && (
                <div className="p-2 rounded bg-purple-950/60 border border-purple-800/70 text-purple-300 flex items-center gap-1.5">
                  <Atom className="w-3.5 h-3.5 text-purple-400" />
                  <span>+{effectValues.scienceReward} Наука</span>
                </div>
              )}

              {effectValues.antimatterReward !== undefined && (
                <div className="p-2 rounded bg-indigo-950/60 border border-indigo-800/70 text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>+{effectValues.antimatterReward} Антиматерия</span>
                </div>
              )}

              {effectValues.creditsReward !== undefined && (
                <div className="p-2 rounded bg-amber-950/60 border border-amber-800/70 text-amber-300 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>+{effectValues.creditsReward} Кредиты</span>
                </div>
              )}

              {effectValues.alloysReward !== undefined && (
                <div className="p-2 rounded bg-teal-950/60 border border-teal-800/70 text-teal-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  <span>+{effectValues.alloysReward} Сплавы</span>
                </div>
              )}

              {effectValues.fuelDelta !== undefined && (
                <div className="p-2 rounded bg-rose-950/60 border border-rose-800/70 text-rose-300 flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-rose-400" />
                  <span>{effectValues.fuelDelta} He-3</span>
                </div>
              )}

              {effectValues.xpReward !== undefined && (
                <div className="p-2 rounded bg-yellow-950/60 border border-yellow-800/70 text-yellow-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-yellow-400" />
                  <span>+{effectValues.xpReward} XP Опыт</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {onViewExpeditionLog ? (
            <button
              onClick={() => {
                onClose();
                onViewExpeditionLog();
              }}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
            >
              <span>Посмотреть запись в Журнале</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold font-heading text-sm text-slate-950 flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            style={{
              backgroundColor: anomaly.visualColor,
              boxShadow: `0 0 15px ${anomaly.visualGlow}`
            }}
          >
            <span>Принять воздействие</span>
          </button>
        </div>
      </div>
    </div>
  );
};
