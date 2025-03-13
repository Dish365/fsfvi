import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FSFVI Dashboard - Ghana Cocoa Value Chain",
  description: "Food System Food Value Index analysis for Ghana's cocoa value chain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-slate-50 text-slate-900 antialiased">
          {children}
        </main>
      </body>
    </html>
  );
}
