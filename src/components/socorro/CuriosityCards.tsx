import ScrollReveal from "./primitives/ScrollReveal";
import GlassCard from "./primitives/GlassCard";
import ShimmerHeadline from "./primitives/ShimmerHeadline";

const cards = [
  {
    icon: "🔒",
    question:
      "Is your current retirement account actually protected from market losses?",
  },
  {
    icon: "💰",
    question:
      "How much are hidden fees silently costing you over 30 years?",
  },
  {
    icon: "📊",
    question:
      "Are there tax strategies your HR department was never required to tell you about?",
  },
];

export default function CuriosityCards() {
  return (
    <section className="py-20 sm:py-28 px-6" style={{ background: "#F7F9F8" }}>
      <div className="max-w-[1200px] mx-auto">
        <ScrollReveal>
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
            What You'll Discover
          </span>
          <ShimmerHeadline as="h2" className="mt-3 mb-12 text-[clamp(28px,4vw,40px)]">
            Questions Worth Asking
          </ShimmerHeadline>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <ScrollReveal key={i} delay={i * 0.12}>
              <GlassCard variant="light" hover3d className="p-8 h-full">
                {/* Gold top border glow */}
                <div
                  className="absolute top-0 left-4 right-4 h-[3px] rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #C8A96E, transparent)",
                  }}
                />

                <span className="text-2xl block mb-5">{card.icon}</span>
                <p
                  style={{
                    fontFamily:
                      "'Cormorant Garamond', Georgia, serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#1A4D3E",
                    lineHeight: 1.4,
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
            className="mt-10 text-sm italic"
            style={{
              color: "#4A5565",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            These aren't trick questions. They're the starting point for every
            conversation we have.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
