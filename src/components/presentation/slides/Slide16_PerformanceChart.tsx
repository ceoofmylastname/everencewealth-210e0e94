import { motion } from "framer-motion";
import { slideInLeft, fadeUp, explodeIn, dropIn, staggerContainer } from "../animations/variants";
import GradientText from "../animations/GradientText";
import CountingNumber from "../animations/CountingNumber";

// Simplified data points for the chart
const sp500Points = [
  { year: 1999, value: 50000 }, { year: 2000, value: 59880 }, { year: 2002, value: 38000 },
  { year: 2004, value: 55000 }, { year: 2007, value: 80000 }, { year: 2008, value: 61468 },
  { year: 2010, value: 72000 }, { year: 2013, value: 130000 }, { year: 2016, value: 160000 },
  { year: 2018, value: 200000 }, { year: 2020, value: 170000 }, { year: 2022, value: 280000 },
  { year: 2025, value: 408888 },
];

const indexedPoints = [
  { year: 1999, value: 50000 }, { year: 2000, value: 56000 }, { year: 2002, value: 56000 },
  { year: 2004, value: 70000 }, { year: 2007, value: 100000 }, { year: 2008, value: 100000 },
  { year: 2010, value: 112000 }, { year: 2013, value: 180000 }, { year: 2016, value: 240000 },
  { year: 2018, value: 300000 }, { year: 2020, value: 300000 }, { year: 2022, value: 420000 },
  { year: 2025, value: 541391 },
];

function pointsToPath(points: typeof sp500Points, maxVal: number, width: number, height: number) {
  const minYear = 1999;
  const maxYear = 2025;
  return points
    .map((p, i) => {
      const x = ((p.year - minYear) / (maxYear - minYear)) * width;
      const y = height - (p.value / maxVal) * height;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export default function Slide16_PerformanceChart() {
  const maxVal = 600000;
  const chartW = 900;
  const chartH = 350;

  return (
    <div className="antigravity-slide bg-white">
      <motion.div
        className="antigravity-slide-inner"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={slideInLeft} className="mb-6">
          <h2 className="text-3xl font-bold" style={{ color: "#1A4D3E" }}>
            How <GradientText>Strategy</GradientText> Impacts Performance
          </h2>
        </motion.div>

        {/* Chart */}
        <motion.div variants={fadeUp} className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartW} ${chartH + 40}`} className="w-full max-w-4xl mx-auto">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
              <g key={i}>
                <line
                  x1={0} y1={chartH - pct * chartH}
                  x2={chartW} y2={chartH - pct * chartH}
                  stroke="#E5E7EB" strokeWidth={1}
                />
                <text x={-5} y={chartH - pct * chartH + 4} fontSize={10} fill="#9CA3AF" textAnchor="end">
                  ${(pct * maxVal / 1000).toFixed(0)}k
                </text>
              </g>
            ))}

            {/* Year labels */}
            {[1999, 2005, 2010, 2015, 2020, 2025].map((year) => {
              const x = ((year - 1999) / 26) * chartW;
              return (
                <text key={year} x={x} y={chartH + 20} fontSize={11} fill="#9CA3AF" textAnchor="middle">
                  {year}
                </text>
              );
            })}

            {/* S&P 500 line (red) */}
            <path
              d={pointsToPath(sp500Points, maxVal, chartW, chartH)}
              fill="none" stroke="#E87070" strokeWidth={2.5}
              className="antigravity-chart-line"
            />

            {/* Indexed line (green) */}
            <path
              d={pointsToPath(indexedPoints, maxVal, chartW, chartH)}
              fill="none" stroke="#1A4D3E" strokeWidth={3}
              className="antigravity-chart-line"
              style={{ animationDelay: "0.5s" }}
            />
          </svg>
        </motion.div>

        {/* Legend + Results */}
        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-6 mt-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded" style={{ background: "#E87070" }} />
            <span className="text-sm" style={{ color: "#4A5565" }}>S&P 500 Direct</span>
            <span className="text-sm font-bold" style={{ color: "#E87070" }}>
              <CountingNumber value={408888} prefix="$" />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded" style={{ background: "#1A4D3E" }} />
            <span className="text-sm" style={{ color: "#4A5565" }}>S&P 500 Indexed — 0% / 12% Cap</span>
            <motion.span variants={explodeIn} className="text-sm font-bold" style={{ color: "#1A4D3E" }}>
              <CountingNumber value={541391} prefix="$" />
            </motion.span>
          </div>
        </motion.div>

        <motion.div variants={dropIn} className="flex justify-center">
          <div className="antigravity-pill-gold text-sm font-bold px-5 py-2">
            +$132,503 MORE — Protected Strategy
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
