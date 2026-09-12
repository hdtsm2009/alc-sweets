"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useProducts, hasRecord, matchesQuery } from "@/lib/data";
import { newsProducts } from "@/lib/news";
import ProductImage from "@/components/ProductImage";
import CandidateButton from "@/components/CandidateButton";

export default function NewsPage() {
  const { products, loading, error, retry } = useProducts();
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const additions = useMemo(() => newsProducts(products), [products]);
  const filtered = additions.filter(p => (!brand || p.ブランド名 === brand) && matchesQuery(p, query));
  const dates = Array.from(new Set(filtered.map(p => p.dbFirstSeen!)));
  const brands = Array.from(new Set(additions.map(p => p.ブランド名))).sort();
  if (error) return <div role="alert" className="text-center py-20"><p>{error}</p><button onClick={retry} className="action mt-3">再試行</button></div>;
  if (loading) return <p className="text-center py-20 text-gray-500">新着情報を読み込み中...</p>;
  return <div>
    <div className="mb-7 border-b border-slate-200 pb-6">
      <p className="eyebrow">ALC / DB NEWS</p>
      <h1 className="text-3xl font-bold text-[#1F4E78] mb-3">DBに加わった商品</h1>
      <p className="text-slate-600 leading-relaxed">新しく収録した参考商品を、商品開発のヒントとともに紹介します。</p>
      <p className="text-xs text-slate-500 mt-3">日付はWeb DBへの初回収録日です。過去分は変更履歴から復元しています。商品の発売日・元Excelの登録日とは異なります。</p>
      <div className="flex flex-wrap gap-5 mt-5 text-sm text-[#1F4E78]">
        <span>追加履歴 <strong>{additions.length} 商品</strong></span>
        <span>最新の収録日 <strong>{additions[0]?.dbFirstSeen || "追加履歴なし"}</strong></span>
        <Link href="/?months=" className="underline">初期収録分を含む全商品を見る →</Link>
      </div>
    </div>
    <div className="flex flex-wrap gap-3 mb-7">
      <input aria-label="新着商品を検索" placeholder="商品名・素材・開発ヒントで検索" className="field flex-1 min-w-48" value={query} onChange={e => setQuery(e.target.value)} />
      <select aria-label="新着商品のブランド" className="field max-w-full" value={brand} onChange={e => setBrand(e.target.value)}>
        <option value="">すべてのブランド</option>{brands.map(b => <option key={b}>{b}</option>)}
      </select>
      <span className="self-center text-sm text-slate-500">{filtered.length} 件</span>
    </div>
    {dates.map(date => <section key={date} className="mb-10">
      <div className="flex flex-wrap items-baseline gap-3 mb-4"><h2 className="section-title !mb-0"><time dateTime={date}>{date.replaceAll("-", ".")}</time></h2><span className="text-sm text-slate-500">Web DBに{filtered.filter(p => p.dbFirstSeen === date).length}商品を収録{query || brand ? "（絞り込み後）" : ""}</span></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.filter(p => p.dbFirstSeen === date).map(p => <article className="surface overflow-hidden flex flex-col" key={p.商品ID}>
          <Link href={`/product/?id=${encodeURIComponent(p.商品ID)}&back=${encodeURIComponent("/news/")}`}><ProductImage product={p} /></Link>
          <div className="p-5 flex flex-col flex-1">
            <p className="text-xs text-slate-500 mb-2">{p.ブランド名} / {p.商品カテゴリ || "カテゴリ未記録"}</p>
            <h3 className="text-lg font-bold text-[#1F4E78] leading-relaxed"><Link href={`/product/?id=${encodeURIComponent(p.商品ID)}&back=${encodeURIComponent("/news/")}`}>{p.商品名}</Link></h3>
            <p className="text-xs text-slate-500 mt-2">対象：{p.対象年 || "年未記録"} / {p.対象月 ? `${p.対象月}月` : "月未設定"}</p>
            <p className="text-sm text-slate-600 mt-4 leading-relaxed">{hasRecord(p.真似すべき点) ? p.真似すべき点 : hasRecord(p.主素材) ? `素材の記録：${p.主素材}` : "商品情報と掲載元を詳細ページで確認できます。"}</p>
            {hasRecord(p.応用案) && <div className="bg-slate-50 rounded-lg p-3 mt-4"><p className="text-[11px] text-slate-500 mb-1">DBに記録された開発ヒント</p><p className="text-sm text-slate-700">{p.応用案}</p></div>}
            <div className="mt-auto pt-5 flex flex-wrap gap-2"><CandidateButton id={p.商品ID} /><Link className="action" href={`/product/?id=${encodeURIComponent(p.商品ID)}&back=${encodeURIComponent("/news/")}`}>詳細・出典 →</Link></div>
          </div>
        </article>)}
      </div>
    </section>)}
    {!filtered.length && <div className="surface p-10 text-center text-slate-500">{additions.length ? "条件に合う新着商品はありません。" : "新しい商品の収録をお待ちください。初期収録分は商品検索で閲覧できます。"}</div>}
    <p className="text-xs text-slate-500 mt-6">情報修正や画像更新だけでは新着扱いにしません。初期収録分はこの一覧に含みません。商品の現在の販売状況は掲載元でご確認ください。</p>
  </div>;
}
