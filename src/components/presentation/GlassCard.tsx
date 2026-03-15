import type { ReactNode, CSSProperties } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  dark?: boolean;
  style?: CSSProperties;
}

export default function GlassCard({ children, className = "", hover = true, dark = false, style }: GlassCardProps) {
  const baseStyles: CSSProperties = dark
    ? {
        background: "rgba(26, 77, 62, 0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(200, 169, 110, 0.2)",
        borderRadius: "var(--radius-md)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
        padding: 24,
        color: "white",
        transition: hover ? "transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease" : undefined,
      }
    : {
        background: "rgba(255, 255, 255, 0.45)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        borderRadius: "var(--radius-md)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
        padding: 24,
        transition: hover ? "transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease" : undefined,
      };

  return (
    <div className={`${hover ? "ag-card-lift" : ""} ${className}`} style={{ ...baseStyles, ...style }}>
      {children}
    </div>
  );
}
