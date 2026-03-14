import { useRef, useEffect, useState, useCallback } from "react";

interface DataPoint {
  year: number;
  value: number;
}

const SP500_DATA: DataPoint[] = [
  { year: 1999, value: 100000 },
  { year: 2000, value: 59880.41 },
  { year: 2002, value: 82480.21 },
  { year: 2004, value: 84954.62 },
  { year: 2006, value: 61468.66 },
  { year: 2007, value: 85580.91 },
  { year: 2008, value: 125786.28 },
  { year: 2009, value: 139090.51 },
  { year: 2010, value: 152359.74 },
  { year: 2012, value: 170594.45 },
  { year: 2014, value: 263961.83 },
  { year: 2016, value: 307071.03 },
  { year: 2018, value: 283383.18 },
  { year: 2020, value: 370000 },
  { year: 2025, value: 408888.23 },
];

const INDEXED_DATA: DataPoint[] = [
  { year: 1999, value: 100000 },
  { year: 2000, value: 100000 },
  { year: 2001, value: 100000 },
  { year: 2002, value: 100000 },
  { year: 2003, value: 100000 },
  { year: 2004, value: 122068.80 },
  { year: 2005, value: 140818.57 },
  { year: 2006, value: 145789.46 },
  { year: 2007, value: 182878.30 },
  { year: 2008, value: 229402.54 },
  { year: 2009, value: 255531.49 },
  { year: 2010, value: 313498.30 },
  { year: 2011, value: 344064.38 },
  { year: 2012, value: 344064.38 },
  { year: 2013, value: 431594.35 },
  { year: 2014, value: 483385.28 },
  { year: 2025, value: 541391.51 },
];

const MIN_YEAR = 1999;
const MAX_YEAR = 2025;
const MAX_VAL = 580000;
const PADDING = { top: 60, right: 40, bottom: 50, left: 85 };

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
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 1;
      for (let pct = 0; pct <= 1; pct += 0.2) {
        const y = PADDING.top + (1 - pct) * (h - PADDING.top - PADDING.bottom);
        ctx.beginPath();
        ctx.moveTo(PADDING.left, y);
        ctx.lineTo(w - PADDING.right, y);
        ctx.stroke();

        ctx.fillStyle = "#9CA3AF";
        ctx.font = "11px 'Geist Mono', monospace";
        ctx.textAlign = "right";
        ctx.fillText(`$${((pct * MAX_VAL) / 1000).toFixed(0)}k`, PADDING.left - 10, y + 4);
      }

      // Year labels
      ctx.textAlign = "center";
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "11px 'Geist Mono', monospace";
      for (const year of [2000, 2005, 2010, 2015, 2020, 2025]) {
        const x = PADDING.left + ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * (w - PADDING.left - PADDING.right);
        ctx.fillText(String(year), x, h - 10);
      }

      // Legend key
      const legendAlpha = Math.max(0, Math.min(1, t * 3));
      ctx.globalAlpha = legendAlpha;
      const legendX = PADDING.left + 8;
      const legendY = PADDING.top - 38;

      // Red legend
      ctx.fillStyle = RED;
      ctx.fillRect(legendX, legendY, 12, 12);
      ctx.fillStyle = "#374151";
      ctx.font = "bold 11px 'Geist Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText("S&P 500", legendX + 18, legendY + 10);

      // Green legend
      const greenLegendX = legendX + 110;
      ctx.fillStyle = GREEN;
      ctx.fillRect(greenLegendX, legendY, 12, 12);
      ctx.fillStyle = "#374151";
      ctx.fillText("S&P 500 Indexed 0% Guarantee 12% Cap", greenLegendX + 18, legendY + 10);

      ctx.globalAlpha = 1;

      // Draw gradient fill
      const drawGradientFill = (data: DataPoint[], color: string, pointsToShow: number) => {
        if (pointsToShow < 2) return;
        const gradient = ctx.createLinearGradient(0, PADDING.top, 0, chartBottom);
        gradient.addColorStop(0, color.replace("1)", "0.12)"));
        gradient.addColorStop(1, color.replace("1)", "0.01)"));
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

      // Draw line with labels
      const drawLine = (data: DataPoint[], color: string, lineWidth: number, showLabels: boolean, labelAboveDefault: boolean) => {
        const totalPoints = data.length;
        const pointsToShow = Math.ceil(t * totalPoints);
        if (pointsToShow < 2) return;

        // Gradient fill
        const gradientColor = color === RED ? "rgba(232, 112, 112, 1)" : "rgba(26, 77, 62, 1)";
        drawGradientFill(data, gradientColor, pointsToShow);

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

        // Dots and labels
        for (let i = 0; i < pointsToShow; i++) {
          const [x, y] = mapPoint(data[i], w, h);

          // Dot
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

          if (showLabels) {
            const label = formatDollar(data[i].value);
            const above = i % 2 === 0 ? labelAboveDefault : !labelAboveDefault;
            const labelY = above ? y - 14 : y + 18;

            const pointProgress = i / totalPoints;
            const labelAlpha = Math.max(0, Math.min(1, (t - pointProgress) * totalPoints * 0.5));
            ctx.globalAlpha = labelAlpha;

            // Background pill
            ctx.font = "bold 9px 'Geist Mono', monospace";
            const textWidth = ctx.measureText(label).width;
            const pillW = textWidth + 10;
            const pillH = 16;
            const pillX = x - pillW / 2;
            const pillY = labelY - pillH / 2;

            ctx.fillStyle = "rgba(255,255,255,0.92)";
            ctx.beginPath();
            ctx.roundRect(pillX, pillY, pillW, pillH, 4);
            ctx.fill();

            ctx.strokeStyle = "rgba(0,0,0,0.08)";
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.roundRect(pillX, pillY, pillW, pillH, 4);
            ctx.stroke();

            // Connector line
            ctx.strokeStyle = "rgba(0,0,0,0.12)";
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

            // Text
            ctx.fillStyle = color;
            ctx.textAlign = "center";
            ctx.fillText(label, x, labelY + 3);

            ctx.globalAlpha = 1;
          }
        }
      };

      // Draw S&P 500 first (red, labels below by default)
      drawLine(SP500_DATA, RED, 2.5, true, false);
      // Draw Indexed on top (green, labels above by default)
      drawLine(INDEXED_DATA, GREEN, 3, true, true);

      // End dot glow for indexed line
      if (t > 0.9) {
        const lastIdx = INDEXED_DATA.length - 1;
        const [lx, ly] = mapPoint(INDEXED_DATA[lastIdx], w, h);
        const glowAlpha = Math.min(1, (t - 0.9) * 10);

        const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, 12);
        glow.addColorStop(0, `rgba(26, 77, 62, ${0.3 * glowAlpha})`);
        glow.addColorStop(1, "rgba(26, 77, 62, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(lx, ly, 12, 0, Math.PI * 2);
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
    const duration = 2500;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
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
      style={{ width: "100%", height: "480px" }}
    />
  );
}
