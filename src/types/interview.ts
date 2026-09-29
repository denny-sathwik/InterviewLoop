export type RoleType =
  | 'Software Engineer'
  | 'Backend Developer'
  | 'Full Stack Developer'
  | 'Data Analyst'
  | 'Data Engineer'
  | 'AI/ML Engineer'
  | string;

export type ExperienceLevel = 'Fresher' | 'Junior' | 'Mid-level';

export type InterviewType = 'Technical' | 'HR' | 'Behavioral' | 'Mixed';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Adaptive';

export type MemoryStatus = 'Weak' | 'Improving' | 'Mastered';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type MemoryType =
  | 'technical_weakness'
  | 'conceptual_misunderstanding'
  | 'repeated_mistake'
  | 'communication_issue'
  | 'technical_strength'
  | 'mastered_concept';

export interface SkillRelationship {
  targetMemoryId: string;
  targetConcept: string;
  relationshipType: 'prerequisite' | 'tradeoff' | 'impacts' | 'contrast';
  label: string;
  description: string;
}

export interface HindsightMemory {
  id: string;
  userId: string;
  topic: string;
  subtopic: string;
  type: MemoryType;
  observation: string;
  evidence: string;
  confidence: 'Low' | 'Medium' | 'High';
  severity: SeverityLevel;
  status: MemoryStatus;
  firstDetected: string;
  lastDetected: string;
  occurrences: number;
  detectedInInterviews: string[]; // e.g. ['Interview #1', 'Interview #2']
  recommendedFutureBehavior: string;
  rectifiedAt?: string;
  rectificationNotes?: string;
  improvementEvidence?: string;
  relatedSkills?: SkillRelationship[];
}

export interface QuestionResult {
  id: string;
  questionNumber: number;
  question: string;
  answer: string;
  topic: string;
  difficulty: DifficultyLevel | 'Easy' | 'Medium' | 'Hard';
  correctness: 'correct' | 'partially_correct' | 'incorrect';
  score: number; // 0 to 100
  feedback: string;
  detectedWeaknesses: string[];
  detectedStrengths: string[];
  rationale?: string; // Why this question was chosen (e.g. "Targeting SQL indexing weakness from Interview #1")
  targetedMemoryId?: string;
  followUpPrompt?: string;
  userFollowUpAnswer?: string;
  codeSnippet?: string;
}

export interface Interview {
  id: string;
  userId: string;
  interviewNumber: number;
  role: RoleType;
  experienceLevel: ExperienceLevel;
  type: InterviewType;
  difficulty: DifficultyLevel;
  topics: string[];
  questionCount: number;
  startedAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  score: number; // 0 to 100
  scoresBreakdown: {
    technicalAccuracy: number;
    communication: number;
    problemSolving: number;
    confidence: number;
    topicCoverage: number;
  };
  questions: QuestionResult[];
  weaknesses: string[];
  strengths: string[];
  persistentWeaknesses: {
    concept: string;
    detectedIn: string[];
    status: MemoryStatus;
    severity: SeverityLevel;
    recommendedAction: string;
  }[];
  memoriesCreatedOrUpdated: string[];
  strategyRationale?: string;
  hindsightContextSummary?: string;
}

export interface SkillTimelinePoint {
  id: string;
  interviewId?: string;
  interviewLabel: string; // e.g. "Interview #1", "Rectification", "Interview #2"
  date: string;
  status: 'Weak' | 'Improving' | 'Mastered' | 'Incomplete';
  note: string;
  type: 'interview' | 'rectify' | 'rerun';
}

export interface SkillTimeline {
  concept: string;
  topic: string;
  currentStatus: MemoryStatus;
  timeline: SkillTimelinePoint[];
}

export interface RectifyChallenge {
  weaknessConcept: string;
  topic: string;
  explanation: string;
  whyInsufficient: string;
  conciseExample: string;
  promptQuestion: string;
  expectedKeyPoints: string[];
}

export interface RectifyEvaluationResult {
  improved: boolean;
  score: number; // 0-100
  checklist: {
    point: string;
    met: boolean;
    explanation: string;
  }[];
  feedback: string;
  hindsightUpdateSummary: string;
}

export interface InterviewStrategy {
  strategySummary: string;
  retrievedMemoriesCount: number;
  persistentWeaknessesIdentified: string[];
  recentlyImprovedAreas: string[];
  untestedAreas: string[];
  questionPlan: {
    topic: string;
    focusArea: string;
    questionStyle: 'scenario' | 'conceptual' | 'tradeoff' | 'architecture';
    reason: string;
    targetsWeakness?: string;
  }[];
}
