"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useProducts, matchesQuery } from "@/lib/data";
import { safeHttpUrl } from "@/lib/planning";

export default function ImagesPage() {
  const { products, loading, error, retry } = useProducts();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("pending");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") || "");
      const value = params.get("status") || "pending";
      setStatus(["all", "photo", "generated", "pending"].includes(value) ? value : "pending"); setReady(true);
    };
    restore(); window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  const imagesUrl = "/images/?" + new URLSearchParams({ q: query, status }).toString();
  useEffect(() => { if (ready) window.history.replaceState(window.history.state, "", imagesUrl); }, [ready, imagesUrl]);
  const photos = products.filter(p => p.imageDisplayStatus === "matched");
  const generated = products.filter(p => p.imageDisplayStatus === "generated");
  const pending = products.length - photos.length - generated.length;
  const filtered = products.filter(p => matchesQuery(p, query) && (status === "all" || (status === "photo" ? p.imageDisplayStatus === "matched" : status === "generated" ? p.imageDisplayStatus === "generated" : !["matched", "generated"].includes(p.imageDisplayStatus || ""))));
  if (error) return <div role="alert"><p>{error}</p><button className="action" onClick={retry}>再試行</button></div>;
  if (loading || !ready) return <p className="py-20 text-center">画像の取得状況を読み込み中...</p>;
  return <div>
    <p className="eyebrow">ALC / IMAGE SOURCES</p><h1 className="text-3xl font-bold text-[#1F4E78] mb-4">画像の取得状況</h1>
    <p className="text-sm text-slate-600 leading-relaxed mb-5">公式サイト・企業発表・掲載記事・公開SNSを調べ、商品との対応を確認した写真を使っています。生成画像は実物写真と分け、使った説明と推定した点を表示します。</p>
    <div className="grid grid-cols-3 gap-3 mb-6">{[["掲載写真", photos.length],["生成イメージ", generated.length],["未取得・未特定", pending]].map(([label, count]) => <div className="surface p-4" key={label}><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-bold text-[#1F4E78] mt-2">{count}<span className="text-xs ml-1">件</span></p></div>)}</div>
    <div className="flex flex-wrap gap-3 mb-5"><input className="field flex-1 min-w-48" aria-label="画像調査の商品検索" placeholder="商品名・ブランド・素材で検索" value={query} onChange={e => setQuery(e.target.value)} /><select className="field" aria-label="画像の状態" value={status} onChange={e => setStatus(e.target.value)}><option value="pending">未取得・未特定</option><option value="photo">掲載写真あり</option><option value="generated">生成イメージあり</option><option value="all">すべて</option></select></div>
    <p className="text-sm text-slate-500 mb-3">{filtered.length}件</p>
    <div className="space-y-3">{filtered.map(p => <article className="surface p-4 md:p-5" key={p.商品ID}><div className="flex flex-wrap gap-2 items-center"><span className="text-xs text-slate-500">{p.商品ID} / {p.ブランド名}</span><span className={`rounded px-2 py-1 text-xs ${p.imageKind === "generated" ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-600"}`}>{p.imageDisplayStatus === "matched" ? p.imageKind === "social" ? "SNS掲載写真" : "掲載写真" : p.imageDisplayStatus === "generated" ? "生成イメージ" : "未取得・対応未確認"}</span></div><h2 className="font-bold text-[#1F4E78] mt-2"><Link href={`/product/?id=${encodeURIComponent(p.商品ID)}&back=${encodeURIComponent(imagesUrl)}`}>{p.商品名}</Link></h2><p className="text-sm text-slate-600 leading-relaxed mt-2">{p.imageGenerationBasis || p.imageFailureReason || p.imageMatchNote || "掲載元の代表画像と商品の対応を特定できていません。"}</p><div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-3 text-slate-500"><span>調査日：{p.imageSearchDate || p.imageCheckedAt || "未記録"}</span>{safeHttpUrl(p.imageSourceUrl || p.URL) && <a href={safeHttpUrl(p.imageSourceUrl || p.URL)} target="_blank" rel="noopener noreferrer" className="underline">掲載元</a>}<Link className="underline" href={`/product/?id=${encodeURIComponent(p.商品ID)}&back=${encodeURIComponent(imagesUrl)}`}>画像・詳細を見る →</Link></div></article>)}</div>
    {!filtered.length && <p className="surface p-10 text-center text-slate-500">条件に合う商品はありません。</p>}
  </div>;
}
