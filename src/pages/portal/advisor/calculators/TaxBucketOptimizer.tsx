import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Slider } from "@/components/ui/slider";

const BRAND = "#1A4D3E";
const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

interface Props { onClose: () => void }

export default function TaxBucketOptimizer({ onClose }: Props) {
  const [totalAssets, setTotalAssets] = useState(500000);
  const [currentBracket, setCurrentBracket] = useState(24);
  const [retirementBracket, setRetirementBracket] = useState(22);
  const [yearsToRetirement, setYearsToRetirement] = useState(20);

  const results = useMemo(() => {
    // Recommend allocation based on bracket comparison
    const higherNow = currentBracket > retirementBracket;
    const similar = Math.abs(currentBracket - retirementBracket) <= 3;

    let taxable: number, deferred: number, exempt: number;

    if (similar) {
      // Balanced approach
      taxable = 0.20;
      deferred = 0.40;
      exempt = 0.40;
    } else if (higherNow) {
      // Maximize pre-tax contributions now (defer taxes to lower bracket later)
      taxable = 0.15;
      deferred = 0.55;
      exempt = 0.30;
    } else {
      // Lower bracket now → maximize Roth (tax-exempt) contributions
      taxable = 0.15;
      deferred = 0.25;
      exempt = 0.60;
    }

    // Time-based adjustment: closer to retirement → shift to tax-exempt
    const timeAdjust = Math.max(0, (30 - yearsToRetirement) / 30) * 0.1;
    exempt = Math.min(0.75, exempt + timeAdjust);
    deferred = Math.max(0.15, deferred - timeAdjust);

    const taxableAmt = Math.round(totalAssets * taxable);
    const deferredAmt = Math.round(totalAssets * deferred);
    const exemptAmt = Math.round(totalAssets * exempt);

    const chartData = [
      { name: "Tax-Exempt (Roth/IUL)", value: Math.round(exemptAmt), color: BRAND },
      { name: "Tax-Deferred (401k/IRA)", value: Math.round(deferredAmt), color: "#6B7280" },
      { name: "Taxable (Brokerage)", value: Math.round(taxableAmt), color: "#D1D5DB" },
    ];

    const strategy = higherNow
      ? "Maximize pre-tax contributions while your bracket is high, then convert to Roth gradually in retirement."
      : similar
      ? "A balanced approach across all three buckets gives flexibility and tax diversification."
      : "Your lower current bracket is an opportunity to maximize Roth and IUL contributions for tax-free growth.";

    return { taxableAmt, deferredAmt, exemptAmt, chartData, strategy };
  }, [totalAssets, currentBracket, retirementBracket, yearsToRetirement]);

  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.08) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">{`${(percent * 100).toFixed(0)}%`}</text>;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inputs</h3>
          {[
            { label: "Total Investable Assets", value: totalAssets, set: setTotalAssets, min: 10000, max: 5000000, step: 10000, display: fmt(totalAssets) },
            { label: "Current Tax Bracket", value: currentBracket, set: setCurrentBracket, min: 10, max: 37, step: 1, display: `${currentBracket}%` },
            { label: "Retirement Tax Bracket", value: retirementBracket, set: setRetirementBracket, min: 10, max: 37, step: 1, display: `${retirementBracket}%` },
            { label: "Years to Retirement", value: yearsToRetirement, set: setYearsToRetirement, min: 1, max: 40, step: 1, display: `${yearsToRetirement} yrs` },
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

          <div className="rounded-xl p-4 border border-blue-200 bg-blue-50">
            <p className="text-xs font-semibold text-blue-700 mb-1">Strategy Recommendation</p>
            <p className="text-xs text-blue-600">{results.strategy}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Recommended Allocation</h3>

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={results.chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                dataKey="value" labelLine={false} label={renderCustomLabel}>
                {results.chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2">
            {[
              { label: "Tax-Exempt (Roth / IUL)", value: results.exemptAmt, color: BRAND, desc: "Tax-free in retirement" },
              { label: "Tax-Deferred (401k / IRA)", value: results.deferredAmt, color: "#6B7280", desc: "Taxed at withdrawal" },
              { label: "Taxable (Brokerage)", value: results.taxableAmt, color: "#9CA3AF", desc: "Capital gains taxed annually" },
            ].map(({ label, value, color, desc }) => (
              <div key={label} className="flex items-center justify-between rounded-lg px-3 py-2.5 border border-gray-100 bg-white">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </div>
                <span className="text-sm font-bold" style={{ color }}>{fmt(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400">* Allocation recommendations are illustrative. Consult a tax professional for personalized advice.</p>
    </div>
  );
}
