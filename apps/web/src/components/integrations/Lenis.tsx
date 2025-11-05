"use client";
import { useEffect } from "react";
import { isIntegrationEnabled } from "@/lib/integrations-config";

export function LenisIntegration() {
  if (!isIntegrationEnabled("lenis")) return null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Check if already initialized
    if ((window as any).lenis) return;

    import("lenis").then((Lenis) => {
      const lenis = new Lenis.default({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      });

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      // Cleanup
      return () => {
        lenis.destroy();
      };
    });
  }, []);

  return null;
}
