/**
 * Store pack generator
 */

import * as fs from 'fs';
import * as path from 'path';

export function generateStorePack() {
  const storeDir = path.join(process.cwd(), 'ops', 'store');
  if (!fs.existsSync(storeDir)) {
    fs.mkdirSync(storeDir, { recursive: true });
  }

  const googlePlayManifest = {
    package_name: 'com.whatsfordinner.app',
    version_code: 1,
    version_name: '1.0.0',
    min_sdk_version: 21,
    target_sdk_version: 34,
  };

  const appStoreManifest = {
    bundle_id: 'com.whatsfordinner.app',
    version: '1.0.0',
    build_number: 1,
    minimum_ios_version: '13.0',
  };

  fs.writeFileSync(
    path.join(storeDir, 'google-play-manifest.json'),
    JSON.stringify(googlePlayManifest, null, 2)
  );
  fs.writeFileSync(
    path.join(storeDir, 'app-store-manifest.json'),
    JSON.stringify(appStoreManifest, null, 2)
  );

  }
