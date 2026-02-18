import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";

const BRAND = "#1A4D3E";
const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

// 2024 Federal estate tax exemption
const FEDERAL_EXEMPTION = 13610000;
const FEDERAL_RATE = 0.40;

// Simplified state estate taxes (states with estate tax)
const STATE_TAXES: Record<string, { exemption: number; rate: number; label: string }> = {
  none: { exemption: 0, rate: 0, label: "No State Estate Tax" },
  wa: { exemption: 2193000, rate: 0.19, label: "Washington" },
  or: { exemption: 1000000, rate: 0.16, label: "Oregon" },
  mn: { exemption: 3000000, rate: 0.16, label: "Minnesota" },
  il: { exemption: 4000000, rate: 0.16, label: "Illinois" },
  ma: { exemption: 2000000, rate: 0.16, label: "Massachusetts" },
  ny: { exemption: 6940000, rate: 0.16, label: "New York" },
  md: { exemption: 5000000, rate: 0.16, label: "Maryland" },
  ct: { exemption: 13610000, rate: 0.12, label: "Connecticut" },
  hi: { exemption: 5490000, rate: 0.20, label: "Hawaii" },
};

interface Props { onClose: () => void }

export default function EstateTaxCalculator({ onClose }: Props) {
  const [grossEstate, setGrossEstate] = useState(5000000);
  const [debts, setDebts] = useState(200000);
  const [lifeInsurance, setLifeInsurance] = useState(500000);
  const [state, setState] = useState("none");

  const results = useMemo(() => {
    const netEstate = Math.max(0, grossEstate - debts);
    const taxableEstate = Math.max(0, netEstate - FEDERAL_EXEMPTION);
    const federalTax = taxableEstate * FEDERAL_RATE;

    const st = STATE_TAXES[state] || STATE_TAXES.none;
    const stateNettable = Math.max(0, netEstate - st.exemption);
    const stateTax = stateNettable * st.rate;

    const totalTax = federalTax + stateTax;
    const netToHeirs = netEstate - totalTax + lifeInsurance;
    const effectiveRate = netEstate > 0 ? (totalTax / netEstate) * 100 : 0;
    const insuranceImpact = lifeInsurance > 0;

    return { netEstate, taxableEstate, federalTax, stateTax, totalTax, netToHeirs, effectiveRate, insuranceImpact };
  }, [grossEstate, debts, lifeInsurance, state]);

  const noFederalTax = results.taxableEstate === 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inputs</h3>

          {[
            { label: "Gross Estate Value", value: grossEstate, set: setGrossEstate, min: 100000, max: 50000000, step: 100000, display: fmt(grossEstate) },
            { label: "Outstanding Debts", value: debts, set: setDebts, min: 0, max: 5000000, step: 10000, display: fmt(debts) },
            { label: "Existing Life Insurance", value: lifeInsurance, set: setLifeInsurance, min: 0, max: 10000000, step: 50000, display: fmt(lifeInsurance) },
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

          <div>
            <label className="text-sm text-gray-600 font-medium block mb-2">State</label>
            <select value={state} onChange={e => setState(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#1A4D3E]">
              {Object.entries(STATE_TAXES).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Estate Summary</h3>

          {[
            { label: "Gross Estate", value: fmt(grossEstate), color: "text-gray-700", bg: "bg-gray-50", border: "border-gray-200" },
            { label: "Minus Debts", value: `− ${fmt(debts)}`, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
            { label: "Net Estate", value: fmt(results.netEstate), color: "text-gray-800", bg: "bg-white", border: "border-gray-200", bold: true },
          ].map(({ label, value, color, bg, border, bold }) => (
            <div key={label} className={`flex justify-between items-center rounded-lg px-4 py-2.5 border ${bg} ${border}`}>
              <span className="text-sm text-gray-600">{label}</span>
              <span className={`text-sm ${bold ? "font-bold" : "font-medium"} ${color}`}>{value}</span>
            </div>
          ))}

          <div className="border-t border-dashed border-gray-200 my-1" />

          {noFederalTax ? (
            <div className="rounded-xl p-4 border border-emerald-200 bg-emerald-50">
              <p className="text-sm font-semibold" style={{ color: BRAND }}>✓ Below Federal Exemption</p>
              <p className="text-xs text-emerald-700 mt-1">Net estate is below the {fmt(FEDERAL_EXEMPTION)} federal exemption — no federal estate tax owed.</p>
            </div>
          ) : (
            <div className="rounded-xl p-4 border border-red-200 bg-red-50">
              <p className="text-sm font-semibold text-red-700">Federal Estate Tax: {fmt(results.federalTax)}</p>
              <p className="text-xs text-red-600 mt-1">40% on {fmt(results.taxableEstate)} above the exemption</p>
            </div>
          )}

          {results.stateTax > 0 && (
            <div className="rounded-xl p-4 border border-orange-200 bg-orange-50">
              <p className="text-sm font-semibold text-orange-700">State Estate Tax: {fmt(results.stateTax)}</p>
              <p className="text-xs text-orange-600 mt-1">{STATE_TAXES[state]?.label}</p>
            </div>
          )}

          <div className="rounded-xl p-4 border" style={{ borderColor: `${BRAND}40`, background: `${BRAND}08` }}>
            <p className="text-xs text-gray-500 mb-1">Net Estate to Heirs (after tax + insurance)</p>
            <p className="text-2xl font-bold" style={{ color: BRAND }}>{fmt(results.netToHeirs)}</p>
            {results.effectiveRate > 0 && (
              <p className="text-xs text-gray-500 mt-1">Effective tax rate: {results.effectiveRate.toFixed(1)}%</p>
            )}
            {results.insuranceImpact && (
              <p className="text-xs mt-1" style={{ color: BRAND }}>Includes {fmt(lifeInsurance)} life insurance benefit</p>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400">* Based on 2024 federal exemption of $13.61M. TCJA sunset may reduce this in 2026. State rates are simplified. Consult an estate attorney.</p>
    </div>
  );
}
