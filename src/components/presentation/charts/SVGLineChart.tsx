import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";

interface DataPoint {
  x: number;
  y: number;
}

interface Dataset {
  data: DataPoint[];
  color: string;
  label: string;
}

interface SVGLineChartProps {
  datasets: Dataset[];
  animate?: boolean;
  xLabels?: string[];
  yFormatter?: (v: number) => string;
  className?: string;
  height?: number;
}

const PADDING = { top: 30, right: 40, bottom: 44, left: 80 };

export default function SVGLineChart({
  datasets,
  animate = false,
  xLabels,
  yFormatter = (v) => `$${(v / 1000).toFixed(0)}k`,
  className = "",
  height = 350,
}: SVGLineChartProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; value: string; color: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { xMin, xMax, yMin, yMax } = useMemo(() => {
    const allPoints = datasets.flatMap((d) => d.data);
    return {
      xMin: Math.min(...allPoints.map((p) => p.x)),
      xMax: Math.max(...allPoints.map((p) => p.x)),
      yMin: 0,
      yMax: Math.max(...allPoints.map((p) => p.y)) * 1.1,
    };
  }, [datasets]);

  const W = 800;
  const H = height;
  const plotW = W - PADDING.left - PADDING.right;
  const plotH = H - PADDING.top - PADDING.bottom;

  const sx = (x: number) => PADDING.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const sy = (y: number) => PADDING.top + (1 - (y - yMin) / (yMax - yMin)) * plotH;

  const buildPath = (data: DataPoint[]) => {
    return data.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
  };

  const gridLines = 5;
  const gridValues = Array.from({ length: gridLines + 1 }, (_, i) => yMin + (i * (yMax - yMin)) / gridLines);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * W;

    let closest: { dist: number; px: number; py: number; label: string; value: string; color: string } | null = null;

    for (const ds of datasets) {
      for (const p of ds.data) {
        const px = sx(p.x);
        const py = sy(p.y);
        const dist = Math.abs(mouseX - px);
        if (dist < 30 && (!closest || dist < closest.dist)) {
          closest = { dist, px, py, label: `${ds.label} (${p.x})`, value: yFormatter(p.y), color: ds.color };
        }
      }
    }

    setTooltip(closest ? { x: closest.px, y: closest.py, label: closest.label, value: closest.value, color: closest.color } : null);
  };

  return (
    <div className={className} style={{ position: "relative", width: "100%" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={height}
        style={{ overflow: "visible", borderRadius: "var(--radius-md)" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Glass background */}
        <rect x={0} y={0} width={W} height={H} rx={20} fill="rgba(255,255,255,0.3)" />

        {/* Grid lines */}
        {gridValues.map((v, i) => (
          <g key={i}>
            <line
              x1={PADDING.left}
              y1={sy(v)}
              x2={W - PADDING.right}
              y2={sy(v)}
              stroke="rgba(0,0,0,0.06)"
              strokeWidth={1}
            />
            <text x={PADDING.left - 10} y={sy(v) + 4} textAnchor="end" fill="var(--ev-text-light)" fontSize={11} fontFamily="var(--font-mono)">
              {yFormatter(v)}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {(xLabels || datasets[0]?.data.map((p) => String(p.x)))?.map((label, i, arr) => {
          const x = PADDING.left + (i / (arr.length - 1)) * plotW;
          return (
            <text key={i} x={x} y={H - 8} textAnchor="middle" fill="var(--ev-text-light)" fontSize={11} fontFamily="var(--font-mono)">
              {label}
            </text>
          );
        })}

        {/* Data lines */}
        {datasets.map((ds, di) => {
          const path = buildPath(ds.data);
          const pathLength = ds.data.length * 120;

          return (
            <g key={di}>
              <motion.path
                d={path}
                fill="none"
                stroke={ds.color}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={animate ? { strokeDasharray: pathLength, strokeDashoffset: pathLength } : undefined}
                animate={animate ? { strokeDashoffset: 0 } : undefined}
                transition={{ duration: 2, ease: "easeOut", delay: di * 0.3 }}
              />
              {/* End dot */}
              {ds.data.length > 0 && (
                <motion.circle
                  cx={sx(ds.data[ds.data.length - 1].x)}
                  cy={sy(ds.data[ds.data.length - 1].y)}
                  r={5}
                  fill={ds.color}
                  initial={animate ? { opacity: 0, scale: 0 } : undefined}
                  animate={animate ? { opacity: 1, scale: 1 } : undefined}
                  transition={{ duration: 0.4, delay: 2 + di * 0.3 }}
                />
              )}
            </g>
          );
        })}

        {/* Tooltip crosshair */}
        {tooltip && (
          <>
            <line x1={tooltip.x} y1={PADDING.top} x2={tooltip.x} y2={H - PADDING.bottom} stroke="rgba(0,0,0,0.1)" strokeWidth={1} strokeDasharray="4 4" />
            <circle cx={tooltip.x} cy={tooltip.y} r={6} fill="white" stroke={tooltip.color} strokeWidth={2.5} />
          </>
        )}
      </svg>

      {/* Tooltip popup */}
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
