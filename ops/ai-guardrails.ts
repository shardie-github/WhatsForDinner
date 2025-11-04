/**
 * AI Agent Guardrails - Schema validation, timeouts, retries, circuit breaker
 */

import { z } from 'zod';

interface LLMCallOptions {
  timeout?: number;
  maxRetries?: number;
  schema?: z.ZodSchema;
  circuitBreaker?: CircuitBreaker;
}

interface CircuitBreaker {
  failureThreshold: number;
  resetTimeout: number;
  failures: number;
  lastFailureTime?: number;
  state: 'closed' | 'open' | 'half-open';
}

class AIAgentGuardrails {
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  createCircuitBreaker(
    key: string,
    failureThreshold: number = 5,
    resetTimeout: number = 60000 // 1 minute
  ): CircuitBreaker {
    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, {
        failureThreshold,
        resetTimeout,
        failures: 0,
        state: 'closed'
      });
    }
    return this.circuitBreakers.get(key)!;
  }

  async callLLM<T>(
    fn: () => Promise<T>,
    options: LLMCallOptions = {}
  ): Promise<T> {
    const {
      timeout = 30000,
      maxRetries = 3,
      schema,
      circuitBreaker
    } = options;

    // Check circuit breaker
    if (circuitBreaker) {
      if (circuitBreaker.state === 'open') {
        const timeSinceFailure = Date.now() - (circuitBreaker.lastFailureTime || 0);
        if (timeSinceFailure < circuitBreaker.resetTimeout) {
          throw new Error('Circuit breaker is open');
        }
        circuitBreaker.state = 'half-open';
      }
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Timeout wrapper
        const result = await Promise.race([
          fn(),
          new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), timeout)
          )
        ]);

        // Schema validation
        if (schema) {
          const validated = schema.parse(result);
          if (circuitBreaker) {
            circuitBreaker.failures = 0;
            circuitBreaker.state = 'closed';
          }
          return validated as T;
        }

        if (circuitBreaker) {
          circuitBreaker.failures = 0;
          circuitBreaker.state = 'closed';
        }

        return result;
      } catch (error: any) {
        lastError = error;

        if (circuitBreaker) {
          circuitBreaker.failures++;
          circuitBreaker.lastFailureTime = Date.now();

          if (circuitBreaker.failures >= circuitBreaker.failureThreshold) {
            circuitBreaker.state = 'open';
          }
        }

        // Don't retry on validation errors
        if (error instanceof z.ZodError) {
          throw error;
        }

        // Exponential backoff
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  offlineFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    return fn().catch(() => {
      console.warn('LLM call failed, using offline fallback');
      return Promise.resolve(fallback);
    });
  }
}

async function dryRunAgent(fixtures: Record<string, any>): Promise<void> {
  console.log('Running agent dry-run with fixtures...');
  
  const guardrails = new AIAgentGuardrails();
  const schema = z.object({
    message: z.string(),
    confidence: z.number().min(0).max(1)
  });

  const circuitBreaker = guardrails.createCircuitBreaker('test-agent');

  // Simulate LLM call with fixture
  const result = await guardrails.callLLM(
    async () => fixtures.testResponse,
    {
      timeout: 5000,
      maxRetries: 2,
      schema,
      circuitBreaker
    }
  );

  console.log('✅ Dry-run passed:', result);
}

if (require.main === module) {
  const command = process.argv[2];

  if (command === 'dryrun') {
    const fixtures = {
      testResponse: {
        message: 'Test response',
        confidence: 0.9
      }
    };
    dryRunAgent(fixtures).catch(error => {
      console.error('Dry-run failed:', error);
      process.exit(1);
    });
  } else {
    console.log('Usage: ai-guardrails.ts [dryrun]');
    process.exit(1);
  }
}

export { AIAgentGuardrails, dryRunAgent };
