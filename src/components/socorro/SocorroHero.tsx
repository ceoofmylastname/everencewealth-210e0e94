import { motion } from "framer-motion";
import FloatingOrbs from "./primitives/FloatingOrbs";
import GoldCTA from "./primitives/GoldCTA";
import heroImage from "@/assets/socorro-hero-lifestyle.jpg";

const headlineVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18 } },
};

const lineVariant = {
  hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
  show: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function SocorroHero() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden socorro-noise-overlay"
      style={{ background: "#0D1F1A" }}
    >
      <FloatingOrbs variant="dark" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-20 w-full pt-28">
        <div className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
          {/* Left — Content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8"
            >
              <span
                className="inline-flex items-center gap-2 px-5 py-2.5"
                style={{
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#C8A96E",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  border: "1px solid rgba(200, 169, 110, 0.2)",
                  borderRadius: "9999px",
                  background: "rgba(200, 169, 110, 0.06)",
                  boxShadow: "0 0 20px rgba(200, 169, 110, 0.08)",
                }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{
                    background: "#C8A96E",
                    boxShadow: "0 0 8px rgba(200, 169, 110, 0.6)",
                  }}
                />
                SISD OFFICIAL VENDOR &nbsp;·&nbsp; LIMITED SESSIONS
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="hero-headline mb-6"
              variants={headlineVariants}
              initial="hidden"
              animate="show"
            >
              <motion.span className="hero-line-1" variants={lineVariant}>
                The Retirement System
              </motion.span>
              <motion.span className="hero-line-2" variants={lineVariant}>
                Was Not Built For You.
              </motion.span>
              <motion.span className="hero-line-3" variants={lineVariant}>
                It Was Built To Be Paid By You.
              </motion.span>
            </motion.h1>

            {/* Gold accent line */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
              className="mb-8"
              style={{
                width: "80px",
                height: "3px",
                background: "linear-gradient(90deg, #C8A96E, #E2C896)",
                borderRadius: "2px",
                transformOrigin: "left",
              }}
            />

            {/* Single punchy subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mb-10"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "18px",
                color: "rgba(240,242,241,0.6)",
                maxWidth: "500px",
                lineHeight: 1.7,
              }}
            >
              Every fee, every market swing, every tax bill — someone else planned for that. The question is whether you did.
            </motion.p>

            {/* CTA with glow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex flex-col sm:flex-row items-start gap-5"
            >
              <div className="socorro-glow-cta rounded-full">
                <GoldCTA href="/socorro-isd/advisors" size="lg">
                  Book Your Discovery Call &rarr;
                </GoldCTA>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="mt-5"
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: "12px",
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.05em",
              }}
            >
              Free &nbsp;·&nbsp; No Obligation &nbsp;·&nbsp; 100% Confidential
            </motion.p>
          </div>

          {/* Right — Lifestyle Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block relative"
          >
            <div
              className="relative overflow-hidden"
              style={{
                width: "420px",
                height: "520px",
                borderRadius: "32px 80px 32px 80px",
                boxShadow: "0 40px 80px rgba(0,0,0,0.4), 0 0 60px rgba(200,169,110,0.08)",
              }}
            >
              <img
                src={heroImage}
                alt="Retired couple walking on a sunset beach"
                className="w-full h-full object-cover"
                style={{ filter: "brightness(0.9) contrast(1.05)" }}
              />
              {/* Gold border accent */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  borderRadius: "inherit",
                  border: "2px solid rgba(200, 169, 110, 0.2)",
                }}
              />
            </div>
            {/* Floating gold stat pill */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-8 socorro-glass px-5 py-3"
              style={{
                borderRadius: "16px",
                boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Clash Display', system-ui, sans-serif",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#C8A96E",
                }}
              >
                $150M+
              </span>
              <span
                className="block"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Assets Protected
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12l7 7 7-7" stroke="#C8A96E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
