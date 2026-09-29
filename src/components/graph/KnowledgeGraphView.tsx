import React from 'react';
import { HindsightMemory } from '../../types/interview';
import { VisualKnowledgeGraph } from '../dashboard/VisualKnowledgeGraph';
import { ArrowLeft, PlayCircle } from 'lucide-react';

interface KnowledgeGraphViewProps {
  memories: HindsightMemory[];
  onFixWeakness: (concept: string, topic: string) => void;
  onRerunConcept: (concept: string, topic: string) => void;
  onStartNewInterview: () => void;
  onBackToDashboard: () => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  memories,
  onFixWeakness,
  onRerunConcept,
  onStartNewInterview,
  onBackToDashboard,
}) => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Skill Knowledge Graph
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive skill network showing detected relationships between strengths and weaknesses.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onBackToDashboard}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={onStartNewInterview}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>New Interview</span>
          </button>
        </div>
      </div>

      {/* Visual Knowledge Graph */}
      <VisualKnowledgeGraph
        memories={memories}
        onFixWeakness={onFixWeakness}
        onRerunConcept={onRerunConcept}
      />
    </div>
  );
};
