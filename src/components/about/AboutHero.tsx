import { motion } from "framer-motion";
import { MapPin, Users, Award } from "lucide-react";
import { useTranslation } from "@/i18n";
import { MorphingBlob } from "@/components/philosophy/MorphingBlob";
import { StatBadge } from "@/components/strategies/shared/StatBadge";

interface AboutHeroProps {
  headline: string;
  subheadline: string;
  yearsInBusiness: number;
  propertiesSold: number;
  clientSatisfaction: number;
}

export const AboutHero = ({
  headline,
  subheadline,
  yearsInBusiness,
  propertiesSold,
  clientSatisfaction
}: AboutHeroProps) => {
  const { t, currentLanguage } = useTranslation();
  const aboutUs = t.aboutUs as Record<string, unknown> | undefined;
  const hero = aboutUs?.hero as { headline?: string; subheadline?: string; breadcrumbHome?: string; breadcrumbAbout?: string; statsYears?: string; statsClients?: string; statsSatisfaction?: string } | undefined;

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(160,48%,14%) 0%, hsl(160,48%,8%) 60%, hsl(160,48%,5%) 100%)' }}>
      <MorphingBlob className="absolute top-[-150px] right-[-100px] w-[600px] h-[600px] opacity-20" colors={['hsl(160,48%,30%)', 'hsl(43,74%,49%)']} morphSpeed={10000} />
      <MorphingBlob className="absolute bottom-[-200px] left-[-150px] w-[500px] h-[500px] opacity-10" colors={['hsl(160,48%,25%)', 'hsl(160,48%,35%)']} morphSpeed={12000} />

      <div className="container max-w-6xl mx-auto px-6 py-24 text-center relative z-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center justify-center gap-2 text-sm text-white/40">
            <li><a href={`/${currentLanguage}`} className="hover:text-[hsl(43,74%,49%)] transition-colors">{hero?.breadcrumbHome || "Home"}</a></li>
            <li className="text-white/20">/</li>
            <li className="text-[hsl(43,74%,49%)]">{hero?.breadcrumbAbout || "About Us"}</li>
          </ol>
        </nav>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          className="w-16 h-0.5 mx-auto mb-6"
          style={{ background: 'hsl(43,74%,49%)' }}
        />

        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 border"
          style={{ borderColor: 'hsl(43,74%,49%,0.4)', color: 'hsl(43,74%,49%)' }}
        >
          Independent Fiduciary
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-5 tracking-tight"
        >
          {hero?.headline || headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto"
        >
          {hero?.subheadline || subheadline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap justify-center gap-4 mb-10"
        >
          <StatBadge icon={Award} value={`${yearsInBusiness}+`} label={hero?.statsYears || "Years Experience"} delay={0.9} />
          <StatBadge icon={Users} value={`${propertiesSold}+`} label={hero?.statsClients || "Happy Clients"} delay={1.0} />
          <StatBadge icon={MapPin} value={`${clientSatisfaction}%`} label={hero?.statsSatisfaction || "Satisfaction Rate"} delay={1.1} />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-8 rounded-full border-2 border-white/30 flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-1 rounded-full bg-white/60"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
