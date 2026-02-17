import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useTranslation } from '@/i18n';

const defaultStories = [
  { type: 'Physician', initials: 'DR', challenge: 'High income but massive tax burden with no asset protection', outcome: 'Structured IUL + ILIT saving $45K/yr in taxes', quote: '"I wish I had found them 10 years ago."' },
  { type: 'Business Owner', initials: 'SK', challenge: 'Worried about lawsuits draining business assets', outcome: 'FLP + annuity structure protecting $2.5M', quote: '"My business and family are finally protected."' },
  { type: 'Retired Couple', initials: 'BW', challenge: 'RMDs pushing them into higher tax brackets', outcome: 'Roth conversion + IUL eliminated tax bomb', quote: '"We kept $200K more of our own money."' },
  { type: 'Real Estate Investor', initials: 'TL', challenge: 'Portfolio exposed to creditors and estate taxes', outcome: 'LLC + trust structure shielding 8 properties', quote: '"Peace of mind is priceless."' },
  { type: 'Tech Executive', initials: 'AM', challenge: 'Stock options creating massive tax events', outcome: 'Tax-bucket strategy saving $90K at exercise', quote: '"They turned a tax nightmare into a plan."' },
  { type: 'Family Legacy', initials: 'RG', challenge: 'Estate would lose 40% to taxes at transfer', outcome: 'ILIT + whole life preserving $3.2M for heirs', quote: '"Our grandchildren\'s future is secure."' },
];

export const CSStoriesGrid: React.FC = () => {
  const { t } = useTranslation();
  const s = (t as any).clientStories?.stories;
  const stories = s || defaultStories;

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">{(t as any).clientStories?.gridTitle || 'More Success Stories'}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{(t as any).clientStories?.gridSubtitle || 'Every family has a unique financial situation. Here\'s how we\'ve helped.'}</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {stories.map((story: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, hsl(160,48%,14%) 0%, hsl(160,48%,8%) 100%)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[hsl(43,74%,49%)]/20 flex items-center justify-center text-[hsl(43,74%,49%)] font-bold text-sm">{story.initials}</div>
                <span className="text-[hsl(43,74%,49%)] text-sm font-semibold">{story.type}</span>
              </div>
              <p className="text-white/60 text-sm mb-2"><span className="text-white/80 font-medium">Challenge:</span> {story.challenge}</p>
              <p className="text-white/60 text-sm mb-4"><span className="text-[hsl(43,74%,49%)] font-medium">Outcome:</span> {story.outcome}</p>
              <div className="border-t border-white/10 pt-4">
                <Quote className="w-4 h-4 text-[hsl(43,74%,49%)] mb-2 opacity-50" />
                <p className="text-white/80 text-sm italic">{story.quote}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
