import { useEffect, useState } from "react";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface CountingNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export default function CountingNumber({
  value,
  duration = 1.2,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: CountingNumberProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;

    const startTime = performance.now();
    const durationMs = duration * 1000;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // easeOut curve
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplay(value);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, value, duration]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString();

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
