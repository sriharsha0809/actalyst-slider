import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext.jsx'
import Toolbar from './Toolbar.jsx'

export default function NavigationTabs({ activeTab, onTabChange, fileName = 'Untitled Presentation', isSidebarOpen, onToggleSidebar, onPresent, onSlideShow }) {
  const { theme, toggleTheme, getThemeColors } = useTheme()
  const colors = getThemeColors()
  const isDark = theme === 'dark'
  const tabs = ['File', 'Insert']

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
    <div className={`w-full pt-2 transition-all duration-500 ease-in-out`} style={{
      background: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)'
    }}>
      <div className="flex items-center px-4 relative w-full">
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

        {/* Navigation Tabs removed per request */}
        
        {/* File Name */}
        <div className="absolute left-1/2 -translate-x-1/2 animate-fadeIn" style={{animationDelay: '0.5s'}}>
          <span className={`${colors.toolbarText} text-sm font-medium px-4 py-2`}>
            {fileName}
          </span>
        </div>
      </div>
      {/* Toolbar row placed below the existing nav elements */}
      <div className="w-full" style={{ background: 'transparent' }}>
        <Toolbar 
          activeTab={activeTab}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={onToggleSidebar}
          onPresent={onPresent}
          onSlideShow={onSlideShow}
        />
      </div>
    </div>
  )
}
