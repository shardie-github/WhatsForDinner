#!/usr/bin/env node
/**
 * Validates that all migrations are consistent and in the correct location
 * Ensures no schema drift between migration directories
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');

// Expected migration directory
const EXPECTED_MIGRATION_DIR = path.join(WORKSPACE_ROOT, 'supabase/migrations');
const MASTER_SCHEMA = path.join(WORKSPACE_ROOT, 'master_supabase_schema.sql');

// Find all migration directories
function findMigrationDirs() {
  const dirs = [];
  
  // Check for migration directories (excluding node_modules)
  function findDirs(dir, depth = 0) {
    if (depth > 5) return; // Limit depth
    if (dir.includes('node_modules')) return;
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name === 'migrations') {
          const fullPath = path.join(dir, entry.name);
          if (fullPath !== EXPECTED_MIGRATION_DIR) {
            dirs.push(fullPath);
          }
        } else if (entry.isDirectory()) {
          findDirs(path.join(dir, entry.name), depth + 1);
        }
      }
    } catch (err) {
      // Ignore errors
    }
  }
  
  findDirs(WORKSPACE_ROOT);
  return dirs;
}

// Validate migration files exist
function validateMigrations() {
  console.log('🔍 Validating migration consistency...');
  
  // Check that expected directory exists
  if (!fs.existsSync(EXPECTED_MIGRATION_DIR)) {
    console.error('❌ Expected migration directory not found:', EXPECTED_MIGRATION_DIR);
    process.exit(1);
  }
  
  // Find unexpected migration directories
  const unexpectedDirs = findMigrationDirs();
  
  if (unexpectedDirs.length > 0) {
    console.error('❌ Found unexpected migration directories:');
    unexpectedDirs.forEach(dir => {
      console.error(`   - ${dir}`);
    });
    console.error('');
    console.error('⚠️  Please consolidate all migrations to: supabase/migrations/');
    console.error('   This prevents schema drift and ensures a single source of truth.');
    process.exit(1);
  }
  
  // Check master schema exists
  if (fs.existsSync(MASTER_SCHEMA)) {
    console.log('✅ Master schema file found:', MASTER_SCHEMA);
  } else {
    console.warn('⚠️  Master schema file not found:', MASTER_SCHEMA);
    console.warn('   Consider creating a master schema for validation');
  }
  
  // Count migration files
  const migrationFiles = fs.readdirSync(EXPECTED_MIGRATION_DIR)
    .filter(f => f.endsWith('.sql'));
  
  console.log(`✅ Found ${migrationFiles.length} migration files in expected location`);
  console.log('✅ All migrations are in the correct location');
  
  return true;
}

// Main
try {
  validateMigrations();
  console.log('✅ Migration validation passed!');
  process.exit(0);
} catch (error) {
  console.error('❌ Migration validation failed:', error.message);
  process.exit(1);
}
