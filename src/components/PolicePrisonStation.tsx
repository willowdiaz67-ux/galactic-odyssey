import React, { useState } from 'react';
import { ArrestedPirate, PoliceProfile, Resources, ShipStats } from '../types/game';
import { WANTED_PIRATE_BOSSES, WantedPirateBoss } from '../data/piratesData';
import { sounds } from '../services/soundEffects';
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  UserX, 
  Award, 
  Coins, 
  Radio, 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Skull, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  FileCheck,
  Send,
  Eye,
  Crosshair,
  BadgeCheck,
  Building
} from 'lucide-react';

interface PolicePrisonStationProps {
  arrestedPirates: ArrestedPirate[];
  policeProfile: PoliceProfile;
  resources: Resources;
  shipStats: ShipStats;
  brigCapacity?: number;
  onInterrogatePirate: (pirateId: string) => void;
  onAcceptBribe: (pirateId: string, bribeAmount: number) => void;
  onHandOverPirate: (pirateId: string, bountyAmount: number) => void;
  onHandOverAllPirates: (totalBounty: number) => void;
  onBuyPoliceLicense: (licenseKey: keyof PoliceProfile['licenses'], cost: number) => void;
  onHuntWantedBoss?: (boss: WantedPirateBoss) => void;
}

export const PolicePrisonStation: React.FC<PolicePrisonStationProps> = ({
  arrestedPirates,
  policeProfile,
  resources,
  shipStats,
  brigCapacity = 4,
  onInterrogatePirate,
  onAcceptBribe,
  onHandOverPirate,
  onHandOverAllPirates,
  onBuyPoliceLicense,
  onHuntWantedBoss
}) => {
  const [activeTab, setActiveTab] = useState<'brig' | 'police' | 'wanted'>('brig');
  const [selectedPirateForModal, setSelectedPirateForModal] = useState<ArrestedPirate | null>(null);
  const [interrogationMessage, setInterrogationMessage] = useState<string | null>(null);

  const totalPendingBounties = arrestedPirates.reduce((sum, p) => {
    const mult = policeProfile.licenses.bountyHunterBadge ? 1.25 : 1.0;
    return sum + Math.round(p.bounty * mult);
  }, 0);

  const handleInterrogate = (pirate: ArrestedPirate) => {
    sounds.playScanPing();
    onInterrogatePirate(pirate.id);

    if (pirate.intelSecret) {
      setInterrogationMessage(
        `[ДОПРОС УСПЕШЕН] ${pirate.name} сломался под давлением и выдал тайник!\n«${pirate.intelSecret.description}»`
      );
    } else {
      setInterrogationMessage(`[ДОПРОС] ${pirate.name} пока не раскрывает секретов.`);
    }
  };

  const getRankBadgeColor = (rank: ArrestedPirate['rank']) => {
    switch (rank) {
      case 'Барон Синдиката':
      case 'Пиратский Атаман':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/80';
      case 'Капитан Корсаров':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/80';
      case 'Кибер-Взломщик':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-700/80';
      default:
        return 'bg-amber-950/80 text-amber-300 border-amber-700/80';
    }
  };

  return (
    <div className="w-full h-full bg-[#050711] flex flex-col overflow-y-auto p-4 md:p-6 pb-24 md:pb-12 select-none overscroll-contain">
      
      {/* Top Header */}
      <div className="max-w-[1500px] w-full mx-auto pb-4 border-b border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-cyan-400 tracking-wider flex items-center gap-2">
            <span>ДЕПАРТАМЕНТ ЮСТИЦИИ ОФЗ & СУДОВАЯ ГАУПТВАХТА</span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
              СИЛОВЫЕ ПОЛЯ АКТИВНЫ
            </span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-100 mt-1 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-amber-400" />
            <span>Орбитальная Тюрьма «Тартар» и Карцер Корабля</span>
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Арестовывайте пиратов живыми, допрашивайте главарей в карцере и сдавайте преступников полиции за щедрые награды!
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Officer Rank */}
          <div className="bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3 text-xs font-mono">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] font-sans">ВАШ ЧИН В ПОЛИЦИИ ОФЗ:</div>
              <div className="text-cyan-300 font-bold font-heading">{policeProfile.officerRank}</div>
            </div>
          </div>

          {/* Brig occupancy */}
          <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-4 text-xs font-mono">
            <Lock className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-slate-400 text-[10px] font-sans">КАМЕРЫ КАРЦЕРА:</div>
              <div className="text-slate-200 font-semibold tabular-nums">
                {arrestedPirates.length} / {brigCapacity} <span className="text-slate-400 text-[10px]">заключенных</span>
              </div>
            </div>
            <div className="w-20 bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-300 ${
                  arrestedPirates.length >= brigCapacity ? 'bg-rose-500' : 'bg-amber-400'
                }`}
                style={{ width: `${Math.min(100, (arrestedPirates.length / brigCapacity) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-[1500px] w-full mx-auto mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
          <button
            onClick={() => {
              sounds.playScanPing();
              setActiveTab('brig');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'brig'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Судовой Карцер ({arrestedPirates.length}/{brigCapacity})</span>
          </button>

          <button
            onClick={() => {
              sounds.playScanPing();
              setActiveTab('police');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'police'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Департамент Полиции и Тюрьма</span>
          </button>

          <button
            onClick={() => {
              sounds.playScanPing();
              setActiveTab('wanted');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'wanted'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950 font-bold'
                : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Особо Опасные (Wanted Board)</span>
          </button>
        </div>

        {/* Quick Bulk Hand-over button */}
        {arrestedPirates.length > 0 && (
          <button
            onClick={() => {
              sounds.playVictoryFanfare();
              onHandOverAllPirates(totalPendingBounties);
            }}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold font-mono text-xs rounded-xl shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all cursor-pointer"
          >
            <BadgeCheck className="w-4 h-4" />
            <span>Сдать всех {arrestedPirates.length} зэков в Тюрьму (+{totalPendingBounties} ⬡)</span>
          </button>
        )}
      </div>

      {/* Interrogation Feedback Banner */}
      {interrogationMessage && (
        <div className="max-w-[1500px] w-full mx-auto mt-4 p-3 bg-cyan-950/70 border border-cyan-600/70 rounded-xl text-xs font-mono text-cyan-200 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="whitespace-pre-line">{interrogationMessage}</span>
          </div>
          <button 
            onClick={() => setInterrogationMessage(null)}
            className="text-[10px] text-cyan-400 hover:text-white px-2 py-1 bg-cyan-900/60 rounded"
          >
            Закрыть
          </button>
        </div>
      )}

      {/* TAB 1: SHIP'S BRIG (КАРЦЕР КОРАБЛЯ) */}
      {activeTab === 'brig' && (
        <div className="max-w-[1500px] w-full mx-auto mt-5 space-y-4">
          
          {/* Brig Cells Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {Array.from({ length: brigCapacity }).map((_, cellIdx) => {
              const prisoner = arrestedPirates[cellIdx];
              return (
                <div 
                  key={cellIdx}
                  className={`rounded-xl border p-4 flex flex-col justify-between transition-all min-h-[220px] ${
                    prisoner
                      ? 'bg-slate-900/90 border-amber-600/60 shadow-lg shadow-amber-950/30'
                      : 'bg-slate-950/50 border-dashed border-slate-800 text-slate-600'
                  }`}
                >
                  {/* Cell Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[10px] font-mono tracking-wider text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>КАМЕРА #{cellIdx + 1}</span>
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      prisoner ? 'bg-amber-950/80 text-amber-400 border-amber-800' : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}>
                      {prisoner ? 'ЗАНЯТО' : 'СВОБОДНА'}
                    </span>
                  </div>

                  {/* Prisoner Details or Empty state */}
                  {prisoner ? (
                    <div className="my-2.5 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-400">
                          <UserX className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-100 font-heading">
                            {prisoner.name}
                          </div>
                          <div className="text-[11px] text-amber-400 font-mono">
                            Позывной: «{prisoner.callsign}»
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getRankBadgeColor(prisoner.rank)}`}>
                          {prisoner.rank}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {prisoner.arrestDate}
                        </span>
                      </div>

                      {/* Crimes */}
                      <div className="text-[10px] text-slate-400 font-sans line-clamp-2 mt-1 bg-slate-950/60 p-1.5 rounded border border-slate-800">
                        {prisoner.crimes.join(' • ')}
                      </div>

                      {/* Bribe & Bounty Info */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-mono">
                        <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                          <span className="text-slate-400 block text-[9px]">НАГРАДА ПОЛИЦИИ:</span>
                          <span className="text-emerald-400 font-bold">+{prisoner.bounty} ⬡</span>
                        </div>
                        <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                          <span className="text-slate-400 block text-[9px]">ПРЕДЛАГАЕТ ВЗЯТКУ:</span>
                          <span className="text-amber-400 font-bold">{prisoner.bribeOffer} ⬡</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                      <Unlock className="w-8 h-8 text-slate-700 mb-2" />
                      <p className="text-xs font-mono text-slate-500">Силовой контур деактивирован</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">Готово к приёму арестованного пирата</p>
                    </div>
                  )}

                  {/* Actions for Prisoner */}
                  {prisoner && (
                    <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => handleInterrogate(prisoner)}
                          className="px-2 py-1.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/80 text-cyan-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-colors"
                          title="Допросить для поиска тайников"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>Допросить</span>
                        </button>

                        <button
                          onClick={() => {
                            sounds.playCreditsChime();
                            onAcceptBribe(prisoner.id, prisoner.bribeOffer);
                          }}
                          className="px-2 py-1.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-800/80 text-amber-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-colors"
                          title="Взять взятку и отпустить"
                        >
                          <Coins className="w-3 h-3" />
                          <span>Взятка</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          sounds.playVictoryFanfare();
                          onHandOverPirate(prisoner.id, prisoner.bounty);
                        }}
                        className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-950"
                      >
                        <BadgeCheck className="w-3.5 h-3.5" />
                        <span>Сдать в Тюрьму (+{prisoner.bounty} ⬡)</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tips on how to arrest pirates */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-heading text-slate-200">
                  ИНСТРУКЦИЯ ОХОТНИКА ЗА ГОЛОВАМИ ОФЗ:
                </h4>
                <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
                  Чтобы захватить пирата живым: вступайте в бой в <strong>Тактической Арене</strong> или отражайте <strong>Пиратские Засады</strong> в варпе. 
                  При победе или уничтожении пиратского судна вы можете захватить главаря в карцер!
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] font-mono text-cyan-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 block">
                Свободно камер: {Math.max(0, brigCapacity - arrestedPirates.length)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: POLICE DEPARTMENT & PENITENTIARY (ПОЛИЦИЯ И ТЮРЬМА ТАРТАР) */}
      {activeTab === 'police' && (
        <div className="max-w-[1500px] w-full mx-auto mt-5 space-y-5">
          
          {/* Stats overview banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
              <div className="p-3 bg-cyan-950 rounded-xl border border-cyan-800 text-cyan-400">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400">ПЕРЕДАНО ПРЕСТУПНИКОВ В ТАРТАР:</div>
                <div className="text-xl font-bold font-heading text-slate-100 mt-0.5">
                  {policeProfile.piratesHandedOver} чел.
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
              <div className="p-3 bg-emerald-950 rounded-xl border border-emerald-800 text-emerald-400">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400">ВЫПЛАЧЕНО НАГРАД (BOUNTY):</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                  +{policeProfile.totalBountyCredits} ⬡
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
              <div className="p-3 bg-amber-950 rounded-xl border border-amber-800 text-amber-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400">ПОЛИЦЕЙСКИЙ РАНГ:</div>
                <div className="text-base font-bold font-heading text-amber-300 mt-0.5">
                  {policeProfile.officerRank}
                </div>
              </div>
            </div>
          </div>

          {/* Official Police Equipment & Licenses Store */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold font-heading text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  <span>Лицензии и Спецоборудование Галактической Полиции</span>
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Официальные привилегии ОФЗ для лицензированных охотников за головами
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              
              {/* Item 1: Bounty Hunter License */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <BadgeCheck className="w-5 h-5" />
                    </span>
                    {policeProfile.licenses.bountyHunterBadge ? (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        АКТИВНО
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-amber-400">1200 ⬡</span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-200 mt-3 font-heading text-sm">
                    Золотой Жетон Охотника за Головами
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Повышает официальные выплаты полиции за каждого арестованного пирата на <strong>+25%</strong>.
                  </p>
                </div>

                <button
                  disabled={policeProfile.licenses.bountyHunterBadge || resources.credits < 1200}
                  onClick={() => onBuyPoliceLicense('bountyHunterBadge', 1200)}
                  className={`mt-4 w-full py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                    policeProfile.licenses.bountyHunterBadge
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : resources.credits >= 1200
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-md shadow-amber-950'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {policeProfile.licenses.bountyHunterBadge ? 'Лицензия получена' : 'Приобрести за 1200 ⬡'}
                </button>
              </div>

              {/* Item 2: Customs Immunity */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                      <FileCheck className="w-5 h-5" />
                    </span>
                    {policeProfile.licenses.customsImmunity ? (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        АКТИВНО
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-cyan-400">2200 ⬡</span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-200 mt-3 font-heading text-sm">
                    Таможенная Неприкосновенность ОФЗ
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Освобождает от таможенных досмотров и конфискаций при транспортировке редких грузов патрулями полиции.
                  </p>
                </div>

                <button
                  disabled={policeProfile.licenses.customsImmunity || resources.credits < 2200}
                  onClick={() => onBuyPoliceLicense('customsImmunity', 2200)}
                  className={`mt-4 w-full py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                    policeProfile.licenses.customsImmunity
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : resources.credits >= 2200
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-md shadow-cyan-950'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {policeProfile.licenses.customsImmunity ? 'Иммунитет оформлен' : 'Оформить за 2200 ⬡'}
                </button>
              </div>

              {/* Item 3: Stun Harpoon */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
                      <Zap className="w-5 h-5" />
                    </span>
                    {policeProfile.licenses.stunHarpoonAuthorized ? (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        АКТИВНО
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-purple-400">1800 ⬡</span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-200 mt-3 font-heading text-sm">
                    Ионный Гарпун «Арест-1»
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Увеличивает вероятность успешно взять на абордаж пиратских главарей при нулевых щитах до <strong>100%</strong>.
                  </p>
                </div>

                <button
                  disabled={policeProfile.licenses.stunHarpoonAuthorized || resources.credits < 1800}
                  onClick={() => onBuyPoliceLicense('stunHarpoonAuthorized', 1800)}
                  className={`mt-4 w-full py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                    policeProfile.licenses.stunHarpoonAuthorized
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : resources.credits >= 1800
                        ? 'bg-purple-500 hover:bg-purple-400 text-slate-950 cursor-pointer shadow-md shadow-purple-950'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {policeProfile.licenses.stunHarpoonAuthorized ? 'Установлен на корабль' : 'Установить за 1800 ⬡'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WANTED BOUNTY BOARD (РОЗЫСК ГЛАВАРЕЙ) */}
      {activeTab === 'wanted' && (
        <div className="max-w-[1500px] w-full mx-auto mt-5 space-y-4">
          <div className="bg-rose-950/40 border border-rose-600/50 rounded-xl p-4 flex items-center gap-3">
            <Skull className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <h3 className="font-bold font-heading text-slate-100 text-sm">
                ГАЛАКТИЧЕСКИЙ РЕЕСТР РОЗЫСКА ОФЗ (WANTED LIST)
              </h3>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                За поимку или арест этих пиратских баронов назначены рекордные премии. Ищите их в указанных секторах!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WANTED_PIRATE_BOSSES.map((boss) => (
              <div 
                key={boss.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-rose-700/60 rounded-xl p-4 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shrink-0"
                        style={{ backgroundColor: boss.avatarColor }}
                      >
                        <Skull className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-slate-100 text-base">
                            {boss.name}
                          </span>
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                            «{boss.callsign}»
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {boss.title}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 block">НАГРАДА:</span>
                      <span className="text-base font-bold font-mono text-emerald-400">
                        {boss.bounty} ⬡
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="text-slate-300">
                      <span className="text-slate-500">Флагман:</span> {boss.shipName}
                    </div>
                    <div className="text-cyan-300">
                      <span className="text-slate-500">Район активности:</span> {boss.sector}
                    </div>
                    <div className="text-rose-300 text-[11px] font-sans pt-1 border-t border-slate-800/80">
                      <span className="font-bold text-rose-400">Досье преступлений:</span> {boss.crimes}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                    ОСОБО ОПАСЕН
                  </span>

                  <button
                    onClick={() => {
                      sounds.playScanPing();
                      if (onHuntWantedBoss) onHuntWantedBoss(boss);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-950 cursor-pointer"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Пеленговать цель</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
