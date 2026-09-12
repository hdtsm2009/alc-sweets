"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useProducts, hasRecord, matchesQuery } from "@/lib/data";
import { latestProducts, newsProducts } from "@/lib/news";
import type { Product } from "@/types/product";
import ProductImage from "@/components/ProductImage";
import CandidateButton from "@/components/CandidateButton";

export default function NewsPage() {
  const { products, loading, error, retry } = useProducts();
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [view, setView] = useState<"latest" | "added">("latest");
  const additions = useMemo(() => newsProducts(products), [products]);
  const latest = useMemo(() => latestProducts(products), [products]);
  const entries = view === "latest" ? latest : additions;
  const dateOf = (p: Product) => (view === "latest" ? p.informationCheckedAt : p.dbFirstSeen)!;
  const filtered = entries.filter(p => (!brand || p.ブランド名 === brand) && matchesQuery(p, query));
  const dates = Array.from(new Set(filtered.map(dateOf)));
  const brands = Array.from(new Set(entries.map(p => p.ブランド名))).sort();
  if (error) return <div role="alert" className="text-center py-20"><p>{error}</p><button onClick={retry} className="action mt-3">再試行</button></div>;
  if (loading) return <p className="text-center py-20 text-gray-500">新着情報を読み込み中...</p>;
  return <div>
    <div className="mb-7 border-b border-slate-200 pb-6">
      <p className="eyebrow">ALC / DB NEWS</p>
      <h1 className="text-3xl font-bold text-[#1F4E78] mb-3">最新の商品情報</h1>
      <p className="text-slate-600 leading-relaxed">公式の季節メニュー・新商品を確認し、素材や価格、発売予定とともに紹介します。</p>
      <p className="text-xs text-slate-500 mt-3">情報確認日・発表日・DBへの初回収録日は別々に記録しています。商品ごとの販売期間と取扱店は出典をご確認ください。</p>
      <div className="flex flex-wrap gap-5 mt-5 text-sm text-[#1F4E78]">
        <span>最新の情報確認 <strong>{latest[0]?.informationCheckedAt || "未記録"}</strong></span>
        <span>公式情報を確認 <strong>{latest.length} 商品</strong></span>
        <Link href="/?months=" className="underline">初期収録分を含む全商品を見る →</Link>
      </div>
    </div>
    <div className="flex flex-wrap gap-2 mb-5"><button className={`action ${view === "latest" ? "action-primary" : ""}`} onClick={() => {setView("latest");setBrand("");}} aria-pressed={view === "latest"}>最新の確認情報（{latest.length}）</button><button className={`action ${view === "added" ? "action-primary" : ""}`} onClick={() => {setView("added");setBrand("");}} aria-pressed={view === "added"}>DBへの追加履歴（{additions.length}）</button><Link href="/images/" className="action">画像の取得状況</Link></div>
    <div className="flex flex-wrap gap-3 mb-7">
      <input aria-label="新着商品を検索" placeholder="商品名・素材・開発ヒントで検索" className="field flex-1 min-w-48" value={query} onChange={e => setQuery(e.target.value)} />
      <select aria-label="新着商品のブランド" className="field max-w-full" value={brand} onChange={e => setBrand(e.target.value)}>
        <option value="">すべてのブランド</option>{brands.map(b => <option key={b}>{b}</option>)}
      </select>
      <span className="self-center text-sm text-slate-500">{filtered.length} 件</span>
    </div>
    {dates.map(date => <section key={date} className="mb-10">
      <div className="flex flex-wrap items-baseline gap-3 mb-4"><h2 className="section-title !mb-0"><time dateTime={date}>{date.replaceAll("-", ".")}</time></h2><span className="text-sm text-slate-500">{filtered.filter(p => dateOf(p) === date).length}商品の{view === "latest" ? "公式掲載を確認" : "DB初回収録"}{query || brand ? "（絞り込み後）" : ""}</span></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.filter(p => dateOf(p) === date).map(p => <article className="surface overflow-hidden flex flex-col" key={p.商品ID}>
          <Link href={`/product/?id=${encodeURIComponent(p.商品ID)}&back=${encodeURIComponent("/news/")}`}><ProductImage product={p} /></Link>
          <div className="p-5 flex flex-col flex-1">
            <p className="text-xs text-slate-500 mb-2">{p.ブランド名} / {p.商品カテゴリ || "カテゴリ未記録"}</p>
            <h3 className="text-lg font-bold text-[#1F4E78] leading-relaxed"><Link href={`/product/?id=${encodeURIComponent(p.商品ID)}&back=${encodeURIComponent("/news/")}`}>{p.商品名}</Link></h3>
            <p className="text-xs text-slate-500 mt-2">元DBの対象：{p.対象年 || "年未記録"} / {p.対象月 ? `${p.対象月}月` : "月未設定"}{view === "latest" && " ／ 最新情報は2026年秋"}</p>
            {view === "latest" && p.imageDisplayStatus === "matched" && p.dbFirstSeen !== p.informationCheckedAt && <div className="text-[11px] text-slate-500 mt-2 leading-relaxed"><p>写真は過去掲載分を含み、撮影年・仕様が最新情報と異なる場合があります。</p><p className="mt-1">{p.imageMatchNote}</p></div>}
            <p className="text-sm text-slate-600 mt-4 leading-relaxed">{p.latestDescription || (hasRecord(p.真似すべき点) ? p.真似すべき点 : hasRecord(p.主素材) ? `素材の記録：${p.主素材}` : "商品情報と掲載元を詳細ページで確認できます。")}</p>
            {p.informationCheckedAt && <div className="mt-3 text-xs text-slate-600 leading-relaxed"><p>{p.latestAvailability}</p>{p.latestSourceDate && <p>公式発表日：{p.latestSourceDate}</p>}{p.latestPrice && <p className="mt-2">掲載価格：{p.latestPrice}</p>}</div>}
            {hasRecord(p.応用案) && <div className="bg-slate-50 rounded-lg p-3 mt-4"><p className="text-[11px] text-slate-500 mb-1">DBに記録された開発ヒント</p><p className="text-sm text-slate-700">{p.応用案}</p></div>}
            <div className="mt-auto pt-5 flex flex-wrap gap-2"><CandidateButton id={p.商品ID} /><Link className="action" href={`/product/?id=${encodeURIComponent(p.商品ID)}&back=${encodeURIComponent("/news/")}`}>詳細・出典 →</Link></div>
          </div>
        </article>)}
      </div>
    </section>)}
    {!filtered.length && <div className="surface p-10 text-center text-slate-500">条件に合う商品情報はありません。</div>}
    <p className="text-xs text-slate-500 mt-6">{view === "added" ? "追加履歴は初回収録日で表示し、画像更新や情報修正で日付を変更しません。初期収録分は追加履歴に含みません。" : "今回の確認範囲はア・ラ・カンパーニュとキル フェ ボンの2026年秋の公式掲載商品です。全DBの販売状況を確認したものではありません。"} 店舗ごとの取扱い・在庫は掲載元でご確認ください。</p>
  </div>;
}
