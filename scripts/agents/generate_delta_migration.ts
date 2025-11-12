#!/usr/bin/env node
import { withDb } from "../lib/db"; import { log, err } from "../lib/logger"; import fs from "fs"; import path from "path";
(async()=>{
  const client=await import("pg").then(m=>new m.Client({connectionString:process.env.SUPABASE_DB_URL||process.env.DATABASE_URL}));
  await client.connect(); const missing:string[]=[]; let sql="";
  try{
    const extRes=await client.query("SELECT extname FROM pg_extension WHERE extname IN ('pgcrypto','pg_trgm')");
    const existingExts=extRes.rows.map((r:any)=>r.extname);
    if(!existingExts.includes("pgcrypto")){ missing.push("pgcrypto"); sql+="CREATE EXTENSION IF NOT EXISTS pgcrypto;\n"; }
    if(!existingExts.includes("pg_trgm")){ missing.push("pg_trgm"); sql+="CREATE EXTENSION IF NOT EXISTS pg_trgm;\n"; }
    const tables=["events","spend","metrics_daily"];
    for(const t of tables){
      const exists=await client.query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1)",[t]);
      if(!exists.rows[0].exists){ missing.push(`table:${t}`); }
    }
    const funcs=["upsert_events","upsert_spend","recompute_metrics_daily","system_healthcheck"];
    for(const f of funcs){
      const exists=await client.query("SELECT EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace=n.oid WHERE n.nspname='public' AND p.proname=$1)",[f]);
      if(!exists.rows[0].exists){ missing.push(`function:${f}`); }
    }
    if(missing.length>0){
      const stamp=new Date().toISOString().replace(/[:.]/g,"-").slice(0,19);
      const fname=`${stamp}_delta.sql`; const fpath=path.join("supabase","migrations",fname);
      if(sql.length===0){ sql="-- Delta: Missing objects detected. Apply /supabase/migrations/000000000800_upsert_functions.sql\n"; }
      fs.writeFileSync(fpath,sql); log(`Delta migration written: ${fpath} (${missing.length} missing)`);
    }else{ log("No missing objects. DB up to date."); }
  }finally{ await client.end(); }
})().catch(e=>{ err(e); process.exit(1); });
