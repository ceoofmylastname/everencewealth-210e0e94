import RevealElement from "../RevealElement";
import BlobClip from "../BlobClip";
import GoldUnderline from "../animations/GoldUnderline";
import darrenHardyImg from "@/assets/darren-hardy-portrait.png";

export default function Slide08_DarrenHardy() {
  return (
    <div className="antigravity-slide" style={{ background: "#1A4D3E" }}>
      <div className="antigravity-editorial">
        {/* Left side — Title + Quote */}
        <div>
          {/* Reveal 1: Title */}
          <RevealElement index={1} direction="slam">
            <h2 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
              The Compound Effect
            </h2>
            <div className="w-[60px] h-1 rounded-full" style={{ background: "#C8A96E" }} />
          </RevealElement>

          {/* Reveal 2: Quote card */}
          <RevealElement index={2} direction="cardRise" className="mt-8">
            <div
              className="rounded-3xl p-8 relative"
              style={{
                background: "#0D2E25",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            >
              <div className="text-8xl font-serif absolute -top-4 left-6" style={{ color: "#C8A96E", opacity: 0.3 }}>
                "
              </div>
              <div className="relative z-10 mt-6">
                <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                  The compound effect is the{" "}
                  <span className="font-bold" style={{ color: "#C8A96E" }}>principle</span>{" "}
                  of reaping{" "}
                  <GoldUnderline delay={0.3}>
                    <span className="font-bold" style={{ color: "#C8A96E" }}>huge rewards</span>
                  </GoldUnderline>{" "}
                  from a series of small,{" "}
                  <span className="font-bold" style={{ color: "#C8A96E" }}>smart choices</span>
                </p>
              </div>
            </div>
          </RevealElement>

          {/* Reveal 3: Attribution */}
          <RevealElement index={3} direction="drift" className="mt-6 pl-8">
            <p className="text-white/60 text-lg italic" style={{ fontFamily: "var(--font-body)", fontWeight: 200 }}>
              — Darren Hardy
            </p>
          </RevealElement>
        </div>

        {/* Right — Blob portrait */}
        <RevealElement index={4} direction="right" className="flex items-center justify-center">
          <BlobClip
            imageSrc={darrenHardyImg}
            imageAlt="Darren Hardy"
            height="350px"
            variant={2}
          />
        </RevealElement>
      </div>
    </div>
  );
}
