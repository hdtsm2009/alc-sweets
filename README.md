# ALC 季節商品DB

ア・ラ・カンパーニュ向け 季節商品・旬素材スイーツ調査データベース  
**季節商品・自社／競合の参考事例** を一元管理する社内業務ツール。

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
| `/planning/` | 候補4件の比較・タルト試作メモ・参照記録付き書き出し |
| `/about/` | 使い方ガイド・データ更新手順 |

---

## ローカル開発

```powershell
cd C:\dev\ht-seasonal-update\app
npm install
npm run dev
# → http://localhost:3000
```

---

## データ更新フロー（ローカル作業コピー）

変換はローカルJSONだけを更新します。公開には別途GitHub→Netlifyのデプロイ操作が必要です。

### 1. Excelを編集

作業コピーの `database/HT_季節商品・旬素材スイーツ調査DB_v12_20260509.xlsx` がマスターです。
`商品別DB` シートの `商品DB採用ステータス` が厳密に「採用」の行だけを出力します。
空欄・保留・不採用は出力しません。商品ID・商品名・ブランド名・対象月・採用ステータスの列が必要です。
採用行の空ID・空商品名・空ブランド名・重複ID・不正な月は、全エラーを表示して終了コード1で停止します。
対象月は空欄ならnull、1〜12の整数または「9月」のような値に対応します。

### 2. JSONを再生成

作業フォルダのルートから実行します。

```powershell
python database/export_to_json.py
```

- 出力先はスクリプト位置から求めた `app/public/data/products.json` と `meta.json`。
- 標準は外部通信なし。手動画像URLを優先し、未設定なら既存の `image_cache.json` を利用します。
- 外部画像取得は明示的に `--fetch-images` を指定した場合だけ有効です。依存ライブラリの自動インストールはしません。
- Excelの「販売形態」「ニュース露出」「自社応用案」は、Webの「販売形式」「ニュース掲載」「応用案」に対応します。
- 商品0件・既存比で件数またはサイズが半分未満の出力は、既存JSONを上書きせず停止します。
- 元のExcelファイルは変換処理で変更しません。

### 3. 確認状態の意味

DB採用は収録可否、実在確認レベルは調査時点の記録です。販売確認状態・価格確認ステータス・画像確認ステータスと独立して扱います。
元列の値は保持し、販売確認状態の列がない／空欄の場合は「未確認」とします。
OGP画像が取得できたこと、採用済みであること、優先度が高いことを、実在確認や販売確認の根拠にしません。
「商品画像URL/掲載ページ」はページURLを含むため、そのまま画像URLとして出力しません。

### 4. ローカル検証

```powershell
python database/export_to_json.py --self-test
cd app
npm ci --ignore-scripts --no-audit --no-fund
npm run build
```

Pythonの自己テストはメモリ上の合成データだけを使い、実データやネットワークにアクセスしません。
本環境でNodeの最適化処理が異常終了する場合、ビルドは以下で実行できます。

```powershell
node --no-opt node_modules/next/dist/bin/next build
```

検索は副素材・会社名・イベントテーマ・商品IDも対象で、全角英数字を正規化し、空白区切りの複数語はAND検索します。
初期表示は今月です。「全件表示（条件をクリア）」で月を含む全条件を解除し、200件以上もすべて表示します。
HTTPエラー・不正JSON・不正な商品データ・15秒のタイムアウトは、読込エラーと再試行ボタンで案内します。

---
## ファイル構成

```
C:\dev\ht-seasonal-update\app\          ← このリポジトリ
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

database\              ← 同じ作業フォルダ内のマスター
├── HT_季節商品・旬素材スイーツ調査DB_v12_20260509.xlsx
├── export_to_json.py         # Excel → JSON変換（OGP取得は明示指定）
└── image_cache.json          # OGP画像URLキャッシュ（自動生成）
```

---

## 優先度ラベル

| ラベル | 意味 |
|--------|------|
| S | 戦略最優先— 調査時点の最優先ラベル |
| A+ | 優先検討— 商品会議で必ず取り上げる価値あり |
| A | 参考候補 — トレンド把握・素材・演出の参考 |
| B | 参考情報 — 市場の幅を把握するための情報 |
| C | 記録のみ |

## タルト商品開発での使い方

1. 検索で開発予定月・素材を絞る。「翌月から3か月」「タルトを探す」「他の菓子から発想する」も利用する。
2. 参考商品を最大4件選び、「比較・試作メモ」で同じ項目を比較する。全候補が未記録の項目は標準で省略し、チェックで表示できる。
3. 事実の記録（価格・年・販売期間・出典）と、Excel上のALC向け評価／仮説（試作案・流用・製造・ロス対策）を分けて読む。
4. 自分たちの企画案を15項目に記入する。入力はこの端末のブラウザへ自動保存する。共同編集・外部送信は行わない。
5. 企画に紐づけた参照商品のスナップショットは本文と一緒に保存する。比較候補を入れ替えても出典は自動で変わらない。「現在の比較候補をこの案の参照にする」で明示的に差し替える。
6. 「メモと出典を書き出す」でMarkdownを保存し、会議用の材料にする。目標価格は記入者の仮説であり、DBの価格原文とは分けて出力する。

DBの更新日表示はJSONを生成した日付であり、個別商品の販売確認日ではない。製造難易度とALC全体の実装難易度は別項目として保持する。
読み取れない端末保存は勝手に上書きしない。画面で元の保存値をバックアップし、明示操作で候補を初期化／メモを保存し直せる。
検索条件はURLへ保持する。商品詳細から条件付きの検索に戻れる。詳細内の前後移動は「全DB」と明記する。

## 再現できる検証

Python 3.13と既存依存のopenpyxlを使用。追加のpipインストールは不要。

```powershell
python database/export_to_json.py --self-test
cd app
npm test
node --jitless node_modules/typescript/bin/tsc --noEmit --incremental false
node --no-opt node_modules/next/dist/bin/next build
```

実ブラウザ検証はPlaywrightが既に利用できる環境で実行する。製品データをfixtureに使用せず、207件の合成データを応答に差し替え、外部リクエストを遮断する。`PLAYWRIGHT_MODULE`には既存Playwrightのモジュールパス、`BROWSER_CHANNEL`にはインストール済みブラウザ（例：msedge）を指定できる。

```powershell
# 別の端末でローカル開発サーバーを起動
node --no-opt node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3100
# Playwrightと対応ブラウザが利用可能な環境で
npm run test:browser
```

テストソースは `tests/planning.cjs` と `tests/browser.cjs`。スクリーンショットと合成メモの出力先は `test-results/`。

## 追加・変更箇所（商品開発向け拡張）

- `../database/export_to_json.py`: 開発用の30列・対象年／日付／出典を原文保持し、合成テストを追加。
- `src/types/product.ts`: 開発・根拠項目の型。
- `src/lib/data.ts`: 試作案・製法・ロス対策を含む検索。
- `src/lib/planning.ts`: 候補保存、企画と参照スナップショット、Markdown出力、安全なURL。
- `src/components/CandidateButton.tsx`: 比較候補の追加／解除。
- `src/app/planning/page.tsx`: 比較表と編集・自動保存・書き出し。
- `src/app/page.tsx`: 開発用途の絞り込み、URLでの条件保持、候補追加。
- `src/app/product/page.tsx`: 出典・年・製造／運用情報、戻り先と候補追加。
- `src/app/calendar/page.tsx`: 月未設定の表示とその月の検索導線。
- `src/app/picks/page.tsx`: 月未設定のA+表示、優先ラベルと確認状態の区別。
- `src/app/about/page.tsx`: 開発手順と評価／仮説の説明。
- `src/app/layout.tsx`, `src/app/globals.css`: ナビゲーション、画面幅への対応、比較表の操作性。
- `public/data/products.json`, `public/data/meta.json`: ローカル再生成。
- `package.json`, `tests/planning.cjs`, `tests/browser.cjs`: 検証コマンドと合成データテスト。
- `README.md`: 手順・変更箇所の記録。
## ローカル版の完了確認（2026-09-12・デプロイ承認前）

| 要件 | 結果・根拠 |
|---|---|
| 確認状態を分離する | 満たした。採用・実在・販売・価格・画像を独立保持。Python合成テストとWebテストで検証 |
| Excelの開発情報をWebへ渡す | 満たした。30列を原文保持。列名の重複なし・Product型の欠落なし。ローカルJSON514件を再生成 |
| タルト開発に役立つ参考商品を探す | 満たした。月・翌月から3か月・素材・自社／競合・タルト区分・開発情報の記録で絞り込み。分析文も検索対象 |
| 200件以上・月未設定を表示する | 満たした。合成207件の全表示、月未設定のA+とカレンダーを実ブラウザで検証 |
| 候補比較から具体的な試作案へ進める | 満たした。4件比較、15項目の試作メモ、端末保存、Markdown出力を実ブラウザで検証 |
| メモと出典を失わず保持する | 満たした。自動保存後の移動・再読込、比較候補変更後の参照スナップショット保持を検証 |
| 通信・JSON・保存エラーから復旧する | 満たした。HTTP、不正JSON、タイムアウトの再試行と、破損候補の明示初期化を実ブラウザで検証 |
| 小さい画面でも操作できる | 満たした。390px幅で検索・比較・詳細のページ全体にはみ出しなし。比較表内はスクロール可能。画像を目視確認 |
| push・公開しない | 満たした。外部公開・push未実施。検証用サーバーは127.0.0.1だけで待受 |

実際の検証出力（抜粋）：

```text
Python: Tests: 14, failures: 0, errors: 0
Node: tests 10 / pass 10 / fail 0
Browser: Tests: 12, passed: 12, failed: 0
✓ Generating static pages (9/9)
✓ Exporting (2/2)
```

途中で失敗した検査と処置：

- 標準Playwrightブラウザの起動：実行ファイルなし。既存ブラウザを使用し、インストールはしなかった。
- Edge検証の終了処理：終了を待ち続けたため、そのテスト実行を停止。Chromeでは正常終了した。
- 保存後のフォーム復元検査（企画名／クリーム欄）：ラベルに入力値が混ざり照合できず失敗。textareaへ固定のアクセシブル名を追加し、保存・復元とも成功した。
- タイムアウト後の再試行検査：Nextの画面遷移通知もalertとして拾い、15秒経過前に待機が終わっていた。実際のエラー文を待つ検査へ修正し、タイムアウト・再試行とも成功した。
- 一時プロファイルの後片付け：本検証が作成した `test-results/playwright_chromiumdev_profile-p5MWZG` と `playwright_chromiumdev_profile-XHw6U3` はアクセス拒否で削除できず残存。通常ブラウザのプロファイルではない。テスト成果物ディレクトリごとGit管理対象から除外。

データ内容の限界：具体的なALC試作案・ロス対策等の詳細記録は各5件。既存タルト台の流用判断・ALC想定価格は各341件。未記録を補完したり、試作・原価・日持ちを検証済みと扱ったりしていない。記録の正しさ・現在の販売・実製造の適合性は未確認であり、出典確認と現場試作が必要。

前の修正から引き継ぐ変更ファイルも含め、追加の変更箇所：

- `.gitignore`: 検証成果物・一時プロファイルを除外。
- `src/components/FooterInfo.tsx`: JSON生成日と個別確認日の区別、取得失敗の再試行。
- `package-lock.json`: 既存のpackage.jsonと依存バージョンを整合（前の修正）。
- `next-env.d.ts`: Next.jsビルドによるルート型参照の生成。

ローカル確認URL: `http://127.0.0.1:3100/`。公開サイトの変更はしていない。

## 本番デプロイ確認（2026-09-12）

ユーザーの「デプロイして」の指示により、以前のpush・公開禁止を解除して既存Netlifyへ反映。
公開URL: https://alc-sweets.netlify.app/
公開したアプリ本体のコミット: `0f4fc68`（GitHub mainへpush）。

| 確認項目 | 結果 |
|---|---|
| 既存サイトへの反映 | 満たした。6画面すべてHTTP 200、タイトルが「ALC タルト開発DB」へ更新 |
| 比較ページのJS配信 | 満たした。8/8アセットがHTTP 200 |
| 商品・メタデータの反映 | 満たした。514件。改行正規化後・JSON解析後ともローカル成果物と完全一致 |
| 本番での操作 | 満たした。合成データに差し替えて12項目成功、実行時例外なし |

実出力:

```text
Planning JavaScript assets: 8/8 HTTP 200
Tests: 12, passed: 12, failed: 0
Closing test context
Closing test browser
Browser closed
```

途中の検査失敗:
- 商品JSONの生バイトSHA256比較が不一致。Windows側CRLFと本番LFの差であり、改行正規化後とJSON解析後の両方で一致を確認。
- 壊れた候補保存の検査が、画面のエラー通知とNextの画面遷移通知の2要素を拾って失敗。テストを目的のエラー文の完全一致指定へ修正し、全12項目を再実行して成功。

今回直接編集したファイル: `README.md`（公開状態と検証結果）、`src/app/about/page.tsx`（公開前提の案内へ更新）、`tests/browser.cjs`（本番での通知選択を修正）。アプリ本体の22ファイルは上記の商品開発向け変更一覧を参照。
テストとこの記録だけの追補コミットは `[skip netlify]` を付け、検証済みの公開アプリを維持する。