import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import type { SocorroAvailabilitySlot } from "@/types/socorro";

interface AvailabilityPickerProps {
  slots: SocorroAvailabilitySlot[];
  isLoading: boolean;
  onSelect: (slot: SocorroAvailabilitySlot) => void;
  selectedSlotId: string | null;
}

export default function AvailabilityPicker({
  slots,
  isLoading,
  onSelect,
  selectedSlotId,
}: AvailabilityPickerProps) {
  // Derive unique dates from slots dynamically
  const availableDates = useMemo(() => {
    const dateSet = new Set(slots.map((s) => s.event_date));
    return Array.from(dateSet).sort().map((date) => {
      const d = new Date(date + "T12:00:00");
      return {
        date,
        label: isNaN(d.getTime()) ? date : format(d, "EEE MMM d"),
      };
    });
  }, [slots]);

  const [activeDate, setActiveDate] = useState<string | null>(null);

  // Auto-select first date if not set
  const effectiveDate = activeDate && availableDates.some((d) => d.date === activeDate)
    ? activeDate
    : availableDates[0]?.date ?? null;

  const slotsForDate = effectiveDate ? slots.filter((s) => s.event_date === effectiveDate) : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 w-28 rounded-full animate-pulse"
              style={{ background: "rgba(200,169,110,0.1)" }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 rounded-socorro-card animate-pulse"
              style={{ background: "rgba(26,77,62,0.05)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="py-10 text-center">
        <p
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "16px",
            color: "#4A5565",
          }}
        >
          No availability posted yet. Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Date pills — dynamically derived from slots */}
      <div className="flex flex-wrap gap-2 mb-8">
        {availableDates.map((d) => {
          const isActive = effectiveDate === d.date;
          return (
            <button
              key={d.date}
              onClick={() => setActiveDate(d.date)}
              className="transition-all duration-200"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                padding: "10px 20px",
                borderRadius: "9999px",
                border: isActive
                  ? "2px solid #C8A96E"
                  : "1px solid rgba(200,169,110,0.15)",
                cursor: "pointer",
                background: isActive
                  ? "rgba(200,169,110,0.1)"
                  : "rgba(255,255,255,0.65)",
                backdropFilter: "blur(8px)",
                color: isActive ? "#C8A96E" : "#1A4D3E",
              }}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {slotsForDate.length === 0 ? (
        <p
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "14px",
            color: "#9CA3AF",
          }}
        >
          No time slots for this date.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {slotsForDate.map((slot) => {
            const isSelected = selectedSlotId === slot.id;
            const isAvailable = !slot.is_booked;
            return (
              <motion.button
                key={slot.id}
                whileTap={isAvailable ? { scale: 0.97 } : {}}
                onClick={() => isAvailable && onSelect(slot)}
                disabled={!isAvailable}
                className="transition-all duration-200"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  padding: "14px 8px",
                  borderRadius: "var(--socorro-radius-card)",
                  border: isSelected
                    ? "2px solid #C8A96E"
                    : "1px solid rgba(200,169,110,0.12)",
                  cursor: isAvailable ? "pointer" : "default",
                  background: isSelected
                    ? "rgba(200,169,110,0.1)"
                    : isAvailable
                      ? "rgba(255,255,255,0.65)"
                      : "rgba(200,200,200,0.08)",
                  backdropFilter: isAvailable ? "blur(8px)" : "none",
                  color: isSelected
                    ? "#C8A96E"
                    : isAvailable
                      ? "#1A4D3E"
                      : "#9CA3AF",
                  textDecoration: isAvailable ? "none" : "line-through",
                  boxShadow: isSelected
                    ? "0 0 20px rgba(200,169,110,0.15)"
                    : "none",
                }}
              >
                {slot.time_slot}
                {!isAvailable && (
                  <span
                    className="block text-xs font-normal mt-1"
                    style={{ color: "#9CA3AF", textDecoration: "none" }}
                  >
                    Booked
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
