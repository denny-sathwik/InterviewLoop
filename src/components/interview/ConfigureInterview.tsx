import React, { useState, useEffect } from 'react';
import {
  RoleType,
  ExperienceLevel,
  InterviewType,
  DifficultyLevel,
  HindsightMemory,
  InterviewStrategy,
} from '../../types/interview';
import { fetchInterviewStrategy } from '../../services/api';
import { hindsightService } from '../../services/hindsightMemory';
import {
  Brain,
  Sparkles,
  PlayCircle,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Settings2,
  Layers,
} from 'lucide-react';

interface ConfigureInterviewProps {
  memories: HindsightMemory[];
  onStartInterview: (config: {
    role: RoleType;
    experienceLevel: ExperienceLevel;
    type: InterviewType;
    difficulty: DifficultyLevel;
    topics: string[];
    questionCount: number;
    strategy: InterviewStrategy;
  }) => void;
}

export const ConfigureInterview: React.FC<ConfigureInterviewProps> = ({
  memories,
  onStartInterview,
}) => {
  const [role, setRole] = useState<RoleType>('Software Engineer');
  const [customRole, setCustomRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Junior');
  const [type, setType] = useState<InterviewType>('Technical');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Adaptive');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['SQL', 'APIs', 'Databases']);
  const [customTopic, setCustomTopic] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(3); // 3 for quick interactive demo
  const [strategy, setStrategy] = useState<InterviewStrategy | null>(null);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);

  const availableRoles = [
    'Software Engineer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Analyst',
    'Data Engineer',
    'AI/ML Engineer',
  ];

  const availableTopics = [
    'Python',
    'SQL',
    'DSA',
    'JavaScript',
    'React',
    'APIs',
    'Databases',
    'Machine Learning',
    'AI/LLMs',
  ];

  const handleToggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length > 1) {
        setSelectedTopics(selectedTopics.filter((t) => t !== topic));
      }
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleAddCustomTopic = () => {
    if (customTopic.trim() && !selectedTopics.includes(customTopic.trim())) {
      setSelectedTopics([...selectedTopics, customTopic.trim()]);
      setCustomTopic('');
    }
  };

  // Generate memory-aware strategy preview using hindsightService algorithms
  useEffect(() => {
    const effectiveRole = role === 'Custom' ? customRole || 'Software Engineer' : role;
    const synthesized = hindsightService.synthesizeInterviewStrategy(
      effectiveRole,
      selectedTopics,
      difficulty
    );
    setStrategy(synthesized);
    setIsGeneratingStrategy(false);
  }, [role, customRole, experienceLevel, type, difficulty, selectedTopics, memories]);

  const handleStart = () => {
    const effectiveRole = role === 'Custom' ? customRole || 'Software Engineer' : role;
    onStartInterview({
      role: effectiveRole,
      experienceLevel,
      type,
      difficulty,
      topics: selectedTopics,
      questionCount,
      strategy: strategy || {
        strategySummary: 'Adaptive memory evaluation.',
        retrievedMemoriesCount: memories.length,
        persistentWeaknessesIdentified: [],
        recentlyImprovedAreas: [],
        untestedAreas: [],
        questionPlan: [],
      },
    });
  };

  // Find relevant memories for selected topics
  const relevantWeaknesses = memories.filter(
    (m) =>
      selectedTopics.some((t) => t.toLowerCase() === m.topic.toLowerCase()) &&
      m.status === 'Weak'
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Configure Interview Session
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Select role, topics, and question depth. Adaptive memory shapes questions to target past weak concepts with practical scenarios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Role */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <label className="text-xs font-semibold text-slate-200 block">
              Target Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableRoles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-2.5 rounded-lg text-xs font-medium text-left transition-all border ${
                    role === r
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500 shadow-sm'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setRole('Custom')}
                className={`p-2.5 rounded-lg text-xs font-medium text-left transition-all border ${
                  role === 'Custom'
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                + Custom Role
              </button>
            </div>

            {role === 'Custom' && (
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Enter custom role title (e.g. Distributed Systems Engineer)"
                className="w-full mt-2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>

          {/* Experience Level & Interview Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-200 block">
                Experience Level
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Fresher', 'Junior', 'Mid-level'] as ExperienceLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`py-2 px-2 text-xs font-medium rounded-lg text-center border transition-all ${
                      experienceLevel === lvl
                        ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-200 block">
                Interview Type
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Technical', 'HR', 'Behavioral', 'Mixed'] as InterviewType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2 px-1 text-xs font-medium rounded-lg text-center border transition-all ${
                      type === t
                        ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topics Selection */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 block">
                Interview Topics (Select 1 or more)
              </label>
              <span className="text-[11px] text-slate-400">
                {selectedTopics.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableTopics.map((top) => {
                const isSelected = selectedTopics.includes(top);
                const hasMemoryWeakness = memories.some(
                  (m) => m.topic.toLowerCase() === top.toLowerCase() && m.status === 'Weak'
                );

                return (
                  <button
                    key={top}
                    type="button"
                    onClick={() => handleToggleTopic(top)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{top}</span>
                    {hasMemoryWeakness && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" title="Previous weakness recorded" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Topic Input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTopic()}
                placeholder="Add custom topic (e.g. Microservices, GraphQL)"
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddCustomTopic}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Question Count & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-200 block">
                Question Length
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[3, 5, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`py-2 text-xs font-medium rounded-lg text-center border transition-all ${
                      questionCount === cnt
                        ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {cnt === 3 ? '3 (Demo)' : `${cnt} Qs`}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-200 block">
                Difficulty Progression
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Easy', 'Medium', 'Hard', 'Adaptive'] as DifficultyLevel[]).map((dif) => (
                  <button
                    key={dif}
                    type="button"
                    onClick={() => setDifficulty(dif)}
                    className={`py-2 text-xs font-medium rounded-lg text-center border transition-all ${
                      difficulty === dif
                        ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {dif}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Real-time Memory Strategy Preview (1 col) */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Adaptive Strategy Preview
              </h3>
            </div>

            <p className="text-xs text-indigo-200/80 leading-relaxed">
              How the AI interviewer will adjust this session based on memories retrieved from Candidate Alex Chen:
            </p>

            {/* Persistent Weaknesses Highlight */}
            {relevantWeaknesses.length > 0 ? (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Persistent Weakness Triggered</span>
                </div>
                {relevantWeaknesses.map((w) => (
                  <div key={w.id} className="text-xs text-rose-200/90 pl-5">
                    <span className="font-semibold">{w.subtopic}</span>: Detected in{' '}
                    {w.detectedInInterviews.join(', ')}.
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Strategy: Will test via practical troubleshooting scenario rather than asking for definitions.
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No severe persistent weaknesses in chosen topics. Standard difficulty progression active.</span>
              </div>
            )}

            {/* Generated Strategy Plan */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Target Question Roadmap
              </div>

              {strategy?.questionPlan && strategy.questionPlan.length > 0 ? (
                <div className="space-y-2">
                  {strategy.questionPlan.slice(0, questionCount).map((plan, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-200">
                        <span>Q{i + 1}: {plan.topic}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                          {plan.questionStyle}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {plan.reason}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic py-2">
                  {isGeneratingStrategy ? 'Synthesizing strategy plan...' : 'Selecting question progression...'}
                </div>
              )}
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <PlayCircle className="w-5 h-5 group-hover:scale-105 transition-transform" />
              <span>Start Interview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
