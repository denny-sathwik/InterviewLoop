import React from 'react';
import { Interview, HindsightMemory } from '../../types/interview';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Brain,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface ReviewViewProps {
  interview: Interview;
  onFixWeakness: (concept: string, topic: string) => void;
  onRerunWeaknesses: (concept: string, topic: string) => void;
  onBackToDashboard: () => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  interview,
  onFixWeakness,
  onRerunWeaknesses,
  onBackToDashboard,
}) => {
  const scores = interview.scoresBreakdown || {
    technicalAccuracy: interview.score,
    communication: Math.max(50, interview.score - 5),
    problemSolving: Math.min(95, interview.score + 5),
    confidence: interview.score,
    topicCoverage: 80,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Interview #{interview.interviewNumber}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-300">{interview.role} ({interview.experienceLevel})</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-mono text-slate-400">
              {interview.completedAt?.split('T')[0] || 'Completed'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Interview Review & Memory Synthesis
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToDashboard}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* Persistent Weakness Banner (CRITICAL SECTION 5) */}
      {interview.persistentWeaknesses && interview.persistentWeaknesses.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm tracking-wide">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>PERSISTENT WEAKNESS HIGHLIGHT</span>
            </div>
            <span className="text-xs font-mono text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
              Status: Needs Improvement
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {interview.persistentWeaknesses.map((pw, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/80 border border-rose-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-rose-400 font-mono text-sm">⚠</span>
                    <span>{pw.concept}</span>
                  </h4>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>Detected in:</span>
                    <div className="flex gap-1.5 font-mono text-rose-300">
                      {pw.detectedIn.map((d) => (
                        <span key={d} className="bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40 text-[11px]">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2">
                    <span className="text-rose-400 font-medium">Adaptive Directive: </span>
                    {pw.recommendedAction}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      onFixWeakness(pw.concept, interview.topics[0] || 'Technical')
                    }
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-colors"
                  >
                    Fix This Weakness
                  </button>
                  <button
                    onClick={() =>
                      onRerunWeaknesses(pw.concept, interview.topics[0] || 'Technical')
                    }
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                  >
                    Rerun Weakness
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Performance Metrics */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Overall Performance</h3>
            <p className="text-xs text-slate-400">Synthesized evaluation by AI interviewer</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-mono text-white tabular-nums">
              {interview.score}
            </span>
            <span className="text-sm text-slate-400 font-medium">/100</span>
          </div>
        </div>

        {/* Score Breakdown Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Technical Accuracy', val: scores.technicalAccuracy },
            { label: 'Communication', val: scores.communication },
            { label: 'Problem Solving', val: scores.problemSolving },
            { label: 'Confidence', val: scores.confidence },
            { label: 'Topic Coverage', val: scores.topicCoverage },
          ].map((sc) => (
            <div key={sc.label} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{sc.label}</span>
                <span className="font-mono font-semibold text-slate-200 tabular-nums">
                  {sc.val}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${sc.val}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Demonstrated Strengths</span>
          </h3>

          <div className="space-y-2 pt-1">
            {interview.strengths && interview.strengths.length > 0 ? (
              interview.strengths.map((str, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-200"
                >
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>{str}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No strong conceptual mastery recorded.</p>
            )}
          </div>
        </div>

        {/* Weaknesses Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Identified Weaknesses</span>
          </h3>

          <div className="space-y-2 pt-1">
            {interview.weaknesses && interview.weaknesses.length > 0 ? (
              interview.weaknesses.map((wk, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 flex items-center justify-between gap-2.5 text-xs text-rose-200"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-rose-400 font-bold shrink-0">⚠</span>
                    <span>{wk}</span>
                  </div>
                  <button
                    onClick={() =>
                      onFixWeakness(wk, interview.topics[0] || 'Technical')
                    }
                    className="text-[11px] px-2.5 py-1 rounded bg-rose-600/30 text-rose-200 border border-rose-500/30 hover:bg-rose-600/50 font-medium shrink-0 transition-colors"
                  >
                    Fix Weakness
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No severe weaknesses flagged in this session.</p>
            )}
          </div>
        </div>
      </div>

      {/* Question by Question Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-slate-100">
          Question-by-Question Diagnostic
        </h3>

        <div className="space-y-4">
          {interview.questions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-500/30">
                    Q{idx + 1}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {q.topic} · {q.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      q.score >= 80
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : q.score >= 60
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    Score: {q.score}/100
                  </span>
                </div>
              </div>

              {/* Rationale if question came from Hindsight */}
              {q.rationale && (
                <div className="text-[11px] text-indigo-300 bg-indigo-950/30 px-3 py-1.5 rounded-lg border border-indigo-900/50 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{q.rationale}</span>
                </div>
              )}

              {/* Question Text */}
              <div className="text-sm font-semibold text-slate-100">
                "{q.question}"
              </div>

              {/* Candidate Answer */}
              <div className="p-3 rounded-lg bg-slate-900 text-xs text-slate-300 border border-slate-800">
                <span className="font-semibold text-slate-400 block mb-1">Your Answer:</span>
                <p className="whitespace-pre-wrap">{q.answer}</p>
                {q.followUpPrompt && q.userFollowUpAnswer && (
                  <div className="mt-2 pt-2 border-t border-slate-800 text-amber-200/90">
                    <span className="font-semibold text-amber-300 block mb-1">
                      Probe: {q.followUpPrompt}
                    </span>
                    <p className="whitespace-pre-wrap">{q.userFollowUpAnswer}</p>
                  </div>
                )}
              </div>

              {/* Feedback */}
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="font-semibold text-indigo-300 block mb-0.5">
                  Interviewer Evaluation:
                </span>
                {q.feedback}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
