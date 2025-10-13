import React, { useState } from 'react'
import { useSlides } from '../context/SlidesContext.jsx'

export default function SlideReorder() {
  const { state, dispatch } = useSlides()
  const [draggedIndex, setDraggedIndex] = useState(null)

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) return

    dispatch({ 
      type: 'REORDER_SLIDES', 
      fromIndex: draggedIndex, 
      toIndex: dropIndex 
    })
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const moveSlideUp = (index) => {
    if (index <= 0) return
    dispatch({ 
      type: 'REORDER_SLIDES', 
      fromIndex: index, 
      toIndex: index - 1 
    })
  }

  const moveSlideDown = (index) => {
    if (index >= state.slides.length - 1) return
    dispatch({ 
      type: 'REORDER_SLIDES', 
      fromIndex: index, 
      toIndex: index + 1 
    })
  }

  return (
    <div className="h-full flex flex-col">
      <h3 className="font-semibold text-lg mb-3">Reorder Slides</h3>
      <p className="text-xs text-gray-600 mb-4">Drag slides to reorder or use arrow buttons</p>
      
      <div className="flex-1 overflow-y-auto space-y-2">
        {state.slides.map((slide, index) => (
          <div
            key={slide.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              border-2 rounded-lg p-2 cursor-move transition-all
              ${draggedIndex === index ? 'opacity-50 border-dashed' : 'border-gray-300'}
              ${state.currentSlideId === slide.id ? 'border-brand-500 bg-brand-50' : 'hover:border-brand-300'}
            `}
          >
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveSlideUp(index)}
                  disabled={index === 0}
                  className={`p-1 rounded ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                  title="Move Up"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 15l-6-6-6 6"/>
                  </svg>
                </button>
                <button
                  onClick={() => moveSlideDown(index)}
                  disabled={index === state.slides.length - 1}
                  className={`p-1 rounded ${index === state.slides.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                  title="Move Down"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
              </div>
              
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                      #{index + 1}
                    </span>
                    <span>{slide.name}</span>
                  </div>
                </div>
                <div 
                  className="w-full aspect-video rounded border border-gray-200 overflow-hidden"
                  style={{ background: slide.background || '#ffffff' }}
                >
                  <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">
                    {slide.elements.length} element{slide.elements.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
