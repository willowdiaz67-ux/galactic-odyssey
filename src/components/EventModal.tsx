import React from 'react';
import { NarrativeEvent, NarrativeEventChoice, Resources } from '../types/game';
import { sounds } from '../services/soundEffects';
import { Radio, Skull, Sparkles, Sun, Users, ArrowRight } from 'lucide-react';

interface EventModalProps {
  event: NarrativeEvent;
  resources: Resources;
  onMakeChoice: (choice: NarrativeEventChoice) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  resources,
  onMakeChoice
}) => {
  const getIcon = () => {
    switch (event.icon) {
      case 'Radio': return <Radio className="w-8 h-8 text-cyan-400" />;
      case 'Skull': return <Skull className="w-8 h-8 text-amber-400" />;
      case 'Sparkles': return <Sparkles className="w-8 h-8 text-purple-400" />;
      case 'Sun': return <Sun className="w-8 h-8 text-rose-400" />;
      default: return <Users className="w-8 h-8 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#04060C]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#090D1A] border border-cyan-500/40 rounded-xl max-w-xl w-full p-6 shadow-2xl shadow-cyan-950/60 flex flex-col gap-5">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            {getIcon()}
          </div>
          <div>
            <div className="text-xs font-mono text-cyan-400 tracking-wider">
              {event.subtitle.toUpperCase()}
            </div>
            <h2 className="text-xl font-bold font-heading text-slate-100 mt-0.5">
              {event.title}
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {event.text}
        </p>

        <div className="space-y-2.5 pt-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Ваше решение, Капитан:
          </span>

          {event.choices.map((choice, idx) => {
            const hasRequirement = !choice.requirement || (
              choice.requirement.resource && 
              choice.requirement.amount && 
              resources[choice.requirement.resource] >= choice.requirement.amount
            );

            return (
              <button
                key={idx}
                disabled={!hasRequirement}
                onClick={() => {
                  sounds.playScanPing();
                  onMakeChoice(choice);
                }}
                className={`w-full text-left p-3.5 rounded-lg border text-xs transition-all flex items-center justify-between gap-3 ${
                  hasRequirement
                    ? 'bg-slate-900/80 hover:bg-cyan-950/30 border-slate-800 hover:border-cyan-500/50 text-slate-200 cursor-pointer'
                    : 'bg-slate-950/50 border-slate-900 text-slate-500 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="font-medium text-slate-200">{choice.text}</div>
                  {choice.requirement && (
                    <div className="text-[10px] font-mono text-amber-400 mt-1">
                      Требуется: {choice.requirement.amount} {choice.requirement.resource}
                    </div>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
