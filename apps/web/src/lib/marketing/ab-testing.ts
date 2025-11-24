/**
 * A/B Testing System
 * 
 * Enables testing of different variations for optimization
 */

interface Experiment {
  id: string;
  name: string;
  variants: string[];
  trafficSplit: number[]; // Percentage for each variant
  active: boolean;
}

interface ExperimentResult {
  experimentId: string;
  variant: string;
  conversions: number;
  visitors: number;
  conversionRate: number;
}

const experiments: Map<string, Experiment> = new Map();

/**
 * Get variant for user in experiment
 */
export function getExperimentVariant(
  experimentId: string,
  userId: string
): string | null {
  const experiment = experiments.get(experimentId);
  
  if (!experiment || !experiment.active) {
    return null;
  }

  // Deterministic assignment based on userId
  const hash = hashUserId(userId);
  const bucket = hash % 100;
  
  let cumulative = 0;
  for (let i = 0; i < experiment.variants.length; i++) {
    cumulative += experiment.trafficSplit[i];
    if (bucket < cumulative) {
      return experiment.variants[i];
    }
  }

  return experiment.variants[0]; // Fallback
}

/**
 * Track experiment view
 */
export function trackExperimentView(
  experimentId: string,
  variant: string,
  userId?: string
): void {
  // In production, track in analytics
  console.log(`Experiment view: ${experimentId} -> ${variant}`);
}

/**
 * Track experiment conversion
 */
export function trackExperimentConversion(
  experimentId: string,
  variant: string,
  userId?: string
): void {
  // In production, track in analytics
  console.log(`Experiment conversion: ${experimentId} -> ${variant}`);
}

/**
 * Register experiment
 */
export function registerExperiment(experiment: Experiment): void {
  experiments.set(experiment.id, experiment);
}

/**
 * Get experiment results
 */
export async function getExperimentResults(
  experimentId: string
): Promise<ExperimentResult[]> {
  // In production, fetch from analytics database
  return [];
}

function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Example experiments
registerExperiment({
  id: 'landing-page-cta',
  name: 'Landing Page CTA Button',
  variants: ['control', 'variant-a', 'variant-b'],
  trafficSplit: [33, 33, 34],
  active: true,
});

registerExperiment({
  id: 'pricing-page',
  name: 'Pricing Page Layout',
  variants: ['control', 'simplified'],
  trafficSplit: [50, 50],
  active: true,
});
