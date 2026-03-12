import { useSearchParams, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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

  // Redirect if missing params
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
      <BookingSummaryBar advisorName={advisorName} date={date} time={time} />

      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-[520px] mx-auto">
          <Link
            to={`/socorro-isd/advisors/${advisorId}`}
            className="inline-flex items-center gap-2 mb-6"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              color: "#4A5565",
              textDecoration: "none",
            }}
          >
            ← Change Time
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1
              className="mb-2"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(28px, 4vw, 36px)",
                fontWeight: 700,
                color: "#1A4D3E",
              }}
            >
              Complete Your Registration
            </h1>
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

            <div
              className="p-6 sm:p-8"
              style={{
                background: "#ffffff",
                borderRadius: "4px",
                border: "1px solid #E5E7EB",
              }}
            >
              <RegistrationForm booking={booking} />
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
