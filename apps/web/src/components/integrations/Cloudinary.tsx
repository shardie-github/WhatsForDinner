"use client";
import dynamic from "next/dynamic";
import { isIntegrationEnabled } from "@/lib/integrations-config";

// Lazy load Cloudinary components
const CldImage = dynamic(
  () => import("next-cloudinary").then((mod) => ({ default: mod.CldImage })),
  { ssr: false }
);

const CldVideo = dynamic(
  () => import("next-cloudinary").then((mod) => ({ default: mod.CldVideo })),
  { ssr: false }
);

export function CloudinaryIntegration() {
  if (!isIntegrationEnabled("cloudinary")) return null;
  
  // Cloudinary doesn't need consent gate as it's just media CDN
  return null; // Component exports are available for use elsewhere
}

// Export components for use in other parts of the app
export { CldImage, CldVideo };
