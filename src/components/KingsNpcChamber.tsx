import React, { useState } from 'react';
import { NpcCharacter, NpcQuest, DialogueOption } from '../types/npc';
import { StarSystem, Resources, ShipStats, CommanderProgression } from '../types/game';
import { sounds } from '../services/soundEffects';
import { 
  Crown, 
  Sparkles, 
  MessageSquare, 
  Award, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Gift, 
  Scroll, 
  ChevronRight, 
  X, 
  Coins, 
  Wrench, 
  Flame, 
  Shield, 
  Zap, 
  Search,
  Swords,
  BookOpen,
  ChevronUp,
  ChevronDown,
  Landmark
} from 'lucide-react';

import { KingdomTitle } from '../types/kingdom';

interface KingsNpcChamberProps {
  currentSystem: StarSystem;
  resources: Resources;
  shipStats: ShipStats;
  commander: CommanderProgression;
  npcs: NpcCharacter[];
  onClaimRoyalDecree: (npcId: string) => void;
  onClaimQuestReward: (quest: NpcQuest) => void;
  onApplyDialogueReward: (reward: DialogueOption['reward'], cost?: DialogueOption['cost']) => void;
  onShowToast: (msg: string) => void;
  onNavigateToKingdoms?: () => void;
  playerName?: string;
  activeTitle?: KingdomTitle | null;
}

export const KingsNpcChamber: React.FC<KingsNpcChamberProps> = ({
  currentSystem,
  resources,
  shipStats,
  commander,
  npcs,
  onClaimRoyalDecree,
  onClaimQuestReward,
  onApplyDialogueReward,
  onShowToast,
  onNavigateToKingdoms,
  playerName = 'Командир Астреи',
  activeTitle = null
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'kings' | 'current_system' | 'dragon_ball' | 'bleach' | 'quests'>('all');
  const [activeNpcModal, setActiveNpcModal] = useState<NpcCharacter | null>(null);
  const [dialogueHistory, setDialogueHistory] = useState<{ [optionId: string]: string }>({});
  const [selectedQuestTab, setSelectedQuestTab] = useState<'available' | 'completed'>('available');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter NPCs
  const filteredNpcs = npcs.filter(npc => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (npc.name + ' ' + npc.title + ' ' + npc.universeName + ' ' + npc.locationName).toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    if (filterTab === 'kings') return npc.isKing;
    if (filterTab === 'current_system') return npc.homeSystemId === currentSystem.id;
    if (filterTab === 'dragon_ball') return npc.universe === 'dragon_ball';
    if (filterTab === 'bleach') return npc.universe === 'bleach';
    return true;
  });

  // Collect all quests
  const allQuests = npcs.flatMap(n => n.quests.map(q => ({ ...q, giverNpc: n })));

  const handleOpenAudience = (npc: NpcCharacter) => {
    sounds.playScanPing();
    setActiveNpcModal(npc);
  };

  const handleSelectDialogue = (option: DialogueOption, npc: NpcCharacter) => {
    // Check cost if any
    if (option.cost) {
      if (option.cost.credits && resources.credits < option.cost.credits) {
        sounds.playAlert();
        onShowToast('Недостаточно кредитов для совершения этой сделки!');
        return;
      }
    }

    sounds.playCreditsChime();
    setDialogueHistory(prev => ({ ...prev, [option.id]: option.response }));

    if (option.reward || option.cost) {
      onApplyDialogueReward(option.reward, option.cost);
      if (option.reward?.xp) {
        onShowToast(`Получено +${option.reward.xp} XP Командира!`);
      }
      if (option.reward?.repairHullPercent) {
        onShowToast('Корпус корабля полностью восстановлен!');
      }
    }
  };

  const checkQuestCompletable = (quest: NpcQuest): boolean => {
    if (quest.completed || quest.claimed) return false;
    if (quest.requirementType === 'credits') return resources.credits >= (quest.targetValue as number);
    if (quest.requirementType === 'alloys') return resources.alloys >= (quest.targetValue as number);
    if (quest.requirementType === 'science') return resources.science >= (quest.targetValue as number);
    if (quest.requirementType === 'antimatter') return resources.antimatter >= (quest.targetValue as number);
    if (quest.requirementType === 'nukes') return (resources.nukes ?? 0) >= (quest.targetValue as number);
    if (quest.requirementType === 'colonists') return resources.colonists >= (quest.targetValue as number);
    return false;
  };

  const handleScrollTop = () => {
    const el = document.getElementById('kings-chamber-scroll');
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollBottom = () => {
    const el = document.getElementById('kings-chamber-scroll');
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div 
      id="kings-chamber-scroll"
      className="w-full h-full bg-[#050711] flex flex-col overflow-y-auto p-4 md:p-6 pb-28 md:pb-16 select-none overscroll-contain scroll-smooth relative"
    >
      {/* Floating Scroll Controls (fixes user request: "не работает фуннкция скролла") */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={handleScrollTop}
          title="Прокрутить к началу"
          className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500 hover:bg-slate-800 transition-all shadow-xl backdrop-blur-md cursor-pointer"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={handleScrollBottom}
          title="Прокрутить вниз"
          className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500 hover:bg-slate-800 transition-all shadow-xl backdrop-blur-md cursor-pointer"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Top Banner Header */}
      <div className="max-w-[1500px] w-full mx-auto pb-4 border-b border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-amber-400 tracking-wider flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>ЗАЛ АУДИЕНЦИЙ: КОРОЛИ, МОНАРХИ И ПЕРСОНАЖИ ВСЕЛЕННЫХ</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-100 mt-1 flex items-center gap-2">
            <span>Короли и Легендарные NPC Галактики</span>
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-2xl">
            Встречайтесь с монархами Сообщества Душ, Старейшинами Намека и правителями Федерации. Принимайте королевские указы, получайте благословения и выполняйте великие поручения!
          </p>
        </div>

        {/* Right Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToKingdoms && (
            <button
              onClick={onNavigateToKingdoms}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-950 cursor-pointer"
            >
              <Landmark className="w-4 h-4" />
              <span>Карта & Казна Королевств</span>
            </button>
          )}

          {/* Current player & system status pill */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono">
            <div>
              <div className="text-slate-400 text-[10px]">КОМАНДИР:</div>
              <div className="text-slate-100 font-bold flex items-center gap-1.5">
                <span>{playerName}</span>
                {activeTitle ? (
                  <span 
                    className="inline-flex items-center gap-1 font-bold text-[10px] px-1.5 py-0.2 rounded border"
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
                  <span className="text-[10px] text-slate-500 font-normal">Скиталец</span>
                )}
              </div>
            </div>

            <div className="h-6 w-px bg-slate-800" />

            <div>
              <div className="text-slate-400 text-[10px]">ЛОКАЦИЯ:</div>
              <div className="text-cyan-300 font-bold">{currentSystem.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Toolbar and Filters */}
      <div className="max-w-[1500px] w-full mx-auto mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filterTab === 'all'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Все ({npcs.length})
          </button>
          <button
            onClick={() => setFilterTab('kings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              filterTab === 'kings'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950'
                : 'text-amber-400 hover:text-amber-200 hover:bg-amber-950/40'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Короли и Монархи ({npcs.filter(n => n.isKing).length})</span>
          </button>
          <button
            onClick={() => setFilterTab('current_system')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              filterTab === 'current_system'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950'
                : 'text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950/40'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>В этой системе ({npcs.filter(n => n.homeSystemId === currentSystem.id).length})</span>
          </button>
          <button
            onClick={() => setFilterTab('bleach')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              filterTab === 'bleach'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-950'
                : 'text-purple-400 hover:text-purple-200 hover:bg-purple-950/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bleach: Сообщество Душ</span>
          </button>
          <button
            onClick={() => setFilterTab('dragon_ball')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              filterTab === 'dragon_ball'
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950'
                : 'text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950/40'
            }`}
          >
            <span>🐉</span>
            <span>Dragon Ball: Намек</span>
          </button>
          <button
            onClick={() => setFilterTab('quests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              filterTab === 'quests'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                : 'text-rose-400 hover:text-rose-200 hover:bg-rose-950/40'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>Королевские Квесты ({allQuests.length})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Поиск правителей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {filterTab === 'quests' ? (
        /* Quests Overview Panel */
        <div className="max-w-[1500px] w-full mx-auto mt-6 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-2xl">
            <h2 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2">
              <Scroll className="w-5 h-5 text-amber-400" />
              <span>Великие Поручения и Королевские Квесты</span>
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Выполняйте условия монархов и героев вселенных, чтобы получать огромные награды, редкие боеприпасы и очки опыта командира!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
              {allQuests.map((quest) => {
                const canComplete = checkQuestCompletable(quest);

                return (
                  <div 
                    key={quest.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      quest.claimed
                        ? 'bg-slate-950/40 border-slate-800 opacity-60'
                        : canComplete
                          ? 'bg-emerald-950/30 border-emerald-500/70 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/40'
                          : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          <span>{quest.giverName}</span>
                        </span>
                        {quest.claimed ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> ВЫПОЛНЕНО
                          </span>
                        ) : canComplete ? (
                          <span className="text-emerald-300 font-bold animate-pulse">
                            ГОТОВО К СДАЧЕ!
                          </span>
                        ) : (
                          <span className="text-slate-500">В процессе</span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold font-heading text-slate-100 mt-2">
                        {quest.title}
                      </h3>
                      <p className="text-xs text-slate-300 font-sans mt-1.5 leading-relaxed">
                        {quest.description}
                      </p>

                      <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono space-y-1">
                        <div className="text-slate-400">
                          Условие: <span className="text-cyan-300 font-bold">{quest.targetValueText}</span>
                        </div>
                        <div className="text-amber-400 font-bold">
                          Награда: {quest.rewardText}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60">
                      {quest.claimed ? (
                        <div className="text-center py-1.5 text-xs font-mono text-slate-500 italic">
                          Награда получена
                        </div>
                      ) : (
                        <button
                          disabled={!canComplete}
                          onClick={() => {
                            sounds.playVictoryFanfare();
                            onClaimQuestReward(quest);
                            onShowToast(`Квест «${quest.title}» выполнен! Получены королевские дары!`);
                          }}
                          className={`w-full py-2 px-3 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            canComplete
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 opacity-60'
                          }`}
                        >
                          <Gift className="w-4 h-4" />
                          <span>{canComplete ? 'Сдать квест и забрать награду' : 'Требования ещё не выполнены'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Characters Grid */
        <div className="max-w-[1500px] w-full mx-auto mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNpcs.map((npc) => {
              const isPresentInCurrentSystem = npc.homeSystemId === currentSystem.id;

              return (
                <div
                  key={npc.id}
                  className={`rounded-2xl border flex flex-col justify-between overflow-hidden transition-all shadow-xl hover:translate-y-[-2px] ${
                    npc.isKing
                      ? 'bg-gradient-to-b from-[#131024] to-[#0A0D18] border-amber-500/50 shadow-amber-950/20'
                      : 'bg-gradient-to-b from-[#0E1322] to-[#080B15] border-slate-800 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="p-5">
                    {/* Header: Title, Realm & Emoji */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-13 h-13 rounded-2xl flex items-center justify-center text-2xl shadow-lg border relative"
                          style={{ 
                            backgroundColor: `${npc.themeColor}22`,
                            borderColor: `${npc.themeColor}66`
                          }}
                        >
                          <span>{npc.avatarEmoji}</span>
                          {npc.isKing && (
                            <div className="absolute -top-2 -right-2 p-1 bg-amber-500 text-slate-950 rounded-full shadow-md">
                              <Crown className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span 
                              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase"
                              style={{ 
                                color: npc.themeColor,
                                backgroundColor: `${npc.themeColor}15`,
                                borderColor: `${npc.themeColor}44`
                              }}
                            >
                              {npc.universeName}
                            </span>
                            {isPresentInCurrentSystem && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/80 animate-pulse">
                                В ЭТОЙ СИСТЕМЕ
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold font-heading text-slate-100 mt-1">
                            {npc.name}
                          </h3>
                          <div className="text-[11px] text-slate-400 font-sans line-clamp-1">
                            {npc.title}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Location Badge */}
                    <div className="mt-3.5 flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{npc.locationName}</span>
                    </div>

                    {/* Character Quote */}
                    <div className="mt-3 italic text-xs text-slate-300 font-sans bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                      "{npc.quote}"
                    </div>

                    {/* Royal Decree Banner (if King) */}
                    {npc.royalDecree && (
                      <div className="mt-3.5 p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs font-mono space-y-1">
                        <div className="flex items-center justify-between text-amber-300 font-bold">
                          <span className="flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            <span>КОРОЛЕВСКИЙ УКАЗ</span>
                          </span>
                          {npc.royalDecree.claimed ? (
                            <span className="text-[10px] text-emerald-400 font-bold">ПОЛУЧЕН</span>
                          ) : (
                            <span className="text-[10px] text-amber-400 animate-pulse">ДОСТУПЕН</span>
                          )}
                        </div>
                        <div className="text-slate-200 font-heading text-xs font-semibold">
                          {npc.royalDecree.title}
                        </div>
                        <div className="text-[11px] text-amber-200/90 font-mono">
                          {npc.royalDecree.bonusSummary}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAudience(npc)}
                      className={`w-full py-2.5 px-4 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                        npc.isKing
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-950'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{npc.isKing ? 'Войти в Зал Аудиенции' : 'Начать Диалог'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Audience & Dialogue Modal */}
      {activeNpcModal && (
        <div className="fixed inset-0 bg-[#04060C]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-[#0B0F1D] border-2 border-cyan-500/60 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col overscroll-contain">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-950 via-[#0E1428] to-slate-950 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xl border relative shrink-0"
                  style={{ 
                    backgroundColor: `${activeNpcModal.themeColor}22`,
                    borderColor: `${activeNpcModal.themeColor}88`
                  }}
                >
                  <span>{activeNpcModal.avatarEmoji}</span>
                  {activeNpcModal.isKing && (
                    <div className="absolute -top-2 -right-2 p-1.5 bg-amber-500 text-slate-950 rounded-full shadow-lg">
                      <Crown className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div>
                  <span 
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase"
                    style={{ 
                      color: activeNpcModal.themeColor,
                      backgroundColor: `${activeNpcModal.themeColor}15`,
                      borderColor: `${activeNpcModal.themeColor}44`
                    }}
                  >
                    {activeNpcModal.universeName}
                  </span>
                  <h2 className="text-xl font-bold font-heading text-slate-100 mt-1">
                    {activeNpcModal.name}
                  </h2>
                  <div className="text-xs text-slate-400 font-sans">
                    {activeNpcModal.title}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveNpcModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              
              {/* Backstory & Location */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-300 font-sans leading-relaxed space-y-2">
                <div className="text-[11px] font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>ЛОР И БИОГРАФИЯ:</span>
                </div>
                <p>{activeNpcModal.backstory}</p>
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Обитель: <strong className="text-slate-200">{activeNpcModal.locationName}</strong></span>
                </div>
              </div>

              {/* Greeting Bubble */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-950 border-l-4 border-l-cyan-400 p-4 rounded-r-xl text-xs text-slate-200 font-sans leading-relaxed shadow-md">
                <span className="font-mono text-[10px] text-cyan-400 font-bold block mb-1 uppercase tracking-wider">
                  Прямое Обращение:
                </span>
                "{activeNpcModal.greeting}"
              </div>

              {/* Royal Decree Action (if King) */}
              {activeNpcModal.royalDecree && (
                <div className="p-4 rounded-xl bg-amber-950/30 border-2 border-amber-500/60 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>{activeNpcModal.royalDecree.title}</span>
                    </span>
                    {activeNpcModal.royalDecree.claimed && (
                      <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        УКАЗ ПРИНЯТ
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-sans">
                    {activeNpcModal.royalDecree.description}
                  </p>
                  <div className="text-xs font-mono text-amber-200 font-bold bg-amber-950/60 p-2.5 rounded-lg border border-amber-600/40">
                    Дары: {activeNpcModal.royalDecree.bonusSummary}
                  </div>

                  {!activeNpcModal.royalDecree.claimed && (
                    <button
                      onClick={() => {
                        sounds.playVictoryFanfare();
                        onClaimRoyalDecree(activeNpcModal.id);
                        onShowToast(`Принят ${activeNpcModal.royalDecree?.title}! Дары зачислены!`);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-950"
                    >
                      <Gift className="w-4 h-4" />
                      <span>Склонить колено и принять Королевский Указ</span>
                    </button>
                  )}
                </div>
              )}

              {/* Dialogue Options Tree */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>Варианты Ответа и Взаимодействия:</span>
                </h4>

                <div className="space-y-2">
                  {activeNpcModal.dialogueOptions.map((opt) => {
                    const isAnswered = !!dialogueHistory[opt.id];

                    return (
                      <div key={opt.id} className="space-y-2">
                        <button
                          onClick={() => handleSelectDialogue(opt, activeNpcModal)}
                          className={`w-full text-left p-3 rounded-xl border text-xs font-mono transition-all flex items-center justify-between gap-3 cursor-pointer ${
                            isAnswered
                              ? 'bg-slate-950/80 border-cyan-500/50 text-cyan-300'
                              : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>{opt.label}</span>
                          </span>
                          {opt.cost && (
                            <span className="text-[11px] text-amber-400 font-bold shrink-0">
                              -{opt.cost.credits} ⬡
                            </span>
                          )}
                        </button>

                        {isAnswered && (
                          <div className="ml-4 p-3 rounded-xl bg-slate-950 border border-cyan-800/60 text-xs text-slate-200 font-sans leading-relaxed animate-fadeIn">
                            {dialogueHistory[opt.id]}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* NPC Associated Quests */}
              {activeNpcModal.quests.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Scroll className="w-4 h-4 text-amber-400" />
                    <span>Поручения от этого персонажа:</span>
                  </h4>

                  {activeNpcModal.quests.map((q) => {
                    const canClaim = checkQuestCompletable(q);

                    return (
                      <div key={q.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
                        <div>
                          <div className="text-slate-100 font-bold font-heading">{q.title}</div>
                          <div className="text-[11px] text-slate-400 font-sans mt-0.5">{q.description}</div>
                          <div className="text-amber-400 font-bold text-[11px] mt-1">Награда: {q.rewardText}</div>
                        </div>

                        {q.claimed ? (
                          <span className="text-emerald-400 font-bold text-xs shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> ВЫПОЛНЕНО
                          </span>
                        ) : (
                          <button
                            disabled={!canClaim}
                            onClick={() => {
                              sounds.playVictoryFanfare();
                              onClaimQuestReward(q);
                              onShowToast(`Квест «${q.title}» сдан! Награда получена!`);
                            }}
                            className={`py-1.5 px-3 rounded-lg font-bold text-xs shrink-0 transition-all ${
                              canClaim
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-md shadow-emerald-950'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 opacity-60'
                            }`}
                          >
                            {canClaim ? 'Забрать награду' : 'В процессе'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
              <button
                onClick={() => setActiveNpcModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition-colors cursor-pointer"
              >
                Завершить Аудиенцию
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
