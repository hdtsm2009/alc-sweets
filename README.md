# ALC 季節商品DB

ア・ラ・カンパーニュ向け 季節商品・旬素材スイーツ調査データベース  
**476件・国内主要スイーツブランド約50社** を一元管理する社内業務ツール。

- 本番URL: https://alc-sweets.netlify.app
- マスターデータ: `14_季節商品調査/HT_季節商品・旬素材スイーツ調査DB_v12_20260509.xlsx`
- デプロイ: GitHub main push → Netlify 自動ビルド（1〜2分）

---

## 画面構成

| URL | 説明 |
|-----|------|
| `/` | 商品検索（月・優先度・難易度・ブランド・素材・フリーワード） |
| `/calendar/` | 月別カレンダー（S/A+件数バッジ付き） |
| `/picks/` | S・A+ 優先候補ピックアップ（月別グループ） |
| `/product/?id=SWT-xxxx` | 商品詳細（前後ナビ付き） |
| `/about/` | 使い方ガイド・データ更新手順 |

---

## ローカル開発

```powershell
cd C:\dev\alc-sweets
npm install
npm run dev
# → http://localhost:3000
```

---

## データ更新フロー

Excelを編集してスクリプトを実行するだけで本番に反映できます。

### 1. Excelを編集

`14_季節商品調査/HT_季節商品・旬素材スイーツ調査DB_v12_20260509.xlsx`
- `商品別DB` シートに行を追加・編集
- `商品DB採用ステータス` 列が「採用」の行のみ出力される

### 2. JSONを再生成（+ 商品画像を自動取得）

```powershell
cd "14_季節商品調査"
python export_to_json.py
```

- `products.json` / `meta.json` を生成し、`C:\dev\alc-sweets\public\data\` に自動コピー
- 各商品のURLからOGP画像を自動取得（`image_cache.json` にキャッシュ → 2回目以降は即時）
- 初回のみ事前に: `pip install requests beautifulsoup4`

### 3. ローカルで確認（任意）

```powershell
cd C:\dev\alc-sweets
npm run dev
```

### 4. 本番反映（確認後に実施）

```powershell
cd C:\dev\alc-sweets
git add public/data/
git commit -m "データ更新 YYYY-MM-DD"
git push
```

push後、Netlifyが自動ビルド・デプロイ（1〜2分）。

---

## ファイル構成

```
C:\dev\alc-sweets\          ← このリポジトリ
├── src/
│   ├── app/
│   │   ├── layout.tsx        # 共通レイアウト（ヘッダー・バージョン表示）
│   │   ├── page.tsx          # 商品検索ページ
│   │   ├── about/page.tsx    # 使い方ガイド
│   │   ├── calendar/page.tsx # 月別カレンダー
│   │   ├── picks/page.tsx    # A+候補ピックアップ
│   │   └── product/page.tsx  # 商品詳細（?id= クエリパラメータ）
│   ├── components/
│   │   └── FooterInfo.tsx    # ヘッダーのバージョン・件数表示
│   ├── types/product.ts      # Product型定義
│   └── lib/data.ts           # 優先度・難易度カラー定数
├── public/data/
│   ├── products.json         # export_to_json.py で生成（imageUrl含む）
│   └── meta.json             # 件数・生成日・バージョン
├── next.config.ts            # output: "export"（静的エクスポート）
├── netlify.toml              # Netlifyビルド設定
└── tailwind.config.ts

14_季節商品調査\              ← マスターデータ置き場（このリポジトリ外）
├── HT_季節商品・旬素材スイーツ調査DB_v12_20260509.xlsx
├── export_to_json.py         # Excel → JSON変換 + OGP画像取得
└── image_cache.json          # OGP画像URLキャッシュ（自動生成）
```

---

## 優先度ラベル

| ラベル | 意味 |
|--------|------|
| S | 戦略最優先（5件）— ALCが最も参考にすべき商品 |
| A+ | 優先検討（45件）— 商品会議で必ず取り上げる価値あり |
| A | 参考候補 — トレンド把握・素材・演出の参考 |
| B | 参考情報 — 市場の幅を把握するための情報 |
| C | 記録のみ |
