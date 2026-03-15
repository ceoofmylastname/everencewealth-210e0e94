import { useState } from "react";
import { TrendingDown } from "lucide-react";
import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";

const scenarios = [
  {
    start: "$100k",
    loss: "-25%",
    result: "$75k",
    recovery: "+33% needed to recover",
    borderColor: "hsla(51, 78%, 70%, 0.6)",
    glowColor: "hsla(51, 78%, 70%, 0.15)",
    lossColor: "#D64545",
    direction: "cardRise" as const,
  },
  {
    start: "$100k",
    loss: "-33%",
    result: "$67k",
    recovery: "+50% needed to recover",
    borderColor: "hsla(35, 80%, 55%, 0.6)",
    glowColor: "hsla(35, 80%, 55%, 0.15)",
    lossColor: "#D64545",
    direction: "cardRise" as const,
  },
  {
    start: "$100k",
    loss: "-50%",
    result: "$50k",
    recovery: "+100% needed to recover",
    borderColor: "hsla(0, 70%, 50%, 0.7)",
    glowColor: "hsla(0, 70%, 50%, 0.2)",
    lossColor: "#D64545",
    direction: "explode" as const,
    danger: true,
  },
];

function LossCard({
  scenario,
  index,
}: {
  scenario: (typeof scenarios)[0];
  index: number;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      className="relative"
      style={{ perspective: "800px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Radial glow behind card */}
      <div
        className="absolute inset-0 rounded-2xl blur-2xl opacity-60"
        style={{ background: `radial-gradient(circle, ${scenario.glowColor}, transparent 70%)` }}
      />

      <div
        className="relative rounded-2xl p-6 flex flex-col items-center gap-3 transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1.5px solid ${scenario.borderColor}`,
          boxShadow: scenario.danger
            ? `0 0 30px ${scenario.glowColor}, 0 8px 32px rgba(0,0,0,0.12)`
            : `0 8px 32px rgba(0,0,0,0.08)`,
          minHeight: "260px",
        }}
      >
        {/* Starting amount */}
        <span
          className="text-sm font-medium tracking-widest uppercase"
          style={{ color: "#1A4D3E", opacity: 0.6 }}
        >
          You invest
        </span>
        <span
          className="text-4xl font-bold antigravity-stat"
          style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}
        >
          {scenario.start}
        </span>

        {/* Loss indicator */}
        <div className="flex items-center gap-2 my-1">
          <TrendingDown size={22} color={scenario.lossColor} strokeWidth={2.5} />
          <span
            className="text-3xl font-bold"
            style={{ color: scenario.lossColor, fontFamily: "var(--font-display)" }}
          >
            {scenario.loss}
          </span>
        </div>

        {/* Result */}
        <span
          className="text-3xl font-bold antigravity-stat"
          style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}
        >
          {scenario.result}
        </span>

        {/* Recovery pill */}
        <div
          className="mt-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide"
          style={{
            background: scenario.danger ? "hsla(0, 70%, 50%, 0.12)" : "hsla(51, 78%, 70%, 0.18)",
            color: scenario.danger ? "#D64545" : "#1A4D3E",
            border: `1px solid ${scenario.danger ? "hsla(0, 70%, 50%, 0.25)" : "hsla(51, 78%, 70%, 0.3)"}`,
          }}
        >
          {scenario.recovery}
        </div>
      </div>
    </div>
  );
}

export default function Slide12_LossImpact() {
  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-slide-inner flex flex-col items-center justify-center gap-6">
        {/* Reveal 1: Title */}
        <RevealElement index={1} direction="slam" className="text-center">
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}
          >
            Traditional Approach to <GradientText>Investing</GradientText>
          </h2>
          <p className="text-lg mt-2" style={{ color: "#4A5565" }}>
            How stock market losses impact returns
          </p>
        </RevealElement>

        {/* Reveals 2-4: Individual loss cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          {scenarios.map((scenario, i) => (
            <RevealElement key={i} index={i + 2} direction={scenario.direction}>
              <LossCard scenario={scenario} index={i} />
            </RevealElement>
          ))}
        </div>

        {/* Reveal 5: Divider */}
        <RevealElement index={5} direction="wipe" className="flex justify-center">
          <div className="w-[80px] h-[2px]" style={{ background: "#C8A96E" }} />
        </RevealElement>

        {/* Reveal 6: Bottom insight */}
        <RevealElement index={6} direction="whomp" className="text-center">
          <div className="antigravity-card-dark inline-block px-8 py-4 rounded-2xl">
            <p className="text-lg text-white font-medium">
              100% gains take years. 50% losses happen in <strong>ONE year</strong>.
            </p>
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
