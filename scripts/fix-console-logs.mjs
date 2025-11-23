#!/usr/bin/env node
/**
 * Script to help identify and replace console.log statements with logger
 * 
 * Usage:
 *   node scripts/fix-console-logs.mjs --check    # List all console.log usage
 *   node scripts/fix-console-logs.mjs --fix      # Auto-fix (dry-run by default)
 *   node scripts/fix-console-logs.mjs --fix --write  # Actually write changes
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const CONSOLE_METHODS = ['log', 'error', 'warn', 'info', 'debug'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', '.git', 'coverage'];
const INCLUDE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

function shouldProcessFile(filePath) {
  const ext = extname(filePath);
  return INCLUDE_EXTENSIONS.includes(ext);
}

function shouldExcludeDir(dirName) {
  return EXCLUDE_DIRS.includes(dirName) || dirName.startsWith('.');
}

function findFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!shouldExcludeDir(file)) {
        findFiles(filePath, fileList);
      }
    } else if (shouldProcessFile(filePath)) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

function findConsoleUsage(content, filePath) {
  const issues = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    for (const method of CONSOLE_METHODS) {
      const regex = new RegExp(`console\\.${method}\\s*\\(`, 'g');
      let match;
      
      while ((match = regex.exec(line)) !== null) {
        // Skip if already using logger
        if (line.includes('logger.') || line.includes('createLogger') || line.includes('createComponentLogger')) {
          continue;
        }
        
        // Skip test files (they can use console for debugging)
        if (filePath.includes('__tests__') || filePath.includes('.test.') || filePath.includes('.spec.')) {
          continue;
        }
        
        issues.push({
          file: filePath,
          line: lineNum,
          method,
          content: line.trim(),
        });
      }
    }
  }
  
  return issues;
}

function generateFix(filePath, issue) {
  // Determine component name from file path
  const pathParts = filePath.split('/');
  const fileName = pathParts[pathParts.length - 1].replace(/\.[^.]+$/, '');
  const componentName = fileName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  
  // Extract the console statement
  const line = issue.content;
  
  // Try to extract the message and context
  const match = line.match(/console\.(log|error|warn|info|debug)\s*\((.+)\)/);
  if (!match) return null;
  
  const [, method, args] = match;
  
  // Map console methods to logger methods
  const loggerMethod = method === 'log' ? 'info' : method;
  
  // Generate import if needed
  const importLine = "import { createComponentLogger } from '@whats-for-dinner/utils';\n";
  const loggerInit = `const logger = createComponentLogger('${componentName}');\n`;
  
  // Generate replacement
  // Simple case: console.error('message')
  if (args.match(/^['"`]/)) {
    const message = args.replace(/^['"`]|['"`]$/g, '');
    return {
      import: importLine,
      init: loggerInit,
      replacement: `logger.${loggerMethod}('${message}');`,
      original: line,
    };
  }
  
  // Complex case: console.error('message', context)
  // This is harder to auto-fix, so we'll just flag it
  return {
    import: importLine,
    init: loggerInit,
    replacement: `// TODO: Replace with logger.${loggerMethod}(...)`,
    original: line,
    note: 'Complex console statement - manual fix required',
  };
}

function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');
  const fix = args.includes('--fix');
  const write = args.includes('--write');
  
  const rootDir = process.cwd();
  const files = findFiles(rootDir);
  
  console.log(`\n🔍 Scanning ${files.length} files for console.log usage...\n`);
  
  const allIssues = [];
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      const issues = findConsoleUsage(content, file);
      allIssues.push(...issues);
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  }
  
  // Group by file
  const issuesByFile = {};
  for (const issue of allIssues) {
    if (!issuesByFile[issue.file]) {
      issuesByFile[issue.file] = [];
    }
    issuesByFile[issue.file].push(issue);
  }
  
  console.log(`\n📊 Found ${allIssues.length} console.log statements across ${Object.keys(issuesByFile).length} files\n`);
  
  if (checkOnly) {
    // Just list them
    for (const [file, issues] of Object.entries(issuesByFile)) {
      console.log(`\n${file}:`);
      for (const issue of issues) {
        console.log(`  Line ${issue.line}: console.${issue.method}`);
        console.log(`    ${issue.content}`);
      }
    }
    return;
  }
  
  if (fix) {
    console.log('\n🔧 Generating fixes...\n');
    
    if (!write) {
      console.log('⚠️  DRY RUN MODE - Use --write to actually apply changes\n');
    }
    
    for (const [file, issues] of Object.entries(issuesByFile)) {
      console.log(`\n📝 ${file}:`);
      
      try {
        let content = readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        const fixes = [];
        
        // Check if logger is already imported
        const hasLoggerImport = content.includes('createComponentLogger') || content.includes('createLogger');
        const hasLoggerInit = content.includes('const logger =');
        
        for (const issue of issues) {
          const fix = generateFix(file, issue);
          if (fix) {
            fixes.push({ issue, fix });
            console.log(`  Line ${issue.line}: ${fix.original}`);
            console.log(`    → ${fix.replacement}`);
            if (fix.note) {
              console.log(`    ⚠️  ${fix.note}`);
            }
          }
        }
        
        if (write && fixes.length > 0) {
          // Apply fixes (simplified - would need more sophisticated replacement)
          console.log(`  ✅ Would apply ${fixes.length} fixes`);
          // Note: Full implementation would require AST parsing for safety
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${file}:`, error.message);
      }
    }
    
    console.log('\n\n💡 Tip: Use an IDE find-and-replace with regex for bulk fixes:');
    console.log('   Find: console\\.(error|warn|log|info|debug)\\(');
    console.log('   Replace: logger.$1(');
    console.log('\n   But remember to:');
    console.log('   1. Import logger: import { createComponentLogger } from \'@whats-for-dinner/utils\';');
    console.log('   2. Initialize: const logger = createComponentLogger(\'component-name\');');
  }
  
  console.log('\n✨ Done!\n');
}

main();
