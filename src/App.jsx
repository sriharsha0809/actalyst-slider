import React, { useState } from 'react'
import { SlidesProvider } from './context/SlidesContext.jsx'
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

export default function App() {
  const [showSidebar, setShowSidebar] = useState(true)
  const [presenting, setPresenting] = useState(false)
  const [activeTab, setActiveTab] = useState('Home')
  const [showFileMenu, setShowFileMenu] = useState(false)
  const [fileName, setFileName] = useState('Untitled Presentation')

  return (
    <SlidesProvider>
      <div className="flex h-dvh w-dvw overflow-hidden flex-col">
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
          {/* Sidebar */}
          <div className={(showSidebar ? 'w-64' : 'w-0') + ' transition-all duration-200 border-r border-gray-200 overflow-hidden shadow-lg'} style={{ background: 'linear-gradient(135deg, #A7AAE1 0%, #FDAAAA 100%)' }}>
            <Sidebar />
          </div>

          {/* Main Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Toolbar */}
            <Toolbar 
              activeTab={activeTab}
              onToggleSidebar={() => setShowSidebar(s => !s)} 
              onPresent={() => setPresenting(true)} 
            />

            {/* Canvas + Shape toolbox */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 px-6 pt-6" style={{ backgroundColor: '#E1E9C9', paddingBottom: '30px' }}>
              <div className="bg-white rounded-lg shadow-soft p-1 overflow-hidden">
                <SlideCanvas />
              </div>
              <div className="bg-white rounded-xl p-4 order-first lg:order-none overflow-y-auto" style={{ boxShadow: '0 0 30px rgba(0, 0, 0, 0.15)', maxHeight: 'calc(100vh - 30px - 100px)' }}>
                {activeTab === 'Insert' ? <ChartEditor /> : activeTab === 'Design' ? <SlideReorder /> : <ShapeToolbox />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {presenting && <PresentationModal onClose={() => setPresenting(false)} />}
      <FileMenu isOpen={showFileMenu} onClose={() => { setShowFileMenu(false); setActiveTab('Home'); }} />
    </SlidesProvider>
  )
}
