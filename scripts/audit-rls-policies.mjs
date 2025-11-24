#!/usr/bin/env node
/**
 * Audit RLS Policies
 * Checks all tables for RLS policy coverage
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const migrationsDir = 'supabase/migrations';
const tables = new Set();
const policies = new Map();

// Scan migrations for tables and policies
const migrations = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

for (const migration of migrations) {
  const content = readFileSync(join(migrationsDir, migration), 'utf-8');
  
  // Find CREATE TABLE statements
  const tableMatches = content.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/gi);
  for (const match of tableMatches) {
    tables.add(match[1]);
  }
  
  // Find CREATE POLICY statements
  const policyMatches = content.matchAll(/CREATE\s+POLICY\s+(\w+)\s+ON\s+(?:public\.)?(\w+)/gi);
  for (const match of policyMatches) {
    const tableName = match[2];
    if (!policies.has(tableName)) {
      policies.set(tableName, []);
    }
    policies.get(tableName).push(match[1]);
  }
}

// Generate report
const report = {
  totalTables: tables.size,
  tablesWithPolicies: policies.size,
  tablesWithoutPolicies: [],
  coverage: ((policies.size / tables.size) * 100).toFixed(1) + '%',
};

for (const table of tables) {
  if (!policies.has(table)) {
    report.tablesWithoutPolicies.push(table);
  }
}

console.log('📊 RLS Policy Audit Report');
console.log('='.repeat(50));
console.log(`Total Tables: ${report.totalTables}`);
console.log(`Tables with Policies: ${report.tablesWithPolicies}`);
console.log(`Coverage: ${report.coverage}`);
console.log(`\nTables without RLS policies (${report.tablesWithoutPolicies.length}):`);
for (const table of report.tablesWithoutPolicies) {
  console.log(`  - ${table}`);
}

// Write report
import { writeFileSync } from 'fs';
writeFileSync('reports/rls-audit.json', JSON.stringify(report, null, 2));
console.log('\n✅ Report saved to reports/rls-audit.json');
