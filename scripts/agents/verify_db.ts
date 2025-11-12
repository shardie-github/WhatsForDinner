#!/usr/bin/env node
import { withDb } from "../lib/db"; import { log, err } from "../lib/logger";
(async()=>{
  let fail=0;
  await withDb(async c=>{
    const tables=["events","spend","metrics_daily"];
    for(const t of tables){
      const r=await c.query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1)",[t]);
      if(r.rows[0].exists){ log(`✅ Table ${t} exists`); }else{ err(`❌ Table ${t} missing`); fail++; }
    }
    const idxs=["idx_events_name_time","idx_spend_platform_dt","idx_metrics_day"];
    for(const i of idxs){
      const r=await c.query("SELECT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname=$1)",[i]);
      if(r.rows[0].exists){ log(`✅ Index ${i} exists`); }else{ err(`❌ Index ${i} missing`); fail++; }
    }
    const funcs=["upsert_events","upsert_spend","recompute_metrics_daily","system_healthcheck"];
    for(const f of funcs){
      const r=await c.query("SELECT EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace=n.oid WHERE n.nspname='public' AND p.proname=$1)",[f]);
      if(r.rows[0].exists){ log(`✅ Function ${f} exists`); }else{ err(`❌ Function ${f} missing`); fail++; }
    }
    for(const t of tables){
      const rls=await c.query("SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON c.relnamespace=n.oid WHERE n.nspname='public' AND c.relname=$1",[t]);
      if(rls.rows.length>0&&rls.rows[0].relrowsecurity){ log(`✅ RLS enabled on ${t}`); }else{ err(`❌ RLS not enabled on ${t}`); fail++; }
      const pol=await c.query("SELECT COUNT(*) as cnt FROM pg_policies WHERE schemaname='public' AND tablename=$1",[t]);
      if(parseInt(pol.rows[0].cnt)>=1){ log(`✅ Policies exist on ${t}`); }else{ err(`❌ No policies on ${t}`); fail++; }
    }
  });
  if(fail>0){ err(`Verification failed: ${fail} checks failed`); process.exit(1); }
  log("✅ All DB checks passed");
})().catch(e=>{ err(e); process.exit(1); });
