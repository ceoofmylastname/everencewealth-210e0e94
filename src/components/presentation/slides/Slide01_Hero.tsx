import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import GoldUnderline from "../animations/GoldUnderline";
import ClipReveal from "../ClipReveal";
import { HeroText, HeroItalic, LeadText } from "../Typography";
import { useRevealQueue } from "../RevealContext";
import MeshGradient from "../MeshGradient";
import MorphBlob from "../MorphBlob";
import TextOnPath from "../TextOnPath";

export default function Slide01_Hero() {
  const { isRevealed } = useRevealQueue();

  return (
    <div className="antigravity-slide">
      {/* Light mesh gradient background */}
      <MeshGradient variant="gold" />
      <MorphBlob size={400} color="rgba(200, 169, 110, 0.12)" top="-10%" right="-5%" delay={0} />
      <MorphBlob size={300} color="rgba(26, 77, 62, 0.08)" bottom="-8%" left="-3%" delay={4} />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-8">
        {/* Reveal 1: Logo */}
        <RevealElement index={1} direction="scale" className="mb-6">
          <div
            className="text-2xl font-bold tracking-wider"
            style={{ color: "var(--ev-gold)", fontFamily: "var(--font-display)" }}
          >
            EVERENCE WEALTH
          </div>
        </RevealElement>

        {/* Reveal 2: Gold rule */}
        <RevealElement index={2} direction="wipe">
          <div
            className="w-[120px] h-[2px] mb-10"
            style={{ background: "linear-gradient(90deg, transparent, var(--ev-gold), transparent)" }}
          />
        </RevealElement>

        {/* Reveal 3: Headlines — TextOnPath for main title */}
        <RevealElement index={3} direction="slam">
          <TextOnPath fontSize={72} color="var(--ev-green)" fontWeight={900} curve="gentle">
            BRIDGING THE
          </TextOnPath>
          <ClipReveal isVisible={isRevealed(3)} delay={0.08}>
            <HeroText style={{ color: "var(--ev-green)" }}>RETIREMENT</HeroText>
          </ClipReveal>
          <ClipReveal isVisible={isRevealed(3)} delay={0.16}>
            <HeroItalic>
              <GoldUnderline delay={0.3}>
                <GradientText>GAP</GradientText>
              </GoldUnderline>
            </HeroItalic>
          </ClipReveal>
        </RevealElement>

        {/* Reveal 4: Presenter badge — glass pill */}
        <RevealElement index={4} direction="drift" className="mt-12">
          <div
            className="px-6 py-2 ag-entrance-1"
            style={{
              background: "rgba(255,255,255,0.35)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: "var(--radius-full)",
              border: "1px solid rgba(255,255,255,0.4)",
            }}
          >
            <LeadText style={{ color: "var(--ev-text)" }}>
              David Rosenberg | Everence Wealth
            </LeadText>
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
