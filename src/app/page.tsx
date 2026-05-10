"use client";
import { useEffect, useState, useMemo } from "react";
import type { Product } from "@/types/product";
import { PRIORITY_COLORS, DIFFICULTY_COLORS } from "@/lib/data";
import Link from "next/link";

const PRIORITY_ORDER: Record<string, number> = { S: 0, "A+": 1, A: 2, B: 3, C: 4 };

function sortProducts(ps: Product[]): Product[] {
  return [...ps].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.商品会議優先度] ?? 5;
    const pb = PRIORITY_ORDER[b.商品会議優先度] ?? 5;
    if (pa !== pb) return pa - pb;
    return (Number(a.対象月) || 13) - (Number(b.対象月) || 13);
  });
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [currentMonth, setCurrentMonth] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  useEffect(() => {
    const m = String(new Date().getMonth() + 1);
    setCurrentMonth(m);
    setFilterMonth(m);
  }, []);
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
    const result = products.filter(p => {
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
    return sortProducts(result);
  }, [products, query, filterMonth, filterBrand, filterPriority, filterDifficulty, filterIngredient]);

  if (loading) return <div className="text-center py-20 text-gray-400">読み込み中...</div>;

  const hasFilter = !!(query || filterBrand || filterPriority || filterDifficulty || filterIngredient || filterMonth !== currentMonth);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1F4E78] mb-1">商品検索</h1>
        <p className="text-sm text-gray-500">
          全 {products.length} 件 → フィルター後 <span className="font-bold text-[#1F4E78]">{filtered.length} 件</span>
          {hasFilter && (
            <button
              onClick={() => { setQuery(""); setFilterMonth(currentMonth); setFilterBrand(""); setFilterPriority(""); setFilterDifficulty(""); setFilterIngredient(""); }}
              className="ml-3 text-xs text-red-500 underline hover:opacity-70"
            >
              フィルターをリセット
            </button>
          )}
        </p>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
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
              <option key={m} value={String(m)}>{m}月{m === Number(currentMonth) ? " (今月)" : ""}</option>
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
        </div>
        <div className="border-t border-gray-100 pt-3">
          <input
            className="w-full md:w-64 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E78]"
            placeholder="🌿 素材で絞り込み（例：桃、いちご）..."
            value={filterIngredient}
            onChange={e => setFilterIngredient(e.target.value)}
          />
        </div>
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
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <div>条件に合う商品が見つかりませんでした</div>
          <button
            onClick={() => { setQuery(""); setFilterMonth(""); setFilterBrand(""); setFilterPriority(""); setFilterDifficulty(""); setFilterIngredient(""); }}
            className="mt-3 text-sm text-[#1F4E78] underline"
          >
            フィルターをリセット
          </button>
        </div>
      )}
    </div>
  );
}
