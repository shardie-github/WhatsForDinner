#!/usr/bin/env node

import { readFileSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Bundle size budgets (in bytes)
const BUDGETS = {
  client: {
    warn: 250 * 1024, // 250 KB
    fail: 400 * 1024, // 400 KB
  },
  serverless: {
    warn: 1.2 * 1024 * 1024, // 1.2 MB
    fail: 1.5 * 1024 * 1024, // 1.5 MB
  },
  edge: {
    warn: 1.2 * 1024 * 1024, // 1.2 MB
    fail: 1.5 * 1024 * 1024, // 1.5 MB
  }
};

function getFileSize(filePath) {
  if (!existsSync(filePath)) {
    return 0;
  }
  return statSync(filePath).size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundle() {
  const results = {
    client: {},
    serverless: {},
    edge: {},
    total: 0,
    violations: []
  };

  // Check web app bundle
  const webAppPath = join(projectRoot, 'apps/web/.next');
  
  if (existsSync(webAppPath)) {
    // Client bundles
    const staticPath = join(webAppPath, 'static');
    if (existsSync(staticPath)) {
      const jsPath = join(staticPath, 'chunks');
      if (existsSync(jsPath)) {
        const files = readFileSync(jsPath, 'utf8').split('\n').filter(f => f.endsWith('.js'));
        let totalClientSize = 0;
        
        files.forEach(file => {
          const filePath = join(jsPath, file);
          const size = getFileSize(filePath);
          totalClientSize += size;
        });
        
        results.client = {
          size: totalClientSize,
          budget: BUDGETS.client,
          status: totalClientSize > BUDGETS.client.fail ? 'fail' : 
                  totalClientSize > BUDGETS.client.warn ? 'warn' : 'pass'
        };
        
        if (results.client.status !== 'pass') {
          results.violations.push({
            type: 'client',
            size: totalClientSize,
            budget: BUDGETS.client,
            message: `Client bundle size ${formatBytes(totalClientSize)} exceeds ${results.client.status === 'fail' ? 'failure' : 'warning'} threshold of ${formatBytes(BUDGETS.client[results.client.status])}`
          });
        }
      }
    }

    // Serverless bundles
    const serverlessPath = join(webAppPath, 'server');
    if (existsSync(serverlessPath)) {
      let totalServerlessSize = 0;
      const files = readFileSync(serverlessPath, 'utf8').split('\n').filter(f => f.endsWith('.js'));
      
      files.forEach(file => {
        const filePath = join(serverlessPath, file);
        totalServerlessSize += getFileSize(filePath);
      });
      
      results.serverless = {
        size: totalServerlessSize,
        budget: BUDGETS.serverless,
        status: totalServerlessSize > BUDGETS.serverless.fail ? 'fail' : 
                totalServerlessSize > BUDGETS.serverless.warn ? 'warn' : 'pass'
      };
      
      if (results.serverless.status !== 'pass') {
        results.violations.push({
          type: 'serverless',
          size: totalServerlessSize,
          budget: BUDGETS.serverless,
          message: `Serverless bundle size ${formatBytes(totalServerlessSize)} exceeds ${results.serverless.status === 'fail' ? 'failure' : 'warning'} threshold of ${formatBytes(BUDGETS.serverless[results.serverless.status])}`
        });
      }
    }

    // Edge bundles
    const edgePath = join(webAppPath, 'edge');
    if (existsSync(edgePath)) {
      let totalEdgeSize = 0;
      const files = readFileSync(edgePath, 'utf8').split('\n').filter(f => f.endsWith('.js'));
      
      files.forEach(file => {
        const filePath = join(edgePath, file);
        totalEdgeSize += getFileSize(filePath);
      });
      
      results.edge = {
        size: totalEdgeSize,
        budget: BUDGETS.edge,
        status: totalEdgeSize > BUDGETS.edge.fail ? 'fail' : 
                totalEdgeSize > BUDGETS.edge.warn ? 'warn' : 'pass'
      };
      
      if (results.edge.status !== 'pass') {
        results.violations.push({
          type: 'edge',
          size: totalEdgeSize,
          budget: BUDGETS.edge,
          message: `Edge bundle size ${formatBytes(totalEdgeSize)} exceeds ${results.edge.status === 'fail' ? 'failure' : 'warning'} threshold of ${formatBytes(BUDGETS.edge[results.edge.status])}`
        });
      }
    }
  }

  results.total = (results.client.size || 0) + (results.serverless.size || 0) + (results.edge.size || 0);

  return results;
}

function printReport(results) {
  console.log('\n📊 Bundle Size Report');
  console.log('===================\n');

  // Client bundle
  if (results.client.size) {
    const status = results.client.status === 'pass' ? '✅' : 
                   results.client.status === 'warn' ? '⚠️' : '❌';
    console.log(`${status} Client Bundle: ${formatBytes(results.client.size)}`);
    console.log(`   Budget: ${formatBytes(results.client.budget.warn)} (warn) / ${formatBytes(results.client.budget.fail)} (fail)`);
  }

  // Serverless bundle
  if (results.serverless.size) {
    const status = results.serverless.status === 'pass' ? '✅' : 
                   results.serverless.status === 'warn' ? '⚠️' : '❌';
    console.log(`${status} Serverless Bundle: ${formatBytes(results.serverless.size)}`);
    console.log(`   Budget: ${formatBytes(results.serverless.budget.warn)} (warn) / ${formatBytes(results.serverless.budget.fail)} (fail)`);
  }

  // Edge bundle
  if (results.edge.size) {
    const status = results.edge.status === 'pass' ? '✅' : 
                   results.edge.status === 'warn' ? '⚠️' : '❌';
    console.log(`${status} Edge Bundle: ${formatBytes(results.edge.size)}`);
    console.log(`   Budget: ${formatBytes(results.edge.budget.warn)} (warn) / ${formatBytes(results.edge.budget.fail)} (fail)`);
  }

  console.log(`\n📈 Total Bundle Size: ${formatBytes(results.total)}`);

  if (results.violations.length > 0) {
    console.log('\n🚨 Bundle Size Violations:');
    results.violations.forEach(violation => {
      console.log(`   • ${violation.message}`);
    });
  }

  return results;
}

function main() {
  const args = process.argv.slice(2);
  const checkBudgets = args.includes('--check-budgets');
  
  const results = analyzeBundle();
  printReport(results);

  if (checkBudgets) {
    const hasFailures = results.violations.some(v => v.budget.fail && v.size > v.budget.fail);
    if (hasFailures) {
      console.log('\n❌ Bundle size check failed!');
      process.exit(1);
    } else {
      console.log('\n✅ Bundle size check passed!');
    }
  }
}

main();