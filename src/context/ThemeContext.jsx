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
        // Dark theme - white backgrounds with black elements
        mainBg: 'bg-white',
        cardBg: 'bg-white',
        slideBg: 'bg-white',
        toolbarBg: 'linear-gradient(135deg, #000000 0%, #404040 50%, #7f7f7f 100%)',
        sidebarBg: 'linear-gradient(135deg, #000000 0%, #404040 50%, #7f7f7f 100%)',
        text: 'text-gray-900',
        textSecondary: 'text-gray-700',
        textMuted: 'text-gray-600',
        border: 'border-gray-300',
        accent: 'bg-gray-900',
        accentHover: 'hover:bg-gray-800',
        shadow: 'shadow-xl',
        // Toolbar specific colors for dark theme
        toolbarText: 'text-white',
        toolbarTextSecondary: 'text-gray-200',
        toolbarTextMuted: 'text-gray-300',
        // Glassmorphism button styles
        glassButton: 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300',
        glassButtonActive: 'bg-blue text-black backdrop-blur-md border-2 border-black shadow-xl',
        glassButtonDisabled: 'bg-white/5 backdrop-blur-md border border-white/10 opacity-50 cursor-not-allowed',
        // Element colors (black theme)
        elementText: '#000000',
        elementBorder: '#333333',
        elementBg: '#f8f9fa'
      }
    } else {
      return {
        // Light theme - current colorful design
        mainBg: 'bg-gray-50',
        cardBg: 'bg-white',
        slideBg: 'bg-white',
        toolbarBg: 'linear-gradient(135deg, #A7AAE1 0%, #FDAAAA 100%)',
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
        // Glassmorphism button styles for light theme
        glassButton: 'bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 hover:border-white/40 transition-all duration-300 shadow-sm',
        glassButtonActive: 'bg-black text-white backdrop-blur-md border border-white/40 shadow-md',
        glassButtonDisabled: 'bg-white/10 backdrop-blur-md border border-white/20 opacity-50 cursor-not-allowed',
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