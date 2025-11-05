"use client";
import dynamic from "next/dynamic";
import ConsentGate from "@/components/integrations/ConsentGate";
import { isIntegrationEnabled } from "@/lib/integrations-config";

// Lazy load Vercel Analytics
const VercelAnalytics = dynamic(
  () => import("@vercel/analytics/react").then((mod) => ({ default: mod.Analytics })),
  { ssr: false }
);

export function VercelAnalyticsIntegration() {
  if (!isIntegrationEnabled("vercelAnalytics")) return null;
  
  return (
    <ConsentGate requireKey="analytics">
      <VercelAnalytics />
    </ConsentGate>
  );
}
