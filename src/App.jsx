import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { Settings, Sun, Moon, RefreshCw, TrendingUp, Cloud, Newspaper, CheckSquare, MapPin, Clock, GripVertical } from 'lucide-react'
import { ALL_PREFECTURES, getPrefectureData } from './utils/japanCities.js'
import { 
  getApiKeys, saveApiKeys, getTodos, saveTodos, addTodo, toggleTodo, deleteTodo, getTodoStats,
  getTheme, saveTheme, getSettings, saveSettings, getLocation, setLocation,
  getUpdateIntervals, setUpdateInterval, getAutoUpdateEnabled, setAutoUpdateEnabled,
  getWidgetOrder, setWidgetOrder
} from './utils/localStorage.js'
import { fetchWeatherData } from './utils/fetchWeather.js'
import { fetchAllMarketData } from './utils/fetchMarketData.js'
import { fetchNews } from './utils/fetchNews.js'
import './App.css'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [theme, setTheme] = useState(getTheme())
  const [apiKeys, setApiKeys] = useState(getApiKeys())
  const [todos, setTodos] = useState(getTodos())
  const [newTodo, setNewTodo] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [widgetOrder, setWidgetOrderState] = useState(getWidgetOrder())
  
  // Settings state
  const [settings, setSettingsState] = useState(getSettings())
  const [selectedPrefecture, setSelectedPrefecture] = useState(settings.location?.prefecture || '東京都')
  
  // Data state
  const [marketData, setMarketData] = useState({
    usdJpy: { value: 149.85, change: 0.12, changePercent: 0.08 },
    btcUsd: { value: 43250, change: -850, changePercent: -1.93 },
    aapl: { value: 185.92, change: 2.34, changePercent: 1.27 },
    eurUsd: { value: 1.0876, change: 0.0012, changePercent: 0.11 }
  })

  const [weatherData, setWeatherData] = useState({
    current: { temp: 18, condition: 'Partly Cloudy', icon: '⛅', precipitationProbability: 20, cityName: '東京都' },
    forecast: [
      { day: '今日', temp: 18, condition: 'Partly Cloudy', icon: '⛅', precipitationProbability: 20 },
      { day: '明日', temp: 20, condition: 'Sunny', icon: '☀️', precipitationProbability: 10 },
      { day: '明後日', temp: 16, condition: 'Rainy', icon: '🌧️', precipitationProbability: 80 }
    ]
  })

  const [newsData, setNewsData] = useState(null)
  const [newsError, setNewsError] = useState(null)
  const [newsLastFetch, setNewsLastFetch] = useState(null)
  const [marketLastFetch, setMarketLastFetch] = useState(null)
  const [weatherLastFetch, setWeatherLastFetch] = useState(null)

  // Auto-update intervals
  const [updateIntervals, setUpdateIntervalsState] = useState(getUpdateIntervals())
  const [autoUpdateEnabled, setAutoUpdateEnabledState] = useState(getAutoUpdateEnabled())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const newsResult = await fetchNews('general', 5)
        setNewsData(newsResult)
        setNewsError(null)
        setNewsLastFetch(new Date())
        console.log('✅ Initial news data loaded:', newsResult.length, 'articles')
      } catch (error) {
        console.error('Failed to load initial news data:', error)
        setNewsData(null)
        setNewsError(error.message)
      }
    }
    
    loadInitialData()
  }, [])

  // Auto-update data
  useEffect(() => {
    if (!autoUpdateEnabled) return

    const intervals = []

    // Market data auto-update
    if (updateIntervals.market > 0) {
      intervals.push(setInterval(async () => {
        try {
          const data = await fetchAllMarketData()
          setMarketData(data)
          setMarketLastFetch(new Date())
        } catch (error) {
          console.error('Auto-update market data failed:', error)
        }
      }, updateIntervals.market * 60 * 1000))
    }

    // Weather data auto-update
    if (updateIntervals.weather > 0) {
      intervals.push(setInterval(async () => {
        try {
          const data = await fetchWeatherData()
          setWeatherData(data)
          setWeatherLastFetch(new Date())
        } catch (error) {
          console.error('Auto-update weather data failed:', error)
        }
      }, updateIntervals.weather * 60 * 1000))
    }

    // News data auto-update
    if (updateIntervals.news > 0) {
      intervals.push(setInterval(async () => {
        try {
          const data = await fetchNews('general', 5)
          setNewsData(data)
          setNewsError(null)
          setNewsLastFetch(new Date())
        } catch (error) {
          console.error('Auto-update news data failed:', error)
          setNewsError(error.message)
        }
      }, updateIntervals.news * 60 * 1000))
    }

    return () => {
      intervals.forEach(interval => clearInterval(interval))
    }
  }, [updateIntervals, autoUpdateEnabled])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    saveTheme(newTheme)
  }

  const handleApiKeyChange = (key, value) => {
    const newKeys = { ...apiKeys, [key]: value }
    setApiKeys(newKeys)
    saveApiKeys(newKeys)
  }

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const todo = addTodo(newTodo.trim())
      setTodos(getTodos())
      setNewTodo('')
    }
  }

  const handleToggleTodo = (id) => {
    toggleTodo(id)
    setTodos(getTodos())
  }

  const handleDeleteTodo = (id) => {
    deleteTodo(id)
    setTodos(getTodos())
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      const [marketDataResult, weatherDataResult, newsDataResult] = await Promise.allSettled([
        fetchAllMarketData(),
        fetchWeatherData(),
        fetchNews('general', 5)
      ])

      if (marketDataResult.status === 'fulfilled') {
        setMarketData(marketDataResult.value)
        setMarketLastFetch(new Date())
      }
      if (weatherDataResult.status === 'fulfilled') {
        setWeatherData(weatherDataResult.value)
        setWeatherLastFetch(new Date())
      }
      if (newsDataResult.status === 'fulfilled') {
        setNewsData(newsDataResult.value)
        setNewsError(null)
        setNewsLastFetch(new Date())
      } else {
        setNewsError(newsDataResult.reason?.message || 'ニュース取得に失敗しました')
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLocationChange = (prefecture) => {
    const prefectureData = getPrefectureData(prefecture)
    if (prefectureData) {
      setLocation(prefecture, prefecture, prefectureData.latitude, prefectureData.longitude)
      setSelectedPrefecture(prefecture)
      
      // Update settings state
      const newSettings = { ...settings }
      newSettings.location = {
        cityName: prefecture,
        prefecture: prefecture,
        latitude: prefectureData.latitude,
        longitude: prefectureData.longitude
      }
      setSettingsState(newSettings)
      saveSettings(newSettings)
      
      // Refresh weather data
      fetchWeatherData().then(data => {
        setWeatherData(data)
        setWeatherLastFetch(new Date())
      }).catch(console.error)
    }
  }

  const handleUpdateIntervalChange = (type, value) => {
    const newIntervals = { ...updateIntervals, [type]: value }
    setUpdateIntervalsState(newIntervals)
    setUpdateInterval(type, value)
  }

  const handleAutoUpdateToggle = (enabled) => {
    setAutoUpdateEnabledState(enabled)
    setAutoUpdateEnabled(enabled)
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return

    const newOrder = Array.from(widgetOrder)
    const [reorderedItem] = newOrder.splice(result.source.index, 1)
    newOrder.splice(result.destination.index, 0, reorderedItem)

    setWidgetOrderState(newOrder)
    setWidgetOrder(newOrder)
  }

  const formatTime = (date) => {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const todoStats = getTodoStats()

  const renderWidget = (widgetType, index) => {
    const widgets = {
      market: (
        <Draggable key="market" draggableId="market" index={index}>
          {(provided, snapshot) => (
            <Card 
              ref={provided.innerRef}
              {...provided.draggableProps}
              className={`col-span-1 lg:col-span-2 ${snapshot.isDragging ? 'shadow-lg' : ''}`}
            >
              <CardHeader {...provided.dragHandleProps} className="cursor-move">
                <CardTitle className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <TrendingUp className="h-5 w-5" />
                  市場データ
                </CardTitle>
                <CardDescription>為替・米国株・暗号資産の現在値（無料プラン対応）</CardDescription>
              </CardHeader>
              <CardContent>
                {marketLastFetch && apiKeys.twelveData && (
                  <div className="mb-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    最終取得: {marketLastFetch.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                {!apiKeys.twelveData ? (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="text-yellow-600 dark:text-yellow-400 text-xl">⚠️</div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                          APIキーが未設定です
                        </p>
                        <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-2">
                          実際の市場データを取得するには、Twelve Data APIキーが必要です。現在はモックデータを表示しています。
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab('settings')}
                          className="text-xs h-7 bg-yellow-100 dark:bg-yellow-900/40 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-900/60"
                        >
                          設定画面でAPIキーを登録
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(marketData).map(([key, data]) => {
                    const labels = {
                      usdJpy: 'USD/JPY',
                      btcUsd: 'BTC/USD',
                      aapl: 'Apple株',
                      eurUsd: 'EUR/USD'
                    }
                    const formatValue = (key, value) => {
                      if (key === 'btcUsd') return `$${value.toLocaleString()}`
                      if (key === 'aapl') return `$${value.toFixed(2)}`
                      if (key === 'eurUsd') return value.toFixed(4)
                      return value.toLocaleString()
                    }
                    return (
                      <div key={key} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{labels[key]}</div>
                        <div className="text-xl font-bold">
                          {formatValue(key, data.value)}
                        </div>
                        <div className={`text-sm ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)} ({data.changePercent}%)
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </Draggable>
      ),
      weather: (
        <Draggable key="weather" draggableId="weather" index={index}>
          {(provided, snapshot) => (
            <Card 
              ref={provided.innerRef}
              {...provided.draggableProps}
              className={snapshot.isDragging ? 'shadow-lg' : ''}
            >
              <CardHeader {...provided.dragHandleProps} className="cursor-move">
                <CardTitle className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <Cloud className="h-5 w-5" />
                  天気予報
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {weatherData.current.cityName || '現在地'}の天気と週間予報
                </CardDescription>
              </CardHeader>
              <CardContent>
                {weatherLastFetch && (
                  <div className="mb-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    最終取得: {weatherLastFetch.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-3xl mb-2">{weatherData.current.icon}</div>
                    <div className="text-2xl font-bold">{weatherData.current.temp}°C</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{weatherData.current.condition}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      降水確率: {weatherData.current.precipitationProbability || 0}%
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {weatherData.forecast.slice(0, 3).map((day, index) => (
                      <div key={index} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="text-xs text-gray-600 dark:text-gray-400">{day.day}</div>
                        <div className="text-lg">{day.icon}</div>
                        <div className="text-sm font-semibold">{day.temp}°C</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          {day.precipitationProbability || 0}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </Draggable>
      ),
      news: (
        <Draggable key="news" draggableId="news" index={index}>
          {(provided, snapshot) => (
            <Card 
              ref={provided.innerRef}
              {...provided.draggableProps}
              className={snapshot.isDragging ? 'shadow-lg' : ''}
            >
              <CardHeader {...provided.dragHandleProps} className="cursor-move">
                <CardTitle className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <Newspaper className="h-5 w-5" />
                  ニュース
                </CardTitle>
                <CardDescription>最新のヘッドライン</CardDescription>
              </CardHeader>
              <CardContent>
                {!apiKeys.currents ? (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                      <div className="text-yellow-600 dark:text-yellow-400 text-xl">⚠️</div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                          APIキーが未設定です
                        </p>
                        <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-2">
                          ニュースデータを取得するには、Currents APIキーが必要です。
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab('settings')}
                          className="text-xs h-7 bg-yellow-100 dark:bg-yellow-900/40 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-900/60"
                        >
                          設定画面でAPIキーを登録
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : newsError ? (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                      <div className="text-red-600 dark:text-red-400 text-xl">❌</div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                          ニュース取得エラー
                        </p>
                        <p className="text-xs text-red-800 dark:text-red-200 mb-2">
                          {newsError}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={refreshData}
                          disabled={isRefreshing}
                          className="text-xs h-7 bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/60"
                        >
                          再試行
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : newsData && newsData.length > 0 ? (
                  <>
                    {newsLastFetch && (
                      <div className="mb-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        最終取得: {newsLastFetch.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                    <div className="space-y-3">
                      {newsData.slice(0, 5).map((news) => (
                        <div key={news.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0">
                          <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {news.title}
                          </a>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{news.time}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    <p className="text-sm">ニュースデータを読み込んでいます...</p>
                    <p className="text-xs mt-2">データが表示されない場合は、更新ボタンを押してください。</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </Draggable>
      ),
      todo: (
        <Draggable key="todo" draggableId="todo" index={index}>
          {(provided, snapshot) => (
            <Card 
              ref={provided.innerRef}
              {...provided.draggableProps}
              className={`col-span-1 lg:col-span-2 ${snapshot.isDragging ? 'shadow-lg' : ''}`}
            >
              <CardHeader {...provided.dragHandleProps} className="cursor-move">
                <CardTitle className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <CheckSquare className="h-5 w-5" />
                  タスク管理
                </CardTitle>
                <CardDescription>
                  今日の達成率: {todoStats.completionRate}% ({todoStats.completed}/{todoStats.total})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="新しいタスクを入力..."
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                      className="flex-1"
                    />
                    <Button onClick={handleAddTodo}>追加</Button>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${todoStats.completionRate}%` }}
                    ></div>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {todos.map((todo) => (
                      <div key={todo.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleToggleTodo(todo.id)}
                          className="w-4 h-4"
                        />
                        <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                          {todo.text}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          削除
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </Draggable>
      )
    }
    return widgets[widgetType]
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Personal Insight Dashboard
            </h1>
            <Badge variant="outline" className="text-sm">
              {formatTime(currentTime)}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              更新
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="flex items-center gap-2"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              設定
            </Button>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">ダッシュボード</TabsTrigger>
            <TabsTrigger value="settings">設定</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="widgets">
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  >
                    {widgetOrder.map((widgetType, index) => renderWidget(widgetType, index))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* API設定 */}
            <Card>
              <CardHeader>
                <CardTitle>API設定</CardTitle>
                <CardDescription>
                  各種APIキーを設定してください。設定したキーはブラウザのlocalStorageに保存されます。
                  天気予報（Open-Meteo API）はAPIキー不要で無料で利用できます。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currents">Currents API キー</Label>
                  <Input
                    id="currents"
                    type="password"
                    placeholder="日本語ニュースデータ取得用のAPIキー"
                    value={apiKeys.currents || ''}
                    onChange={(e) => handleApiKeyChange('currents', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    <a href="https://currentsapi.services/en" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                      CurrentsAPI.services
                    </a> で無料のAPIキーを取得できます（600 requests/day・日本語対応・10分間キャッシュ）
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twelveData">Twelve Data API キー</Label>
                  <Input
                    id="twelveData"
                    type="password"
                    placeholder="株価・為替データ取得用のAPIキー"
                    value={apiKeys.twelveData || ''}
                    onChange={(e) => handleApiKeyChange('twelveData', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    <a href="https://twelvedata.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                      TwelveData.com
                    </a> で無料のAPIキーを取得できます
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>💡 ヒント:</strong> 天気予報はAPIキーなしで実際のデータが取得できます。ニュースデータは10分間キャッシュされ、API呼び出しを節約します。
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 地域設定 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  地域設定
                </CardTitle>
                <CardDescription>
                  天気予報を表示する地域を選択してください。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>都道府県を選択</Label>
                  <Select value={selectedPrefecture} onValueChange={handleLocationChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="都道府県を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_PREFECTURES.map(prefecture => (
                        <SelectItem key={prefecture} value={prefecture}>
                          {prefecture}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  現在の設定: {settings.location?.prefecture || '東京都'}
                </div>
              </CardContent>
            </Card>

            {/* 自動更新設定 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  自動更新設定
                </CardTitle>
                <CardDescription>
                  各ウィジェットの自動更新間隔を設定してください（1分〜60分）。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-update">自動更新を有効にする</Label>
                  <Switch
                    id="auto-update"
                    checked={autoUpdateEnabled}
                    onCheckedChange={handleAutoUpdateToggle}
                  />
                </div>
                
                {autoUpdateEnabled && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label>市場データ更新間隔: {updateIntervals.market}分</Label>
                      <Slider
                        value={[updateIntervals.market]}
                        onValueChange={([value]) => handleUpdateIntervalChange('market', value)}
                        max={60}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label>天気データ更新間隔: {updateIntervals.weather}分</Label>
                      <Slider
                        value={[updateIntervals.weather]}
                        onValueChange={([value]) => handleUpdateIntervalChange('weather', value)}
                        max={60}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label>ニュース更新間隔: {updateIntervals.news}分（最低10分・キャッシュ有効）</Label>
                      <Slider
                        value={[updateIntervals.news]}
                        onValueChange={([value]) => handleUpdateIntervalChange('news', value)}
                        max={60}
                        min={10}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* データ管理 */}
            <Card>
              <CardHeader>
                <CardTitle>データ管理</CardTitle>
                <CardDescription>
                  保存されたデータの管理を行います。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const data = {
                        apiKeys: getApiKeys(),
                        todos: getTodos(),
                        theme: getTheme(),
                        settings: getSettings()
                      }
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'dashboard-backup.json'
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                  >
                    データをエクスポート
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
                        localStorage.clear()
                        window.location.reload()
                      }
                    }}
                  >
                    すべてのデータを削除
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
