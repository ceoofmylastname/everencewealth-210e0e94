import { useEffect, useRef, useState } from "react";
import ScrollReveal from "./primitives/ScrollReveal";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  { value: 500, suffix: "+", label: "Families Served" },
  { value: 20, suffix: "+", label: "Years Experience" },
  { value: 150, suffix: "M+", label: "Assets Protected" },
];

function AnimatedNumber({ value, suffix, label }: StatItem) {
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
    <div ref={ref} className="text-center px-6 py-4">
      <div
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(36px, 5vw, 52px)",
          fontWeight: 700,
          color: "#C8A96E",
          lineHeight: 1.1,
        }}
      >
        {value >= 100 ? "$" : ""}
        {display}
        {suffix}
      </div>
      <div
        style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: "13px",
          fontWeight: 500,
          color: "rgba(240, 242, 241, 0.6)",
          marginTop: "6px",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function SocialProof() {
  return (
    <section
      style={{ background: "#0D1F1A" }}
      className="py-16 sm:py-20"
    >
      <div className="max-w-[1000px] mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0 sm:divide-x divide-[rgba(200,169,110,0.15)]">
            {stats.map((stat, i) => (
              <AnimatedNumber key={i} {...stat} />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
