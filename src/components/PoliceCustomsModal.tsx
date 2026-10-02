import React from 'react';
import { PoliceProfile, ArrestedPirate, ShipStats } from '../types/game';
import { sounds } from '../services/soundEffects';
import { 
  ShieldAlert, 
  BadgeCheck, 
  Lock, 
  PackageX, 
  FastForward, 
  Coins, 
  AlertCircle, 
  RadioTower, 
  Building
} from 'lucide-react';

interface PoliceCustomsModalProps {
  policeProfile: PoliceProfile;
  contrabandCount: number;
  arrestedPirates: ArrestedPirate[];
  playerShip: ShipStats;
  onShowLicense: () => void;
  onTransferPrisonersToPatrol: () => void;
  onComplyWithScan: () => void;
  onEvadePolice: () => void;
}

export const PoliceCustomsModal: React.FC<PoliceCustomsModalProps> = ({
  policeProfile,
  contrabandCount,
  arrestedPirates,
  playerShip,
  onShowLicense,
  onTransferPrisonersToPatrol,
  onComplyWithScan,
  onEvadePolice
}) => {
  const hasImmunity = policeProfile.licenses.customsImmunity || policeProfile.licenses.bountyHunterBadge;
  const totalBounties = arrestedPirates.reduce((sum, p) => sum + p.bounty, 0);

  return (
    <div className="fixed inset-0 bg-[#04060C]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
      <div className="bg-[#090D1A] border-2 border-cyan-500/70 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl shadow-cyan-950/80 flex flex-col gap-4 relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3.5 pb-3 border-b border-cyan-900/50">
          <div className="p-3 bg-cyan-950/80 rounded-xl border border-cyan-600/60 shadow-lg shadow-cyan-950 text-cyan-400 animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                ТАМОЖЕННЫЙ ДОСМОТР ОФЗ
              </span>
              <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                ПАТРУЛЬНЫЙ КРЕЙСЕР
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-100 mt-1">
              Космическая Полиция Федерации
            </h2>
            <div className="text-xs text-cyan-300/80 font-mono mt-0.5 flex items-center gap-1.5">
              <RadioTower className="w-3.5 h-3.5 text-cyan-400" />
              <span>«Внимание, капитан! Заглушите двигатели для проверки судового манифеста.»</span>
            </div>
          </div>
        </div>

        {/* Narrative & Status */}
        <div className="bg-slate-950/80 border border-cyan-900/40 rounded-xl p-3 text-xs text-slate-300 space-y-2 font-mono">
          <p className="leading-relaxed font-sans">
            Патрульный крейсер Космической Полиции заблокировал ваш вектор движения. Сканеры правопорядка проводят плановую проверку на наличие контрабанды и беглых преступников.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
            <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">КОНТРАБАНДА В ТРЮМЕ:</span>
              <span className={contrabandCount > 0 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                {contrabandCount > 0 ? `${contrabandCount} ед. (ВНЕ ЗАКОНА)` : 'Чистый груз (0 ед.)'}
              </span>
            </div>

            <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ПИРАТОВ В КАРЦЕРЕ:</span>
              <span className={arrestedPirates.length > 0 ? "text-cyan-400 font-bold" : "text-slate-500"}>
                {arrestedPirates.length} арестованных ({totalBounties} ⬡)
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Ваши действия:
          </span>

          {/* Action 1: Show License */}
          {hasImmunity && (
            <button
              onClick={() => {
                sounds.playScanPing();
                onShowLicense();
              }}
              className="w-full text-left p-3 rounded-xl border border-cyan-500/60 bg-gradient-to-r from-cyan-950/60 to-slate-900 hover:from-cyan-900/60 text-slate-100 transition-all flex items-center justify-between gap-3 group shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-cyan-200">
                    Предъявить Лицензию Охотника за Головами / Иммунитет ОФЗ
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Полицейский патруль отдаст честь коллеге и пропустит без досмотра груза.
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-1 rounded border border-emerald-800">
                100% Пропуск
              </span>
            </button>
          )}

          {/* Action 2: Transfer Prisoners to Patrol */}
          {arrestedPirates.length > 0 && (
            <button
              onClick={() => {
                sounds.playVictoryFanfare();
                onTransferPrisonersToPatrol();
              }}
              className="w-full text-left p-3 rounded-xl border border-emerald-500/60 bg-gradient-to-r from-emerald-950/60 to-slate-900 hover:from-emerald-900/60 text-slate-100 transition-all flex items-center justify-between gap-3 group shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-emerald-200">
                    Передать арестованных пиратов ({arrestedPirates.length} чел.) в патрульный конвой
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Полиция с благодарностью заберёт преступников, выплатит награду и закроет глаза на трюм!
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
                +{totalBounties} ⬡
              </span>
            </button>
          )}

          {/* Action 3: Comply with scan */}
          <button
            onClick={() => {
              sounds.playScanPing();
              onComplyWithScan();
            }}
            className="w-full text-left p-3 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 transition-all flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-200">
                  Пройти сканирование трюма
                </div>
                <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                  {contrabandCount > 0 
                    ? 'Внимание: нелегальные грузы будут конфискованы, будет выписан штраф!' 
                    : 'Законопослушная проверка. Корабль чист, проблем не возникнет.'}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              Досмотр
            </span>
          </button>

          {/* Action 4: Evade */}
          <button
            onClick={() => {
              sounds.playScanPing();
              onEvadePolice();
            }}
            className="w-full text-left p-2.5 rounded-xl border border-rose-900/40 bg-slate-900/60 hover:bg-rose-950/30 text-slate-300 transition-all flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded bg-rose-950/60 text-rose-400">
                <FastForward className="w-4 h-4" />
              </div>
              <div className="text-xs font-sans text-slate-300">
                Попытаться оторваться на форсаже двигателей
              </div>
            </div>
            <span className="text-[10px] font-mono text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
              Риск побега
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
