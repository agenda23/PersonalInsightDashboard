// News data fetching utilities
const NEWS_API_ENDPOINT = 'https://newsapi.org/v2'
const GNEWS_API_ENDPOINT = 'https://gnews.io/api/v4'

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

// Fetch news from NewsAPI
export const fetchNewsFromNewsAPI = async (category = 'general', country = 'jp', pageSize = 10) => {
  try {
    const apiKey = getApiKey('newsApi')
    if (!apiKey) {
      throw new Error('NewsAPI key not configured')
    }

    const response = await fetch(
      `${NEWS_API_ENDPOINT}/top-headlines?country=${country}&category=${category}&pageSize=${pageSize}&apiKey=${apiKey}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status === 'error') {
      throw new Error(data.message || 'NewsAPI error')
    }
    
    return data.articles.map((article, index) => ({
      id: index + 1,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      time: getTimeAgo(article.publishedAt),
      source: article.source.name,
      category: category
    }))
  } catch (error) {
    console.error('Error fetching news from NewsAPI:', error)
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

// Fetch news with fallback to mock data
export const fetchNews = async (category = 'general', maxItems = 10) => {
  try {
    // Try NewsAPI first
    try {
      return await fetchNewsFromNewsAPI(category, 'jp', maxItems)
    } catch (newsApiError) {
      console.warn('NewsAPI failed, trying GNews:', newsApiError.message)
      
      // Try GNews as fallback
      try {
        return await fetchNewsFromGNews(category, 'ja', maxItems)
      } catch (gnewsError) {
        console.warn('GNews also failed:', gnewsError.message)
        throw new Error('All news APIs failed')
      }
    }
  } catch (error) {
    console.error('Error fetching news:', error)
    
    // Return mock data as fallback
    return [
      {
        id: 1,
        title: '日経平均株価が続伸、年初来高値を更新',
        description: '東京株式市場で日経平均株価が続伸し、年初来高値を更新しました。',
        url: '#',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        time: '2時間前',
        source: 'モックニュース',
        category: 'business'
      },
      {
        id: 2,
        title: 'ドル円相場、149円台で推移',
        description: '外国為替市場でドル円相場は149円台で推移しています。',
        url: '#',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        time: '3時間前',
        source: 'モックニュース',
        category: 'business'
      },
      {
        id: 3,
        title: 'ビットコイン価格が調整局面入り',
        description: '暗号資産市場でビットコイン価格が調整局面に入っています。',
        url: '#',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        time: '4時間前',
        source: 'モックニュース',
        category: 'technology'
      },
      {
        id: 4,
        title: '今週の天気予報：気温の変動に注意',
        description: '今週は気温の変動が大きくなる見込みです。',
        url: '#',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        time: '5時間前',
        source: 'モックニュース',
        category: 'general'
      },
      {
        id: 5,
        title: '新しい経済政策の発表について',
        description: '政府から新しい経済政策が発表されました。',
        url: '#',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        time: '6時間前',
        source: 'モックニュース',
        category: 'general'
      },
      {
        id: 6,
        title: 'テクノロジー業界の最新動向',
        description: 'テクノロジー業界で注目すべき最新の動向をお伝えします。',
        url: '#',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        time: '7時間前',
        source: 'モックニュース',
        category: 'technology'
      },
      {
        id: 7,
        title: 'スポーツ界の話題：注目の試合結果',
        description: '今日行われた注目の試合結果をお伝えします。',
        url: '#',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        time: '8時間前',
        source: 'モックニュース',
        category: 'sports'
      },
      {
        id: 8,
        title: '健康に関する最新研究結果',
        description: '健康に関する最新の研究結果が発表されました。',
        url: '#',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
        time: '9時間前',
        source: 'モックニュース',
        category: 'health'
      },
      {
        id: 9,
        title: '環境問題への新たな取り組み',
        description: '環境問題に対する新たな取り組みが始まりました。',
        url: '#',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        time: '10時間前',
        source: 'モックニュース',
        category: 'general'
      },
      {
        id: 10,
        title: '教育制度改革の最新情報',
        description: '教育制度改革に関する最新情報をお伝えします。',
        url: '#',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
        time: '11時間前',
        source: 'モックニュース',
        category: 'general'
      }
    ].slice(0, maxItems)
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

// Search news by keyword
export const searchNews = async (query, maxItems = 10) => {
  try {
    const apiKey = getApiKey('newsApi')
    if (!apiKey) {
      throw new Error('NewsAPI key not configured')
    }

    const response = await fetch(
      `${NEWS_API_ENDPOINT}/everything?q=${encodeURIComponent(query)}&language=ja&pageSize=${maxItems}&sortBy=publishedAt&apiKey=${apiKey}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status === 'error') {
      throw new Error(data.message || 'NewsAPI error')
    }
    
    return data.articles.map((article, index) => ({
      id: index + 1,
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      time: getTimeAgo(article.publishedAt),
      source: article.source.name,
      category: 'search'
    }))
  } catch (error) {
    console.error('Error searching news:', error)
    // Return empty array as fallback
    return []
  }
}
