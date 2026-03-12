import { useState } from "react";
import { motion } from "framer-motion";
import type { SocorroAvailabilitySlot } from "@/types/socorro";
import { Skeleton } from "@/components/ui/skeleton";

const WORKSHOP_DATES = [
  { date: "2026-03-24", label: "Mon Mar 24" },
  { date: "2026-03-25", label: "Tue Mar 25" },
  { date: "2026-03-26", label: "Wed Mar 26" },
  { date: "2026-03-27", label: "Thu Mar 27" },
  { date: "2026-03-28", label: "Fri Mar 28" },
];

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
  const [activeDate, setActiveDate] = useState(WORKSHOP_DATES[0].date);

  const slotsForDate = slots.filter((s) => s.event_date === activeDate);
  const availableDates = new Set(slots.map((s) => s.event_date));

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14" />
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
      {/* Date pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {WORKSHOP_DATES.map((d) => {
          const hasSlots = availableDates.has(d.date);
          const isActive = activeDate === d.date;
          return (
            <button
              key={d.date}
              onClick={() => hasSlots && setActiveDate(d.date)}
              disabled={!hasSlots}
              className="transition-colors duration-200"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                padding: "10px 18px",
                borderRadius: "4px",
                border: "none",
                cursor: hasSlots ? "pointer" : "default",
                background: isActive
                  ? "#1A4D3E"
                  : hasSlots
                    ? "#E8ECE9"
                    : "#F3F4F6",
                color: isActive
                  ? "#F0F2F1"
                  : hasSlots
                    ? "#1A4D3E"
                    : "#9CA3AF",
                opacity: hasSlots ? 1 : 0.5,
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
                className="transition-colors duration-200"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  padding: "14px 8px",
                  borderRadius: "4px",
                  border: isSelected
                    ? "2px solid #C8A96E"
                    : "1px solid #E5E7EB",
                  cursor: isAvailable ? "pointer" : "default",
                  background: isSelected
                    ? "rgba(200,169,110,0.08)"
                    : isAvailable
                      ? "#ffffff"
                      : "#F3F4F6",
                  color: isSelected
                    ? "#C8A96E"
                    : isAvailable
                      ? "#1A4D3E"
                      : "#9CA3AF",
                  textDecoration: isAvailable ? "none" : "line-through",
                }}
              >
                {slot.time_slot}
                {!isAvailable && (
                  <span className="block text-xs font-normal mt-1" style={{ color: "#9CA3AF", textDecoration: "none" }}>
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
