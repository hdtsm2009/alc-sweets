"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import type { Product } from "@/types/product";
import { useProducts, matchesQuery, existenceLabel, salesLabel, hasRecord, PRIORITY_COLORS, DIFFICULTY_COLORS, ALC_BRAND } from "@/lib/data";
import Link from "next/link";
import CandidateButton from "@/components/CandidateButton";
import { useCandidates } from "@/lib/planning";

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
  const { products, loading, error, retry } = useProducts();
  const { ids } = useCandidates();

  const [query, setQuery] = useState("");
  const [currentMonth, setCurrentMonth] = useState("");
  const [filterMonths, setFilterMonths] = useState<string[]>([]);
  const [filterBrand, setFilterBrand] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterIngredient, setFilterIngredient] = useState("");
  const [filterBrandType, setFilterBrandType] = useState("");
  const [filterExistence, setFilterExistence] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDevelopment, setFilterDevelopment] = useState("");
  const [sort, setSort] = useState("priority");
  const [filtersReady, setFiltersReady] = useState(false);
  const [showExtSearch, setShowExtSearch] = useState(false);
  const [extQuery, setExtQuery] = useState("");

  useEffect(() => {
    const m = String(new Date().getMonth() + 1);
    const params = new URLSearchParams(window.location.search);
    setCurrentMonth(m);
    setFilterMonths(params.has("months") ? (params.get("months") || "").split(",").filter(v => /^(?:[1-9]|1[0-2]|unknown)$/.test(v)) : [m]);
    setQuery(params.get("q") || "");
    setFilterBrand(params.get("brand") || "");
    setFilterPriority(params.get("priority") || "");
    setFilterDifficulty(params.get("difficulty") || "");
    setFilterIngredient(params.get("ingredient") || "");
    setFilterBrandType(params.get("brandType") || "");
    setFilterExistence(params.get("existence") || "");
    setFilterCategory(params.get("category") || "");
    setFilterDevelopment(params.get("development") || "");
    setSort(params.get("sort") === "month" ? "month" : "priority");
    setFiltersReady(true);
    setExtQuery(`${m}月 スイーツ トレンド ${new Date().getFullYear()}`);
  }, []);

  const searchUrl = useMemo(() => {
    const params = new URLSearchParams({ months: filterMonths.join(",") });
    for (const [key, value] of Object.entries({ q: query, brand: filterBrand, priority: filterPriority,
      difficulty: filterDifficulty, ingredient: filterIngredient, brandType: filterBrandType,
      existence: filterExistence, category: filterCategory, development: filterDevelopment, sort })) if (value) params.set(key, value);
    return `/?${params.toString()}`;
  }, [query, filterMonths, filterBrand, filterPriority, filterDifficulty, filterIngredient, filterBrandType, filterExistence, filterCategory, filterDevelopment, sort]);
  useEffect(() => {
    if (filtersReady) window.history.replaceState(null, "", searchUrl);
  }, [searchUrl, filtersReady]);

  const brands = useMemo(() => {
    const s = new Set(products.map(p => p.ブランド名).filter(Boolean));
    return Array.from(s).sort();
  }, [products]);

  // 主素材の選択肢：DBの実データから生成（区切り文字で分割・重複排除）
  const ingredientOptions = useMemo(() => {
    const s = new Set<string>();
    products.forEach(p => {
      `${p.主素材 || ""} ${p.副素材 || ""}`.split(/[・、,／\s]+/).map(x => x.trim()).filter(x => x.length > 0).forEach(x => s.add(x));
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b, "ja"));
  }, [products]);

  const toggleMonth = useCallback((m: string) => {
    setFilterMonths(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  }, []);

  const resetFilters = useCallback(() => {
    setQuery("");
    setFilterMonths([]);
    setFilterBrand("");
    setFilterPriority("");
    setFilterDifficulty("");
    setFilterIngredient("");
    setFilterBrandType("");
    setFilterExistence("");
    setFilterCategory("");
    setFilterDevelopment("");
    setSort("priority");
  }, []);

  const filtered = useMemo(() => {
    const result = products.filter(p => {
      if (filterMonths.length > 0 && !filterMonths.includes(p.対象月 === null ? "unknown" : String(p.対象月))) return false;
      const isTart = `${p.商品カテゴリ} ${p.商品名}`.includes("タルト");
      if (filterCategory === "tart" && !isTart) return false;
      if (filterCategory === "other" && isTart) return false;
      if (filterDevelopment === "prototype" && !hasRecord(p.ALC試作案)) return false;
      if (filterDevelopment === "reuse" && !hasRecord(p.既存タルト台流用可否)) return false;
      if (filterDevelopment === "price" && !hasRecord(p.価格出典URL)) return false;
      if (filterBrand && p.ブランド名 !== filterBrand) return false;
      if (filterPriority && p.商品会議優先度 !== filterPriority) return false;
      if (filterDifficulty && p.ALC実装難易度 !== filterDifficulty) return false;
      if (filterIngredient) {
        const target = `${p.主素材} ${p.副素材}`;
        if (!target.includes(filterIngredient)) return false;
      }
      if (filterBrandType === "自社" && !p.ブランド名.includes(ALC_BRAND)) return false;
      if (filterBrandType === "競合" && p.ブランド名.includes(ALC_BRAND)) return false;
      if (!matchesQuery(p, query)) return false;
      if (filterExistence && existenceLabel(p) !== filterExistence) return false;
      return true;
    });
    return sort === "month" ? [...result].sort((a, b) => (a.対象月 || 13) - (b.対象月 || 13)) : sortProducts(result);
  }, [products, query, filterMonths, filterBrand, filterPriority, filterDifficulty, filterIngredient, filterBrandType, filterExistence, filterCategory, filterDevelopment, sort]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (error) return <div role="alert" className="text-center py-20"><p>{error}</p><button onClick={retry} className="mt-3 underline">再試行</button></div>;
  if (loading) return <div className="text-center py-20 text-gray-400">読み込み中...</div>;

  const hasFilter = !!(
    query || filterBrand || filterPriority || filterDifficulty || filterIngredient || filterBrandType || filterExistence || filterCategory || filterDevelopment ||
    filterMonths.length > 0
  );

  const displayedProducts = filtered;
  const nextMonthNum = currentMonth ? (Number(currentMonth) % 12) + 1 : 2;
  const nextMonth = String(nextMonthNum);

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-5 flex flex-wrap gap-4 items-end justify-between no-print">
        <div>
          <p className="eyebrow">ALC / タルトの商品開発</p>
          <h1 className="text-2xl font-bold text-[#1F4E78] mb-1">季節の素材から、次の試作を考える</h1>
          <p className="text-sm text-gray-500">
            全 {products.length} 件 → フィルター後 <span className="font-bold text-[#1F4E78]">{filtered.length} 件</span>
            {hasFilter && (
              <button onClick={resetFilters} className="ml-3 text-xs text-red-500 underline hover:opacity-70">
                全件表示（条件をクリア）
              </button>
            )}
          </p>
        </div>
        <div className="flex gap-2"><Link className="action action-primary" href="/planning/">候補比較・試作メモ {ids.length > 0 ? `(${ids.length}/4)` : ""}</Link><button
          onClick={handlePrint}
          className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 flex items-center gap-1.5 text-gray-600"
        >
          🖨️ 印刷
        </button></div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 no-print">
        {/* テキスト・優先度・難易度・ブランド・自社/競合 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
          <input
            className="col-span-2 md:col-span-3 lg:col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E78]"
            aria-label="商品名・素材・試作案を検索"
            placeholder="商品名・素材・試作案・ロス対策で検索"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E78]"
            aria-label="自社・競合" value={filterBrandType} onChange={e => setFilterBrandType(e.target.value)}>
            <option value="">自社＋競合</option>
            <option value="自社">🏠 自社のみ</option>
            <option value="競合">🔍 競合のみ</option>
          </select>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E78]"
            aria-label="商品会議優先度" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">全優先度</option>
            {["S","A+","A","B","C"].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E78]"
            aria-label="ALC実装難易度" value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}>
            <option value="">全難易度</option>
            <option value="低（即検討可）">低（即検討可）</option>
            <option value="中">中</option>
            <option value="高（実装困難）">高（実装困難）</option>
            <option value="要レビュー">要レビュー</option>
          </select>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E78]"
            aria-label="ブランド" value={filterBrand} onChange={e => setFilterBrand(e.target.value)}>
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
          <button className={`px-2.5 py-1 text-xs rounded-full ${filterMonths.includes("unknown") ? "bg-[#1F4E78] text-white" : "bg-gray-100"}`} onClick={() => toggleMonth("unknown")}>月未設定</button>
          <button className="text-sm text-[#1F4E78] underline ml-2" onClick={() => setFilterMonths([1, 2, 3].map(offset => String((Number(currentMonth) - 1 + offset) % 12 + 1)))}>翌月から3か月で考える</button>
        </div>

        {/* 素材（DBの実データから生成） */}
        <div className="border-t border-gray-100 pt-3 flex flex-wrap gap-3">
          <select
            className="w-full md:w-64 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E78]"
            aria-label="素材" value={filterIngredient}
            onChange={e => setFilterIngredient(e.target.value)}
          >
            <option value="">🌿 素材で絞り込み...</option>
            {ingredientOptions.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <select aria-label="参考範囲" className="field" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">タルト＋他の菓子</option><option value="tart">タルトを探す</option><option value="other">他の菓子から発想する</option>
          </select>
          <select aria-label="開発情報の記録" className="field" value={filterDevelopment} onChange={e => setFilterDevelopment(e.target.value)}>
            <option value="">開発情報の有無を問わない</option>
            <option value="prototype">具体的な試作案あり（全DB {products.filter(p => hasRecord(p.ALC試作案)).length}件）</option>
            <option value="reuse">既存タルト台の判断記録あり（全DB {products.filter(p => hasRecord(p.既存タルト台流用可否)).length}件）</option>
            <option value="price">価格の出典あり（全DB {products.filter(p => hasRecord(p.価格出典URL)).length}件）</option>
          </select>
          <select aria-label="並び順" className="field" value={sort} onChange={e => setSort(e.target.value)}><option value="priority">会議優先度順</option><option value="month">対象月順</option></select>
        </div>
      </div>

      <div className="mb-4"><label className="text-sm">実在確認レベル：<select aria-label="実在確認レベル" value={filterExistence} onChange={e => setFilterExistence(e.target.value)} className="border rounded px-3 py-2"><option value="">すべて</option>{Array.from(new Set(products.map(existenceLabel))).sort().map(v => <option key={v} value={v}>{v}</option>)}</select></label><p className="text-xs text-gray-500 mt-2">実在確認レベルは調査時点の記録です。現在の販売状況・価格・画像の確認とは別に扱います。</p></div>
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
                { label: `${currentMonth}月のスイーツ`, q: `${currentMonth}月 スイーツ トレンド ${new Date().getFullYear()}` },
                { label: `${nextMonth}月のスイーツ`, q: `${nextMonth}月 スイーツ ${new Date().getFullYear()}` },
                { label: "手土産スイーツ", q: `手土産 スイーツ 人気 ${new Date().getFullYear()}` },
                { label: "季節限定スイーツ", q: `季節限定 スイーツ 話題 ${new Date().getFullYear()}` },
                { label: "フルーツタルト", q: `フルーツタルト 新作 ${new Date().getFullYear()}` },
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
          {filterMonths.length > 0 ? filterMonths.map(m => m === "unknown" ? "月未設定" : `${m}月`).join("・") : "全月"} ／{" "}
          {filterPriority || "全優先度"} ／ {filtered.length}件
        </p>
      </div>

      {/* 商品カード一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print-grid">
        {displayedProducts.map(p => (
          <article key={p.商品ID} className="surface flex flex-col overflow-hidden hover:shadow-md transition-shadow">
          <Link href={`/product/?id=${encodeURIComponent(p.商品ID)}&back=${encodeURIComponent(searchUrl)}`} className="block flex-1">
            {p.imageUrl ? (
              <div className="w-full h-40 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  loading="lazy"
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
                  <div className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                    {p.ブランド名.includes(ALC_BRAND) && (
                      <span className="bg-teal-100 text-teal-700 border border-teal-300 px-1.5 py-0 rounded text-[10px] font-bold">自社</span>
                    )}
                    {p.ブランド名}
                  </div>
                  <div className="font-bold text-gray-800 text-sm leading-tight">{p.商品名}</div>
                </div>
                <div className="flex flex-col gap-1 items-end shrink-0">
                  {p.商品会議優先度 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${PRIORITY_COLORS[p.商品会議優先度] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                      {p.商品会議優先度}
                    </span>
                  )}
                  <span className="text-xs text-[#1F4E78] font-medium">{p.対象年 || "年未記録"} ／ {p.対象月 ? `${p.対象月}月` : "月未設定"}</span>
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
              <p className="text-xs text-gray-500 mt-2">実在確認: {existenceLabel(p)} ／ 販売確認: {salesLabel(p)}</p>
              {p.真似すべき点 && (
                <p className="text-xs text-gray-600 mt-2 line-clamp-2 print-expand">{p.真似すべき点}</p>
              )}
              {(p.ALC試作案 || p.応用案) && <p className="text-sm text-[#1F4E78] mt-3 line-clamp-3"><strong>ALCへのヒント：</strong>{p.ALC試作案 || p.応用案}</p>}
              <p className="text-xs text-gray-500 mt-2">ピース {p.ピース価格 || "価格未記録"} ／ 既存タルト台 {p.既存タルト台流用可否 || "未記録"}</p>
            </div>
          </Link>
          <div className="px-4 pb-4"><CandidateButton id={p.商品ID} /></div>
          </article>
        ))}
      </div>


      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <div>条件に合う商品が見つかりませんでした</div>
          <button onClick={resetFilters} className="mt-3 text-sm text-[#1F4E78] underline">
            全件表示（条件をクリア）
          </button>
        </div>
      )}
    </div>
  );
}
