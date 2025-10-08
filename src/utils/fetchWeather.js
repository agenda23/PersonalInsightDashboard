// Weather data fetching utilities using Open-Meteo API (free, no API key required)
const OPEN_METEO_API = 'https://api.open-meteo.com/v1'

// Weather condition mapping
const getWeatherIcon = (weatherCode, isDay = true) => {
  const weatherIcons = {
    0: isDay ? '☀️' : '🌙', // Clear sky
    1: isDay ? '🌤️' : '🌙', // Mainly clear
    2: '⛅', // Partly cloudy
    3: '☁️', // Overcast
    45: '🌫️', // Fog
    48: '🌫️', // Depositing rime fog
    51: '🌦️', // Light drizzle
    53: '🌦️', // Moderate drizzle
    55: '🌦️', // Dense drizzle
    56: '🌨️', // Light freezing drizzle
    57: '🌨️', // Dense freezing drizzle
    61: '🌧️', // Slight rain
    63: '🌧️', // Moderate rain
    65: '🌧️', // Heavy rain
    66: '🌨️', // Light freezing rain
    67: '🌨️', // Heavy freezing rain
    71: '❄️', // Slight snow fall
    73: '❄️', // Moderate snow fall
    75: '❄️', // Heavy snow fall
    77: '🌨️', // Snow grains
    80: '🌦️', // Slight rain showers
    81: '🌦️', // Moderate rain showers
    82: '🌦️', // Violent rain showers
    85: '🌨️', // Slight snow showers
    86: '🌨️', // Heavy snow showers
    95: '⛈️', // Thunderstorm
    96: '⛈️', // Thunderstorm with slight hail
    99: '⛈️', // Thunderstorm with heavy hail
  }
  return weatherIcons[weatherCode] || '❓'
}

const getWeatherDescription = (weatherCode) => {
  const descriptions = {
    0: '快晴',
    1: '晴れ',
    2: '一部曇り',
    3: '曇り',
    45: '霧',
    48: '霧氷',
    51: '小雨',
    53: '雨',
    55: '大雨',
    56: '凍雨（軽）',
    57: '凍雨（強）',
    61: '小雨',
    63: '雨',
    65: '大雨',
    66: '凍雨（軽）',
    67: '凍雨（強）',
    71: '小雪',
    73: '雪',
    75: '大雪',
    77: '雪粒',
    80: 'にわか雨（軽）',
    81: 'にわか雨',
    82: 'にわか雨（強）',
    85: 'にわか雪（軽）',
    86: 'にわか雪（強）',
    95: '雷雨',
    96: '雷雨（雹軽）',
    99: '雷雨（雹強）',
  }
  return descriptions[weatherCode] || '不明'
}

// Get user's location from settings or fallback to Tokyo
const getUserLocation = async () => {
  try {
    // Try to get location from localStorage settings
    const settings = JSON.parse(localStorage.getItem('settings') || '{}')
    if (settings.location && settings.location.latitude && settings.location.longitude) {
      return {
        latitude: settings.location.latitude,
        longitude: settings.location.longitude,
        cityName: settings.location.cityName,
        prefecture: settings.location.prefecture
      }
    }
  } catch (error) {
    console.warn('Error reading location from settings:', error)
  }

  // Fallback to geolocation API
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            cityName: '現在地',
            prefecture: '現在地'
          })
        },
        () => {
          // Fallback to Tokyo coordinates
          resolve({
            latitude: 35.6762,
            longitude: 139.6503,
            cityName: '東京都',
            prefecture: '東京都'
          })
        },
        { timeout: 5000 }
      )
    } else {
      // Fallback to Tokyo coordinates
      resolve({
        latitude: 35.6762,
        longitude: 139.6503,
        cityName: '東京都',
        prefecture: '東京都'
      })
    }
  })
}

// Fetch current weather
export const fetchCurrentWeather = async () => {
  try {
    const location = await getUserLocation()
    
    const response = await fetch(
      `${OPEN_METEO_API}/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,is_day,precipitation&hourly=precipitation_probability&timezone=Asia/Tokyo&forecast_days=1`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    const current = data.current
    
    // Get current hour's precipitation probability
    const currentHour = new Date().getHours()
    const precipitationProbability = data.hourly?.precipitation_probability?.[currentHour] || 0
    
    return {
      temp: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      condition: getWeatherDescription(current.weather_code),
      icon: getWeatherIcon(current.weather_code, current.is_day === 1),
      weatherCode: current.weather_code,
      isDay: current.is_day === 1,
      precipitation: current.precipitation || 0,
      precipitationProbability: precipitationProbability,
      cityName: location.cityName,
      prefecture: location.prefecture
    }
  } catch (error) {
    console.error('Error fetching current weather:', error)
    // Return mock data as fallback
    const location = await getUserLocation()
    return {
      temp: 18,
      humidity: 65,
      condition: '一部曇り',
      icon: '⛅',
      weatherCode: 2,
      isDay: true,
      precipitation: 0,
      precipitationProbability: 20,
      cityName: location.cityName || '東京都',
      prefecture: location.prefecture || '東京都'
    }
  }
}

// Fetch weather forecast
export const fetchWeatherForecast = async (days = 7) => {
  try {
    const location = await getUserLocation()
    
    const response = await fetch(
      `${OPEN_METEO_API}/forecast?latitude=${location.latitude}&longitude=${location.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia/Tokyo&forecast_days=${days}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    const daily = data.daily
    
    const forecast = []
    const today = new Date()
    
    for (let i = 0; i < Math.min(days, daily.time.length); i++) {
      const date = new Date(daily.time[i])
      let dayLabel = ''
      
      if (i === 0) {
        dayLabel = '今日'
      } else if (i === 1) {
        dayLabel = '明日'
      } else if (i === 2) {
        dayLabel = '明後日'
      } else {
        dayLabel = date.toLocaleDateString('ja-JP', { weekday: 'short' })
      }
      
      forecast.push({
        day: dayLabel,
        date: daily.time[i],
        temp: Math.round(daily.temperature_2m_max[i]),
        tempMin: Math.round(daily.temperature_2m_min[i]),
        condition: getWeatherDescription(daily.weather_code[i]),
        icon: getWeatherIcon(daily.weather_code[i], true),
        precipitationProbability: daily.precipitation_probability_max[i] || 0,
        weatherCode: daily.weather_code[i]
      })
    }
    
    return forecast
  } catch (error) {
    console.error('Error fetching weather forecast:', error)
    // Return mock data as fallback
    const location = await getUserLocation()
    return [
      { day: '今日', temp: 18, tempMin: 12, condition: '一部曇り', icon: '⛅', precipitationProbability: 20, cityName: location.cityName },
      { day: '明日', temp: 20, tempMin: 14, condition: '晴れ', icon: '☀️', precipitationProbability: 10, cityName: location.cityName },
      { day: '明後日', temp: 16, tempMin: 10, condition: '雨', icon: '🌧️', precipitationProbability: 80, cityName: location.cityName },
      { day: '木', temp: 19, tempMin: 13, condition: '曇り', icon: '☁️', precipitationProbability: 30, cityName: location.cityName },
      { day: '金', temp: 22, tempMin: 16, condition: '晴れ', icon: '☀️', precipitationProbability: 5, cityName: location.cityName },
      { day: '土', temp: 21, tempMin: 15, condition: '一部曇り', icon: '⛅', precipitationProbability: 15, cityName: location.cityName },
      { day: '日', temp: 17, tempMin: 11, condition: '小雨', icon: '🌦️', precipitationProbability: 60, cityName: location.cityName }
    ]
  }
}

// Fetch complete weather data
export const fetchWeatherData = async () => {
  try {
    const [current, forecast] = await Promise.all([
      fetchCurrentWeather(),
      fetchWeatherForecast(7)
    ])
    
    return {
      current,
      forecast
    }
  } catch (error) {
    console.error('Error fetching weather data:', error)
    // Return mock data as fallback
    return {
      current: { temp: 18, condition: '一部曇り', icon: '⛅' },
      forecast: [
        { day: '今日', temp: 18, condition: '一部曇り', icon: '⛅' },
        { day: '明日', temp: 20, condition: '晴れ', icon: '☀️' },
        { day: '明後日', temp: 16, condition: '雨', icon: '🌧️' }
      ]
    }
  }
}

// Get weather alerts (if available)
export const fetchWeatherAlerts = async () => {
  try {
    const location = await getUserLocation()
    
    // Open-Meteo doesn't provide alerts in the free tier
    // This is a placeholder for future implementation
    return []
  } catch (error) {
    console.error('Error fetching weather alerts:', error)
    return []
  }
}
