"use client";
import { useCandidates } from "@/lib/planning";

export default function CandidateButton({ id }: { id: string }) {
  const { ids, toggle, ready, error } = useCandidates();
  const selected = ids.includes(id);
  return <div className="no-print">
    <button type="button" disabled={!ready} aria-pressed={selected} onClick={() => toggle(id)}
      className={`w-full rounded-lg border px-3 py-2 text-sm font-medium ${selected ? "bg-[#1F4E78] text-white border-[#1F4E78]" : "bg-white text-[#1F4E78] border-[#1F4E78]/30 hover:bg-blue-50"}`}>
      {selected ? "✓ 比較候補から外す" : "＋ 比較候補に追加"}
    </button>
    {error && <p role="alert" className="text-sm text-red-700 mt-1">{error}</p>}
  </div>;
}
