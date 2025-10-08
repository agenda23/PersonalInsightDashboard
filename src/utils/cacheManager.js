// Cache management utilities
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes in milliseconds

const CACHE_KEYS = {
  NEWS: 'news_cache',
  MARKET: 'market_cache',
  WEATHER: 'weather_cache'
}

/**
 * Get cached data if it exists and is still valid
 * @param {string} cacheKey - The cache key to retrieve
 * @returns {object|null} - Cached data or null if expired/not found
 */
export const getCachedData = (cacheKey) => {
  try {
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null

    const { data, timestamp } = JSON.parse(cached)
    const now = Date.now()

    // Check if cache is still valid (within 10 minutes)
    if (now - timestamp < CACHE_DURATION) {
      const minutesAgo = Math.floor((now - timestamp) / 60000)
      console.log(`📦 キャッシュからデータを読み込みました（${minutesAgo}分前に取得）`)
      return data
    }

    // Cache expired
    console.log('⏰ キャッシュの有効期限が切れました')
    localStorage.removeItem(cacheKey)
    return null
  } catch (error) {
    console.error('Error reading cache:', error)
    return null
  }
}

/**
 * Save data to cache with current timestamp
 * @param {string} cacheKey - The cache key to store
 * @param {any} data - The data to cache
 */
export const setCachedData = (cacheKey, data) => {
  try {
    const cache = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(cacheKey, JSON.stringify(cache))
    console.log('💾 データをキャッシュに保存しました')
  } catch (error) {
    console.error('Error saving cache:', error)
  }
}

/**
 * Clear specific cache
 * @param {string} cacheKey - The cache key to clear
 */
export const clearCache = (cacheKey) => {
  try {
    localStorage.removeItem(cacheKey)
    console.log('🗑️ キャッシュをクリアしました')
  } catch (error) {
    console.error('Error clearing cache:', error)
  }
}

/**
 * Clear all caches
 */
export const clearAllCaches = () => {
  try {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    console.log('🗑️ すべてのキャッシュをクリアしました')
  } catch (error) {
    console.error('Error clearing all caches:', error)
  }
}

/**
 * Get cache age in minutes
 * @param {string} cacheKey - The cache key to check
 * @returns {number|null} - Age in minutes or null if not found
 */
export const getCacheAge = (cacheKey) => {
  try {
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null

    const { timestamp } = JSON.parse(cached)
    return Math.floor((Date.now() - timestamp) / 60000)
  } catch (error) {
    return null
  }
}

export { CACHE_KEYS }
