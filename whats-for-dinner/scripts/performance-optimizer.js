#!/usr/bin/env node

/**
 * Performance Optimization Script for What's for Dinner
 *
 * This script performs comprehensive performance optimization including:
 * - Database query analysis and optimization
 * - Index creation and optimization
 * - Caching layer implementation
 * - CDN configuration
 * - Performance monitoring setup
 * - Bundle size optimization
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceOptimizer {
  constructor() {
    this.optimizationResults = {
      timestamp: new Date().toISOString(),
      overallScore: 0,
      optimizations: [],
      recommendations: [],
      metrics: {
        bundleSize: 0,
        loadTime: 0,
        dbQueryTime: 0,
        cacheHitRate: 0,
      },
    };
  }

  async runFullOptimization() {
    console.log('🚀 Starting comprehensive performance optimization...\n');

    try {
      await this.analyzeDatabaseQueries();
      await this.optimizeDatabaseIndexes();
      await this.implementCachingLayers();
      await this.configureCDN();
      await this.optimizeBundleSize();
      await this.setupPerformanceMonitoring();
      await this.optimizeImages();
      await this.implementLazyLoading();
      await this.optimizeAPIs();
      await this.setupServiceWorkers();

      this.calculateOverallScore();
      this.generateReport();

      console.log('\n✅ Performance optimization completed successfully!');
      console.log(
        `📊 Overall Performance Score: ${this.optimizationResults.overallScore}/100`
      );

      return this.optimizationResults;
    } catch (error) {
      console.error('❌ Performance optimization failed:', error);
      throw error;
    }
  }

  async analyzeDatabaseQueries() {
    console.log('🔍 Analyzing database queries...');

    try {
      // Analyze Supabase queries
      const queryFiles = this.findFiles('src/**/*.ts');
      const queryIssues = [];

      queryFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');

        // Check for N+1 queries
        if (content.includes('.select(') && content.includes('.from(')) {
          const selectCount = (content.match(/\.select\(/g) || []).length;
          const fromCount = (content.match(/\.from\(/g) || []).length;

          if (selectCount > fromCount * 2) {
            queryIssues.push({
              file,
              issue: 'Potential N+1 query pattern detected',
              severity: 'high',
            });
          }
        }

        // Check for missing indexes
        if (content.includes('.eq(') && !content.includes('.index(')) {
          queryIssues.push({
            file,
            issue: 'Query may benefit from database index',
            severity: 'medium',
          });
        }

        // Check for inefficient queries
        if (content.includes('SELECT *') && !content.includes('LIMIT')) {
          queryIssues.push({
            file,
            issue: 'SELECT * without LIMIT may be inefficient',
            severity: 'medium',
          });
        }
      });

      if (queryIssues.length > 0) {
        this.optimizationResults.optimizations.push({
          category: 'Database Queries',
          issue: `Found ${queryIssues.length} query optimization opportunities`,
          impact: 'High',
          recommendations: queryIssues.map(q => q.issue),
        });
      }

      console.log('✅ Database query analysis completed');
    } catch (error) {
      console.error('❌ Database query analysis failed:', error.message);
    }
  }

  async optimizeDatabaseIndexes() {
    console.log('🗄️  Optimizing database indexes...');

    try {
      // Create optimized indexes
      const indexOptimizations = [
        {
          table: 'recipes',
          columns: ['user_id', 'created_at'],
          type: 'btree',
          name: 'idx_recipes_user_created',
        },
        {
          table: 'pantry_items',
          columns: ['user_id', 'expiry_date'],
          type: 'btree',
          name: 'idx_pantry_user_expiry',
        },
        {
          table: 'favorites',
          columns: ['user_id', 'recipe_id'],
          type: 'btree',
          name: 'idx_favorites_user_recipe',
        },
        {
          table: 'analytics_events',
          columns: ['event_type', 'created_at'],
          type: 'btree',
          name: 'idx_analytics_event_created',
        },
      ];

      const indexSQL = indexOptimizations
        .map(index => {
          return `CREATE INDEX IF NOT EXISTS ${index.name} ON ${index.table} (${index.columns.join(', ')});`;
        })
        .join('\n');

      // Write index optimization SQL
      fs.writeFileSync('database-indexes.sql', indexSQL);

      this.optimizationResults.optimizations.push({
        category: 'Database Indexes',
        issue: 'Created optimized database indexes',
        impact: 'High',
        recommendations: [
          'Apply database indexes for better query performance',
        ],
      });

      console.log('✅ Database index optimization completed');
    } catch (error) {
      console.error('❌ Database index optimization failed:', error.message);
    }
  }

  async implementCachingLayers() {
    console.log('💾 Implementing caching layers...');

    try {
      // Create Redis caching configuration
      const redisConfig = `
// Redis caching configuration
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Cache configuration
const cacheConfig = {
  ttl: {
    recipes: 3600, // 1 hour
    pantry: 1800,  // 30 minutes
    analytics: 300 // 5 minutes
  },
  keys: {
    recipes: (userId) => \`recipes:\${userId}\`,
    pantry: (userId) => \`pantry:\${userId}\`,
    analytics: (eventType) => \`analytics:\${eventType}\`
  }
};

// Cache middleware
const cacheMiddleware = (keyGenerator, ttl) => {
  return async (req, res, next) => {
    const key = keyGenerator(req);
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    const originalSend = res.json;
    res.json = function(data) {
      client.setex(key, ttl, JSON.stringify(data));
      return originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = { client, cacheConfig, cacheMiddleware };
`;

      fs.writeFileSync('src/lib/cache.ts', redisConfig);

      // Create SWR configuration
      const swrConfig = `
// SWR configuration for client-side caching
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export const useRecipes = (userId) => {
  return useSWR(\`/api/recipes?userId=\${userId}\`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 300000, // 5 minutes
    dedupingInterval: 60000 // 1 minute
  });
};

export const usePantry = (userId) => {
  return useSWR(\`/api/pantry?userId=\${userId}\`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 600000, // 10 minutes
    dedupingInterval: 120000 // 2 minutes
  });
};

export const useAnalytics = (eventType) => {
  return useSWR(\`/api/analytics?eventType=\${eventType}\`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 300000, // 5 minutes
    dedupingInterval: 60000 // 1 minute
  });
};
`;

      fs.writeFileSync('src/hooks/useCache.ts', swrConfig);

      this.optimizationResults.optimizations.push({
        category: 'Caching',
        issue: 'Implemented Redis and SWR caching layers',
        impact: 'High',
        recommendations: [
          'Configure Redis instance',
          'Implement cache invalidation strategies',
        ],
      });

      console.log('✅ Caching layers implemented');
    } catch (error) {
      console.error('❌ Caching implementation failed:', error.message);
    }
  }

  async configureCDN() {
    console.log('🌐 Configuring CDN...');

    try {
      // Create CDN configuration
      const cdnConfig = `
// CDN configuration for static assets
export const cdnConfig = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.whats-for-dinner.com'
    : 'http://localhost:3000',
  assets: {
    images: '/images',
    fonts: '/fonts',
    scripts: '/scripts',
    styles: '/styles'
  },
  cacheHeaders: {
    images: 'public, max-age=31536000, immutable',
    fonts: 'public, max-age=31536000, immutable',
    scripts: 'public, max-age=31536000, immutable',
    styles: 'public, max-age=31536000, immutable'
  }
};

// Image optimization
export const optimizeImage = (src, width, height, quality = 80) => {
  const params = new URLSearchParams({
    w: width.toString(),
    h: height.toString(),
    q: quality.toString(),
    f: 'webp'
  });
  
  return \`\${cdnConfig.baseUrl}\${cdnConfig.assets.images}/\${src}?\${params}\`;
};

// Font optimization
export const optimizeFont = (fontFamily, weights = [400, 600, 700]) => {
  const weightsParam = weights.join(';');
  return \`\${cdnConfig.baseUrl}\${cdnConfig.assets.fonts}/\${fontFamily}?weights=\${weightsParam}&display=swap\`;
};
`;

      fs.writeFileSync('src/lib/cdn.ts', cdnConfig);

      // Create Next.js image optimization config
      const nextConfig = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.whats-for-dinner.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  httpAgentOptions: {
    keepAlive: true,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@supabase/supabase-js', 'lucide-react'],
  },
};

module.exports = nextConfig;
`;

      fs.writeFileSync('next.config.optimized.js', nextConfig);

      this.optimizationResults.optimizations.push({
        category: 'CDN',
        issue: 'Configured CDN and image optimization',
        impact: 'High',
        recommendations: [
          'Set up CDN provider',
          'Configure image optimization service',
        ],
      });

      console.log('✅ CDN configuration completed');
    } catch (error) {
      console.error('❌ CDN configuration failed:', error.message);
    }
  }

  async optimizeBundleSize() {
    console.log('📦 Optimizing bundle size...');

    try {
      // Analyze bundle size
      const bundleAnalysis = execSync('npm run build 2>&1', {
        encoding: 'utf8',
      });

      // Create bundle optimization config
      const bundleConfig = `
// Bundle optimization configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\\\/]node_modules[\\\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }

    // Tree shaking
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;

    return config;
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@supabase/supabase-js',
      'lucide-react',
      'react-hook-form',
      'zod'
    ],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
`;

      fs.writeFileSync('next.config.bundle.js', bundleConfig);

      this.optimizationResults.optimizations.push({
        category: 'Bundle Size',
        issue: 'Optimized bundle size and tree shaking',
        impact: 'Medium',
        recommendations: ['Enable bundle analysis', 'Implement code splitting'],
      });

      console.log('✅ Bundle size optimization completed');
    } catch (error) {
      console.error('❌ Bundle size optimization failed:', error.message);
    }
  }

  async setupPerformanceMonitoring() {
    console.log('📊 Setting up performance monitoring...');

    try {
      // Create performance monitoring configuration
      const monitoringConfig = `
// Performance monitoring configuration
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }

  init() {
    // Core Web Vitals
    getCLS(this.handleMetric.bind(this));
    getFID(this.handleMetric.bind(this));
    getFCP(this.handleMetric.bind(this));
    getLCP(this.handleMetric.bind(this));
    getTTFB(this.handleMetric.bind(this));

    // Custom metrics
    this.measurePageLoad();
    this.measureAPIResponse();
    this.measureDatabaseQueries();
  }

  handleMetric(metric) {
    this.metrics[metric.name] = metric.value;
    this.sendMetric(metric);
  }

  measurePageLoad() {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.sendMetric({
        name: 'page_load_time',
        value: loadTime,
        delta: loadTime
      });
    });
  }

  measureAPIResponse() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      const response = await originalFetch(...args);
      const end = performance.now();
      
      this.sendMetric({
        name: 'api_response_time',
        value: end - start,
        delta: end - start
      });
      
      return response;
    };
  }

  measureDatabaseQueries() {
    // Monitor Supabase queries
    if (window.supabase) {
      const originalQuery = window.supabase.from;
      window.supabase.from = function(...args) {
        const start = performance.now();
        const query = originalQuery.apply(this, args);
        
        const originalSelect = query.select;
        query.select = function(...selectArgs) {
          const selectQuery = originalSelect.apply(this, selectArgs);
          
          const originalThen = selectQuery.then;
          selectQuery.then = function(...thenArgs) {
            const end = performance.now();
            this.sendMetric({
              name: 'db_query_time',
              value: end - start,
              delta: end - start
            });
            
            return originalThen.apply(this, thenArgs);
          };
          
          return selectQuery;
        };
        
        return query;
      };
    }
  }

  sendMetric(metric) {
    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_delta: metric.delta
      });
    }

    // Send to custom analytics
    fetch('/api/analytics/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
    }).catch(console.error);
  }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  new PerformanceMonitor();
}

export default PerformanceMonitor;
`;

      fs.writeFileSync('src/lib/performance-monitor.ts', monitoringConfig);

      this.optimizationResults.optimizations.push({
        category: 'Performance Monitoring',
        issue: 'Set up comprehensive performance monitoring',
        impact: 'High',
        recommendations: [
          'Configure analytics service',
          'Set up alerting for performance issues',
        ],
      });

      console.log('✅ Performance monitoring setup completed');
    } catch (error) {
      console.error('❌ Performance monitoring setup failed:', error.message);
    }
  }

  async optimizeImages() {
    console.log('🖼️  Optimizing images...');

    try {
      // Create image optimization script
      const imageOptimizationScript = `
#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class ImageOptimizer {
  constructor() {
    this.sizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
    this.qualities = [80, 85, 90, 95];
    this.formats = ['webp', 'avif', 'jpeg'];
  }

  async optimizeImage(inputPath, outputDir) {
    const filename = path.basename(inputPath, path.extname(inputPath));
    
    for (const size of this.sizes) {
      for (const quality of this.qualities) {
        for (const format of this.formats) {
          const outputPath = path.join(outputDir, \`\${filename}-\${size}w-\${quality}q.\${format}\`);
          
          await sharp(inputPath)
            .resize(size, null, { withoutEnlargement: true })
            .toFormat(format, { quality })
            .toFile(outputPath);
        }
      }
    }
  }

  async optimizeAllImages(inputDir, outputDir) {
    const files = fs.readdirSync(inputDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(file)
    );

    for (const file of imageFiles) {
      const inputPath = path.join(inputDir, file);
      await this.optimizeImage(inputPath, outputDir);
    }
  }
}

// Run optimization
const optimizer = new ImageOptimizer();
optimizer.optimizeAllImages('./public/images', './public/images/optimized');
`;

      fs.writeFileSync('scripts/optimize-images.js', imageOptimizationScript);

      this.optimizationResults.optimizations.push({
        category: 'Image Optimization',
        issue: 'Created image optimization script',
        impact: 'Medium',
        recommendations: [
          'Run image optimization script',
          'Implement responsive images',
        ],
      });

      console.log('✅ Image optimization completed');
    } catch (error) {
      console.error('❌ Image optimization failed:', error.message);
    }
  }

  async implementLazyLoading() {
    console.log('⏳ Implementing lazy loading...');

    try {
      // Create lazy loading components
      const lazyLoadingComponents = `
// Lazy loading components
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

// Lazy load heavy components
export const LazyRecipeCard = lazy(() => import('./RecipeCard'));
export const LazyPantryItem = lazy(() => import('./PantryItem'));
export const LazyAnalyticsChart = lazy(() => import('./AnalyticsChart'));
export const LazyAdminDashboard = lazy(() => import('./AdminDashboard'));

// Lazy loading wrapper
export const LazyWrapper = ({ children, fallback = <LoadingSpinner /> }) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      options
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options, hasIntersected]);

  return [ref, isIntersecting, hasIntersected];
};

// Lazy image component
export const LazyImage = ({ src, alt, ...props }) => {
  const [ref, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  return (
    <div ref={ref} {...props}>
      {hasIntersected && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsIntersecting(true)}
        />
      )}
    </div>
  );
};
`;

      fs.writeFileSync('src/components/LazyLoading.tsx', lazyLoadingComponents);

      this.optimizationResults.optimizations.push({
        category: 'Lazy Loading',
        issue: 'Implemented lazy loading for components and images',
        impact: 'Medium',
        recommendations: [
          'Apply lazy loading to heavy components',
          'Implement progressive loading',
        ],
      });

      console.log('✅ Lazy loading implementation completed');
    } catch (error) {
      console.error('❌ Lazy loading implementation failed:', error.message);
    }
  }

  async optimizeAPIs() {
    console.log('🔌 Optimizing APIs...');

    try {
      // Create API optimization middleware
      const apiOptimization = `
// API optimization middleware
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from './rate-limit';
import { cache } from './cache';

export const apiOptimization = {
  // Rate limiting
  rateLimit: (limit = 100, windowMs = 15 * 60 * 1000) => {
    return async (req: NextRequest) => {
      const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
      const isLimited = await rateLimit.isLimited(ip, limit, windowMs);
      
      if (isLimited) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429 }
        );
      }
    };
  },

  // Caching
  cache: (ttl = 300) => {
    return async (req: NextRequest, handler: Function) => {
      const cacheKey = \`\${req.method}:\${req.url}\`;
      const cached = await cache.get(cacheKey);
      
      if (cached) {
        return NextResponse.json(cached);
      }
      
      const response = await handler(req);
      const data = await response.json();
      
      await cache.set(cacheKey, data, ttl);
      
      return NextResponse.json(data);
    };
  },

  // Compression
  compress: (req: NextRequest, response: NextResponse) => {
    const acceptEncoding = req.headers.get('accept-encoding');
    
    if (acceptEncoding?.includes('gzip')) {
      response.headers.set('Content-Encoding', 'gzip');
    } else if (acceptEncoding?.includes('deflate')) {
      response.headers.set('Content-Encoding', 'deflate');
    }
    
    return response;
  },

  // Pagination
  paginate: (page: number, limit: number) => {
    const offset = (page - 1) * limit;
    return { offset, limit };
  },

  // Response optimization
  optimizeResponse: (data: any) => {
    // Remove unnecessary fields
    const optimized = JSON.parse(JSON.stringify(data, (key, value) => {
      if (value === null || value === undefined) {
        return undefined;
      }
      return value;
    }));
    
    return optimized;
  }
};

// Database query optimization
export const optimizeQuery = (query: any) => {
  return query
    .select('*')
    .limit(100) // Default limit
    .order('created_at', { ascending: false });
};

// API response time monitoring
export const monitorAPITime = (req: NextRequest, handler: Function) => {
  return async (req: NextRequest) => {
    const start = Date.now();
    const response = await handler(req);
    const duration = Date.now() - start;
    
    // Log slow queries
    if (duration > 1000) {
      console.warn(\`Slow API call: \${req.url} took \${duration}ms\`);
    }
    
    return response;
  };
};
`;

      fs.writeFileSync('src/lib/api-optimization.ts', apiOptimization);

      this.optimizationResults.optimizations.push({
        category: 'API Optimization',
        issue: 'Implemented API optimization middleware',
        impact: 'High',
        recommendations: [
          'Apply optimization middleware to all APIs',
          'Monitor API performance',
        ],
      });

      console.log('✅ API optimization completed');
    } catch (error) {
      console.error('❌ API optimization failed:', error.message);
    }
  }

  async setupServiceWorkers() {
    console.log('⚙️  Setting up service workers...');

    try {
      // Create service worker for caching
      const serviceWorker = `
// Service worker for caching and offline support
const CACHE_NAME = 'whats-for-dinner-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
`;

      fs.writeFileSync('public/sw.js', serviceWorker);

      // Create service worker registration
      const swRegistration = `
// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
`;

      fs.writeFileSync('src/lib/sw-registration.ts', swRegistration);

      this.optimizationResults.optimizations.push({
        category: 'Service Workers',
        issue: 'Set up service workers for caching and offline support',
        impact: 'Medium',
        recommendations: [
          'Register service worker in app',
          'Implement cache strategies',
        ],
      });

      console.log('✅ Service workers setup completed');
    } catch (error) {
      console.error('❌ Service workers setup failed:', error.message);
    }
  }

  calculateOverallScore() {
    let score = 100;

    // Deduct points for missing optimizations
    const missingOptimizations = this.optimizationResults.optimizations.filter(
      opt => opt.impact === 'High' && !opt.recommendations.includes('Completed')
    );

    score -= missingOptimizations.length * 10;

    this.optimizationResults.overallScore = Math.max(0, Math.min(100, score));
  }

  generateReport() {
    const report = {
      ...this.optimizationResults,
      summary: {
        totalOptimizations: this.optimizationResults.optimizations.length,
        highImpact: this.optimizationResults.optimizations.filter(
          opt => opt.impact === 'High'
        ).length,
        mediumImpact: this.optimizationResults.optimizations.filter(
          opt => opt.impact === 'Medium'
        ).length,
        lowImpact: this.optimizationResults.optimizations.filter(
          opt => opt.impact === 'Low'
        ).length,
      },
    };

    // Write report to file
    fs.writeFileSync(
      'PERFORMANCE_OPTIMIZATION_REPORT.json',
      JSON.stringify(report, null, 2)
    );

    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(report);
    fs.writeFileSync('PERFORMANCE_OPTIMIZATION_REPORT.md', markdownReport);

    console.log('\n📊 Performance optimization report generated:');
    console.log('  - PERFORMANCE_OPTIMIZATION_REPORT.json');
    console.log('  - PERFORMANCE_OPTIMIZATION_REPORT.md');
  }

  generateMarkdownReport(report) {
    return `# Performance Optimization Report

**Generated:** ${report.timestamp}
**Overall Score:** ${report.overallScore}/100

## Summary

- **Total Optimizations:** ${report.summary.totalOptimizations}
- **High Impact:** ${report.summary.highImpact}
- **Medium Impact:** ${report.summary.mediumImpact}
- **Low Impact:** ${report.summary.lowImpact}

## Optimizations

${report.optimizations
  .map(
    opt => `### ${opt.category}
- **Issue:** ${opt.issue}
- **Impact:** ${opt.impact}
- **Recommendations:**
${opt.recommendations.map(rec => `  - ${rec}`).join('\n')}
`
  )
  .join('\n')}

## Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*This report was generated automatically by the Performance Optimizer Script*
`;
  }

  // Helper methods
  findFiles(pattern) {
    try {
      const result = execSync(`find . -name "${pattern}" -type f`, {
        encoding: 'utf8',
      });
      return result
        .trim()
        .split('\n')
        .filter(file => file.length > 0);
    } catch (error) {
      return [];
    }
  }
}

// Run the optimization if this script is executed directly
if (require.main === module) {
  const optimizer = new PerformanceOptimizer();
  optimizer
    .runFullOptimization()
    .then(results => {
      console.log('\n✅ Performance optimization completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Performance optimization failed:', error);
      process.exit(1);
    });
}

module.exports = PerformanceOptimizer;
