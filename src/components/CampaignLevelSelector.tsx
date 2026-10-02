import React, { useState } from 'react';
import { TacticalMission } from '../types/game';
import { sounds } from '../services/soundEffects';
import { 
  X, 
  Swords, 
  Crown, 
  Lock, 
  CheckCircle2, 
  Star, 
  Zap, 
  Shield, 
  ArrowRight,
  Sparkles,
  Flame,
  Award
} from 'lucide-react';

interface CampaignLevelSelectorProps {
  levels: TacticalMission[];
  currentLevelNumber: number;
  completedLevels: Record<number, { stars: number }>;
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel: (level: TacticalMission) => void;
}

export const CampaignLevelSelector: React.FC<CampaignLevelSelectorProps> = ({
  levels,
  currentLevelNumber,
  completedLevels,
  isOpen,
  onClose,
  onSelectLevel
}) => {
  const [selectedSector, setSelectedSector] = useState<number>(() => {
    if (currentLevelNumber > 30) return 4;
    if (currentLevelNumber > 20) return 3;
    if (currentLevelNumber > 10) return 2;
    return 1;
  });

  if (!isOpen) return null;

  const sectors = [
    { id: 1, name: 'Сектор I: Периметр Сола', range: 'Уровни 1 - 10', boss: 'Линейный Крейсер «Чёрный Череп»', color: 'cyan' },
    { id: 2, name: 'Сектор II: Пояс Опустошителей', range: 'Уровни 11 - 20', boss: 'Дредноут «Пепел Звёзд»', color: 'amber' },
    { id: 3, name: 'Сектор III: Квантовая Аномалия', range: 'Уровни 21 - 30', boss: 'Архитектор Врат', color: 'purple' },
    { id: 4, name: 'Сектор IV: Цитадель Предтеч', range: 'Уровни 31 - 40', boss: 'Левиафан: Омега-Ядро (ФИНАЛ)', color: 'rose' },
  ];

  const sectorLevels = levels.filter(lvl => {
    const num = lvl.levelNumber ?? 1;
    if (selectedSector === 1) return num >= 1 && num <= 10;
    if (selectedSector === 2) return num >= 11 && num <= 20;
    if (selectedSector === 3) return num >= 21 && num <= 30;
    return num >= 31 && num <= 40;
  });

  // Level is unlocked if it's level 1, or previous level is completed, or it's currently selected
  const isLevelUnlocked = (lvlNum: number) => {
    if (lvlNum === 1) return true;
    return !!completedLevels[lvlNum - 1] || lvlNum <= currentLevelNumber;
  };

  const totalCompletedCount = Object.keys(completedLevels).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0A0D1A] border border-cyan-500/30 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header with Epic Battle Backdrop */}
        <div className="relative border-b border-slate-800 overflow-hidden">
          {/* Background image banner with subtle dark sci-fi gradients */}
          <div className="absolute inset-0 z-0">
            <img
              src="/src/assets/images/space_combat_epic_1790243941884.jpg"
              alt="Тактическая космическая битва"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070A14] via-[#070A14]/90 to-[#070A14]/75" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D1A] via-transparent to-transparent" />
          </div>

          <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center shadow-lg shadow-rose-950/40">
                <Swords className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold font-heading text-white tracking-wide drop-shadow-md">
                    ТАКТИЧЕСКАЯ КАМПАНИЯ: 40 УРОВНЕЙ
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow-sm">
                    {totalCompletedCount} / 40 ПРОЙДЕНО
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-0.5 drop-shadow">
                  Выберите уровень для тактического боя. С каждым уровнем растёт сложность и ценность трофеев!
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850/80 transition-colors bg-slate-900/60 border border-slate-700/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sector Tabs (4 Sectors covering all 40 levels) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 sm:px-5 bg-slate-950/80 border-b border-slate-800">
          {sectors.map(sec => {
            const isActive = selectedSector === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  sounds.playScanPing();
                  setSelectedSector(sec.id);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                  isActive
                    ? 'bg-slate-900 border-cyan-500/60 shadow-md shadow-cyan-950'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-1">
                  <span>{sec.range}</span>
                  {sec.id === 4 && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <div className="text-xs font-bold text-white truncate">{sec.name.split(':')[1] || sec.name}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">Босс: {sec.boss.split('«')[1]?.replace('»', '') || sec.boss}</div>
              </button>
            );
          })}
        </div>

        {/* Levels Grid (10 levels per sector) */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5">
          {sectorLevels.map(lvl => {
            const lvlNum = lvl.levelNumber ?? 1;
            const isCurrent = lvlNum === currentLevelNumber;
            const unlocked = isLevelUnlocked(lvlNum);
            const completion = completedLevels[lvlNum];
            const isBoss = !!lvl.isBossLevel;

            return (
              <div
                key={lvl.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                  isBoss
                    ? 'border-amber-500/50 bg-gradient-to-br from-amber-950/20 via-slate-900/90 to-slate-950 shadow-lg shadow-amber-950/30'
                    : isCurrent
                    ? 'border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400/50'
                    : unlocked
                    ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
                    : 'border-slate-900 bg-slate-950/50 opacity-60'
                }`}
              >
                {/* Level Top Tag */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      isBoss 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      УРОВЕНЬ {lvlNum} / 40
                    </span>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                      lvl.difficulty === 'БОСС' 
                        ? 'text-amber-400 bg-amber-950/60 font-bold border border-amber-800' 
                        : lvl.difficulty === 'Экстрим'
                        ? 'text-rose-400 bg-rose-950/40'
                        : lvl.difficulty === 'Опасно'
                        ? 'text-amber-400 bg-amber-950/40'
                        : 'text-emerald-400 bg-emerald-950/40'
                    }`}>
                      {lvl.difficulty}
                    </span>
                  </div>

                  {/* Stars / Completion */}
                  <div className="flex items-center gap-1">
                    {completion ? (
                      <div className="flex items-center gap-0.5 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </div>
                    ) : unlocked ? (
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        ДОСТУПЕН
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-600" /> ЗАБЛОКИРОВАН
                      </span>
                    )}
                  </div>
                </div>

                {/* Level Title & Description */}
                <div className="mb-3">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                    {isBoss && <Crown className="w-4 h-4 text-amber-400" />}
                    {lvl.title.replace(`Уровень ${lvlNum}: `, '')}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {lvl.description}
                  </p>
                </div>

                {/* Enemies Preview */}
                <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 mb-3 text-xs font-mono">
                  <div className="text-[11px] text-slate-500 mb-1 flex items-center justify-between">
                    <span>Вражеская группа ({lvl.enemies.length}):</span>
                    <span className="text-cyan-400 font-bold">+{lvl.xpReward || 100} XP</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {lvl.enemies.map((e, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 text-[11px] border border-slate-800">
                        {e.name.split(' ')[0]} ({e.hull} HP)
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] font-mono text-slate-400">
                    Награда: <span className="text-amber-300">{lvl.enemies.reduce((acc, e) => acc + e.reward.credits, 0)} ⬡</span>
                  </div>

                  <button
                    disabled={!unlocked}
                    onClick={() => {
                      sounds.playScanPing();
                      onSelectLevel(lvl);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      !unlocked
                        ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-800'
                        : isCurrent
                        ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-900/40'
                        : isBoss
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-900/40'
                        : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                    }`}
                  >
                    <span>{isCurrent ? 'Текущий' : unlocked ? 'В бой!' : 'Закрыто'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-mono">
          <div className="text-slate-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Все 40 уровней доступны последовательно. Побеждайте, чтобы открыть следующий уровень!</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors font-bold"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
