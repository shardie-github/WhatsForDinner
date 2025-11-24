#!/usr/bin/env node
/**
 * Generate app icons from SVG source
 * Creates all required densities for iOS and Android
 */

import * as fs from 'fs';
import * as path from 'path';
import { createComponentLogger } from '@whats-for-dinner/utils';

// Note: This script requires a tool like sharp or jimp to convert SVG to PNG
// For now, this is a placeholder structure

const logger = createComponentLogger('generate-icons-ts');
const ICON_SOURCE = path.join(__dirname, '../ops/branding/appicon.svg');
const OUTPUT_DIR = path.join(__dirname, '../apps/web/public/icons');

interface IconConfig {
  name: string;
  size: number;
  platform: 'ios' | 'android' | 'both';
}

const ANDROID_ICONS: IconConfig[] = [
  { name: 'mipmap-mdpi/ic_launcher', size: 48, platform: 'android' },
  { name: 'mipmap-hdpi/ic_launcher', size: 72, platform: 'android' },
  { name: 'mipmap-xhdpi/ic_launcher', size: 96, platform: 'android' },
  { name: 'mipmap-xxhdpi/ic_launcher', size: 144, platform: 'android' },
  { name: 'mipmap-xxxhdpi/ic_launcher', size: 192, platform: 'android' },
];

const IOS_ICONS: IconConfig[] = [
  { name: 'AppIcon-20@2x', size: 40, platform: 'ios' },
  { name: 'AppIcon-20@3x', size: 60, platform: 'ios' },
  { name: 'AppIcon-29@2x', size: 58, platform: 'ios' },
  { name: 'AppIcon-29@3x', size: 87, platform: 'ios' },
  { name: 'AppIcon-40@2x', size: 80, platform: 'ios' },
  { name: 'AppIcon-40@3x', size: 120, platform: 'ios' },
  { name: 'AppIcon-60@2x', size: 120, platform: 'ios' },
  { name: 'AppIcon-60@3x', size: 180, platform: 'ios' },
  { name: 'AppIcon-76', size: 76, platform: 'ios' },
  { name: 'AppIcon-76@2x', size: 152, platform: 'ios' },
  { name: 'AppIcon-83.5@2x', size: 167, platform: 'ios' },
  { name: 'AppIcon-1024', size: 1024, platform: 'ios' },
];

async function generateIcons() {
      
  // Check if source exists
  if (!fs.existsSync(ICON_SOURCE)) {
    logger.error('Source SVG not found: ${ICON_SOURCE}');
    process.exit(1);
  }

  // Create output directories
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    // Try to use sharp if available, otherwise log instructions
    let sharp: any;
    try {
      sharp = await import('sharp');
    } catch {
      logger.warn('sharp not installed. Install with: pnpm add -D sharp');
      logger.info('Icon generation requires sharp. Creating placeholder structure...');
      
      // Create placeholder files
      for (const icon of [...ANDROID_ICONS, ...IOS_ICONS]) {
        const iconPath = path.join(OUTPUT_DIR, `${icon.name}.png`);
        const iconDir = path.dirname(iconPath);
        if (!fs.existsSync(iconDir)) {
          fs.mkdirSync(iconDir, { recursive: true });
        }
        // Create a placeholder file
        if (!fs.existsSync(iconPath)) {
          fs.writeFileSync(iconPath, '');
        }
      }
      logger.info('Placeholder icon structure created. Install sharp to generate actual icons.');
      return;
    }

    // Read SVG source
    const svgBuffer = fs.readFileSync(ICON_SOURCE);
    
    // Generate all Android icons
    for (const icon of ANDROID_ICONS) {
      const iconPath = path.join(OUTPUT_DIR, `${icon.name}.png`);
      const iconDir = path.dirname(iconPath);
      if (!fs.existsSync(iconDir)) {
        fs.mkdirSync(iconDir, { recursive: true });
      }
      
      await sharp(svgBuffer)
        .resize(icon.size, icon.size)
        .png()
        .toFile(iconPath);
      
      logger.info(`Generated: ${icon.name} (${icon.size}x${icon.size})`);
    }
    
    // Generate all iOS icons
    for (const icon of IOS_ICONS) {
      const iconPath = path.join(OUTPUT_DIR, `${icon.name}.png`);
      const iconDir = path.dirname(iconPath);
      if (!fs.existsSync(iconDir)) {
        fs.mkdirSync(iconDir, { recursive: true });
      }
      
      await sharp(svgBuffer)
        .resize(icon.size, icon.size)
        .png()
        .toFile(iconPath);
      
      logger.info(`Generated: ${icon.name} (${icon.size}x${icon.size})`);
    }
    
    logger.info('✅ All icons generated successfully');
  } catch (error) {
    logger.error('Error generating icons:', { error });
    throw error;
  }
}

if (require.main === module) {
  generateIcons().catch(console.error);
}

export { generateIcons };
