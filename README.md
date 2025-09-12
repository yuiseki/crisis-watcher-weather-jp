crisis-watcher-weather-jp

気象庁のフィードから「気象特別警報・警報・注意報」を収集し、`public/data/` 以下にJSONとして保存します。フロントエンドは Vite + React で最新JSONを表示します。

Scripts
- `npm run weather`: JMAフィードをクロールして `public/data/latest.json` と時刻別の `public/data/YYYY/MM/DD/HH/index.json` を生成
- `npm run dev`: フロントエンド開発サーバを起動
- `npm run build`: 本番ビルド
- `npm run preview`: ビルドのローカルプレビュー

Data format
- `public/data/latest.json`:
  - `generatedAt`: 生成時刻(UTC ISO8601)
  - `timeZone`: `Asia/Tokyo`
  - `hourPath`: `YYYY/MM/DD/HH`
  - `source`: 収集元URL
  - `totalItems`: アイテム数
  - `items[]`: 概要（地域推定含む）

Note
- 参考実装: `crisis-watcher-river-jp` と同じ入出力・構成を踏襲
- ネットワーク環境によりRSS取得が失敗する場合があります

# crisis-watcher-weather-jp
