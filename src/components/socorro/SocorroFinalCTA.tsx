import FloatingOrbs from "./primitives/FloatingOrbs";
import ScrollReveal from "./primitives/ScrollReveal";
import GoldCTA from "./primitives/GoldCTA";

export default function SocorroFinalCTA() {
  return (
    <section
      className="relative py-28 sm:py-36 px-6 overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at center, #142E26 0%, #0D1F1A 70%)",
      }}
    >
      <FloatingOrbs variant="dark" />

      {/* Particles */}
      <div className="socorro-particles" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="socorro-particle"
            style={{
              left: `${8 + Math.random() * 84}%`,
              bottom: `${Math.random() * 20}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${6 + Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[800px] mx-auto">
        <ScrollReveal>
          <div
            className="socorro-conic-border p-10 sm:p-16 text-center"
            style={{ backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
          >
            <h2
              className="socorro-shimmer-text-light mb-6"
              style={{
                fontFamily: "'Clash Display', system-ui, sans-serif",
                fontSize: "clamp(28px, 4.5vw, 48px)",
                fontWeight: 700,
                lineHeight: 1.15,
              }}
            >
              You Now Know What the Gap Looks Like.
              <br />
              Are You Going to Close It?
            </h2>

            <p
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "16px",
                color: "rgba(240,242,241,0.55)",
                lineHeight: 1.7,
                maxWidth: "500px",
                margin: "0 auto 40px",
              }}
            >
              This call is free. It's confidential. And it could be the most
              important 15 minutes of your financial life.
            </p>

            <div className="socorro-glow-cta inline-block rounded-full">
              <GoldCTA href="/socorro-isd/advisors" size="lg">
                Book Your Discovery Call &rarr;
              </GoldCTA>
            </div>

            <p
              className="mt-7"
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: "12px",
                color: "rgba(240,242,241,0.3)",
                letterSpacing: "0.05em",
              }}
            >
              No cost &middot; No commitment &middot; Your finances, your decision
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
