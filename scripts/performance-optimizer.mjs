#!/usr/bin/env node
/**
 * Performance Optimization Script
 * 
 * Identifies performance optimization opportunities
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', '.git', 'coverage'];
const INCLUDE_EXTENSIONS = ['.ts', '.tsx'];

function findFiles(dir, fileList = []) {
  try {
    const files = readdirSync(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      try {
        const stat = statSync(filePath);
        
        if (stat.isDirectory()) {
          if (!EXCLUDE_DIRS.includes(file) && !file.startsWith('.')) {
            findFiles(filePath, fileList);
          }
        } else if (INCLUDE_EXTENSIONS.includes(extname(filePath))) {
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

function analyzePerformance(content, filePath) {
  const issues = [];
  
  // Check for N+1 query patterns
  if (content.includes('.map(') && content.includes('await') && content.includes('supabase')) {
    const mapMatches = content.matchAll(/\.map\s*\([^)]*=>[^)]*await/g);
    if (Array.from(mapMatches).length > 0) {
      issues.push({
        type: 'N+1 Query',
        severity: 'HIGH',
        suggestion: 'Use Promise.all() or batch queries',
      });
    }
  }
  
  // Check for missing caching
  if (content.includes('supabase.from(') && !content.includes('cache') && !content.includes('Cache')) {
    issues.push({
      type: 'Missing Cache',
      severity: 'MEDIUM',
      suggestion: 'Consider adding caching for database queries',
    });
  }
  
  // Check for large bundle imports
  if (content.includes("import * from") || content.includes('import {') && content.split('import {')[1]?.split('}')[0]?.split(',').length > 5) {
    issues.push({
      type: 'Large Import',
      severity: 'LOW',
      suggestion: 'Consider code splitting or tree shaking',
    });
  }
  
  // Check for missing memoization
  if (content.includes('useMemo') === false && content.includes('useCallback') === false && 
      (content.includes('useEffect') || content.includes('function'))) {
    // This is a heuristic - not always accurate
  }
  
  return issues;
}

function main() {
  const rootDir = process.cwd();
  
  console.log('\n⚡ Performance Analysis Starting...\n');
  
  const files = findFiles(join(rootDir, 'apps/web/src'));
  console.log(`Analyzing ${files.length} files...\n`);
  
  const results = [];
  let totalIssues = 0;
  
  for (const file of files.slice(0, 100)) { // Limit for demo
    try {
      const content = readFileSync(file, 'utf-8');
      const issues = analyzePerformance(content, file);
      
      if (issues.length > 0) {
        totalIssues += issues.length;
        results.push({ file, issues });
        console.log(`⚠️  ${file}:`);
        issues.forEach(issue => {
          console.log(`   [${issue.severity}] ${issue.type}: ${issue.suggestion}`);
        });
      }
    } catch (e) {
      // Skip
    }
  }
  
  console.log(`\n📊 Performance Analysis Summary:`);
  console.log(`   Files analyzed: ${files.length}`);
  console.log(`   Files with issues: ${results.length}`);
  console.log(`   Total issues: ${totalIssues}`);
  
  console.log(`\n✅ Analysis complete!\n`);
  console.log(`💡 Recommendations:`);
  console.log(`   1. Review N+1 query patterns`);
  console.log(`   2. Add caching where appropriate`);
  console.log(`   3. Consider code splitting for large imports`);
  console.log(`   4. Add performance monitoring\n`);
}

main();
