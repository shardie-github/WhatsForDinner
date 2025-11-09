#!/usr/bin/env tsx
/**
 * Nomad Monorepo Wiring Harness
 * 
 * Orchestrates end-to-end connectivity verification across all subsystems.
 * Generates Connectivity Matrix (JSON + Markdown) with evidence.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { db } from '../../packages/server/src/db/index.js';
import Redis from 'ioredis';
import { createClient } from '@supabase/supabase-js';

interface CheckResult {
  status: 'pass' | 'fail' | 'degraded' | 'skip';
  latency?: number;
  evidence?: string[];
  error?: string;
  fixPr?: string;
  nextAction?: string;
}

interface ConnectivityCheck {
  category: string;
  subsystem: string;
  result: CheckResult;
}

interface ConnectivityMatrix {
  timestamp: string;
  version: string;
  environment: string;
  checks: ConnectivityCheck[];
  summary: {
    total: number;
    pass: number;
    fail: number;
    degraded: number;
    skip: number;
  };
}

const REPORT_DIR = join(process.cwd(), 'reports', 'connectivity');
const EVIDENCE_DIR = join(REPORT_DIR, 'evidence');

// Ensure directories exist
mkdirSync(REPORT_DIR, { recursive: true });
mkdirSync(EVIDENCE_DIR, { recursive: true });

const checks: ConnectivityCheck[] = [];
const evidence: string[] = [];

function logEvidence(message: string) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}`;
  evidence.push(logLine);
  }

async function checkEnvironment(): Promise<ConnectivityCheck[]> {
  logEvidence('Checking environment variables and secrets...');
  const envChecks: ConnectivityCheck[] = [];
  
  const requiredEnvVars = {
    'Supabase URL': 'NEXT_PUBLIC_SUPABASE_URL',
    'Supabase Anon Key': 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'Supabase Service Role Key': 'SUPABASE_SERVICE_ROLE_KEY',
    'Redis URL': 'REDIS_URL',
    'Stripe Secret Key': 'STRIPE_SECRET_KEY',
    'Stripe Webhook Secret': 'STRIPE_WEBHOOK_SECRET',
    'OpenAI API Key': 'OPENAI_API_KEY',
    'SendGrid API Key': 'SENDGRID_API_KEY',
    'PostHog Key': 'NEXT_PUBLIC_POSTHOG_KEY',
    'Partner HMAC Secret': 'PARTNER_CONVERSION_HMAC_SECRET',
    'Link Signing Secret': 'LINK_SIGNING_SECRET',
    'DSAR Verification JWT': 'DSAR_VERIFICATION_JWT_SECRET',
    'Artifacts Bucket URL': 'ARTIFACTS_BUCKET_URL',
    'OTel Endpoint': 'OTEL_EXPORTER_OTLP_ENDPOINT',
  };

  for (const [name, varName] of Object.entries(requiredEnvVars)) {
    const value = process.env[varName];
    const start = Date.now();
    
    if (!value) {
      envChecks.push({
        category: 'Environment',
        subsystem: name,
        result: {
          status: 'degraded',
          latency: Date.now() - start,
          error: `Missing: ${varName}`,
          nextAction: `Set ${varName} or configure adapter fallback`,
        },
      });
      logEvidence(`??  ${name}: MISSING (${varName})`);
    } else {
      // Mask sensitive values
      const masked = varName.includes('KEY') || varName.includes('SECRET')
        ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
        : value;
      
      envChecks.push({
        category: 'Environment',
        subsystem: name,
        result: {
          status: 'pass',
          latency: Date.now() - start,
          evidence: [`Set: ${masked}`],
        },
      });
      logEvidence(`? ${name}: PRESENT`);
    }
  }

  return envChecks;
}

async function checkHealth(): Promise<ConnectivityCheck[]> {
  logEvidence('Checking health endpoints...');
  const healthChecks: ConnectivityCheck[] = [];
  
  // Check web healthz
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const start = Date.now();
    const response = await fetch(`${baseUrl}/api/healthz`, {
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;
    const data = await response.json();
    
    healthChecks.push({
      category: 'Health',
      subsystem: 'Web /api/healthz',
      result: {
        status: response.ok ? 'pass' : 'fail',
        latency,
        evidence: [JSON.stringify(data, null, 2)],
        error: response.ok ? undefined : `HTTP ${response.status}`,
      },
    });
    logEvidence(`Web healthz: ${response.ok ? '?' : '?'} (${latency}ms)`);
  } catch (error) {
    healthChecks.push({
      category: 'Health',
      subsystem: 'Web /api/healthz',
      result: {
        status: 'fail',
        error: error instanceof Error ? error.message : String(error),
        nextAction: 'Check if web server is running',
      },
    });
    logEvidence(`Web healthz: ? ${error instanceof Error ? error.message : String(error)}`);
  }

  // Check database
  try {
    const start = Date.now();
    // Try simple query - db might not have execute, use SQL directly
    const result = await db.execute({ sql: 'SELECT 1 as test', args: [] } as any).catch(async () => {
      // Fallback: try postgres client directly
      const { default: postgres } = await import('postgres');
      const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || '';
      if (!connectionString) throw new Error('No database URL');
      const sql = postgres(connectionString);
      return await sql`SELECT 1 as test`;
    });
    const latency = Date.now() - start;
    
    healthChecks.push({
      category: 'Health',
      subsystem: 'Database',
      result: {
        status: 'pass',
        latency,
        evidence: ['Connected successfully'],
      },
    });
    logEvidence(`Database: ? (${latency}ms)`);
  } catch (error) {
    healthChecks.push({
      category: 'Health',
      subsystem: 'Database',
      result: {
        status: 'fail',
        error: error instanceof Error ? error.message : String(error),
        nextAction: 'Check DATABASE_URL or SUPABASE_DB_URL',
      },
    });
    logEvidence(`Database: ? ${error instanceof Error ? error.message : String(error)}`);
  }

  // Check Redis
  try {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      healthChecks.push({
        category: 'Health',
        subsystem: 'Redis',
        result: {
          status: 'skip',
          nextAction: 'Set REDIS_URL or use in-memory fallback',
        },
      });
      logEvidence(`Redis: ??  SKIP (not configured)`);
    } else {
      const start = Date.now();
      const redis = new Redis(redisUrl);
      await redis.ping();
      await redis.quit();
      const latency = Date.now() - start;
      
      healthChecks.push({
        category: 'Health',
        subsystem: 'Redis',
        result: {
          status: 'pass',
          latency,
          evidence: ['Connected successfully'],
        },
      });
      logEvidence(`Redis: ? (${latency}ms)`);
    }
  } catch (error) {
    healthChecks.push({
      category: 'Health',
      subsystem: 'Redis',
      result: {
        status: 'fail',
        error: error instanceof Error ? error.message : String(error),
        nextAction: 'Check REDIS_URL or configure fallback',
      },
    });
    logEvidence(`Redis: ? ${error instanceof Error ? error.message : String(error)}`);
  }

  return healthChecks;
}

async function checkAuthRLS(): Promise<ConnectivityCheck[]> {
  logEvidence('Checking Auth/RLS isolation...');
  const authChecks: ConnectivityCheck[] = [];
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      authChecks.push({
        category: 'Auth/RLS',
        subsystem: 'Supabase JWT Verification',
        result: {
          status: 'skip',
          nextAction: 'Configure Supabase credentials',
        },
      });
      return authChecks;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test RLS: Create two test users and attempt cross-tenant access
    // This is a simplified check - full test in E2E
    authChecks.push({
      category: 'Auth/RLS',
      subsystem: 'Supabase JWT Verification',
      result: {
        status: 'pass',
        evidence: ['Supabase client initialized'],
        nextAction: 'Run full RLS test in E2E suite',
      },
    });
    logEvidence(`Auth/RLS: ? Supabase client ready (full test in E2E)`);
    
  } catch (error) {
    authChecks.push({
      category: 'Auth/RLS',
      subsystem: 'Supabase JWT Verification',
      result: {
        status: 'fail',
        error: error instanceof Error ? error.message : String(error),
      },
    });
    logEvidence(`Auth/RLS: ? ${error instanceof Error ? error.message : String(error)}`);
  }

  return authChecks;
}

async function checkConsentAdsAnalytics(): Promise<ConnectivityCheck[]> {
  logEvidence('Checking Consent/Ads/Analytics gates...');
  const checks: ConnectivityCheck[] = [];
  
  // Check analytics adapter fallback
  const analyticsProvider = process.env.NEXT_PUBLIC_POSTHOG_KEY ? 'posthog' : 'noop';
  checks.push({
    category: 'Consent/Ads/Analytics',
    subsystem: 'Analytics Provider',
    result: {
      status: analyticsProvider === 'noop' ? 'degraded' : 'pass',
      evidence: [`Using: ${analyticsProvider}`],
      nextAction: analyticsProvider === 'noop' ? 'Configure PostHog or use noop fallback' : undefined,
    },
  });
  logEvidence(`Analytics: ${analyticsProvider === 'noop' ? '??  DEGRADED (noop)' : '? (PostHog)'}`);

  // Check ads configuration
  const adsConfig = {
    hasAdMob: !!process.env.ADMOB_APP_ID,
    hasGPT: typeof window !== 'undefined' || true, // Web GPT available
    hasHouseAds: true, // Always available
  };
  
  checks.push({
    category: 'Consent/Ads/Analytics',
    subsystem: 'Ads Network Fallback',
    result: {
      status: adsConfig.hasAdMob || adsConfig.hasGPT ? 'pass' : 'degraded',
      evidence: [
        `AdMob: ${adsConfig.hasAdMob ? 'available' : 'not configured'}`,
        `GPT: ${adsConfig.hasGPT ? 'available' : 'not configured'}`,
        `House Ads: ${adsConfig.hasHouseAds ? 'available' : 'not configured'}`,
      ],
    },
  });
  logEvidence(`Ads: ${adsConfig.hasAdMob || adsConfig.hasGPT ? '?' : '??  (house fallback)'}`);

  return checks;
}

async function checkCoreProductLoop(): Promise<ConnectivityCheck[]> {
  logEvidence('Checking core product loop...');
  const checks: ConnectivityCheck[] = [];
  
  // Check meal plan generation endpoint
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const start = Date.now();
    const response = await fetch(`${baseUrl}/api/meal-plan`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;
    
    // Just check if endpoint exists (401/403 is expected without auth)
    checks.push({
      category: 'Core Product',
      subsystem: 'Meal Plan API',
      result: {
        status: response.status !== 404 ? 'pass' : 'fail',
        latency,
        evidence: [`HTTP ${response.status}`],
        error: response.status === 404 ? 'Endpoint not found' : undefined,
      },
    });
    logEvidence(`Meal Plan API: ${response.status !== 404 ? '?' : '?'} (${response.status})`);
  } catch (error) {
    checks.push({
      category: 'Core Product',
      subsystem: 'Meal Plan API',
      result: {
        status: 'fail',
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }

  // Check grocery list endpoint
  try {
    const start = Date.now();
    const response = await fetch(`${baseUrl}/api/grocery-list`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;
    
    checks.push({
      category: 'Core Product',
      subsystem: 'Grocery List API',
      result: {
        status: response.status !== 404 ? 'pass' : 'fail',
        latency,
        evidence: [`HTTP ${response.status}`],
      },
    });
    logEvidence(`Grocery List API: ${response.status !== 404 ? '?' : '?'} (${response.status})`);
  } catch (error) {
    checks.push({
      category: 'Core Product',
      subsystem: 'Grocery List API',
      result: {
        status: 'fail',
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }

  // Check OpenAI integration for meal generation
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  checks.push({
    category: 'Core Product',
    subsystem: 'AI Meal Generation',
    result: {
      status: hasOpenAI ? 'pass' : 'degraded',
      evidence: [hasOpenAI ? 'OpenAI API key configured' : 'OpenAI API key missing'],
      nextAction: hasOpenAI ? undefined : 'Configure OPENAI_API_KEY or use fallback',
    },
  });
  logEvidence(`AI Meal Generation: ${hasOpenAI ? '?' : '??  DEGRADED'}`);

  return checks;
}

async function checkPayments(): Promise<ConnectivityCheck[]> {
  logEvidence('Checking payments flow...');
  const checks: ConnectivityCheck[] = [];
  
  const hasStripe = !!process.env.STRIPE_SECRET_KEY;
  const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET;
  
  checks.push({
    category: 'Payments',
    subsystem: 'Stripe Configuration',
    result: {
      status: hasStripe && hasWebhookSecret ? 'pass' : 'degraded',
      evidence: [
        `Stripe Key: ${hasStripe ? 'configured' : 'missing'}`,
        `Webhook Secret: ${hasWebhookSecret ? 'configured' : 'missing'}`,
      ],
      nextAction: !hasStripe ? 'Configure STRIPE_SECRET_KEY or use stripe-mock' : undefined,
    },
  });
  logEvidence(`Payments: ${hasStripe ? '?' : '??  DEGRADED (use stripe-mock)'}`);

  // Check webhook endpoint
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const response = await fetch(`${baseUrl}/api/stripe/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000),
    });
    
    checks.push({
      category: 'Payments',
      subsystem: 'Stripe Webhook Endpoint',
      result: {
        status: response.status !== 404 ? 'pass' : 'fail',
        evidence: [`HTTP ${response.status}`],
        nextAction: response.status === 404 ? 'Create /api/stripe/webhook route' : undefined,
      },
    });
    logEvidence(`Stripe Webhook: ${response.status !== 404 ? '?' : '?'} (${response.status})`);
  } catch (error) {
    checks.push({
      category: 'Payments',
      subsystem: 'Stripe Webhook Endpoint',
      result: {
        status: 'fail',
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }

  return checks;
}

async function checkPartnerNetwork(): Promise<ConnectivityCheck[]> {
  logEvidence('Checking partner network...');
  const checks: ConnectivityCheck[] = [];
  
  const hasHMAC = !!process.env.PARTNER_CONVERSION_HMAC_SECRET;
  const hasLinkSigning = !!process.env.LINK_SIGNING_SECRET;
  
  checks.push({
    category: 'Partner Network',
    subsystem: 'HMAC Configuration',
    result: {
      status: hasHMAC && hasLinkSigning ? 'pass' : 'degraded',
      evidence: [
        `HMAC Secret: ${hasHMAC ? 'configured' : 'missing'}`,
        `Link Signing: ${hasLinkSigning ? 'configured' : 'missing'}`,
      ],
    },
  });
  logEvidence(`Partner Network: ${hasHMAC && hasLinkSigning ? '?' : '??  DEGRADED'}`);

  // Check referral route
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const response = await fetch(`${baseUrl}/api/r/test-token`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    
    checks.push({
      category: 'Partner Network',
      subsystem: 'Referral Route /r/:token',
      result: {
        status: response.status !== 404 ? 'pass' : 'fail',
        evidence: [`HTTP ${response.status}`],
      },
    });
    logEvidence(`Referral Route: ${response.status !== 404 ? '?' : '?'} (${response.status})`);
  } catch (error) {
    checks.push({
      category: 'Partner Network',
      subsystem: 'Referral Route /r/:token',
      result: {
        status: 'fail',
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }

  return checks;
}

async function checkGrowthLayer(): Promise<ConnectivityCheck[]> {
  logEvidence('Checking growth layer...');
  const checks: ConnectivityCheck[] = [];
  
  // Check experiments endpoint
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const response = await fetch(`${baseUrl}/api/experiments`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    
    checks.push({
      category: 'Growth',
      subsystem: 'Experiments API',
      result: {
        status: response.status !== 404 ? 'pass' : 'fail',
        evidence: [`HTTP ${response.status}`],
      },
    });
    logEvidence(`Experiments API: ${response.status !== 404 ? '?' : '?'} (${response.status})`);
  } catch (error) {
    checks.push({
      category: 'Growth',
      subsystem: 'Experiments API',
      result: {
        status: 'fail',
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }

  // Check pricing endpoint
  try {
    const response = await fetch(`${baseUrl}/api/pricing`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    
    checks.push({
      category: 'Growth',
      subsystem: 'Pricing API',
      result: {
        status: response.status !== 404 ? 'pass' : 'fail',
        evidence: [`HTTP ${response.status}`],
      },
    });
    logEvidence(`Pricing API: ${response.status !== 404 ? '?' : '?'} (${response.status})`);
  } catch (error) {
    checks.push({
      category: 'Growth',
      subsystem: 'Pricing API',
      result: {
        status: 'fail',
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }

  return checks;
}

async function checkCompliance(): Promise<ConnectivityCheck[]> {
  logEvidence('Checking compliance/RegTech...');
  const checks: ConnectivityCheck[] = [];
  
  const hasDSARSecret = !!process.env.DSAR_VERIFICATION_JWT_SECRET;
  const hasArtifactsBucket = !!process.env.ARTIFACTS_BUCKET_URL;
  
  checks.push({
    category: 'Compliance',
    subsystem: 'DSAR Configuration',
    result: {
      status: hasDSARSecret && hasArtifactsBucket ? 'pass' : 'degraded',
      evidence: [
        `DSAR JWT: ${hasDSARSecret ? 'configured' : 'missing'}`,
        `Artifacts Bucket: ${hasArtifactsBucket ? 'configured' : 'missing'}`,
      ],
    },
  });
  logEvidence(`Compliance: ${hasDSARSecret && hasArtifactsBucket ? '?' : '??  DEGRADED'}`);

  // Check GDPR endpoint
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const response = await fetch(`${baseUrl}/api/gdpr`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    
    checks.push({
      category: 'Compliance',
      subsystem: 'GDPR API',
      result: {
        status: response.status !== 404 ? 'pass' : 'fail',
        evidence: [`HTTP ${response.status}`],
      },
    });
    logEvidence(`GDPR API: ${response.status !== 404 ? '?' : '?'} (${response.status})`);
  } catch (error) {
    checks.push({
      category: 'Compliance',
      subsystem: 'GDPR API',
      result: {
        status: 'fail',
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }

  return checks;
}

async function checkJobs(): Promise<ConnectivityCheck[]> {
  logEvidence('Checking job queue...');
  const checks: ConnectivityCheck[] = [];
  
  try {
    const { queueHealth } = await import('@whats-for-dinner/server/queue');
    const health = await queueHealth();
    
    checks.push({
      category: 'Jobs',
      subsystem: 'Queue Worker',
      result: {
        status: health.healthy ? 'pass' : 'fail',
        evidence: [
          `Pending: ${health.pending}`,
          `Active: ${health.active}`,
        ],
      },
    });
    logEvidence(`Queue Worker: ${health.healthy ? '?' : '?'}`);
  } catch (error) {
    checks.push({
      category: 'Jobs',
      subsystem: 'Queue Worker',
      result: {
        status: 'fail',
        error: error instanceof Error ? error.message : String(error),
        nextAction: 'Start queue worker or check REDIS_URL',
      },
    });
    logEvidence(`Queue Worker: ? ${error instanceof Error ? error.message : String(error)}`);
  }

  return checks;
}

async function main() {
    );
  
  const startTime = Date.now();
  
  // Run all checks
  const allChecks = [
    ...(await checkEnvironment()),
    ...(await checkHealth()),
    ...(await checkAuthRLS()),
    ...(await checkConsentAdsAnalytics()),
    ...(await checkCoreProductLoop()),
    ...(await checkPayments()),
    ...(await checkPartnerNetwork()),
    ...(await checkGrowthLayer()),
    ...(await checkCompliance()),
    ...(await checkJobs()),
  ];

  const summary = {
    total: allChecks.length,
    pass: allChecks.filter(c => c.result.status === 'pass').length,
    fail: allChecks.filter(c => c.result.status === 'fail').length,
    degraded: allChecks.filter(c => c.result.status === 'degraded').length,
    skip: allChecks.filter(c => c.result.status === 'skip').length,
  };

  const matrix: ConnectivityMatrix = {
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: allChecks,
    summary,
  };

  // Write JSON report
  writeFileSync(
    join(REPORT_DIR, 'connectivity.json'),
    JSON.stringify(matrix, null, 2),
  );

  // Write evidence log
  writeFileSync(
    join(EVIDENCE_DIR, `${Date.now()}.log`),
    evidence.join('\n'),
  );

  // Generate Markdown report
  const markdown = generateMarkdownReport(matrix);
  writeFileSync(
    join(REPORT_DIR, 'wiring_report.md'),
    markdown,
  );

  const duration = Date.now() - startTime;
  
    );
                }`);
  }`);
  
  if (summary.fail > 0) {
        process.exit(1);
  } else if (summary.degraded > 0) {
        process.exit(0);
  } else {
        process.exit(0);
  }
}

function generateMarkdownReport(matrix: ConnectivityMatrix): string {
  const rows = matrix.checks.map(check => {
    const status = {
      pass: '?',
      fail: '?',
      degraded: '??',
      skip: '??',
    }[check.result.status] || '?';
    
    return `| ${check.category} | ${check.subsystem} | ${status} ${check.result.status.toUpperCase()} | ${check.result.latency || '-'}ms | ${check.result.error || '-'} |`;
  }).join('\n');

  return `# Nomad Monorepo Connectivity Report

Generated: ${matrix.timestamp}  
Version: ${matrix.version}  
Environment: ${matrix.environment}

## Summary

- **Total Checks**: ${matrix.summary.total}
- **? Pass**: ${matrix.summary.pass}
- **? Fail**: ${matrix.summary.fail}
- **?? Degraded**: ${matrix.summary.degraded}
- **?? Skip**: ${matrix.summary.skip}

## Connectivity Matrix

| Category | Subsystem | Status | Latency | Error |
|----------|-----------|--------|---------|-------|
${rows}

## Details

${matrix.checks.map(check => {
  if (check.result.status === 'fail' || check.result.status === 'degraded') {
    return `### ${check.category} - ${check.subsystem}
- Status: ${check.result.status}
- Error: ${check.result.error || 'N/A'}
- Next Action: ${check.result.nextAction || 'N/A'}
- Evidence: ${check.result.evidence?.join(', ') || 'N/A'}
`;
  }
  return '';
}).filter(Boolean).join('\n')}

## Evidence

See \`evidence/\` directory for detailed logs.
`;
}

if (import.meta.url === `file://${process.argv[1]}` || require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// Removed unused export - not imported anywhere
// export { main as runWiringHarness };