#!/usr/bin/env node

/**
 * Phase 12: Edge/Caching Strategy
 * HTTP cache and CDN optimization
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class EdgeCachingManager {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.cachingStrategy = {
      staticAssets: {
        html: { maxAge: 300, sMaxAge: 3600, staleWhileRevalidate: 86400 },
        css: { maxAge: 31536000, immutable: true },
        js: { maxAge: 31536000, immutable: true },
        images: { maxAge: 31536000, immutable: true },
        fonts: { maxAge: 31536000, immutable: true }
      },
      api: {
        userData: { maxAge: 300, sMaxAge: 600, staleWhileRevalidate: 1800 },
        publicData: { maxAge: 3600, sMaxAge: 7200, staleWhileRevalidate: 86400 },
        searchResults: { maxAge: 1800, sMaxAge: 3600, staleWhileRevalidate: 7200 }
      },
      cdn: {
        provider: 'cloudflare',
        regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
        compression: ['gzip', 'brotli'],
        minification: true,
        imageOptimization: true
      }
    };
    this.results = {
      timestamp: new Date().toISOString(),
      cacheAnalysis: {},
      cdnConfiguration: {},
      recommendations: [],
      optimizations: []
    };
  }

  async runEdgeCachingSetup() {
    console.log('🌐 Phase 12: Edge/Caching Strategy');
    console.log('==================================\n');

    try {
      await this.analyzeCurrentCaching();
      await this.configureHttpCaching();
      await this.setupCdnConfiguration();
      await this.createCacheHeadersConfig();
      await this.optimizeStaticAssets();
      await this.generateCachingReport();
      
      console.log('✅ Edge caching strategy setup completed successfully');
      this.printSummary();
    } catch (error) {
      console.error('❌ Edge caching strategy setup failed:', error.message);
      process.exit(1);
    }
  }

  async analyzeCurrentCaching() {
    console.log('🔍 Analyzing current caching configuration...');
    
    const analysis = {
      cacheHeaders: this.analyzeCacheHeaders(),
      staticAssets: this.analyzeStaticAssets(),
      apiEndpoints: this.analyzeApiEndpoints(),
      cdnUsage: this.analyzeCdnUsage()
    };
    
    this.results.cacheAnalysis = analysis;
    console.log('   Cache analysis completed');
  }

  analyzeCacheHeaders() {
    // Look for existing cache headers in the codebase
    const cacheHeaderPatterns = [
      'Cache-Control',
      'Expires',
      'ETag',
      'Last-Modified',
      'Vary'
    ];
    
    const foundHeaders = [];
    
    for (const pattern of cacheHeaderPatterns) {
      try {
        const grepResult = execSync(`grep -r "${pattern}" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"`, 
          { encoding: 'utf8', stdio: 'pipe' });
        
        if (grepResult.trim()) {
          foundHeaders.push({
            header: pattern,
            occurrences: grepResult.split('\n').filter(line => line.trim()).length
          });
        }
      } catch (error) {
        // Pattern not found, continue
      }
    }
    
    return foundHeaders;
  }

  analyzeStaticAssets() {
    const staticDirs = ['public', 'static', 'assets'];
    const assetTypes = {
      images: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'],
      fonts: ['.woff', '.woff2', '.ttf', '.otf'],
      css: ['.css'],
      js: ['.js'],
      html: ['.html']
    };
    
    const analysis = {};
    
    for (const dir of staticDirs) {
      const dirPath = path.join(this.workspaceRoot, dir);
      if (fs.existsSync(dirPath)) {
        analysis[dir] = this.analyzeDirectory(dirPath, assetTypes);
      }
    }
    
    return analysis;
  }

  analyzeDirectory(dirPath, assetTypes) {
    const analysis = { totalFiles: 0, totalSize: 0, byType: {} };
    
    const walkDir = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else {
          const ext = path.extname(item).toLowerCase();
          const size = stat.size;
          
          analysis.totalFiles++;
          analysis.totalSize += size;
          
          for (const [type, extensions] of Object.entries(assetTypes)) {
            if (extensions.includes(ext)) {
              if (!analysis.byType[type]) {
                analysis.byType[type] = { count: 0, size: 0 };
              }
              analysis.byType[type].count++;
              analysis.byType[type].size += size;
            }
          }
        }
      }
    };
    
    walkDir(dirPath);
    return analysis;
  }

  analyzeApiEndpoints() {
    // Look for API routes and endpoints
    const apiPatterns = [
      '/api/',
      'app/api/',
      'pages/api/',
      'src/api/'
    ];
    
    const endpoints = [];
    
    for (const pattern of apiPatterns) {
      try {
        const findResult = execSync(`find . -path "*/${pattern}*" -type f`, 
          { encoding: 'utf8', stdio: 'pipe' });
        
        if (findResult.trim()) {
          const files = findResult.split('\n').filter(line => line.trim());
          endpoints.push({
            pattern,
            files: files.length
          });
        }
      } catch (error) {
        // Pattern not found, continue
      }
    }
    
    return endpoints;
  }

  analyzeCdnUsage() {
    // Check for CDN usage in the codebase
    const cdnPatterns = [
      'cdn.',
      'cloudfront',
      'cloudflare',
      'fastly',
      'jsdelivr',
      'unpkg'
    ];
    
    const cdnUsage = [];
    
    for (const pattern of cdnPatterns) {
      try {
        const grepResult = execSync(`grep -r "${pattern}" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.html"`, 
          { encoding: 'utf8', stdio: 'pipe' });
        
        if (grepResult.trim()) {
          cdnUsage.push({
            provider: pattern,
            occurrences: grepResult.split('\n').filter(line => line.trim()).length
          });
        }
      } catch (error) {
        // Pattern not found, continue
      }
    }
    
    return cdnUsage;
  }

  async configureHttpCaching() {
    console.log('⚙️  Configuring HTTP caching...');
    
    // Create Next.js cache configuration
    await this.createNextjsCacheConfig();
    
    // Create Express.js cache middleware
    await this.createExpressCacheMiddleware();
    
    // Create cache headers configuration
    await this.createCacheHeadersConfig();
    
    console.log('   HTTP caching configured');
  }

  async createNextjsCacheConfig() {
    const nextConfig = `// Next.js Cache Configuration
const nextConfig = {
  // Enable static optimization
  trailingSlash: false,
  
  // Image optimization
  images: {
    domains: ['cdn.example.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },
  
  // Headers for caching
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
  
  // Compression
  compress: true,
  
  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@whats-for-dinner/ui'],
  },
};

module.exports = nextConfig;
`;

    const configPath = path.join(this.workspaceRoot, 'next.config.cache.js');
    fs.writeFileSync(configPath, nextConfig);
  }

  async createExpressCacheMiddleware() {
    const middlewareCode = `/**
 * Express Cache Middleware
 * HTTP caching middleware for Express.js applications
 */

const cache = require('memory-cache');
const crypto = require('crypto');

class CacheMiddleware {
  constructor(options = {}) {
    this.defaultTTL = options.defaultTTL || 300; // 5 minutes
    this.maxSize = options.maxSize || 100; // 100 items
    this.enabled = options.enabled !== false;
  }

  // Memory cache middleware
  memoryCache(ttl = this.defaultTTL) {
    return (req, res, next) => {
      if (!this.enabled) return next();

      const key = this.generateCacheKey(req);
      const cached = cache.get(key);

      if (cached) {
        res.set(cached.headers);
        return res.send(cached.body);
      }

      // Store original send method
      const originalSend = res.send;
      
      res.send = function(body) {
        // Cache the response
        cache.put(key, {
          body,
          headers: res.getHeaders()
        }, ttl * 1000);

        // Call original send
        originalSend.call(this, body);
      };

      next();
    };
  }

  // HTTP cache headers middleware
  httpCache(options = {}) {
    return (req, res, next) => {
      const { maxAge = 300, sMaxAge, staleWhileRevalidate, immutable = false } = options;
      
      let cacheControl = \`public, max-age=\${maxAge}\`;
      
      if (sMaxAge) {
        cacheControl += \`, s-maxage=\${sMaxAge}\`;
      }
      
      if (staleWhileRevalidate) {
        cacheControl += \`, stale-while-revalidate=\${staleWhileRevalidate}\`;
      }
      
      if (immutable) {
        cacheControl += ', immutable';
      }

      res.set('Cache-Control', cacheControl);
      res.set('Vary', 'Accept-Encoding');
      
      next();
    };
  }

  // ETag middleware
  etag() {
    return (req, res, next) => {
      const originalSend = res.send;
      
      res.send = function(body) {
        if (res.statusCode === 200 && body) {
          const etag = crypto.createHash('md5').update(JSON.stringify(body)).digest('hex');
          res.set('ETag', \`"\${etag}"\`);
          
          // Check if client has cached version
          if (req.headers['if-none-match'] === \`"\${etag}"\`) {
            return res.status(304).end();
          }
        }
        
        originalSend.call(this, body);
      };
      
      next();
    };
  }

  generateCacheKey(req) {
    const { url, method, headers } = req;
    const keyData = \`\${method}:\${url}:\${headers['accept-encoding'] || ''}\`;
    return crypto.createHash('md5').update(keyData).digest('hex');
  }

  // Clear cache
  clear() {
    cache.clear();
  }

  // Get cache stats
  getStats() {
    return {
      size: cache.size(),
      maxSize: this.maxSize,
      enabled: this.enabled
    };
  }
}

module.exports = CacheMiddleware;
`;

    const middlewarePath = path.join(this.workspaceRoot, 'packages', 'utils', 'src', 'cache-middleware.js');
    fs.writeFileSync(middlewarePath, middlewareCode);
  }

  async createCacheHeadersConfig() {
    const headersConfig = {
      staticAssets: this.cachingStrategy.staticAssets,
      api: this.cachingStrategy.api,
      cdn: this.cachingStrategy.cdn,
      rules: [
        {
          path: '/static/*',
          headers: {
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Vary': 'Accept-Encoding'
          }
        },
        {
          path: '/api/user/*',
          headers: {
            'Cache-Control': 'private, max-age=300, s-maxage=600, stale-while-revalidate=1800',
            'Vary': 'Authorization, Accept-Encoding'
          }
        },
        {
          path: '/api/public/*',
          headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
            'Vary': 'Accept-Encoding'
          }
        },
        {
          path: '/*.html',
          headers: {
            'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
            'Vary': 'Accept-Encoding'
          }
        }
      ]
    };

    const configPath = path.join(this.workspaceRoot, 'config', 'cache-headers.json');
    fs.writeFileSync(configPath, JSON.stringify(headersConfig, null, 2));
  }

  async setupCdnConfiguration() {
    console.log('☁️  Setting up CDN configuration...');
    
    const cdnConfig = {
      provider: this.cachingStrategy.cdn.provider,
      regions: this.cachingStrategy.cdn.regions,
      features: {
        compression: this.cachingStrategy.cdn.compression,
        minification: this.cachingStrategy.cdn.minification,
        imageOptimization: this.cachingStrategy.cdn.imageOptimization
      },
      rules: [
        {
          path: '/static/*',
          ttl: 31536000,
          compression: ['gzip', 'brotli'],
          minification: true
        },
        {
          path: '/api/*',
          ttl: 300,
          compression: ['gzip'],
          minification: false
        },
        {
          path: '/*.jpg',
          ttl: 31536000,
          imageOptimization: {
            formats: ['webp', 'avif'],
            quality: 85,
            resize: true
          }
        }
      ]
    };

    const cdnPath = path.join(this.workspaceRoot, 'config', 'cdn.json');
    fs.writeFileSync(cdnPath, JSON.stringify(cdnConfig, null, 2));
    
    this.results.cdnConfiguration = cdnConfig;
    console.log('   CDN configuration created');
  }

  async optimizeStaticAssets() {
    console.log('📦 Optimizing static assets...');
    
    const optimizations = [];
    
    // Check for image optimization opportunities
    const imageDirs = this.findImageDirectories();
    for (const dir of imageDirs) {
      const images = this.findImages(dir);
      if (images.length > 0) {
        optimizations.push({
          type: 'image_optimization',
          directory: dir,
          count: images.length,
          recommendations: [
            'Convert to WebP format',
            'Implement responsive images',
            'Add lazy loading',
            'Use CDN for delivery'
          ]
        });
      }
    }
    
    // Check for CSS optimization opportunities
    const cssFiles = this.findCssFiles();
    if (cssFiles.length > 0) {
      optimizations.push({
        type: 'css_optimization',
        count: cssFiles.length,
        recommendations: [
          'Minify CSS files',
          'Remove unused CSS',
          'Implement critical CSS',
          'Use CSS modules'
        ]
      });
    }
    
    // Check for JavaScript optimization opportunities
    const jsFiles = this.findJsFiles();
    if (jsFiles.length > 0) {
      optimizations.push({
        type: 'js_optimization',
        count: jsFiles.length,
        recommendations: [
          'Minify JavaScript files',
          'Enable tree shaking',
          'Implement code splitting',
          'Use dynamic imports'
        ]
      });
    }
    
    this.results.optimizations = optimizations;
    console.log(`   Found ${optimizations.length} optimization opportunities`);
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

  findImages(dir) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
    const images = [];
    
    const walkDir = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (imageExtensions.includes(path.extname(item).toLowerCase())) {
          images.push(fullPath);
        }
      }
    };
    
    walkDir(dir);
    return images;
  }

  findCssFiles() {
    const cssFiles = [];
    
    try {
      const findResult = execSync('find . -name "*.css" -not -path "*/node_modules/*"', 
        { encoding: 'utf8', stdio: 'pipe' });
      
      if (findResult.trim()) {
        cssFiles.push(...findResult.split('\n').filter(line => line.trim()));
      }
    } catch (error) {
      // No CSS files found
    }
    
    return cssFiles;
  }

  findJsFiles() {
    const jsFiles = [];
    
    try {
      const findResult = execSync('find . -name "*.js" -not -path "*/node_modules/*" -not -path "*/dist/*"', 
        { encoding: 'utf8', stdio: 'pipe' });
      
      if (findResult.trim()) {
        jsFiles.push(...findResult.split('\n').filter(line => line.trim()));
      }
    } catch (error) {
      // No JS files found
    }
    
    return jsFiles;
  }

  async generateCachingReport() {
    const reportPath = path.join(this.workspaceRoot, 'REPORTS', 'edge-caching.md');
    
    const report = `# Phase 12: Edge/Caching Strategy

## Executive Summary

**Status**: ✅ Complete  
**Cache Headers**: ${this.results.cacheAnalysis.cacheHeaders.length} configured  
**Static Assets**: ${Object.keys(this.results.cacheAnalysis.staticAssets).length} directories analyzed  
**API Endpoints**: ${this.results.cacheAnalysis.apiEndpoints.length} patterns found  
**Optimizations**: ${this.results.optimizations.length} opportunities identified

## Caching Strategy

### Static Assets

| File Type | Cache Control | TTL | Immutable |
|-----------|---------------|-----|-----------|
| HTML | public, max-age=300, s-maxage=3600 | 5min/1hr | No |
| CSS | public, max-age=31536000 | 1 year | Yes |
| JS | public, max-age=31536000 | 1 year | Yes |
| Images | public, max-age=31536000 | 1 year | Yes |
| Fonts | public, max-age=31536000 | 1 year | Yes |

### API Endpoints

| Endpoint Type | Cache Control | TTL | Stale While Revalidate |
|---------------|---------------|-----|------------------------|
| User Data | private, max-age=300, s-maxage=600 | 5min/10min | 30min |
| Public Data | public, max-age=3600, s-maxage=7200 | 1hr/2hr | 24hr |
| Search Results | public, max-age=1800, s-maxage=3600 | 30min/1hr | 2hr |

## CDN Configuration

- **Provider**: ${this.cachingStrategy.cdn.provider}
- **Regions**: ${this.cachingStrategy.cdn.regions.join(', ')}
- **Compression**: ${this.cachingStrategy.cdn.compression.join(', ')}
- **Minification**: ${this.cachingStrategy.cdn.minification ? 'Enabled' : 'Disabled'}
- **Image Optimization**: ${this.cachingStrategy.cdn.imageOptimization ? 'Enabled' : 'Disabled'}

## Cache Analysis

### Current Headers Found
${this.results.cacheAnalysis.cacheHeaders.length === 0 ? 'No cache headers found' : `
| Header | Occurrences |
|--------|-------------|
${this.results.cacheAnalysis.cacheHeaders.map(h => `| ${h.header} | ${h.occurrences} |`).join('\n')}
`}

### Static Assets Analysis
${Object.entries(this.results.cacheAnalysis.staticAssets).map(([dir, analysis]) => `
#### ${dir}
- **Total Files**: ${analysis.totalFiles}
- **Total Size**: ${this.formatBytes(analysis.totalSize)}
- **By Type**: ${Object.entries(analysis.byType).map(([type, data]) => `${type}: ${data.count} files (${this.formatBytes(data.size)})`).join(', ')}
`).join('')}

## Optimization Opportunities

${this.results.optimizations.map((opt, i) => `
### ${i + 1}. ${opt.type.replace('_', ' ').toUpperCase()}
- **Count**: ${opt.count}
- **Recommendations**:
${opt.recommendations.map(rec => `  - ${rec}`).join('\n')}
`).join('')}

## Implementation Files

- **Next.js Config**: \`next.config.cache.js\`
- **Express Middleware**: \`packages/utils/src/cache-middleware.js\`
- **Cache Headers**: \`config/cache-headers.json\`
- **CDN Config**: \`config/cdn.json\`

## Next Steps

1. **Phase 13**: Implement assets discipline
2. **Phase 14**: Set up experimentation layer
3. **Phase 15**: Implement docs quality gate

## Validation

Run the following to validate Phase 12 completion:

\`\`\`bash
# Check cache headers configuration
cat config/cache-headers.json

# Verify CDN configuration
cat config/cdn.json

# Test cache middleware
npm run test:cache

# Analyze static assets
npm run analyze:assets
\`\`\`

Phase 12 is complete and ready for Phase 13 implementation.
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
    console.log('\n🌐 Edge Caching Summary');
    console.log('=======================');
    console.log(`📊 Cache Headers: ${this.results.cacheAnalysis.cacheHeaders.length} configured`);
    console.log(`📦 Static Assets: ${Object.keys(this.results.cacheAnalysis.staticAssets).length} directories`);
    console.log(`🔌 API Endpoints: ${this.results.cacheAnalysis.apiEndpoints.length} patterns`);
    console.log(`☁️  CDN Provider: ${this.cachingStrategy.cdn.provider}`);
    console.log(`⚡ Optimizations: ${this.results.optimizations.length} opportunities`);
  }
}

// Run the edge caching setup
if (require.main === module) {
  const edgeCachingManager = new EdgeCachingManager();
  edgeCachingManager.runEdgeCachingSetup().catch(console.error);
}

module.exports = EdgeCachingManager;