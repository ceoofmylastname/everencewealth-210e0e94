import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import RevealElement from "../RevealElement";

const carriers = [
  { name: "Prudential", logo: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/691d516d7e9b293d0b7d9e26.png" },
  { name: "Principal", logo: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/691d516d7e9b292aa47d9e25.png" },
  { name: "Lincoln Financial Group", logo: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/691d516dce99892f5f7679f6.png" },
  { name: "Allianz", logo: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/691d516d6d309e2866328d5e.png" },
  { name: "Global Atlantic", logo: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/691d516d6d309e8871328d5d.png" },
  { name: "American National", logo: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/691d516dce998948627679f5.png" },
  { name: "Securian Financial", logo: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/691d516dce998922617679f4.png" },
  { name: "John Hancock", logo: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/691d516dcdf2313ec7bd0e4e.png" },
  { name: "Mutual of Omaha", logo: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/691d516dcdf23108afbd0e4f.png" },
  { name: "National Life Group", logo: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/691d516d7e9b299af97d9e27.png" },
  { name: "North American", logo: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/691d516d4b75355b4548aad2.png" },
  { name: "Equitable", logo: "https://assets.cdn.filesafe.space/9m2UBN29nuaCWceOgW2Z/media/69b5d32aad0276db2ddac132.png" },
];

function CarrierCard({ carrier, index }: { carrier: typeof carriers[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const tiltX = ((e.clientX - centerX) / (rect.width / 2)) * 10;
    const tiltY = ((e.clientY - centerY) / (rect.height / 2)) * -10;
    setTilt({ rotateX: tiltY, rotateY: tiltX });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: "easeOut" }}
    >
      <div
        ref={cardRef}
        onMouseMove={(e) => { handleMouseMove(e); setIsHovered(true); }}
        onMouseLeave={handleMouseLeave}
        className="antigravity-carrier-card"
        style={{
          transform: `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(${isHovered ? -6 : 0}px)`,
          transition: "all 0.35s cubic-bezier(0.23, 1, 0.32, 1)",
          transformStyle: "preserve-3d",
          borderColor: isHovered ? "rgba(200,169,110,0.4)" : "rgba(26,77,62,0.12)",
          boxShadow: isHovered
            ? "0 12px 32px rgba(0,0,0,0.1), 0 0 20px rgba(200,169,110,0.08), inset 0 1px 0 rgba(255,255,255,0.9)"
            : "0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        {!logoError ? (
          <img
            src={carrier.logo}
            alt={carrier.name}
            onError={() => setLogoError(true)}
            style={{
              maxWidth: 140,
              maxHeight: 48,
              objectFit: "contain",
              filter: isHovered ? "brightness(1.1)" : "brightness(1)",
              transition: "filter 0.3s ease",
            }}
          />
        ) : (
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 14,
              color: "#1A4D3E",
              textAlign: "center",
            }}
          >
            {carrier.name}
          </span>
        )}
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: 12,
            color: "rgba(26, 77, 62, 0.6)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          {carrier.name}
        </span>
      </div>
    </motion.div>
  );
}

export default function Slide05_CarrierLogos() {
  useEffect(() => {
    const id = "carrier-google-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400;1,600&family=DM+Sans:wght@400;500;600;800&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="antigravity-slide antigravity-carrier-bg">
      <div className="antigravity-slide-inner" style={{ position: "relative", zIndex: 1 }}>
        {/* Headline */}
        <RevealElement index={1} direction="slam" className="text-center mb-2">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 12,
              color: "#C8A96E",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            TRUSTED CARRIER NETWORK
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 800,
              fontSize: "clamp(36px, 4vw, 52px)",
              color: "#1A4D3E",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Committed to
          </motion.h2>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: "easeOut" }}
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(40px, 4.5vw, 56px)",
              color: "#C8A96E",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Bridging the Gap
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36, ease: "easeOut" }}
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: 16,
              color: "#6B7B74",
              marginTop: 16,
            }}
          >
            Partnered with 75+ top-rated financial institutions
          </motion.p>
        </RevealElement>

        {/* Carrier grid */}
        <RevealElement index={2} direction="scale" className="mt-8">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 20,
              maxWidth: 1100,
              margin: "0 auto",
              padding: "0 24px",
            }}
            className="carrier-grid-responsive"
          >
            {carriers.map((carrier, i) => (
              <CarrierCard key={carrier.name} carrier={carrier} index={i} />
            ))}
          </div>
        </RevealElement>

        {/* Trust bar */}
        <RevealElement index={3} direction="drop" className="flex justify-center mt-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1, ease: "easeOut" }}
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: 13,
              color: "#6B7B74",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            75+ Carriers &nbsp;·&nbsp; Independent Broker &nbsp;·&nbsp; San Francisco, CA
          </motion.p>
        </RevealElement>
      </div>
    </div>
  );
}
