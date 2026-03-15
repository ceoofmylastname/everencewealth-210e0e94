import { Lock, DollarSign, BarChart3 } from "lucide-react";
import ScrollReveal from "./primitives/ScrollReveal";
import GlassCard from "./primitives/GlassCard";
import ShimmerHeadline from "./primitives/ShimmerHeadline";

const cards = [
  {
    icon: Lock,
    num: "01",
    question: "Your 401(k) isn't as safe as you thought — and now you know why.",
  },
  {
    icon: DollarSign,
    num: "02",
    question: "The fees you're paying could cost you six figures by retirement.",
  },
  {
    icon: BarChart3,
    num: "03",
    question: "There are tax strategies your HR department was never required to share.",
  },
];

export default function CuriosityCards() {
  return (
    <section className="py-20 sm:py-28 px-6 socorro-dot-grid" style={{ background: "#F7F9F8" }}>
      <div className="max-w-[1200px] mx-auto">
        <ScrollReveal>
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
            What the Workshop Revealed
          </span>
          <ShimmerHeadline as="h2" className="mt-3 mb-12 text-[clamp(28px,4vw,40px)]">
            You Can't Unsee the Truth
          </ShimmerHeadline>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <ScrollReveal key={i} delay={i * 0.12}>
              <GlassCard variant="light" hover3d className="p-8 h-full socorro-hover-glow relative overflow-hidden">
                {/* Gold left border accent */}
                <div
                  className="absolute top-4 bottom-4 left-0 w-[3px] rounded-full"
                  style={{
                    background: "linear-gradient(180deg, #C8A96E, #E2C896, #C8A96E)",
                  }}
                />

                {/* Number label */}
                <span
                  style={{
                    fontFamily: "'Clash Display', system-ui, sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "rgba(200, 169, 110, 0.4)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {card.num}
                </span>

                {/* Icon in gold circle */}
                <div
                  className="mt-4 mb-5 flex items-center justify-center"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "rgba(200, 169, 110, 0.1)",
                    border: "1px solid rgba(200, 169, 110, 0.2)",
                  }}
                >
                  <card.icon size={22} strokeWidth={1.5} color="#C8A96E" />
                </div>

                <p
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontSize: "17px",
                    fontWeight: 500,
                    color: "#1A4D3E",
                    lineHeight: 1.5,
                  }}
                >
                  {card.question}
                </p>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.4}>
          <p
            className="mt-10 text-sm"
            style={{
              color: "#4A5565",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontStyle: "italic",
            }}
          >
            The question isn't whether these apply to you. It's what you're going to do about it.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
