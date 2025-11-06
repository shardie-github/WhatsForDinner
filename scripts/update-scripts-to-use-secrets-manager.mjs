#!/usr/bin/env node
/**
 * Update scripts to use the unified secrets manager
 * 
 * This script helps migrate existing scripts from process.env to the unified secrets manager
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Scripts directory to update
const scriptsDir = join(projectRoot, 'scripts');
const opsDir = join(projectRoot, 'ops');

// Files to skip
const skipPatterns = [
  /node_modules/,
  /\.git/,
  /\.next/,
  /dist/,
  /build/,
  /coverage/,
  /secrets-manager-unified\.mjs$/, // Don't update the manager itself
];

// Patterns to find process.env usage
const envPattern = /process\.env\.([A-Z_][A-Z0-9_]*)/g;

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath) {
  return skipPatterns.every(pattern => !pattern.test(filePath)) &&
    (filePath.endsWith('.js') || filePath.endsWith('.mjs') || filePath.endsWith('.ts'));
}

/**
 * Get all script files
 */
function getScriptFiles(dir) {
  const files = [];
  
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...getScriptFiles(fullPath));
      } else if (entry.isFile() && shouldProcessFile(fullPath)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
  
  return files;
}

/**
 * Update a script file to use secrets manager
 */
function updateScriptFile(filePath, dryRun = false) {
  const content = readFileSync(filePath, 'utf8');
  
  // Skip if already using secrets manager
  if (content.includes('secrets-manager-unified') || content.includes('secretsManager')) {
    return { updated: false, reason: 'Already uses secrets manager' };
  }
  
  // Find all process.env usages
  const envVars = new Set();
  let match;
  while ((match = envPattern.exec(content)) !== null) {
    envVars.add(match[1]);
  }
  
  if (envVars.size === 0) {
    return { updated: false, reason: 'No process.env usage found' };
  }
  
  // Generate updated content
  const isESM = filePath.endsWith('.mjs') || content.includes('import ') || content.includes('export ');
  const importStatement = isESM
    ? "import { secretsManager } from './secrets-manager-unified.mjs';"
    : "const { secretsManager } = require('./secrets-manager-unified.mjs');";
  
  // Check if imports section exists
  const hasImportSection = content.includes('import ') || content.includes('require(');
  
  let updatedContent = content;
  
  // Add import if needed
  if (!content.includes('secrets-manager-unified')) {
    if (hasImportSection) {
      // Add after last import
      const lastImportMatch = content.match(/(import[^;]+;|require\([^)]+\)[^;]*;)/g);
      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport) + lastImport.length;
        updatedContent = 
          content.substring(0, lastImportIndex) + 
          '\n' + importStatement + 
          content.substring(lastImportIndex);
      }
    } else {
      // Add at the top
      updatedContent = importStatement + '\n\n' + content;
    }
  }
  
  // Replace process.env.KEY with await secretsManager.getSecret('KEY') || process.env.KEY
  // This provides a fallback to process.env for backward compatibility
  for (const envVar of envVars) {
    const oldPattern = new RegExp(`process\\.env\\.${envVar}\\b`, 'g');
    const isAsync = content.includes('async ') || content.includes('await ');
    
    // For async functions, use await
    if (isAsync) {
      updatedContent = updatedContent.replace(
        oldPattern,
        `(await secretsManager.getSecret('${envVar}')) || process.env.${envVar}`
      );
    } else {
      // For sync functions, we can't use await, so keep process.env but add comment
      // In production, these should be refactored to async
      updatedContent = updatedContent.replace(
        oldPattern,
        `process.env.${envVar} /* TODO: Migrate to secretsManager.getSecret('${envVar}') */`
      );
    }
  }
  
  if (!dryRun && updatedContent !== content) {
    writeFileSync(filePath, updatedContent, 'utf8');
    return { 
      updated: true, 
      envVars: Array.from(envVars),
      changes: updatedContent !== content
    };
  }
  
  return { 
    updated: dryRun, 
    envVars: Array.from(envVars),
    changes: updatedContent !== content,
    preview: updatedContent
  };
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const specificFile = args.find(arg => arg.endsWith('.js') || arg.endsWith('.mjs') || arg.endsWith('.ts'));
  
  console.log('🔄 Updating scripts to use unified secrets manager\n');
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }
  
  const files = specificFile 
    ? [join(projectRoot, specificFile)]
    : [...getScriptFiles(scriptsDir), ...getScriptFiles(opsDir)];
  
  const results = {
    updated: [],
    skipped: [],
    errors: [],
  };
  
  for (const file of files) {
    try {
      const result = updateScriptFile(file, dryRun);
      
      if (result.updated) {
        results.updated.push({
          file,
          envVars: result.envVars,
        });
        console.log(`✅ ${file}`);
        console.log(`   Updated ${result.envVars.length} env vars: ${result.envVars.join(', ')}`);
      } else if (result.changes) {
        console.log(`⚠️  ${file} (requires manual update)`);
        console.log(`   Env vars: ${result.envVars.join(', ')}`);
        console.log(`   Reason: ${result.reason || 'Contains sync code - needs async refactor'}`);
      } else {
        results.skipped.push({ file, reason: result.reason });
      }
    } catch (error) {
      results.errors.push({ file, error: error.message });
      console.error(`❌ ${file}: ${error.message}`);
    }
  }
  
  console.log('\n📊 Summary');
  console.log('==========');
  console.log(`Updated: ${results.updated.length}`);
  console.log(`Skipped: ${results.skipped.length}`);
  console.log(`Errors: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    process.exit(1);
  }
}

main();
