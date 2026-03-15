import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import investFixed from "@/assets/invest-fixed.jpg";
import investVariable from "@/assets/invest-variable.jpg";
import investIndexed from "@/assets/invest-indexed.jpg";

const columns = [
  {
    title: "FIXED",
    items: "Savings Account / CD / Bonds",
    image: investFixed,
    glassBg: "rgba(232, 235, 240, 0.4)",
  },
  {
    title: "VARIABLE",
    items: "Brokerage Accounts / IRA / 401k / Stocks",
    image: investVariable,
    glassBg: "rgba(245, 230, 200, 0.4)",
  },
  {
    title: "INDEXED",
    items: "Protection / Growth",
    image: investIndexed,
    recommended: true,
    glassBg: "rgba(232, 240, 236, 0.4)",
  },
];

export default function Slide03_WaysToInvest() {
  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-slide-inner">
        {/* Reveal 1: Title */}
        <RevealElement index={1} direction="slam" className="text-center mb-4">
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}>
            Ways to <GradientText>Invest</GradientText>
          </h2>
          <p className="text-lg mt-3" style={{ color: "#4A5565" }}>
            There are several ways to invest your money. Here, in broad terms, are three options:
          </p>
        </RevealElement>

        {/* Reveals 2-4: Each column */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {columns.map((col, i) => (
            <RevealElement key={col.title} index={i + 2} direction="cardRise">
              <div
                className="relative flex flex-col items-center text-center rounded-2xl p-6"
                style={{
                  background: col.glassBg,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.5)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                }}
              >
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-[180px] rounded-xl mb-4 object-cover"
                />
                <h3 className="text-2xl font-bold mb-2" style={{ color: "#1A4D3E" }}>
                  {col.title}
                </h3>
                <p className="text-sm" style={{ color: "#4A5565" }}>{col.items}</p>
                {col.recommended && (
                  <div
                    className="antigravity-pill-gold mt-4"
                    style={{ padding: "6px 16px", borderRadius: "9999px", fontSize: "13px", fontWeight: 700 }}
                  >
                    ✦ Recommended
                  </div>
                )}
              </div>
            </RevealElement>
          ))}
        </div>
      </div>
    </div>
  );
}
