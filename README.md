# ALC 季節商品DB — Next.js webapp

ア・ラ・カンパーニュ向け 季節商品・旬素材スイーツ調査データベース（静的エクスポート版）

## セットアップ

```bash
cd webapp
npm install
npm run dev
# → http://localhost:3000
```

## データ更新手順

1. Excel を編集: `14_季節商品調査/HT_季節商品・旬素材スイーツ調査DB_v12_20260509.xlsx`
   - `商品別DB` シートを更新
   - `商品DB採用ステータス` 列を「採用」にした行だけが出力される
2. JSON を再生成:
   ```bash
   cd 14_季節商品調査
   python export_to_json.py
   ```
3. 確認:
   ```bash
   cd webapp
   npm run dev
   ```
4. デプロイ: git push → Netlify が自動ビルド

## ビルド & 静的エクスポート

```bash
cd webapp
npm run build
# → out/ ディレクトリに静的ファイルが生成される
```

## Netlify デプロイ設定

- サイト名: `alc-sweets`
- Build command: `npm run build`
- Publish directory: `out`
- `netlify.toml` に設定済み

## 画面構成

| URL | 説明 |
|-----|------|
| `/` | 商品検索（全文・月・優先度・難易度・ブランド・素材フィルター） |
| `/calendar/` | 月別カレンダー（月クリックで商品一覧） |
| `/picks/` | S・A+ 優先候補ピックアップ（月別グループ） |
| `/product/[id]/` | 商品詳細ページ |

## ファイル構成

```
webapp/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # 共通レイアウト（ヘッダー・フッター）
│   │   ├── page.tsx          # 商品検索ページ
│   │   ├── calendar/page.tsx # 月別カレンダー
│   │   ├── picks/page.tsx    # A+候補ピックアップ
│   │   └── product/[id]/page.tsx  # 商品詳細
│   ├── types/product.ts      # Product型定義
│   └── lib/data.ts           # データ取得・定数
├── public/data/
│   ├── products.json         # export_to_json.py で生成
│   └── meta.json             # 件数・生成日
├── next.config.ts
├── tailwind.config.ts
└── netlify.toml
```
