import React from 'react';
import { HindsightMemory } from '../../types/interview';
import { AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

interface WeaknessesViewProps {
  memories: HindsightMemory[];
  onFixWeakness: (concept: string, topic: string) => void;
  onRerunConcept: (concept: string, topic: string) => void;
}

export const WeaknessesView: React.FC<WeaknessesViewProps> = ({
  memories,
  onFixWeakness,
  onRerunConcept,
}) => {
  const weakMemories = memories.filter(
    (m) =>
      m.type === 'technical_weakness' ||
      m.type === 'conceptual_misunderstanding' ||
      m.type === 'repeated_mistake' ||
      m.status === 'Weak'
  );

  const persistentWeaknesses = weakMemories.filter((m) => m.occurrences >= 2);
  const singleWeaknesses = weakMemories.filter((m) => m.occurrences < 2);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Weaknesses & Rectification
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Targeted concepts requiring review. Use Rectify Mode to master trade-offs or Rerun Mode to evaluate scenario retention.
        </p>
      </div>

      {/* Persistent Weaknesses Priority Box */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Persistent Weaknesses (Detected Across Multiple Sessions)</span>
        </h2>

        {persistentWeaknesses.length > 0 ? (
          <div className="space-y-3">
            {persistentWeaknesses.map((mem) => (
              <div
                key={mem.id}
                className="p-5 rounded-2xl bg-slate-900 border border-rose-500/40 shadow-lg space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                      {mem.topic}
                    </span>
                    <h3 className="text-base font-bold text-white">{mem.subtopic}</h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-rose-400 font-mono font-semibold">
                      Detected in: {mem.detectedInInterviews.join(', ')}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-medium">
                      Status: {mem.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-slate-200">Observation: </strong>
                  {mem.observation}
                </div>

                <div className="text-xs text-slate-400 font-mono bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                  <strong className="text-slate-300">Evidence: </strong>
                  "{mem.evidence}"
                </div>

                <div className="text-xs text-indigo-200 bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-900/50">
                  <strong className="text-indigo-400">Interviewer Directive: </strong>
                  {mem.recommendedFutureBehavior}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800/80">
                  <button
                    onClick={() => onFixWeakness(mem.subtopic, mem.topic)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Fix This Weakness (Rectify)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRerunConcept(mem.subtopic, mem.topic)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors"
                  >
                    Rerun Scenario
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
            No persistent multi-interview weaknesses currently active.
          </div>
        )}
      </div>

      {/* Single Detected Weaknesses */}
      {singleWeaknesses.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Single Session Weaknesses (Early Stage Tracking)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {singleWeaknesses.map((mem) => (
              <div
                key={mem.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono text-indigo-400 text-[11px] bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                      {mem.topic}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {mem.detectedInInterviews.join(', ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1">{mem.subtopic}</h3>
                  <p className="text-xs text-slate-300 leading-snug line-clamp-3">
                    {mem.observation}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-amber-400 font-medium">Status: {mem.status}</span>
                  <button
                    onClick={() => onFixWeakness(mem.subtopic, mem.topic)}
                    className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
                  >
                    Fix Concept
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
