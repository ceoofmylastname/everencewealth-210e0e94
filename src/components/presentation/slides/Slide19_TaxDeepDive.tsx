import RevealElement from "../RevealElement";
import GoldUnderline from "../animations/GoldUnderline";
import CountingNumber from "../animations/CountingNumber";
import { useRevealQueue } from "../RevealContext";

const categories = [
  {
    title: "Capital Gains",
    subtitle: "Taxed When You Sell Investments — Top Marginal Rate",
    badges: ["Bonds", "Stocks", "ETFs", "Crypto", "Brokerage Account"],
    rate: "28% Federal + 12.3% State",
    net: 59700,
    netColor: "#C8A96E",
    warning: "You thought you had $100k. You actually have $59,700.",
    warningBg: "#FEE2E2",
    warningColor: "#D64545",
  },
  {
    title: "Ordinary Income",
    subtitle: "Taxed at the Highest Marginal Rate",
    badges: ["401(k)", "457 Plan", "403(b)", "Pension"],
    rate: "37% Federal + 13.3% State = 50.3% Total",
    net: 49700,
    netColor: "#D64545",
    warning: "Half of your retirement — gone to taxes.",
    warningBg: "#F5E6C8",
    warningColor: "#1A4D3E",
  },
  {
    title: "Tax Free",
    subtitle: "0% State & Federal Income Tax",
    badges: ["Roth IRA", "SERP"],
    rate: "0% Total",
    net: 100000,
    netColor: "#1A4D3E",
    warning: "You keep every dollar. No surprises.",
    warningBg: "#E8F0EC",
    warningColor: "#1A4D3E",
  },
];

export default function Slide19_TaxDeepDive() {
  const { isRevealed } = useRevealQueue();

  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-slide-inner">
        {/* Reveal 1: Title */}
        <RevealElement index={1} direction="left" className="mb-6">
          <h2 className="text-3xl font-bold" style={{ color: "#1A4D3E" }}>
            <GoldUnderline>Tax Deep Dive</GoldUnderline> — $100,000 Withdrawal
          </h2>
        </RevealElement>

        {/* Reveals 2-4: Each category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <RevealElement key={cat.title} index={i + 2} direction="up">
              <div className="antigravity-card h-full flex flex-col">
                <h3 className="text-lg font-bold mb-1" style={{ color: "#1A4D3E" }}>{cat.title}</h3>
                <p className="text-xs mb-3" style={{ color: "#4A5565" }}>{cat.subtitle}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {cat.badges.map((b) => (
                    <span key={b} className="antigravity-pill-evergreen text-[10px] px-2 py-0.5">{b}</span>
                  ))}
                </div>

                <div className="text-xs mb-2" style={{ color: "#4A5565" }}>{cat.rate}</div>

                <div className="text-3xl font-bold mb-3 antigravity-stat" style={{ color: cat.netColor }}>
                  {isRevealed(i + 2) ? <CountingNumber value={cat.net} prefix="$" /> : "$0"}
                </div>

                <div className="mt-auto px-3 py-2 rounded-lg text-xs font-medium" style={{ background: cat.warningBg, color: cat.warningColor }}>
                  {cat.warning}
                </div>
              </div>
            </RevealElement>
          ))}
        </div>

        {/* Reveal 5: Key insight */}
        <RevealElement index={5} direction="scale" className="flex justify-center mt-6">
          <div className="antigravity-card-dark px-6 py-3 text-center">
            <p className="text-base text-white">
              The difference: <strong className="antigravity-stat" style={{ color: "#C8A96E" }}>$50,300</strong> — just from knowing where to put your money.
            </p>
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
