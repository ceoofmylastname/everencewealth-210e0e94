import { type ReactNode } from "react";

interface ShimmerHeadlineProps {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "span";
  className?: string;
  variant?: "dark" | "light";
  style?: React.CSSProperties;
}

export default function ShimmerHeadline({
  children,
  as: Tag = "h2",
  className = "",
  variant = "dark",
  style,
}: ShimmerHeadlineProps) {
  const shimmerClass = variant === "light"
    ? "socorro-shimmer-text-light"
    : "socorro-shimmer-text";

  return (
    <Tag
      className={`font-cormorant font-bold ${shimmerClass} ${className}`}
      style={style}
    >
      {children}
    </Tag>
  );
}
