"use client";
import { useState } from "react";
import type { Product } from "@/types/product";
import { useProducts, PRIORITY_COLORS } from "@/lib/data";
import Link from "next/link";

const MONTH_NAMES = ["月未設定","1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
const SEASON_COLORS: Record<number, string> = {
  1: "bg-blue-50 border-blue-200",
  2: "bg-blue-50 border-blue-200",
  3: "bg-pink-50 border-pink-200",
  4: "bg-pink-50 border-pink-200",
  5: "bg-green-50 border-green-200",
  6: "bg-green-50 border-green-200",
  7: "bg-orange-50 border-orange-200",
  8: "bg-orange-50 border-orange-200",
  9: "bg-amber-50 border-amber-200",
  10: "bg-amber-50 border-amber-200",
  11: "bg-yellow-50 border-yellow-200",
  12: "bg-red-50 border-red-200",
};

export default function CalendarPage() {
  const { products, loading, error, retry } = useProducts();

  const [selected, setSelected] = useState<number | null>(null);



  if (error) return <div role="alert" className="text-center py-20"><p>{error}</p><button onClick={retry} className="mt-3 underline">再試行</button></div>;
  if (loading) return <div className="text-center py-20 text-gray-400">読み込み中...</div>;

  const byMonth: Record<number, Product[]> = {};
  for (let m = 0; m <= 12; m++) byMonth[m] = [];
  for (const p of products) {
    const m = Number(p.対象月);
    if (m >= 0 && m <= 12) byMonth[m].push(p);
  }

  const displayList = selected !== null ? byMonth[selected] : [];
  const sCount = (ps: Product[]) => ps.filter(p => p.商品会議優先度 === "S").length;
  const aplusCount = (ps: Product[]) => ps.filter(p => p.商品会議優先度 === "A+").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1F4E78] mb-6">月別カレンダー</h1>

      <p className="text-sm text-gray-600 mb-4">調査時点の対象月でまとめた参考事例です。旬や現在の販売を保証するものではありません。</p>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
        {[1,2,3,4,5,6,7,8,9,10,11,12,0].map(m => {
          const ps = byMonth[m];
          return (
            <button
              key={m}
              onClick={() => setSelected(selected === m ? null : m)}
              className={`rounded-xl border-2 p-3 text-left transition-all ${SEASON_COLORS[m] || "bg-gray-50 border-gray-200"} ${selected === m ? "ring-2 ring-[#1F4E78] shadow-lg" : "hover:shadow-md"}`}
            >
              <div className="font-bold text-lg text-[#1F4E78]">{MONTH_NAMES[m]}</div>
              <div className="text-xs text-gray-500 mt-1">{ps.length}件</div>
              {sCount(ps) > 0 && <div className="text-xs text-red-600 font-bold">S:{sCount(ps)}</div>}
              {aplusCount(ps) > 0 && <div className="text-xs text-orange-600">A+:{aplusCount(ps)}</div>}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div>
          <h2 className="text-xl font-bold text-[#1F4E78] mb-4">
            {MONTH_NAMES[selected]} の商品 ({displayList.length}件)
          </h2>
          <Link href={`/?months=${selected === 0 ? "unknown" : selected}`} className="action mb-4">この月の商品から比較候補を選ぶ</Link>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayList
              .sort((a, b) => {
                const order: Record<string, number> = {S:0, "A+":1, A:2, B:3, C:4};
                return (order[a.商品会議優先度] ?? 5) - (order[b.商品会議優先度] ?? 5);
              })
              .map(p => (
                <Link
                  key={p.商品ID}
                  href={`/product/?id=${encodeURIComponent(p.商品ID)}&back=${encodeURIComponent(`/?months=${selected === 0 ? "unknown" : selected}`)}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 block"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <div className="text-xs text-gray-400">{p.ブランド名} ／ {p.対象年 || "年未記録"}</div>
                      <div className="font-bold text-sm text-gray-800">{p.商品名}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-bold shrink-0 ${PRIORITY_COLORS[p.商品会議優先度] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                      {p.商品会議優先度}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 flex gap-2 flex-wrap mt-1">
                    {p.主素材 && <span>🍓 {p.主素材}</span>}
                    {p.商品カテゴリ && <span>📦 {p.商品カテゴリ}</span>}
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}

      {selected === null && (
        <p className="text-center text-gray-400 py-8">月をクリックして商品一覧を表示</p>
      )}
    </div>
  );
}
