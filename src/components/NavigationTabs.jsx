import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext.jsx'

export default function NavigationTabs({ activeTab, onTabChange, fileName = 'Untitled Presentation' }) {
  const { theme, toggleTheme, getThemeColors } = useTheme()
  const colors = getThemeColors()
  const isDark = theme === 'dark'
  const tabs = ['File', 'Home', 'Insert', 'Design']

  const [spinning, setSpinning] = useState(false)
  const handleThemeToggle = () => {
    if (spinning) return
    setSpinning(true)
    setTimeout(() => {
      toggleTheme()
      setSpinning(false)
    }, 600)
  }

  const activeTabStyle = {
    background: 'transparent',
    boxShadow: 'none',
    border: 'none',
    borderBottom: '2px solid currentColor',
  }

  const inactiveTabStyle = {
    borderBottom: '2px solid transparent',
  }

  return (
    <div className={`w-full border-b pt-2 transition-all duration-500 ease-in-out ${colors.border}`} style={{ background: isDark ? colors.toolbarBg : '#F0F0F0' }}>
      <div className="flex items-center px-4">
        {/* PPT-Slider Logo */}
        <div className="flex items-center gap-3 mr-6 animate-slideInLeft">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-300 bg-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="black">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          <span className={`${isDark ? 'text-white' : 'text-black'} font-bold text-lg tracking-wide animate-fadeIn`}>
            PPT-Slider
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 animate-slideInDown" style={{animationDelay: '0.2s'}}>
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 relative animate-slideInDown ${isDark ? 'rounded-md' : ''} ${
                activeTab === tab
                  ? `${colors.toolbarText} ${isDark ? 'bg-white/10 backdrop-blur-md' : ''}`
                  : `${colors.toolbarTextSecondary} hover:${colors.toolbarText} ${isDark ? 'hover:bg-white/10 backdrop-blur-md' : ''}`
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
          <span className={`${colors.toolbarText} text-sm font-medium px-4 py-2 rounded border ${isDark ? 'border-white/20 bg-white/5 backdrop-blur' : 'border-gray-300 bg-white'}`}>
            {fileName}
          </span>
        </div>

        {/* Theme Toggle */}
        <div>
          <button
            onClick={handleThemeToggle}
            disabled={spinning}
            className={`p-3 rounded-full ${colors.toolbarText} transition-transform duration-300 hover:scale-110 focus:scale-110 ${spinning ? 'opacity-80' : ''}`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? (
              // Moon icon for dark mode
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={`transition-transform duration-500 ${spinning ? 'animate-spin-slow' : ''}`}>
                <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
              </svg>
            ) : (
              // Sun icon for light mode
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={`transition-transform duration-500 ${spinning ? 'animate-spin-slow' : ''}`}>
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
