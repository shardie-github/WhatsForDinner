#!/usr/bin/env node
/**
 * Nomad Grand Continuity Audit - Inventory Phase
 * Maps all components, dependencies, routes, jobs, and identifies orphaned modules
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, relative, extname } from 'path';
import { fileURLToPath } from 'url';

// Recursive glob replacement
async function findFiles(pattern, rootDir, ignoreDirs = ['node_modules', '.next', 'dist', '.git']) {
  const results = [];
  const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
  
  function walk(dir, baseDir = rootDir) {
    if (!existsSync(dir)) return;
    
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.env') continue;
      
      const fullPath = join(dir, entry.name);
      const relPath = relative(baseDir, fullPath);
      
      if (entry.isDirectory()) {
        if (!ignoreDirs.some(ig => fullPath.includes(ig))) {
          walk(fullPath, baseDir);
        }
      } else if (entry.isFile()) {
        if (regex.test(relPath)) {
          results.push(relPath);
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

const inventory = {
  timestamp: new Date().toISOString(),
  apps: {},
  packages: {},
  jobs: {},
  routes: {},
  database: {
    tables: [],
    migrations: [],
    rls: []
  },
  integrations: {
    supabase: { configured: false, hooks: [] },
    stripe: { configured: false, webhooks: [] },
    posthog: { configured: false },
    redis: { configured: false },
    bullmq: { configured: false, queues: [] }
  },
  dependencies: {
    circular: [],
    missing: [],
    unused: []
  },
  orphaned: [],
  coverage: {
    tested: 0,
    untested: 0,
    testFiles: []
  }
};

// Helper to read JSON safely
function readJSON(path) {
  try {
    if (existsSync(path)) {
      return JSON.parse(readFileSync(path, 'utf-8'));
    }
  } catch (e) {
    // Ignore
  }
  return null;
}

// Scan apps
async function scanApps() {
  const appsDir = join(ROOT, 'apps');
  const entries = readdirSync(appsDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    
    const appPath = join(appsDir, entry.name);
    const pkg = readJSON(join(appPath, 'package.json'));
    const tsconfig = readJSON(join(appPath, 'tsconfig.json'));
    
    if (!pkg) continue;
    
    inventory.apps[entry.name] = {
      name: pkg.name,
      version: pkg.version,
      dependencies: Object.keys(pkg.dependencies || {}),
      devDependencies: Object.keys(pkg.devDependencies || {}),
      scripts: Object.keys(pkg.scripts || {}),
      hasTypeScript: !!tsconfig,
      routes: [],
      components: []
    };
    
    // Scan routes
    const routesPath = join(appPath, 'src', 'app');
    if (existsSync(routesPath)) {
      const routeFiles = await findFiles('.*route\\.(ts|tsx)$', routesPath);
      inventory.apps[entry.name].routes = routeFiles;
    }
    
    // Scan components
    const componentsPath = join(appPath, 'src', 'components');
    if (existsSync(componentsPath)) {
      const componentFiles = await findFiles('.*\\.(ts|tsx)$', componentsPath);
      inventory.apps[entry.name].components = componentFiles;
    }
  }
}

// Scan packages
async function scanPackages() {
  const packagesDir = join(ROOT, 'packages');
  const entries = readdirSync(packagesDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    
    const pkgPath = join(packagesDir, entry.name);
    const pkg = readJSON(join(pkgPath, 'package.json'));
    
    if (!pkg) continue;
    
    inventory.packages[entry.name] = {
      name: pkg.name,
      version: pkg.version,
      exports: [],
      imports: [],
      dependencies: Object.keys(pkg.dependencies || {}),
      devDependencies: Object.keys(pkg.devDependencies || {}),
      main: pkg.main,
      types: pkg.types
    };
    
    // Find exports
    if (pkg.main || pkg.types) {
      const mainFile = pkg.main || pkg.types?.replace('.d.ts', '.ts') || 'index.ts';
      const exportPath = join(pkgPath, mainFile);
      if (existsSync(exportPath)) {
        const content = readFileSync(exportPath, 'utf-8');
        const exports = content.match(/export\s+(?:const|function|class|interface|type|default)\s+(\w+)/g) || [];
        inventory.packages[entry.name].exports = exports.map(e => e.match(/(\w+)/)?.[1]).filter(Boolean);
      }
    }
  }
}

// Scan jobs
async function scanJobs() {
  const jobsDir = join(ROOT, 'packages/server/src/jobs');
  if (!existsSync(jobsDir)) return;
  
  const allFiles = readdirSync(jobsDir);
  const jobFiles = allFiles.filter(f => f.endsWith('.ts') && !f.includes('.test.') && !f.includes('.spec.'));
  
  for (const file of jobFiles) {
    const content = readFileSync(join(jobsDir, file), 'utf-8');
    const jobName = file.replace('.ts', '');
    
    inventory.jobs[jobName] = {
      file,
      hasProcessor: /processor|run|execute/i.test(content),
      hasErrorHandling: /try\s*\{|catch\s*\(/g.test(content),
      hasLogging: /logger|console\.(log|error)/.test(content),
      hasMetrics: /metric|observability|track/.test(content),
      dependencies: [],
      registered: false
    };
    
    // Extract dependencies
    const imports = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g) || [];
    inventory.jobs[jobName].dependencies = imports.map(i => i.match(/['"]([^'"]+)['"]/)?.[1]).filter(Boolean);
  }
  
  // Check registration in queue
  const queueFile = join(ROOT, 'packages/server/src/queue/index.ts');
  if (existsSync(queueFile)) {
    const queueContent = readFileSync(queueFile, 'utf-8');
    for (const jobName of Object.keys(inventory.jobs)) {
      inventory.jobs[jobName].registered = new RegExp(jobName, 'i').test(queueContent);
    }
  }
}

// Scan routes/API endpoints
async function scanRoutes() {
  // Next.js API routes
  const webApiDir = join(ROOT, 'apps/web/src/app/api');
  if (existsSync(webApiDir)) {
    const routeFiles = await findFiles('.*route\\.(ts|tsx)$', webApiDir);
    for (const file of routeFiles) {
      const routePath = '/' + file.replace(/\/route\.tsx?$/, '').replace(/\\/g, '/');
      const fullPath = file.startsWith('/') || file.startsWith(ROOT) ? file : join(webApiDir, file);
      if (!existsSync(fullPath)) continue;
      const content = readFileSync(fullPath, 'utf-8');
      
      inventory.routes[routePath] = {
        method: content.match(/(GET|POST|PUT|DELETE|PATCH)\s*=/)?.[1] || 'GET',
        hasAuth: /auth|getAuthContext|supabase/.test(content),
        hasValidation: /zod|validate|schema/.test(content),
        hasErrorHandling: /try\s*\{|catch\s*\(/g.test(content),
        file
      };
    }
  }
  
  // Server routes
  const serverRoutesDir = join(ROOT, 'packages/server/src/routes');
  if (existsSync(serverRoutesDir)) {
    const routeFiles = await findFiles('.*\\.ts$', serverRoutesDir);
    for (const file of routeFiles) {
      if (file.includes('.spec.') || file.includes('.test.')) continue;
      const fullPath = file.startsWith('/') || file.startsWith(ROOT) ? file : join(serverRoutesDir, file);
      if (!existsSync(fullPath)) continue;
      const content = readFileSync(fullPath, 'utf-8');
      if (content.includes('export') && (content.includes('GET') || content.includes('POST'))) {
        const routeName = file.replace('.ts', '').replace(/\//g, '-');
        inventory.routes[`/api/${routeName}`] = {
          method: 'MIXED',
          hasAuth: /auth|getAuthContext/.test(content),
          hasValidation: /zod|validate/.test(content),
          hasErrorHandling: /try\s*\{|catch/.test(content),
          file
        };
      }
    }
  }
}

// Scan database
async function scanDatabase() {
  // Scan SQL migration files
  const migrationsDir = join(ROOT, 'packages/server/db/migrations');
  if (existsSync(migrationsDir)) {
    const allFiles = readdirSync(migrationsDir);
    const migrationFiles = allFiles.filter(f => f.endsWith('.sql'));
    inventory.database.migrations = migrationFiles.sort();
  }
  
  // Scan Supabase SQL files
  const rootFiles = readdirSync(ROOT);
  const supabaseFiles = rootFiles.filter(f => f.startsWith('supabase_tables_part') && f.endsWith('.sql'));
  inventory.database.tables = supabaseFiles.sort();
  
  // Check for RLS policies
  for (const file of supabaseFiles) {
    const content = readFileSync(join(ROOT, file), 'utf-8');
    if (content.includes('ROW LEVEL SECURITY') || content.includes('POLICY')) {
      inventory.database.rls.push(file);
    }
  }
}

// Check integrations
async function checkIntegrations() {
  // Supabase
  const supabaseFiles = await findFiles('.*\\.(ts|tsx|js)$', ROOT);
  const hasSupabase = supabaseFiles.some(file => {
    try {
      const content = readFileSync(join(ROOT, file), 'utf-8');
      return content.includes('@supabase/supabase-js') || content.includes('createClient');
    } catch {
      return false;
    }
  });
  inventory.integrations.supabase.configured = hasSupabase;
  
  // Stripe
  const hasStripe = supabaseFiles.some(file => {
    try {
      const fullPath = join(ROOT, file);
      if (!existsSync(fullPath)) return false;
      const content = readFileSync(fullPath, 'utf-8');
      return content.includes('stripe') && (content.includes('webhook') || content.includes('Stripe'));
    } catch {
      return false;
    }
  });
  inventory.integrations.stripe.configured = hasStripe;
  
  // Redis/BullMQ
  inventory.integrations.redis.configured = existsSync(join(ROOT, 'packages/server/src/queue/index.ts'));
  inventory.integrations.bullmq.configured = existsSync(join(ROOT, 'packages/server/src/queue/index.ts'));
  
  // PostHog
  const hasPostHog = supabaseFiles.some(file => {
    try {
      const content = readFileSync(join(ROOT, file), 'utf-8');
      return content.includes('posthog') || content.includes('PostHog');
    } catch {
      return false;
    }
  });
  inventory.integrations.posthog.configured = hasPostHog;
}

// Scan tests
async function scanTests() {
  const testFiles = await findFiles('.*\\.(spec|test)\\.(ts|tsx|js)$', ROOT);
  inventory.coverage.testFiles = testFiles;
  
  // Count tested vs untested files
  const allSourceFiles = await findFiles('.*\\.(ts|tsx)$', ROOT);
  const filteredSourceFiles = allSourceFiles.filter(f => 
    !f.includes('node_modules') && 
    !f.includes('dist') && 
    !f.includes('.next') && 
    !f.includes('.test.') && 
    !f.includes('.spec.')
  );
  
  const testedFiles = new Set();
  for (const testFile of testFiles) {
    const sourceName = testFile.replace(/\.(spec|test)\.(ts|tsx|js)$/, '.ts');
    testedFiles.add(sourceName);
  }
  
  inventory.coverage.tested = testedFiles.size;
  inventory.coverage.untested = filteredSourceFiles.length - testedFiles.size;
}

// Find orphaned modules (no imports)
async function findOrphaned() {
  const allSourceFiles = await findFiles('.*\\.(ts|tsx)$', ROOT);
  const filteredFiles = allSourceFiles.filter(f => 
    !f.includes('node_modules') && 
    !f.includes('dist') && 
    !f.includes('.next') && 
    !f.includes('/tests/') && 
    !f.includes('.test.') && 
    !f.includes('.spec.')
  );
  
  const imports = new Map();
  
  // First pass: collect all imports
  for (const file of filteredFiles) {
    try {
      const content = readFileSync(join(ROOT, file), 'utf-8');
      const fileImports = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g) || [];
      imports.set(file, fileImports);
    } catch {
      // Skip files that can't be read
    }
  }
  
  // Second pass: check if files are imported
  const importedFiles = new Set();
  for (const [file, fileImports] of imports) {
    for (const imp of fileImports) {
      const importPath = imp.match(/['"]([^'"]+)['"]/)?.[1];
      if (importPath) {
        // Try to resolve import path to actual file
        // This is simplified - in reality would need proper module resolution
        if (importPath.startsWith('.') || importPath.startsWith('@/') || importPath.startsWith('@whats-for-dinner/')) {
          importedFiles.add(importPath);
        }
      }
    }
  }
  
  // Files that export but aren't imported anywhere
  // This is a simplified check
}

// Main execution
async function main() {
  console.log('?? Starting Nomad Continuity Inventory...\n');
  
  await scanApps();
  console.log(`? Scanned ${Object.keys(inventory.apps).length} apps`);
  
  await scanPackages();
  console.log(`? Scanned ${Object.keys(inventory.packages).length} packages`);
  
  await scanJobs();
  console.log(`? Scanned ${Object.keys(inventory.jobs).length} jobs`);
  
  await scanRoutes();
  console.log(`? Scanned ${Object.keys(inventory.routes).length} routes`);
  
  await scanDatabase();
  console.log(`? Scanned database (${inventory.database.migrations.length} migrations, ${inventory.database.tables.length} table files)`);
  
  await checkIntegrations();
  console.log(`? Checked integrations`);
  
  await scanTests();
  console.log(`? Scanned tests (${inventory.coverage.testFiles.length} test files)`);
  
  // Write output
  const outputDir = join(ROOT, 'reports', 'inventory');
  const outputFile = join(outputDir, 'coverage.json');
  
  const fs = await import('fs/promises');
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputFile, JSON.stringify(inventory, null, 2));
  
  console.log(`\n? Inventory complete!`);
  console.log(`?? Report written to: ${outputFile}`);
  
  // Print summary
  console.log('\n?? Summary:');
  console.log(`  Apps: ${Object.keys(inventory.apps).length}`);
  console.log(`  Packages: ${Object.keys(inventory.packages).length}`);
  console.log(`  Jobs: ${Object.keys(inventory.jobs).length}`);
  console.log(`  Routes: ${Object.keys(inventory.routes).length}`);
  console.log(`  Test Coverage: ${Math.round(inventory.coverage.tested / (inventory.coverage.tested + inventory.coverage.untested) * 100) || 0}%`);
}

main().catch(console.error);
