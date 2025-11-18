"use client";

export default function HeaderLogin() {
  return (
    <header className="sticky top-0 z-50 bg-white backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
              LiveShop
            </h1>
          </a>

          {/* Auth Button */}
          <div className="flex items-center">
            <a
              href="/register"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Crear cuenta gratis
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
