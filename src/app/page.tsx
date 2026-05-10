"use client";
import { useEffect, useState, useMemo } from "react";
import type { Product } from "@/types/product";
import { PRIORITY_COLORS, DIFFICULTY_COLORS } from "@/lib/data";
import Link from "next/link";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterIngredient, setFilterIngredient] = useState("");

  useEffect(() => {
    fetch("/data/products.json")
      .then(r => r.json())
      .then((d: Product[]) => { setProducts(d); setLoading(false); });
  }, []);

  const brands = useMemo(() => {
    const s = new Set(products.map(p => p.ブランド名).filter(Boolean));
    return Array.from(s).sort();
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (filterMonth && String(p.対象月) !== filterMonth) return false;
      if (filterBrand && p.ブランド名 !== filterBrand) return false;
      if (filterPriority && p.商品会議優先度 !== filterPriority) return false;
      if (filterDifficulty && p.ALC実装難易度 !== filterDifficulty) return false;
      if (filterIngredient) {
        const ing = filterIngredient.toLowerCase();
        if (!((p.主素材 || "").toLowerCase().includes(ing) ||
              (p.副素材 || "").toLowerCase().includes(ing))) return false;
      }
      if (query) {
        const q = query.toLowerCase();
        if (!(`${p.ブランド名} ${p.商品名} ${p.主素材} ${p.商品カテゴリ} ${p.季節テーマ}`.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [products, query, filterMonth, filterBrand, filterPriority, filterDifficulty, filterIngredient]);

  if (loading) return <div className="text-center py-20 text-gray-400">読み込み中...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1F4E78] mb-1">商品検索</h1>
        <p className="text-sm text-gray-500">全 {products.length} 件 → フィルター後 {filtered.length} 件</p>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <input
          className="col-span-2 md:col-span-3 lg:col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E78]"
          placeholder="🔍 商品名・ブランド・素材で検索..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E78]"
          value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
        >
          <option value="">全月</option>
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
            <option key={m} value={m}>{m}月</option>
          ))}
        </select>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E78]"
          value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
        >
          <option value="">全優先度</option>
          {["S","A+","A","B","C"].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E78]"
          value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}
        >
          <option value="">全難易度</option>
          <option value="低（即検討可）">低（即検討可）</option>
          <option value="中">中</option>
          <option value="高（実装困難）">高（実装困難）</option>
          <option value="要レビュー">要レビュー</option>
        </select>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E78]"
          value={filterBrand} onChange={e => setFilterBrand(e.target.value)}
        >
          <option value="">全ブランド</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <input
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E78]"
          placeholder="素材で絞り込み..."
          value={filterIngredient}
          onChange={e => setFilterIngredient(e.target.value)}
        />
      </div>

      {/* 商品カード一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.slice(0, 200).map(p => (
          <Link
            key={p.商品ID}
            href={`/product/?id=${p.商品ID}`}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 block"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="text-xs text-gray-400 mb-0.5">{p.ブランド名}</div>
                <div className="font-bold text-gray-800 text-sm leading-tight">{p.商品名}</div>
              </div>
              <div className="flex flex-col gap-1 items-end shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${PRIORITY_COLORS[p.商品会議優先度] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                  {p.商品会議優先度}
                </span>
                {p.対象月 && (
                  <span className="text-xs text-[#1F4E78] font-medium">{p.対象月}月</span>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500 flex gap-2 flex-wrap">
              {p.主素材 && <span>🍓 {p.主素材}</span>}
              {p.商品カテゴリ && <span>📦 {p.商品カテゴリ}</span>}
            </div>
            {p.ALC実装難易度 && (
              <div className="mt-2">
                <span className={`text-xs px-2 py-0.5 rounded ${DIFFICULTY_COLORS[p.ALC実装難易度] || "bg-gray-100 text-gray-500"}`}>
                  実装: {p.ALC実装難易度}
                </span>
              </div>
            )}
            {p.真似すべき点 && (
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">{p.真似すべき点}</p>
            )}
          </Link>
        ))}
      </div>
      {filtered.length > 200 && (
        <div className="text-center py-6 text-sm text-gray-400">
          表示件数上限200件。絞り込んで件数を減らしてください（全 {filtered.length} 件）
        </div>
      )}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">条件に合う商品が見つかりませんでした</div>
      )}
    </div>
  );
}
