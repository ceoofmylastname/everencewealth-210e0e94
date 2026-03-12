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
              Take the First Step Toward
              <br />
              Financial Clarity
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
              Book a free, no-obligation session with one of our advisors
              during the Socorro ISD workshop week. Spots are limited.
            </p>

            <GoldCTA href="/socorro-isd/advisors" size="lg">
              Choose Your Advisor &rarr;
            </GoldCTA>

            <p
              className="mt-6"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "13px",
                color: "rgba(240,242,241,0.35)",
              }}
            >
              100% free &middot; No sales pressure &middot; Confidential
            </p>
          </GlassCard>
        </ScrollReveal>
      </div>
    </section>
  );
}
