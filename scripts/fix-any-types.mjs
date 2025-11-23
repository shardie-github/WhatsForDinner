#!/usr/bin/env node
/**
 * Fix any Types Script
 * 
 * Systematically replaces 'any' types with proper TypeScript types
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

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
        // Skip
      }
    }
  } catch (e) {
    // Skip
  }
  
  return fileList;
}

function findAnyTypes(content) {
  const issues = [];
  const lines = content.split('\n');
  
  // Patterns to find 'any' types
  const patterns = [
    /:\s*any\b/g,                    // : any
    /:\s*any\[/g,                    // : any[]
    /any\s*\|/g,                     // any |
    /\|\s*any/g,                     // | any
    /any\s*&/g,                     // any &
    /&amp;\s*any/g,                  // & any
    /<any>/g,                        // <any>
    /<any,/g,                        // <any,
    /,any>/g,                        // ,any>
    /Record<string,\s*any>/gi,       // Record<string, any>
    /Promise<any>/gi,                // Promise<any>
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
      continue;
    }
    
    for (const pattern of patterns) {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        // Skip if it's in a string or comment
        const beforeMatch = line.substring(0, match.index);
        const stringCount = (beforeMatch.match(/['"`]/g) || []).length;
        if (stringCount % 2 !== 0) continue; // Inside a string
        
        issues.push({
          line: i + 1,
          content: line.trim(),
          match: match[0],
        });
      }
    }
  }
  
  return issues;
}

function fixAnyTypes(content, filePath) {
  let modified = content;
  let changes = 0;
  
  // Common replacements
  const replacements = [
    // Record<string, any> -> Record<string, unknown>
    {
      pattern: /Record<string,\s*any>/gi,
      replacement: 'Record<string, unknown>',
    },
    // Promise<any> -> Promise<unknown>
    {
      pattern: /Promise<any>/gi,
      replacement: 'Promise<unknown>',
    },
    // : any[] -> : unknown[]
    {
      pattern: /:\s*any\[\]/g,
      replacement: ': unknown[]',
    },
    // : any -> : unknown (but be careful with function parameters)
    {
      pattern: /:\s*any\b(?!\s*[=|,|\)|;])/g,
      replacement: ': unknown',
    },
  ];
  
  for (const { pattern, replacement } of replacements) {
    const matches = modified.match(pattern);
    if (matches) {
      modified = modified.replace(pattern, replacement);
      changes += matches.length;
    }
  }
  
  return { content: modified, changes };
}

function processFile(filePath, dryRun = true) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // Find any types
    const issues = findAnyTypes(content);
    
    if (issues.length === 0) {
      return { file: filePath, changed: false, changes: 0, issues: [] };
    }
    
    // Fix any types
    const { content: modifiedContent, changes } = fixAnyTypes(content, filePath);
    
    if (!dryRun && modifiedContent !== originalContent) {
      writeFileSync(filePath, modifiedContent, 'utf-8');
    }
    
    return {
      file: filePath,
      changed: modifiedContent !== originalContent,
      changes,
      issues: issues.length,
    };
  } catch (error) {
    return {
      file: filePath,
      changed: false,
      error: error.message,
      issues: 0,
    };
  }
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--write');
  const rootDir = process.cwd();
  
  console.log('\n🔍 Scanning for any types...\n');
  
  const files = findFiles(rootDir);
  console.log(`Found ${files.length} files to process\n`);
  
  const results = [];
  let totalChanges = 0;
  let totalIssues = 0;
  
  for (const file of files) {
    const result = processFile(file, dryRun);
    results.push(result);
    if (result.changed) {
      totalChanges += result.changes;
      totalIssues += result.issues || 0;
      console.log(`${dryRun ? '📝' : '✅'} ${file}: ${result.changes} fixes, ${result.issues} issues found`);
    } else if (result.issues > 0) {
      totalIssues += result.issues;
      console.log(`⚠️  ${file}: ${result.issues} issues found (manual fix needed)`);
    }
  }
  
  const changedFiles = results.filter(r => r.changed);
  const filesWithIssues = results.filter(r => (r.issues || 0) > 0);
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${files.length}`);
  console.log(`   Files changed: ${changedFiles.length}`);
  console.log(`   Files with issues: ${filesWithIssues.length}`);
  console.log(`   Total fixes: ${totalChanges}`);
  console.log(`   Total issues found: ${totalIssues}`);
  
  if (dryRun) {
    console.log(`\n⚠️  DRY RUN MODE - Use --write to apply changes\n`);
  } else {
    console.log(`\n✅ Changes applied!\n`);
    console.log(`\n⚠️  Note: Some 'any' types require manual fixes. Review files with issues.\n`);
  }
}

main();
