import {
  HindsightMemory,
  Interview,
  SkillTimeline,
  SkillTimelinePoint,
  InterviewStrategy,
} from '../types/interview';

// ── localStorage cache keys (used for fast synchronous reads) ───────────────
const CACHE_KEY_MEMORIES   = 'interviewloop_v3_memories';
const CACHE_KEY_INTERVIEWS = 'interviewloop_v3_interviews';
const CACHE_KEY_TIMELINES  = 'interviewloop_v3_timelines';

// ── Seed data ────────────────────────────────────────────────────────────────

export const INITIAL_SEEDED_MEMORIES: HindsightMemory[] = [
  {
    id: 'mem-sql-indexing-01',
    userId: 'candidate-a',
    topic: 'SQL',
    subtopic: 'Database Indexing & B-Trees',
    type: 'technical_weakness',
    observation:
      'Candidate correctly understands primary keys and basic joins, but repeatedly struggles to explain database indexing mechanics, B-tree lookup paths, and write overhead tradeoffs.',
    evidence:
      'Candidate gave definition-only answer in Interview #1 and missed write penalty and index selectivity in Interview #2.',
    confidence: 'High',
    severity: 'High',
    status: 'Weak',
    firstDetected: '2026-09-18',
    lastDetected: '2026-09-24',
    occurrences: 2,
    detectedInInterviews: ['Interview #1', 'Interview #2'],
    recommendedFutureBehavior:
      'Test indexing using scenario-based real-world troubleshooting questions (e.g. 20M-row table slow query) rather than repeating definition-based questions.',
    relatedSkills: [
      {
        targetMemoryId: 'mem-api-auth-01',
        targetConcept: 'Authentication & REST Idempotency',
        relationshipType: 'impacts',
        label: 'Bottlenecks API Layer',
        description:
          'Candidate builds robust idempotent API endpoints, but throughput collapses due to missing composite indexes on database state queries.',
      },
      {
        targetMemoryId: 'mem-caching-redis-01',
        targetConcept: 'Redis Cache Invalidation & Strategies',
        relationshipType: 'tradeoff',
        label: 'Compounding Fallback Penalty',
        description:
          'When Redis cache keys expire or miss, queries fall back directly to an unindexed 20M orders table, amplifying DB CPU saturation.',
      },
    ],
  },
  {
    id: 'mem-api-auth-01',
    userId: 'candidate-a',
    topic: 'APIs',
    subtopic: 'Authentication & REST Idempotency',
    type: 'technical_strength',
    observation:
      'Demonstrates strong practical grasp of stateless JWT authentication, refresh token rotation, and REST idempotency with POST vs PUT.',
    evidence:
      'Candidate provided crystal clear explanation of replay attack mitigation and authorization headers.',
    confidence: 'High',
    severity: 'Low',
    status: 'Mastered',
    firstDetected: '2026-09-18',
    lastDetected: '2026-09-24',
    occurrences: 2,
    detectedInInterviews: ['Interview #1', 'Interview #2'],
    recommendedFutureBehavior:
      'Reduce emphasis on basic REST auth; advance to distributed session caches or OAuth token introspection if tested again.',
    relatedSkills: [
      {
        targetMemoryId: 'mem-caching-redis-01',
        targetConcept: 'Redis Cache Invalidation & Strategies',
        relationshipType: 'prerequisite',
        label: 'Relies on Atomic Cache',
        description:
          'Payment idempotency key verification requires atomic Redis key checks, but candidate struggles with cache stampede under spike concurrency.',
      },
    ],
  },
  {
    id: 'mem-comm-structure-01',
    userId: 'candidate-a',
    topic: 'Communication',
    subtopic: 'Technical Trade-off Structuring',
    type: 'communication_issue',
    observation:
      'Answers tend to jump into code implementations without first articulating high-level engineering trade-offs, constraints, or time/space complexity.',
    evidence:
      'In algorithm questions, jumped directly into loops without outlining brute force vs optimal approach.',
    confidence: 'Medium',
    severity: 'Medium',
    status: 'Weak',
    firstDetected: '2026-09-18',
    lastDetected: '2026-09-24',
    occurrences: 2,
    detectedInInterviews: ['Interview #1', 'Interview #2'],
    recommendedFutureBehavior:
      'Probe candidate with: "Before writing any code, walk me through the trade-offs of at least two design options."',
    relatedSkills: [
      {
        targetMemoryId: 'mem-sql-indexing-01',
        targetConcept: 'Database Indexing & B-Trees',
        relationshipType: 'tradeoff',
        label: 'Underlying Root Cause',
        description:
          'Candidate struggles to structure verbal explanations of write penalties and B-tree leaf node rebalancing before answering.',
      },
    ],
  },
  {
    id: 'mem-caching-redis-01',
    userId: 'candidate-a',
    topic: 'Databases',
    subtopic: 'Redis Cache Invalidation & Strategies',
    type: 'technical_weakness',
    observation:
      'Candidate knows Cache-Aside pattern at surface level, but confused Cache Penetration vs Cache Stampede (dog-piling) and could not explain probabilistic early expiration.',
    evidence:
      'In Interview #2, could not describe how mutex locks or Bloom filters prevent cache stampede under heavy spike load.',
    confidence: 'Medium',
    severity: 'Medium',
    status: 'Weak',
    firstDetected: '2026-09-24',
    lastDetected: '2026-09-24',
    occurrences: 1,
    detectedInInterviews: ['Interview #2'],
    recommendedFutureBehavior:
      'Ask scenario on high-traffic flash sale cache breakdown to evaluate if candidate has rectified cache herd mitigations.',
    relatedSkills: [
      {
        targetMemoryId: 'mem-sql-indexing-01',
        targetConcept: 'Database Indexing & B-Trees',
        relationshipType: 'impacts',
        label: 'Cascading DB Collapse',
        description:
          'Simultaneous cache expiration forces concurrent unindexed table scans on PostgreSQL, turning single key miss into service outage.',
      },
    ],
  },
  {
    id: 'mem-python-ds-01',
    userId: 'candidate-a',
    topic: 'Python',
    subtopic: 'Collections, Generators & Memory Management',
    type: 'technical_strength',
    observation:
      'Excellent mental model of Python generator pipelines, iterator protocols, GIL concurrency nuances, and memory efficiency with itertools.',
    evidence:
      'Correctly explained yield streaming vs list comprehensions for multi-gigabyte dataset parsing.',
    confidence: 'High',
    severity: 'Low',
    status: 'Mastered',
    firstDetected: '2026-09-18',
    lastDetected: '2026-09-18',
    occurrences: 1,
    detectedInInterviews: ['Interview #1'],
    recommendedFutureBehavior:
      'Skip introductory Python language syntax; test real asynchronous asyncio event loops or C-extensions if Python is selected.',
    relatedSkills: [
      {
        targetMemoryId: 'mem-comm-structure-01',
        targetConcept: 'Technical Trade-off Structuring',
        relationshipType: 'contrast',
        label: 'Code Strength vs Verbal Weakness',
        description:
          'Candidate generates memory-efficient Python streaming code cleanly, yet fails to verbally articulate algorithmic trade-offs beforehand.',
      },
    ],
  },
];

export const INITIAL_SEEDED_INTERVIEWS: Interview[] = [
  {
    id: 'int-001',
    userId: 'candidate-a',
    interviewNumber: 1,
    role: 'Software Engineer',
    experienceLevel: 'Junior',
    type: 'Technical',
    difficulty: 'Medium',
    topics: ['SQL', 'Python', 'APIs'],
    questionCount: 3,
    startedAt: '2026-09-18T10:00:00Z',
    completedAt: '2026-09-18T10:35:00Z',
    status: 'completed',
    score: 68,
    scoresBreakdown: { technicalAccuracy: 65, communication: 62, problemSolving: 72, confidence: 70, topicCoverage: 75 },
    questions: [
      { id: 'q-101', questionNumber: 1, question: 'Can you explain what a database index is and how it works?', answer: 'An index is like an index in the back of a book. It helps the database find rows faster without having to scan the whole table.', topic: 'SQL', difficulty: 'Medium', correctness: 'partially_correct', score: 55, feedback: 'You gave a classic textbook analogy, but failed to explain the underlying B-Tree structure, seek vs scan costs, or the write penalty during INSERT/UPDATE operations.', detectedWeaknesses: ['SQL indexing', 'Database internal data structures'], detectedStrengths: ['Basic conceptual understanding'] },
      { id: 'q-102', questionNumber: 2, question: 'How do Python generators work, and when would you use them over a standard list comprehension?', answer: 'Generators use the yield keyword. They produce items one at a time lazily instead of keeping all items in memory at once. Useful for streaming huge files.', topic: 'Python', difficulty: 'Medium', correctness: 'correct', score: 92, feedback: 'Crisp, accurate answer explaining memory efficiency, lazy evaluation, and the iterator protocol.', detectedWeaknesses: [], detectedStrengths: ['Python generators & memory management'] },
      { id: 'q-103', questionNumber: 3, question: 'How do you handle stateless authentication in a modern REST API architecture?', answer: 'We use JWT tokens signed with a secret or asymmetric key. Client sends it in Authorization Bearer header. Server verifies signature without querying DB on every request.', topic: 'APIs', difficulty: 'Medium', correctness: 'correct', score: 88, feedback: 'Solid explanation of token structure and header transmission.', detectedWeaknesses: [], detectedStrengths: ['REST authentication & stateless architecture'] },
    ],
    weaknesses: ['SQL indexing', 'Communication structure'],
    strengths: ['Python memory management', 'REST authentication'],
    persistentWeaknesses: [],
    memoriesCreatedOrUpdated: ['mem-sql-indexing-01', 'mem-api-auth-01', 'mem-python-ds-01'],
    strategyRationale: 'Initial baseline evaluation across full stack core topics.',
  },
  {
    id: 'int-002',
    userId: 'candidate-a',
    interviewNumber: 2,
    role: 'Software Engineer',
    experienceLevel: 'Junior',
    type: 'Technical',
    difficulty: 'Medium',
    topics: ['SQL', 'Databases', 'APIs'],
    questionCount: 3,
    startedAt: '2026-09-24T14:00:00Z',
    completedAt: '2026-09-24T14:40:00Z',
    status: 'completed',
    score: 71,
    scoresBreakdown: { technicalAccuracy: 70, communication: 65, problemSolving: 74, confidence: 72, topicCoverage: 76 },
    questions: [
      { id: 'q-201', questionNumber: 1, question: 'Suppose we have an e-commerce table with frequent writes. Should we index every column that appears in WHERE clauses? What are the trade-offs?', answer: 'Yes, indexing columns speeds up WHERE queries. Maybe it takes a little bit more disk space, but it is usually worth having indexes on all queried columns.', topic: 'SQL', difficulty: 'Medium', correctness: 'incorrect', score: 45, feedback: 'Incorrect recommendation for high-write tables. Every additional index significantly degrades INSERT/UPDATE/DELETE throughput because the B-Tree must be rebalanced, and index bloat degrades buffer pool memory.', detectedWeaknesses: ['SQL indexing', 'Database write amplification & tradeoffs'], detectedStrengths: [], rationale: 'Hindsight test: checking if candidate understands write overhead on indexes.', targetedMemoryId: 'mem-sql-indexing-01' },
      { id: 'q-202', questionNumber: 2, question: 'What is the difference between Cache Penetration and Cache Stampede in Redis systems?', answer: 'Cache penetration is when data is not in cache so we query database. Stampede is when lots of people query at once.', topic: 'Databases', difficulty: 'Medium', correctness: 'partially_correct', score: 60, feedback: 'Partially correct on stampede, but penetration specifically refers to queries for non-existent keys repeatedly hitting the DB. Missing mitigation strategies like Bloom filters and distributed mutexes.', detectedWeaknesses: ['Redis cache failure modes & mitigations'], detectedStrengths: ['Cache-aside awareness'] },
      { id: 'q-203', questionNumber: 3, question: 'How do you ensure idempotency for payment transactions over HTTP APIs?', answer: 'We generate a unique idempotency key on client side and pass it in the request header. Server stores key in atomic store (like Redis or DB) and returns cached response if repeated.', topic: 'APIs', difficulty: 'Medium', correctness: 'correct', score: 95, feedback: 'Flawless explanation of idempotency keys, atomic verification, and duplicate payment prevention.', detectedWeaknesses: [], detectedStrengths: ['Payment idempotency & transactional API design'] },
    ],
    weaknesses: ['SQL indexing (Persistent)', 'Redis cache failure modes'],
    strengths: ['API idempotency', 'REST architecture'],
    persistentWeaknesses: [{ concept: 'SQL Indexing', detectedIn: ['Interview #1', 'Interview #2'], status: 'Weak', severity: 'High', recommendedAction: 'Target with practical query optimization scenario on 20M+ rows.' }],
    memoriesCreatedOrUpdated: ['mem-sql-indexing-01', 'mem-caching-redis-01'],
    strategyRationale: 'Hindsight memory triggered: re-probed SQL indexing trade-offs after weakness was flagged in Interview #1.',
  },
];

export const INITIAL_SEEDED_TIMELINES: SkillTimeline[] = [
  { concept: 'SQL Indexing & B-Trees', topic: 'SQL', currentStatus: 'Weak', timeline: [{ id: 'tl-1', interviewId: 'int-001', interviewLabel: 'Interview #1', date: '2026-09-18', status: 'Weak', note: 'Could only provide book index analogy; missed B-Tree lookup mechanics and write cost.', type: 'interview' }, { id: 'tl-2', interviewId: 'int-002', interviewLabel: 'Interview #2', date: '2026-09-24', status: 'Weak', note: 'Advised indexing all columns; failed to recognize write penalty & tree rebalancing.', type: 'interview' }] },
  { concept: 'REST APIs & Idempotency', topic: 'APIs', currentStatus: 'Mastered', timeline: [{ id: 'tl-3', interviewId: 'int-001', interviewLabel: 'Interview #1', date: '2026-09-18', status: 'Mastered', note: 'Strong explanation of stateless JWT and authorization headers.', type: 'interview' }, { id: 'tl-4', interviewId: 'int-002', interviewLabel: 'Interview #2', date: '2026-09-24', status: 'Mastered', note: 'Mastered idempotency keys and payment deduplication.', type: 'interview' }] },
  { concept: 'Redis Caching & Invalidation', topic: 'Databases', currentStatus: 'Weak', timeline: [{ id: 'tl-5', interviewId: 'int-002', interviewLabel: 'Interview #2', date: '2026-09-24', status: 'Weak', note: 'Confused cache penetration with cache stampede; missed Bloom filter and mutex locks.', type: 'interview' }] },
  { concept: 'Python Generators & Memory', topic: 'Python', currentStatus: 'Mastered', timeline: [{ id: 'tl-6', interviewId: 'int-001', interviewLabel: 'Interview #1', date: '2026-09-18', status: 'Mastered', note: 'Crystal clear on yield, lazy streaming, and memory overhead.', type: 'interview' }] },
];

// ── API helpers ──────────────────────────────────────────────────────────────

async function apiFetch(path: string, options?: RequestInit): Promise<any> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

// ── Local cache helpers ───────────────────────────────────────────────────────

function readCache<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCache(key: string, data: unknown[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // localStorage full — cache miss is acceptable
  }
}

// ── Service class ─────────────────────────────────────────────────────────────

class HindsightMemoryService {
  private memories: HindsightMemory[] = [];
  private interviews: Interview[] = [];
  private timelines: SkillTimeline[] = [];
  private initialized = false;

  constructor() {
    // Synchronously prime from cache for immediate UI render
    this.memories   = readCache<HindsightMemory>(CACHE_KEY_MEMORIES);
    this.interviews = readCache<Interview>(CACHE_KEY_INTERVIEWS);
    this.timelines  = readCache<SkillTimeline>(CACHE_KEY_TIMELINES);
    // Then hydrate from server in background
    this.hydrate();
  }

  /** Fetch latest data from SQLite via API and refresh local cache. */
  async hydrate(): Promise<void> {
    try {
      const [memories, interviews, timelines] = await Promise.all([
        apiFetch('/api/memories'),
        apiFetch('/api/interviews'),
        apiFetch('/api/timelines'),
      ]);
      this.memories   = memories;
      this.interviews = interviews;
      this.timelines  = timelines;
      writeCache(CACHE_KEY_MEMORIES,   this.memories);
      writeCache(CACHE_KEY_INTERVIEWS, this.interviews);
      writeCache(CACHE_KEY_TIMELINES,  this.timelines);
      this.initialized = true;
    } catch {
      // Server not yet ready or offline — cache values remain
      this.initialized = true;
    }
  }

  // ── Reads (synchronous, from in-memory mirror) ───────────────────────────

  public getAllMemories(): HindsightMemory[] {
    return [...this.memories];
  }

  public getMemoriesByTopic(topic: string): HindsightMemory[] {
    return this.memories.filter((m) => m.topic.toLowerCase() === topic.toLowerCase());
  }

  public getPersistentWeaknesses(): HindsightMemory[] {
    return this.memories.filter(
      (m) =>
        (m.type === 'technical_weakness' ||
          m.type === 'conceptual_misunderstanding' ||
          m.type === 'repeated_mistake') &&
        (m.occurrences >= 2 || m.status === 'Weak')
    );
  }

  public getStrengths(): HindsightMemory[] {
    return this.memories.filter((m) => m.type === 'technical_strength' || m.status === 'Mastered');
  }

  public getRecentlyImproved(): HindsightMemory[] {
    return this.memories.filter((m) => m.status === 'Improving' || m.improvementEvidence);
  }

  public getInterviews(): Interview[] {
    return [...this.interviews];
  }

  public getInterviewById(id: string): Interview | undefined {
    return this.interviews.find((i) => i.id === id);
  }

  public getSkillTimelines(): SkillTimeline[] {
    return [...this.timelines];
  }

  // ── Writes (persist to SQLite + update in-memory mirror) ─────────────────

  public addInterview(interview: Interview): void {
    const idx = this.interviews.findIndex((i) => i.id === interview.id);
    if (idx >= 0) this.interviews[idx] = interview;
    else this.interviews.unshift(interview);
    writeCache(CACHE_KEY_INTERVIEWS, this.interviews);
    apiFetch('/api/interviews', { method: 'POST', body: JSON.stringify(interview) }).catch(console.error);
  }

  public saveMemory(memory: HindsightMemory): void {
    const index = this.memories.findIndex(
      (m) =>
        m.id === memory.id ||
        (m.topic.toLowerCase() === memory.topic.toLowerCase() &&
          m.subtopic.toLowerCase() === memory.subtopic.toLowerCase())
    );

    if (index >= 0) {
      const existing = this.memories[index];
      this.memories[index] = {
        ...existing,
        ...memory,
        occurrences: (existing.occurrences || 1) + 1,
        detectedInInterviews: Array.from(
          new Set([...existing.detectedInInterviews, ...memory.detectedInInterviews])
        ),
        lastDetected: memory.lastDetected || new Date().toISOString().split('T')[0],
      };
      memory = this.memories[index];
    } else {
      this.memories.unshift(memory);
    }
    writeCache(CACHE_KEY_MEMORIES, this.memories);
    apiFetch('/api/memories', { method: 'POST', body: JSON.stringify(memory) }).catch(console.error);
  }

  public recordRectificationImprovement(
    weaknessConcept: string,
    topic: string,
    evidenceText: string,
    keyPointsMet: string[]
  ): void {
    const today = new Date().toISOString().split('T')[0];

    const memory = this.memories.find(
      (m) =>
        m.subtopic.toLowerCase().includes(weaknessConcept.toLowerCase()) ||
        weaknessConcept.toLowerCase().includes(m.subtopic.toLowerCase()) ||
        m.topic.toLowerCase() === topic.toLowerCase()
    );

    if (memory) {
      memory.status = 'Improving';
      memory.rectifiedAt = today;
      memory.rectificationNotes = `Rectified concept successfully. Met critical criteria: ${keyPointsMet.join(', ')}`;
      memory.improvementEvidence = evidenceText;
      memory.severity = 'Low';
      writeCache(CACHE_KEY_MEMORIES, this.memories);
      apiFetch('/api/memories', { method: 'POST', body: JSON.stringify(memory) }).catch(console.error);
    }

    let timeline = this.timelines.find(
      (t) =>
        t.concept.toLowerCase().includes(weaknessConcept.toLowerCase()) ||
        weaknessConcept.toLowerCase().includes(t.concept.toLowerCase())
    );

    const newPoint: SkillTimelinePoint = {
      id: `tl-rec-${Date.now()}`,
      interviewLabel: 'Rectification Mode',
      date: today,
      status: 'Improving',
      note: `Candidate reviewed gaps & successfully explained: ${keyPointsMet.join(', ')}.`,
      type: 'rectify',
    };

    if (timeline) {
      timeline.currentStatus = 'Improving';
      timeline.timeline.push(newPoint);
    } else {
      timeline = { concept: weaknessConcept, topic, currentStatus: 'Improving', timeline: [newPoint] };
      this.timelines.push(timeline);
    }
    writeCache(CACHE_KEY_TIMELINES, this.timelines);
    apiFetch('/api/timelines', { method: 'POST', body: JSON.stringify(timeline) }).catch(console.error);
  }

  public recordConceptMastery(concept: string, topic: string, interviewLabel: string, note: string): void {
    const today = new Date().toISOString().split('T')[0];

    const memory = this.memories.find(
      (m) =>
        m.subtopic.toLowerCase().includes(concept.toLowerCase()) ||
        concept.toLowerCase().includes(m.subtopic.toLowerCase())
    );

    if (memory) {
      memory.status = 'Mastered';
      memory.severity = 'Low';
      memory.improvementEvidence = note;
      writeCache(CACHE_KEY_MEMORIES, this.memories);
      apiFetch('/api/memories', { method: 'POST', body: JSON.stringify(memory) }).catch(console.error);
    }

    const timeline = this.timelines.find(
      (t) =>
        t.concept.toLowerCase().includes(concept.toLowerCase()) ||
        concept.toLowerCase().includes(t.concept.toLowerCase())
    );

    if (timeline) {
      timeline.currentStatus = 'Mastered';
      timeline.timeline.push({ id: `tl-${Date.now()}`, interviewLabel, date: today, status: 'Mastered', note, type: 'rerun' });
      writeCache(CACHE_KEY_TIMELINES, this.timelines);
      apiFetch('/api/timelines', { method: 'POST', body: JSON.stringify(timeline) }).catch(console.error);
    }
  }

  // ── Reset / Clear ────────────────────────────────────────────────────────

  public resetToDemoSeed(): void {
    this.memories   = JSON.parse(JSON.stringify(INITIAL_SEEDED_MEMORIES));
    this.interviews = JSON.parse(JSON.stringify(INITIAL_SEEDED_INTERVIEWS));
    this.timelines  = JSON.parse(JSON.stringify(INITIAL_SEEDED_TIMELINES));
    writeCache(CACHE_KEY_MEMORIES,   this.memories);
    writeCache(CACHE_KEY_INTERVIEWS, this.interviews);
    writeCache(CACHE_KEY_TIMELINES,  this.timelines);
    apiFetch('/api/seed', {
      method: 'POST',
      body: JSON.stringify({ memories: this.memories, interviews: this.interviews, timelines: this.timelines }),
    }).catch(console.error);
  }

  public clearAll(): void {
    this.memories   = [];
    this.interviews = [];
    this.timelines  = [];
    writeCache(CACHE_KEY_MEMORIES,   []);
    writeCache(CACHE_KEY_INTERVIEWS, []);
    writeCache(CACHE_KEY_TIMELINES,  []);
    apiFetch('/api/all', { method: 'DELETE' }).catch(console.error);
  }

  // ── Strategy synthesis (pure client-side, no API needed) ─────────────────

  public synthesizeInterviewStrategy(role: string, topics: string[], difficulty: string): InterviewStrategy {
    const relevantMemories = this.memories.filter((m) =>
      topics.some(
        (t) => t.toLowerCase() === m.topic.toLowerCase() || m.topic.toLowerCase().includes(t.toLowerCase())
      )
    );

    const persistentWeaknesses = relevantMemories
      .filter((m) => m.status === 'Weak')
      .map((m) => `${m.topic}: ${m.subtopic}`);

    const recentlyImproved = relevantMemories
      .filter((m) => m.status === 'Improving')
      .map((m) => `${m.topic}: ${m.subtopic}`);

    const testedTopics = new Set(this.memories.map((m) => m.topic.toLowerCase()));
    const untestedTopics = topics.filter((t) => !testedTopics.has(t.toLowerCase()));

    const questionPlan: InterviewStrategy['questionPlan'] = [];

    relevantMemories.filter((m) => m.status === 'Weak').forEach((m) => {
      questionPlan.push({
        topic: m.topic,
        focusArea: m.subtopic,
        questionStyle: 'scenario',
        reason: `Targeting persistent weakness '${m.subtopic}' detected in ${m.detectedInInterviews.join(', ')} using practical troubleshooting scenario rather than textbook definition.`,
        targetsWeakness: m.subtopic,
      });
    });

    relevantMemories.filter((m) => m.status === 'Improving').forEach((m) => {
      questionPlan.push({
        topic: m.topic,
        focusArea: m.subtopic,
        questionStyle: 'tradeoff',
        reason: `Verifying candidate retention of recently rectified concept '${m.subtopic}' with edge-case trade-off question.`,
        targetsWeakness: m.subtopic,
      });
    });

    topics.forEach((top) => {
      if (!questionPlan.some((p) => p.topic.toLowerCase() === top.toLowerCase())) {
        questionPlan.push({
          topic: top,
          focusArea: `Core ${top} engineering competencies for ${role}`,
          questionStyle: 'conceptual',
          reason: `Evaluating competency in ${top} (previously unexamined or balanced coverage).`,
        });
      }
    });

    const strategySummary =
      persistentWeaknesses.length > 0
        ? `Hindsight Memory detected ${persistentWeaknesses.length} persistent weak concept(s): ${persistentWeaknesses.join(', ')}. Future questions will bypass basic definitions and challenge the candidate with real-world scenarios.`
        : `Candidate has strong baseline profile. Questions will advance to architectural trade-offs and higher difficulty.`;

    return {
      strategySummary,
      retrievedMemoriesCount: relevantMemories.length,
      persistentWeaknessesIdentified: persistentWeaknesses,
      recentlyImprovedAreas: recentlyImproved,
      untestedAreas: untestedTopics,
      questionPlan,
    };
  }
}

export const hindsightService = new HindsightMemoryService();
