import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  dark?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = false,
  dark = false,
}) => {
  return (
    <div
      className={cn(
        'relative rounded-2xl',
        dark
          ? 'bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
          : 'bg-white/[0.7] backdrop-blur-xl border border-white/[0.3] shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
        glow && 'hover:shadow-[0_8px_40px_hsla(43,74%,49%,0.15)] transition-shadow duration-500',
        className,
      )}
    >
      {glow && (
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
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
