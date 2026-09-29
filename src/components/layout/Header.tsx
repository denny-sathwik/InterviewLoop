import React from 'react';
import { Sparkles, PlayCircle, Brain, Lock } from 'lucide-react';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  memoryCount: number;
  persistentCount: number;
  hasCompletedInterview: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  memoryCount,
  persistentCount,
  hasCompletedInterview,
}) => {
  const getSectionTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'graph':
        return 'Skill Knowledge Graph';
      case 'configure':
        return 'Configure Interview';
      case 'active_interview':
        return 'Active Interview Session';
      case 'history':
        return 'Interview Archives';
      case 'weaknesses':
        return 'Weaknesses Hub';
      case 'progress':
        return 'Skill Memory Timeline';
      case 'memory':
        return 'Memory Inspector';
      case 'rectify':
        return 'Rectification Studio';
      case 'rerun':
        return 'Rerun Scenario Engine';
      case 'demo':
        return 'Demo Walkthrough';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/80 px-6 flex items-center justify-between shrink-0">
      {/* Zone 1: Section Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-bold text-slate-100 tracking-tight">
          {getSectionTitle()}
        </h1>
      </div>

      {/* Zone 2: Hindsight Memory Telemetry & Primary Actions */}
      <div className="flex items-center gap-3">
        {/* Memory Status */}
        {hasCompletedInterview && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/80 text-xs">
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-300 font-medium">Memory:</span>
            <span className="font-mono text-indigo-300 font-semibold">{memoryCount}</span>
            <span className="text-slate-400 text-[11px]">Recorded</span>
            {persistentCount > 0 && (
              <span className="ml-1 text-[11px] text-rose-400 font-medium">
                ({persistentCount} Weak)
              </span>
            )}
          </div>
        )}

        {/* Demo Mode Button */}
        <button
          onClick={() => onNavigate('demo')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/50 text-xs font-medium transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Demo Flow</span>
        </button>

        {/* Start Interview CTA */}
        {currentTab !== 'active_interview' && currentTab !== 'configure' && (
          <button
            onClick={() => onNavigate('configure')}
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>New Interview</span>
          </button>
        )}
      </div>
    </header>
  );
};
