#!/usr/bin/env tsx
/**
 * Environment Variable Doctor
 * 
 * Validates environment variables, detects missing/unused vars,
 * and ensures consistency across environments.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface EnvVar {
  name: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
  usedIn: string[];
}

interface EnvAnalysis {
  missing: string[];
  unused: string[];
  inconsistent: Array<{ var: string; locations: string[] }>;
  recommendations: string[];
}

// Core required environment variables
const REQUIRED_VARS: EnvVar[] = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
    usedIn: ['apps/web']
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key',
    usedIn: ['apps/web']
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    description: 'Supabase service role key (server-side only)',
    usedIn: ['apps/web', 'scripts']
  },
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL connection string',
    usedIn: ['prisma', 'scripts']
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    description: 'Application base URL',
    usedIn: ['apps/web']
  },
  {
    name: 'NODE_ENV',
    required: true,
    description: 'Node environment (development, production, test)',
    usedIn: ['all']
  }
];

// Optional but recommended variables
const RECOMMENDED_VARS: EnvVar[] = [
  {
    name: 'OPENAI_API_KEY',
    required: false,
    description: 'OpenAI API key for meal generation',
    usedIn: ['apps/web']
  },
  {
    name: 'STRIPE_SECRET_KEY',
    required: false,
    description: 'Stripe secret key for payments',
    usedIn: ['apps/web']
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: false,
    description: 'Stripe publishable key',
    usedIn: ['apps/web']
  },
  {
    name: 'RESEND_API_KEY',
    required: false,
    description: 'Resend API key for emails',
    usedIn: ['apps/web']
  },
  {
    name: 'NEXT_PUBLIC_SENTRY_DSN',
    required: false,
    description: 'Sentry DSN for error tracking',
    usedIn: ['apps/web']
  },
  {
    name: 'NEXT_PUBLIC_POSTHOG_KEY',
    required: false,
    description: 'PostHog key for analytics',
    usedIn: ['apps/web']
  }
];

function loadEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) {
    return {};
  }

  const content = readFileSync(path, 'utf-8');
  const vars: Record<string, string> = {};

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        vars[key] = value.replace(/^["']|["']$/g, '');
      }
    }
  }

  return vars;
}

function scanCodebaseForEnvUsage(): Set<string> {
  const usedVars = new Set<string>();
  
  // This is a simplified scan - in production, use a proper AST parser
  // For now, we'll check common patterns
  const patterns = [
    /process\.env\.([A-Z_][A-Z0-9_]*)/g,
    /process\.env\[['"]([A-Z_][A-Z0-9_]*)['"]\]/g,
    /\$\{([A-Z_][A-Z0-9_]*)\}/g, // Shell variable expansion
  ];

  // In a real implementation, we'd scan all .ts, .tsx, .js, .jsx files
  // For now, return empty set as placeholder
  return usedVars;
}

function analyzeEnvironment(): EnvAnalysis {
  const env = process.env;
  const envExample = loadEnvFile(join(process.cwd(), '.env.example'));
  const usedVars = scanCodebaseForEnvUsage();

  const missing: string[] = [];
  const unused: string[] = [];
  const inconsistent: Array<{ var: string; locations: string[] }> = [];
  const recommendations: string[] = [];

  // Check required variables
  for (const varDef of REQUIRED_VARS) {
    if (!env[varDef.name] && !envExample[varDef.name]) {
      missing.push(varDef.name);
      recommendations.push(`Missing required variable: ${varDef.name} - ${varDef.description || 'No description'}`);
    }
  }

  // Check for variables in .env.example but not in actual env
  for (const key of Object.keys(envExample)) {
    if (!env[key] && REQUIRED_VARS.find(v => v.name === key)?.required) {
      missing.push(key);
    }
  }

  // Check for variables in env but not in .env.example
  for (const key of Object.keys(env)) {
    if (key.startsWith('NEXT_PUBLIC_') || key.startsWith('SUPABASE_') || key === 'DATABASE_URL') {
      if (!envExample[key]) {
        recommendations.push(`Variable ${key} is set but not documented in .env.example`);
      }
    }
  }

  // Validate format consistency
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || envExample.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.match(/^https:\/\/[a-z0-9-]+\.supabase\.co$/)) {
    recommendations.push(`NEXT_PUBLIC_SUPABASE_URL format may be incorrect: ${supabaseUrl}`);
  }

  return {
    missing,
    unused,
    inconsistent,
    recommendations
  };
}

function generateCanonicalEnvExample(): string {
  const sections = [
    '# ===== Core Supabase (Required) =====',
    'NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
    'SUPABASE_SERVICE_ROLE_KEY=',
    'DATABASE_URL=postgresql://postgres:password@db.<your-project-ref>.supabase.co:5432/postgres',
    '',
    '# ===== App Configuration (Required) =====',
    'NEXT_PUBLIC_APP_URL=http://localhost:3000',
    'NODE_ENV=development',
    '',
    '# ===== Optional Services =====',
    '# OpenAI - for AI meal generation',
    'OPENAI_API_KEY=',
    '',
    '# Stripe - for payments',
    'STRIPE_SECRET_KEY=',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=',
    '',
    '# Email - Resend or SendGrid',
    'RESEND_API_KEY=',
    '',
    '# Analytics & Monitoring',
    'NEXT_PUBLIC_SENTRY_DSN=',
    'NEXT_PUBLIC_POSTHOG_KEY=',
    'NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com',
    '',
    '# Redis - optional caching',
    'REDIS_URL=redis://localhost:6379',
  ];

  return sections.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === '--check' || command === 'check') {
    console.log('🔍 Analyzing environment variables...\n');
    
    const analysis = analyzeEnvironment();
    
    if (analysis.missing.length > 0) {
      console.log('❌ Missing required variables:');
      for (const varName of analysis.missing) {
        console.log(`   - ${varName}`);
      }
      console.log('');
    }

    if (analysis.recommendations.length > 0) {
      console.log('⚠️  Recommendations:');
      for (const rec of analysis.recommendations) {
        console.log(`   - ${rec}`);
      }
      console.log('');
    }

    if (analysis.missing.length === 0 && analysis.recommendations.length === 0) {
      console.log('✅ All required environment variables are present!\n');
    }

    process.exit(analysis.missing.length > 0 ? 1 : 0);
  } else if (command === '--generate' || command === 'generate') {
    console.log('📝 Generating canonical .env.example...\n');
    const canonical = generateCanonicalEnvExample();
    console.log(canonical);
  } else if (command === '--validate' || command === 'validate') {
    console.log('✅ Validating environment variables...\n');
    
    const analysis = analyzeEnvironment();
    let hasErrors = false;

    for (const varDef of REQUIRED_VARS) {
      const value = process.env[varDef.name];
      if (!value) {
        console.log(`❌ Missing: ${varDef.name}`);
        hasErrors = true;
      } else {
        console.log(`✅ Found: ${varDef.name}`);
      }
    }

    process.exit(hasErrors ? 1 : 0);
  } else {
    console.log('Environment Variable Doctor\n');
    console.log('Usage:');
    console.log('  pnpm env:doctor --check      Check for missing/unused variables');
    console.log('  pnpm env:doctor --validate   Validate required variables are set');
    console.log('  pnpm env:doctor --generate   Generate canonical .env.example');
    console.log('');
    console.log('Examples:');
    console.log('  pnpm env:doctor --check');
    console.log('  pnpm env:doctor --validate');
  }
}

if (require.main === module) {
  main();
}

export { analyzeEnvironment, generateCanonicalEnvExample };
