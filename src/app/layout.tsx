import type { Metadata } from "next";
import "./globals.css";
import FooterInfo from "@/components/FooterInfo";

export const metadata: Metadata = {
  title: "ALC タルト開発DB",
  description: "ア・ラ・カンパーニュのタルト商品開発 — 季節素材・参考商品・候補比較・試作メモ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-[#1F4E78] text-white shadow-md no-print">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href="/" className="text-xl font-bold tracking-wide hover:opacity-80">
              ALC タルト開発DB
            </a>
            <nav aria-label="メインナビゲーション" className="flex flex-wrap gap-4 text-sm">
              <a href="/" className="hover:opacity-80">検索</a>
              <a href="/calendar/" className="hover:opacity-80">月別カレンダー</a>
              <a href="/picks/" className="hover:opacity-80">優先候補</a>
              <a href="/planning/" className="hover:opacity-80">比較・試作メモ</a>
              <a href="/about/" className="hover:opacity-80 opacity-70">使い方</a>
            </nav>
            <div className="ml-auto">
              <FooterInfo />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="text-center text-xs text-gray-400 py-6 no-print">
          HT Project — ALC 季節商品調査DB © 2026
        </footer>
      </body>
    </html>
  );
}
