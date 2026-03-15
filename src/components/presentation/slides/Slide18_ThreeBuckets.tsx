import RevealElement from "../RevealElement";
import TaxBuckets from "../TaxBuckets";
import SVGDoughnutChart from "../charts/SVGDoughnutChart";
import { useRevealQueue } from "../RevealContext";
import MeshGradient from "../MeshGradient";
import MorphBlob from "../MorphBlob";

const taxSegments = [
  { value: 40, color: "#D64545", label: "Ordinary Income" },
  { value: 40, color: "#E8870A", label: "Capital Gains" },
  { value: 20, color: "#1A4D3E", label: "Tax Free" },
];

export default function Slide18_ThreeBuckets() {
  const { isRevealed } = useRevealQueue();

  return (
    <div className="antigravity-slide">
      <MeshGradient variant="cool" />
      <MorphBlob size={320} color="rgba(26, 77, 62, 0.07)" top="-6%" right="-4%" delay={0} />
      <MorphBlob size={260} color="rgba(200, 169, 110, 0.08)" bottom="-5%" left="-3%" delay={4} />
      <div className="antigravity-slide-inner">
        {/* Reveal 1: Title */}
        <RevealElement index={1} direction="slam" className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "var(--ev-green)", fontFamily: "var(--font-display)" }}>
            Three Ways Your <span style={{ color: "var(--ev-gold)" }}>Money Gets Taxed</span>
          </h2>
        </RevealElement>

        {/* Reveal 2: Subtitle */}
        <RevealElement index={2} direction="up" className="text-center mb-8">
          <p className="text-lg" style={{ color: "var(--ev-text-light)" }}>
            Let's assume the same numbers for all three categories. Withdrawal: <strong className="antigravity-stat">$100,000</strong>
          </p>
        </RevealElement>

        {/* Reveal 3: Three buckets visualization + doughnut */}
        <RevealElement index={3} direction="up">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 w-full">
              <TaxBuckets animate={isRevealed(3)} />
            </div>
            <div className="flex-shrink-0">
              <SVGDoughnutChart
                segments={taxSegments}
                size={180}
                centerText="Tax"
                centerSubText="Distribution"
                animate={isRevealed(3)}
              />
            </div>
          </div>
        </RevealElement>

        {/* Reveal 4: Key takeaway */}
        <RevealElement index={4} direction="whomp" className="flex justify-center mt-8">
          <div className="antigravity-card-dark px-8 py-4 text-center">
            <p className="text-lg text-white">
              Same withdrawal. <strong style={{ color: "var(--ev-gold)" }}>Dramatically different</strong> outcomes.
            </p>
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
