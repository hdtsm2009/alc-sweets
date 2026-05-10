"use client";
import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import { DIFFICULTY_COLORS } from "@/lib/data";
import Link from "next/link";

const MONTH_NAMES = ["","1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

export default function PicksPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/products.json")
      .then(r => r.json())
      .then((d: Product[]) => { setProducts(d); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">読み込み中...</div>;

  const sCands = products.filter(p => p.商品会議優先度 === "S");
  const aplusCands = products.filter(p => p.商品会議優先度 === "A+");

  const sortByMonth = (ps: Product[]) =>
    [...ps].sort((a, b) => (Number(a.対象月) || 13) - (Number(b.対象月) || 13));

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1F4E78] mb-2">A+ 候補ピックアップ</h1>
      <p className="text-sm text-gray-500 mb-6">商品会議での即採用検討推奨商品。S候補 {sCands.length}件 / A+ {aplusCands.length}件</p>

      {/* S候補 */}
      {sCands.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
            <span className="bg-red-100 text-red-700 border border-red-300 px-3 py-0.5 rounded-full text-sm">S</span>
            戦略最優先候補
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortByMonth(sCands).map(p => (
              <Link
                key={p.商品ID}
                href={`/product/?id=${p.商品ID}`}
                className="bg-red-50 border border-red-200 rounded-xl hover:shadow-md transition-shadow p-4 block"
              >
                <div className="text-xs text-gray-500 mb-0.5">{p.ブランド名} · {MONTH_NAMES[Number(p.対象月)] || "-"}</div>
                <div className="font-bold text-gray-800 mb-2">{p.商品名}</div>
                <div className="text-xs text-gray-600 flex gap-3 flex-wrap">
                  {p.主素材 && <span>🍓 {p.主素材}</span>}
                  {p.商品カテゴリ && <span>📦 {p.商品カテゴリ}</span>}
                </div>
                {p.真似すべき点 && (
                  <p className="text-xs text-gray-600 mt-2 line-clamp-3">{p.真似すべき点}</p>
                )}
                <div className="mt-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${DIFFICULTY_COLORS[p.ALC実装難易度] || "bg-gray-100 text-gray-500"}`}>
                    実装: {p.ALC実装難易度}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* A+候補（月別グループ） */}
      <section>
        <h2 className="text-lg font-bold text-orange-700 mb-4 flex items-center gap-2">
          <span className="bg-orange-100 text-orange-700 border border-orange-300 px-3 py-0.5 rounded-full text-sm">A+</span>
          優先検討候補 ({aplusCands.length}件)
        </h2>
        {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => {
          const mp = sortByMonth(aplusCands).filter(p => Number(p.対象月) === m);
          if (mp.length === 0) return null;
          return (
            <div key={m} className="mb-6">
              <h3 className="text-sm font-bold text-[#1F4E78] mb-2 border-b border-[#1F4E78]/20 pb-1">
                {MONTH_NAMES[m]}（{mp.length}件）
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {mp.map(p => (
                  <Link
                    key={p.商品ID}
                    href={`/product/?id=${p.商品ID}`}
                    className="bg-white border border-orange-200 rounded-xl hover:shadow-md transition-shadow p-3 block"
                  >
                    <div className="text-xs text-gray-400 mb-0.5">{p.ブランド名}</div>
                    <div className="font-bold text-sm text-gray-800 mb-1">{p.商品名}</div>
                    <div className="text-xs text-gray-500 flex gap-2 flex-wrap">
                      {p.主素材 && <span>🍓 {p.主素材}</span>}
                      {p.商品カテゴリ && <span>{p.商品カテゴリ}</span>}
                    </div>
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${DIFFICULTY_COLORS[p.ALC実装難易度] || "bg-gray-100 text-gray-500"}`}>
                        実装: {p.ALC実装難易度}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
