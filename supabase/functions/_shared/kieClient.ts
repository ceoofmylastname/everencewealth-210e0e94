/**
 * Shared Kie.ai client for Nano Banana 2 image generation.
 * Replaces Fal.ai across all edge functions.
 *
 * API:
 *   POST  https://api.kie.ai/api/v1/jobs/createTask        → { code, data: { taskId } }
 *   GET   https://api.kie.ai/api/v1/jobs/recordInfo?taskId → { data: { state, resultJson } }
 *
 * states: waiting | queuing | generating | success | fail
 */

export type KieAspectRatio =
  | "1:1" | "1:4" | "1:8" | "2:3" | "3:2" | "3:4" | "4:1" | "4:3"
  | "4:5" | "5:4" | "8:1" | "9:16" | "16:9" | "21:9" | "auto";

export type KieResolution = "1K" | "2K" | "4K";

export interface KieGenerateOptions {
  prompt: string;
  aspectRatio?: KieAspectRatio;
  resolution?: KieResolution;
  outputFormat?: "jpg" | "png";
  imageInput?: string[]; // for image-to-image edits
  numImages?: number; // 1 supported
}

export interface KieGenerateResult {
  url: string;
  allUrls: string[];
}

const KIE_BASE = "https://api.kie.ai/api/v1/jobs";
const POLL_INTERVAL_MS = 3000;
const MAX_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Map legacy Fal.ai aspect ratio strings (incl. dimension keys like "16:9")
 * to a Nano Banana 2 supported ratio.
 */
export function mapDimensionsToAspectRatio(d?: string): KieAspectRatio {
  if (!d) return "1:1";
  const map: Record<string, KieAspectRatio> = {
    "1:1": "1:1",
    "16:9": "16:9",
    "9:16": "9:16",
    "4:3": "4:3",
    "3:4": "3:4",
    "21:9": "21:9",
    "4:1": "4:1",
    "auto": "auto",
  };
  return map[d] || "1:1";
}

function friendlyError(status: number, body: string): string {
  switch (status) {
    case 401: return "Kie.ai authentication failed. Check KIE_API_KEY.";
    case 402: return "Kie.ai credits exhausted. Top up your Kie.ai account.";
    case 422: return `Kie.ai rejected the request (validation): ${body.slice(0, 300)}`;
    case 429: return "Kie.ai rate limit exceeded. Try again shortly.";
    case 500:
    case 501:
    case 502:
    case 503: return `Kie.ai server error (${status}). Try again.`;
    default: return `Kie.ai error ${status}: ${body.slice(0, 300)}`;
  }
}

async function submitTask(opts: KieGenerateOptions, apiKey: string): Promise<string> {
  const body = {
    model: "nano-banana-2",
    input: {
      prompt: opts.prompt,
      aspect_ratio: opts.aspectRatio ?? "1:1",
      resolution: opts.resolution ?? "2K",
      output_format: opts.outputFormat ?? "png",
      ...(opts.imageInput && opts.imageInput.length > 0
        ? { image_input: opts.imageInput }
        : {}),
    },
  };

  const res = await fetch(`${KIE_BASE}/createTask`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(friendlyError(res.status, text));

  let json: any;
  try { json = JSON.parse(text); } catch {
    throw new Error(`Kie.ai returned non-JSON response: ${text.slice(0, 300)}`);
  }

  if (json?.code && json.code !== 200) {
    throw new Error(`Kie.ai createTask failed (code ${json.code}): ${json.msg || JSON.stringify(json).slice(0, 200)}`);
  }

  const taskId = json?.data?.taskId || json?.data?.task_id;
  if (!taskId) throw new Error(`Kie.ai createTask returned no taskId: ${text.slice(0, 200)}`);
  return taskId;
}

async function pollTask(taskId: string, apiKey: string): Promise<string[]> {
  const start = Date.now();
  let lastState = "";
  while (Date.now() - start < MAX_TIMEOUT_MS) {
    const res = await fetch(`${KIE_BASE}/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const text = await res.text();
    if (!res.ok) throw new Error(friendlyError(res.status, text));

    let json: any;
    try { json = JSON.parse(text); } catch {
      throw new Error(`Kie.ai poll returned non-JSON: ${text.slice(0, 300)}`);
    }

    const data = json?.data ?? {};
    const state: string = data.state ?? "unknown";
    if (state !== lastState) {
      console.log(`[kie] task ${taskId.slice(0, 8)} state=${state}`);
      lastState = state;
    }

    if (state === "success") {
      const raw = data.resultJson ?? data.result_json ?? "";
      let parsed: any;
      try {
        parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {
        throw new Error(`Kie.ai success but resultJson unparseable: ${String(raw).slice(0, 200)}`);
      }
      const urls: string[] = parsed?.resultUrls || parsed?.result_urls || [];
      if (!urls.length) throw new Error(`Kie.ai success but no resultUrls: ${JSON.stringify(parsed).slice(0, 200)}`);
      return urls;
    }
    if (state === "fail") {
      throw new Error(`Kie.ai task failed: ${data.failMsg || data.fail_msg || "unknown reason"}`);
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error(`Kie.ai task ${taskId} timed out after ${MAX_TIMEOUT_MS / 1000}s`);
}

/**
 * Generate an image via Kie.ai Nano Banana 2.
 * Throws on error; returns the first result URL plus all URLs.
 */
export async function generateImage(opts: KieGenerateOptions): Promise<KieGenerateResult> {
  const apiKey = Deno.env.get("KIE_API_KEY");
  if (!apiKey) throw new Error("KIE_API_KEY is not configured");

  const taskId = await submitTask(opts, apiKey.trim());
  const urls = await pollTask(taskId, apiKey.trim());
  return { url: urls[0], allUrls: urls };
}
