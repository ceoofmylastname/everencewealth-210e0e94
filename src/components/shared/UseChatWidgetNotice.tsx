import React from 'react';
import { MessageCircle } from 'lucide-react';

interface UseChatWidgetNoticeProps {
  headline?: string;
  subtitle?: string;
  variant?: 'section' | 'inline';
}

/**
 * Shown wherever a public opt-in form has been temporarily hidden
 * (see `HIDE_CLIENT_OPT_IN_FORMS` in `src/lib/clientFormsFlag.ts`).
 * Directs visitors to the LeadConnector chat widget loaded in index.html.
 */
export const UseChatWidgetNotice: React.FC<UseChatWidgetNoticeProps> = ({
  headline = 'Let’s talk — right now.',
  subtitle = 'Tap the chat widget in the lower-right corner of your screen and a member of our team will be with you shortly.',
  variant = 'section',
}) => {
  if (variant === 'inline') {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
          <MessageCircle className="w-6 h-6" />
        </div>
        <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-2">{headline}</h3>
        <p className="text-sm md:text-base text-muted-foreground">{subtitle}</p>
      </div>
    );
  }

  return (
    <section
      className="relative py-20 md:py-28 px-6"
      style={{ background: 'linear-gradient(135deg, hsl(160,48%,21%) 0%, hsl(160,48%,8%) 100%)' }}
    >
      <div className="container max-w-2xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 backdrop-blur-md text-white mb-6 border border-white/20">
          <MessageCircle className="w-7 h-7" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{headline}</h2>
        <p className="text-base md:text-lg text-white/80">{subtitle}</p>
      </div>
    </section>
  );
};

export default UseChatWidgetNotice;