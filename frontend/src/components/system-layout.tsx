import React from "react";
import Link from "next/link";

interface SystemLayoutProps {
  children: React.ReactNode;
}

export default function SystemLayout({ children }: SystemLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link 
              href="/" 
              className="font-semibold text-lg text-slate-900 hover:text-slate-700"
            >
              FSFVI Dashboard
            </Link>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
              System View
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link 
              href="/" 
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Home
            </Link>
            <Link 
              href="/commodity-level-dashboard" 
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Commodity Dashboard
            </Link>
            <Link 
              href="/system-level-dashboard/analytics-dashboard" 
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Analytics
            </Link>
            
          </nav>
        </div>
      </header>
      
      {/* Main Content without sidebar */}
      <div className="flex-1 p-6 bg-gray-50">
        {children}
      </div>
    </div>
  );
} 