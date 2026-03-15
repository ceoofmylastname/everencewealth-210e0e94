import { Link } from "react-router-dom";

export default function SocorroFooter() {
  return (
    <footer
      style={{
        background: "#0D1F1A",
        borderTop: "1px solid rgba(200, 169, 110, 0.12)",
      }}
      className="py-12 sm:py-16"
    >
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8">
          {/* Brand */}
          <div>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
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
                color: "rgba(240, 242, 241, 0.4)",
                marginTop: "8px",
                maxWidth: "280px",
                lineHeight: 1.6,
              }}
            >
              Helping Socorro ISD employees take control of their retirement. Licensed and insured.
            </p>
          </div>

          {/* Quick links */}
          <div className="flex gap-8">
            <Link
              to="/socorro-isd"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "rgba(240, 242, 241, 0.6)",
                textDecoration: "none",
              }}
              className="hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              to="/socorro-isd/advisors"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "rgba(240, 242, 241, 0.6)",
                textDecoration: "none",
              }}
              className="hover:text-white transition-colors"
            >
              Advisors
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div
          className="mt-10 pt-6"
          style={{ borderTop: "1px solid rgba(200, 169, 110, 0.08)" }}
        >
          <p
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "11px",
              color: "rgba(240, 242, 241, 0.25)",
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
