import React, { useState } from 'react'

export default function LandingPage({ onEnterApp }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleEnterApp = () => {
    setIsLoading(true)
    setTimeout(() => {
      onEnterApp()
    }, 1000)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6 lg:p-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-800">PPT-Slider</span>
        </div>
        <nav className="hidden md:flex gap-8 text-gray-600">
          <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
          <a href="#about" className="hover:text-gray-900 transition-colors">About</a>
          <a href="#contact" className="hover:text-gray-900 transition-colors">Contact</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Logo Animation */}
          <div className="mb-8 relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="white" className="animate-bounce">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
            <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-green-400 rounded-full animate-ping opacity-75" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute top-1/2 -left-8 w-4 h-4 bg-red-400 rounded-full animate-ping opacity-75" style={{animationDelay: '1s'}}></div>
          </div>

          {/* Title */}
          <h1 className="text-6xl lg:text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 tracking-tight">
            PPT-Slider
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Create stunning presentations with ease. A modern, intuitive PowerPoint alternative built with React.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Rich Media Support</h3>
              <p className="text-gray-600 text-sm">Insert images, shapes, charts, and tables with ease</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Modern Design</h3>
              <p className="text-gray-600 text-sm">Beautiful interface with smooth animations and effects</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-600">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Fast & Responsive</h3>
              <p className="text-gray-600 text-sm">Lightning-fast performance with real-time editing</p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleEnterApp}
            disabled={isLoading}
            className="group relative px-12 py-4 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-semibold rounded-full text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Loading...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span>Start Creating</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="group-hover:translate-x-1 transition-transform">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            )}
            
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity -z-10"></div>
          </button>

          {/* Additional info */}
          <p className="mt-8 text-gray-500 text-sm">
            No sign-up required • Works offline • Export to PDF
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-500 text-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            Built with ❤️ using React, Vite & Tailwind CSS
          </div>
          <div className="flex gap-6">
            <span>© 2024 PPT-Slider</span>
            <span>•</span>
            <span>All rights reserved</span>
          </div>
        </div>
      </footer>

      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" style={{animationDelay: '4s'}}></div>
      </div>

    </div>
  )
}