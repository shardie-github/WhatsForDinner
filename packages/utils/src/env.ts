/**
 * requireEnv helper - enforce environment variables
 */

export function requireEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
}

export function requireEnvArray(keys: string[]): Record<string, string> {
  const env: Record<string, string> = {};
  
  for (const key of keys) {
    env[key] = requireEnv(key);
  }
  
  return env;
}

export function optionalEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

// Validate all required env vars at startup
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  
  const missing: string[] = [];
  
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
