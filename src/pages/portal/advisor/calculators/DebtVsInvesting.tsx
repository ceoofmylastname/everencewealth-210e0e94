import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Slider } from "@/components/ui/slider";

const BRAND = "#1A4D3E";
const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

interface Props { onClose: () => void }

export default function DebtVsInvesting({ onClose }: Props) {
  const [debtBalance, setDebtBalance] = useState(25000);
  const [debtRate, setDebtRate] = useState(6.5);
  const [investReturn, setInvestReturn] = useState(8);
  const [taxBracket, setTaxBracket] = useState(22);
  const [isDeductible, setIsDeductible] = useState(false);
  const [years] = useState(10);

  const results = useMemo(() => {
    const effectiveDebtRate = isDeductible ? debtRate * (1 - taxBracket / 100) : debtRate;
    const afterTaxReturn = investReturn * (1 - taxBracket / 100);
    const spread = afterTaxReturn - effectiveDebtRate;
    const recommendation = spread > 0 ? "invest" : "pay_debt";

    const debtCost = debtBalance * Math.pow(1 + effectiveDebtRate / 100, years) - debtBalance;
    const investGain = debtBalance * Math.pow(1 + afterTaxReturn / 100, years) - debtBalance;
    const wealthDiff = investGain - debtCost;
    const breakEvenReturn = effectiveDebtRate / (1 - taxBracket / 100);

    const chartData = Array.from({ length: years + 1 }, (_, i) => ({
      year: `Yr ${i}`,
      "Debt Cost": Math.round(debtBalance * (Math.pow(1 + effectiveDebtRate / 100, i) - 1)),
      "Investment Growth": Math.round(debtBalance * (Math.pow(1 + afterTaxReturn / 100, i) - 1)),
    }));

    return { effectiveDebtRate, afterTaxReturn, spread, recommendation, debtCost, investGain, wealthDiff, breakEvenReturn, chartData };
  }, [debtBalance, debtRate, investReturn, taxBracket, isDeductible, years]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inputs</h3>
          {[
            { label: "Debt Balance", value: debtBalance, set: setDebtBalance, min: 1000, max: 200000, step: 1000, display: fmt(debtBalance) },
            { label: "Debt Interest Rate", value: debtRate, set: setDebtRate, min: 1, max: 25, step: 0.1, display: `${debtRate.toFixed(1)}%` },
            { label: "Expected Investment Return", value: investReturn, set: setInvestReturn, min: 1, max: 15, step: 0.1, display: `${investReturn.toFixed(1)}%` },
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
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={isDeductible} onChange={e => setIsDeductible(e.target.checked)} className="rounded border-gray-300" />
            Debt interest is tax-deductible (e.g. mortgage)
          </label>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Results</h3>
          <div className={`rounded-xl p-4 border ${results.recommendation === "invest" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
            <p className="text-xs text-gray-500">Recommendation</p>
            <p className={`text-xl font-bold mt-1 ${results.recommendation === "invest" ? "text-emerald-700" : "text-amber-700"}`}>
              {results.recommendation === "invest" ? "📈 Invest More" : "💳 Pay Off Debt First"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Spread: {results.spread > 0 ? "+" : ""}{results.spread.toFixed(2)}% in favor of {results.recommendation === "invest" ? "investing" : "debt payoff"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 border border-red-200 bg-red-50">
              <p className="text-xs text-gray-500">Effective Debt Rate</p>
              <p className="text-lg font-bold text-red-600">{results.effectiveDebtRate.toFixed(2)}%</p>
            </div>
            <div className="rounded-xl p-3 border" style={{ borderColor: `${BRAND}30`, background: `${BRAND}08` }}>
              <p className="text-xs text-gray-500">After-Tax Return</p>
              <p className="text-lg font-bold" style={{ color: BRAND }}>{results.afterTaxReturn.toFixed(2)}%</p>
            </div>
          </div>

          <div className="rounded-xl p-4 border border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500">10-Year Wealth Difference</p>
            <p className={`text-2xl font-bold mt-1 ${results.wealthDiff >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {results.wealthDiff >= 0 ? "+" : ""}{fmt(results.wealthDiff)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Break-even return needed: {results.breakEvenReturn.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">10-Year Comparison</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={results.chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} interval={1} />
            <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Bar dataKey="Debt Cost" fill="#DC2626" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Investment Growth" fill={BRAND} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-gray-400">* Hypothetical illustration. Does not account for variable rates, fees, or market volatility. Consult a financial advisor.</p>
    </div>
  );
}
