import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SocorroNavbar from "@/components/socorro/SocorroNavbar";
import SocorroFooter from "@/components/socorro/SocorroFooter";
import FloatingOrbs from "@/components/socorro/primitives/FloatingOrbs";
import ShimmerHeadline from "@/components/socorro/primitives/ShimmerHeadline";
import GlassCard from "@/components/socorro/primitives/GlassCard";
import GoldCTA from "@/components/socorro/primitives/GoldCTA";
import AvailabilityPicker from "@/components/socorro/AvailabilityPicker";
import { useSocorroAdvisor } from "@/hooks/useSocorroAdvisors";
import { useSocorroAvailability } from "@/hooks/useSocorroAvailability";
import type { SocorroAvailabilitySlot } from "@/types/socorro";

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
      <SocorroNavbar />

      {/* Advisor Header */}
      <section
        className="relative pt-28 pb-14 px-6 overflow-hidden"
        style={{ background: "#0D1F1A" }}
      >
        <FloatingOrbs variant="dark" />
        <div className="relative z-10 max-w-[800px] mx-auto">
          {advLoading ? (
            <div className="flex items-center gap-6">
              <div
                className="w-20 h-20 rounded-full animate-pulse"
                style={{ background: "rgba(200,169,110,0.15)" }}
              />
              <div className="space-y-2">
                <div className="h-8 w-48 rounded-full animate-pulse" style={{ background: "rgba(200,169,110,0.1)" }} />
                <div className="h-4 w-72 rounded-full animate-pulse" style={{ background: "rgba(200,169,110,0.06)" }} />
              </div>
            </div>
          ) : advisor ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard className="p-6 flex items-center gap-6">
                {advisor.headshot_url ? (
                  <img
                    src={advisor.headshot_url}
                    alt={`${advisor.first_name} ${advisor.last_name}`}
                    className="w-20 h-20 object-cover flex-shrink-0"
                    style={{
                      borderRadius: "var(--socorro-radius-card)",
                      border: "2px solid rgba(200,169,110,0.3)",
                    }}
                  />
                ) : (
                  <div
                    className="w-20 h-20 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderRadius: "var(--socorro-radius-card)",
                      background: "rgba(200,169,110,0.12)",
                    }}
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
                  <ShimmerHeadline
                    as="h1"
                    variant="light"
                    className="text-[clamp(28px,4vw,40px)] leading-[1.1]"
                  >
                    {advisor.first_name} {advisor.last_name}
                  </ShimmerHeadline>
                  {advisor.bio && (
                    <p
                      className="mt-2"
                      style={{
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                        fontSize: "15px",
                        color: "rgba(240,242,241,0.55)",
                        maxWidth: "400px",
                      }}
                    >
                      {advisor.bio}
                    </p>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <p style={{ color: "#F0F2F1" }}>Advisor not found.</p>
          )}
        </div>
      </section>

      {/* Availability picker */}
      <section className="relative py-12 px-6 overflow-hidden">
        <FloatingOrbs variant="light" />
        <div className="relative z-10 max-w-[800px] mx-auto">
          <ShimmerHeadline as="h2" className="text-[24px] mb-6">
            Select a Date &amp; Time
          </ShimmerHeadline>

          <GlassCard variant="light" className="p-6 sm:p-8">
            <AvailabilityPicker
              slots={slots}
              isLoading={slotsLoading}
              onSelect={setSelectedSlot}
              selectedSlotId={selectedSlot?.id ?? null}
            />
          </GlassCard>

          {/* Continue button */}
          {selectedSlot && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <GoldCTA onClick={handleContinue} size="lg">
                Continue to Registration &rarr;
              </GoldCTA>
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

      <SocorroFooter />
    </main>
  );
}
