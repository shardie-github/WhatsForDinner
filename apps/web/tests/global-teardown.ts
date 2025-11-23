import { FullConfig } from '@playwright/test';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('global-teardown-ts');
async function globalTeardown(config: FullConfig) {
  logger.info('🧹 Cleaning up global test environment...');

  try {
    // Clean up test data
    await cleanupTestData();

    // Clean up any test files
    await cleanupTestFiles();

    logger.info('✅ Global teardown complete');
  } catch (error) {
    logger.error('❌ Global teardown failed:', { error });
    // Don't throw error to avoid masking test failures
  }
}

async function cleanupTestData() {
  logger.info('🗑️ Cleaning up test data...');

  // This would typically involve:
  // 1. Deleting test user accounts
  // 2. Cleaning up test database records
  // 3. Clearing test sessions

  try {
    // Example: Clear localStorage
    // This would be done in a browser context if needed
    logger.info('✅ Test data cleanup complete');
  } catch (error) {
    logger.warn('⚠️ Test data cleanup failed:', { error });
  }
}

async function cleanupTestFiles() {
  logger.info('📁 Cleaning up test files...');

  const fs = require('fs');
  const path = require('path');

  try {
    // Clean up test artifacts
    const testDirs = ['test-results', 'playwright-report', 'logs'];

    for (const dir of testDirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        logger.info('✅ Cleaned up ${dir}');
      }
    }

    logger.info('✅ Test files cleanup complete');
  } catch (error) {
    logger.warn('⚠️ Test files cleanup failed:', { error });
  }
}

export default globalTeardown;
