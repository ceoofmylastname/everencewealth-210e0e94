import { useState } from "react";
import { motion } from "framer-motion";
import { Linkedin, Globe, Award, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TeamMemberModal } from "@/components/team/TeamMemberModal";
import { useTranslation } from "@/i18n";

interface Founder {
  name: string;
  role: string;
  bio: string;
  photo_url: string;
  linkedin_url: string;
  credentials: string[];
  years_experience: number;
  languages: string[];
  specialization: string;
}

interface FounderProfilesProps {
  founders: Founder[];
}

const transformFounderToTeamMember = (founder: Founder) => ({
  id: founder.name.toLowerCase().replace(/\s+/g, '-'),
  name: founder.name,
  role: founder.role,
  role_translations: null,
  bio: founder.bio,
  bio_translations: null,
  photo_url: founder.photo_url,
  email: null,
  phone: null,
  whatsapp: null,
  linkedin_url: founder.linkedin_url,
  languages_spoken: founder.languages,
  specializations: [founder.specialization],
  areas_of_expertise: null,
  years_experience: founder.years_experience,
  credentials: founder.credentials,
  is_founder: true,
});

interface LocalizedProfile {
  name: string;
  role: string;
  bio: string;
  specialization: string;
}

interface FoundersSection {
  badge?: string;
  heading?: string;
  subheading?: string;
  specialization?: string;
  viewProfile?: string;
  profiles?: LocalizedProfile[];
}

export const FounderProfiles = ({ founders }: FounderProfilesProps) => {
  const [selectedFounder, setSelectedFounder] = useState<Founder | null>(null);
  const { t } = useTranslation();
  const aboutUs = t.aboutUs as Record<string, unknown> | undefined;
  const foundersSection = aboutUs?.founders as FoundersSection | undefined;

  if (!founders || founders.length === 0) return null;

  const getLocalizedFounder = (founder: Founder, index: number): Founder => {
    const localizedProfile = foundersSection?.profiles?.[index];
    if (!localizedProfile) return founder;
    return {
      ...founder,
      role: localizedProfile.role || founder.role,
      bio: localizedProfile.bio || founder.bio,
      specialization: localizedProfile.specialization || founder.specialization,
    };
  };

  return (
    <section className="py-20 bg-background" aria-labelledby="founders-heading">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-[hsl(43,74%,49%)]/10 text-[hsl(43,74%,49%)] border-0 rounded-full">
              <Shield className="w-3 h-3 mr-1" />
              {foundersSection?.badge || "Expert Team"}
            </Badge>
            <h2 id="founders-heading" className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              {foundersSection?.heading || "Meet The Founders"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {foundersSection?.subheading || "Experienced independent advisors united by a passion for helping clients"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {founders.map((founder, index) => {
              const localizedFounder = getLocalizedFounder(founder, index);
              return (
                <motion.div
                  key={founder.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  <div
                    className="h-full rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, hsl(160,48%,14%) 0%, hsl(160,48%,8%) 100%)' }}
                    onClick={() => setSelectedFounder(localizedFounder)}
                  >
                    <div className="p-6 text-center relative">
                      <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-[hsl(43,74%,49%)]/30 shadow-xl group-hover:ring-[hsl(43,74%,49%)]/50 transition-all">
                        <AvatarImage src={founder.photo_url} alt={founder.name} className="object-cover" />
                        <AvatarFallback className="bg-[hsl(43,74%,49%)] text-white text-2xl font-serif">
                          {founder.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>

                      <h3 className="font-serif text-xl font-bold text-white mb-1">{founder.name}</h3>
                      <p className="text-[hsl(43,74%,49%)] text-sm font-medium mb-3">{localizedFounder.role}</p>

                      {founder.years_experience > 0 && (
                        <div className="absolute top-4 right-4 bg-[hsl(43,74%,49%)] text-[hsl(160,48%,12%)] text-xs font-bold px-2 py-1 rounded-full">
                          {founder.years_experience}+ yrs
                        </div>
                      )}
                    </div>

                    <div className="px-6 pb-6">
                      <p className="text-white/70 text-sm leading-relaxed mb-4 line-clamp-3">{localizedFounder.bio}</p>

                      <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-4 h-4 text-[hsl(43,74%,49%)]" />
                        <span className="text-sm text-white/60">{founder.languages.join(', ')}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {founder.credentials.slice(0, 2).map((cred, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-[hsl(43,74%,49%)]/30 text-white/80 rounded-full">
                            <Award className="w-3 h-3 mr-1 text-[hsl(43,74%,49%)]" />
                            {cred}
                          </Badge>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        className="w-full border-[hsl(43,74%,49%)]/30 text-white hover:bg-[hsl(43,74%,49%)] hover:text-[hsl(160,48%,12%)] transition-colors rounded-xl"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={founder.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="w-4 h-4 mr-2" />
                          {foundersSection?.viewProfile || "View Profile"}
                        </a>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <TeamMemberModal
        member={selectedFounder ? transformFounderToTeamMember(selectedFounder) : null}
        isOpen={!!selectedFounder}
        onClose={() => setSelectedFounder(null)}
      />
    </section>
  );
};
