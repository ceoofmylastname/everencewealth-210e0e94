import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import CountingNumber from "../animations/CountingNumber";
import { useRevealQueue } from "../RevealContext";

const columns = [
  {
    rate: "7%",
    color: "#1A4D3E",
    doubling: "10.2 years",
    rows: [
      { age: 30, value: 20000 },
      { age: 40, value: 40000 },
      { age: 50, value: 80000 },
      { age: 60, value: 160000 },
    ],
  },
  {
    rate: "10%",
    color: "#C8A96E",
    doubling: "7.2 years",
    rows: [
      { age: 30, value: 20000 },
      { age: 37, value: 40000 },
      { age: 44, value: 80000 },
      { age: 52, value: 160000 },
      { age: 59, value: 320000 },
      { age: 66, value: 640000 },
    ],
  },
  {
    rate: "12%",
    color: "#C8A96E",
    doubling: "6 years",
    rows: [
      { age: 30, value: 20000 },
      { age: 36, value: 40000 },
      { age: 42, value: 80000 },
      { age: 48, value: 160000 },
      { age: 54, value: 320000 },
      { age: 60, value: 640000 },
      { age: 66, value: 1200000 },
    ],
  },
];

export default function Slide07_CompoundInterest() {
  const { isRevealed } = useRevealQueue();

  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-slide-inner">
        {/* Reveal 1: Title */}
        <RevealElement index={1} direction="slam" className="mb-2">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}>
            Compound <GradientText>Interest</GradientText>
          </h2>
          <p className="text-xl mt-1" style={{ color: "#4A5565" }}>The Rule of <strong>72</strong></p>
          <p className="text-sm mt-2" style={{ color: "#4A5565" }}>
            Investment of $20,000 at different rates of return starting at age 30
          </p>
        </RevealElement>

        {/* Reveals 2-4: Each column */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {columns.map((col, ci) => (
            <RevealElement key={ci} index={ci + 2} direction="cardRise">
              <div className="antigravity-card">
                {/* Gauge */}
                <div className="flex justify-center mb-3">
                  <div
                    className="antigravity-gauge"
                    style={{ border: `4px solid ${col.color}`, borderBottom: "none" }}
                  >
                    <div className="antigravity-gauge-label" style={{ color: col.color }}>
                      {col.rate}
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm mb-3" style={{ color: "#4A5565" }}>
                  Doubles Every {col.doubling}
                </p>
                <div className="space-y-1">
                  {col.rows.map((row, ri) => {
                    const isLast = ri === col.rows.length - 1;
                    return (
                      <div
                        key={ri}
                        className={`flex justify-between text-sm px-2 py-1 rounded ${isLast ? "font-bold" : ""}`}
                        style={isLast ? { background: "#F5E6C8", color: "#1A4D3E" } : { color: "#4A5565" }}
                      >
                        <span>Age {row.age}</span>
                        <span className="antigravity-stat">
                          {isRevealed(ci + 2) ? (
                            <CountingNumber value={row.value} prefix="$" />
                          ) : (
                            "$0"
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </RevealElement>
          ))}
        </div>

        {/* Reveal 5: Key insight */}
        <RevealElement index={5} direction="explode" className="flex justify-center mt-6">
          <div className="antigravity-pill-gold text-base font-bold px-6 py-2">
            2% difference = DOUBLE the money
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
