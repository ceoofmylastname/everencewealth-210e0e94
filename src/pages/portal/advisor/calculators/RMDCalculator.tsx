import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Slider } from "@/components/ui/slider";

const BRAND = "#1A4D3E";
const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

// IRS Uniform Lifetime Table (simplified — key ages)
const ULT: Record<number, number> = {
  72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0,
  79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0,
  86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8,
  93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4,
};

function getDistributionPeriod(age: number): number {
  if (age < 72) return 0; // No RMD before 73 (SECURE 2.0)
  return ULT[Math.min(age, 100)] ?? 6.4;
}

interface Props { onClose: () => void }

export default function RMDCalculator({ onClose }: Props) {
  const [age, setAge] = useState(73);
  const [balance, setBalance] = useState(500000);
  const [accountType, setAccountType] = useState<"IRA" | "401k">("IRA");
  const [growthRate, setGrowthRate] = useState(5);

  const results = useMemo(() => {
    const period = getDistributionPeriod(age);
    const thisYearRMD = period > 0 ? balance / period : 0;

    const schedule = Array.from({ length: 10 }, (_, i) => {
      const yr = age + i;
      const p = getDistributionPeriod(yr);
      let bal = balance;
      for (let j = 0; j < i; j++) {
        const prevAge = age + j;
        const prevP = getDistributionPeriod(prevAge);
        const rmd = prevP > 0 ? bal / prevP : 0;
        bal = (bal - rmd) * (1 + growthRate / 100);
      }
      const rmd = p > 0 ? bal / p : 0;
      return { year: `Age ${yr}`, RMD: Math.round(rmd), Balance: Math.round(bal) };
    });

    return { thisYearRMD, period, schedule };
  }, [age, balance, growthRate]);

  const tooYoung = age < 73;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inputs</h3>

          <div>
            <p className="text-sm text-gray-600 font-medium mb-2">Account Type</p>
            <div className="flex gap-2">
              {(["IRA", "401k"] as const).map(t => (
                <button key={t} onClick={() => setAccountType(t)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold border transition-all"
                  style={{
                    background: accountType === t ? BRAND : "white",
                    color: accountType === t ? "white" : "#374151",
                    borderColor: accountType === t ? BRAND : "#E5E7EB",
                  }}>
                  {t === "401k" ? "401(k)" : "Traditional IRA"}
                </button>
              ))}
            </div>
          </div>

          {[
            { label: "Your Age", value: age, set: setAge, min: 65, max: 95, step: 1, display: `${age} yrs` },
            { label: "Account Balance", value: balance, set: setBalance, min: 10000, max: 5000000, step: 10000, display: fmt(balance) },
            { label: "Expected Growth Rate", value: growthRate, set: setGrowthRate, min: 0, max: 10, step: 0.5, display: `${growthRate}%` },
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

          {tooYoung ? (
            <div className="rounded-xl p-4 border border-blue-200 bg-blue-50">
              <p className="text-sm font-semibold text-blue-700">No RMD Required Yet</p>
              <p className="text-xs text-blue-600 mt-1">Under SECURE 2.0, RMDs start at age 73. You have {73 - age} years before your first RMD.</p>
            </div>
          ) : (
            <div className="rounded-xl p-4 border" style={{ borderColor: `${BRAND}30`, background: `${BRAND}08` }}>
              <p className="text-xs text-gray-500">This Year's Required Minimum Distribution</p>
              <p className="text-3xl font-bold mt-1" style={{ color: BRAND }}>{fmt(results.thisYearRMD)}</p>
              <p className="text-xs text-gray-400 mt-1">Distribution period: {results.period} years</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">10-Year RMD Projection</h3>

          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={results.schedule} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="year" tick={{ fontSize: 9 }} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Bar dataKey="RMD" fill={BRAND} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Account Balance Projection</h3>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={results.schedule} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="year" tick={{ fontSize: 9 }} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Line type="monotone" dataKey="Balance" stroke={BRAND} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="text-xs text-gray-400">* Based on IRS Uniform Lifetime Table. SECURE 2.0 Act: RMDs begin at age 73. This is an estimate only — consult a tax professional.</p>
    </div>
  );
}
