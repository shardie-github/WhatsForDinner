#!/usr/bin/env tsx
/**
 * Migration Consolidation Script
 * 
 * Consolidates all migrations from multiple directories into a single canonical location:
 * apps/web/supabase/migrations
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { join, basename } from 'path';

interface MigrationFile {
  path: string;
  name: string;
  content: string;
  timestamp: number;
}

const PRIMARY_MIGRATION_DIR = join(process.cwd(), 'apps', 'web', 'supabase', 'migrations');
const ARCHIVE_DIR = join(process.cwd(), 'apps', 'web', 'supabase', 'migrations', '_archive');

// Migration directories to consolidate
const MIGRATION_DIRS = [
  {
    path: join(process.cwd(), 'whats-for-dinner', 'supabase', 'migrations'),
    priority: 1, // Lower priority - legacy
  },
  {
    path: join(process.cwd(), 'supabase', 'migrations'),
    priority: 2, // Medium priority
  },
  {
    path: join(process.cwd(), 'apps', 'web', 'supabase', 'migrations'),
    priority: 3, // Highest priority - current
  },
];

function extractTimestamp(filename: string): number {
  // Extract timestamp from filenames like: 20250109120000_name.sql or 2025-11-05_name.sql
  const dateMatch = filename.match(/^(\d{4})(\d{2})(\d{2})/);
  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    return new Date(`${year}-${month}-${day}`).getTime();
  }
  
  // Extract from sequential numbers like: 001_name.sql
  const seqMatch = filename.match(/^(\d+)_/);
  if (seqMatch) {
    return parseInt(seqMatch[1], 10) * 1000000; // Scale sequential numbers
  }
  
  // Master migrations go last
  if (filename.includes('master')) {
    return 99999999999999;
  }
  
  return 0;
}

function loadMigrations(dir: string): MigrationFile[] {
  if (!existsSync(dir)) {
    return [];
  }
  
  const files = readdirSync(dir)
    .filter(f => f.endsWith('.sql') && !f.startsWith('_'))
    .map(filename => {
      const path = join(dir, filename);
      const content = readFileSync(path, 'utf-8');
      return {
        path,
        name: filename,
        content,
        timestamp: extractTimestamp(filename),
      };
    });
  
  return files;
}

function isDuplicate(content1: string, content2: string): boolean {
  // Simple duplicate detection - compare normalized content
  const normalize = (s: string) => s
    .replace(/\s+/g, ' ')
    .replace(/--.*$/gm, '')
    .trim()
    .toLowerCase();
  
  return normalize(content1) === normalize(content2);
}

function consolidateMigrations(): void {
  console.log('🔄 Consolidating migrations...\n');
  
  // Load all migrations
  const allMigrations: MigrationFile[] = [];
  
  for (const dir of MIGRATION_DIRS) {
    if (existsSync(dir.path)) {
      const migrations = loadMigrations(dir.path);
      console.log(`📁 Found ${migrations.length} migrations in ${dir.path}`);
      allMigrations.push(...migrations.map(m => ({ ...m, priority: dir.priority })));
    }
  }
  
  console.log(`\n📊 Total migrations found: ${allMigrations.length}\n`);
  
  // Group by name (basename without path)
  const migrationsByName = new Map<string, MigrationFile[]>();
  
  for (const migration of allMigrations) {
    const baseName = basename(migration.name);
    if (!migrationsByName.has(baseName)) {
      migrationsByName.set(baseName, []);
    }
    migrationsByName.get(baseName)!.push(migration);
  }
  
  // Identify unique migrations (keep highest priority version)
  const uniqueMigrations: MigrationFile[] = [];
  const duplicates: Array<{ kept: string; removed: string[] }> = [];
  
  for (const [name, versions] of migrationsByName.entries()) {
    if (versions.length === 1) {
      uniqueMigrations.push(versions[0]);
    } else {
      // Sort by priority (higher = better), then by timestamp
      versions.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority; // Higher priority first
        }
        return b.timestamp - a.timestamp; // Newer first
      });
      
      const kept = versions[0];
      const removed = versions.slice(1).map(v => v.path);
      
      uniqueMigrations.push(kept);
      duplicates.push({ kept: kept.path, removed });
      
      console.log(`⚠️  Duplicate found: ${name}`);
      console.log(`   ✅ Keeping: ${kept.path}`);
      for (const r of removed) {
        console.log(`   ❌ Removing: ${r}`);
      }
    }
  }
  
  // Sort unique migrations by timestamp
  uniqueMigrations.sort((a, b) => {
    if (a.timestamp !== b.timestamp) {
      return a.timestamp - b.timestamp;
    }
    return a.name.localeCompare(b.name);
  });
  
  console.log(`\n✅ Unique migrations: ${uniqueMigrations.length}\n`);
  
  // Create archive directory
  if (!existsSync(ARCHIVE_DIR)) {
    mkdirSync(ARCHIVE_DIR, { recursive: true });
  }
  
  // Write consolidated migrations
  console.log('📝 Writing consolidated migrations...\n');
  
  let sequence = 1;
  for (const migration of uniqueMigrations) {
    // Skip if already in primary directory
    const targetPath = join(PRIMARY_MIGRATION_DIR, migration.name);
    
    if (existsSync(targetPath) && migration.path === targetPath) {
      console.log(`   ✓ ${migration.name} (already in place)`);
      continue;
    }
    
    // Rename with sequential number if needed
    let finalName = migration.name;
    if (!finalName.match(/^\d{13,}_/) && !finalName.match(/^\d{4}-\d{2}-\d{2}_/)) {
      // Extract name part
      const namePart = finalName.replace(/^\d+_/, '').replace(/\.sql$/, '');
      finalName = `${String(sequence).padStart(3, '0')}_${namePart}.sql`;
    }
    
    const finalPath = join(PRIMARY_MIGRATION_DIR, finalName);
    
    // Archive original if different location
    if (migration.path !== finalPath) {
      const archivePath = join(ARCHIVE_DIR, basename(migration.path));
      writeFileSync(archivePath, migration.content);
      console.log(`   📦 Archived: ${basename(migration.path)}`);
    }
    
    // Write to primary location
    writeFileSync(finalPath, migration.content);
    console.log(`   ✅ ${finalName}`);
    
    sequence++;
  }
  
  // Create consolidation report
  const report = {
    consolidatedAt: new Date().toISOString(),
    totalMigrationsFound: allMigrations.length,
    uniqueMigrations: uniqueMigrations.length,
    duplicatesRemoved: duplicates.length,
    primaryLocation: PRIMARY_MIGRATION_DIR,
    archiveLocation: ARCHIVE_DIR,
  };
  
  writeFileSync(
    join(PRIMARY_MIGRATION_DIR, '_consolidation_report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log(`\n✅ Consolidation complete!`);
  console.log(`   Primary location: ${PRIMARY_MIGRATION_DIR}`);
  console.log(`   Archive location: ${ARCHIVE_DIR}`);
  console.log(`   Report: ${join(PRIMARY_MIGRATION_DIR, '_consolidation_report.json')}\n`);
}

if (require.main === module) {
  consolidateMigrations();
}

export { consolidateMigrations };
