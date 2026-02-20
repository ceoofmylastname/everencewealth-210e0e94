import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Slider } from "@/components/ui/slider";

const BRAND = "#1A4D3E";
const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

interface Props { onClose: () => void }

export default function LifetimeEarnings({ onClose }: Props) {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentIncome, setCurrentIncome] = useState(60000);
  const [annualIncrease, setAnnualIncrease] = useState(3);

  const results = useMemo(() => {
    const yearsRemaining = retirementAge - currentAge;
    let totalEarnings = 0;
    let incomeAtRetirement = currentIncome;

    const chartData = Array.from({ length: yearsRemaining + 1 }, (_, i) => {
      const income = currentIncome * Math.pow(1 + annualIncrease / 100, i);
      totalEarnings += income;
      if (i === yearsRemaining) incomeAtRetirement = income;
      return {
        year: `Age ${currentAge + i}`,
        "Annual Income": Math.round(income),
        "Cumulative": Math.round(totalEarnings),
      };
    });

    const peakIncome = incomeAtRetirement;
    const avgAnnual = totalEarnings / yearsRemaining;

    return { totalEarnings, yearsRemaining, incomeAtRetirement: peakIncome, avgAnnual, chartData };
  }, [currentAge, retirementAge, currentIncome, annualIncrease]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inputs</h3>
          {[
            { label: "Current Age", value: currentAge, set: setCurrentAge, min: 18, max: 60, step: 1, display: `${currentAge}` },
            { label: "Retirement Age", value: retirementAge, set: setRetirementAge, min: 55, max: 75, step: 1, display: `${retirementAge}` },
            { label: "Current Income", value: currentIncome, set: setCurrentIncome, min: 20000, max: 500000, step: 5000, display: fmt(currentIncome) },
            { label: "Annual Increase", value: annualIncrease, set: setAnnualIncrease, min: 0, max: 10, step: 0.5, display: `${annualIncrease}%` },
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
          <div className="rounded-xl p-4 border" style={{ borderColor: `${BRAND}30`, background: `${BRAND}08` }}>
            <p className="text-xs text-gray-500">Total Lifetime Earnings</p>
            <p className="text-2xl font-bold mt-1" style={{ color: BRAND }}>{fmt(results.totalEarnings)}</p>
            <p className="text-xs mt-0.5" style={{ color: BRAND }}>{results.yearsRemaining} working years remaining</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 border border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500">Income at Retirement</p>
              <p className="text-lg font-bold text-gray-900">{fmt(results.incomeAtRetirement)}</p>
            </div>
            <div className="rounded-xl p-3 border border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500">Avg Annual Income</p>
              <p className="text-lg font-bold text-gray-900">{fmt(results.avgAnnual)}</p>
            </div>
          </div>

          <div className="rounded-xl p-4 border border-blue-200 bg-blue-50">
            <p className="text-xs text-gray-500">💡 Insight</p>
            <p className="text-sm text-blue-800 mt-1 font-medium">
              {results.totalEarnings > 2000000
                ? "Your earning potential exceeds $2M — proper wealth strategy is critical to protect this asset."
                : "Every dollar earned is an opportunity. Small increases in savings rate compound dramatically over your career."}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Projected Income Growth</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={results.chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} interval={Math.max(1, Math.floor(results.chartData.length / 8))} />
            <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Area type="monotone" dataKey="Annual Income" stroke={BRAND} fill={`${BRAND}20`} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-gray-400">* Projection assumes consistent annual increases. Actual earnings vary based on career changes, market conditions, and economic factors.</p>
    </div>
  );
}
