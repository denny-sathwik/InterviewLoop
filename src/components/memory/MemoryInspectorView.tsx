import React, { useState } from 'react';
import { HindsightMemory } from '../../types/interview';
import {
  Brain,
  Search,
  Filter,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

interface MemoryInspectorViewProps {
  memories: HindsightMemory[];
  onResetSeed: () => void;
  onFixWeakness: (concept: string, topic: string) => void;
}

export const MemoryInspectorView: React.FC<MemoryInspectorViewProps> = ({
  memories,
  onResetSeed,
  onFixWeakness,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedMemory, setSelectedMemory] = useState<HindsightMemory | null>(null);

  const topics = Array.from(new Set(memories.map((m) => m.topic)));

  const filteredMemories = memories.filter((m) => {
    const matchesSearch =
      m.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subtopic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.observation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTopic = topicFilter === 'all' || m.topic.toLowerCase() === topicFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'weakness' && m.type.includes('weakness')) ||
      (typeFilter === 'strength' && (m.type.includes('strength') || m.status === 'Mastered')) ||
      (typeFilter === 'improving' && (m.status === 'Improving' || m.improvementEvidence));

    return matchesSearch && matchesTopic && matchesStatus && matchesType;
  });

  const exportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(memories, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `interviewloop_memories.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            What InterviewLoop Remembers
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Semantic memory records: observations, evidence, and pedagogical directives stored across sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportJSON}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={onResetSeed}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories by topic, concept, observation..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Topic Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Topic:</span>
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="Weak">Weak</option>
            <option value="Improving">Improving</option>
            <option value="Mastered">Mastered</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="weakness">Weaknesses</option>
            <option value="strength">Strengths</option>
            <option value="improving">Recently Improved</option>
          </select>
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemories.map((mem) => {
          const isWeak = mem.status === 'Weak';
          const isImproving = mem.status === 'Improving';
          const isMastered = mem.status === 'Mastered';

          return (
            <div
              key={mem.id}
              className={`p-5 rounded-xl bg-slate-900 border transition-all flex flex-col justify-between ${
                isWeak
                  ? 'border-rose-500/30 hover:border-rose-500/50'
                  : isImproving
                  ? 'border-amber-500/30 hover:border-amber-500/50'
                  : 'border-emerald-500/30 hover:border-emerald-500/50'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                      {mem.topic}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {mem.detectedInInterviews.join(', ')}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      isWeak
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        : isImproving
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {mem.status}
                  </span>
                </div>

                {/* Subtopic */}
                <h3 className="text-sm font-bold text-white mb-2">
                  {mem.subtopic}
                </h3>

                {/* Observation */}
                <div className="text-xs text-slate-300 leading-relaxed mb-3">
                  <span className="text-slate-400 font-semibold block mb-0.5">Observation:</span>
                  {mem.observation}
                </div>

                {/* Evidence */}
                <div className="text-xs text-slate-400 leading-relaxed p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 mb-3 font-mono">
                  <span className="text-slate-400 font-semibold block mb-0.5">Evidence:</span>
                  "{mem.evidence}"
                </div>

                {/* Directive */}
                <div className="text-xs text-indigo-200/90 leading-relaxed p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 mb-3">
                  <span className="text-indigo-400 font-semibold block mb-0.5">
                    Recommended Future Interviewer Directive:
                  </span>
                  {mem.recommendedFutureBehavior}
                </div>
              </div>

              {/* Footer Meta */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Occurrences: <strong className="text-slate-200">{mem.occurrences}</strong></span>
                  <span>·</span>
                  <span>Confidence: <strong className="text-slate-200">{mem.confidence}</strong></span>
                </div>

                {isWeak && (
                  <button
                    onClick={() => onFixWeakness(mem.subtopic, mem.topic)}
                    className="text-xs px-2.5 py-1 bg-rose-600/30 text-rose-200 hover:bg-rose-600/50 border border-rose-500/30 rounded font-medium transition-colors"
                  >
                    Fix Concept
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
