import React, { useState, useMemo } from 'react';
import { HindsightMemory, SkillRelationship } from '../../types/interview';
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ShieldAlert,
  GitBranch,
  Layers,
  Zap,
} from 'lucide-react';

interface VisualKnowledgeGraphProps {
  memories: HindsightMemory[];
  onFixWeakness: (concept: string, topic: string) => void;
  onRerunConcept: (concept: string, topic: string) => void;
}

interface GraphNode {
  id: string;
  topic: string;
  subtopic: string;
  type: string;
  status: 'Weak' | 'Improving' | 'Mastered';
  score: number;
  occurrences: number;
  evidence: string;
  observation: string;
  recommendedBehavior: string;
  interviews: string[];
  relationships: SkillRelationship[];
  x: number;
  y: number;
  radius: number;
}

interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: 'prerequisite' | 'tradeoff' | 'impacts' | 'contrast';
  label: string;
  description: string;
  sourceIsStrength: boolean;
  targetIsWeakness: boolean;
}

export const VisualKnowledgeGraph: React.FC<VisualKnowledgeGraphProps> = ({
  memories,
  onFixWeakness,
  onRerunConcept,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('mem-sql-indexing-01');
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFilter, setViewFilter] = useState<'all' | 'bridges' | 'weaknesses' | 'strengths'>('all');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Compute graph nodes and relational edges directly from HindsightMemory records
  const { nodes, edges } = useMemo(() => {
    // Canvas dimensions
    const width = 860;
    const height = 440;
    const centerX = width / 2;
    const centerY = height / 2;

    // Fixed harmonic coordinate anchors for key skill nodes
    const nodeCoords: Record<string, { x: number; y: number }> = {
      'mem-sql-indexing-01': { x: 230, y: 140 },
      'mem-api-auth-01': { x: 570, y: 130 },
      'mem-caching-redis-01': { x: 380, y: 310 },
      'mem-comm-structure-01': { x: 200, y: 320 },
      'mem-python-ds-01': { x: 670, y: 290 },
    };

    const computedNodes: GraphNode[] = memories.map((m, idx) => {
      const isStrength = m.type === 'technical_strength' || m.status === 'Mastered';
      const isImproving = m.status === 'Improving';
      const score = isStrength ? 94 : isImproving ? 76 : 52;

      // Position from lookup or radial distribute
      const defaultCoord = nodeCoords[m.id] || {
        x: centerX + Math.cos((idx * 2 * Math.PI) / (memories.length || 1)) * 220,
        y: centerY + Math.sin((idx * 2 * Math.PI) / (memories.length || 1)) * 140,
      };

      return {
        id: m.id,
        topic: m.topic,
        subtopic: m.subtopic,
        type: m.type,
        status: m.status,
        score,
        occurrences: m.occurrences || 1,
        evidence: m.evidence,
        observation: m.observation,
        recommendedBehavior: m.recommendedFutureBehavior,
        interviews: m.detectedInInterviews || [],
        relationships: m.relatedSkills || [],
        x: defaultCoord.x,
        y: defaultCoord.y,
        radius: isStrength ? 24 : m.status === 'Weak' ? 26 : 22,
      };
    });

    // Derive edges from detected relationships between strengths and weaknesses
    const computedEdges: GraphEdge[] = [];
    const edgeKeySet = new Set<string>();

    computedNodes.forEach((sourceNode) => {
      if (sourceNode.relationships && sourceNode.relationships.length > 0) {
        sourceNode.relationships.forEach((rel, rIdx) => {
          const targetNode = computedNodes.find((n) => n.id === rel.targetMemoryId);
          if (targetNode) {
            const edgeKey = [sourceNode.id, targetNode.id].sort().join('--');
            if (!edgeKeySet.has(edgeKey)) {
              edgeKeySet.add(edgeKey);

              const sourceIsStrength =
                sourceNode.type === 'technical_strength' || sourceNode.status === 'Mastered';
              const targetIsWeakness = targetNode.status === 'Weak';

              computedEdges.push({
                id: `edge-${sourceNode.id}-${targetNode.id}-${rIdx}`,
                sourceId: sourceNode.id,
                targetId: targetNode.id,
                relationshipType: rel.relationshipType,
                label: rel.label,
                description: rel.description,
                sourceIsStrength,
                targetIsWeakness,
              });
            }
          }
        });
      }
    });

    return { nodes: computedNodes, edges: computedEdges };
  }, [memories]);

  // Selected node and connected relationships
  const selectedNode =
    nodes.find((n) => n.id === selectedNodeId) ||
    nodes.find((n) => n.status === 'Weak') ||
    nodes[0];

  // Connected edges and neighbor IDs for highlight state
  const connectedEdgeMap = useMemo(() => {
    if (!selectedNode) return { edges: [], neighborIds: new Set<string>() };
    const connected = edges.filter(
      (e) => e.sourceId === selectedNode.id || e.targetId === selectedNode.id
    );
    const neighborIds = new Set<string>();
    connected.forEach((e) => {
      neighborIds.add(e.sourceId);
      neighborIds.add(e.targetId);
    });
    return { edges: connected, neighborIds };
  }, [selectedNode, edges]);

  // Node filtering
  const isNodeVisible = (node: GraphNode) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        node.subtopic.toLowerCase().includes(q) ||
        node.topic.toLowerCase().includes(q) ||
        node.observation.toLowerCase().includes(q)
      );
    }

    if (viewFilter === 'weaknesses') return node.status === 'Weak';
    if (viewFilter === 'strengths') return node.status === 'Mastered';
    if (viewFilter === 'bridges') {
      // Show nodes that participate in strength ↔ weakness edges
      return edges.some(
        (e) =>
          (e.sourceIsStrength && e.targetIsWeakness) ||
          (e.sourceId === node.id || e.targetId === node.id)
      );
    }
    return true;
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
      {/* Top Header & Interactive Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Skill Knowledge Graph & Detected Relationships
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive skill network showing detected relationships between strengths and weaknesses.
          </p>
        </div>

        {/* View Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skill nodes..."
              className="pl-8 pr-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-36 sm:w-44"
            />
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setViewFilter('all')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                viewFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Skills
            </button>
            <button
              onClick={() => setViewFilter('bridges')}
              className={`px-2 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
                viewFilter === 'bridges'
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/40'
                  : 'text-indigo-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Strength ↔ Weakness Bridges</span>
            </button>
            <button
              onClick={() => setViewFilter('weaknesses')}
              className={`px-2 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
                viewFilter === 'weaknesses'
                  ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                  : 'text-rose-400 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>Weaknesses</span>
            </button>
            <button
              onClick={() => setViewFilter('strengths')}
              className={`px-2 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
                viewFilter === 'strengths'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  : 'text-emerald-400 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Strengths</span>
            </button>
          </div>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 border-l border-slate-800 pl-2">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
              className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 hover:text-white"
              title="Reset Zoom"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: SVG Visual Graph Canvas (Left) + Interactive Skill Node Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SVG Graph Canvas Container (2 cols) */}
        <div className="lg:col-span-2 rounded-xl bg-slate-950 border border-slate-800/90 overflow-hidden relative min-h-[440px] flex items-center justify-center">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Graph Legend Overlay */}
          <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] backdrop-blur-sm">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span>Strength / Mastered</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50 animate-pulse" />
              <span>Weakness / Gap</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
              <span>Improving</span>
            </span>
          </div>

          {/* Active Hover Edge Callout */}
          {hoveredEdgeId && (
            <div className="absolute bottom-3 left-3 right-3 z-10 p-2.5 rounded-lg bg-slate-900/95 border border-indigo-500/40 text-xs shadow-lg backdrop-blur-sm animate-fadeIn">
              {(() => {
                const edge = edges.find((e) => e.id === hoveredEdgeId);
                if (!edge) return null;
                const source = nodes.find((n) => n.id === edge.sourceId);
                const target = nodes.find((n) => n.id === edge.targetId);
                return (
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-indigo-300">
                        {source?.subtopic} ↔ {target?.subtopic}:
                      </span>{' '}
                      <span className="text-slate-200 font-medium">{edge.label}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{edge.description}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono shrink-0">
                      {edge.relationshipType.toUpperCase()}
                    </span>
                  </div>
                );
              })()}
            </div>
          )}

          {/* SVG Canvas */}
          <svg
            viewBox="0 0 860 440"
            className="w-full h-full select-none"
            style={{
              maxHeight: '440px',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-out',
            }}
          >
            <defs>
              {/* Edge Gradients */}
              <linearGradient id="edge-impacts" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
              </linearGradient>

              <linearGradient id="edge-contrast" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.8" />
              </linearGradient>

              {/* Arrow Markers */}
              <marker
                id="arrow-impacts"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
              </marker>

              <marker
                id="arrow-contrast"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#818cf8" />
              </marker>
            </defs>

            {/* Render Relationship Edges */}
            {edges.map((edge) => {
              const source = nodes.find((n) => n.id === edge.sourceId);
              const target = nodes.find((n) => n.id === edge.targetId);
              if (!source || !target) return null;

              const isConnectedToSelected =
                selectedNode && (source.id === selectedNode.id || target.id === selectedNode.id);
              const isHovered = hoveredEdgeId === edge.id;

              // Edge styling based on strength-weakness relationship
              let stroke = 'rgba(71, 85, 105, 0.4)';
              let strokeWidth = 1.5;
              let dashArray: string | undefined = undefined;

              if (edge.relationshipType === 'contrast') {
                stroke = isConnectedToSelected ? 'url(#edge-contrast)' : 'rgba(16, 185, 129, 0.5)';
                strokeWidth = isConnectedToSelected ? 2.5 : 1.8;
                dashArray = '5,4';
              } else if (edge.relationshipType === 'impacts') {
                stroke = isConnectedToSelected ? 'url(#edge-impacts)' : 'rgba(244, 63, 94, 0.6)';
                strokeWidth = isConnectedToSelected ? 2.8 : 2;
              } else if (edge.relationshipType === 'tradeoff') {
                stroke = isConnectedToSelected ? '#818cf8' : 'rgba(99, 102, 241, 0.5)';
                strokeWidth = isConnectedToSelected ? 2.5 : 1.8;
              } else if (edge.relationshipType === 'prerequisite') {
                stroke = isConnectedToSelected ? '#f59e0b' : 'rgba(245, 158, 11, 0.5)';
                strokeWidth = isConnectedToSelected ? 2.5 : 1.8;
              }

              // Curved bezier path
              const midX = (source.x + target.x) / 2;
              const midY = (source.y + target.y) / 2 - 18;
              const pathD = `M ${source.x} ${source.y} Q ${midX} ${midY} ${target.x} ${target.y}`;

              return (
                <g
                  key={edge.id}
                  onMouseEnter={() => setHoveredEdgeId(edge.id)}
                  onMouseLeave={() => setHoveredEdgeId(null)}
                  className="cursor-pointer"
                >
                  {/* Invisible thicker stroke for easy hover */}
                  <path d={pathD} fill="none" stroke="transparent" strokeWidth={14} />

                  {/* Rendered Edge Path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isHovered ? '#c7d2fe' : stroke}
                    strokeWidth={isHovered ? strokeWidth + 1.5 : strokeWidth}
                    strokeDasharray={dashArray}
                    opacity={isConnectedToSelected || isHovered ? 1 : 0.4}
                  />

                  {/* Edge Label Badge */}
                  <g
                    transform={`translate(${midX}, ${midY})`}
                    className="select-none pointer-events-none"
                  >
                    <rect
                      x={-(edge.label.length * 3.2)}
                      y={-9}
                      width={edge.label.length * 6.4}
                      height={16}
                      rx={4}
                      fill="#0f172a"
                      stroke={isConnectedToSelected || isHovered ? '#6366f1' : '#334155'}
                      strokeWidth={1}
                      opacity={isConnectedToSelected || isHovered ? 0.95 : 0.6}
                    />
                    <text
                      x={0}
                      y={2}
                      textAnchor="middle"
                      fill={isConnectedToSelected || isHovered ? '#e0e7ff' : '#94a3b8'}
                      fontSize="9px"
                      fontFamily="monospace"
                      fontWeight="500"
                    >
                      {edge.label}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Render Skill Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isNeighbor = connectedEdgeMap.neighborIds.has(node.id);
              const isVisible = isNodeVisible(node);
              const isDimmed = !isVisible || (!isSelected && !isNeighbor && selectedNode !== null);

              const isStrength = node.type === 'technical_strength' || node.status === 'Mastered';
              const isWeak = node.status === 'Weak';
              const isImproving = node.status === 'Improving';

              // Visual styling
              let fill = '#0f172a';
              let stroke = '#475569';
              let textPill = '#cbd5e1';

              if (isStrength) {
                fill = '#064e3b';
                stroke = '#10b981';
                textPill = '#a7f3d0';
              } else if (isWeak) {
                fill = '#4c0519';
                stroke = '#f43f5e';
                textPill = '#fecdd3';
              } else if (isImproving) {
                fill = '#451a03';
                stroke = '#f59e0b';
                textPill = '#fde68a';
              }

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="cursor-pointer transition-all duration-300"
                  style={{ opacity: isDimmed ? 0.2 : 1 }}
                >
                  {/* Outer selection ring */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.radius + 8}
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth={2}
                      strokeDasharray="4,4"
                      className="animate-spin"
                      style={{
                        transformOrigin: `${node.x}px ${node.y}px`,
                        animationDuration: '10s',
                      }}
                    />
                  )}

                  {/* Pulsing ring for persistent weak nodes */}
                  {isWeak && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.radius + 4}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth={1.5}
                      opacity={0.6}
                      className="animate-pulse"
                    />
                  )}

                  {/* Main Circle Body */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isSelected ? 3 : 2}
                    className="shadow-xl"
                  />

                  {/* Inner Score / Icon */}
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fill={textPill}
                    fontSize="11px"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {isStrength ? '✓ 94%' : isWeak ? '⚠ 52%' : '76%'}
                  </text>

                  {/* Topic badge above node */}
                  <rect
                    x={node.x - 22}
                    y={node.y - node.radius - 17}
                    width={44}
                    height={14}
                    rx={3}
                    fill="#020617"
                    stroke={stroke}
                    strokeWidth={1}
                  />
                  <text
                    x={node.x}
                    y={node.y - node.radius - 7}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="8px"
                    fontWeight="600"
                    fontFamily="monospace"
                  >
                    {node.topic.toUpperCase()}
                  </text>

                  {/* Concept label below node */}
                  <text
                    x={node.x}
                    y={node.y + node.radius + 14}
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : '#94a3b8'}
                    fontSize="11px"
                    fontWeight={isSelected ? 'bold' : '500'}
                  >
                    {node.subtopic.length > 24
                      ? `${node.subtopic.slice(0, 22)}…`
                      : node.subtopic}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Interactive Skill Node Inspector (1 col) */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
          {selectedNode ? (
            <div className="space-y-3.5">
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
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
                  {selectedNode.status === 'Mastered'
                    ? 'Verified Strength'
                    : selectedNode.status === 'Weak'
                    ? 'Flagged Weakness'
                    : 'Improving Retention'}
                </span>
              </div>

              {/* Title & Mastery Gauge */}
              <div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {selectedNode.subtopic}
                </h3>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-slate-400">Mastery Level:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {selectedNode.score}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full mt-1 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectedNode.status === 'Mastered'
                        ? 'bg-emerald-500'
                        : selectedNode.status === 'Improving'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${selectedNode.score}%` }}
                  />
                </div>
              </div>

              {/* Detected Relationships with Other Skills */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                  Detected Skill Relationships:
                </span>

                {selectedNode.relationships && selectedNode.relationships.length > 0 ? (
                  <div className="space-y-2">
                    {selectedNode.relationships.map((rel, rIdx) => {
                      const targetNode = nodes.find((n) => n.id === rel.targetMemoryId);
                      const isTargetStrength =
                        targetNode?.type === 'technical_strength' ||
                        targetNode?.status === 'Mastered';

                      return (
                        <div
                          key={rIdx}
                          onClick={() => targetNode && setSelectedNodeId(targetNode.id)}
                          className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all text-xs space-y-1 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-indigo-300 group-hover:underline">
                              {rel.targetConcept}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                isTargetStrength
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}
                            >
                              {isTargetStrength ? 'Strength' : 'Weakness'}
                            </span>
                          </div>
                          <div className="text-[11px] text-amber-300/90 font-medium">
                            Relationship: {rel.label}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {rel.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 italic">
                    Independent skill node with no direct cross-dependencies.
                  </div>
                )}
              </div>

              {/* Diagnostic Observation & Evidence */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 leading-relaxed">
                  <span className="text-slate-400 font-semibold block mb-0.5">
                    Diagnostic Observation:
                  </span>
                  {selectedNode.observation}
                </div>

                {selectedNode.evidence && (
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-slate-400 font-mono text-[11px] leading-relaxed">
                    <span className="text-slate-400 font-semibold block mb-0.5">
                      Session Evidence:
                    </span>
                    "{selectedNode.evidence}"
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              Click any skill node on the canvas to inspect its relationships.
            </div>
          )}

          {/* Action Trigger */}
          {selectedNode && (
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              {selectedNode.status === 'Weak' && (
                <button
                  onClick={() => onFixWeakness(selectedNode.subtopic, selectedNode.topic)}
                  className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Fix Weakness (Rectify Mode)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => onRerunConcept(selectedNode.subtopic, selectedNode.topic)}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Rerun Scenario on This Skill</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
