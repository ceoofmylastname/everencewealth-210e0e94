import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function SocorroFinalCTA() {
  return (
    <section
      className="py-20 px-4 sm:px-6"
      style={{ background: "#0D1F1A" }}
    >
      <div className="max-w-[700px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 700,
              color: "#F0F2F1",
              lineHeight: 1.2,
              marginBottom: "16px",
            }}
          >
            Take the First Step Toward
            <br />
            <span style={{ color: "#C8A96E" }}>Financial Clarity</span>
          </h2>
          <p
            className="mb-10"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "16px",
              color: "rgba(240,242,241,0.7)",
              lineHeight: 1.6,
              maxWidth: "520px",
              margin: "0 auto 40px",
            }}
          >
            Book a free, no-obligation session with one of our advisors
            during the Socorro ISD workshop week. Spots are limited.
          </p>
          <Link
            to="/socorro-isd/advisors"
            className="inline-block transition-colors duration-200"
            style={{
              background: "#C8A96E",
              color: "#0D1F1A",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: "15px",
              padding: "16px 40px",
              borderRadius: "4px",
              textDecoration: "none",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#b8996a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#C8A96E";
            }}
          >
            Choose Your Advisor →
          </Link>
          <p
            className="mt-6"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "13px",
              color: "rgba(240,242,241,0.4)",
            }}
          >
            100% free · No sales pressure · Confidential
          </p>
        </motion.div>
      </div>
    </section>
  );
}
