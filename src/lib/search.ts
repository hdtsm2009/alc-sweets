import type { Product } from "@/types/product";
import { imageForProduct, latestProducts, newsProducts } from "@/lib/news";

export const INGREDIENTS = ["いちご", "桃", "ぶどう", "和梨", "洋梨", "りんご", "いちじく", "栗", "さつまいも", "かぼちゃ", "マンゴー", "メロン", "レモン", "オレンジ", "さくらんぼ", "ブルーベリー", "ラズベリー", "チョコレート", "チーズ", "抹茶", "紅茶", "ナッツ", "キャラメル"];
const aliases: [RegExp, string][] = [
  [/胡桃/g, "くるみ"],
  [/ちぇりー|桜桃/g, "さくらんぼ"],
  [/すとろべりー|苺|いちご/g, "いちご"], [/ぴーち|桃|もも/g, "もも"],
  [/葡萄|ぶどう/g, "ぶどう"], [/まろん|栗/g, "栗"], [/あっぷる|林檎|りんご/g, "りんご"],
  [/無花果|いちじく/g, "いちじく"], [/ふらんぼわーず|らずべりー/g, "らずべりー"],
  [/しょこら|ちょこれーと|ちょこ/g, "ちょこ"], [/南瓜|ぱんぷきん|かぼちゃ/g, "かぼちゃ"],
  [/薩摩芋|さつま芋|さつまいも/g, "さつまいも"], [/きるふぇぼん/g, "きるふぇぼん"],
];

export function normalizeSearch(text: string): string {
  let result = text.normalize("NFKC").toLowerCase().replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/[\s・･"'“”‘’「」『』]/g, "");
  for (const [pattern, value] of aliases) result = result.replace(pattern, value);
  return result;
}
function normalizedTerm(text: string) {
  const term = normalizeSearch(text);
  return term === "alc" ? normalizeSearch("ア・ラ・カンパーニュ") : term;
}
export function queryTerms(query: string) {
  const positive: string[] = [], negative: string[] = [];
  for (const match of query.normalize("NFKC").matchAll(/(-?)"([^"]+)"|(-?)([^\s"]+)/g)) {
    const term = normalizedTerm(match[2] || match[4]);
    if (term) (match[1] || match[3] ? negative : positive).push(term);
  }
  return { positive: [...new Set(positive)], negative: [...new Set(negative)] };
}
const searchableFields: [string, (keyof Product)[], number][] = [
  ["商品ID", ["商品ID"], 100], ["商品名", ["商品名"], 45],
  ["ブランド", ["ブランド名", "会社名"], 30], ["素材", ["主素材", "副素材", "産地品種"], 35],
  ["分類・テーマ", ["商品カテゴリ", "季節テーマ", "イベントテーマ", "想定用途", "販売形式"], 18],
  ["最新情報", ["latestDescription", "latestUpdateSummary", "latestAvailability"], 12],
  ["開発メモ", ["真似すべき点", "応用案", "商品企画メモ", "売場訴求メモ", "ALC試作案", "既存資材・製法具体メモ", "会議確認事項", "ロス対策", "次アクション"], 8],
];
type IndexedProduct = { product: Product; fields: { label: string; values: string[]; weight: number }[] };
export function buildSearchIndex(products: Product[]): IndexedProduct[] {
  return products.map(product => ({ product, fields: searchableFields.map(([label, keys, weight]) => ({
    label, weight, values: keys.map(key => normalizeSearch(String(product[key] || ""))).filter(Boolean),
  })) }));
}
export function queryMatch(entry: IndexedProduct, query: string, mode: string = "all") {
  const terms = queryTerms(query);
  const contains = (term: string) => entry.fields.some(field => field.values.some(value => value.includes(term)));
  const matched = !terms.negative.some(contains) && (!terms.positive.length || (mode === "any" ? terms.positive.some(contains) : terms.positive.every(contains)));
  let score = 0;
  const fields: string[] = [];
  for (const field of entry.fields) {
    const found = terms.positive.filter(term => field.values.some(value => value.includes(term)));
    if (found.length) {
      fields.push(field.label);
      score += found.reduce((sum, term) => sum + field.weight * (field.values.includes(term) ? 2 : 1), 0);
    }
  }
  return { matched, score, fields };
}
export function matchesQuery(product: Product, query: string, mode: string = "all") {
  return queryMatch(buildSearchIndex([product])[0], query, mode).matched;
}

export interface SearchState {
  q: string; months: string[]; brand: string; priority: string; difficulty: string; ingredient: string;
  brandType: string; existence: string; category: string; development: string; year: string;
  image: string; latest: string; mode: string; sort: string; view: string; page: number; size: string;
}
export const defaultSearch = (): SearchState => ({ q: "", months: [], brand: "", priority: "", difficulty: "", ingredient: "", brandType: "", existence: "", category: "", development: "", year: "", image: "", latest: "", mode: "all", sort: "auto", view: "cards", page: 1, size: "24" });
const textKeys = ["q", "brand", "priority", "difficulty", "ingredient", "brandType", "existence", "category", "development", "year", "image", "latest", "mode", "sort", "view", "size"] as const;
export function parseSearch(params: URLSearchParams): SearchState {
  const state = defaultSearch();
  for (const key of textKeys) if (params.has(key)) state[key] = params.get(key) || "";
  state.months = [...new Set((params.get("months") || "").split(",").filter(v => /^(?:[1-9]|1[0-2]|unknown)$/.test(v)))];
  state.page = /^\d{1,6}$/.test(params.get("page") || "") ? Math.max(1, Number(params.get("page"))) : 1;
  if (!["auto", "priority", "month", "checked", "added", "brand"].includes(state.sort)) state.sort = "auto";
  if (!["24", "48", "all"].includes(state.size)) state.size = "24";
  if (!["cards", "list"].includes(state.view)) state.view = "cards";
  if (!["all", "any"].includes(state.mode)) state.mode = "all";
  if (!["", "photo", "generated", "none"].includes(state.image)) state.image = "";
  if (!["", "latest"].includes(state.latest)) state.latest = "";
  if (!["", "自社", "競合"].includes(state.brandType)) state.brandType = "";
  if (!["", "tart", "other"].includes(state.category)) state.category = "";
  if (!["", "prototype", "reuse", "price"].includes(state.development)) state.development = "";
  return state;
}
export function searchUrl(state: SearchState): string {
  const params = new URLSearchParams({ months: state.months.join(",") });
  const defaults = defaultSearch();
  for (const key of textKeys) if (state[key] && state[key] !== defaults[key]) params.set(key, state[key]);
  if (state.page > 1) params.set("page", String(state.page));
  return `/?${params.toString()}`;
}
const hasRecord = (value: unknown) => typeof value === "string" && !!value.trim() && !/^(?:[-―—]|未確認|未記録|未調査|要確認|不明|記載なし)$/.test(value.trim());
export const checkedDate = (p: Product) => /^\d{4}-\d{2}-\d{2}$/.test(p.informationCheckedAt || "") && /^https?:\/\//.test(p.latestInfoUrl || "") ? p.informationCheckedAt! : "";
export function latestCheckDate(products: Product[]): string { return products.map(checkedDate).sort().at(-1) || ""; }
export function hasIngredient(p: Product, ingredient: string) {
  const value = normalizeSearch(`${p.主素材 || ""} ${p.副素材 || ""}`);
  if (ingredient === "ナッツ") return /なっつ|あーもんど|へーぜる|くるみ|胡桃|ぴすたちお/.test(value);
  if (ingredient === "ぶどう") return /ぶどう|ますかっと|巨峰|ながのぱーぷる/.test(value);
  if (ingredient === "洋梨") return /洋梨|洋なし|らふらんす|るれくちえ/.test(value);
  if (ingredient === "紅茶") return /紅茶|あーるぐれい|だーじりん|あっさむ/.test(value);
  return value.includes(normalizeSearch(ingredient));
}
export function matchesFilters(p: Product, state: SearchState, latestDate: string): boolean {
  if (state.months.length && !state.months.includes(p.対象月 === null ? "unknown" : String(p.対象月))) return false;
  const tart = normalizeSearch(`${p.商品カテゴリ || ""} ${p.商品名}`).includes("たると");
  if (state.category === "tart" && !tart || state.category === "other" && tart) return false;
  if (state.brand && p.ブランド名 !== state.brand || state.priority && p.商品会議優先度 !== state.priority || state.difficulty && p.ALC実装難易度 !== state.difficulty) return false;
  if (state.ingredient && !hasIngredient(p, state.ingredient)) return false;
  const own = normalizeSearch(p.ブランド名).includes(normalizeSearch("アラカンパーニュ"));
  if (state.brandType === "自社" && !own || state.brandType === "競合" && own) return false;
  if (state.existence && (p.実在確認レベル || "未確認") !== state.existence) return false;
  if (state.year && (p.対象年 || "unknown") !== state.year) return false;
  if (state.latest && (!latestDate || checkedDate(p) !== latestDate)) return false;
  if (state.development === "prototype" && !hasRecord(p.ALC試作案)) return false;
  if (state.development === "reuse" && !hasRecord(p.既存タルト台流用可否)) return false;
  if (state.development === "price" && !/^https?:\/\//.test(p.価格出典URL || "") && !(checkedDate(p) && hasRecord(p.latestPrice))) return false;
  const image = imageForProduct(p);
  if (state.image === "photo" && (!image || p.imageDisplayStatus !== "matched")) return false;
  if (state.image === "generated" && (!image || p.imageDisplayStatus !== "generated")) return false;
  if (state.image === "none" && image) return false;
  return true;
}
const priorities: Record<string, number> = { S: 0, "A+": 1, A: 2, B: 3, C: 4 };
export function searchProducts(index: IndexedProduct[], state: SearchState, latestDate = latestCheckDate(index.map(e => e.product))) {
  const hits = index.filter(entry => matchesFilters(entry.product, state, latestDate)).map(entry => ({ product: entry.product, ...queryMatch(entry, state.q, state.mode) })).filter(hit => hit.matched);
  return hits.sort((a, b) => {
    const x = a.product, y = b.product;
    let order = 0;
    if (state.sort === "auto" && queryTerms(state.q).positive.length) order = b.score - a.score;
    if (state.sort === "month") order = (x.対象月 || 13) - (y.対象月 || 13);
    if (state.sort === "checked") order = checkedDate(y).localeCompare(checkedDate(x));
    if (state.sort === "added") order = (y.dbFirstSeen || "").localeCompare(x.dbFirstSeen || "");
    if (state.sort === "brand") order = x.ブランド名.localeCompare(y.ブランド名, "ja");
    return order || (priorities[x.商品会議優先度] ?? 5) - (priorities[y.商品会議優先度] ?? 5) || (x.対象月 || 13) - (y.対象月 || 13) || x.商品ID.localeCompare(y.商品ID);
  });
}
export function resultPage<T>(results: T[], state: Pick<SearchState, "page" | "size">) {
  const size = state.size === "all" ? Math.max(1, results.length) : Number(state.size);
  const pages = Math.max(1, Math.ceil(results.length / size));
  const page = Math.min(pages, Math.max(1, state.page));
  return { page, pages, start: results.length ? (page - 1) * size + 1 : 0, end: Math.min(page * size, results.length), items: results.slice((page - 1) * size, page * size) };
}

export function safeListBack(value: string | null): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value, "https://local.invalid");
    if (url.origin !== "https://local.invalid" || !value.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value)) return undefined;
    if (!["/", "/news/", "/images/"].includes(url.pathname)) return undefined;
    return url.pathname + url.search;
  } catch { return undefined; }
}

export function listProducts(products: Product[], back: string): Product[] {
  const url = new URL(safeListBack(back) || "/", "https://local.invalid");
  if (url.pathname === "/news/") {
    const entries = url.searchParams.get("view") === "added" ? newsProducts(products) : latestProducts(products);
    return entries.filter(p => (!url.searchParams.get("brand") || p.ブランド名 === url.searchParams.get("brand")) && matchesQuery(p, url.searchParams.get("q") || ""));
  }
  if (url.pathname === "/images/") {
    const status = url.searchParams.get("status") || "pending";
    return products.filter(p => matchesQuery(p, url.searchParams.get("q") || "") && (status === "all" || (status === "photo" ? p.imageDisplayStatus === "matched" : status === "generated" ? p.imageDisplayStatus === "generated" : !["matched", "generated"].includes(p.imageDisplayStatus || ""))));
  }
  return searchProducts(buildSearchIndex(products), parseSearch(url.searchParams)).map(hit => hit.product);
}

export function planningUrl(back: string): string {
  return "/planning/?back=" + encodeURIComponent(safeListBack(back) || "/");
}

export function backAtResult(back: string, index: number): string {
  const safe = safeListBack(back) || "/";
  const url = new URL(safe, "https://local.invalid");
  if (url.pathname !== "/" || index < 0) return safe;
  const state = parseSearch(url.searchParams);
  state.page = state.size === "all" ? 1 : Math.floor(index / Number(state.size)) + 1;
  return searchUrl(state);
}
