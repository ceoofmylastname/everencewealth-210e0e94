import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Flame, Eye, Snowflake } from "lucide-react";
import { useContactProfileKey } from "@/hooks/useContactProfileKey";
import {
  PROFILE_KEY_TRAITS,
  STATUS_OPTIONS,
  scoreColorHsl,
  scoreBucketLabel,
} from "@/lib/profileKey";

interface Props {
  contactId: string;
  advisorId: string;
  readOnly?: boolean;
}

function bucketIcon(score: number) {
  if (score >= 7) return <Flame className="w-4 h-4" />;
  if (score >= 4) return <Eye className="w-4 h-4" />;
  if (score >= 1) return <Sparkles className="w-4 h-4" />;
  return <Snowflake className="w-4 h-4" />;
}

export default function ProfileKeyCard({ contactId, advisorId, readOnly = false }: Props) {
  const { row, loading, toggleTrait, setStatus } = useContactProfileKey(contactId, advisorId);

  if (loading || !row) {
    return (
      <div className="rounded-2xl border bg-white p-5 animate-pulse h-44" />
    );
  }

  const score = row.score;
  const color = scoreColorHsl(score);
  const glow = scoreColorHsl(score, 0.35);
  const soft = scoreColorHsl(score, 0.08);

  return (
    <div
      className="relative rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md p-5 md:p-6 overflow-hidden shadow-sm"
      style={{
        boxShadow: `0 10px 40px -20px ${glow}, 0 0 0 1px ${scoreColorHsl(score, 0.18)}`,
      }}
    >
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-40 transition-colors duration-500"
        style={{ background: color }}
      />

      {/* header */}
      <div className="relative flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase text-gray-500">
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-md"
              style={{ background: soft, color }}
            >
              {bucketIcon(score)}
            </span>
            Profile Key
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <motion.div
              key={score}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="font-bold leading-none"
              style={{ color, fontSize: "2.25rem" }}
            >
              {score}
            </motion.div>
            <div className="text-sm text-gray-500 font-medium">/ 8</div>
            <span
              className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: soft, color }}
            >
              {scoreBucketLabel(score)}
            </span>
          </div>
        </div>

        {/* Status segmented control */}
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">Status</span>
          <div className="inline-flex rounded-xl border bg-white p-0.5 shadow-sm">
            {STATUS_OPTIONS.map((s) => {
              const active = row.status_code === s.code;
              return (
                <button
                  key={s.code}
                  type="button"
                  disabled={readOnly}
                  onClick={() => setStatus(s.code)}
                  title={s.label}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    active
                      ? "text-white shadow"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                  style={active ? { background: "#1A4D3E" } : undefined}
                >
                  {s.letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Heat meter */}
      <div className="relative mb-5">
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <motion.div
            initial={false}
            animate={{ width: `${(score / 8) * 100}%` }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
            className="h-full rounded-full"
            style={{ background: "var(--profile-key-gradient)" }}
          />
        </div>
        <div className="mt-1.5 flex justify-between">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className="block w-1 h-1 rounded-full"
              style={{
                background: i <= score ? scoreColorHsl(i) : "hsl(220 13% 91%)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Trait chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <AnimatePresence initial={false}>
          {PROFILE_KEY_TRAITS.map((t) => {
            const active = row[t.key] as boolean;
            return (
              <motion.button
                key={t.key}
                type="button"
                disabled={readOnly}
                onClick={() => toggleTrait(t.key)}
                whileTap={{ scale: readOnly ? 1 : 0.95 }}
                className={`relative group rounded-xl border px-3 py-2.5 text-left transition disabled:cursor-not-allowed ${
                  active
                    ? "border-transparent text-white shadow-md"
                    : "border-gray-200 bg-white/80 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
                style={
                  active
                    ? {
                        background: `linear-gradient(135deg, ${scoreColorHsl(Math.max(1, score))}, ${scoreColorHsl(Math.min(8, score + 1), 0.85)})`,
                        boxShadow: `0 6px 20px -8px ${scoreColorHsl(Math.max(1, score), 0.6)}`,
                      }
                    : undefined
                }
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                      active ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {t.num}
                  </span>
                  <span className="text-sm font-semibold truncate">{t.label}</span>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {readOnly && (
        <p className="mt-3 text-xs text-gray-500 italic">Read-only · only the owning advisor can rate this contact.</p>
      )}
    </div>
  );
}