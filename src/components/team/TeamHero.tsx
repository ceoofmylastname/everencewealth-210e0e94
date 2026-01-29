import { motion } from "framer-motion";
import { useTranslation } from "@/i18n";
import { Users, Globe, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const TeamHero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-br from-prime-900 via-prime-800 to-prime-900 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-prime-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-prime-gold/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <Badge variant="secondary" className="mb-6 bg-prime-gold/10 text-prime-gold border-0">
            <Users className="w-3 h-3 mr-1" />
            {t.team?.hero?.badge || "Our Team"}
          </Badge>

          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t.team?.hero?.headline || "Meet Our Expert Team"}
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            {t.team?.hero?.subheadline || "Dedicated professionals ready to help you find your perfect Costa del Sol property"}
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
              <Globe className="w-4 h-4 text-prime-gold" />
              <span className="text-white text-sm font-medium">
                {t.team?.hero?.badges?.languages || "10+ Languages"}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
              <Award className="w-4 h-4 text-prime-gold" />
              <span className="text-white text-sm font-medium">
                {t.team?.hero?.badges?.experience || "35+ Years Combined"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
