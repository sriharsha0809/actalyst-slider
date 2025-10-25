import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext.jsx'

export default function NavigationTabs({ activeTab, onTabChange, fileName = 'Untitled Presentation' }) {
  const { theme, toggleTheme, getThemeColors } = useTheme()
  const colors = getThemeColors()
  const tabs = ['File', 'Home', 'Insert', 'Design']
  const [isThemeChanging, setIsThemeChanging] = useState(false)

  const handleThemeToggle = () => {
    setIsThemeChanging(true)
    toggleTheme()
    // Reset animation after transition completes
    setTimeout(() => {
      setIsThemeChanging(false)
    }, 500)
  }

  const activeTabStyle = {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.12))',
    boxShadow: '0 8px 20px rgba(31, 38, 135, 0.25)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: '1px solid rgba(255, 255, 255, 0.35)',
    borderBottom: '3px solid rgba(255, 255, 255, 0.6)',
  }

  const inactiveTabStyle = {
    border: '1px solid rgba(255, 255, 255, 0.18)',
  }

  return (
    <div className="w-full border-b border-gray-300 pt-2 transition-all duration-500 ease-in-out" style={{ background: colors.toolbarBg }}>
      <div className="flex items-center px-4">
        {/* PPT-Slider Logo */}
        <div className="flex items-center gap-3 mr-6 animate-slideInLeft">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="animate-pulse">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          <span className={`${colors.toolbarText} font-bold text-lg tracking-wide animate-fadeIn`}>
            PPT-Slider
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 animate-slideInDown" style={{animationDelay: '0.2s'}}>
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-6 py-3 text-sm font-medium transition-all duration-300 relative rounded-full transform hover:scale-105 animate-slideInDown ${
                activeTab === tab
                  ? `${colors.toolbarText} shadow-lg`
                  : `${colors.toolbarTextSecondary} hover:${colors.toolbarText} hover:bg-white/10`
              }`}
              style={{
                ...(activeTab === tab ? activeTabStyle : inactiveTabStyle),
                animationDelay: `${0.1 * (index + 1)}s`
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* File Name */}
        <div className="flex-1 flex justify-center animate-fadeIn" style={{animationDelay: '0.5s'}}>
          <span className={`${colors.toolbarText} text-sm font-medium px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20`}>
            {fileName}
          </span>
        </div>

        {/* Theme Toggle */}
        <div className="animate-slideInRight" style={{animationDelay: '0.3s'}}>
          <button
            onClick={handleThemeToggle}
            className={`p-3 rounded-full ${colors.toolbarText} transition-all duration-500 transform ${
              isThemeChanging ? 'scale-110 rotate-180' : 'scale-100 rotate-0'
            }`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? (
              // Moon icon for dark mode
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="animate-spin-slow">
                <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
              </svg>
            ) : (
              // Sun icon for light mode
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="animate-spin-slow">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
