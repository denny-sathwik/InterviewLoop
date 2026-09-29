import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';
import {
  getAllMemories, upsertMemory, clearMemories,
  getAllInterviews, upsertInterview, clearInterviews,
  getAllTimelines, upsertTimeline, clearTimelines,
} from './src/server/db.js';
import {
  initHindsightBank,
  retainMemory,
  recallMemories,
  reflectOnMemories,
  isHindsightEnabled,
} from './src/server/hindsightClient.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Groq SDK
const apiKey = process.env.GROQ_API_KEY || '';
const groq = new Groq({ apiKey });

const MODELS = ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'gemma2-9b-it'];

// Helper for timeout
function withTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

// Helper for safe JSON parsing
function cleanAndParseJSON<T>(text: string, fallback: T): T {
  try {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

// Resilient multi-model executor with quota and timeout fallback
async function executeGroqWithFallback<T>(
  prompt: string,
  fallback: T,
  timeoutMs = 15000
): Promise<T> {
  if (!apiKey) return fallback;

  for (const model of MODELS) {
    try {
      const response = await withTimeout(
        groq.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant. Always respond with valid JSON only, no markdown fences.',
            },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        }),
        timeoutMs
      );

      const text = response.choices?.[0]?.message?.content;
      if (text) {
        return cleanAndParseJSON(text, fallback);
      }
    } catch {
      // If 429 quota, 503 unavailable, or timeout, proceed to next model or fallback
      continue;
    }
  }

  return fallback;
}

// 1. Generate Interview Strategy based on Hindsight Memories
app.post('/api/interview/strategy', async (req: Request, res: Response) => {
  const { role, experienceLevel, type, difficulty, topics, hindsightMemories } = req.body;

  const fallback = (() => {
    const persistent = (hindsightMemories || []).filter(
      (m: any) => m.status === 'Weak' || m.occurrences >= 2
    );
    const plan = (topics || ['SQL']).map((t: string) => {
      const match = (hindsightMemories || []).find(
        (m: any) => m.topic.toLowerCase() === t.toLowerCase() && m.status === 'Weak'
      );
      return {
        topic: t,
        focusArea: match ? match.subtopic : `Core ${t} Engineering`,
        questionStyle: match ? 'scenario' : 'tradeoff',
        reason: match
          ? `Targeting previous weakness '${match.subtopic}' detected in past interviews using a high-scale production troubleshooting scenario.`
          : `Evaluating baseline competence and system constraints in ${t}.`,
        targetsWeakness: match ? match.subtopic : undefined,
      };
    });

    return {
      strategySummary:
        persistent.length > 0
          ? `Hindsight Memory retrieved ${persistent.length} persistent weakness(es): ${persistent.map((p: any) => p.subtopic).join(', ')}. Strategy: avoid textbook definitions and target real-world performance bottlenecks.`
          : `Balanced evaluation profile. Proceeding with adaptive engineering scenarios.`,
      persistentWeaknessesIdentified: persistent.map((p: any) => p.subtopic),
      recentlyImprovedAreas: (hindsightMemories || [])
        .filter((m: any) => m.status === 'Improving')
        .map((m: any) => m.subtopic),
      untestedAreas: [],
      questionPlan: plan,
    };
  })();

  // Recall Hindsight memories relevant to these topics
  const hindsightContext = await recallMemories(
    `Interview strategy for ${role} on topics: ${(topics || []).join(', ')}`
  );

  const prompt = `
You are the strategy engine for InterviewLoop, an AI interview platform powered by persistent Hindsight memory.
Candidate Role: ${role} (${experienceLevel})
Interview Type: ${type}
Target Difficulty: ${difficulty}
Topics: ${(topics || []).join(', ')}

Hindsight Memories (structured):
${JSON.stringify(hindsightMemories || [], null, 2)}
${hindsightContext ? `\nHindsight Recalled Context:\n${hindsightContext}` : ''}

Instructions:
1. Identify persistent weaknesses (repeated struggles, status: Weak).
2. Formulate an adaptive question plan where weak concepts are tested with practical production scenarios rather than repeating definition questions.

Return JSON:
{
  "strategySummary": "string",
  "persistentWeaknessesIdentified": ["string"],
  "recentlyImprovedAreas": ["string"],
  "untestedAreas": ["string"],
  "questionPlan": [
    {
      "topic": "string",
      "focusArea": "string",
      "questionStyle": "scenario | tradeoff | conceptual | architecture",
      "reason": "string",
      "targetsWeakness": "optional string"
    }
  ]
}
`;

  const result = await executeGroqWithFallback(prompt, fallback);
  res.json(result);
});

// 2. Generate Next Question with Memory Awareness & Adaptive Depth
app.post('/api/interview/generate-question', async (req: Request, res: Response) => {
  const {
    role,
    experienceLevel,
    type,
    difficulty,
    topics,
    questionNumber,
    totalQuestions,
    previousExchanges,
    hindsightMemories,
  } = req.body;

  const currentTopic = topics[(questionNumber - 1) % topics.length] || 'General';

  const fallback = (() => {
    const matchingMemory = (hindsightMemories || []).find(
      (m: any) =>
        m.topic.toLowerCase() === currentTopic.toLowerCase() && m.status === 'Weak'
    );

    if (matchingMemory && matchingMemory.subtopic.toLowerCase().includes('index')) {
      return {
        questionNumber,
        question:
          'A company has an orders table with over 20 million rows. Queries filtering by customer_id and created_at are experiencing high latency. How would you investigate this, and what indexing strategy and write overhead trade-offs would you consider?',
        topic: currentTopic,
        difficulty: 'Hard',
        rationale:
          'Hindsight Memory retrieved: Candidate previously struggled with SQL indexing trade-offs. Asking a 20M-row production scenario instead of a definition question.',
        targetedWeakness: matchingMemory.subtopic,
        targetedMemoryId: matchingMemory.id,
      };
    } else if (matchingMemory && matchingMemory.subtopic.toLowerCase().includes('cache')) {
      return {
        questionNumber,
        question:
          'During a high-concurrency flash sale, thousands of users request the exact same product details simultaneously when a cache key expires. How would you prevent your database from collapsing under cache stampede?',
        topic: currentTopic,
        difficulty: 'Hard',
        rationale:
          'Hindsight Memory retrieved: Candidate previously confused cache stampede mitigations. Testing scenario on mutex locking and probabilistic early expiration.',
        targetedWeakness: matchingMemory.subtopic,
        targetedMemoryId: matchingMemory.id,
      };
    } else if (currentTopic.toLowerCase().includes('python')) {
      return {
        questionNumber,
        question:
          'In a high-throughput data processing pipeline, how do Python generators, memory chunking, and the GIL affect concurrent CPU-bound vs I/O-bound workers?',
        topic: currentTopic,
        difficulty,
        rationale: `Memory-adapted evaluation of Python runtime memory mechanics for ${role}.`,
      };
    } else if (currentTopic.toLowerCase().includes('api')) {
      return {
        questionNumber,
        question:
          'How do you design idempotent payment APIs to prevent duplicate charges when network timeouts occur between client and payment gateway?',
        topic: currentTopic,
        difficulty,
        rationale: `Evaluating practical transactional resilience in ${currentTopic}.`,
      };
    } else {
      return {
        questionNumber,
        question: `In a production ${role} environment, what are the architectural trade-offs between horizontal vs vertical scaling when handling stateful ${currentTopic} workloads?`,
        topic: currentTopic,
        difficulty,
        rationale: `Evaluating system architectural depth for ${currentTopic}.`,
      };
    }
  })();

  // Recall Hindsight memories for this specific topic
  const hindsightContext = await recallMemories(
    `Past performance on ${currentTopic} for a ${role} candidate`
  );

  const prompt = `
You are the AI interviewer for InterviewLoop.
Persona: Professional, analytical, senior engineering interviewer.
Do NOT reveal answers.

Context:
- Role: ${role} (${experienceLevel})
- Topic: ${currentTopic}
- Question Number: ${questionNumber} of ${totalQuestions}
- Difficulty: ${difficulty}

Hindsight Memory (Past weak concepts):
${JSON.stringify(hindsightMemories || [], null, 2)}
${hindsightContext ? `\nHindsight Recalled Context:\n${hindsightContext}` : ''}

Previous Exchanges:
${JSON.stringify(previousExchanges || [], null, 2)}

RULE:
If candidate had a previous weakness in this topic, do NOT ask a textbook definition.
Ask a realistic engineering SCENARIO testing internal trade-offs.

Return JSON:
{
  "question": "string",
  "topic": "${currentTopic}",
  "difficulty": "${difficulty}",
  "rationale": "Explicit explanation of why this question was chosen based on Hindsight memory",
  "targetedWeakness": "optional string",
  "expectedKeyPoints": ["point 1", "point 2"]
}
`;

  const result = await executeGroqWithFallback(prompt, fallback);
  res.json(result);
});

// 3. Evaluate Candidate's Answer (in real-time during interview)
app.post('/api/interview/evaluate-answer', async (req: Request, res: Response) => {
  const { question, answer, topic, difficulty, role, targetedWeakness } = req.body;

  const fallback = (() => {
    const wordCount = (answer || '').trim().split(/\s+/).length;
    const lower = (answer || '').toLowerCase();

    let correctness: 'correct' | 'partially_correct' | 'incorrect' = 'partially_correct';
    let score = 72;
    let shouldProbe = false;
    let probeQuestion = '';

    if (wordCount < 14) {
      correctness = 'incorrect';
      score = 48;
      shouldProbe = true;
      probeQuestion =
        'That seems brief. Could you elaborate on the underlying performance trade-offs and how this operates under production load?';
    } else if (
      lower.includes('b-tree') ||
      lower.includes('write overhead') ||
      lower.includes('explain') ||
      lower.includes('idempotency') ||
      lower.includes('mutex')
    ) {
      correctness = 'correct';
      score = 92;
    } else if (targetedWeakness && !lower.includes('trade')) {
      correctness = 'partially_correct';
      score = 65;
      shouldProbe = true;
      probeQuestion =
        'You touched on the primary mechanism, but what are the write overhead and memory penalties associated with this approach?';
    }

    return {
      correctness,
      score,
      feedback:
        score >= 80
          ? 'Strong technical explanation addressing execution mechanics and trade-offs.'
          : 'Good initial direction, but missed critical write penalties, index selectivity, or internal data structures.',
      detectedWeaknesses: score < 75 ? [targetedWeakness || `${topic} deep trade-offs`] : [],
      detectedStrengths: score >= 75 ? [`${topic} practical reasoning & trade-offs`] : [],
      shouldProbe,
      probeQuestion,
    };
  })();

  // Recall past performance context for this topic
  const hindsightContext = await recallMemories(
    `Candidate history answering ${topic} questions: strengths and weaknesses`
  );

  const prompt = `
You are evaluating a candidate's answer in a professional tech interview.
Role: ${role}
Topic: ${topic}
Question: "${question}"
Candidate Answer: "${answer}"
Targeted Weakness: "${targetedWeakness || 'None'}"
${hindsightContext ? `\nHindsight Recalled Context (past performance):\n${hindsightContext}` : ''}

Evaluate:
1. Technical correctness: 'correct' | 'partially_correct' | 'incorrect'.
2. Score: 0 to 100.
3. Feedback: Analytical feedback (2-3 sentences).
4. Probing decision: Should the interviewer ask a follow-up probe before moving on? (shouldProbe: true/false, probeQuestion: "string").

Return JSON:
{
  "correctness": "correct" | "partially_correct" | "incorrect",
  "score": number,
  "feedback": "string",
  "detectedWeaknesses": ["string"],
  "detectedStrengths": ["string"],
  "shouldProbe": boolean,
  "probeQuestion": "string"
}
`;

  const result = await executeGroqWithFallback(prompt, fallback);

  // Retain the evaluation outcome in Hindsight
  const outcome = result as any;
  const memoryText = [
    `Interview evaluation — Topic: ${topic}, Role: ${role}`,
    `Question: ${question}`,
    `Candidate Answer: ${answer}`,
    `Score: ${outcome?.score ?? '?'}/100 — ${outcome?.correctness ?? ''}`,
    outcome?.detectedWeaknesses?.length
      ? `Weaknesses detected: ${outcome.detectedWeaknesses.join(', ')}`
      : '',
    outcome?.detectedStrengths?.length
      ? `Strengths detected: ${outcome.detectedStrengths.join(', ')}`
      : '',
    outcome?.feedback ? `Feedback: ${outcome.feedback}` : '',
  ].filter(Boolean).join('\n');
  retainMemory(memoryText).catch(() => {});

  res.json(result);
});

// 4. Review Full Interview & Extract Hindsight Memories
app.post('/api/interview/review-and-extract-memory', async (req: Request, res: Response) => {
  const { interviewNumber, role, experienceLevel, topics, questionsWithAnswers, previousMemories } =
    req.body;

  const currentDate = new Date().toISOString().split('T')[0];

  const fallback = (() => {
    const scores = (questionsWithAnswers || []).map((q: any) => q.score || 70);
    const avgScore = Math.round(
      scores.reduce((a: number, b: number) => a + b, 0) / (scores.length || 1)
    );

    const weaknesses: string[] = [];
    const strengths: string[] = [];
    (questionsWithAnswers || []).forEach((q: any) => {
      if (q.detectedWeaknesses) weaknesses.push(...q.detectedWeaknesses);
      if (q.detectedStrengths) strengths.push(...q.detectedStrengths);
    });

    const uniqueWeaknesses = Array.from(new Set(weaknesses));
    const uniqueStrengths = Array.from(new Set(strengths));

    const newMemories: any[] = [];
    if (uniqueWeaknesses.length > 0) {
      const topWeakness = uniqueWeaknesses[0];
      newMemories.push({
        id: `mem-${Date.now()}-1`,
        userId: 'candidate-a',
        topic: topics[0] || 'Technical',
        subtopic: topWeakness,
        type: 'technical_weakness',
        observation: `Candidate showed incomplete understanding of ${topWeakness} under technical questioning.`,
        evidence: `Struggled to articulate core write penalties and trade-offs in Question regarding ${topWeakness}.`,
        confidence: 'High',
        severity: 'Medium',
        status: 'Weak',
        firstDetected: currentDate,
        lastDetected: currentDate,
        occurrences: 1,
        detectedInInterviews: [`Interview #${interviewNumber}`],
        recommendedFutureBehavior: `Target ${topWeakness} with scenario-based queries rather than definitions.`,
      });
    }

    return {
      score: avgScore,
      scoresBreakdown: {
        technicalAccuracy: Math.min(100, avgScore + 2),
        communication: Math.max(50, avgScore - 4),
        problemSolving: Math.min(100, avgScore + 4),
        confidence: avgScore,
        topicCoverage: 85,
      },
      strengths: uniqueStrengths.length > 0 ? uniqueStrengths : ['Solid foundational technical vocabulary'],
      weaknesses: uniqueWeaknesses.length > 0 ? uniqueWeaknesses : ['Explaining production trade-offs'],
      persistentWeaknesses: (previousMemories || [])
        .filter((m: any) => m.status === 'Weak')
        .map((m: any) => ({
          concept: m.subtopic,
          detectedIn: m.detectedInInterviews,
          status: m.status,
          severity: m.severity,
          recommendedAction: m.recommendedFutureBehavior,
        })),
      extractedMemories: newMemories,
    };
  })();

  // Recall full candidate history for richer analysis
  const hindsightContext = await recallMemories(
    `Full interview history and weakness patterns for ${role} candidate on ${(topics || []).join(', ')}`
  );

  const prompt = `
Analyze completed interview and extract meaningful long-term Hindsight memories.
Interview #${interviewNumber} (${role} - ${experienceLevel})
Topics: ${(topics || []).join(', ')}
${hindsightContext ? `\nHindsight Recalled History:\n${hindsightContext}` : ''}

Questions & Answers:
${JSON.stringify(questionsWithAnswers || [], null, 2)}

Return JSON:
{
  "score": number,
  "scoresBreakdown": {
    "technicalAccuracy": number,
    "communication": number,
    "problemSolving": number,
    "confidence": number,
    "topicCoverage": number
  },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "persistentWeaknesses": [
    {
      "concept": "string",
      "detectedIn": ["string"],
      "status": "Weak",
      "severity": "High",
      "recommendedAction": "string"
    }
  ],
  "extractedMemories": [
    {
      "id": "mem-string",
      "userId": "candidate-a",
      "topic": "string",
      "subtopic": "string",
      "type": "technical_weakness",
      "observation": "string",
      "evidence": "string",
      "confidence": "High",
      "severity": "Medium",
      "status": "Weak",
      "firstDetected": "${currentDate}",
      "lastDetected": "${currentDate}",
      "occurrences": 1,
      "detectedInInterviews": ["Interview #${interviewNumber}"],
      "recommendedFutureBehavior": "string"
    }
  ]
}
`;

  const result = await executeGroqWithFallback(prompt, fallback);

  // Retain a summary of this interview in Hindsight
  const review = result as any;
  const interviewSummary = [
    `Interview #${interviewNumber} completed — Role: ${role} (${experienceLevel}), Topics: ${(topics || []).join(', ')}`,
    `Overall Score: ${review?.score ?? '?'}/100`,
    review?.strengths?.length ? `Strengths: ${review.strengths.join(', ')}` : '',
    review?.weaknesses?.length ? `Weaknesses: ${review.weaknesses.join(', ')}` : '',
    review?.persistentWeaknesses?.length
      ? `Persistent Weaknesses: ${review.persistentWeaknesses.map((w: any) => w.concept).join(', ')}`
      : '',
  ].filter(Boolean).join('\n');
  retainMemory(interviewSummary).catch(() => {});

  res.json(result);
});

// 5. Rectify Mode: Evaluate Re-explanation of Weak Concept
app.post('/api/interview/rectify-eval', async (req: Request, res: Response) => {
  const { weaknessConcept, topic, promptQuestion, candidateExplanation, expectedKeyPoints } =
    req.body;

  const fallback = (() => {
    const lower = (candidateExplanation || '').toLowerCase();
    const points = expectedKeyPoints || [
      'Query performance improvement & selective filters',
      'B-Tree node traversal and point/range lookups',
      'Write amplification overhead on INSERT / UPDATE / DELETE operations',
    ];

    const checklist = points.map((p: string) => {
      const met =
        lower.includes('write') ||
        lower.includes('b-tree') ||
        lower.includes('performance') ||
        lower.includes('insert') ||
        lower.includes('trade') ||
        lower.includes('buffer') ||
        lower.length > 50;
      return {
        point: p,
        met,
        explanation: met
          ? 'Clearly incorporated into the new explanation.'
          : 'Not explicitly articulated.',
      };
    });

    const allMet = checklist.filter((c: any) => c.met).length >= 2;
    return {
      improved: allMet,
      score: allMet ? 94 : 64,
      checklist,
      feedback: allMet
        ? 'Outstanding! Your explanation now thoroughly addresses performance advantages, internal B-tree lookups, and write amplification trade-offs.'
        : 'Partially improved. Be sure to explicitly quantify write amplification during data ingestion.',
      hindsightUpdateSummary: allMet
        ? `Hindsight Memory updated: '${weaknessConcept}' status transitioned from Weak → Improving.`
        : `Hindsight Memory kept at current state pending complete explanation.`,
    };
  })();

  // Recall past rectification attempts for this concept
  const hindsightContext = await recallMemories(
    `Rectification attempts and improvement history for weakness: ${weaknessConcept} (${topic})`
  );

  const prompt = `
You are the Rectification Evaluator in InterviewLoop.
Weakness: "${weaknessConcept}" (Topic: ${topic}).
Prompt Question: "${promptQuestion}"
Expected Key Points: ${JSON.stringify(expectedKeyPoints || [])}
Candidate's New Explanation: "${candidateExplanation}"
${hindsightContext ? `\nHindsight Recalled History for this concept:\n${hindsightContext}` : ''}

Evaluate:
1. Checklist of met key points.
2. improved: true/false.
3. Score: 0 to 100.
4. Feedback & Hindsight summary.

Return JSON:
{
  "improved": boolean,
  "score": number,
  "checklist": [
    {
      "point": "string",
      "met": boolean,
      "explanation": "string"
    }
  ],
  "feedback": "string",
  "hindsightUpdateSummary": "string"
}
`;

  const result = await executeGroqWithFallback(prompt, fallback);

  // Retain rectification outcome
  const rectResult = result as any;
  retainMemory([
    `Rectification attempt — Concept: ${weaknessConcept} (${topic})`,
    `Improved: ${rectResult?.improved ?? '?'} — Score: ${rectResult?.score ?? '?'}/100`,
    rectResult?.feedback ? `Feedback: ${rectResult.feedback}` : '',
    rectResult?.hindsightUpdateSummary ? rectResult.hindsightUpdateSummary : '',
  ].filter(Boolean).join('\n')).catch(() => {});

  res.json(result);
});

// 6. Rerun Mode: Generate Novel Scenario for Weakness (NEVER repeat old question)
app.post('/api/interview/rerun-question', async (req: Request, res: Response) => {
  const { weaknessConcept, topic, previousQuestions } = req.body;

  const fallback = (() => {
    let question = `A 20-million-row orders table has slow queries filtering by customer_id and created_at. How would you investigate the execution plan, evaluate index selectivity, and what write overhead tradeoffs would you account for?`;
    if (weaknessConcept.toLowerCase().includes('cache')) {
      question = `Your microservice architecture is suddenly getting hit with a viral social campaign. 100,000 requests per second are hitting a cache key that just expired. How do you design the cache-aside layer to eliminate database dog-piling?`;
    }

    return {
      question,
      topic,
      difficulty: 'Hard',
      expectedKeyPoints: [
        'EXPLAIN ANALYZE execution plan breakdown',
        'Index selectivity and composite column ordering',
        'Write amplification and B-tree leaf node splits',
      ],
      rationale: `Targeting previous weakness '${weaknessConcept}' with a novel high-scale production scenario rather than a textbook definition.`,
    };
  })();

  // Recall what previous scenarios were generated for this weakness
  const hindsightContext = await recallMemories(
    `Previous scenario questions and candidate answers for weakness: ${weaknessConcept} (${topic})`
  );

  const prompt = `
Generate a BRAND NEW, novel scenario-based question testing "${weaknessConcept}" (Topic: ${topic}).
DO NOT repeat previous questions:
${JSON.stringify(previousQuestions || [])}
${hindsightContext ? `\nHindsight Recalled Previous Scenarios:\n${hindsightContext}` : ''}
DO NOT ask simple definitions. Craft a realistic high-concurrency production dilemma.

Return JSON:
{
  "question": "string",
  "topic": "${topic}",
  "difficulty": "Hard",
  "expectedKeyPoints": ["point 1", "point 2"],
  "rationale": "string"
}
`;

  const result = await executeGroqWithFallback(prompt, fallback);
  retainMemory(`Rerun scenario generated for weakness: ${weaknessConcept} (${topic}) — Question: ${(result as any)?.question ?? ''}`).catch(() => {});
  res.json(result);
});

// ── Hindsight Persistence Endpoints ─────────────────────────────────────────

// Memories
app.get('/api/memories', (_req: Request, res: Response) => {
  res.json(getAllMemories());
});

app.post('/api/memories', (req: Request, res: Response) => {
  const memory = req.body;
  if (!memory?.id || !memory?.topic || !memory?.subtopic) {
    res.status(400).json({ error: 'Missing required fields: id, topic, subtopic' });
    return;
  }
  upsertMemory(memory);
  res.json({ ok: true });
});

app.delete('/api/memories', (_req: Request, res: Response) => {
  clearMemories();
  res.json({ ok: true });
});

// Interviews
app.get('/api/interviews', (_req: Request, res: Response) => {
  res.json(getAllInterviews());
});

app.post('/api/interviews', (req: Request, res: Response) => {
  const interview = req.body;
  if (!interview?.id || !interview?.interviewNumber) {
    res.status(400).json({ error: 'Missing required fields: id, interviewNumber' });
    return;
  }
  upsertInterview(interview);
  res.json({ ok: true });
});

app.delete('/api/interviews', (_req: Request, res: Response) => {
  clearInterviews();
  res.json({ ok: true });
});

// Timelines
app.get('/api/timelines', (_req: Request, res: Response) => {
  res.json(getAllTimelines());
});

app.post('/api/timelines', (req: Request, res: Response) => {
  const timeline = req.body;
  if (!timeline?.concept || !timeline?.topic) {
    res.status(400).json({ error: 'Missing required fields: concept, topic' });
    return;
  }
  upsertTimeline(timeline);
  res.json({ ok: true });
});

app.delete('/api/timelines', (_req: Request, res: Response) => {
  clearTimelines();
  res.json({ ok: true });
});

// Bulk seed (used by resetToDemoSeed)
app.post('/api/seed', (req: Request, res: Response) => {
  const { memories = [], interviews = [], timelines = [] } = req.body;
  clearMemories(); clearInterviews(); clearTimelines();
  (memories as any[]).forEach(upsertMemory);
  (interviews as any[]).forEach(upsertInterview);
  (timelines as any[]).forEach(upsertTimeline);
  res.json({ ok: true });
});

// Clear all (used by clearAll)
app.delete('/api/all', (_req: Request, res: Response) => {
  clearMemories(); clearInterviews(); clearTimelines();
  res.json({ ok: true });
});

// Start Express server and mount Vite
async function startServer() {
  // Initialise Hindsight memory bank (no-op if key not set)
  await initHindsightBank();
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`InterviewLoop running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
