import React from 'react';
import { SkillTimeline } from '../../types/interview';
import { ArrowRight, CheckCircle2, AlertCircle, TrendingUp, Clock } from 'lucide-react';

interface SkillMemoryTimelineProps {
  timelines: SkillTimeline[];
  onFixWeakness?: (concept: string, topic: string) => void;
  onRerunConcept?: (concept: string, topic: string) => void;
}

export const SkillMemoryTimelineComponent: React.FC<SkillMemoryTimelineProps> = ({
  timelines,
  onFixWeakness,
  onRerunConcept,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Mastered':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-400',
          icon: CheckCircle2,
          label: 'Mastered',
        };
      case 'Improving':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          dot: 'bg-amber-400',
          icon: TrendingUp,
          label: 'Improving',
        };
      case 'Weak':
      default:
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          dot: 'bg-rose-400',
          icon: AlertCircle,
          label: 'Needs Improvement',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>Skill Memory Timeline</span>
            <span className="text-[11px] text-slate-400 font-normal">
              (Multi-interview tracking & learning progression)
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            How persistent memory tracks your concept mastery across sequential interviews and rectifications.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {timelines.map((skill) => {
          const badge = getStatusBadge(skill.currentStatus);

          return (
            <div
              key={skill.concept}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-colors"
            >
              {/* Concept Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono text-indigo-400 uppercase tracking-wide bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20">
                    {skill.topic}
                  </span>
                  <span className="text-sm font-semibold text-slate-100">{skill.concept}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.bg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    <span>{badge.label}</span>
                  </span>

                  {skill.currentStatus === 'Weak' && onFixWeakness && (
                    <button
                      onClick={() => onFixWeakness(skill.concept, skill.topic)}
                      className="text-xs px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium transition-colors"
                    >
                      Fix This Weakness
                    </button>
                  )}

                  {onRerunConcept && (
                    <button
                      onClick={() => onRerunConcept(skill.concept, skill.topic)}
                      className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded font-medium transition-colors"
                    >
                      Rerun Scenario
                    </button>
                  )}
                </div>
              </div>

              {/* Sequential Event Nodes */}
              <div className="relative pt-1 pb-1">
                {/* Horizontal line for desktop */}
                <div className="hidden md:block absolute top-5 left-4 right-4 h-0.5 bg-slate-800 -z-0" />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative z-10">
                  {skill.timeline.map((point, idx) => {
                    const isWeak = point.status === 'Weak';
                    const isImproving = point.status === 'Improving';
                    const isMastered = point.status === 'Mastered';

                    const dotColor = isMastered
                      ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                      : isImproving
                      ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                      : 'bg-rose-500 text-white shadow-rose-500/30';

                    const statusPill = isMastered
                      ? 'text-emerald-400'
                      : isImproving
                      ? 'text-amber-400'
                      : 'text-rose-400';

                    return (
                      <div
                        key={point.id || idx}
                        className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/90 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${dotColor}`}
                              />
                              {point.interviewLabel}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">{point.date}</span>
                          </div>

                          <div className={`text-xs font-semibold mb-1 ${statusPill}`}>
                            {point.status === 'Weak' && '🔴 Weak explanation'}
                            {point.status === 'Improving' && '🟡 Understanding improved'}
                            {point.status === 'Mastered' && '🟢 Strong / Consistent'}
                          </div>

                          <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                            {point.note}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
