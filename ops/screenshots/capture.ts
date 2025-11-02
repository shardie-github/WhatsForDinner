#!/usr/bin/env node
/**
 * Automated Screenshot Capture for Store Listings
 * Uses Playwright to capture screenshots at required resolutions
 */

import { chromium, devices } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface ScreenshotConfig {
  name: string;
  width: number;
  height: number;
  device?: string;
  outputPath: string;
}

const SCREENSHOTS = {
  // Google Play Store Requirements
  play: {
    phone: [
      { name: 'phone-1', width: 1080, height: 1920 },
      { name: 'phone-2', width: 1080, height: 1920 },
      { name: 'phone-3', width: 1080, height: 1920 },
      { name: 'phone-4', width: 1080, height: 1920 },
      { name: 'phone-5', width: 1080, height: 1920 },
      { name: 'phone-6', width: 1080, height: 1920 },
    ],
    tablet: [
      { name: 'tablet-1', width: 1200, height: 1920 },
      { name: 'tablet-2', width: 1200, height: 1920 },
    ],
    featureGraphic: { width: 1024, height: 500 },
  },
  // App Store Requirements
  appstore: {
    iphone: [
      { name: 'iphone-65', width: 1242, height: 2688 }, // 6.5"
      { name: 'iphone-67', width: 1290, height: 2796 }, // 6.7"
    ],
    ipad: [
      { name: 'ipad-129', width: 2048, height: 2732 }, // 12.9"
    ],
  },
};

const BASE_URL = process.env.SCREENSHOT_BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '../../ops/store');

async function captureScreenshot(
  browser: any,
  url: string,
  config: ScreenshotConfig
) {
  console.log(`Capturing ${config.name} (${config.width}x${config.height})...`);
  
  const context = await browser.newContext({
    viewport: { width: config.width, height: config.height },
    deviceScaleFactor: 2, // Retina quality
  });
  
  const page = await context.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for any animations/transitions
    await page.waitForTimeout(1000);
    
    // Screenshot
    const outputFile = path.join(OUTPUT_DIR, config.outputPath);
    const outputDir = path.dirname(outputFile);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    await page.screenshot({
      path: outputFile,
      fullPage: false,
    });
    
    console.log(`? Saved: ${outputFile}`);
  } catch (error) {
    console.error(`? Failed to capture ${config.name}:`, error);
  } finally {
    await context.close();
  }
}

async function captureScreenshots() {
  console.log('Starting screenshot capture...');
  console.log(`Base URL: ${BASE_URL}`);
  
  const browser = await chromium.launch({ headless: true });
  
  try {
    // Capture Google Play screenshots
    const playPhoneDir = 'google-play/metadata/images/phoneScreenshots';
    for (const config of SCREENSHOTS.play.phone) {
      await captureScreenshot(browser, `${BASE_URL}/`, {
        ...config,
        outputPath: `${playPhoneDir}/${config.name}.png`,
      });
    }
    
    const playTabletDir = 'google-play/metadata/images/tabletScreenshots';
    for (const config of SCREENSHOTS.play.tablet) {
      await captureScreenshot(browser, `${BASE_URL}/`, {
        ...config,
        outputPath: `${playTabletDir}/${config.name}.png`,
      });
    }
    
    // Feature graphic
    await captureScreenshot(browser, `${BASE_URL}/`, {
      name: 'feature-graphic',
      width: SCREENSHOTS.play.featureGraphic.width,
      height: SCREENSHOTS.play.featureGraphic.height,
      outputPath: 'google-play/metadata/images/featureGraphic.png',
    });
    
    // Capture App Store screenshots
    const appstorePhoneDir = 'app-store/metadata/screenshots/iphone';
    for (const config of SCREENSHOTS.appstore.iphone) {
      await captureScreenshot(browser, `${BASE_URL}/`, {
        ...config,
        outputPath: `${appstorePhoneDir}/${config.name}.png`,
      });
    }
    
    const appstoreTabletDir = 'app-store/metadata/screenshots/ipad';
    for (const config of SCREENSHOTS.appstore.ipad) {
      await captureScreenshot(browser, `${BASE_URL}/`, {
        ...config,
        outputPath: `${appstoreTabletDir}/${config.name}.png`,
      });
    }
    
    console.log('\n? All screenshots captured successfully!');
  } catch (error) {
    console.error('Error capturing screenshots:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  captureScreenshots().catch(console.error);
}

export { captureScreenshots };
