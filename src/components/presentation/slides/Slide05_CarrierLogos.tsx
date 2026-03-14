import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import RevealElement from "../RevealElement";

const carriers = [
  { name: "Prudential", logo: "https://logo.clearbit.com/prudential.com" },
  { name: "Principal", logo: "https://logo.clearbit.com/principal.com" },
  { name: "Lincoln Financial Group", logo: "https://logo.clearbit.com/lfg.com" },
  { name: "Allianz", logo: "https://logo.clearbit.com/allianz.com" },
  { name: "Global Atlantic", logo: "https://logo.clearbit.com/globalatlantic.com" },
  { name: "American National", logo: "https://logo.clearbit.com/anico.com" },
  { name: "Securian Financial", logo: "https://logo.clearbit.com/securian.com" },
  { name: "John Hancock", logo: "https://logo.clearbit.com/johnhancock.com" },
  { name: "Mutual of Omaha", logo: "https://logo.clearbit.com/mutualofomaha.com" },
  { name: "National Life Group", logo: "https://logo.clearbit.com/nationallife.com" },
  { name: "North American", logo: "https://logo.clearbit.com/northamericancompany.com" },
  { name: "AIG", logo: "https://logo.clearbit.com/aig.com" },
  { name: "Equitable", logo: "https://logo.clearbit.com/equitable.com" },
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
          borderColor: isHovered ? "rgba(200,169,110,0.5)" : "rgba(200,169,110,0.15)",
          boxShadow: isHovered
            ? "0 16px 48px rgba(0,0,0,0.4), 0 0 30px rgba(200,169,110,0.12), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
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
              color: "#E8EFE9",
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
            color: "#6B8F7E",
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
  // Load Google Fonts
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
      {/* Ambient orbs */}
      <div className="antigravity-carrier-orb-gold" />
      <div className="antigravity-carrier-orb-green" />

      <div className="antigravity-slide-inner" style={{ position: "relative", zIndex: 1 }}>
        {/* Reveal 1: Headline */}
        <RevealElement index={1} direction="slam" className="text-center mb-2">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 12,
              color: "var(--ev-gold)",
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
              color: "#FFFFFF",
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
              color: "var(--ev-gold)",
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
              color: "#A0B5AD",
              marginTop: 16,
            }}
          >
            Partnered with 75+ top-rated financial institutions
          </motion.p>
        </RevealElement>

        {/* Reveal 2: Carrier grid */}
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

        {/* Reveal 3: Trust bar */}
        <RevealElement index={3} direction="drop" className="flex justify-center mt-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1, ease: "easeOut" }}
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: 13,
              color: "#6B8F7E",
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
