#!/usr/bin/env node
/**
 * Secrets Export Tool
 * 
 * Exports secrets configuration for backup or documentation
 * (Does NOT export actual secret values - only metadata)
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const CRITICAL_SECRETS = {
  'NEXT_PUBLIC_SUPABASE_URL': { requiredIn: ['vercel', 'github'], description: 'Supabase project URL' },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': { requiredIn: ['vercel', 'github'], description: 'Supabase anonymous key' },
  'SUPABASE_SERVICE_ROLE_KEY': { requiredIn: ['vercel', 'github'], description: 'Supabase service role key' },
  'SUPABASE_JWT_SECRET': { requiredIn: ['vercel'], description: 'JWT secret for token verification' },
  'SUPABASE_DB_URL': { requiredIn: ['vercel'], description: 'PostgreSQL connection string', optional: true },
  'DATABASE_URL': { requiredIn: ['vercel'], description: 'PostgreSQL connection string (alias)', optional: true },
  'VERCEL_TOKEN': { requiredIn: ['github'], description: 'Vercel API token' },
  'VERCEL_ORG_ID': { requiredIn: ['github'], description: 'Vercel organization ID' },
  'VERCEL_PROJECT_ID': { requiredIn: ['github'], description: 'Vercel project ID' },
  'SUPABASE_ACCESS_TOKEN': { requiredIn: ['github'], description: 'Supabase access token for CLI' },
  'SUPABASE_PROJECT_REF': { requiredIn: ['github'], description: 'Supabase project reference ID' },
};

function checkLocalEnv(varName) {
  return !!process.env[varName];
}

function checkCodeUsage(varName) {
  try {
    const result = execSync(
      `grep -r "process.env.${varName}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.mjs" . 2>/dev/null | grep -v node_modules | wc -l`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    return parseInt(result.trim()) > 0;
  } catch {
    return false;
  }
}

function checkWorkflowUsage(varName) {
  try {
    const result = execSync(
      `grep -r "secrets.${varName}" --include="*.yml" --include="*.yaml" .github/workflows/ 2>/dev/null | wc -l`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    return parseInt(result.trim()) > 0;
  } catch {
    return false;
  }
}

async function exportSecrets(format = 'json') {
  log('\n📤 Exporting Secrets Configuration...', 'cyan');
  log('='.repeat(60), 'cyan');

  const exportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalSecrets: Object.keys(CRITICAL_SECRETS).length,
      configured: 0,
      missing: 0,
    },
    secrets: {},
    platforms: {
      vercel: { required: 0, configured: 0 },
      github: { required: 0, configured: 0 },
      supabase: { required: 0, configured: 0 },
    },
    notes: [
      '⚠️  This export contains METADATA only - no actual secret values',
      '⚠️  Use this for documentation and backup purposes only',
      '⚠️  Never commit actual secret values to version control',
    ],
  };

  // Analyze each secret
  for (const [name, config] of Object.entries(CRITICAL_SECRETS)) {
    const configured = checkLocalEnv(name);
    const usedInCode = checkCodeUsage(name);
    const usedInWorkflows = checkWorkflowUsage(name);

    if (configured) exportData.summary.configured++;
    else exportData.summary.missing++;

    exportData.secrets[name] = {
      description: config.description,
      requiredIn: config.requiredIn,
      optional: config.optional || false,
      status: {
        configured: configured,
        usedInCode: usedInCode,
        usedInWorkflows: usedInWorkflows,
      },
    };

    // Count platform requirements
    if (config.requiredIn.includes('vercel')) {
      exportData.platforms.vercel.required++;
      if (configured) exportData.platforms.vercel.configured++;
    }
    if (config.requiredIn.includes('github')) {
      exportData.platforms.github.required++;
      if (configured) exportData.platforms.github.configured++;
    }
    if (config.requiredIn.includes('supabase')) {
      exportData.platforms.supabase.required++;
      if (configured) exportData.platforms.supabase.configured++;
    }
  }

  // Export based on format
  let output;
  let filename;

  if (format === 'json') {
    output = JSON.stringify(exportData, null, 2);
    filename = 'secrets-config-export.json';
    writeFileSync(filename, output);
  } else if (format === 'markdown') {
    filename = 'secrets-config-export.md';
    output = generateMarkdown(exportData);
    writeFileSync(filename, output);
  } else {
    throw new Error(`Unsupported format: ${format}`);
  }

  log(`\n✅ Export complete!`, 'green');
  log(`   File: ${filename}`, 'cyan');
  log(`   Format: ${format}`, 'cyan');
  log(`   Secrets analyzed: ${exportData.summary.totalSecrets}`, 'cyan');
  log(`   Configured: ${exportData.summary.configured}`, 'green');
  log(`   Missing: ${exportData.summary.missing}`, exportData.summary.missing > 0 ? 'red' : 'green');

  return filename;
}

function generateMarkdown(data) {
  let md = `# Secrets Configuration Export\n\n`;
  md += `**Generated:** ${data.timestamp}\n\n`;
  md += `## Summary\n\n`;
  md += `- Total Secrets: ${data.summary.totalSecrets}\n`;
  md += `- Configured: ${data.summary.configured}\n`;
  md += `- Missing: ${data.summary.missing}\n\n`;
  md += `## Platform Requirements\n\n`;
  md += `| Platform | Required | Configured |\n`;
  md += `|----------|----------|------------|\n`;
  md += `| Vercel | ${data.platforms.vercel.required} | ${data.platforms.vercel.configured} |\n`;
  md += `| GitHub | ${data.platforms.github.required} | ${data.platforms.github.configured} |\n`;
  md += `| Supabase | ${data.platforms.supabase.required} | ${data.platforms.supabase.configured} |\n\n`;
  md += `## Secrets Details\n\n`;

  for (const [name, config] of Object.entries(data.secrets)) {
    md += `### ${name}\n\n`;
    md += `- **Description:** ${config.description}\n`;
    md += `- **Required In:** ${config.requiredIn.join(', ')}\n`;
    md += `- **Optional:** ${config.optional ? 'Yes' : 'No'}\n`;
    md += `- **Status:**\n`;
    md += `  - Configured: ${config.status.configured ? '✅' : '❌'}\n`;
    md += `  - Used in Code: ${config.status.usedInCode ? '✅' : '❌'}\n`;
    md += `  - Used in Workflows: ${config.status.usedInWorkflows ? '✅' : '❌'}\n\n`;
  }

  md += `## Notes\n\n`;
  for (const note of data.notes) {
    md += `${note}\n\n`;
  }

  return md;
}

// Main
const format = process.argv[2] || 'json';
exportSecrets(format).catch((error) => {
  log(`\n❌ Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
