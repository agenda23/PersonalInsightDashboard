# APIキー未設定時の警告メッセージ機能

## 📋 概要

APIキーが未設定の場合、ダッシュボードの各ウィジェットに警告メッセージを表示し、ユーザーに設定を促す機能を追加しました。

## 🎯 目的

- ユーザーがAPIキーの設定が必要であることを明確に理解できる
- 現在表示されているデータがモックデータであることを認識できる
- 設定画面へスムーズに移動できる

## ✨ 実装内容

### 1. 市場データウィジェット

**表示条件**: `apiKeys.twelveData` が未設定（空文字列）の場合

**表示内容**:
```
⚠️ APIキーが未設定です

実際の市場データを取得するには、Twelve Data APIキーが必要です。
現在はモックデータを表示しています。

[設定画面でAPIキーを登録] ボタン
```

**デザイン**:
- 背景色: 黄色（ライトモード: bg-yellow-50、ダークモード: bg-yellow-900/20）
- ボーダー: 黄色（border-yellow-200 / border-yellow-800）
- アイコン: ⚠️ 絵文字
- ボタン: 設定画面へ遷移

### 2. ニュースウィジェット

**表示条件**: `apiKeys.newsApi` が未設定（空文字列）の場合

**表示内容**:
```
⚠️ APIキーが未設定です

実際のニュースデータを取得するには、News APIキーが必要です。
現在はモックデータを表示しています。

[設定画面でAPIキーを登録] ボタン
```

**デザイン**:
- 市場データウィジェットと同じスタイル
- ウィジェットの上部に表示
- mb-4 でニュースリストとの間隔を確保

### 3. 天気予報ウィジェット

**表示条件**: なし（警告メッセージなし）

**理由**: 
- Open-Meteo APIを使用
- APIキー不要で無料
- 常に実際のデータを取得可能

## 🎨 UI/UXの特徴

### レスポンシブ対応
- デスクトップ・モバイル両方で適切に表示
- テキストサイズは小さめ（text-xs / text-sm）で邪魔にならない

### ダークモード対応
- ライトモード: bg-yellow-50、text-yellow-900
- ダークモード: bg-yellow-900/20、text-yellow-100
- 背景の透明度を調整し、見やすさを確保

### インタラクティブ
- ボタンクリックで設定画面へ即座に移動
- ホバー時の視覚的フィードバック

## 🔧 技術実装詳細

### コード構造

```jsx
{!apiKeys.twelveData ? (
  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
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
```

### チェック条件

```javascript
// APIキーが未設定かどうかをチェック
!apiKeys.twelveData  // Twelve Data API
!apiKeys.newsApi     // News API
```

- 空文字列（''）または undefined の場合に警告表示
- APIキーが設定されると警告は自動的に非表示

## 📊 表示フロー

```
1. ページ読み込み
   ↓
2. localStorage から apiKeys を取得
   ↓
3. 各ウィジェットでAPIキーをチェック
   ↓
4. 未設定の場合
   - 警告メッセージ表示
   - モックデータ表示
   ↓
5. 設定済みの場合
   - 警告メッセージなし
   - 実データ取得試行
```

## 🎯 ユーザーエクスペリエンス

### 初回訪問時
1. ダッシュボードを開く
2. 各ウィジェットに黄色の警告ボックスが表示
3. 「現在はモックデータを表示しています」というメッセージで理解
4. 「設定画面でAPIキーを登録」ボタンをクリック
5. 設定画面でAPIキーを入力
6. ダッシュボードに戻ると警告が消える

### APIキー設定後
1. 警告メッセージが表示されない
2. 実際のデータが取得される
3. エラー発生時はコンソールにログ出力
4. フォールバックとしてモックデータを表示

## 🔍 テスト方法

### 1. APIキー未設定の状態をテスト

```javascript
// ブラウザのコンソールで実行
localStorage.removeItem('apiKeys')
location.reload()
```

期待される結果:
- 市場データウィジェットに警告表示
- ニュースウィジェットに警告表示
- 天気予報ウィジェットには警告なし

### 2. APIキー設定済みの状態をテスト

```javascript
// ブラウザのコンソールで実行
localStorage.setItem('apiKeys', JSON.stringify({
  newsApi: 'test-key',
  twelveData: 'test-key'
}))
location.reload()
```

期待される結果:
- すべてのウィジェットで警告非表示

### 3. ダークモード表示テスト

- ライト/ダークモードを切り替え
- 警告メッセージの色が適切に変更されることを確認

## 📝 今後の改善案

### オプション 1: より詳細な情報
- APIキー取得方法へのリンク追加
- 各APIの無料プランの制限情報を表示

### オプション 2: アニメーション
- 警告メッセージのフェードイン効果
- ボタンのマイクロインタラクション

### オプション 3: 通知の種類を増やす
- APIキー有効期限切れ警告
- API呼び出し制限警告
- ネットワークエラー通知

## 🎉 完成した機能

✅ 市場データウィジェットの警告メッセージ
✅ ニュースウィジェットの警告メッセージ
✅ 設定画面への自動遷移機能
✅ ダークモード完全対応
✅ レスポンシブデザイン対応
✅ アクセシビリティ配慮（色のコントラスト、絵文字使用）

---

実装日: 2025年10月8日
バージョン: 2.1.0

