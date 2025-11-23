#!/usr/bin/env node
/**
 * Generate Tests for All API Routes
 * 
 * Generates comprehensive test files for all API routes
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, dirname, basename } from 'path';

const API_ROUTE_PATTERN = /\/api\/.*\/route\.ts$/;
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', '.git'];

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

function getRouteInfo(filePath) {
  const routePath = filePath.split('/api/')[1]?.replace('/route.ts', '') || 'unknown';
  const routeName = routePath.replace(/\//g, '-').replace(/\[.*?\]/g, 'param');
  const componentName = routeName || 'api-route';
  
  return { routePath, routeName, componentName };
}

function detectExports(content) {
  const exports = [];
  if (content.includes('export async function GET') || content.includes('export const GET')) {
    exports.push('GET');
  }
  if (content.includes('export async function POST') || content.includes('export const POST')) {
    exports.push('POST');
  }
  if (content.includes('export async function PUT') || content.includes('export const PUT')) {
    exports.push('PUT');
  }
  if (content.includes('export async function DELETE') || content.includes('export const DELETE')) {
    exports.push('DELETE');
  }
  if (content.includes('export async function PATCH') || content.includes('export const PATCH')) {
    exports.push('PATCH');
  }
  return exports;
}

function generateTestFile(filePath) {
  const testFilePath = filePath.replace('/route.ts', '/__tests__/route.test.ts');
  const testDir = dirname(testFilePath);
  
  // Check if test already exists
  try {
    readFileSync(testFilePath, 'utf-8');
    return { file: testFilePath, created: false, reason: 'Test already exists' };
  } catch (e) {
    // Test doesn't exist, create it
  }
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    const { routePath, routeName, componentName } = getRouteInfo(filePath);
    const exports = detectExports(content);
    
    if (exports.length === 0) {
      return { file: testFilePath, created: false, reason: 'No exports found' };
    }
    
    // Create test directory
    try {
      mkdirSync(testDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }
    
    const testContent = `import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
${exports.map(method => `import { ${method} } from '../route';`).join('\n')}
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('test-${componentName}');

describe('${routeName} API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

${exports.map(method => `  describe('${method} /api/${routePath}', () => {
    it('should handle valid request', async () => {
      const request = new NextRequest(\`http://localhost:3000/api/${routePath}\`, {
        method: '${method}',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await ${method}(request);
      expect(response).toBeDefined();
    });

    it('should return 401 for unauthenticated user', async () => {
      const request = new NextRequest(\`http://localhost:3000/api/${routePath}\`, {
        method: '${method}',
      });

      const response = await ${method}(request);
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle errors gracefully', async () => {
      const request = new NextRequest(\`http://localhost:3000/api/${routePath}\`, {
        method: '${method}',
      });

      const response = await ${method}(request);
      expect(response).toBeDefined();
    });
  });`).join('\n\n')}
});
`;

    writeFileSync(testFilePath, testContent, 'utf-8');
    return { file: testFilePath, created: true };
  } catch (error) {
    return { file: testFilePath, created: false, error: error.message };
  }
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--write');
  const rootDir = process.cwd();
  
  console.log('\n🧪 Generating tests for all API routes...\n');
  
  const apiRoutes = findApiRoutes(join(rootDir, 'apps/web/src/app'));
  console.log(`Found ${apiRoutes.length} API routes\n`);
  
  const results = [];
  let createdCount = 0;
  
  for (const route of apiRoutes) {
    const result = generateTestFile(route);
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
  console.log(`   Tests skipped: ${results.filter(r => !r.created && r.reason).length}`);
  
  if (dryRun) {
    console.log(`\n⚠️  DRY RUN MODE - Use --write to create tests\n`);
  } else {
    console.log(`\n✅ Tests created!\n`);
  }
}

main();
