import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALC 季節商品DB",
  description: "ア・ラ・カンパーニュ 季節商品・旬素材スイーツ調査データベース",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-[#1F4E78] text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <a href="/" className="text-xl font-bold tracking-wide hover:opacity-80">
              🍓 ALC 季節商品DB
            </a>
            <nav className="flex gap-4 text-sm ml-4">
              <a href="/" className="hover:opacity-80">検索</a>
              <a href="/calendar/" className="hover:opacity-80">月別カレンダー</a>
              <a href="/picks/" className="hover:opacity-80">A+候補</a>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="text-center text-xs text-gray-400 py-6">
          HT Project — ALC 季節商品調査DB v12 © 2026
        </footer>
      </body>
    </html>
  );
}
