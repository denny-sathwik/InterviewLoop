import React from 'react';
import { Interview } from '../../types/interview';
import { Layers, ArrowUpRight, Calendar, AlertTriangle, CheckCircle2, PlayCircle } from 'lucide-react';

interface HistoryViewProps {
  interviews: Interview[];
  onSelectReview: (id: string) => void;
  onStartNew: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  interviews,
  onSelectReview,
  onStartNew,
}) => {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Interview History & Archives</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse all past sessions to see how your answers, weaknesses, and scores evolved over time.
          </p>
        </div>

        <button
          onClick={onStartNew}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <PlayCircle className="w-4 h-4" />
          <span>New Interview</span>
        </button>
      </div>

      <div className="space-y-3">
        {interviews.map((interview) => (
          <div
            key={interview.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                  Interview #{interview.interviewNumber}
                </span>
                <span className="text-sm font-bold text-white">{interview.role}</span>
                <span className="text-xs text-slate-400">({interview.experienceLevel})</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {interview.startedAt.split('T')[0]}
                </span>
                <span>·</span>
                <span>{interview.type}</span>
                <span>·</span>
                <span>Topics: {interview.topics.join(', ')}</span>
                <span>·</span>
                <span>{interview.questions.length} Questions</span>
              </div>

              {/* Weaknesses / Strengths pill summary */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                {interview.weaknesses && interview.weaknesses.length > 0 && (
                  <span className="text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/50 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Weaknesses: {interview.weaknesses.slice(0, 2).join(', ')}</span>
                  </span>
                )}
                {interview.strengths && interview.strengths.length > 0 && (
                  <span className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Strengths: {interview.strengths.slice(0, 2).join(', ')}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
              <div className="text-right">
                <div className="text-2xl font-bold font-mono text-white tabular-nums">
                  {interview.score}<span className="text-xs text-slate-400">/100</span>
                </div>
                <span className="text-[11px] text-slate-400">Overall Score</span>
              </div>

              <button
                onClick={() => onSelectReview(interview.id)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>Full Review</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
