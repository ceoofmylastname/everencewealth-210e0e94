import React, { useState, useEffect } from 'react';

export const Hero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-dark-bg">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,_hsla(160,48%,21%,0.15),_transparent_70%)]" />

      {/* Decorative side text - xl only */}
      <div className="hidden xl:block absolute left-8 top-1/2 -translate-y-1/2 z-10">
        <p
          className={`text-[10px] font-space font-bold tracking-[0.4em] uppercase text-white/20 [writing-mode:vertical-lr] rotate-180 transition-all duration-1000 delay-700 ${
            isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          }`}
        >
          Wealth Architecture
        </p>
      </div>
      <div className="hidden xl:block absolute right-8 top-1/2 -translate-y-1/2 z-10">
        <p
          className={`text-[10px] font-space font-bold tracking-[0.4em] uppercase text-white/20 [writing-mode:vertical-lr] transition-all duration-1000 delay-700 ${
            isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          }`}
        >
          Strategic Fiduciary
        </p>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-24 md:pt-32 pb-32 md:pb-40">
        {/* Stacked typography */}
        <div className="space-y-0 leading-none">
          <h1
            className={`font-space font-bold uppercase tracking-tight transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="block text-[7vw] md:text-[5vw] lg:text-[4vw] text-white/90">
              BRIDGE the
            </span>
            <span
              className="block text-[12vw] md:text-[9vw] lg:text-[7vw] bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_auto] animate-text-gradient bg-clip-text text-transparent hero-glow"
              style={{ transitionDelay: '200ms' }}
            >
              RETIREMENT
            </span>
            <span
              className={`block text-[14vw] md:text-[10vw] lg:text-[8vw] text-outline transition-all duration-1000 delay-300 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              GAP
            </span>
          </h1>
        </div>

        {/* Subline */}
        <p
          className={`mt-8 text-white/50 font-space text-sm md:text-base tracking-[0.15em] uppercase max-w-xl mx-auto transition-all duration-1000 delay-500 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Tax-efficient wealth strategies · Fiduciary guidance · Zero Wall Street games
        </p>
      </div>

      {/* Bottom tactical HUD panel */}
      <div
        className={`absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-2xl transition-all duration-1000 delay-700 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="glass-card rounded-2xl px-6 py-4 md:px-8 md:py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-white/40 text-[10px] font-space tracking-[0.2em] uppercase">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              System Active
            </span>
            <span className="hidden md:inline">Independent Fiduciary</span>
            <span className="hidden md:inline">75+ Carriers</span>
          </div>
          <a
            href="/assessment"
            className="px-6 py-2.5 bg-primary text-primary-foreground font-space font-semibold text-xs tracking-[0.15em] uppercase rounded-xl hover:bg-primary/90 transition-colors"
          >
            Start Assessment
          </a>
        </div>
      </div>
    </section>
  );
};
