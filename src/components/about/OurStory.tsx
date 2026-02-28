import { motion } from "framer-motion";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { History, Lightbulb, TrendingUp } from "lucide-react";
import { useTranslation } from "@/i18n";

interface OurStoryProps {
  content: string;
}

interface TimelineItem {
  year: string;
  event: string;
}

export const OurStory = ({ content }: OurStoryProps) => {
  const { t } = useTranslation();
  const aboutUs = t.aboutUs as Record<string, unknown> | undefined;
  const story = aboutUs?.story as { heading?: string; subheading?: string; timelineHeading?: string; timeline?: TimelineItem[]; narrativeHeading?: string; narrativeContent?: string } | undefined;

  const narrativeContent = story?.narrativeContent || content;

  const parseMarkdown = (markdown: string): string => {
    try {
      const html = marked.parse(markdown, { async: false }) as string;
      return DOMPurify.sanitize(html);
    } catch {
      return markdown;
    }
  };

  const defaultTimeline = [
    { year: "Origin", event: "Steven Rosenberg establishes Everence Wealth as an independent fiduciary" },
    { year: "2005", event: "Expanded to all 50 states licensing" },
    { year: "2015", event: "Three Tax Buckets framework developed" },
    { year: "2024", event: "Digital wealth planning platform launched" }
  ];

  const timelineItems = story?.timeline || defaultTimeline;
  const icons = [History, History, Lightbulb, TrendingUp];

  return (
    <section className="py-20 bg-muted" aria-labelledby="story-heading">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-16">
            <h2 id="story-heading" className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              {story?.heading || "Our Story"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {story?.subheading || "From three individual journeys to one shared mission"}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
            <div className="space-y-8">
              <h3 className="font-serif text-2xl font-bold text-foreground mb-6">
                {story?.timelineHeading || "Our Journey"}
              </h3>

              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[hsl(43,74%,49%)]/30" />

                {timelineItems.map((item, index) => {
                  const IconComponent = icons[index] || History;
                  return (
                    <motion.div
                      key={item.year}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.15 }}
                      className="relative flex gap-6 pb-8 last:pb-0"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[hsl(43,74%,49%)] flex items-center justify-center shrink-0 z-10 shadow-lg">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="pt-2">
                        <span className="text-[hsl(43,74%,49%)] font-bold text-lg">{item.year}</span>
                        <p className="text-foreground mt-1">{item.event}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div
              className="prose prose-lg prose-slate prose-headings:font-serif prose-headings:text-foreground prose-h2:text-2xl prose-h3:text-xl prose-a:text-[hsl(43,74%,49%)] prose-strong:text-foreground max-w-none"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(narrativeContent) }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
