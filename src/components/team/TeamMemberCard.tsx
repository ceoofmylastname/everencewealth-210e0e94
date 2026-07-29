import { motion } from "framer-motion";
import { Globe, Award, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "@/i18n";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  role_translations: Record<string, string> | null;
  bio: string | null;
  bio_translations: Record<string, string> | null;
  photo_url: string | null;
  languages_spoken: string[] | null;
  specializations: string[] | null;
  years_experience: number | null;
  credentials: string[] | null;
  is_founder: boolean;
  email: string | null;
}

interface TeamMemberCardProps {
  member: TeamMember;
  index: number;
  onClick: () => void;
}

export const TeamMemberCard = ({ member, index, onClick }: TeamMemberCardProps) => {
  const { t, currentLanguage } = useTranslation();

  const translatedRole = member.role_translations?.[currentLanguage] || member.role;

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div
        className="h-full flex flex-col rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        style={{ background: 'linear-gradient(135deg, hsl(160,48%,14%) 0%, hsl(160,48%,8%) 100%)' }}
        onClick={onClick}
      >
        {/* Header */}
        <div className="p-6 text-center relative">
          <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-[hsl(43,74%,49%)]/30 shadow-xl group-hover:ring-[hsl(43,74%,49%)]/50 transition-all">
            {/* crop anchored toward the top of portrait headshots so faces
                aren't cut off by the circular frame */}
            <AvatarImage
              src={member.photo_url || undefined}
              alt={member.name}
              className="object-cover object-[50%_18%] scale-110"
            />
            <AvatarFallback className="bg-[hsl(43,74%,49%)] text-white text-2xl font-serif">
              {member.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>

          <h3 className="font-serif text-xl font-bold text-white mb-1">
            {member.name}
          </h3>
          {/* min-h-10 reserves two lines so long/short roles don't shift the rows below */}
          <p className="text-[hsl(43,74%,49%)] text-sm font-medium min-h-10">
            {translatedRole}
          </p>

          {member.is_founder && (
            <Badge className="absolute top-4 right-4 bg-[hsl(43,74%,49%)] text-[hsl(160,48%,12%)] text-xs font-bold rounded-full">
              {t.team?.card?.founder || "Founder"}
            </Badge>
          )}

          {/* strict boolean check: `0 && …` would render a literal "0" text node,
              adding an invisible line that pushes the rows below out of alignment */}
          {(member.years_experience ?? 0) > 0 && (
            <div className="absolute top-4 left-4 bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
              {member.years_experience}+ {t.team?.card?.yearsExperience || "yrs"}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex flex-col flex-1">
          {member.languages_spoken && member.languages_spoken.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-[hsl(43,74%,49%)] flex-shrink-0" />
              <span className="text-sm text-white/60 line-clamp-1">
                {member.languages_spoken.slice(0, 4).join(', ')}
                {member.languages_spoken.length > 4 && ` +${member.languages_spoken.length - 4}`}
              </span>
            </div>
          )}

          {member.specializations && member.specializations.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-[hsl(43,74%,49%)] flex-shrink-0" />
              <span className="text-sm text-white/60 line-clamp-1">
                {member.specializations.slice(0, 2).join(', ')}
              </span>
            </div>
          )}

          {member.credentials && member.credentials.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {member.credentials.slice(0, 2).map((cred, i) => (
                <Badge key={i} variant="outline" className="text-xs border-[hsl(43,74%,49%)]/30 text-white/80 rounded-full">
                  <Award className="w-3 h-3 mr-1 text-[hsl(43,74%,49%)]" />
                  {cred}
                </Badge>
              ))}
            </div>
          )}

          {/* mt-auto pins the button to the card bottom so both cards' button rows align */}
          <div className="flex mt-auto">
            <Button
              variant="outline"
              className="flex-1 bg-transparent border-[hsl(43,74%,49%)]/40 text-white hover:bg-[hsl(43,74%,49%)] hover:text-[hsl(160,48%,12%)] transition-colors rounded-xl"
              onClick={onClick}
            >
              {t.team?.card?.viewProfile || "View Profile"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
