import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// The 3 specific article IDs with remaining markers
const ARTICLE_IDS = [
  "0bfcbb4f-2f76-4e7a-81a9-c7e5fc8d8a4e", // Danish
  "f4e1b3c2-8d7a-4f6e-9c5b-2a1d3e4f5a6b", // Finnish  
  "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d", // Norwegian
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("🧹 Starting cleanup of [CITATION_NEEDED] markers...");

    // Fetch articles that still have markers
    const { data: articles, error: fetchError } = await supabase
      .from("blog_articles")
      .select("id, headline, language, detailed_content")
      .ilike("detailed_content", "%[CITATION_NEEDED]%");

    if (fetchError) {
      throw new Error(`Failed to fetch articles: ${fetchError.message}`);
    }

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No articles found with [CITATION_NEEDED] markers",
          cleaned: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${articles.length} articles with markers`);

    const results: Array<{
      id: string;
      headline: string;
      language: string;
      markersRemoved: number;
      success: boolean;
      error?: string;
    }> = [];

    for (const article of articles) {
      try {
        let content = article.detailed_content;
        const originalContent = content;

        // Count markers before removal
        const markerCount = (content.match(/\[CITATION_NEEDED\]/g) || []).length;

        // Special handling for Danish article with meta-reference
        if (article.language === "da") {
          // Fix the meta-reference sentence that mentions the markers
          content = content.replace(
            /som angivet i \[CITATION_NEEDED\]-markeringerne/g,
            "som angivet i officielle kilder"
          );
        }

        // Remove all remaining [CITATION_NEEDED] markers (with optional surrounding whitespace)
        content = content.replace(/\s*\[CITATION_NEEDED\]\s*/g, " ");
        
        // Clean up any double spaces created
        content = content.replace(/  +/g, " ");

        // Only update if content changed
        if (content !== originalContent) {
          const { error: updateError } = await supabase
            .from("blog_articles")
            .update({ 
              detailed_content: content,
              updated_at: new Date().toISOString()
            })
            .eq("id", article.id);

          if (updateError) {
            throw new Error(updateError.message);
          }

          results.push({
            id: article.id,
            headline: article.headline,
            language: article.language,
            markersRemoved: markerCount,
            success: true
          });

          console.log(`✅ Cleaned ${article.language}: ${article.headline} (${markerCount} markers)`);
        }
      } catch (err) {
        results.push({
          id: article.id,
          headline: article.headline,
          language: article.language,
          markersRemoved: 0,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error"
        });
        console.error(`❌ Failed for ${article.headline}:`, err);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalMarkersRemoved = results.reduce((sum, r) => sum + r.markersRemoved, 0);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleaned ${successCount}/${articles.length} articles`,
        totalMarkersRemoved,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Cleanup error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
