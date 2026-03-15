import FloatingOrbs from "./primitives/FloatingOrbs";
import ScrollReveal from "./primitives/ScrollReveal";
import ShimmerHeadline from "./primitives/ShimmerHeadline";
import GoldCTA from "./primitives/GoldCTA";
import GlassCard from "./primitives/GlassCard";

export default function SocorroFinalCTA() {
  return (
    <section
      className="relative py-24 sm:py-32 px-6 overflow-hidden"
      style={{ background: "#0D1F1A" }}
    >
      <FloatingOrbs variant="dark" />

      <div className="relative z-10 max-w-[800px] mx-auto">
        <ScrollReveal>
          <GlassCard className="p-10 sm:p-14 text-center">
            <ShimmerHeadline
              as="h2"
              variant="light"
              className="text-[clamp(28px,4vw,44px)] leading-[1.2] mb-5"
            >
              You Already Know What's at Stake.
              <br />
              Are You Going to Act?
            </ShimmerHeadline>

            <p
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "16px",
                color: "rgba(240,242,241,0.65)",
                lineHeight: 1.6,
                maxWidth: "520px",
                margin: "0 auto 36px",
              }}
            >
              This call is free. It's confidential. And it could be the most
              important 15 minutes of your financial life. Don't let what you
              learned at the workshop go to waste.
            </p>

            <GoldCTA href="/socorro-isd/advisors" size="lg">
              Book Your Discovery Call &rarr;
            </GoldCTA>

            <p
              className="mt-6"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "13px",
                color: "rgba(240,242,241,0.35)",
              }}
            >
              No cost &middot; No commitment &middot; Your finances, your decision
            </p>
          </GlassCard>
        </ScrollReveal>
      </div>
    </section>
  );
}
