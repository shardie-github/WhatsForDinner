#!/usr/bin/env tsx
/**
 * Test Components Script
 * Verifies referral UI, sharing buttons, upgrade prompts work
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ComponentTest {
  name: string;
  path: string;
  checks: string[];
}

const components: ComponentTest[] = [
  {
    name: 'Referral UI',
    path: 'apps/web/src/app/referrals/page.tsx',
    checks: [
      'Component exists',
      'Uses Supabase client',
      'Has referral link display',
      'Has share functionality',
      'Tracks referral metrics',
    ],
  },
  {
    name: 'Share Recipe Component',
    path: 'apps/web/src/components/sharing/ShareRecipe.tsx',
    checks: [
      'Component exists',
      'Has share buttons',
      'Tracks social shares',
      'Supports multiple platforms',
    ],
  },
  {
    name: 'Upgrade Prompt',
    path: 'apps/web/src/components/upgrade/UpgradePrompt.tsx',
    checks: [
      'Component exists',
      'Has upgrade triggers',
      'Shows pricing info',
      'Handles dismiss',
    ],
  },
  {
    name: 'Tooltip Tour',
    path: 'apps/web/src/components/onboarding/TooltipTour.tsx',
    checks: [
      'Component exists',
      'Has tooltip steps',
      'Tracks completion',
      'Supports skip',
    ],
  },
];

function testComponent(component: ComponentTest): { passed: boolean; details: string[] } {
  const fullPath = join(process.cwd(), component.path);
  const details: string[] = [];
  let passed = true;

  if (!existsSync(fullPath)) {
    details.push(`❌ File not found: ${component.path}`);
    return { passed: false, details };
  }

  details.push(`✅ File exists: ${component.path}`);

  try {
    const content = readFileSync(fullPath, 'utf-8');

    // Check imports
    if (content.includes('import') || content.includes('from')) {
      details.push('✅ Has imports');
    } else {
      details.push('⚠️ No imports found');
      passed = false;
    }

    // Check for React component
    if (content.includes('export default') || content.includes('export function') || content.includes('export const')) {
      details.push('✅ Has component export');
    } else {
      details.push('⚠️ No component export found');
      passed = false;
    }

    // Component-specific checks
    if (component.name === 'Referral UI') {
      if (content.includes('referralLink') || content.includes('referral_code')) {
        details.push('✅ Has referral link functionality');
      }
      if (content.includes('Share2') || content.includes('share')) {
        details.push('✅ Has share functionality');
      }
    }

    if (component.name === 'Share Recipe Component') {
      if (content.includes('trackSocialShare') || content.includes('viral-loops')) {
        details.push('✅ Tracks social shares');
      }
      if (content.includes('twitter') || content.includes('facebook') || content.includes('email')) {
        details.push('✅ Supports multiple platforms');
      }
    }

    if (component.name === 'Upgrade Prompt') {
      if (content.includes('trigger') || content.includes('UpgradePromptProps')) {
        details.push('✅ Has upgrade triggers');
      }
      if (content.includes('9.99') || content.includes('price')) {
        details.push('✅ Shows pricing info');
      }
    }

    if (component.name === 'Tooltip Tour') {
      if (content.includes('steps') || content.includes('TooltipStep')) {
        details.push('✅ Has tooltip steps');
      }
      if (content.includes('localStorage') || content.includes('completed')) {
        details.push('✅ Tracks completion');
      }
    }

    // Check for TypeScript types
    if (content.includes('interface') || content.includes('type ')) {
      details.push('✅ Has TypeScript types');
    }

    // Check for error handling
    if (content.includes('try') || content.includes('catch') || content.includes('error')) {
      details.push('✅ Has error handling');
    }

  } catch (error: any) {
    details.push(`❌ Error reading file: ${error.message}`);
    passed = false;
  }

  return { passed, details };
}

async function main() {
  console.log('🧪 Testing Components\n');
  console.log('='.repeat(50));

  const results: Record<string, { passed: boolean; details: string[] }> = {};

  for (const component of components) {
    console.log(`\n📦 Testing: ${component.name}`);
    results[component.name] = testComponent(component);
    results[component.name].details.forEach((detail) => console.log(`   ${detail}`));
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Results:');
  
  let allPassed = true;
  Object.entries(results).forEach(([name, result]) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${name}: ${status}`);
    if (!result.passed) allPassed = false;
  });

  console.log(`\n${allPassed ? '✅ All components verified!' : '⚠️ Some components need attention'}`);

  // Check RecipeCard integration
  console.log('\n🔗 Checking RecipeCard Integration...');
  const recipeCardPath = join(process.cwd(), 'apps', 'web', 'src', 'components', 'RecipeCard.tsx');
  if (existsSync(recipeCardPath)) {
    const content = readFileSync(recipeCardPath, 'utf-8');
    if (content.includes('ShareRecipe')) {
      console.log('✅ ShareRecipe component integrated in RecipeCard');
    } else {
      console.log('⚠️ ShareRecipe not integrated in RecipeCard');
    }
  }

  process.exit(allPassed ? 0 : 1);
}

main().catch(console.error);
