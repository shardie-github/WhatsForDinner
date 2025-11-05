"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

const EMOJI = ["👍","🔥","💡","🎉","❤️"];

export default function ReactionBar({ postId }: { postId: number }) {
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadReactions();
    const channel = supabase
      .channel(`reactions:${postId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reactions',
        filter: `post_id=eq.${postId}`
      }, () => {
        loadReactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  async function loadReactions() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("reactions")
      .select("emoji, user_id")
      .eq("post_id", postId);

    if (data) {
      const counts: Record<string, number> = {};
      const userReacts = new Set<string>();
      
      data.forEach(r => {
        counts[r.emoji] = (counts[r.emoji] || 0) + 1;
        if (user && r.user_id === user.id) {
          userReacts.add(r.emoji);
        }
      });
      
      setReactions(counts);
      setUserReactions(userReacts);
    }
  }

  async function toggleReaction(emoji: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isReacted = userReactions.has(emoji);
    
    if (isReacted) {
      await supabase
        .from("reactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .eq("emoji", emoji);
    } else {
      await supabase
        .from("reactions")
        .insert({ post_id: postId, user_id: user.id, emoji });
    }
  }

  return (
    <div className="flex gap-2">
      {EMOJI.map((e) => (
        <button
          key={e}
          className={`px-2 py-1 rounded-lg text-sm transition-colors ${
            userReactions.has(e)
              ? "bg-primary text-primary-fg"
              : "bg-muted hover:bg-muted/80"
          }`}
          onClick={() => toggleReaction(e)}
          aria-label={`React ${e}`}
        >
          {e} <span className="text-xs">{reactions[e] || 0}</span>
        </button>
      ))}
    </div>
  );
}
