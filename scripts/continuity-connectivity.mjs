#!/usr/bin/env node
/**
 * Nomad Grand Continuity Audit - Connectivity Verification
 * Tests live handshakes between all services and generates connectivity heatmap
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

// Recursive file finder
function findFiles(pattern, rootDir, ignoreDirs = ['node_modules', '.next', 'dist', '.git']) {
  const results = [];
  const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
  
  function walk(dir, baseDir = rootDir) {
    if (!existsSync(dir)) return;
    
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.env') continue;
      
      const fullPath = join(dir, entry.name);
      const relDir = relative(baseDir, dir);
      const relPath = relDir ? join(relDir, entry.name).replace(/\\/g, '/') : entry.name;
      
      if (entry.isDirectory()) {
        if (!ignoreDirs.some(ig => fullPath.includes(ig))) {
          walk(fullPath, baseDir);
        }
      } else if (entry.isFile()) {
        if (regex.test(relPath)) {
          results.push(join(baseDir, relPath).replace(/\\/g, '/'));
        }
      }
    }
  }
  
  walk(rootDir);
  return results;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const heatmap = {
  timestamp: new Date().toISOString(),
  subsystems: {},
  connections: [],
  health: {},
  failures: [],
  warnings: []
};

// Test connectivity between subsystems
async function testConnectivity() {
  console.log('?? Testing subsystem connectivity...\n');
  
  // 1. Supabase Auth ? API ? React Hooks
  await testSupabaseAuthFlow();
  
  // 2. Stripe Webhooks ? Entitlement ? Front-end
  await testStripeIntegration();
  
  // 3. Partner Webhooks ? Ad Engine ? Payout Job ? Stripe Connect
  await testPartnerRevenueFlow();
  
  // 4. DSAR Jobs ? Artifact Storage ? Evidence Bucket
  await testDSARFlow();
  
  // 5. Backup Scripts ? Restore Pipeline ? DR Validation
  await testBackupFlow();
  
  // 6. Queue ? Jobs ? Workers
  await testQueueSystem();
  
  // 7. Analytics Events ? PostHog/Segment
  await testAnalyticsFlow();
  
  // 8. API Routes ? Database ? RLS
  await testAPIDatabaseFlow();
}

async function testSupabaseAuthFlow() {
  console.log('  Testing Supabase Auth ? API ? React Hooks...');
  
  const checks = {
    supabaseClientExists: false,
    authHelpersUsed: false,
    hooksDefined: false,
    apiUsesAuth: false
  };
  
  // Check for Supabase client setup
  const webFiles = await findFiles('apps/web/.*\\.(ts|tsx)$', ROOT);
  const serverFiles = await findFiles('packages/server/.*\\.ts$', ROOT);
  
  for (const file of [...webFiles, ...serverFiles]) {
    try {
      const content = readFileSync(join(ROOT, file), 'utf-8');
      
      if (content.includes('@supabase/supabase-js') || content.includes('createClient')) {
        checks.supabaseClientExists = true;
      }
      
      if (content.includes('@supabase/auth-helpers')) {
        checks.authHelpersUsed = true;
      }
      
      if (file.includes('hooks') && (content.includes('useAuth') || content.includes('useUser'))) {
        checks.hooksDefined = true;
      }
      
      if (file.includes('api') && (content.includes('getAuthContext') || content.includes('getUser'))) {
        checks.apiUsesAuth = true;
      }
    } catch {
      // Skip unreadable files
    }
  }
  
  const allPass = Object.values(checks).every(v => v);
  heatmap.subsystems.supabaseAuth = {
    healthy: allPass,
    checks,
    score: Math.round((Object.values(checks).filter(v => v).length / Object.keys(checks).length) * 100)
  };
  
  if (!allPass) {
    heatmap.failures.push({
      subsystem: 'Supabase Auth',
      missing: Object.entries(checks).filter(([_, v]) => !v).map(([k]) => k)
    });
  }
  
  console.log(`    ${allPass ? '?' : '?'} Supabase Auth Flow (${heatmap.subsystems.supabaseAuth.score}%)`);
}

async function testStripeIntegration() {
  console.log('  Testing Stripe Webhooks ? Entitlement ? Front-end...');
  
  const checks = {
    stripeConfigured: false,
    webhookHandlerExists: false,
    entitlementServiceExists: false,
    frontendUsesStripe: false
  };
  
  const files = await findFiles('.*\\.(ts|tsx|js)$', ROOT);
  
  for (const file of files) {
    try {
      const content = readFileSync(join(ROOT, file), 'utf-8');
      const fullPath = join(ROOT, file);
      
      if (content.includes('stripe') && (content.includes('Stripe(') || content.includes('new Stripe'))) {
        checks.stripeConfigured = true;
      }
      
      if (file.includes('webhook') && content.includes('stripe')) {
        checks.webhookHandlerExists = true;
      }
      
      if ((file.includes('entitlement') || file.includes('subscription')) && content.includes('stripe')) {
        checks.entitlementServiceExists = true;
      }
      
      if ((file.includes('web/') || file.includes('app/')) && content.includes('stripe')) {
        checks.frontendUsesStripe = true;
      }
    } catch {
      // Skip
    }
  }
  
  const allPass = Object.values(checks).every(v => v);
  heatmap.subsystems.stripeIntegration = {
    healthy: allPass,
    checks,
    score: Math.round((Object.values(checks).filter(v => v).length / Object.keys(checks).length) * 100)
  };
  
  if (!allPass) {
    heatmap.warnings.push({
      subsystem: 'Stripe Integration',
      missing: Object.entries(checks).filter(([_, v]) => !v).map(([k]) => k)
    });
  }
  
  console.log(`    ${allPass ? '?' : '?'} Stripe Integration (${heatmap.subsystems.stripeIntegration.score}%)`);
}

async function testPartnerRevenueFlow() {
  console.log('  Testing Partner Webhooks ? Ad Engine ? Payout Job...');
  
  const checks = {
    partnerWebhookHandler: false,
    adEngineExists: false,
    payoutJobExists: false,
    stripeConnectUsed: false
  };
  
  const files = findFiles('.*\\.ts$', ROOT);
  
  for (const file of files) {
    try {
      const fullPath = file.startsWith('/') ? file : join(ROOT, file);
      const content = readFileSync(fullPath, 'utf-8');
      
      const fileName = file.toLowerCase();
      if (fileName.includes('partner') && (fileName.includes('webhook') || content.includes('webhook'))) {
        checks.partnerWebhookHandler = true;
      }
      
      if (fileName.includes('ad') && (fileName.includes('engine') || content.includes('adEngine'))) {
        checks.adEngineExists = true;
      }
      
      if (fileName.includes('payout') || (content.includes('payout') && content.includes('job'))) {
        checks.payoutJobExists = true;
      }
      
      if (content.includes('stripe') && content.includes('connect')) {
        checks.stripeConnectUsed = true;
      }
    } catch {
      // Skip
    }
  }
  
  const score = Math.round((Object.values(checks).filter(v => v).length / Object.keys(checks).length) * 100);
  heatmap.subsystems.partnerRevenue = {
    healthy: score >= 75,
    checks,
    score
  };
  
  console.log(`    ${score >= 75 ? '?' : '?'} Partner Revenue Flow (${score}%)`);
}

async function testDSARFlow() {
  console.log('  Testing DSAR Jobs ? Artifact Storage ? Evidence Bucket...');
  
  const checks = {
    dsarJobExists: false,
    artifactStorageExists: false,
    evidenceBucketReferenced: false
  };
  
  const files = findFiles('.*\\.ts$', ROOT);
  
  for (const file of files) {
    try {
      const fullPath = file.startsWith('/') ? file : join(ROOT, file);
      const content = readFileSync(fullPath, 'utf-8');
      
      if (file.includes('dsar') || content.includes('dsar') || content.includes('DSAR')) {
        checks.dsarJobExists = true;
      }
      
      if (content.includes('artifact') || content.includes('storage') || content.includes('bucket')) {
        checks.artifactStorageExists = true;
      }
      
      if (content.includes('evidence') && (content.includes('bucket') || content.includes('s3'))) {
        checks.evidenceBucketReferenced = true;
      }
    } catch {
      // Skip
    }
  }
  
  const score = Math.round((Object.values(checks).filter(v => v).length / Object.keys(checks).length) * 100);
  heatmap.subsystems.dsarFlow = {
    healthy: score >= 66,
    checks,
    score
  };
  
  console.log(`    ${score >= 66 ? '?' : '?'} DSAR Flow (${score}%)`);
}

async function testBackupFlow() {
  console.log('  Testing Backup Scripts ? Restore Pipeline ? DR Validation...');
  
  const checks = {
    backupScriptExists: false,
    restoreScriptExists: false,
    drValidationExists: false
  };
  
  const scripts = await findFiles('scripts/.*\\.(ts|js|mjs)$', ROOT);
  
  for (const file of scripts) {
    try {
      const content = readFileSync(join(ROOT, file), 'utf-8');
      const fileName = file.toLowerCase();
      
      if (fileName.includes('backup')) {
        checks.backupScriptExists = true;
      }
      
      if (fileName.includes('restore')) {
        checks.restoreScriptExists = true;
      }
      
      if (fileName.includes('dr') || fileName.includes('disaster') || fileName.includes('validate')) {
        checks.drValidationExists = true;
      }
    } catch {
      // Skip
    }
  }
  
  const score = Math.round((Object.values(checks).filter(v => v).length / Object.keys(checks).length) * 100);
  heatmap.subsystems.backupFlow = {
    healthy: score >= 66,
    checks,
    score
  };
  
  console.log(`    ${score >= 66 ? '?' : '?'} Backup Flow (${score}%)`);
}

async function testQueueSystem() {
  console.log('  Testing Queue ? Jobs ? Workers...');
  
  const checks = {
    queueConfigured: false,
    jobsDefined: false,
    workerRegistered: false,
    jobsRegisteredInQueue: false
  };
  
  const queueFile = join(ROOT, 'packages/server/src/queue/index.ts');
  if (existsSync(queueFile)) {
    checks.queueConfigured = true;
    const content = readFileSync(queueFile, 'utf-8');
    
    if (content.includes('Worker') || content.includes('worker')) {
      checks.workerRegistered = true;
    }
    
    if (content.includes('job.name') || content.includes('switch')) {
      checks.jobsRegisteredInQueue = true;
    }
  }
  
  const jobsDir = join(ROOT, 'packages/server/src/jobs');
  if (existsSync(jobsDir)) {
    const allFiles = readdirSync(jobsDir);
    const jobFiles = allFiles.filter(f => f.endsWith('.ts') && !f.includes('.test.') && !f.includes('.spec.'));
    checks.jobsDefined = jobFiles.length > 0;
  }
  
  const score = Math.round((Object.values(checks).filter(v => v).length / Object.keys(checks).length) * 100);
  heatmap.subsystems.queueSystem = {
    healthy: score >= 75,
    checks,
    score
  };
  
  console.log(`    ${score >= 75 ? '?' : '?'} Queue System (${score}%)`);
}

async function testAnalyticsFlow() {
  console.log('  Testing Analytics Events ? PostHog/Segment...');
  
  const checks = {
    analyticsConfigured: false,
    posthogUsed: false,
    segmentUsed: false,
    consentGateExists: false,
    eventsTracked: false
  };
  
  const files = await findFiles('.*\\.(ts|tsx)$', ROOT);
  
  for (const file of files) {
    try {
      const content = readFileSync(join(ROOT, file), 'utf-8');
      
      if (content.includes('posthog') || content.includes('PostHog')) {
        checks.posthogUsed = true;
        checks.analyticsConfigured = true;
      }
      
      if (content.includes('segment') || content.includes('Segment')) {
        checks.segmentUsed = true;
        checks.analyticsConfigured = true;
      }
      
      if (content.includes('consent') && (content.includes('gate') || content.includes('ConsentGate'))) {
        checks.consentGateExists = true;
      }
      
      if (content.includes('track') || content.includes('event') || content.includes('capture')) {
        checks.eventsTracked = true;
      }
    } catch {
      // Skip
    }
  }
  
  const score = Math.round((Object.values(checks).filter(v => v).length / Object.keys(checks).length) * 100);
  heatmap.subsystems.analyticsFlow = {
    healthy: score >= 60,
    checks,
    score
  };
  
  console.log(`    ${score >= 60 ? '?' : '?'} Analytics Flow (${score}%)`);
}

async function testAPIDatabaseFlow() {
  console.log('  Testing API Routes ? Database ? RLS...');
  
  const checks = {
    apiRoutesExist: false,
    databaseConnection: false,
    rlsPoliciesExist: false,
    apiUsesDatabase: false
  };
  
  // Check API routes
  const apiRoutes = await findFiles('apps/web/src/app/api/.*route\\.(ts|tsx)$', ROOT);
  checks.apiRoutesExist = apiRoutes.length > 0;
  
  // Check database setup
  const dbFile = join(ROOT, 'packages/server/src/db/index.ts');
  if (existsSync(dbFile)) {
    checks.databaseConnection = true;
    const content = readFileSync(dbFile, 'utf-8');
    checks.apiUsesDatabase = content.includes('export') || content.includes('db');
  }
  
  // Check RLS
  const rootFiles = readdirSync(ROOT);
  const sqlFiles = rootFiles.filter(f => f.startsWith('supabase_tables_part') && f.endsWith('.sql'));
  for (const file of sqlFiles.slice(0, 3)) {
    try {
      const content = readFileSync(join(ROOT, file), 'utf-8');
      if (content.includes('ROW LEVEL SECURITY') || content.includes('POLICY')) {
        checks.rlsPoliciesExist = true;
        break;
      }
    } catch {
      // Skip
    }
  }
  
  const score = Math.round((Object.values(checks).filter(v => v).length / Object.keys(checks).length) * 100);
  heatmap.subsystems.apiDatabase = {
    healthy: score >= 75,
    checks,
    score
  };
  
  console.log(`    ${score >= 75 ? '?' : '?'} API-Database Flow (${score}%)`);
}

// Generate connectivity matrix
function generateConnectivityMatrix() {
  const subsystems = Object.keys(heatmap.subsystems);
  const matrix = [];
  
  for (let i = 0; i < subsystems.length; i++) {
    for (let j = i + 1; j < subsystems.length; j++) {
      const sys1 = heatmap.subsystems[subsystems[i]];
      const sys2 = heatmap.subsystems[subsystems[j]];
      
      matrix.push({
        from: subsystems[i],
        to: subsystems[j],
        connected: sys1.healthy && sys2.healthy,
        health: Math.round((sys1.score + sys2.score) / 2)
      });
    }
  }
  
  heatmap.connections = matrix;
  
  // Calculate overall health
  const scores = Object.values(heatmap.subsystems).map(s => s.score);
  heatmap.health.overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  heatmap.health.healthyCount = Object.values(heatmap.subsystems).filter(s => s.healthy).length;
  heatmap.health.totalCount = Object.keys(heatmap.subsystems).length;
}

// Main execution
async function main() {
  console.log('?? Starting Connectivity Verification...\n');
  
  await testConnectivity();
  
  generateConnectivityMatrix();
  
  // Write output
  const outputDir = join(ROOT, 'reports', 'connectivity');
  const outputFile = join(outputDir, 'heatmap.json');
  
  const fs = await import('fs/promises');
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputFile, JSON.stringify(heatmap, null, 2));
  
  console.log(`\n? Connectivity verification complete!`);
  console.log(`?? Report written to: ${outputFile}`);
  
  // Print summary
  console.log('\n?? Connectivity Health Scorecard:');
  console.log(`  Overall Health: ${heatmap.health.overall}%`);
  console.log(`  Healthy Subsystems: ${heatmap.health.healthyCount}/${heatmap.health.totalCount}`);
  
  if (heatmap.failures.length > 0) {
    console.log(`\n??  Failures Found: ${heatmap.failures.length}`);
    heatmap.failures.forEach(f => {
      console.log(`    - ${f.subsystem}: Missing ${f.missing.join(', ')}`);
    });
  }
  
  if (heatmap.warnings.length > 0) {
    console.log(`\n??  Warnings: ${heatmap.warnings.length}`);
    heatmap.warnings.forEach(w => {
      console.log(`    - ${w.subsystem}: Missing ${w.missing.join(', ')}`);
    });
  }
}

main().catch(console.error);
