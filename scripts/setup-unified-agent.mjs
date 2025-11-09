#!/usr/bin/env node
/**
 * Setup script for Unified Hardonia Agent
 * Initializes configuration and verifies prerequisites
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🚀 Setting up Unified Hardonia Agent...\n');

// Verify package.json exists
const packageJsonPath = join(projectRoot, 'package.json');
if (!existsSync(packageJsonPath)) {
  console.error('❌ package.json not found. Are you in the project root?');
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

// Verify required dependencies
const requiredDeps = ['@supabase/supabase-js', 'tsx'];
const missingDeps = requiredDeps.filter(dep => 
  !pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]
);

if (missingDeps.length > 0) {
  console.warn(`⚠️  Missing dependencies: ${missingDeps.join(', ')}`);
  console.log('   Install with: pnpm add -D ' + missingDeps.join(' '));
}

// Verify config exists
const configPath = join(projectRoot, '.cursor', 'config', 'master-agent.json');
if (!existsSync(configPath)) {
  console.log('📝 Creating master agent configuration...');
  mkdirSync(dirname(configPath), { recursive: true });
  
  const defaultConfig = {
    agentMode: "hardonia-global",
    autoRun: true,
    repoType: pkg.workspaces ? "monorepo" : "single",
    detectedStack: {},
    agents: {
      reliability: { enabled: true, schedule: "0 */6 * * *" },
      cost: { enabled: true, schedule: "0 0 * * *" },
      security: { enabled: true, schedule: "0 */12 * * *" },
      documentation: { enabled: true, schedule: "0 2 * * *" },
      planning: { enabled: true, schedule: "0 3 * * *" },
      observability: { enabled: true, schedule: "*/15 * * * *" },
      reflection: { enabled: true, schedule: "0 4 * * *" }
    },
    artifacts: {
      reliability: { json: "/admin/reliability.json", md: "/admin/reliability.md" },
      compliance: { json: "/admin/compliance.json", md: "/admin/compliance.md" },
      sbom: "/security/sbom.json",
      metrics: "/admin/metrics.jsx",
      intentLog: "/docs/intent-log.md",
      roadmap: "/roadmap/current-sprint.md",
      nextSteps: "/auto/next-steps.md",
      discoveries: "/.cursor/agent-discoveries.md"
    },
    safety: {
      neverExposeSecrets: true,
      requireCI: true,
      preferPR: true,
      retainSnapshots: 3
    }
  };
  
  writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  console.log('   ✅ Configuration created\n');
} else {
  console.log('✅ Configuration already exists\n');
}

// Verify artifact directories
const artifactDirs = [
  'admin',
  'security',
  'docs',
  'roadmap',
  'auto',
  '.cursor'
];

console.log('📁 Verifying artifact directories...');
for (const dir of artifactDirs) {
  const dirPath = join(projectRoot, dir);
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    console.log(`   ✅ Created ${dir}/`);
  } else {
    console.log(`   ✅ ${dir}/ exists`);
  }
}

// Verify GitHub Actions workflow
const workflowPath = join(projectRoot, '.github', 'workflows', 'unified-agent.yml');
if (!existsSync(workflowPath)) {
  console.log('\n⚠️  GitHub Actions workflow not found.');
  console.log('   The workflow file should be at: .github/workflows/unified-agent.yml');
  console.log('   Create it manually or it will be created on first agent run.');
}

// Check environment variables
console.log('\n🔐 Environment Variables:');
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const optionalEnvVars = [
  'VERCEL_TOKEN',
  'EXPO_TOKEN',
  'OPENAI_API_KEY',
  'GITHUB_TOKEN'
];

let allPresent = true;
for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar}`);
  } else {
    console.log(`   ❌ ${envVar} (required)`);
    allPresent = false;
  }
}

for (const envVar of optionalEnvVars) {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar}`);
  } else {
    console.log(`   ⚠️  ${envVar} (optional)`);
  }
}

console.log('\n✅ Setup complete!\n');
console.log('Next steps:');
console.log('1. Set required environment variables');
console.log('2. Run: pnpm run agent:run');
console.log('3. Check artifacts in admin/, security/, docs/, roadmap/, auto/');

if (!allPresent) {
  console.log('\n⚠️  Some required environment variables are missing.');
  console.log('   Set them before running the agent.');
  process.exit(1);
}
