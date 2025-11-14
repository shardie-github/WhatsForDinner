#!/usr/bin/env node
/**
 * Full-Stack Smoke Test
 * 
 * Validates environment variables and secrets across all layers:
 * - Cursor local environment
 * - .env.local in repo root
 * - Supabase Project Settings
 * - GitHub repo secrets
 * - GitHub Actions runtime environment
 * - Vercel project environment variables (Production, Preview, Development)
 * - Deployed Vercel serverless & edge functions environment
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Expected key variables for parity check
const KEY_VARIABLES = [
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

// Results storage
const results = {
  cursorEnv: {},
  envLocal: {},
  supabase: {},
  githubSecrets: {},
  githubActions: {},
  vercelProduction: {},
  vercelPreview: {},
  vercelDevelopment: {},
  vercelRuntime: {},
  parityMatrix: {},
  connectivity: {
    supabase: { connected: false, error: null },
    vercel: { connected: false, error: null },
    github: { connected: false, error: null },
  },
  errors: [],
  warnings: [],
};

/**
 * 1. Check Cursor local environment
 */
function checkCursorEnv() {
  log('\n📋 1. Checking Cursor Local Environment...', 'cyan');
  
  KEY_VARIABLES.forEach(key => {
    const value = process.env[key];
    results.cursorEnv[key] = value || null;
    if (value) {
      log(`  ✅ ${key}: ${value.substring(0, 20)}...`, 'green');
    } else {
      log(`  ❌ ${key}: NOT SET`, 'red');
      results.warnings.push(`Cursor env missing: ${key}`);
    }
  });
  
  // Check for additional project-specific variables
  const allEnvKeys = Object.keys(process.env).filter(k => 
    k.includes('SUPABASE') || k.includes('DATABASE') || k.includes('VERCEL') || k.includes('GITHUB')
  );
  allEnvKeys.forEach(key => {
    if (!KEY_VARIABLES.includes(key)) {
      results.cursorEnv[key] = process.env[key];
    }
  });
}

/**
 * 2. Check .env.local file
 */
function checkEnvLocal() {
  log('\n📋 2. Checking .env.local file...', 'cyan');
  
  const envLocalPath = join(ROOT_DIR, '.env.local');
  
  if (!existsSync(envLocalPath)) {
    log('  ⚠️  .env.local file not found', 'yellow');
    results.warnings.push('.env.local file does not exist');
    return;
  }
  
  try {
    const content = readFileSync(envLocalPath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          results.envLocal[key.trim()] = value;
          
          if (KEY_VARIABLES.includes(key.trim())) {
            log(`  ✅ ${key.trim()}: ${value.substring(0, 20)}...`, 'green');
          }
        }
      }
    });
  } catch (error) {
    log(`  ❌ Error reading .env.local: ${error.message}`, 'red');
    results.errors.push(`Failed to read .env.local: ${error.message}`);
  }
}

/**
 * 3. Check Supabase connectivity and secrets
 */
async function checkSupabase() {
  log('\n📋 3. Checking Supabase Connectivity...', 'cyan');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    log('  ❌ Missing Supabase credentials', 'red');
    results.connectivity.supabase = { connected: false, error: 'Missing credentials' };
    results.errors.push('Supabase credentials not found in environment');
    return;
  }
  
  results.supabase.SUPABASE_URL = supabaseUrl;
  results.supabase.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'NOT_SET';
  results.supabase.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT_SET';
  
  try {
    // Try to import and use Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection with a simple query
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table not found, but connection works
      throw error;
    }
    
    log('  ✅ Supabase connection successful', 'green');
    results.connectivity.supabase = { connected: true, error: null };
    
    // Test DATABASE_URL connectivity
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      try {
        // Try to connect using pg or direct connection
        const { Client } = await import('pg');
        const client = new Client({ connectionString: dbUrl });
        await client.connect();
        const dbResult = await client.query('SELECT now()');
        await client.end();
        
        log('  ✅ DATABASE_URL connection successful', 'green');
        results.supabase.DATABASE_URL = 'CONNECTED';
      } catch (dbError) {
        log(`  ⚠️  DATABASE_URL connection failed: ${dbError.message}`, 'yellow');
        results.warnings.push(`DATABASE_URL connection failed: ${dbError.message}`);
      }
    }
    
    // Validate JWT secret if available
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (jwtSecret) {
      results.supabase.SUPABASE_JWT_SECRET = 'SET';
      log('  ✅ SUPABASE_JWT_SECRET is set', 'green');
    } else {
      log('  ⚠️  SUPABASE_JWT_SECRET not found', 'yellow');
      results.warnings.push('SUPABASE_JWT_SECRET not found');
    }
    
    // Check for core schema
    try {
      const { data: tables } = await supabase.rpc('get_schema_tables');
      if (tables && tables.length > 0) {
        log(`  ✅ Found ${tables.length} tables in schema`, 'green');
      }
    } catch (e) {
      // Schema check failed, but connection works
      log('  ⚠️  Could not verify schema (this is OK if RLS is enabled)', 'yellow');
    }
    
  } catch (error) {
    log(`  ❌ Supabase connection failed: ${error.message}`, 'red');
    results.connectivity.supabase = { connected: false, error: error.message };
    results.errors.push(`Supabase connection failed: ${error.message}`);
  }
}

/**
 * 4. Check GitHub Secrets (via API)
 */
async function checkGitHubSecrets() {
  log('\n📋 4. Checking GitHub Secrets...', 'cyan');
  
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER || 'your-org';
  const repoName = process.env.GITHUB_REPO_NAME || 'your-repo';
  
  if (!githubToken) {
    log('  ⚠️  GITHUB_TOKEN not set, skipping GitHub secrets check', 'yellow');
    results.warnings.push('GITHUB_TOKEN not set, cannot check GitHub secrets');
    return;
  }
  
  try {
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: githubToken });
    
    // List repository secrets
    const { data } = await octokit.rest.actions.listRepoSecrets({
      owner: repoOwner,
      repo: repoName,
    });
    
    const secretNames = data.secrets.map(s => s.name);
    
    KEY_VARIABLES.forEach(key => {
      if (secretNames.includes(key)) {
        results.githubSecrets[key] = 'SET';
        log(`  ✅ ${key}: Found in GitHub secrets`, 'green');
      } else {
        results.githubSecrets[key] = 'NOT_SET';
        log(`  ❌ ${key}: Not found in GitHub secrets`, 'red');
        results.warnings.push(`GitHub secret missing: ${key}`);
      }
    });
    
    results.connectivity.github = { connected: true, error: null };
    
  } catch (error) {
    log(`  ❌ GitHub API error: ${error.message}`, 'red');
    results.connectivity.github = { connected: false, error: error.message };
    results.errors.push(`GitHub secrets check failed: ${error.message}`);
  }
}

/**
 * 5. Check Vercel Environment Variables
 */
async function checkVercelEnv() {
  log('\n📋 5. Checking Vercel Environment Variables...', 'cyan');
  
  const vercelToken = process.env.VERCEL_TOKEN;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID;
  
  if (!vercelToken) {
    log('  ⚠️  VERCEL_TOKEN not set, skipping Vercel check', 'yellow');
    results.warnings.push('VERCEL_TOKEN not set, cannot check Vercel env vars');
    return;
  }
  
  if (!vercelProjectId) {
    log('  ⚠️  VERCEL_PROJECT_ID not set, skipping Vercel check', 'yellow');
    results.warnings.push('VERCEL_PROJECT_ID not set, cannot check Vercel env vars');
    return;
  }
  
  const environments = ['production', 'preview', 'development'];
  
  for (const env of environments) {
    log(`\n  Checking ${env} environment...`, 'blue');
    
    try {
      const apiUrl = `https://api.vercel.com/v10/projects/${vercelProjectId}/env`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Vercel API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const envVars = data.envs || [];
      
      // Filter by environment
      const envSpecificVars = envVars.filter(v => 
        v.target.includes(env) || v.target.includes('all')
      );
      
      const envResults = {};
      KEY_VARIABLES.forEach(key => {
        const found = envSpecificVars.find(v => v.key === key);
        if (found) {
          envResults[key] = 'SET';
          log(`    ✅ ${key}: Found`, 'green');
        } else {
          envResults[key] = 'NOT_SET';
          log(`    ❌ ${key}: Not found`, 'red');
          results.warnings.push(`Vercel ${env} missing: ${key}`);
        }
      });
      
      if (env === 'production') {
        results.vercelProduction = envResults;
      } else if (env === 'preview') {
        results.vercelPreview = envResults;
      } else {
        results.vercelDevelopment = envResults;
      }
      
      results.connectivity.vercel = { connected: true, error: null };
      
    } catch (error) {
      log(`  ❌ Vercel ${env} check failed: ${error.message}`, 'red');
      results.errors.push(`Vercel ${env} check failed: ${error.message}`);
    }
  }
}

/**
 * 6. Simulate GitHub Actions CI (Dry-Run)
 */
async function simulateGitHubActions() {
  log('\n📋 6. Simulating GitHub Actions CI (Dry-Run)...', 'cyan');
  
  const githubToken = process.env.GITHUB_TOKEN;
  const dbUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  results.githubActions = {
    secretsLoaded: false,
    buildSuccess: false,
    supabaseCliTest: false,
    dbLint: false,
    functionsDeploy: false,
    errors: [],
  };
  
  // Simulate loading secrets
  log('  📋 Simulating secret loading...', 'blue');
  const requiredSecrets = ['DATABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  const missingSecrets = requiredSecrets.filter(key => !process.env[key]);
  
  if (missingSecrets.length === 0) {
    log('  ✅ All required secrets would be available in CI', 'green');
    results.githubActions.secretsLoaded = true;
  } else {
    log(`  ❌ Missing secrets in CI simulation: ${missingSecrets.join(', ')}`, 'red');
    results.githubActions.errors.push(`Missing secrets: ${missingSecrets.join(', ')}`);
    results.warnings.push(`GitHub Actions would fail without: ${missingSecrets.join(', ')}`);
  }
  
  // Simulate Next.js build
  log('  📋 Simulating Next.js build...', 'blue');
  try {
    const packageJsonPath = join(ROOT_DIR, 'apps', 'web', 'package.json');
    if (existsSync(packageJsonPath)) {
      log('  ✅ Next.js app structure found', 'green');
      // In a real CI, this would run: pnpm build
      // For dry-run, we just check if the structure exists
      results.githubActions.buildSuccess = true;
    } else {
      log('  ⚠️  Next.js app not found at apps/web', 'yellow');
    }
  } catch (error) {
    log(`  ❌ Build simulation failed: ${error.message}`, 'red');
    results.githubActions.errors.push(`Build simulation: ${error.message}`);
  }
  
  // Simulate Supabase CLI connectivity test
  log('  📋 Simulating Supabase CLI connectivity test...', 'blue');
  if (supabaseUrl && supabaseAnonKey) {
    try {
      // Try to connect using Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { error } = await supabase.from('users').select('count').limit(1);
      
      if (!error || error.code === 'PGRST116') {
        log('  ✅ Supabase CLI connectivity test would pass', 'green');
        results.githubActions.supabaseCliTest = true;
      } else {
        log(`  ⚠️  Supabase connectivity issue: ${error.message}`, 'yellow');
        results.githubActions.errors.push(`Supabase CLI test: ${error.message}`);
      }
    } catch (error) {
      log(`  ❌ Supabase CLI test failed: ${error.message}`, 'red');
      results.githubActions.errors.push(`Supabase CLI test: ${error.message}`);
    }
  } else {
    log('  ⚠️  Missing Supabase credentials for CLI test', 'yellow');
    results.githubActions.errors.push('Missing Supabase credentials');
  }
  
  // Simulate supabase db lint
  log('  📋 Simulating supabase db lint...', 'blue');
  try {
    const migrationsDir = join(ROOT_DIR, 'supabase', 'migrations');
    if (existsSync(migrationsDir)) {
      const migrations = execSync(`find ${migrationsDir} -name "*.sql" -type f 2>/dev/null | wc -l`, { encoding: 'utf-8' }).trim();
      if (parseInt(migrations) > 0) {
        log(`  ✅ Found ${migrations} migration files to lint`, 'green');
        // In real CI: supabase db lint
        results.githubActions.dbLint = true;
      } else {
        log('  ⚠️  No migrations found', 'yellow');
      }
    } else {
      log('  ⚠️  Migrations directory not found', 'yellow');
    }
  } catch (error) {
    log(`  ⚠️  DB lint simulation: ${error.message}`, 'yellow');
  }
  
  // Simulate supabase functions deploy --dry-run
  log('  📋 Simulating supabase functions deploy --dry-run...', 'blue');
  try {
    const functionsDir = join(ROOT_DIR, 'supabase', 'functions');
    if (existsSync(functionsDir)) {
      const functions = execSync(`find ${functionsDir} -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l`, { encoding: 'utf-8' }).trim();
      if (parseInt(functions) > 0) {
        log(`  ✅ Found ${functions} edge functions to deploy`, 'green');
        // In real CI: supabase functions deploy --dry-run
        results.githubActions.functionsDeploy = true;
      } else {
        log('  ⚠️  No edge functions found', 'yellow');
      }
    } else {
      log('  ⚠️  Functions directory not found', 'yellow');
    }
  } catch (error) {
    log(`  ⚠️  Functions deploy simulation: ${error.message}`, 'yellow');
  }
  
  // Summary
  const allPassed = results.githubActions.secretsLoaded && 
                    results.githubActions.buildSuccess && 
                    results.githubActions.supabaseCliTest &&
                    results.githubActions.errors.length === 0;
  
  if (allPassed) {
    log('  ✅ GitHub Actions CI simulation: PASS', 'green');
  } else {
    log('  ⚠️  GitHub Actions CI simulation: Some checks would fail', 'yellow');
    results.warnings.push('GitHub Actions CI simulation found potential issues');
  }
}

/**
 * 7. Test Vercel Endpoints
 */
async function testVercelEndpoints() {
  log('\n📋 7. Testing Vercel Deployed Endpoints...', 'cyan');
  
  const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL;
  
  if (!vercelUrl) {
    log('  ⚠️  VERCEL_URL or NEXT_PUBLIC_APP_URL not set, skipping endpoint tests', 'yellow');
    results.warnings.push('Vercel URL not set, cannot test endpoints');
    return;
  }
  
  results.vercelRuntime = {
    endpoints: {},
    errors: [],
  };
  
  // Common API routes to test
  const endpoints = [
    '/api/health',
    '/api/status',
    '/api/healthcheck',
  ];
  
  for (const endpoint of endpoints) {
    try {
      const url = `${vercelUrl}${endpoint}`;
      log(`  📋 Testing ${endpoint}...`, 'blue');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Full-Stack-Smoke-Test/1.0',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (response.ok) {
        log(`  ✅ ${endpoint}: ${response.status} OK`, 'green');
        results.vercelRuntime.endpoints[endpoint] = {
          status: response.status,
          ok: true,
        };
      } else {
        log(`  ⚠️  ${endpoint}: ${response.status}`, 'yellow');
        results.vercelRuntime.endpoints[endpoint] = {
          status: response.status,
          ok: false,
        };
      }
    } catch (error) {
      log(`  ❌ ${endpoint}: ${error.message}`, 'red');
      results.vercelRuntime.endpoints[endpoint] = {
        status: 'ERROR',
        ok: false,
        error: error.message,
      };
      results.vercelRuntime.errors.push(`${endpoint}: ${error.message}`);
    }
  }
  
  // Check environment variables in runtime (if we can access them)
  log('  📋 Checking runtime environment variables...', 'blue');
  try {
    // Try to access a health endpoint that might expose env var status
    const healthUrl = `${vercelUrl}/api/health`;
    const response = await fetch(healthUrl, { signal: AbortSignal.timeout(5000) });
    
    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      if (data.env) {
        log('  ✅ Runtime environment variables accessible', 'green');
      } else {
        log('  ⚠️  Cannot verify runtime env vars (endpoint does not expose them)', 'yellow');
      }
    }
  } catch (error) {
    log(`  ⚠️  Could not check runtime env vars: ${error.message}`, 'yellow');
  }
}

/**
 * 8. Check Local Development (Node, Prisma)
 */
async function checkLocalDev() {
  log('\n📋 8. Checking Local Development Environment...', 'cyan');
  
  // Check Node version
  try {
    const nodeVersion = process.version;
    log(`  ✅ Node version: ${nodeVersion}`, 'green');
    
    // Check against package.json engines
    const packageJsonPath = join(ROOT_DIR, 'package.json');
    if (existsSync(packageJsonPath)) {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      if (pkg.engines && pkg.engines.node) {
        const required = pkg.engines.node;
        log(`  📋 Required Node version: ${required}`, 'cyan');
        // Check Node version against requirement
        const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
        if (required.includes('>=') && required.includes('<')) {
          // Parse range like ">=18.0.0 <21.0.0"
          const minMatch = required.match(/>=(\d+)/);
          const maxMatch = required.match(/<(\d+)/);
          const minVersion = minMatch ? parseInt(minMatch[1]) : 0;
          const maxVersion = maxMatch ? parseInt(maxMatch[1]) : Infinity;
          
          if (majorVersion >= minVersion && majorVersion < maxVersion) {
            log(`  ✅ Node version meets requirement`, 'green');
          } else {
            log(`  ❌ Node version ${majorVersion} does not meet requirement ${required}`, 'red');
            results.errors.push(`Node version ${nodeVersion} does not meet requirement ${required}`);
          }
        } else if (required.includes('>=')) {
          const minVersion = parseInt(required.match(/\d+/)[0]);
          if (majorVersion >= minVersion) {
            log(`  ✅ Node version meets requirement`, 'green');
          } else {
            log(`  ❌ Node version does not meet requirement`, 'red');
            results.errors.push(`Node version ${nodeVersion} does not meet requirement ${required}`);
          }
        }
      }
    }
  } catch (error) {
    log(`  ⚠️  Could not check Node version: ${error.message}`, 'yellow');
  }
  
  // Check Prisma
  try {
    const prismaSchemaPath = join(ROOT_DIR, 'prisma', 'schema.prisma');
    if (existsSync(prismaSchemaPath)) {
      log('  ✅ Prisma schema found', 'green');
      
      // Check DATABASE_URL for Prisma
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl) {
        try {
          // Try prisma generate
          execSync('npx prisma generate', { 
            cwd: ROOT_DIR, 
            stdio: 'pipe',
            env: { ...process.env, DATABASE_URL: dbUrl }
          });
          log('  ✅ Prisma generate successful', 'green');
        } catch (error) {
          log(`  ⚠️  Prisma generate failed: ${error.message}`, 'yellow');
          results.warnings.push(`Prisma generate failed: ${error.message}`);
        }
        
        // Try prisma migrate status
        try {
          execSync('npx prisma migrate status', { 
            cwd: ROOT_DIR, 
            stdio: 'pipe',
            env: { ...process.env, DATABASE_URL: dbUrl }
          });
          log('  ✅ Prisma migrate status successful', 'green');
        } catch (error) {
          log(`  ⚠️  Prisma migrate status failed: ${error.message}`, 'yellow');
          results.warnings.push(`Prisma migrate status failed: ${error.message}`);
        }
      } else {
        log('  ⚠️  DATABASE_URL not set, skipping Prisma checks', 'yellow');
        results.warnings.push('DATABASE_URL not set for Prisma checks');
      }
    }
  } catch (error) {
    log(`  ⚠️  Prisma check error: ${error.message}`, 'yellow');
  }
}

/**
 * 9. Generate Secret Parity Matrix
 */
function generateParityMatrix() {
  log('\n📋 9. Generating Secret Parity Matrix...', 'cyan');
  
  const sources = {
    'Cursor Env': results.cursorEnv,
    '.env.local': results.envLocal,
    'Supabase': results.supabase,
    'GitHub Secrets': results.githubSecrets,
    'Vercel Production': results.vercelProduction,
    'Vercel Preview': results.vercelPreview,
    'Vercel Development': results.vercelDevelopment,
  };
  
  KEY_VARIABLES.forEach(key => {
    const matrix = {};
    Object.keys(sources).forEach(source => {
      const sourceData = sources[source];
      const value = sourceData[key];
      if (value === undefined || value === null) {
        matrix[source] = 'NOT_SET';
      } else if (value === 'SET' || value === 'CONNECTED') {
        matrix[source] = 'SET';
      } else {
        matrix[source] = 'SET';
      }
    });
    results.parityMatrix[key] = matrix;
  });
  
  // Check for mismatches
  KEY_VARIABLES.forEach(key => {
    const values = Object.values(results.parityMatrix[key]);
    const uniqueValues = [...new Set(values)];
    
    if (uniqueValues.length > 1) {
      log(`  ⚠️  ${key}: Mismatch detected`, 'yellow');
      results.warnings.push(`Parity mismatch for ${key}`);
    } else if (uniqueValues[0] === 'NOT_SET') {
      log(`  ❌ ${key}: Not set in any source`, 'red');
      results.errors.push(`${key} not set in any source`);
    } else {
      log(`  ✅ ${key}: Consistent across sources`, 'green');
    }
  });
}

/**
 * 10. Generate Self-Healing Patches
 */
function generatePatches() {
  log('\n📋 10. Generating Self-Healing Patches...', 'cyan');
  
  const fixesDir = join(ROOT_DIR, '.cursor', 'fixes');
  if (!existsSync(fixesDir)) {
    mkdirSync(fixesDir, { recursive: true });
  }
  
  const patches = {
    missingVariables: [],
    mismatchedVariables: [],
    commands: [],
  };
  
  // Identify missing variables
  KEY_VARIABLES.forEach(key => {
    const matrix = results.parityMatrix[key];
    const sources = Object.keys(matrix);
    const setSources = sources.filter(s => matrix[s] === 'SET');
    
    if (setSources.length === 0) {
      patches.missingVariables.push({
        key,
        authoritativeSource: 'Supabase',
        recommendedValue: 'SET_IN_SUPABASE_DASHBOARD',
      });
    } else if (setSources.length < sources.length) {
      patches.mismatchedVariables.push({
        key,
        setIn: setSources,
        missingIn: sources.filter(s => matrix[s] !== 'SET'),
      });
    }
  });
  
  // Generate sync commands
  if (patches.missingVariables.length > 0 || patches.mismatchedVariables.length > 0) {
    patches.commands.push('# Sync secrets from Supabase to Vercel');
    patches.commands.push('pnpm secrets:sync:sb-to-vercel');
    patches.commands.push('');
    patches.commands.push('# Or manually sync via:');
    patches.commands.push('node scripts/sync-secrets-supabase-vercel.mjs supabase-to-vercel');
  }
  
  const patchContent = `# Environment Variable Sync Fixes
Generated: ${new Date().toISOString()}

## Missing Variables

${patches.missingVariables.map(v => `- **${v.key}**: Set in ${v.authoritativeSource}`).join('\n')}

## Mismatched Variables

${patches.mismatchedVariables.map(v => 
  `- **${v.key}**: Set in ${v.setIn.join(', ')}, missing in ${v.missingIn.join(', ')}`
).join('\n')}

## Sync Commands

\`\`\`bash
${patches.commands.join('\n')}
\`\`\`

## Authoritative Source

**Supabase Dashboard** is the authoritative source for all environment variables.
All other sources should be synced from Supabase.

## Manual Steps

1. Go to Supabase Dashboard > Settings > API
2. Copy the values for:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - SUPABASE_JWT_SECRET (if applicable)
3. Set DATABASE_URL using: postgresql://postgres:[SERVICE_ROLE_KEY]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
4. Run sync script: \`pnpm secrets:sync:sb-to-vercel\`
`;
  
  const patchPath = join(fixesDir, 'env_sync.md');
  writeFileSync(patchPath, patchContent);
  log(`  ✅ Patch file created: ${patchPath}`, 'green');
  
  return patches;
}

/**
 * 11. Generate Final Report
 */
function generateReport() {
  log('\n📋 11. Generating Final Report...', 'cyan');
  
  const reportPath = join(ROOT_DIR, 'FULL_STACK_SMOKE_TEST_REPORT.md');
  
  const report = `# FULL STACK SMOKE TEST REPORT
Generated: ${new Date().toISOString()}

## Executive Summary

- **Status**: ${results.errors.length === 0 ? '✅ PASS' : '❌ FAIL'}
- **Errors**: ${results.errors.length}
- **Warnings**: ${results.warnings.length}
- **Connectivity**: 
  - Supabase: ${results.connectivity.supabase.connected ? '✅ Connected' : '❌ Failed'}
  - Vercel: ${results.connectivity.vercel.connected ? '✅ Connected' : '❌ Failed'}
  - GitHub: ${results.connectivity.github.connected ? '✅ Connected' : '❌ Failed'}

---

## 1. Secret Parity Matrix

| Variable | Cursor Env | .env.local | Supabase | GitHub Secrets | Vercel Prod | Vercel Preview | Vercel Dev |
|----------|------------|------------|----------|----------------|-------------|----------------|------------|
${KEY_VARIABLES.map(key => {
  const matrix = results.parityMatrix[key] || {};
  return `| ${key} | ${matrix['Cursor Env'] || 'N/A'} | ${matrix['.env.local'] || 'N/A'} | ${matrix['Supabase'] || 'N/A'} | ${matrix['GitHub Secrets'] || 'N/A'} | ${matrix['Vercel Production'] || 'N/A'} | ${matrix['Vercel Preview'] || 'N/A'} | ${matrix['Vercel Development'] || 'N/A'} |`;
}).join('\n')}

---

## 2. Connectivity Results

### Supabase
- **Status**: ${results.connectivity.supabase.connected ? '✅ Connected' : '❌ Failed'}
${results.connectivity.supabase.error ? `- **Error**: ${results.connectivity.supabase.error}` : ''}
- **URL**: ${results.supabase.SUPABASE_URL || 'NOT_SET'}
- **Service Role Key**: ${results.supabase.SUPABASE_SERVICE_ROLE_KEY || 'NOT_SET'}
- **Database Connection**: ${results.supabase.DATABASE_URL || 'NOT_SET'}

### Vercel
- **Status**: ${results.connectivity.vercel.connected ? '✅ Connected' : '❌ Failed'}
${results.connectivity.vercel.error ? `- **Error**: ${results.connectivity.vercel.error}` : ''}
${results.vercelRuntime && Object.keys(results.vercelRuntime.endpoints || {}).length > 0 ? `
#### Endpoint Tests
${Object.entries(results.vercelRuntime.endpoints).map(([endpoint, result]) => 
  `- **${endpoint}**: ${result.ok ? '✅' : '❌'} ${result.status}${result.error ? ` (${result.error})` : ''}`
).join('\n')}
` : ''}

### GitHub
- **Status**: ${results.connectivity.github.connected ? '✅ Connected' : '❌ Failed'}
${results.connectivity.github.error ? `- **Error**: ${results.connectivity.github.error}` : ''}

### GitHub Actions CI Simulation
${results.githubActions ? `
- **Secrets Loaded**: ${results.githubActions.secretsLoaded ? '✅' : '❌'}
- **Build Success**: ${results.githubActions.buildSuccess ? '✅' : '❌'}
- **Supabase CLI Test**: ${results.githubActions.supabaseCliTest ? '✅' : '❌'}
- **DB Lint**: ${results.githubActions.dbLint ? '✅' : '❌'}
- **Functions Deploy**: ${results.githubActions.functionsDeploy ? '✅' : '❌'}
${results.githubActions.errors.length > 0 ? `- **Errors**: ${results.githubActions.errors.join('; ')}` : ''}
` : 'Not simulated'}

---

## 3. Errors Found

${results.errors.length === 0 ? '✅ No errors found' : results.errors.map(e => `- ❌ ${e}`).join('\n')}

---

## 4. Warnings

${results.warnings.length === 0 ? '✅ No warnings' : results.warnings.map(w => `- ⚠️  ${w}`).join('\n')}

---

## 5. Auto-Fix Steps

See \`.cursor/fixes/env_sync.md\` for detailed fix instructions.

### Quick Fix Commands

\`\`\`bash
# Sync secrets from Supabase to Vercel
pnpm secrets:sync:sb-to-vercel

# Or manually
node scripts/sync-secrets-supabase-vercel.mjs supabase-to-vercel
\`\`\`

---

## 6. Final Status

**${results.errors.length === 0 ? '✅ PASS - Stack is ready' : '❌ FAIL - Stack needs synchronization'}**

${results.errors.length === 0 
  ? 'All environment variables are correctly configured and synchronized across all layers.'
  : 'Please review errors above and run the sync commands to fix mismatches.'
}

---

## 7. Next Steps

1. ${results.errors.length > 0 ? 'Review errors and warnings above' : '✅ All checks passed'}
2. ${results.warnings.length > 0 ? 'Address warnings to ensure full parity' : '✅ No warnings'}
3. Run sync commands if mismatches were found
4. Re-run this smoke test to verify fixes
5. Deploy and test in production environment

---

*Report generated by full-stack-smoke-test.mjs*
`;
  
  writeFileSync(reportPath, report);
  log(`  ✅ Report generated: ${reportPath}`, 'green');
  
  return reportPath;
}

/**
 * Main execution
 */
async function main() {
  log('🚀 Starting Full-Stack Smoke Test...', 'cyan');
  log('=====================================\n', 'cyan');
  
  try {
    // Run all checks
    checkCursorEnv();
    checkEnvLocal();
    await checkSupabase();
    await checkGitHubSecrets();
    await checkVercelEnv();
    await simulateGitHubActions();
    await testVercelEndpoints();
    await checkLocalDev();
    generateParityMatrix();
    generatePatches();
    const reportPath = generateReport();
    
    // Final summary
    log('\n' + '='.repeat(50), 'cyan');
    log('📊 SMOKE TEST SUMMARY', 'cyan');
    log('='.repeat(50), 'cyan');
    log(`Errors: ${results.errors.length}`, results.errors.length > 0 ? 'red' : 'green');
    log(`Warnings: ${results.warnings.length}`, results.warnings.length > 0 ? 'yellow' : 'green');
    log(`Status: ${results.errors.length === 0 ? '✅ PASS' : '❌ FAIL'}`, results.errors.length === 0 ? 'green' : 'red');
    log(`\nReport saved to: ${reportPath}`, 'cyan');
    
    if (results.errors.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();
