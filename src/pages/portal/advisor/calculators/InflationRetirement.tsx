import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Slider } from "@/components/ui/slider";

const BRAND = "#1A4D3E";
const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

interface Props { onClose: () => void }

export default function InflationRetirement({ onClose }: Props) {
  const [currentAge, setCurrentAge] = useState(35);
  const [currentIncome, setCurrentIncome] = useState(75000);
  const [retirementAge, setRetirementAge] = useState(65);
  const [lifeExpectancy, setLifeExpectancy] = useState(85);
  const [replacementPercent, setReplacementPercent] = useState(80);
  const [inflationRate, setInflationRate] = useState(3.5);

  const results = useMemo(() => {
    const yearsToRetirement = retirementAge - currentAge;
    const retirementYears = lifeExpectancy - retirementAge;
    const targetIncome = currentIncome * (replacementPercent / 100);
    const requiredAtRetirement = targetIncome * Math.pow(1 + inflationRate / 100, yearsToRetirement);
    const inflationGap = requiredAtRetirement - targetIncome;

    // Total needed over retirement (simplified)
    let totalNeeded = 0;
    for (let i = 0; i < retirementYears; i++) {
      totalNeeded += requiredAtRetirement * Math.pow(1 + inflationRate / 100, i);
    }

    // Cost of waiting one year
    const requiredIfWait = targetIncome * Math.pow(1 + inflationRate / 100, yearsToRetirement + 1);
    const costOfWaiting = requiredIfWait - requiredAtRetirement;

    const chartData = Array.from({ length: yearsToRetirement + retirementYears + 1 }, (_, i) => ({
      year: `Age ${currentAge + i}`,
      "Income Needed": Math.round(targetIncome * Math.pow(1 + inflationRate / 100, i)),
      "Today's Dollars": Math.round(targetIncome),
    }));

    return { yearsToRetirement, requiredAtRetirement, inflationGap, totalNeeded, costOfWaiting, retirementYears, chartData };
  }, [currentAge, currentIncome, retirementAge, lifeExpectancy, replacementPercent, inflationRate]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inputs</h3>
          {[
            { label: "Current Age", value: currentAge, set: setCurrentAge, min: 20, max: 60, step: 1, display: `${currentAge}` },
            { label: "Current Income", value: currentIncome, set: setCurrentIncome, min: 25000, max: 500000, step: 5000, display: fmt(currentIncome) },
            { label: "Retirement Age", value: retirementAge, set: setRetirementAge, min: 55, max: 75, step: 1, display: `${retirementAge}` },
            { label: "Life Expectancy", value: lifeExpectancy, set: setLifeExpectancy, min: 70, max: 100, step: 1, display: `${lifeExpectancy}` },
            { label: "Income Replacement %", value: replacementPercent, set: setReplacementPercent, min: 50, max: 100, step: 5, display: `${replacementPercent}%` },
            { label: "Inflation Rate", value: inflationRate, set: setInflationRate, min: 1, max: 8, step: 0.1, display: `${inflationRate.toFixed(1)}%` },
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
          <div className="rounded-xl p-4 border border-red-200 bg-red-50">
            <p className="text-xs text-gray-500">Annual income needed at retirement (age {retirementAge})</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{fmt(results.requiredAtRetirement)}</p>
            <p className="text-xs text-red-500 mt-0.5">Inflation gap: +{fmt(results.inflationGap)} above today's target</p>
          </div>

          <div className="rounded-xl p-4 border border-orange-200 bg-orange-50">
            <p className="text-xs text-gray-500">Total needed over {results.retirementYears} years of retirement</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{fmt(results.totalNeeded)}</p>
          </div>

          <div className="rounded-xl p-4 border border-amber-200 bg-amber-50">
            <p className="text-xs text-gray-500">Cost of waiting 1 more year to plan</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">+{fmt(results.costOfWaiting)}/yr</p>
            <p className="text-xs text-amber-600 mt-0.5">Every year of delay increases your annual need</p>
          </div>

          <div className="rounded-xl p-4 border" style={{ borderColor: `${BRAND}30`, background: `${BRAND}08` }}>
            <p className="text-xs text-gray-500">Years until retirement</p>
            <p className="text-2xl font-bold mt-1" style={{ color: BRAND }}>{results.yearsToRetirement} years</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Income Needs Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={results.chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} interval={Math.max(1, Math.floor(results.chartData.length / 8))} />
            <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Line type="monotone" dataKey="Income Needed" stroke="#DC2626" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="Today's Dollars" stroke="#9CA3AF" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-gray-400">* Estimates based on constant inflation rate assumption. Actual needs vary by lifestyle and market conditions.</p>
    </div>
  );
}
