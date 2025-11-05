"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { hapticTap } from "@/components/gamification/Haptics";
import LiveCookingFeed from "@/components/social/LiveCookingFeed";

export default function EnhancedLiveVisitors() {
  const [count, setCount] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [cookingCount, setCookingCount] = useState(0);
  const [showCooking, setShowCooking] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    async function setupPresence() {
      const { data: { user } } = await supabase.auth.getUser();
      const channel = supabase.channel('live-visitors', {
        config: {
          presence: {
            key: user?.id || 'anonymous',
          }
        }
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          if (!mounted) return;
          const state = channel.presenceState();
          const uniqueUsers = Object.keys(state);
          setCount(uniqueUsers.length);
          setUsers(uniqueUsers.slice(0, 10));
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          if (!mounted) return;
          setCount(prev => prev + 1);
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          if (!mounted) return;
          setCount(prev => Math.max(0, prev - 1));
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED' && mounted) {
            await channel.track({
              user_id: user?.id || 'anonymous',
              online_at: new Date().toISOString(),
            });
          }
        });

      return () => {
        mounted = false;
        supabase.removeChannel(channel);
      };
    }

    // Load cooking count
    async function loadCookingCount() {
      const { count } = await supabase
        .from("cooking_activities")
        .select("*", { count: "exact", head: true })
        .eq("is_live", true);
      
      if (count !== null) {
        setCookingCount(count);
      }
    }

    loadCookingCount();
    
    // Subscribe to cooking activities
    const cookingChannel = supabase
      .channel('cooking-count')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cooking_activities',
        filter: 'is_live=eq.true'
      }, () => {
        loadCookingCount();
      })
      .subscribe();

    const cleanup = setupPresence();
    return () => {
      mounted = false;
      cleanup.then(fn => fn && fn());
      supabase.removeChannel(cookingChannel);
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true"></span>
          <span className="text-muted-foreground">
            {count} {count === 1 ? 'person' : 'people'} active
          </span>
        </div>
        
        {cookingCount > 0 && (
          <button
            onClick={() => setShowCooking(!showCooking)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs hover:bg-red-500/20 transition-colors"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            {cookingCount} {cookingCount === 1 ? 'family' : 'families'} cooking
          </button>
        )}
      </div>

      {showCooking && cookingCount > 0 && (
        <div className="mt-3">
          <LiveCookingFeed />
        </div>
      )}
    </div>
  );
}
