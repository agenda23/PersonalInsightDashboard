// Market data fetching utilities
const API_ENDPOINTS = {
  TWELVE_DATA: 'https://api.twelvedata.com',
  ALPHA_VANTAGE: 'https://www.alphavantage.co/query',
  YAHOO_FINANCE: 'https://query1.finance.yahoo.com/v8/finance/chart'
}

// Get API key from localStorage
const getApiKey = (service) => {
  const apiKeys = JSON.parse(localStorage.getItem('apiKeys') || '{}')
  return apiKeys[service] || ''
}

// Fetch USD/JPY exchange rate
export const fetchUSDJPY = async () => {
  try {
    const apiKey = getApiKey('twelveData')
    if (!apiKey) {
      throw new Error('Twelve Data API key not configured')
    }

    const response = await fetch(
      `${API_ENDPOINTS.TWELVE_DATA}/quote?symbol=USD/JPY&apikey=${apiKey}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status === 'error') {
      throw new Error(data.message || 'API error')
    }
    
    return {
      value: parseFloat(data.close),
      change: parseFloat(data.change),
      changePercent: parseFloat(data.percent_change)
    }
  } catch (error) {
    console.warn('⚠️ USD/JPY取得エラー: モックデータを表示します。', error.message)
    // Return mock data as fallback
    return {
      value: 149.85,
      change: 0.12,
      changePercent: 0.08
    }
  }
}

// Fetch Bitcoin price
export const fetchBTCUSD = async () => {
  try {
    const apiKey = getApiKey('twelveData')
    if (!apiKey) {
      throw new Error('Twelve Data API key not configured')
    }

    const response = await fetch(
      `${API_ENDPOINTS.TWELVE_DATA}/quote?symbol=BTC/USD&apikey=${apiKey}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status === 'error') {
      throw new Error(data.message || 'API error')
    }
    
    return {
      value: parseFloat(data.close),
      change: parseFloat(data.change),
      changePercent: parseFloat(data.percent_change)
    }
  } catch (error) {
    console.warn('⚠️ BTC/USD取得エラー: モックデータを表示します。', error.message)
    // Return mock data as fallback
    return {
      value: 43250,
      change: -850,
      changePercent: -1.93
    }
  }
}

// Fetch Apple Stock (AAPL)
export const fetchAAPL = async () => {
  try {
    const apiKey = getApiKey('twelveData')
    if (!apiKey) {
      throw new Error('Twelve Data API key not configured')
    }

    const response = await fetch(
      `${API_ENDPOINTS.TWELVE_DATA}/quote?symbol=AAPL&apikey=${apiKey}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status === 'error') {
      throw new Error(data.message || 'API error')
    }
    
    return {
      value: parseFloat(data.close),
      change: parseFloat(data.change),
      changePercent: parseFloat(data.percent_change)
    }
  } catch (error) {
    console.warn('⚠️ Apple株（AAPL）取得エラー: モックデータを表示します。', error.message)
    // Return mock data as fallback
    return {
      value: 185.92,
      change: 2.34,
      changePercent: 1.27
    }
  }
}

// Fetch EUR/USD exchange rate
export const fetchEURUSD = async () => {
  try {
    const apiKey = getApiKey('twelveData')
    if (!apiKey) {
      throw new Error('Twelve Data API key not configured')
    }

    const response = await fetch(
      `${API_ENDPOINTS.TWELVE_DATA}/quote?symbol=EUR/USD&apikey=${apiKey}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status === 'error') {
      throw new Error(data.message || 'API error')
    }
    
    return {
      value: parseFloat(data.close),
      change: parseFloat(data.change),
      changePercent: parseFloat(data.percent_change)
    }
  } catch (error) {
    console.warn('⚠️ EUR/USD取得エラー: モックデータを表示します。', error.message)
    // Return mock data as fallback
    return {
      value: 1.0876,
      change: 0.0012,
      changePercent: 0.11
    }
  }
}

// Fetch all market data
export const fetchAllMarketData = async () => {
  try {
    const [usdJpy, btcUsd, aapl, eurUsd] = await Promise.all([
      fetchUSDJPY(),
      fetchBTCUSD(),
      fetchAAPL(),
      fetchEURUSD()
    ])

    return {
      usdJpy,
      btcUsd,
      aapl,
      eurUsd
    }
  } catch (error) {
    console.error('Error fetching market data:', error)
    // Return mock data as fallback
    return {
      usdJpy: { value: 149.85, change: 0.12, changePercent: 0.08 },
      btcUsd: { value: 43250, change: -850, changePercent: -1.93 },
      aapl: { value: 185.92, change: 2.34, changePercent: 1.27 },
      eurUsd: { value: 1.0876, change: 0.0012, changePercent: 0.11 }
    }
  }
}

// Fetch historical data for charts
export const fetchHistoricalData = async (symbol, interval = '1day', outputsize = 30) => {
  try {
    const apiKey = getApiKey('twelveData')
    if (!apiKey) {
      throw new Error('Twelve Data API key not configured')
    }

    const response = await fetch(
      `${API_ENDPOINTS.TWELVE_DATA}/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${apiKey}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status === 'error') {
      throw new Error(data.message || 'API error')
    }
    
    return data.values?.map(item => ({
      date: item.datetime,
      value: parseFloat(item.close),
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      volume: parseInt(item.volume)
    })) || []
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error)
    // Return mock data as fallback
    const mockData = []
    const baseValue = 100
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      mockData.push({
        date: date.toISOString().split('T')[0],
        value: baseValue + Math.random() * 20 - 10,
        open: baseValue + Math.random() * 20 - 10,
        high: baseValue + Math.random() * 20 - 10,
        low: baseValue + Math.random() * 20 - 10,
        volume: Math.floor(Math.random() * 1000000)
      })
    }
    return mockData
  }
}
