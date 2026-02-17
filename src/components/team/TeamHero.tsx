import { motion } from "framer-motion";
import { useTranslation } from "@/i18n";
import { Users, Globe, Award } from "lucide-react";
import { MorphingBlob } from "@/components/philosophy/MorphingBlob";
import { StatBadge } from "@/components/strategies/shared/StatBadge";

export const TeamHero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(160,48%,14%) 0%, hsl(160,48%,8%) 60%, hsl(160,48%,5%) 100%)' }}>
      <MorphingBlob className="absolute top-[-150px] right-[-100px] w-[600px] h-[600px] opacity-20" colors={['hsl(160,48%,30%)', 'hsl(43,74%,49%)']} morphSpeed={10000} />
      <MorphingBlob className="absolute bottom-[-200px] left-[-150px] w-[500px] h-[500px] opacity-10" colors={['hsl(160,48%,25%)', 'hsl(160,48%,35%)']} morphSpeed={12000} />

      <div className="container max-w-6xl mx-auto px-6 py-24 text-center relative z-10">
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
          <Users className="w-3 h-3 mr-1 inline" />
          {t.team?.hero?.badge || "Our Advisors"}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-5 tracking-tight"
        >
          {t.team?.hero?.headline || "Meet Our Expert Team"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto"
        >
          {t.team?.hero?.subheadline || "Dedicated fiduciary professionals ready to help you build and protect your wealth"}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <StatBadge icon={Globe} value={t.team?.hero?.badges?.languages || "EN/ES"} label="Languages" delay={0.9} />
          <StatBadge icon={Award} value={t.team?.hero?.badges?.experience || "35+ Years Combined"} label="Experience" delay={1.0} />
          <StatBadge icon={Users} value="1,200+" label="Families Served" delay={1.1} />
        </motion.div>

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
