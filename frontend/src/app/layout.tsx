import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FSFVI Dashboard",
  description: "Food System Food Value Index analysis",
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
          {/* Main dashboard navigation page gets rendered here */}
          {children}
        </main>
      </body>
    </html>
  );
}
