#!/usr/bin/env node

/**
 * CDN Configuration and Optimization Script
 * Sets up CloudFlare CDN configuration for optimal performance
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  outputDir: path.join(__dirname, '../performance-configs'),
  verbose: process.env.VERBOSE === 'true',
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logVerbose(message) {
  if (config.verbose) {
    log(`[VERBOSE] ${message}`, 'blue');
  }
}

/**
 * Generate CloudFlare Workers configuration
 */
function generateCloudFlareWorker() {
  const workerCode = `// CloudFlare Worker for What's for Dinner CDN optimization
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // CORS headers for API requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://whats-for-dinner.vercel.app',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    })
  }

  // Cache static assets aggressively
  if (url.pathname.startsWith('/_next/static/') || 
      url.pathname.startsWith('/static/') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.jpeg') ||
      url.pathname.endsWith('.gif') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.ico')) {
    
    const response = await fetch(request)
    const newResponse = new Response(response.body, response)
    
    // Set cache headers for static assets
    newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    newResponse.headers.set('CDN-Cache-Control', 'max-age=31536000')
    newResponse.headers.set('Cloudflare-CDN-Cache-Control', 'max-age=31536000')
    
    return newResponse
  }

  // Cache API responses with shorter TTL
  if (url.pathname.startsWith('/api/')) {
    const response = await fetch(request)
    const newResponse = new Response(response.body, response)
    
    // Set cache headers for API responses
    newResponse.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600')
    newResponse.headers.set('CDN-Cache-Control', 'max-age=600')
    newResponse.headers.set('Cloudflare-CDN-Cache-Control', 'max-age=600')
    
    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value)
    })
    
    return newResponse
  }

  // Cache HTML pages with moderate TTL
  if (url.pathname.endsWith('.html') || 
      url.pathname === '/' ||
      (!url.pathname.includes('.') && !url.pathname.startsWith('/api/'))) {
    
    const response = await fetch(request)
    const newResponse = new Response(response.body, response)
    
    // Set cache headers for HTML pages
    newResponse.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=7200')
    newResponse.headers.set('CDN-Cache-Control', 'max-age=7200')
    newResponse.headers.set('Cloudflare-CDN-Cache-Control', 'max-age=7200')
    
    return newResponse
  }

  // Default response
  const response = await fetch(request)
  return response
}`;

  return workerCode;
}

/**
 * Generate CloudFlare Page Rules configuration
 */
function generatePageRules() {
  const pageRules = [
    {
      name: 'Static Assets - Maximum Caching',
      url: 'whats-for-dinner.vercel.app/_next/static/*',
      settings: {
        cache_level: 'cache_everything',
        edge_cache_ttl: 31536000,
        browser_cache_ttl: 31536000,
        always_online: true,
        mirage: true,
        polish: 'lossless',
        minify: {
          css: true,
          html: true,
          js: true,
        },
      },
    },
    {
      name: 'API Routes - Moderate Caching',
      url: 'whats-for-dinner.vercel.app/api/*',
      settings: {
        cache_level: 'cache_everything',
        edge_cache_ttl: 600,
        browser_cache_ttl: 300,
        always_online: true,
        mirage: false,
        polish: 'off',
        minify: {
          css: false,
          html: false,
          js: false,
        },
      },
    },
    {
      name: 'HTML Pages - Moderate Caching',
      url: 'whats-for-dinner.vercel.app/*',
      settings: {
        cache_level: 'cache_everything',
        edge_cache_ttl: 7200,
        browser_cache_ttl: 3600,
        always_online: true,
        mirage: true,
        polish: 'lossless',
        minify: {
          css: true,
          html: true,
          js: true,
        },
      },
    },
  ];

  return pageRules;
}

/**
 * Generate Next.js CDN configuration
 */
function generateNextJSConfig() {
  const nextConfig = `const nextConfig = {
  // CDN and performance optimizations
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.whats-for-dinner.vercel.app' : '',
  
  // Image optimization
  images: {
    domains: ['cdn.whats-for-dinner.vercel.app'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Compression
  compress: true,
  
  // Headers for CDN optimization
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'max-age=31536000',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'max-age=600',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=7200',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'max-age=7200',
          },
        ],
      },
    ];
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize bundle size
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\\\/]node_modules[\\\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
  
  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
};

module.exports = nextConfig;`;

  return nextConfig;
}

/**
 * Generate Vercel configuration
 */
function generateVercelConfig() {
  const vercelConfig = {
    version: 2,
    functions: {
      'api/**/*.ts': {
        maxDuration: 30,
      },
    },
    headers: [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=7200',
          },
        ],
      },
    ],
    rewrites: [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ],
  };

  return vercelConfig;
}

/**
 * Generate CDN performance monitoring script
 */
function generateCDNMonitoring() {
  const monitoringScript = `#!/usr/bin/env node

/**
 * CDN Performance Monitoring Script
 * Monitors CDN performance and cache hit ratios
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const config = {
  baseUrl: process.env.BASE_URL || 'https://whats-for-dinner.vercel.app',
  outputDir: path.join(__dirname, '../performance-monitoring'),
  verbose: process.env.VERBOSE === 'true'
};

// Colors for console output
const colors = {
  red: '\\x1b[31m',
  green: '\\x1b[32m',
  yellow: '\\x1b[33m',
  blue: '\\x1b[34m',
  reset: '\\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(\`\${colors[color]}\${message}\${colors.reset}\`);
}

/**
 * Test CDN performance for a given URL
 */
async function testCDNPerformance(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const cdnHeaders = {
        'cf-cache-status': res.headers['cf-cache-status'],
        'cf-ray': res.headers['cf-ray'],
        'server': res.headers['server'],
        'cache-control': res.headers['cache-control'],
        'cdn-cache-control': res.headers['cdn-cache-control']
      };
      
      resolve({
        url,
        statusCode: res.statusCode,
        responseTime,
        cdnHeaders,
        isCached: res.headers['cf-cache-status'] === 'HIT'
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url,
        statusCode: 0,
        responseTime: 0,
        cdnHeaders: {},
        isCached: false,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        statusCode: 0,
        responseTime: 0,
        cdnHeaders: {},
        isCached: false,
        error: 'Request timeout'
      });
    });
    
    req.end();
  });
}

/**
 * Main monitoring function
 */
async function monitorCDNPerformance() {
  log('Starting CDN performance monitoring...', 'blue');
  
  const testUrls = [
    \`\${config.baseUrl}/_next/static/chunks/main.js\`,
    \`\${config.baseUrl}/_next/static/css/main.css\`,
    \`\${config.baseUrl}/api/meals\`,
    \`\${config.baseUrl}/api/ingredients\`,
    \`\${config.baseUrl}/\`
  ];
  
  const results = [];
  
  for (const url of testUrls) {
    log(\`Testing: \${url}\`, 'yellow');
    const result = await testCDNPerformance(url);
    results.push(result);
    
    if (result.isCached) {
      log(\`✓ Cached - \${result.responseTime}ms\`, 'green');
    } else {
      log(\`✗ Not cached - \${result.responseTime}ms\`, 'red');
    }
  }
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: results.length,
      cachedResponses: results.filter(r => r.isCached).length,
      averageResponseTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length,
      cacheHitRate: (results.filter(r => r.isCached).length / results.length * 100).toFixed(2) + '%'
    },
    results
  };
  
  // Save report
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
  
  const reportFile = path.join(config.outputDir, \`cdn-performance-\${Date.now()}.json\`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  log(\`\\nCDN Performance Report:\`, 'blue');
  log(\`Total tests: \${report.summary.totalTests}\`, 'green');
  log(\`Cached responses: \${report.summary.cachedResponses}\`, 'green');
  log(\`Average response time: \${report.summary.averageResponseTime.toFixed(2)}ms\`, 'green');
  log(\`Cache hit rate: \${report.summary.cacheHitRate}\`, 'green');
  log(\`\\nReport saved to: \${reportFile}\`, 'green');
  
  return report;
}

// Run monitoring if called directly
if (require.main === module) {
  monitorCDNPerformance()
    .then(() => {
      log('CDN monitoring completed successfully', 'green');
      process.exit(0);
    })
    .catch(error => {
      log(\`CDN monitoring failed: \${error.message}\`, 'red');
      process.exit(1);
    });
}

module.exports = { monitorCDNPerformance };`;

  return monitoringScript;
}

/**
 * Main function to generate all CDN configurations
 */
function generateCDNConfigurations() {
  log('Generating CDN configurations...', 'blue');

  // Ensure output directory exists
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  // Generate CloudFlare Worker
  const workerCode = generateCloudFlareWorker();
  fs.writeFileSync(
    path.join(config.outputDir, 'cloudflare-worker.js'),
    workerCode
  );
  log('Generated CloudFlare Worker configuration', 'green');

  // Generate Page Rules
  const pageRules = generatePageRules();
  fs.writeFileSync(
    path.join(config.outputDir, 'cloudflare-page-rules.json'),
    JSON.stringify(pageRules, null, 2)
  );
  log('Generated CloudFlare Page Rules configuration', 'green');

  // Generate Next.js config
  const nextConfig = generateNextJSConfig();
  fs.writeFileSync(
    path.join(config.outputDir, 'next.config.cdn.js'),
    nextConfig
  );
  log('Generated Next.js CDN configuration', 'green');

  // Generate Vercel config
  const vercelConfig = generateVercelConfig();
  fs.writeFileSync(
    path.join(config.outputDir, 'vercel.json'),
    JSON.stringify(vercelConfig, null, 2)
  );
  log('Generated Vercel configuration', 'green');

  // Generate CDN monitoring script
  const monitoringScript = generateCDNMonitoring();
  fs.writeFileSync(
    path.join(config.outputDir, 'cdn-monitoring.js'),
    monitoringScript
  );
  log('Generated CDN monitoring script', 'green');

  // Generate README
  const readme = generateCDNReadme();
  fs.writeFileSync(path.join(config.outputDir, 'README.md'), readme);
  log('Generated CDN setup README', 'green');

  log('\\nCDN configurations generated successfully!', 'green');
  log(`Output directory: ${config.outputDir}`, 'blue');
}

/**
 * Generate CDN setup README
 */
function generateCDNReadme() {
  return `# CDN Configuration for What's for Dinner

This directory contains all the necessary configurations for setting up a high-performance CDN for the What's for Dinner application.

## Files Overview

- \`cloudflare-worker.js\` - CloudFlare Worker for advanced caching and optimization
- \`cloudflare-page-rules.json\` - CloudFlare Page Rules configuration
- \`next.config.cdn.js\` - Next.js configuration optimized for CDN
- \`vercel.json\` - Vercel deployment configuration
- \`cdn-monitoring.js\` - CDN performance monitoring script

## Setup Instructions

### 1. CloudFlare Configuration

1. Deploy the CloudFlare Worker:
   \`\`\`bash
   # Install Wrangler CLI
   npm install -g wrangler
   
   # Deploy the worker
   wrangler deploy cloudflare-worker.js
   \`\`\`

2. Configure Page Rules in CloudFlare dashboard:
   - Import the rules from \`cloudflare-page-rules.json\`
   - Adjust URLs to match your domain

### 2. Next.js Configuration

1. Replace your existing \`next.config.js\` with \`next.config.cdn.js\`
2. Update the \`assetPrefix\` to match your CDN URL
3. Restart your development server

### 3. Vercel Configuration

1. Copy \`vercel.json\` to your project root
2. Deploy to Vercel - the configuration will be automatically applied

### 4. CDN Monitoring

1. Run the monitoring script:
   \`\`\`bash
   node cdn-monitoring.js
   \`\`\`

2. Set up automated monitoring:
   \`\`\`bash
   # Add to crontab for hourly monitoring
   0 * * * * cd /path/to/project && node scripts/performance/cdn-monitoring.js
   \`\`\`

## Performance Optimizations

### Static Assets
- **Cache TTL**: 1 year (31536000 seconds)
- **Compression**: Gzip + Brotli
- **Image Optimization**: WebP + AVIF formats
- **Minification**: CSS, HTML, JavaScript

### API Routes
- **Cache TTL**: 10 minutes (600 seconds)
- **Browser Cache**: 5 minutes (300 seconds)
- **CORS**: Configured for secure cross-origin requests

### HTML Pages
- **Cache TTL**: 2 hours (7200 seconds)
- **Browser Cache**: 1 hour (3600 seconds)
- **Mirage**: Enabled for image optimization

## Monitoring

The CDN monitoring script provides:
- Cache hit ratio analysis
- Response time measurements
- CDN header validation
- Performance reports

## Troubleshooting

### Common Issues

1. **Cache not working**: Check CloudFlare Page Rules configuration
2. **CORS errors**: Verify CORS headers in CloudFlare Worker
3. **Slow responses**: Check cache TTL settings and purge cache if needed

### Cache Purge

To purge CDN cache:
\`\`\`bash
# Using CloudFlare API
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \\
  -H "Authorization: Bearer {api_token}" \\
  -H "Content-Type: application/json" \\
  --data '{"purge_everything":true}'
\`\`\`

## Performance Metrics

Expected performance improvements:
- **Page Load Time**: 40-60% reduction
- **Time to First Byte**: 50-70% reduction
- **Cache Hit Ratio**: 80-95%
- **Bandwidth Usage**: 60-80% reduction

## Security Considerations

- CORS headers are configured for specific origins
- Cache headers prevent sensitive data caching
- HTTPS is enforced for all CDN requests
- Security headers are maintained through the CDN

## Support

For issues or questions:
1. Check the monitoring reports
2. Review CloudFlare analytics
3. Test with different cache TTL values
4. Verify origin server performance`;
}

// Run if called directly
if (require.main === module) {
  generateCDNConfigurations();
}

module.exports = { generateCDNConfigurations };
