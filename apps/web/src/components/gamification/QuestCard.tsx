"use client";
import { awardXp } from "./GamificationProvider";
import { useState } from "react";
export default function QuestCard({ title, xp=10, done=false }: { title: string; xp?: number; done?: boolean }) {
  const [completed, setCompleted] = useState(done);
  return (
    <div className="rounded-2xl border border-border p-4 flex items-center justify-between gap-3 bg-card">
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{xp} XP</div>
      </div>
      <button
        className={`h-10 px-4 rounded-xl text-sm font-medium ${completed?"bg-secondary":"bg-primary text-primary-fg"}`}
        onClick={()=>{ if(!completed){ awardXp(xp); setCompleted(true);} }}
        aria-pressed={completed}
      >{completed?"Done":"Complete"}</button>
    </div>
  );
}
