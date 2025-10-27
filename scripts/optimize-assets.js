#!/usr/bin/env node

/**
 * Asset Optimization Script
 * Optimizes images, fonts, and other assets
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AssetOptimizer {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.config = this.loadConfig();
  }

  async optimizeImages(options = {}) {
    const { format = 'webp', quality = 85, resize = false } = options;
    
    console.log(`🖼️  Optimizing images to ${format} format...`);
    
    const imageDirs = this.findImageDirectories();
    let optimizedCount = 0;
    
    for (const dir of imageDirs) {
      const images = this.findImagesInDirectory(dir);
      
      for (const image of images) {
        if (this.shouldOptimize(image, format)) {
          await this.optimizeImage(image, format, quality, resize);
          optimizedCount++;
        }
      }
    }
    
    console.log(`✅ Optimized ${optimizedCount} images`);
  }

  async optimizeImage(image, format, quality, resize) {
    const { path: imagePath, name } = image;
    const outputPath = path.join(
      path.dirname(imagePath),
      `${name}.${format}`
    );
    
    try {
      let command = `convert "${imagePath}" -quality ${quality}`;
      
      if (resize && image.size > this.config.maxSize) {
        command += ' -resize 1920x1080>';
      }
      
      command += ` "${outputPath}"`;
      
      execSync(command, { stdio: 'pipe' });
      console.log(`   ✓ ${path.basename(imagePath)} -> ${path.basename(outputPath)}`);
    } catch (error) {
      console.error(`   ✗ Failed to optimize ${path.basename(imagePath)}: ${error.message}`);
    }
  }

  shouldOptimize(image, targetFormat) {
    const { format, size } = image;
    const isOversized = size > this.config.maxSize;
    const needsFormatConversion = format !== targetFormat;
    const isOptimizableFormat = ['jpg', 'jpeg', 'png'].includes(format);
    
    return (needsFormatConversion || isOversized) && isOptimizableFormat;
  }

  findImageDirectories() {
    const imageDirs = [];
    const commonDirs = ['public', 'static', 'assets', 'images'];
    
    for (const dir of commonDirs) {
      const fullPath = path.join(this.workspaceRoot, dir);
      if (fs.existsSync(fullPath)) {
        imageDirs.push(fullPath);
      }
    }
    
    return imageDirs;
  }

  findImagesInDirectory(dir) {
    const images = [];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    
    this.walkDirectory(dir, (filePath, stat) => {
      const ext = path.extname(filePath).toLowerCase();
      if (imageExtensions.includes(ext)) {
        images.push({
          path: filePath,
          name: path.basename(filePath, ext),
          format: ext.substring(1),
          size: stat.size
        });
      }
    });
    
    return images;
  }

  walkDirectory(dir, callback) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.walkDirectory(fullPath, callback);
      } else {
        callback(fullPath, stat);
      }
    }
  }

  loadConfig() {
    const configPath = path.join(this.workspaceRoot, 'config', 'asset-formats.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    return {
      maxSize: 500000,
      quality: 85
    };
  }
}

// Run optimization
if (require.main === module) {
  const optimizer = new AssetOptimizer();
  const options = {
    format: process.argv[2] || 'webp',
    quality: parseInt(process.argv[3]) || 85,
    resize: process.argv.includes('--resize')
  };
  
  optimizer.optimizeImages(options).catch(console.error);
}

module.exports = AssetOptimizer;
