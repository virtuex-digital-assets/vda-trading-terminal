/**
 * Simple TTL in-memory cache.
 *
 * Provides a lightweight caching layer that can be replaced with a Redis
 * client by swapping this module's implementation while keeping the same API.
 *
 * Usage:
 *   cache.set('key', value, ttlSeconds);
 *   cache.get('key');  // null when expired or missing
 *   cache.del('key');
 *   cache.flush();
 */

const store = new Map(); // key → { value, expiresAt }

/**
 * Store a value with an optional TTL.
 * @param {string} key
 * @param {*} value
 * @param {number} [ttl=60]  seconds until expiry (0 = never)
 */
function set(key, value, ttl = 60) {
  const expiresAt = ttl > 0 ? Date.now() + ttl * 1000 : Infinity;
  store.set(key, { value, expiresAt });
}

/**
 * Retrieve a cached value, or null if missing / expired.
 * @param {string} key
 * @returns {*}
 */
function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

/** Remove a specific key. */
function del(key) {
  store.delete(key);
}

/** Clear all cached entries. */
function flush() {
  store.clear();
}

/** Return the number of non-expired entries currently in the cache. */
function size() {
  let count = 0;
  const now = Date.now();
  store.forEach((entry, key) => {
    if (now > entry.expiresAt) {
      store.delete(key);
    } else {
      count++;
    }
  });
  return count;
}

module.exports = { set, get, del, flush, size };
