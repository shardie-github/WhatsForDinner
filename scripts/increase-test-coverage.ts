#!/usr/bin/env tsx
/**
 * Test Coverage Increase Script
 * Identifies gaps and generates test scaffolding for critical paths
 */

import fs from 'fs';
import path from 'path';

interface TestGap {
  file: string;
  type: 'unit' | 'integration' | 'e2e';
  priority: 'critical' | 'high' | 'medium';
  description: string;
}

const CRITICAL_PATHS: TestGap[] = [
  {
    file: 'apps/web/src/app/onboarding',
    type: 'e2e',
    priority: 'critical',
    description: 'Onboarding flow - user activation critical path',
  },
  {
    file: 'apps/web/src/lib/meal-planning',
    type: 'unit',
    priority: 'critical',
    description: 'Meal planning generation - core functionality',
  },
  {
    file: 'apps/web/src/lib/grocery-list',
    type: 'unit',
    priority: 'critical',
    description: 'Grocery list creation - core functionality',
  },
  {
    file: 'apps/web/src/app/api/billing',
    type: 'integration',
    priority: 'critical',
    description: 'Payment processing - revenue critical',
  },
  {
    file: 'apps/web/src/app/api/revenue',
    type: 'integration',
    priority: 'high',
    description: 'Revenue tracking - monetization critical',
  },
  {
    file: 'apps/web/src/app/api/activation',
    type: 'integration',
    priority: 'high',
    description: 'Activation tracking - growth critical',
  },
];

function generateTestScaffold(gap: TestGap) {
  const testDir = path.dirname(gap.file);
  const fileName = path.basename(gap.file);
  const testFileName = `${fileName}.test.ts`;
  const testPath = path.join(testDir, '__tests__', testFileName);

  // Determine test framework based on type
  const isE2E = gap.type === 'e2e';
  const framework = isE2E ? 'playwright' : 'vitest';

  let testContent = '';
  
  if (isE2E) {
    testContent = `import { test, expect } from '@playwright/test';

test.describe('${gap.description}', () => {
  test('should complete ${gap.description.toLowerCase()}', async ({ page }) => {
    // TODO: Implement E2E test
    await page.goto('/');
    // Add test steps here
  });
});
`;
  } else {
    testContent = `import { describe, it, expect, beforeEach } from 'vitest';

describe('${gap.description}', () => {
  beforeEach(() => {
    // Setup
  });

  it('should ${gap.description.toLowerCase()}', () => {
    // TODO: Implement test
    expect(true).toBe(true);
  });
});
`;
  }

  return { testPath, testContent };
}

async function findMissingTests() {
  const gaps: Array<TestGap & { testPath: string; testContent: string }> = [];

  for (const gap of CRITICAL_PATHS) {
    // Check if test already exists
    const testDir = path.join(process.cwd(), path.dirname(gap.file), '__tests__');
    const testFileName = path.basename(gap.file).replace(/\.(ts|tsx)$/, '') + '.test.ts';
    const testPath = path.join(testDir, testFileName);
    
    if (!fs.existsSync(testPath)) {
      const scaffold = generateTestScaffold(gap);
      gaps.push({ ...gap, ...scaffold });
    }
  }

  return gaps;
}

async function createTestFiles(gaps: Array<TestGap & { testPath: string; testContent: string }>) {
  const created: string[] = [];

  for (const gap of gaps) {
    const testDir = path.dirname(gap.testPath);
    fs.mkdirSync(testDir, { recursive: true });

    if (!fs.existsSync(gap.testPath)) {
      fs.writeFileSync(gap.testPath, gap.testContent);
      created.push(gap.testPath);
      console.log(`  ✅ Created: ${gap.testPath}`);
    }
  }

  return created;
}

async function generateCoverageReport() {
  const report = {
    generated: new Date().toISOString(),
    target: '80%',
    criticalPaths: CRITICAL_PATHS.map(gap => ({
      file: gap.file,
      type: gap.type,
      priority: gap.priority,
      description: gap.description,
    })),
    nextSteps: [
      'Run: pnpm test:coverage to see current coverage',
      'Implement tests for critical paths',
      'Focus on onboarding, meal planning, grocery list, and payment flows',
      'Add integration tests for API endpoints',
      'Add E2E tests for user journeys',
    ],
  };

  const reportPath = path.join(process.cwd(), 'reports', 'test-coverage-plan.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  return reportPath;
}

async function main() {
  console.log('🧪 Test Coverage Increase - Generating Test Scaffolding\n');

  // Find missing tests
  console.log('📊 Analyzing test coverage gaps...');
  const gaps = await findMissingTests();

  if (gaps.length === 0) {
    console.log('  ✅ All critical paths have tests!');
  } else {
    console.log(`  ⚠️  Found ${gaps.length} critical paths without tests`);
    
    // Group by priority
    const critical = gaps.filter(g => g.priority === 'critical');
    const high = gaps.filter(g => g.priority === 'high');
    
    console.log(`\n  Critical: ${critical.length}`);
    console.log(`  High: ${high.length}`);

    // Create test files
    console.log('\n📝 Creating test scaffolding...');
    const created = await createTestFiles(gaps);
    console.log(`\n  ✅ Created ${created.length} test files`);
  }

  // Generate coverage report
  const reportPath = await generateCoverageReport();
  console.log(`\n📄 Coverage plan saved to ${reportPath}`);

  console.log('\n📋 Next steps:');
  console.log('   1. Run: pnpm test:coverage');
  console.log('   2. Implement tests for critical paths');
  console.log('   3. Focus on onboarding, meal planning, grocery list, payment');
  console.log('   4. Add integration tests for API endpoints');
  console.log('   5. Add E2E tests for user journeys');
  console.log('   6. Target: 80%+ coverage');
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Test coverage scaffolding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed to generate test scaffolding:', error);
      process.exit(1);
    });
}

export { findMissingTests, generateTestScaffold, CRITICAL_PATHS };
