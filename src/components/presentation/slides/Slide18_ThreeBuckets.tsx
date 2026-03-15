import RevealElement from "../RevealElement";
import TaxBuckets from "../TaxBuckets";
import { useRevealQueue } from "../RevealContext";

export default function Slide18_ThreeBuckets() {
  const { isRevealed } = useRevealQueue();

  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-slide-inner">
        {/* Reveal 1: Title */}
        <RevealElement index={1} direction="slam" className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}>
            Three Ways Your <span style={{ color: "#C8A96E" }}>Money Gets Taxed</span>
          </h2>
        </RevealElement>

        {/* Reveal 2: Subtitle */}
        <RevealElement index={2} direction="up" className="text-center mb-8">
          <p className="text-lg" style={{ color: "#4A5565" }}>
            Let's assume the same numbers for all three categories. Withdrawal: <strong className="antigravity-stat">$100,000</strong>
          </p>
        </RevealElement>

        {/* Reveal 3: Three buckets visualization */}
        <RevealElement index={3} direction="up">
          <TaxBuckets animate={isRevealed(3)} />
        </RevealElement>

        {/* Reveal 4: Key takeaway */}
        <RevealElement index={4} direction="whomp" className="flex justify-center mt-8">
          <div className="antigravity-card-dark px-8 py-4 text-center">
            <p className="text-lg text-white">
              Same withdrawal. <strong style={{ color: "#C8A96E" }}>Dramatically different</strong> outcomes.
            </p>
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
