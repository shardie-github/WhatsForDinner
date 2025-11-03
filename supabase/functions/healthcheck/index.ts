import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
serve((_req)=>new Response(JSON.stringify({
  ok:true, service:"healthcheck", ts:new Date().toISOString(),
  version:Deno.env.get("RELEASE_VERSION")??"dev"
}),{headers:{'content-type':'application/json'},status:200}));
