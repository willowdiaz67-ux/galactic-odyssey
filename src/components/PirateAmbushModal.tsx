import React from 'react';
import { EnemyShip, ShipStats } from '../types/game';
import { sounds } from '../services/soundEffects';
import { 
  Skull, 
  AlertTriangle, 
  Swords, 
  PackageX, 
  FastForward, 
  ShieldAlert, 
  RadioTower, 
  CheckCircle2
} from 'lucide-react';

interface PirateAmbushModalProps {
  enemy: EnemyShip;
  playerShip: ShipStats;
  pirateHeat: number;
  detectedContraband: Array<{ name: string; count: number }>;
  brigAvailable: boolean;
  onEngageCombat: () => void;
  onAttemptBoardAndArrest?: () => void;
  onJettisonContraband: () => void;
  onAttemptEvade: () => void;
}

export const PirateAmbushModal: React.FC<PirateAmbushModalProps> = ({
  enemy,
  playerShip,
  pirateHeat,
  detectedContraband,
  brigAvailable,
  onEngageCombat,
  onAttemptBoardAndArrest,
  onJettisonContraband,
  onAttemptEvade
}) => {
  // Evade chance based on evasion stat and engine power allocation
  const enginePower = playerShip.powerAllocation.engines;
  const evadeChance = Math.min(85, Math.max(25, Math.round(playerShip.evasion * 2.5 + enginePower * 0.7 - pirateHeat * 0.25)));

  return (
    <div className="fixed inset-0 bg-[#04060C]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#0D0914] border-2 border-rose-500/70 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl shadow-rose-950/80 flex flex-col gap-4 relative overflow-hidden">
        
        {/* Animated hazard background stripes */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with flashing alert */}
        <div className="flex items-center gap-3.5 pb-3 border-b border-rose-900/50">
          <div className="p-3 bg-rose-950/80 rounded-xl border border-rose-600/60 shadow-lg shadow-rose-950/50 animate-pulse text-rose-400">
            <Skull className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-rose-400 uppercase bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/80 animate-pulse">
                ВАРП-ПЕРЕХВАТ: ПИРАТСКАЯ ЗАСАДА
              </span>
              <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80">
                УГРОЗА: {pirateHeat}%
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-rose-100 mt-1">
              {enemy.name}
            </h2>
            <div className="text-xs text-rose-300/80 font-mono mt-0.5 flex items-center gap-1.5">
              <RadioTower className="w-3.5 h-3.5 text-rose-400" />
              <span>Глушители гипердвигателей Синдиката заблокировали варп!</span>
            </div>
          </div>
        </div>

        {/* Narrative / Context */}
        <div className="bg-slate-950/80 border border-rose-900/40 rounded-xl p-3 text-xs text-slate-300 space-y-2">
          <p className="leading-relaxed">
            На выходе из варп-прыжка ваше судно попало в гравитационную ловушку корсаров.
            Сенсоры пиратского фрегата обнаружили запрещённый груз в ваших трюмах!
          </p>

          {detectedContraband.length > 0 && (
            <div className="bg-rose-950/40 border border-rose-900/50 rounded-lg p-2.5 mt-1">
              <div className="text-[11px] font-mono font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Засечённая контрабанда на борту:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {detectedContraband.map((item, idx) => (
                  <span key={idx} className="text-[10px] font-mono bg-slate-900 px-2 py-1 rounded border border-rose-800/60 text-slate-200">
                    {item.name}: <span className="text-amber-400 font-bold">{item.count} ед.</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-400 italic">
            «Заглушить реактор, капитан! Сдавай запрещённый товар по-хорошему, или мы разберём твой корабль на металлолом!»
          </div>
        </div>

        {/* Action Choices */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Ваше тактическое решение:
          </span>

          {/* Choice 1: Engage Combat */}
          <button
            onClick={() => {
              sounds.playScanPing();
              onEngageCombat();
            }}
            className="w-full text-left p-3.5 rounded-xl border border-rose-500/60 bg-gradient-to-r from-rose-950/60 to-slate-900 hover:from-rose-900/60 hover:to-slate-800 text-slate-100 transition-all flex items-center justify-between gap-3 group shadow-md shadow-rose-950/40"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-300 group-hover:scale-110 transition-transform">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold font-heading text-sm text-rose-200 group-hover:text-rose-100">
                  Принять бой и защитить груз!
                </div>
                <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                  Тактический пошаговый бой. В случае победы контрабанда останется у вас + награда за голову пирата!
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800">
                +{enemy.reward.credits} ⬡
              </span>
            </div>
          </button>

          {/* Choice 2: Tactical Boarding & Arrest if brig has space */}
          {brigAvailable && onAttemptBoardAndArrest && (
            <button
              onClick={() => {
                sounds.playScanPing();
                onAttemptBoardAndArrest();
              }}
              className="w-full text-left p-3.5 rounded-xl border border-amber-500/60 bg-gradient-to-r from-amber-950/50 to-slate-900 hover:from-amber-900/50 text-slate-100 transition-all flex items-center justify-between gap-3 group shadow-md shadow-amber-950/30"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold font-heading text-sm text-amber-200 group-hover:text-amber-100 flex items-center gap-2">
                    <span>Полицейский абордаж: арестовать главаря корсаров!</span>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-1.5 py-0.2 rounded border border-amber-800">
                      В КАРЦЕР
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Штурмовая группа захватывает мостик пиратов. Пленник помещается в судовой карцер для допроса и сдачи в полицию.
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-950/80 px-2 py-1 rounded border border-amber-800">
                  +БОНУС ПОЛИЦИИ
                </span>
              </div>
            </button>
          )}

          {/* Choice 3: Jettison Contraband */}
          {detectedContraband.length > 0 && (
            <button
              onClick={() => {
                sounds.playAlert();
                onJettisonContraband();
              }}
              className="w-full text-left p-3 rounded-xl border border-amber-600/50 bg-slate-900/80 hover:bg-amber-950/30 text-slate-200 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 group-hover:scale-110 transition-transform">
                  <PackageX className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-amber-200 group-hover:text-amber-100">
                    Сбросить контрабанду в космос (Откупиться)
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Пираты захватят грузовые контейнеры и отпустят ваш корабль без единого выстрела.
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-1 rounded border border-amber-800">
                  100% Мир
                </span>
              </div>
            </button>
          )}

          {/* Choice 3: Attempt Evasion */}
          <button
            onClick={() => {
              sounds.playScanPing();
              onAttemptEvade();
            }}
            className="w-full text-left p-3 rounded-xl border border-cyan-500/40 bg-slate-900/80 hover:bg-cyan-950/30 text-slate-200 transition-all flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 group-hover:scale-110 transition-transform">
                <FastForward className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-cyan-200 group-hover:text-cyan-100">
                  Прорвать блокаду на форсаже
                </div>
                <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                  Манёвр уклонения. Зависит от двигателей ({enginePower}%) и манёвренности корабля.
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className={`text-[11px] font-mono font-bold px-2 py-1 rounded border ${
                evadeChance >= 60 
                  ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
                  : 'text-amber-400 bg-amber-950/80 border-amber-800'
              }`}>
                {evadeChance}% Шанс
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
