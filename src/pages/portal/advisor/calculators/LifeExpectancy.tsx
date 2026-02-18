import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";

const BRAND = "#1A4D3E";

interface Props { onClose: () => void }

export default function LifeExpectancy({ onClose }: Props) {
  const [age, setAge] = useState(50);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [smoker, setSmoker] = useState(false);
  const [health, setHealth] = useState<"excellent" | "good" | "fair">("good");
  const [exercise, setExercise] = useState<"never" | "sometimes" | "regularly">("sometimes");

  const results = useMemo(() => {
    // Base life expectancy (US averages 2024)
    let base = gender === "female" ? 81.2 : 76.1;

    // Adjustments
    if (smoker) base -= 10;
    if (health === "excellent") base += 3;
    if (health === "fair") base -= 5;
    if (exercise === "regularly") base += 3;
    if (exercise === "never") base -= 2;

    // Cap at reasonable range
    const lifeExpectancy = Math.max(age + 1, Math.min(99, Math.round(base)));
    const yearsRemaining = lifeExpectancy - age;
    const retirementAge = Math.max(age, 65);
    const retirementYears = Math.max(0, lifeExpectancy - retirementAge);

    // Longevity score 0-100
    const score = Math.round(((lifeExpectancy - 60) / 40) * 100);
    const clampedScore = Math.max(10, Math.min(100, score));

    const scoreColor = clampedScore >= 70 ? BRAND : clampedScore >= 50 ? "#F59E0B" : "#DC2626";
    const scoreLabel = clampedScore >= 70 ? "Excellent" : clampedScore >= 50 ? "Average" : "Below Average";

    return { lifeExpectancy, yearsRemaining, retirementYears, clampedScore, scoreColor, scoreLabel };
  }, [age, gender, smoker, health, exercise]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inputs</h3>

          <div>
            <p className="text-sm text-gray-600 font-medium mb-2">Gender</p>
            <div className="flex gap-2">
              {(["male", "female"] as const).map(g => (
                <button key={g} onClick={() => setGender(g)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold border transition-all capitalize"
                  style={{
                    background: gender === g ? BRAND : "white",
                    color: gender === g ? "white" : "#374151",
                    borderColor: gender === g ? BRAND : "#E5E7EB",
                  }}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Current Age</span>
              <span className="text-sm font-bold" style={{ color: BRAND }}>{age} yrs</span>
            </div>
            <Slider value={[age]} min={20} max={80} step={1} onValueChange={([v]) => setAge(v)}
              className="[&_[data-radix-slider-range]]:bg-[#1A4D3E] [&_[data-radix-slider-thumb]]:border-[#1A4D3E]" />
          </div>

          <div>
            <p className="text-sm text-gray-600 font-medium mb-2">Smoker?</p>
            <div className="flex gap-2">
              {[{ label: "Non-Smoker", val: false }, { label: "Smoker", val: true }].map(({ label, val }) => (
                <button key={label} onClick={() => setSmoker(val)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold border transition-all"
                  style={{
                    background: smoker === val ? BRAND : "white",
                    color: smoker === val ? "white" : "#374151",
                    borderColor: smoker === val ? BRAND : "#E5E7EB",
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 font-medium mb-2">Health Rating</p>
            <div className="flex gap-2">
              {(["excellent", "good", "fair"] as const).map(h => (
                <button key={h} onClick={() => setHealth(h)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold border transition-all capitalize"
                  style={{
                    background: health === h ? BRAND : "white",
                    color: health === h ? "white" : "#374151",
                    borderColor: health === h ? BRAND : "#E5E7EB",
                  }}>
                  {h}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 font-medium mb-2">Exercise Frequency</p>
            <div className="flex gap-2">
              {(["never", "sometimes", "regularly"] as const).map(e => (
                <button key={e} onClick={() => setExercise(e)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold border transition-all capitalize"
                  style={{
                    background: exercise === e ? BRAND : "white",
                    color: exercise === e ? "white" : "#374151",
                    borderColor: exercise === e ? BRAND : "#E5E7EB",
                  }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Results</h3>

          {/* Longevity Score */}
          <div className="rounded-xl p-6 border border-gray-100 bg-white text-center">
            <p className="text-xs text-gray-500 mb-2">Longevity Score</p>
            <div className="relative w-28 h-28 mx-auto mb-3">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#F3F4F6" strokeWidth="12" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={results.scoreColor} strokeWidth="12"
                  strokeDasharray={`${(results.clampedScore / 100) * 314} 314`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: results.scoreColor }}>{results.clampedScore}</span>
                <span className="text-xs text-gray-400">/ 100</span>
              </div>
            </div>
            <p className="text-sm font-semibold" style={{ color: results.scoreColor }}>{results.scoreLabel}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3 border border-gray-100 bg-gray-50 text-center">
              <p className="text-2xl font-bold" style={{ color: BRAND }}>{results.lifeExpectancy}</p>
              <p className="text-xs text-gray-500 mt-0.5">Est. Lifespan</p>
            </div>
            <div className="rounded-xl p-3 border border-gray-100 bg-gray-50 text-center">
              <p className="text-2xl font-bold text-gray-700">{results.yearsRemaining}</p>
              <p className="text-xs text-gray-500 mt-0.5">Years Remaining</p>
            </div>
            <div className="rounded-xl p-3 border text-center" style={{ borderColor: `${BRAND}30`, background: `${BRAND}08` }}>
              <p className="text-2xl font-bold" style={{ color: BRAND }}>{results.retirementYears}</p>
              <p className="text-xs text-gray-500 mt-0.5">Retirement Yrs</p>
            </div>
          </div>

          <div className="rounded-xl p-4 border border-amber-200 bg-amber-50">
            <p className="text-sm font-semibold text-amber-700">Planning Insight</p>
            <p className="text-xs text-amber-600 mt-1">
              With an estimated {results.retirementYears} years in retirement, you'll need income planning from age 65 to {results.lifeExpectancy}. Life insurance or an annuity strategy can help protect against longevity risk.
            </p>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400">* Based on CDC/SSA actuarial data (2024). This is a simplified estimate for planning purposes only, not a medical determination.</p>
    </div>
  );
}
