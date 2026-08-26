import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

interface Props {
  delta: number;
  days?: number;
}

/**
 * Compact rising / flat / falling indicator shown next to a Profile Key score.
 */
export default function ProfileKeyTrendArrow({ delta, days = 30 }: Props) {
  if (!delta) {
    return (
      <span
        className="inline-flex items-center text-gray-300"
        title={`No Profile Key change in the last ${days} days`}
        aria-label="Flat"
      >
        <Minus className="w-3.5 h-3.5" />
      </span>
    );
  }

  const rising = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
        rising ? "text-rose-600" : "text-sky-600"
      }`}
      title={`${rising ? "Up" : "Down"} ${Math.abs(delta)} in the last ${days} days`}
    >
      {rising ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
      {rising ? "+" : "−"}
      {Math.abs(delta)}
    </span>
  );
}
