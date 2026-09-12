"use client";
import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import { parseProducts } from "@/lib/data";

export const CANDIDATE_KEY = "alc-tart-candidates-v1";
export const DRAFT_KEY = "alc-tart-draft-v1";
const CHANGE_EVENT = "alc-tart-candidates-changed";
export const MAX_CANDIDATES = 4;

export function parseCandidateIds(raw: string | null): string[] {
  if (raw === null) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value) || value.length > MAX_CANDIDATES ||
      value.some(id => typeof id !== "string" || !id.trim()) || new Set(value).size !== value.length) {
    throw new Error("保存した候補の形式が不正です");
  }
  return value;
}

export function useCandidates() {
  const [ids, setIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const read = () => {
      try {
        setIds(parseCandidateIds(localStorage.getItem(CANDIDATE_KEY)));
        setError("");
      } catch { setError("候補の端末保存を読み込めません。ブラウザの保存設定を確認してください。"); }
      setReady(true);
    };
    read();
    window.addEventListener("storage", read);
    window.addEventListener(CHANGE_EVENT, read);
    return () => { window.removeEventListener("storage", read); window.removeEventListener(CHANGE_EVENT, read); };
  }, []);
  const toggle = (id: string) => {
    try {
      const current = parseCandidateIds(localStorage.getItem(CANDIDATE_KEY));
      if (!current.includes(id) && current.length >= MAX_CANDIDATES) {
        setError("比較できる候補は4件までです。1件外してから追加してください。");
        return;
      }
      const next = current.includes(id) ? current.filter(v => v !== id) : [...current, id];
      localStorage.setItem(CANDIDATE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch { setError("候補を保存できませんでした。ブラウザの保存設定を確認してください。"); }
  };
  const reset = () => {
    try { localStorage.removeItem(CANDIDATE_KEY); window.dispatchEvent(new Event(CHANGE_EVENT)); }
    catch { setError("候補の保存を初期化できませんでした。"); }
  };
  return { ids, toggle, ready, error, reset };
}

export const DRAFT_FIELDS = [
  ["title", "企画名", "例：主役の果実が伝わる季節タルト"],
  ["month", "販売を目指す月・期間", "例：10月／秋の週末限定"],
  ["customer", "誰に・どんな場面で", "客層、来店理由、用途"],
  ["fruit", "主役素材・産地・品種", "調達時期や必要な規格も記入"],
  ["base", "タルト台・生地", "既存の台を使うか、新規試作か"],
  ["cream", "クリーム・層の構成", "果実との相性、甘さ、断面"],
  ["accent", "アクセント・仕上げ", "食感、酸味、香り、見せ方"],
  ["difference", "ALCらしさ・既存商品との差", "参考にする点と、そのまま真似しない点"],
  ["size", "サイズ・提供形態", "ホール径、カット数、ピース／ホール"],
  ["price", "目標販売価格・税区分", "自分で設定する目標。競合価格と区別"],
  ["resources", "既存資材・製法の流用", "確認できたこと／未確認のこと"],
  ["operations", "工場・店舗の分担", "仕込み、仕上げ、運搬、店舗加工"],
  ["risks", "調達・日持ち・ロスの課題", "水分移行、変色、保管、残数対策など"],
  ["evaluation", "試作で確かめる項目", "味・断面・保形性・作業時間・翌日の食感"],
  ["next", "次のアクション・担当・期限", "誰が、いつまでに、何を確認するか"],
] as const;
export type DraftField = typeof DRAFT_FIELDS[number][0];
export type TartDraft = Record<DraftField, string>;
export const blankDraft = (): TartDraft => Object.fromEntries(DRAFT_FIELDS.map(([key]) => [key, ""])) as TartDraft;

export function parseDraft(raw: string | null): TartDraft {
  if (raw === null) return blankDraft();
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid draft");
  const draft = blankDraft();
  for (const [key] of DRAFT_FIELDS) {
    const field = (value as Record<string, unknown>)[key];
    if (typeof field !== "string" || field.length > 20000) throw new Error("Invalid draft field");
    draft[key] = field;
  }
  return draft;
}

export interface SavedDraft { version: 1; draft: TartDraft; references: Product[] }
export function parseSavedDraft(raw: string | null): SavedDraft | null {
  if (raw === null) return null;
  const value = JSON.parse(raw);
  if (value?.version === 1) {
    if (!Array.isArray(value.references) || value.references.length > MAX_CANDIDATES) throw new Error("Invalid draft references");
    return { version: 1, draft: parseDraft(JSON.stringify(value.draft)), references: parseProducts(value.references) };
  }
  // 初期版の本文だけの保存は維持し、別の候補を勝手に出典に付けない。
  return { version: 1, draft: parseDraft(raw), references: [] };
}

export function safeHttpUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : undefined; }
  catch { return undefined; }
}

export const COMPARISON_GROUPS: { title: string; fields: [keyof Product, string][] }[] = [
  { title: "調査時点の商品情報", fields: [["対象年", "対象年"], ["主素材", "主素材"], ["副素材", "副素材"], ["商品カテゴリ", "カテゴリ"], ["ピース価格", "ピース価格（原文）"], ["ホール価格", "ホール価格（原文）"], ["セット価格", "セット価格（原文）"], ["サイズ", "サイズ"], ["販売開始日", "販売開始日"], ["予約開始日", "予約開始日"], ["販売終了日", "販売終了日"], ["情報公開日", "情報公開日"], ["販売店舗", "販売店舗"], ["実在確認レベル", "実在確認レベル"], ["販売確認状態", "販売確認状態"], ["価格確認ステータス", "価格確認"], ["競合価格確認", "競合価格確認の記録"], ["画像確認ステータス", "画像確認"]] },
  { title: "Excelに記録されたALC向けの評価・仮説", fields: [["ALCブランド適合度", "ブランド適合度"], ["真似すべき点", "参考にする点"], ["真似しなくてよい点", "参考にしない点"], ["応用案", "応用案"], ["ALC試作案", "試作案"], ["ALC想定価格", "ALC想定価格（仮説）"], ["価格納得理由", "価格の理由"], ["既存タルト台流用可否", "既存タルト台"], ["既存製法流用可否", "既存製法"], ["既存資材・製法具体メモ", "資材・製法メモ"], ["製造難易度", "製造難易度"], ["店舗オペ負荷", "店舗負荷"], ["原材料調達難易度", "原材料調達"], ["工場/店舗役割", "工場／店舗の役割"], ["店舗加工要否", "店舗加工"], ["日持ち", "日持ちの記録"], ["冷凍適性", "冷凍適性"], ["包材必要性", "包材必要性"], ["廃棄リスク", "廃棄リスク"], ["ロス対策", "ロス対策"], ["会議確認事項", "会議での確認事項"], ["次アクション", "次のアクション"]] },
];

export function draftMarkdown(draft: TartDraft, products: Product[]): string {
  const lines = ["# ALC タルト試作企画メモ", "", "記入内容は企画仮説です。商品化・原価・衛生・日持ちの検証済みを意味しません。", ""];
  for (const [key, label] of DRAFT_FIELDS) lines.push(`## ${label}`, draft[key].trim() || "未記入", "");
  lines.push("## 参照商品（調査時点の記録）", "");
  for (const p of products) {
    lines.push(`### ${p.ブランド名} / ${p.商品名} (${p.商品ID})`,
      `対象: ${p.対象年 || "年未記録"} / ${p.対象月 ? `${p.対象月}月` : "月未設定"}`,
      `価格: ピース ${p.ピース価格 || "未記録"} / ホール ${p.ホール価格 || "未記録"} / セット ${p.セット価格 || "未記録"}`,
      `サイズ: ${p.サイズ || "未記録"}`,
      `実在確認: ${p.実在確認レベル || "未確認"} / 販売確認: ${p.販売確認状態 || "未確認"} / 価格確認: ${p.価格確認ステータス || "未確認"}`);
    for (const key of ["一次情報URL", "URL", "価格出典URL"] as const) if (safeHttpUrl(p[key])) lines.push(`${key}: ${p[key]}`);
    for (const key of ["真似すべき点", "応用案", "ALC試作案", "会議確認事項"] as const) if (p[key]) lines.push(`DB記録・${key}: ${p[key]}`);
    lines.push("");
  }
  return lines.join("\n");
}
