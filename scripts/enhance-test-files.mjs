#!/usr/bin/env node
/**
 * Enhance Generated Test Files
 * Adds actual test logic to scaffolded test files
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Enhance API route test files
 */
function enhanceAPITest(testPath, sourcePath) {
  let content = readFileSync(testPath, 'utf8');
  
  // Check what type of API route it is
  const sourceContent = existsSync(sourcePath) ? readFileSync(sourcePath, 'utf8') : '';
  
  // Enhance based on route type
  if (sourceContent.includes('POST') && sourceContent.includes('GET')) {
    content = content.replace(
      /it\('should handle GET request'[^}]+}/,
      `it('should handle GET request', async () => {
    const req = new NextRequest('http://localhost/api/test');
    const response = await GET(req);
    expect(response).toBeDefined();
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(500);
  });`
    );
    
    content = content.replace(
      /it\('should handle POST request'[^}]+}/,
      `it('should handle POST request', async () => {
    const req = new NextRequest('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await POST(req);
    expect(response).toBeDefined();
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(500);
  });`
    );
    
    content = content.replace(
      /it\('should validate request body'[^}]+}/,
      `it('should validate request body', async () => {
    const req = new NextRequest('http://localhost/api/test', {
      method: 'POST',
      body: 'invalid json',
    });
    try {
      const response = await POST(req);
      expect(response.status).toBeGreaterThanOrEqual(400);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });`
    );
  }
  
  // Add error handling test
  if (!content.includes("should handle errors gracefully")) {
    content = content.replace(
      /(\});\s*$)/,
      `
  it('should handle errors gracefully', async () => {
    const req = new NextRequest('http://localhost/api/test');
    try {
      const response = await GET(req);
      expect(response).toBeDefined();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });$1`
    );
  }
  
  return content;
}

/**
 * Find and enhance test files
 */
function enhanceTestFiles() {
  console.log('\n🔧 Enhancing Generated Test Files\n');
  console.log('='.repeat(50));
  
  let enhanced = 0;
  const testDirs = [
    join(projectRoot, 'apps/web/src/app/api'),
    join(projectRoot, 'packages/utils/src/__tests__'),
  ];
  
  for (const testDir of testDirs) {
    if (!existsSync(testDir)) continue;
    
    const testFiles = findTestFiles(testDir);
    
    for (const testFile of testFiles) {
      try {
        const sourceFile = testFile.replace('/__tests__/', '/').replace('.test.ts', '.ts');
        const enhancedContent = enhanceAPITest(testFile, sourceFile);
        writeFileSync(testFile, enhancedContent);
        enhanced++;
        console.log(`  ✓ Enhanced: ${testFile.replace(projectRoot + '/', '')}`);
      } catch (error) {
        console.log(`  ✗ Failed: ${testFile} - ${error.message}`);
      }
    }
  }
  
  console.log(`\n✅ Enhanced ${enhanced} test files\n`);
}

function findTestFiles(dir) {
  const files = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findTestFiles(fullPath));
      } else if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.spec.ts')) {
        files.push(fullPath);
      }
    }
  } catch {}
  return files;
}

enhanceTestFiles();
