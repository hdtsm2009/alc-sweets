import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "商品開発ガイド | ALC タルト開発DB",
  description: "季節商品の調査から候補比較、タルトの試作案、商品会議の準備まで。ALCの商品開発担当者向け実務ガイド。",
};

const sections = [
  ["brief", "01 企画条件"], ["research", "02 参考を探す"], ["compare", "03 比較・判断"],
  ["prototype", "04 試作メモ"], ["meeting", "05 会議・次の試作"], ["records", "保存と記録"],
];

const comparisonPoints = [
  ["主役の素材", "果物の品種・産地、熟度やカット、季節感の伝え方", "採用したい要素と、調達先に確認する規格を分ける。"],
  ["味・層・食感", "生地、クリーム、果実、アクセントの役割", "参考にする組み合わせを一つ決め、試作で変える要素を絞る。"],
  ["価格・提供形態", "ピース／ホール／セット、サイズ、税区分、掲載年", "比較条件をそろえる。元DB価格と最新掲載価格を別に読み、自社の目標価格は仮説として記入する。"],
  ["製造・店舗の負荷", "既存の台・製法、仕込み、仕上げ、運搬、店舗加工", "流用できる根拠と未確認点を記入。工場・店舗それぞれに確認する作業を決める。"],
  ["品質・ロス", "水分移行、変色、カット時の崩れ、仕込み量と残数", "比較したい観察項目と確認担当を決める。日持ち・保管条件は自社の検証手順で確認する。"],
  ["ALCらしさ", "主役素材の見せ方、味のまとまり、既存商品との違い", "取り入れる点・変える点を言葉にし、今回の企画で選ぶ理由を残す。"],
];

const exampleGroups = [
  {
    title: "企画の狙い",
    fields: [
      ["企画名", "秋のいちじくと紅茶のタルト（仮）"],
      ["販売を目指す月・期間", "秋の季節企画。いちじくの入荷見込みを確認して期間を決める。"],
      ["誰に・どんな場面で", "果実が主役のタルトを楽しみたいお客様へ。午後のティータイムを想定。"],
      ["主役素材・産地・品種", "いちじく。品種・産地・入荷規格・歩留まりは仕入先への確認事項。"],
      ["ALCらしさ・既存商品との差", "果実の見え方を参考にし、紅茶の香りを加えた時の違いを評価する。既存のいちじく商品との差も確認する。"],
    ],
  },
  {
    title: "構成と作業",
    fields: [
      ["タルト台・生地", "既存タルト台の使用を仮説にする。果実の水分と組み合わせた状態で適否を確認。"],
      ["クリーム・層の構成", "紅茶を加える案と加えない案を比較する。配合は試作担当と決める。"],
      ["アクセント・仕上げ", "いちじくのカットをそろえ、断面と食べやすさを確認。装飾を増やす必要があるかを検討。"],
      ["サイズ・提供形態", "ピース販売を想定。使用する型、カット数、果実量は既存商品との比較後に決定。"],
      ["既存資材・製法の流用", "既存の台・包材・仕上げ道具の適合を確認。流用可否が未記録のものは担当に確認する。"],
      ["工場・店舗の分担", "台・クリームの仕込みと果実の仕上げについて、実施場所と受け渡し条件を工場・店舗で確認する。"],
    ],
  },
  {
    title: "判断と次の行動",
    fields: [
      ["目標販売価格・税区分", "未設定。比較した商品の単位・サイズ・税込／税別を整理し、原価と作業負荷の確認後に設定する。"],
      ["調達・日持ち・ロスの課題", "果実の規格差、水分移行、変色、残数への対応を確認。日持ち・保管条件は未検証として残す。"],
      ["試作で確かめる項目", "果実と紅茶の香りのバランス、カット時の保形性、生地への水分移行、仕上げ時間を同じ条件で比較する。"],
      ["次のアクション・担当・期限", "仕入担当：次回会議までに規格・入荷見込みを確認。試作担当：比較する2案と評価方法を準備。会議で担当者名・実施日を確定する。"],
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto pb-8">
      <header className="surface overflow-hidden mb-6">
        <div className="p-6 md:p-8 border-b border-slate-200">
          <p className="eyebrow">ALC / 商品開発の実務ガイド</p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1F4E78] leading-relaxed">参考商品を、次の試作案に変える</h1>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed mt-3 max-w-3xl">季節の素材を探し、比較する理由を決め、試作で確かめることまで書く。商品開発担当者が、調査から商品会議までこのDBを使うための手順です。</p>
          <div className="mt-5 flex flex-wrap gap-3 no-print">
            <Link href="/?months=" className="action action-primary">参考商品を探す →</Link>
            <Link href="/planning/" className="action">比較・試作メモを開く →</Link>
          </div>
        </div>
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-slate-50">
          {[
            ["企画テーマを決めたい", "/calendar/", "月別の過去事例から、素材と季節の切り口を探す。"],
            ["新しい商品情報を確認したい", "/news/", "確認日・発売予定・掲載価格を読み、公式の出典へ進む。"],
            ["既存の資材・製法を活かしたい", "/?months=&category=tart&development=reuse&view=list", "タルト台の判断記録がある候補を一覧で見る。流用不可の記録も含む。"],
          ].map(([title, href, description]) => <Link key={title} href={href} className="p-5 hover:bg-blue-50 no-print"><h2 className="font-bold text-sm text-[#1F4E78]">{title} →</h2><p className="text-xs leading-relaxed text-slate-600 mt-2">{description}</p></Link>)}
        </div>
      </header>

      <nav aria-label="商品開発ガイドの目次" className="flex flex-wrap gap-2 mb-8 no-print">
        {sections.map(([id, label]) => <a key={id} href={"#" + id} className="search-chip">{label}</a>)}
      </nav>

      <section id="brief" className="surface p-5 md:p-7 mb-6 scroll-mt-6">
        <p className="eyebrow">STEP 01 / 企画条件</p>
        <h2 className="section-title">検索する前に、今回の狙いを一文にする</h2>
        <p className="text-sm text-slate-600 leading-relaxed">まず「いつ・誰に・どんな体験を届けたいか」を決めます。まだ決まっていない条件は、未定のまま確認事項として残せます。</p>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {[
            ["販売時期と用途", "販売したい月・期間、ピースかホールか、日常利用か贈答かを整理する。"],
            ["主役の素材と切り口", "季節の果実、食感、香りなど、今回伝えたい要素を一つ決める。"],
            ["開発の条件", "既存の台・包材、仕上げを担う場所、目標価格、試作や確認に必要な日程を整理する。"],
          ].map(([title, text]) => <div className="bg-slate-50 rounded-lg p-4" key={title}><h3 className="font-bold text-sm text-slate-700">{title}</h3><p className="text-sm text-slate-600 leading-relaxed mt-2">{text}</p></div>)}
        </div>
        <p className="mt-4 border-l-4 border-[#1F4E78] pl-4 text-sm leading-relaxed text-slate-700"><strong>企画の一文の例：</strong>「秋のティータイムに向けて、いちじくを主役にしたピースタルトを、既存の台を使う案から検討する。」</p>
        <p className="text-xs text-slate-500 mt-3">この段階で残すもの：企画の一文と、まだ決まっていない条件。</p>
      </section>

      <section id="research" className="surface p-5 md:p-7 mb-6 scroll-mt-6">
        <p className="eyebrow">STEP 02 / 参考を探す</p>
        <h2 className="section-title">2〜4件を、比較する役割を決めて選ぶ</h2>
        <p className="text-sm text-slate-600 leading-relaxed">検索は全期間が対象です。素材から広く探し、月・ブランド・年を必要に応じて絞ります。候補は最大4件まで。気になる商品の「比較候補に追加」を押してください。</p>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          {[
            ["自社の基準", "今回の案と比べたい、自社の素材・提供形態・既存商品の記録。"],
            ["同じ素材の参考", "果実の見せ方、クリーム、季節の訴求を比べたい商品。"],
            ["構成の参考", "別の菓子も含め、香り・層・食感の組み合わせを学びたい商品。"],
            ["工程の参考", "仕込みや仕上げ、提供形態の工夫を検討したい商品。"],
          ].map(([title, text]) => <div key={title} className="border border-slate-200 rounded-lg p-4"><h3 className="text-sm font-bold text-[#1F4E78]">{title}</h3><p className="text-sm text-slate-600 mt-1 leading-relaxed">{text}</p></div>)}
        </div>
        <div className="flex flex-wrap gap-3 mt-4 no-print">
          <Link className="action" href="/?months=&q=いちじく&category=tart">いちじくのタルトを探す</Link>
          <Link className="action" href="/?months=&category=other&view=list">他の菓子から構成を探す</Link>
          <Link className="action" href="/picks/">優先候補を見る</Link>
        </div>
        <details className="mt-5 border-t border-slate-200 pt-4">
          <summary className="cursor-pointer font-bold text-sm text-[#1F4E78]">検索を使い分けるコツ</summary>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 mt-3 leading-relaxed">
            <li>「いちご タルト」は両方を含む検索。「いずれかの語を含む」にすると候補を広げられます。「苺／いちご」「栗／マロン」などの表記違いにも対応しています。</li>
            <li>除外は「-チョコ」、ひと続きの語は「&quot;紅茶 タルト&quot;」。0件なら検索語を残して全月・全DBへ広げます。</li>
            <li>月は複数選べます。「今月」「翌月から3か月」を利用すると、検討する季節の過去事例を絞れます。</li>
            <li>「元DBの対象年」と「最新の公式情報確認分」は別の条件です。過去の商品記録に最新情報が追記された場合、年・月の条件で外れることがあります。</li>
            <li>見た目の候補探しは「画像カード」、素材・価格・難易度を続けて読むときは「一覧で比較」。表示件数は24件・48件・全件から選べます。</li>
            <li>「掲載写真あり」はSNS等も含みます。生成イメージは別条件で絞れます。「画像なし」の商品も、素材や構成の参考にできます。</li>
          </ul>
        </details>
        <p className="text-xs text-slate-500 mt-4">この段階で残すもの：参考商品の候補と、それぞれから何を学びたいか。</p>
      </section>

      <section id="compare" className="surface p-5 md:p-7 mb-6 scroll-mt-6">
        <p className="eyebrow">STEP 03 / 比較・判断</p>
        <h2 className="section-title">写真の印象から、素材・構成・作業の比較へ進む</h2>
        <p className="text-sm text-slate-600 leading-relaxed">「比較・試作メモ」を開き、同じ項目を横に並べます。詳細で出典を確認し、参考にする点と自社で確かめる点を分けてください。</p>
        <div className="overflow-x-auto mt-4 rounded-lg border border-slate-200" tabIndex={0} aria-label="開発比較の着眼点。横にスクロールできます">
          <table className="w-full min-w-[620px] text-sm text-left">
            <thead className="bg-slate-100 text-slate-700"><tr><th scope="col" className="p-3 w-32">比較する軸</th><th scope="col" className="p-3">記録から読むこと</th><th scope="col" className="p-3">試作案へつなげること</th></tr></thead>
            <tbody>{comparisonPoints.map(([axis, record, action]) => <tr className="border-t border-slate-200 align-top" key={axis}><th scope="row" className="p-3 text-[#1F4E78]">{axis}</th><td className="p-3 text-slate-600 leading-relaxed">{record}</td><td className="p-3 text-slate-600 leading-relaxed">{action}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-5">
          <h3 className="font-bold text-sm text-[#1F4E78]">「確認できた事実」と「今回の仮説」を分ける</h3>
          <p className="text-sm text-slate-700 leading-relaxed mt-2">商品名・原文価格・掲載URLは出典に戻って確認。DBの優先度やALC向け分析は調査時点の評価です。生成イメージは説明から作った参考像で、実物の外観や配合の証拠にはなりません。実写も掲載年・仕様を詳細で確認します。</p>
          <p className="text-sm text-slate-700 leading-relaxed mt-2">「記録あり」は「実装可能」と同じではありません。タルト台の判断記録には流用不可も含まれます。空欄は確認事項として残します。</p>
        </div>
        <p className="text-xs text-slate-500 mt-4">この段階で残すもの：採用したい要素、変える要素、確認が必要な条件。</p>
      </section>

      <section id="prototype" className="surface p-5 md:p-7 mb-6 scroll-mt-6">
        <p className="eyebrow">STEP 04 / 試作メモ</p>
        <h2 className="section-title">構成案に、評価方法と次の行動を添える</h2>
        <p className="text-sm text-slate-600 leading-relaxed">「比較・試作メモ」の下部にある15項目へ記入します。主役素材・生地・クリームだけでなく、工場と店舗の分担、調達の課題、試作で判断することまで書くと、次の担当者に渡せます。</p>
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 leading-relaxed"><strong>記入例：架空の企画です。</strong> 以下は入力の粒度を示す例で、実商品のレシピ・試作結果・商品化の承認ではありません。あなたの企画に置き換えて記入してください。</div>
        <div className="grid lg:grid-cols-3 gap-5 mt-5">
          {exampleGroups.map(group => <div key={group.title} className="bg-slate-50 rounded-lg p-4"><h3 className="text-base font-bold text-[#1F4E78] border-b border-slate-200 pb-3 mb-3">{group.title}</h3><dl className="space-y-4">{group.fields.map(([label, value]) => <div key={label}><dt className="text-xs font-bold text-slate-700">{label}</dt><dd className="text-sm text-slate-600 leading-relaxed mt-1">{value}</dd></div>)}</dl></div>)}
        </div>
        <div className="flex flex-wrap gap-3 items-center mt-5 no-print"><Link href="/planning/#draft" className="action action-primary">自分の試作メモを書く →</Link><span className="text-xs text-slate-500">この記入例はメモへ自動転記されません。</span></div>
        <p className="text-xs text-slate-500 mt-4">この段階で残すもの：一つの試作仮説、比較する条件、見る項目、担当・期限。</p>
      </section>

      <section id="meeting" className="surface p-5 md:p-7 mb-6 scroll-mt-6">
        <p className="eyebrow">STEP 05 / 会議・次の試作</p>
        <h2 className="section-title">会議には「何を作るか」と「何を確かめるか」を持ち込む</h2>
        <div className="grid md:grid-cols-2 gap-6 mt-3">
          <div><h3 className="font-bold text-sm text-[#1F4E78] mb-3">会議前に揃えるもの</h3><ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 leading-relaxed"><li>今回の狙いと、参考商品を選んだ理由。</li><li>出典・確認日・価格の単位がわかる参照記録。</li><li>既存商品との差と、今回試したい構成。</li><li>調達・製造・品質について未確認の点。</li><li>評価項目と、担当・実施日を決めるための案。</li></ul></div>
          <div><h3 className="font-bold text-sm text-[#1F4E78] mb-3">会議で決めてメモに残すこと</h3><ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 leading-relaxed"><li>試作に進む、条件を変える、追加調査する、のいずれか。</li><li>比較する案と、判断できる状態にするための観察・計測項目。</li><li>調達・製造・店舗の確認担当と期限。</li><li>次回見直す日と、必要な資料・試作品。</li></ul></div>
        </div>
        <div className="mt-5 border-l-4 border-[#1F4E78] pl-4 text-sm text-slate-700 leading-relaxed"><strong>試作後の残し方：</strong>「おいしかった」だけで終えず、条件・観察結果・次に変える点を「試作で確かめる項目」「次のアクション・担当・期限」へ追記します。配合や製造の正式な記録は所定の記録へ残し、このメモには参照先を記入してください。</div>
        <p className="text-xs text-slate-500 mt-4">「メモと出典を書き出す」で、参照商品付きのMarkdownファイルを保管できます。書き出したファイルを会議の共有資料に添付します。</p>
      </section>

      <section id="records" className="surface p-5 md:p-7 mb-6 scroll-mt-6">
        <h2 className="section-title">保存・参照記録・共有で迷わないために</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-lg border border-slate-200 p-4"><h3 className="font-bold text-sm text-[#1F4E78]">試作メモは、このブラウザに1案</h3><p className="text-sm text-slate-600 leading-relaxed mt-2">入力は同じブラウザ・端末内へ自動保存します。別の案を書き始める前に「メモと出典を書き出す」で現在案を保管してください。保存エラーが出た場合も、まず書き出して退避します。</p><p className="text-xs text-slate-500 mt-2">別の端末への同期・共同編集はありません。ブラウザの保存データを消すと、端末内の候補・メモも失われます。</p></div>
          <div className="rounded-lg border border-slate-200 p-4"><h3 className="font-bold text-sm text-[#1F4E78]">比較中の候補と、案に紐づく参照は別</h3><p className="text-sm text-slate-600 leading-relaxed mt-2">候補を入れ替えたりDBの価格が更新されたりしても、保存済みの参照記録は自動で書き換わりません。新しい内容を使うと決めたら「現在の比較候補をこの案の参照にする」を押します。</p><p className="text-xs text-slate-500 mt-2">保存・書き出しには「この案に紐づく参照商品」の記録が使われます。書き出す前に対象を確認してください。</p></div>
        </div>
        <dl className="mt-5 space-y-4 text-sm">
          <div><dt className="font-bold text-slate-700">同僚に同じ検索結果を見てもらいたい</dt><dd className="text-slate-600 leading-relaxed mt-1">検索画面の「検索条件のリンクをコピー」を使います。URLに含まれるのは検索条件・並び順・表示設定です。候補や試作メモは含まれません。</dd></div>
          <div><dt className="font-bold text-slate-700">比較しながら、もう一度商品を探したい</dt><dd className="text-slate-600 leading-relaxed mt-1">比較画面の「検索条件を保って商品を探す」で戻ります。詳細の前後移動も、元の一覧または比較候補の範囲内で行えます。</dd></div>
          <div><dt className="font-bold text-slate-700">写真や価格の違い、未掲載の商品を見つけた</dt><dd className="text-slate-600 leading-relaxed mt-1">商品ID・ブランド・商品名・掲載URL・確認日・修正したい箇所をまとめ、管理担当へ共有します。画像違いは該当商品と画像の掲載元を添えてください。DBへの反映は管理担当が行います。</dd></div>
        </dl>
      </section>

      <section id="labels" className="surface p-5 md:p-7 mb-6 scroll-mt-6">
        <h2 className="section-title">判断に使うラベル・日付の読み方</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div><h3 className="font-bold text-slate-700 mb-3">確認状態を分けて読む</h3><dl className="space-y-3">
            {[
              ["DB採用", "調査DBへ収録する判断。実在・販売中の証明ではありません。"],
              ["実在・販売・価格の確認", "それぞれ別の記録です。実在確認があっても、現在の販売・価格・在庫は掲載元で確認します。"],
              ["対象年・月", "元DBが対象にした時期。今季の発売月とは限りません。"],
              ["情報確認日・公式発表日・初回収録日", "確認した日、情報が発表された日、DBに初めて入った日は別です。最新情報は「最新の確認情報」を参照します。"],
              ["画像の状態", "掲載写真は年・仕様を確認。生成イメージは参考像。未取得でも、商品記録や出典を確認できます。"],
            ].map(([label, text]) => <div key={label}><dt className="font-semibold text-[#1F4E78]">{label}</dt><dd className="text-slate-600 leading-relaxed mt-1">{text}</dd></div>)}
          </dl></div>
          <div><h3 className="font-bold text-slate-700 mb-3">優先度・難易度は、調査時点の評価</h3><dl className="space-y-3">
            <div><dt className="font-semibold text-[#1F4E78]">S・A+ / A / B・C</dt><dd className="text-slate-600 leading-relaxed mt-1">S・A+は当時の会議優先度が高い候補、Aは参考候補、B・Cは参考情報や記録。今回の素材・用途・開発条件に合うかをあらためて判断します。</dd></div>
            <div><dt className="font-semibold text-[#1F4E78]">低（即検討可）・中・高（実装困難）・要レビュー</dt><dd className="text-slate-600 leading-relaxed mt-1">「低」は当時取り組みやすいと評価された記録です。現在の製造・調達の確認済みを意味しません。「要レビュー」は情報を補って現場で判断します。</dd></div>
            <div><dt className="font-semibold text-[#1F4E78]">ALC向け分析・試作メモ</dt><dd className="text-slate-600 leading-relaxed mt-1">ALC向け分析はDBに記録された評価・仮説、試作メモは記入者の企画案です。出典にある事実、試作で観察した結果、自分たちの仮説を分けて残します。</dd></div>
          </dl><Link className="inline-block text-[#1F4E78] underline mt-4 no-print" href="/images/">画像の出典・取得できない理由を見る →</Link></div>
        </div>
      </section>

      <footer className="surface p-5 md:p-6 flex flex-wrap items-center justify-between gap-4">
        <div><p className="font-bold text-[#1F4E78]">まずは今回の主役素材から。</p><p className="text-sm text-slate-600 mt-1">候補を選び、試作で確かめたいことを一つ書いてみてください。</p><p className="text-xs text-slate-500 mt-3">不具合・追加要望：槙野（HT Project）</p></div>
        <div className="flex flex-wrap gap-2 no-print"><Link className="action action-primary" href="/?months=">参考商品を探す</Link><Link className="action" href="/planning/">試作メモを開く</Link></div>
      </footer>
    </div>
  );
}
