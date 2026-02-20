import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Slider } from "@/components/ui/slider";

const BRAND = "#1A4D3E";
const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

interface Props { onClose: () => void }

export default function CommissionCalculator({ onClose }: Props) {
  const [premium, setPremium] = useState(150);
  const [contractPercent, setContractPercent] = useState(110);
  const [policiesPerMonth, setPoliciesPerMonth] = useState(8);
  const [advancePercent, setAdvancePercent] = useState(75);
  const [chargebackRate, setChargebackRate] = useState(15);

  const results = useMemo(() => {
    const annualPremium = premium * 12;
    const totalCommission = annualPremium * (contractPercent / 100);
    const advanceAmount = totalCommission * (advancePercent / 100);
    const residualAmount = totalCommission - advanceAmount;

    const monthlyPolicies = policiesPerMonth;
    const monthlyAdvance = advanceAmount * monthlyPolicies;
    const monthlyResidual = (residualAmount / 12) * monthlyPolicies; // residual paid over 12 months
    const monthlyGross = monthlyAdvance + monthlyResidual;

    const annualGross = monthlyGross * 12;
    const chargebackBuffer = annualGross * (chargebackRate / 100);
    const netTrueIncome = annualGross - chargebackBuffer;

    const chartData = Array.from({ length: 12 }, (_, i) => ({
      month: `M${i + 1}`,
      Advance: Math.round(monthlyAdvance),
      Residual: Math.round(monthlyResidual * (i + 1)),
    }));

    return {
      annualPremium, totalCommission, advanceAmount, residualAmount,
      monthlyAdvance, monthlyResidual, monthlyGross,
      annualGross, chargebackBuffer, netTrueIncome, chartData,
      perPolicy: totalCommission,
    };
  }, [premium, contractPercent, policiesPerMonth, advancePercent, chargebackRate]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inputs</h3>
          {[
            { label: "Monthly Premium", value: premium, set: setPremium, min: 25, max: 1000, step: 25, display: fmt(premium) },
            { label: "Contract Level", value: contractPercent, set: setContractPercent, min: 50, max: 150, step: 5, display: `${contractPercent}%` },
            { label: "Policies / Month", value: policiesPerMonth, set: setPoliciesPerMonth, min: 1, max: 30, step: 1, display: `${policiesPerMonth}` },
            { label: "Advance %", value: advancePercent, set: setAdvancePercent, min: 0, max: 100, step: 5, display: `${advancePercent}%` },
            { label: "Chargeback Rate", value: chargebackRate, set: setChargebackRate, min: 0, max: 30, step: 1, display: `${chargebackRate}%` },
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
            <p className="text-xs text-gray-500">Net True Annual Income</p>
            <p className="text-2xl font-bold mt-1" style={{ color: BRAND }}>{fmt(results.netTrueIncome)}</p>
            <p className="text-xs mt-0.5" style={{ color: BRAND }}>After {chargebackRate}% chargeback buffer</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl p-3 border border-emerald-200 bg-emerald-50">
              <p className="text-xs text-gray-500">Advance / Policy</p>
              <p className="text-lg font-bold text-emerald-700">{fmt(results.advanceAmount)}</p>
            </div>
            <div className="rounded-xl p-3 border border-blue-200 bg-blue-50">
              <p className="text-xs text-gray-500">Residual / Policy</p>
              <p className="text-lg font-bold text-blue-700">{fmt(results.residualAmount)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl p-3 border border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500">Monthly Gross</p>
              <p className="text-lg font-bold text-gray-900">{fmt(results.monthlyGross)}</p>
            </div>
            <div className="rounded-xl p-3 border border-red-200 bg-red-50">
              <p className="text-xs text-gray-500">Chargeback Buffer</p>
              <p className="text-lg font-bold text-red-600">{fmt(results.chargebackBuffer)}</p>
            </div>
          </div>

          <div className="rounded-xl p-3 border border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500">Per-Policy Commission (Annual Premium × Contract %)</p>
            <p className="text-lg font-bold text-gray-900">{fmt(results.perPolicy)}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Monthly Income Breakdown</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={results.chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Bar dataKey="Advance" fill={BRAND} radius={[2, 2, 0, 0]} />
            <Bar dataKey="Residual" fill="#3B82F6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-gray-400">* Estimates only. Actual commissions depend on carrier contracts, production bonuses, and policy persistency.</p>
    </div>
  );
}
