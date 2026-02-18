import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Slider } from "@/components/ui/slider";

const BRAND = "#1A4D3E";
const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

interface Props { onClose: () => void }

export default function RetirementGap({ onClose }: Props) {
  const [currentAge, setCurrentAge] = useState(40);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(75000);
  const [monthlyContrib, setMonthlyContrib] = useState(1000);
  const [returnRate, setReturnRate] = useState(7);
  const [desiredMonthly, setDesiredMonthly] = useState(5000);

  const results = useMemo(() => {
    const yearsToRetire = Math.max(1, retirementAge - currentAge);
    const r = returnRate / 100 / 12;
    const n = yearsToRetire * 12;

    // FV of current savings
    const fvSavings = currentSavings * Math.pow(1 + r, n);
    // FV of monthly contributions (annuity)
    const fvContrib = r > 0 ? monthlyContrib * ((Math.pow(1 + r, n) - 1) / r) : monthlyContrib * n;
    const projectedSavings = fvSavings + fvContrib;

    // Required nest egg (4% withdrawal rule, 25x annual spending)
    const annualIncome = desiredMonthly * 12;
    const requiredNestEgg = annualIncome * 25;

    const gap = requiredNestEgg - projectedSavings;
    const onTrack = gap <= 0;

    const chartData = [
      { name: "Projected Savings", value: Math.round(projectedSavings), fill: BRAND },
      { name: "Required Nest Egg", value: Math.round(requiredNestEgg), fill: onTrack ? "#6B7280" : "#DC2626" },
    ];

    const extraMonthlyNeeded = gap > 0 && r > 0
      ? gap / ((Math.pow(1 + r, n) - 1) / r)
      : gap > 0 ? gap / n : 0;

    return { projectedSavings, requiredNestEgg, gap, onTrack, chartData, extraMonthlyNeeded, yearsToRetire };
  }, [currentAge, retirementAge, currentSavings, monthlyContrib, returnRate, desiredMonthly]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inputs</h3>
          {[
            { label: "Current Age", value: currentAge, set: setCurrentAge, min: 20, max: 70, step: 1, display: `${currentAge} yrs` },
            { label: "Retirement Age", value: retirementAge, set: setRetirementAge, min: Math.max(currentAge + 1, 50), max: 80, step: 1, display: `${retirementAge} yrs` },
            { label: "Current Savings", value: currentSavings, set: setCurrentSavings, min: 0, max: 2000000, step: 5000, display: fmt(currentSavings) },
            { label: "Monthly Contribution", value: monthlyContrib, set: setMonthlyContrib, min: 100, max: 10000, step: 100, display: fmt(monthlyContrib) },
            { label: "Expected Return", value: returnRate, set: setReturnRate, min: 2, max: 12, step: 0.5, display: `${returnRate}%` },
            { label: "Desired Monthly Income", value: desiredMonthly, set: setDesiredMonthly, min: 1000, max: 20000, step: 500, display: fmt(desiredMonthly) },
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
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Results</h3>
          <p className="text-xs text-gray-400">{results.yearsToRetire} years until retirement</p>

          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-xl p-4 border" style={{ borderColor: `${BRAND}30`, background: `${BRAND}08` }}>
              <p className="text-xs text-gray-500">Projected savings at retirement</p>
              <p className="text-2xl font-bold mt-1" style={{ color: BRAND }}>{fmt(results.projectedSavings)}</p>
            </div>
            <div className={`rounded-xl p-4 border ${results.onTrack ? "border-gray-200 bg-gray-50" : "border-red-200 bg-red-50"}`}>
              <p className="text-xs text-gray-500">Required nest egg (25× rule)</p>
              <p className={`text-2xl font-bold mt-1 ${results.onTrack ? "text-gray-700" : "text-red-600"}`}>{fmt(results.requiredNestEgg)}</p>
            </div>
          </div>

          <div className={`rounded-xl p-4 border ${results.onTrack ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
            <p className="text-sm font-semibold" style={{ color: results.onTrack ? BRAND : "#DC2626" }}>
              {results.onTrack ? "✓ On Track!" : `Gap: ${fmt(Math.abs(results.gap))}`}
            </p>
            {!results.onTrack && (
              <p className="text-xs text-red-500 mt-1">
                Add {fmt(results.extraMonthlyNeeded)}/mo to close the gap
              </p>
            )}
            {results.onTrack && (
              <p className="text-xs text-emerald-600 mt-1">Surplus of {fmt(Math.abs(results.gap))}</p>
            )}
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={results.chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {results.chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="text-xs text-gray-400">* Based on the 4% withdrawal rule (25× annual income). Inflation not included in projections.</p>
    </div>
  );
}
