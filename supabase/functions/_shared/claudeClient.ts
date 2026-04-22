// Shared Anthropic Claude client for all content-writing edge functions.
// Centralizes API auth, model selection, JSON extraction, and error handling.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export const CLAUDE_MODELS = {
  // Long-form content: full articles, translations
  sonnet: "claude-sonnet-4-5-20250929",
  // Short / fast: Q&As, section regen, headlines, meta
  haiku: "claude-haiku-4-5-20251001",
} as const;

export type ClaudeModel = typeof CLAUDE_MODELS[keyof typeof CLAUDE_MODELS] | string;

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CallClaudeOptions {
  model?: ClaudeModel;
  system?: string;
  messages?: ClaudeMessage[];
  prompt?: string; // shorthand: single user message
  maxTokens?: number;
  temperature?: number;
  apiKey?: string; // override; falls back to CLAUDE_API_KEY then ANTHROPIC_API_KEY
  timeoutMs?: number; // per-request timeout; default 120_000 (2 min)
}

export interface ClaudeResponse {
  text: string;
  raw: any;
}

function getApiKey(override?: string): string {
  const key =
    override ||
    Deno.env.get("CLAUDE_API_KEY") ||
    Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) {
    throw new Error(
      "CLAUDE_API_KEY (or ANTHROPIC_API_KEY) is not configured in edge function secrets",
    );
  }
  return key;
}

/**
 * Call the Anthropic Messages API and return the first text block.
 * Throws friendly errors that mirror the OpenAI/Lovable surface for 429/402/529.
 */
export async function callClaude(opts: CallClaudeOptions): Promise<ClaudeResponse> {
  const apiKey = getApiKey(opts.apiKey);
  const model = opts.model || CLAUDE_MODELS.sonnet;
  const maxTokens = opts.maxTokens ?? 4096;
  const timeoutMs = opts.timeoutMs ?? 120_000;

  const messages: ClaudeMessage[] = opts.messages
    ? opts.messages
    : opts.prompt
    ? [{ role: "user", content: opts.prompt }]
    : [];

  if (messages.length === 0) {
    throw new Error("callClaude requires either `messages` or `prompt`");
  }

  const body: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    messages,
  };
  if (opts.system) body.system = opts.system;
  if (opts.temperature !== undefined) body.temperature = opts.temperature;

  let response: Response;
  try {
    response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    const name = (err as any)?.name;
    if (name === "TimeoutError" || name === "AbortError") {
      throw new Error("claude_timeout");
    }
    throw err;
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    if (response.status === 429) {
      throw new Error("Claude rate limit exceeded. Please wait and try again.");
    }
    if (response.status === 529) {
      throw new Error("Claude API overloaded. Please retry shortly.");
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `Claude auth error (${response.status}): check CLAUDE_API_KEY. ${errText}`,
      );
    }
    throw new Error(`Claude API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text: string = data?.content?.[0]?.text ?? "";
  if (!text) {
    throw new Error("Claude returned empty content");
  }
  return { text, raw: data };
}

/**
 * Robust JSON extraction from a model response.
 * Handles raw JSON, ```json fenced blocks, and substring fallback.
 */
export function extractJsonFromResponse<T = any>(text: string): T {
  const trimmed = (text || "").trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // fenced ```json ... ```
    const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) {
      try {
        return JSON.parse(fence[1].trim()) as T;
      } catch {
        // fall through
      }
    }
    // first {...} or [...] substring
    const objMatch = trimmed.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[0]) as T;
      } catch {
        // fall through
      }
    }
    const arrMatch = trimmed.match(/\[[\s\S]*\]/);
    if (arrMatch) {
      try {
        return JSON.parse(arrMatch[0]) as T;
      } catch {
        // fall through
      }
    }
    throw new Error(`Failed to parse JSON from Claude response: ${trimmed.slice(0, 200)}`);
  }
}

/**
 * Convenience: call Claude and parse the response as JSON.
 * Adds an instruction to the system prompt to return ONLY JSON.
 */
export async function callClaudeJson<T = any>(opts: CallClaudeOptions): Promise<T> {
  const jsonInstruction =
    "Return ONLY valid JSON. No prose, no markdown fences, no commentary before or after the JSON object.";
  const system = opts.system
    ? `${opts.system}\n\n${jsonInstruction}`
    : jsonInstruction;
  const { text } = await callClaude({ ...opts, system });
  return extractJsonFromResponse<T>(text);
}