import type { Metadata } from "next";
import "./globals.css";
import FooterInfo from "@/components/FooterInfo";

export const metadata: Metadata = {
  title: "季節スイーツマンスリーDB",
  description: "ア・ラ・カンパーニュ 季節スイーツマンスリーDB — 旬素材・競合・自社商品データベース",
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
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <a href="/" className="text-xl font-bold tracking-wide hover:opacity-80">
              🍓 季節スイーツマンスリーDB
            </a>
            <nav className="flex gap-4 text-sm ml-4">
              <a href="/" className="hover:opacity-80">検索</a>
              <a href="/calendar/" className="hover:opacity-80">月別カレンダー</a>
              <a href="/picks/" className="hover:opacity-80">A+候補</a>
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
