import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";

const carriers = [
  "Prudential", "Principal", "Lincoln Financial Group", "Allianz",
  "Global Atlantic", "American National", "Securian Financial", "John Hancock",
  "Mutual of Omaha", "National Life Group", "North American", "AIG",
  "Equitable",
];

export default function Slide05_CarrierLogos() {
  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-slide-inner">
        {/* Reveal 1: Headline */}
        <RevealElement index={1} direction="up" className="text-center mb-2">
          <h2 className="text-3xl md:text-4xl" style={{ color: "#4A5565" }}>
            Committed to
          </h2>
          <h2 className="text-3xl md:text-4xl font-bold">
            <GradientText>Bridging the Gap</GradientText>
          </h2>
          <p className="text-base mt-4" style={{ color: "#4A5565" }}>
            Some of our 75+ financial companies we are partnered with
          </p>
        </RevealElement>

        {/* Reveal 2: Logo grid */}
        <RevealElement index={2} direction="scale" className="mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {carriers.map((name, i) => (
              <div
                key={i}
                className="flex items-center justify-center rounded-lg border border-gray-200 px-3 py-4"
                style={{ minHeight: "56px" }}
              >
                <span className="text-sm font-bold text-center" style={{ color: "#1A4D3E" }}>
                  {name}
                </span>
              </div>
            ))}
          </div>
        </RevealElement>

        {/* Reveal 3: Badge */}
        <RevealElement index={3} direction="scale" className="flex justify-center mt-8">
          <div className="antigravity-pill-gold text-base font-bold px-6 py-2">
            75+ Partners
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
