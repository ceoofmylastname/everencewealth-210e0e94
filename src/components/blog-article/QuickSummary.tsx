import { Zap, CheckCircle } from "lucide-react";

interface QuickSummaryProps {
  headline: string;
  keyTakeaways?: string[];
  bottomLine: string;
  readTime?: number;
  language?: string;
}

const labelTranslations: Record<string, { title: string; bottomLineLabel: string; readTimeLabel: string }> = {
  en: { title: "Quick Summary", bottomLineLabel: "Bottom Line", readTimeLabel: "min read" },
  es: { title: "Resumen Rápido", bottomLineLabel: "Conclusión", readTimeLabel: "min de lectura" },
};

function extractKeyTakeaways(headline: string, bottomLine: string): string[] {
  const takeaways: string[] = [];
  
  if (headline.toLowerCase().includes('retirement') || 
      headline.toLowerCase().includes('401k') ||
      headline.toLowerCase().includes('ira')) {
    takeaways.push('Maximize employer-matched 401(k) contributions first');
    takeaways.push('Consider Roth IRA for tax-free growth potential');
    takeaways.push('Coordinate Social Security timing for optimal benefits');
    takeaways.push('Diversify across all three tax buckets');
  } else if (headline.toLowerCase().includes('iul') || headline.toLowerCase().includes('life insurance')) {
    takeaways.push('IUL provides tax-free retirement income potential');
    takeaways.push('Market-linked growth with downside protection (0% floor)');
    takeaways.push('Living benefits can cover long-term care expenses');
    takeaways.push('Policy loans are generally income tax-free');
  } else if (headline.toLowerCase().includes('tax') || headline.toLowerCase().includes('estate')) {
    takeaways.push('Proper planning can significantly reduce tax burden');
    takeaways.push('Estate planning protects assets for future generations');
    takeaways.push('Annual gift exclusion and trust strategies available');
  } else if (headline.toLowerCase().includes('annuit') || headline.toLowerCase().includes('income')) {
    takeaways.push('Guaranteed income streams for retirement security');
    takeaways.push('Tax-deferred growth until withdrawal');
    takeaways.push('Multiple payout options to fit your needs');
  }
  
  if (takeaways.length === 0) {
    takeaways.push('Expert guidance for wealth management decisions');
    takeaways.push('Up-to-date information for 2026');
    takeaways.push('Step-by-step strategy explained');
  }
  
  return takeaways.slice(0, 4);
}

export const QuickSummary = ({ 
  headline, 
  keyTakeaways, 
  bottomLine, 
  readTime,
  language = 'en'
}: QuickSummaryProps) => {
  const labels = labelTranslations[language] || labelTranslations.en;
  
  const takeaways = keyTakeaways && keyTakeaways.length > 0 
    ? keyTakeaways 
    : extractKeyTakeaways(headline, bottomLine);

  return (
    <div className="quick-summary my-8 md:my-12 rounded-2xl bg-gradient-to-br from-accent/10 via-background to-primary/5 border border-border shadow-md overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-accent/20 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">{labels.title}</h2>
        </div>
        {readTime && (
          <span className="text-sm text-muted-foreground">
            {readTime} {labels.readTimeLabel}
          </span>
        )}
      </div>
      
      <div className="px-6 py-5 space-y-3">
        <ul className="space-y-2.5">
          {takeaways.map((takeaway, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-foreground/90">{takeaway}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="px-6 py-4 bg-primary/5 border-t border-border">
        <div className="flex items-start gap-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary whitespace-nowrap">
            {labels.bottomLineLabel}:
          </span>
          <p className="text-foreground/90 leading-relaxed">{bottomLine}</p>
        </div>
      </div>
    </div>
  );
};
