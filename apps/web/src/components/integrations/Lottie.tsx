"use client";
import dynamic from "next/dynamic";
import { isIntegrationEnabled } from "@/lib/integrations-config";

// Lazy load Lottie player
const LottiePlayer = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => ({ default: mod.Player })),
  { ssr: false }
);

export function LottieIntegration() {
  if (!isIntegrationEnabled("lottie")) return null;
  
  // Lottie doesn't need consent gate as it's just animation
  return null; // Component exports are available for use elsewhere
}

// Export component for use in other parts of the app
export { LottiePlayer };
