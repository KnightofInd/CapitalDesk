/**
 * In-memory cache with TTL (Time To Live)
 * Used to cache market data to avoid excessive API calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // in milliseconds
}

class Cache {
  private store: Map<string, CacheEntry<any>>;

  constructor() {
    this.store = new Map();
  }

  /**
   * Set a value in the cache with TTL
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds (default: 15 seconds)
   */
  set<T>(key: string, value: T, ttl: number = 15000): void {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
    };
    this.store.set(key, entry);
  }

  /**
   * Get a value from the cache
   * Returns null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;

    if (age > entry.ttl) {
      // Entry expired, remove it
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const value = this.get(key);
    return value !== null;
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clear all expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.store.forEach((entry, key) => {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.store.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`🧹 Cleaned up ${keysToDelete.length} expired cache entries`);
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.store.clear();
    console.log("🗑️ Cache cleared");
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }
}

// Singleton instance
let cacheInstance: Cache | null = null;

export function getCache(): Cache {
  if (!cacheInstance) {
    cacheInstance = new Cache();

    // Run cleanup every 30 seconds
    if (typeof setInterval !== "undefined") {
      setInterval(() => {
        cacheInstance?.cleanup();
      }, 30000);
    }

    console.log("✅ Cache instance created");
  }

  return cacheInstance;
}

// Helper function to generate cache keys
export function getCacheKey(type: string, identifier: string): string {
  return `${type}:${identifier.toUpperCase()}`;
}

// Default TTL values (in milliseconds)
export const CacheTTL = {
  MARKET_DATA: 15000, // 15 seconds for live market data
  STOCK_INFO: 30000, // 30 seconds for stock information
  PORTFOLIO: 15000, // 15 seconds for portfolio data
  SECTOR_DATA: 20000, // 20 seconds for sector aggregations
} as const;
