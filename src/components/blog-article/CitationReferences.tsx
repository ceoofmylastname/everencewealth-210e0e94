import { ExternalCitation } from "@/types/blog";

interface CitationReferencesProps {
  citations: ExternalCitation[];
}

export const CitationReferences = ({ citations }: CitationReferencesProps) => {
  if (!citations || citations.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border" aria-label="Sources and References">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Sources &amp; References</h2>
      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
        {citations.map((citation, index) => {
          const source = citation.source || citation.sourceName || '';
          const text = citation.text || citation.anchorText || '';
          const label = source || text || citation.url;

          return (
            <li key={index} id={`citation-${index + 1}`} className="leading-relaxed">
              {citation.url ? (
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 underline transition-colors"
                >
                  {label}
                </a>
              ) : (
                <span>{label}</span>
              )}
              {source && text && (
                <span className="ml-1">— {text}</span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
};
