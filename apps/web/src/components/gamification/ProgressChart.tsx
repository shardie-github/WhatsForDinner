"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useGamify } from "./GamificationProvider";

export default function ProgressChart() {
  const { xp } = useGamify();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  async function loadProgressData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: activity } = await supabase
      .from("activity_log")
      .select("created_at, metadata")
      .eq("user_id", user.id)
      .eq("activity_type", "xp_gained")
      .order("created_at", { ascending: true })
      .limit(30);

    if (activity) {
      let cumulativeXp = 0;
      const chartData = activity.map((entry, idx) => {
        cumulativeXp += (entry.metadata as any)?.xp || 0;
        return {
          date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          xp: cumulativeXp,
        };
      });
      setData(chartData);
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading chart...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border p-4 bg-card">
        <div className="text-sm font-semibold mb-2">Your Progress</div>
        <div className="text-sm text-muted-foreground">Start earning XP to see your progress chart!</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4 bg-card">
      <div className="text-sm font-semibold mb-4">Your Progress (Last 30 Days)</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="xp" stroke="hsl(var(--primary))" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
