import React, { useState, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle } from 'lucide-react';

interface BrochureOptInFormProps {
  cityName: string;
  citySlug: string;
}

const COUNTRY_CODES = [
  { code: '+44', country: 'UK' },
  { code: '+1', country: 'US/CA' },
  { code: '+34', country: 'ES' },
  { code: '+49', country: 'DE' },
  { code: '+33', country: 'FR' },
  { code: '+31', country: 'NL' },
  { code: '+46', country: 'SE' },
  { code: '+47', country: 'NO' },
  { code: '+45', country: 'DK' },
  { code: '+358', country: 'FI' },
  { code: '+48', country: 'PL' },
  { code: '+36', country: 'HU' },
  { code: '+353', country: 'IE' },
  { code: '+41', country: 'CH' },
  { code: '+43', country: 'AT' },
  { code: '+32', country: 'BE' },
];

export const BrochureOptInForm = forwardRef<HTMLElement, BrochureOptInFormProps>(
  ({ cityName, citySlug }, ref) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      countryCode: '+44',
      phone: '',
      message: '',
      privacyConsent: false,
      marketingConsent: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.privacyConsent) {
        toast({
          title: 'Privacy consent required',
          description: 'Please agree to the privacy policy to continue.',
          variant: 'destructive',
        });
        return;
      }

      setIsSubmitting(true);

      try {
        // Store the lead in chatbot_conversations table
        await supabase.from('chatbot_conversations').insert({
          user_name: `${formData.firstName} ${formData.lastName}`,
          user_email: formData.email,
          user_phone: `${formData.countryCode}${formData.phone}`,
          area: cityName,
          article_slug: `brochure-${citySlug}`,
          conversation_transcript: [{
            type: 'brochure_request',
            message: formData.message || `Requested ${cityName} brochure`,
            marketing_consent: formData.marketingConsent,
            timestamp: new Date().toISOString(),
          }],
        });

        setIsSubmitted(true);
        toast({
          title: 'Thank you!',
          description: 'Your brochure request has been received.',
        });
      } catch (error) {
        console.error('Form submission error:', error);
        toast({
          title: 'Something went wrong',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    if (isSubmitted) {
      return (
        <section ref={ref} id="brochure-form" className="py-16 md:py-24 bg-prime-950">
          <div className="container mx-auto px-4 md:px-6 max-w-2xl text-center">
            <div className="bg-background rounded-2xl p-8 md:p-12 shadow-2xl">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h3 className="font-display text-2xl md:text-3xl text-foreground mb-4">
                Thank You!
              </h3>
              <p className="font-body text-muted-foreground">
                Your {cityName} brochure request has been received. Our team will be in touch shortly.
              </p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section ref={ref} id="brochure-form" className="py-16 md:py-24 bg-prime-950">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
              Get Your Free {cityName} Brochure
            </h2>
            <p className="font-body text-white/70">
              Discover exclusive property opportunities and lifestyle insights
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-background rounded-2xl p-6 md:p-10 shadow-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Smith"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.countryCode}
                  onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((item) => (
                      <SelectItem key={item.code} value={item.code}>
                        {item.code} {item.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="7700 123456"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us about your property requirements..."
                rows={3}
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacy"
                  checked={formData.privacyConsent}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, privacyConsent: checked as boolean })
                  }
                />
                <Label htmlFor="privacy" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  I agree to the <a href="/privacy" className="text-prime-gold hover:underline">Privacy Policy</a> and consent to Del Sol Prime Homes processing my data to respond to my inquiry. *
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="marketing"
                  checked={formData.marketingConsent}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, marketingConsent: checked as boolean })
                  }
                />
                <Label htmlFor="marketing" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  I'd like to receive property updates, market insights, and exclusive opportunities from Del Sol Prime Homes.
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-prime-gold hover:bg-prime-gold/90 text-prime-950 font-nav font-semibold py-6 text-lg"
            >
              {isSubmitting ? 'Submitting...' : 'View Brochure'}
            </Button>
          </form>
        </div>
      </section>
    );
  }
);

BrochureOptInForm.displayName = 'BrochureOptInForm';
