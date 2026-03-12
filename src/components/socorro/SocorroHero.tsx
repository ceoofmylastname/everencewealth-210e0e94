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
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
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

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-20 w-full pt-32">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
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
            SISD Official Vendor &nbsp;·&nbsp; March 24–28, 2026
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="hero-headline mb-6"
          variants={headlineVariants}
          initial="hidden"
          animate="show"
        >
          <motion.span className="line-1" variants={lineVariant}>
            Are You Leaving <em className="slash-word">Retirement</em>
          </motion.span>
          <motion.span className="line-2" variants={lineVariant}>
            Money on the Table?
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
          Most SISD employees don't know what they're missing. This workshop
          changes that.
        </motion.p>

        {/* Body */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mb-10"
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "16px",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "600px",
            lineHeight: 1.7,
          }}
        >
          Join us for an exclusive financial education session designed
          specifically for Socorro ISD employees — where we break down the
          strategies that help public school employees build, protect, and
          maximize their retirement.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          <GoldCTA href="/socorro-isd/advisors" size="lg">
            Reserve Your Seat &rarr;
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
          Socorro ISD Campus &nbsp;·&nbsp; Free, No-Obligation &nbsp;·&nbsp;
          5-Minute Discovery Sessions Available
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
