import RevealElement from "../RevealElement";
import BlobClip from "../BlobClip";

const steps = [
  { label: "Start:", value: "$100,000", color: "#E8F0EC", textColor: "#1A4D3E" },
  { label: "Market Loss:", value: "-50%", color: "#FEE2E2", textColor: "#D64545" },
  { label: "Remaining:", value: "$50,000", color: "#F3F4F6", textColor: "#4A5565" },
  { label: "Gain:", value: "+50%", color: "#E8F0EC", textColor: "#1A4D3E" },
  { label: "Result:", value: "$75,000", color: "#F5E6C8", textColor: "#1A4D3E" },
];

export default function Slide13_NegativeCredit() {
  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-editorial">
        {/* Left — Number sequence */}
        <div>
          {/* Reveal 1: Title */}
          <RevealElement index={1} direction="slam" className="mb-6">
            <h2 className="text-3xl font-bold" style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}>
              Traditional Approach
            </h2>
            <p className="text-sm mt-2 italic" style={{ color: "#4A5565" }}>
              The consequence of a negative interest credit
            </p>
          </RevealElement>

          {/* Reveal 2: Steps */}
          <RevealElement index={2} direction="cardRise">
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-3 rounded-xl"
                  style={{ background: step.color }}
                >
                  <span className="text-base font-medium" style={{ color: "#4A5565" }}>{step.label}</span>
                  <span className="text-2xl font-bold antigravity-stat" style={{ color: step.textColor }}>{step.value}</span>
                </div>
              ))}
            </div>
          </RevealElement>

          {/* Reveal 3: Warning */}
          <RevealElement index={3} direction="explode" className="mt-4">
            <div className="antigravity-pill-red px-4 py-2 text-sm font-bold">
              Still $25,000 short. Not even whole.
            </div>
          </RevealElement>
        </div>

        {/* Right — Blob image */}
        <RevealElement index={4} direction="right" className="flex items-center justify-center">
          <BlobClip
            gradient="linear-gradient(135deg, #8B9AAF 0%, #5A6B80 100%)"
            label="Couple reviewing finances"
            height="380px"
            variant={2}
          />
        </RevealElement>
      </div>
    </div>
  );
}
