import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MorphingBlob } from '@/components/philosophy/MorphingBlob';
import { FloatingParticles } from './FloatingParticles';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { CheckCircle, Loader2 } from 'lucide-react';

interface StrategyFormCTAProps {
  headline: string;
  subtitle: string;
  submitText: string;
  disclaimer: string;
  incomeRanges: string[];
  namePlaceholder: string;
  emailPlaceholder: string;
  phonePlaceholder: string;
  incomePlaceholder: string;
  formSource: string; // e.g., "Index Strategy", "Tax-Free Retirement", etc.
}

export const StrategyFormCTA: React.FC<StrategyFormCTAProps> = ({
  headline, subtitle, submitText, disclaimer, incomeRanges,
  namePlaceholder, emailPlaceholder, phonePlaceholder, incomePlaceholder,
  formSource,
}) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', income: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const shootConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#C5A059', '#1A4D3E', '#ffffff'],
    });

    fire(0.2, {
      spread: 60,
      colors: ['#C5A059', '#1A4D3E', '#ffffff'],
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#C5A059', '#1A4D3E', '#ffffff'],
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#C5A059', '#1A4D3E', '#ffffff'],
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#C5A059', '#1A4D3E', '#ffffff'],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email) {
      toast({
        title: 'Required fields missing',
        description: 'Please fill in your name and email',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get UTM parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source') || undefined;
      const utmMedium = urlParams.get('utm_medium') || undefined;
      const utmCampaign = urlParams.get('utm_campaign') || undefined;
      const utmContent = urlParams.get('utm_content') || undefined;
      const utmTerm = urlParams.get('utm_term') || undefined;

      // Save to Supabase
      const { data: submission, error: insertError } = await supabase
        .from('strategy_form_submissions')
        .insert({
          full_name: form.name,
          email: form.email,
          phone: form.phone || null,
          income_range: form.income || null,
          form_source: formSource,
          page_url: window.location.href,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          utm_content: utmContent,
          utm_term: utmTerm,
          user_agent: navigator.userAgent,
          language: navigator.language,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Send email notification to admins
      const { error: emailError } = await supabase.functions.invoke(
        'send-strategy-form-notification',
        {
          body: { submission },
        }
      );

      if (emailError) {
        console.error('Email notification error:', emailError);
        // Don't fail the submission if email fails
      }

      // Success!
      setIsSuccess(true);
      shootConfetti();

      toast({
        title: '🎉 Success!',
        description: `Thank you ${form.name.split(' ')[0]}! We'll send your ${formSource} illustration shortly.`,
        duration: 6000,
      });

      // Reset form
      setTimeout(() => {
        setForm({ name: '', email: '', phone: '', income: '' });
        setIsSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission failed',
        description: 'Please try again or contact us directly at info@everencewealth.com',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(160,48%,21%) 0%, hsl(160,48%,8%) 100%)' }}>
      <MorphingBlob className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] opacity-15" colors={['hsl(43,74%,49%)', 'hsl(43,74%,60%)']} />
      <MorphingBlob className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] opacity-10" colors={['hsl(160,48%,30%)', 'hsl(160,48%,40%)']} />
      <FloatingParticles count={15} />

      <div className="container max-w-5xl mx-auto px-6 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
        >
          {headline}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-white/80 mb-12 max-w-3xl mx-auto"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-xl mx-auto rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] p-8 md:p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)]"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder={namePlaceholder}
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[hsl(43,74%,49%)]/50 focus:border-[hsl(43,74%,49%)]/40 transition-all duration-300"
              required
            />
            <input
              type="email"
              placeholder={emailPlaceholder}
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[hsl(43,74%,49%)]/50 focus:border-[hsl(43,74%,49%)]/40 transition-all duration-300"
              required
            />
            <input
              type="tel"
              placeholder={phonePlaceholder}
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[hsl(43,74%,49%)]/50 focus:border-[hsl(43,74%,49%)]/40 transition-all duration-300"
            />
            <select
              value={form.income}
              onChange={e => setForm(p => ({ ...p, income: e.target.value }))}
              className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white/70 focus:outline-none focus:ring-2 focus:ring-[hsl(43,74%,49%)]/50 focus:border-[hsl(43,74%,49%)]/40 transition-all duration-300"
            >
              <option value="" className="text-foreground">{incomePlaceholder}</option>
              {incomeRanges.map(r => (
                <option key={r} value={r} className="text-foreground">{r}</option>
              ))}
            </select>
            <motion.button
              type="submit"
              disabled={isSubmitting || isSuccess}
              whileHover={{ scale: isSubmitting || isSuccess ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting || isSuccess ? 1 : 0.98 }}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: isSuccess
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, hsl(43,74%,49%) 0%, hsl(43,74%,55%) 100%)',
                color: 'white'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="relative z-10">Submitting...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span className="relative z-10">Submitted!</span>
                </>
              ) : (
                <span className="relative z-10">{submitText}</span>
              )}
              {!isSubmitting && !isSuccess && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              )}
            </motion.button>
          </form>
          <p className="text-xs text-white/50 mt-5">{disclaimer}</p>
        </motion.div>
      </div>
    </section>
  );
};
