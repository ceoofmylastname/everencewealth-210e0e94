import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n";
import { TeamMemberCard } from "./TeamMemberCard";
import { TeamMemberModal } from "./TeamMemberModal";
import { Button } from "@/components/ui/button";
import { Users, Star } from "lucide-react";

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
  display_order: number;
}

export const TeamGrid = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'founders'>('all');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as TeamMember[];
    }
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const filteredMembers = filter === 'founders'
    ? teamMembers?.filter(m => m.is_founder)
    : teamMembers;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-center gap-4 mb-12">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={`rounded-xl ${filter === 'all' ? 'bg-[hsl(43,74%,49%)] text-[hsl(160,48%,12%)] hover:bg-[hsl(43,74%,49%)]/90' : ''}`}
          >
            <Users className="w-4 h-4 mr-2" />
            {t.team?.filters?.all || "All Team Members"}
          </Button>
          <Button
            variant={filter === 'founders' ? 'default' : 'outline'}
            onClick={() => setFilter('founders')}
            className={`rounded-xl ${filter === 'founders' ? 'bg-[hsl(43,74%,49%)] text-[hsl(160,48%,12%)] hover:bg-[hsl(43,74%,49%)]/90' : ''}`}
          >
            <Star className="w-4 h-4 mr-2" />
            {t.team?.filters?.founders || "Founders"}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {filteredMembers?.map((member, index) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              index={index}
              onClick={() => setSelectedMember(member)}
            />
          ))}
        </div>

        {(!filteredMembers || filteredMembers.length === 0) && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {t.team?.empty || "No team members found"}
            </p>
          </div>
        )}
      </div>

      <TeamMemberModal
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </section>
  );
};
