import React, { useState } from 'react'

export default function NavigationTabs({ activeTab, onTabChange, fileName = 'Untitled Presentation' }) {
  const tabs = ['File', 'Home', 'Insert', 'Design']

  return (
    <div className="w-full border-b border-gray-300" style={{ backgroundColor: '#ADB2D4'}}>
      <div className="flex items-center px-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab
                ? 'text-white'
                : 'text-gray-100 hover:text-white hover:bg-white/10'
            }`}
            style={activeTab === tab ? { borderBottom: '3px solid #B45253' } : {}}
          >
            {tab}
          </button>
        ))}
        
        <div className="flex-1 flex justify-center">
          <span className="text-white text-sm font-medium px-4 py-2">
            {fileName}
          </span>
        </div>
      </div>
    </div>
  )
}
