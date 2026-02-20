import { useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Slider } from "@/components/ui/slider";

const BRAND = "#1A4D3E";
const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

interface Props { onClose: () => void }

export default function InsuranceLongevity({ onClose }: Props) {
  const [insuranceAmount, setInsuranceAmount] = useState(500000);
  const [monthlyNeeds, setMonthlyNeeds] = useState(4000);
  const [inflationRate, setInflationRate] = useState(3);
  const [returnRate, setReturnRate] = useState(5);
  const [taxRate, setTaxRate] = useState(22);

  const results = useMemo(() => {
    const afterTaxProceeds = insuranceAmount * (1 - taxRate / 100);
    const afterTaxReturn = returnRate * (1 - taxRate / 100);
    const monthlyReturn = afterTaxReturn / 100 / 12;
    const monthlyInflation = inflationRate / 100 / 12;

    let balance = afterTaxProceeds;
    let month = 0;
    let currentMonthlyNeed = monthlyNeeds;
    const chartData: Array<{ year: string; Balance: number }> = [{ year: "Yr 0", Balance: Math.round(balance) }];
    const maxMonths = 60 * 12; // 60 years max

    while (balance > 0 && month < maxMonths) {
      month++;
      balance = balance * (1 + monthlyReturn) - currentMonthlyNeed;
      currentMonthlyNeed *= (1 + monthlyInflation);
      if (month % 12 === 0) {
        chartData.push({ year: `Yr ${month / 12}`, Balance: Math.max(0, Math.round(balance)) });
      }
    }

    const yearsLasts = month / 12;
    const hasShortfall = yearsLasts < 30;
    const annualWithdrawal = monthlyNeeds * 12;

    return { afterTaxProceeds, yearsLasts, hasShortfall, annualWithdrawal, monthlyNeeds, chartData };
  }, [insuranceAmount, monthlyNeeds, inflationRate, returnRate, taxRate]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inputs</h3>
          {[
            { label: "Insurance Amount", value: insuranceAmount, set: setInsuranceAmount, min: 50000, max: 2000000, step: 25000, display: fmt(insuranceAmount) },
            { label: "Monthly Income Needs", value: monthlyNeeds, set: setMonthlyNeeds, min: 1000, max: 20000, step: 500, display: fmt(monthlyNeeds) },
            { label: "Inflation Rate", value: inflationRate, set: setInflationRate, min: 1, max: 8, step: 0.5, display: `${inflationRate}%` },
            { label: "Investment Return", value: returnRate, set: setReturnRate, min: 1, max: 12, step: 0.5, display: `${returnRate}%` },
            { label: "Tax Rate", value: taxRate, set: setTaxRate, min: 0, max: 40, step: 1, display: `${taxRate}%` },
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
          <div className={`rounded-xl p-4 border ${results.hasShortfall ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}>
            <p className="text-xs text-gray-500">Coverage lasts approximately</p>
            <p className={`text-2xl font-bold mt-1 ${results.hasShortfall ? "text-red-600" : "text-emerald-700"}`}>
              {results.yearsLasts.toFixed(1)} years
            </p>
            {results.hasShortfall && <p className="text-xs text-red-500 mt-0.5">⚠️ May not provide lifelong income protection</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 border" style={{ borderColor: `${BRAND}30`, background: `${BRAND}08` }}>
              <p className="text-xs text-gray-500">After-Tax Proceeds</p>
              <p className="text-lg font-bold" style={{ color: BRAND }}>{fmt(results.afterTaxProceeds)}</p>
            </div>
            <div className="rounded-xl p-3 border border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500">Annual Withdrawal</p>
              <p className="text-lg font-bold text-gray-900">{fmt(results.annualWithdrawal)}</p>
            </div>
          </div>

          {results.hasShortfall && (
            <div className="rounded-xl p-4 border border-amber-200 bg-amber-50">
              <p className="text-xs text-gray-500">💡 Recommendation</p>
              <p className="text-sm text-amber-800 mt-1 font-medium">
                Consider increasing coverage or reducing monthly withdrawals to extend the longevity of benefits.
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Balance Depletion Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={results.chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="year" tick={{ fontSize: 10 }} interval={Math.max(1, Math.floor(results.chartData.length / 8))} />
            <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Area type="monotone" dataKey="Balance" stroke={results.hasShortfall ? "#DC2626" : BRAND} fill={results.hasShortfall ? "#FEE2E2" : `${BRAND}20`} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-gray-400">* Estimates assume constant rates. Actual results depend on market performance, tax law changes, and withdrawal patterns.</p>
    </div>
  );
}
