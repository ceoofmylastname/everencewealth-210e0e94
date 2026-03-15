import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import GoldCTA from "./primitives/GoldCTA";

export default function SocorroNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? window.scrollY / docHeight : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(13, 31, 26, 0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(200, 169, 110, 0.1)" : "1px solid transparent",
      }}
    >
      {/* Gold scroll progress bar */}
      <div
        className="absolute top-0 left-0 h-[2px] origin-left transition-transform duration-150"
        style={{
          width: "100%",
          transform: `scaleX(${scrollProgress})`,
          background: "linear-gradient(90deg, #C8A96E, #E2C896)",
          opacity: scrollProgress > 0.01 ? 1 : 0,
        }}
      />

      <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/socorro-isd" className="flex items-center gap-3 no-underline" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontFamily: "'Clash Display', system-ui, sans-serif",
              fontSize: "20px",
              fontWeight: 700,
              color: "#C8A96E",
              letterSpacing: "0.02em",
            }}
          >
            Everence Wealth
          </span>
          <span
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: "10px",
              fontWeight: 500,
              color: "rgba(240, 242, 241, 0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              padding: "3px 8px",
              border: "1px solid rgba(240,242,241,0.1)",
              borderRadius: "4px",
            }}
          >
            Socorro ISD
          </span>
        </Link>

        <div className="socorro-glow-cta rounded-full" style={{ animationDuration: "4s" }}>
          <GoldCTA href="/socorro-isd/advisors" size="sm">
            Book Your Call
          </GoldCTA>
        </div>
      </div>
    </nav>
  );
}
