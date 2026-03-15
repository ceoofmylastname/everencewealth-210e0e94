import { motion } from "framer-motion";
import FloatingOrbs from "./primitives/FloatingOrbs";
import GoldCTA from "./primitives/GoldCTA";

const headlineVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.18 },
  },
};

const lineVariant = {
  hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function SocorroHero() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "#0D1F1A" }}
    >
      <FloatingOrbs variant="dark" />

      {/* Gold geometric line texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, #C8A96E 40px, #C8A96E 41px),
                            repeating-linear-gradient(-45deg, transparent, transparent 40px, #C8A96E 40px, #C8A96E 41px)`,
        }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-20 w-full pt-24">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <span
            className="inline-block socorro-glass px-4 py-2"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              color: "#C8A96E",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            SISD OFFICIAL VENDOR &nbsp;·&nbsp; LIMITED DISCOVERY SESSIONS
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="hero-headline mb-4"
          variants={headlineVariants}
          initial="hidden"
          animate="show"
        >
          <motion.span className="line-1" variants={lineVariant}>
            The Retirement System Was Not <em className="slash-word">Built</em>
          </motion.span>
          <motion.span className="line-2" variants={lineVariant}>
            For You. It Was Built To Be Paid By You.
          </motion.span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mb-6"
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "20px",
            color: "#C8A96E",
            maxWidth: "600px",
          }}
        >
          Every fee, every market swing, every tax bill in retirement — someone else planned for that. The question is whether you did.
        </motion.p>

        {/* Body paragraphs */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mb-4"
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "16px",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "600px",
            lineHeight: 1.7,
          }}
        >
          You saw the chart. You saw what happens to $100,000 in a variable account versus a protected indexed strategy over 26 years. That gap isn't luck. It isn't timing. It's structure. And right now, most people sitting in a 401k or a brokerage account are on the wrong side of it.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mb-4"
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "16px",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "600px",
            lineHeight: 1.7,
          }}
        >
          Hidden fees don't announce themselves. Tax time bombs don't go off until you're 73 and the IRS sends you a Required Minimum Distribution you didn't plan for. Market crashes don't wait for a good time. They just happen — and if your floor is zero, you feel every single point of it.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mb-4"
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "16px",
            color: "#C8A96E",
            maxWidth: "600px",
            lineHeight: 1.7,
            fontWeight: 500,
          }}
        >
          You came to this workshop because something wasn't adding up. Trust that instinct.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mb-4"
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "16px",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "600px",
            lineHeight: 1.7,
          }}
        >
          The Financial Needs Assessment isn't a pitch. It's a stress test. Thirty minutes. Your numbers. A real look at what your current strategy costs you in fees, taxes, and unprotected downside — and what a different structure could do instead.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mb-10"
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "16px",
            color: "rgba(255,255,255,0.85)",
            maxWidth: "600px",
            lineHeight: 1.7,
            fontWeight: 600,
          }}
        >
          No pressure. No products pushed. Just clarity.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          <GoldCTA href="/socorro-isd/advisors" size="lg">
            Book Your Discovery Call &rarr;
          </GoldCTA>
        </motion.div>

        {/* Detail text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="mt-8"
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "13px",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          Free &nbsp;·&nbsp; No Obligation &nbsp;·&nbsp; 100% Confidential
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12l7 7 7-7"
              stroke="#C8A96E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
