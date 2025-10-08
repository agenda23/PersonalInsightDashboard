# Currents API 実装完了レポート

## 📋 実装概要

**実装日**: 2025年10月8日  
**参照**: [Currents API Documentation](https://currentsapi.services/en/docs/)  
**ステータス**: ✅ 完了・動作確認待ち

---

## 🎯 実装理由

### 問題点
- News APIの日本（jp）Top Headlinesは記事数が限定的
- Everything APIは使えるが、キーワード検索が必要
- より日本語ニュースに強いAPIが必要

### 選択理由

**Currents API**を選択した理由：
1. ✅ **600 requests/day**（News APIの6倍）
2. ✅ **日本語対応が優秀**（`language=ja`で自動フィルタ）
3. ✅ **15の言語対応**
4. ✅ **50カ国以上のニュース**
5. ✅ **シンプルなAPI設計**
6. ✅ **無料プランで開発・非商用利用可能**

---

## 🔧 実装詳細

### 1. fetchNews.js の変更

#### エンドポイント追加
```javascript
const CURRENTS_API_ENDPOINT = 'https://api.currentsapi.services/v1'
```

#### Currents API関数の実装
```javascript
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
```

#### レスポンス形式の対応

**Currents APIのレスポンス**:
```json
{
  "status": "ok",
  "news": [
    {
      "id": "unique-id",
      "title": "記事タイトル",
      "description": "記事の説明",
      "url": "https://...",
      "author": "著者名",
      "image": "https://..." または "None",
      "language": "ja",
      "category": ["world", "business"],
      "published": "2019-09-18 21:08:58 +0000"
    }
  ]
}
```

**重要な処理**:
1. `data.news`配列を使用（News APIの`articles`ではない）
2. `image`が`"None"`（文字列）の場合は`null`に変換
3. `author`がない場合は`"Currents"`をデフォルトに
4. `category`は配列なので最初の要素を使用

### 2. フォールバック順序の最適化

```javascript
export const fetchNews = async (category = 'general', maxItems = 10) => {
  try {
    // 1. Currents API（600 requests/day）を試す【最推奨】
    try {
      return await fetchNewsFromCurrents(category, 'ja', maxItems)
    } catch (currentsError) {
      console.warn('⚠️ Currents API failed:', currentsError.message)
      
      // 2. Everything API（日本語キーワード検索）を試す
      try {
        return await fetchNewsFromEverything(category, maxItems)
      } catch (everythingError) {
        console.warn('⚠️ Everything API failed:', everythingError.message)
        
        // 3. GNews API（日本のニュースに強い）を試す
        try {
          return await fetchNewsFromGNews(category, 'ja', maxItems)
        } catch (gnewsError) {
          console.warn('⚠️ GNews failed:', gnewsError.message)
          
          // 4. Top Headlines（最終手段）を試す
          try {
            return await fetchNewsFromNewsAPI(category, 'jp', maxItems)
          } catch (topHeadlinesError) {
            console.warn('⚠️ Top Headlines failed:', topHeadlinesError.message)
            throw new Error('All news APIs failed')
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ ニュース取得失敗 - モックデータを使用します:', error.message)
    console.info('💡 実際のニュースを取得するには、設定画面でCurrents/News APIキーを登録してください')
    console.info('💡 Currents API（600 requests/day）が最も推奨されます')
    
    // モックデータを返す
    return [ /* ... */ ]
  }
}
```

**優先順位の理由**:
1. **Currents API**: 600 requests/day、日本語対応◎
2. **Everything API**: News API使用、キーワード検索
3. **GNews API**: 100 requests/day、設定UIになし
4. **Top Headlines**: News API使用、日本は記事少ない

### 3. localStorage の更新

```javascript
// src/utils/localStorage.js
const DEFAULT_API_KEYS = {
  newsApi: '',
  twelveData: '',
  currents: ''  // 追加
  // Note: Currents API provides 600 requests/day (recommended for news)
}
```

### 4. UI の更新

#### 設定画面にCurrents APIキー入力欄を追加

```jsx
<div className="space-y-2">
  <Label htmlFor="currents">Currents API キー（推奨）</Label>
  <Input
    id="currents"
    type="password"
    placeholder="日本語ニュースデータ取得用のAPIキー"
    value={apiKeys.currents || ''}
    onChange={(e) => handleApiKeyChange('currents', e.target.value)}
  />
  <p className="text-xs text-muted-foreground">
    <a href="https://currentsapi.services/en" target="_blank" rel="noopener noreferrer" 
       className="underline hover:text-primary">
      CurrentsAPI.services
    </a> で無料のAPIキーを取得できます（600 requests/day・日本語対応）
  </p>
</div>
```

**配置順序**:
1. Currents API（推奨）← 最上位
2. News API（代替）
3. Twelve Data API

#### APIキー未設定警告の更新

```jsx
{!apiKeys.currents && !apiKeys.newsApi ? (
  <div className="p-4 bg-yellow-50 ...">
    <p className="text-xs ...">
      実際のニュースデータを取得するには、Currents APIまたはNews APIキーが必要です。
      現在はモックデータを表示しています。
    </p>
  </div>
) : ...}
```

---

## 📊 Currents API 仕様詳細

### エンドポイント

#### Latest News
**URL**: `GET https://api.currentsapi.services/v1/latest-news`

**パラメータ**:
| パラメータ | 必須 | 説明 | 例 |
|-----------|------|------|-----|
| apiKey | ✅ | APIキー | `your_api_key` |
| language | ⭕ | 言語コード（ISO 639-1） | `ja`, `en`, `fr` |
| country | ⭕ | 国コード（ISO 3166-1） | `JP`, `US`, `GB` |
| category | ⭕ | カテゴリ | `world`, `business`, `technology` |
| domain | ⭕ | ドメイン指定 | `bbc.co.uk` |
| page_size | ⭕ | 取得件数 | デフォルト: 10 |

#### Search
**URL**: `GET https://api.currentsapi.services/v1/search`

**パラメータ**:
| パラメータ | 必須 | 説明 |
|-----------|------|------|
| apiKey | ✅ | APIキー |
| keywords | ✅ | 検索キーワード |
| language | ⭕ | 言語フィルタ |
| start_date | ⭕ | 開始日 |
| end_date | ⭕ | 終了日 |

### 対応言語

Currents APIは**15の言語**に対応：
- `ja` - 日本語 ✅
- `en` - 英語
- `fr` - フランス語
- `de` - ドイツ語
- `es` - スペイン語
- `it` - イタリア語
- `pt` - ポルトガル語
- `ar` - アラビア語
- `zh` - 中国語
- `ko` - 韓国語
- `ru` - ロシア語
- `tr` - トルコ語
- `nl` - オランダ語
- `pl` - ポーランド語
- `he` - ヘブライ語

### 対応カテゴリ

- `regional` - 地域ニュース
- `technology` - テクノロジー
- `lifestyle` - ライフスタイル
- `business` - ビジネス
- `general` - 一般
- `programming` - プログラミング
- `science` - 科学
- `entertainment` - エンターテインメント
- `world` - 世界
- `sports` - スポーツ
- `finance` - 金融
- `academia` - 学術
- `politics` - 政治
- `health` - 健康
- `opinion` - オピニオン
- `food` - 食品
- `game` - ゲーム
- `fashion` - ファッション
- `academic` - 学術
- `crap` - その他
- `travel` - 旅行
- `culture` - 文化
- `economy` - 経済
- `environment` - 環境
- `art` - アート
- `music` - 音楽
- `notsure` - 不明
- `CS` - コンピューターサイエンス
- `education` - 教育
- `redundant` - 冗長
- `television` - テレビ
- `commodity` - 商品
- `movie` - 映画
- `entrepreneur` - 起業
- `review` - レビュー
- `auto` - 自動車
- `energy` - エネルギー
- `celebrity` - セレブリティ
- `medical` - 医療
- `gadgets` - ガジェット
- `design` - デザイン
- `EE` - 電気工学
- `security` - セキュリティ
- `mobile` - モバイル
- `estate` - 不動産
- `funny` - 面白

### レート制限

**無料プラン**:
- ✅ **600 requests/day**
- ✅ 開発・非商用利用
- ✅ 申請が必要

**有料プラン**:
- Pro: 6,000 requests/day
- Business: 60,000 requests/day
- Enterprise: カスタム

---

## 🧪 テスト方法

### Test 1: ブラウザで直接テスト

```bash
# APIキーを取得後、以下のURLをブラウザで開く
https://api.currentsapi.services/v1/latest-news?language=ja&apiKey=YOUR_API_KEY
```

**期待される結果**:
```json
{
  "status": "ok",
  "news": [
    {
      "id": "...",
      "title": "日本語のニュースタイトル",
      "description": "記事の説明",
      "url": "...",
      "language": "ja",
      ...
    }
  ]
}
```

### Test 2: コンソールでの確認

```javascript
// ブラウザのコンソールで実行
localStorage.getItem('apiKeys')
// → currentsキーが含まれているか確認

// ニュースデータの確認
// ページリロード後、コンソールに以下が表示されるはず:
// 📰 Currents APIで日本語ニュースを検索中...
// ✅ Currents APIから○件の記事を取得しました
```

### Test 3: アプリケーションでの確認

1. **APIキー取得**:
   - https://currentsapi.services/en にアクセス
   - Sign Upして無料プランに申請
   - APIキーを取得

2. **アプリで設定**:
   - ダッシュボードの「設定」タブを開く
   - 「Currents API キー（推奨）」欄にAPIキーを入力
   - 自動保存される

3. **動作確認**:
   - ダッシュボードに戻る
   - ニュースウィジェットを確認
   - 実際の日本語ニュースが表示される

---

## 📈 期待される効果

### Before（実装前）
```
フォールバック順序:
1. Everything API（News API） → キーワード検索必要
2. GNews API → UIに設定なし
3. Top Headlines → 日本は記事少ない
→ 結果: モックデータになりやすい
```

### After（実装後）
```
フォールバック順序:
1. Currents API → 600 requests/day ✅
2. Everything API → News API
3. GNews API → 代替
4. Top Headlines → 最終手段
→ 結果: 実際の日本語ニュースが取得しやすい
```

### メリット

1. **6倍のAPI制限**:
   - News API: 100 requests/day
   - Currents API: 600 requests/day

2. **日本語対応の向上**:
   - シンプルな`language=ja`フィルタ
   - キーワード検索不要

3. **取得成功率の向上**:
   - より多くのフォールバックオプション
   - 安定したニュース取得

4. **ユーザー体験の改善**:
   - 実際のニュースが表示されやすい
   - モックデータへの依存度が下がる

---

## 🔧 トラブルシューティング

### 問題1: APIキーが取得できない

**症状**: Currents APIのサインアップができない

**解決方法**:
1. https://currentsapi.services/en にアクセス
2. "Apply for free API" をクリック
3. メールアドレスを登録
4. 申請フォームを記入（開発・非商用利用を明記）
5. 承認を待つ（通常24-48時間）

### 問題2: 記事が取得できない

**症状**: Currents APIが404や403エラーを返す

**確認事項**:
```bash
# 1. APIキーが正しいか確認
curl "https://api.currentsapi.services/v1/latest-news?language=en&apiKey=YOUR_KEY"

# 2. レート制限を確認
# コンソールで600 requests/dayを超えていないか確認
```

### 問題3: 日本語記事が取得できない

**症状**: `language=ja`で記事が0件

**解決方法**:
```javascript
// language=enで試してみる（英語記事が取得できるか確認）
fetchNewsFromCurrents('general', 'en', 10)

// 日本語記事が少ない可能性があるため、Everything APIにフォールバック
// （自動的にフォールバックされる）
```

---

## 📝 今後の改善案

### Phase 1: 現状の最適化
- [x] Currents API実装
- [x] フォールバック順序の最適化
- [x] UI更新（APIキー入力欄）
- [ ] エラーメッセージの改善
- [ ] レート制限追跡機能

### Phase 2: 機能拡張
- [ ] カテゴリ別ニュース取得
- [ ] 検索機能の実装（keywords）
- [ ] 日付範囲指定
- [ ] ニュースソース選択
- [ ] キャッシング機能

### Phase 3: 複数API統合
- [ ] NewsData.io APIの追加
- [ ] Yahoo! JAPAN API の調査
- [ ] NHK APIの統合
- [ ] RSS フィードサポート

---

## 🎯 まとめ

### 成功ポイント

✅ **Currents APIの選択は最適**
- 600 requests/dayは十分
- 日本語対応が優秀
- シンプルな実装

✅ **4段階フォールバックで安定性向上**
- 1つのAPIが失敗しても他で補完
- 最終的にモックデータで保証

✅ **ユーザーフレンドリーなUI**
- 推奨APIを明示
- リンクとrequest制限を表示
- 設定が簡単

### 次のステップ

1. **ブラウザをリロード**して動作確認
2. **Currents APIキーを取得**して設定
3. **コンソールログ**で取得状況を確認
4. **実際の日本語ニュース**が表示されることを確認

---

**作成日**: 2025年10月8日  
**バージョン**: 2.4.0  
**ステータス**: ✅ 実装完了・テスト待ち
