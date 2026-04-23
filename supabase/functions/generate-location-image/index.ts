import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      location_page_id,
      city_name,
      city_slug,
      topic_slug,
      image_prompt,
    } = await req.json();

    if (!location_page_id || !city_slug || !topic_slug) {
      return new Response(
        JSON.stringify({ error: "location_page_id, city_slug, and topic_slug are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const finalPrompt =
      image_prompt ||
      `Professional aerial photography of ${city_name}, USA. Modern cityscape skyline, institutional financial district, wealth management imagery. Ultra high resolution, corporate marketing style, clean professional lighting.`;

    console.log(`[generate-location-image] Generating image for ${city_name} (${location_page_id})`);

    // Call Lovable AI image gateway (Nano Banana 2)
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [{ role: "user", content: finalPrompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add funds in Lovable AI workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway image error: ${aiResp.status} - ${errText}`);
    }

    const aiData = await aiResp.json();
    const dataUrl: string | undefined =
      aiData?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!dataUrl || !dataUrl.startsWith("data:")) {
      throw new Error("AI Gateway returned no image data");
    }

    // Decode base64 -> bytes
    const commaIdx = dataUrl.indexOf(",");
    const meta = dataUrl.slice(0, commaIdx); // e.g. "data:image/png;base64"
    const base64 = dataUrl.slice(commaIdx + 1);
    const contentType = meta.match(/data:([^;]+);/)?.[1] || "image/png";
    const ext = contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "png";

    const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    // Upload to article-images bucket
    const fileName = `state-${city_slug}-${topic_slug}.${ext}`;
    const filePath = `state-pages/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("article-images")
      .upload(filePath, binary, {
        contentType,
        upsert: true,
        cacheControl: "31536000",
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("article-images")
      .getPublicUrl(filePath);
    const publicUrl = publicUrlData.publicUrl;

    const altText = `${city_name} skyline — wealth management and retirement planning resources`;

    // Update location_pages row
    const { error: updateError } = await supabase
      .from("location_pages")
      .update({
        featured_image_url: publicUrl,
        featured_image_alt: altText,
        updated_at: new Date().toISOString(),
      })
      .eq("id", location_page_id);

    if (updateError) {
      throw new Error(`Failed to update location_pages: ${updateError.message}`);
    }

    console.log(`[generate-location-image] Success: ${publicUrl}`);

    return new Response(
      JSON.stringify({ success: true, url: publicUrl, alt: altText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[generate-location-image] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
