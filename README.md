# InterviewLoop

**InterviewLoop is an adaptive AI interview-practice platform that remembers a candidate's learning journey.** Instead of repeating generic questions, it uses Hindsight Memory to identify persistent gaps, generate targeted follow-ups, and demonstrate improvement over time.

## The problem

Interview preparation is usually stateless: each mock interview starts from zero, and weak concepts can be missed or repeatedly tested only at a surface level. InterviewLoop turns every answer, evaluation, rectification, and rerun into a persistent learning signal so the next interview is meaningfully more personalized.

## Evaluation highlights

| Criterion | Weight | How InterviewLoop addresses it |
| --- | ---: | --- |
| **Innovation** | **30%** | Moves beyond one-off AI mock interviews with a closed learning loop: assess, remember, target a gap, verify improvement, and adapt the next session. |
| **Use of Hindsight Memory** | **25%** | Retains interview insights in a candidate memory bank; recalls relevant context to steer question generation and evaluation; reflects on stored memories for personalized strategy summaries. |
| **Technical Implementation** | **20%** | React + TypeScript frontend, Express API, SQLite persistence, Hindsight SDK integration, and Groq-powered question/evaluation workflows. Local storage provides responsive client-side caching. |
| **User Experience** | **15%** | Guided interview configuration, focused review feedback, Weaknesses and Progress views, a visual knowledge graph, Rectify Mode, Rerun Mode, history, and an included demo flow. |
| **Real-world Impact** | **10%** | Helps candidates spend practice time on the concepts most likely to limit performance, while giving coaches and learners an interpretable record of improvement—not just a score. |

## How Hindsight Memory powers adaptation

```text
Interview answer
      |
      v
AI evaluation identifies strengths, gaps, and evidence
      |
      v
Hindsight retains the learning signal in the candidate memory bank
      |
      v
Future strategy recalls relevant memories
      |
      v
Scenario-based questions target persistent weaknesses
      |
      v
Rectify / rerun records verified improvement and updates progress
```

The server maintains one Hindsight bank per candidate. It uses three core operations:

- **Retain**: save a new weakness, strength, interview result, rectification, or rerun outcome.
- **Recall**: retrieve memory relevant to the role, topics, and question being generated.
- **Reflect**: synthesize a memory-grounded strategy summary for the candidate.

This lets the application shift from definition-style repetition to practical, scenario-based questions as patterns emerge.

## Key features

- Configure technical interviews by role, experience, topic, difficulty, and question count.
- Generate adaptive questions and detailed answer evaluation.
- Extract persistent technical weaknesses with evidence and severity.
- Use **Rectify Mode** to practice a weak concept and record demonstrated improvement.
- Use **Rerun Mode** to verify retention with a fresh scenario.
- Follow progress through skill timelines, interview history, dashboards, and a knowledge graph.
- Explore the complete user journey quickly with the built-in hackathon demo.

## Technical architecture

```text
React + Vite client
  ├─ Interview configuration, practice, review, progress, graph UI
  ├─ Local storage cache for immediate UI hydration
  └─ REST requests
          |
          v
Express + TypeScript server
  ├─ Groq: question generation and answer/rectification evaluation
  ├─ Hindsight: retain, recall, and reflection over candidate memory
  └─ SQLite: durable memories, interviews, and skill timelines
```

## Run locally

### Prerequisites

- Node.js 20+
- A Groq API key
- A Hindsight API key (recommended for persistent semantic memory)

### Setup

```bash
npm install
cp .env.example .env
```

Add your credentials to `.env`:

```env
GROQ_API_KEY="your_groq_api_key"
HINDSIGHT_API_KEY="your_hindsight_api_key"
HINDSIGHT_BASE_URL="https://api.hindsight.vectorize.io"
APP_URL="http://localhost:3000"
```

Then start the development server:

```bash
npm run dev
```

Open the local URL printed by the server. The app stores its local SQLite database as `hindsight.db`; it is intentionally excluded from version control.

## Quality checks

```bash
npm run lint
npm run build
```

## Privacy and security

- Do not commit `.env` files or API keys.
- The committed `.env.example` contains placeholders only.
- Local interview data is stored in SQLite and ignored by Git by default.

## Future directions

- Multi-candidate accounts with isolated Hindsight banks.
- Interviewer or coach dashboards for cohort-level insights.
- More role-specific evaluation rubrics and real interview question libraries.
- Clear user controls for exporting and deleting stored learning data.
