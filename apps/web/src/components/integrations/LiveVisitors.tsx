"use client";
import { useEffect, useState } from "react";
import { isIntegrationEnabled } from "@/lib/integrations-config";
import ConsentGate from "@/components/integrations/ConsentGate";

interface LiveVisitorsProps {
  className?: string;
}

export default function LiveVisitors({ className }: LiveVisitorsProps) {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const pusherEnabled = isIntegrationEnabled("pusher");
  const ablyEnabled = isIntegrationEnabled("ably");

  useEffect(() => {
    if (!pusherEnabled && !ablyEnabled) {
      setIsLoading(false);
      return;
    }

    // Simulate live visitor count (replace with actual Pusher/Ably integration)
    // For demo purposes, we'll show a mock count
    const interval = setInterval(() => {
      setCount(Math.floor(Math.random() * 50) + 10);
      setIsLoading(false);
    }, 2000);

    return () => clearInterval(interval);
  }, [pusherEnabled, ablyEnabled]);

  if (!pusherEnabled && !ablyEnabled) {
    return (
      <div className={`p-4 bg-muted rounded-lg ${className}`}>
        <p className="text-sm text-muted-foreground">Live visitors feature requires Pusher or Ably integration</p>
      </div>
    );
  }

  return (
    <ConsentGate requireKey="analytics">
      <div className={`p-4 bg-muted rounded-lg ${className}`}>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {isLoading ? "Loading..." : `${count ?? 0} visitors`}
            </p>
            <p className="text-xs text-muted-foreground">Viewing this page right now</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Powered by {pusherEnabled ? "Pusher" : "Ably"} • Updates in real-time
        </p>
      </div>
    </ConsentGate>
  );
}
