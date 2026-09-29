/**
 * db.ts — SQLite persistence layer for Hindsight Memory
 * Runs on the server only (imported by server.ts).
 * Stores three collections:
 *   memories   → HindsightMemory objects (JSON-encoded)
 *   interviews → Interview objects (JSON-encoded)
 *   timelines  → SkillTimeline objects (JSON-encoded)
 */
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.resolve('hindsight.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// ── Schema ──────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS memories (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL DEFAULT 'candidate-a',
    topic       TEXT NOT NULL,
    subtopic    TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'Weak',
    data        TEXT NOT NULL,           -- full JSON blob
    updated_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS interviews (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL DEFAULT 'candidate-a',
    interview_number INTEGER NOT NULL,
    started_at      TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'completed',
    data            TEXT NOT NULL,       -- full JSON blob
    updated_at      TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS timelines (
    concept     TEXT PRIMARY KEY,
    topic       TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'Weak',
    data        TEXT NOT NULL,           -- full JSON blob
    updated_at  TEXT NOT NULL
  );
`);

const now = () => new Date().toISOString();

// ── Memories ────────────────────────────────────────────────────────────────

export function getAllMemories(): object[] {
  const rows = db.prepare('SELECT data FROM memories ORDER BY updated_at DESC').all() as { data: string }[];
  return rows.map((r) => JSON.parse(r.data));
}

export function upsertMemory(memory: { id: string; userId?: string; topic: string; subtopic: string; status: string }): void {
  db.prepare(`
    INSERT INTO memories (id, user_id, topic, subtopic, status, data, updated_at)
    VALUES (@id, @userId, @topic, @subtopic, @status, @data, @now)
    ON CONFLICT(id) DO UPDATE SET
      user_id    = excluded.user_id,
      topic      = excluded.topic,
      subtopic   = excluded.subtopic,
      status     = excluded.status,
      data       = excluded.data,
      updated_at = excluded.updated_at
  `).run({
    id: memory.id,
    userId: memory.userId ?? 'candidate-a',
    topic: memory.topic,
    subtopic: memory.subtopic,
    status: memory.status,
    data: JSON.stringify(memory),
    now: now(),
  });
}

export function clearMemories(): void {
  db.prepare('DELETE FROM memories').run();
}

// ── Interviews ───────────────────────────────────────────────────────────────

export function getAllInterviews(): object[] {
  const rows = db.prepare('SELECT data FROM interviews ORDER BY interview_number DESC').all() as { data: string }[];
  return rows.map((r) => JSON.parse(r.data));
}

export function upsertInterview(interview: { id: string; userId?: string; interviewNumber: number; startedAt: string; status: string }): void {
  db.prepare(`
    INSERT INTO interviews (id, user_id, interview_number, started_at, status, data, updated_at)
    VALUES (@id, @userId, @interviewNumber, @startedAt, @status, @data, @now)
    ON CONFLICT(id) DO UPDATE SET
      user_id          = excluded.user_id,
      interview_number = excluded.interview_number,
      started_at       = excluded.started_at,
      status           = excluded.status,
      data             = excluded.data,
      updated_at       = excluded.updated_at
  `).run({
    id: interview.id,
    userId: interview.userId ?? 'candidate-a',
    interviewNumber: interview.interviewNumber,
    startedAt: interview.startedAt,
    status: interview.status,
    data: JSON.stringify(interview),
    now: now(),
  });
}

export function clearInterviews(): void {
  db.prepare('DELETE FROM interviews').run();
}

// ── Timelines ────────────────────────────────────────────────────────────────

export function getAllTimelines(): object[] {
  const rows = db.prepare('SELECT data FROM timelines ORDER BY updated_at DESC').all() as { data: string }[];
  return rows.map((r) => JSON.parse(r.data));
}

export function upsertTimeline(timeline: { concept: string; topic: string; currentStatus: string }): void {
  db.prepare(`
    INSERT INTO timelines (concept, topic, status, data, updated_at)
    VALUES (@concept, @topic, @status, @data, @now)
    ON CONFLICT(concept) DO UPDATE SET
      topic      = excluded.topic,
      status     = excluded.status,
      data       = excluded.data,
      updated_at = excluded.updated_at
  `).run({
    concept: timeline.concept,
    topic: timeline.topic,
    status: timeline.currentStatus,
    data: JSON.stringify(timeline),
    now: now(),
  });
}

export function clearTimelines(): void {
  db.prepare('DELETE FROM timelines').run();
}

export default db;
