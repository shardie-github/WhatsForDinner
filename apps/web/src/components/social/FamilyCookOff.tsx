"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { hapticTap } from "@/components/gamification/Haptics";
import { awardXp } from "@/components/gamification/GamificationProvider";
import Confetti from "@/components/gamification/Confetti";
import { motion } from "framer-motion";

export default function FamilyCookOff() {
  const [cookOffs, setCookOffs] = useState<any[]>([]);
  const [participants, setParticipants] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCookOff, setSelectedCookOff] = useState<number | null>(null);
  const [mealName, setMealName] = useState("");
  const [mealDescription, setMealDescription] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id);
    });
    loadCookOffs();
  }, []);

  async function loadCookOffs() {
    const { data: { user } } = await supabase.auth.getUser();
    const now = new Date();
    const { data } = await supabase
      .from("cook_offs")
      .select("*")
      .eq("is_active", true)
      .gte("end_time", now.toISOString())
      .order("start_time", { ascending: false });

    if (data) {
      setCookOffs(data);
      
      // Load participants for each cook-off
      const participantsMap: Record<number, any[]> = {};
      for (const cookOff of data) {
        const { data: parts } = await supabase
          .from("cook_off_participants")
          .select("*, profiles(display_name, avatar_url)")
          .eq("cook_off_id", cookOff.id)
          .order("votes", { ascending: false });

        if (parts) participantsMap[cookOff.id] = parts;
      }
      setParticipants(participantsMap);
    }
    setLoading(false);
  }
  
  function isParticipating(cookOffId: number, userId: string | undefined): boolean {
    if (!userId) return false;
    const parts = participants[cookOffId] || [];
    return parts.some(p => p.user_id === userId);
  }

  async function joinCookOff(cookOffId: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !mealName.trim()) return;

    const { error } = await supabase
      .from("cook_off_participants")
      .insert({
        cook_off_id: cookOffId,
        user_id: user.id,
        meal_name: mealName,
        description: mealDescription || null,
      });

    if (!error) {
      hapticTap();
      awardXp(20);
      setMealName("");
      setMealDescription("");
      setSelectedCookOff(null);
      loadCookOffs();
    }
  }

  async function voteForMeal(cookOffId: number, userId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id === userId) return; // Can't vote for yourself

    // Note: In a real implementation, you'd want a separate votes table
    // For now, we'll just increment (this is simplified)
    const { error } = await supabase.rpc("increment_cook_off_votes", {
      cook_off_id: cookOffId,
      participant_user_id: userId,
    });

    if (!error) {
      hapticTap();
      loadCookOffs();
    }
  }

  function getTimeRemaining(endTime: string): string {
    const now = Date.now();
    const end = new Date(endTime).getTime();
    const diff = end - now;
    
    if (diff < 0) return "Ended";
    
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  }

  if (loading) {
    return (
      <div className="rounded-xl border p-4 bg-card">
        <div className="text-sm text-muted-foreground">Loading cook-offs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">🏆 Family Cook-Off</h2>
      </div>

      {cookOffs.length === 0 ? (
        <div className="rounded-xl border p-8 bg-card text-center">
          <div className="text-4xl mb-2">👨‍🍳</div>
          <div className="text-sm text-muted-foreground">No active cook-offs right now</div>
          <div className="text-xs text-muted-foreground mt-1">Check back soon for competitions!</div>
        </div>
      ) : (
        <div className="space-y-4">
          {cookOffs.map((cookOff) => {
            const parts = participants[cookOff.id] || [];
            const userParticipating = isParticipating(cookOff.id, currentUserId);

            return (
              <div key={cookOff.id} className="rounded-xl border p-4 bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold text-lg">{cookOff.title}</div>
                    {cookOff.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {cookOff.description}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      {getTimeRemaining(cookOff.end_time)}
                    </div>
                    <div className="text-sm font-semibold mt-1">
                      {cookOff.prize_xp} XP Prize
                    </div>
                  </div>
                </div>

                {selectedCookOff === cookOff.id ? (
                  <div className="space-y-3 mt-4 p-3 rounded-lg bg-muted">
                    <input
                      type="text"
                      value={mealName}
                      onChange={(e) => setMealName(e.target.value)}
                      placeholder="Your meal name..."
                      className="w-full rounded-lg border border-border p-2 text-sm"
                    />
                    <textarea
                      value={mealDescription}
                      onChange={(e) => setMealDescription(e.target.value)}
                      placeholder="Describe your meal..."
                      rows={2}
                      className="w-full rounded-lg border border-border p-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => joinCookOff(cookOff.id)}
                        disabled={!mealName.trim()}
                        className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-fg text-sm disabled:opacity-50"
                      >
                        Submit Entry
                      </button>
                      <button
                        onClick={() => setSelectedCookOff(null)}
                        className="px-3 py-2 rounded-lg bg-secondary text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {parts.length > 0 ? (
                      <div className="space-y-2 mt-3">
                        <div className="text-sm font-semibold">Entries ({parts.length})</div>
                        {parts.map((participant, idx) => (
                          <motion.div
                            key={participant.user_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-2">
                              <div className="text-lg">
                                {idx === 0 && "🥇"}
                                {idx === 1 && "🥈"}
                                {idx === 2 && "🥉"}
                                {idx > 2 && `#${idx + 1}`}
                              </div>
                              <div>
                                <div className="text-sm font-semibold">
                                  {participant.meal_name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  by {participant.profiles?.display_name || "Anonymous"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">{participant.votes || 0} votes</span>
                              <button
                                onClick={() => voteForMeal(cookOff.id, participant.user_id)}
                                className="px-2 py-1 rounded-lg bg-primary text-primary-fg text-xs"
                              >
                                Vote
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        No entries yet. Be the first!
                      </div>
                    )}

                    {!isParticipating && (
                      <button
                        onClick={() => setSelectedCookOff(cookOff.id)}
                        className="w-full mt-3 px-4 py-2 rounded-xl bg-primary text-primary-fg font-medium"
                      >
                        Join Cook-Off
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
