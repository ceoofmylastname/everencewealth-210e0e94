import { useRef, type MouseEvent } from "react";
import RevealElement from "../RevealElement";
import GoldUnderline from "../animations/GoldUnderline";
import imgCritical from "@/assets/benefit-critical-illness.jpg";
import imgChronic from "@/assets/benefit-chronic-illness.jpg";
import imgTerminal from "@/assets/benefit-terminal-illness.jpg";
import imgReplacement from "@/assets/benefit-income-replacement.jpg";

const benefits = [
  {
    title: "Critical Illness / Critical Injury Benefit",
    desc: "Millions suffer heart attack, stroke or cancer",
    image: imgCritical,
  },
  {
    title: "Chronic Illness Benefit",
    desc: "Long Term Care alternative — 90% don't own this",
    image: imgChronic,
  },
  {
    title: "Terminal Illness Benefit",
    desc: "12–24 months to live",
    image: imgTerminal,
  },
  {
    title: "Die Too Soon / Income Replacement",
    desc: "Family protection in the event of premature death",
    image: imgReplacement,
  },
];

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px) scale(1.02)`;
  };

  const handleLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0px) scale(1)";
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transition: "transform 0.3s ease-out" }}
    >
      {children}
    </div>
  );
}

export default function Slide23_PlanBenefits() {
  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-slide-inner">
        {/* Title */}
        <RevealElement index={1} direction="slam" className="mb-2">
          <h2 className="text-4xl font-bold" style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}>
            Plan <GoldUnderline>Benefits</GoldUnderline>
          </h2>
          <p className="text-base mt-2" style={{ color: "#4A5565" }}>
            Advantage inside the indexed plan
          </p>
        </RevealElement>

        {/* Benefit cards — 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {benefits.map((ben, i) => (
            <RevealElement key={ben.title} index={i + 2} direction="cardRise">
              <TiltCard>
                <div
                  className="rounded-2xl overflow-hidden relative group cursor-default"
                  style={{
                    height: "220px",
                    boxShadow: "0 8px 32px -8px rgba(0,0,0,0.18), 0 2px 8px -2px rgba(0,0,0,0.08)",
                  }}
                >
                  {/* Background image */}
                  <img
                    src={ben.image}
                    alt={ben.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Dark gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.1) 100%)",
                    }}
                  />

                  {/* Text content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div
                      className="rounded-xl px-4 py-3"
                      style={{
                        background: "rgba(26, 77, 62, 0.85)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(200, 169, 110, 0.2)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                      }}
                    >
                      <h3 className="text-base font-bold text-white mb-0.5">{ben.title}</h3>
                      <p className="text-sm text-white/75">{ben.desc}</p>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </RevealElement>
          ))}
        </div>
      </div>
    </div>
  );
}
