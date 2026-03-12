import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";

const variableSteps = [
  { value: "100k", color: "#F3F4F6" },
  { value: "-50%", color: "#FEE2E2", textColor: "#D64545" },
  { value: "$50K", color: "#FEE2E2", textColor: "#D64545" },
  { value: "+50%", color: "#E8F0EC", textColor: "#1A4D3E" },
  { value: "$75k", color: "#F5E6C8", textColor: "#C8A96E", bold: true },
];

const indexedSteps = [
  { value: "100k", color: "#E8F0EC" },
  { value: "-0%", color: "#FFFFFF", textColor: "#1A4D3E" },
  { value: "100k", color: "#E8F0EC", textColor: "#1A4D3E" },
  { value: "+25%", color: "#F5E6C8", textColor: "#C8A96E" },
  { value: "$125k", color: "#F5E6C8", textColor: "#C8A96E", bold: true },
];

export default function Slide15_SideBySide() {
  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-slide-inner">
        {/* Reveal 1: Title */}
        <RevealElement index={1} direction="up" className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#1A4D3E" }}>
            Same Market. <GradientText>Different Strategy.</GradientText>
          </h2>
        </RevealElement>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Reveal 2: Variable Column */}
          <RevealElement index={2} direction="left">
            <div className="rounded-2xl p-6" style={{ background: "#FEF2F2" }}>
              <h3 className="text-xl font-bold mb-4 text-center" style={{ color: "#D64545" }}>
                Variable Strategy
              </h3>
              <div className="space-y-2">
                {variableSteps.map((s, i) => (
                  <div
                    key={i}
                    className={`text-center py-2 rounded-lg text-lg ${s.bold ? "font-bold text-2xl" : "font-medium"}`}
                    style={{ background: s.color, color: s.textColor || "#4A5565" }}
                  >
                    <span className="antigravity-stat">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </RevealElement>

          {/* Reveal 3: Indexed Column */}
          <RevealElement index={3} direction="right">
            <div className="rounded-2xl p-6" style={{ background: "#E8F0EC" }}>
              <h3 className="text-xl font-bold mb-4 text-center" style={{ color: "#1A4D3E" }}>
                Indexed Strategy
              </h3>
              <div className="space-y-2">
                {indexedSteps.map((s, i) => (
                  <div
                    key={i}
                    className={`text-center py-2 rounded-lg text-lg ${s.bold ? "font-bold text-2xl" : "font-medium"}`}
                    style={{ background: s.color, color: s.textColor || "#1A4D3E" }}
                  >
                    <span className="antigravity-stat">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </RevealElement>
        </div>

        {/* Reveal 4: Comparison badge */}
        <RevealElement index={4} direction="scale" className="flex justify-center">
          <div className="antigravity-card-dark px-8 py-4 text-center">
            <p className="text-xl text-white">
              $75k vs $125k — <strong style={{ color: "#C8A96E" }}>$50,000 Difference</strong>
            </p>
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
