#!/usr/bin/env node
/**
 * Consolidates all migrations from multiple directories to supabase/migrations/
 * Checks for duplicates and ensures proper ordering
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROOT = path.resolve(__dirname, '..');

const TARGET_DIR = path.join(WORKSPACE_ROOT, 'supabase/migrations');
const SOURCE_DIRS = [
  path.join(WORKSPACE_ROOT, 'whats-for-dinner/supabase/migrations'),
  path.join(WORKSPACE_ROOT, 'apps/web/supabase/migrations'),
  path.join(WORKSPACE_ROOT, 'packages/server/db/migrations'),
];

// Get file hash for duplicate detection
function getFileHash(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Read all migrations from source directories
function collectMigrations() {
  const migrations = new Map(); // hash -> { path, name }
  
  for (const sourceDir of SOURCE_DIRS) {
    if (!fs.existsSync(sourceDir)) {
      console.log(`⚠️  Directory not found: ${sourceDir}`);
      continue;
    }
    
    const files = fs.readdirSync(sourceDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    for (const file of files) {
      const filePath = path.join(sourceDir, file);
      const hash = getFileHash(filePath);
      
      if (!migrations.has(hash)) {
        migrations.set(hash, {
          path: filePath,
          name: file,
          sourceDir,
        });
      } else {
        console.log(`📋 Duplicate found (skipping): ${filePath}`);
        console.log(`   Matches: ${migrations.get(hash).path}`);
      }
    }
  }
  
  return Array.from(migrations.values());
}

// Get next migration number
function getNextMigrationNumber() {
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }
  
  const files = fs.readdirSync(TARGET_DIR)
    .filter(f => f.endsWith('.sql'))
    .map(f => {
      const match = f.match(/^(\d+)_/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));
  
  const maxNum = files.length > 0 ? Math.max(...files) : 0;
  return maxNum + 1;
}

// Main consolidation
function consolidate() {
  console.log('🔄 Consolidating migrations...\n');
  
  // Ensure target directory exists
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }
  
  // Collect unique migrations
  const migrations = collectMigrations();
  console.log(`\n📦 Found ${migrations.length} unique migrations to consolidate\n`);
  
  // Get next migration number
  let nextNum = getNextMigrationNumber();
  
  // Move migrations
  const moved = [];
  
  for (const migration of migrations) {
    // Check if already in target (by name or content)
    const existing = fs.readdirSync(TARGET_DIR)
      .find(f => {
        if (f === migration.name) return true;
        const existingPath = path.join(TARGET_DIR, f);
        if (fs.existsSync(existingPath)) {
          return getFileHash(existingPath) === getFileHash(migration.path);
        }
        return false;
      });
    
    if (existing) {
      console.log(`⏭️  Already exists: ${migration.name} (skipping)`);
      continue;
    }
    
    // Generate new filename with sequential number
    const newName = `${String(nextNum).padStart(3, '0')}_${migration.name.replace(/^\d+_/, '')}`;
    const targetPath = path.join(TARGET_DIR, newName);
    
    // Copy migration
    fs.copyFileSync(migration.path, targetPath);
    console.log(`✅ Moved: ${migration.name} → ${newName}`);
    
    moved.push({
      old: migration.path,
      new: targetPath,
      name: newName,
    });
    
    nextNum++;
  }
  
  console.log(`\n✅ Consolidated ${moved.length} migrations`);
  console.log(`📁 Target directory: ${TARGET_DIR}\n`);
  
  return moved;
}

// Run consolidation
try {
  const moved = consolidate();
  
  if (moved.length > 0) {
    console.log('\n📝 Next steps:');
    console.log('1. Review the consolidated migrations in supabase/migrations/');
    console.log('2. Test migrations on a development database');
    console.log('3. Remove old migration directories after verification');
    console.log('4. Update any scripts that reference old migration paths\n');
  } else {
    console.log('\n✅ All migrations already consolidated\n');
  }
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error consolidating migrations:', error);
  process.exit(1);
}
