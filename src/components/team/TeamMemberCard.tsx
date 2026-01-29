import { motion } from "framer-motion";
import { Globe, Award, MessageCircle, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "@/i18n";
import { COMPANY_CONTACT } from "@/constants/company";

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
  whatsapp: string | null;
  email: string | null;
}

interface TeamMemberCardProps {
  member: TeamMember;
  index: number;
  onClick: () => void;
}

export const TeamMemberCard = ({ member, index, onClick }: TeamMemberCardProps) => {
  const { t, currentLanguage } = useTranslation();
  
  // Get translated role
  const translatedRole = member.role_translations?.[currentLanguage] || member.role;
  
  // Handle WhatsApp click
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = member.whatsapp || COMPANY_CONTACT.phoneClean;
    const message = encodeURIComponent(`Hi ${member.name}, I'd like to discuss Costa del Sol properties with you.`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'whatsapp_click', {
        category: 'Team',
        label: member.name
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Card 
        className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
        onClick={onClick}
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-prime-900 to-prime-800 p-6 text-center relative">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
          
          <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-prime-gold/30 shadow-xl relative z-10 group-hover:ring-prime-gold/50 transition-all">
            <AvatarImage 
              src={member.photo_url || undefined} 
              alt={member.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-prime-gold text-white text-2xl font-serif">
              {member.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="font-serif text-xl font-bold text-white mb-1 relative z-10">
            {member.name}
          </h3>
          <p className="text-prime-gold text-sm font-medium relative z-10">
            {translatedRole}
          </p>
          
          {/* Founder badge */}
          {member.is_founder && (
            <Badge className="absolute top-4 right-4 bg-prime-gold text-prime-900 text-xs font-bold">
              {t.team?.card?.founder || "Founder"}
            </Badge>
          )}
          
          {/* Experience badge */}
          {member.years_experience && member.years_experience > 0 && (
            <div className="absolute top-4 left-4 bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
              {member.years_experience}+ {t.team?.card?.yearsExperience || "yrs"}
            </div>
          )}
        </div>

        <CardContent className="p-6">
          {/* Languages */}
          {member.languages_spoken && member.languages_spoken.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-prime-gold flex-shrink-0" />
              <span className="text-sm text-muted-foreground line-clamp-1">
                {member.languages_spoken.slice(0, 4).join(', ')}
                {member.languages_spoken.length > 4 && ` +${member.languages_spoken.length - 4}`}
              </span>
            </div>
          )}

          {/* Specializations */}
          {member.specializations && member.specializations.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-prime-gold flex-shrink-0" />
              <span className="text-sm text-muted-foreground line-clamp-1">
                {member.specializations.slice(0, 2).join(', ')}
              </span>
            </div>
          )}

          {/* Credentials */}
          {member.credentials && member.credentials.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {member.credentials.slice(0, 2).map((cred, i) => (
                <Badge key={i} variant="outline" className="text-xs border-prime-gold/30 text-prime-800">
                  <Award className="w-3 h-3 mr-1 text-prime-gold" />
                  {cred}
                </Badge>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 border-prime-gold/30 text-prime-800 hover:bg-prime-gold hover:text-white transition-colors"
              onClick={onClick}
            >
              {t.team?.card?.viewProfile || "View Profile"}
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleWhatsAppClick}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
