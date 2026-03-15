import RevealElement from "../RevealElement";
import GoldUnderline from "../animations/GoldUnderline";
import MeshGradient from "../MeshGradient";
import MorphBlob from "../MorphBlob";

export default function Slide08_DarrenHardy() {
  return (
    <div className="antigravity-slide" >
      <MeshGradient variant="gold" />
      <MorphBlob size={400} color="rgba(200, 169, 110, 0.12)" top="-8%" left="-6%" delay={0} />
      <MorphBlob size={320} color="rgba(26, 77, 62, 0.10)" bottom="-7%" right="-5%" delay={5} />
      <div className="antigravity-editorial">
        {/* Left side */}
        <div>
          {/* Reveal 1: Title */}
          <RevealElement index={1} direction="slam">
            <h2 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
              The Compound Effect
            </h2>
            <div className="w-[60px] h-1 rounded-full" style={{ background: "var(--ev-gold)" }} />
          </RevealElement>
        </div>

        {/* Right — Quote */}
        <div>
          {/* Reveal 2: Quote card */}
          <RevealElement index={2} direction="cardRise">
            <div
              className="rounded-3xl p-8 relative"
              style={{
                background: "#0D2E25",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            >
              <div className="text-8xl font-serif absolute -top-4 left-6" style={{ color: "var(--ev-gold)", opacity: 0.3 }}>
                "
              </div>
              <div className="relative z-10 mt-6">
                <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                  The compound effect is the{" "}
                  <span className="font-bold" style={{ color: "var(--ev-gold)" }}>principle</span>{" "}
                  of reaping{" "}
                  <GoldUnderline delay={0.3}>
                    <span className="font-bold" style={{ color: "var(--ev-gold)" }}>huge rewards</span>
                  </GoldUnderline>{" "}
                  from a series of small,{" "}
                  <span className="font-bold" style={{ color: "var(--ev-gold)" }}>smart choices</span>
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
      </div>
    </div>
  );
}
