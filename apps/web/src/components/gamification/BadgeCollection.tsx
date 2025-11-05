"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Badge from "./Badge";
import Confetti from "./Confetti";
import { motion, AnimatePresence } from "framer-motion";

export default function BadgeCollection() {
  const [badges, setBadges] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<Set<number>>(new Set());
  const [newBadge, setNewBadge] = useState<number | null>(null);

  useEffect(() => {
    loadBadges();
  }, []);

  async function loadBadges() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: allBadges } = await supabase
      .from("badges")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: earned } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", user.id);

    if (allBadges) {
      setBadges(allBadges);
      if (earned) {
        setUserBadges(new Set(earned.map(b => b.badge_id)));
      }
    }
  }

  useEffect(() => {
    // Listen for new badge unlocks
    const channel = supabase
      .channel('badge-unlocks')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_badges',
        filter: `user_id=eq.${(async () => {
          const { data: { user } } = await supabase.auth.getUser();
          return user?.id;
        })()}`
      }, (payload) => {
        setNewBadge((payload.new as any).badge_id);
        loadBadges();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Badges</h2>
      
      <AnimatePresence>
        {newBadge && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setNewBadge(null)}
          >
            <div className="bg-card rounded-xl border p-6 max-w-sm text-center">
              <div className="text-6xl mb-4">🏆</div>
              <div className="text-xl font-bold mb-2">Badge Unlocked!</div>
              <div className="text-sm text-muted-foreground">
                {badges.find(b => b.id === newBadge)?.name}
              </div>
              <Confetti when={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {badges.map((badge) => {
          const isEarned = userBadges.has(badge.id);
          return (
            <div
              key={badge.id}
              className={`relative rounded-xl border p-3 ${
                isEarned ? "bg-card border-primary" : "bg-muted/50 opacity-50"
              }`}
            >
              {isEarned && (
                <div className="absolute top-2 right-2 text-sm">✓</div>
              )}
              <div className="text-3xl mb-2 text-center">{badge.emoji || "🏅"}</div>
              <div className="text-xs font-semibold text-center">{badge.name}</div>
              {badge.description && (
                <div className="text-xs text-muted-foreground mt-1 text-center">
                  {badge.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
