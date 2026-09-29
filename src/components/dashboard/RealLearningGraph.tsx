import React, { useState, useMemo } from 'react';
import { HindsightMemory, Interview, SkillTimeline } from '../../types/interview';
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  RotateCcw,
  Zap,
  ArrowRight,
  Sparkles,
  Info,
  Maximize2,
} from 'lucide-react';

interface RealLearningGraphProps {
  memories: HindsightMemory[];
  interviews: Interview[];
  timelines: SkillTimeline[];
  onFixWeakness: (concept: string, topic: string) => void;
  onRerunConcept: (concept: string, topic: string) => void;
}

interface GraphNode {
  id: string;
  label: string;
  topic: string;
  status: 'Weak' | 'Improving' | 'Mastered';
  score: number;
  occurrences: number;
  interviews: string[];
  evidence?: string;
  observation?: string;
  x: number;
  y: number;
  radius: number;
  isHub?: boolean;
}

interface GraphEdge {
  from: string;
  to: string;
  color?: string;
}

export const RealLearningGraph: React.FC<RealLearningGraphProps> = ({
  memories,
  interviews,
  timelines,
  onFixWeakness,
  onRerunConcept,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-sql-indexing');
  const [activeFilter, setActiveFilter] = useState<'all' | 'Weak' | 'Improving' | 'Mastered'>('all');

  // Compute Nodes and Edges dynamically from real user data
  const { nodes, edges, topicAverages } = useMemo(() => {
    // 1. Calculate topic averages from real interview questions
    const topicScores: Record<string, { total: number; count: number }> = {};
    interviews.forEach((i) => {
      i.questions.forEach((q) => {
        if (!topicScores[q.topic]) {
          topicScores[q.topic] = { total: 0, count: 0 };
        }
        topicScores[q.topic].total += q.score;
        topicScores[q.topic].count += 1;
      });
    });

    const topicAvgs: Record<string, number> = {};
    Object.keys(topicScores).forEach((top) => {
      topicAvgs[top] = Math.round(topicScores[top].total / topicScores[top].count);
    });

    // 2. Hub coordinates (centered layout for 800x420 canvas)
    const hubs: Record<string, { x: number; y: number }> = {
      SQL: { x: 190, y: 150 },
      Databases: { x: 380, y: 270 },
      APIs: { x: 610, y: 140 },
      Python: { x: 400, y: 90 },
      Communication: { x: 600, y: 290 },
    };

    const generatedNodes: GraphNode[] = [];
    const generatedEdges: GraphEdge[] = [];

    // Hub Nodes for each topic
    Object.keys(hubs).forEach((topic) => {
      const avg = topicAvgs[topic] || 75;
      const hubStatus: 'Weak' | 'Improving' | 'Mastered' =
        avg < 60 ? 'Weak' : avg < 85 ? 'Improving' : 'Mastered';

      generatedNodes.push({
        id: `hub-${topic.toLowerCase()}`,
        label: topic,
        topic: topic,
        status: hubStatus,
        score: avg,
        occurrences: 0,
        interviews: [],
        x: hubs[topic].x,
        y: hubs[topic].y,
        radius: 26,
        isHub: true,
      });
    });

    // Cross-topic relationships
    generatedEdges.push(
      { from: 'hub-sql', to: 'hub-databases' },
      { from: 'hub-databases', to: 'hub-apis' },
      { from: 'hub-python', to: 'hub-apis' }
    );

    // Concept Nodes derived from user's memories
    memories.forEach((m, idx) => {
      const hub = hubs[m.topic] || { x: 400, y: 200 };
      // Angle offset for radial spread around topic hub
      const angle = (idx * (Math.PI * 0.75)) % (2 * Math.PI);
      const dist = 75 + (idx % 2) * 20;

      let x = hub.x + Math.cos(angle) * dist;
      let y = hub.y + Math.sin(angle) * dist;

      // Boundary clamp
      x = Math.max(70, Math.min(730, x));
      y = Math.max(50, Math.min(370, y));

      const nodeId = m.id || `node-${idx}`;
      const score = m.status === 'Mastered' ? 95 : m.status === 'Improving' ? 76 : 50;

      generatedNodes.push({
        id: nodeId,
        label: m.subtopic,
        topic: m.topic,
        status: m.status,
        score: score,
        occurrences: m.occurrences,
        interviews: m.detectedInInterviews,
        evidence: m.evidence,
        observation: m.observation,
        x,
        y,
        radius: m.status === 'Weak' ? 20 : 17,
        isHub: false,
      });

      // Connect concept to topic hub
      const hubId = `hub-${m.topic.toLowerCase()}`;
      generatedEdges.push({
        from: hubId,
        to: nodeId,
        color:
          m.status === 'Weak'
            ? 'rgba(244, 63, 94, 0.4)'
            : m.status === 'Improving'
            ? 'rgba(245, 158, 11, 0.4)'
            : 'rgba(16, 185, 129, 0.3)',
      });
    });

    return {
      nodes: generatedNodes,
      edges: generatedEdges,
      topicAverages: topicAvgs,
    };
  }, [memories, interviews]);

  // Selected node details
  const selectedNode =
    nodes.find((n) => n.id === selectedNodeId) ||
    nodes.find((n) => n.status === 'Weak') ||
    nodes[0];

  const filteredNodes = nodes.filter(
    (n) => activeFilter === 'all' || n.status === activeFilter
  );

  return (
    <div className="space-y-4">
      {/* Graph Control & Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>Knowledge Graph & Retention Matrix</span>
            <span className="text-[11px] text-slate-400 font-normal">
              (Live user concept topology)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Nodes represent evaluated concepts connected by system dependencies. Click any node to inspect memory details.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({nodes.filter((n) => !n.isHub).length})
          </button>
          <button
            onClick={() => setActiveFilter('Weak')}
            className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
              activeFilter === 'Weak'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                : 'text-rose-400 hover:bg-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Weak ({nodes.filter((n) => !n.isHub && n.status === 'Weak').length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('Improving')}
            className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
              activeFilter === 'Improving'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                : 'text-amber-400 hover:bg-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Improving ({nodes.filter((n) => !n.isHub && n.status === 'Improving').length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('Mastered')}
            className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
              activeFilter === 'Mastered'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                : 'text-emerald-400 hover:bg-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Mastered ({nodes.filter((n) => !n.isHub && n.status === 'Mastered').length})</span>
          </button>
        </div>
      </div>

      {/* Main Graph Grid: Interactive SVG Canvas (Left) + Concept Diagnostic Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SVG Learning Graph Canvas (2 cols) */}
        <div className="lg:col-span-2 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden relative min-h-[380px] flex items-center justify-center p-2">
          {/* Subtle network background grid */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <svg
            viewBox="0 0 800 420"
            className="w-full h-full select-none"
            style={{ maxHeight: '420px' }}
          >
            {/* Connecting Edges */}
            {edges.map((edge, idx) => {
              const source = nodes.find((n) => n.id === edge.from);
              const target = nodes.find((n) => n.id === edge.to);
              if (!source || !target) return null;

              const isEdgeHighlighted =
                selectedNode && (source.id === selectedNode.id || target.id === selectedNode.id);

              return (
                <line
                  key={`edge-${idx}`}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={
                    isEdgeHighlighted
                      ? '#818cf8'
                      : edge.color || 'rgba(51, 65, 85, 0.4)'
                  }
                  strokeWidth={isEdgeHighlighted ? 2 : 1.2}
                  strokeDasharray={source.isHub && target.isHub ? '4,4' : undefined}
                />
              );
            })}

            {/* Render Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isDimmed = activeFilter !== 'all' && node.status !== activeFilter && !node.isHub;

              // Color mappings
              let fill = '#0f172a';
              let stroke = '#475569';
              let textColor = '#e2e8f0';

              if (node.isHub) {
                fill = '#1e1b4b';
                stroke = '#6366f1';
                textColor = '#c7d2fe';
              } else if (node.status === 'Weak') {
                fill = '#4c0519';
                stroke = '#f43f5e';
                textColor = '#fecdd3';
              } else if (node.status === 'Improving') {
                fill = '#451a03';
                stroke = '#f59e0b';
                textColor = '#fde68a';
              } else if (node.status === 'Mastered') {
                fill = '#064e3b';
                stroke = '#10b981';
                textColor = '#a7f3d0';
              }

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="cursor-pointer transition-transform duration-200"
                  style={{ opacity: isDimmed ? 0.25 : 1 }}
                >
                  {/* Outer selection ring */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.radius + 6}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth={1.5}
                      strokeDasharray="3,3"
                      className="animate-spin"
                      style={{ transformOrigin: `${node.x}px ${node.y}px`, animationDuration: '8s' }}
                    />
                  )}

                  {/* Pulsing glow for weak nodes */}
                  {node.status === 'Weak' && !node.isHub && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.radius + 3}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth={1}
                      opacity={0.6}
                    />
                  )}

                  {/* Main Node Body */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />

                  {/* Inner score percentage or Hub Indicator */}
                  <text
                    x={node.x}
                    y={node.isHub ? node.y + 4 : node.y + 3}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize={node.isHub ? '11px' : '9px'}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.isHub ? node.label.slice(0, 3).toUpperCase() : `${node.score}%`}
                  </text>

                  {/* Label underneath node */}
                  <text
                    x={node.x}
                    y={node.y + node.radius + 12}
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : '#94a3b8'}
                    fontSize="10px"
                    fontWeight={isSelected ? '600' : '400'}
                  >
                    {node.label.length > 20 ? `${node.label.slice(0, 18)}…` : node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Canvas corner hints */}
          <div className="absolute bottom-2.5 left-3 text-[10px] text-slate-500 font-mono">
            Interactive: Click nodes to inspect memory & test history
          </div>
        </div>

        {/* Concept Diagnostic Drawer / Card (1 col) */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          {selectedNode ? (
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                  {selectedNode.topic}
                </span>

                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    selectedNode.status === 'Weak'
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      : selectedNode.status === 'Improving'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {selectedNode.status}
                </span>
              </div>

              {/* Title & Score */}
              <div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {selectedNode.label}
                </h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-slate-100 tabular-nums">
                    {selectedNode.score}%
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Concept Mastery</span>
                </div>
              </div>

              {/* Observation & Evidence if available */}
              {selectedNode.observation && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 leading-relaxed">
                    <span className="text-slate-400 font-semibold block mb-0.5">Diagnostic Observation:</span>
                    {selectedNode.observation}
                  </div>

                  {selectedNode.evidence && (
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-slate-400 font-mono text-[11px] leading-relaxed">
                      <span className="text-slate-400 font-semibold block mb-0.5">Evidence Recorded:</span>
                      "{selectedNode.evidence}"
                    </div>
                  )}

                  {selectedNode.interviews && selectedNode.interviews.length > 0 && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span>Tested in:</span>
                      <span className="font-mono text-indigo-300">
                        {selectedNode.interviews.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">Select a node to inspect details.</div>
          )}

          {/* Action Trigger */}
          {selectedNode && !selectedNode.isHub && (
            <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
              {selectedNode.status === 'Weak' && (
                <button
                  onClick={() => onFixWeakness(selectedNode.label, selectedNode.topic)}
                  className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Fix Weakness (Rectify Mode)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => onRerunConcept(selectedNode.label, selectedNode.topic)}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Rerun Scenario on This Concept</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
