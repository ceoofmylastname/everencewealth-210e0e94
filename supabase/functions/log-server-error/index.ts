import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ErrorLogPayload {
  url_path: string;
  error_type: string;
  status_code?: number;
  error_message?: string;
  stack_trace?: string;
  user_agent?: string;
  referrer?: string;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    const payload: ErrorLogPayload = await req.json();
    
    // Validate required fields
    if (!payload.url_path || !payload.error_type) {
      return new Response(
        JSON.stringify({ error: 'url_path and error_type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get IP from headers (Cloudflare/proxy)
    const ip_address = req.headers.get('cf-connecting-ip') || 
                       req.headers.get('x-forwarded-for')?.split(',')[0] || 
                       'unknown';

    // Insert error log
    const { data, error } = await supabase
      .from('server_errors')
      .insert({
        url_path: payload.url_path,
        error_type: payload.error_type,
        status_code: payload.status_code || null,
        error_message: payload.error_message || null,
        stack_trace: payload.stack_trace || null,
        user_agent: payload.user_agent || req.headers.get('user-agent') || null,
        ip_address,
        referrer: payload.referrer || req.headers.get('referer') || null,
        metadata: payload.metadata || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to log error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to log error', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Logged server error: ${payload.error_type} at ${payload.url_path}`);
    
    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Error in log-server-error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});