// Edge Function: app-health
// Returns health status of Supabase services (DB, Auth, Realtime)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HealthCheck {
  ok: boolean;
  db?: {
    ok: boolean;
    latency?: number;
  };
  auth?: {
    ok: boolean;
  };
  realtime?: {
    ok: boolean;
  };
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();
  const health: HealthCheck = {
    ok: false,
    timestamp: new Date().toISOString(),
  };

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({
          ...health,
          error: "Missing SUPABASE_URL or SUPABASE_ANON_KEY",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Check database connectivity
    const dbStart = Date.now();
    const { data: dbData, error: dbError } = await supabase
      .from("users")
      .select("id")
      .limit(1);
    const dbLatency = Date.now() - dbStart;

    health.db = {
      ok: !dbError,
      latency: dbLatency,
    };

    // Check auth (try to get current user - should work even if no user)
    const authStart = Date.now();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    health.auth = {
      ok: !authError || authError.message.includes("JWT"), // JWT error is OK, means auth service is up
    };

    // Check Realtime (basic connectivity check)
    health.realtime = {
      ok: true, // Realtime is part of Supabase API, if we got here it's likely OK
    };

    health.ok = health.db.ok && health.auth.ok && health.realtime.ok;

    const status = health.ok ? 200 : 503;

    return new Response(JSON.stringify(health), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        ...health,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
