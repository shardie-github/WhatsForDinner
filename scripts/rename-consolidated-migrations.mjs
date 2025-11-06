#!/usr/bin/env node
/**
 * Renames consolidated migrations to use sequential numbering
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROOT = path.resolve(__dirname, '..');

const MIGRATIONS_DIR = path.join(WORKSPACE_ROOT, 'supabase/migrations');

// Get existing migration numbers
function getExistingNumbers() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .map(f => {
      const match = f.match(/^(\d{3})_/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter(n => n !== null);
  
  return new Set(files);
}

// Rename migrations
function renameMigrations() {
  const existingNumbers = getExistingNumbers();
  const maxNum = existingNumbers.size > 0 ? Math.max(...Array.from(existingNumbers)) : 0;
  
  // Find migrations that need renaming (those starting with 2025110212)
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql') && f.startsWith('2025110212'))
    .sort();
  
  let nextNum = maxNum + 1;
  const renamed = [];
  
  for (const file of files) {
    // Extract base name (after timestamp prefix)
    const baseName = file.replace(/^2025110212\d{2}_/, '');
    const newName = `${String(nextNum).padStart(3, '0')}_${baseName}`;
    const oldPath = path.join(MIGRATIONS_DIR, file);
    const newPath = path.join(MIGRATIONS_DIR, newName);
    
    // Skip if target already exists
    if (fs.existsSync(newPath)) {
      console.log(`⏭️  Target exists: ${newName} (skipping ${file})`);
      continue;
    }
    
    fs.renameSync(oldPath, newPath);
    console.log(`✅ Renamed: ${file} → ${newName}`);
    renamed.push({ old: file, new: newName });
    nextNum++;
  }
  
  return renamed;
}

try {
  console.log('🔄 Renaming consolidated migrations...\n');
  const renamed = renameMigrations();
  
  if (renamed.length > 0) {
    console.log(`\n✅ Renamed ${renamed.length} migrations\n`);
  } else {
    console.log('\n✅ No migrations needed renaming\n');
  }
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error renaming migrations:', error);
  process.exit(1);
}
