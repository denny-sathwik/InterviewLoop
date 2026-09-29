/**
 * hindsightClient.ts
 * Wraps the @vectorize-io/hindsight-client SDK for InterviewLoop.
 *
 * One memory bank per candidate (default: "interviewloop-candidate-a").
 * Three operations used throughout the server:
 *   retain(text)  → store a new memory (weakness, strength, interview result)
 *   recall(query) → semantic search — returns relevant memory strings
 *   reflect(query)→ AI-synthesized answer grounded in stored memories
 */
import { HindsightClient } from '@vectorize-io/hindsight-client';

const HINDSIGHT_API_KEY  = process.env.HINDSIGHT_API_KEY  || '';
const HINDSIGHT_BASE_URL = process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io';

// One bank per candidate. For a multi-user system, parameterise by userId.
export const BANK_ID = 'interviewloop-candidate-a';

let client: HindsightClient | null = null;
let bankReady = false;

function getClient(): HindsightClient | null {
  if (!HINDSIGHT_API_KEY) return null;
  if (!client) {
    client = new HindsightClient({ baseUrl: HINDSIGHT_BASE_URL, apiKey: HINDSIGHT_API_KEY });
  }
  return client;
}

/** Create the bank once on server start (idempotent). */
export async function initHindsightBank(): Promise<void> {
  const c = getClient();
  if (!c || bankReady) return;
  try {
    await c.createBank(BANK_ID, {
      name: 'InterviewLoop Candidate Memory',
      background:
        'You are a technical interview coach. You remember every weakness, strength, and insight ' +
        'observed across all past interviews with this candidate. Use this memory to give ' +
        'personalised, adaptive feedback and question strategies.',
    });
    bankReady = true;
    console.log('[Hindsight] Memory bank ready:', BANK_ID);
  } catch (err) {
    console.warn('[Hindsight] Bank init failed (will retry on next call):', err);
  }
}

/**
 * Store a memory string in Hindsight.
 * Call after every interview answer evaluation, rectification, or rerun.
 */
export async function retainMemory(text: string): Promise<void> {
  const c = getClient();
  if (!c) return;
  try {
    if (!bankReady) await initHindsightBank();
    await c.retain(BANK_ID, text);
  } catch (err) {
    console.warn('[Hindsight] retain failed:', err);
  }
}

/**
 * Recall relevant memories for a given query.
 * Returns a plain string of concatenated memory snippets, ready to inject into a prompt.
 * Returns empty string if Hindsight is not configured or recall fails.
 */
export async function recallMemories(query: string): Promise<string> {
  const c = getClient();
  if (!c) return '';
  try {
    if (!bankReady) await initHindsightBank();
    const results = await c.recall(BANK_ID, query, { budget: 'mid' });
    // results is an array of memory objects with a .text / .content field
    if (!results || !Array.isArray(results)) return '';
    return (results as any[])
      .map((r: any) => r.text ?? r.content ?? '')
      .filter(Boolean)
      .join('\n');
  } catch (err) {
    console.warn('[Hindsight] recall failed:', err);
    return '';
  }
}

/**
 * Ask Hindsight to reflect on stored memories and answer a question.
 * Used for generating memory-grounded strategy summaries.
 * Returns empty string if Hindsight is not configured or reflect fails.
 */
export async function reflectOnMemories(query: string): Promise<string> {
  const c = getClient();
  if (!c) return '';
  try {
    if (!bankReady) await initHindsightBank();
    const response = await c.reflect(BANK_ID, query, { budget: 'mid' });
    return (response as any)?.text ?? '';
  } catch (err) {
    console.warn('[Hindsight] reflect failed:', err);
    return '';
  }
}

/** Whether Hindsight is configured (key present). */
export function isHindsightEnabled(): boolean {
  return Boolean(HINDSIGHT_API_KEY);
}
