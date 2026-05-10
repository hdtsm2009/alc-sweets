import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1F4E78] mb-2">このツールについて</h1>
      <p className="text-sm text-gray-500 mb-8">ALC 季節商品・旬素材スイーツ調査DB — 使い方ガイド</p>

      {/* 背景・目的 */}
      <section className="bg-white rounded-xl shadow-sm p-6 mb-5">
        <h2 className="text-lg font-bold text-[#1F4E78] mb-3 flex items-center gap-2">
          <span className="text-2xl">🎯</span> 背景と目的
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          このDBは、国内主要スイーツブランド約50社の季節限定商品<strong>476件</strong>（実在確認済み）を一元管理し、
          「今月は何が旬で、競合はどんな商品を出しているか」を<strong>誰でも即座に確認できる共通の参照先</strong>として機能させることを目的に作りました。
        </p>
      </section>

      {/* 使い方 */}
      <section className="bg-white rounded-xl shadow-sm p-6 mb-5">
        <h2 className="text-lg font-bold text-[#1F4E78] mb-4 flex items-center gap-2">
          <span className="text-2xl">📖</span> 使い方
        </h2>
        <div className="space-y-5">
          <div className="border-l-4 border-[#1F4E78] pl-4">
            <div className="font-bold text-sm text-gray-800 mb-1">
              <Link href="/" className="hover:underline text-[#1F4E78]">🔍 検索ページ</Link>（トップ）
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              ブランド・月・優先度・実装難易度・素材でフィルタリングできます。
              開くと<strong>今月の商品が自動表示</strong>されます。優先度の高い商品（S → A+）から順に並んでいます。
              商品カードをクリックすると詳細が見られます。
            </p>
          </div>
          <div className="border-l-4 border-[#1F4E78] pl-4">
            <div className="font-bold text-sm text-gray-800 mb-1">
              <Link href="/calendar/" className="hover:underline text-[#1F4E78]">📅 月別カレンダー</Link>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              12ヶ月のグリッドが表示されます。月をクリックするとその月の商品一覧が表示されます。
              各月のタイルに<strong>S・A+の件数バッジ</strong>が表示されるので、どの月に優先候補が多いか一目でわかります。
              年間の商品開発カレンダーを考える際に便利です。
            </p>
          </div>
          <div className="border-l-4 border-[#1F4E78] pl-4">
            <div className="font-bold text-sm text-gray-800 mb-1">
              <Link href="/picks/" className="hover:underline text-[#1F4E78]">⭐ A+候補ページ</Link>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              商品会議で<strong>即採用を検討すべき商品</strong>をまとめたページです。
              S候補（戦略最優先・5件）とA+候補（優先検討・45件）を月別に表示しています。
              毎月の商品会議の冒頭で全員が見る「スタート画面」として使うことを想定しています。
            </p>
          </div>
          <div className="border-l-4 border-gray-300 pl-4">
            <div className="font-bold text-sm text-gray-800 mb-1">🔗 商品詳細ページ</div>
            <p className="text-sm text-gray-600 leading-relaxed">
              各商品の全情報（価格・素材・販売形式・「真似すべき点」「応用案」など）を確認できます。
              公式URLも掲載しているので、その場で原商品を確認できます。
              詳細ページ内で「◀ 前の商品 / 次の商品 ▶」を使えば、一覧に戻らず連続閲覧できます。
            </p>
          </div>
        </div>
      </section>

      {/* 優先度・難易度の見方 */}
      <section className="bg-white rounded-xl shadow-sm p-6 mb-5">
        <h2 className="text-lg font-bold text-[#1F4E78] mb-4 flex items-center gap-2">
          <span className="text-2xl">🏷️</span> ラベルの見方
        </h2>
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">商品会議優先度</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3">
              <span className="bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 rounded-full font-bold text-xs shrink-0 mt-0.5">S</span>
              <span className="text-gray-600">戦略最優先候補。ALCが最も参考にすべき商品として厳選した5件。実装可能性・ブランド適合度・話題性がすべて高い。</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-orange-100 text-orange-700 border border-orange-300 px-2 py-0.5 rounded-full font-bold text-xs shrink-0 mt-0.5">A+</span>
              <span className="text-gray-600">優先検討候補。商品会議で必ず取り上げる価値がある45件。素材・価格帯・製法のいずれかでALCへの示唆が大きい。</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-yellow-100 text-yellow-700 border border-yellow-300 px-2 py-0.5 rounded-full font-bold text-xs shrink-0 mt-0.5">A</span>
              <span className="text-gray-600">参考候補。トレンド把握や素材・演出の参考になる商品。</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-100 text-blue-700 border border-blue-300 px-2 py-0.5 rounded-full font-bold text-xs shrink-0 mt-0.5">B</span>
              <span className="text-gray-600">参考情報。市場の幅を把握するための情報として収録。直接の参考度は低い。</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-gray-100 text-gray-600 border border-gray-300 px-2 py-0.5 rounded-full font-bold text-xs shrink-0 mt-0.5">C</span>
              <span className="text-gray-600">記録のみ。ALCへの直接的な示唆は薄い。</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">ALC実装難易度</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs shrink-0 mt-0.5">低（即検討可）</span>
              <span className="text-gray-600">製造・オペレーション・素材調達のいずれも課題が少なく、すぐに商品化を検討できる。</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs shrink-0 mt-0.5">中</span>
              <span className="text-gray-600">一部に課題あり。検討可能だが製造・素材面での確認が必要。</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs shrink-0 mt-0.5">高（実装困難）</span>
              <span className="text-gray-600">複数の課題があり実装ハードルが高い。参考・研究目的での収録。</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs shrink-0 mt-0.5">要レビュー</span>
              <span className="text-gray-600">難易度の情報が不十分。現場担当者が確認・判断する必要あり。</span>
            </div>
          </div>
        </div>
      </section>

      {/* 注意点 */}
      <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-5">
        <h2 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">⚠️</span> データ利用上の注意
        </h2>
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-0.5">•</span>
            <span>データはすべて<strong>実在確認済み商品のみ</strong>を収録していますが、販売終了・価格変更・仕様変更の可能性があります。詳細ページのURLから最新情報を必ず確認してください。</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-0.5">•</span>
            <span>「真似すべき点」「応用案」はALC向けのヒントとして記載したものです。そのまま商品化するものではなく、アイデアの起点として活用してください。</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-0.5">•</span>
            <span>価格・サイズ情報は調査時点のものです。実際の商品化にあたっては改めて確認が必要です。</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-0.5">•</span>
            <span>このツールは<strong>社内専用の業務ツール</strong>です。データや分析内容を社外に共有する際はご注意ください。</span>
          </li>
        </ul>
      </section>

      {/* データ追加方法 */}
      <section className="bg-white rounded-xl shadow-sm p-6 mb-5">
        <h2 className="text-lg font-bold text-[#1F4E78] mb-4 flex items-center gap-2">
          <span className="text-2xl">➕</span> データを追加・更新する方法
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Excelファイル（v12）がマスターデータです。Excelを編集してスクリプトを実行するだけで、このWebサイトに反映されます。
        </p>
        <div className="space-y-4">
          <div className="flex gap-3">
            <span className="bg-[#1F4E78] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
            <div>
              <div className="text-sm font-bold text-gray-800 mb-1">Excelを編集する</div>
              <p className="text-sm text-gray-600">
                <code className="bg-gray-100 px-1 rounded text-xs">HT_季節商品・旬素材スイーツ調査DB_v12_20260509.xlsx</code> の「商品別DB」シートに行を追加します。
                必須項目：ブランド名・商品名・対象月・主素材・商品会議優先度・実在確認レベル
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="bg-[#1F4E78] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
            <div>
              <div className="text-sm font-bold text-gray-800 mb-1">JSONに変換する</div>
              <p className="text-sm text-gray-600 mb-1">
                PowerShellで以下を実行します：
              </p>
              <code className="block bg-gray-100 text-gray-700 text-xs px-3 py-2 rounded">
                python export_to_json.py
              </code>
              <p className="text-xs text-gray-400 mt-1">
                ※ <code>14_季節商品調査/</code> フォルダで実行してください
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="bg-[#1F4E78] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
            <div>
              <div className="text-sm font-bold text-gray-800 mb-1">GitHubにpushする</div>
              <p className="text-sm text-gray-600 mb-1">
                生成された <code className="bg-gray-100 px-1 rounded text-xs">products.json</code> と <code className="bg-gray-100 px-1 rounded text-xs">meta.json</code> をpushします：
              </p>
              <code className="block bg-gray-100 text-gray-700 text-xs px-3 py-2 rounded whitespace-pre">{`cd C:\\dev\\alc-sweets
git add public/data/
git commit -m "データ更新 YYYY-MM-DD"
git push`}</code>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
            <div>
              <div className="text-sm font-bold text-gray-800 mb-1">自動デプロイ完了</div>
              <p className="text-sm text-gray-600">
                pushすると Netlify が自動的にビルド・デプロイします（1〜2分）。
                フッターの「データ更新」日付が変わっていれば反映完了です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* お問い合わせ */}
      <section className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
        <p className="text-sm text-gray-500">
          不具合・追加要望は <strong>槙野（HT Project）</strong> まで。
        </p>
      </section>
    </div>
  );
}
