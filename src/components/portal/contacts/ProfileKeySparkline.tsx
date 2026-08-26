import { useContactProfileKeyTrend } from "@/hooks/useProfileKeyTrend";
import { scoreColorHsl } from "@/lib/profileKey";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface Props {
  contactId: string;
  currentScore: number;
  days?: number;
}

/**
 * Tiny score-history sparkline plus movement copy, rendered inside the
 * Profile Key card.
 */
export default function ProfileKeySparkline({ contactId, currentScore, days = 30 }: Props) {
  const { points, delta, loading } = useContactProfileKeyTrend(contactId, days);

  if (loading) {
    return <div className="h-9 rounded-lg bg-gray-100 animate-pulse" />;
  }

  if (points.length < 2) {
    return (
      <p className="text-[11px] text-gray-400">
        Not enough history yet — score changes are tracked from now on.
      </p>
    );
  }

  const series = points.map((p) => p.score);
  const W = 120;
  const H = 28;
  const stepX = series.length > 1 ? W / (series.length - 1) : W;
  const d = series
    .map((s, i) => `${i === 0 ? "M" : "L"} ${(i * stepX).toFixed(1)} ${(H - (s / 8) * H).toFixed(1)}`)
    .join(" ");

  const rising = delta > 0;
  const flat = delta === 0;
  const color = scoreColorHsl(currentScore);

  return (
    <div className="flex items-center gap-3">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0 overflow-visible" aria-hidden>
        <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <circle
          cx={(series.length - 1) * stepX}
          cy={H - (series[series.length - 1] / 8) * H}
          r={2.5}
          fill={color}
        />
      </svg>
      <p className="text-[11px] font-semibold text-gray-600 flex items-center gap-1">
        {flat ? (
          <>Flat over the last {days} days</>
        ) : (
          <>
            {rising ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-sky-600" />
            )}
            {rising ? "Up" : "Down"} {Math.abs(delta)} in the last {days} days
          </>
        )}
      </p>
    </div>
  );
}
