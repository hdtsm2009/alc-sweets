"use client";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/data";

interface Meta {
  total: number;
  generated: string;
  version: string;
  latestInformationCheck?: string;
  checkedProducts?: number;
}

export default function FooterInfo() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setFailed(false);
    fetchJson("/data/meta.json")
      .then(data => {
        const value = data as Meta | null;
        if (!value || !Number.isInteger(value.total) || value.total < 0 || typeof value.generated !== "string" || typeof value.version !== "string") throw new Error("Invalid metadata");
        if (active) setMeta(value);
      })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [attempt]);

  if (failed) return <button className="text-xs text-white/70 underline" onClick={() => setAttempt(n => n + 1)}>更新情報を取得できませんでした（再試行）</button>;

  if (!meta) return null;

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 max-w-full text-xs text-white/70 font-mono">
      <span className="bg-white/15 px-1.5 py-0.5 rounded">{meta.version}</span>
      <span className="text-white/40">|</span>
      <span>{meta.total}件</span>
      <span className="text-white/40">|</span>
      <span title="JSONの生成日です。個別商品の販売確認日ではありません。">DB生成 {meta.generated}</span>
      {meta.latestInformationCheck && <span title={`${meta.checkedProducts || 0}商品について公式情報を確認した最新の日付です。全商品の販売状況を確認した日ではありません。`}>／ 情報確認 {meta.latestInformationCheck}</span>}
    </span>
  );
}
