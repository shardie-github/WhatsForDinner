/**
 * Store Pack - Generate Play Store + App Store manifests, icons, privacy labels
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('store-pack-ts');
const STORE_DIR = join(process.cwd(), 'ops', 'store');

function generateGooglePlayManifest(): string {
  return JSON.stringify({
    package: 'app.whatsfordinner',
    versionName: '1.0.0',
    versionCode: 1,
    minSdkVersion: 24,
    targetSdkVersion: 34,
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE'
    ],
    features: {
      'android.hardware.camera': false,
      'android.hardware.location': false
    }
  }, null, 2);
}

function generateAppStoreManifest(): string {
  return JSON.stringify({
    bundleId: 'app.whatsfordinner',
    version: '1.0.0',
    build: '1',
    platform: 'ios',
    minimumOSVersion: '13.0',
    capabilities: [],
    entitlements: {}
  }, null, 2);
}

function generatePrivacyLabels(): string {
  return `# Privacy Labels

## Data Collected

### Contact Information
- Email Address: Used for account creation and communication
- Name: Used for personalization

### Usage Data
- App Interactions: Used for analytics and improvement

### Diagnostics
- Crash Reports: Used for stability improvement

## Data Not Linked to User
- Analytics data is anonymized
- No third-party sharing

## Data Used to Track You
- None
`;
}

function generateLintChecklist(): string {
  return `# Store Submission Checklist

## Google Play Store
- [ ] Privacy policy URL set
- [ ] Data safety section completed
- [ ] App icons (all sizes)
- [ ] Screenshots (phone + tablet)
- [ ] Feature graphic
- [ ] Content rating completed
- [ ] Target audience set
- [ ] Pricing set

## Apple App Store
- [ ] Privacy policy URL set
- [ ] Privacy nutrition labels completed
- [ ] App icons (all sizes)
- [ ] Screenshots (all device sizes)
- [ ] App preview videos (optional)
- [ ] Age rating completed
- [ ] Pricing set
- [ ] App Store description
- [ ] Keywords
- [ ] Support URL
`;
}

async function generateStorePack(): Promise<void> {
  
  if (!existsSync(STORE_DIR)) {
    mkdirSync(STORE_DIR, { recursive: true });
  }

  // Google Play
  writeFileSync(join(STORE_DIR, 'google-play-manifest.json'), generateGooglePlayManifest());

  // App Store
  writeFileSync(join(STORE_DIR, 'app-store-manifest.json'), generateAppStoreManifest());

  // Privacy labels
  writeFileSync(join(STORE_DIR, 'privacy-labels.md'), generatePrivacyLabels());

  // Checklist
  writeFileSync(join(STORE_DIR, 'lint-checklist.md'), generateLintChecklist());

  }

if (require.main === module) {
  generateStorePack().catch(error => {
    logger.error('Failed to generate store pack:', { error });
    process.exit(1);
  });
}

export { generateStorePack };
