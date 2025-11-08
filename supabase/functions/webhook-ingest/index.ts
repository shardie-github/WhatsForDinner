// Edge Function: webhook-ingest
// Generic POST intake for webhooks, writes to api_logs table

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase credentials" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Use service role for writes
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    let payload: unknown;
    try {
      payload = JSON.parse(body);
    } catch {
      payload = body;
    }

    const source = req.headers.get("x-webhook-source") || "unknown";
    const externalId = req.headers.get("x-webhook-id") || `webhook_${Date.now()}`;

    // Write to api_logs (or webhook_events if that table exists)
    const { data, error } = await supabase
      .from("api_logs")
      .insert({
        source,
        external_id: externalId,
        payload: typeof payload === "object" ? payload : { raw: payload },
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // Try webhook_events table as fallback
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("webhook_events")
        .insert({
          source,
          external_id: externalId,
          payload: typeof payload === "object" ? payload : { raw: payload },
          processed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (fallbackError) {
        return new Response(
          JSON.stringify({ error: "Failed to log webhook", details: fallbackError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ ok: true, id: fallbackData.id }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, id: data.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
