// LocalStorage utility functions for Personal Insight Dashboard

// Storage keys
const STORAGE_KEYS = {
  API_KEYS: 'apiKeys',
  TODOS: 'todos',
  THEME: 'theme',
  SETTINGS: 'settings',
  MARKET_DATA: 'marketData',
  WEATHER_DATA: 'weatherData',
  NEWS_DATA: 'newsData',
  LAST_UPDATE: 'lastUpdate'
}

// Default values
const DEFAULT_API_KEYS = {
  newsApi: '',
  twelveData: '',
  gnews: '',
  openMeteo: '' // Not needed but kept for consistency
}

const DEFAULT_SETTINGS = {
  updateInterval: {
    market: 10, // minutes
    weather: 60, // minutes
    news: 15 // minutes
  },
  autoUpdate: true,
  notifications: false,
  language: 'ja',
  currency: 'JPY',
  location: {
    cityName: '東京都',
    prefecture: '東京都',
    latitude: 35.6762, // Tokyo default
    longitude: 139.6503
  },
  widgetOrder: ['market', 'weather', 'news', 'todo'] // ウィジェットの表示順序
}

// Generic localStorage functions
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error)
    return defaultValue
  }
}

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error)
    return false
  }
}

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error)
    return false
  }
}

export const clearAllStorage = () => {
  try {
    localStorage.clear()
    return true
  } catch (error) {
    console.error('Error clearing localStorage:', error)
    return false
  }
}

// API Keys management
export const getApiKeys = () => {
  return getFromStorage(STORAGE_KEYS.API_KEYS, DEFAULT_API_KEYS)
}

export const saveApiKeys = (apiKeys) => {
  return saveToStorage(STORAGE_KEYS.API_KEYS, { ...DEFAULT_API_KEYS, ...apiKeys })
}

export const getApiKey = (service) => {
  const apiKeys = getApiKeys()
  return apiKeys[service] || ''
}

export const setApiKey = (service, key) => {
  const apiKeys = getApiKeys()
  apiKeys[service] = key
  return saveApiKeys(apiKeys)
}

// Todo management
export const getTodos = () => {
  return getFromStorage(STORAGE_KEYS.TODOS, [])
}

export const saveTodos = (todos) => {
  return saveToStorage(STORAGE_KEYS.TODOS, todos)
}

export const addTodo = (text, tags = []) => {
  const todos = getTodos()
  const newTodo = {
    id: Date.now(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
    tags: tags,
    priority: 'normal' // low, normal, high
  }
  todos.push(newTodo)
  saveTodos(todos)
  return newTodo
}

export const updateTodo = (id, updates) => {
  const todos = getTodos()
  const index = todos.findIndex(todo => todo.id === id)
  if (index !== -1) {
    todos[index] = { ...todos[index], ...updates }
    saveTodos(todos)
    return todos[index]
  }
  return null
}

export const deleteTodo = (id) => {
  const todos = getTodos()
  const filteredTodos = todos.filter(todo => todo.id !== id)
  saveTodos(filteredTodos)
  return filteredTodos
}

export const toggleTodo = (id) => {
  return updateTodo(id, { completed: !getTodos().find(todo => todo.id === id)?.completed })
}

export const getTodoStats = () => {
  const todos = getTodos()
  const total = todos.length
  const completed = todos.filter(todo => todo.completed).length
  const pending = total - completed
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
  
  return {
    total,
    completed,
    pending,
    completionRate
  }
}

// Theme management
export const getTheme = () => {
  return getFromStorage(STORAGE_KEYS.THEME, 'light')
}

export const saveTheme = (theme) => {
  return saveToStorage(STORAGE_KEYS.THEME, theme)
}

export const toggleTheme = () => {
  const currentTheme = getTheme()
  const newTheme = currentTheme === 'light' ? 'dark' : 'light'
  saveTheme(newTheme)
  return newTheme
}

// Settings management
export const getSettings = () => {
  return getFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
}

export const saveSettings = (settings) => {
  return saveToStorage(STORAGE_KEYS.SETTINGS, { ...DEFAULT_SETTINGS, ...settings })
}

export const updateSetting = (key, value) => {
  const settings = getSettings()
  const keys = key.split('.')
  let current = settings
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {}
    }
    current = current[keys[i]]
  }
  
  current[keys[keys.length - 1]] = value
  return saveSettings(settings)
}

// Data caching
export const getCachedData = (type) => {
  return getFromStorage(`${type}Data`, null)
}

export const setCachedData = (type, data) => {
  const cacheData = {
    data,
    timestamp: Date.now()
  }
  return saveToStorage(`${type}Data`, cacheData)
}

export const isCacheValid = (type, maxAgeMinutes = 10) => {
  const cached = getCachedData(type)
  if (!cached || !cached.timestamp) {
    return false
  }
  
  const ageMinutes = (Date.now() - cached.timestamp) / (1000 * 60)
  return ageMinutes < maxAgeMinutes
}

export const getCachedDataIfValid = (type, maxAgeMinutes = 10) => {
  if (isCacheValid(type, maxAgeMinutes)) {
    const cached = getCachedData(type)
    return cached.data
  }
  return null
}

// Last update tracking
export const getLastUpdate = (type) => {
  const lastUpdates = getFromStorage(STORAGE_KEYS.LAST_UPDATE, {})
  return lastUpdates[type] || null
}

export const setLastUpdate = (type, timestamp = Date.now()) => {
  const lastUpdates = getFromStorage(STORAGE_KEYS.LAST_UPDATE, {})
  lastUpdates[type] = timestamp
  return saveToStorage(STORAGE_KEYS.LAST_UPDATE, lastUpdates)
}

export const shouldUpdate = (type, intervalMinutes) => {
  const lastUpdate = getLastUpdate(type)
  if (!lastUpdate) {
    return true
  }
  
  const ageMinutes = (Date.now() - lastUpdate) / (1000 * 60)
  return ageMinutes >= intervalMinutes
}

// Export/Import functionality
export const exportAllData = () => {
  const data = {
    apiKeys: getApiKeys(),
    todos: getTodos(),
    theme: getTheme(),
    settings: getSettings(),
    exportDate: new Date().toISOString(),
    version: '1.0'
  }
  
  return data
}

export const importData = (data) => {
  try {
    if (data.apiKeys) {
      saveApiKeys(data.apiKeys)
    }
    if (data.todos) {
      saveTodos(data.todos)
    }
    if (data.theme) {
      saveTheme(data.theme)
    }
    if (data.settings) {
      saveSettings(data.settings)
    }
    
    return true
  } catch (error) {
    console.error('Error importing data:', error)
    return false
  }
}

// Storage usage information
export const getStorageUsage = () => {
  let totalSize = 0
  const usage = {}
  
  for (const key in STORAGE_KEYS) {
    const storageKey = STORAGE_KEYS[key]
    const item = localStorage.getItem(storageKey)
    if (item) {
      const size = new Blob([item]).size
      usage[storageKey] = {
        size,
        sizeKB: Math.round(size / 1024 * 100) / 100
      }
      totalSize += size
    }
  }
  
  return {
    usage,
    totalSize,
    totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
    totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100
  }
}

// Cleanup old cached data
export const cleanupOldCache = (maxAgeHours = 24) => {
  const maxAge = maxAgeHours * 60 * 60 * 1000
  const now = Date.now()
  
  const cacheKeys = ['marketData', 'weatherData', 'newsData']
  
  cacheKeys.forEach(key => {
    const cached = getCachedData(key)
    if (cached && cached.timestamp && (now - cached.timestamp) > maxAge) {
      removeFromStorage(`${key}Data`)
    }
  })
}

// Location management
export const getLocation = () => {
  const settings = getSettings()
  return settings.location || DEFAULT_SETTINGS.location
}

export const setLocation = (cityName, prefecture, latitude, longitude) => {
  const settings = getSettings()
  settings.location = {
    cityName,
    prefecture,
    latitude,
    longitude
  }
  return saveSettings(settings)
}

// Update interval management
export const getUpdateIntervals = () => {
  const settings = getSettings()
  return settings.updateInterval || DEFAULT_SETTINGS.updateInterval
}

export const setUpdateInterval = (type, minutes) => {
  const settings = getSettings()
  if (!settings.updateInterval) {
    settings.updateInterval = { ...DEFAULT_SETTINGS.updateInterval }
  }
  settings.updateInterval[type] = Math.max(1, Math.min(60, minutes)) // 1-60分の範囲
  return saveSettings(settings)
}

export const getAutoUpdateEnabled = () => {
  const settings = getSettings()
  return settings.autoUpdate !== undefined ? settings.autoUpdate : DEFAULT_SETTINGS.autoUpdate
}

export const setAutoUpdateEnabled = (enabled) => {
  return updateSetting('autoUpdate', enabled)
}

// Widget order management
export const getWidgetOrder = () => {
  const settings = getSettings()
  return settings.widgetOrder || DEFAULT_SETTINGS.widgetOrder
}

export const setWidgetOrder = (newOrder) => {
  return updateSetting('widgetOrder', newOrder)
}

export const moveWidget = (fromIndex, toIndex) => {
  const order = getWidgetOrder()
  const newOrder = [...order]
  const [removed] = newOrder.splice(fromIndex, 1)
  newOrder.splice(toIndex, 0, removed)
  return setWidgetOrder(newOrder)
}

// Validation functions
export const validateUpdateInterval = (minutes) => {
  const num = parseInt(minutes, 10)
  return !isNaN(num) && num >= 1 && num <= 60
}

export const validateLocation = (latitude, longitude) => {
  const lat = parseFloat(latitude)
  const lng = parseFloat(longitude)
  return !isNaN(lat) && !isNaN(lng) && 
         lat >= -90 && lat <= 90 && 
         lng >= -180 && lng <= 180
}
