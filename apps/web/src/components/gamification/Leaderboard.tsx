"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Badge from "@/components/gamification/Badge";
import Confetti from "@/components/gamification/Confetti";
import { hapticTap } from "@/components/gamification/Haptics";

export default function Leaderboard({ period = "weekly" }: { period?: "daily" | "weekly" | "monthly" | "all_time" }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  async function loadLeaderboard() {
    const { data: { user } } = await supabase.auth.getUser();
    const periodStart = getPeriodStart(period);
    
    const { data } = await supabase
      .from("leaderboard_entries")
      .select("*, profiles(display_name, avatar_url, total_xp)")
      .eq("period", period)
      .eq("period_start", periodStart)
      .order("xp", { ascending: false })
      .limit(20);

    if (data) {
      const ranked = data.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
      setEntries(ranked);
      
      if (user) {
        const userEntry = ranked.find(e => e.user_id === user.id);
        setCurrentUserRank(userEntry?.rank || null);
      }
    }
  }

  function getPeriodStart(period: string): string {
    const now = new Date();
    if (period === "daily") return now.toISOString().split("T")[0];
    if (period === "weekly") {
      const day = now.getDay();
      const diff = now.getDate() - day;
      return new Date(now.setDate(diff)).toISOString().split("T")[0];
    }
    if (period === "monthly") {
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    }
    return "2020-01-01";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Leaderboard</h2>
        <div className="flex gap-2">
          {(["daily", "weekly", "monthly", "all_time"] as const).map(p => (
            <button
              key={p}
              onClick={() => loadLeaderboard()}
              className={`px-3 py-1 rounded-lg text-sm ${
                period === p ? "bg-primary text-primary-fg" : "bg-muted"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {currentUserRank && (
        <div className="rounded-xl border p-3 bg-card">
          <div className="text-sm font-semibold">Your Rank</div>
          <div className="text-2xl font-bold">#{currentUserRank}</div>
        </div>
      )}

      <div className="space-y-2">
        {entries.map((entry, idx) => (
          <div
            key={entry.id}
            className={`flex items-center gap-3 p-3 rounded-xl border ${
              idx < 3 ? "bg-card border-primary" : "bg-card"
            }`}
          >
            <div className="text-2xl font-bold w-8 text-center">
              {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${entry.rank}`}
            </div>
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              {entry.profiles?.avatar_url ? (
                <img src={entry.profiles.avatar_url} alt="" className="h-10 w-10 rounded-full" />
              ) : (
                <span>{(entry.profiles?.display_name || "U")[0]}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{entry.profiles?.display_name || "Anonymous"}</div>
              <div className="text-sm text-muted-foreground">{entry.xp} XP</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
