import ScrollReveal from "./primitives/ScrollReveal";

const logos = [
  { src: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/689d3a3ed232a354331d4113.png", alt: "Carrier partner" },
  { src: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/689d3a39f800975cfcd0615a.png", alt: "Carrier partner" },
  { src: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/689d3a333b01e6752a4e9403.png", alt: "Carrier partner" },
  { src: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/689d3a231f951e53248def17.png", alt: "Carrier partner" },
  { src: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/689d3a1d1284280d48c8192f.png", alt: "Carrier partner" },
  { src: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/689d39ffb8fc447f73a9a123.png", alt: "Carrier partner" },
  { src: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/689d394cd232a392da1d2e03.png", alt: "Carrier partner" },
  { src: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/689d3968f8009725eed052ac.png", alt: "Carrier partner" },
];

export default function TrustStrip() {
  const doubled = [...logos, ...logos];

  return (
    <section className="py-16 overflow-hidden" style={{ background: "#F7F9F8" }}>
      <div className="max-w-[900px] mx-auto px-6">
        <ScrollReveal>
          {/* Title with gold lines on each side */}
          <div className="flex items-center gap-4 justify-center mb-12">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.25))" }} />
            <p
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(26,77,62,0.4)",
              }}
            >
              Trusted Carrier Partners
            </p>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(200,169,110,0.25), transparent)" }} />
          </div>
        </ScrollReveal>
      </div>

      <div
        className="relative"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className="socorro-logo-carousel">
          {doubled.map((logo, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex items-center justify-center px-8 sm:px-12"
              style={{ height: 65 }}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                loading="lazy"
                className="transition-all duration-300 hover:scale-110"
                style={{
                  height: 44,
                  width: "auto",
                  objectFit: "contain",
                  opacity: 0.6,
                  filter: "grayscale(40%)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.filter = "grayscale(0%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.6";
                  e.currentTarget.style.filter = "grayscale(40%)";
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
