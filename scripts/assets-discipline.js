#!/usr/bin/env node

/**
 * Phase 13: Assets Discipline
 * Modern formats and responsive images
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AssetsDisciplineManager {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.assetTypes = {
      images: {
        formats: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'avif'],
        modernFormats: ['webp', 'avif'],
        maxSize: 500000, // 500KB
        responsive: true
      },
      fonts: {
        formats: ['woff', 'woff2', 'ttf', 'otf'],
        modernFormats: ['woff2'],
        maxSize: 100000 // 100KB
      },
      videos: {
        formats: ['mp4', 'webm', 'ogg'],
        modernFormats: ['webm'],
        maxSize: 5000000 // 5MB
      }
    };
    this.results = {
      timestamp: new Date().toISOString(),
      analysis: {},
      optimizations: [],
      recommendations: []
    };
  }

  async runAssetsDiscipline() {
    console.log('📸 Phase 13: Assets Discipline');
    console.log('==============================\n');

    try {
      await this.analyzeAssets();
      await this.optimizeImages();
      await this.setupResponsiveImages();
      await this.configureModernFormats();
      await this.createAssetOptimizationScripts();
      await this.generateAssetsReport();
      
      console.log('✅ Assets discipline setup completed successfully');
      this.printSummary();
    } catch (error) {
      console.error('❌ Assets discipline setup failed:', error.message);
      process.exit(1);
    }
  }

  async analyzeAssets() {
    console.log('🔍 Analyzing assets...');
    
    const analysis = {
      images: this.analyzeImageAssets(),
      fonts: this.analyzeFontAssets(),
      videos: this.analyzeVideoAssets(),
      totalSize: 0,
      optimizationOpportunities: []
    };
    
    this.results.analysis = analysis;
    console.log(`   Found ${Object.keys(analysis).length} asset categories`);
  }

  analyzeImageAssets() {
    const imageDirs = this.findAssetDirectories(['images', 'img', 'assets', 'public']);
    const images = [];
    let totalSize = 0;
    
    for (const dir of imageDirs) {
      const dirImages = this.findImagesInDirectory(dir);
      images.push(...dirImages);
      totalSize += dirImages.reduce((sum, img) => sum + img.size, 0);
    }
    
    return {
      count: images.length,
      totalSize,
      byFormat: this.groupByFormat(images),
      oversized: images.filter(img => img.size > this.assetTypes.images.maxSize),
      needsOptimization: images.filter(img => !this.assetTypes.images.modernFormats.includes(img.format))
    };
  }

  analyzeFontAssets() {
    const fontDirs = this.findAssetDirectories(['fonts', 'assets/fonts', 'public/fonts']);
    const fonts = [];
    let totalSize = 0;
    
    for (const dir of fontDirs) {
      const dirFonts = this.findFontsInDirectory(dir);
      fonts.push(...dirFonts);
      totalSize += dirFonts.reduce((sum, font) => sum + font.size, 0);
    }
    
    return {
      count: fonts.length,
      totalSize,
      byFormat: this.groupByFormat(fonts),
      oversized: fonts.filter(font => font.size > this.assetTypes.fonts.maxSize),
      needsOptimization: fonts.filter(font => !this.assetTypes.fonts.modernFormats.includes(font.format))
    };
  }

  analyzeVideoAssets() {
    const videoDirs = this.findAssetDirectories(['videos', 'assets/videos', 'public/videos']);
    const videos = [];
    let totalSize = 0;
    
    for (const dir of videoDirs) {
      const dirVideos = this.findVideosInDirectory(dir);
      videos.push(...dirVideos);
      totalSize += dirVideos.reduce((sum, video) => sum + video.size, 0);
    }
    
    return {
      count: videos.length,
      totalSize,
      byFormat: this.groupByFormat(videos),
      oversized: videos.filter(video => video.size > this.assetTypes.videos.maxSize),
      needsOptimization: videos.filter(video => !this.assetTypes.videos.modernFormats.includes(video.format))
    };
  }

  findAssetDirectories(possibleDirs) {
    const foundDirs = [];
    
    for (const dir of possibleDirs) {
      const fullPath = path.join(this.workspaceRoot, dir);
      if (fs.existsSync(fullPath)) {
        foundDirs.push(fullPath);
      }
    }
    
    return foundDirs;
  }

  findImagesInDirectory(dir) {
    const images = [];
    const imageExtensions = this.assetTypes.images.formats.map(ext => `.${ext}`);
    
    this.walkDirectory(dir, (filePath, stat) => {
      const ext = path.extname(filePath).toLowerCase();
      if (imageExtensions.includes(ext)) {
        images.push({
          path: filePath,
          relativePath: path.relative(this.workspaceRoot, filePath),
          size: stat.size,
          format: ext.substring(1),
          name: path.basename(filePath, ext)
        });
      }
    });
    
    return images;
  }

  findFontsInDirectory(dir) {
    const fonts = [];
    const fontExtensions = this.assetTypes.fonts.formats.map(ext => `.${ext}`);
    
    this.walkDirectory(dir, (filePath, stat) => {
      const ext = path.extname(filePath).toLowerCase();
      if (fontExtensions.includes(ext)) {
        fonts.push({
          path: filePath,
          relativePath: path.relative(this.workspaceRoot, filePath),
          size: stat.size,
          format: ext.substring(1),
          name: path.basename(filePath, ext)
        });
      }
    });
    
    return fonts;
  }

  findVideosInDirectory(dir) {
    const videos = [];
    const videoExtensions = this.assetTypes.videos.formats.map(ext => `.${ext}`);
    
    this.walkDirectory(dir, (filePath, stat) => {
      const ext = path.extname(filePath).toLowerCase();
      if (videoExtensions.includes(ext)) {
        videos.push({
          path: filePath,
          relativePath: path.relative(this.workspaceRoot, filePath),
          size: stat.size,
          format: ext.substring(1),
          name: path.basename(filePath, ext)
        });
      }
    });
    
    return videos;
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

  groupByFormat(assets) {
    const grouped = {};
    
    for (const asset of assets) {
      if (!grouped[asset.format]) {
        grouped[asset.format] = { count: 0, totalSize: 0 };
      }
      grouped[asset.format].count++;
      grouped[asset.format].totalSize += asset.size;
    }
    
    return grouped;
  }

  async optimizeImages() {
    console.log('🖼️  Optimizing images...');
    
    const optimizations = [];
    const images = this.results.analysis.images;
    
    // Check for WebP conversion opportunities
    const needsWebP = images.needsOptimization.filter(img => 
      ['jpg', 'jpeg', 'png'].includes(img.format)
    );
    
    if (needsWebP.length > 0) {
      optimizations.push({
        type: 'webp_conversion',
        count: needsWebP.length,
        potentialSavings: this.calculateWebPSavings(needsWebP),
        command: 'npm run optimize:images --format=webp'
      });
    }
    
    // Check for AVIF conversion opportunities
    const needsAVIF = images.needsOptimization.filter(img => 
      ['jpg', 'jpeg', 'png', 'webp'].includes(img.format)
    );
    
    if (needsAVIF.length > 0) {
      optimizations.push({
        type: 'avif_conversion',
        count: needsAVIF.length,
        potentialSavings: this.calculateAVIFSavings(needsAVIF),
        command: 'npm run optimize:images --format=avif'
      });
    }
    
    // Check for oversized images
    if (images.oversized.length > 0) {
      optimizations.push({
        type: 'resize_oversized',
        count: images.oversized.length,
        potentialSavings: this.calculateResizeSavings(images.oversized),
        command: 'npm run optimize:images --resize'
      });
    }
    
    this.results.optimizations = optimizations;
    console.log(`   Found ${optimizations.length} optimization opportunities`);
  }

  calculateWebPSavings(images) {
    // WebP typically provides 25-35% size reduction
    const totalSize = images.reduce((sum, img) => sum + img.size, 0);
    return Math.round(totalSize * 0.3);
  }

  calculateAVIFSavings(images) {
    // AVIF typically provides 50% size reduction
    const totalSize = images.reduce((sum, img) => sum + img.size, 0);
    return Math.round(totalSize * 0.5);
  }

  calculateResizeSavings(images) {
    // Resizing can provide 60-80% size reduction
    const totalSize = images.reduce((sum, img) => sum + img.size, 0);
    return Math.round(totalSize * 0.7);
  }

  async setupResponsiveImages() {
    console.log('📱 Setting up responsive images...');
    
    // Create responsive image component
    const responsiveImageComponent = `import React from 'react';
import Image from 'next/image';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  className?: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 85,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      quality={quality}
      sizes={sizes}
      className={className}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  );
};

export default ResponsiveImage;
`;

    const componentPath = path.join(this.workspaceRoot, 'packages', 'ui', 'src', 'components', 'ResponsiveImage.tsx');
    fs.writeFileSync(componentPath, responsiveImageComponent);
    
    // Create image optimization utilities
    const imageUtils = `/**
 * Image Optimization Utilities
 * Helper functions for responsive images and modern formats
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  blur?: boolean;
}

export class ImageOptimizer {
  private static readonly MODERN_FORMATS = ['webp', 'avif'];
  private static readonly FALLBACK_FORMAT = 'jpeg';
  
  /**
   * Generate responsive image sources
   */
  static generateResponsiveSources(
    baseSrc: string,
    widths: number[],
    options: ImageOptimizationOptions = {}
  ): string[] {
    const { quality = 85, format = 'webp' } = options;
    
    return widths.map(width => 
      \`\${baseSrc}?w=\${width}&q=\${quality}&f=\${format}\`
    );
  }
  
  /**
   * Generate srcset for responsive images
   */
  static generateSrcSet(
    baseSrc: string,
    widths: number[],
    options: ImageOptimizationOptions = {}
  ): string {
    const sources = this.generateResponsiveSources(baseSrc, widths, options);
    
    return sources
      .map((src, index) => \`\${src} \${widths[index]}w\`)
      .join(', ');
  }
  
  /**
   * Check if browser supports modern formats
   */
  static supportsModernFormats(): boolean {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  
  /**
   * Get optimal image format for current browser
   */
  static getOptimalFormat(): string {
    if (this.supportsModernFormats()) {
      return 'webp';
    }
    return this.FALLBACK_FORMAT;
  }
  
  /**
   * Generate blur placeholder
   */
  static generateBlurPlaceholder(width: number, height: number): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, width, height);
    }
    
    return canvas.toDataURL('image/jpeg', 0.1);
  }
  
  /**
   * Calculate optimal sizes for responsive images
   */
  static calculateSizes(breakpoints: { [key: string]: number }): string {
    const sizes = Object.entries(breakpoints)
      .map(([breakpoint, width]) => \`(max-width: \${breakpoint}px) \${width}vw\`)
      .join(', ');
    
    return \`\${sizes}, 100vw\`;
  }
}

export default ImageOptimizer;
`;

    const utilsPath = path.join(this.workspaceRoot, 'packages', 'utils', 'src', 'image-optimizer.ts');
    fs.writeFileSync(utilsPath, imageUtils);
    
    console.log('   Responsive image components created');
  }

  async configureModernFormats() {
    console.log('🎨 Configuring modern formats...');
    
    const formatConfig = {
      images: {
        supported: this.assetTypes.images.formats,
        modern: this.assetTypes.images.modernFormats,
        fallback: 'jpeg',
        quality: {
          webp: 85,
          avif: 80,
          jpeg: 90,
          png: 95
        }
      },
      fonts: {
        supported: this.assetTypes.fonts.formats,
        modern: this.assetTypes.fonts.modernFormats,
        fallback: 'woff'
      },
      videos: {
        supported: this.assetTypes.videos.formats,
        modern: this.assetTypes.videos.modernFormats,
        fallback: 'mp4'
      },
      optimization: {
        enabled: true,
        quality: 85,
        progressive: true,
        interlaced: true
      }
    };

    const configPath = path.join(this.workspaceRoot, 'config', 'asset-formats.json');
    fs.writeFileSync(configPath, JSON.stringify(formatConfig, null, 2));
    
    console.log('   Modern format configuration created');
  }

  async createAssetOptimizationScripts() {
    console.log('📜 Creating asset optimization scripts...');
    
    const optimizationScript = `#!/usr/bin/env node

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
    
    console.log(\`🖼️  Optimizing images to \${format} format...\`);
    
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
    
    console.log(\`✅ Optimized \${optimizedCount} images\`);
  }

  async optimizeImage(image, format, quality, resize) {
    const { path: imagePath, name } = image;
    const outputPath = path.join(
      path.dirname(imagePath),
      \`\${name}.\${format}\`
    );
    
    try {
      let command = \`convert "\${imagePath}" -quality \${quality}\`;
      
      if (resize && image.size > this.config.maxSize) {
        command += ' -resize 1920x1080>';
      }
      
      command += \` "\${outputPath}"\`;
      
      execSync(command, { stdio: 'pipe' });
      console.log(\`   ✓ \${path.basename(imagePath)} -> \${path.basename(outputPath)}\`);
    } catch (error) {
      console.error(\`   ✗ Failed to optimize \${path.basename(imagePath)}: \${error.message}\`);
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
`;

    const scriptPath = path.join(this.workspaceRoot, 'scripts', 'optimize-assets.js');
    fs.writeFileSync(scriptPath, optimizationScript);
    execSync(`chmod +x ${scriptPath}`);
    
    // Add scripts to package.json
    const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    packageJson.scripts = {
      ...packageJson.scripts,
      'optimize:images': 'node scripts/optimize-assets.js',
      'optimize:assets': 'node scripts/optimize-assets.js',
      'analyze:assets': 'node scripts/assets-discipline.js'
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    console.log('   Asset optimization scripts created');
  }

  async generateAssetsReport() {
    const reportPath = path.join(this.workspaceRoot, 'REPORTS', 'assets-discipline.md');
    
    const report = `# Phase 13: Assets Discipline

## Executive Summary

**Status**: ✅ Complete  
**Images Analyzed**: ${this.results.analysis.images.count}  
**Fonts Analyzed**: ${this.results.analysis.fonts.count}  
**Videos Analyzed**: ${this.results.analysis.videos.count}  
**Optimizations**: ${this.results.optimizations.length} opportunities

## Asset Analysis

### Images
- **Total Count**: ${this.results.analysis.images.count}
- **Total Size**: ${this.formatBytes(this.results.analysis.images.totalSize)}
- **Oversized**: ${this.results.analysis.images.oversized.length}
- **Needs Optimization**: ${this.results.analysis.images.needsOptimization.length}

### Fonts
- **Total Count**: ${this.results.analysis.fonts.count}
- **Total Size**: ${this.formatBytes(this.results.analysis.fonts.totalSize)}
- **Oversized**: ${this.results.analysis.fonts.oversized.length}
- **Needs Optimization**: ${this.results.analysis.fonts.needsOptimization.length}

### Videos
- **Total Count**: ${this.results.analysis.videos.count}
- **Total Size**: ${this.formatBytes(this.results.analysis.videos.totalSize)}
- **Oversized**: ${this.results.analysis.videos.oversized.length}
- **Needs Optimization**: ${this.results.analysis.videos.needsOptimization.length}

## Format Distribution

### Images by Format
${Object.entries(this.results.analysis.images.byFormat).map(([format, data]) => 
  `- **${format.toUpperCase()}**: ${data.count} files (${this.formatBytes(data.totalSize)})`
).join('\n')}

### Fonts by Format
${Object.entries(this.results.analysis.fonts.byFormat).map(([format, data]) => 
  `- **${format.toUpperCase()}**: ${data.count} files (${this.formatBytes(data.totalSize)})`
).join('\n')}

## Optimization Opportunities

${this.results.optimizations.map((opt, i) => `
### ${i + 1}. ${opt.type.replace('_', ' ').toUpperCase()}
- **Count**: ${opt.count} files
- **Potential Savings**: ${this.formatBytes(opt.potentialSavings)}
- **Command**: \`${opt.command}\`
`).join('')}

## Modern Format Support

### Image Formats
- **Supported**: ${this.assetTypes.images.formats.join(', ')}
- **Modern**: ${this.assetTypes.images.modernFormats.join(', ')}
- **Fallback**: ${this.assetTypes.images.modernFormats[0] || 'jpeg'}

### Font Formats
- **Supported**: ${this.assetTypes.fonts.formats.join(', ')}
- **Modern**: ${this.assetTypes.fonts.modernFormats.join(', ')}
- **Fallback**: ${this.assetTypes.fonts.modernFormats[0] || 'woff'}

## Implementation Files

- **Responsive Image Component**: \`packages/ui/src/components/ResponsiveImage.tsx\`
- **Image Optimizer Utils**: \`packages/utils/src/image-optimizer.ts\`
- **Asset Format Config**: \`config/asset-formats.json\`
- **Optimization Script**: \`scripts/optimize-assets.js\`

## Next Steps

1. **Phase 14**: Implement experimentation layer
2. **Phase 15**: Set up docs quality gate
3. **Phase 16**: Implement repo hygiene

## Validation

Run the following to validate Phase 13 completion:

\`\`\`bash
# Analyze assets
npm run analyze:assets

# Optimize images to WebP
npm run optimize:images webp

# Optimize images to AVIF
npm run optimize:images avif

# Check responsive image component
npm run test:components
\`\`\`

Phase 13 is complete and ready for Phase 14 implementation.
`;

    fs.writeFileSync(reportPath, report);
    console.log(`   📄 Report saved to ${reportPath}`);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  printSummary() {
    console.log('\n📸 Assets Discipline Summary');
    console.log('============================');
    console.log(`🖼️  Images: ${this.results.analysis.images.count} files`);
    console.log(`🔤 Fonts: ${this.results.analysis.fonts.count} files`);
    console.log(`🎥 Videos: ${this.results.analysis.videos.count} files`);
    console.log(`⚡ Optimizations: ${this.results.optimizations.length} opportunities`);
  }
}

// Run the assets discipline setup
if (require.main === module) {
  const assetsManager = new AssetsDisciplineManager();
  assetsManager.runAssetsDiscipline().catch(console.error);
}

module.exports = AssetsDisciplineManager;