/**
 * Identify Missing Stack Credentials
 * 
 * This script identifies credentials that should be shared between staging
 * and production stacks and attempts to automate the sharing where possible.
 */

import * as fs from 'fs';
import * as path from 'path';

interface Credential {
  name: string;
  value?: string;
  shared: boolean; // Should be shared between stacks
  source: 'staging' | 'production' | 'both';
  canAutoShare: boolean; // Can be automatically shared via API
  requiresManual: boolean; // Requires manual configuration
}

interface StackComparison {
  staging: Record<string, string>;
  production: Record<string, string>;
  missing: Credential[];
}

// Credentials that should be SHARED between stacks
const SHARED_CREDENTIALS = [
  // Stripe webhook secrets (for cross-environment webhook handling)
  'STRIPE_WEBHOOK_SECRET',
  
  // Partner webhook secrets (for partner integrations)
  'WEBHOOK_SECRET_PARTNER',
  'WEBHOOK_SECRET_PAYMENTS',
  'PARTNER_CONVERSION_HMAC_SECRET',
  
  // Link signing secrets (for cross-environment deep links)
  'LINK_SIGNING_SECRET',
  
  // DSAR verification secrets (for privacy compliance)
  'DSAR_VERIFICATION_JWT_SECRET',
  
  // Admin JWT secrets (for admin panel access)
  'ADMIN_JWT_SECRET',
  
  // Artifact signing keys (for evidence/artifact storage)
  'ARTIFACTS_BUCKET_SIGNING_KEY',
  
  // Backup encryption keys (for disaster recovery)
  'BACKUP_ENCRYPTION_KEY',
  
  // Exchange rate API (for shared pricing)
  'EXCHANGE_RATE_API_KEY',
  
  // GeoIP license (for shared geo detection)
  'GEOIP_LICENSE_KEY',
];

// Credentials that should be SEPARATE per stack
const SEPARATE_CREDENTIALS = [
  // Supabase (different projects per environment)
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_DB_URL',
  'SUPABASE_PROJECT_REF',
  'SUPABASE_JWT_SECRET',
  
  // Vercel (different projects per environment)
  'VERCEL_TOKEN',
  'VERCEL_ORG_ID',
  'VERCEL_PROJECT_ID',
  
  // Domain/URL specific
  'NEXT_PUBLIC_APP_URL',
  'CORS_ORIGINS',
  'API_BASE_URL',
  'STAGING_API_URL',
  'PROD_API_URL',
  
  // Environment-specific analytics
  'NEXT_PUBLIC_POSTHOG_KEY',
  'NEXT_PUBLIC_GA_ID',
  'SENTRY_DSN',
  'NEXT_PUBLIC_SENTRY_DSN',
  
  // Stripe keys (test vs live)
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
];

// Credentials that can be automatically shared via Vercel API
const VERCEL_AUTO_SHARE = [
  'STRIPE_WEBHOOK_SECRET',
  'WEBHOOK_SECRET_PARTNER',
  'WEBHOOK_SECRET_PAYMENTS',
  'PARTNER_CONVERSION_HMAC_SECRET',
  'LINK_SIGNING_SECRET',
  'DSAR_VERIFICATION_JWT_SECRET',
  'ADMIN_JWT_SECRET',
  'ARTIFACTS_BUCKET_SIGNING_KEY',
  'BACKUP_ENCRYPTION_KEY',
  'EXCHANGE_RATE_API_KEY',
  'GEOIP_LICENSE_KEY',
];

// Credentials that require manual configuration
const MANUAL_REQUIRED = [
  // Secrets that need to be manually set in Supabase/Vercel dashboards
  'SUPABASE_SERVICE_ROLE_KEY', // Different per project
  'VERCEL_TOKEN', // Different per account
];

function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const env: Record<string, string> = {};
  
  const lines = content.split('\n');
  for (const line of lines) {
    // Skip comments and empty lines
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    // Match VAR_NAME=value
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '');
      env[key] = cleanValue;
    }
  }
  
  return env;
}

function getStagingEnv(): Record<string, string> {
  // Try multiple locations for staging env
  const paths = [
    '.env.staging',
    '.env.staging.local',
    'ops/env/.env.staging',
    '.env.local', // Fallback
  ];
  
  for (const envPath of paths) {
    if (fs.existsSync(envPath)) {
      return parseEnvFile(envPath);
    }
  }
  
  // Try to get from Vercel staging environment variables
  // (This would require Vercel API in production)
  console.warn('⚠️  No staging .env file found. Checking environment variables...');
  
  const staging: Record<string, string> = {};
  for (const key of Object.keys(process.env)) {
    if (process.env[key] && key.includes('STAGING')) {
      staging[key] = process.env[key];
    }
  }
  
  return staging;
}

function getProductionEnv(): Record<string, string> {
  // Try multiple locations for production env
  const paths = [
    '.env.production',
    '.env.production.local',
    'ops/env/.env.production',
    '.env', // Fallback
  ];
  
  for (const envPath of paths) {
    if (fs.existsSync(envPath)) {
      return parseEnvFile(envPath);
    }
  }
  
  // Try to get from process.env (production runtime)
  console.warn('⚠️  No production .env file found. Checking environment variables...');
  
  const production: Record<string, string> = {};
  for (const key of Object.keys(process.env)) {
    if (process.env[key] && !key.includes('STAGING')) {
      production[key] = process.env[key];
    }
  }
  
  return production;
}

function identifyMissingCredentials(staging: Record<string, string>, production: Record<string, string>): Credential[] {
  const missing: Credential[] = [];
  
  // Check shared credentials
  for (const credentialName of SHARED_CREDENTIALS) {
    const stagingValue = staging[credentialName];
    const productionValue = production[credentialName];
    
    let source: 'staging' | 'production' | 'both' = 'both';
    if (stagingValue && !productionValue) {
      source = 'staging';
    } else if (productionValue && !stagingValue) {
      source = 'production';
    } else if (!stagingValue && !productionValue) {
      continue; // Both missing, skip
    }
    
    const canAutoShare = VERCEL_AUTO_SHARE.includes(credentialName);
    const requiresManual = MANUAL_REQUIRED.includes(credentialName) || !canAutoShare;
    
    missing.push({
      name: credentialName,
      value: source === 'staging' ? stagingValue : productionValue,
      shared: true,
      source,
      canAutoShare,
      requiresManual,
    });
  }
  
  return missing;
}

async function attemptAutoShare(credential: Credential, sourceEnv: Record<string, string>, targetEnvName: 'staging' | 'production'): Promise<boolean> {
  if (!credential.canAutoShare) {
    return false;
  }
  
  const value = credential.value;
  if (!value || value.includes('your-') || value.includes('placeholder')) {
    console.warn(`   ⚠️  ${credential.name} has placeholder value, skipping auto-share`);
    return false;
  }
  
  // Check if Vercel API is available
  const vercelToken = process.env.VERCEL_TOKEN;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID;
  
  if (!vercelToken) {
    console.warn(`   ⚠️  VERCEL_TOKEN not found, cannot auto-share via Vercel API`);
    console.warn(`      Set VERCEL_TOKEN environment variable to enable auto-sharing`);
    return false;
  }
  
  if (!vercelProjectId) {
    console.warn(`   ⚠️  VERCEL_PROJECT_ID not found, cannot auto-share via Vercel API`);
    console.warn(`      Set VERCEL_PROJECT_ID environment variable to enable auto-sharing`);
    return false;
  }
  
  try {
    // Map target environment to Vercel environment type
    const vercelTarget = targetEnvName === 'production' ? 'production' : 'preview';
    
    console.log(`   📝 Setting ${credential.name} in ${targetEnvName} via Vercel API...`);
    
    // Use Vercel API to set environment variable
    const response = await fetch(`https://api.vercel.com/v10/projects/${vercelProjectId}/env`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: credential.name,
        value: value,
        target: [vercelTarget],
        type: 'encrypted',
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      // Check if env var already exists (409 conflict)
      if (response.status === 409) {
        console.log(`   ℹ️  ${credential.name} already exists in ${targetEnvName}, attempting to update...`);
        // Try to update existing env var
        const updateResponse = await fetch(`https://api.vercel.com/v10/projects/${vercelProjectId}/env/${credential.name}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${vercelToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            value: value,
            target: [vercelTarget],
          }),
        });
        
        if (!updateResponse.ok) {
          throw new Error(`Failed to update: ${await updateResponse.text()}`);
        }
        console.log(`   ✅ Updated ${credential.name} in ${targetEnvName}`);
        return true;
      }
      throw new Error(`Vercel API error: ${error}`);
    }
    
    const result = await response.json();
    console.log(`   ✅ Successfully set ${credential.name} in ${targetEnvName}`);
    return true;
  } catch (error: any) {
    console.error(`   ❌ Failed to auto-share ${credential.name}:`, error.message);
    console.error(`      You can manually set it via: vercel env add ${credential.name} ${targetEnvName}`);
    return false;
  }
}

async function generateReport(comparison: StackComparison, dryRun: boolean = true): Promise<void> {
  console.log('\n📊 Stack Credential Analysis Report\n');
  console.log('=' .repeat(60));
  
  const stagingCount = Object.keys(comparison.staging).length;
  const productionCount = Object.keys(comparison.production).length;
  
  console.log(`\n📈 Summary:`);
  console.log(`   Staging credentials: ${stagingCount}`);
  console.log(`   Production credentials: ${productionCount}`);
  console.log(`   Missing shared credentials: ${comparison.missing.length}`);
  
  if (comparison.missing.length === 0) {
    console.log('\n✅ All shared credentials are present in both stacks!');
    return;
  }
  
  console.log('\n🔍 Missing Shared Credentials:\n');
  
  const autoShareable = comparison.missing.filter(c => c.canAutoShare);
  const manualRequired = comparison.missing.filter(c => c.requiresManual);
  
  if (autoShareable.length > 0) {
    console.log('📦 Credentials that can be auto-shared:');
    for (const cred of autoShareable) {
      const icon = cred.source === 'staging' ? '🔵' : '🟢';
      console.log(`   ${icon} ${cred.name} (source: ${cred.source})`);
      if (cred.value && !cred.value.includes('your-') && !cred.value.includes('placeholder')) {
        console.log(`      Value: ${cred.value.substring(0, 20)}...`);
      }
      
      if (!dryRun) {
        const targetEnv = cred.source === 'staging' ? 'production' : 'staging';
        await attemptAutoShare(cred, comparison.staging, targetEnv as 'staging' | 'production');
      }
    }
    console.log('');
  }
  
  if (manualRequired.length > 0) {
    console.log('✋ Credentials requiring manual configuration:');
    for (const cred of manualRequired) {
      const icon = cred.source === 'staging' ? '🔵' : '🟢';
      console.log(`   ${icon} ${cred.name} (source: ${cred.source})`);
      console.log(`      Action: Manually copy ${cred.name} to ${cred.source === 'staging' ? 'production' : 'staging'} stack`);
      console.log(`      Location:`);
      console.log(`         - Vercel: Dashboard > Project > Settings > Environment Variables`);
      console.log(`         - Supabase: Dashboard > Settings > API (if applicable)`);
    }
    console.log('');
  }
  
  // Generate markdown report
  const reportPath = path.join(process.cwd(), 'ops', 'secrets', 'stack-credentials-report.md');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  let reportContent = `# Stack Credentials Report\n\n`;
  reportContent += `Generated: ${new Date().toISOString()}\n\n`;
  reportContent += `## Summary\n\n`;
  reportContent += `- Staging credentials: ${stagingCount}\n`;
  reportContent += `- Production credentials: ${productionCount}\n`;
  reportContent += `- Missing shared credentials: ${comparison.missing.length}\n\n`;
  
  if (autoShareable.length > 0) {
    reportContent += `## Auto-Shareable Credentials\n\n`;
    reportContent += `These credentials can be automatically shared via Vercel API:\n\n`;
    for (const cred of autoShareable) {
      reportContent += `### ${cred.name}\n\n`;
      reportContent += `- **Source**: ${cred.source}\n`;
      reportContent += `- **Action**: Copy to ${cred.source === 'staging' ? 'production' : 'staging'}\n`;
      reportContent += `- **Command**: \`vercel env add ${cred.name} ${cred.source === 'staging' ? 'production' : 'staging'}\`\n\n`;
    }
  }
  
  if (manualRequired.length > 0) {
    reportContent += `## Manual Configuration Required\n\n`;
    reportContent += `These credentials require manual configuration:\n\n`;
    for (const cred of manualRequired) {
      reportContent += `### ${cred.name}\n\n`;
      reportContent += `- **Source**: ${cred.source}\n`;
      reportContent += `- **Target**: ${cred.source === 'staging' ? 'production' : 'staging'}\n`;
      reportContent += `- **Steps**:\n`;
      reportContent += `  1. Go to Vercel Dashboard > Project Settings > Environment Variables\n`;
      reportContent += `  2. Add ${cred.name} to ${cred.source === 'staging' ? 'production' : 'staging'} environment\n`;
      reportContent += `  3. Copy value from ${cred.source} environment\n\n`;
    }
  }
  
  fs.writeFileSync(reportPath, reportContent);
  console.log(`\n📄 Full report saved to: ${reportPath}`);
}

export async function runIdentifyStackCredentials(options: { dryRun?: boolean; autoShare?: boolean }) {
  console.log('🔍 Identifying missing stack credentials...\n');
  
  const dryRun = options.dryRun !== false;
  const autoShare = options.autoShare === true && !dryRun;
  
  if (dryRun) {
    console.log('⚠️  Running in dry-run mode (no changes will be made)\n');
  }
  
  // Get environment configurations
  const staging = getStagingEnv();
  const production = getProductionEnv();
  
  // Also check .env.example for expected credentials
  const envExample = parseEnvFile('.env.example');
  
  // Identify missing credentials
  const missing = identifyMissingCredentials(staging, production);
  
  const comparison: StackComparison = {
    staging,
    production,
    missing,
  };
  
  // Generate report
  await generateReport(comparison, dryRun);
  
  // Attempt auto-share if requested
  if (autoShare) {
    console.log('\n🔄 Attempting to auto-share credentials...\n');
    let sharedCount = 0;
    
    for (const cred of missing.filter(c => c.canAutoShare)) {
      const targetEnv = cred.source === 'staging' ? 'production' : 'staging';
      const success = await attemptAutoShare(cred, staging, targetEnv as 'staging' | 'production');
      if (success) {
        sharedCount++;
      }
    }
    
    console.log(`\n✅ Auto-shared ${sharedCount} credentials`);
  }
  
  // Exit with error code if there are missing credentials
  if (missing.length > 0) {
    console.log(`\n⚠️  Found ${missing.length} missing shared credentials`);
    console.log('   Run with --auto-share to attempt automatic sharing');
    console.log('   Or manually configure as shown in the report');
    process.exit(1);
  }
  
  console.log('\n✅ All shared credentials are configured!');
  process.exit(0);
}
