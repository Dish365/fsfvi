import React from "react";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
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
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
              Ghana Cocoa
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link 
              href="/" 
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Dashboard
            </Link>
            <Link 
              href="/optimization" 
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Optimization
            </Link>
            <Link 
              href="/analytics" 
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Analytics
            </Link>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-white">
          <div className="flex h-full flex-col pt-5">
            <div className="space-y-1 px-3">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Stakeholder Views
              </h2>
              <nav className="flex flex-col gap-1">
                <Link 
                  href="/government" 
                  className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  Government Dashboard
                </Link>
                <Link 
                  href="/investor" 
                  className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  Investor Interface
                </Link>
                <Link 
                  href="/value-chain" 
                  className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  Value Chain Dashboard
                </Link>
              </nav>
            </div>
            
            <div className="mt-6 space-y-1 px-3">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Components
              </h2>
              <nav className="flex flex-col gap-1">
                <Link 
                  href="/components/production" 
                  className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  Production
                </Link>
                <Link 
                  href="/components/processing" 
                  className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  Processing
                </Link>
                <Link 
                  href="/components/market-access" 
                  className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  Market Access
                </Link>
                <Link 
                  href="/components/infrastructure" 
                  className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  Infrastructure
                </Link>
                <Link 
                  href="/components" 
                  className="mt-2 rounded-md px-3 py-2 text-sm text-slate-500 hover:text-slate-700"
                >
                  View All Components
                </Link>
              </nav>
            </div>
          </div>
        </aside>
        
        {/* Content Area */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
} 