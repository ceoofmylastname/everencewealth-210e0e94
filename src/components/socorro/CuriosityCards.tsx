import ScrollReveal from "./primitives/ScrollReveal";
import GlassCard from "./primitives/GlassCard";
import ShimmerHeadline from "./primitives/ShimmerHeadline";

const cards = [
  {
    icon: "🔒",
    question:
      "Your 401(k) isn't as safe as you thought — and now you know why.",
  },
  {
    icon: "💰",
    question:
      "The fees you're paying could cost you six figures by retirement.",
  },
  {
    icon: "📊",
    question:
      "There are tax strategies your HR department was never required to share.",
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
            What the Workshop Revealed
          </span>
          <ShimmerHeadline as="h2" className="mt-3 mb-12 text-[clamp(28px,4vw,40px)]">
            You Can't Unsee the Truth
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
            The question isn't whether these apply to you. It's what you're
            going to do about it.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
