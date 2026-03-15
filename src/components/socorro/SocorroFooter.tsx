import { Link } from "react-router-dom";

export default function SocorroFooter() {
  return (
    <footer style={{ background: "#0D1F1A" }} className="py-14 sm:py-18 relative">
      {/* Gold gradient separator */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.25), transparent)",
        }}
      />

      <div className="max-w-[1100px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
          {/* Brand */}
          <div>
            <span
              style={{
                fontFamily: "'Clash Display', system-ui, sans-serif",
                fontSize: "22px",
                fontWeight: 700,
                color: "#C8A96E",
              }}
            >
              Everence Wealth
            </span>
            <p
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "13px",
                color: "rgba(240, 242, 241, 0.35)",
                marginTop: "10px",
                maxWidth: "260px",
                lineHeight: 1.7,
              }}
            >
              Helping Socorro ISD employees take control of their retirement. Licensed and insured.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                color: "rgba(200,169,110,0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: "14px",
              }}
            >
              Quick Links
            </p>
            <div className="flex flex-col gap-3">
              {[
                { to: "/socorro-isd", label: "Home" },
                { to: "/socorro-isd/advisors", label: "Advisors" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "rgba(240, 242, 241, 0.5)",
                    textDecoration: "none",
                  }}
                  className="hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                color: "rgba(200,169,110,0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: "14px",
              }}
            >
              Get Started
            </p>
            <p
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "13px",
                color: "rgba(240,242,241,0.5)",
                lineHeight: 1.7,
              }}
            >
              Book your free 15-minute discovery call and find out what your current plan is really costing you.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-6" style={{ borderTop: "1px solid rgba(200, 169, 110, 0.06)" }}>
          <p
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "11px",
              color: "rgba(240, 242, 241, 0.2)",
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            &copy; {new Date().getFullYear()} Everence Wealth. All rights reserved. This is not a solicitation to buy or sell any financial product. Consult a licensed professional before making financial decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
