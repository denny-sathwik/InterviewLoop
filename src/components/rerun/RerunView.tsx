import React, { useState, useEffect } from 'react';
import { fetchRerunQuestion, evaluateAnswer } from '../../services/api';
import { hindsightService } from '../../services/hindsightMemory';
import {
  Brain,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Zap,
} from 'lucide-react';

interface RerunViewProps {
  weaknessConcept?: string;
  topic?: string;
  onCompleted: () => void;
  onCancel: () => void;
}

export const RerunView: React.FC<RerunViewProps> = ({
  weaknessConcept: initialConcept,
  topic: initialTopic,
  onCompleted,
  onCancel,
}) => {
  const weakMemories = hindsightService
    .getAllMemories()
    .filter((m) => m.status === 'Weak' || m.status === 'Improving');

  const defaultConcept =
    initialConcept || (weakMemories.length > 0 ? weakMemories[0].subtopic : 'Database Indexing & B-Trees');
  const defaultTopic =
    initialTopic || (weakMemories.length > 0 ? weakMemories[0].topic : 'SQL');

  const [activeConcept, setActiveConcept] = useState<string>(defaultConcept);
  const [activeTopic, setActiveTopic] = useState<string>(defaultTopic);

  const [questionData, setQuestionData] = useState<{
    question: string;
    topic: string;
    difficulty: any;
    expectedKeyPoints: string[];
    rationale: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState<any>(null);

  // Load novel question targeting the active weakness
  useEffect(() => {
    let isMounted = true;
    const loadNovelQuestion = async () => {
      setIsLoading(true);
      setUserAnswer('');
      setEvalResult(null);
      try {
        const res = await fetchRerunQuestion({
          weaknessConcept: activeConcept,
          topic: activeTopic,
          previousQuestions: [
            'Can you explain what a database index is and how it works?',
            'Should we index every column in an e-commerce table with frequent writes?',
          ],
        });
        if (isMounted) setQuestionData(res);
      } catch (err) {
        console.error('Failed to load rerun question:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadNovelQuestion();
    return () => {
      isMounted = false;
    };
  }, [activeConcept, activeTopic]);

  const handleSubmit = async () => {
    if (!userAnswer.trim() || !questionData) return;

    setIsSubmitting(true);
    try {
      const res = await evaluateAnswer({
        question: questionData.question,
        answer: userAnswer,
        topic: questionData.topic,
        difficulty: 'Hard',
        role: 'Software Engineer',
        targetedWeakness: activeConcept,
      });

      setEvalResult(res);

      if (res.score >= 75) {
        // Record concept mastery in Hindsight memory & timeline
        hindsightService.recordConceptMastery(
          activeConcept,
          activeTopic,
          'Rerun Mode',
          `Successfully handled novel scenario: "${questionData.question.slice(0, 70)}..." with score ${res.score}/100.`
        );
      }
    } catch (err) {
      console.error('Answer submission failed in rerun:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Rerun Scenario Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generates brand new, novel high-scale production dilemmas to test whether you've truly mastered flagged concepts.
          </p>
        </div>

        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors self-start sm:self-auto"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Target Concept Selector */}
      {weakMemories.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Select Concept to Test with Novel Scenario:
          </div>
          <div className="flex flex-wrap gap-2">
            {weakMemories.map((m) => {
              const isSelected = m.subtopic === activeConcept;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveConcept(m.subtopic);
                    setActiveTopic(m.topic);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-200 border-indigo-500/50 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="font-mono text-[10px] text-slate-400">{m.topic}:</span>
                  <span>{m.subtopic}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      m.status === 'Weak'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {m.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Novel Scenario Question Card */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
              {activeTopic}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-300">Targeting: {activeConcept}</span>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
            Hard Scenario
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <span className="text-xs">Generating novel scenario from adaptive memory...</span>
          </div>
        ) : questionData ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <h2 className="text-sm font-bold text-white leading-relaxed">
                "{questionData.question}"
              </h2>
            </div>

            <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-300 flex items-start gap-2">
              <Brain className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-indigo-200">Scenario Generator Rule:</span>
                {questionData.rationale}
              </div>
            </div>

            {/* Answer Input */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-medium text-slate-300 block">
                Your Architectural Answer:
              </label>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Walk through your investigation steps, trade-offs, and mitigation strategies under load..."
                rows={5}
                disabled={isSubmitting || !!evalResult}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
              />
            </div>

            {!evalResult && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !userAnswer.trim()}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating Answer...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Scenario Answer</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Scenario Evaluation Result */}
      {evalResult && (
        <div
          className={`p-5 rounded-xl border space-y-4 ${
            evalResult.score >= 75
              ? 'bg-emerald-950/20 border-emerald-500/40'
              : 'bg-rose-950/20 border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              {evalResult.score >= 75 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              )}
              <h3 className="text-sm font-bold text-white">
                {evalResult.score >= 75
                  ? 'Retention Verified! Mastery Confirmed in Memory'
                  : 'Scenario Incomplete — Still Needs Practice'}
              </h3>
            </div>

            <div className="text-sm font-mono font-bold text-slate-100">
              Score: {evalResult.score}/100
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <span className="font-semibold text-slate-400 block mb-0.5">Evaluation Feedback:</span>
            {evalResult.feedback}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setEvalResult(null);
                setUserAnswer('');
              }}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Try Another Scenario
            </button>

            <button
              onClick={onCompleted}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <span>Back to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
