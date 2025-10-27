import React, { useState } from 'react'
import { SlidesProvider, useSlides } from './context/SlidesContext.jsx'
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import NavigationTabs from './components/NavigationTabs.jsx'
import SlidePreview from './components/SlidePreview.jsx'
import SlideCanvas from './components/SlideCanvas.jsx'
import Toolbar from './components/Toolbar.jsx'
import ShapeToolbox from './components/ShapeToolbox.jsx'
import ChartEditor from './components/ChartEditor.jsx'
import SlideReorder from './components/SlideReorder.jsx'
import PresentationModal from './components/PresentationModal.jsx'
import FileMenu from './components/FileMenu.jsx'
import LandingPage from './components/LandingPage.jsx'

function AppContent() {
  const [showLandingPage, setShowLandingPage] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [presenting, setPresenting] = useState(false)
  const [presentationMode, setPresentationMode] = useState(null) // 'manual' or 'auto'
  const [activeTab, setActiveTab] = useState('Home')
  const [showFileMenu, setShowFileMenu] = useState(false)
  const [fileName, setFileName] = useState('Untitled Presentation')
  
  const { getThemeColors } = useTheme()
  const colors = getThemeColors()

  const handleFileOpen = (newFileName) => {
    setFileName(newFileName)
  }

  const handleSave = (savedFileName) => {
    setFileName(savedFileName)
  }

  const handleEnterApp = () => {
    setShowLandingPage(false)
  }

  // Show landing page first
  if (showLandingPage) {
    return <LandingPage onEnterApp={handleEnterApp} />
  }

  return (
    <SlidesProvider>
      <div className={`flex h-dvh w-dvw overflow-hidden flex-col transition-all duration-500 ${colors.mainBg}`}>
        {/* Navigation Tabs */}
        <NavigationTabs 
          activeTab={activeTab}
          fileName={fileName}
          onTabChange={(tab) => {
            setActiveTab(tab)
            if (tab === 'File') {
              setShowFileMenu(true)
            } else {
              setShowFileMenu(false)
            }
          }} 
        />

        <div className="flex flex-1 min-h-0">
          {/* Sidebar - Responsive width */}
          <div className={`${showSidebar ? 'w-64 responsive-sidebar-left' : 'w-0'} transition-all duration-500 border-r ${colors.border} overflow-hidden ${colors.shadow} animate-slideInLeft`} style={{ background: colors.sidebarBg }}>
            <Sidebar />
          </div>

          {/* Main Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Toolbar */}
            <Toolbar 
              activeTab={activeTab}
              onToggleSidebar={() => setShowSidebar(s => !s)} 
              onPresent={() => {
                setPresenting(true)
                setPresentationMode('manual')
              }}
              onSlideShow={() => {
                setPresenting(true) 
                setPresentationMode('auto')
              }}
            />

            {/* Canvas + Shape toolbox - Responsive grid */}
            <div className={`flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 responsive-toolbar-gap px-6 pt-6 transition-all duration-500 ${colors.mainBg}`} style={{ paddingBottom: '30px' }}>
              <div className={`${colors.cardBg} rounded-lg ${colors.shadow} p-1 overflow-hidden animate-slideInUp`} style={{animationDelay: '0.2s'}}>
                <SlideCanvas />
              </div>
              <SidePanel activeTab={activeTab} />
            </div>
          </div>
        </div>
      </div>

      {presenting && (
        <PresentationModal 
          mode={presentationMode}
          onClose={() => {
            setPresenting(false)
            setPresentationMode(null)
          }} 
        />
      )}
      <FileMenu 
        isOpen={showFileMenu} 
        onClose={() => { setShowFileMenu(false); setActiveTab('Home'); }} 
        onFileOpen={handleFileOpen}
        onSave={handleSave}
      />
    </SlidesProvider>
  )
}

function SidePanel({ activeTab }) {
  const { state } = useSlides()
  const currentSlide = state.slides.find(s => s.id === state.currentSlideId)
  const selected = currentSlide?.elements.find(e => e.id === state.selectedElementId)
  const { getThemeColors } = useTheme()
  const colors = getThemeColors()

  let panel = null
  if (selected && (selected.type === 'table' || selected.type === 'chart')) {
    panel = <ChartEditor />
  } else if (activeTab === 'Insert') {
    panel = <ChartEditor />
  } else if (activeTab === 'Design') {
    panel = <SlideReorder />
  } else {
    panel = <ShapeToolbox />
  }

  return (
    <div className={`${colors.cardBg} rounded-xl p-4 order-first lg:order-none overflow-y-auto animate-slideInRight responsive-sidebar-right`} style={{ boxShadow: '0 0 30px rgba(0, 0, 0, 0.15)', maxHeight: 'calc(100vh - 30px - 100px)', animationDelay: '0.4s', width: 'auto' }}>
      {panel}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
