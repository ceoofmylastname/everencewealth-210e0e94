import { useSearchParams, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import SocorroNavbar from "@/components/socorro/SocorroNavbar";
import SocorroFooter from "@/components/socorro/SocorroFooter";
import FloatingOrbs from "@/components/socorro/primitives/FloatingOrbs";
import ShimmerHeadline from "@/components/socorro/primitives/ShimmerHeadline";
import GlassCard from "@/components/socorro/primitives/GlassCard";
import BookingSummaryBar from "@/components/socorro/BookingSummaryBar";
import RegistrationForm from "@/components/socorro/RegistrationForm";
import type { SocorroBookingState } from "@/types/socorro";

export default function SocorroBookingConfirm() {
  const [searchParams] = useSearchParams();

  const advisorId = searchParams.get("advisor_id");
  const advisorName = searchParams.get("advisor_name");
  const slotId = searchParams.get("slot_id");
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  if (!advisorId || !advisorName || !slotId || !date || !time) {
    return <Navigate to="/socorro-isd/advisors" replace />;
  }

  const booking: SocorroBookingState = {
    advisor_id: advisorId,
    advisor_name: advisorName,
    slot_id: slotId,
    date,
    time,
  };

  return (
    <main style={{ background: "#F7F9F8", minHeight: "100vh" }}>
      <SocorroNavbar />
      <BookingSummaryBar advisorName={advisorName} date={date} time={time} />

      <section className="relative py-14 px-6 overflow-hidden">
        <FloatingOrbs variant="light" />
        <div className="relative z-10 max-w-[520px] mx-auto">
          <Link
            to={`/socorro-isd/advisors/${advisorId}`}
            className="inline-flex items-center gap-2 mb-6"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              color: "#4A5565",
              textDecoration: "none",
              borderRadius: "9999px",
              padding: "6px 14px",
              background: "rgba(26,77,62,0.06)",
              border: "1px solid rgba(26,77,62,0.08)",
            }}
          >
            &larr; Change Time
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ShimmerHeadline as="h1" className="text-[clamp(28px,4vw,36px)] mb-2">
              Complete Your Registration
            </ShimmerHeadline>
            <p
              className="mb-8"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "15px",
                color: "#4A5565",
              }}
            >
              Fill in your details below to confirm your session with{" "}
              <strong style={{ color: "#1A4D3E" }}>{advisorName}</strong>.
            </p>

            <GlassCard variant="light" className="p-6 sm:p-8">
              <RegistrationForm booking={booking} />
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <SocorroFooter />
    </main>
  );
}
