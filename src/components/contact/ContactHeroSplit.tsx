import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Phone, MapPin, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContactForm } from './ContactForm';
import { COMPANY_CONTACT, COMPANY_ADDRESS, COMPANY_HOURS } from '@/constants/company';

interface ContactHeroSplitProps {
  t: any;
  language: string;
}

export const ContactHeroSplit: React.FC<ContactHeroSplitProps> = ({ t, language }) => {
  const trackEvent = (eventName: string, location: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        event_category: 'Contact',
        event_label: location,
      });
    }
  };

  const whatsappUrl = COMPANY_CONTACT.whatsappWithMessage(
    t.options?.whatsapp?.prefill || "Hi, I'm interested in learning about retirement strategies."
  );

  return (
    <section className="relative bg-gradient-to-br from-prime-900 via-prime-800 to-prime-900 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-prime-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] bg-prime-gold/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-prime-gold/[0.02] rounded-full blur-3xl" />
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} 
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 py-12 md:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          
          {/* LEFT COLUMN — Headline + Contact Cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-8 lg:sticky lg:top-24"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-prime-gold/10 border border-prime-gold/20 rounded-full px-4 py-1.5 w-fit"
            >
              <Sparkles className="w-3.5 h-3.5 text-prime-gold" />
              <span className="text-prime-gold text-xs font-semibold tracking-wider uppercase">
                Let's Connect
              </span>
            </motion.div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-serif font-bold text-white leading-[1.1] mb-4">
                {t.hero?.headline || 'Get in Touch'}
              </h1>
              <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-md">
                {t.hero?.subheadline || "We're here to help you build a tax-efficient retirement strategy"}
              </p>
            </div>

            {/* Contact Cards */}
            <div className="flex flex-col gap-3">
              {/* WhatsApp — Primary */}
              <motion.a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_click', 'contact_hero')}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="group flex items-center gap-4 bg-white/[0.06] hover:bg-green-500/15 border border-white/10 hover:border-green-500/30 rounded-2xl p-4 transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm">
                      {t.options?.whatsapp?.title || 'Chat With Us'}
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                      Fastest
                    </span>
                  </div>
                  <p className="text-white/50 text-xs mt-0.5">
                    {t.options?.whatsapp?.description || 'Get instant responses from our team'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-green-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </motion.a>

              {/* Phone */}
              <motion.a
                href={`tel:${COMPANY_CONTACT.phoneClean}`}
                onClick={() => trackEvent('phone_click', 'contact_hero')}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="group flex items-center gap-4 bg-white/[0.06] hover:bg-prime-gold/10 border border-white/10 hover:border-prime-gold/30 rounded-2xl p-4 transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-prime-gold/15 flex items-center justify-center flex-shrink-0 group-hover:bg-prime-gold/25 transition-colors">
                  <Phone className="w-5 h-5 text-prime-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">
                    {t.options?.phone?.title || 'Call Our Office'}
                  </p>
                  <p className="text-prime-gold/80 text-sm font-medium mt-0.5">
                    {COMPANY_CONTACT.phone}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-prime-gold group-hover:translate-x-1 transition-all flex-shrink-0" />
              </motion.a>

              {/* Email */}
              <motion.a
                href={`mailto:${COMPANY_CONTACT.email}`}
                onClick={() => trackEvent('email_click', 'contact_hero')}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="group flex items-center gap-4 bg-white/[0.06] hover:bg-prime-gold/10 border border-white/10 hover:border-prime-gold/30 rounded-2xl p-4 transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-prime-gold/15 flex items-center justify-center flex-shrink-0 group-hover:bg-prime-gold/25 transition-colors">
                  <Mail className="w-5 h-5 text-prime-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">
                    {t.options?.email?.title || 'Send Us an Email'}
                  </p>
                  <p className="text-white/50 text-sm mt-0.5 truncate">
                    {COMPANY_CONTACT.email}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-prime-gold group-hover:translate-x-1 transition-all flex-shrink-0" />
              </motion.a>
            </div>

            {/* Quick info row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4 text-white/40 text-xs"
            >
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{COMPANY_ADDRESS.city}, {COMPANY_ADDRESS.province}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Mon–Fri {COMPANY_HOURS.weekdays.open}–{COMPANY_HOURS.weekdays.close} PT</span>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN — Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <ContactForm t={t} language={language} variant="embedded" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
