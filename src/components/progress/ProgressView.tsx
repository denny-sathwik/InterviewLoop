import React from 'react';
import { SkillTimeline } from '../../types/interview';
import { SkillMemoryTimelineComponent } from '../dashboard/SkillMemoryTimeline';

interface ProgressViewProps {
  timelines: SkillTimeline[];
  onFixWeakness: (concept: string, topic: string) => void;
  onRerunConcept: (concept: string, topic: string) => void;
  onStartNewInterview: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  timelines,
  onFixWeakness,
  onRerunConcept,
  onStartNewInterview,
}) => {
  const masteredCount = timelines.filter((t) => t.currentStatus === 'Mastered').length;
  const improvingCount = timelines.filter((t) => t.currentStatus === 'Improving').length;
  const weakCount = timelines.filter((t) => t.currentStatus === 'Weak').length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Skill Memory Timeline
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological progression of evaluated concepts across interviews and rectifications.
          </p>
        </div>

        <button
          onClick={onStartNewInterview}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors self-start sm:self-auto"
        >
          Start New Interview
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400">Mastered Concepts</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {masteredCount}
          </div>
          <span className="text-[11px] text-emerald-400/80">Strong retention</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400">Improving Concepts</span>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {improvingCount}
          </div>
          <span className="text-[11px] text-amber-400/80">In active retesting</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400">Weak Concepts</span>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
            {weakCount}
          </div>
          <span className="text-[11px] text-rose-400/80">Priority targets</span>
        </div>
      </div>

      {/* Main Timeline Component */}
      <div className="pt-2">
        <SkillMemoryTimelineComponent
          timelines={timelines}
          onFixWeakness={onFixWeakness}
          onRerunConcept={onRerunConcept}
        />
      </div>
    </div>
  );
};
