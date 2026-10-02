import React, { useState } from 'react';
import { CommanderProgression } from '../types/game';
import { KingdomTitle } from '../types/kingdom';
import { sounds } from '../services/soundEffects';
import { 
  X, 
  Award, 
  Zap, 
  Shield, 
  Crosshair, 
  Swords, 
  Sparkles, 
  RotateCcw, 
  Crown,
  ChevronRight, 
  TrendingUp, 
  Cpu, 
  Flame,
  Edit2,
  Check
} from 'lucide-react';

interface CommanderModalProps {
  commander: CommanderProgression;
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSkill: (skillKey: keyof CommanderProgression['skills']) => void;
  onResetSkills: () => void;
  playerName?: string;
  activeTitle?: KingdomTitle | null;
  onOpenKingdomsTitles?: () => void;
  onUpdatePlayerName?: (name: string) => void;
}

export const getCommanderRankTitle = (level: number): { title: string; color: string; tier: string } => {
  if (level >= 40) return { title: 'Гранд-Адмирал Звёздного Флота', color: 'text-amber-400', tier: 'Максимальный ранг (40/40)' };
  if (level >= 35) return { title: 'Адмирал Армады', color: 'text-rose-400', tier: 'Ранг V' };
  if (level >= 30) return { title: 'Вице-Адмирал Сектора', color: 'text-purple-400', tier: 'Ранг IV' };
  if (level >= 25) return { title: 'Коммодор Экспедиции', color: 'text-indigo-400', tier: 'Ранг IV' };
  if (level >= 20) return { title: 'Капитан 1-го ранга', color: 'text-cyan-400', tier: 'Ранг III' };
  if (level >= 15) return { title: 'Командор Эскадры', color: 'text-teal-400', tier: 'Ранг III' };
  if (level >= 10) return { title: 'Старший Лейтенант', color: 'text-emerald-400', tier: 'Ранг II' };
  if (level >= 5) return { title: 'Лейтенант Флота', color: 'text-blue-400', tier: 'Ранг II' };
  return { title: 'Младший Кадет', color: 'text-slate-300', tier: 'Ранг I' };
};

export const CommanderModal: React.FC<CommanderModalProps> = ({
  commander,
  isOpen,
  onClose,
  onUpgradeSkill,
  onResetSkills,
  playerName = 'Командир Астреи',
  activeTitle = null,
  onOpenKingdomsTitles,
  onUpdatePlayerName
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);

  if (!isOpen) return null;

  const rankInfo = getCommanderRankTitle(commander.level);
  const xpPct = Math.min(100, Math.round((commander.xp / commander.xpToNextLevel) * 100));

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdatePlayerName?.(nameInput.trim());
      sounds.playScanPing();
    }
    setIsEditingName(false);
  };

  const skillDefinitions: {
    key: keyof CommanderProgression['skills'];
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    currentBonus: string;
    nextBonus: string;
  }[] = [
    {
      key: 'weapons',
      name: 'Орудийный Мастеринг',
      description: 'Увеличивает урон импульсных лазеров и торпед на тактическом поле боя.',
      icon: <Swords className="w-5 h-5 text-rose-400" />,
      color: 'rose',
      currentBonus: `+${commander.skills.weapons * 6}% к урону орудий`,
      nextBonus: `+${(commander.skills.weapons + 1) * 6}% к урону орудий`
    },
    {
      key: 'shields',
      name: 'Энергетическая Защита',
      description: 'Повышает емкость энергощитов флагмана и ускоряет пассивную регенерацию щита.',
      icon: <Shield className="w-5 h-5 text-cyan-400" />,
      color: 'cyan',
      currentBonus: `+${commander.skills.shields * 15} SP емкости / +${commander.skills.shields * 4} реген`,
      nextBonus: `+${(commander.skills.shields + 1) * 15} SP емкости / +${(commander.skills.shields + 1) * 4} реген`
    },
    {
      key: 'engines',
      name: 'Маневровые Двигатели',
      description: 'Повышает базовую скорость перемещения («ходить») и шанс уклонения от залпов.',
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      color: 'amber',
      currentBonus: `+${Math.floor(commander.skills.engines / 3)} доп. очков шагов (MP) / +${commander.skills.engines * 3}% уклонение`,
      nextBonus: `+${Math.floor((commander.skills.engines + 1) / 3)} доп. MP / +${(commander.skills.engines + 1) * 3}% уклонение`
    },
    {
      key: 'tactics',
      name: 'Тактическое Командование',
      description: 'Усиливает критический урон при атаке с фланга и увеличивает добычу трофеев.',
      icon: <Crosshair className="w-5 h-5 text-purple-400" />,
      color: 'purple',
      currentBonus: `+${commander.skills.tactics * 8}% к фланговому криту / +${commander.skills.tactics * 10}% трофеи`,
      nextBonus: `+${(commander.skills.tactics + 1) * 8}% к фланговому криту / +${(commander.skills.tactics + 1) * 10}% трофеи`
    },
    {
      key: 'reactor',
      name: 'Квантовый Реактор',
      description: 'Оптимизирует питание бортовых систем корабля и генерацию очков действий (AP).',
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      color: 'emerald',
      currentBonus: commander.skills.reactor >= 5 ? '+1 дополнительное очко действий (3 AP в ход!)' : `+${commander.skills.reactor * 5}% скорость перезарядки`,
      nextBonus: commander.skills.reactor + 1 >= 5 ? '+1 бонусное AP в ход!' : `+${(commander.skills.reactor + 1) * 5}% скорость перезарядки`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0B0F1D] border border-cyan-500/30 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#0E1528] to-slate-900">
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/20 bg-slate-950 flex-shrink-0 relative">
                <img
                  src="/src/assets/images/commander_portrait_1790243971540.jpg"
                  alt="Портрет Командира Флота"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0B0F1D] flex items-center justify-center shadow-sm" title="Система связи активна">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                      }}
                      className="px-2 py-0.5 rounded bg-slate-950 border border-cyan-500 text-white text-base font-bold font-heading w-48 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950"
                      title="Сохранить имя"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-lg sm:text-xl font-bold font-heading text-white tracking-wide">
                      {playerName}
                    </h2>
                    {onUpdatePlayerName && (
                      <button
                        onClick={() => {
                          setNameInput(playerName);
                          setIsEditingName(true);
                        }}
                        className="text-slate-400 hover:text-cyan-300 transition-colors p-1"
                        title="Изменить имя командира"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {activeTitle && (
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
                )}

                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  УРОВЕНЬ {commander.level} / 40
                </span>
              </div>

              <p className={`text-xs font-medium ${rankInfo.color} flex items-center gap-1.5 mt-0.5`}>
                <Award className="w-3.5 h-3.5" />
                <span>{rankInfo.title}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{rankInfo.tier}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Title Banner */}
        {activeTitle ? (
          <div 
            className="px-5 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
            style={{ backgroundColor: `${activeTitle.color}15` }}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{activeTitle.badgeEmoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: activeTitle.color }}>
                    КОРОЛЕВСКИЙ ТИТУЛ ({activeTitle.kingdomName}):
                  </span>
                </div>
                <div className="font-bold text-slate-100 text-sm">
                  «{activeTitle.title}»
                </div>
                <div className="text-emerald-300 text-[11px] mt-0.5">
                  Бонусы: {activeTitle.bonusSummary}
                </div>
              </div>
            </div>

            {onOpenKingdomsTitles && (
              <button
                onClick={() => {
                  sounds.playScanPing();
                  onClose();
                  onOpenKingdomsTitles();
                }}
                className="py-1.5 px-3 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1 whitespace-nowrap self-start sm:self-auto"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Сменить титул</span>
              </button>
            )}
          </div>
        ) : onOpenKingdomsTitles ? (
          <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-2 text-xs font-mono text-slate-400">
            <span>Королевский титул не выбран. Получайте репутацию у монархов для дворянских званий!</span>
            <button
              onClick={() => {
                sounds.playScanPing();
                onClose();
                onOpenKingdomsTitles();
              }}
              className="text-amber-400 hover:text-amber-300 font-bold whitespace-nowrap flex items-center gap-1"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Выбрать титул</span>
            </button>
          </div>
        ) : null}

        {/* Level Progression Bar */}
        <div className="px-5 py-3.5 bg-slate-900/60 border-b border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Опыт Командира (XP):
            </span>
            <span className="text-cyan-300 font-bold">
              {commander.level >= 40 ? 'МАКСИМУМ (Уровень 40 достигнут)' : `${commander.xp} / ${commander.xpToNextLevel} XP (${xpPct}%)`}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${commander.level >= 40 ? 100 : xpPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Проходите 40 уровней тактической кампании для получения опыта!</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Доступно очков навыков: {commander.skillPoints}
            </span>
          </div>
        </div>

        {/* Skill Tree List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {skillDefinitions.map(skill => {
            const currentRank = commander.skills[skill.key];
            const maxRank = 10;
            const canUpgrade = commander.skillPoints > 0 && currentRank < maxRank;

            return (
              <div
                key={skill.key}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 mt-0.5">
                    {skill.icon}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{skill.name}</h4>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                        Ранг {currentRank} / {maxRank}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {skill.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
                      <span className="text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/40">
                        Текущий эффект: {skill.currentBonus}
                      </span>
                      {currentRank < maxRank && (
                        <span className="text-slate-400 flex items-center gap-1">
                          <ChevronRight className="w-3 h-3 text-slate-500" />
                          След. ранг: <span className="text-cyan-300">{skill.nextBonus}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upgrade Button */}
                <div className="flex sm:flex-col items-center justify-end gap-1.5 self-end sm:self-center">
                  <button
                    disabled={!canUpgrade}
                    onClick={() => {
                      sounds.playUpgradeSuccess();
                      onUpgradeSkill(skill.key);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      canUpgrade
                        ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 hover:shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                        : 'bg-slate-800/60 text-slate-600 border border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Улучшить (-1 SP)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Reset and Summary */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={() => {
              sounds.playScanPing();
              onResetSkills();
            }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition-colors font-mono"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить очки навыков</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors font-mono"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
