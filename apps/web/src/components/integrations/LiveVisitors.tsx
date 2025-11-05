"use client";
import { useEffect, useState } from "react";
export default function LiveVisitors() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    // Placeholder: In production, connect to realtime service (Pusher/Ably/Supabase Realtime)
    const interval = setInterval(() => {
      setCount(Math.floor(Math.random() * 50) + 10);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="text-sm text-muted-foreground">
      <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse" aria-hidden="true"></span>
      {count} active now
    </div>
  );
}
