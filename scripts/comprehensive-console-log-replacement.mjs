#!/usr/bin/env node
/**
 * Comprehensive Console.log Replacement Script
 * 
 * Systematically replaces all console.log statements with logger
 * Handles imports, initialization, and complex cases
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONSOLE_METHODS = ['log', 'error', 'warn', 'info', 'debug'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', '.git', 'coverage', '.turbo'];
const INCLUDE_EXTENSIONS = ['.ts', '.tsx'];
const EXCLUDE_PATTERNS = [
  /\.test\./,
  /\.spec\./,
  /__tests__/,
  /\.d\.ts$/,
  /node_modules/,
  /dist/,
  /\.next/,
];

// Logger import patterns
const LOGGER_IMPORT = "import { createComponentLogger } from '@whats-for-dinner/utils';\n";
const LOGGER_IMPORT_ALT = "import { logger } from '@whats-for-dinner/utils';\n";

function shouldProcessFile(filePath) {
  const ext = extname(filePath);
  if (!INCLUDE_EXTENSIONS.includes(ext)) return false;
  
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.test(filePath)) return false;
  }
  
  return true;
}

function shouldExcludeDir(dirName) {
  return EXCLUDE_DIRS.includes(dirName) || dirName.startsWith('.');
}

function findFiles(dir, fileList = []) {
  try {
    const files = readdirSync(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      try {
        const stat = statSync(filePath);
        
        if (stat.isDirectory()) {
          if (!shouldExcludeDir(file)) {
            findFiles(filePath, fileList);
          }
        } else if (shouldProcessFile(filePath)) {
          fileList.push(filePath);
        }
      } catch (e) {
        // Skip files we can't access
      }
    }
  } catch (e) {
    // Skip directories we can't access
  }
  
  return fileList;
}

function getComponentName(filePath) {
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1].replace(/\.[^.]+$/, '');
  
  // Extract meaningful component name from path
  const relevantParts = parts.filter(p => 
    !['src', 'app', 'lib', 'components', 'pages'].includes(p)
  );
  
  if (relevantParts.length > 0) {
    return relevantParts[relevantParts.length - 1].replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  }
  
  return fileName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
}

function hasLoggerImport(content) {
  return content.includes('createComponentLogger') || 
         content.includes('createLogger') ||
         content.includes("from '@whats-for-dinner/utils'") ||
         content.includes("from \"@whats-for-dinner/utils\"");
}

function hasLoggerInit(content) {
  return /const\s+logger\s*=/.test(content) ||
         /let\s+logger\s*=/.test(content);
}

function addLoggerImport(content) {
  if (hasLoggerImport(content)) return content;
  
  // Find the last import statement
  const importRegex = /^import\s+.*$/gm;
  const imports = content.match(importRegex) || [];
  
  if (imports.length === 0) {
    // No imports, add at the top
    return LOGGER_IMPORT + content;
  }
  
  // Add after last import
  const lastImport = imports[imports.length - 1];
  const lastImportIndex = content.lastIndexOf(lastImport);
  const afterLastImport = content.indexOf('\n', lastImportIndex) + 1;
  
  return content.slice(0, afterLastImport) + LOGGER_IMPORT + content.slice(afterLastImport);
}

function addLoggerInit(content, componentName) {
  if (hasLoggerInit(content)) return content;
  
  // Find where to insert (after imports, before first function/class)
  const afterImports = content.search(/(^export|^const|^function|^class|^async|^type|^interface)/m);
  if (afterImports === -1) {
    // No clear insertion point, add after imports
    const importEnd = content.lastIndexOf(';') + 1;
    const nextLine = content.indexOf('\n', importEnd) + 1;
    return content.slice(0, nextLine) + `const logger = createComponentLogger('${componentName}');\n` + content.slice(nextLine);
  }
  
  // Insert before first export/const/function
  const lineStart = content.lastIndexOf('\n', afterImports) + 1;
  return content.slice(0, lineStart) + `const logger = createComponentLogger('${componentName}');\n` + content.slice(lineStart);
}

function replaceConsoleStatements(content, componentName) {
  let modified = content;
  let changes = 0;
  
  // Map console methods to logger methods
  const methodMap = {
    'log': 'info',
    'error': 'error',
    'warn': 'warn',
    'info': 'info',
    'debug': 'debug',
  };
  
  // Pattern 1: console.method('message')
  for (const [consoleMethod, loggerMethod] of Object.entries(methodMap)) {
    const simplePattern = new RegExp(
      `console\\.${consoleMethod}\\s*\\(\\s*([^,)]+)\\s*\\)`,
      'g'
    );
    
    modified = modified.replace(simplePattern, (match, arg) => {
      changes++;
      // Clean up the argument
      const cleanArg = arg.trim().replace(/^['"`]|['"`]$/g, '');
      return `logger.${loggerMethod}('${cleanArg}')`;
    });
  }
  
  // Pattern 2: console.method('message', context)
  for (const [consoleMethod, loggerMethod] of Object.entries(methodMap)) {
    const complexPattern = new RegExp(
      `console\\.${consoleMethod}\\s*\\(\\s*([^,]+),\\s*(.+?)\\s*\\)`,
      'gs'
    );
    
    modified = modified.replace(complexPattern, (match, message, context) => {
      changes++;
      const cleanMessage = message.trim().replace(/^['"`]|['"`]$/g, '');
      const cleanContext = context.trim();
      return `logger.${loggerMethod}('${cleanMessage}', { ${cleanContext} })`;
    });
  }
  
  // Pattern 3: console.method('message', error)
  for (const [consoleMethod, loggerMethod] of Object.entries(methodMap)) {
    const errorPattern = new RegExp(
      `console\\.${consoleMethod}\\s*\\(\\s*([^,]+),\\s*(error|err)\\s*\\)`,
      'gi'
    );
    
    modified = modified.replace(errorPattern, (match, message, errorVar) => {
      changes++;
      const cleanMessage = message.trim().replace(/^['"`]|['"`]$/g, '');
      return `logger.${loggerMethod}('${cleanMessage}', { error: ${errorVar} instanceof Error ? ${errorVar}.message : String(${errorVar}), stack: ${errorVar} instanceof Error ? ${errorVar}.stack : undefined })`;
    });
  }
  
  return { content: modified, changes };
}

function processFile(filePath, dryRun = true) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Skip if no console statements
    if (!/console\.(log|error|warn|info|debug)/.test(content)) {
      return { file: filePath, changed: false, changes: 0 };
    }
    
    const componentName = getComponentName(filePath);
    
    // Add logger import if needed
    if (!hasLoggerImport(content)) {
      content = addLoggerImport(content);
    }
    
    // Add logger init if needed
    if (!hasLoggerInit(content)) {
      content = addLoggerInit(content, componentName);
    }
    
    // Replace console statements
    const { content: modifiedContent, changes } = replaceConsoleStatements(content, componentName);
    
    if (!dryRun && modifiedContent !== originalContent) {
      writeFileSync(filePath, modifiedContent, 'utf-8');
    }
    
    return {
      file: filePath,
      changed: modifiedContent !== originalContent,
      changes,
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
  
  console.log('\n🔍 Scanning for console.log statements...\n');
  
  const files = findFiles(rootDir);
  console.log(`Found ${files.length} files to process\n`);
  
  const results = [];
  let totalChanges = 0;
  
  for (const file of files) {
    const result = processFile(file, dryRun);
    results.push(result);
    if (result.changed) {
      totalChanges += result.changes;
      console.log(`${dryRun ? '📝' : '✅'} ${file}: ${result.changes} changes`);
    }
  }
  
  const changedFiles = results.filter(r => r.changed);
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${files.length}`);
  console.log(`   Files changed: ${changedFiles.length}`);
  console.log(`   Total replacements: ${totalChanges}`);
  
  if (dryRun) {
    console.log(`\n⚠️  DRY RUN MODE - Use --write to apply changes\n`);
  } else {
    console.log(`\n✅ Changes applied!\n`);
  }
}

main();
