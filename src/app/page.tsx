"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useProducts, existenceLabel, hasRecord, PRIORITY_COLORS } from "@/lib/data";
import { buildSearchIndex, defaultSearch, parseSearch, searchUrl, searchProducts, resultPage, latestCheckDate, checkedDate, INGREDIENTS, hasIngredient, type SearchState } from "@/lib/search";
import { imageForProduct } from "@/lib/news";
import { useCandidates } from "@/lib/planning";
import CandidateButton from "@/components/CandidateButton";
import ProductImage from "@/components/ProductImage";

const fieldClass = "field w-full min-w-0";
const monthLabel = (m: string) => m === "unknown" ? "月未設定" : m + "月";

export default function HomePage() {
  const { products, loading, error, retry } = useProducts();
  const { ids } = useCandidates();
  const [state, setState] = useState<SearchState>(defaultSearch);
  const [ready, setReady] = useState(false);
  const [month, setMonth] = useState(1);
  const [shareMessage, setShareMessage] = useState("");
  const [printing, setPrinting] = useState(false);
  const [externalQuery, setExternalQuery] = useState("");
  const update = useCallback((patch: Partial<SearchState>) => {
    setState(previous => ({ ...previous, ...patch, page: patch.page ?? 1 }));
    setShareMessage("");
  }, []);

  useEffect(() => {
    const restore = () => { setState(parseSearch(new URLSearchParams(window.location.search))); setReady(true); };
    restore();
    setMonth(new Date().getMonth() + 1);
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  const index = useMemo(() => buildSearchIndex(products), [products]);
  const latestDate = useMemo(() => latestCheckDate(products), [products]);
  const hits = useMemo(() => searchProducts(index, state, latestDate), [index, state, latestDate]);
  const pagination = resultPage(hits, state);
  const url = searchUrl({ ...state, page: pagination.page });
  useEffect(() => {
    if (ready && !loading) window.history.replaceState(window.history.state, "", url);
  }, [url, ready, loading]);
  useEffect(() => {
    if (!printing) return;
    const timer = window.setTimeout(() => { window.print(); setPrinting(false); }, 150);
    return () => window.clearTimeout(timer);
  }, [printing]);

  const brands = useMemo(() => [...new Set(products.map(p => p.ブランド名))].sort((a,b) => a.localeCompare(b,"ja")), [products]);
  const years = useMemo(() => [...new Set(products.map(p => p.対象年 || "unknown"))].sort().reverse(), [products]);
  const countsFor = (key: keyof SearchState) => searchProducts(index, { ...state, [key]: key === "months" ? [] : "" }, latestDate).map(hit => hit.product);
  const monthPool = useMemo(() => countsFor("months"), [index, state, latestDate]); // Other conditions remain active.
  const brandPool = useMemo(() => countsFor("brand"), [index, state, latestDate]);
  const ingredientPool = useMemo(() => countsFor("ingredient"), [index, state, latestDate]);
  const ingredients = [...new Set([...INGREDIENTS.filter(item => products.some(p => hasIngredient(p, item))), ...(state.ingredient ? [state.ingredient] : [])])];
  const wordOnly = useMemo(() => searchProducts(index, { ...defaultSearch(), q: state.q, mode: state.mode }, latestDate), [index, state.q, state.mode, latestDate]);
  const noMonthCount = monthPool.length;
  const anyWordsCount = useMemo(() => state.mode === "all" && state.q.trim().split(/\s+/).length > 1 ? searchProducts(index, { ...state, mode: "any" }, latestDate).length : 0, [index, state, latestDate]);
  const latestCount = products.filter(p => checkedDate(p) === latestDate && latestDate).length;
  const active: { key: keyof SearchState; label: string; month?: string }[] = [
    ...state.months.map(m => ({ key: "months" as const, label: monthLabel(m), month: m })),
    ...([
      ["q", state.q && "検索：" + state.q], ["brand", state.brand], ["ingredient", state.ingredient && "素材：" + state.ingredient],
      ["priority", state.priority && "優先度 " + state.priority], ["difficulty", state.difficulty && "難易度：" + state.difficulty],
      ["brandType", state.brandType], ["existence", state.existence && "実在確認：" + state.existence],
      ["year", state.year && "元DB：" + (state.year === "unknown" ? "年未記録" : state.year + "年")],
      ["category", state.category && (state.category === "tart" ? "タルト" : "他の菓子")],
      ["development", state.development && ({ prototype: "試作案あり", reuse: "タルト台の判断記録あり", price: "価格出典あり" }[state.development])],
      ["image", state.image && ({ photo: "掲載写真あり", generated: "生成イメージあり", none: "画像なし" }[state.image])],
      ["latest", state.latest && "最新確認分：" + latestDate],
    ] as [keyof SearchState, string][]).filter(([,label]) => label).map(([key,label]) => ({ key, label })),
  ];
  const clear = () => setState({ ...defaultSearch(), view: state.view, size: state.size });
  const toggleMonth = (m: string) => update({ months: state.months.includes(m) ? state.months.filter(v => v !== m) : [...state.months, m] });
  const shown = printing ? hits : pagination.items;

  const controls = (position: string) => <div className="flex flex-wrap gap-3 items-center justify-between no-print py-3" aria-label={position + "のページ操作"}>
    <span className="text-sm text-slate-600">{pagination.start}–{pagination.end} / {hits.length}件</span>
    <div className="flex gap-2 items-center">
      <button className="action" disabled={pagination.page <= 1} onClick={() => update({ page: pagination.page - 1 })}>前へ</button>
      <label className="text-sm flex items-center gap-2">ページ<select aria-label={position + "のページ"} className="field" value={pagination.page} onChange={e => update({ page: Number(e.target.value) })}>{Array.from({length: pagination.pages}, (_,i) => <option key={i + 1}>{i + 1}</option>)}</select><span>/ {pagination.pages}</span></label>
      <button className="action" disabled={pagination.page >= pagination.pages} onClick={() => update({ page: pagination.page + 1 })}>次へ</button>
    </div>
  </div>;

  if (error) return <div role="alert" className="surface p-10 text-center"><p>{error}</p><button onClick={retry} className="action mt-4">再試行</button></div>;
  if (loading || !ready) return <p role="status" className="text-center py-16 text-slate-500">商品を読み込み中...</p>;

  return <div className="pb-16">
    <div className="flex flex-wrap items-end justify-between gap-4 mb-5 no-print">
      <div><p className="eyebrow">ALC / 商品開発の参考を探す</p><h1 className="text-2xl font-bold text-[#1F4E78]">商品検索</h1><p className="text-sm text-slate-600 mt-2">素材や商品名で探し、最大4件を比較して試作へ。</p></div>
      <Link href={"/planning/?back=" + encodeURIComponent(url)} className="action action-primary">比較・試作メモ {ids.length}/4 →</Link>
    </div>

    <section className="surface p-4 md:p-5 no-print" aria-label="商品検索の条件">
      <label htmlFor="product-query" className="block font-bold text-sm mb-2 text-[#1F4E78]">商品名・素材・ブランド・開発メモ</label>
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48"><input id="product-query" type="search" value={state.q} onChange={e => update({ q: e.target.value })} className="field w-full !py-3" placeholder="例：いちご タルト ／ 栗 チーズ ／ キルフェボン" autoComplete="off" aria-describedby="search-help" /></div>
        <select className="field" aria-label="検索語の組み合わせ" value={state.mode} onChange={e => update({ mode: e.target.value })}><option value="all">すべての語を含む</option><option value="any">いずれかの語を含む</option></select>
      </div>
      <p id="search-help" className="text-xs text-slate-500 mt-2">「苺・いちご」「栗・マロン」やブランド名の空白を吸収します。除外は「-チョコ」、ひと続きの語は「&quot;紅茶 タルト&quot;」。</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <label className="text-xs text-slate-600">素材<select className={fieldClass + " mt-1"} value={state.ingredient} onChange={e => update({ ingredient: e.target.value })}><option value="">すべての素材</option>{ingredients.map(item => <option key={item} value={item}>{item}（{ingredientPool.filter(p => hasIngredient(p,item)).length}）</option>)}</select></label>
        <label className="text-xs text-slate-600">ブランド<select className={fieldClass + " mt-1"} value={state.brand} onChange={e => update({ brand: e.target.value })}><option value="">すべてのブランド</option>{[...new Set([...brands, ...(state.brand ? [state.brand] : [])])].map(brand => <option key={brand} value={brand}>{brand}（{brandPool.filter(p => p.ブランド名 === brand).length}）</option>)}</select><span className="block mt-1">{state.brand ? brandPool.filter(p => p.ブランド名 === state.brand).length + "件（他の条件を適用）" : "自社・競合を含む"}</span></label>
        <label className="text-xs text-slate-600">参考範囲<select className={fieldClass + " mt-1"} value={state.category} onChange={e => update({ category: e.target.value })}><option value="">タルト＋他の菓子</option><option value="tart">タルト</option><option value="other">他の菓子から発想</option></select></label>
        <label className="text-xs text-slate-600">画像<select className={fieldClass + " mt-1"} value={state.image} onChange={e => update({ image: e.target.value })}><option value="">画像の有無を問わない</option><option value="photo">掲載写真あり（SNS含む）</option><option value="generated">生成イメージあり</option><option value="none">画像なし・対応未確認</option></select></label>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-3 mb-2"><span className="text-xs font-bold text-slate-600">元DBの対象月（複数選択）</span><button className="text-xs underline text-[#1F4E78]" onClick={() => update({months:[String(month)]})}>今月</button><button className="text-xs underline text-[#1F4E78]" onClick={() => update({months:[1,2,3].map(offset => String((month - 1 + offset) % 12 + 1))})}>翌月から3か月</button><span className="text-[11px] text-slate-500">件数はほかの条件を反映</span></div>
        <div className="flex flex-wrap gap-1.5">
          <button aria-pressed={!state.months.length} className={"search-chip " + (!state.months.length ? "is-active" : "")} onClick={() => update({ months: [] })}>全月 {monthPool.length}</button>
          {[...Array.from({length:12},(_,i)=>String(i+1)), "unknown"].map(m => <button key={m} aria-pressed={state.months.includes(m)} className={"search-chip " + (state.months.includes(m) ? "is-active" : "")} onClick={() => toggleMonth(m)}>{monthLabel(m)} <span className="opacity-70">{monthPool.filter(p => m === "unknown" ? p.対象月 === null : p.対象月 === Number(m)).length}</span></button>)}
        </div>
      </div>
      <details className="mt-4 pt-3 border-t border-slate-100">
        <summary className="cursor-pointer text-sm font-semibold text-[#1F4E78]">年・優先度・開発情報で絞り込む</summary>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <label className="text-xs text-slate-600">元DBの対象年<select className={fieldClass + " mt-1"} value={state.year} onChange={e => update({ year: e.target.value })}><option value="">すべての年</option>{[...new Set([...years,...(state.year ? [state.year] : [])])].map(year => <option key={year} value={year}>{year === "unknown" ? "年未記録" : year + "年"}</option>)}</select></label>
          <label className="text-xs text-slate-600">自社・競合<select className={fieldClass + " mt-1"} value={state.brandType} onChange={e => update({ brandType: e.target.value })}><option value="">すべて</option><option>自社</option><option>競合</option></select></label>
          <label className="text-xs text-slate-600">商品会議優先度<select className={fieldClass + " mt-1"} value={state.priority} onChange={e => update({ priority: e.target.value })}><option value="">すべて</option>{["S","A+","A","B","C"].map(v => <option key={v}>{v}</option>)}</select></label>
          <label className="text-xs text-slate-600">実装難易度<select className={fieldClass + " mt-1"} value={state.difficulty} onChange={e => update({ difficulty: e.target.value })}><option value="">すべて</option>{[...new Set(products.map(p=>p.ALC実装難易度).filter(Boolean))].map(v => <option key={v}>{v}</option>)}</select></label>
          <label className="text-xs text-slate-600">開発情報の記録<select className={fieldClass + " mt-1"} value={state.development} onChange={e => update({ development: e.target.value })}><option value="">記録の有無を問わない</option><option value="prototype">具体的な試作案あり</option><option value="reuse">タルト台の判断記録あり</option><option value="price">価格出典あり</option></select></label>
          <label className="text-xs text-slate-600">実在確認レベル<select className={fieldClass + " mt-1"} value={state.existence} onChange={e => update({ existence: e.target.value })}><option value="">すべて</option>{[...new Set(products.map(existenceLabel))].sort().map(v => <option key={v}>{v}</option>)}</select></label>
        </div>
        <p className="text-xs text-slate-500 mt-3">対象年・月と評価は元DBの記録です。現在の販売中・在庫ありを示すものではありません。</p>
      </details>
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button className={"search-chip " + (state.latest ? "is-active" : "")} aria-pressed={!!state.latest} disabled={!latestDate} onClick={() => update({latest:state.latest ? "" : "latest", sort:state.latest ? "auto" : "checked"})}>最新の公式情報確認分 {latestDate} / 全DB {latestCount}件</button>
        {state.latest && <button className="text-xs underline" onClick={() => update({ months: [], year: "" })}>元DBの年・月の制限を外す</button>}
        <Link href="/news/" className="text-xs text-[#1F4E78] underline">新着ニュースへ</Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 items-center" aria-label="適用中の検索条件">
        {active.length ? <><span className="text-xs text-slate-500">適用中：</span>{active.map(chip => <button key={chip.key + (chip.month || "")} aria-label={chip.label + "を解除"} className="search-chip !bg-blue-50 !text-[#1F4E78]" onClick={() => chip.month ? toggleMonth(chip.month) : update({ [chip.key]: "" })}>{chip.label} ×</button>)}<button className="text-xs text-red-700 underline px-2" onClick={clear}>全条件をクリア</button></> : <p className="text-xs text-slate-500">全期間・全{products.length}件を対象に検索しています。年・月未記録の商品も含みます。</p>}
      </div>
    </section>

    <div className="flex flex-wrap items-end justify-between gap-3 mt-6 mb-1 no-print">
      <div><h2 className="text-lg font-bold text-[#1F4E78]" aria-live="polite">検索結果 {hits.length}件 <span className="text-xs font-normal text-slate-500">/ 全{products.length}件</span></h2>{state.q && state.sort === "auto" && <p className="text-xs text-slate-500 mt-1">商品名・ID・素材との一致を優先しています。</p>}</div>
      <div className="flex flex-wrap gap-2 items-center">
        <select aria-label="並び順" className="field" value={state.sort} onChange={e => update({sort:e.target.value})}><option value="auto">{state.q ? "検索との関連度順" : "おすすめ（会議優先度）"}</option><option value="priority">会議優先度順</option><option value="checked">情報確認が新しい順</option><option value="added">DB登録が新しい順</option><option value="month">対象月順</option><option value="brand">ブランド順</option></select>
        <select aria-label="表示件数" className="field" value={state.size} onChange={e => update({size:e.target.value})}><option value="24">24件ずつ</option><option value="48">48件ずつ</option><option value="all">全件表示</option></select>
        <button className="search-chip" aria-pressed={state.view === "cards"} onClick={() => update({view:"cards",page:pagination.page})}>画像カード</button><button className="search-chip" aria-pressed={state.view === "list"} onClick={() => update({view:"list",page:pagination.page})}>一覧で比較</button>
      </div>
    </div>
    {!!hits.length && controls("上")}
    <div className="print-only mb-4"><h1>ALC 商品検索結果 / {hits.length}件</h1><p>{active.map(chip=>chip.label).join(" ／ ") || "全期間・全商品"}</p></div>
    <div className={state.view === "list" ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print-grid"}>
      {shown.map(({ product:p, fields }) => <article key={p.商品ID} className={"surface overflow-hidden " + (state.view === "list" ? "p-4 md:flex md:gap-5" : "flex flex-col")}>
        {state.view === "cards" && <Link href={"/product/?id=" + encodeURIComponent(p.商品ID) + "&back=" + encodeURIComponent(url)}><ProductImage product={p} /></Link>}
        <div className={state.view === "list" ? "flex-1 min-w-0" : "p-4 flex-1"}>
          <p className="text-xs text-slate-500 mb-1">{p.ブランド名} / {p.商品ID}</p>
          <h3 className="font-bold text-[#1F4E78] leading-relaxed"><Link href={"/product/?id=" + encodeURIComponent(p.商品ID) + "&back=" + encodeURIComponent(url)} className="hover:underline">{p.商品名}</Link></h3>
          <div className="flex flex-wrap gap-2 mt-2 text-xs"><span className={"rounded border px-2 py-0.5 " + (PRIORITY_COLORS[p.商品会議優先度] || "bg-slate-50")}>優先度 {p.商品会議優先度 || "未評価"}</span><span className="py-0.5 text-slate-500">元DB：{p.対象年 || "年未記録"} / {p.対象月 ? p.対象月 + "月" : "月未設定"}</span></div>
          <p className="text-xs text-slate-600 mt-2">{[p.主素材, p.副素材].filter(Boolean).join(" / ")}{p.商品カテゴリ && " ｜ " + p.商品カテゴリ}</p>
          {state.q && !!fields.length && <p className="text-[11px] text-[#1F4E78] mt-2">一致：{fields.join("・")}</p>}
          {checkedDate(p) && <p className="text-xs bg-blue-50 text-[#1F4E78] rounded p-2 mt-3">公式情報確認 {p.informationCheckedAt}{p.latestUpdateSummary && " ／ " + p.latestUpdateSummary}</p>}
          <p className="text-sm text-slate-600 mt-3 line-clamp-2 print-expand">{p.ALC試作案 || p.応用案 || p.真似すべき点 || p.latestDescription || "素材・出典・開発情報は詳細へ"}</p>
          <p className="text-xs text-slate-500 mt-2">{p.latestPrice && checkedDate(p) ? "最新掲載価格：" + p.latestPrice : [hasRecord(p.ピース価格) && "ピース " + p.ピース価格, hasRecord(p.ホール価格) && "ホール " + p.ホール価格, hasRecord(p.セット価格) && "セット " + p.セット価格].filter(Boolean).join(" / ") || "価格未記録"}{!checkedDate(p) && "（調査当時の記録）"}</p>
          {state.view === "list" && <p className="text-[11px] text-slate-500 mt-2">{imageForProduct(p) ? p.imageDisplayStatus === "generated" ? "生成イメージあり・実物写真ではありません" : "掲載写真あり・年と仕様は詳細へ" : "画像なし・取得状況は詳細へ"} ／ 実装 {p.ALC実装難易度 || "未評価"}</p>}
        </div>
        <div className={state.view === "list" ? "md:w-48 shrink-0 flex flex-col justify-center gap-2 mt-3 md:mt-0" : "px-4 pb-4 flex flex-col gap-2"}><CandidateButton id={p.商品ID} /><Link className="text-xs text-center text-[#1F4E78] underline py-1" href={"/product/?id=" + encodeURIComponent(p.商品ID) + "&back=" + encodeURIComponent(url)}>詳細・価格の出典を見る →</Link></div>
      </article>)}
    </div>
    {!hits.length && <section className="surface p-6 md:p-10 mt-4 text-center" role="status"><h2 className="font-bold text-slate-700">条件に合う商品が見つかりませんでした</h2><p className="text-sm text-slate-500 mt-2">検索語を残したまま条件を緩めて探せます。</p><div className="flex flex-wrap justify-center gap-3 mt-5">
      {!!state.months.length && noMonthCount > 0 && <button className="action" onClick={() => update({months:[]})}>全月に広げる（{noMonthCount}件）</button>}
      {!!state.q && wordOnly.length > 0 && <button className="action" onClick={() => setState({...defaultSearch(),q:state.q,mode:state.mode,view:state.view})}>この検索語で全DBを探す（{wordOnly.length}件）</button>}
      {anyWordsCount > 0 && <button className="action" onClick={() => update({mode:"any"})}>いずれかの語で探す（{anyWordsCount}件）</button>}
      <button className="action" onClick={clear}>全条件をクリア</button></div><p className="text-xs text-slate-500 mt-4">品種・形態がわかる短い語もお試しください。例：恵水 → 和梨、ナガノパープル → ぶどう</p></section>}
    {!!hits.length && controls("下")}
    <div className="flex flex-wrap gap-4 items-center text-xs mt-5 no-print">
      <button className="underline text-[#1F4E78]" onClick={async () => { try { await navigator.clipboard.writeText(window.location.origin + url); setShareMessage("検索条件のリンクをコピーしました"); } catch { setShareMessage("コピーできませんでした。アドレス欄のURLをコピーしてください。"); } }}>検索条件のリンクをコピー</button>
      <button className="underline text-[#1F4E78]" disabled={!hits.length} onClick={() => setPrinting(true)}>検索結果{hits.length}件を印刷</button>
      <Link href="/images/" className="underline text-[#1F4E78]">画像の出典・取得できない理由</Link>
      <span role="status" className="text-slate-600">{shareMessage}</span>
    </div>
    <details className="surface p-4 mt-5 no-print"><summary className="cursor-pointer text-sm text-[#1F4E78]">DBにない情報を外部で調べる</summary><p className="text-xs text-slate-500 mt-3">外部サイトの検索を開きます。検索しただけではDBには登録されません。</p><div className="flex flex-wrap gap-2 mt-3"><input className="field flex-1 min-w-48" aria-label="外部検索キーワード" value={externalQuery || state.q} onChange={e => setExternalQuery(e.target.value)} placeholder="商品名・ブランドなど" />{[["Google","https://www.google.com/search?q="],["X","https://x.com/search?q="],["Instagram","https://www.instagram.com/explore/search/keyword/?q="]].map(([name,base]) => <a className="action" key={name} href={base + encodeURIComponent(externalQuery || state.q || "季節 スイーツ")} target="_blank" rel="noopener noreferrer">{name}</a>)}</div></details>
    {ids.length > 0 && <div className="fixed bottom-0 inset-x-0 bg-white/95 border-t border-slate-200 p-3 z-20 no-print"><div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center justify-between px-4"><span className="text-sm text-[#1F4E78]">比較候補 {ids.length}/4件{ids.length === 4 ? "：入れ替える場合は1件外してください" : "：検索を続けて追加できます"}</span><Link className="action action-primary" href={"/planning/?back=" + encodeURIComponent(url)}>候補を比較する →</Link></div></div>}
  </div>;
}
