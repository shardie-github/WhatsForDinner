/**
 * Retry Helper: Exponential Backoff + Jitter
 * 
 * Provides retry logic with exponential backoff and jitter to avoid thundering herd.
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitter: true,
  onRetry: () => {},
};

/**
 * Retry a function with exponential backoff and jitter
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === opts.maxRetries) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      let delay = opts.initialDelayMs * Math.pow(opts.backoffMultiplier, attempt);
      delay = Math.min(delay, opts.maxDelayMs);

      // Add jitter (random 0-20% of delay)
      if (opts.jitter) {
        const jitterAmount = delay * 0.2 * Math.random();
        delay += jitterAmount;
      }

      opts.onRetry?.(lastError, attempt + 1);

      console.log(
        `[RETRY] Attempt ${attempt + 1}/${opts.maxRetries} failed. Retrying in ${Math.round(delay)}ms...`
      );

      await sleep(delay);
    }
  }

  throw lastError!;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
