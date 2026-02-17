import { motion } from "framer-motion";
import { ShieldCheck, Award, FileCheck, Lock } from "lucide-react";
import { useTranslation } from "@/i18n";

interface Credential {
  name: string;
  description: string;
  icon: string;
}

interface Citation {
  source: string;
  url: string;
  text: string;
}

interface CredentialsProps {
  credentials: Credential[];
  citations: Citation[];
}

const iconMap: Record<string, React.ElementType> = {
  "shield-check": ShieldCheck,
  "award": Award,
  "file-check": FileCheck,
  "lock": Lock
};

export const Credentials = ({ credentials, citations }: CredentialsProps) => {
  const { t } = useTranslation();
  const aboutUs = t.aboutUs as Record<string, unknown> | undefined;
  const credentialsSection = aboutUs?.credentials as { heading?: string; subheading?: string; citationsLabel?: string } | undefined;

  return (
    <section className="py-20 bg-background" aria-labelledby="credentials-heading">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-16">
            <h2 id="credentials-heading" className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              {credentialsSection?.heading || "Our Credentials"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {credentialsSection?.subheading || "Licensed, certified, and committed to the highest professional standards"}
            </p>
          </div>

          {credentials && credentials.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-5xl mx-auto">
              {credentials.map((credential, index) => {
                const IconComponent = iconMap[credential.icon] || ShieldCheck;
                return (
                  <motion.div
                    key={credential.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center hover:border-[hsl(43,74%,49%)]/30 transition-colors"
                    style={{ background: 'linear-gradient(135deg, hsl(160,48%,14%) 0%, hsl(160,48%,10%) 100%)' }}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[hsl(43,74%,49%)]/10 flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-7 h-7 text-[hsl(43,74%,49%)]" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{credential.name}</h3>
                    <p className="text-sm text-white/70">{credential.description}</p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {citations && citations.length > 0 && (
            <div className="max-w-3xl mx-auto">
              <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-4 text-center">
                {credentialsSection?.citationsLabel || "Verified By Official Sources"}
              </h3>
              <div className="bg-muted rounded-2xl p-6">
                <ul className="space-y-4">
                  {citations.map((citation, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground hover:text-[hsl(43,74%,49%)] transition-colors"
                        >
                          {citation.source}
                        </a>
                        <p className="text-sm text-muted-foreground mt-0.5">{citation.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
