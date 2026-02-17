import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { useTranslation } from "@/i18n";

interface MissionStatementProps {
  mission: string;
  speakableSummary: string;
}

export const MissionStatement = ({ mission, speakableSummary }: MissionStatementProps) => {
  const { t } = useTranslation();
  const aboutUs = t.aboutUs as Record<string, unknown> | undefined;
  const missionSection = aboutUs?.mission as { heading?: string; summaryLabel?: string; content?: string; speakableContent?: string } | undefined;

  const displayMission = missionSection?.content || mission;
  const displaySpeakable = missionSection?.speakableContent || speakableSummary;

  return (
    <section className="py-20 bg-background" aria-labelledby="mission-heading">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[hsl(43,74%,49%)]/10 mb-6">
              <Target className="w-8 h-8 text-[hsl(43,74%,49%)]" />
            </div>
            <h2 id="mission-heading" className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              {missionSection?.heading || "Our Mission"}
            </h2>
          </div>

          <div className="mission-statement bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-10 mb-10" style={{ background: 'linear-gradient(135deg, hsl(160,48%,14%) 0%, hsl(160,48%,8%) 100%)' }}>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed font-medium italic">
              "{displayMission}"
            </p>
          </div>

          <div className="speakable-summary bg-muted rounded-2xl p-6 md:p-8">
            <p className="text-sm uppercase tracking-wider text-[hsl(43,74%,49%)] font-semibold mb-3">
              {missionSection?.summaryLabel || "About Us"}
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {displaySpeakable}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
