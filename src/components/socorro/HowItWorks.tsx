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
    <section style={{ background: "#F7F9F8" }} className="py-20 sm:py-28">
      <div className="max-w-[1100px] mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "12px",
                fontWeight: 700,
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
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              Here's How the Call Works
            </h2>
          </div>
        </ScrollReveal>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div
            className="hidden md:block absolute top-[72px] left-[16%] right-[16%] h-[2px]"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.3), transparent)",
            }}
            aria-hidden="true"
          />

          {steps.map((step, i) => (
            <ScrollReveal key={step.num} delay={i * 0.12}>
              <GlassCard variant="light" hover3d className="p-8 text-center relative">
                {/* Number circle */}
                <div
                  className="mx-auto mb-5 flex items-center justify-center"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #C8A96E, #E2C896)",
                    color: "#0D1F1A",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "18px",
                    fontWeight: 700,
                  }}
                >
                  {step.num}
                </div>

                {/* Icon */}
                <step.icon
                  className="mx-auto mb-4"
                  size={28}
                  strokeWidth={1.5}
                  color="#1A4D3E"
                />

                {/* Title */}
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#1A4D3E",
                    marginBottom: "8px",
                  }}
                >
                  {step.title}
                </h3>

                {/* Description */}
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
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
