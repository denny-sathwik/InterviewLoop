import React from 'react';
import {
  Interview,
  HindsightMemory,
  SkillTimeline,
} from '../../types/interview';
import { ScoreProgressionChart } from './ScoreProgressionChart';
import {
  Brain,
  PlayCircle,
  AlertTriangle,
  Lightbulb,
  Zap,
  TrendingUp,
  History,
  Sparkles,
  GitBranch,
  ArrowRight,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Code,
  Database,
  Terminal,
} from 'lucide-react';
import { NavTab } from '../layout/Sidebar';

interface DashboardViewProps {
  interviews: Interview[];
  memories: HindsightMemory[];
  timelines: SkillTimeline[];
  onNavigate: (tab: NavTab) => void;
  onSelectInterviewReview: (interviewId: string) => void;
  onFixWeakness: (concept: string, topic: string) => void;
  onRerunConcept: (concept: string, topic: string) => void;
  onLoadDemoSeed?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  interviews,
  memories,
  timelines,
  onNavigate,
  onSelectInterviewReview,
  onFixWeakness,
  onRerunConcept,
  onLoadDemoSeed,
}) => {
  const completedInterviews = interviews.filter((i) => i.status === 'completed');
  const count = completedInterviews.length;
  const hasCompletedInterview = count >= 1;

  const avgScore =
    count > 0
      ? Math.round(
          completedInterviews.reduce((acc, curr) => acc + (curr.score || 0), 0) / count
        )
      : 0;

  const recentInterview = completedInterviews[0];
  const previousInterview = completedInterviews[1];

  let improvementPct = 0;
  if (recentInterview && previousInterview && previousInterview.score > 0) {
    improvementPct = Math.round(
      ((recentInterview.score - previousInterview.score) / previousInterview.score) * 100
    );
  }

  const weakMemories = memories.filter(
    (m) =>
      m.type === 'technical_weakness' ||
      m.type === 'conceptual_misunderstanding' ||
      m.type === 'repeated_mistake' ||
      m.status === 'Weak'
  );

  const strongAreas = memories.filter(
    (m) => m.type === 'technical_strength' || m.status === 'Mastered'
  );

  const featureCards = [
    {
      id: 'configure' as NavTab,
      title: 'Start Interview',
      description: 'Configure and launch a memory-adapted technical mock interview targeting past mistakes.',
      icon: PlayCircle,
      buttonText: 'Launch Interview',
      buttonStyle: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20',
      badge: 'Interactive',
      badgeStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'graph' as NavTab,
      title: 'Knowledge Graph',
      description: 'Interactive skill network showing detected relationships between strengths and weaknesses.',
      icon: GitBranch,
      buttonText: 'Explore Graph',
      buttonStyle: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
      badge: `${memories.length} Nodes`,
      badgeStyle: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      id: 'weaknesses' as NavTab,
      title: 'Weaknesses Hub',
      description: 'Diagnose flagged conceptual misunderstandings and multi-session repeated mistakes.',
      icon: AlertTriangle,
      buttonText: 'Review Weaknesses',
      buttonStyle: 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-200 border border-rose-500/40',
      badge: `${weakMemories.length} Flagged`,
      badgeStyle: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'rectify' as NavTab,
      title: 'Rectification Studio',
      description: 'Review why previous answers were insufficient and re-explain core trade-offs to upgrade memory.',
      icon: Lightbulb,
      buttonText: 'Open Studio',
      buttonStyle: 'bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 border border-amber-500/40',
      badge: 'Coaching',
      badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'rerun' as NavTab,
      title: 'Rerun Scenario Engine',
      description: 'Test retention with novel, unrepeated high-scale production dilemmas targeting weak concepts.',
      icon: Zap,
      buttonText: 'Run Scenarios',
      buttonStyle: 'bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-500/40',
      badge: 'Novel Scenarios',
      badgeStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'progress' as NavTab,
      title: 'Skill Memory Timeline',
      description: 'Track chronological concept trajectories from initial mistake to verified retention.',
      icon: TrendingUp,
      buttonText: 'View Timeline',
      buttonStyle: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
      badge: `${timelines.length} Timelines`,
      badgeStyle: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      id: 'memory' as NavTab,
      title: 'Memory Inspector',
      description: 'Inspect stored semantic memory records, evidence quotes, and pedagogical directives.',
      icon: Brain,
      buttonText: 'Inspect Memories',
      buttonStyle: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
      badge: `${memories.length} Memories`,
      badgeStyle: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      id: 'history' as NavTab,
      title: 'Interview Archives',
      description: 'Review transcripts, question breakdowns, scoring metrics, and interviewer feedback.',
      icon: History,
      buttonText: 'Browse Archives',
      buttonStyle: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
      badge: `${completedInterviews.length} Sessions`,
      badgeStyle: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      id: 'demo' as NavTab,
      title: 'Demo Walkthrough',
      description: 'Interactive step-by-step tour demonstrating how InterviewLoop detects and adapts across sessions.',
      icon: Sparkles,
      buttonText: 'Start Walkthrough',
      buttonStyle: 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-sm',
      badge: 'Guided Tour',
      badgeStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
  ];

  // -------------------------------------------------------------
  // STATE 1: 0 INTERVIEWS COMPLETED
  // Hide all evaluation, weaknesses hub, and post-session stats
  // -------------------------------------------------------------
  if (!hasCompletedInterview) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Hero Onboarding Card */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
          <div className="space-y-3 relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Adaptive Memory Activated</span>
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              Start Your First Technical Interview
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              InterviewLoop uses persistent memory to remember your technical answers, diagnose weaknesses, and continuously adapt future interview strategies so you never get tested on the same mistakes twice.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('configure')}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30 group"
              >
                <PlayCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Launch Your First Interview</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => onNavigate('demo')}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>See Demo Walkthrough</span>
              </button>
            </div>
          </div>
        </div>

        {/* What Unlocks After 1st Interview */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              What Unlocks After Your First Interview
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 w-fit">
                <Brain className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">
                AI Memory Extraction
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Extracts persistent strengths and conceptual misunderstandings from your actual answers, isolating exact trade-offs missed.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 w-fit">
                <GitBranch className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">
                Knowledge Graph & Weaknesses Hub
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visualizes interconnected skill topologies showing how identified weaknesses bottleneck or contrast with your technical strengths.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 w-fit">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-100">
                Rectification & Rerun Scenarios
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Re-explain core concepts to upgrade memory status, and test retention with novel high-scale production dilemmas.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Role Shortcuts */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <span className="text-xs font-semibold text-slate-300 block">
            Popular Interview Tracks:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {[
              { role: 'Software Engineer', topics: 'SQL, Python, APIs', icon: Terminal },
              { role: 'Backend Developer', topics: 'APIs, Databases, Caching', icon: Database },
              { role: 'Full Stack Developer', topics: 'React, Node, Architecture', icon: Code },
              { role: 'Data Analyst / Engineer', topics: 'SQL, Pipelines, Memory', icon: ShieldCheck },
            ].map((track, i) => {
              const TrackIcon = track.icon;
              return (
                <button
                  key={i}
                  onClick={() => onNavigate('configure')}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <TrackIcon className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300" />
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                      {track.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{track.topics}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Demo Loader */}
        {onLoadDemoSeed && (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>
              Want to preview the evaluation features immediately with sample candidate data?
            </span>
            <button
              onClick={onLoadDemoSeed}
              className="px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/50 font-medium text-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Load Sample 2-Session Profile</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 2: AT LEAST 1 INTERVIEW COMPLETED
  // Displays full evaluation telemetry, feature hub, charts, & archives
  // -------------------------------------------------------------
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Primary Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Mission control for your interview preparation. Track learning progress and launch any core feature.
          </p>
        </div>

        <button
          onClick={() => onNavigate('configure')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Start New Interview</span>
        </button>
      </div>

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400">Interviews Completed</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {count}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Total Sessions</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400">Average Score</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {avgScore}<span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium">All Topics</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400">Recent Score</div>
          <div className="text-2xl font-bold font-mono text-indigo-300 mt-1 tabular-nums">
            {recentInterview ? recentInterview.score : '—'}
            <span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono font-medium">
            {improvementPct >= 0 ? `+${improvementPct}% velocity` : `${improvementPct}% velocity`}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400">Flagged Weaknesses</div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
            {weakMemories.length}
          </div>
          <div className="text-[11px] text-rose-400 mt-1 font-medium">Active Targets</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400">Mastered Concepts</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {strongAreas.length}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium">Verified in Memory</div>
        </div>
      </div>

      {/* Core Features Quick-Launch Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Feature Hub & Quick Actions
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Click any button below to jump directly into the feature
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-indigo-400 group-hover:text-indigo-300 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium border ${card.badgeStyle}`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => onNavigate(card.id)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${card.buttonStyle}`}
                  >
                    <span>{card.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score Progression & Competency Chart */}
      <ScoreProgressionChart interviews={interviews} />

      {/* Recent Session Archives */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-semibold text-slate-100">Recent Session Archives</h3>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-[11px] text-indigo-400 hover:underline font-medium"
          >
            View All Archives
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {completedInterviews.slice(0, 4).map((interview) => (
            <div
              key={interview.id}
              onClick={() => onSelectInterviewReview(interview.id)}
              className="p-3 rounded-lg bg-slate-950 border border-slate-800/90 hover:border-indigo-500/40 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                    Interview #{interview.interviewNumber}
                  </span>
                  <span className="text-[11px] text-slate-400">·</span>
                  <span className="text-xs text-slate-300">{interview.role}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  {interview.startedAt.split('T')[0]} · {interview.topics.join(', ')}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-base font-bold font-mono text-white tabular-nums">
                  {interview.score}<span className="text-xs text-slate-400">/100</span>
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
