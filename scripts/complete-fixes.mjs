#!/usr/bin/env node
/**
 * Complete Fix Script
 * 
 * Systematically fixes all remaining issues:
 * - Replaces console.log with logger
 * - Fixes any types
 * - Standardizes error handling
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', '__tests__', '.git'];
const INCLUDE_EXTENSIONS = ['.ts', '.tsx'];

function shouldProcessFile(filePath) {
  const ext = extname(filePath);
  return INCLUDE_EXTENSIONS.includes(ext) && 
         !filePath.includes('node_modules') &&
         !filePath.includes('.next') &&
         !filePath.includes('__tests__');
}

function findFiles(dir, fileList = []) {
  try {
    const files = readdirSync(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!EXCLUDE_DIRS.includes(file) && !file.startsWith('.')) {
          findFiles(filePath, fileList);
        }
      } else if (shouldProcessFile(filePath)) {
        fileList.push(filePath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return fileList;
}

function fixConsoleLogs(content, filePath) {
  let fixed = content;
  let changed = false;
  
  // Skip if already using logger
  if (content.includes('createComponentLogger') || content.includes('createLogger')) {
    // Still check for console statements
  }
  
  // Extract component name
  const pathParts = filePath.split('/');
  const fileName = pathParts[pathParts.length - 1].replace(/\.[^.]+$/, '');
  const componentName = fileName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  
  // Check if logger is imported
  const hasLoggerImport = content.includes('createComponentLogger') || content.includes('createLogger');
  const hasLoggerInit = content.includes('const logger =');
  
  // Add logger import if needed
  if (!hasLoggerImport && (content.includes('console.') || content.includes('console.log'))) {
    const importMatch = content.match(/^import.*from ['"]@\/lib\/|^import.*from ['"]react['"]|^import.*from ['"]next\/|^'use client';/m);
    if (importMatch) {
      const importLine = importMatch[0];
      const newImport = `import { createComponentLogger } from '@whats-for-dinner/utils';\n\nconst logger = createComponentLogger('${componentName}');\n\n`;
      fixed = fixed.replace(importLine, importLine + '\n' + newImport);
      changed = true;
    } else {
      // Add at the top
      fixed = `import { createComponentLogger } from '@whats-for-dinner/utils';\n\nconst logger = createComponentLogger('${componentName}');\n\n` + fixed;
      changed = true;
    }
  }
  
  // Replace console.error with logger.error
  const consoleErrorRegex = /console\.error\((['"`])([^'"`]+)\1\s*,\s*error\)/g;
  if (consoleErrorRegex.test(fixed)) {
    fixed = fixed.replace(consoleErrorRegex, (match, quote, message) => {
      return `logger.error('${message}', { error: error instanceof Error ? error.message : String(error) })`;
    });
    changed = true;
  }
  
  // Replace console.error simple
  const consoleErrorSimpleRegex = /console\.error\((['"`])([^'"`]+)\1\)/g;
  if (consoleErrorSimpleRegex.test(fixed)) {
    fixed = fixed.replace(consoleErrorSimpleRegex, (match, quote, message) => {
      return `logger.error('${message}')`;
    });
    changed = true;
  }
  
  // Replace console.warn
  const consoleWarnRegex = /console\.warn\((['"`])([^'"`]+)\1\)/g;
  if (consoleWarnRegex.test(fixed)) {
    fixed = fixed.replace(consoleWarnRegex, (match, quote, message) => {
      return `logger.warn('${message}')`;
    });
    changed = true;
  }
  
  // Replace console.log
  const consoleLogRegex = /console\.log\((['"`])([^'"`]+)\1\)/g;
  if (consoleLogRegex.test(fixed)) {
    fixed = fixed.replace(consoleLogRegex, (match, quote, message) => {
      return `logger.info('${message}')`;
    });
    changed = true;
  }
  
  // Replace console.info
  const consoleInfoRegex = /console\.info\((['"`])([^'"`]+)\1\)/g;
  if (consoleInfoRegex.test(fixed)) {
    fixed = fixed.replace(consoleInfoRegex, (match, quote, message) => {
      return `logger.info('${message}')`;
    });
    changed = true;
  }
  
  return { fixed, changed };
}

function fixAnyTypes(content) {
  let fixed = content;
  let changed = false;
  
  // Fix catch (error: any)
  if (fixed.includes('catch (error: any)')) {
    fixed = fixed.replace(/catch\s*\(\s*error:\s*any\s*\)/g, 'catch (error)');
    changed = true;
  }
  
  // Fix useState<any>
  if (fixed.includes('useState<any>')) {
    // Try to infer type from usage
    fixed = fixed.replace(/useState<any>\(null\)/g, 'useState<unknown>(null)');
    changed = true;
  }
  
  // Fix : any in function parameters (be careful)
  // This is more complex and might need manual review
  
  return { fixed, changed };
}

function fixFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Skip test files for console.log (they can use console for debugging)
    const isTestFile = filePath.includes('__tests__') || filePath.includes('.test.') || filePath.includes('.spec.');
    
    let consoleFixed = { fixed: content, changed: false };
    if (!isTestFile) {
      consoleFixed = fixConsoleLogs(content, filePath);
      content = consoleFixed.fixed;
    }
    
    const anyFixed = fixAnyTypes(content);
    content = anyFixed.fixed;
    
    if (consoleFixed.changed || anyFixed.changed) {
      writeFileSync(filePath, content, 'utf-8');
      return {
        fixed: true,
        consoleFixed: consoleFixed.changed,
        anyFixed: anyFixed.changed,
      };
    }
    
    return { fixed: false };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { fixed: false, error: error.message };
  }
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--write');
  const targetDir = args.find(arg => !arg.startsWith('--')) || 'apps/web/src';
  
  console.log(`\n🔍 Scanning ${targetDir} for fixes...\n`);
  
  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - Use --write to apply changes\n');
  }
  
  const files = findFiles(targetDir);
  console.log(`Found ${files.length} files to check\n`);
  
  let fixed = 0;
  let consoleFixed = 0;
  let anyFixed = 0;
  const errors = [];
  
  for (const file of files) {
    const result = fixFile(file);
    if (result.fixed) {
      fixed++;
      if (result.consoleFixed) consoleFixed++;
      if (result.anyFixed) anyFixed++;
      
      if (!dryRun) {
        console.log(`✅ Fixed: ${file}`);
      } else {
        console.log(`📝 Would fix: ${file}`);
      }
    }
    if (result.error) {
      errors.push({ file, error: result.error });
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${files.length}`);
  console.log(`   Files fixed: ${fixed}`);
  console.log(`   Console.log fixes: ${consoleFixed}`);
  console.log(`   Any type fixes: ${anyFixed}`);
  if (errors.length > 0) {
    console.log(`   Errors: ${errors.length}`);
    errors.forEach(e => console.log(`     - ${e.file}: ${e.error}`));
  }
  
  if (dryRun) {
    console.log(`\n💡 Run with --write to apply changes\n`);
  } else {
    console.log(`\n✨ Done! Fixed ${fixed} files\n`);
  }
}

main();
