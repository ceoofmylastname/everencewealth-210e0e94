import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";

const bubbles = [
  { start: "$100k", loss: "-25%", result: "$75k", recovery: "+33% needed to recover", color: "#D4C9A0" },
  { start: "$100k", loss: "-33%", result: "$67k", recovery: "+50% needed", color: "#C8A96E" },
  { start: "$100k", loss: "-50%", result: "$50k", recovery: "+100% needed", color: "#8BA89C", danger: true },
];

export default function Slide12_LossImpact() {
  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-slide-inner">
        {/* Reveal 1: Title */}
        <RevealElement index={1} direction="slam" className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}>
            Traditional Approach to <GradientText>Investing</GradientText>
          </h2>
          <p className="text-lg mt-2" style={{ color: "#4A5565" }}>
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
                  <span className="text-3xl font-bold antigravity-stat" style={{ color: "#1A4D3E" }}>{b.start}</span>
                  <span className="text-xl font-bold antigravity-stat" style={{ color: "#D64545" }}>{b.loss}</span>
                  <span className="text-2xl font-bold antigravity-stat" style={{ color: "#1A4D3E" }}>{b.result}</span>
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
          <div className="w-[80px] h-[2px]" style={{ background: "#C8A96E" }} />
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
