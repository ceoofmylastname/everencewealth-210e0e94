import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const GOLD = "#C9A24B";
const CREAM = "#F5EFE0";
const CHARCOAL = "#1A1A1A";
const EMERALD = "#0F3B2E";
const RED = "#C8362C";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function IndexingBacktestModal({ open, onOpenChange }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest("[data-illustration-modal]")) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-illustration-modal
        className="p-0 gap-0 w-screen h-screen max-w-none rounded-none border-0 md:w-[95vw] md:max-w-[1400px] md:h-auto md:max-h-[90vh] md:rounded-xl"
        style={{
          background: CHARCOAL,
          borderColor: GOLD,
          borderWidth: 1,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          className="overflow-y-auto h-full md:max-h-[90vh] px-5 md:px-12 py-10 md:py-14 space-y-12"
          style={{ scrollBehavior: "smooth", color: CREAM }}
        >
          {/* SECTION 1: Header */}
          <header className="space-y-5 text-center max-w-4xl mx-auto">
            <span
              className="inline-block px-3 py-1 text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] rounded-full"
              style={{ background: `${GOLD}1A`, color: GOLD, border: `1px solid ${GOLD}66` }}
            >
              Everence Wealth Illustration
            </span>
            <h1
              className="font-serif text-3xl md:text-5xl leading-tight"
              style={{ color: CREAM }}
            >
              What Happens When You Cap the Wins and Eliminate the Losses?
            </h1>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: `${CREAM}CC` }}>
              $100,000 invested in 1999. Twenty-seven years of real S&P 500 data. One version takes
              every gain and every loss the market hands out. The other version caps gains at 15%
              and floors losses at zero. The smoother ride wins by $327,924.
            </p>
          </header>

          {/* SECTION 2: Chart */}
          <section className="relative w-full mx-auto" style={{ maxWidth: 1400 }}>
            <div className="relative">
              <img
                src="/resources/everence-sp500-indexing-backtest.png"
                alt="S&P 500 Total Returns 1999 to 2025 — Full Market vs Indexing Strategy"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-auto object-contain rounded-lg"
                style={{
                  border: `1px solid ${GOLD}4D`,
                  boxShadow: "0 20px 60px -20px rgba(0,0,0,0.6)",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  // @ts-expect-error vendor prop
                  WebkitUserDrag: "none",
                  pointerEvents: "none",
                }}
              />
              <div
                className="absolute inset-0 rounded-lg"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                style={{ background: "transparent", userSelect: "none" }}
              />
            </div>
          </section>

          {/* SECTION 3: Headline Numbers */}
          <section
            className="rounded-xl px-6 md:px-12 py-10 text-center space-y-6 max-w-4xl mx-auto"
            style={{ border: `1px solid ${GOLD}80`, background: "rgba(201,162,75,0.04)" }}
          >
            <div>
              <div className="font-serif text-3xl md:text-4xl" style={{ color: RED }}>
                $622,724
              </div>
              <div className="text-xs md:text-sm mt-1" style={{ color: `${CREAM}99` }}>
                Full Market Exposure. Every gain. Every loss.
              </div>
            </div>
            <div>
              <div className="font-serif text-4xl md:text-6xl" style={{ color: GOLD }}>
                $950,648
              </div>
              <div className="text-xs md:text-sm mt-1" style={{ color: `${CREAM}CC` }}>
                Capped &amp; Floored. 15% ceiling. 0% basement.
              </div>
            </div>
            <div>
              <div className="font-serif text-2xl md:text-3xl" style={{ color: CREAM }}>
                $327,924 more
              </div>
              <div className="text-xs md:text-sm mt-1" style={{ color: `${CREAM}99` }}>
                Same starting capital. Same 27 years. Same underlying index.
              </div>
            </div>
          </section>

          {/* SECTION 4: Editorial */}
          <section
            className="rounded-xl p-6 md:p-10 max-w-6xl mx-auto"
            style={{ background: CREAM, color: "#1f2937", border: `1px solid ${GOLD}` }}
          >
            <div
              className="rounded-lg p-5 md:p-8 space-y-6"
              style={{ border: `1px solid ${GOLD}55` }}
            >
              <h2 className="font-serif text-2xl md:text-4xl" style={{ color: EMERALD }}>
                Why Capping the Upside Beats Capturing It.
              </h2>
              <div className="grid md:grid-cols-2 gap-6 md:gap-10 font-serif text-base md:text-[17px] leading-[1.8]">
                <p>
                  Most investors believe the way to maximize wealth is to capture every dollar the
                  market produces. Take every win. Endure every loss. Stay invested. The data from
                  1999 to 2025 says otherwise. Over this 27-year window, a strategy that gave up
                  every dollar of upside above 15% per year and refused to participate in any loss
                  year outperformed the uncapped S&amp;P 500 by 327.9 percentage points of total
                  return.
                </p>
                <p>
                  This is the sequence of returns problem written in plain numbers. A portfolio
                  that lost 37% in 2008 needed a 58.7% gain just to break even. The capped and
                  floored strategy never took that loss in the first place. While the uncapped
                  portfolio spent years climbing back to flat, the indexed strategy kept
                  compounding from a higher floor.
                </p>
                <p>
                  The trade is real. The capped strategy missed the 28.71% year in 2013. It capped
                  at 15. It missed the 26.46% year in 2003. It capped at 15. Over 27 years it
                  forfeited several explosive upside years. And it still ended with 52% more money.
                  That is the math of avoiding the holes.
                </p>
                <p>
                  The lesson is not that capped strategies are universally superior. The lesson is
                  that volatility is a tax on long-term returns, and any structure that smooths the
                  ride compounds more reliably than one that doesn't. This is the foundational case
                  for indexed universal life, fixed indexed annuities, and any product family that
                  delivers participation with a floor.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 5: Stat Cards */}
          <section className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {[
              {
                title: "The Win Rate Was Identical",
                body:
                  "Both strategies were positive in 17 of 27 years. 63% of the time. The difference was not how often each strategy won. The difference was what happened in the 10 down years. The uncapped portfolio averaged a 14.2% loss in those years. The capped strategy averaged 0%. That is the entire gap.",
              },
              {
                title: "The Drawdown Story",
                body:
                  "The uncapped S&P portfolio lost 37.02% in 2008. It lost 22.10% in 2002. It lost 19.44% in 2022. Three separate generational drawdowns inside a 27-year window. Each one reset the compounding clock for the uncapped investor. The capped investor stayed at zero through every one of them and kept compounding the next year off a full balance.",
              },
              {
                title: "Why CAGR Lies",
                body:
                  "The uncapped portfolio compounded at 4.50% annually. The capped portfolio compounded at 6.71% annually. A 2.21 percentage point CAGR difference sounds modest on paper. Over 27 years on $100,000 of starting capital it is the difference between $622,724 and $950,648. CAGR is not intuitive. Compounding rewards consistency more than peak performance.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-xl p-6 backdrop-blur-sm"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderTop: `2px solid ${GOLD}`,
                  border: `1px solid rgba(255,255,255,0.06)`,
                  borderTopWidth: 2,
                  borderTopColor: GOLD,
                }}
              >
                <h3 className="font-serif text-lg md:text-xl mb-3" style={{ color: GOLD }}>
                  {c.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: `${CREAM}CC` }}>
                  {c.body}
                </p>
              </div>
            ))}
          </section>

          {/* SECTION 6: Advisor Talking Points */}
          <section
            className="rounded-xl p-6 md:p-10 max-w-6xl mx-auto space-y-6"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <h2 className="font-serif text-2xl md:text-3xl" style={{ color: CREAM }}>
              Three Ways to Frame This in a Client Meeting.
            </h2>
            <div className="space-y-5 text-sm md:text-base leading-relaxed" style={{ color: `${CREAM}CC` }}>
              <p>
                <span className="font-semibold" style={{ color: GOLD }}>For the client who insists on full market exposure: </span>
                "You are right that the market wins over time. The question is whether you stay
                invested through the losses. The chart shows what happens when you do, and what
                happens when a product structure makes that question irrelevant. Most clients don't
                survive 2008 and 2022 emotionally. They sell. This structure makes selling
                unnecessary because there is nothing to recover from."
              </p>
              <p>
                <span className="font-semibold" style={{ color: GOLD }}>For the client comparing IUL or FIA to a brokerage account: </span>
                "You are not choosing between higher and lower returns. You are choosing between a
                smoother return path and a volatile one. Over 27 years of real data, the smoother
                path delivered 327 thousand dollars more on a 100 thousand dollar start. The cap is
                not the cost. The cap is the price of admission to never losing again."
              </p>
              <p>
                <span className="font-semibold" style={{ color: GOLD }}>For the pre-retiree five to ten years out: </span>
                "You do not have time to recover from another 2008. Sequence of returns is the
                biggest threat to your retirement income, not average return. The chart shows what
                removing sequence risk does to ending wealth. This is why we structure a portion of
                retirement assets with a floor."
              </p>
            </div>
          </section>

          {/* SECTION 7: Footer */}
          <footer
            className="text-xs leading-relaxed max-w-6xl mx-auto pt-6"
            style={{ color: "#9ca3af", borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="pt-4">
              <span className="font-semibold" style={{ color: "#cbd5e1" }}>Assumptions: </span>
              S&amp;P 500 Total Returns (includes dividends). All returns are annual. Period covers
              1999 to 2025 (27 years). Indexing Strategy caps any positive year at +15% and sets
              any negative year to 0%. Indexing strategies shown are illustrative and not a
              guarantee of cap rates. Actual results vary based on the issuing carrier, product
              structure, prevailing cap rates, and market conditions. For licensed advisor use. Not
              intended as financial advice for end clients. Source: FactSet. Data as of May 23,
              2025.
            </p>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
}