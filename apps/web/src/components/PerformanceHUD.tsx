"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WebVitals {
  lcp?: number;
  inp?: number;
  cls?: number;
}

export default function PerformanceHUD() {
  const [vitals, setVitals] = useState<WebVitals>({});
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const handleVitals = () => {
      if (typeof window !== "undefined" && "web-vitals" in window) {
        import("web-vitals").then(({ onCLS, onINP, onLCP }) => {
          onCLS((metric) => setVitals((v) => ({ ...v, cls: metric.value })));
          onINP((metric) => setVitals((v) => ({ ...v, inp: metric.value })));
          onLCP((metric) => setVitals((v) => ({ ...v, lcp: metric.value })));
        });
      }
    };

    handleVitals();
    setVisible(true);
  }, []);

  if (!visible || process.env.NODE_ENV !== "development") return null;

  const getStatus = (value: number | undefined, threshold: number) => {
    if (!value) return "pending";
    return value <= threshold ? "good" : "needs-work";
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-64 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Performance HUD</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>LCP:</span>
            <Badge
              variant={getStatus(vitals.lcp, 2500) === "good" ? "default" : "destructive"}
            >
              {vitals.lcp ? `${Math.round(vitals.lcp)}ms` : "pending"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>INP:</span>
            <Badge
              variant={getStatus(vitals.inp, 200) === "good" ? "default" : "destructive"}
            >
              {vitals.inp ? `${Math.round(vitals.inp)}ms` : "pending"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>CLS:</span>
            <Badge
              variant={getStatus(vitals.cls, 0.05) === "good" ? "default" : "destructive"}
            >
              {vitals.cls ? vitals.cls.toFixed(3) : "pending"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
