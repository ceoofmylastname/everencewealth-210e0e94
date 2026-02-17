import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  dark?: boolean;
  tilt?: boolean;
  depth?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = false,
  dark = false,
  tilt = false,
  depth = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!tilt || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`);
  };

  const handleMouseLeave = () => {
    if (tilt) setTransform('');
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative rounded-2xl transition-all duration-300',
        dark
          ? 'bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
          : 'bg-white/[0.7] backdrop-blur-xl border border-white/[0.3] shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
        depth && 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]',
        glow && 'hover:shadow-[0_8px_40px_hsla(43,74%,49%,0.15)]',
        className,
      )}
      style={{ transform, transition: tilt ? 'transform 0.15s ease-out' : undefined }}
    >
      {glow && (
        <div
          className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, hsla(43,74%,49%,0.08) 0%, transparent 50%, hsla(160,48%,21%,0.05) 100%)',
          }}
        />
      )}
      {children}
    </div>
  );
};
