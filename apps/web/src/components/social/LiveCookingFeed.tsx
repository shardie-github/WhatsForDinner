"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { hapticTap } from "@/components/gamification/Haptics";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveCookingFeed() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLiveCooking();
    subscribeToCooking();
  }, []);

  async function loadLiveCooking() {
    const { data } = await supabase
      .from("cooking_activities")
      .select("*, profiles(display_name, avatar_url)")
      .eq("is_live", true)
      .order("started_at", { ascending: false })
      .limit(10);

    if (data) setActivities(data);
    setLoading(false);
  }

  function subscribeToCooking() {
    const channel = supabase
      .channel("live-cooking-feed")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cooking_activities",
          filter: "is_live=eq.true",
        },
        () => {
          loadLiveCooking();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function likeActivity(activityId: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from("cooking_activity_likes")
      .select("id")
      .eq("activity_id", activityId)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      await supabase
        .from("cooking_activity_likes")
        .delete()
        .eq("activity_id", activityId)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("cooking_activity_likes")
        .insert({ activity_id: activityId, user_id: user.id });
      hapticTap();
    }
  }

  function getTimeAgo(startedAt: string): string {
    const minutes = Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000);
    if (minutes < 1) return "just now";
    if (minutes === 1) return "1 min ago";
    return `${minutes} mins ago`;
  }

  if (loading) {
    return (
      <div className="rounded-xl border p-4 bg-card">
        <div className="text-sm text-muted-foreground">Loading live cooking...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">🔥 Live Cooking</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          {activities.length} {activities.length === 1 ? "family" : "families"} cooking now
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-xl border p-8 bg-card text-center">
          <div className="text-4xl mb-2">👨‍🍳</div>
          <div className="text-sm text-muted-foreground">No one is cooking right now</div>
          <div className="text-xs text-muted-foreground mt-1">Be the first to start cooking!</div>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border p-4 bg-card relative overflow-hidden"
              >
                {/* Live indicator */}
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-red-500 text-white text-xs">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                  LIVE
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    {activity.profiles?.avatar_url ? (
                      <img
                        src={activity.profiles.avatar_url}
                        alt=""
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">👨‍🍳</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {activity.family_name || activity.profiles?.display_name || "Anonymous Family"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(activity.started_at)}
                      </span>
                    </div>

                    <div className="font-bold text-base mb-1">{activity.meal_name}</div>

                    {activity.description && (
                      <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {activity.description}
                      </div>
                    )}

                    {activity.ingredients && activity.ingredients.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {activity.ingredients.slice(0, 5).map((ing: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-muted text-xs"
                          >
                            {ing}
                          </span>
                        ))}
                        {activity.ingredients.length > 5 && (
                          <span className="px-2 py-0.5 rounded-lg bg-muted text-xs">
                            +{activity.ingredients.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {activity.cooking_time_minutes && (
                        <span>⏱️ {activity.cooking_time_minutes} min</span>
                      )}
                      {activity.difficulty && (
                        <span>
                          {activity.difficulty === "easy" && "🟢"}
                          {activity.difficulty === "medium" && "🟡"}
                          {activity.difficulty === "hard" && "🔴"}{" "}
                          {activity.difficulty}
                        </span>
                      )}
                      <span>👁️ {activity.views_count || 0}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => likeActivity(activity.id)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-muted hover:bg-muted/80 text-sm transition-colors"
                      >
                        ❤️ {activity.likes_count || 0}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
