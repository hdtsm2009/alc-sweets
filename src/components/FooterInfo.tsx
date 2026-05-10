"use client";
import { useEffect, useState } from "react";

interface Meta {
  total: number;
  generated: string;
  version: string;
}

export default function FooterInfo() {
  const [meta, setMeta] = useState<Meta | null>(null);

  useEffect(() => {
    fetch("/data/meta.json")
      .then(r => r.json())
      .then(setMeta)
      .catch(() => null);
  }, []);

  if (!meta) return null;

  return (
    <span className="inline-flex items-center gap-2 text-xs text-gray-400 mt-1">
      <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">{meta.version}</span>
      <span>商品数 {meta.total}件</span>
      <span>·</span>
      <span>データ更新: {meta.generated}</span>
    </span>
  );
}
