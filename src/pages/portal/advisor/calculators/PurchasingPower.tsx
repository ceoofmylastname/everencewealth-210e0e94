import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";

const BRAND = "#1A4D3E";
const fmt = (n: number) => "$" + Math.round(n).toLocaleString();

// Simplified CPI data (base year 1980 = 82.4, 2024 = ~314)
const CPI_DATA: Record<number, number> = {};
const baseYears = [1980,1985,1990,1995,2000,2005,2010,2015,2020,2025];
const baseValues = [82.4,107.6,130.7,152.4,172.2,195.3,218.1,237.0,258.8,315.0];
baseYears.forEach((y, i) => {
  CPI_DATA[y] = baseValues[i];
  if (i < baseYears.length - 1) {
    const nextY = baseYears[i + 1];
    const nextV = baseValues[i + 1];
    for (let j = 1; j < nextY - y; j++) {
      CPI_DATA[y + j] = baseValues[i] + (nextV - baseValues[i]) * (j / (nextY - y));
    }
  }
});

interface Props { onClose: () => void }

export default function PurchasingPower({ onClose }: Props) {
  const [amount, setAmount] = useState(1000);
  const [startYear, setStartYear] = useState(1990);
  const [endYear, setEndYear] = useState(2025);

  const results = useMemo(() => {
    const startCPI = CPI_DATA[startYear] || 130;
    const endCPI = CPI_DATA[endYear] || 315;
    const adjustedValue = amount * (endCPI / startCPI);
    const purchasingPower = amount * (startCPI / endCPI);
    const percentDecrease = ((1 - startCPI / endCPI) * 100);
    const dollarLoss = amount - purchasingPower;
    const inflationMultiple = endCPI / startCPI;
    const totalYears = endYear - startYear;
    const annualizedRate = totalYears > 0 ? (Math.pow(inflationMultiple, 1 / totalYears) - 1) * 100 : 0;

    const examples = [
      { item: "Gallon of Gas", old: 1.16, current: 3.50 },
      { item: "Movie Ticket", old: 4.25, current: 11.75 },
      { item: "Loaf of Bread", old: 0.70, current: 2.89 },
    ];

    return { adjustedValue, purchasingPower, percentDecrease, dollarLoss, inflationMultiple, annualizedRate, examples };
  }, [amount, startYear, endYear]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Inputs</h3>
          {[
            { label: "Dollar Amount", value: amount, set: setAmount, min: 100, max: 100000, step: 100, display: fmt(amount) },
            { label: "Start Year", value: startYear, set: setStartYear, min: 1980, max: 2020, step: 1, display: String(startYear) },
            { label: "End Year", value: endYear, set: setEndYear, min: 1985, max: 2025, step: 1, display: String(endYear) },
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
            <p className="text-xs text-gray-500">{fmt(amount)} from {startYear} is only worth today</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{fmt(results.purchasingPower)}</p>
            <p className="text-xs text-red-500 mt-0.5">Lost {results.percentDecrease.toFixed(1)}% of purchasing power</p>
          </div>

          <div className="rounded-xl p-4 border border-orange-200 bg-orange-50">
            <p className="text-xs text-gray-500">You'd need this much in {endYear} to match {fmt(amount)} in {startYear}</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{fmt(results.adjustedValue)}</p>
            <p className="text-xs text-orange-500 mt-0.5">{results.inflationMultiple.toFixed(2)}x inflation multiple</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 border" style={{ borderColor: `${BRAND}30`, background: `${BRAND}08` }}>
              <p className="text-xs text-gray-500">Dollar Loss</p>
              <p className="text-lg font-bold" style={{ color: BRAND }}>{fmt(results.dollarLoss)}</p>
            </div>
            <div className="rounded-xl p-3 border" style={{ borderColor: `${BRAND}30`, background: `${BRAND}08` }}>
              <p className="text-xs text-gray-500">Avg Annual Inflation</p>
              <p className="text-lg font-bold" style={{ color: BRAND }}>{results.annualizedRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Reality Check — Price Comparisons</h3>
        <div className="grid grid-cols-3 gap-3">
          {results.examples.map(ex => (
            <div key={ex.item} className="rounded-xl p-3 border border-gray-200 bg-white text-center">
              <p className="text-xs text-gray-500 font-medium">{ex.item}</p>
              <p className="text-sm text-gray-400 line-through mt-1">${ex.old.toFixed(2)}</p>
              <p className="text-lg font-bold text-gray-900">${ex.current.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400">* Based on approximate CPI data. Actual prices vary by region and product category.</p>
    </div>
  );
}
