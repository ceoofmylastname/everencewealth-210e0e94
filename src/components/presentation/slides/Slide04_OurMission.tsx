import RevealElement from "../RevealElement";
import BlobClip from "../BlobClip";
import GoldUnderline from "../animations/GoldUnderline";

const missionBlocks = [
  "With over 45 years of combined experience in the financial services industry, at Everence Wealth, we are driven by one purpose: to deliver the very best.",
  "At Everence Wealth, we believe that true wealth is defined not only by numbers, but by endurance, legacy, and impact.",
  "Our mission is to help individuals and families build, preserve, and pass on a level of prosperity that stands the test of time.",
];

export default function Slide04_OurMission() {
  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-editorial">
        {/* Left Side */}
        <div>
          {/* Reveal 1: Title */}
          <RevealElement index={1} direction="left">
            <h2 className="text-5xl mb-1" style={{ color: "#4A5565" }}>Our</h2>
            <h2 className="text-5xl font-bold mb-4" style={{ color: "#1A4D3E" }}>
              <GoldUnderline>Mission</GoldUnderline>
            </h2>
            <div className="w-[80px] h-1 rounded-full mb-8" style={{ background: "#C8A96E" }} />
          </RevealElement>

          {/* Reveals 2-4: Mission blocks */}
          {missionBlocks.map((block, i) => (
            <RevealElement key={i} index={i + 2} direction="up" className="mb-4">
              <div className="antigravity-card" style={{ padding: "16px" }}>
                <p className="text-base leading-relaxed" style={{ color: "#4A5565" }}>
                  {block}
                </p>
              </div>
            </RevealElement>
          ))}
        </div>

        {/* Right Side — Blob image (always visible as background element) */}
        <div className="flex items-center justify-center">
          <BlobClip
            gradient="linear-gradient(135deg, #1A4D3E 0%, #2A6D5E 40%, #C8A96E 100%)"
            label="Financial Advisor Meeting"
            height="400px"
            variant={0}
          />
        </div>
      </div>
    </div>
  );
}
