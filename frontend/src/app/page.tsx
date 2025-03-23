import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 border-b">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900">FSFVI Dashboard</h1>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Food System Food Value Index (FSFVI) Dashboard</h1>
            
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="p-8 bg-white rounded-lg shadow-md border border-emerald-100 hover:border-emerald-300 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-700">
                    <path d="M14 4h6v6"></path><path d="M10 20H4v-6"></path><path d="M20 10 4 20"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-emerald-800">Commodity Level Dashboard</h2>
              </div>
              <Link 
                href="/commodity-level-dashboard" 
                className="mt-6 inline-block px-6 py-3 bg-emerald-100 text-emerald-800 rounded-md hover:bg-emerald-200 font-medium"
              >
                Enter Commodity Dashboard
              </Link>
            </div>
            
            <div className="p-8 bg-white rounded-lg shadow-md border border-blue-100 hover:border-blue-300 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-blue-800">System Level Dashboard</h2>
              </div>
              <Link 
                href="/system-level-dashboard" 
                className="mt-6 inline-block px-6 py-3 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 font-medium"
              >
                Enter System Dashboard
              </Link>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="p-8 bg-white rounded-lg shadow-md border border-purple-100 hover:border-purple-300 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-700">
                    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
                    <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
                    <path d="M12 3v6"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-purple-800">Kenya FSFVI Analytics</h2>
              </div>
              <p className="text-slate-600 mb-4">
                Explore in-depth analytics on Kenya's food system data, with interactive visualizations of performance gaps, funding allocation, and optimization opportunities.
              </p>
              <Link 
                href="/analytics-dashboard" 
                className="mt-2 inline-block px-6 py-3 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 font-medium"
              >
                Explore Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t p-4 text-center text-sm text-gray-500">
        <p>Food System Food Value Index Dashboard © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
} 