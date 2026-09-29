import React, { useState } from 'react';
import { RectifyEvaluationResult } from '../../types/interview';
import { evaluateRectify } from '../../services/api';
import { hindsightService } from '../../services/hindsightMemory';
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Code2,
  ArrowRight,
  Loader2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface RectifyViewProps {
  weaknessConcept?: string;
  topic?: string;
  onCompleted: () => void;
  onCancel: () => void;
}

export const RectifyView: React.FC<RectifyViewProps> = ({
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

  // Knowledge breakdown based on the weakness
  const getCoachingDetails = (concept: string) => {
    if (concept.toLowerCase().includes('index')) {
      return {
        conceptName: 'SQL Database Indexing & B-Tree Trade-offs',
        topic: 'SQL',
        whyInsufficient:
          'In your previous interview, you explained what an index is in basic terms (e.g. back-of-the-book analogy), but failed to explain how indexes alter disk seek paths using balanced trees, or the critical write overhead and buffer cache penalty during INSERT, UPDATE, and DELETE operations.',
        conciseExample: `// Conceptual trade-off:
-- Speeds up read queries on high-cardinality filters:
SELECT * FROM orders WHERE customer_id = 91823; -- O(log N) B-Tree seek instead of full table scan

-- BUT introduces write amplification:
INSERT INTO orders (...) VALUES (...); 
-- Every write must now update the base table heap AND rebalance every associated B-Tree index page on disk!`,
        promptQuestion:
          'Explain when adding an index improves query performance, how B-trees operate during lookups, and when an index becomes a severe disadvantage for write-heavy workloads.',
        expectedKeyPoints: [
          'Query performance improvement & selective filters (O(log N) vs O(N))',
          'B-Tree node traversal and point/range lookups',
          'Write amplification overhead on INSERT / UPDATE / DELETE operations',
        ],
      };
    } else if (concept.toLowerCase().includes('cache')) {
      return {
        conceptName: 'Redis Caching & Concurrency Failure Modes',
        topic: 'Databases',
        whyInsufficient:
          'You understood cache-aside at a surface level, but confused Cache Penetration with Cache Stampede (dog-piling) and failed to articulate how distributed mutex locks or probabilistic early expiration prevent database breakdown.',
        conciseExample: `// Cache Stampede Mitigation:
// 1. Probabilistic Early Expiration (XFetch algorithm)
// 2. Distributed Mutex Lock (only 1 worker queries DB to rebuild cache; others await or read stale)`,
        promptQuestion:
          'Explain the difference between Cache Penetration and Cache Stampede, and detail two concrete architectural mechanisms to protect your database during cache invalidation.',
        expectedKeyPoints: [
          'Difference between non-existent key lookups (penetration) vs concurrent key expiry (stampede)',
          'Distributed mutex lock or Bloom filters',
          'Probabilistic early background cache recomputation',
        ],
      };
    } else {
      return {
        conceptName: concept,
        topic: activeTopic,
        whyInsufficient:
          'Your previous answer was primarily definitional without addressing concrete operational failure modes, scalability limits, or architectural trade-offs.',
        conciseExample: `// Production Pattern:
// Always structure trade-offs around:
// 1. Time / Space Complexity
// 2. Resource Constraints (Network I/O, Disk, Memory)
// 3. Operational Failure Resilience`,
        promptQuestion: `Walk through the core internal execution mechanics, optimal use-cases, and trade-offs of ${concept} in a high-scale production environment.`,
        expectedKeyPoints: [
          'Internal execution mechanism & architectural behavior',
          'Quantifiable performance benefits & use cases',
          'Failure modes, overhead, or resource trade-offs',
        ],
      };
    }
  };

  const details = getCoachingDetails(activeConcept);

  const [userExplanation, setUserExplanation] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<RectifyEvaluationResult | null>(null);

  const handleSelectConcept = (m: any) => {
    setActiveConcept(m.subtopic);
    setActiveTopic(m.topic);
    setUserExplanation('');
    setEvaluationResult(null);
  };

  const handleEvaluate = async () => {
    if (!userExplanation.trim()) return;

    setIsEvaluating(true);
    try {
      const res = await evaluateRectify({
        weaknessConcept: details.conceptName,
        topic: details.topic,
        promptQuestion: details.promptQuestion,
        candidateExplanation: userExplanation,
        expectedKeyPoints: details.expectedKeyPoints,
      });

      setEvaluationResult(res);

      if (res.improved) {
        // Record in persistent Hindsight memory and skill timeline
        const metPoints = res.checklist.filter((c) => c.met).map((c) => c.point);
        hindsightService.recordRectificationImprovement(
          activeConcept,
          activeTopic,
          userExplanation,
          metPoints
        );
      }
    } catch (err) {
      console.error('Rectify evaluation failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Rectification Coaching Studio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Master the underlying trade-offs of flagged concepts. Re-explain to upgrade memory from Weak → Improving.
          </p>
        </div>

        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors self-start sm:self-auto"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Flagged Concept Selector Bar */}
      {weakMemories.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Select Flagged Concept to Rectify:
          </div>
          <div className="flex flex-wrap gap-2">
            {weakMemories.map((m) => {
              const isSelected = m.subtopic === activeConcept;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectConcept(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-200 border-amber-500/50 shadow-sm'
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

      {/* Step 1: Why Previous Answer Was Insufficient */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white">
            1. Why Past Answer Was Insufficient
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
          {details.whyInsufficient}
        </p>
      </div>

      {/* Step 2: Concrete Engineering Example */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-white">
            2. High-Yield Architectural Example
          </h2>
        </div>
        <pre className="p-3.5 rounded-lg bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800/80 leading-relaxed">
          {details.conciseExample}
        </pre>
      </div>

      {/* Step 3: Re-explain & Submit */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">
            3. Prove Your Understanding: Explain It Again
          </h2>
        </div>

        <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 font-medium">
          {details.promptQuestion}
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-400 block font-medium">
            Your New Technical Explanation:
          </label>
          <textarea
            value={userExplanation}
            onChange={(e) => setUserExplanation(e.target.value)}
            placeholder="Address the internal mechanics, algorithmic lookups, and critical write overhead tradeoffs..."
            rows={5}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400 font-mono">
            {userExplanation.trim().split(/\s+/).filter(Boolean).length} words
          </span>

          <button
            onClick={handleEvaluate}
            disabled={isEvaluating || !userExplanation.trim()}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating Explanation...</span>
              </>
            ) : (
              <>
                <span>Evaluate Re-explanation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step 4: Real-time Dimensional Evaluation & Memory Upgrade */}
      {evaluationResult && (
        <div
          className={`p-5 rounded-xl border space-y-4 ${
            evaluationResult.improved
              ? 'bg-emerald-950/20 border-emerald-500/40'
              : 'bg-amber-950/20 border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              {evaluationResult.improved ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
              <h3 className="text-sm font-bold text-white">
                {evaluationResult.improved
                  ? 'Rectification Verified! Memory Upgraded'
                  : 'Needs Deeper Elaboration'}
              </h3>
            </div>

            <div className="text-sm font-mono font-bold text-slate-100">
              Score: {evaluationResult.score}/100
            </div>
          </div>

          {/* Dimensional Checklist */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">
              Dimensional Evaluation Checklist:
            </div>
            <div className="grid grid-cols-1 gap-2">
              {evaluationResult.checklist.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-xs"
                >
                  {item.met ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold text-slate-200">{item.point}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300">
            <span className="font-semibold text-slate-400 block mb-0.5">Interviewer Feedback:</span>
            {evaluationResult.feedback}
          </div>

          <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 flex items-center gap-2 font-mono">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{evaluationResult.hindsightUpdateSummary}</span>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onCompleted}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <span>Save & Complete Rectification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
