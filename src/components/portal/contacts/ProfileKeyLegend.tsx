import { PROFILE_KEY_TRAITS, STATUS_OPTIONS } from "@/lib/profileKey";

export default function ProfileKeyLegend() {
  return (
    <div className="rounded-xl overflow-hidden border border-amber-200/60 bg-gradient-to-r from-[#1A4D3E] via-[#1A4D3E] to-[#0f3328] text-white shadow-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 text-[11px]">
        <span className="font-bold tracking-wider text-amber-300 uppercase">Profile Key:</span>
        {PROFILE_KEY_TRAITS.map((t) => (
          <span key={t.key} className="whitespace-nowrap">
            <span className="font-bold text-amber-200">({t.num})</span>{" "}
            <span className="text-white/90">{t.label}</span>
          </span>
        ))}
        <span className="hidden md:inline-block w-px h-4 bg-white/20 mx-1" />
        {STATUS_OPTIONS.map((s) => (
          <span key={s.code} className="whitespace-nowrap">
            <span className="font-bold text-amber-200">({s.letter})</span>{" "}
            <span className="text-white/90">{s.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}