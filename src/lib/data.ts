import type { Product } from "@/types/product";

let _cache: Product[] | null = null;

export async function getProducts(): Promise<Product[]> {
  if (_cache) return _cache;
  const res = await fetch("/data/products.json");
  const data = await res.json();
  _cache = data as Product[];
  return _cache;
}

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
