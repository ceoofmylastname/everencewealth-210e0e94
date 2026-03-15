import { useState, useRef } from "react";
import { motion } from "framer-motion";

interface BarValue {
  value: number;
  color: string;
  label: string;
}

interface BarGroup {
  label: string;
  values: BarValue[];
}

interface SVGBarChartProps {
  data: BarGroup[];
  animate?: boolean;
  yFormatter?: (v: number) => string;
  className?: string;
  height?: number;
}

const PADDING = { top: 20, right: 20, bottom: 44, left: 70 };

export default function SVGBarChart({
  data,
  animate = false,
  yFormatter = (v) => `$${(v / 1000).toFixed(0)}k`,
  className = "",
  height = 300,
}: SVGBarChartProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; value: string; color: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 700;
  const H = height;
  const plotW = W - PADDING.left - PADDING.right;
  const plotH = H - PADDING.top - PADDING.bottom;

  const maxVal = Math.max(...data.flatMap((g) => g.values.map((v) => v.value))) * 1.1;
  const groupCount = data.length;
  const barsPerGroup = data[0]?.values.length || 1;
  const groupWidth = plotW / groupCount;
  const barWidth = Math.min((groupWidth * 0.7) / barsPerGroup, 48);
  const groupGap = (groupWidth - barWidth * barsPerGroup) / 2;

  const sy = (v: number) => PADDING.top + (1 - v / maxVal) * plotH;

  const gridLines = 4;
  const gridValues = Array.from({ length: gridLines + 1 }, (_, i) => (i * maxVal) / gridLines);

  return (
    <div className={className} style={{ position: "relative", width: "100%" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={height}
        style={{ overflow: "visible", borderRadius: "var(--radius-md)" }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Glass background */}
        <rect x={0} y={0} width={W} height={H} rx={20} fill="rgba(255,255,255,0.3)" />

        {/* Grid */}
        {gridValues.map((v, i) => (
          <g key={i}>
            <line x1={PADDING.left} y1={sy(v)} x2={W - PADDING.right} y2={sy(v)} stroke="rgba(0,0,0,0.06)" strokeWidth={1} />
            <text x={PADDING.left - 10} y={sy(v) + 4} textAnchor="end" fill="var(--ev-text-light)" fontSize={11} fontFamily="var(--font-mono)">
              {yFormatter(v)}
            </text>
          </g>
        ))}

        {/* Bars */}
        {data.map((group, gi) => {
          const groupX = PADDING.left + gi * groupWidth + groupGap;
          return (
            <g key={gi}>
              {group.values.map((bar, bi) => {
                const x = groupX + bi * barWidth;
                const barH = (bar.value / maxVal) * plotH;
                const y = PADDING.top + plotH - barH;

                return (
                  <motion.rect
                    key={bi}
                    x={x}
                    y={y}
                    width={barWidth - 2}
                    height={barH}
                    rx={8}
                    ry={8}
                    fill={bar.color}
                    fillOpacity={0.85}
                    initial={animate ? { scaleY: 0 } : undefined}
                    animate={animate ? { scaleY: 1 } : undefined}
                    transition={{ duration: 0.8, delay: gi * 0.15 + bi * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: `${x + barWidth / 2}px ${PADDING.top + plotH}px` }}
                    onMouseEnter={() =>
                      setTooltip({
                        x: x + barWidth / 2,
                        y: y - 8,
                        label: `${group.label} — ${bar.label}`,
                        value: yFormatter(bar.value),
                        color: bar.color,
                      })
                    }
                    onMouseLeave={() => setTooltip(null)}
                    cursor="pointer"
                  />
                );
              })}
              {/* Group label */}
              <text
                x={groupX + (barsPerGroup * barWidth) / 2}
                y={H - 8}
                textAnchor="middle"
                fill="var(--ev-text-light)"
                fontSize={12}
                fontFamily="var(--font-body)"
                fontWeight={500}
              >
                {group.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="ag-chart-tooltip"
          style={{
            left: `${(tooltip.x / W) * 100}%`,
            top: `${(tooltip.y / H) * 100}%`,
          }}
        >
          <div style={{ color: tooltip.color, fontWeight: 700, fontSize: 15 }}>{tooltip.value}</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>{tooltip.label}</div>
        </div>
      )}
    </div>
  );
}
