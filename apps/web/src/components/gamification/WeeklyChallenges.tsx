"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Badge from "./Badge";
import Confetti from "./Confetti";
import { hapticTap } from "./Haptics";
import { awardXp } from "./GamificationProvider";

export default function WeeklyChallenges() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<number, number>>({});

  useEffect(() => {
    loadChallenges();
  }, []);

  async function loadChallenges() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);

    const { data: challengesData } = await supabase
      .from("weekly_challenges")
      .select("*")
      .eq("is_active", true)
      .gte("week_end", weekStart.toISOString().split("T")[0])
      .order("created_at", { ascending: false });

    if (challengesData) {
      setChallenges(challengesData);

      const { data: progressData } = await supabase
        .from("user_challenge_progress")
        .select("*")
        .eq("user_id", user.id)
        .in("challenge_id", challengesData.map(c => c.id));

      const progressMap: Record<number, number> = {};
      progressData?.forEach(p => {
        progressMap[p.challenge_id] = p.current_value;
      });
      setProgress(progressMap);
    }
  }

  function getProgressPercentage(challenge: any): number {
    const current = progress[challenge.id] || 0;
    return Math.min(100, (current / (challenge.target_value || 1)) * 100);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Weekly Challenges</h2>
      
      {challenges.length === 0 ? (
        <div className="text-sm text-muted-foreground">No active challenges this week.</div>
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge) => {
            const current = progress[challenge.id] || 0;
            const pct = getProgressPercentage(challenge);
            const isCompleted = current >= challenge.target_value;

            return (
              <div
                key={challenge.id}
                className={`rounded-xl border p-4 ${
                  isCompleted ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" : "bg-card"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold">{challenge.title}</div>
                    {challenge.description && (
                      <div className="text-sm text-muted-foreground mt-1">{challenge.description}</div>
                    )}
                  </div>
                  {isCompleted && <span className="text-2xl">✅</span>}
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>
                      {current} / {challenge.target_value} {challenge.metric.replace("_", " ")}
                    </span>
                    <span className="font-semibold">{challenge.xp_reward} XP</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
