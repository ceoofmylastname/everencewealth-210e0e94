import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
];

interface ComparisonLanguageSwitcherProps {
  currentLanguage: string;
  translations: Record<string, string> | null;
  currentSlug: string;
  comparisonTopic?: string;
}

export function ComparisonLanguageSwitcher({ 
  currentLanguage, 
  translations,
  currentSlug,
  comparisonTopic,
}: ComparisonLanguageSwitcherProps) {
  const [verifiedLanguages, setVerifiedLanguages] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const verify = async () => {
      if (!comparisonTopic) {
        setVerifiedLanguages({ [currentLanguage]: currentSlug });
        return;
      }

      const { data } = await supabase
        .from('comparison_pages')
        .select('language, slug')
        .eq('comparison_topic', comparisonTopic)
        .eq('status', 'published');

      if (data && data.length > 0) {
        const map: Record<string, string> = {};
        data.forEach(row => { map[row.language] = row.slug; });
        setVerifiedLanguages(map);
      } else {
        setVerifiedLanguages({ [currentLanguage]: currentSlug });
      }
    };
    verify();
  }, [comparisonTopic, currentLanguage, currentSlug]);

  if (!verifiedLanguages) return null;

  const availableLangCodes = Object.keys(verifiedLanguages);
  if (availableLangCodes.length <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
      <span className="text-xs text-muted-foreground mr-2">Available in:</span>
      {LANGUAGES.filter(lang => availableLangCodes.includes(lang.code)).map(lang => {
        const slug = verifiedLanguages[lang.code];
        const isActive = lang.code === currentLanguage;
        
        return (
          <Link 
            key={lang.code}
            to={`/${lang.code}/compare/${slug}`}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted hover:bg-primary/10 hover:text-primary"
            )}
          >
            <span>{lang.flag}</span>
            <span className="uppercase text-xs">{lang.code}</span>
          </Link>
        );
      })}
    </div>
  );
}
