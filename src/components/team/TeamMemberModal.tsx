import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/i18n";
import { COMPANY_CONTACT } from "@/constants/company";
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Linkedin, 
  Globe, 
  Award, 
  Briefcase,
  MapPin,
  X
} from "lucide-react";
import { TeamMemberContactForm } from "./TeamMemberContactForm";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  role_translations: Record<string, string> | null;
  bio: string | null;
  bio_translations: Record<string, string> | null;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  linkedin_url: string | null;
  languages_spoken: string[] | null;
  specializations: string[] | null;
  areas_of_expertise: string[] | null;
  years_experience: number | null;
  credentials: string[] | null;
  is_founder: boolean;
}

interface TeamMemberModalProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TeamMemberModal = ({ member, isOpen, onClose }: TeamMemberModalProps) => {
  const { t, currentLanguage } = useTranslation();

  if (!member) return null;

  const translatedRole = member.role_translations?.[currentLanguage] || member.role;
  const translatedBio = member.bio_translations?.[currentLanguage] || member.bio;

  const handleWhatsAppClick = () => {
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

  const handleEmailClick = () => {
    const email = member.email || COMPANY_CONTACT.email;
    window.location.href = `mailto:${email}?subject=Property Inquiry - Contact via ${member.name}`;
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'email_click', {
        category: 'Team',
        label: member.name
      });
    }
  };

  const handleCallClick = () => {
    const phone = member.phone || COMPANY_CONTACT.phoneClean;
    window.location.href = `tel:${phone}`;
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'phone_click', {
        category: 'Team',
        label: member.name
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-prime-900 to-prime-800 p-6 text-center relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          <Avatar className="w-28 h-28 mx-auto mb-4 ring-4 ring-prime-gold/40 shadow-xl">
            <AvatarImage 
              src={member.photo_url || undefined} 
              alt={member.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-prime-gold text-white text-3xl font-serif">
              {member.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold text-white mb-1">
              {member.name}
            </DialogTitle>
          </DialogHeader>
          
          <p className="text-prime-gold text-sm font-medium mb-2">
            {translatedRole}
          </p>
          
          {member.is_founder && (
            <Badge className="bg-prime-gold text-prime-900 text-xs font-bold">
              {t.team?.modal?.founder || "Founder"}
            </Badge>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Contact buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={handleWhatsAppClick}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t.team?.modal?.whatsapp || "WhatsApp"}
            </Button>
            <Button 
              variant="outline"
              className="flex-1"
              onClick={handleEmailClick}
            >
              <Mail className="w-4 h-4 mr-2" />
              {t.team?.modal?.email || "Email"}
            </Button>
            <Button 
              variant="outline"
              onClick={handleCallClick}
            >
              <Phone className="w-4 h-4 mr-2" />
              {t.team?.modal?.call || "Call"}
            </Button>
            {member.linkedin_url && (
              <Button 
                variant="outline"
                asChild
              >
                <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>

          <Separator />

          {/* Bio */}
          {translatedBio && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-prime-gold" />
                {t.team?.modal?.about || "About"}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {translatedBio}
              </p>
            </div>
          )}

          {/* Languages */}
          {member.languages_spoken && member.languages_spoken.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-prime-gold" />
                {t.team?.modal?.languages || "Languages"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {member.languages_spoken.map((lang, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Specializations */}
          {member.specializations && member.specializations.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-prime-gold" />
                {t.team?.modal?.specializations || "Specializations"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {member.specializations.map((spec, i) => (
                  <Badge key={i} variant="outline" className="text-xs border-prime-gold/30">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Areas of Expertise */}
          {member.areas_of_expertise && member.areas_of_expertise.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-prime-gold" />
                {t.team?.modal?.expertise || "Areas of Expertise"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {member.areas_of_expertise.map((area, i) => (
                  <Badge key={i} variant="outline" className="text-xs border-prime-gold/30">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Credentials */}
          {member.credentials && member.credentials.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-prime-gold" />
                {t.team?.modal?.credentials || "Credentials"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {member.credentials.map((cred, i) => (
                  <Badge key={i} className="text-xs bg-prime-gold/10 text-prime-800 border-0">
                    {cred}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Contact form */}
          <TeamMemberContactForm memberName={member.name} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
