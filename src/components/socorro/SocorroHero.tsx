import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function SocorroHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: "#0D1F1A" }}>
      {/* Gold geometric line texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, #C8A96E 40px, #C8A96E 41px),
                          repeating-linear-gradient(-45deg, transparent, transparent 40px, #C8A96E 40px, #C8A96E 41px)`,
      }} />

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 py-20 w-full">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-16">
          <img
            src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png"
            alt="Everence Wealth"
            className="h-10 sm:h-12 brightness-0 invert"
          />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#C8A96E", letterSpacing: "0.2em" }}>
            SISD Official Vendor
          </span>
        </div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-white mb-6"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, fontSize: "clamp(40px, 6vw, 80px)", lineHeight: 1.05 }}
        >
          Are You Leaving Retirement<br />
          Money on the Table?
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-6"
          style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "20px", color: "#C8A96E", maxWidth: "600px" }}
        >
          Most SISD employees don't know what they're missing. This workshop changes that.
        </motion.p>

        {/* Body */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mb-10"
          style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "16px", color: "rgba(255,255,255,0.7)", maxWidth: "600px", lineHeight: 1.7 }}
        >
          Join us for an exclusive financial education session designed specifically for Socorro ISD employees — where we break down the strategies that help public school employees build, protect, and maximize their retirement.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link
            to="/socorro-isd/advisors"
            className="inline-block transition-colors duration-200"
            style={{
              background: "#C8A96E", color: "#1A4D3E",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "16px", fontWeight: 700,
              padding: "18px 40px", borderRadius: "4px",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#b8996a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#C8A96E"; }}
          >
            Reserve Your Seat →
          </Link>
        </motion.div>

        {/* Detail text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6"
          style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}
        >
          📅 Week of March 23rd &nbsp;|&nbsp; Socorro ISD Campus &nbsp;|&nbsp; 5-Minute Discovery Sessions Available
        </motion.p>

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
