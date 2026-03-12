import { type ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover3d?: boolean;
  variant?: "dark" | "light";
  style?: React.CSSProperties;
}

export default function GlassCard({
  children,
  className = "",
  hover3d = false,
  variant = "dark",
  style,
}: GlassCardProps) {
  const glassClass = variant === "light" ? "socorro-glass-light" : "socorro-glass";
  const hoverClass = hover3d ? "socorro-card-3d" : "";

  return (
    <div className={`${glassClass} ${hoverClass} ${className}`} style={style}>
      {children}
    </div>
  );
}
