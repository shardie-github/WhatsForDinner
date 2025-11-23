#!/usr/bin/env node
/**
 * Comprehensive TypeScript Error Fixer
 * Fixes all common TypeScript syntax errors automatically
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { glob } from 'glob';

// Get all TypeScript files
const tsFiles = await glob('**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**']
});

console.log(`Found ${tsFiles.length} TypeScript files`);

let totalFixed = 0;

for (const filePath of tsFiles) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    const original = content;
    
    // Fix 1: Broken template literals with single quotes
    // Pattern: logger.info('text ${var}') -> logger.info(`text ${var}`)
    content = content.replace(
      /logger\.(info|warn|error|debug|log)\s*\(\s*'([^']*\$\{[^}]+\}[^']*)'/g,
      (match, method, text) => {
        return `logger.${method}(\`${text}\``;
      }
    );
    
    // Fix 2: Broken template literals in general
    // Pattern: 'text ${var}' -> `text ${var}`
    content = content.replace(
      /'([^']*\$\{[^}]+\}[^']*)'/g,
      (match, text) => {
        // Don't replace if it's already in a template literal context
        if (match.includes('`')) return match;
        return `\`${text}\``;
      }
    );
    
    // Fix 3: Broken method calls
    // Pattern: toUpperCase(` -> toUpperCase()
    content = content.replace(/toUpperCase\(`\)/g, 'toUpperCase()');
    content = content.replace(/toUpperCase\(`/g, 'toUpperCase()');
    
    // Fix 4: Broken array methods
    // Pattern: .map(r => r.name`) -> .map(r => r.name)
    content = content.replace(/\.name`\)/g, '.name)');
    content = content.replace(/\.name`/g, '.name)');
    
    // Fix 5: Broken filter calls
    content = content.replace(/foundInCode`\)/g, 'foundInCode)');
    content = content.replace(/foundInWorkflows`\)/g, 'foundInWorkflows)');
    
    // Fix 6: Broken repeat calls
    // Pattern: .repeat(80`) -> .repeat(80)
    content = content.replace(/\.repeat\((\d+)`\)/g, '.repeat($1)');
    
    // Fix 7: Broken object literals in logger calls
    // Pattern: logger.info('text', { var }) -> logger.info('text', { var: var })
    content = content.replace(
      /logger\.(info|warn|error|debug|log)\s*\(\s*'([^']+)',\s*\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\s*\)/g,
      (match, method, text, varName) => {
        return `logger.${method}('${text}', { ${varName}: ${varName} })`;
      }
    );
    
    // Fix 8: Fix broken template literal expressions
    // Pattern: ${var}` -> ${var}
    content = content.replace(/\$\{([^}]+)\}`/g, '${$1}');
    
    // Fix 9: Fix unterminated template literals
    // Pattern: 'text ${var} -> `text ${var}`
    const lines = content.split('\n');
    const fixedLines = [];
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      // Check for unterminated template literal patterns
      if (line.includes("'") && line.includes('${') && !line.includes('`') && !line.trim().endsWith("'")) {
        // Check if it's a template literal pattern
        if (line.match(/logger\.(info|warn|error|debug|log)\s*\(\s*'[^']*\$\{/)) {
          line = line.replace(/'([^']*\$\{[^}]+\})/g, '`$1`');
        }
      }
      fixedLines.push(line);
    }
    content = fixedLines.join('\n');
    
    if (content !== original) {
      writeFileSync(filePath, content, 'utf-8');
      totalFixed++;
    }
  } catch (error) {
    // Skip files that can't be read
  }
}

console.log(`✅ Fixed ${totalFixed} files`);
console.log('Run "pnpm typecheck" to verify fixes');
