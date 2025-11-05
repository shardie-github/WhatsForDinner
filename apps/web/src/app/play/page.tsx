"use client";
import { useEffect, useState } from "react";
import { GamificationProvider, useGamify } from "@/components/gamification/GamificationProvider";
import ProgressRing from "@/components/gamification/ProgressRing";
import StreakFlame from "@/components/gamification/StreakFlame";
import QuestCard from "@/components/gamification/QuestCard";
import AvatarStack from "@/components/social/AvatarStack";
import ShareButton from "@/components/social/ShareButton";
import dynamic from "next/dynamic";

const LiveVisitors = dynamic(()=>import("@/components/integrations/LiveVisitors").then(m=>m.default), { ssr:false });

function HubInner(){
  const { level, xp, dailyGoal, streak } = useGamify();
  const pct = Math.min(1, (xp % 100)/dailyGoal);
  const currentXp = xp % 100;
  const [peers, setPeers] = useState<string[]>([]);
  useEffect(()=>{ setPeers([
    "https://i.pravatar.cc/64?img=1","https://i.pravatar.cc/64?img=2","https://i.pravatar.cc/64?img=3",
    "https://i.pravatar.cc/64?img=4","https://i.pravatar.cc/64?img=5","https://i.pravatar.cc/64?img=6"
  ]); }, []);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Play Hub</h1>
        <LiveVisitors />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border p-4 flex flex-col items-center gap-2">
          <ProgressRing value={pct}/>
          <div className="text-sm">Level {level} · {currentXp}/{dailyGoal} XP</div>
        </div>
        <div className="rounded-2xl border p-4 grid place-items-center">
          <StreakFlame days={streak}/>
          <div className="text-sm mt-2">{streak ? `${streak}-day streak` : "Start your streak"}</div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="text-sm font-semibold mb-2">Peers active now</div>
          <AvatarStack urls={peers}/>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-semibold">Daily Quests</div>
        <QuestCard title="Complete one journal entry" xp={20}/>
        <QuestCard title="Share a tip in community" xp={15}/>
        <QuestCard title="Invite a friend" xp={25}/>
      </div>

      <div className="flex gap-2">
        <a className="h-10 px-4 rounded-xl bg-secondary grid place-items-center" href="/journal">Open Journal</a>
        <a className="h-10 px-4 rounded-xl bg-secondary grid place-items-center" href="/community">Community</a>
        <ShareButton />
      </div>
    </div>
  );
}

export default function PlayPage(){
  return (<GamificationProvider><HubInner/></GamificationProvider>);
}
