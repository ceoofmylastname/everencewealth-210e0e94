interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export default function GradientText({ children, className = "" }: GradientTextProps) {
  return (
    <span
      className={`antigravity-gradient-text ${className}`}
      style={{
        background: "linear-gradient(90deg, #1A4D3E 0%, #C8A96E 30%, #1A4D3E 60%, #C8A96E 90%)",
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </span>
  );
}
