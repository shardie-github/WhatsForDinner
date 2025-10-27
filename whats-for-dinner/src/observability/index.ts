/**
 * Observability Module
 * 
 * Centralized observability setup and utilities
 */

export { logger, createLogger, requestLogger } from './logger';
export type { LogLevel, LogContext, LogEntry } from './logger';

export {
  tracer,
  createSpan,
  withSpan,
  withSpanSync,
  addSpanAttributes,
  addSpanEvent,
  getCurrentSpanContext,
  withDatabaseSpan,
  withHttpSpan,
  withBusinessSpan,
  withAISpan,
  shutdownTracing,
} from './tracing';
export type { SpanContext, SpanOptions } from './tracing';

export {
  counters,
  histograms,
  gauges,
  record,
  recordMetric,
  recordPerformance,
  shutdownMetrics,
} from './metrics';
export type { MetricLabels } from './metrics';

// Initialize observability
export function initializeObservability() {
  console.log('🔍 Initializing observability...');
  
  // Log startup
  logger.info('Observability initialized', {
    component: 'observability',
    operation: 'initialize',
  });
  
  // Record startup metric
  record.record({
    name: 'observability_startup',
    value: 1,
    labels: { status: 'success' },
  });
}

// Shutdown observability
export async function shutdownObservability() {
  console.log('🔍 Shutting down observability...');
  
  logger.info('Observability shutting down', {
    component: 'observability',
    operation: 'shutdown',
  });
  
  await Promise.all([
    shutdownTracing(),
    shutdownMetrics(),
  ]);
}

// Health check
export function getObservabilityHealth() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    components: {
      logging: 'active',
      tracing: 'active',
      metrics: 'active',
    },
  };
}

export default {
  initializeObservability,
  shutdownObservability,
  getObservabilityHealth,
};