/**
 * Release command - semantic release
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export async function runRelease(options: { dryRun?: boolean; skipTests?: boolean }) {
  console.log('🚀 Starting release process...\n');

  if (!options.skipTests) {
    console.log('1️⃣ Running tests...');
    try {
      execSync('pnpm test', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Tests failed. Aborting release.');
      process.exit(1);
    }
  }

  console.log('2️⃣ Running checks...');
  try {
    execSync('npm run ops check', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Checks failed. Aborting release.');
    process.exit(1);
  }

  console.log('3️⃣ Building...');
  try {
    execSync('pnpm build', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Build failed. Aborting release.');
    process.exit(1);
  }

  if (options.dryRun) {
    console.log('4️⃣ Dry run - would generate version and changelog');
    console.log('✅ Dry run complete. Use --no-dry-run to perform actual release.');
    return;
  }

  console.log('4️⃣ Determining version...');
  // Use semantic-release or simple version bump
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const currentVersion = packageJson.version;
    console.log(`   Current version: ${currentVersion}`);
    
    // Generate changelog
    console.log('5️⃣ Generating changelog...');
    execSync('npm run ops changelog', { stdio: 'inherit' });
    
    // Deploy to Vercel
    console.log('6️⃣ Deploying to Vercel...');
    execSync('vercel --prod', { stdio: 'inherit' });
    
    // Deploy to Supabase
    console.log('7️⃣ Deploying to Supabase...');
    if (fs.existsSync('supabase')) {
      execSync('supabase db push', { stdio: 'inherit' });
    }
    
    console.log('\n✅ Release complete!');
  } catch (error) {
    console.error('\n❌ Release failed:', error);
    process.exit(1);
  }
}
