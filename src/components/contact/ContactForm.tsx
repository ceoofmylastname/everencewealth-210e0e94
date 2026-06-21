import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, Loader2, Sparkles, Mail, Phone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sendFormToGHL, getPageMetadata, parseFullName } from '@/lib/webhookHandler';
import { registerCrmLead } from '@/utils/crm/registerCrmLead';
import { Link } from 'react-router-dom';

interface ContactFormTranslations {
  form: {
    headline: string;
    subheadline: string;
    fields: {
      fullName: string;
      email: string;
      phone: string;
      language: string;
      subject: string;
      message: string;
      referral: string;
      privacy: string;
      privacyLink?: string;
      termsLink?: string;
    };
    subjects: {
      general: string;
      property: string;
      selling: string;
      viewing: string;
      other: string;
    };
    referrals: {
      google: string;
      socialMedia: string;
      referral: string;
      advertisement: string;
      other: string;
    };
    submit: string;
    submitting: string;
    validation?: {
      requiredFields?: string;
    };
    error?: {
      title?: string;
      description?: string;
    };
    success: {
      title: string;
      description: string;
    };
  };
}

interface ContactFormProps {
  t: ContactFormTranslations;
  language: string;
  variant?: 'default' | 'embedded';
  showBrandName?: boolean;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
];

// Glassmorphic success card with confetti burst
const SuccessCard: React.FC<{ t: ContactFormTranslations; isEmbedded: boolean }> = ({ t, isEmbedded }) => {
  useEffect(() => {
    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        origin: { y: 0.6 },
        colors: ['#EDDB77', '#1A4D3E', '#F5E9A8', '#ffffff', '#C9A84C'],
        ...opts,
        particleCount: Math.floor(220 * particleRatio),
      });
    };
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.9 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={isEmbedded ? '' : 'max-w-2xl mx-auto'}
    >
      <div className="relative overflow-hidden rounded-[2rem] p-[1px] bg-gradient-to-br from-prime-gold/60 via-white/10 to-prime-gold/30 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]">
        {/* Aurora glow */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-prime-gold/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative rounded-[calc(2rem-1px)] bg-white/10 backdrop-blur-2xl border border-white/15 p-8 md:p-14 text-center">
          {/* Animated check */}
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 14 }}
            className="relative mx-auto mb-7 w-24 h-24"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-prime-gold/40 to-emerald-400/30 blur-xl" />
            <div className="relative w-24 h-24 rounded-full bg-white/15 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
              <CheckCircle className="w-12 h-12 text-prime-gold drop-shadow-[0_2px_12px_rgba(237,219,119,0.6)]" strokeWidth={1.5} />
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0, 1, 0], scale: [0.6, 1.6, 2] }}
              transition={{ duration: 1.4, delay: 0.3, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border-2 border-prime-gold/50"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white/10 border border-white/20 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-prime-gold" />
            <span className="text-xs font-medium tracking-wider uppercase text-prime-gold">Received</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3 tracking-tight"
          >
            {t.form.success.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed"
          >
            {t.form.success.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <a
              href="mailto:info@everencewealth.com"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md text-sm text-foreground transition-colors"
            >
              <Mail className="w-4 h-4 text-prime-gold" />
              info@everencewealth.com
            </a>
            <a
              href="tel:+19258860608"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md text-sm text-foreground transition-colors"
            >
              <Phone className="w-4 h-4 text-prime-gold" />
              (925) 886-0608
            </a>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export const ContactForm: React.FC<ContactFormProps> = ({ t, language, variant = 'default', showBrandName = false }) => {
  const isEmbedded = variant === 'embedded';
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    preferredLanguage: language,
    subject: '',
    message: '',
    referral: '',
    privacy: false,
    smsTransactionalConsent: false,
    smsMarketingConsent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.message) {
      toast({
        title: t.form.validation?.requiredFields || 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { firstName, lastName } = parseFullName(formData.fullName);
      const metadata = getPageMetadata();

      // 1. Save to leads table
      await supabase.from('leads').insert({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        comment: `${formData.message}\n\n---\nSMS Transactional Consent: ${formData.smsTransactionalConsent ? 'Yes' : 'No'}\nSMS Marketing Consent: ${formData.smsMarketingConsent ? 'Yes' : 'No'}`,
        language: formData.preferredLanguage,
        source: 'contact_page',
        page_url: metadata.pageUrl,
        user_agent: navigator.userAgent,
      });

      // 2. Send to GHL webhook
      await sendFormToGHL({
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone,
        message: `Subject: ${formData.subject}\n\n${formData.message}${formData.referral ? `\n\nReferral: ${formData.referral}` : ''}`,
        leadSource: 'Website Form',
        leadSourceDetail: `contact_page_${language}`,
        pageType: 'contact_page',
        language: formData.preferredLanguage,
        initialLeadScore: 30,
      });

      // 3. Register in CRM
      await registerCrmLead({
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone || '',
        leadSource: 'Website Form',
        leadSourceDetail: `contact_page_${language}`,
        pageType: 'contact_page',
        pageUrl: metadata.pageUrl,
        pageTitle: metadata.pageTitle,
        language: formData.preferredLanguage,
        message: formData.message,
        initialLeadScore: 30,
      });

      // 4. Show success
      setIsSubmitted(true);

      // 6. Trigger Emma chat after 2 seconds
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('openEmmaChat'));
      }, 2000);

    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: t.form.error?.title || 'Something went wrong',
        description: t.form.error?.description || 'Please try again or contact us via WhatsApp.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    const successContent = (
      <SuccessCard t={t} isEmbedded={isEmbedded} />
    );

    if (isEmbedded) return successContent;

    return (
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          {successContent}
        </div>
      </section>
    );
  }

  const formContent = (
    <>
      {!isEmbedded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            {t.form.headline}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t.form.subheadline}
          </p>
        </motion.div>
      )}

      {showBrandName && (
        <div className="mb-1">
          <span className="text-xs font-semibold tracking-widest uppercase text-prime-gold">Everence Wealth</span>
        </div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className={`bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5 ${isEmbedded ? 'shadow-2xl shadow-black/20' : ''}`}
      >
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName" className="text-foreground font-medium">
                {t.form.fields.fullName} *
              </Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="mt-2 h-12"
                required
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email" className="text-foreground font-medium">
                  {t.form.fields.email} *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2 h-12"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-foreground font-medium">
                  {t.form.fields.phone}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-2 h-12"
                />
              </div>
            </div>

            {/* Language & Subject */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-foreground font-medium">
                  {t.form.fields.language}
                </Label>
                <Select
                  value={formData.preferredLanguage}
                  onValueChange={(value) => setFormData({ ...formData, preferredLanguage: value })}
                >
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-foreground font-medium">
                  {t.form.fields.subject}
                </Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData({ ...formData, subject: value })}
                >
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">{t.form.subjects.general}</SelectItem>
                    <SelectItem value="property">{t.form.subjects.property}</SelectItem>
                    <SelectItem value="selling">{t.form.subjects.selling}</SelectItem>
                    <SelectItem value="viewing">{t.form.subjects.viewing}</SelectItem>
                    <SelectItem value="other">{t.form.subjects.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message" className="text-foreground font-medium">
                {t.form.fields.message} *
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="mt-2 min-h-[150px]"
                required
              />
            </div>

            {/* Referral */}
            <div>
              <Label className="text-foreground font-medium">
                {t.form.fields.referral}
              </Label>
              <Select
                value={formData.referral}
                onValueChange={(value) => setFormData({ ...formData, referral: value })}
              >
                <SelectTrigger className="mt-2 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">{t.form.referrals.google}</SelectItem>
                  <SelectItem value="social">{t.form.referrals.socialMedia}</SelectItem>
                  <SelectItem value="referral">{t.form.referrals.referral}</SelectItem>
                  <SelectItem value="ad">{t.form.referrals.advertisement}</SelectItem>
                  <SelectItem value="other">{t.form.referrals.other}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* SMS Transactional Consent (Optional) */}
            <div className="space-y-4 border border-border rounded-xl p-4 bg-muted/20">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="smsTransactional"
                  checked={formData.smsTransactionalConsent}
                  onCheckedChange={(checked) => setFormData({ ...formData, smsTransactionalConsent: checked as boolean })}
                  className="mt-1"
                />
                <Label htmlFor="smsTransactional" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  I consent to receive transactional messages (e.g., appointment confirmations, account alerts, responses to support requests, ticket updates, appointment coordination, or follow-up communications related to an existing inquiry) from <span className="font-semibold text-foreground">Everence Wealth</span> at the phone number provided. Message frequency may vary. Message & Data rates may apply. Reply HELP for help or STOP to opt-out.
                </Label>
              </div>

              {/* SMS Marketing Consent (Optional) */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="smsMarketing"
                  checked={formData.smsMarketingConsent}
                  onCheckedChange={(checked) => setFormData({ ...formData, smsMarketingConsent: checked as boolean })}
                  className="mt-1"
                />
                <Label htmlFor="smsMarketing" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  I consent to receive marketing and promotional messages from <span className="font-semibold text-foreground">Everence Wealth</span> at the phone number provided. Message frequency may vary. Message & Data rates may apply. Reply HELP for help or STOP to opt-out.
                </Label>
              </div>
            </div>

            {/* Privacy & Terms Links */}
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/privacy" className="text-primary hover:underline">
                {t.form.fields.privacyLink || 'Privacy Policy'}
              </Link>
              {' & '}
              <Link to="/terms" className="text-primary hover:underline">
                {t.form.fields.termsLink || 'Terms & Conditions'}
              </Link>
            </p>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-lg font-semibold bg-prime-gold hover:bg-prime-gold/90 text-prime-900"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t.form.submitting}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  {t.form.submit}
                </>
              )}
            </Button>
          </motion.form>
    </>
  );

  if (isEmbedded) {
    return (
      <div>
        {isEmbedded && (
          <h2 className="text-2xl font-serif font-bold text-foreground mb-5">
            {t.form.headline}
          </h2>
        )}
        {formContent}
      </div>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          {formContent}
        </div>
      </div>
    </section>
  );
};
