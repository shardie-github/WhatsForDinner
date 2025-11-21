/**
 * Circuit Breaker Pattern Implementation
 * 
 * Prevents cascading failures by stopping requests to failing services:
 * - Tracks failure rates
 * - Opens circuit after threshold failures
 * - Allows periodic retry attempts (half-open state)
 * - Closes circuit when service recovers
 * 
 * Usage:
 *   import { CircuitBreaker } from '@whats-for-dinner/utils/guardrails/circuit-breaker';
 *   
 *   const breaker = new CircuitBreaker('openai', {
 *     failureThreshold: 5,
 *     resetTimeout: 60000,
 *   });
 *   
 *   const result = await breaker.execute(async () => {
 *     return await openaiApi.generateRecipes(prompt);
 *   });
 */

import { logger } from './logger';
import { CircuitBreakerOpenError } from './errors';

export interface CircuitBreakerOptions {
  /**
   * Number of consecutive failures before opening circuit
   * @default 5
   */
  failureThreshold?: number;

  /**
   * Time in ms before attempting to close circuit (half-open state)
   * @default 60000 (1 minute)
   */
  resetTimeout?: number;

  /**
   * Timeout for individual requests in ms
   * @default 30000 (30 seconds)
   */
  requestTimeout?: number;

  /**
   * Monitor window in ms (failures outside this window are ignored)
   * @default 60000 (1 minute)
   */
  monitorWindow?: number;
}

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Circuit open, rejecting requests
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

interface FailureRecord {
  timestamp: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: FailureRecord[] = [];
  private lastFailureTime: number | null = null;
  private halfOpenAttempts = 0;
  private readonly options: Required<CircuitBreakerOptions>;

  constructor(
    private readonly serviceName: string,
    options: CircuitBreakerOptions = {}
  ) {
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      resetTimeout: options.resetTimeout ?? 60000,
      requestTimeout: options.requestTimeout ?? 30000,
      monitorWindow: options.monitorWindow ?? 60000,
    };
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check circuit state
    if (this.state === CircuitState.OPEN) {
      // Check if reset timeout has passed
      if (
        this.lastFailureTime &&
        Date.now() - this.lastFailureTime >= this.options.resetTimeout
      ) {
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenAttempts = 0;
        logger.info(
          { service: this.serviceName },
          `Circuit breaker entering HALF_OPEN state for ${this.serviceName}`
        );
      } else {
        throw new CircuitBreakerOpenError(this.serviceName);
      }
    }

    // Clean old failures outside monitor window
    this.cleanOldFailures();

    try {
      // Execute with timeout
      const result = await Promise.race([
        fn(),
        this.createTimeoutPromise(),
      ]) as T;

      // Success - reset circuit if half-open
      if (this.state === CircuitState.HALF_OPEN) {
        this.state = CircuitState.CLOSED;
        this.failures = [];
        this.lastFailureTime = null;
        logger.info(
          { service: this.serviceName },
          `Circuit breaker CLOSED for ${this.serviceName} - service recovered`
        );
      }

      return result;
    } catch (error) {
      this.recordFailure();

      // Check if we should open the circuit
      if (
        this.failures.length >= this.options.failureThreshold &&
        this.state !== CircuitState.OPEN
      ) {
        this.state = CircuitState.OPEN;
        this.lastFailureTime = Date.now();
        logger.warn(
          {
            service: this.serviceName,
            failures: this.failures.length,
          },
          `Circuit breaker OPENED for ${this.serviceName} - too many failures`
        );
      }

      // If half-open and still failing, reopen circuit
      if (this.state === CircuitState.HALF_OPEN) {
        this.halfOpenAttempts++;
        if (this.halfOpenAttempts >= 3) {
          this.state = CircuitState.OPEN;
          this.lastFailureTime = Date.now();
          logger.warn(
            { service: this.serviceName },
            `Circuit breaker REOPENED for ${this.serviceName} - half-open attempts failed`
          );
        }
      }

      throw error;
    }
  }

  /**
   * Record a failure
   */
  private recordFailure(): void {
    this.failures.push({ timestamp: Date.now() });
    this.lastFailureTime = Date.now();
  }

  /**
   * Remove failures outside the monitor window
   */
  private cleanOldFailures(): void {
    const cutoff = Date.now() - this.options.monitorWindow;
    this.failures = this.failures.filter((f) => f.timestamp > cutoff);
  }

  /**
   * Create timeout promise
   */
  private createTimeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${this.options.requestTimeout}ms`));
      }, this.options.requestTimeout);
    });
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get failure count
   */
  getFailureCount(): number {
    return this.failures.length;
  }

  /**
   * Manually reset circuit breaker (for testing/admin)
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = [];
    this.lastFailureTime = null;
    this.halfOpenAttempts = 0;
    logger.info(
      { service: this.serviceName },
      `Circuit breaker manually reset for ${this.serviceName}`
    );
  }
}

/**
 * Retry utility with exponential backoff
 */
export interface RetryOptions {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number;

  /**
   * Initial delay in ms
   * @default 1000
   */
  initialDelay?: number;

  /**
   * Maximum delay in ms
   * @default 10000
   */
  maxDelay?: number;

  /**
   * Exponential backoff multiplier
   * @default 2
   */
  multiplier?: number;

  /**
   * Function to determine if error should be retried
   */
  shouldRetry?: (error: unknown) => boolean;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    multiplier = 2,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if we've exhausted attempts or error shouldn't be retried
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Exponential backoff
      delay = Math.min(delay * multiplier, maxDelay);

      logger.warn(
        {
          attempt: attempt + 1,
          maxRetries,
          delay,
          error: error instanceof Error ? error.message : String(error),
        },
        `Retry attempt ${attempt + 1}/${maxRetries}`
      );
    }
  }

  throw lastError;
}
