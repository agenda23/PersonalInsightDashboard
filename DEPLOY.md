# GitHub Pagesへのデプロイ手順

## 🚀 初回セットアップ

### 1. GitHubリポジトリの作成

```bash
# Git初期化（まだの場合）
git init

# リモートリポジトリを追加
git remote add origin https://github.com/YOUR_USERNAME/PersonalInsightDashboard.git

# 初回コミット
git add .
git commit -m "Initial commit"

# メインブランチにプッシュ
git branch -M main
git push -u origin main
```

### 2. GitHub Pagesの設定

1. GitHubリポジトリページにアクセス
2. **Settings** → **Pages** に移動
3. **Source** を **GitHub Actions** に設定

### 3. 自動デプロイ

これで設定は完了です！以降、`main`ブランチにプッシュすると自動的にデプロイされます。

```bash
git add .
git commit -m "Update dashboard"
git push
```

## 📱 公開URL

デプロイ後、以下のURLでアクセスできます：

```
https://YOUR_USERNAME.github.io/PersonalInsightDashboard/
```

## 🔧 ローカルでのビルド確認

デプロイ前にローカルで確認したい場合：

```bash
# ビルド
npm run build

# プレビュー
npm run preview
```

ブラウザで `http://localhost:4173/PersonalInsightDashboard/` を開く

## ⚙️ 設定ファイル

### vite.config.js
```javascript
base: process.env.NODE_ENV === 'production' ? '/PersonalInsightDashboard/' : '/',
```

リポジトリ名が異なる場合は、この`base`パスを変更してください。

### .github/workflows/deploy.yml
GitHub Actionsのワークフローファイル。`main`ブランチへのプッシュで自動実行されます。

## 🔍 デプロイ状況の確認

1. GitHubリポジトリの **Actions** タブで進行状況を確認
2. 緑色のチェックマークが表示されたらデプロイ完了
3. エラーが出た場合はログを確認

## 📝 注意事項

### APIキーについて
- APIキーは**GitHub Pagesには保存されません**
- ユーザーのブラウザのlocalStorageに保存されます
- 各ユーザーが個別に設定画面でAPIキーを登録する必要があります

### セキュリティ
- APIキーはクライアントサイドで管理されます
- 公開リポジトリの場合、コード内にAPIキーを含めないでください
- `.env`ファイルは`.gitignore`に含まれているため安全です

### キャッシュ
- ニュースデータは10分間キャッシュされます
- localStorageのデータはブラウザ単位で保存されます
- 設定やToDoリストもlocalStorageに保存されます

## 🔄 更新時の流れ

1. ローカルで開発・修正
2. テスト確認
3. コミット＆プッシュ
4. GitHub Actionsが自動でビルド＆デプロイ
5. 数分後に公開URLに反映

## 🛠 トラブルシューティング

### デプロイが失敗する場合

1. **Node.jsのバージョン確認**
   - ワークフローはNode.js 18を使用
   - `package.json`の`engines`と一致していることを確認

2. **依存関係のエラー**
   ```bash
   # ローカルでクリーンインストール
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **ビルドエラー**
   ```bash
   # ローカルでビルドテスト
   npm run build
   ```

### ページが表示されない場合

1. GitHub Pagesの設定を確認
2. リポジトリが**Public**になっていることを確認
3. `vite.config.js`の`base`パスがリポジトリ名と一致していることを確認

### スタイルが崩れる場合

- `base`パスの設定を確認
- ブラウザのキャッシュをクリア（Ctrl+Shift+R / Cmd+Shift+R）

## 📚 参考リンク

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

## 🎉 デプロイ完了後

公開URLをREADMEに追加しましょう：

```markdown
## 🌐 Demo

Live Demo: https://YOUR_USERNAME.github.io/PersonalInsightDashboard/
```
