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
    <section className="py-14 overflow-hidden" style={{ background: "#F7F9F8" }}>
      <div className="max-w-[900px] mx-auto px-6">
        <ScrollReveal>
          <p
            className="text-center mb-10"
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
        </ScrollReveal>
      </div>

      {/* Carousel with edge fade */}
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
              className="flex-shrink-0 flex items-center justify-center px-8 sm:px-10"
              style={{ height: 60 }}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                loading="lazy"
                style={{
                  height: 40,
                  width: "auto",
                  objectFit: "contain",
                  opacity: 0.7,
                  filter: "grayscale(30%)",
                  transition: "opacity 0.3s, filter 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.filter = "grayscale(0%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.7";
                  e.currentTarget.style.filter = "grayscale(30%)";
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
