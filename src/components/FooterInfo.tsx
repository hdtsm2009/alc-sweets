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
    <span className="inline-flex items-center gap-2 text-xs text-white/60">
      <span className="bg-white/20 text-white/90 px-2 py-0.5 rounded font-mono">{meta.version}</span>
      <span>{meta.total}件</span>
      <span>·</span>
      <span>更新: {meta.generated}</span>
    </span>
  );
}
