import type { Product } from "@/types/product";
import { useEffect, useState, useCallback } from "react";

let _cache: Promise<Product[]> | null = null;

export async function getProducts(): Promise<Product[]> {
  if (_cache) return _cache;
  _cache = fetchJson("/data/products.json").then(parseProducts).catch(error => {
    _cache = null;
    throw error;
  });
  return _cache;
}

export async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`データの取得に失敗しました（HTTP ${res.status}）`);
  return res.json();
}

export function parseProducts(data: unknown): Product[] {
  if (!Array.isArray(data)) throw new Error("商品データの形式が不正です");
  const ids = new Set<string>();
  return data.map(row => {
    if (!row || typeof row !== "object" || Array.isArray(row)) throw new Error("商品データの形式が不正です");
    for (const field of ["商品ID", "商品名", "ブランド名"]) {
      if (typeof row[field] !== "string" || !row[field].trim()) throw new Error(`商品データの${field}が不正です`);
    }
    if (ids.has(row.商品ID)) throw new Error("商品IDが重複しています");
    ids.add(row.商品ID);
    if (row.対象月 !== null && (!Number.isInteger(row.対象月) || row.対象月 < 1 || row.対象月 > 12)) throw new Error("対象月が不正です");
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      if (key === "対象月" || key === "No.") result[key] = value;
      else if (value == null) result[key] = "";
      else if (typeof value === "string") result[key] = value;
      else throw new Error(`商品データの${key}が不正です`);
    }
    return result as unknown as Product;
  });
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt(n => n + 1), []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getProducts().then(data => { if (active) setProducts(data); })
      .catch(() => { if (active) setError("商品データを読み込めませんでした。再試行してください。"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  return { products, loading, error, retry };
}

export function matchesQuery(p: Product, query: string): boolean {
  const normalize = (text: string) => text.normalize("NFKC").toLocaleLowerCase("ja");
  const text = normalize([p.商品ID, p.ブランド名, p.会社名, p.商品名, p.主素材, p.副素材,
    p.商品カテゴリ, p.季節テーマ, p.イベントテーマ, p.真似すべき点, p.応用案,
    p.商品企画メモ, p.売場訴求メモ, p.ALC試作案, p["既存資材・製法具体メモ"],
    p.会議確認事項, p.ロス対策, p.latestDescription, p.latestUpdateSummary].filter(Boolean).join(" "));
  return normalize(query).trim().split(/\s+/).every(word => text.includes(word));
}

// 採用・画像の取得・企画優先度から、実在や現在の販売を推測しない。
export const existenceLabel = (p: Product) => p.実在確認レベル || "未確認";
export const salesLabel = (p: Product) => p.販売確認状態 || "未確認";
export const hasRecord = (value: unknown): boolean => typeof value === "string" && !!value.trim() && !/^(?:[-―—]|未確認|未記録|未調査|要確認|不明|記載なし)$/.test(value.trim());

export const ALC_BRAND = "ア・ラ・カンパーニュ";

export const MONTHS = [1,2,3,4,5,6,7,8,9,10,11,12];
export const MONTH_LABELS: Record<number, string> = {
  1:"1月", 2:"2月", 3:"3月", 4:"4月", 5:"5月", 6:"6月",
  7:"7月", 8:"8月", 9:"9月", 10:"10月", 11:"11月", 12:"12月"
};

export const PRIORITY_COLORS: Record<string, string> = {
  "S": "bg-red-100 text-red-700 border-red-300",
  "A+": "bg-orange-100 text-orange-700 border-orange-300",
  "A": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "B": "bg-blue-100 text-blue-700 border-blue-300",
  "C": "bg-gray-100 text-gray-600 border-gray-300",
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  "低（即検討可）": "bg-green-100 text-green-700",
  "中": "bg-yellow-100 text-yellow-700",
  "高（実装困難）": "bg-red-100 text-red-700",
  "要レビュー": "bg-gray-100 text-gray-600",
};
