"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { hapticTap } from "./Haptics";
import { awardXp } from "./GamificationProvider";

export default function CommunityChallenges() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [userContribution, setUserContribution] = useState<Record<number, number>>({});

  useEffect(() => {
    loadChallenges();
  }, []);

  async function loadChallenges() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    const { data: activeChallenges } = await supabase
      .from("community_challenges")
      .select("*")
      .eq("is_active", true)
      .gte("ends_at", now.toISOString())
      .order("created_at", { ascending: false });

    if (activeChallenges) {
      setChallenges(activeChallenges);

      const { data: contributions } = await supabase
        .from("community_challenge_contributions")
        .select("*")
        .eq("user_id", user.id)
        .in("challenge_id", activeChallenges.map(c => c.id));

      const contributionMap: Record<number, number> = {};
      contributions?.forEach(c => {
        contributionMap[c.challenge_id] = c.contribution_value;
      });
      setUserContribution(contributionMap);
    }
  }

  function getProgressPercentage(challenge: any): number {
    return Math.min(100, (challenge.current_value / challenge.target_value) * 100);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Community Challenges</h2>
      <p className="text-sm text-muted-foreground">
        Join forces with others to achieve group goals!
      </p>

      {challenges.length === 0 ? (
        <div className="text-sm text-muted-foreground">No active community challenges.</div>
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge) => {
            const pct = getProgressPercentage(challenge);
            const userContributed = userContribution[challenge.id] || 0;

            return (
              <div key={challenge.id} className="rounded-xl border p-4 bg-card">
                <div className="mb-3">
                  <div className="font-semibold">{challenge.title}</div>
                  {challenge.description && (
                    <div className="text-sm text-muted-foreground mt-1">{challenge.description}</div>
                  )}
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>
                      {challenge.current_value} / {challenge.target_value} ({(pct).toFixed(0)}%)
                    </span>
                    <span className="font-semibold">{challenge.reward_xp} XP reward</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  {userContributed > 0 ? `You contributed ${userContributed}` : "Join the challenge!"}
                </div>

                <div className="text-xs text-muted-foreground mt-2">
                  Ends {new Date(challenge.ends_at).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
