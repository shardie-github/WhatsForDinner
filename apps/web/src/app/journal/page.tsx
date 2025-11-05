"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Confetti from "@/components/gamification/Confetti";
import { hapticTap } from "@/components/gamification/Haptics";

export default function JournalPage(){
  const [text, setText] = useState(""); const [saved, setSaved] = useState(false);
  async function save() {
    hapticTap();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("journal_entries").insert({ user_id: user.id, body: text }).select("*").single();
    setSaved(!error);
    if (!error) setText("");
  }
  useEffect(()=>{ if(saved) { const t = setTimeout(()=>setSaved(false), 2000); return ()=>clearTimeout(t); } }, [saved]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Journal</h1>
      <textarea value={text} onChange={e=>setText(e.target.value)} rows={8}
        className="w-full rounded-xl border border-border p-3" placeholder="Reflect on today's progress…"/>
      <div className="flex gap-2">
        <button className="h-10 px-4 rounded-xl bg-primary text-primary-fg" onClick={save}>Save Entry</button>
      </div>
      <div aria-live="polite" className="text-sm text-muted-foreground">{saved?"Saved ✓":""}</div>
      <Confetti when={saved}/>
    </div>
  );
}
