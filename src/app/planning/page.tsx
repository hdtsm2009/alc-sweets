"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useProducts } from "@/lib/data";
import { useCandidates, blankDraft, parseSavedDraft, CANDIDATE_KEY, DRAFT_KEY, DRAFT_FIELDS, draftMarkdown, COMPARISON_GROUPS, safeHttpUrl, type TartDraft } from "@/lib/planning";
import type { Product } from "@/types/product";
import { safeListBack } from "@/lib/search";

export default function PlanningPage() {
  const { products, loading, error, retry } = useProducts();
  const { ids, toggle, ready, error: candidateError, reset } = useCandidates();
  const [draft, setDraft] = useState<TartDraft>(blankDraft);
  const [notice, setNotice] = useState("");
  const [dirty, setDirty] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [references, setReferences] = useState<Product[]>([]);
  const [refsInitialized, setRefsInitialized] = useState(false);
  const [showMissing, setShowMissing] = useState(false);
  const [returnUrl, setReturnUrl] = useState("/");
  useEffect(() => {
    setReturnUrl(safeListBack(new URLSearchParams(window.location.search).get("back")) || "/");
    try {
      const saved = parseSavedDraft(localStorage.getItem(DRAFT_KEY));
      if (saved) { setDraft(saved.draft); setReferences(saved.references); setRefsInitialized(true); }
    }
    catch { setNotice("保存した試作メモを読み込めませんでした。元の保存内容は変更していません。"); setStorageError(true); }
    setDraftReady(true);
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const guardLink = (event: MouseEvent) => {
      const link = (event.target as Element).closest("a");
      if (link && link.target !== "_blank" && !link.getAttribute("href")?.startsWith("#") &&
          !window.confirm("試作メモに未保存の変更があります。保存せずに移動しますか？")) {
        event.preventDefault(); event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", guardLink, true);
    return () => { window.removeEventListener("beforeunload", warn); document.removeEventListener("click", guardLink, true); };
  }, [dirty]);
  const selected = ids.map(id => products.find(p => p.商品ID === id)).filter(p => p !== undefined);
  const missing = ids.filter(id => !products.some(p => p.商品ID === id));
  useEffect(() => {
    if (!loading && ready && draftReady && !refsInitialized) {
      setReferences(ids.map(id => products.find(p => p.商品ID === id)).filter(p => p !== undefined));
      setRefsInitialized(true);
    }
  }, [loading, ready, draftReady, refsInitialized, ids, products]);
  const referencesChanged = JSON.stringify(references) !== JSON.stringify(selected);
  const persist = (nextDraft: TartDraft, nextReferences: Product[]) => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({version:1, draft:nextDraft, references:nextReferences})); setDirty(false); setNotice("試作メモと参照商品の記録をこの端末に保存しました。"); }
    catch { setDirty(true); setNotice("端末に保存できませんでした。メモを書き出して保管してください。"); }
  };
  const save = () => persist(draft, references);
  const backup = (key: string) => {
    try {
      const url = URL.createObjectURL(new Blob([localStorage.getItem(key) || "null"], {type:"application/json"}));
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${key}-backup.json`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setNotice("保存内容のバックアップを作成できませんでした。"); }
  };
  const download = () => {
    const blob = new Blob([draftMarkdown(draft, references)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "ALC_タルト試作メモ.md";
    anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("試作メモと参照商品の記録を書き出しました。");
  };
  if (loading) return <p role="status" className="py-16 text-center">商品を読み込んでいます…</p>;
  if (error) return <div role="alert"><p>{error}</p><button className="action mt-3" onClick={retry}>再試行</button></div>;
  return <div>
    <div className="flex flex-wrap justify-between gap-4 items-start mb-6">
      <div><p className="eyebrow">ALC / 商品開発</p><h1 className="text-2xl font-bold text-[#1F4E78]">候補比較とタルト試作メモ</h1>
        <p className="text-sm text-gray-600 mt-2">最大4件を同じ項目で比較し、ALCで試す構成を具体化します。</p></div>
      <div className="flex flex-wrap gap-2 no-print"><a className="action action-primary" href="#draft">試作メモを書く ↓</a><Link className="action" href={returnUrl}>検索条件を保って商品を探す</Link></div>
    </div>
    <p className="text-sm bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">候補とメモはこのブラウザ・端末だけに保存します。他の人には共有されません。会議用にはメモを書き出してください。</p>
    {candidateError && <div role="alert" className="text-red-700 mb-4"><p>{candidateError}</p><button className="underline mr-4" onClick={() => backup(CANDIDATE_KEY)}>候補の保存内容をバックアップ</button><button className="underline" onClick={() => { if (window.confirm("この端末の比較候補を初期化します。試作メモの参照記録は残ります。続けますか？")) reset(); }}>候補保存を初期化</button></div>}
    {missing.length > 0 && <div role="status" className="bg-amber-50 p-3 mb-4">DBにない候補が残っています：{missing.map(id => <button key={id} onClick={() => toggle(id)} className="underline mx-2">{id}を外す</button>)}</div>}
    {ready && selected.length === 0 ? <div className="surface p-6 mb-6"><h2 className="font-bold mb-2">比較候補を選んでください</h2><p className="text-sm text-gray-600">検索・商品詳細の「比較候補に追加」から選べます。下の試作メモは候補なしでも記入できます。</p><Link className="inline-block text-[#1F4E78] underline mt-3" href={returnUrl}>検索へ</Link></div> : selected.length > 0 && <section className="mb-8">
      <h2 className="section-title">比較候補 {selected.length}件</h2>
      <p className="text-sm text-gray-600 mb-3">価格は原文です。税区分・サイズ・販売年をそろえて判断してください。未記録は、確認済みを意味しません。</p>
      <label className="flex gap-2 text-sm mb-3"><input type="checkbox" checked={showMissing} onChange={e => setShowMissing(e.target.checked)} />全候補で未記録の項目も表示</label>
      <div className="comparison-wrap" tabIndex={0} aria-label="候補比較表。横にスクロールできます">
        <table className="comparison-table"><thead><tr><th scope="col">比較項目</th>{selected.map(p => <th scope="col" key={p.商品ID}>
          <span className="block text-xs font-normal text-gray-500">{p.ブランド名} ／ {p.対象月 ? `${p.対象月}月` : "月未設定"}</span>
          <Link href={`/product/?id=${encodeURIComponent(p.商品ID)}&from=planning&back=${encodeURIComponent(returnUrl)}`} className="text-[#1F4E78] underline">{p.商品名}</Link>
          <button onClick={() => toggle(p.商品ID)} className="block text-xs underline text-gray-500 mt-2 no-print">候補から外す</button>
        </th>)}</tr></thead><tbody>
          {COMPARISON_GROUPS.map(group => <Group key={group.title} group={group} products={selected} showMissing={showMissing} />)}
          <tr><th scope="row">出典</th>{selected.map(p => <td key={p.商品ID}>{(["latestInfoUrl", "一次情報URL", "URL", "価格出典URL"] as const).map(key => safeHttpUrl(p[key]) ? <a key={key} href={safeHttpUrl(p[key])} target="_blank" rel="noopener noreferrer" className="block text-[#1F4E78] underline mb-2">{key === "latestInfoUrl" ? "最新情報の掲載元" : key}</a> : null)}{!p.URL && !p.一次情報URL && !p.latestInfoUrl && <span>未記録</span>}</td>)}</tr>
        </tbody></table>
      </div>
    </section>}
    <section id="draft" className="surface p-5 md:p-7 scroll-mt-4">
      <h2 className="section-title">自分たちのタルト試作案</h2>
      <p className="text-sm text-gray-600 mb-5">ここからは記入者の企画仮説です。入力内容はこの端末に自動保存します。上のDB記録とは分けて扱います。</p>
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-5 text-sm">
        <p className="font-bold mb-1">この案に紐づく参照商品 {references.length}件</p>
        <p>{references.map(p => `${p.ブランド名} / ${p.商品名}`).join("、") || "未設定"}</p>
        {referencesChanged && <p className="text-amber-800 mt-2">比較中の候補または情報の内容が、この案の参照記録と異なります。保存・書き出しには紐づけ時点の記録を使います。最新の内容を使う場合は下のボタンで更新してください。</p>}
        <button className="underline text-[#1F4E78] mt-2 no-print" onClick={() => { const next = selected.map(p => ({...p})); setReferences(next); if (!storageError) persist(draft, next); else setDirty(true); }}>現在の比較候補をこの案の参照にする</button>
      </div>
      <div className="grid md:grid-cols-2 gap-5">{DRAFT_FIELDS.map(([key, label, placeholder]) => <label key={key} className={`block ${["difference", "risks", "evaluation", "next"].includes(key) ? "md:col-span-2" : ""}`}>
        <span className="block text-sm font-bold text-gray-700 mb-1">{label}</span>
        <textarea aria-label={label} rows={key === "title" || key === "month" ? 2 : 3} value={draft[key]} maxLength={20000} placeholder={placeholder} disabled={!draftReady || !refsInitialized}
          onChange={event => { const next = {...draft, [key]:event.target.value}; setDraft(next); if (!storageError) persist(next, references); else setDirty(true); }}
          className="field w-full resize-y" />
      </label>)}</div>
      <div className="flex flex-wrap items-center gap-3 mt-6 no-print">
        <button className="action action-primary" disabled={storageError} onClick={save}>この端末に保存</button>
        <button className="action" onClick={download}>メモと出典を書き出す</button>
        <span className="text-sm text-gray-600">{dirty ? "未保存の変更があります" : ""}</span>
      </div>
      {notice && <p role="status" className="text-sm mt-3 text-[#1F4E78]">{notice}</p>}
      {storageError && <div className="text-sm mt-3 flex flex-wrap gap-4"><button className="underline" onClick={() => backup(DRAFT_KEY)}>読み取れない保存内容をバックアップ</button><button className="underline" onClick={() => { if (window.confirm("読み取れない端末保存を、いま画面にある試作メモで置き換えます。続けますか？")) { setStorageError(false); save(); } }}>画面のメモで保存し直す</button></div>}
    </section>
  </div>;
}

function Group({ group, products, showMissing }: { group: typeof COMPARISON_GROUPS[number]; products: Product[]; showMissing: boolean }) {
  return <><tr className="comparison-group"><th colSpan={products.length + 1}>{group.title}</th></tr>
    {group.fields.filter(([key]) => showMissing || products.some(p => p[key])).map(([key, label]) => <tr key={key}><th scope="row">{label}</th>{products.map(p => <td key={p.商品ID}>{p[key] || "未記録"}</td>)}</tr>)}
  </>;
}
