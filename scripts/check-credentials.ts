#!/usr/bin/env tsx
/**
 * Credentials Audit Script
 * 
 * Checks for missing or outdated credentials that should be configured in:
 * - GitHub Secrets
 * - Vercel Environment Variables
 * - Supabase Secrets
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';

interface Credential {
  name: string;
  description: string;
  required: boolean;
  platforms: {
    github: boolean;
    vercel: boolean;
    supabase: boolean;
  };
  foundInCode: boolean;
  foundInWorkflows: boolean;
  category: string;
}

const credentials: Credential[] = [];

// Read .env.example to get all defined variables
function parseEnvExample(filePath: string): string[] {
  if (!existsSync(filePath)) return [];
  
  const content = readFileSync(filePath, 'utf-8');
  const vars: string[] = [];
  
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    // Match env var definitions: VAR_NAME=value or VAR_NAME=
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=/);
    if (match && !trimmed.startsWith('#')) {
      vars.push(match[1]);
    }
  }
  
  return vars;
}

// Recursive file search
function findFiles(dir: string, extensions: string[], ignoreDirs: string[] = []): string[] {
  const files: string[] = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      if (ignoreDirs.some(ig => fullPath.includes(ig))) continue;
      
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          files.push(...findFiles(fullPath, extensions, ignoreDirs));
        } else if (extensions.some(ext => entry.endsWith(ext))) {
          files.push(fullPath);
        }
      } catch {
        // Skip unreadable files/dirs
      }
    }
  } catch {
    // Skip unreadable dirs
  }
  return files;
}

// Check if variable is used in code
function checkCodeUsage(varName: string): boolean {
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];
  const ignoreDirs = ['node_modules', '.next', 'dist', 'build', '.git'];
  const files = findFiles(process.cwd(), extensions, ignoreDirs);
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      const secretPattern = `secrets.${varName}`;
      const envPattern = `env.${varName}`;
      if (content.includes(`process.env.${varName}`) || 
          content.includes(`env.${varName}`) ||
          content.includes(secretPattern) ||
          content.includes(envPattern)) {
        return true;
      }
    } catch {
      // Skip unreadable files
    }
  }
  
  return false;
}

// Check if variable is used in GitHub workflows
function checkWorkflowUsage(varName: string): boolean {
  const workflowDir = join(process.cwd(), '.github', 'workflows');
  if (!existsSync(workflowDir)) return false;
  
  const files = findFiles(workflowDir, ['.yml', '.yaml'], []);
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      if (content.includes(`secrets.${varName}`) || 
          content.includes(`env.${varName}`)) {
        return true;
      }
    } catch {
      // Skip unreadable files
    }
  }
  
  return false;
}

// Categorize credentials
function categorizeCredential(name: string): string {
  if (name.includes('SUPABASE')) return 'Supabase';
  if (name.includes('STRIPE')) return 'Payments';
  if (name.includes('OPENAI')) return 'AI/ML';
  if (name.includes('SENDGRID') || name.includes('RESEND') || name.includes('EMAIL')) return 'Email';
  if (name.includes('POSTHOG') || name.includes('GA_') || name.includes('ANALYTICS')) return 'Analytics';
  if (name.includes('SENTRY')) return 'Error Tracking';
  if (name.includes('REDIS')) return 'Caching/Queue';
  if (name.includes('VERCEL')) return 'Deployment';
  if (name.includes('GITHUB')) return 'CI/CD';
  if (name.includes('WEBHOOK') || name.includes('HMAC') || name.includes('SECRET')) return 'Security';
  if (name.includes('CLOUDINARY') || name.includes('UPLOAD')) return 'Storage';
  if (name.includes('OTEL') || name.includes('PROMETHEUS') || name.includes('GRAFANA')) return 'Observability';
  if (name.includes('DSAR') || name.includes('PRIVACY') || name.includes('ARTIFACTS')) return 'Compliance';
  if (name.includes('PUSHER') || name.includes('ABLY')) return 'Realtime';
  if (name.includes('ALGOLIA') || name.includes('MEILI')) return 'Search';
  if (name.includes('SLACK') || name.includes('DISCORD')) return 'Notifications';
  return 'Other';
}

// Determine which platforms need this credential
function determinePlatforms(name: string, foundInWorkflows: boolean): { github: boolean; vercel: boolean; supabase: boolean } {
  const platforms = {
    github: false,
    vercel: false,
    supabase: false,
  };
  
  // GitHub secrets needed for CI/CD
  if (foundInWorkflows || name.includes('GITHUB') || name.includes('VERCEL_TOKEN') || name.includes('SUPABASE_ACCESS_TOKEN')) {
    platforms.github = true;
  }
  
  // Vercel env vars - all runtime variables
  if (!name.includes('GITHUB_') && !name.includes('SUPABASE_ACCESS_TOKEN') && !name.includes('SUPABASE_DB_PASSWORD')) {
    platforms.vercel = true;
  }
  
  // Supabase secrets - only specific ones
  if (name.includes('SUPABASE_DB_URL') || name.includes('SUPABASE_JWT_SECRET')) {
    platforms.supabase = true;
  }
  
  return platforms;
}

// Determine if required
function isRequired(name: string): boolean {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];
  
  return required.includes(name) || 
         (name.includes('NEXT_PUBLIC_') && !name.includes('OPTIONAL')) ||
         name === 'DATABASE_URL' ||
         name === 'NODE_ENV';
}

async function main() {
  console.log('🔍 Analyzing credentials...\n');
  
  // Get all env vars from example files
  const envFiles = [
    '.env.example',
    '.env.ci.example',
    'nomad/.env.example',
    'ops/env/.env.example',
  ];
  
  const allVars = new Set<string>();
  
  for (const file of envFiles) {
    if (existsSync(file)) {
      const vars = parseEnvExample(file);
      vars.forEach(v => allVars.add(v));
    }
  }
  
  console.log(`Found ${allVars.size} environment variables in .env.example files\n`);
  
  // Analyze each credential
  for (const varName of Array.from(allVars).sort()) {
    const foundInCode = checkCodeUsage(varName);
    const foundInWorkflows = checkWorkflowUsage(varName);
    const required = isRequired(varName);
    const category = categorizeCredential(varName);
    const platforms = determinePlatforms(varName, foundInWorkflows);
    
    // Get description from .env.example
    let description = '';
    try {
      const envContent = readFileSync('.env.example', 'utf-8');
      const lines = envContent.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(varName)) {
          // Look for comment above
          if (i > 0 && lines[i - 1].trim().startsWith('#')) {
            description = lines[i - 1].trim().replace(/^#+\s*/, '');
          }
          break;
        }
      }
    } catch {
      // Skip if can't read
    }
    
    credentials.push({
      name: varName,
      description: description || `${category} configuration`,
      required,
      platforms,
      foundInCode,
      foundInWorkflows,
      category,
    });
  }
  
  // Generate report
  console.log('📋 CREDENTIALS AUDIT REPORT\n');
  console.log('='.repeat(80));
  
  // Summary
  const required = credentials.filter(c => c.required);
  const missingRequired = required.filter(c => !c.foundInCode && !c.foundInWorkflows);
  const githubNeeded = credentials.filter(c => c.platforms.github);
  const vercelNeeded = credentials.filter(c => c.platforms.vercel);
  const supabaseNeeded = credentials.filter(c => c.platforms.supabase);
  
  console.log('\n📊 SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total credentials: ${credentials.length}`);
  console.log(`Required: ${required.length}`);
  console.log(`Used in code: ${credentials.filter(c => c.foundInCode).length}`);
  console.log(`Used in workflows: ${credentials.filter(c => c.foundInWorkflows).length}`);
  console.log(`\nNeed GitHub Secrets: ${githubNeeded.length}`);
  console.log(`Need Vercel Env Vars: ${vercelNeeded.length}`);
  console.log(`Need Supabase Secrets: ${supabaseNeeded.length}`);
  
  // Missing Required
  if (missingRequired.length > 0) {
    console.log('\n⚠️  MISSING REQUIRED CREDENTIALS');
    console.log('-'.repeat(80));
    missingRequired.forEach(c => {
      console.log(`\n❌ ${c.name}`);
      console.log(`   Category: ${c.category}`);
      console.log(`   Description: ${c.description}`);
      console.log(`   Platforms needed:`);
      if (c.platforms.github) console.log(`     - GitHub Secrets`);
      if (c.platforms.vercel) console.log(`     - Vercel Environment Variables`);
      if (c.platforms.supabase) console.log(`     - Supabase Secrets`);
    });
  }
  
  // GitHub Secrets needed
  console.log('\n\n🔐 GITHUB SECRETS NEEDED');
  console.log('-'.repeat(80));
  githubNeeded.forEach(c => {
    const status = c.foundInWorkflows ? '✅' : '⚠️ ';
    console.log(`${status} ${c.name}`);
    if (c.description) console.log(`   ${c.description}`);
  });
  
  // Vercel Env Vars needed
  console.log('\n\n🌐 VERCEL ENVIRONMENT VARIABLES NEEDED');
  console.log('-'.repeat(80));
  vercelNeeded.forEach(c => {
    const status = c.foundInCode ? '✅' : '⚠️ ';
    console.log(`${status} ${c.name}`);
    if (c.description) console.log(`   ${c.description}`);
  });
  
  // Supabase Secrets needed
  if (supabaseNeeded.length > 0) {
    console.log('\n\n🗄️  SUPABASE SECRETS NEEDED');
    console.log('-'.repeat(80));
    supabaseNeeded.forEach(c => {
      console.log(`✅ ${c.name}`);
      if (c.description) console.log(`   ${c.description}`);
    });
  }
  
  // Grouped by category
  console.log('\n\n📁 CREDENTIALS BY CATEGORY');
  console.log('='.repeat(80));
  
  const categories = Array.from(new Set(credentials.map(c => c.category))).sort();
  
  for (const category of categories) {
    const categoryCreds = credentials.filter(c => c.category === category);
    console.log(`\n### ${category} (${categoryCreds.length})`);
    console.log('-'.repeat(80));
    
    for (const cred of categoryCreds) {
      const platforms = [];
      if (cred.platforms.github) platforms.push('GitHub');
      if (cred.platforms.vercel) platforms.push('Vercel');
      if (cred.platforms.supabase) platforms.push('Supabase');
      
      const req = cred.required ? ' [REQUIRED]' : '';
      const status = cred.foundInCode || cred.foundInWorkflows ? '✅' : '❌';
      
      console.log(`${status} ${cred.name}${req}`);
      console.log(`   Platforms: ${platforms.join(', ') || 'None'}`);
      if (cred.description) console.log(`   ${cred.description}`);
    }
  }
  
  // Generate markdown file
  const markdown = `# Credentials Audit Report

Generated: ${new Date().toISOString()}

## Summary

- **Total Credentials**: ${credentials.length}
- **Required**: ${required.length}
- **Missing Required**: ${missingRequired.length}
- **GitHub Secrets Needed**: ${githubNeeded.length}
- **Vercel Env Vars Needed**: ${vercelNeeded.length}
- **Supabase Secrets Needed**: ${supabaseNeeded.length}

## Missing Required Credentials

${missingRequired.length > 0 ? missingRequired.map(c => `### ❌ ${c.name}
- **Category**: ${c.category}
- **Description**: ${c.description}
- **Platforms Needed**:
${c.platforms.github ? '  - GitHub Secrets\n' : ''}${c.platforms.vercel ? '  - Vercel Environment Variables\n' : ''}${c.platforms.supabase ? '  - Supabase Secrets\n' : ''}`).join('\n') : 'None ✅'}

## GitHub Secrets

${githubNeeded.map(c => `### ${c.foundInWorkflows ? '✅' : '⚠️'} ${c.name}
${c.description ? `- **Description**: ${c.description}\n` : ''}- **Required**: ${c.required ? 'Yes' : 'No'}
- **Used in Workflows**: ${c.foundInWorkflows ? 'Yes' : 'No'}`).join('\n\n')}

## Vercel Environment Variables

${vercelNeeded.map(c => `### ${c.foundInCode ? '✅' : '⚠️'} ${c.name}
${c.description ? `- **Description**: ${c.description}\n` : ''}- **Required**: ${c.required ? 'Yes' : 'No'}
- **Used in Code**: ${c.foundInCode ? 'Yes' : 'No'}`).join('\n\n')}

${supabaseNeeded.length > 0 ? `## Supabase Secrets

${supabaseNeeded.map(c => `### ${c.name}
${c.description ? `- **Description**: ${c.description}\n` : ''}- **Required**: ${c.required ? 'Yes' : 'No'}`).join('\n\n')}` : ''}

## All Credentials by Category

${categories.map(cat => {
  const creds = credentials.filter(c => c.category === cat);
  return `### ${cat}

${creds.map(c => {
  const platforms = [];
  if (c.platforms.github) platforms.push('GitHub');
  if (c.platforms.vercel) platforms.push('Vercel');
  if (c.platforms.supabase) platforms.push('Supabase');
  
  return `- **${c.name}**${c.required ? ' [REQUIRED]' : ''} - ${c.description || 'No description'}
  - Platforms: ${platforms.join(', ') || 'None'}
  - Found in code: ${c.foundInCode ? 'Yes' : 'No'}
  - Found in workflows: ${c.foundInWorkflows ? 'Yes' : 'No'}`;
}).join('\n\n')}`;
}).join('\n\n')}
`;
  
  require('fs').writeFileSync('CREDENTIALS_AUDIT.md', markdown);
  console.log('\n\n✅ Report saved to CREDENTIALS_AUDIT.md');
  
  if (missingRequired.length > 0) {
    console.log(`\n⚠️  Warning: ${missingRequired.length} required credentials are missing!`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});