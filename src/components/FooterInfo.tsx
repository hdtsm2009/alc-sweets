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
    <span className="inline-flex items-center gap-1.5 text-xs text-white/70 font-mono">
      <span className="bg-white/15 px-1.5 py-0.5 rounded">{meta.version}</span>
      <span className="text-white/40">|</span>
      <span>{meta.total}件</span>
      <span className="text-white/40">|</span>
      <span>{meta.generated}</span>
    </span>
  );
}
