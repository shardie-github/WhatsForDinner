import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
serve(async(req)=>{
  if(req.method!=='POST')return new Response('Method Not Allowed',{status:405});
  try{
    const {record}=await req.json();
    const userId=record?.id, email=record?.email??null;
    const url=Deno.env.get('SUPABASE_URL')!, key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const r=await fetch(`${url}/rest/v1/profiles`,{
      method:'POST',headers:{
        'Content-Type':'application/json',apikey:key,Authorization:`Bearer ${key}`,Prefer:'resolution=merge-duplicates'
      },body:JSON.stringify({
        user_id:userId,email,full_name:record?.user_metadata?.full_name??null,
        avatar_url:record?.user_metadata?.avatar_url??null
      })
    });
    if(!r.ok)return new Response(`Upsert failed: ${await r.text()}`,{status:500});
    return new Response(JSON.stringify({ok:true}),{headers:{'content-type':'application/json'}});
  }catch(e){return new Response(`Error:${e}`,{status:500});}
});
