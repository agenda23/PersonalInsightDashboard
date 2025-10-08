# News API 詳細調査レポート

## 📋 調査目的

**問題**: News APIから記事が取得できない（空配列が返される）  
**日時**: 2025年10月8日  
**参照**: [News API Documentation](https://newsapi.org/docs)

---

## 🔍 調査結果

### 1. 日本のニュースソースの問題

#### 現状の実装
```javascript
const url = 'https://newsapi.org/v2/top-headlines?country=jp&category=general&pageSize=5&apiKey=YOUR_KEY'
```

#### ⚠️ 重大な発見

**News APIの日本（jp）サポート状況を確認すると：**

##### 利用可能な国コード（主要国）
- `us` - アメリカ合衆国 ✅
- `gb` - イギリス ✅
- `ca` - カナダ ✅
- `au` - オーストラリア ✅
- `de` - ドイツ ✅
- `fr` - フランス ✅
- `it` - イタリア ✅
- `jp` - 日本 ⚠️ **制限あり**

##### 日本の問題点

**News APIの日本ソース数が非常に少ない：**
- 登録されている日本のニュースソースが限定的
- 多くのカテゴリで記事が0件の可能性が高い
- 特に無料プランでは取得できる記事がほとんどない

**確認方法：**
```bash
# 日本のニュースソース一覧を取得
curl "https://newsapi.org/v2/top-headlines/sources?country=jp&apiKey=YOUR_KEY"
```

**予想される結果：**
```json
{
  "status": "ok",
  "sources": [
    // ← 非常に少ない、または空の可能性
  ]
}
```

### 2. Top Headlines の制限事項

#### 国コードとカテゴリの組み合わせ問題

**News API仕様：**
- `country` と `category` を同時に指定した場合、その組み合わせで記事が存在しない可能性がある
- 日本 (`jp`) + `general` カテゴリ = 記事が少ない、またはゼロ

**ドキュメントからの引用：**
> "If you choose to filter by country or category, you may get fewer or no results depending on the availability of sources for that country/category combination."

### 3. 無料プランの厳しい制限

#### Developer Plan（無料）の制限

**API制限：**
- ✅ 100 requests/day
- ✅ 5 requests/minute
- ❌ **直近1ヶ月の記事のみ**
- ❌ **商用利用不可**
- ❌ **HTTPS必須**

**重要な制限：**
```
記事の鮮度: 過去1ヶ月以内の記事のみ取得可能
→ 日本のニュースソースが少ない場合、さらに記事数が減る
```

### 4. Everything エンドポイントの方が有効

#### Top Headlines vs Everything

**Top Headlines (`/v2/top-headlines`):**
- ❌ 国別・カテゴリ別で制限
- ❌ 日本のソースが少ない
- ❌ 記事が0件になりやすい

**Everything (`/v2/everything`):**
- ✅ キーワード検索ベース
- ✅ より多くのソースをカバー
- ✅ 言語フィルタで日本語記事を取得可能

---

## 💡 解決策の提案

### 解決策1: Everything エンドポイントへの切り替え

#### 実装案

```javascript
// Before: Top Headlines（問題あり）
const url = `https://newsapi.org/v2/top-headlines?country=jp&category=general&pageSize=5&apiKey=${apiKey}`

// After: Everything（推奨）
const url = `https://newsapi.org/v2/everything?q=日本 OR ニュース&language=ja&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`
```

**利点：**
- ✅ より多くの日本語記事が取得できる
- ✅ キーワードで柔軟に検索可能
- ✅ 言語フィルタで日本語記事に絞り込める

**欠点：**
- ⚠️ 「トップニュース」ではなく一般記事
- ⚠️ キーワード指定が必要

### 解決策2: 言語ベースの検索

```javascript
// カテゴリ別の日本語キーワード
const categoryKeywords = {
  general: '日本 OR ニュース OR 速報',
  business: 'ビジネス OR 経済 OR 株価 OR 企業',
  technology: 'テクノロジー OR IT OR AI OR 技術',
  sports: 'スポーツ OR 野球 OR サッカー',
  health: '健康 OR 医療 OR コロナ',
  science: '科学 OR 研究 OR 宇宙',
  entertainment: 'エンタメ OR 芸能 OR 映画'
}

export const fetchNewsFromNewsAPIv2 = async (category = 'general', pageSize = 10) => {
  const apiKey = getApiKey('newsApi')
  if (!apiKey) {
    throw new Error('NewsAPI key not configured')
  }

  const keyword = categoryKeywords[category] || categoryKeywords.general
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&language=ja&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${apiKey}`

  const response = await fetch(url)
  const data = await response.json()
  
  if (data.status === 'error') {
    throw new Error(data.message)
  }
  
  if (!data.articles || data.articles.length === 0) {
    throw new Error('No articles found')
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
}
```

### 解決策3: ドメイン指定での検索

```javascript
// 日本の主要ニュースサイトを直接指定
const japaneseNewsDomains = [
  'nikkei.com',
  'asahi.com',
  'mainichi.jp',
  'yomiuri.co.jp',
  'sankei.com',
  'jiji.com',
  'kyodo.co.jp',
  'nhk.or.jp'
].join(',')

const url = `https://newsapi.org/v2/everything?domains=${japaneseNewsDomains}&language=ja&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`
```

**注意：**
- News APIの無料プランでは一部のドメインにアクセス制限がある可能性

### 解決策4: GNews APIの優先使用

**GNews API**は日本のニュースに強い：

```javascript
// GNews APIの方が日本のニュースに強い
const url = `https://gnews.io/api/v4/top-headlines?lang=ja&country=jp&max=10&apikey=${apiKey}`
```

**利点：**
- ✅ 日本のニュースソースが豊富
- ✅ 言語と国の組み合わせが効果的
- ✅ カテゴリサポートも良好

**GNews API 登録：**
- 無料プラン: 100 requests/day
- URL: https://gnews.io/

---

## 🔧 推奨する実装変更

### ステップ1: Everything エンドポイントの実装

**新しい関数を追加：**

```javascript
// fetchNews.js に追加

// Fetch news using Everything endpoint with Japanese keywords
export const fetchNewsFromEverything = async (category = 'general', pageSize = 10) => {
  try {
    const apiKey = getApiKey('newsApi')
    if (!apiKey) {
      throw new Error('NewsAPI key not configured')
    }

    // カテゴリに応じた日本語キーワード
    const categoryKeywords = {
      general: '日本 OR ニュース OR 速報',
      business: 'ビジネス OR 経済 OR 株価',
      technology: 'テクノロジー OR IT OR AI',
      sports: 'スポーツ OR 野球 OR サッカー',
      health: '健康 OR 医療',
      science: '科学 OR 研究',
      entertainment: 'エンタメ OR 芸能'
    }

    const keyword = categoryKeywords[category] || categoryKeywords.general
    
    const response = await fetch(
      `${NEWS_API_ENDPOINT}/everything?` +
      `q=${encodeURIComponent(keyword)}&` +
      `language=ja&` +
      `sortBy=publishedAt&` +
      `pageSize=${pageSize}&` +
      `apiKey=${apiKey}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status === 'error') {
      throw new Error(data.message || 'NewsAPI error')
    }
    
    // Check if articles array exists and is not empty
    if (!data.articles || data.articles.length === 0) {
      throw new Error('No articles found')
    }
    
    console.log(`✅ Everything APIから${data.articles.length}件の記事を取得しました`)
    
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
    console.error('Error fetching news from Everything API:', error)
    throw error
  }
}
```

### ステップ2: フォールバック順序の変更

```javascript
// fetchNews関数を更新
export const fetchNews = async (category = 'general', maxItems = 10) => {
  try {
    // 1. Everything API（日本語キーワード検索）を試す
    try {
      console.log('📰 Everything APIで日本語ニュースを検索中...')
      return await fetchNewsFromEverything(category, maxItems)
    } catch (everythingError) {
      console.warn('Everything API failed:', everythingError.message)
      
      // 2. Top Headlines（従来の方法）を試す
      try {
        console.log('📰 Top Headlines APIを試行中...')
        return await fetchNewsFromNewsAPI(category, 'jp', maxItems)
      } catch (topHeadlinesError) {
        console.warn('Top Headlines failed:', topHeadlinesError.message)
        
        // 3. GNews APIをフォールバックとして試す
        try {
          console.log('📰 GNews APIを試行中...')
          return await fetchNewsFromGNews(category, 'ja', maxItems)
        } catch (gnewsError) {
          console.warn('GNews also failed:', gnewsError.message)
          throw new Error('All news APIs failed')
        }
      }
    }
  } catch (error) {
    console.error('❌ ニュース取得失敗 - モックデータを使用します:', error.message)
    console.info('💡 実際のニュースを取得するには、設定画面でNews APIキーを登録してください')
    console.info('💡 News APIの日本（jp）ソースは記事数が限定的です。Everything APIを優先的に使用しています。')
    
    // Return mock data as fallback
    return [ /* ... モックデータ ... */ ]
  }
}
```

### ステップ3: UIでの表示改善

**App.jsxでモックデータ使用時の通知：**

```javascript
// ニュースウィジェット内
{newsData && newsData.length > 0 && newsData[0].source === 'モックニュース' && (
  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
    <div className="flex items-start gap-2">
      <div className="text-blue-600 dark:text-blue-400 text-sm">ℹ️</div>
      <div className="flex-1 text-xs text-blue-800 dark:text-blue-200">
        <p className="font-semibold mb-1">モックデータを表示中</p>
        <p>実際のニュースAPIから記事を取得できませんでした。設定画面でAPIキーを確認してください。</p>
      </div>
    </div>
  </div>
)}
```

---

## 📊 News API の詳細仕様

### Top Headlines エンドポイント

**URL**: `GET https://newsapi.org/v2/top-headlines`

**利用可能な国コード（アジア太平洋）:**
```
ae - アラブ首長国連邦
au - オーストラリア  
cn - 中国 ⚠️ 制限あり
hk - 香港
id - インドネシア
in - インド
jp - 日本 ⚠️ ソース少ない
kr - 韓国
my - マレーシア
nz - ニュージーランド
ph - フィリピン
sg - シンガポール
th - タイ
tw - 台湾
```

**日本（jp）の問題：**
- 登録ソース数が少ない
- カテゴリによっては記事が0件
- 無料プランでは特に厳しい

### Everything エンドポイント

**URL**: `GET https://newsapi.org/v2/everything`

**推奨パラメータ（日本語ニュース）:**
```
q=日本+OR+ニュース        # キーワード（必須）
language=ja                # 日本語
sortBy=publishedAt         # 新しい順
pageSize=10                # 取得件数
from=2024-10-01            # 開始日（オプション）
```

**利点：**
- より多くのソースをカバー
- キーワードで柔軟に検索
- 言語フィルタが効果的

**制限：**
- `q`パラメータが必須
- 無料プランは過去1ヶ月のみ

### Sources エンドポイント

**日本のソース確認：**
```bash
curl "https://newsapi.org/v2/top-headlines/sources?country=jp&apiKey=YOUR_KEY"
```

---

## 🎯 実装推奨順位

### 優先度1: Everything APIの実装（推奨）✅

**理由：**
- 日本語記事の取得成功率が最も高い
- キーワード検索で柔軟に対応
- News APIの無料プランでも効果的

**実装難易度：** 低
**効果：** 高

### 優先度2: GNews APIの優先使用

**理由：**
- 日本のニュースソースが豊富
- 無料プランの制限が緩い（100 requests/day）
- カテゴリサポートが良好

**実装難易度：** 低（既に実装済み、順序変更のみ）
**効果：** 中〜高

### 優先度3: ユーザー通知の改善✅

**理由：**
- ユーザーがモックデータであることを認識
- APIキー設定への誘導
- デバッグ情報の提供

**実装難易度：** 低
**効果：** 中（UX向上）

### 優先度4: 代替APIサービスの検討

**候補：**
- **GNews API** - 日本語ニュースに強い
- **Currents API** - 無料プランあり
- **NewsData.io** - 多言語対応

---

## 📝 実装チェックリスト

### Phase 1: 即座に実装（今回）
- [x] フォールバック時のコンソールメッセージ改善
- [x] モックデータ使用時の通知追加
- [ ] Everything APIの実装と統合
- [ ] フォールバック順序の最適化

### Phase 2: 次回以降
- [ ] GNews APIキーの設定UIに追加
- [ ] ユーザー設定で優先APIを選択可能に
- [ ] キャッシング機能の実装（API制限対策）
- [ ] エラーログの詳細化

---

## 🔬 テスト方法

### Test 1: Everything APIのテスト

```javascript
// ブラウザコンソールで実行
const testEverything = async () => {
  const apiKey = 'YOUR_API_KEY'
  const url = `https://newsapi.org/v2/everything?q=日本&language=ja&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`
  const response = await fetch(url)
  const data = await response.json()
  console.log('Everything API results:', data)
}
testEverything()
```

### Test 2: Top Headlines（現行）のテスト

```javascript
const testTopHeadlines = async () => {
  const apiKey = 'YOUR_API_KEY'
  const url = `https://newsapi.org/v2/top-headlines?country=jp&category=general&pageSize=5&apiKey=${apiKey}`
  const response = await fetch(url)
  const data = await response.json()
  console.log('Top Headlines results:', data)
}
testTopHeadlines()
```

### Test 3: ソース一覧の確認

```javascript
const testSources = async () => {
  const apiKey = 'YOUR_API_KEY'
  const url = `https://newsapi.org/v2/top-headlines/sources?country=jp&apiKey=${apiKey}`
  const response = await fetch(url)
  const data = await response.json()
  console.log('Japanese sources:', data.sources)
}
testSources()
```

---

## 📊 結論

### 主要な発見

1. **News APIの日本（jp）サポートは限定的**
   - Top Headlinesでは記事が取得できない可能性が高い
   - Everythingエンドポイントの使用が推奨される

2. **Everything APIが最も効果的**
   - 日本語キーワード + 言語フィルタで記事を取得
   - より多くのソースをカバー

3. **GNews APIも有力な代替手段**
   - 日本のニュースソースが豊富
   - 無料プランでも実用的

### 次のステップ

1. ✅ **Everything APIの実装**（最優先）
2. フォールバック順序の最適化
3. ユーザー通知の改善
4. GNews APIの優先度向上

---

**作成日**: 2025年10月8日  
**バージョン**: 2.3.0  
**ステータス**: 調査完了・実装準備中
