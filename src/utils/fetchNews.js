// News data fetching utilities
import { getCachedData, setCachedData, CACHE_KEYS } from './cacheManager.js'

const GNEWS_API_ENDPOINT = 'https://gnews.io/api/v4'
const CURRENTS_API_ENDPOINT = 'https://api.currentsapi.services/v1'

// Get API key from localStorage
const getApiKey = (service) => {
  const apiKeys = JSON.parse(localStorage.getItem('apiKeys') || '{}')
  return apiKeys[service] || ''
}

// Format time ago
const getTimeAgo = (dateString) => {
  const now = new Date()
  const publishedAt = new Date(dateString)
  const diffInMinutes = Math.floor((now - publishedAt) / (1000 * 60))
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分前`
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours}時間前`
  } else {
    const days = Math.floor(diffInMinutes / 1440)
    return `${days}日前`
  }
}

// Fetch news from Currents API (600 requests/day - Primary)
export const fetchNewsFromCurrents = async (category = 'general', lang = 'ja', maxItems = 10) => {
  try {
    const apiKey = getApiKey('currents')
    if (!apiKey) {
      throw new Error('Currents API key not configured')
    }

    console.log(`📰 Currents APIで日本語ニュースを検索中...`)
    
    const response = await fetch(
      `${CURRENTS_API_ENDPOINT}/latest-news?` +
      `language=${lang}&` +
      `apiKey=${apiKey}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Currents API error')
    }
    
    // Check if news array exists and is not empty
    if (!data.news || data.news.length === 0) {
      throw new Error('No articles found')
    }
    
    console.log(`✅ Currents APIから${data.news.length}件の記事を取得しました`)
    
    return data.news.slice(0, maxItems).map((article, index) => ({
      id: index + 1,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.image !== 'None' ? article.image : null,
      publishedAt: article.published,
      time: getTimeAgo(article.published),
      source: article.author || 'Currents',
      category: article.category && article.category.length > 0 ? article.category[0] : category
    }))
  } catch (error) {
    console.error('Error fetching news from Currents API:', error)
    throw error
  }
}

// Fetch news from GNews API (alternative)
export const fetchNewsFromGNews = async (category = 'general', lang = 'ja', max = 10) => {
  try {
    const apiKey = getApiKey('gnews')
    if (!apiKey) {
      throw new Error('GNews API key not configured')
    }

    const response = await fetch(
      `${GNEWS_API_ENDPOINT}/top-headlines?category=${category}&lang=${lang}&max=${max}&apikey=${apiKey}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.errors) {
      throw new Error(data.errors[0] || 'GNews API error')
    }
    
    // Check if articles array exists and is not empty
    if (!data.articles || data.articles.length === 0) {
      throw new Error('No articles found')
    }
    
    return data.articles.map((article, index) => ({
      id: index + 1,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.image,
      publishedAt: article.publishedAt,
      time: getTimeAgo(article.publishedAt),
      source: article.source.name,
      category: category
    }))
  } catch (error) {
    console.error('Error fetching news from GNews:', error)
    throw error
  }
}

// Fetch news with caching and fallback to mock data
export const fetchNews = async (category = 'general', maxItems = 10) => {
  // Check cache first
  const cachedNews = getCachedData(CACHE_KEYS.NEWS)
  if (cachedNews) {
    return cachedNews
  }

  try {
    // 1. Currents API（600 requests/day）を試す
    try {
      const news = await fetchNewsFromCurrents(category, 'ja', maxItems)
      // Cache the successful result
      setCachedData(CACHE_KEYS.NEWS, news)
      return news
    } catch (currentsError) {
      console.warn('⚠️ Currents API failed:', currentsError.message)
      
      // 2. GNews API（フォールバック）を試す
      try {
        console.log('📰 GNews APIを試行中...')
        const news = await fetchNewsFromGNews(category, 'ja', maxItems)
        // Cache the successful result
        setCachedData(CACHE_KEYS.NEWS, news)
        return news
      } catch (gnewsError) {
        console.warn('⚠️ GNews failed:', gnewsError.message)
        throw new Error('All news APIs failed')
      }
    }
  } catch (error) {
    console.error('❌ ニュース取得失敗:', error.message)
    console.info('💡 実際のニュースを取得するには、設定画面でCurrents APIキーを登録してください')
    console.info('💡 Currents API（600 requests/day）推奨、データは10分間キャッシュされます')
    
    // Throw error instead of returning mock data
    throw error
  }
}

// Fetch news by category
export const fetchNewsByCategory = async (category = 'general', maxItems = 10) => {
  return await fetchNews(category, maxItems)
}

// Fetch business news
export const fetchBusinessNews = async (maxItems = 10) => {
  return await fetchNews('business', maxItems)
}

// Fetch technology news
export const fetchTechnologyNews = async (maxItems = 10) => {
  return await fetchNews('technology', maxItems)
}

// Fetch sports news
export const fetchSportsNews = async (maxItems = 10) => {
  return await fetchNews('sports', maxItems)
}
