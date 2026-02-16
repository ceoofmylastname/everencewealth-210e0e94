import React, { useRef, useEffect, useState } from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, className: `scroll-reveal${visible ? ' visible' : ''}` };
}

export const WakeUpCall: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const w = t.homepage.wakeUpCall;
  const heading = useScrollReveal();
  const left = useScrollReveal();
  const right = useScrollReveal();

  return (
    <section className="py-20 md:py-28 px-4 md:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div {...heading} className={`${heading.className} mb-14`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-xs font-space font-bold tracking-[0.2em] uppercase text-destructive">
              {w.badge}
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-space font-bold text-evergreen leading-tight max-w-3xl">
            {w.headline}{' '}
            <span className="text-destructive">{w.headlineHighlight}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div {...left} className={left.className}>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              {w.paragraph}
            </p>
            <div className="bg-evergreen text-white rounded-[40px] p-8 md:p-10">
              <p className="text-xl md:text-2xl font-serif italic leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: `"${w.quote}"` }} />
              <p className="text-white/50 text-sm font-space">{w.quoteAuthor}</p>
            </div>
          </div>

          <div {...right} className={right.className}>
            <h3 className="text-lg font-space font-bold text-foreground mb-6">
              {w.taxTrapsTitle}
            </h3>
            <ul className="space-y-4 mb-8">
              {w.taxTraps.map((trap, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-destructive shrink-0" />
                  <span className="text-muted-foreground text-sm leading-relaxed">{trap}</span>
                </li>
              ))}
            </ul>

            <div className="bg-muted rounded-2xl p-6 mb-8">
              <p className="text-5xl md:text-6xl font-space font-bold text-evergreen">
                {w.stat}
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                {w.statLabel}
              </p>
            </div>

            <button
              onClick={() => navigate('/contact')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-evergreen text-white font-space font-semibold text-sm rounded-xl hover:bg-evergreen/90 transition-colors"
            >
              {w.cta} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WakeUpCall;
