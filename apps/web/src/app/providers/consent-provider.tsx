"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Consent = { 
  analytics: boolean; 
  marketing: boolean; 
  functional: boolean;
};

interface ConsentContextType {
  consent: Consent;
  setConsent: (c: Consent | ((prev: Consent) => Consent)) => void;
}

const ConsentContext = createContext<ConsentContextType>({
  consent: { analytics: false, marketing: false, functional: true },
  setConsent: () => {}
});

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = useState<Consent>(() => {
    if (typeof window === "undefined") {
      return { analytics: false, marketing: false, functional: true };
    }
    try {
      const stored = localStorage.getItem("privacy_choices_v2");
      if (stored) {
        return JSON.parse(stored) as Consent;
      }
      // Fallback to legacy GDPR consent format
      const legacyConsent = localStorage.getItem("gdpr_consent");
      const legacyPrefs = localStorage.getItem("gdpr_preferences");
      if (legacyConsent && legacyPrefs) {
        try {
          const prefs = JSON.parse(legacyPrefs);
          return {
            analytics: prefs.analytics || false,
            marketing: prefs.marketing || false,
            functional: prefs.functional || false,
          };
        } catch {
          // Ignore parse errors
        }
      }
      return { analytics: false, marketing: false, functional: true };
    } catch {
      return { analytics: false, marketing: false, functional: true };
    }
  });

  const setConsent = (newConsent: Consent | ((prev: Consent) => Consent)) => {
    setConsentState((prev) => {
      const updated = typeof newConsent === "function" ? newConsent(prev) : newConsent;
      if (typeof window !== "undefined") {
        localStorage.setItem("privacy_choices_v2", JSON.stringify(updated));
      }
      return updated;
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("privacy_choices_v2", JSON.stringify(consent));
    }
  }, [consent]);

  return (
    <ConsentContext.Provider value={{ consent, setConsent }}>
      {children}
    </ConsentContext.Provider>
  );
}

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent must be used within ConsentProvider");
  }
  return context;
};
