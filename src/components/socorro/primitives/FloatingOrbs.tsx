interface FloatingOrbsProps {
  variant?: "dark" | "light";
}

const orbConfigs = [
  { size: 260, top: "8%", left: "5%", delay: "0s", gold: true },
  { size: 180, top: "60%", right: "8%", delay: "-5s", gold: false },
  { size: 140, bottom: "15%", left: "20%", delay: "-12s", gold: true },
  { size: 200, top: "30%", right: "25%", delay: "-8s", gold: false },
];

export default function FloatingOrbs({ variant = "dark" }: FloatingOrbsProps) {
  const goldColor = variant === "dark"
    ? "rgba(200, 169, 110, 0.06)"
    : "rgba(200, 169, 110, 0.08)";
  const greenColor = variant === "dark"
    ? "rgba(26, 77, 62, 0.08)"
    : "rgba(26, 77, 62, 0.05)";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {orbConfigs.map((orb, i) => (
        <div
          key={i}
          className="socorro-orb"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            right: (orb as any).right,
            bottom: (orb as any).bottom,
            background: `radial-gradient(circle, ${orb.gold ? goldColor : greenColor} 0%, transparent 70%)`,
            filter: `blur(${60 + i * 10}px)`,
            animationDelay: orb.delay,
          }}
        />
      ))}
    </div>
  );
}
