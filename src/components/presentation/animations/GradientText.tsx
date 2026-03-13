import type { ReactNode, CSSProperties } from "react";

interface GoldShimmerProps {
  children: ReactNode;
  className?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: number | string;
  fontStyle?: string;
  lineHeight?: string | number;
  letterSpacing?: string;
  style?: CSSProperties;
}

/**
 * GoldShimmer — animated gold gradient text.
 * Use on dramatic key words: Gap., Buffett., Interest., Truth., Zero.
 * Defaults to Playfair Display 900 italic at hero scale.
 */
export default function GradientText({
  children,
  className = "",
  fontSize,
  fontFamily = "var(--font-display, 'Playfair Display', serif)",
  fontWeight = 900,
  fontStyle = "italic",
  lineHeight,
  letterSpacing = "-0.01em",
  style,
}: GoldShimmerProps) {
  return (
    <span
      className={className}
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        fontStyle,
        lineHeight,
        letterSpacing,
        background:
          "linear-gradient(90deg, #C8A96E 0%, #F5E6C8 20%, #C8A96E 40%, #8B6914 60%, #F5E6C8 80%, #C8A96E 100%)",
        backgroundSize: "300% auto",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        animation: "goldShimmer 4s linear infinite",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
