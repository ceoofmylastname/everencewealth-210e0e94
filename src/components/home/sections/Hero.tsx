import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTranslation } from '../../../i18n';

export const Hero: React.FC = () => {
  const { currentLanguage } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="relative z-10 w-full min-h-[100svh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1A4D3E] via-[#0F2E25] to-black">
      {/* Animated mesh gradient overlay */}
      <div className="absolute inset-0 z-0 opacity-30" aria-hidden="true">
        <div className="absolute inset-0 animate-mesh-shift"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 30%, rgba(26,77,62,0.6), transparent),
              radial-gradient(ellipse 60% 80% at 80% 70%, rgba(15,46,37,0.5), transparent),
              radial-gradient(ellipse 50% 50% at 50% 50%, rgba(26,77,62,0.3), transparent)
            `,
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center pt-10 md:pt-32 pb-24 md:pb-40">
        {/* Headline */}
        <h1
          className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-[1.1] max-w-[900px]"
          style={{ letterSpacing: '-0.02em' }}
        >
          Bridge the{' '}
          <span className="text-primary italic">Retirement Gap</span>
        </h1>

        {/* Subhead */}
        <p
          className="text-lg md:text-2xl text-white/90 font-normal mb-10 md:mb-12 max-w-[700px]"
          style={{ letterSpacing: '0.02em' }}
        >
          Tax-efficient wealth strategies. Fiduciary guidance. Zero Wall Street games.
        </p>

        {/* CTAs */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-[90%] md:w-auto">
          <Button
            variant="secondary"
            size="lg"
            className="h-12 md:h-14 px-6 md:px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-[0_4px_12px_rgb(0_0_0_/_15%)] transition-all duration-300"
            onClick={() => navigate(`/${currentLanguage}/contact`)}
          >
            Schedule Assessment
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 md:h-14 px-6 md:px-8 bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold rounded-lg transition-all duration-300"
            onClick={() => navigate(`/${currentLanguage}/philosophy`)}
          >
            Our Philosophy
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mt-10 md:mt-14">
          <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/15 border border-white/30 backdrop-blur-sm">
            <ShieldCheck size={16} className="text-primary md:w-5 md:h-5" />
            <span className="text-white text-xs md:text-sm font-medium">Independent Fiduciary</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/15 border border-white/30 backdrop-blur-sm">
            <Users size={16} className="text-primary md:w-5 md:h-5" />
            <span className="text-white text-xs md:text-sm font-medium">75+ Carriers</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/15 border border-white/30 backdrop-blur-sm">
            <Calendar size={16} className="text-primary md:w-5 md:h-5" />
            <span className="text-white text-xs md:text-sm font-medium">Since 1998</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <ChevronDown size={32} className="text-white/70" />
      </div>
    </div>
  );
};
