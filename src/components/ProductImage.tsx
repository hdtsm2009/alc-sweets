"use client";
import { useState } from "react";
import type { Product } from "@/types/product";
import { imageForProduct, imagePlaceholder } from "@/lib/news";

export default function ProductImage({ product, large = false }: { product: Product; large?: boolean }) {
  const url = imageForProduct(product);
  const isGenerated = product.imageDisplayStatus === "generated";
  const [failedUrl, setFailedUrl] = useState("");
  const [originalFor, setOriginalFor] = useState("");
  const optimized = url?.startsWith("/images/") ? `/.netlify/images?url=${encodeURIComponent(url)}&w=${large ? 1200 : 640}&fm=webp&q=82` : url;
  const displayed = originalFor === url ? url : optimized;
  return <div className={`${large ? "h-64" : "h-44"} w-full bg-[#eef3f7] relative flex items-center justify-center overflow-hidden`}>
    {url && failedUrl !== url ? <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={displayed} alt={isGenerated ? `${product.商品名}：説明から生成した参考イメージ（実物写真ではありません）` : product.商品名} loading="lazy" decoding="async" referrerPolicy="no-referrer"
        className="w-full h-full object-contain" onError={() => displayed !== url ? setOriginalFor(url) : setFailedUrl(url)} />
      <span title={product.imageMatchNote} className={`absolute bottom-2 right-2 text-[11px] px-2 py-1 rounded ${isGenerated ? "bg-amber-100 text-amber-950 font-bold border border-amber-300" : "bg-white/95 text-slate-600"}`}>{isGenerated ? "生成イメージ・実物写真ではありません" : product.imageKind === "social" ? "公開投稿写真・掲載年は詳細へ" : "掲載写真・年と仕様は詳細へ"}</span>
    </> : <div className="text-center px-5 text-slate-500">
      <span aria-hidden="true" className="block text-3xl text-slate-300 mb-2">▧</span>
      <p className="text-xs">{url && failedUrl === url ? "画像を読み込めませんでした" : imagePlaceholder(product)}</p>
      <p className="text-[10px] mt-2 leading-relaxed line-clamp-3">{product.imageFailureReason || "商品情報・掲載元は詳細ページへ"}</p>
    </div>}
  </div>;
}
