import React from 'react';
import { Interview } from '../../types/interview';
import { TrendingUp, Award, Calendar } from 'lucide-react';

interface ScoreProgressionChartProps {
  interviews: Interview[];
}

export const ScoreProgressionChart: React.FC<ScoreProgressionChartProps> = ({ interviews }) => {
  // Sort chronologically
  const sorted = [...interviews].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  );

  // Compute topic breakdown averages from real questions
  const topicStats: Record<string, { total: number; count: number }> = {};
  sorted.forEach((i) => {
    i.questions.forEach((q) => {
      if (!topicStats[q.topic]) topicStats[q.topic] = { total: 0, count: 0 };
      topicStats[q.topic].total += q.score;
      topicStats[q.topic].count += 1;
    });
  });

  const topicsList = Object.keys(topicStats).map((top) => ({
    name: top,
    avg: Math.round(topicStats[top].total / topicStats[top].count),
  }));

  // SVG Chart dimensions for score line
  const width = 480;
  const height = 160;
  const padding = 28;

  // Points calculation
  const points = sorted.map((inv, idx) => {
    const x =
      sorted.length === 1
        ? width / 2
        : padding + (idx / (sorted.length - 1)) * (width - 2 * padding);
    const y = height - padding - (inv.score / 100) * (height - 2 * padding);
    return { x, y, score: inv.score, label: `Int #${inv.interviewNumber}` };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Real Score History Over Time */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-semibold text-slate-100">Score Progression Curve</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {sorted.length} Sessions Logged
          </span>
        </div>

        {points.length > 0 ? (
          <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36">
              {/* Horizontal grid guide lines */}
              {[25, 50, 75, 100].map((level) => {
                const y = height - padding - (level / 100) * (height - 2 * padding);
                return (
                  <g key={level}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={width - padding}
                      y2={y}
                      stroke="rgba(51, 65, 85, 0.4)"
                      strokeDasharray="2,3"
                    />
                    <text
                      x={padding - 6}
                      y={y + 3}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="9px"
                      fontFamily="monospace"
                    >
                      {level}
                    </text>
                  </g>
                );
              })}

              {/* Area gradient under path */}
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {points.length > 1 && (
                <path
                  d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
                  fill="url(#scoreGrad)"
                />
              )}

              {/* Line path */}
              <path
                d={pathD}
                fill="none"
                stroke="#818cf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {points.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={5}
                    fill="#1e1b4b"
                    stroke="#818cf8"
                    strokeWidth={2}
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 8}
                    textAnchor="middle"
                    fill="#e0e7ff"
                    fontSize="10px"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {pt.score}%
                  </text>
                  <text
                    x={pt.x}
                    y={height - 8}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9px"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">No session data logged yet.</div>
        )}
      </div>

      {/* Real Topic Competency Bars */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-slate-100">Topic Competency Breakdown</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Weighted Performance
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {topicsList.map((t) => {
            const isHigh = t.avg >= 80;
            const isMed = t.avg >= 60 && t.avg < 80;

            return (
              <div key={t.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-200">{t.name}</span>
                  <span className="font-mono text-slate-300 font-semibold tabular-nums">
                    {t.avg}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isHigh
                        ? 'bg-emerald-500'
                        : isMed
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${t.avg}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
