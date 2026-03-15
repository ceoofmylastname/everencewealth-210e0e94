import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import BlobClip from "../BlobClip";
import MeshGradient from "../MeshGradient";
import MorphBlob from "../MorphBlob";

const benefits = [
  "Build a business on your own schedule",
  "Help families protect their retirement",
  "Uncapped earning potential",
  "Full training and mentorship provided",
];

export default function Slide25_TheOpportunity() {
  return (
    <div className="antigravity-slide" style={{ background: "transparent" }}>
      <MeshGradient variant="gold" />
      <MorphBlob size={340} color="rgba(200, 169, 110, 0.12)" top="-7%" right="-5%" delay={0} />
      <MorphBlob size={280} color="rgba(26, 77, 62, 0.08)" bottom="-6%" left="-4%" delay={3} />
      <div className="antigravity-editorial">
        {/* Left */}
        <div>
          {/* Reveal 1: Title */}
          <RevealElement index={1} direction="slam">
            <h2 className="text-4xl font-bold mb-2" style={{ color: "var(--ev-green)", fontFamily: "var(--font-display)" }}>
              The <GradientText>Opportunity</GradientText>
            </h2>
            <p className="text-lg mb-8" style={{ color: "var(--ev-text-light)" }}>
              Join the Everence Wealth team and help families bridge their retirement gap.
            </p>
          </RevealElement>

          {/* Reveal 2: Benefits list */}
          <RevealElement index={2} direction="cardRise">
            <div className="space-y-3">
              {benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.45)", boxShadow: "0 2px 8px rgba(26,77,62,0.08)" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--ev-gold)", color: "white", fontWeight: 700, fontSize: 14 }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-base" style={{ color: "var(--ev-green)" }}>{benefit}</span>
                </div>
              ))}
            </div>
          </RevealElement>

          {/* Reveal 3: CTA */}
          <RevealElement index={3} direction="explode" className="mt-6">
            <div
              className="inline-block px-6 py-3 rounded-xl text-lg font-bold"
              style={{ background: "#1A4D3E", color: "white" }}
            >
              Learn More About Joining →
            </div>
          </RevealElement>
        </div>

        {/* Right — Blob image */}
        <RevealElement index={4} direction="right" className="flex items-center justify-center">
          <BlobClip
            gradient="linear-gradient(135deg, #1A4D3E 0%, #C8A96E 60%, #0D1F1A 100%)"
            label="Team collaboration"
            height="380px"
            variant={1}
          />
        </RevealElement>
      </div>
    </div>
  );
}
