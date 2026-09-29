import React, { useState } from 'react';
import { hindsightService } from '../../services/hindsightMemory';
import {
  Brain,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  TrendingUp,
} from 'lucide-react';

interface HackathonDemoViewProps {
  onDemoCompleted: () => void;
  onGoToInspector: () => void;
}

export const HackathonDemoView: React.FC<HackathonDemoViewProps> = ({
  onDemoCompleted,
  onGoToInspector,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Interview 1 state
  const [interview1Answer, setInterview1Answer] = useState(
    'An index is like an index in the back of a book. It helps the database find rows faster without having to scan the whole table.'
  );
  const [interview1Evaluated, setInterview1Evaluated] = useState(false);

  // Step 2: Interview 2 state
  const [interview2Answer, setInterview2Answer] = useState(
    'For a 20-million-row orders table with high query latency filtering by customer_id and created_at, I would analyze the query plan with EXPLAIN (ANALYZE). I would implement a composite B-Tree index on (customer_id, created_at DESC) so lookups can perform an index seek rather than a sequential table scan. Crucially, I would evaluate write overhead and index bloat: each additional index adds write amplification during INSERTs, so we must verify that column selectivity is high and that the read frequency justifies the buffer pool RAM usage.'
  );
  const [interview2Evaluated, setInterview2Evaluated] = useState(false);

  const handleStep1Submit = () => {
    setInterview1Evaluated(true);
    // Ensure memory is recorded as weak
    hindsightService.saveMemory({
      id: 'mem-sql-indexing-01',
      userId: 'candidate-a',
      topic: 'SQL',
      subtopic: 'Database Indexing & B-Trees',
      type: 'technical_weakness',
      observation:
        'Candidate understands basic book analogy for indexing, but repeatedly struggles to explain internal B-Tree lookup traversal or write overhead tradeoffs during INSERT/UPDATE operations.',
      evidence:
        'Candidate gave definition-only answer in Interview #1 and missed write penalty.',
      confidence: 'High',
      severity: 'High',
      status: 'Weak',
      firstDetected: '2026-09-29',
      lastDetected: '2026-09-29',
      occurrences: 2,
      detectedInInterviews: ['Interview #1'],
      recommendedFutureBehavior:
        'Test indexing using scenario-based troubleshooting questions (e.g. 20M-row orders table) rather than repeating definition questions.',
    });
  };

  const handleStep2Submit = () => {
    setInterview2Evaluated(true);
    // Transition Hindsight memory to Improving
    hindsightService.recordRectificationImprovement(
      'Database Indexing & B-Trees',
      'SQL',
      'Candidate correctly addressed composite index ordering, B-Tree leaf seek vs table scan, and quantified write amplification and buffer cache bloat on 20M rows.',
      ['Query performance & composite ordering', 'B-Tree lookup mechanics', 'Write amplification & buffer pool memory']
    );
  };

  const handleResetDemo = () => {
    hindsightService.resetToDemoSeed();
    setCurrentStep(1);
    setInterview1Evaluated(false);
    setInterview2Evaluated(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/40 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Interactive Walkthrough Demo Mode
            </span>
          </div>
          <button
            onClick={handleResetDemo}
            className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Visualizing Persistent Memory in Action
        </h1>
        <p className="text-xs text-slate-300 max-w-2xl">
          Watch how InterviewLoop observes a weakness in Interview #1, stores semantic memory, and
          subsequently alters Interview #2 into a high-scale troubleshooting scenario to verify actual mastery.
        </p>
      </div>

      {/* Progress Steps Header */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div
          className={`p-3 rounded-xl border flex items-center gap-2.5 ${
            currentStep === 1
              ? 'bg-slate-900 border-indigo-500 text-white font-semibold'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
            1
          </span>
          <span>Interview #1: Initial Question & Memory Creation</span>
        </div>

        <div
          className={`p-3 rounded-xl border flex items-center gap-2.5 ${
            currentStep === 2
              ? 'bg-slate-900 border-indigo-500 text-white font-semibold'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
            2
          </span>
          <span>Interview #2: Memory Retrieval & Scenario Adaption</span>
        </div>
      </div>

      {/* STEP 1: INTERVIEW #1 */}
      {currentStep === 1 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                Interview #1 · SQL
              </span>
              <span className="text-xs text-slate-400">Software Engineer Baseline</span>
            </div>
            <span className="text-[11px] text-slate-400">Blank Slate Session</span>
          </div>

          {/* Question 1 */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Interviewer Question:</span>
            <p className="text-base font-semibold text-slate-100">
              "What is database indexing and how does it work?"
            </p>
          </div>

          {/* Candidate Answer */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Candidate's Incomplete Answer:
            </label>
            <textarea
              value={interview1Answer}
              onChange={(e) => setInterview1Answer(e.target.value)}
              rows={3}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {!interview1Evaluated ? (
            <button
              onClick={handleStep1Submit}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Submit Answer & Extract Memory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Weakness Detected Box */}
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Weakness Detected: SQL Indexing</span>
                  </div>
                  <span className="text-[11px] text-rose-400 font-mono">Score: 55/100</span>
                </div>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  Reason: Candidate understands definition (analogy) but missed write amplification,
                  B-tree internal leaf pages, and performance trade-offs during INSERT/UPDATE operations.
                </p>
              </div>

              {/* Memory Created Notification */}
              <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Brain className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>✓ Memory Created in Persistent Storage</span>
                    </div>
                    <p className="text-xs text-indigo-200/90 mt-0.5">
                      Directive: "Test indexing using scenario-based troubleshooting questions rather than repeating definition questions."
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <span>Proceed to Interview #2</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: INTERVIEW #2 */}
      {currentStep === 2 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                Interview #2 · SQL
              </span>
              <span className="text-xs text-slate-400">Sequential Session</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono">Memory Active</span>
          </div>

          {/* TARGETED RETRIEVAL CALLOUT */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-slate-950 border border-indigo-500/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span>Targeted Memory Retrieved Before Asking:</span>
            </div>
            <div className="pl-6 text-xs text-slate-300 space-y-1">
              <div>
                <strong className="text-rose-300">Previous Weakness:</strong> SQL Indexing (detected in Interview #1)
              </div>
              <div>
                <strong className="text-indigo-300">Interview Strategy:</strong> Use a scenario-based question to test real-world investigation and trade-offs rather than asking for definitions again.
              </div>
            </div>
          </div>

          {/* Question 2: The novel scenario */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Interviewer Generated Scenario:</span>
            <p className="text-base font-semibold text-slate-100">
              "A company has a 20-million-row orders table and queries filtering by customer_id and created_at are slow. What would you investigate, and what indexing strategy and trade-offs would you consider?"
            </p>
          </div>

          {/* Candidate Answer Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Candidate's Response (Demonstrating True Mastery):
            </label>
            <textarea
              value={interview2Answer}
              onChange={(e) => setInterview2Answer(e.target.value)}
              rows={4}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {!interview2Evaluated ? (
            <button
              onClick={handleStep2Submit}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Submit Answer & Update Memory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Previous Weakness Improved */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>✓ Previous Weakness Improved</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono">Score: 94/100</span>
                </div>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  Candidate successfully identified EXPLAIN plan inspection, composite index design,
                  B-Tree seek paths, and write overhead tradeoffs.
                </p>
              </div>

              {/* Status Transition */}
              <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Memory Updated: SQL Indexing → <span className="text-amber-300">Improving</span>
                    </div>
                    <p className="text-xs text-indigo-200/90 mt-0.5">
                      Skill Memory Timeline updated across sequential interviews.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onGoToInspector}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    View in Memory Inspector
                  </button>
                  <button
                    onClick={onDemoCompleted}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
                  >
                    View in Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
