/**
 * Caching Layer for Meal Suggestions
 * 
 * Reduces API costs and improves performance by caching similar pantry combinations
 */

interface CacheEntry {
  key: string;
  value: any;
  timestamp: number;
  expiresAt: number;
}

class SuggestionCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 1000; // Maximum cache entries
  private defaultTTL: number = 60 * 60 * 1000; // 1 hour default TTL

  /**
   * Generate cache key from ingredients and preferences
   */
  private generateKey(ingredients: string[], preferences?: string): string {
    const sortedIngredients = [...ingredients].sort().join(',');
    const prefs = preferences ? preferences.toLowerCase().trim() : '';
    return `suggestion:${sortedIngredients}:${prefs}`;
  }

  /**
   * Get cached suggestion if available and not expired
   */
  get(ingredients: string[], preferences?: string): any | null {
    const key = this.generateKey(ingredients, preferences);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Store suggestion in cache
   */
  set(ingredients: string[], value: any, preferences?: string, ttl?: number): void {
    const key = this.generateKey(ingredients, preferences);
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      key,
      value,
      timestamp: now,
      expiresAt,
    });
  }

  /**
   * Check if cache has entry (without retrieving)
   */
  has(ingredients: string[], preferences?: string): boolean {
    const key = this.generateKey(ingredients, preferences);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Evict oldest entries
   */
  private evictOldest(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 10% of entries
    const toRemove = Math.max(1, Math.floor(entries.length * 0.1));
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
      hitRate: 0, // Would need to track hits/misses separately
    };
  }
}

// Singleton instance
export const suggestionCache = new SuggestionCache();

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    suggestionCache.cleanup();
  }, 5 * 60 * 1000);
}
