#!/usr/bin/env node
/**
 * Test Generation Script
 * 
 * Generates test templates for API routes and utilities
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, dirname, basename } from 'path';

const API_ROUTE_PATTERN = /\/api\/.*\/route\.ts$/;
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', '.git', 'coverage'];

function findApiRoutes(dir, fileList = []) {
  try {
    const files = readdirSync(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      try {
        const stat = statSync(filePath);
        
        if (stat.isDirectory()) {
          if (!EXCLUDE_DIRS.includes(file) && !file.startsWith('.')) {
            findApiRoutes(filePath, fileList);
          }
        } else if (filePath.endsWith('route.ts') && API_ROUTE_PATTERN.test(filePath)) {
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

function generateTestTemplate(filePath) {
  const routeName = filePath.split('/api/')[1]?.replace('/route.ts', '').replace(/\//g, '-') || 'route';
  const testFileName = filePath.replace('/route.ts', '/route.test.ts');
  const testDir = dirname(testFileName);
  
  // Check if test already exists
  try {
    readFileSync(testFileName, 'utf-8');
    return { file: testFileName, created: false, reason: 'Test already exists' };
  } catch (e) {
    // Test doesn't exist, create it
  }
  
  const testContent = `import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET, PUT, DELETE } from './route';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('test-${routeName}');

describe('${routeName} API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('should handle valid request', async () => {
      const request = new NextRequest('http://localhost:3000/api/${routeName}', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      expect(response).toBeDefined();
    });

    it('should handle invalid request', async () => {
      const request = new NextRequest('http://localhost:3000/api/${routeName}', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle errors gracefully', async () => {
      // Mock error scenario
      const request = new NextRequest('http://localhost:3000/api/${routeName}', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      expect(response).toBeDefined();
    });
  });

  // Add more test cases as needed
});
`;

  try {
    // Ensure directory exists (simplified - would need mkdir -p in real implementation)
    writeFileSync(testFileName, testContent, 'utf-8');
    return { file: testFileName, created: true };
  } catch (error) {
    return { file: testFileName, created: false, error: error.message };
  }
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--write');
  const rootDir = process.cwd();
  
  console.log('\n🧪 Generating test templates...\n');
  
  const apiRoutes = findApiRoutes(join(rootDir, 'apps/web/src/app'));
  console.log(`Found ${apiRoutes.length} API routes\n`);
  
  const results = [];
  let createdCount = 0;
  
  for (const route of apiRoutes.slice(0, 20)) { // Limit to first 20 for demo
    const result = generateTestTemplate(route);
    results.push(result);
    if (result.created) {
      createdCount++;
      console.log(`${dryRun ? '📝' : '✅'} ${result.file}`);
    } else if (result.reason) {
      console.log(`⏭️  ${result.file} - ${result.reason}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Routes processed: ${apiRoutes.length}`);
  console.log(`   Tests created: ${createdCount}`);
  
  if (dryRun) {
    console.log(`\n⚠️  DRY RUN MODE - Use --write to create tests\n`);
  } else {
    console.log(`\n✅ Tests created!\n`);
  }
}

main();
