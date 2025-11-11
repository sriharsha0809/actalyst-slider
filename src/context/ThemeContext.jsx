import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('ppt-slider-theme')
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme)
    }
  }, [])

  // Save theme to localStorage and update document class
  useEffect(() => {
    localStorage.setItem('ppt-slider-theme', theme)
    
    // Update document class for global theme changes
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  const getThemeColors = () => {
    if (theme === 'dark') {
      return {
        // Dark theme – black bg, white text
        mainBg: 'bg-black',
        cardBg: 'bg-neutral-900',
        slideBg: 'bg-black',
        toolbarBg: 'linear-gradient(135deg, #000000 0%, #1f1f1f 50%, #2b2b2b 100%)',
        sidebarBg: 'linear-gradient(135deg, #000000 0%, #1f1f1f 50%, #2b2b2b 100%)',
        text: 'text-white',
        textSecondary: 'text-gray-200',
        textMuted: 'text-gray-400',
        border: 'border-white/10',
        accent: 'bg-white',
        accentHover: 'hover:bg-white/10',
        shadow: 'shadow-xl',
        // Toolbar specific colors for dark theme
        toolbarText: 'text-white',
        toolbarTextSecondary: 'text-gray-300',
        toolbarTextMuted: 'text-gray-400',
        // Glassmorphism for dark theme (hover/active only)
        glassButton: 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors',
        glassButtonActive: 'bg-white/20 text-white border border-white/30 backdrop-blur-md ring-1 ring-white/30',
        glassButtonDisabled: 'bg-white/5 border border-white/10 opacity-50 cursor-not-allowed',
        // Element button glass (used on hover/selected for dark only)
        elementGlass: 'hover:bg-white/10 backdrop-blur-md border border-white/20',
        elementActiveGlass: 'bg-white/15 backdrop-blur-md ring-1 ring-white/30',
        // Element colors (for content rendering)
        elementText: '#ffffff',
        elementBorder: '#3f3f46',
        elementBg: '#0b0b0b'
      }
    } else {
      return {
        // Light theme - current colorful design
        mainBg: 'bg-gray-50',
        cardBg: 'bg-white',
        slideBg: 'bg-white',
        toolbarBg: '#E0E0E0',
        sidebarBg: 'linear-gradient(135deg, #A7AAE1 0%, #FDAAAA 100%)',
        text: 'text-gray-900',
        textSecondary: 'text-gray-700',
        textMuted: 'text-gray-600',
        border: 'border-gray-200',
        accent: 'bg-brand-500',
        accentHover: 'hover:bg-brand-600',
        shadow: 'shadow-soft',
        // Toolbar specific colors for light theme
        toolbarText: 'text-gray-900',
        toolbarTextSecondary: 'text-gray-700',
        toolbarTextMuted: 'text-gray-600',
        // Toolbar button styles (no glassmorphism)
        glassButton: 'bg-white border border-gray-300 hover:bg-gray-100 transition-colors',
        glassButtonActive: 'bg-black text-white border border-black',
        glassButtonDisabled: 'bg-gray-100 border border-gray-200 opacity-50 cursor-not-allowed',
        // Element colors
        elementText: '#111827',
        elementBorder: '#e5e7eb',
        elementBg: '#ffffff'
      }
    }
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      getThemeColors,
      isDark: theme === 'dark'
    }}>
      {children}
    </ThemeContext.Provider>
  )
}