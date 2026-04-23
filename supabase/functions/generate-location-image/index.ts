import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { generateImage as kieGenerateImage } from "../_shared/kieClient.ts";

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

    const KIE_API_KEY = Deno.env.get("KIE_API_KEY");
    if (!KIE_API_KEY) {
      throw new Error("KIE_API_KEY is not configured. Add it in Cloud secrets.");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const finalPrompt =
      image_prompt ||
      `4K cinematic editorial photograph representing wealth management and retirement planning in ${city_name}, USA. Modern financial metaphor: glass-and-steel architecture at golden hour, soft volumetric light, shallow depth of field, institutional sophistication. No text, no logos, no people in foreground. Aspect 16:9.`;

    console.log(`[generate-location-image] Generating image via Kie.ai Nano Banana 2 for ${city_name} (${location_page_id})`);

    // Generate via Kie.ai Nano Banana 2 (shared client)
    const { url: kieUrl } = await kieGenerateImage({
      prompt: finalPrompt,
      aspectRatio: "16:9",
      resolution: "2K",
      outputFormat: "jpg",
    });

    console.log(`[generate-location-image] Kie returned image, mirroring to Supabase Storage: ${kieUrl}`);

    // Mirror Kie-hosted image into Supabase Storage (Kie URLs expire)
    const imgResp = await fetch(kieUrl);
    if (!imgResp.ok) {
      throw new Error(`Failed to download Kie image: ${imgResp.status}`);
    }
    const contentType = imgResp.headers.get("content-type") || "image/jpeg";
    const binary = new Uint8Array(await imgResp.arrayBuffer());

    const ext = contentType.includes("png") ? "png" : "jpg";
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
