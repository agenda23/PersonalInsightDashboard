# Personal Insight Dashboard

モダンなReactベースのパーソナルダッシュボードアプリケーション。市場データ、天気予報、ニュース、ToDoリストを一つの画面で管理できます。

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 目次

- [機能](#機能)
- [デモ](#デモ)
- [技術スタック](#技術スタック)
- [セットアップ](#セットアップ)
- [使い方](#使い方)
- [API設定](#api設定)
- [プロジェクト構造](#プロジェクト構造)
- [開発](#開発)
- [カスタマイズ](#カスタマイズ)
- [ライセンス](#ライセンス)

## ✨ 機能

### 📊 市場データウィジェット
- **為替**: USD/JPY（ドル円）のリアルタイムレート
- **暗号資産**: BTC/USD（ビットコイン）価格
- **株価指数**: 日経平均、S&P 500
- 価格変動を色分け表示（上昇/下降）

### ☀️ 天気予報ウィジェット
- 現在の天気、気温、降水確率
- 3日間の週間予報
- **日本全国47都道府県対応**（県庁所在地・主要都市）
- 地域設定のカスタマイズ機能
- Open-Meteo API使用（無料、APIキー不要）

### 📰 ニュースウィジェット
- 最新ニュースヘッドライン（5件）
- タイムスタンプ表示（○時間前）
- News API対応

### ✅ ToDoリストウィジェット
- タスクの追加・削除・完了管理
- 達成率の可視化（プログレスバー）
- localStorageによる永続化

### 🎨 その他の機能
- **ダーク/ライトモード**: テーマ切り替え機能
- **ドラッグ&ドロップ**: ウィジェットの並び替え
- **自動更新**: 1分〜60分の間隔で各ウィジェットを自動更新
- **レスポンシブデザイン**: PC・モバイル対応
- **データエクスポート**: 設定とToDoデータのバックアップ機能

## 🎬 デモ

### ダッシュボード画面
- 市場データ、天気予報、ニュース、ToDoリストを一画面で表示
- ドラッグ&ドロップでウィジェットの配置を自由にカスタマイズ

### 設定画面
- APIキー設定
- 地域設定（都道府県・市区町村選択）
- 自動更新間隔の設定
- データ管理（エクスポート/削除）

## 🛠 技術スタック

### フロントエンド
- **React** 19.1.0 - UIライブラリ
- **Vite** 6.3.5 - ビルドツール
- **Tailwind CSS** - ユーティリティファーストCSSフレームワーク
- **shadcn/ui** - UIコンポーネントライブラリ
- **@hello-pangea/dnd** - ドラッグ&ドロップ機能
- **Lucide React** - アイコンライブラリ

### データ管理
- **localStorage** - クライアントサイドデータ永続化

### API統合
- **News API** - ニュースデータ取得
- **Twelve Data API** - 市場データ（為替・株価）取得
- **Open-Meteo API** - 天気予報データ取得（無料）

## 🚀 セットアップ

### 前提条件
- Node.js 18.x 以上
- npm または yarn

### インストール

1. リポジトリをクローン
```bash
git clone https://github.com/yourusername/PersonalInsightDashboard.git
cd PersonalInsightDashboard
```

2. 依存関係をインストール
```bash
npm install
```

3. 開発サーバーを起動
```bash
npm run dev
```

4. ブラウザで開く
```
http://localhost:5173
```

### ビルド

本番環境用のビルドを作成:
```bash
npm run build
```

ビルド結果は `dist/` ディレクトリに出力されます。

ビルドをプレビュー:
```bash
npm run preview
```

## 📖 使い方

### 初回セットアップ

1. **APIキーの設定**
   - 画面右上の「設定」ボタンをクリック
   - 「API設定」セクションで以下のAPIキーを入力:
     - News API キー（ニュース取得用）
     - Twelve Data API キー（市場データ取得用）

2. **地域設定**
   - 「地域設定」セクションで都道府県と市区町村を選択
   - 天気予報がその地域の情報に更新されます

3. **自動更新の設定**
   - 「自動更新設定」セクションで各ウィジェットの更新間隔を設定
   - スイッチで自動更新のオン・オフを切り替え

### 日常的な使用

- **データ更新**: 画面右上の「更新」ボタンで手動更新
- **テーマ変更**: 月/太陽アイコンでダーク/ライトモード切り替え
- **ウィジェット並び替え**: グリップアイコンをドラッグして配置変更
- **ToDoタスク管理**: タスクを入力してEnterキーまたは「追加」ボタン

## 🔑 API設定

### News API

1. [News API](https://newsapi.org/)にアクセス
2. アカウントを作成してAPIキーを取得
3. ダッシュボードの設定画面でAPIキーを入力

**注**: 無料プランでは開発環境でのみ使用可能です。

### Twelve Data API

1. [Twelve Data](https://twelvedata.com/)にアクセス
2. アカウントを作成してAPIキーを取得
3. ダッシュボードの設定画面でAPIキーを入力

**注**: 無料プランではAPI呼び出し回数に制限があります。

### Open-Meteo API

天気予報機能は[Open-Meteo API](https://open-meteo.com/)を使用しています。
**APIキー不要**で無料で利用できます。

## 📁 プロジェクト構造

```
PersonalInsightDashboard/
├── src/
│   ├── main.jsx              # エントリーポイント
│   ├── App.jsx               # メインアプリケーション
│   ├── App.css               # アプリケーションスタイル
│   ├── utils/
│   │   ├── fetchMarketData.js    # 市場データ取得API
│   │   ├── fetchWeather.js       # 天気データ取得API
│   │   ├── fetchNews.js          # ニュースデータ取得API
│   │   ├── localStorage.js       # localStorage管理
│   │   └── japanCities.js        # 日本の都市データベース
│   └── components/
│       └── ui/                   # shadcn/ui コンポーネント
├── public/                       # 静的ファイル
├── dist/                         # ビルド出力（.gitignore対象）
├── node_modules/                 # 依存関係（.gitignore対象）
├── index.html                    # HTMLテンプレート
├── package.json                  # npm設定
├── vite.config.js               # Vite設定
├── tailwind.config.js           # Tailwind CSS設定
├── postcss.config.js            # PostCSS設定
└── README.md                    # このファイル
```

## 🔧 開発

### 利用可能なコマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# ビルドのプレビュー
npm run preview

# リント（もし設定されている場合）
npm run lint
```

### 開発時のヒント

1. **モックデータ**: API設定なしでもモックデータで動作確認可能
2. **localStorage**: ブラウザの開発者ツールでlocalStorageの内容を確認できます
3. **レスポンシブテスト**: ブラウザのデバイスモードで様々な画面サイズをテスト

## 🎨 カスタマイズ

### テーマのカスタマイズ

Tailwind CSSの設定ファイル（`tailwind.config.js`）で色やスペーシングをカスタマイズできます。

### ウィジェットの追加

1. 新しいウィジェットコンポーネントを作成
2. `App.jsx`の`renderWidget`関数に追加
3. `localStorage.js`のデフォルト設定に追加

### APIの追加

1. `src/utils/`に新しいAPI取得ファイルを作成
2. `localStorage.js`でAPIキー管理を追加
3. 設定画面にAPIキー入力フィールドを追加

## 📝 データ管理

### データの保存場所

すべてのデータはブラウザの**localStorage**に保存されます:
- APIキー
- ToDoリスト
- テーマ設定
- 地域設定
- ウィジェットの配置順序
- 自動更新設定

### データのバックアップ

設定画面の「データをエクスポート」ボタンでJSON形式でバックアップできます。

### データの削除

設定画面の「すべてのデータを削除」ボタンでlocalStorageをクリアできます。

## 🐛 トラブルシューティング

### データが取得できない

1. APIキーが正しく設定されているか確認
2. API呼び出し制限に達していないか確認
3. ブラウザのコンソールでエラーメッセージを確認

### ウィジェットが表示されない

1. ブラウザのlocalStorageが有効か確認
2. ブラウザのキャッシュをクリア
3. ページをリロード

## 🤝 コントリビューション

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📄 ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 🙏 謝辞

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [News API](https://newsapi.org/)
- [Twelve Data](https://twelvedata.com/)
- [Open-Meteo](https://open-meteo.com/)

## 📞 連絡先

プロジェクトに関する質問や提案がある場合は、issueを作成してください。

---

**Personal Insight Dashboard** - あなたの日常をスマートに管理 🚀

