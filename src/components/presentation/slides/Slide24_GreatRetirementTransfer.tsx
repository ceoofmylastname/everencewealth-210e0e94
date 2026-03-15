import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import flagImg from "@/assets/american-flag-building.jpg";

const questions = [
  {
    label: "The government: $37.5T+ in Debt",
    question: "Social Security: Will it be enough?",
  },
  {
    label: "IRA / 401k",
    question: "What will your future tax rate be? Will you run out of money?",
  },
  {
    label: "Company Pension",
    question: "A thing of the past — very hard to find.",
  },
  {
    label: "Our Children: Source of Security?",
    question: "Can they really afford us?",
  },
];

export default function Slide24_GreatRetirementTransfer() {
  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-editorial">
        {/* Left */}
        <div>
          {/* Reveal 1: Title */}
          <RevealElement index={1} direction="slam">
            <h2 className="text-4xl font-bold mb-1" style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}>
              The BIG <GradientText>Question?</GradientText>
            </h2>
            <p className="text-lg mb-8" style={{ color: "#4A5565" }}>
              Do you have a <strong>Strategy</strong> you can rely on?
            </p>
          </RevealElement>

          {/* Reveal 2: Question cards */}
          <RevealElement index={2} direction="cardRise">
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div
                  key={i}
                  className="antigravity-card"
                  style={{ borderLeft: "4px solid #C8A96E", padding: "16px 20px" }}
                >
                  <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#C8A96E" }}>
                    {q.label}
                  </div>
                  <p className="text-sm" style={{ color: "#4A5565" }}>
                    {q.question}
                  </p>
                </div>
              ))}
            </div>
          </RevealElement>

          {/* Reveal 3: Historical fact */}
          <RevealElement index={3} direction="whomp" className="mt-6">
            <div className="px-5 py-3 rounded-xl" style={{ background: "#F5E6C8" }}>
              <p className="text-sm font-bold" style={{ color: "#1A4D3E" }}>
                The worst tax rate in American history: <strong className="antigravity-stat">94%</strong>. It happened before.
              </p>
            </div>
          </RevealElement>
        </div>

        {/* Right — Image placeholder */}
        <RevealElement index={4} direction="right" className="flex items-center justify-center">
          <div
            className="rounded-xl overflow-hidden w-full"
            style={{
              height: "420px",
              background: "linear-gradient(135deg, #1A3A50 0%, #2A4D66 50%, #C8A96E 100%)",
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
              American Flag on Building
            </div>
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
