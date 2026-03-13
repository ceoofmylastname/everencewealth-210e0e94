import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import GoldUnderline from "../animations/GoldUnderline";
import ClipReveal from "../ClipReveal";
import { HeroText, HeroItalic, LeadText } from "../Typography";
import { useRevealQueue } from "../RevealContext";
import beachBg from "@/assets/retirees-beach.jpg";
import logo from "@/assets/logo-new.png";

export default function Slide01_Hero() {
  const { isRevealed } = useRevealQueue();

  return (
    <div className="antigravity-slide">
      {/* Beach background image */}
      <div className="antigravity-full-bleed">
        <img
          src={beachBg}
          alt="Retirees enjoying a beach at sunset"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Cinematic dark gradient overlay */}
      <div
        className="antigravity-full-bleed"
        style={{
          background:
            "linear-gradient(180deg, rgba(13,31,26,0.85) 0%, rgba(13,31,26,0.55) 40%, rgba(13,31,26,0.75) 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-8">
        {/* Reveal 1: Logo image */}
        <RevealElement index={1} direction="scale" className="mb-8">
          <img
            src={logo}
            alt="Everence Wealth logo"
            className="h-16 md:h-20 w-auto object-contain drop-shadow-lg"
          />
        </RevealElement>

        {/* Reveal 2: Gold rule */}
        <RevealElement index={2} direction="wipe">
          <div
            className="w-[120px] h-[2px] mb-10"
            style={{ background: "linear-gradient(90deg, transparent, #C8A96E, transparent)" }}
          />
        </RevealElement>

        {/* Reveal 3: Headlines */}
        <RevealElement index={3} direction="slam">
          <ClipReveal isVisible={isRevealed(3)}>
            <HeroText>BRIDGING THE</HeroText>
          </ClipReveal>
          <ClipReveal isVisible={isRevealed(3)} delay={0.08}>
            <HeroText>RETIREMENT</HeroText>
          </ClipReveal>
          <ClipReveal isVisible={isRevealed(3)} delay={0.16}>
            <HeroItalic>
              <GoldUnderline delay={0.3}>
                <GradientText>GAP</GradientText>
              </GoldUnderline>
            </HeroItalic>
          </ClipReveal>
        </RevealElement>

        {/* Reveal 4: Presenter badge */}
        <RevealElement index={4} direction="drift" className="mt-12">
          <div
            className="px-6 py-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
          >
            <LeadText>
              David Rosenberg | Everence Wealth
            </LeadText>
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
