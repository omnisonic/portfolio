// Simple in-memory cache for development
// Cache duration is configurable (in seconds), set to 0 for indefinite caching
// Manual cache clear endpoint available at /api/cache/clear

const cache = new Map();

// Default cache duration in seconds (0 = indefinite)
let cacheDuration = 0;

/**
 * Set cache duration
 * @param {number} seconds - Cache duration in seconds (0 = indefinite)
 */
function setCacheDuration(seconds) {
  cacheDuration = Math.max(0, seconds);
}

/**
 * Generate cache key from function name and parameters
 * @param {string} functionName - Name of the API function
 * @param {object} params - Request parameters
 * @returns {string} Cache key
 */
function generateCacheKey(functionName, params) {
  const paramStr = JSON.stringify(params || {});
  return `${functionName}:${paramStr}`;
}

/**
 * Get cached data if available and not expired
 * @param {string} key - Cache key
 * @returns {object|null} Cached data or null
 */
function getFromCache(key) {
  const cached = cache.get(key);
  
  if (!cached) {
    console.log(`[CACHE] Miss: ${key}`);
    return null;
  }

  // Check if cache has expired (if duration > 0)
  if (cacheDuration > 0) {
    const now = Date.now();
    const age = (now - cached.timestamp) / 1000; // age in seconds
    
    if (age > cacheDuration) {
      console.log(`[CACHE] Expired: ${key} (${age.toFixed(1)}s old)`);
      cache.delete(key);
      return null;
    }
  }

  console.log(`[CACHE] Hit: ${key}`);
  return cached.data;
}

/**
 * Store data in cache
 * @param {string} key - Cache key
 * @param {object} data - Data to cache
 */
function setInCache(key, data) {
  cache.set(key, {
    data: data,
    timestamp: Date.now()
  });
  console.log(`[CACHE] Stored: ${key}`);
}

/**
 * Clear all cached data
 */
function clearCache() {
  const count = cache.size;
  cache.clear();
  console.log(`[CACHE] Cleared all entries (${count} items)`);
  return count;
}

/**
 * Get cache statistics
 * @returns {object} Cache statistics
 */
function getCacheStats() {
  const now = Date.now();
  const entries = [];
  
  for (const [key, value] of cache.entries()) {
    const age = cacheDuration > 0 ? (now - value.timestamp) / 1000 : null;
    entries.push({
      key,
      age: age !== null ? `${age.toFixed(1)}s` : 'indefinite',
      expired: age !== null && age > cacheDuration
    });
  }
  
  return {
    size: cache.size,
    duration: cacheDuration === 0 ? 'indefinite' : `${cacheDuration}s`,
    entries
  };
}

module.exports = {
  setCacheDuration,
  generateCacheKey,
  getFromCache,
  setInCache,
  clearCache,
  getCacheStats
};