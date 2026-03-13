import type { ReactNode, CSSProperties } from "react";

interface TextProps {
  children: ReactNode;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

/** Playfair Display 900 — hero scale, for slide titles */
export function HeroText({ children, color = "white", className = "", style }: TextProps) {
  return (
    <span
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "var(--t-hero)",
        fontWeight: 900,
        lineHeight: "var(--lh-display)",
        letterSpacing: "var(--ls-hero)",
        color,
        display: "block",
        ...style,
      }}
      className={className}
    >
      {children}
    </span>
  );
}

/** Playfair Display 900 italic — for key dramatic words (Gap., Buffett., Interest.) */
export function HeroItalic({ children, color = "#C8A96E", className = "", style }: TextProps) {
  return (
    <span
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "var(--t-hero)",
        fontWeight: 900,
        fontStyle: "italic",
        lineHeight: "var(--lh-display)",
        letterSpacing: "-0.01em",
        color,
        display: "block",
        ...style,
      }}
      className={className}
    >
      {children}
    </span>
  );
}

/** Playfair Display 800 — section headlines */
export function DisplayText({ children, color = "#1A4D3E", className = "", style }: TextProps) {
  return (
    <span
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "var(--t-display)",
        fontWeight: 800,
        lineHeight: "var(--lh-title)",
        letterSpacing: "-0.02em",
        color,
        display: "block",
        ...style,
      }}
      className={className}
    >
      {children}
    </span>
  );
}

/** Playfair Display 700 — smaller section titles */
export function TitleText({ children, color = "#1A4D3E", className = "", style }: TextProps) {
  return (
    <span
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "var(--t-title)",
        fontWeight: 700,
        lineHeight: "var(--lh-title)",
        letterSpacing: "-0.02em",
        color,
        display: "block",
        ...style,
      }}
      className={className}
    >
      {children}
    </span>
  );
}

/** DM Sans 300 — eyebrow tags, all caps */
export function Eyebrow({ children, color = "rgba(200,169,110,0.7)", className = "", style }: TextProps) {
  return (
    <span
      style={{
        fontFamily: "var(--font-body)",
        fontSize: "var(--t-eyebrow)",
        fontWeight: 300,
        letterSpacing: "var(--ls-eyebrow)",
        textTransform: "uppercase" as const,
        color,
        display: "block",
        ...style,
      }}
      className={className}
    >
      {children}
    </span>
  );
}

/** DM Sans 200 italic — subtitles, captions */
export function LeadText({ children, color = "rgba(255,255,255,0.45)", className = "", style }: TextProps) {
  return (
    <span
      style={{
        fontFamily: "var(--font-body)",
        fontSize: "var(--t-lead)",
        fontWeight: 200,
        fontStyle: "italic",
        lineHeight: "var(--lh-body)",
        letterSpacing: "0.02em",
        color,
        display: "block",
        ...style,
      }}
      className={className}
    >
      {children}
    </span>
  );
}

/** DM Mono 500 — ALL numbers, dollar amounts, percentages, years */
export function StatNumber({ children, color = "#1A4D3E", className = "", style }: TextProps) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--t-stat)",
        fontWeight: 500,
        letterSpacing: "var(--ls-mono)",
        fontVariantNumeric: "tabular-nums",
        color,
        display: "inline",
        ...style,
      }}
      className={className}
    >
      {children}
    </span>
  );
}

/** DM Mono 400 — data table values */
export function DataText({ children, color = "#1A4D3E", className = "", style }: TextProps) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--t-data)",
        fontWeight: 400,
        letterSpacing: "var(--ls-mono)",
        fontVariantNumeric: "tabular-nums",
        color,
        display: "inline",
        ...style,
      }}
      className={className}
    >
      {children}
    </span>
  );
}

/** DM Sans 400 — regular body text */
export function BodyText({ children, color = "#4A5565", className = "", style }: TextProps) {
  return (
    <span
      style={{
        fontFamily: "var(--font-body)",
        fontSize: "var(--t-body)",
        fontWeight: 400,
        lineHeight: "var(--lh-body)",
        color,
        display: "block",
        ...style,
      }}
      className={className}
    >
      {children}
    </span>
  );
}
