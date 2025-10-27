/**
 * OpenTelemetry Metrics
 * 
 * Features:
 * - Custom metrics
 * - Business metrics
 * - Performance metrics
 * - Error rate tracking
 */

import { metrics } from '@opentelemetry/api';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Create meter provider
const meterProvider = new MeterProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'whats-for-dinner',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  }),
});

// Set global meter provider
metrics.setGlobalMeterProvider(meterProvider);

// Get meter
const meter = metrics.getMeter('whats-for-dinner', '1.0.0');

export interface MetricLabels {
  [key: string]: string;
}

/**
 * Counter metrics
 */
export const counters = {
  // API metrics
  apiRequests: meter.createCounter('api_requests_total', {
    description: 'Total number of API requests',
  }),
  apiErrors: meter.createCounter('api_errors_total', {
    description: 'Total number of API errors',
  }),
  
  // Business metrics
  mealsGenerated: meter.createCounter('meals_generated_total', {
    description: 'Total number of meals generated',
  }),
  usersRegistered: meter.createCounter('users_registered_total', {
    description: 'Total number of user registrations',
  }),
  paymentsProcessed: meter.createCounter('payments_processed_total', {
    description: 'Total number of payments processed',
  }),
  
  // Database metrics
  dbQueries: meter.createCounter('db_queries_total', {
    description: 'Total number of database queries',
  }),
  dbErrors: meter.createCounter('db_errors_total', {
    description: 'Total number of database errors',
  }),
  
  // AI metrics
  aiRequests: meter.createCounter('ai_requests_total', {
    description: 'Total number of AI requests',
  }),
  aiErrors: meter.createCounter('ai_errors_total', {
    description: 'Total number of AI errors',
  }),
};

/**
 * Histogram metrics
 */
export const histograms = {
  // API metrics
  apiDuration: meter.createHistogram('api_duration_seconds', {
    description: 'API request duration in seconds',
    unit: 's',
  }),
  
  // Database metrics
  dbDuration: meter.createHistogram('db_duration_seconds', {
    description: 'Database query duration in seconds',
    unit: 's',
  }),
  
  // AI metrics
  aiDuration: meter.createHistogram('ai_duration_seconds', {
    description: 'AI request duration in seconds',
    unit: 's',
  }),
  
  // Business metrics
  mealGenerationTime: meter.createHistogram('meal_generation_duration_seconds', {
    description: 'Meal generation duration in seconds',
    unit: 's',
  }),
};

/**
 * Gauge metrics
 */
export const gauges = {
  // System metrics
  activeUsers: meter.createUpDownCounter('active_users', {
    description: 'Number of active users',
  }),
  memoryUsage: meter.createUpDownCounter('memory_usage_bytes', {
    description: 'Memory usage in bytes',
    unit: 'bytes',
  }),
  cpuUsage: meter.createUpDownCounter('cpu_usage_percent', {
    description: 'CPU usage percentage',
    unit: '%',
  }),
  
  // Business metrics
  mealsInQueue: meter.createUpDownCounter('meals_in_queue', {
    description: 'Number of meals in generation queue',
  }),
  pendingPayments: meter.createUpDownCounter('pending_payments', {
    description: 'Number of pending payments',
  }),
};

/**
 * Metric recording functions
 */
export const record = {
  // API metrics
  apiRequest: (method: string, endpoint: string, statusCode: number, duration: number) => {
    const labels = { method, endpoint, status_code: statusCode.toString() };
    
    counters.apiRequests.add(1, labels);
    histograms.apiDuration.record(duration / 1000, labels);
    
    if (statusCode >= 400) {
      counters.apiErrors.add(1, labels);
    }
  },
  
  // Database metrics
  dbQuery: (operation: string, table: string, duration: number, error?: boolean) => {
    const labels = { operation, table };
    
    counters.dbQueries.add(1, labels);
    histograms.dbDuration.record(duration / 1000, labels);
    
    if (error) {
      counters.dbErrors.add(1, labels);
    }
  },
  
  // AI metrics
  aiRequest: (model: string, operation: string, duration: number, error?: boolean) => {
    const labels = { model, operation };
    
    counters.aiRequests.add(1, labels);
    histograms.aiDuration.record(duration / 1000, labels);
    
    if (error) {
      counters.aiErrors.add(1, labels);
    }
  },
  
  // Business metrics
  mealGenerated: (userId: string, duration: number) => {
    counters.mealsGenerated.add(1, { user_id: userId });
    histograms.mealGenerationTime.record(duration / 1000, { user_id: userId });
  },
  
  userRegistered: (userId: string) => {
    counters.usersRegistered.add(1, { user_id: userId });
  },
  
  paymentProcessed: (userId: string, amount: number, currency: string) => {
    counters.paymentsProcessed.add(1, { 
      user_id: userId, 
      currency,
      amount: amount.toString(),
    });
  },
  
  // System metrics
  setActiveUsers: (count: number) => {
    gauges.activeUsers.add(count);
  },
  
  setMemoryUsage: (bytes: number) => {
    gauges.memoryUsage.add(bytes);
  },
  
  setCpuUsage: (percent: number) => {
    gauges.cpuUsage.add(percent);
  },
  
  setMealsInQueue: (count: number) => {
    gauges.mealsInQueue.add(count);
  },
  
  setPendingPayments: (count: number) => {
    gauges.pendingPayments.add(count);
  },
};

/**
 * Custom metric decorator
 */
export function recordMetric(
  counter: keyof typeof counters,
  labels?: MetricLabels
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      try {
        const result = await method.apply(this, args);
        counters[counter].add(1, labels || {});
        return result;
      } catch (error) {
        // Record error metric if available
        const errorCounter = counters[counter.replace('Requests', 'Errors') as keyof typeof counters];
        if (errorCounter) {
          errorCounter.add(1, { ...labels, error: 'true' });
        }
        throw error;
      }
    };
  };
}

/**
 * Performance monitoring decorator
 */
export function recordPerformance(
  histogram: keyof typeof histograms,
  labels?: MetricLabels
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - start;
        histograms[histogram].record(duration / 1000, labels || {});
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        histograms[histogram].record(duration / 1000, { ...labels, error: 'true' });
        throw error;
      }
    };
  };
}

/**
 * Shutdown metrics
 */
export async function shutdownMetrics(): Promise<void> {
  await meterProvider.shutdown();
}

export { meter, meterProvider };
export default meter;