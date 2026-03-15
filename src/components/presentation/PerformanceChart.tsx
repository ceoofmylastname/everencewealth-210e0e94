import { useRef, useEffect, useState, useCallback } from "react";

interface DataPoint {
  year: number;
  value: number;
}

const SP500_DATA: DataPoint[] = [
  { year: 1999, value: 100000 },
  { year: 2000, value: 59880.41 },
  { year: 2001, value: 82480.21 },
  { year: 2002, value: 61468.66 },
  { year: 2004, value: 84954.62 },
  { year: 2005, value: 85580.91 },
  { year: 2008, value: 125786.28 },
  { year: 2009, value: 139090.51 },
  { year: 2011, value: 152359.74 },
  { year: 2012, value: 170594.45 },
  { year: 2013, value: 263961.83 },
  { year: 2014, value: 313498.30 },
  { year: 2015, value: 307071.03 },
  { year: 2019, value: 283383.18 },
  { year: 2020, value: 408888.23 },
  { year: 2021, value: 408888.23 },
];

const INDEXED_DATA: DataPoint[] = [
  { year: 1999, value: 100000 },
  { year: 2003, value: 122068.80 },
  { year: 2004, value: 140818.57 },
  { year: 2006, value: 145789.46 },
  { year: 2007, value: 182878.30 },
  { year: 2009, value: 229402.54 },
  { year: 2010, value: 255531.49 },
  { year: 2012, value: 313498.30 },
  { year: 2013, value: 344064.38 },
  { year: 2014, value: 431594.35 },
  { year: 2015, value: 483385.28 },
  { year: 2021, value: 541391.51 },
];

const MIN_YEAR = 1999;
const MAX_YEAR = 2021;
const MAX_VAL = 580000;
const PADDING = { top: 65, right: 50, bottom: 55, left: 90 };

const RED = "#E87070";
const GREEN = "#1A4D3E";

function mapPoint(p: DataPoint, w: number, h: number): [number, number] {
  const x = PADDING.left + ((p.year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * (w - PADDING.left - PADDING.right);
  const y = PADDING.top + (1 - p.value / MAX_VAL) * (h - PADDING.top - PADDING.bottom);
  return [x, y];
}

function formatDollar(v: number): string {
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface PerformanceChartProps {
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

      const chartBottom = PADDING.top + (h - PADDING.top - PADDING.bottom);

      // Grid lines
      const ySteps = [0, 50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000, 550000, 580000];
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 1;
      for (const val of ySteps) {
        const pct = val / MAX_VAL;
        const y = PADDING.top + (1 - pct) * (h - PADDING.top - PADDING.bottom);
        ctx.beginPath();
        ctx.moveTo(PADDING.left, y);
        ctx.lineTo(w - PADDING.right, y);
        ctx.stroke();

        ctx.fillStyle = "#9CA3AF";
        ctx.font = "10px 'Geist Mono', monospace";
        ctx.textAlign = "right";
        ctx.fillText(`$${(val / 1000).toFixed(0)},000`, PADDING.left - 8, y + 4);
      }

      // X-axis labels
      ctx.textAlign = "center";
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "9px 'Geist Mono', monospace";
      for (let yr = MIN_YEAR; yr <= MAX_YEAR; yr++) {
        const x = PADDING.left + ((yr - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * (w - PADDING.left - PADDING.right);
        ctx.fillText(String(yr), x, h - 8);
        ctx.strokeStyle = "rgba(0,0,0,0.08)";
        ctx.beginPath();
        ctx.moveTo(x, chartBottom);
        ctx.lineTo(x, chartBottom + 5);
        ctx.stroke();
      }

      // Legend
      const legendAlpha = Math.max(0, Math.min(1, t * 4));
      ctx.globalAlpha = legendAlpha;
      const lx = PADDING.left + 4;
      const ly = PADDING.top - 46;
      ctx.fillStyle = RED;
      ctx.fillRect(lx, ly, 14, 10);
      ctx.fillStyle = "#374151";
      ctx.font = "bold 11px 'Geist Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText("S&P 500", lx + 20, ly + 9);
      const gx = lx + 120;
      ctx.fillStyle = GREEN;
      ctx.fillRect(gx, ly, 14, 10);
      ctx.fillStyle = "#374151";
      ctx.fillText("S&P 500 Indexed 0% Guarantee 12% Cap", gx + 20, ly + 9);
      ctx.globalAlpha = 1;

      // Gradient fill
      const drawGradientFill = (data: DataPoint[], colorRGB: string, pointsToShow: number) => {
        if (pointsToShow < 2) return;
        const gradient = ctx.createLinearGradient(0, PADDING.top, 0, chartBottom);
        gradient.addColorStop(0, `rgba(${colorRGB}, 0.10)`);
        gradient.addColorStop(1, `rgba(${colorRGB}, 0.01)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        const [sx, sy] = mapPoint(data[0], w, h);
        ctx.moveTo(sx, sy);
        for (let i = 1; i < pointsToShow; i++) {
          const [x, y] = mapPoint(data[i], w, h);
          ctx.lineTo(x, y);
        }
        const [lastX] = mapPoint(data[pointsToShow - 1], w, h);
        ctx.lineTo(lastX, chartBottom);
        ctx.lineTo(sx, chartBottom);
        ctx.closePath();
        ctx.fill();
      };

      // Draw line — every point is a key/labeled point
      const drawLine = (
        data: DataPoint[],
        color: string,
        colorRGB: string,
        lineWidth: number,
        labelAbove: boolean
      ) => {
        const totalPoints = data.length;
        const pointsToShow = Math.ceil(t * totalPoints);
        if (pointsToShow < 2) return;

        drawGradientFill(data, colorRGB, pointsToShow);

        // Straight line segments
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = "miter";
        ctx.lineCap = "butt";
        ctx.beginPath();
        for (let i = 0; i < pointsToShow; i++) {
          const [x, y] = mapPoint(data[i], w, h);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Dots + labels on every point
        for (let i = 0; i < pointsToShow; i++) {
          const [x, y] = mapPoint(data[i], w, h);

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // White ring
          ctx.strokeStyle = "white";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, y, 3.5, 0, Math.PI * 2);
          ctx.stroke();

          // Label
          const label = formatDollar(data[i].value);
          const above = labelAbove ? (i % 2 === 0) : (i % 2 !== 0);
          const labelY = above ? y - 15 : y + 19;

          const pointProgress = i / totalPoints;
          const labelAlpha = Math.max(0, Math.min(1, (t - pointProgress) * totalPoints * 0.4));
          ctx.globalAlpha = labelAlpha;

          ctx.font = "bold 8px 'Geist Mono', monospace";
          const textWidth = ctx.measureText(label).width;
          const pillW = textWidth + 8;
          const pillH = 14;
          const pillX = x - pillW / 2;
          const pillY = labelY - pillH / 2;

          ctx.fillStyle = "rgba(255,255,255,0.93)";
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, 3);
          ctx.fill();

          ctx.strokeStyle = "rgba(0,0,0,0.08)";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, 3);
          ctx.stroke();

          ctx.strokeStyle = "rgba(0,0,0,0.15)";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          if (above) {
            ctx.moveTo(x, y - 5);
            ctx.lineTo(x, pillY + pillH);
          } else {
            ctx.moveTo(x, y + 5);
            ctx.lineTo(x, pillY);
          }
          ctx.stroke();

          ctx.fillStyle = color;
          ctx.textAlign = "center";
          ctx.fillText(label, x, labelY + 3);
          ctx.globalAlpha = 1;
        }
      };

      drawLine(SP500_DATA, RED, "232,112,112", 2.5, false);
      drawLine(INDEXED_DATA, GREEN, "26,77,62", 3, true);

      // End glow on indexed
      if (t > 0.9) {
        const lastIdx = INDEXED_DATA.length - 1;
        const [lx2, ly2] = mapPoint(INDEXED_DATA[lastIdx], w, h);
        const glowAlpha = Math.min(1, (t - 0.9) * 10);
        const glow = ctx.createRadialGradient(lx2, ly2, 0, lx2, ly2, 14);
        glow.addColorStop(0, `rgba(26, 77, 62, ${0.3 * glowAlpha})`);
        glow.addColorStop(1, "rgba(26, 77, 62, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(lx2, ly2, 14, 0, Math.PI * 2);
        ctx.fill();
      }

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
    const duration = 3000;
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);
      if (t < 1) animRef.current = requestAnimationFrame(tick);
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
      style={{ width: "100%", height: "520px" }}
    />
  );
}