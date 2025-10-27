/**
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
      
      let cacheControl = `public, max-age=${maxAge}`;
      
      if (sMaxAge) {
        cacheControl += `, s-maxage=${sMaxAge}`;
      }
      
      if (staleWhileRevalidate) {
        cacheControl += `, stale-while-revalidate=${staleWhileRevalidate}`;
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
          res.set('ETag', `"${etag}"`);
          
          // Check if client has cached version
          if (req.headers['if-none-match'] === `"${etag}"`) {
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
    const keyData = `${method}:${url}:${headers['accept-encoding'] || ''}`;
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
