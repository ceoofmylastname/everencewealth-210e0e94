import { useState } from "react";
import { motion } from "framer-motion";

interface Segment {
  value: number;
  color: string;
  label: string;
}

interface SVGDoughnutChartProps {
  segments: Segment[];
  size?: number;
  centerText?: string;
  centerSubText?: string;
  animate?: boolean;
  className?: string;
  strokeWidth?: number;
}

export default function SVGDoughnutChart({
  segments,
  size = 240,
  centerText,
  centerSubText,
  animate = false,
  className = "",
  strokeWidth = 32,
}: SVGDoughnutChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativeOffset = 0;

  return (
    <div className={className} style={{ position: "relative", width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {/* Track */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth={strokeWidth} />

        {/* Segments */}
        {segments.map((seg, i) => {
          const segLength = (seg.value / total) * circumference;
          const offset = cumulativeOffset;
          cumulativeOffset += segLength;
          const isHovered = hovered === i;

          return (
            <motion.circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${segLength} ${circumference - segLength}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${center} ${center})`}
              initial={animate ? { strokeDasharray: `0 ${circumference}`, strokeDashoffset: -offset } : undefined}
              animate={animate ? { strokeDasharray: `${segLength} ${circumference - segLength}` } : undefined}
              transition={{ duration: 1, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ cursor: "pointer", filter: isHovered ? "brightness(1.1)" : undefined, transition: "stroke-width 0.2s ease" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              opacity={0.9}
            />
          );
        })}
      </svg>

      {/* Center text */}
      <div
        style={{
          position: "absolute",
          inset: strokeWidth,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        {hovered !== null ? (
          <>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 22, color: segments[hovered].color }}>
              {segments[hovered].value}%
            </span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ev-text-light)", marginTop: 2 }}>
              {segments[hovered].label}
            </span>
          </>
        ) : (
          <>
            {centerText && (
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 24, color: "var(--ev-green)" }}>
                {centerText}
              </span>
            )}
            {centerSubText && (
              <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--ev-text-light)", marginTop: 2 }}>
                {centerSubText}
              </span>
            )}
          </>
        )}
      </div>

      {/* Tooltip on hover */}
      {hovered !== null && (
        <div
          className="ag-chart-tooltip"
          style={{
            left: "50%",
            top: -8,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div style={{ color: segments[hovered].color, fontWeight: 700 }}>{segments[hovered].label}</div>
          <div style={{ fontSize: 13 }}>{segments[hovered].value}%</div>
        </div>
      )}
    </div>
  );
}
