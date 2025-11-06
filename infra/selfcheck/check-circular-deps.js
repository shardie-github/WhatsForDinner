#!/usr/bin/env node
/**
 * Checks for circular dependencies in the codebase
 * Uses a simple DFS approach to detect cycles in the dependency graph
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');

// Directories to check
const CHECK_DIRS = [
  'packages',
  'apps'
];

function findTypeScriptFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next') {
      continue;
    }
    
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      findTypeScriptFiles(fullPath, fileList);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      fileList.push(fullPath);
    }
  }
  
  return fileList;
}

function extractImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = [];
  
  // Match import statements
  const importRegex = /import\s+(?:.*\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    let importPath = match[1];
    
    // Skip node_modules imports
    if (importPath.startsWith('.') || importPath.startsWith('/')) {
      // Resolve relative imports
      const dir = path.dirname(filePath);
      const resolved = path.resolve(dir, importPath);
      
      // Check if it's within workspace
      if (resolved.startsWith(WORKSPACE_ROOT)) {
        imports.push(resolved);
      }
    }
  }
  
  return imports;
}

function buildDependencyGraph() {
  const graph = new Map();
  const files = [];
  
  // Collect all TypeScript files
  for (const dir of CHECK_DIRS) {
    const dirPath = path.join(WORKSPACE_ROOT, dir);
    if (fs.existsSync(dirPath)) {
      files.push(...findTypeScriptFiles(dirPath));
    }
  }
  
  // Build graph
  for (const file of files) {
    if (!graph.has(file)) {
      graph.set(file, []);
    }
    
    const imports = extractImports(file);
    for (const imported of imports) {
      // Find the actual file (handle .ts/.tsx extensions)
      let importedFile = imported;
      if (!fs.existsSync(importedFile)) {
        // Try with extensions
        if (fs.existsSync(importedFile + '.ts')) {
          importedFile = importedFile + '.ts';
        } else if (fs.existsSync(importedFile + '.tsx')) {
          importedFile = importedFile + '.tsx';
        } else {
          continue; // Skip if file not found
        }
      }
      
      if (graph.has(importedFile)) {
        graph.get(file).push(importedFile);
      }
    }
  }
  
  return graph;
}

function detectCycles(graph) {
  const visited = new Set();
  const recStack = new Set();
  const cycles = [];
  
  function dfs(node, path) {
    if (recStack.has(node)) {
      // Found a cycle
      const cycleStart = path.indexOf(node);
      const cycle = path.slice(cycleStart).concat([node]);
      cycles.push(cycle);
      return;
    }
    
    if (visited.has(node)) {
      return;
    }
    
    visited.add(node);
    recStack.add(node);
    
    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      dfs(neighbor, [...path, node]);
    }
    
    recStack.delete(node);
  }
  
  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      dfs(node, []);
    }
  }
  
  return cycles;
}

function validateCircularDeps() {
    
  const graph = buildDependencyGraph();
    
  const cycles = detectCycles(graph);
  
  if (cycles.length > 0) {
    console.error('❌ Found circular dependencies:');
    cycles.forEach((cycle, index) => {
      console.error(`\n   Cycle ${index + 1}:`);
      cycle.forEach((file, i) => {
        const relPath = path.relative(WORKSPACE_ROOT, file);
        const arrow = i < cycle.length - 1 ? ' → ' : ' ↻ ';
        process.stdout.write(`   ${relPath}${arrow}`);
      });
    });
    console.error('');
    console.error('⚠️  Circular dependencies can cause runtime errors and make testing difficult.');
    console.error('   Please refactor to remove these cycles.');
    process.exit(1);
  }
  
    return true;
}

// Main
try {
  validateCircularDeps();
    process.exit(0);
} catch (error) {
  console.error('❌ Circular dependency check failed:', error.message);
  process.exit(1);
}
