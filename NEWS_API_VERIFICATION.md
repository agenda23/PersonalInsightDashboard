# News API 実装確認

## 📚 News API ドキュメント確認結果

**参照**: [News API Documentation](https://newsapi.org/docs)

---

## ✅ 実装の正確性確認

### 1. エンドポイント

#### Top Headlines（実装済み）
```javascript
// 正しい実装 ✅
const endpoint = 'https://newsapi.org/v2/top-headlines'
const params = {
  country: 'jp',        // 日本のニュース
  category: 'general',  // カテゴリ
  pageSize: 10,         // 取得件数
  apiKey: 'YOUR_KEY'    // APIキー
}
```

**ドキュメントとの一致**: ✅ 完全一致

#### Everything（実装済み）
```javascript
// キーワード検索用
const endpoint = 'https://newsapi.org/v2/everything'
const params = {
  q: 'keyword',         // 検索キーワード
  language: 'ja',       // 日本語
  pageSize: 10,         // 取得件数
  sortBy: 'publishedAt', // 公開日順
  apiKey: 'YOUR_KEY'
}
```

**ドキュメントとの一致**: ✅ 完全一致

---

## 🔍 ニュースが表示されない問題の原因特定

### 症状
- ニュース記事が表示されていない
- エラーメッセージは出ていない
- コンソールにも警告なし

### 調査結果

#### 1. コードの確認 ✅

**fetchNews.js**:
- ✅ News API実装が正しい
- ✅ GNews API代替実装あり
- ✅ モックデータのフォールバックあり
- ✅ エラーハンドリングが適切

**App.jsx**:
- ✅ newsDataの初期値設定あり（5件のモックデータ）
- ✅ ニュースウィジェットのレンダリングコードあり
- ✅ refreshData関数でfetchNews呼び出しあり
- ❌ **初期ロード時にデータを取得するuseEffectがない**

#### 2. 根本原因

```javascript
// 問題: 初期ロード時にデータ取得がない
// App.jsxがマウントされた時、refreshData()が自動実行されない
// → newsDataは初期値のままになる可能性

// 解決策: 初期ロード用のuseEffectを追加
useEffect(() => {
  const loadInitialData = async () => {
    const newsResult = await fetchNews('general', 5)
    setNewsData(newsResult)
  }
  loadInitialData()
}, [])
```

---

## 🔧 実施した修正

### 修正1: 初期データロードの追加

**ファイル**: `src/App.jsx`

**Before**:
```javascript
// 初期ロード用のuseEffectがなかった
useEffect(() => {
  if (!autoUpdateEnabled) return
  // 自動更新のintervalのみ
}, [updateIntervals, autoUpdateEnabled])
```

**After**:
```javascript
// 初期データロード用のuseEffectを追加
useEffect(() => {
  const loadInitialData = async () => {
    try {
      const newsResult = await fetchNews('general', 5)
      setNewsData(newsResult)
      console.log('Initial news data loaded:', newsResult.length, 'articles')
    } catch (error) {
      console.error('Failed to load initial news data:', error)
    }
  }
  
  loadInitialData()
}, [])

// 自動更新用のuseEffect（既存）
useEffect(() => {
  if (!autoUpdateEnabled) return
  // ...
}, [updateIntervals, autoUpdateEnabled])
```

### 修正2: データ表示の条件分岐改善

**ファイル**: `src/App.jsx`

**Before**:
```javascript
<div className="space-y-3">
  {newsData.slice(0, 5).map((news) => (
    // ...
  ))}
</div>
```

**After**:
```javascript
<div className="space-y-3">
  {newsData && newsData.length > 0 ? (
    newsData.slice(0, 5).map((news) => (
      // ...
    ))
  ) : (
    <div className="p-4 text-center text-gray-500">
      <p>ニュースデータを読み込んでいます...</p>
      <p className="text-xs mt-2">データが表示されない場合は、更新ボタンを押してください。</p>
    </div>
  )}
</div>
```

---

## 📊 News API の仕様詳細

### 利用可能なエンドポイント

#### 1. Top Headlines
**URL**: `GET https://newsapi.org/v2/top-headlines`

**パラメータ**:
| パラメータ | 必須 | 説明 | 例 |
|-----------|------|------|-----|
| apiKey | ✅ | APIキー | `your_api_key_here` |
| country | ⭕ | 国コード（ISO 3166-1） | `jp`, `us`, `gb` |
| category | ⭕ | カテゴリ | `business`, `technology`, `sports` |
| sources | ⭕ | ニュースソースID | `bbc-news`, `cnn` |
| q | ⭕ | キーワード検索 | `bitcoin`, `earthquake` |
| pageSize | ⭕ | 1ページの記事数（最大100） | `10`, `20` |
| page | ⭕ | ページ番号 | `1`, `2` |

**注**: `country`, `category`は`sources`と併用不可

**カテゴリ一覧**:
- `business` - ビジネス
- `entertainment` - エンターテインメント
- `general` - 一般
- `health` - 健康
- `science` - 科学
- `sports` - スポーツ
- `technology` - テクノロジー

**レスポンス例**:
```json
{
  "status": "ok",
  "totalResults": 38,
  "articles": [
    {
      "source": {
        "id": null,
        "name": "Yahoo.co.jp"
      },
      "author": "編集部",
      "title": "日経平均株価が続伸、年初来高値を更新",
      "description": "東京株式市場で日経平均株価が続伸...",
      "url": "https://news.yahoo.co.jp/...",
      "urlToImage": "https://...",
      "publishedAt": "2024-01-15T10:30:00Z",
      "content": "詳細な記事内容..."
    }
  ]
}
```

#### 2. Everything
**URL**: `GET https://newsapi.org/v2/everything`

**パラメータ**:
| パラメータ | 必須 | 説明 | 例 |
|-----------|------|------|-----|
| apiKey | ✅ | APIキー | `your_api_key_here` |
| q | ✅ | 検索キーワード | `bitcoin`, `earthquake` |
| searchIn | ⭕ | 検索対象 | `title`, `description`, `content` |
| sources | ⭕ | ニュースソースID | `bbc-news`, `cnn` |
| domains | ⭕ | ドメイン指定 | `bbc.co.uk`, `techcrunch.com` |
| from | ⭕ | 開始日（ISO 8601） | `2024-01-01` |
| to | ⭕ | 終了日（ISO 8601） | `2024-01-31` |
| language | ⭕ | 言語コード（ISO 639-1） | `ja`, `en` |
| sortBy | ⭕ | ソート順 | `relevancy`, `popularity`, `publishedAt` |
| pageSize | ⭕ | 1ページの記事数（最大100） | `10`, `20` |
| page | ⭕ | ページ番号 | `1`, `2` |

#### 3. Sources
**URL**: `GET https://newsapi.org/v2/top-headlines/sources`

ニュースソースのリストを取得

---

## 🚨 News API 制限事項

### 無料プラン（Developer Plan）

#### レート制限
- **100 requests/day**（1日100リクエスト）
- **5 requests/second**（1秒5リクエスト）

#### 機能制限
- ✅ Top Headlines
- ✅ Everything
- ✅ Sources
- ❌ **過去1ヶ月以前の記事は取得不可**
- ❌ **商用利用不可**
- ❌ **キャッシュ必須**

### エラーレスポンス

#### 429: Too Many Requests
```json
{
  "status": "error",
  "code": "rateLimited",
  "message": "You have made too many requests recently. Developer accounts are limited to 100 requests over a 24 hour period (50 requests available every 12 hours). Please upgrade to a paid plan if you need more requests."
}
```

#### 401: Unauthorized
```json
{
  "status": "error",
  "code": "apiKeyInvalid",
  "message": "Your API key is invalid or incorrect. Check your key, or go to https://newsapi.org to create a free API key."
}
```

#### 426: Upgrade Required
```json
{
  "status": "error",
  "code": "upgradeRequired",
  "message": "Your API key has been restricted. Please check your email or visit your account dashboard for more information."
}
```

---

## 💡 実装のベストプラクティス

### 1. エラーハンドリング

当アプリの実装（既に対応済み）:
```javascript
export const fetchNews = async (category = 'general', maxItems = 10) => {
  try {
    // 1. NewsAPIを試す
    try {
      return await fetchNewsFromNewsAPI(category, 'jp', maxItems)
    } catch (newsApiError) {
      console.warn('NewsAPI failed, trying GNews:', newsApiError.message)
      
      // 2. GNewsをフォールバックとして試す
      try {
        return await fetchNewsFromGNews(category, 'ja', maxItems)
      } catch (gnewsError) {
        console.warn('GNews also failed:', gnewsError.message)
        throw new Error('All news APIs failed')
      }
    }
  } catch (error) {
    // 3. 最終的にモックデータを返す
    console.error('Error fetching news:', error)
    return [/* モックデータ */]
  }
}
```

### 2. キャッシング戦略

```javascript
// 推奨: localStorageにキャッシュ
const CACHE_KEY = 'news_cache'
const CACHE_DURATION = 15 * 60 * 1000 // 15分

const getCachedNews = () => {
  const cached = localStorage.getItem(CACHE_KEY)
  if (!cached) return null
  
  const { data, timestamp } = JSON.parse(cached)
  const now = Date.now()
  
  if (now - timestamp > CACHE_DURATION) {
    return null // キャッシュ期限切れ
  }
  
  return data
}

const setCachedNews = (data) => {
  const cache = {
    data,
    timestamp: Date.now()
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
}
```

### 3. レート制限対策

```javascript
// リクエスト回数をlocalStorageで追跡
const RATE_LIMIT_KEY = 'newsapi_requests'
const MAX_REQUESTS_PER_DAY = 100

const canMakeRequest = () => {
  const stored = localStorage.getItem(RATE_LIMIT_KEY)
  if (!stored) return true
  
  const { count, date } = JSON.parse(stored)
  const today = new Date().toDateString()
  
  if (date !== today) {
    // 新しい日 - カウンターリセット
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
      count: 0,
      date: today
    }))
    return true
  }
  
  return count < MAX_REQUESTS_PER_DAY
}

const incrementRequestCount = () => {
  const stored = localStorage.getItem(RATE_LIMIT_KEY)
  const today = new Date().toDateString()
  const current = stored ? JSON.parse(stored) : { count: 0, date: today }
  
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
    count: current.count + 1,
    date: today
  }))
}
```

---

## 🎯 テスト方法

### 1. ブラウザで直接テスト

```bash
# APIキーの動作確認
curl "https://newsapi.org/v2/top-headlines?country=jp&category=technology&pageSize=5&apiKey=YOUR_API_KEY"
```

### 2. アプリケーションでのテスト

#### ステップ1: APIキーを設定
1. ダッシュボードの「設定」タブを開く
2. 「News API Key」欄にAPIキーを入力
3. 「設定を保存」をクリック

#### ステップ2: データを更新
1. ダッシュボードに戻る
2. 「更新」ボタンをクリック
3. ニュースウィジェットを確認

#### ステップ3: コンソールで確認
```javascript
// ブラウザのコンソールで実行
localStorage.getItem('apiKeys') // APIキーの確認
```

---

## 📝 まとめ

### ✅ 実装済み機能

1. **News API連携**
   - Top Headlines（トップニュース）
   - Everything（キーワード検索）
   - 適切なパラメータ設定

2. **エラーハンドリング**
   - News API失敗時にGNewsへフォールバック
   - 全API失敗時はモックデータ表示
   - ユーザーフレンドリーなエラーメッセージ

3. **UI/UX**
   - APIキー未設定時の警告表示
   - データ読み込み中メッセージ
   - 設定画面への誘導

### 🔧 今回の修正

1. **初期データロードの追加**
   - ページロード時に自動的にニュースデータを取得
   - コンソールログで取得状況を確認可能

2. **データ表示の改善**
   - newsDataの存在チェック追加
   - データなし時のメッセージ表示

### 🎯 期待される動作

#### APIキー未設定の場合
1. 黄色の警告ボックス表示
2. モックデータ（5件）表示
3. 「設定画面でAPIキーを登録」ボタン

#### APIキー設定済みの場合
1. 初期ロード時に自動的にNews APIからデータ取得
2. 成功: 実際のニュース表示
3. 失敗: GNews APIへフォールバック
4. 全失敗: モックデータ表示

---

**最終更新**: 2025年10月8日  
**バージョン**: 2.2.1  
**ステータス**: ✅ 修正完了・動作確認待ち
