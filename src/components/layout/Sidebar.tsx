import React from 'react';
import {
  LayoutDashboard,
  GitBranch,
  PlayCircle,
  History,
  AlertTriangle,
  Lightbulb,
  Zap,
  TrendingUp,
  Brain,
  Sparkles,
  RotateCcw,
  PlusCircle,
  Lock,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'graph'
  | 'configure'
  | 'active_interview'
  | 'history'
  | 'weaknesses'
  | 'rectify'
  | 'rerun'
  | 'progress'
  | 'memory'
  | 'demo';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  memoryCount: number;
  persistentWeaknessCount: number;
  hasCompletedInterview: boolean;
  onResetSeed: () => void;
  onResetToFresh?: () => void;
  onLoadDemoSeed?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  memoryCount,
  persistentWeaknessCount,
  hasCompletedInterview,
  onResetSeed,
  onResetToFresh,
  onLoadDemoSeed,
}) => {
  const allNavItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      requiresInterview: false,
    },
    {
      id: 'configure' as NavTab,
      label: 'Start Interview',
      icon: PlayCircle,
      requiresInterview: false,
    },
    {
      id: 'graph' as NavTab,
      label: 'Knowledge Graph',
      icon: GitBranch,
      requiresInterview: true,
    },
    {
      id: 'weaknesses' as NavTab,
      label: 'Weaknesses Hub',
      icon: AlertTriangle,
      count: persistentWeaknessCount,
      countColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      requiresInterview: true,
    },
    {
      id: 'rectify' as NavTab,
      label: 'Rectification Studio',
      icon: Lightbulb,
      requiresInterview: true,
    },
    {
      id: 'rerun' as NavTab,
      label: 'Rerun Scenario Engine',
      icon: Zap,
      requiresInterview: true,
    },
    {
      id: 'progress' as NavTab,
      label: 'Skill Memory Timeline',
      icon: TrendingUp,
      requiresInterview: true,
    },
    {
      id: 'memory' as NavTab,
      label: 'Memory Inspector',
      icon: Brain,
      count: memoryCount,
      countColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      requiresInterview: true,
    },
    {
      id: 'history' as NavTab,
      label: 'Interview Archives',
      icon: History,
      requiresInterview: true,
    },
    {
      id: 'demo' as NavTab,
      label: 'Demo Walkthrough',
      icon: Sparkles,
      highlight: true,
      requiresInterview: false,
    },
  ];

  // Hide evaluation & post-interview features until at least 1 interview is done
  const visibleNavItems = allNavItems.filter((item) =>
    hasCompletedInterview ? true : !item.requiresInterview
  );

  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
            <RotateCcw className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-100 tracking-tight block">InterviewLoop</span>
            <span className="text-[10px] text-indigo-400 font-mono">Adaptive Memory</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Onboarding Notice when 0 interviews done */}
        {!hasCompletedInterview && (
          <div className="mb-2 p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-200">
            <span className="font-semibold block text-white">First Session Setup</span>
            Complete 1 interview to unlock Knowledge Graph, Weaknesses Hub & Rectification.
          </div>
        )}

        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                item.highlight
                  ? isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/40'
                  : isActive
                  ? 'bg-slate-800 text-white font-semibold border-l-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    item.highlight
                      ? 'text-indigo-400'
                      : isActive
                      ? 'text-indigo-400'
                      : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium border ${item.countColor}`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-800 space-y-1.5">
        {!hasCompletedInterview ? (
          onLoadDemoSeed && (
            <button
              onClick={onLoadDemoSeed}
              className="w-full text-[11px] text-indigo-300 hover:text-white py-1.5 px-2 rounded bg-indigo-950/50 border border-indigo-500/30 hover:bg-indigo-900/60 flex items-center justify-center gap-1.5 font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Load Sample Data</span>
            </button>
          )
        ) : (
          <div className="space-y-1">
            <button
              onClick={onResetSeed}
              className="w-full text-[11px] text-slate-400 hover:text-indigo-300 py-1 px-2 rounded hover:bg-slate-800/60 flex items-center justify-center gap-1.5 font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Sample Data</span>
            </button>

            {onResetToFresh && (
              <button
                onClick={onResetToFresh}
                className="w-full text-[10px] text-slate-500 hover:text-rose-400 py-1 px-2 rounded hover:bg-slate-800/40 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Reset to Fresh (0 Interviews)</span>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
