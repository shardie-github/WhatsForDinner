'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { featureFlags, UserContext } from '@/lib/featureFlags';

interface ExperimentContextType {
  userContext: UserContext;
  getFlag: (flagName: string) => Promise<any>;
  trackEvent: (experimentId: string, eventName: string, properties?: Record<string, any>) => void;
  isExperimentActive: (experimentId: string) => boolean;
}

const ExperimentContext = createContext<ExperimentContextType | null>(null);

interface ExperimentProviderProps {
  children: React.ReactNode;
  userContext: UserContext;
}

export function ExperimentProvider({ children, userContext }: ExperimentProviderProps) {
  const [activeExperiments, setActiveExperiments] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load active experiments for the user
    loadActiveExperiments();
  }, [userContext.userId]);

  const loadActiveExperiments = async () => {
    try {
      // Get all feature flags and check which ones have active experiments
      const flags = await featureFlags.getAllFlags();
      const active = new Set<string>();
      
      for (const flag of flags) {
        if (flag.experiment && flag.enabled) {
          const now = new Date();
          const startDate = new Date(flag.experiment.startDate);
          const endDate = flag.experiment.endDate ? new Date(flag.experiment.endDate) : null;
          
          if (now >= startDate && (!endDate || now <= endDate)) {
            active.add(flag.experiment.id);
          }
        }
      }
      
      setActiveExperiments(active);
    } catch (error) {
      console.error('Error loading active experiments:', error);
    }
  };

  const getFlag = async (flagName: string) => {
    return await featureFlags.getFlag(flagName, userContext);
  };

  const trackEvent = (experimentId: string, eventName: string, properties?: Record<string, any>) => {
    featureFlags.trackEvent(experimentId, eventName, userContext, properties);
  };

  const isExperimentActive = (experimentId: string) => {
    return activeExperiments.has(experimentId);
  };

  return (
    <ExperimentContext.Provider
      value={{
        userContext,
        getFlag,
        trackEvent,
        isExperimentActive,
      }}
    >
      {children}
    </ExperimentContext.Provider>
  );
}

export function useExperiment() {
  const context = useContext(ExperimentContext);
  if (!context) {
    throw new Error('useExperiment must be used within an ExperimentProvider');
  }
  return context;
}

// Hook for using feature flags in components
export function useFeatureFlag(flagName: string) {
  const { getFlag, trackEvent } = useExperiment();
  const [flagValue, setFlagValue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFlag(flagName).then(value => {
      setFlagValue(value);
      setLoading(false);
    });
  }, [flagName, getFlag]);

  return { flagValue, loading, trackEvent };
}

// Hook for A/B testing
export function useABTest(testName: string, variants: string[]) {
  const { getFlag, trackEvent } = useExperiment();
  const [variant, setVariant] = useState<string>(variants[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFlag(testName).then(value => {
      const selectedVariant = value || variants[0];
      setVariant(selectedVariant);
      setLoading(false);
      
      // Track experiment exposure
      trackEvent(testName, 'experiment_exposure', { variant: selectedVariant });
    });
  }, [testName, getFlag, trackEvent]);

  const trackConversion = (eventName: string, properties?: Record<string, any>) => {
    trackEvent(testName, eventName, { 
      variant, 
      ...properties 
    });
  };

  return { 
    variant, 
    loading, 
    trackConversion,
    isVariant: (variantName: string) => variant === variantName 
  };
}