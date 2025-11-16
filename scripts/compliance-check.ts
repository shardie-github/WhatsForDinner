/**
 * Compliance Check Script
 * Validates privacy files, consent flows, and store compliance
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

interface ComplianceCheck {
  name: string;
  passed: boolean;
  message: string;
}

const checks: ComplianceCheck[] = [];

async function checkPrivacyManifest(): Promise<void> {
  const manifestPath = join(process.cwd(), 'apps/mobile/ios/PrivacyInfo.xcprivacy');
  
  if (!existsSync(manifestPath)) {
    checks.push({
      name: 'Privacy Manifest',
      passed: false,
      message: 'PrivacyInfo.xcprivacy not found',
    });
    return;
  }

  try {
    const content = await readFile(manifestPath, 'utf-8');
    
    // Basic validation
    const hasDataTypes = content.includes('NSPrivacyCollectedDataTypes');
    const hasAPITypes = content.includes('NSPrivacyAccessedAPITypes');
    const hasTracking = content.includes('NSPrivacyTracking');

    checks.push({
      name: 'Privacy Manifest',
      passed: hasDataTypes && hasAPITypes && hasTracking,
      message: hasDataTypes && hasAPITypes && hasTracking
        ? 'Privacy manifest is complete'
        : 'Privacy manifest is missing required sections',
    });
  } catch (error) {
    checks.push({
      name: 'Privacy Manifest',
      passed: false,
      message: `Error reading manifest: ${error}`,
    });
  }
}

async function checkDataSafetyJSON(): Promise<void> {
  const dataSafetyPath = join(process.cwd(), 'docs/PLAY_DATA_SAFETY_DRAFT.json');
  
  if (!existsSync(dataSafetyPath)) {
    checks.push({
      name: 'Data Safety JSON',
      passed: false,
      message: 'PLAY_DATA_SAFETY_DRAFT.json not found',
    });
    return;
  }

  try {
    const content = await readFile(dataSafetyPath, 'utf-8');
    const data = JSON.parse(content);

    const required = ['dataTypes', 'dataShared', 'dataSecurity'];
    const hasRequired = required.every(key => key in data);

    checks.push({
      name: 'Data Safety JSON',
      passed: hasRequired,
      message: hasRequired
        ? 'Data Safety JSON structure is valid'
        : 'Data Safety JSON is missing required fields',
    });
  } catch (error) {
    checks.push({
      name: 'Data Safety JSON',
      passed: false,
      message: `Error validating JSON: ${error}`,
    });
  }
}

async function checkLegalPages(): Promise<void> {
  const pages = [
    'apps/web/src/app/(marketing)/privacy/page.tsx',
    'apps/web/src/app/(marketing)/terms/page.tsx',
    'apps/web/src/app/(marketing)/subscriptions/page.tsx',
  ];

  const missing: string[] = [];

  for (const page of pages) {
    const path = join(process.cwd(), page);
    if (!existsSync(path)) {
      missing.push(page);
    }
  }

  checks.push({
    name: 'Legal Pages',
    passed: missing.length === 0,
    message: missing.length === 0
      ? 'All legal pages exist'
      : `Missing pages: ${missing.join(', ')}`,
  });
}

async function checkConsentFiles(): Promise<void> {
  const files = [
    'packages/analytics/consent/consentModel.ts',
    'packages/analytics/consent/consentStore.ts',
  ];

  const missing: string[] = [];

  for (const file of files) {
    const path = join(process.cwd(), file);
    if (!existsSync(path)) {
      missing.push(file);
    }
  }

  checks.push({
    name: 'Consent Files',
    passed: missing.length === 0,
    message: missing.length === 0
      ? 'All consent files exist'
      : `Missing files: ${missing.join(', ')}`,
  });
}

async function checkSubscriptionConfig(): Promise<void> {
  const configPath = join(process.cwd(), 'packages/config/src/subscriptions.ts');
  
  if (!existsSync(configPath)) {
    checks.push({
      name: 'Subscription Config',
      passed: false,
      message: 'subscriptions.ts not found',
    });
    return;
  }

  try {
    const content = await readFile(configPath, 'utf-8');
    
    const hasIOSSKUs = content.includes('com.nomad.premium.month');
    const hasAndroidSKUs = content.includes('nomad_premium_month');

    checks.push({
      name: 'Subscription Config',
      passed: hasIOSSKUs && hasAndroidSKUs,
      message: hasIOSSKUs && hasAndroidSKUs
        ? 'Subscription SKUs configured'
        : 'Missing SKU definitions',
    });
  } catch (error) {
    checks.push({
      name: 'Subscription Config',
      passed: false,
      message: `Error checking config: ${error}`,
    });
  }
}

async function main() {
  
  await checkPrivacyManifest();
  await checkDataSafetyJSON();
  await checkLegalPages();
  await checkConsentFiles();
  await checkSubscriptionConfig();

  // Print results
  const passed = checks.filter(c => c.passed).length;
  const total = checks.length;

  console.log(`\nCompliance Check Results: ${passed}/${total} passed`);
  
  for (const check of checks) {
    const icon = check.passed ? '✅' : '❌';
    const status = check.passed ? 'PASS' : 'FAIL';
    console.log(`${icon} ${check.name}: ${status}`);
  }

  console.log('');
  
  if (passed < total) {
    console.error('\n? Some compliance checks failed');
    process.exit(1);
  } else {
    console.log('\n✅ All compliance checks passed');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Error running compliance checks:', error);
  process.exit(1);
});
