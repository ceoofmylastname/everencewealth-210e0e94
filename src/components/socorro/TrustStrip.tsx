import { motion } from "framer-motion";

const carriers = [
  "Nationwide",
  "Lincoln Financial",
  "Pacific Life",
  "Transamerica",
  "Athene",
  "North American",
  "Sammons Financial",
];

const badges = [
  { label: "Fiduciary Standard", icon: "🛡️" },
  { label: "Fee-Only Advisors", icon: "✓" },
  { label: "FINRA Registered", icon: "✓" },
];

export default function TrustStrip() {
  return (
    <section className="py-12 px-4 sm:px-6" style={{ background: "#ffffff" }}>
      <div className="max-w-[900px] mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p
            className="text-center mb-8"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#9CA3AF",
            }}
          >
            Trusted Carrier Partners
          </p>

          {/* Carrier logos as text */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mb-10">
            {carriers.map((name) => (
              <span
                key={name}
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#9CA3AF",
                  letterSpacing: "0.02em",
                }}
              >
                {name}
              </span>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {badges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#1A4D3E",
                }}
              >
                <span
                  className="flex items-center justify-center"
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "rgba(26,77,62,0.08)",
                    fontSize: "11px",
                    color: "#1A4D3E",
                    fontWeight: 700,
                  }}
                >
                  {badge.icon}
                </span>
                {badge.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
