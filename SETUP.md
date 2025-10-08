# セットアップガイド

このガイドでは、Personal Insight Dashboardをローカル環境で動作させるための手順を説明します。

## 📋 前提条件

- Node.js 18.x 以上
- npm 9.x 以上

## 🚀 クイックスタート

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザが自動的に開き、`http://localhost:5173` でアプリケーションが起動します。

### 3. APIキーの設定（オプション）

アプリケーション内の「設定」タブで以下のAPIキーを設定できます：

#### News API
1. [https://newsapi.org/](https://newsapi.org/) にアクセス
2. アカウントを作成してAPIキーを取得
3. ダッシュボードの設定画面でAPIキーを入力

#### Twelve Data API
1. [https://twelvedata.com/](https://twelvedata.com/) にアクセス
2. アカウントを作成してAPIキーを取得
3. ダッシュボードの設定画面でAPIキーを入力

**注**: APIキーを設定しない場合は、モックデータが表示されます。

## 📦 ビルド

本番環境用のビルドを作成:

```bash
npm run build
```

ビルド結果は `dist/` ディレクトリに出力されます。

## 🔍 ビルドのプレビュー

```bash
npm run preview
```

## 📁 プロジェクト構造

```
PersonalInsightDashboard/
├── src/
│   ├── main.jsx                 # エントリーポイント
│   ├── App.jsx                  # メインアプリケーション
│   ├── App.css                  # アプリケーションスタイル
│   ├── index.css                # グローバルスタイル
│   ├── lib/
│   │   └── utils.js             # ユーティリティ関数
│   ├── utils/
│   │   ├── fetchMarketData.js   # 市場データAPI
│   │   ├── fetchNews.js         # ニュースAPI
│   │   ├── fetchWeather.js      # 天気API
│   │   ├── japanCities.js       # 日本の都市データ
│   │   └── localStorage.js      # ローカルストレージ管理
│   └── components/
│       └── ui/                  # UIコンポーネント
│           ├── button.jsx
│           ├── card.jsx
│           ├── input.jsx
│           ├── label.jsx
│           ├── badge.jsx
│           ├── tabs.jsx
│           ├── select.jsx
│           ├── switch.jsx
│           └── slider.jsx
├── public/                      # 静的ファイル
├── index.html                   # HTMLテンプレート
├── package.json                 # 依存関係
├── vite.config.js              # Vite設定
├── tailwind.config.js          # Tailwind CSS設定
├── postcss.config.js           # PostCSS設定
├── jsconfig.json               # JavaScript設定
└── eslint.config.js            # ESLint設定
```

## 🎨 カスタマイズ

### テーマの変更

`src/index.css` でカラーテーマをカスタマイズできます：

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  /* その他の色変数 */
}
```

### ウィジェットの追加

1. 新しいウィジェットコンポーネントを作成
2. `src/App.jsx` の `renderWidget` 関数に追加
3. `src/utils/localStorage.js` のデフォルト設定に追加

## 🐛 トラブルシューティング

### ポート5173が既に使用されている

`vite.config.js` でポート番号を変更できます：

```js
export default defineConfig({
  server: {
    port: 3000, // 任意のポート番号
  },
})
```

### 依存関係のインストールエラー

```bash
# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### ビルドエラー

```bash
# キャッシュをクリア
rm -rf dist node_modules/.vite
npm run build
```

## 📚 使用技術

- **React 19.1.0** - UIライブラリ
- **Vite 6.3.5** - ビルドツール
- **Tailwind CSS** - CSSフレームワーク
- **@hello-pangea/dnd** - ドラッグ&ドロップ
- **Lucide React** - アイコン

## 🔗 参考リンク

- [React ドキュメント](https://react.dev/)
- [Vite ドキュメント](https://vitejs.dev/)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/)
- [News API ドキュメント](https://newsapi.org/docs)
- [Twelve Data API ドキュメント](https://twelvedata.com/docs)
- [Open-Meteo API ドキュメント](https://open-meteo.com/en/docs)

## 💡 ヒント

- APIキーはブラウザのlocalStorageに保存されます
- データは自動的にキャッシュされ、設定した間隔で更新されます
- ウィジェットはドラッグ&ドロップで並び替え可能です
- ダーク/ライトモードは自動的に保存されます

## 📝 次のステップ

1. APIキーを設定してリアルデータを取得
2. 地域設定で自分の住んでいる地域を選択
3. 自動更新間隔を好みに合わせて調整
4. ウィジェットを並び替えて自分好みのレイアウトに

---

問題が発生した場合は、GitHubのissueで報告してください。

