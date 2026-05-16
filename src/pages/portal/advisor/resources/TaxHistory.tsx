import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card } from "@/components/ui/card";

const EMERALD = "#0F3B2E";
const GOLD = "#C9A24B";
const CREAM = "#F5EFE0";
const CHARCOAL = "#1A1A1A";

const prevent = (e: React.SyntheticEvent) => e.preventDefault();

const subnav = [
  { id: "flyer", label: "Flyer" },
  { id: "why", label: "Why It Matters" },
  { id: "timeline", label: "Timeline" },
  { id: "talking", label: "Talking Points" },
];

const whyCards = [
  {
    head: "Today's 37% Is a Sale Price",
    title: "The Discount",
    body: "For most of the 20th century, the top marginal rate sat above 70%. From 1944 to 1963 it never dropped below 91%. The current 37% bracket is the lowest sustained top rate the country has seen outside of a brief window in the late 1980s. Tax-deferred dollars sitting in qualified accounts will eventually be taxed at whatever future rates demand.",
  },
  {
    head: "TCJA Sunset at the End of 2026",
    title: "The Trigger",
    body: "The Tax Cuts and Jobs Act of 2017 is scheduled to expire after December 31, 2026. Without Congressional action, the top rate is set to revert from 37% back to 39.6%. Standard deductions shrink. Brackets compress. Every projection that assumed today's rates would last needs to be re-modeled.",
  },
  {
    head: "Move Before the Window Shuts",
    title: "The Strategy",
    body: "Roth conversions executed in 2024 and 2025 lock in today's lower brackets. Tax-free retirement vehicles such as properly structured IUL contracts and municipal bond ladders become more valuable as rates climb. The math favors clients who act while rates are still suppressed.",
  },
];

const timeline: { era: string; body: string }[] = [
  { era: "1913 – 1917", body: "The 16th Amendment legalized a permanent federal income tax. The original top rate was 7% and only applied to the wealthiest sliver of the country. Income tax was a niche obligation, not a national reality." },
  { era: "1918 – 1941", body: "World War I financing pushed the top rate to 77% almost overnight. After the war, rates fell into the low 20s during the Roaring Twenties, then climbed again under Hoover and Roosevelt as the Depression forced new revenue. By 1941 the top rate had already returned to 81%." },
  { era: "1942 – 1963", body: "World War II locked the country into a tax regime no peacetime economy has matched since. The top rate hit 94% in 1944. From 1951 forward it sat at 91% or 92% for over a decade. The post-war boom happened under these rates." },
  { era: "1964 – 1981", body: "The Kennedy and Johnson tax cuts brought the top rate down to 70%, where it stayed through Vietnam, the Great Society expansion, and the stagflation years. Inflation pushed millions of middle-income earners into top brackets through bracket creep." },
  { era: "1982 – 1986", body: "Reagan's first tax reform dropped the top rate to 50%, then the Tax Reform Act of 1986 collapsed the entire bracket structure and pushed the top rate down to 28%. This was the lowest sustained top rate in the modern era." },
  { era: "1988 – 1992", body: "The 28% floor held briefly, then climbed back to 31% under George H.W. Bush as deficits forced a course correction." },
  { era: "1993 – 2000", body: "Clinton-era reforms moved the top rate to 39.6%, where it stayed through the dot-com expansion. Surpluses replaced deficits for a short window." },
  { era: "2001 – 2012", body: "The Bush tax cuts dropped the top rate to 35%. These cuts were originally temporary and were extended multiple times before partially expiring." },
  { era: "2013 – 2017", body: "The American Taxpayer Relief Act restored the 39.6% top bracket for high earners while keeping the lower Bush rates permanent for everyone else." },
  { era: "2018 – Today", body: "The Tax Cuts and Jobs Act dropped the top rate to 37%. This is where we live now. This rate is scheduled to expire at the end of 2025." },
];

const talkingPoints = [
  "For the client who thinks rates will stay low: \u201CLook at the chart. Since 1913, the top rate has averaged around 60%. Today it's 37%. That is not a baseline. That is a sale. Are you building your retirement assuming the sale lasts forever?\u201D",
  "For the client with a large 401(k) or Traditional IRA: \u201CEvery dollar in there is an IOU to the IRS at a rate you don't know yet. We have until December 2026 to move dollars at today's known rates. After that, we are guessing.\u201D",
  "For the client who says they'll just be in a lower bracket in retirement: \u201CMaybe. But that assumes brackets stay where they are. Look at the 1940s through the 1970s. People who retired in 1965 thinking 30% was their ceiling watched the top rate hit 70%. Required Minimum Distributions don't care what bracket you wanted to be in.\u201D",
];

export default function TaxHistory() {
  useEffect(() => {
    const handler = (e: MouseEvent) => e.preventDefault();
    const wrap = document.getElementById("tax-history-wrap");
    wrap?.addEventListener("contextmenu", handler);
    return () => wrap?.removeEventListener("contextmenu", handler);
  }, []);

  return (
    <div
      id="tax-history-wrap"
      onContextMenu={prevent}
      style={{ scrollBehavior: "smooth" }}
      className="min-h-screen bg-white"
    >
      <Helmet>
        <title>Tax History · Everence Wealth Advisor Resources</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Sticky sub-nav */}
      <nav
        className="sticky top-0 z-30 backdrop-blur border-b"
        style={{ background: "rgba(26,26,26,0.92)", borderColor: `${GOLD}40` }}
      >
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm">
          {subnav.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="uppercase tracking-widest font-medium transition-colors"
              style={{ color: CREAM }}
            >
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative overflow-hidden px-6 py-20 md:py-28"
        style={{
          background: `linear-gradient(135deg, ${CHARCOAL} 0%, ${EMERALD} 60%, ${CHARCOAL} 100%)`,
        }}
      >
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
        />
        <div className="max-w-[1100px] mx-auto text-center">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-[10px] sm:text-xs uppercase tracking-[0.25em] font-semibold mb-6 border"
            style={{ color: GOLD, borderColor: `${GOLD}80`, background: `${GOLD}10` }}
          >
            Everence Wealth Resource
          </span>
          <h1
            className="font-serif text-4xl md:text-6xl lg:text-7xl leading-[1.05] mb-6"
            style={{ color: CREAM }}
          >
            112 Years of Tax History.
            <br />
            <span style={{ color: GOLD }}>One Window That's Closing.</span>
          </h1>
          <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: `${CREAM}cc` }}>
            The top federal marginal tax rate today sits at 37%. The long-run average since 1913 is closer to 60%. We are living inside a historic discount. Show your clients what that means.
          </p>
        </div>
      </section>

      {/* Flyer */}
      <section id="flyer" className="px-4 py-12 md:py-16" style={{ background: CHARCOAL }}>
        <div className="max-w-[1400px] mx-auto relative">
          <div
            className="relative rounded-md overflow-hidden"
            style={{
              border: `1px solid ${GOLD}`,
              boxShadow: `0 30px 80px -20px rgba(0,0,0,0.7), inset 0 0 0 1px ${GOLD}33`,
            }}
          >
            <img
              src="/resources/everence-tax-history-flyer.png"
              alt="The History of U.S. Federal Marginal Tax Rates"
              draggable={false}
              onDragStart={prevent}
              onContextMenu={prevent}
              className="w-full h-auto block select-none"
              style={{
                objectFit: "contain",
                userSelect: "none",
                WebkitUserSelect: "none",
                pointerEvents: "none",
              }}
            />
            {/* Transparent overlay to swallow interactions */}
            <div
              className="absolute inset-0"
              onContextMenu={prevent}
              onDragStart={prevent}
              style={{ userSelect: "none", background: "transparent" }}
            />
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section id="why" className="px-6 py-20" style={{ background: "#0d0d0d" }}>
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-serif text-3xl md:text-5xl text-center mb-14" style={{ color: CREAM }}>
            Why This <span style={{ color: GOLD }}>Matters</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {whyCards.map((c) => (
              <Card
                key={c.title}
                className="p-7 border-0 relative overflow-hidden backdrop-blur"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  boxShadow: `inset 0 1px 0 ${GOLD}, 0 20px 50px -20px rgba(0,0,0,0.6)`,
                }}
              >
                <div
                  className="text-[10px] uppercase tracking-[0.3em] mb-3 font-semibold"
                  style={{ color: GOLD }}
                >
                  {c.title}
                </div>
                <h3 className="font-serif text-2xl mb-4" style={{ color: CREAM }}>
                  {c.head}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: `${CREAM}b3` }}>
                  {c.body}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section id="timeline" className="px-6 py-20" style={{ background: CREAM }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <div
              className="text-[10px] uppercase tracking-[0.3em] mb-3 font-semibold"
              style={{ color: EMERALD }}
            >
              The Long View
            </div>
            <h2 className="font-serif text-3xl md:text-5xl" style={{ color: CHARCOAL }}>
              A Century of Tax Policy in Plain English.
            </h2>
          </div>
          <div className="md:columns-2 md:gap-12 space-y-6 md:space-y-0">
            {timeline.map((t) => (
              <div key={t.era} className="break-inside-avoid mb-6">
                <div
                  className="font-serif text-xl mb-1"
                  style={{ color: EMERALD }}
                >
                  {t.era}
                </div>
                <p
                  className="font-serif text-base leading-relaxed"
                  style={{ color: CHARCOAL }}
                >
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Talking Points */}
      <section id="talking" className="px-6 py-20 bg-neutral-100">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <div
              className="text-[10px] uppercase tracking-[0.3em] mb-3 font-semibold text-neutral-500"
            >
              Internal Use Only
            </div>
            <h2 className="font-serif text-3xl md:text-5xl" style={{ color: CHARCOAL }}>
              How to Frame This for Clients.
            </h2>
          </div>
          <div className="space-y-5">
            {talkingPoints.map((p, i) => (
              <Card
                key={i}
                className="p-6 bg-white"
                style={{ border: `1px solid ${GOLD}4D`, boxShadow: "inset 0 1px 0 rgba(0,0,0,0.03)" }}
              >
                <p className="text-base leading-relaxed text-neutral-800">{p}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Source strip */}
      <footer className="px-6 py-8" style={{ background: CHARCOAL }}>
        <p
          className="max-w-[1100px] mx-auto text-xs leading-relaxed text-center"
          style={{ color: `${CREAM}80` }}
        >
          Sources: Internal Revenue Service (IRS), Tax Policy Center, PennyCalc, Wolters Kluwer. Data reflects the top marginal rate on ordinary income, exclusive of surtaxes such as the Net Investment Income Tax. For licensed advisor use. Not intended as tax advice for end clients.
        </p>
      </footer>
    </div>
  );
}