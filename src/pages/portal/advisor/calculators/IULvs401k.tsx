import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Slider } from "@/components/ui/slider";

const BRAND = "#1A4D3E";
const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

interface Props { onClose: () => void }

export default function IULvs401k({ onClose }: Props) {
  const [age, setAge] = useState(35);
  const [contribution, setContribution] = useState(12000);
  const [years, setYears] = useState(25);
  const [taxRate, setTaxRate] = useState(28);
  const [growthRate, setGrowthRate] = useState(6.5);

  const results = useMemo(() => {
    // 401k: pre-tax contributions grow tax-deferred, taxed at withdrawal
    const annualContrib = contribution;
    let k401 = 0;
    for (let i = 0; i < years; i++) k401 = (k401 + annualContrib) * (1 + growthRate / 100);
    const k401Net = k401 * (1 - taxRate / 100);

    // IUL: after-tax contributions, floor 0%, cap ~10%, avg ~7%
    const iulGrowth = Math.min(growthRate, 10);
    const afterTaxContrib = annualContrib * (1 - taxRate / 100);
    let iul = 0;
    for (let i = 0; i < years; i++) iul = (iul + afterTaxContrib) * (1 + iulGrowth / 100);
    // IUL withdrawals are tax-free
    const iulNet = iul;

    const chartData = [
      { name: "Gross Value", "401(k)": Math.round(k401), IUL: Math.round(iul) },
      { name: "After-Tax Value", "401(k)": Math.round(k401Net), IUL: Math.round(iulNet) },
    ];

    const yearlyData = Array.from({ length: Math.min(years, 30) }, (_, i) => {
      const y = i + 1;
      let k = 0, il = 0;
      for (let j = 0; j < y; j++) {
        k = (k + annualContrib) * (1 + growthRate / 100);
        il = (il + afterTaxContrib) * (1 + iulGrowth / 100);
      }
      return { year: `Yr ${y}`, "401(k)": Math.round(k * (1 - taxRate / 100)), IUL: Math.round(il) };
    }).filter((_, i) => i % Math.max(1, Math.floor(years / 10)) === 0);

    return { k401, k401Net, iul, iulNet, chartData, yearlyData, advantage: iulNet - k401Net };
  }, [age, contribution, years, taxRate, growthRate]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inputs</h3>

          {[
            { label: "Current Age", value: age, set: setAge, min: 25, max: 65, step: 1, display: `${age} yrs` },
            { label: "Annual Contribution", value: contribution, set: setContribution, min: 1000, max: 50000, step: 500, display: fmt(contribution) },
            { label: "Years to Retirement", value: years, set: setYears, min: 5, max: 40, step: 1, display: `${years} yrs` },
            { label: "Tax Rate", value: taxRate, set: setTaxRate, min: 10, max: 50, step: 1, display: `${taxRate}%` },
            { label: "Growth Rate", value: growthRate, set: setGrowthRate, min: 4, max: 12, step: 0.5, display: `${growthRate}%` },
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

        {/* Results */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Results</h3>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "IUL Gross Value", value: fmt(results.iul), color: BRAND, sub: "Tax-free" },
              { label: "401(k) Gross Value", value: fmt(results.k401), color: "#6B7280", sub: "Pre-tax" },
              { label: "IUL Net (Tax-Free)", value: fmt(results.iulNet), color: BRAND, sub: "After-tax value", bold: true },
              { label: "401(k) Net", value: fmt(results.k401Net), color: "#6B7280", sub: "After withdrawal tax", bold: true },
            ].map(({ label, value, color, sub, bold }) => (
              <div key={label} className={`rounded-xl p-3 border ${bold ? "bg-gray-50 border-gray-200" : "bg-white border-gray-100"}`}>
                <p className="text-xs text-gray-500">{label}</p>
                <p className={`text-lg font-bold mt-0.5`} style={{ color }}>{value}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>

          <div className={`rounded-xl p-3 border ${results.advantage > 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
            <p className="text-xs font-semibold" style={{ color: results.advantage > 0 ? BRAND : "#DC2626" }}>
              IUL {results.advantage > 0 ? "Advantage" : "Disadvantage"}: {fmt(Math.abs(results.advantage))}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">After-tax net difference at retirement</p>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={results.chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="IUL" fill={BRAND} radius={[4, 4, 0, 0]} />
              <Bar dataKey="401(k)" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth timeline */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">After-Tax Value Over Time</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={results.yearlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="IUL" fill={BRAND} radius={[4, 4, 0, 0]} />
            <Bar dataKey="401(k)" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-gray-400">* Hypothetical illustration only. IUL assumes 0% floor, growth rate capped at 10%. Past performance does not guarantee future results.</p>
    </div>
  );
}
