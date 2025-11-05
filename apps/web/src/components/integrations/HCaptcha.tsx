"use client";
import dynamic from "next/dynamic";
import ConsentGate from "@/components/integrations/ConsentGate";
import { isIntegrationEnabled } from "@/lib/integrations-config";

// Lazy load hCaptcha
const HCaptcha = dynamic(
  () => import("@hcaptcha/react-hcaptcha").then((mod) => ({ default: mod })),
  { ssr: false }
);

export function HCaptchaIntegration() {
  if (!isIntegrationEnabled("hcaptcha")) return null;
  
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY;
  if (!siteKey) return null;

  // hCaptcha is functional, not analytics
  return (
    <ConsentGate requireKey="functional">
      <div id="hcaptcha-container" style={{ display: "none" }} />
    </ConsentGate>
  );
}

// Export component for use in forms
export { HCaptcha };
