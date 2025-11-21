import React, { useState, useEffect, useRef } from 'react'

export default function LandingPage({ onEnterApp }) {
  const [isLoading, setIsLoading] = useState(false)
  // 0: Initial, 1: Icon, 2: Title, 3: Powered By, 4: Finished
  const [loadingStage, setLoadingStage] = useState(0)
  const [scrollY, setScrollY] = useState(0)

  // Refs for scroll reveal
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const mockupRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)

    // Choreographed Startup Animation
    const sequence = async () => {
      // Stage 1: Icon appears
      await new Promise(r => setTimeout(r, 100))
      setLoadingStage(1)

      // Stage 2: Title appears
      await new Promise(r => setTimeout(r, 800))
      setLoadingStage(2)

      // Stage 3: Powered By appears
      await new Promise(r => setTimeout(r, 800))
      setLoadingStage(3)

      // Stage 4: Finish (Fade out overlay)
      await new Promise(r => setTimeout(r, 1500))
      setLoadingStage(4)
    }

    sequence()

    // Enforce body overflow hidden to ensure no scrollbar
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.body.style.overflow = ''
    }
  }, [])

  const handleEnterApp = () => {
    setIsLoading(true)
    setTimeout(() => {
      onEnterApp()
    }, 800)
  }

  // The original app icon path
  const AppIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
    </svg>
  )

  // Helper for scroll opacity/transform
  const getRevealStyle = (ref, offset = 0) => {
    if (!ref.current) return {}
    const rect = ref.current.getBoundingClientRect()
    const isVisible = rect.top < window.innerHeight - offset
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
    }
  }

  return (
    <div className="relative h-screen w-full bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-y-auto overflow-x-hidden no-scrollbar">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Advanced Startup Animation Overlay */}
      <div
        className={`fixed inset-0 z-[300] bg-white flex items-center justify-center transition-opacity duration-1000 ${loadingStage === 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="flex flex-col items-center justify-center relative">
          {/* Icon */}
          <div
            className={`w-24 h-24 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30 transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) ${loadingStage >= 1 ? 'scale-100 opacity-100 rotate-0' : 'scale-50 opacity-0 rotate-45'}`}
          >
            <AppIcon className="w-12 h-12" />
          </div>

          {/* Title */}
          <div
            className={`mt-6 text-3xl font-bold text-gray-900 tracking-tight transition-all duration-700 ${loadingStage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            PPT-Slider
          </div>

          {/* Powered By */}
          <div
            className={`mt-3 flex items-center gap-2 text-sm font-medium text-gray-500 transition-all duration-700 ${loadingStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          >
            <span>Powered by</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold">Actalyst</span>
          </div>
        </div>
      </div>

      {/* Sticky Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 20 ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 py-3 shadow-sm' : 'py-6 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20 transition-transform group-hover:scale-105">
              <AppIcon className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">PPT-Slider</span>
          </div>

          <button
            onClick={handleEnterApp}
            className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30"
          >
            Launch App
          </button>
        </div>
      </header>

      {/* Hero Section with Parallax */}
      <section className="relative pt-32 pb-32 px-6 overflow-hidden min-h-screen flex flex-col items-center justify-center">
        {/* Floating Parallax Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top Left Blob */}
          <div
            className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-50 to-purple-50 blur-3xl opacity-60 transition-transform duration-1000 ease-out"
            style={{ transform: `translateY(${scrollY * 0.2}px) rotate(${scrollY * 0.02}deg)` }}
          />
          {/* Bottom Right Blob */}
          <div
            className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-pink-50 to-orange-50 blur-3xl opacity-60 transition-transform duration-1000 ease-out"
            style={{ transform: `translateY(${scrollY * 0.1}px) rotate(${scrollY * -0.02}deg)` }}
          />

          {/* Floating Slide Cards */}
          <div
            className="absolute top-32 left-[10%] w-48 h-32 bg-white rounded-lg shadow-xl border border-gray-100 transform -rotate-6 opacity-80 hidden lg:block transition-transform duration-75"
            style={{ transform: `translateY(${scrollY * -0.3}px) rotate(-6deg)` }}
          >
            <div className="p-4 space-y-2">
              <div className="w-1/2 h-3 bg-gray-100 rounded" />
              <div className="w-3/4 h-2 bg-gray-50 rounded" />
              <div className="w-full h-16 bg-blue-50 rounded mt-2" />
            </div>
          </div>

          <div
            className="absolute bottom-40 right-[10%] w-56 h-40 bg-white rounded-lg shadow-xl border border-gray-100 transform rotate-3 opacity-80 hidden lg:block transition-transform duration-75"
            style={{ transform: `translateY(${scrollY * -0.4}px) rotate(3deg)` }}
          >
            <div className="p-4 flex gap-2 h-full">
              <div className="w-1/3 h-full bg-gray-50 rounded" />
              <div className="flex-1 space-y-2">
                <div className="w-full h-3 bg-gray-100 rounded" />
                <div className="w-2/3 h-2 bg-gray-50 rounded" />
                <div className="w-full h-20 bg-purple-50 rounded mt-2" />
              </div>
            </div>
          </div>
        </div>

        <div ref={heroRef} className="max-w-5xl mx-auto text-center relative z-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-sm text-blue-700 font-medium mb-8 shadow-sm transition-all duration-1000"
            style={{
              transform: `translateY(${scrollY * -0.1}px)`,
              opacity: loadingStage === 4 ? 1 : 0
            }}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Powered by Actalyst
          </div>

          <h1
            className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 text-gray-900 transition-all duration-1000 delay-100"
            style={{
              transform: `translateY(${scrollY * -0.05}px)`,
              opacity: loadingStage === 4 ? 1 : 0
            }}
          >
            The Modern Way to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Build Slides.
            </span>
          </h1>

          <p
            className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed transition-all duration-1000 delay-200"
            style={{
              transform: `translateY(${scrollY * 0.05}px)`,
              opacity: loadingStage === 4 ? Math.max(0, 1 - scrollY / 400) : 0
            }}
          >
            A powerful, React-based presentation editor.
            Visualize data, customize themes, and design with pixel-perfect precision.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24 transition-all duration-1000 delay-300"
            style={{
              transform: `translateY(${scrollY * 0.1}px)`,
              opacity: loadingStage === 4 ? 1 : 0
            }}
          >
            <button
              onClick={handleEnterApp}
              className="group relative px-8 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg hover:bg-blue-700 transition-all hover:shadow-xl hover:shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0 min-w-[200px] overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Creating Free
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>

          {/* App Mockup / Browser Window */}
          <div
            ref={mockupRef}
            className="relative mx-auto max-w-6xl rounded-xl bg-white shadow-2xl border border-gray-200/60 overflow-hidden transform transition-all duration-1000 delay-500 hover:scale-[1.005]"
            style={{
              transform: `translateY(${scrollY * 0.15}px) perspective(1000px) rotateX(${Math.max(0, 2 - scrollY * 0.01)}deg)`,
              opacity: loadingStage === 4 ? Math.min(1, 0.8 + scrollY * 0.001) : 0
            }}
          >
            {/* Browser Chrome */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 text-center">
                <div className="inline-block px-3 py-1 bg-white rounded-md border border-gray-200 text-xs text-gray-400 font-medium shadow-sm flex items-center justify-center gap-2">
                  <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  ppt-slider.app
                </div>
              </div>
            </div>
            {/* App Preview Content */}
            <div className="aspect-[16/10] bg-white relative overflow-hidden group">
              <div className="absolute inset-0 bg-slate-50 flex">
                {/* Sidebar */}
                <div className="w-64 border-r border-gray-200 bg-white flex flex-col hidden md:flex">
                  <div className="p-4 border-b border-gray-100">
                    <div className="h-8 w-3/4 bg-gray-100 rounded-md" />
                  </div>
                  <div className="flex-1 p-4 space-y-4 overflow-hidden">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="aspect-video w-full bg-white rounded-lg border border-gray-200 shadow-sm p-2 hover:border-blue-400 transition-colors">
                        <div className="w-full h-full bg-gray-50 rounded-sm" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Main Canvas */}
                <div className="flex-1 bg-gray-100/50 p-8 flex items-center justify-center relative overflow-hidden">
                  {/* Grid Pattern */}
                  <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.5 }}></div>

                  {/* Slide Canvas */}
                  <div className="w-[90%] aspect-video bg-white rounded shadow-lg border border-gray-200 p-12 relative">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Q4 Performance Review</h1>
                    <div className="flex gap-8 mt-8">
                      <div className="flex-1 space-y-4">
                        <div className="h-4 bg-gray-100 rounded w-full" />
                        <div className="h-4 bg-gray-100 rounded w-5/6" />
                        <div className="h-4 bg-gray-100 rounded w-4/6" />
                      </div>
                      <div className="w-1/3 h-40 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-center">
                        <div className="text-blue-400 font-medium">Chart Area</div>
                      </div>
                    </div>

                    {/* Selection Box Mockup */}
                    <div className="absolute top-10 left-10 right-10 bottom-10 border-2 border-blue-500/0 group-hover:border-blue-500/20 rounded-lg transition-colors pointer-events-none" />
                  </div>
                </div>
                {/* Right Panel */}
                <div className="w-64 border-l border-gray-200 bg-white p-4 space-y-6 hidden lg:block">
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-gray-400 uppercase">Text Style</div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-gray-100 rounded" />
                      <div className="h-8 w-8 bg-gray-100 rounded" />
                      <div className="h-8 w-8 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-gray-400 uppercase">Layout</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-16 bg-gray-50 rounded border border-gray-100" />
                      <div className="h-16 bg-gray-50 rounded border border-gray-100" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover Overlay CTA */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center cursor-pointer" onClick={handleEnterApp}>
                <div className="px-6 py-3 bg-white rounded-full shadow-xl transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 font-medium text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Click to Edit
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section ref={featuresRef} className="py-32 px-6 bg-white relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need.</h2>
            <p className="text-xl text-gray-500">Powerful features wrapped in a simple interface.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Formatting",
                desc: "Focus on your content. We handle the alignment, spacing, and layout automatically.",
                icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
                bg: "bg-blue-50",
                text: "text-blue-600"
              },
              {
                title: "Image Support",
                desc: "Easily insert images into your slides to make them pop.",
                icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
                bg: "bg-purple-50",
                text: "text-purple-600"
              },
              {
                title: "Interactive Charts",
                desc: "Visualize your data with beautiful, customizable charts directly in your slides.",
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                bg: "bg-pink-50",
                text: "text-pink-600"
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-500 border border-transparent hover:border-gray-200 group hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`w-12 h-12 ${feature.bg} ${feature.text} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <AppIcon className="w-5 h-5 text-gray-400" />
            <span>© 2024 PPT-Slider Inc.</span>
          </div>
          <div className="flex gap-8 items-center">
            <span className="cursor-default hover:text-gray-900 transition-colors flex items-center gap-1">
              Powered by <span className="font-semibold text-gray-700">Actalyst</span>
            </span>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <span className="cursor-default hover:text-gray-900 transition-colors">v2.0.0</span>
          </div>
        </div>
      </footer>

      {/* Loading Overlay (Enter App) */}
      {isLoading && (
        <div className="fixed inset-0 z-[200] bg-white/90 backdrop-blur-sm flex items-center justify-center transition-opacity duration-500">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-4 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
                <AppIcon className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="text-sm font-medium text-gray-500 tracking-widest uppercase animate-pulse">Loading Editor</div>
          </div>
        </div>
      )}
    </div>
  )
}
