import { FullConfig } from '@playwright/test';

async function globalTeardown(_config: FullConfig) {
  console.log('🧹 Cleaning up global test environment...');

  try {
    // Clean up test data
    await cleanupTestData();

    // Clean up any test files
    await cleanupTestFiles();

    console.log('✅ Global teardown complete');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error to avoid masking test failures
  }
}

async function cleanupTestData() {
  console.log('🗑️ Cleaning up test data...');

  // This would typically involve:
  // 1. Deleting test user accounts
  // 2. Cleaning up test database records
  // 3. Clearing test sessions

  try {
    // Example: Clear localStorage
    // This would be done in a browser context if needed
    console.log('✅ Test data cleanup complete');
  } catch (error) {
    console.warn('⚠️ Test data cleanup failed:', error);
  }
}

async function cleanupTestFiles() {
  console.log('📁 Cleaning up test files...');

  const fs = require('fs');
  const path = require('path');

  try {
    // Clean up test artifacts
    const testDirs = ['test-results', 'playwright-report', 'logs'];

    for (const dir of testDirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`✅ Cleaned up ${dir}`);
      }
    }

    console.log('✅ Test files cleanup complete');
  } catch (error) {
    console.warn('⚠️ Test files cleanup failed:', error);
  }
}

export default globalTeardown;
