import { useRef, useEffect, useState, useCallback } from "react";

interface DataPoint {
  year: number;
  value: number;
}

const SP500_DATA: DataPoint[] = [
  { year: 1999, value: 50000 }, { year: 2000, value: 59880 }, { year: 2002, value: 38000 },
  { year: 2004, value: 55000 }, { year: 2007, value: 80000 }, { year: 2008, value: 61468 },
  { year: 2010, value: 72000 }, { year: 2013, value: 130000 }, { year: 2016, value: 160000 },
  { year: 2018, value: 200000 }, { year: 2020, value: 170000 }, { year: 2022, value: 280000 },
  { year: 2025, value: 408888 },
];

const INDEXED_DATA: DataPoint[] = [
  { year: 1999, value: 50000 }, { year: 2000, value: 56000 }, { year: 2002, value: 56000 },
  { year: 2004, value: 70000 }, { year: 2007, value: 100000 }, { year: 2008, value: 100000 },
  { year: 2010, value: 112000 }, { year: 2013, value: 180000 }, { year: 2016, value: 240000 },
  { year: 2018, value: 300000 }, { year: 2020, value: 300000 }, { year: 2022, value: 420000 },
  { year: 2025, value: 541391 },
];

const MIN_YEAR = 1999;
const MAX_YEAR = 2025;
const MAX_VAL = 600000;
const PADDING = { top: 30, right: 30, bottom: 40, left: 70 };

function mapPoint(p: DataPoint, w: number, h: number): [number, number] {
  const x = PADDING.left + ((p.year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * (w - PADDING.left - PADDING.right);
  const y = PADDING.top + (1 - p.value / MAX_VAL) * (h - PADDING.top - PADDING.bottom);
  return [x, y];
}

interface PerformanceChartProps {
  /** Whether to start the drawing animation */
  animate?: boolean;
  className?: string;
}

export default function PerformanceChart({ animate = false, className }: PerformanceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const animRef = useRef<number>(0);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, w * dpr, h * dpr);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Grid lines
      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 1;
      for (let pct = 0; pct <= 1; pct += 0.25) {
        const y = PADDING.top + (1 - pct) * (h - PADDING.top - PADDING.bottom);
        ctx.beginPath();
        ctx.moveTo(PADDING.left, y);
        ctx.lineTo(w - PADDING.right, y);
        ctx.stroke();

        // Labels
        ctx.fillStyle = "#9CA3AF";
        ctx.font = "11px 'Geist Mono', monospace";
        ctx.textAlign = "right";
        ctx.fillText(`$${((pct * MAX_VAL) / 1000).toFixed(0)}k`, PADDING.left - 8, y + 4);
      }

      // Year labels
      ctx.textAlign = "center";
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "11px 'Geist Mono', monospace";
      for (const year of [2000, 2005, 2010, 2015, 2020, 2025]) {
        const x = PADDING.left + ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * (w - PADDING.left - PADDING.right);
        ctx.fillText(String(year), x, h - 8);
      }

      // Draw line with progress
      const drawLine = (data: DataPoint[], color: string, lineWidth: number) => {
        const totalPoints = data.length;
        const pointsToShow = Math.ceil(t * totalPoints);
        if (pointsToShow < 2) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();

        for (let i = 0; i < pointsToShow; i++) {
          const [x, y] = mapPoint(data[i], w, h);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // End dot
        if (pointsToShow >= 2) {
          const lastIdx = Math.min(pointsToShow - 1, data.length - 1);
          const [lx, ly] = mapPoint(data[lastIdx], w, h);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(lx, ly, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      drawLine(SP500_DATA, "#E87070", 2.5);
      drawLine(INDEXED_DATA, "#1A4D3E", 3);

      ctx.restore();
    },
    []
  );

  useEffect(() => {
    if (!animate) {
      setProgress(0);
      return;
    }

    const start = performance.now();
    const duration = 2000;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);
      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      }
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    draw(ctx, rect.width, rect.height, progress);
  }, [progress, draw]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "350px" }}
    />
  );
}
