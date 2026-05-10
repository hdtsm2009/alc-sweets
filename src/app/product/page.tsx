"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/types/product";
import { PRIORITY_COLORS, DIFFICULTY_COLORS } from "@/lib/data";
import Link from "next/link";

const MONTH_NAMES = ["","1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null;
  return (
    <tr className="border-b border-gray-100">
      <td className="py-2 pr-4 text-xs text-gray-500 font-medium whitespace-nowrap w-40">{label}</td>
      <td className="py-2 text-sm text-gray-800">{String(value)}</td>
    </tr>
  );
}

function LinkRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <tr className="border-b border-gray-100">
      <td className="py-2 pr-4 text-xs text-gray-500 font-medium whitespace-nowrap w-40">{label}</td>
      <td className="py-2 text-sm">
        <a href={value} target="_blank" rel="noopener noreferrer"
          className="text-[#1F4E78] underline break-all hover:opacity-70">
          {value}
        </a>
      </td>
    </tr>
  );
}

function ProductDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/products.json")
      .then(r => r.json())
      .then((d: Product[]) => {
        const found = d.find(p => p.商品ID === id) || null;
        setProduct(found);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-400">読み込み中...</div>;
  if (!product) return (
    <div className="text-center py-20">
      <div className="text-gray-400 mb-4">商品が見つかりませんでした</div>
      <Link href="/" className="text-[#1F4E78] underline">← 検索に戻る</Link>
    </div>
  );

  return (
    <div>
      <div className="mb-4">
        <Link href="/" className="text-sm text-[#1F4E78] hover:opacity-70">← 検索に戻る</Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">{product.ブランド名} · {product.会社名}</div>
            <h1 className="text-2xl font-bold text-gray-900">{product.商品名}</h1>
          </div>
          <div className="flex flex-col gap-2 items-end shrink-0">
            <span className={`text-sm px-3 py-1 rounded-full border font-bold ${PRIORITY_COLORS[product.商品会議優先度] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
              優先度: {product.商品会議優先度}
            </span>
            <span className={`text-xs px-3 py-1 rounded ${DIFFICULTY_COLORS[product.ALC実装難易度] || "bg-gray-100 text-gray-500"}`}>
              実装難易度: {product.ALC実装難易度}
            </span>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap text-sm">
          {product.対象月 && (
            <span className="bg-[#1F4E78]/10 text-[#1F4E78] px-3 py-1 rounded-full font-medium">
              {MONTH_NAMES[Number(product.対象月)]}
            </span>
          )}
          {product.商品カテゴリ && (
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{product.商品カテゴリ}</span>
          )}
          {product.限定性 && (
            <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full">{product.限定性}</span>
          )}
          {product.実在確認レベル && (
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs">
              実在確認: {product.実在確認レベル}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 基本情報 */}
        <section className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-base font-bold text-[#1F4E78] mb-3 border-b border-[#1F4E78]/20 pb-2">基本情報</h2>
          <table className="w-full">
            <tbody>
              <Row label="商品ID" value={product.商品ID} />
              <Row label="ブランド名" value={product.ブランド名} />
              <Row label="会社名" value={product.会社名} />
              <Row label="対象月" value={product.対象月 ? MONTH_NAMES[Number(product.対象月)] : null} />
              <Row label="商品カテゴリ" value={product.商品カテゴリ} />
              <Row label="主素材" value={product.主素材} />
              <Row label="副素材" value={product.副素材} />
              <Row label="季節テーマ" value={product.季節テーマ} />
              <Row label="イベントテーマ" value={product.イベントテーマ} />
              <Row label="旬区分" value={product.旬区分} />
              <Row label="産地・品種" value={product.産地品種} />
              <Row label="色・見た目" value={product.色見た目} />
              <Row label="サイズ" value={product.サイズ} />
            </tbody>
          </table>
        </section>

        {/* 価格・販売情報 */}
        <section className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-base font-bold text-[#1F4E78] mb-3 border-b border-[#1F4E78]/20 pb-2">価格・販売情報</h2>
          <table className="w-full">
            <tbody>
              <Row label="ピース価格" value={product.ピース価格} />
              <Row label="ホール価格" value={product.ホール価格} />
              <Row label="セット価格" value={product.セット価格} />
              <Row label="販売形式" value={product.販売形式} />
              <Row label="限定性" value={product.限定性} />
              <Row label="想定用途" value={product.想定用途} />
              <Row label="ターゲット" value={product.ターゲット} />
              <Row label="SNS話題度" value={product.SNS話題度} />
              <Row label="ニュース掲載" value={product.ニュース掲載} />
              <Row label="情報源" value={product.情報源} />
              <LinkRow label="URL" value={product.URL} />
              <LinkRow label="一次情報URL" value={product.一次情報URL} />
            </tbody>
          </table>
        </section>

        {/* ALC向け分析 */}
        <section className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-base font-bold text-[#1F4E78] mb-3 border-b border-[#1F4E78]/20 pb-2">ALC向け分析</h2>
          <table className="w-full">
            <tbody>
              <Row label="商品会議優先度" value={product.商品会議優先度} />
              <Row label="ALC実装難易度" value={product.ALC実装難易度} />
              <Row label="ALCブランド適合度" value={product.ALCブランド適合度} />
              <Row label="実在確認レベル" value={product.実在確認レベル} />
              <Row label="参考度" value={product.参考度} />
            </tbody>
          </table>
          {product.真似すべき点 && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">真似すべき点</div>
              <p className="text-sm text-gray-800 bg-orange-50 rounded-lg p-3">{product.真似すべき点}</p>
            </div>
          )}
          {product.応用案 && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">応用案</div>
              <p className="text-sm text-gray-800 bg-blue-50 rounded-lg p-3">{product.応用案}</p>
            </div>
          )}
        </section>

        {/* 企画メモ */}
        {(product.商品企画メモ || product.売場訴求メモ) && (
          <section className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-base font-bold text-[#1F4E78] mb-3 border-b border-[#1F4E78]/20 pb-2">企画・売場メモ</h2>
            {product.商品企画メモ && (
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">商品企画メモ</div>
                <p className="text-sm text-gray-800">{product.商品企画メモ}</p>
              </div>
            )}
            {product.売場訴求メモ && (
              <div>
                <div className="text-xs text-gray-500 mb-1">売場訴求メモ</div>
                <p className="text-sm text-gray-800">{product.売場訴求メモ}</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">読み込み中...</div>}>
      <ProductDetail />
    </Suspense>
  );
}
