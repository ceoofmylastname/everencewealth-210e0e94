import RevealElement from "../RevealElement";
import BlobClip from "../BlobClip";
import GoldUnderline from "../animations/GoldUnderline";
import MeshGradient from "../MeshGradient";
import MorphBlob from "../MorphBlob";

export default function Slide06_WarrenBuffett() {
  return (
    <div className="antigravity-slide" style={{ background: "transparent" }}>
      <MeshGradient variant="gold" />
      <MorphBlob size={380} color="rgba(200, 169, 110, 0.15)" top="-10%" right="-6%" delay={0} />
      <MorphBlob size={300} color="rgba(26, 77, 62, 0.10)" bottom="-8%" left="-5%" delay={3} />
      <div className="antigravity-editorial">
        {/* Left Side */}
        <div>
          {/* Reveal 1: Title */}
          <RevealElement index={1} direction="slam">
            <h2 className="text-5xl font-bold mb-2" style={{ color: "var(--ev-green)", fontFamily: "var(--font-display)" }}>
              <GoldUnderline>Warren Buffett</GoldUnderline>
            </h2>
            <p className="text-2xl mb-10" style={{ color: "var(--ev-text-light)" }}>
              Rules to Building Wealth
            </p>
          </RevealElement>

          {/* Reveal 2: Rule 1 */}
          <RevealElement index={2} direction="cardRise" className="mb-4">
            <div className="antigravity-card-dark">
              <span className="text-white text-lg" style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: "0.24em", textTransform: "uppercase" as const, fontSize: "var(--t-eyebrow)" }}>RULE 1</span>
              <div
                className="text-2xl font-bold mt-1"
                style={{ color: "var(--ev-gold)", letterSpacing: "0.05em" }}
              >
                NEVER LOSE MONEY
              </div>
            </div>
          </RevealElement>

          {/* Reveal 3: Rule 2 */}
          <RevealElement index={3} direction="cardRise">
            <div className="antigravity-card-dark">
              <span className="text-white text-lg" style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: "0.24em", textTransform: "uppercase" as const, fontSize: "var(--t-eyebrow)" }}>RULE 2</span>
              <div
                className="text-2xl font-bold mt-1"
                style={{ color: "var(--ev-gold)", letterSpacing: "0.05em" }}
              >
                NEVER FORGET RULE 1
              </div>
            </div>
          </RevealElement>
        </div>

        {/* Right — Blob image */}
        <RevealElement index={4} direction="right" className="flex items-center justify-center">
          <BlobClip
            gradient="linear-gradient(135deg, #2A3D56 0%, #1A2D42 100%)"
            label="Successful Investor"
            height="350px"
            variant={1}
          />
        </RevealElement>
      </div>
    </div>
  );
}
