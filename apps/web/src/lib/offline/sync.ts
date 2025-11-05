import { createClient } from "@supabase/supabase-js";
import { getLocal, setLocal } from "./db";
export async function syncUp(userId:string, table:string, rows:any[]){
  if(!rows?.length) return { synced:0 };
  const supa=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { error } = await supa.from(table).upsert(rows.map(r=>({ user_id:userId, ...r })));
  if(error) throw error; return { synced: rows.length };
}
export async function syncDown(userId:string, table:string){
  const supa=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await supa.from(table).select("*").eq("user_id",userId).order("updated_at",{ascending:false}).limit(500);
  await setLocal(`${table}:cache`, data||[]);
  return data||[];
}
