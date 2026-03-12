import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import AvailabilityPicker from "@/components/socorro/AvailabilityPicker";
import { useSocorroAdvisor } from "@/hooks/useSocorroAdvisors";
import { useSocorroAvailability } from "@/hooks/useSocorroAvailability";
import type { SocorroAvailabilitySlot } from "@/types/socorro";
import { Skeleton } from "@/components/ui/skeleton";

export default function SocorroAdvisorDetail() {
  const { advisorId } = useParams<{ advisorId: string }>();
  const navigate = useNavigate();
  const { data: advisor, isLoading: advLoading } = useSocorroAdvisor(advisorId);
  const { data: slots = [], isLoading: slotsLoading } = useSocorroAvailability(advisorId);
  const [selectedSlot, setSelectedSlot] = useState<SocorroAvailabilitySlot | null>(null);

  const handleContinue = () => {
    if (!selectedSlot || !advisor) return;
    const params = new URLSearchParams({
      advisor_id: advisor.id,
      advisor_name: `${advisor.first_name} ${advisor.last_name}`,
      slot_id: selectedSlot.id,
      date: selectedSlot.event_date,
      time: selectedSlot.time_slot,
    });
    navigate(`/socorro-isd/booking/confirm?${params.toString()}`);
  };

  return (
    <main style={{ background: "#F7F9F8", minHeight: "100vh" }}>
      {/* Header */}
      <section className="py-12 px-4 sm:px-6" style={{ background: "#0D1F1A" }}>
        <div className="max-w-[800px] mx-auto">
          <Link
            to="/socorro-isd/advisors"
            className="inline-flex items-center gap-2 mb-6"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              color: "rgba(240,242,241,0.6)",
              textDecoration: "none",
            }}
          >
            ← All Advisors
          </Link>
          {advLoading ? (
            <div className="flex items-center gap-6">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
              </div>
            </div>
          ) : advisor ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-6"
            >
              {advisor.headshot_url ? (
                <img
                  src={advisor.headshot_url}
                  alt={`${advisor.first_name} ${advisor.last_name}`}
                  className="w-20 h-20 rounded-full object-cover"
                  style={{ border: "2px solid #C8A96E" }}
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(200,169,110,0.15)" }}
                >
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "#C8A96E",
                    }}
                  >
                    {advisor.first_name[0]}
                    {advisor.last_name[0]}
                  </span>
                </div>
              )}
              <div>
                <h1
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "clamp(28px, 4vw, 40px)",
                    fontWeight: 700,
                    color: "#F0F2F1",
                    lineHeight: 1.1,
                  }}
                >
                  {advisor.first_name} {advisor.last_name}
                </h1>
                {advisor.bio && (
                  <p
                    className="mt-1"
                    style={{
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      fontSize: "15px",
                      color: "rgba(240,242,241,0.6)",
                      maxWidth: "400px",
                    }}
                  >
                    {advisor.bio}
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <p style={{ color: "#F0F2F1" }}>Advisor not found.</p>
          )}
        </div>
      </section>

      {/* Availability picker */}
      <section className="py-10 px-4 sm:px-6">
        <div className="max-w-[800px] mx-auto">
          <h2
            className="mb-6"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "24px",
              fontWeight: 700,
              color: "#1A4D3E",
            }}
          >
            Select a Date &amp; Time
          </h2>
          <div
            className="p-6"
            style={{ background: "#ffffff", borderRadius: "4px", border: "1px solid #E5E7EB" }}
          >
            <AvailabilityPicker
              slots={slots}
              isLoading={slotsLoading}
              onSelect={setSelectedSlot}
              selectedSlotId={selectedSlot?.id ?? null}
            />
          </div>

          {/* Continue button */}
          {selectedSlot && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <button
                onClick={handleContinue}
                className="transition-colors duration-200"
                style={{
                  background: "#C8A96E",
                  color: "#1A4D3E",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "15px",
                  fontWeight: 700,
                  padding: "14px 40px",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#b8996a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#C8A96E";
                }}
              >
                Continue to Registration →
              </button>
              <p
                className="mt-3"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "13px",
                  color: "#9CA3AF",
                }}
              >
                Selected: {selectedSlot.event_date} at {selectedSlot.time_slot}
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}
