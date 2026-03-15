import ScrollReveal from "./primitives/ScrollReveal";
import GlassCard from "./primitives/GlassCard";
import { UserRound, CalendarDays, Handshake } from "lucide-react";

const steps = [
  {
    num: 1,
    icon: UserRound,
    title: "Pick Your Advisor",
    desc: "Choose from our licensed team — someone who understands public school retirement.",
  },
  {
    num: 2,
    icon: CalendarDays,
    title: "Schedule 15 Minutes",
    desc: "Pick a time that works. No prep needed — just show up.",
  },
  {
    num: 3,
    icon: Handshake,
    title: "Get Your Personal Snapshot",
    desc: "We'll walk through your current situation and show you what's possible. No pressure. No pitch.",
  },
];

export default function HowItWorks() {
  return (
    <section style={{ background: "#F7F9F8" }} className="py-20 sm:py-28 relative">
      {/* Dot grid texture */}
      <div className="absolute inset-0 socorro-dot-grid pointer-events-none" />

      <div className="relative max-w-[1100px] mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                color: "#C8A96E",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
              }}
            >
              Your Next Move
            </span>
            <h2
              className="socorro-shimmer-text mt-3"
              style={{
                fontFamily: "'Clash Display', system-ui, sans-serif",
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              Here's How the Call Works
            </h2>
          </div>
        </ScrollReveal>

        {/* Steps — horizontal on desktop, vertical on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting dotted line (desktop) */}
          <div
            className="hidden md:block absolute top-[44px] left-[18%] right-[18%] h-[2px]"
            style={{
              backgroundImage: "repeating-linear-gradient(90deg, rgba(200,169,110,0.3) 0px, rgba(200,169,110,0.3) 6px, transparent 6px, transparent 14px)",
            }}
            aria-hidden="true"
          />

          {steps.map((step, i) => (
            <ScrollReveal key={step.num} delay={i * 0.15}>
              <div className="flex flex-col items-center text-center">
                {/* Number ring with glow */}
                <div className="socorro-ring-number mb-6 relative z-10">
                  {step.num}
                </div>

                <GlassCard variant="light" hover3d className="p-7 w-full socorro-hover-glow">
                  {/* Icon in glass circle */}
                  <div
                    className="mx-auto mb-4 flex items-center justify-center"
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: "rgba(200, 169, 110, 0.08)",
                      border: "1px solid rgba(200, 169, 110, 0.15)",
                    }}
                  >
                    <step.icon size={24} strokeWidth={1.5} color="#1A4D3E" />
                  </div>

                  <h3
                    style={{
                      fontFamily: "'Clash Display', system-ui, sans-serif",
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "#1A4D3E",
                      marginBottom: "8px",
                    }}
                  >
                    {step.title}
                  </h3>

                  <p
                    style={{
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      fontSize: "14px",
                      color: "#4A5565",
                      lineHeight: 1.6,
                    }}
                  >
                    {step.desc}
                  </p>
                </GlassCard>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
