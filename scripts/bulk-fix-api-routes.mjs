#!/usr/bin/env node
/**
 * Bulk fix script for API routes
 * - Replaces console.log/error with logger
 * - Adds standardized error handling
 * - Adds correlation ID support
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';

const API_ROUTE_PATTERN = /app\/api\/.*\/route\.ts$/;
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', '__tests__'];

function shouldProcessFile(filePath) {
  return API_ROUTE_PATTERN.test(filePath) && filePath.endsWith('.ts');
}

function findApiRoutes(dir, fileList = []) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        findApiRoutes(filePath, fileList);
      }
    } else if (shouldProcessFile(filePath)) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

function needsFixing(content) {
  return (
    content.includes('console.') ||
    content.includes('catch (error: any)') ||
    (!content.includes('handleApiError') && content.includes('catch'))
  );
}

function fixFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // Skip if already fixed
  if (content.includes('handleApiError') && !content.includes('console.')) {
    return false;
  }
  
  // Add imports if needed
  if (!content.includes('handleApiError')) {
    const importMatch = content.match(/^import.*from ['"]next\/server['"];?/m);
    if (importMatch) {
      const importLine = importMatch[0];
      content = content.replace(
        importLine,
        `${importLine}\nimport { handleApiError, getCorrelationId } from '@whats-for-dinner/utils';\nimport { createComponentLogger } from '@whats-for-dinner/utils';`
      );
    }
  }
  
  // Extract component name from path
  const pathParts = filePath.split('/');
  const routeName = pathParts[pathParts.length - 2] || 'api';
  const componentName = routeName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() + '-api';
  
  // Add logger if not present
  if (!content.includes('createComponentLogger')) {
    const firstFunction = content.match(/export\s+(async\s+)?function\s+\w+/);
    if (firstFunction) {
      const index = content.indexOf(firstFunction[0]);
      content = content.slice(0, index) + 
        `const logger = createComponentLogger('${componentName}');\n\n` +
        content.slice(index);
    }
  }
  
  // Replace console.error with logger.error
  content = content.replace(
    /console\.error\(['"]([^'"]+)['"],\s*error\)/g,
    "logger.error('$1', { error: error instanceof Error ? error.message : String(error), correlationId: getCorrelationId(request) })"
  );
  
  // Replace console.error with logger.error (no message)
  content = content.replace(
    /console\.error\(['"]([^'"]+)['"]\)/g,
    "logger.error('$1', { correlationId: getCorrelationId(request) })"
  );
  
  // Replace console.warn
  content = content.replace(
    /console\.warn\(['"]([^'"]+)['"],\s*([^)]+)\)/g,
    "logger.warn('$1', { $2, correlationId: getCorrelationId(request) })"
  );
  
  // Replace console.log
  content = content.replace(
    /console\.log\(['"]([^'"]+)['"]\)/g,
    "logger.info('$1', { correlationId: getCorrelationId(request) })"
  );
  
  // Fix error: any types
  content = content.replace(/catch\s*\(error:\s*any\)/g, 'catch (error)');
  
  // Replace generic error responses with handleApiError
  content = content.replace(
    /return\s+NextResponse\.json\(\s*\{\s*error:\s*['"]([^'"]+)['"]\s*\}\s*,\s*\{\s*status:\s*500\s*\}\s*\);/g,
    `return handleApiError(error, { component: '${componentName}', context: { correlationId: getCorrelationId(request) } });`
  );
  
  if (content !== originalContent) {
    writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  
  return false;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--write');
  
  const rootDir = join(process.cwd(), 'apps/web/src');
  const routes = findApiRoutes(rootDir);
  
  console.log(`\n🔍 Found ${routes.length} API route files\n`);
  
  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - Use --write to apply changes\n');
  }
  
  let fixed = 0;
  const needsFixingList = [];
  
  for (const route of routes) {
    const content = readFileSync(route, 'utf-8');
    if (needsFixing(content)) {
      needsFixingList.push(route);
      if (!dryRun) {
        if (fixFile(route)) {
          fixed++;
          console.log(`✅ Fixed: ${route}`);
        }
      } else {
        console.log(`📝 Would fix: ${route}`);
      }
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files needing fixes: ${needsFixingList.length}`);
  if (!dryRun) {
    console.log(`   Files fixed: ${fixed}`);
  }
  console.log(`\n✨ Done!\n`);
}

main();
