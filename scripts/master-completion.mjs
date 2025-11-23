#!/usr/bin/env node
/**
 * Master Completion Script
 * 
 * Orchestrates all remaining work:
 * 1. Console.log replacement
 * 2. Type safety improvements
 * 3. Security audit fixes
 * 4. Error handling standardization
 * 5. Test generation
 * 6. Performance optimization
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const TASKS = [
  {
    name: 'Console.log Replacement',
    script: 'comprehensive-console-log-replacement.mjs',
    args: ['--write'],
    description: 'Replace all console.log statements with logger',
  },
  {
    name: 'Type Safety Improvements',
    script: 'fix-any-types.mjs',
    args: ['--write'],
    description: 'Fix all any types',
  },
  {
    name: 'Security Audit',
    script: 'security-audit.mjs',
    args: [],
    description: 'Audit security issues',
  },
  {
    name: 'Error Handling Standardization',
    script: 'standardize-error-handling.mjs',
    args: ['--write'],
    description: 'Standardize error handling',
  },
];

function runTask(task) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running: ${task.name}`);
  console.log(`Description: ${task.description}`);
  console.log(`${'='.repeat(60)}\n`);
  
  try {
    const command = `node scripts/${task.script} ${task.args.join(' ')}`;
    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log(`✅ ${task.name} completed\n`);
    return { success: true, task: task.name };
  } catch (error) {
    console.error(`❌ ${task.name} failed:`, error.message);
    return { success: false, task: task.name, error: error.message };
  }
}

function main() {
  console.log('\n🚀 Master Completion Script');
  console.log('='.repeat(60));
  console.log('This script will run all completion tasks.\n');
  
  const results = [];
  
  for (const task of TASKS) {
    const result = runTask(task);
    results.push(result);
    
    // Small delay between tasks
    if (task !== TASKS[TASKS.length - 1]) {
      console.log('Waiting 2 seconds before next task...\n');
      // Simple delay
      const start = Date.now();
      while (Date.now() - start < 2000) {
        // Wait
      }
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Completion Summary');
  console.log('='.repeat(60) + '\n');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.task}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\nTotal: ${successful}/${results.length} tasks completed successfully\n`);
  
  if (failed > 0) {
    console.log('⚠️  Some tasks failed. Review errors above.\n');
    process.exit(1);
  } else {
    console.log('✅ All tasks completed successfully!\n');
  }
}

main();
