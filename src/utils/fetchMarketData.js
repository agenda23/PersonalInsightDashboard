// Market data fetching utilities
const API_ENDPOINTS = {
  TWELVE_DATA: 'https://api.twelvedata.com/v1',
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
    console.error('Error fetching USD/JPY:', error)
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
    console.error('Error fetching BTC/USD:', error)
    // Return mock data as fallback
    return {
      value: 43250,
      change: -850,
      changePercent: -1.93
    }
  }
}

// Fetch Nikkei 225
export const fetchNikkei = async () => {
  try {
    const apiKey = getApiKey('twelveData')
    if (!apiKey) {
      throw new Error('Twelve Data API key not configured')
    }

    const response = await fetch(
      `${API_ENDPOINTS.TWELVE_DATA}/quote?symbol=N225&apikey=${apiKey}`
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
    console.error('Error fetching Nikkei:', error)
    // Return mock data as fallback
    return {
      value: 33486,
      change: 125,
      changePercent: 0.37
    }
  }
}

// Fetch S&P 500
export const fetchSP500 = async () => {
  try {
    const apiKey = getApiKey('twelveData')
    if (!apiKey) {
      throw new Error('Twelve Data API key not configured')
    }

    const response = await fetch(
      `${API_ENDPOINTS.TWELVE_DATA}/quote?symbol=SPX&apikey=${apiKey}`
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
    console.error('Error fetching S&P 500:', error)
    // Return mock data as fallback
    return {
      value: 4567,
      change: 23,
      changePercent: 0.51
    }
  }
}

// Fetch all market data
export const fetchAllMarketData = async () => {
  try {
    const [usdJpy, btcUsd, nikkei, sp500] = await Promise.all([
      fetchUSDJPY(),
      fetchBTCUSD(),
      fetchNikkei(),
      fetchSP500()
    ])

    return {
      usdJpy,
      btcUsd,
      nikkei,
      sp500
    }
  } catch (error) {
    console.error('Error fetching market data:', error)
    // Return mock data as fallback
    return {
      usdJpy: { value: 149.85, change: 0.12, changePercent: 0.08 },
      btcUsd: { value: 43250, change: -850, changePercent: -1.93 },
      nikkei: { value: 33486, change: 125, changePercent: 0.37 },
      sp500: { value: 4567, change: 23, changePercent: 0.51 }
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
