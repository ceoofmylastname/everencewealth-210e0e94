/**
 * Shared editorial-image prompt builder.
 *
 * Produces a photorealistic, human-centric prompt for KIE.ai Nano Banana 2
 * derived from an article/QA/location title and its first paragraph.
 *
 * Hard constraints prevent any logos, readable text, third-party brand names,
 * cartoon/illustration styles, crypto imagery, or Spanish-language signage.
 */

export interface EditorialPromptInput {
  title: string;
  firstParagraph: string;
}

/**
 * Strip HTML tags + collapse whitespace from a content string.
 * Returns plain text safe to embed in a prompt.
 */
export function stripHtml(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Trim plain text to roughly `maxChars`, preferring the nearest sentence break.
 */
export function firstParagraphFromContent(
  content: string | null | undefined,
  maxChars = 300
): string {
  const plain = stripHtml(content);
  if (plain.length <= maxChars) return plain;

  const slice = plain.slice(0, maxChars);
  const lastStop = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("? "),
    slice.lastIndexOf("! ")
  );
  if (lastStop > maxChars * 0.5) {
    return slice.slice(0, lastStop + 1).trim();
  }
  // No good sentence boundary — fall back to last whitespace
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trim() + "…";
}

/**
 * Build the canonical editorial image prompt for KIE.ai Nano Banana 2.
 * Single source of truth — used by article, cluster, location, and QA generators.
 */
export function buildEditorialImagePrompt({
  title,
  firstParagraph,
}: EditorialPromptInput): string {
  const safeTitle = (title || "").trim() || "wealth management planning";
  const safeParagraph =
    (firstParagraph || "").trim() ||
    "A mature American household considering long-term financial decisions with calm confidence.";

  return `Photorealistic editorial-quality image illustrating: ${safeTitle}.

Visual concept derived from: ${safeParagraph}

Style: cinematic professional photography, natural lighting, documentary realism, financial planning context, mature professional audience.

Subject focus: human-centric storytelling that conveys the article's emotional core (retirement security, financial confidence, family legacy, generational wealth, etc.) through facial expression, body language, and environmental context.

HARD CONSTRAINTS — IMAGE MUST NOT CONTAIN:
- Any company logos, brand marks, trademarks, or product packaging
- Any readable text, captions, watermarks, signs, or screen displays
- Any third-party brand names (banks, insurance carriers, financial products, software platforms, news outlets, etc.)
- Stock photo aesthetic, generic AI look, plastic/synthetic skin
- Cartoon, illustration, or vector art styles
- Crypto, NFT, or speculative-finance imagery
- Spanish-language signage (this is a US-market wealth firm)

Required: 16:9 aspect ratio, 2K resolution, color-graded for professional financial publication.`;
}

/**
 * Negative-suffix appended on retry when the brand-detection vision check
 * still flags the first generation. Keeps the directive short and direct.
 */
export const BRAND_RETRY_SUFFIX =
  " --strictly no brand marks, no readable text, no signage, no logos of any kind, no wordmarks, no on-screen text";
