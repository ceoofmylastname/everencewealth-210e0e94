import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
];

interface ComparisonLanguageSwitcherProps {
  currentLanguage: string;
  translations: Record<string, string> | null;
  currentSlug: string;
}

export function ComparisonLanguageSwitcher({ 
  currentLanguage, 
  translations,
  currentSlug,
}: ComparisonLanguageSwitcherProps) {
  // Build available languages map (include current)
  const availableLanguages: Record<string, string> = {
    [currentLanguage]: currentSlug,
    ...(translations || {}),
  };

  const availableLangCodes = Object.keys(availableLanguages);
  
  // Only show if there are translations
  if (availableLangCodes.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
      <span className="text-xs text-muted-foreground mr-2">Available in:</span>
      {LANGUAGES.filter(lang => availableLangCodes.includes(lang.code)).map(lang => {
        const slug = availableLanguages[lang.code];
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
