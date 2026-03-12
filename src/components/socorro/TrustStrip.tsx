import ScrollReveal from "./primitives/ScrollReveal";

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
    <section className="py-14 px-6" style={{ background: "#F7F9F8" }}>
      <div className="max-w-[900px] mx-auto">
        <ScrollReveal>
          <p
            className="text-center mb-8"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(26,77,62,0.4)",
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
                  color: "rgba(26,77,62,0.35)",
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
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "rgba(200,169,110,0.12)",
                    fontSize: "11px",
                    color: "#C8A96E",
                    fontWeight: 700,
                  }}
                >
                  {badge.icon}
                </span>
                {badge.label}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
