"use client";
// Central integration loader component
// Imports and initializes all enabled integrations

import { VercelAnalyticsIntegration } from "./VercelAnalytics";
import { MicrosoftClarityIntegration } from "./MicrosoftClarity";
import { LenisIntegration } from "./Lenis";
import { HCaptchaIntegration } from "./HCaptcha";

export function IntegrationsLoader() {
  return (
    <>
      <VercelAnalyticsIntegration />
      <MicrosoftClarityIntegration />
      <LenisIntegration />
      <HCaptchaIntegration />
    </>
  );
}
