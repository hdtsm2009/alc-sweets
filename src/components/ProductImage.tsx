"use client";
import { useState } from "react";
import type { Product } from "@/types/product";
import { imageForProduct, imagePlaceholder } from "@/lib/news";

export default function ProductImage({ product, large = false }: { product: Product; large?: boolean }) {
  const url = imageForProduct(product);
  const [failedUrl, setFailedUrl] = useState("");
  return <div className={`${large ? "h-64" : "h-44"} w-full bg-[#eef3f7] relative flex items-center justify-center overflow-hidden`}>
    {url && failedUrl !== url ? <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={product.商品名} loading="lazy" referrerPolicy="no-referrer"
        className="w-full h-full object-contain" onError={() => setFailedUrl(url)} />
      <span className="absolute bottom-2 right-2 bg-white/95 text-[10px] text-slate-600 px-2 py-1 rounded">掲載元で商品名との対応を確認</span>
    </> : <div className="text-center px-5 text-slate-500">
      <span aria-hidden="true" className="block text-3xl text-slate-300 mb-2">▧</span>
      <p className="text-xs">{url && failedUrl === url ? "画像を読み込めませんでした" : imagePlaceholder(product)}</p>
      <p className="text-[10px] mt-1">商品情報・掲載元は詳細ページへ</p>
    </div>}
  </div>;
}
