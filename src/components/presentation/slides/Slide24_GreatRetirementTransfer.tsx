import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import MeshGradient from "../MeshGradient";
import MorphBlob from "../MorphBlob";

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
    <div className="antigravity-slide">
      <MeshGradient variant="gold" />
      <MorphBlob size={360} color="rgba(200, 169, 110, 0.12)" top="-8%" left="-5%" delay={0} />
      <MorphBlob size={300} color="rgba(26, 77, 62, 0.10)" bottom="-6%" right="-4%" delay={4} />
      <div className="antigravity-editorial">
        {/* Left */}
        <div>
          {/* Reveal 1: Title */}
          <RevealElement index={1} direction="slam">
            <h2 className="text-4xl font-bold mb-1" style={{ color: "var(--ev-green)", fontFamily: "var(--font-display)" }}>
              The BIG <GradientText>Question?</GradientText>
            </h2>
            <p className="text-lg mb-8" style={{ color: "var(--ev-text-light)" }}>
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
                  <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--ev-gold)" }}>
                    {q.label}
                  </div>
                  <p className="text-sm" style={{ color: "var(--ev-text-light)" }}>
                    {q.question}
                  </p>
                </div>
              ))}
            </div>
          </RevealElement>

          {/* Reveal 3: Historical fact */}
          <RevealElement index={3} direction="whomp" className="mt-6">
            <div className="px-5 py-3 rounded-xl" style={{ background: "var(--ev-gold-lt)" }}>
              <p className="text-sm font-bold" style={{ color: "var(--ev-green)" }}>
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
