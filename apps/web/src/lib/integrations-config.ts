// Integration configuration loader
// Handles both client and server-side access to integration flags

let integrationsConfig: Record<string, boolean> | null = null;

export function getIntegrationsConfig(): Record<string, boolean> {
  if (integrationsConfig) return integrationsConfig;

  // Try to load from config file
  try {
    if (typeof window === "undefined") {
      // Server-side: use require
      const fs = require("fs");
      const path = require("path");
      const configPath = path.join(process.cwd(), "config", "integrations.json");
      const configContent = fs.readFileSync(configPath, "utf-8");
      integrationsConfig = JSON.parse(configContent);
    } else {
      // Client-side: fetch or use default
      integrationsConfig = {
        vercelAnalytics: true,
        plausible: false,
        posthog: true,
        clarity: false,
        sentry: true,
        cloudinary: true,
        uploadcare: false,
        lottie: true,
        lenis: true,
        framerMotion: true,
        tidio: false,
        crisp: false,
        hcaptcha: true,
        recaptcha: false,
        pusher: false,
        ably: false,
        algolia: false,
        meilisearch: false,
        trustpilot: false,
        lemonsqueezy: false,
      };
    }
  } catch (error) {
    // Fallback to defaults
    integrationsConfig = {
      vercelAnalytics: true,
      plausible: false,
      posthog: true,
      clarity: false,
      sentry: true,
      cloudinary: true,
      uploadcare: false,
      lottie: true,
      lenis: true,
      framerMotion: true,
      tidio: false,
      crisp: false,
      hcaptcha: true,
      recaptcha: false,
      pusher: false,
      ably: false,
      algolia: false,
      meilisearch: false,
      trustpilot: false,
      lemonsqueezy: false,
    };
  }

  return integrationsConfig;
}

export function isIntegrationEnabled(name: string): boolean {
  const config = getIntegrationsConfig();
  return config[name] === true;
}
