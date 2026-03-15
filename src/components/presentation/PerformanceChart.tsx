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
  { year: 2015, value: 263961.83 },
  { year: 2016, value: 313498.30 },
  { year: 2017, value: 344064.38 },
  { year: 2018, value: 307071.03 },
  { year: 2019, value: 431594.35 },
  { year: 2020, value: 283383.18 },
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
  { year: 2016, value: 497000 },
  { year: 2017, value: 505000 },
  { year: 2018, value: 510000 },
  { year: 2019, value: 518000 },
  { year: 2020, value: 525000 },
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
  onAnimationComplete?: () => void;
}

export default function PerformanceChart({ animate = false, className, onAnimationComplete }: PerformanceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const animRef = useRef<number>(0);
  const completeFiredRef = useRef(false);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, w * dpr, h * dpr);
      ctx.save();
      ctx.scale(dpr, dpr);

      const chartBottom = PADDING.top + (h - PADDING.top - PADDING.bottom);

      // Line progress finishes at t=0.7, highlight phase is 0.7–1.0
      const lineT = Math.min(t / 0.7, 1);
      const highlightT = Math.max(0, Math.min((t - 0.7) / 0.3, 1));

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
      const legendAlpha = Math.max(0, Math.min(1, lineT * 4));
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

      // Draw line
      const drawLine = (
        data: DataPoint[],
        color: string,
        colorRGB: string,
        lineWidth: number,
        labelAbove: boolean
      ) => {
        const totalPoints = data.length;
        const pointsToShow = Math.ceil(lineT * totalPoints);
        if (pointsToShow < 2) return;

        drawGradientFill(data, colorRGB, pointsToShow);

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
          const isLast = i === totalPoints - 1;

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, isLast && highlightT > 0 ? 3.5 + 2 * highlightT : 3.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "white";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, y, isLast && highlightT > 0 ? 3.5 + 2 * highlightT : 3.5, 0, Math.PI * 2);
          ctx.stroke();

          // Skip the last point label here — we draw it in the highlight phase
          if (isLast && highlightT > 0) continue;

          const label = formatDollar(data[i].value);
          const above = labelAbove ? (i % 2 === 0) : (i % 2 !== 0);
          const labelY = above ? y - 15 : y + 19;

          const pointProgress = i / totalPoints;
          const labelAlpha = Math.max(0, Math.min(1, (lineT - pointProgress) * totalPoints * 0.4));
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

      // === HIGHLIGHT PHASE: 2021 endpoints ===
      if (highlightT > 0) {
        const redLast = SP500_DATA[SP500_DATA.length - 1];
        const greenLast = INDEXED_DATA[INDEXED_DATA.length - 1];
        const [rx, ry] = mapPoint(redLast, w, h);
        const [gxp, gyp] = mapPoint(greenLast, w, h);

        // Oval encompassing both endpoints
        const cx = (rx + gxp) / 2;
        const cy = (ry + gyp) / 2;
        const radiusX = Math.abs(gxp - rx) / 2 + 35;
        const radiusY = Math.abs(gyp - ry) / 2 + 30;

        // Animated oval stroke
        ctx.save();
        ctx.globalAlpha = highlightT * 0.7;
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2 * highlightT);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Enlarged labels for 2021 values
        const drawHighlightLabel = (
          x: number, y: number, value: number, color: string, above: boolean
        ) => {
          const easeHL = 1 - Math.pow(1 - highlightT, 3);
          const fontSize = 8 + 5 * easeHL;
          const label = formatDollar(value);
          const labelY = above ? y - 18 - 6 * easeHL : y + 22 + 6 * easeHL;

          ctx.globalAlpha = highlightT;
          ctx.font = `bold ${fontSize}px 'Geist Mono', monospace`;
          const textWidth = ctx.measureText(label).width;
          const pillW = textWidth + 12;
          const pillH = fontSize + 8;
          const pillX = x - pillW / 2;
          const pillY = labelY - pillH / 2;

          // Shadow
          ctx.shadowColor = `rgba(0,0,0,${0.12 * easeHL})`;
          ctx.shadowBlur = 8 * easeHL;
          ctx.shadowOffsetY = 2;

          ctx.fillStyle = "rgba(255,255,255,0.97)";
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, 4);
          ctx.fill();

          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;

          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5 * easeHL;
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, 4);
          ctx.stroke();

          // Connector line
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.globalAlpha = highlightT * 0.6;
          ctx.beginPath();
          if (above) {
            ctx.moveTo(x, y - 7);
            ctx.lineTo(x, pillY + pillH);
          } else {
            ctx.moveTo(x, y + 7);
            ctx.lineTo(x, pillY);
          }
          ctx.stroke();

          ctx.globalAlpha = highlightT;
          ctx.fillStyle = color;
          ctx.textAlign = "center";
          ctx.fillText(label, x, labelY + fontSize * 0.3);
          ctx.globalAlpha = 1;
        };

        // Glow behind endpoints
        const drawGlow = (x: number, y: number, colorRGB: string) => {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, 18);
          glow.addColorStop(0, `rgba(${colorRGB}, ${0.35 * highlightT})`);
          glow.addColorStop(1, `rgba(${colorRGB}, 0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, 18, 0, Math.PI * 2);
          ctx.fill();
        };

        drawGlow(gxp, gyp, "26, 77, 62");
        drawGlow(rx, ry, "232, 112, 112");

        drawHighlightLabel(gxp, gyp, greenLast.value, GREEN, true);
        drawHighlightLabel(rx, ry, redLast.value, RED, false);
      }

      ctx.restore();
    },
    []
  );

  useEffect(() => {
    if (!animate) {
      setProgress(0);
      completeFiredRef.current = false;
      return;
    }
    const start = performance.now();
    const duration = 4500; // 3s lines + 1.5s highlight
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);
      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else if (!completeFiredRef.current) {
        completeFiredRef.current = true;
        // Hold the highlight for 1.5s then fire complete
        setTimeout(() => {
          onAnimationComplete?.();
        }, 1500);
      }
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate, onAnimationComplete]);

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