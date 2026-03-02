import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n";
import { MorphingBlob } from "@/components/philosophy/MorphingBlob";

export const AboutCTA = () => {
  const { t, currentLanguage } = useTranslation();
  const aboutUs = t.aboutUs as Record<string, unknown> | undefined;
  const ctaSection = aboutUs?.ctaSection as { heading?: string; subheading?: string; chatWithEmma?: string; callUs?: string; emailUs?: string; visitUs?: string; location?: string } | undefined;
  const cta = aboutUs?.cta as { meetTeam?: string } | undefined;

  return (
    <section className="py-20 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(160,48%,14%) 0%, hsl(160,48%,8%) 60%, hsl(160,48%,5%) 100%)' }}>
      <MorphingBlob className="absolute top-[-100px] right-[-80px] w-[400px] h-[400px] opacity-10" colors={['hsl(43,74%,49%)', 'hsl(160,48%,30%)']} morphSpeed={10000} />
      <MorphingBlob className="absolute bottom-[-100px] left-[-80px] w-[350px] h-[350px] opacity-10" colors={['hsl(160,48%,25%)', 'hsl(43,74%,49%)']} morphSpeed={12000} />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {ctaSection?.heading || "Ready to Secure Your Financial Future?"}
          </h2>
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            {ctaSection?.subheading || "Let's start your wealth planning journey together."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="bg-[hsl(43,74%,49%)] hover:bg-[hsl(43,74%,49%)]/90 text-[hsl(160,48%,12%)] font-semibold px-8 rounded-xl"
              asChild
            >
              <Link to={`/${currentLanguage}/team`}>
                <Users className="w-4 h-4 mr-2" />
                {cta?.meetTeam || "Meet Our Team"}
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { icon: Phone, label: ctaSection?.callUs || "Call Us", value: "+34 630 03 90 90" },
              { icon: Mail, label: ctaSection?.emailUs || "Email Us", value: "info@everencewealth.com" },
              { icon: MapPin, label: ctaSection?.visitUs || "Visit Us", value: ctaSection?.location || "San Francisco, CA" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-[hsl(43,74%,49%)]" />
                </div>
                <span className="text-sm text-white/50 mb-1">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
