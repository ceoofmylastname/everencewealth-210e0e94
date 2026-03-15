import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import MeshGradient from "../MeshGradient";
import MorphBlob from "../MorphBlob";

const carriers = [
  "Prudential", "Principal", "Lincoln Financial Group", "Allianz",
  "Global Atlantic", "American National", "Securian Financial", "John Hancock",
  "Mutual of Omaha", "National Life Group", "North American", "AIG",
  "Equitable",
];

export default function Slide05_CarrierLogos() {
  return (
    <div className="antigravity-slide">
      <MeshGradient variant="cool" />
      <MorphBlob size={280} color="rgba(200, 169, 110, 0.08)" top="-7%" left="-5%" delay={0} />
      <MorphBlob size={300} color="rgba(26, 77, 62, 0.06)" bottom="-6%" right="-4%" delay={6} />
      <div className="antigravity-slide-inner">
        {/* Reveal 1: Headline */}
        <RevealElement index={1} direction="slam" className="text-center mb-2">
          <h2 className="text-3xl md:text-4xl" style={{ color: "var(--ev-text-light)", fontFamily: "var(--font-display)" }}>
            Committed to
          </h2>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            <GradientText>Bridging the Gap</GradientText>
          </h2>
          <p className="text-base mt-4" style={{ color: "var(--ev-text-light)" }}>
            Some of our 75+ financial companies we are partnered with
          </p>
        </RevealElement>

        {/* Reveal 2: Logo grid */}
        <RevealElement index={2} direction="scale" className="mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {carriers.map((name, i) => (
              <div
                key={i}
                className="flex items-center justify-center rounded-xl border border-gray-200 px-3 py-4"
                style={{ minHeight: "56px" }}
              >
                <span className="text-sm font-bold text-center" style={{ color: "var(--ev-green)" }}>
                  {name}
                </span>
              </div>
            ))}
          </div>
        </RevealElement>

        {/* Reveal 3: Badge */}
        <RevealElement index={3} direction="drop" className="flex justify-center mt-8">
          <div className="antigravity-pill-gold text-base font-bold px-6 py-2">
            75+ Partners
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
