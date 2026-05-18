import { scoreColorHsl, scoreBucketLabel } from "@/lib/profileKey";

interface Props {
  score: number;
  status?: "response" | "associate" | "client" | null;
  size?: "sm" | "md";
  showLabel?: boolean;
}

const STATUS_LETTER = { response: "R", associate: "A", client: "C" } as const;

export default function ProfileKeyBadge({ score, status, size = "sm", showLabel = false }: Props) {
  const color = scoreColorHsl(score);
  const soft = scoreColorHsl(score, 0.14);
  const isSm = size === "sm";
  return (
    <div className="inline-flex items-center gap-1.5">
      <div
        className={`inline-flex items-center gap-1 rounded-full font-bold border ${
          isSm ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
        }`}
        style={{
          color,
          background: soft,
          borderColor: scoreColorHsl(score, 0.35),
        }}
        title={`Profile Key score ${score}/8 · ${scoreBucketLabel(score)}`}
      >
        <span
          className={`inline-block rounded-full ${isSm ? "w-1.5 h-1.5" : "w-2 h-2"}`}
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        />
        {score}/8
        {showLabel && <span className="ml-1 uppercase tracking-wide opacity-80">{scoreBucketLabel(score)}</span>}
      </div>
      {status && (
        <span
          className={`inline-flex items-center justify-center rounded-md font-bold border border-emerald-200 bg-emerald-50 text-emerald-800 ${
            isSm ? "text-[10px] w-5 h-5" : "text-xs w-6 h-6"
          }`}
          title={status.charAt(0).toUpperCase() + status.slice(1)}
        >
          {STATUS_LETTER[status]}
        </span>
      )}
    </div>
  );
}