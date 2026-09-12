import type { Product } from "@/types/product";

export function newsProducts(products: Product[]): Product[] {
  return products.filter(p => p.dbFirstSeenKind === "added" && /^\d{4}-\d{2}-\d{2}$/.test(p.dbFirstSeen || ""))
    .sort((a, b) => (b.dbFirstSeen || "").localeCompare(a.dbFirstSeen || "") ||
      (b.dbFirstSeenBatch || "").localeCompare(a.dbFirstSeenBatch || "") || a.商品ID.localeCompare(b.商品ID));
}

export function imageForProduct(p: Product): string | undefined {
  if (p.imageDisplayStatus !== "matched" || !p.imageSourceUrl || !p.imageCheckedAt) return undefined;
  try {
    const url = new URL(p.imageUrl || "");
    if (["https:", "http:"].includes(url.protocol)) return url.href;
  } catch { /* An invalid source is a placeholder, never a broken product photograph. */ }
  return undefined;
}

export function imagePlaceholder(p: Product): string {
  return p.imageDisplayStatus === "missing" ? "商品画像未取得" : "商品画像の対応を確認中";
}
