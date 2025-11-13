import React, { useState } from 'react'
import { SlidesProvider, useSlides } from './context/SlidesContext.jsx'
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import NavigationTabs from './components/NavigationTabs.jsx'
import SlidePreview from './components/SlidePreview.jsx'
import SlideCanvas from './components/SlideCanvas.jsx'
import Toolbar from './components/Toolbar.jsx'
import ShapeToolbox from './components/ShapeToolbox.jsx'
import ChartSidebar from './components/ChartSidebar.jsx'
import PresentationModal from './components/PresentationModal.jsx'
import SymbolStylePanel from './components/SymbolStylePanel.jsx'
import TextStylePanel from './components/TextStylePanel.jsx'
import BgImagePanel from './components/BgImagePanel.jsx'
import TableStylePanel from './components/TableStylePanel.jsx'
import FileMenu from './components/FileMenu.jsx'
import LandingPage from './components/LandingPage.jsx'
import SimpleChartEditor from './components/SimpleChartEditor.jsx'

function AppContent() {
  const [showLandingPage, setShowLandingPage] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [presenting, setPresenting] = useState(false)
  const [presentationMode, setPresentationMode] = useState(null) // 'manual' or 'auto'
  const [activeTab, setActiveTab] = useState('Home')
  const [showFileMenu, setShowFileMenu] = useState(false)
  const [fileName, setFileName] = useState('Untitled Presentation')
  
  // Chart editor state at App level
  const [chartEditorState, setChartEditorState] = useState({
    isOpen: false,
    chartType: null,
    chartData: null,
    chartId: null
  })
  
  const { getThemeColors, isDark } = useTheme()
  const colors = getThemeColors()
  
  // Listen for chart editor open requests
  React.useEffect(() => {
    const handleOpenChartEditor = (e) => {
      console.log('[App] Opening chart editor:', e.detail)
      setChartEditorState({
        isOpen: true,
        chartId: e.detail.chartId,
        chartType: e.detail.chartType,
        chartData: e.detail.chartData
      })
    }
    window.addEventListener('openChartEditor', handleOpenChartEditor)
    
    // Set up global function
    window.openChartEditor = (chartId, chartType, chartData) => {
      console.log('[App] window.openChartEditor called:', { chartId, chartType, chartData })
      window.dispatchEvent(new CustomEvent('openChartEditor', { 
        detail: { chartId, chartType, chartData } 
      }))
    }
    
    return () => {
      window.removeEventListener('openChartEditor', handleOpenChartEditor)
      delete window.openChartEditor
    }
  }, [])

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
      <div className={`flex h-dvh w-dvw overflow-hidden flex-col transition-all duration-500 ${colors.mainBg}`} style={{ backgroundColor: isDark ? '#000000' : '#f2f2f2' }}>
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
          <div className={`${showSidebar ? 'w-64 responsive-sidebar-left' : 'w-0'} transition-all duration-500 border-r ${colors.border} overflow-hidden ${colors.shadow} animate-slideInLeft`} style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F0F0F0' }}>
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
            <div className={`flex-1 min-h-0 grid grid-cols-[1fr_320px] gap-4 responsive-toolbar-gap pl-6 pr-0 pt-6 transition-all duration-500`} style={{ paddingBottom: '30px', backgroundColor: isDark ? '#000000' : '#f2f2f2' }}>
              <div className={`rounded-lg overflow-hidden animate-slideInUp`} style={{animationDelay: '0.2s', backgroundColor: '#f2f2f2'}}>
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
      
      {/* Global Chart Editor */}
      <SimpleChartEditor
        isOpen={chartEditorState.isOpen}
        chartType={chartEditorState.chartType}
        chartData={chartEditorState.chartData}
        onDataChange={(newData) => {
          console.log('[App] Chart data changed:', newData)
          // Update chart via custom event
          if (chartEditorState.chartId) {
            const primary = newData?.series?.[0]?.data || []
            const cats = newData?.categories || []
            const patch = { structuredData: newData, data: primary, labels: cats }
            console.log('[App] Dispatching updateElement with patch:', patch)
            window.dispatchEvent(new CustomEvent('updateElement', { 
              detail: { id: chartEditorState.chartId, patch } 
            }))
          }
        }}
        onClose={() => setChartEditorState({ isOpen: false, chartType: null, chartData: null, chartId: null })}
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

  // Detect active text editing session (RichTextEditor mounted)
  const isTextEditing = !!(typeof window !== 'undefined' && window.currentTextEditorRef && window.currentTextEditorRef.current && window.currentTextEditorRef.current.editorNode)

  const isSymbol = selected && [
    'rect','square','circle','triangle','diamond','star','message',
    'roundRect','parallelogram','trapezoid','pentagon','hexagon','octagon','chevron','arrowRight','cloud'
  ].includes(selected.type)
  const isTableLike = !!(selected && ((selected.type === 'table') || (Array.isArray(selected.cells) && typeof selected.rows === 'number' && typeof selected.cols === 'number')))

  let panel = null

  const hasBgImage = !!(currentSlide && typeof currentSlide.background === 'object' && currentSlide.background.type === 'image')

  if (activeTab === 'Home') {
    // Home: show styles for selected element, but do NOT show text tools on Home
    if (selected) {
      if (isTableLike) {
        panel = <TableStylePanel />
      } else if (selected.type === 'chart') {
        panel = <ChartSidebar />
      } else if (isSymbol) {
        panel = <SymbolStylePanel />
      } else if (selected.type === 'text') {
        // On Home tab, keep Slide Layouts visible when a text box is selected (no text tools here)
        panel = <ShapeToolbox />
      }
    }
    // If nothing selected, show Slide Layouts
    if (!panel) panel = <ShapeToolbox />
  } else if (activeTab === 'Insert') {
    if (selected) {
      if (isTableLike) {
        panel = <TableStylePanel />
      } else if (selected.type === 'chart') {
        panel = <ChartSidebar />
      } else if (selected.type === 'text') {
        panel = <TextStylePanel />
      } else if (isSymbol) {
        panel = <SymbolStylePanel />
      }
    }
    // If nothing selected in Insert: show BG image tools if active; otherwise Slide Layouts
    if (!panel) panel = hasBgImage ? <BgImagePanel /> : <ShapeToolbox />
  } else if (activeTab === 'Design') {
    if (selected) {
      if (isTableLike) {
        panel = <TableStylePanel />
      } else if (selected.type === 'chart') {
        panel = <ChartSidebar />
      } else if (selected.type === 'text') {
        panel = <TextStylePanel />
      } else if (isSymbol) {
        panel = <SymbolStylePanel />
      }
    }
    if (!panel) panel = <ShapeToolbox />
  } else {
    // Other tabs fallback
    if (selected) {
      if (selected.type === 'table') panel = <TableStylePanel />
      else if (selected.type === 'chart') panel = <ChartSidebar />
      else if (selected.type === 'text') panel = <TextStylePanel />
      else if (isSymbol) panel = <SymbolStylePanel />
    }
    if (!panel) panel = <ShapeToolbox />
  }

  // Compute a key to re-mount and animate when tool changes
  const panelType = (() => {
    if (isTableLike) return 'table'
    if (selected?.type === 'chart') return 'chart'
    if (isSymbol) return 'symbol'
    if (selected?.type === 'text' && (activeTab === 'Insert' || activeTab === 'Design')) return 'textStyle'
    if (!selected && hasBgImage && activeTab === 'Insert') return 'bgImage'
    return 'shapeToolbox'
  })()
  // Only animate when the actual tool component changes
  const panelKey = panelType

  const [loading, setLoading] = React.useState(false)
  const animCycle = React.useRef(['animate-slideInRight','animate-slideInUp'])
  const [animIndex, setAnimIndex] = React.useState(0)

  React.useEffect(() => {
    // Only animate when the panelKey actually changes
    setLoading(true)
    // rotate animation for smooth variation
    setAnimIndex((i) => (i + 1) % animCycle.current.length)
    const t = setTimeout(() => setLoading(false), 220) // brief shimmer
    return () => clearTimeout(t)
  }, [panelKey])

  const animClass = `${animCycle.current[animIndex]} animate-fadeIn`

  return (
    <div className={`${colors.cardBg} rounded-xl p-4 overflow-y-auto responsive-sidebar-right sidebar-scroll`} style={{ boxShadow: '0 0 30px rgba(0, 0, 0, 0.15)', maxHeight: 'calc(100vh - 30px - 100px)', minWidth: '280px' }}>
      <div key={panelKey}>
        {loading ? (
          <div className="space-y-3">
            <div className="skeleton-line h-5 w-1/3" />
            <div className="skeleton-rect h-16 w-full rounded" />
            <div className="skeleton-line h-4 w-1/2" />
            <div className="grid grid-cols-2 gap-3">
              <div className="skeleton-rect h-24 w-full rounded" />
              <div className="skeleton-rect h-24 w-full rounded" />
            </div>
          </div>
        ) : (
          <div className={animClass} style={{ animationDuration: '2s' }}>
            {panel}
          </div>
        )}
      </div>
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
