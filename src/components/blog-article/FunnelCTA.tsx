import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { FunnelStage } from "@/types/blog";

interface CTAArticle {
  id: string;
  slug: string;
  headline: string;
  category: string;
  language: string;
  featured_image_url: string;
}

interface FunnelCTAProps {
  funnelStage: FunnelStage;
  ctaArticles: CTAArticle[];
}

export const FunnelCTA = ({ funnelStage, ctaArticles }: FunnelCTAProps) => {
  if (funnelStage === "BOFU") {
    return null;
  }

  if (ctaArticles.length === 0) return null;

  const ctaTitle = funnelStage === "TOFU" 
    ? "Ready to Learn More?" 
    : "Ready to Make a Decision?";
  
  const ctaDescription = funnelStage === "TOFU"
    ? "Explore these detailed guides to dive deeper into your specific interests"
    : "Take the final step with this comprehensive guide";

  return (
    <div className="my-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{ctaTitle}</h2>
        <p className="text-muted-foreground">{ctaDescription}</p>
      </div>

      <div className={`grid gap-6 ${ctaArticles.length > 1 ? "md:grid-cols-2" : "max-w-2xl mx-auto"}`}>
        {ctaArticles.map((article) => (
          <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <img
                src={article.featured_image_url}
                alt={article.headline}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="p-6 space-y-4">
                <Badge variant="secondary">{article.category}</Badge>
                <h3 className="text-xl font-semibold">{article.headline}</h3>
                <Button asChild className="w-full gap-2">
                  <Link to={`/${article.language}/blog/${article.slug}`}>
                    {funnelStage === "TOFU" ? "Learn More" : "Take Action"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
