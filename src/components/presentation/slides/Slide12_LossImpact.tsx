import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import MeshGradient from "../MeshGradient";
import MorphBlob from "../MorphBlob";

const bubbles = [
  { start: "$100k", loss: "-25%", result: "$75k", recovery: "+33% needed to recover", color: "#D4C9A0" },
  { start: "$100k", loss: "-33%", result: "$67k", recovery: "+50% needed", color: "var(--ev-gold)" },
  { start: "$100k", loss: "-50%", result: "$50k", recovery: "+100% needed", color: "#8BA89C", danger: true },
];

export default function Slide12_LossImpact() {
  return (
    <div className="antigravity-slide">
      <MeshGradient variant="warm" />
      <MorphBlob size={320} color="rgba(200, 169, 110, 0.10)" top="-6%" left="-4%" delay={0} />
      <MorphBlob size={280} color="rgba(26, 77, 62, 0.07)" bottom="-7%" right="-5%" delay={4} />
      <div className="antigravity-slide-inner">
        {/* Reveal 1: Title */}
        <RevealElement index={1} direction="slam" className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "var(--ev-green)", fontFamily: "var(--font-display)" }}>
            Traditional Approach to <GradientText>Investing</GradientText>
          </h2>
          <p className="text-lg mt-2" style={{ color: "var(--ev-text-light)" }}>
            How stock market losses impact returns
          </p>
        </RevealElement>

        {/* Reveals 2-3: Bubbles */}
        <RevealElement index={2} direction="cardRise">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {bubbles.map((b, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className="w-[180px] h-[180px] rounded-full flex flex-col items-center justify-center mb-4"
                  style={{ background: b.color }}
                >
                  <span className="text-3xl font-bold antigravity-stat" style={{ color: "var(--ev-green)" }}>{b.start}</span>
                  <span className="text-xl font-bold antigravity-stat" style={{ color: "#D64545" }}>{b.loss}</span>
                  <span className="text-2xl font-bold antigravity-stat" style={{ color: "var(--ev-green)" }}>{b.result}</span>
                </div>
                <div
                  className="text-center font-bold"
                  style={{ color: b.danger ? "#D64545" : "#1A4D3E" }}
                >
                  {b.recovery}
                </div>
              </div>
            ))}
          </div>
        </RevealElement>

        {/* Reveal 3: Divider */}
        <RevealElement index={3} direction="wipe" className="flex justify-center my-6">
          <div className="w-[80px] h-[2px]" style={{ background: "var(--ev-gold)" }} />
        </RevealElement>

        {/* Reveal 4: Bottom insight */}
        <RevealElement index={4} direction="whomp" className="text-center">
          <div className="antigravity-card-dark inline-block px-8 py-4">
            <p className="text-lg text-white font-medium">
              100% gains take years. 50% losses happen in <strong>ONE year</strong>.
            </p>
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
