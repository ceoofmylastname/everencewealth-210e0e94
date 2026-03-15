import RevealElement from "../RevealElement";
import GoldUnderline from "../animations/GoldUnderline";
import { Monitor, RotateCcw, TrendingUp, Shield } from "lucide-react";
import MeshGradient from "../MeshGradient";
import MorphBlob from "../MorphBlob";

const advantages = [
  {
    icon: Monitor,
    title: "TAX DEFERRED GROWTH",
    desc: "Over long periods of time, tax deferral makes an incredible difference in the amount of money you have in a retirement plan.",
    borderColor: "#C8A96E",
  },
  {
    icon: RotateCcw,
    title: "ANNUAL RESET PROVISION",
    desc: "Capture and lock in each year of positive return. When there are negative returns, you don't lose.",
    borderColor: "#1A4D3E",
  },
  {
    icon: TrendingUp,
    title: "UPSIDE GROWTH POTENTIAL",
    desc: "Protecting your capital against loss while knowing your account can experience the potential for growth.",
    borderColor: "#C8A96E",
  },
  {
    icon: Shield,
    title: "PROTECTION",
    desc: "Protected from creditors, whether due to bankruptcy, lawsuit, or any other type of judgement.",
    borderColor: "#1A4D3E",
  },
];

export default function Slide22_PlanAdvantage() {
  return (
    <div className="antigravity-slide">
      <MeshGradient variant="warm" />
      <MorphBlob size={320} color="rgba(200, 169, 110, 0.10)" top="-6%" left="-4%" delay={0} />
      <MorphBlob size={260} color="rgba(26, 77, 62, 0.07)" bottom="-5%" right="-3%" delay={3} />
      <div className="antigravity-slide-inner">
        {/* Reveal 1: Title */}
        <RevealElement index={1} direction="slam" className="mb-2">
          <h2 className="text-4xl font-bold" style={{ color: "var(--ev-green)", fontFamily: "var(--font-display)" }}>
            Plan <GoldUnderline>Advantage</GoldUnderline>
          </h2>
          <p className="text-base mt-2" style={{ color: "var(--ev-text-light)" }}>
            Advantage inside the indexed plan
          </p>
        </RevealElement>

        {/* Reveals 2-5: Each advantage card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {advantages.map((adv, i) => (
            <RevealElement key={adv.title} index={i + 2} direction="cardRise">
              <div
                className="antigravity-card flex gap-4"
                style={{ borderTop: `4px solid ${adv.borderColor}` }}
              >
                <div className="flex-shrink-0 mt-1">
                  <adv.icon className="w-8 h-8" style={{ color: "var(--ev-green)" }} />
                </div>
                <div>
                  <h3 className="text-base font-bold mb-2" style={{ color: "var(--ev-green)" }}>
                    {adv.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--ev-text-light)" }}>
                    {adv.desc}
                  </p>
                </div>
              </div>
            </RevealElement>
          ))}
        </div>
      </div>
    </div>
  );
}
