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
          このDBは、国内主要スイーツブランド約50社の季節商品（実在確認レベルは商品ごとに記録）を一元管理し、
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
              開くと<strong>全期間の商品</strong>を対象に表示します。検索語がある場合は商品名や素材との関連度を優先します。
              条件は一つずつ解除でき、表示件数の「全件表示」で200件を超える結果もすべて確認できます。商品カードをクリックすると詳細が見られます。
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
              商品会議で<strong>調査時点で会議優先度が高かった商品</strong>をまとめたページです。
              S候補（戦略最優先）とA+候補（優先検討）を月別に表示しています。
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

      <section className="surface p-6 mb-5">
        <h2 className="section-title">検索から比較へ</h2>
        <ol className="list-decimal pl-5 space-y-3 text-sm text-slate-600">
          <li>最初は全期間を検索します。「いちご タルト」のように入力すると、苺などの表記違いも含めて探せます。「すべての語」「いずれかの語」を切り替えられます。</li>
          <li>素材・ブランド・月の件数を見て絞り込みます。年は元DBの対象年です。「最新の公式情報確認分」は情報確認日による別の条件で、現在の在庫を意味しません。</li>
          <li>0件なら検索語を残して全月・全DBへ広げられます。適用中の条件は一つずつ解除できます。</li>
          <li>画像カードと一覧を切り替え、24件・48件・全件から表示数を選べます。詳細の前後移動は元の検索結果の範囲内です。</li>
          <li>最大4件を候補に追加して比較します。検索条件を保って戻れます。最新価格・確認日・出典を、過去の価格と区別して比較・書き出しできます。</li>
        </ol>
        <p className="text-xs text-slate-500 mt-4">検索条件のURLはコピーできます。候補と試作メモの内容は端末内に保存され、URLには含みません。価格の単位や税区分は原文で確認してください。</p>
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
              <span className="text-gray-600">戦略最優先候補。調査時点で最優先と記録された参考事例。実装可能性・適合度は個別に再確認します。</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-orange-100 text-orange-700 border border-orange-300 px-2 py-0.5 rounded-full font-bold text-xs shrink-0 mt-0.5">A+</span>
              <span className="text-gray-600">優先検討候補。調査時点で商品会議の優先検討対象となった事例。素材・価格帯・製法のいずれかでALCへの示唆が大きい。</span>
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

      <section className="surface p-6 mb-5">
        <h2 className="section-title">参考商品をタルトの試作案へ</h2>
        <ol className="list-decimal pl-5 space-y-3 text-sm text-gray-700">
          <li>開発する月と素材を選びます。「翌月から3か月」や「他の菓子から発想する」も使えます。</li>
          <li>気になる商品の詳細で、価格の条件・対象年・出典・既存タルト台の流用・店舗負荷を確認します。</li>
          <li>「比較候補に追加」で最大4件を選び、「比較・試作メモ」で同じ項目を並べます。</li>
          <li>主役素材、台、クリーム、差別化、価格目標、ロス対策と試作評価項目を記入します。</li>
          <li>端末に保存し、「メモと出典を書き出す」で会議に持ち込めます。保存先はこのブラウザだけで、共同編集はしません。</li>
        </ol>
        <p className="text-sm text-gray-600 mt-4">商品情報は調査時点の記録、ALC向け分析はExcel上の評価・仮説、試作メモは記入者の企画案です。これらを混ぜて確認済みとは扱いません。</p>
      </section>
      {/* 注意点 */}
      <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-5">
        <h2 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">⚠️</span> データ利用上の注意
        </h2>
        <ul className="space-y-2 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-0.5">•</span>
            <span>DB採用・実在確認・販売確認・価格確認・画像確認は別々の項目です。採用済みでも、実在や現在の販売を保証するものではありません。販売終了・価格変更・仕様変更の可能性があります。詳細ページのURLから最新情報を必ず確認してください。</span>
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
          Excelファイル（v12）がマスターデータです。変換スクリプトはローカルのJSONを更新します。公開サイトへの反映は別作業です。
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
              <div className="text-sm font-bold text-gray-800 mb-1">JSONに変換する（標準は外部通信なし）</div>
              <p className="text-sm text-gray-600 mb-1">
                PowerShellで以下を実行します：
              </p>
              <code className="block bg-gray-100 text-gray-700 text-xs px-3 py-2 rounded">
                python export_to_json.py
              </code>
              <p className="text-xs text-gray-500 mt-1">
                ※ 作業コピーの <code>database/</code> フォルダで実行してください。<br />
                画像は手動設定と既存キャッシュを利用します。画像URLの取得は画像確認済みを意味しません。<br />
                外部取得が必要な場合だけ <code>--fetch-images</code> を指定します。
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            生成後はローカルで内容を確認し、承認済みの公開手順で反映してください。変換だけでは公開サイトは更新されません。
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
