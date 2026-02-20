import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Slider } from "@/components/ui/slider";

const BRAND = "#1A4D3E";
const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

interface Props { onClose: () => void }

const FREQUENCY_OPTIONS = [
  { label: "Daily", multiplier: 365 },
  { label: "Weekly", multiplier: 52 },
  { label: "Monthly", multiplier: 12 },
];

export default function HabitsWealth({ onClose }: Props) {
  const [recurringExpense, setRecurringExpense] = useState(5);
  const [frequencyIdx, setFrequencyIdx] = useState(0); // Daily
  const [yearsToRetirement, setYearsToRetirement] = useState(30);
  const [expectedReturn, setExpectedReturn] = useState(8);
  const [taxBracket, setTaxBracket] = useState(22);

  const freq = FREQUENCY_OPTIONS[frequencyIdx];

  const results = useMemo(() => {
    const annualCost = recurringExpense * freq.multiplier;
    const afterTaxReturn = expectedReturn * (1 - taxBracket / 100);
    const r = afterTaxReturn / 100;

    // FV of annuity
    const futureValue = r > 0 ? annualCost * ((Math.pow(1 + r, yearsToRetirement) - 1) / r) : annualCost * yearsToRetirement;
    const totalSpent = annualCost * yearsToRetirement;
    const opportunityCost = futureValue - totalSpent;
    const wealthMultiplier = futureValue / totalSpent;

    const chartData = [5, 10, 15, 20, 25, 30].filter(y => y <= yearsToRetirement).map(y => ({
      year: `${y} yrs`,
      "Wealth If Invested": Math.round(r > 0 ? annualCost * ((Math.pow(1 + r, y) - 1) / r) : annualCost * y),
      "Total Spent": Math.round(annualCost * y),
    }));

    const examples = [
      { habit: "Daily Coffee", amount: 5, annual: 5 * 365 },
      { habit: "Streaming Subs", amount: 45, annual: 45 * 12 },
      { habit: "Eating Out", amount: 60, annual: 60 * 52 },
    ];

    return { annualCost, futureValue, totalSpent, opportunityCost, wealthMultiplier, chartData, examples };
  }, [recurringExpense, freq, yearsToRetirement, expectedReturn, taxBracket]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inputs</h3>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Recurring Expense</span>
              <span className="text-sm font-bold" style={{ color: BRAND }}>${recurringExpense}</span>
            </div>
            <Slider value={[recurringExpense]} min={1} max={200} step={1} onValueChange={([v]) => setRecurringExpense(v)}
              className="[&_[data-radix-slider-range]]:bg-[#1A4D3E] [&_[data-radix-slider-thumb]]:border-[#1A4D3E]" />
          </div>
          <div>
            <span className="text-sm text-gray-600 font-medium block mb-2">Frequency</span>
            <div className="flex gap-2">
              {FREQUENCY_OPTIONS.map((f, i) => (
                <button key={f.label} onClick={() => setFrequencyIdx(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${i === frequencyIdx ? "text-white border-transparent" : "border-gray-200 text-gray-600 bg-white"}`}
                  style={i === frequencyIdx ? { background: BRAND } : {}}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          {[
            { label: "Years to Retirement", value: yearsToRetirement, set: setYearsToRetirement, min: 5, max: 40, step: 1, display: `${yearsToRetirement} yrs` },
            { label: "Expected Return", value: expectedReturn, set: setExpectedReturn, min: 3, max: 12, step: 0.5, display: `${expectedReturn}%` },
            { label: "Tax Bracket", value: taxBracket, set: setTaxBracket, min: 10, max: 40, step: 1, display: `${taxBracket}%` },
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
            <p className="text-xs text-gray-500">If invested instead, you'd have</p>
            <p className="text-2xl font-bold mt-1" style={{ color: BRAND }}>{fmt(results.futureValue)}</p>
            <p className="text-xs mt-0.5" style={{ color: BRAND }}>{results.wealthMultiplier.toFixed(1)}x wealth multiplier</p>
          </div>

          <div className="rounded-xl p-4 border border-red-200 bg-red-50">
            <p className="text-xs text-gray-500">Total spent over {yearsToRetirement} years</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{fmt(results.totalSpent)}</p>
            <p className="text-xs text-red-500 mt-0.5">{fmt(results.annualCost)}/year on this habit</p>
          </div>

          <div className="rounded-xl p-4 border border-amber-200 bg-amber-50">
            <p className="text-xs text-gray-500">Opportunity cost (wealth you're leaving behind)</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{fmt(results.opportunityCost)}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Wealth Growth Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={results.chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Bar dataKey="Total Spent" fill="#DC2626" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Wealth If Invested" fill={BRAND} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-gray-400">* Hypothetical illustration assuming consistent contributions and returns. Actual results will vary.</p>
    </div>
  );
}
