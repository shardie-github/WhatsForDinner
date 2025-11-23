/**
 * Release command - semantic release
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('release-ts');
export async function runRelease(options: { dryRun?: boolean; skipTests?: boolean }) {
  
  if (!options.skipTests) {
        try {
      execSync('pnpm test', { stdio: 'inherit' });
    } catch (error) {
      logger.error('❌ Tests failed. Aborting release.');
      process.exit(1);
    }
  }

    try {
    execSync('npm run ops check', { stdio: 'inherit' });
  } catch (error) {
    logger.error('❌ Checks failed. Aborting release.');
    process.exit(1);
  }

    try {
    execSync('pnpm build', { stdio: 'inherit' });
  } catch (error) {
    logger.error('❌ Build failed. Aborting release.');
    process.exit(1);
  }

  if (options.dryRun) {
            return;
  }

    // Use semantic-release or simple version bump
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const currentVersion = packageJson.version;
        
    // Generate changelog
        execSync('npm run ops changelog', { stdio: 'inherit' });
    
    // Deploy to Vercel
        execSync('vercel --prod', { stdio: 'inherit' });
    
    // Deploy to Supabase
        if (fs.existsSync('supabase')) {
      execSync('supabase db push', { stdio: 'inherit' });
    }
    
      } catch (error) {
    logger.error('\n❌ Release failed:', { error });
    process.exit(1);
  }
}
