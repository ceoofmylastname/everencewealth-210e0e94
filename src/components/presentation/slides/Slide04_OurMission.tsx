import RevealElement from "../RevealElement";
import GoldUnderline from "../animations/GoldUnderline";
import advisorMeetingImg from "@/assets/advisor-meeting.jpg";

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
          <RevealElement index={1} direction="slam">
            <h2 className="text-5xl mb-1" style={{ color: "#4A5565", fontFamily: "var(--font-display)" }}>Our</h2>
            <h2 className="text-5xl font-bold mb-4" style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}>
              <GoldUnderline>Mission</GoldUnderline>
            </h2>
            <div className="w-[80px] h-1 rounded-full mb-8" style={{ background: "#C8A96E" }} />
          </RevealElement>

          {/* Reveals 2-4: Mission blocks */}
          {missionBlocks.map((block, i) => (
            <RevealElement key={i} index={i + 2} direction="cardRise" className="mb-4">
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
          <img
            src={advisorMeetingImg}
            alt="Professional financial advisor in modern office"
            className="w-full h-[400px] object-cover"
            style={{ borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }}
          />
        </div>
      </div>
    </div>
  );
}
