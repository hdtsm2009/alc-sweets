"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/types/product";
import { PRIORITY_COLORS, DIFFICULTY_COLORS, ALC_BRAND } from "@/lib/data";
import Link from "next/link";

const MONTH_NAMES = ["","1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
const PRIORITY_ORDER: Record<string, number> = { S: 0, "A+": 1, A: 2, B: 3, C: 4 };

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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/products.json")
      .then(r => r.json())
      .then((d: Product[]) => {
        // 優先度→月順でソート（検索ページと同じ順序）
        const sorted = [...d].sort((a, b) => {
          const pa = PRIORITY_ORDER[a.商品会議優先度] ?? 5;
          const pb = PRIORITY_ORDER[b.商品会議優先度] ?? 5;
          if (pa !== pb) return pa - pb;
          return (Number(a.対象月) || 13) - (Number(b.対象月) || 13);
        });
        setAllProducts(sorted);
        const found = d.find(p => p.商品ID === id) || null;
        setProduct(found);
        setLoading(false);
      });
  }, [id]);

  const currentIndex = allProducts.findIndex(p => p.商品ID === id);
  const prevProduct = currentIndex > 0 ? allProducts[currentIndex - 1] : null;
  const nextProduct = currentIndex < allProducts.length - 1 ? allProducts[currentIndex + 1] : null;

  if (loading) return <div className="text-center py-20 text-gray-400">読み込み中...</div>;
  if (!product) return (
    <div className="text-center py-20">
      <div className="text-gray-400 mb-4">商品が見つかりませんでした</div>
      <Link href="/" className="text-[#1F4E78] underline">← 検索に戻る</Link>
    </div>
  );

  return (
    <div>
      {/* ナビゲーション */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/" className="text-sm text-[#1F4E78] hover:opacity-70">← 検索に戻る</Link>
        <div className="flex gap-2">
          {prevProduct ? (
            <Link
              href={`/product/?id=${prevProduct.商品ID}`}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 flex items-center gap-1"
            >
              ◀ 前の商品
              <span className="text-gray-400 hidden sm:inline">（{prevProduct.ブランド名}）</span>
            </Link>
          ) : (
            <span className="text-xs border border-gray-100 rounded-lg px-3 py-1.5 text-gray-300">◀ 前の商品</span>
          )}
          <span className="text-xs text-gray-400 flex items-center px-1">
            {currentIndex + 1} / {allProducts.length}
          </span>
          {nextProduct ? (
            <Link
              href={`/product/?id=${nextProduct.商品ID}`}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 flex items-center gap-1"
            >
              <span className="text-gray-400 hidden sm:inline">（{nextProduct.ブランド名}）</span>
              次の商品 ▶
            </Link>
          ) : (
            <span className="text-xs border border-gray-100 rounded-lg px-3 py-1.5 text-gray-300">次の商品 ▶</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
        {product.imageUrl && (
          <div className="w-full h-64 bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.商品名}
              className="w-full h-full object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = "none"; }}
            />
          </div>
        )}
        <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-400 mb-1 flex items-center gap-2">
              {product.ブランド名.includes(ALC_BRAND) && (
                <span className="bg-teal-100 text-teal-700 border border-teal-300 px-2 py-0 rounded text-xs font-bold">自社</span>
              )}
              {product.ブランド名} · {product.会社名}
            </div>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* SNS・外部検索 */}
        <section className="bg-white rounded-xl shadow-sm p-5 no-print">
          <h2 className="text-base font-bold text-[#1F4E78] mb-3 border-b border-[#1F4E78]/20 pb-2">SNS・外部で調べる</h2>
          <div className="flex flex-wrap gap-2">
            {[
              {
                label: "X(Twitter)で評判を確認",
                href: `https://x.com/search?q=${encodeURIComponent(`${product.商品名} ${product.ブランド名}`)}&src=typed_query`,
                cls: "bg-black text-white hover:bg-gray-800",
              },
              {
                label: "Googleで検索",
                href: `https://www.google.com/search?q=${encodeURIComponent(`${product.商品名} ${product.ブランド名} 評判`)}`,
                cls: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
              },
              {
                label: "Instagramで検索",
                href: `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(product.商品名)}`,
                cls: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90",
              },
            ].map(({ label, href, cls }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className={`text-xs px-4 py-2 rounded-lg font-medium transition-opacity ${cls}`}>
                {label}
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">「{product.商品名}」「{product.ブランド名}」で検索します</p>
        </section>
      </div>

      {/* 下部ナビゲーション */}
      <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
        {prevProduct ? (
          <Link href={`/product/?id=${prevProduct.商品ID}`}
            className="text-sm border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50">
            ◀ {prevProduct.商品名}
          </Link>
        ) : <span />}
        {nextProduct ? (
          <Link href={`/product/?id=${nextProduct.商品ID}`}
            className="text-sm border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50">
            {nextProduct.商品名} ▶
          </Link>
        ) : <span />}
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
