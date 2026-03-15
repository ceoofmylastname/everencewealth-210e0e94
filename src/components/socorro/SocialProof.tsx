import { useEffect, useRef, useState } from "react";
import { Shield, TrendingUp, Users } from "lucide-react";
import ScrollReveal from "./primitives/ScrollReveal";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  icon: typeof Shield;
  prefix?: string;
}

const stats: StatItem[] = [
  { value: 500, suffix: "+", label: "Families Served", icon: Users },
  { value: 20, suffix: "+", label: "Years Experience", icon: Shield },
  { value: 150, suffix: "M+", label: "Assets Protected", icon: TrendingUp, prefix: "$" },
];

function AnimatedNumber({ value, suffix, label, icon: Icon, prefix }: StatItem) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 1200;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div
      ref={ref}
      className="socorro-glass px-8 py-6 text-center flex-1 min-w-[200px] relative overflow-hidden"
      style={{
        borderTop: "2px solid rgba(200, 169, 110, 0.25)",
      }}
    >
      <Icon
        size={20}
        strokeWidth={1.5}
        className="mx-auto mb-3"
        style={{ color: "rgba(200, 169, 110, 0.5)" }}
      />
      <div
        style={{
          fontFamily: "'Clash Display', system-ui, sans-serif",
          fontSize: "clamp(32px, 4vw, 48px)",
          fontWeight: 700,
          color: "#C8A96E",
          lineHeight: 1.1,
        }}
      >
        {prefix}{display}{suffix}
      </div>
      <div
        style={{
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontSize: "12px",
          fontWeight: 500,
          color: "rgba(240, 242, 241, 0.5)",
          marginTop: "8px",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function SocialProof() {
  return (
    <section style={{ background: "#0D1F1A" }} className="py-16 sm:py-20 relative">
      {/* Gradient divider from hero */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.2), transparent)",
        }}
      />
      <div className="max-w-[1000px] mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4">
            {stats.map((stat, i) => (
              <AnimatedNumber key={i} {...stat} />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
