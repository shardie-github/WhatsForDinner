"use client";
import { useEffect, useRef } from "react";
import { isIntegrationEnabled } from "@/lib/integrations-config";
import ConsentGate from "@/components/integrations/ConsentGate";

interface TrustpilotBadgeProps {
  className?: string;
}

export default function TrustpilotBadge({ className }: TrustpilotBadgeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isIntegrationEnabled("trustpilot")) return;

    const businessId = process.env.NEXT_PUBLIC_TRUSTPILOT_BUSINESS_ID;
    if (!businessId) {
      console.warn("Trustpilot business ID not configured");
      return;
    }

    // Load Trustpilot widget script
    const script = document.createElement("script");
    script.src = `https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js`;
    script.async = true;
    script.onload = () => {
      // Initialize Trustpilot widget
      if (window.Trustpilot && containerRef.current) {
        window.Trustpilot.loadFromElement(containerRef.current, true);
      }
    };

    if (!document.querySelector(`script[src="${script.src}"]`)) {
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(`script[src="${script.src}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  if (!isIntegrationEnabled("trustpilot")) {
    return (
      <div className={`p-4 bg-muted rounded-lg ${className}`}>
        <p className="text-sm text-muted-foreground">Trustpilot integration is disabled</p>
      </div>
    );
  }

  const businessId = process.env.NEXT_PUBLIC_TRUSTPILOT_BUSINESS_ID;
  if (!businessId) {
    return (
      <div className={`p-4 bg-muted rounded-lg ${className}`}>
        <p className="text-sm text-muted-foreground">
          Configure NEXT_PUBLIC_TRUSTPILOT_BUSINESS_ID to display Trustpilot badge
        </p>
      </div>
    );
  }

  return (
    <ConsentGate requireKey="analytics">
      <div ref={containerRef} className={className}>
        {/* Trustpilot widget will be injected here */}
        <div
          className="trustpilot-widget"
          data-locale="en-US"
          data-template-id="53aa8912dec7e10d38f59f36"
          data-businessunit-id={businessId}
          data-style-height="20px"
          data-style-width="100%"
          data-theme="light"
        >
          <a
            href={`https://www.trustpilot.com/review/${businessId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="trustpilot-link"
          >
            Trustpilot
          </a>
        </div>
      </div>
    </ConsentGate>
  );
}

// Extend Window interface for Trustpilot
declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement: (element: HTMLElement, trustbox?: boolean) => void;
    };
  }
}
