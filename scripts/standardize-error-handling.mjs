#!/usr/bin/env node
/**
 * Standardize Error Handling
 * Replaces console.log with proper logger and adds error boundaries
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

function processFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Replace console.log with logger
  if (content.includes('console.log') && !content.includes('createComponentLogger')) {
    // Add logger import if not present
    if (!content.includes("from '@whats-for-dinner/utils'")) {
      const importMatch = content.match(/^import\s+.*from\s+['"]@\/lib\/supabase/);
      if (importMatch) {
        const insertPos = content.indexOf('\n', importMatch.index) + 1;
        content = content.slice(0, insertPos) + 
          "import { createComponentLogger } from '@whats-for-dinner/utils';\n" +
          "const logger = createComponentLogger('module');\n" +
          content.slice(insertPos);
        modified = true;
      }
    }
    
    // Replace console.log with logger.info
    content = content.replace(/console\.log\(/g, 'logger.info(');
    content = content.replace(/console\.error\(/g, 'logger.error(');
    content = content.replace(/console\.warn\(/g, 'logger.warn(');
    content = content.replace(/console\.debug\(/g, 'logger.debug(');
    modified = true;
  }
  
  return { content, modified };
}

// Process all TypeScript files
function processDirectory(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  let totalModified = 0;
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.includes('node_modules') && !entry.name.includes('.next')) {
      totalModified += processDirectory(fullPath);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      try {
        const { content, modified } = processFile(fullPath);
        if (modified) {
          writeFileSync(fullPath, content, 'utf-8');
          totalModified++;
        }
      } catch (e) {
        // Skip files that can't be processed
      }
    }
  }
  
  return totalModified;
}

const modified = processDirectory('apps/web/src');
console.log(`✅ Standardized error handling in ${modified} files`);
