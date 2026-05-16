import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";

const GOLD = "#C9A24B";
const GOLD_SOFT = "#EDDB77";
const EMERALD = "#0F3B2E";
const CREAM = "#F5EFE0";

const prevent = (e: React.SyntheticEvent) => e.preventDefault();

const subnav = [
  { id: "flyer", label: "01 · Flyer" },
  { id: "why", label: "02 · Why It Matters" },
  { id: "timeline", label: "03 · Timeline" },
  { id: "talking", label: "04 · Talking Points" },
];

const whyCards = [
  {
    tag: "The Discount",
    head: "Today's 37% Is a Sale Price",
    body: "For most of the 20th century, the top marginal rate sat above 70%. From 1944 to 1963 it never dropped below 91%. The current 37% bracket is the lowest sustained top rate the country has seen outside of a brief window in the late 1980s. Tax-deferred dollars sitting in qualified accounts will eventually be taxed at whatever future rates demand.",
    stat: "37%",
    statLabel: "current top rate",
  },
  {
    tag: "The Trigger",
    head: "TCJA Sunset at the End of 2025",
    body: "The Tax Cuts and Jobs Act of 2017 is scheduled to expire after December 31, 2025. Without Congressional action, the top rate is set to revert from 37% back to 39.6%. Standard deductions shrink. Brackets compress. Every projection that assumed today's rates would last needs to be re-modeled.",
    stat: "12·31·25",
    statLabel: "sunset date",
  },
  {
    tag: "The Strategy",
    head: "Move Before the Window Shuts",
    body: "Roth conversions executed in 2024 and 2025 lock in today's lower brackets. Tax-free retirement vehicles such as properly structured IUL contracts and municipal bond ladders become more valuable as rates climb. The math favors clients who act while rates are still suppressed.",
    stat: "~60%",
    statLabel: "long-run average",
  },
];

const timeline = [
  { era: "1913 — 1917", rate: "7%", body: "The 16th Amendment legalized a permanent federal income tax. The original top rate was 7% and only applied to the wealthiest sliver of the country. Income tax was a niche obligation, not a national reality." },
  { era: "1918 — 1941", rate: "77%", body: "World War I financing pushed the top rate to 77% almost overnight. After the war, rates fell into the low 20s during the Roaring Twenties, then climbed again under Hoover and Roosevelt as the Depression forced new revenue. By 1941 the top rate had already returned to 81%." },
  { era: "1942 — 1963", rate: "94%", body: "World War II locked the country into a tax regime no peacetime economy has matched since. The top rate hit 94% in 1944. From 1951 forward it sat at 91% or 92% for over a decade. The post-war boom happened under these rates." },
  { era: "1964 — 1981", rate: "70%", body: "The Kennedy and Johnson tax cuts brought the top rate down to 70%, where it stayed through Vietnam, the Great Society expansion, and the stagflation years. Inflation pushed millions of middle-income earners into top brackets through bracket creep." },
  { era: "1982 — 1986", rate: "28%", body: "Reagan's first tax reform dropped the top rate to 50%, then the Tax Reform Act of 1986 collapsed the entire bracket structure and pushed the top rate down to 28%. This was the lowest sustained top rate in the modern era." },
  { era: "1988 — 1992", rate: "31%", body: "The 28% floor held briefly, then climbed back to 31% under George H.W. Bush as deficits forced a course correction." },
  { era: "1993 — 2000", rate: "39.6%", body: "Clinton-era reforms moved the top rate to 39.6%, where it stayed through the dot-com expansion. Surpluses replaced deficits for a short window." },
  { era: "2001 — 2012", rate: "35%", body: "The Bush tax cuts dropped the top rate to 35%. These cuts were originally temporary and were extended multiple times before partially expiring." },
  { era: "2013 — 2017", rate: "39.6%", body: "The American Taxpayer Relief Act restored the 39.6% top bracket for high earners while keeping the lower Bush rates permanent for everyone else." },
  { era: "2018 — Today", rate: "37%", body: "The Tax Cuts and Jobs Act dropped the top rate to 37%. This is where we live now. This rate is scheduled to expire at the end of 2025." },
];

const talkingPoints = [
  { who: "For the rate-skeptic client", quote: "Look at the chart. Since 1913, the top rate has averaged around 60%. Today it's 37%. That is not a baseline. That is a sale. Are you building your retirement assuming the sale lasts forever?" },
  { who: "For the 401(k) / Traditional IRA holder", quote: "Every dollar in there is an IOU to the IRS at a rate you don't know yet. We have until December 2025 to move dollars at today's known rates. After that, we are guessing." },
  { who: "For the \"I'll be in a lower bracket\" client", quote: "Maybe. But that assumes brackets stay where they are. Look at the 1940s through the 1970s. People who retired in 1965 thinking 30% was their ceiling watched the top rate hit 70%. Required Minimum Distributions don't care what bracket you wanted to be in." },
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
      className="relative min-h-screen overflow-hidden text-white"
      style={{
        scrollBehavior: "smooth",
        background: "#05070a",
        fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
      }}
    >
      <Helmet>
        <title>Tax History · Everence Wealth Advisor Resources</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Ambient gradient mesh */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full blur-[140px] opacity-30"
          style={{ background: EMERALD }}
        />
        <div
          className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full blur-[160px] opacity-20"
          style={{ background: GOLD }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-[700px] w-[700px] rounded-full blur-[180px] opacity-[0.12]"
          style={{ background: GOLD_SOFT }}
        />
        {/* Grain */}
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />
      </div>

      {/* Sticky glass sub-nav */}
      <nav
        className="sticky top-0 z-40 backdrop-blur-xl border-b"
        style={{
          background: "rgba(8,10,14,0.55)",
          borderColor: "rgba(201,162,75,0.18)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <div
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em]"
            style={{ color: GOLD_SOFT }}
          >
            <Sparkles className="h-3 w-3" />
            Resource · Tax History
          </div>
          <div className="hidden md:flex items-center gap-7 text-xs">
            {subnav.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 px-6 pt-24 md:pt-36 pb-24 md:pb-32">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.3em] mb-10"
            style={{
              border: `1px solid ${GOLD}55`,
              background: "rgba(201,162,75,0.08)",
              color: GOLD_SOFT,
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD_SOFT }} />
            Everence Wealth Resource
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="font-serif tracking-tight leading-[0.95]"
            style={{ fontSize: "clamp(2.75rem, 7vw, 6.5rem)" }}
          >
            <span className="block text-white/95">112 Years of</span>
            <span className="block italic" style={{ color: GOLD_SOFT, fontFamily: "'Playfair Display', Georgia, serif" }}>
              Tax History.
            </span>
            <span className="block text-white/95 mt-2">One Window</span>
            <span
              className="block"
              style={{
                background: `linear-gradient(120deg, ${GOLD_SOFT}, ${GOLD} 50%, #8a6f2e)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              That's Closing.
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-12 grid md:grid-cols-[1fr_auto] gap-10 items-end"
          >
            <p className="max-w-xl text-base md:text-lg leading-relaxed text-white/65">
              The top federal marginal tax rate today sits at 37%. The long-run average since 1913 is closer to 60%. We are living inside a historic discount.
              <span className="text-white"> Show your clients what that means.</span>
            </p>
            <a
              href="#flyer"
              className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/70 hover:text-white transition-colors"
            >
              Open the flyer
              <span
                className="h-9 w-9 rounded-full grid place-items-center border transition-transform group-hover:translate-y-1"
                style={{ borderColor: `${GOLD}66` }}
              >
                <ArrowDown className="h-3.5 w-3.5" style={{ color: GOLD_SOFT }} />
              </span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* FLYER */}
      <section id="flyer" className="relative z-10 px-4 md:px-8 pb-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-6 text-[10px] uppercase tracking-[0.35em] text-white/40">
            <span>01 · Source Material</span>
            <span>View Only · Do Not Distribute</span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="relative rounded-2xl p-2 md:p-3"
            style={{
              background:
                "linear-gradient(140deg, rgba(201,162,75,0.5), rgba(201,162,75,0.05) 40%, rgba(255,255,255,0.06) 80%)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 50px 120px -30px rgba(0,0,0,0.85), 0 0 0 1px rgba(201,162,75,0.2)",
            }}
          >
            <div className="relative rounded-xl overflow-hidden">
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
              <div
                className="absolute inset-0"
                onContextMenu={prevent}
                onDragStart={prevent}
                style={{ userSelect: "none", background: "transparent" }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section id="why" className="relative z-10 px-6 py-28">
        <div className="max-w-[1300px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] mb-4" style={{ color: GOLD_SOFT }}>
                02 · The Thesis
              </div>
              <h2
                className="font-serif tracking-tight leading-[1]"
                style={{ fontSize: "clamp(2rem, 4.5vw, 4rem)" }}
              >
                Three numbers your <br className="hidden md:block" />
                client needs to <em style={{ color: GOLD_SOFT }}>feel.</em>
              </h2>
            </div>
            <p className="max-w-sm text-sm text-white/55 leading-relaxed">
              The chart tells one story. These three frames translate it into language a client actually moves on.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {whyCards.map((c, i) => (
              <motion.div
                key={c.tag}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative rounded-3xl p-8 overflow-hidden"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                  backdropFilter: "blur(24px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.08), 0 30px 60px -30px rgba(0,0,0,0.6)",
                }}
              >
                <div
                  className="absolute -top-px left-6 right-6 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
                  }}
                />
                <div className="text-[10px] uppercase tracking-[0.3em] mb-6" style={{ color: GOLD_SOFT }}>
                  {c.tag}
                </div>
                <div className="mb-8">
                  <div
                    className="font-serif leading-none"
                    style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", color: CREAM }}
                  >
                    {c.stat}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-white/40 mt-2">
                    {c.statLabel}
                  </div>
                </div>
                <h3 className="font-serif text-2xl leading-tight mb-4 text-white">{c.head}</h3>
                <p className="text-sm leading-relaxed text-white/65">{c.body}</p>
                <div
                  className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: GOLD }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section id="timeline" className="relative z-10 px-6 py-28">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-20">
            <div className="text-[10px] uppercase tracking-[0.35em] mb-4" style={{ color: GOLD_SOFT }}>
              03 · The Long View
            </div>
            <h2
              className="font-serif tracking-tight leading-[1]"
              style={{ fontSize: "clamp(2rem, 4.5vw, 4rem)" }}
            >
              A century of tax policy, <br className="hidden md:block" />
              <em style={{ color: GOLD_SOFT }}>in plain English.</em>
            </h2>
          </div>

          <div className="relative">
            {/* vertical rail */}
            <div
              aria-hidden
              className="absolute left-[14px] md:left-1/2 top-0 bottom-0 w-px"
              style={{
                background:
                  `linear-gradient(180deg, transparent, ${GOLD}55 10%, ${GOLD}55 90%, transparent)`,
              }}
            />
            <div className="space-y-12">
              {timeline.map((t, i) => {
                const left = i % 2 === 0;
                return (
                  <motion.div
                    key={t.era}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5 }}
                    className="relative md:grid md:grid-cols-2 md:gap-12 items-start pl-10 md:pl-0"
                  >
                    {/* dot */}
                    <div
                      className="absolute left-0 md:left-1/2 top-2 -translate-x-1/2 h-3 w-3 rounded-full ring-4 ring-[#05070a]"
                      style={{ background: GOLD }}
                    />
                    <div className={left ? "md:pr-12 md:text-right" : "md:col-start-2 md:pl-12"}>
                      <div
                        className="font-serif text-3xl md:text-4xl leading-none mb-2"
                        style={{ color: GOLD_SOFT }}
                      >
                        {t.rate}
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.3em] text-white/50 mb-4">
                        {t.era}
                      </div>
                    </div>
                    <div
                      className={
                        (left ? "md:col-start-2 md:pl-12" : "md:row-start-1 md:pr-12 md:text-right") +
                        " text-sm leading-relaxed text-white/70 max-w-md"
                      }
                    >
                      {t.body}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* TALKING POINTS */}
      <section id="talking" className="relative z-10 px-6 py-28">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] mb-4" style={{ color: GOLD_SOFT }}>
                04 · Advisor Scripts
              </div>
              <h2
                className="font-serif tracking-tight leading-[1]"
                style={{ fontSize: "clamp(2rem, 4.5vw, 4rem)" }}
              >
                How to frame this <br className="hidden md:block" />
                <em style={{ color: GOLD_SOFT }}>for clients.</em>
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
              Internal Use Only
            </span>
          </div>

          <div className="space-y-5">
            {talkingPoints.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative rounded-3xl p-8 md:p-10"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
                  backdropFilter: "blur(18px)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="absolute top-6 left-8 font-serif leading-none opacity-40"
                  style={{ fontSize: "4rem", color: GOLD }}
                >
                  &ldquo;
                </div>
                <div className="pl-14 md:pl-16">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/50 mb-4">
                    {t.who}
                  </div>
                  <p
                    className="font-serif text-xl md:text-2xl leading-snug text-white/90"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {t.quote}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOURCES */}
      <footer className="relative z-10 px-6 py-12 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="max-w-[1100px] mx-auto text-xs leading-relaxed text-center text-white/40">
          Sources: Internal Revenue Service (IRS), Tax Policy Center, PennyCalc, Wolters Kluwer. Data reflects the top marginal rate on ordinary income, exclusive of surtaxes such as the Net Investment Income Tax. For licensed advisor use. Not intended as tax advice for end clients.
        </p>
      </footer>
    </div>
  );
}