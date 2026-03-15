import RevealElement from "../RevealElement";
import BlobClip from "../BlobClip";
import GoldUnderline from "../animations/GoldUnderline";
import warrenBuffettImg from "@/assets/warren-buffett-portrait.png";

export default function Slide06_WarrenBuffett() {
  return (
    <div className="antigravity-slide" style={{ background: "#F8F7F4" }}>
      <div className="antigravity-editorial">
        {/* Left Side */}
        <div>
          {/* Reveal 1: Title */}
          <RevealElement index={1} direction="slam">
            <h2 className="text-5xl font-bold mb-2" style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}>
              <GoldUnderline>Warren Buffett</GoldUnderline>
            </h2>
            <p className="text-2xl mb-10" style={{ color: "#4A5565" }}>
              Rules to Building Wealth
            </p>
          </RevealElement>

          {/* Reveal 2: Rule 1 */}
          <RevealElement index={2} direction="cardRise" className="mb-4">
            <div className="antigravity-card-dark">
              <span className="text-white text-lg" style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: "0.24em", textTransform: "uppercase" as const, fontSize: "var(--t-eyebrow)" }}>RULE 1</span>
              <div
                className="text-2xl font-bold mt-1"
                style={{ color: "#C8A96E", letterSpacing: "0.05em" }}
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
                style={{ color: "#C8A96E", letterSpacing: "0.05em" }}
              >
                NEVER FORGET RULE 1
              </div>
            </div>
          </RevealElement>
        </div>

        {/* Right — Blob image */}
        <RevealElement index={4} direction="right" className="flex items-center justify-center">
          <BlobClip
            imageSrc={warrenBuffettImg}
            imageAlt="Warren Buffett"
            height="350px"
            variant={1}
          />
        </RevealElement>
      </div>
    </div>
  );
}
