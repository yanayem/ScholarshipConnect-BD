import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@cache_';

export const cacheService = {
  /**
   * Save data to cache
   * @param {string} key Unique key for the cache
   * @param {any} data Data to save (will be JSON stringified)
   * @param {number} expiryMinutes Time in minutes after which cache is considered stale (optional)
   */
  async set(key, data, expiryMinutes = 60) {
    try {
      const cacheData = {
        value: data,
        timestamp: Date.now(),
        expiry: expiryMinutes * 60 * 1000,
      };
      await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData));
    } catch (e) {
      console.error('[CacheService] Error saving to cache:', e);
    }
  },

  /**
   * Get data from cache
   * @param {string} key Unique key
   * @returns {any|null} Cached data or null if not found
   */
  async get(key) {
    try {
      const item = await AsyncStorage.getItem(CACHE_PREFIX + key);
      if (!item) return null;

      const cacheData = JSON.parse(item);
      const { value, timestamp, expiry } = cacheData;

      // Check if expired (if expiry is set and > 0)
      if (expiry && expiry > 0 && (Date.now() - timestamp) > expiry) {
        await AsyncStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }

      return value;
    } catch (e) {
      return null;
    }
  },

  /**
   * Check if cache is still valid (not expired)
   * @param {string} key Unique key
   * @returns {boolean}
   */
  async isValid(key) {
    try {
      const item = await AsyncStorage.getItem(CACHE_PREFIX + key);
      if (!item) return false;

      const { timestamp, expiry } = JSON.parse(item);
      return (Date.now() - timestamp) < expiry;
    } catch (e) {
      return false;
    }
  },

  async clear(key) {
    try {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
    } catch (e) {
      console.error('[CacheService] Error clearing cache:', e);
    }
  }
};
