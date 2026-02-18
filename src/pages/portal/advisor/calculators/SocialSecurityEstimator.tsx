import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Slider } from "@/components/ui/slider";

const BRAND = "#1A4D3E";
const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

interface Props { onClose: () => void }

// Simplified Social Security bend-point estimation
function estimateBenefit(annualEarnings: number, fra: number): number {
  const aime = annualEarnings / 12; // simplified: assume stable career earnings
  // 2024 bend points: 90% up to $1115, 32% up to $6721, 15% above
  let pia = 0;
  if (aime <= 1115) pia = aime * 0.9;
  else if (aime <= 6721) pia = 1115 * 0.9 + (aime - 1115) * 0.32;
  else pia = 1115 * 0.9 + (6721 - 1115) * 0.32 + (aime - 6721) * 0.15;

  // Adjust for FRA
  if (fra === 67) return pia; // FRA for those born 1960+
  if (fra === 62) return pia * 0.70; // claiming at 62: ~30% reduction
  if (fra === 70) return pia * 1.24; // delayed: 8%/yr x 3 = 24% increase
  return pia;
}

export default function SocialSecurityEstimator({ onClose }: Props) {
  const [currentAge, setCurrentAge] = useState(45);
  const [annualEarnings, setAnnualEarnings] = useState(75000);
  const [claimAge, setClaimAge] = useState(67);

  const results = useMemo(() => {
    const at62 = estimateBenefit(annualEarnings, 62);
    const at67 = estimateBenefit(annualEarnings, 67);
    const at70 = estimateBenefit(annualEarnings, 70);

    const yearsAtAge = (claim: number) => Math.max(0, 90 - claim); // assume lifespan to 90
    const lifetime62 = at62 * 12 * yearsAtAge(62);
    const lifetime67 = at67 * 12 * yearsAtAge(67);
    const lifetime70 = at70 * 12 * yearsAtAge(70);

    const chartData = [
      { age: "Age 62", monthly: Math.round(at62), lifetime: Math.round(lifetime62) },
      { age: "Age 67 (FRA)", monthly: Math.round(at67), lifetime: Math.round(lifetime67) },
      { age: "Age 70", monthly: Math.round(at70), lifetime: Math.round(lifetime70) },
    ];

    const selected = claimAge === 62 ? at62 : claimAge === 67 ? at67 : at70;

    return { at62, at67, at70, chartData, selected, lifetime62, lifetime67, lifetime70 };
  }, [annualEarnings, claimAge]);

  const labelColor = (age: number) => claimAge === age ? BRAND : "#9CA3AF";

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inputs</h3>

          {[
            { label: "Current Age", value: currentAge, set: setCurrentAge, min: 30, max: 69, step: 1, display: `${currentAge} yrs` },
            { label: "Annual Earnings", value: annualEarnings, set: setAnnualEarnings, min: 20000, max: 200000, step: 1000, display: fmt(annualEarnings) },
          ].map(({ label, value, set, min, max, step, display }) => (
            <div key={label}>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600 font-medium">{label}</span>
                <span className="text-sm font-bold" style={{ color: BRAND }}>{display}</span>
              </div>
              <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => set(v)}
                className="[&_[data-radix-slider-range]]:bg-[#1A4D3E] [&_[data-radix-slider-thumb]]:border-[#1A4D3E]" />
            </div>
          ))}

          <div>
            <p className="text-sm text-gray-600 font-medium mb-2">Planned Claiming Age</p>
            <div className="flex gap-2">
              {[62, 67, 70].map(age => (
                <button key={age} onClick={() => setClaimAge(age)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold border transition-all"
                  style={{
                    background: claimAge === age ? BRAND : "white",
                    color: claimAge === age ? "white" : "#374151",
                    borderColor: claimAge === age ? BRAND : "#E5E7EB",
                  }}>
                  {age === 67 ? "67 (FRA)" : age}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4 border" style={{ borderColor: `${BRAND}30`, background: `${BRAND}08` }}>
            <p className="text-xs text-gray-500">Your estimated monthly benefit</p>
            <p className="text-3xl font-bold mt-1" style={{ color: BRAND }}>{fmt(results.selected)}/mo</p>
            <p className="text-xs text-gray-500 mt-1">Claiming at age {claimAge}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Comparison by Claiming Age</h3>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={results.chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="age" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `$${v}`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => `${fmt(v)}/mo`} />
              <Bar dataKey="monthly" label="Monthly Benefit" radius={[6, 6, 0, 0]}>
                {results.chartData.map((_, i) => {
                  const ages = [62, 67, 70];
                  return <Cell key={i} fill={ages[i] === claimAge ? BRAND : "#D1D5DB"} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="space-y-2">
            {[
              { age: 62, monthly: results.at62, lifetime: results.lifetime62 },
              { age: 67, monthly: results.at67, lifetime: results.lifetime67 },
              { age: 70, monthly: results.at70, lifetime: results.lifetime70 },
            ].map(({ age, monthly, lifetime }) => (
              <div key={age} className={`flex items-center justify-between rounded-lg px-3 py-2 border transition-all ${claimAge === age ? "border-[#1A4D3E] bg-[#1A4D3E08]" : "border-gray-100 bg-white"}`}>
                <span className="text-sm font-medium" style={{ color: labelColor(age) }}>Age {age}{age === 67 ? " (FRA)" : ""}</span>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: labelColor(age) }}>{fmt(monthly)}/mo</p>
                  <p className="text-xs text-gray-400">~{fmt(lifetime)} lifetime</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400">* Estimate based on 2024 SSA bend points. Assumes lifetime average earnings = current earnings. Life expectancy assumed to age 90.</p>
    </div>
  );
}
