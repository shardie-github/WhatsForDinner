#!/usr/bin/env node
/**
 * Standardize Error Handling Script
 * 
 * Ensures all API routes use unified error handling
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const API_ROUTE_PATTERN = /\/api\/.*\/route\.ts$/;
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', '.git', 'coverage'];

function findApiRoutes(dir, fileList = []) {
  try {
    const files = readdirSync(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      try {
        const stat = statSync(filePath);
        
        if (stat.isDirectory()) {
          if (!EXCLUDE_DIRS.includes(file) && !file.startsWith('.')) {
            findApiRoutes(filePath, fileList);
          }
        } else if (filePath.endsWith('route.ts') && API_ROUTE_PATTERN.test(filePath)) {
          fileList.push(filePath);
        }
      } catch (e) {
        // Skip
      }
    }
  } catch (e) {
    // Skip
  }
  
  return fileList;
}

function needsErrorHandler(content) {
  // Check if already using handleApiError
  if (content.includes('handleApiError') || content.includes('withApiErrorHandler')) {
    return false;
  }
  
  // Check if has try-catch
  if (!content.includes('try') || !content.includes('catch')) {
    return false;
  }
  
  // Check if it's an API route (has export async function GET/POST/etc)
  if (!/export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)/.test(content)) {
    return false;
  }
  
  return true;
}

function addErrorHandler(content, filePath) {
  // Check if handleApiError is imported
  const hasImport = content.includes("from '@whats-for-dinner/utils'") ||
                    content.includes('handleApiError') ||
                    content.includes('withApiErrorHandler');
  
  let modified = content;
  
  // Add import if needed
  if (!hasImport) {
    const importMatch = content.match(/^import\s+.*$/m);
    if (importMatch) {
      const lastImport = content.lastIndexOf('import');
      const lastImportEnd = content.indexOf('\n', lastImport) + 1;
      modified = modified.slice(0, lastImportEnd) +
                 "import { handleApiError } from '@whats-for-dinner/utils';\n" +
                 modified.slice(lastImportEnd);
    } else {
      modified = "import { handleApiError } from '@whats-for-dinner/utils';\n" + modified;
    }
  }
  
  // Wrap export functions with error handler
  // This is complex - for now, just add handleApiError in catch blocks
  const catchPattern = /catch\s*\([^)]*\)\s*\{([^}]*)\}/gs;
  
  modified = modified.replace(catchPattern, (match, catchBody) => {
    // Skip if already using handleApiError
    if (catchBody.includes('handleApiError')) {
      return match;
    }
    
    // Replace with handleApiError
    const errorVar = match.match(/catch\s*\(([^)]+)\)/)?.[1] || 'error';
    return `catch (${errorVar}) {
    return handleApiError(${errorVar}, {
      component: 'api-route',
      context: { endpoint: '${filePath.split('/api/')[1]?.replace('/route.ts', '') || 'unknown'}' },
    });
  }`;
  });
  
  return modified;
}

function processFile(filePath, dryRun = true) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    if (!needsErrorHandler(content)) {
      return { file: filePath, changed: false };
    }
    
    const modified = addErrorHandler(content, filePath);
    
    if (!dryRun && modified !== originalContent) {
      writeFileSync(filePath, modified, 'utf-8');
    }
    
    return {
      file: filePath,
      changed: modified !== originalContent,
    };
  } catch (error) {
    return {
      file: filePath,
      changed: false,
      error: error.message,
    };
  }
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--write');
  const rootDir = process.cwd();
  
  console.log('\n🔍 Scanning API routes for error handling...\n');
  
  const apiRoutes = findApiRoutes(join(rootDir, 'apps/web/src/app'));
  console.log(`Found ${apiRoutes.length} API routes\n`);
  
  const results = [];
  let changedCount = 0;
  
  for (const route of apiRoutes) {
    const result = processFile(route, dryRun);
    results.push(result);
    if (result.changed) {
      changedCount++;
      console.log(`${dryRun ? '📝' : '✅'} ${route}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Routes processed: ${apiRoutes.length}`);
  console.log(`   Routes updated: ${changedCount}`);
  
  if (dryRun) {
    console.log(`\n⚠️  DRY RUN MODE - Use --write to apply changes\n`);
  } else {
    console.log(`\n✅ Changes applied!\n`);
    console.log(`\n⚠️  Note: Some routes may need manual review for complex error handling.\n`);
  }
}

main();
