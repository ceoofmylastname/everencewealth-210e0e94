import { motion } from "framer-motion";
import SocorroNavbar from "@/components/socorro/SocorroNavbar";
import SocorroFooter from "@/components/socorro/SocorroFooter";
import FloatingOrbs from "@/components/socorro/primitives/FloatingOrbs";
import ShimmerHeadline from "@/components/socorro/primitives/ShimmerHeadline";
import AdvisorGrid from "@/components/socorro/AdvisorGrid";
import { useSocorroAdvisors } from "@/hooks/useSocorroAdvisors";

export default function SocorroAdvisors() {
  const { data: advisors = [], isLoading } = useSocorroAdvisors();

  return (
    <main style={{ background: "#F7F9F8", minHeight: "100vh" }}>
      <SocorroNavbar />

      {/* Header */}
      <section
        className="relative pt-28 pb-16 px-6 overflow-hidden"
        style={{ background: "#0D1F1A" }}
      >
        <FloatingOrbs variant="dark" />
        <div className="relative z-10 max-w-[1000px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ShimmerHeadline
              as="h1"
              variant="light"
              className="text-[clamp(32px,5vw,52px)] leading-[1.1] mb-3"
            >
              Choose Your Advisor
            </ShimmerHeadline>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "16px",
              color: "rgba(240,242,241,0.65)",
              maxWidth: "520px",
            }}
          >
            Select an advisor to view their availability during the Socorro ISD
            workshop week (March 24–28).
          </motion.p>
        </div>
      </section>

      {/* Grid */}
      <section className="relative py-14 px-6 overflow-hidden">
        <FloatingOrbs variant="light" />
        <div className="relative z-10 max-w-[1000px] mx-auto">
          <AdvisorGrid advisors={advisors} isLoading={isLoading} />
        </div>
      </section>

      <SocorroFooter />
    </main>
  );
}
