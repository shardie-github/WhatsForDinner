/**
 * Supabase Guard - RLS enforcement scanner
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { secretsManager } from './secrets-manager-unified.mjs';

export async function runSbGuard(options: { fix?: boolean; auditOnly?: boolean }) {
  
  const reportsDir = path.join(process.cwd(), 'ops', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const auditReport = path.join(reportsDir, 'rls-audit.md');
  
  // Check Supabase connection
  const supabaseUrl = (await secretsManager.getSecret('NEXT_PUBLIC_SUPABASE_URL')) || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = (await secretsManager.getSecret('SUPABASE_SERVICE_ROLE_KEY')) || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials not configured');
    process.exit(1);
  }

  // Run RLS smoke test
  try {
        execSync('pnpm rls:test', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ RLS smoke test failed');
    process.exit(1);
  }

  // Scan SQL files for RLS policies
    const sqlFiles = [
    ...globFiles('**/*.sql', ['supabase', 'apps/web/supabase']),
    ...globFiles('**/*supabase*.sql', []),
  ];

  // Privacy tables that MUST have RLS
  const privacyTables = [
    'privacy_prefs',
    'app_allowlist',
    'signal_toggles',
    'telemetry_events',
    'privacy_transparency_log',
    'mfa_enforced_sessions',
  ];

  const findings: Array<{ file: string; issue: string; severity: 'high' | 'medium' | 'low' }> = [];
  const tables: string[] = [];
  const views: string[] = [];

  for (const sqlFile of sqlFiles) {
    const content = fs.readFileSync(sqlFile, 'utf-8');
    
    // Find tables
    const tableMatches = content.match(/CREATE TABLE\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi);
    if (tableMatches) {
      tableMatches.forEach((match) => {
        const tableName = match.replace(/CREATE TABLE\s+/i, '').trim();
        if (!tables.includes(tableName)) {
          tables.push(tableName);
        }
      });
    }

    // Find views
    const viewMatches = content.match(/CREATE VIEW\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi);
    if (viewMatches) {
      viewMatches.forEach((match) => {
        const viewName = match.replace(/CREATE VIEW\s+/i, '').trim();
        if (!views.includes(viewName)) {
          views.push(viewName);
        }
      });
    }

    // Check for RLS policies
    const hasRLS = content.includes('ALTER TABLE') && content.includes('ENABLE ROW LEVEL SECURITY');
    const hasPolicy = content.match(/CREATE POLICY/i);

    if (!hasRLS && !hasPolicy && tableMatches) {
      findings.push({
        file: sqlFile,
        issue: 'Table missing RLS',
        severity: 'high',
      });
    }

    // Check privacy tables specifically
    for (const privacyTable of privacyTables) {
      if (content.includes(`CREATE TABLE`) && content.includes(privacyTable)) {
        if (!content.includes(`ALTER TABLE ${privacyTable} ENABLE ROW LEVEL SECURITY`)) {
          findings.push({
            file: sqlFile,
            issue: `Privacy table ${privacyTable} missing RLS (CRITICAL)`,
            severity: 'high',
          });
        }
      }
    }

    // Check for SECURITY DEFINER functions
    const funcMatches = content.match(/CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi);
    if (funcMatches) {
      funcMatches.forEach((match) => {
        const funcName = match.replace(/CREATE\s+(OR\s+REPLACE\s+)?FUNCTION\s+/i, '').trim();
        if (!content.includes(`SECURITY DEFINER`) && !content.includes(`SECURITY INVOKER`)) {
          findings.push({
            file: sqlFile,
            issue: `Function ${funcName} missing SECURITY DEFINER/INVOKER`,
            severity: 'medium',
          });
        }
      });
    }
  }

  // Generate audit report
  const report = `# RLS Audit Report

Generated: ${new Date().toISOString()}

## Summary

- Tables found: ${tables.length}
- Views found: ${views.length}
- Issues found: ${findings.length}

## Tables

${tables.map((t) => `- ${t}`).join('\n')}

## Views

${views.map((v) => `- ${v}`).join('\n')}

## Issues

${findings.length === 0 
  ? '✅ No issues found!'
  : findings.map((f) => `### ${f.severity.toUpperCase()}: ${f.issue}\n\n   File: ${f.file}\n`).join('\n')
}

## Recommended Policies

${tables.map((table) => `
### ${table}

\`\`\`sql
-- Enable RLS
ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "${table}_user_select"
  ON ${table}
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only insert their own data
CREATE POLICY "${table}_user_insert"
  ON ${table}
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own data
CREATE POLICY "${table}_user_update"
  ON ${table}
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can only delete their own data
CREATE POLICY "${table}_user_delete"
  ON ${table}
  FOR DELETE
  USING (auth.uid() = user_id);
\`\`\`
`).join('\n')}
`;

  fs.writeFileSync(auditReport, report);

        
  // Check privacy compliance
    try {
    execSync('pnpm privacy:compliance', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Privacy compliance checks failed');
    findings.push({
      file: 'privacy-compliance',
      issue: 'Privacy compliance checks failed',
      severity: 'high',
    });
  }

  if (findings.length > 0) {
        if (options.fix) {
                }
    process.exit(1);
  } else {
        process.exit(0);
  }
}

function globFiles(pattern: string, dirs: string[]): string[] {
  const files: string[] = [];
  const searchDirs = dirs.length > 0 ? dirs : [process.cwd()];
  
  function searchDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        searchDir(fullPath);
      } else if (entry.isFile()) {
        const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
        if (regex.test(entry.name) || regex.test(fullPath)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  searchDirs.forEach(searchDir);
  return files;
}
