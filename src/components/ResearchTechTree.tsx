import React from 'react';
import { ResearchTech, Resources } from '../types/game';
import { sounds } from '../services/soundEffects';
import { 
  Cpu, 
  Check, 
  Lock, 
  Sparkles, 
  ShieldCheck, 
  Pickaxe, 
  Zap, 
  Globe 
} from 'lucide-react';

interface ResearchTechTreeProps {
  techTree: ResearchTech[];
  resources: Resources;
  onUnlockTech: (tech: ResearchTech) => void;
}

export const ResearchTechTree: React.FC<ResearchTechTreeProps> = ({
  techTree,
  resources,
  onUnlockTech
}) => {
  return (
    <div className="w-full h-full bg-[#050711] flex flex-col overflow-y-auto p-4 md:p-6 pb-24 md:pb-12 overscroll-contain">
      <div className="max-w-[1500px] w-full mx-auto pb-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-cyan-400 tracking-wider">
            НАУЧНО-ИССЛЕДОВАТЕЛЬСКИЙ ИНСТИТУТ
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-100 mt-1">
            Древо Галактических Технологий
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Открывайте квантовые технологии, расшифровывайте древние языки и совершенствуйте флот.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-lg flex items-center gap-3 text-xs font-mono">
          <Cpu className="w-4 h-4 text-purple-400" />
          <div>
            <div className="text-slate-400 text-[10px]">ДОСТУПНО НАУЧНЫХ ДАННЫХ:</div>
            <div className="text-purple-300 font-semibold text-sm tabular-nums">
              {resources.science} DATA
            </div>
          </div>
        </div>
      </div>

      {/* Precursor Archive Visual Showcase */}
      <div className="max-w-[1500px] w-full mx-auto mt-5 rounded-2xl overflow-hidden border border-purple-500/30 bg-slate-950 shadow-xl shadow-purple-950/20 relative group">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-72 h-44 sm:h-52 overflow-hidden relative flex-shrink-0">
            <img
              src="/src/assets/images/precursor_relic_1790243984919.jpg"
              alt="Древний артефакт Предтеч"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-slate-950/40 to-[#050711]" />
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-400/50 text-[10px] font-mono text-purple-300 font-bold backdrop-blur-md">
              АРТЕФАКТ ПРЕДТЕЧ #07-Ω
            </div>
          </div>

          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center gap-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="text-xs font-mono text-purple-300 uppercase tracking-wider font-semibold">
                Квантовые Архивы и Древние Матрицы
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold font-heading text-slate-100">
              Синтез Технологий Предтеч и Человеческой Инженерии
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Исследуйте кристаллические накопители, расшифровывайте подпространственные частоты и внедряйте антиматериальные приводы в бортовые модули экспедиционного крейсера. Каждая изученная технология приближает экспедицию к тайнам галактического центра.
            </p>
            <div className="flex items-center gap-4 mt-1 text-[11px] font-mono text-slate-400">
              <span>Изучено технологий: <strong className="text-purple-300 font-bold">{techTree.filter(t => t.unlocked).length}</strong> / {techTree.length}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Шифрование: <span className="text-emerald-400">Субквантовая матрица</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Grid by Tiers */}
      <div className="max-w-[1500px] w-full mx-auto mt-6 space-y-8">
        {[1, 2, 3].map((tier) => {
          const tierTechs = techTree.filter(t => t.tier === tier);
          return (
            <div key={tier}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                  ТЕХНОЛОГИЧЕСКИЙ РЯД {tier}
                </span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tierTechs.map((tech) => {
                  const prereq = tech.prerequisiteId ? techTree.find(t => t.id === tech.prerequisiteId) : null;
                  const isPrereqMet = !prereq || prereq.unlocked;
                  const canAfford = resources.science >= tech.cost && isPrereqMet;

                  return (
                    <div
                      key={tech.id}
                      className={`border rounded-lg p-5 flex flex-col justify-between transition-all ${
                        tech.unlocked
                          ? 'bg-purple-950/20 border-purple-500/40 shadow-sm shadow-purple-950'
                          : isPrereqMet
                          ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-950/40 border-slate-900 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-purple-400 uppercase">
                            {tech.categoryName}
                          </span>
                          {tech.unlocked ? (
                            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> ИЗУЧЕНО
                            </span>
                          ) : !isPrereqMet ? (
                            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5" /> ЗАБЛОКИРОВАНО
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-purple-300">
                              {tech.cost} DATA
                            </span>
                          )}
                        </div>

                        <h3 className="font-heading font-bold text-base text-slate-100 mt-2">
                          {tech.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                          {tech.description}
                        </p>

                        {prereq && !prereq.unlocked && (
                          <div className="text-[10px] font-mono text-amber-400 mt-2">
                            Требуется изучить: {prereq.name}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-end">
                        <button
                          disabled={tech.unlocked || !canAfford}
                          onClick={() => {
                            sounds.playCreditsChime();
                            onUnlockTech(tech);
                          }}
                          className={`px-4 py-2 rounded text-xs font-semibold transition-all ${
                            tech.unlocked
                              ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                              : canAfford
                              ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-md shadow-purple-950/50'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          {tech.unlocked ? 'Изучено' : `Исследовать (${tech.cost} Науки)`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
