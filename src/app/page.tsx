"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
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

const EMOJI_MAP: [string[], string][] = [
  [["桃", "もも", "ピーチ"], "🍑"],
  [["いちご", "苺", "ストロベリー"], "🍓"],
  [["マンゴ"], "🥭"],
  [["りんご", "アップル"], "🍎"],
  [["柑橘", "レモン", "みかん", "オレンジ", "ゆず"], "🍊"],
  [["栗", "マロン"], "🌰"],
  [["ぶどう", "葡萄", "グレープ"], "🍇"],
  [["メロン"], "🍈"],
  [["チョコ", "ショコラ"], "🍫"],
  [["抹茶", "緑茶"], "🍵"],
  [["洋梨", "ラ・フランス"], "🍐"],
  [["さくらんぼ", "チェリー"], "🍒"],
];

function productEmoji(p: Product): string {
  const text = `${p.主素材} ${p.副素材}`;
  for (const [words, emoji] of EMOJI_MAP) {
    if (words.some(w => text.includes(w))) return emoji;
  }
  if (p.商品カテゴリ?.includes("タルト")) return "🥧";
  if (p.商品カテゴリ?.includes("ケーキ")) return "🎂";
  return "🍰";
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [currentMonth, setCurrentMonth] = useState("");
  const [filterMonths, setFilterMonths] = useState<string[]>([]);
  const [filterBrand, setFilterBrand] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterIngredient, setFilterIngredient] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [showExtSearch, setShowExtSearch] = useState(false);
  const [extQuery, setExtQuery] = useState("");

  useEffect(() => {
    const m = String(new Date().getMonth() + 1);
    setCurrentMonth(m);
    setFilterMonths([m]);
    setExtQuery(`${m}月 スイーツ トレンド 2026`);
  }, []);

  useEffect(() => {
    fetch("/data/products.json")
      .then(r => r.json())
      .then((d: Product[]) => { setProducts(d); setLoading(false); });
  }, []);

  const brands = useMemo(() => {
    const s = new Set(products.map(p => p.ブランド名).filter(Boolean));
    return Array.from(s).sort();
  }, [products]);

  const toggleMonth = useCallback((m: string) => {
    setFilterMonths(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  }, []);

  const resetFilters = useCallback(() => {
    setQuery("");
    setFilterMonths(currentMonth ? [currentMonth] : []);
    setFilterBrand("");
    setFilterPriority("");
    setFilterDifficulty("");
    setFilterIngredient("");
  }, [currentMonth]);

  const filtered = useMemo(() => {
    const result = products.filter(p => {
      if (filterMonths.length > 0 && !filterMonths.includes(String(p.対象月))) return false;
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
  }, [products, query, filterMonths, filterBrand, filterPriority, filterDifficulty, filterIngredient]);

  const handlePrint = useCallback(() => {
    setIsPrinting(true);
    setTimeout(() => { window.print(); setIsPrinting(false); }, 150);
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">読み込み中...</div>;

  const hasFilter = !!(
    query || filterBrand || filterPriority || filterDifficulty || filterIngredient ||
    JSON.stringify([...filterMonths].sort()) !== JSON.stringify([currentMonth].sort())
  );

  const displayedProducts = isPrinting ? filtered : filtered.slice(0, 200);
  const nextMonthNum = currentMonth ? (Number(currentMonth) % 12) + 1 : 2;
  const nextMonth = String(nextMonthNum);

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-5 flex items-end justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-[#1F4E78] mb-1">商品検索</h1>
          <p className="text-sm text-gray-500">
            全 {products.length} 件 → フィルター後 <span className="font-bold text-[#1F4E78]">{filtered.length} 件</span>
            {hasFilter && (
              <button onClick={resetFilters} className="ml-3 text-xs text-red-500 underline hover:opacity-70">
                フィルターをリセット
              </button>
            )}
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 flex items-center gap-1.5 text-gray-600"
        >
          🖨️ 印刷
        </button>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 no-print">
        {/* テキスト・優先度・難易度・ブランド */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-3">
          <input
            className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E78]"
            placeholder="🔍 商品名・ブランド・素材で検索..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E78]"
            value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">全優先度</option>
            {["S","A+","A","B","C"].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E78]"
            value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}>
            <option value="">全難易度</option>
            <option value="低（即検討可）">低（即検討可）</option>
            <option value="中">中</option>
            <option value="高（実装困難）">高（実装困難）</option>
            <option value="要レビュー">要レビュー</option>
          </select>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E78]"
            value={filterBrand} onChange={e => setFilterBrand(e.target.value)}>
            <option value="">全ブランド</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {/* 月ピル（複数選択可） */}
        <div className="flex flex-wrap gap-1.5 items-center mb-3">
          <span className="text-xs text-gray-400 shrink-0">月：</span>
          <button
            onClick={() => setFilterMonths([])}
            className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
              filterMonths.length === 0 ? "bg-[#1F4E78] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            全月
          </button>
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
            <button
              key={m}
              onClick={() => toggleMonth(String(m))}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
                filterMonths.includes(String(m))
                  ? "bg-[#1F4E78] text-white"
                  : m === Number(currentMonth)
                  ? "bg-[#1F4E78]/20 text-[#1F4E78] hover:bg-[#1F4E78]/30"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {m}月{m === Number(currentMonth) ? " ★" : ""}
            </button>
          ))}
        </div>

        {/* 素材 */}
        <div className="border-t border-gray-100 pt-3">
          <input
            className="w-full md:w-64 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E78]"
            placeholder="🌿 素材で絞り込み（例：桃、いちご）..."
            value={filterIngredient}
            onChange={e => setFilterIngredient(e.target.value)}
          />
        </div>
      </div>

      {/* 外部検索パネル */}
      <div className="mb-6 no-print">
        <button
          onClick={() => setShowExtSearch(v => !v)}
          className="text-xs text-[#1F4E78] underline hover:opacity-70"
        >
          🔎 DBにない情報を外部で調べる {showExtSearch ? "▲" : "▼"}
        </button>
        {showExtSearch && (
          <div className="mt-2 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-blue-600 mb-3">キーワードを入力して各サービスで検索できます。</p>
            {/* プリセット */}
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { label: `${currentMonth}月のスイーツ`, q: `${currentMonth}月 スイーツ トレンド 2026` },
                { label: `${nextMonth}月のスイーツ`, q: `${nextMonth}月 スイーツ 2026` },
                { label: "手土産スイーツ", q: "手土産 スイーツ 人気 2026" },
                { label: "季節限定スイーツ", q: "季節限定 スイーツ 話題 2026" },
                { label: "フルーツタルト", q: "フルーツタルト 新作 2026" },
              ].map(({ label, q }) => (
                <button key={label} onClick={() => setExtQuery(q)}
                  className="text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
                  {label}
                </button>
              ))}
            </div>
            {/* 検索 */}
            <div className="flex gap-2 flex-wrap items-center">
              <input
                className="flex-1 min-w-52 border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                value={extQuery}
                onChange={e => setExtQuery(e.target.value)}
                placeholder="検索キーワード..."
                onKeyDown={e => {
                  if (e.key === "Enter" && extQuery)
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(extQuery)}`, "_blank");
                }}
              />
              {[
                { label: "Google", href: `https://www.google.com/search?q=${encodeURIComponent(extQuery)}`, cls: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50" },
                { label: "X(Twitter)", href: `https://x.com/search?q=${encodeURIComponent(extQuery)}&src=typed_query`, cls: "bg-black text-white hover:bg-gray-800" },
                { label: "Instagram", href: `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(extQuery)}`, cls: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90" },
              ].map(({ label, href, cls }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className={`text-xs px-4 py-2 rounded-lg font-medium transition-opacity shrink-0 ${cls}`}>
                  {label}で検索
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 印刷ヘッダー（印刷時のみ表示） */}
      <div className="print-only mb-4">
        <h1 className="text-xl font-bold">ALC 季節商品DB — 検索結果</h1>
        <p className="text-sm text-gray-600">
          {filterMonths.length > 0 ? `${filterMonths.join("・")}月` : "全月"} ／{" "}
          {filterPriority || "全優先度"} ／ {filtered.length}件
        </p>
      </div>

      {/* 商品カード一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print-grid">
        {displayedProducts.map(p => (
          <Link
            key={p.商品ID}
            href={`/product/?id=${p.商品ID}`}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow block overflow-hidden"
          >
            {p.imageUrl ? (
              <div className="w-full h-40 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={p.商品名}
                  className="w-full h-full object-cover"
                  onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = "none"; }}
                />
              </div>
            ) : (
              <div className="w-full h-40 bg-gradient-to-br from-[#1F4E78]/10 to-[#1F4E78]/5 flex items-center justify-center text-4xl">
                {productEmoji(p)}
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">{p.ブランド名}</div>
                  <div className="font-bold text-gray-800 text-sm leading-tight">{p.商品名}</div>
                </div>
                <div className="flex flex-col gap-1 items-end shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${PRIORITY_COLORS[p.商品会議優先度] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                    {p.商品会議優先度}
                  </span>
                  {p.対象月 && <span className="text-xs text-[#1F4E78] font-medium">{p.対象月}月</span>}
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
                <p className="text-xs text-gray-600 mt-2 line-clamp-2 print-expand">{p.真似すべき点}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {!isPrinting && filtered.length > 200 && (
        <div className="text-center py-6 text-sm text-gray-400 no-print">
          表示件数上限200件。絞り込んで件数を減らしてください（全 {filtered.length} 件）
        </div>
      )}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <div>条件に合う商品が見つかりませんでした</div>
          <button onClick={resetFilters} className="mt-3 text-sm text-[#1F4E78] underline">
            フィルターをリセット
          </button>
        </div>
      )}
    </div>
  );
}
