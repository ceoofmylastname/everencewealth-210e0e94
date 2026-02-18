import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Slider } from "@/components/ui/slider";

const BRAND = "#1A4D3E";
const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

interface Props { onClose: () => void }

export default function InflationImpact({ onClose }: Props) {
  const [amount, setAmount] = useState(100000);
  const [inflationRate, setInflationRate] = useState(3.5);
  const [years, setYears] = useState(20);

  const results = useMemo(() => {
    const data = Array.from({ length: years + 1 }, (_, i) => {
      const realValue = amount / Math.pow(1 + inflationRate / 100, i);
      const nominalEquivalent = amount * Math.pow(1 + inflationRate / 100, i);
      return {
        year: `Yr ${i}`,
        "Purchasing Power": Math.round(realValue),
        "Cost to Maintain": Math.round(nominalEquivalent),
      };
    });

    const finalPower = amount / Math.pow(1 + inflationRate / 100, years);
    const lostPurchasingPower = amount - finalPower;
    const percentLost = (lostPurchasingPower / amount) * 100;
    const neededToMaintain = amount * Math.pow(1 + inflationRate / 100, years);

    return { data, finalPower, lostPurchasingPower, percentLost, neededToMaintain };
  }, [amount, inflationRate, years]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inputs</h3>
          {[
            { label: "Current Amount", value: amount, set: setAmount, min: 1000, max: 1000000, step: 1000, display: fmt(amount) },
            { label: "Inflation Rate", value: inflationRate, set: setInflationRate, min: 1, max: 10, step: 0.1, display: `${inflationRate.toFixed(1)}%` },
            { label: "Years", value: years, set: setYears, min: 1, max: 50, step: 1, display: `${years} yrs` },
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
            <p className="text-xs text-gray-500">In {years} years, {fmt(amount)} today will only be worth</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{fmt(results.finalPower)}</p>
            <p className="text-xs text-red-500 mt-0.5">A loss of {results.percentLost.toFixed(1)}% purchasing power</p>
          </div>

          <div className="rounded-xl p-4 border border-orange-200 bg-orange-50">
            <p className="text-xs text-gray-500">To maintain the same purchasing power, you'll need</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{fmt(results.neededToMaintain)}</p>
            <p className="text-xs text-orange-500 mt-0.5">{fmt(results.neededToMaintain - amount)} more than today</p>
          </div>

          <div className="rounded-xl p-4 border" style={{ borderColor: `${BRAND}30`, background: `${BRAND}08` }}>
            <p className="text-xs text-gray-500">Annual inflation rate assumed</p>
            <p className="text-2xl font-bold mt-1" style={{ color: BRAND }}>{inflationRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Historical US avg: ~3.5%</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Purchasing Power Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={results.data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} interval={Math.max(1, Math.floor(years / 8))} />
            <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <ReferenceLine y={amount} stroke="#9CA3AF" strokeDasharray="4 4" label={{ value: "Today", fontSize: 10, fill: "#6B7280" }} />
            <Line type="monotone" dataKey="Purchasing Power" stroke="#DC2626" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="Cost to Maintain" stroke={BRAND} strokeWidth={2} dot={false} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 justify-center">
          <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-red-600 rounded" /><span className="text-xs text-gray-500">Purchasing Power</span></div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 rounded" style={{ background: BRAND }} /><span className="text-xs text-gray-500">Cost to Maintain</span></div>
        </div>
      </div>

      <p className="text-xs text-gray-400">* Hypothetical illustration based on constant inflation rate. Actual inflation varies year to year.</p>
    </div>
  );
}
