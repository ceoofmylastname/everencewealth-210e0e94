import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import GoldCTA from "./primitives/GoldCTA";

export default function SocorroNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(13, 31, 26, 0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(200, 169, 110, 0.12)"
          : "1px solid transparent",
      }}
    >
      <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo / Brand */}
        <Link
          to="/socorro-isd"
          className="flex items-center gap-2 no-underline"
          style={{ textDecoration: "none" }}
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
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
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              color: "rgba(240, 242, 241, 0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            Socorro ISD
          </span>
        </Link>

        {/* CTA */}
        <GoldCTA href="/socorro-isd/advisors" size="sm">
          Book Your Call
        </GoldCTA>
      </div>
    </nav>
  );
}
