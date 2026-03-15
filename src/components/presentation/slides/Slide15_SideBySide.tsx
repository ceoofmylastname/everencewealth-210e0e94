import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";

const variableSteps = [
  { value: "100k", glassBg: "rgba(243, 244, 246, 0.45)" },
  { value: "-50%", glassBg: "rgba(254, 226, 226, 0.5)", textColor: "#D64545" },
  { value: "$50K", glassBg: "rgba(254, 226, 226, 0.5)", textColor: "#D64545" },
  { value: "+50%", glassBg: "rgba(232, 240, 236, 0.45)", textColor: "#1A4D3E" },
  { value: "$75k", glassBg: "rgba(245, 230, 200, 0.5)", textColor: "#C8A96E", bold: true },
];

const indexedSteps = [
  { value: "100k", glassBg: "rgba(232, 240, 236, 0.45)" },
  { value: "-0%", glassBg: "rgba(255, 255, 255, 0.5)", textColor: "#1A4D3E" },
  { value: "100k", glassBg: "rgba(232, 240, 236, 0.45)", textColor: "#1A4D3E" },
  { value: "+25%", glassBg: "rgba(245, 230, 200, 0.45)", textColor: "#C8A96E" },
  { value: "$125k", glassBg: "rgba(245, 230, 200, 0.5)", textColor: "#C8A96E", bold: true },
];

export default function Slide15_SideBySide() {
  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-slide-inner">
        {/* Reveal 1: Title */}
        <RevealElement index={1} direction="slam" className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}>
            Same Market. <GradientText>Different Strategy.</GradientText>
          </h2>
        </RevealElement>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Reveal 2: Variable Column */}
          <RevealElement index={2} direction="cardRise">
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(254, 242, 242, 0.45)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
              }}
            >
              <h3 className="text-xl font-bold mb-4 text-center" style={{ color: "#D64545" }}>
                Variable Strategy
              </h3>
              <div className="space-y-2">
                {variableSteps.map((s, i) => (
                  <div
                    key={i}
                    className={`text-center py-2 rounded-lg text-lg ${s.bold ? "font-bold text-2xl" : "font-medium"}`}
                    style={{
                      background: s.glassBg,
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      color: s.textColor || "#4A5565",
                    }}
                  >
                    <span className="antigravity-stat">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </RevealElement>

          {/* Reveal 3: Indexed Column */}
          <RevealElement index={3} direction="cardRise">
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(232, 240, 236, 0.45)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
              }}
            >
              <h3 className="text-xl font-bold mb-4 text-center" style={{ color: "#1A4D3E" }}>
                Indexed Strategy
              </h3>
              <div className="space-y-2">
                {indexedSteps.map((s, i) => (
                  <div
                    key={i}
                    className={`text-center py-2 rounded-lg text-lg ${s.bold ? "font-bold text-2xl" : "font-medium"}`}
                    style={{
                      background: s.glassBg,
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      color: s.textColor || "#1A4D3E",
                    }}
                  >
                    <span className="antigravity-stat">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </RevealElement>
        </div>

        {/* Reveal 4: Comparison badge */}
        <RevealElement index={4} direction="explode" className="flex justify-center">
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
