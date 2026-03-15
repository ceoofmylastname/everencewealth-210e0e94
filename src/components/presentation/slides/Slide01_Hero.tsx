import { motion } from "framer-motion";
import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import GoldUnderline from "../animations/GoldUnderline";
import ClipReveal from "../ClipReveal";
import { HeroText, HeroItalic, LeadText } from "../Typography";
import { useRevealQueue } from "../RevealContext";
import beachBg from "@/assets/retirees-beach.jpg";

/* Small floating gold orb */
function GoldOrb({ size, top, left, delay }: { size: number; top: string; left: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        top,
        left,
        background: "radial-gradient(circle, rgba(200,169,110,0.35) 0%, rgba(200,169,110,0) 70%)",
      }}
      animate={{
        y: [0, -18, 0, 12, 0],
        x: [0, 8, -6, 4, 0],
        opacity: [0.4, 0.7, 0.5, 0.8, 0.4],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

export default function Slide01_Hero() {
  const { isRevealed } = useRevealQueue();

  return (
    <div className="antigravity-slide" style={{ background: "#0D1F1A" }}>
      {/* Subtle radial gold glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 30% 50%, rgba(200,169,110,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Floating gold orbs */}
      <GoldOrb size={120} top="15%" left="8%" delay={0} />
      <GoldOrb size={80} top="65%" left="45%" delay={3} />
      <GoldOrb size={60} top="25%" left="52%" delay={7} />

      <div className="relative z-10 grid h-full" style={{ gridTemplateColumns: "58% 42%" }}>
        {/* ── LEFT: Editorial content ── */}
        <div className="flex flex-col justify-center pl-20 pr-12 relative">
          {/* Vertical gold accent line */}
          <RevealElement index={1} direction="wipe">
            <motion.div
              className="absolute left-10 top-[18%]"
              style={{
                width: 2,
                background: "linear-gradient(180deg, transparent, #C8A96E, transparent)",
                transformOrigin: "top",
              }}
              initial={{ height: 0 }}
              animate={isRevealed(1) ? { height: 200 } : { height: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </RevealElement>

          {/* Reveal 1: Eyebrow + gold horizontal rule */}
          <RevealElement index={1} direction="drift">
            <div
              className="w-[100px] h-[1.5px] mb-6"
              style={{ background: "linear-gradient(90deg, #C8A96E, transparent)" }}
            />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                fontWeight: 300,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(200,169,110,0.6)",
                display: "block",
              }}
            >
              Everence Wealth
            </span>
          </RevealElement>

          {/* Reveal 2: "BRIDGING THE" */}
          <RevealElement index={2} direction="slam" className="mt-10">
            <ClipReveal isVisible={isRevealed(2)}>
              <HeroText style={{ fontWeight: 300, fontSize: "clamp(2.8rem, 5vw, 4.2rem)" }}>
                BRIDGING THE
              </HeroText>
            </ClipReveal>
          </RevealElement>

          {/* Reveal 3: "RETIREMENT" + "GAP" with gold treatment */}
          <RevealElement index={3} direction="slam">
            <ClipReveal isVisible={isRevealed(3)}>
              <HeroText style={{ fontSize: "clamp(2.8rem, 5vw, 4.2rem)" }}>
                RETIREMENT
              </HeroText>
            </ClipReveal>
            <ClipReveal isVisible={isRevealed(3)} delay={0.12}>
              <HeroItalic style={{ fontSize: "clamp(3.5rem, 6vw, 5.5rem)" }}>
                <GoldUnderline delay={0.3}>
                  <GradientText>GAP</GradientText>
                </GoldUnderline>
              </HeroItalic>
            </ClipReveal>
          </RevealElement>

          {/* Reveal 4: Glassmorphic pill badge */}
          <RevealElement index={4} direction="drift" className="mt-14">
            <div
              className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(200,169,110,0.15)",
                boxShadow: "0 0 20px rgba(200,169,110,0.05)",
              }}
            >
              {/* Pulsing dot */}
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{
                    background: "#C8A96E",
                    animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                  }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: "#C8A96E" }}
                />
              </span>
              <LeadText color="rgba(255,255,255,0.5)">
                Retirement Planning Workshop
              </LeadText>
            </div>
          </RevealElement>
        </div>

        {/* ── RIGHT: Beach image with organic mask ── */}
        <div className="flex items-center justify-center p-8 relative">
          <RevealElement index={1} direction="scale" className="w-full h-[80%]">
            <motion.div
              className="relative w-full h-full overflow-hidden"
              style={{
                borderRadius: "32px 80px 32px 80px",
                border: "2px solid rgba(200,169,110,0.15)",
                boxShadow: "0 8px 60px rgba(200,169,110,0.08), 0 0 120px rgba(200,169,110,0.04)",
              }}
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img
                src={beachBg}
                alt="Retirees enjoying a beach at sunset"
                className="w-full h-full object-cover"
              />
              {/* Soft vignette inside the image */}
              <div
                className="absolute inset-0"
                style={{
                  background: "radial-gradient(ellipse at center, transparent 50%, rgba(13,31,26,0.4) 100%)",
                }}
              />
            </motion.div>
          </RevealElement>
        </div>
      </div>
    </div>
  );
}
