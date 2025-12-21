import { useState, useEffect, useRef } from 'react';

interface CountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  onComplete?: () => void;
}

export const useCountUp = ({
  start = 0,
  end,
  duration = 2000,
  delay = 0,
  decimals = 0,
  suffix = '',
  prefix = '',
  onComplete
}: CountUpOptions) => {
  const [count, setCount] = useState(start);
  const [isComplete, setIsComplete] = useState(false);
  const countRef = useRef(start);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const easeOutExpo = (t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutExpo(progress);
    
    const currentValue = start + (end - start) * easedProgress;
    countRef.current = currentValue;
    setCount(Number(currentValue.toFixed(decimals)));

    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      setCount(end);
      setIsComplete(true);
      onComplete?.();
    }
  };

  const startAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    startTimeRef.current = null;
    setCount(start);
    setIsComplete(false);
    
    setTimeout(() => {
      animationFrameRef.current = requestAnimationFrame(animate);
    }, delay);
  };

  const reset = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setCount(start);
    setIsComplete(false);
    startTimeRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const formattedValue = `${prefix}${count}${suffix}`;

  return { count, formattedValue, isComplete, startAnimation, reset };
};

// Component for animated counter with intersection observer
export const useAnimatedCounter = (
  value: string | number,
  options: Partial<CountUpOptions> = {}
) => {
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Parse the value - handle ranges like "3-6" and numbers with suffixes like "15+"
  const parseValue = (val: string | number): { end: number; suffix: string; isRange: boolean; rangeEnd?: number } => {
    if (typeof val === 'number') {
      return { end: val, suffix: '', isRange: false };
    }
    
    const rangeMatch = val.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      return { 
        end: parseInt(rangeMatch[1]), 
        suffix: `-${rangeMatch[2]}`, 
        isRange: true,
        rangeEnd: parseInt(rangeMatch[2])
      };
    }
    
    const numberMatch = val.match(/^(\d+)(.*)$/);
    if (numberMatch) {
      return { end: parseInt(numberMatch[1]), suffix: numberMatch[2] || '', isRange: false };
    }
    
    return { end: 0, suffix: val, isRange: false };
  };

  const parsed = parseValue(value);
  
  const counter = useCountUp({
    end: parsed.end,
    suffix: parsed.suffix,
    duration: options.duration || 2000,
    delay: options.delay || 0,
    ...options
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
            counter.startAnimation();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  return { ...counter, elementRef, hasStarted };
};

export default useCountUp;
