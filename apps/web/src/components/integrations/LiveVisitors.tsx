"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { hapticTap } from "./Haptics";

export default function RealTimeLiveVisitors() {
  const [count, setCount] = useState(0);
  const [users, setUsers] = useState<any[]>([]);

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

    const cleanup = setupPresence();
    return () => {
      mounted = false;
      cleanup.then(fn => fn && fn());
    };
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true"></span>
      <span className="text-muted-foreground">
        {count} {count === 1 ? 'person' : 'people'} active
      </span>
    </div>
  );
}
