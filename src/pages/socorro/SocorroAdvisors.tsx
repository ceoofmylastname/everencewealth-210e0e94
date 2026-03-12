import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AdvisorGrid from "@/components/socorro/AdvisorGrid";
import { useSocorroAdvisors } from "@/hooks/useSocorroAdvisors";

export default function SocorroAdvisors() {
  const { data: advisors = [], isLoading } = useSocorroAdvisors();

  return (
    <main style={{ background: "#F7F9F8", minHeight: "100vh" }}>
      {/* Header */}
      <section className="py-16 px-4 sm:px-6" style={{ background: "#0D1F1A" }}>
        <div className="max-w-[1000px] mx-auto">
          <Link
            to="/socorro-isd"
            className="inline-flex items-center gap-2 mb-8"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              color: "rgba(240,242,241,0.6)",
              textDecoration: "none",
            }}
          >
            ← Back to Overview
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 700,
              color: "#F0F2F1",
              lineHeight: 1.1,
              marginBottom: "12px",
            }}
          >
            Choose Your <span style={{ color: "#C8A96E" }}>Advisor</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "16px",
              color: "rgba(240,242,241,0.7)",
              maxWidth: "520px",
            }}
          >
            Select an advisor to view their availability during the Socorro ISD
            workshop week (March 24–28).
          </motion.p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-[1000px] mx-auto">
          <AdvisorGrid advisors={advisors} isLoading={isLoading} />
        </div>
      </section>
    </main>
  );
}
