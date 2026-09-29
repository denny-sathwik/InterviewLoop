import {
  DifficultyLevel,
  ExperienceLevel,
  HindsightMemory,
  InterviewType,
  QuestionResult,
  RoleType,
  InterviewStrategy,
  RectifyEvaluationResult,
} from '../types/interview';

export async function fetchInterviewStrategy(params: {
  role: RoleType;
  experienceLevel: ExperienceLevel;
  type: InterviewType;
  difficulty: DifficultyLevel;
  topics: string[];
  hindsightMemories: HindsightMemory[];
}): Promise<InterviewStrategy> {
  const res = await fetch('/api/interview/strategy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error('Failed to generate interview strategy');
  }
  return res.json();
}

export async function fetchNextQuestion(params: {
  role: RoleType;
  experienceLevel: ExperienceLevel;
  type: InterviewType;
  difficulty: DifficultyLevel;
  topics: string[];
  questionNumber: number;
  totalQuestions: number;
  previousExchanges: { question: string; answer: string; score?: number }[];
  hindsightMemories: HindsightMemory[];
  lastAnswerEvaluation?: any;
}): Promise<{
  questionNumber: number;
  question: string;
  topic: string;
  difficulty: DifficultyLevel;
  rationale?: string;
  targetedWeakness?: string;
  targetedMemoryId?: string;
  expectedKeyPoints?: string[];
}> {
  const res = await fetch('/api/interview/generate-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error('Failed to generate interview question');
  }
  return res.json();
}

export async function evaluateAnswer(params: {
  question: string;
  answer: string;
  topic: string;
  difficulty: DifficultyLevel;
  role: RoleType;
  targetedWeakness?: string;
}): Promise<{
  correctness: 'correct' | 'partially_correct' | 'incorrect';
  score: number;
  feedback: string;
  detectedWeaknesses: string[];
  detectedStrengths: string[];
  shouldProbe: boolean;
  probeQuestion?: string;
}> {
  const res = await fetch('/api/interview/evaluate-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error('Failed to evaluate answer');
  }
  return res.json();
}

export async function reviewAndExtractMemory(params: {
  interviewNumber: number;
  role: RoleType;
  experienceLevel: ExperienceLevel;
  topics: string[];
  questionsWithAnswers: QuestionResult[];
  previousMemories: HindsightMemory[];
}): Promise<{
  score: number;
  scoresBreakdown: {
    technicalAccuracy: number;
    communication: number;
    problemSolving: number;
    confidence: number;
    topicCoverage: number;
  };
  strengths: string[];
  weaknesses: string[];
  persistentWeaknesses: {
    concept: string;
    detectedIn: string[];
    status: any;
    severity: any;
    recommendedAction: string;
  }[];
  extractedMemories: HindsightMemory[];
}> {
  const res = await fetch('/api/interview/review-and-extract-memory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error('Failed to synthesize review and extract memory');
  }
  return res.json();
}

export async function evaluateRectify(params: {
  weaknessConcept: string;
  topic: string;
  promptQuestion: string;
  candidateExplanation: string;
  expectedKeyPoints: string[];
}): Promise<RectifyEvaluationResult> {
  const res = await fetch('/api/interview/rectify-eval', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error('Failed to evaluate rectification');
  }
  return res.json();
}

export async function fetchRerunQuestion(params: {
  weaknessConcept: string;
  topic: string;
  previousQuestions: string[];
}): Promise<{
  question: string;
  topic: string;
  difficulty: DifficultyLevel;
  expectedKeyPoints: string[];
  rationale: string;
}> {
  const res = await fetch('/api/interview/rerun-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error('Failed to generate rerun question');
  }
  return res.json();
}
