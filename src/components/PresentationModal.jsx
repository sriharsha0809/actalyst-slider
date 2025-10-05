import React, { useEffect } from 'react'
import { useSlides } from '../context/SlidesContext.jsx'

export default function PresentationModal({ onClose }) {
  const { state, dispatch } = useSlides()
  const idx = state.slides.findIndex(s => s.id === state.currentSlideId)

  const goToNext = () => {
    if (idx < state.slides.length - 1) {
      dispatch({ type: 'SET_CURRENT_SLIDE', id: state.slides[idx + 1].id })
    }
  }

  const goToPrevious = () => {
    if (idx > 0) {
      dispatch({ type: 'SET_CURRENT_SLIDE', id: state.slides[idx - 1].id })
    }
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' || e.key === 'PageDown') goToNext()
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') goToPrevious()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [idx, state.slides, dispatch, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose} style={{ background: 'linear-gradient(to bottom, #ADB2D4 0%, #FFCDB2 100%)' }}>
      <div className="relative w-[90vw] max-w-5xl aspect-video shadow-2xl" onClick={(e)=>e.stopPropagation()} style={{ padding: '3px', background: '#000000' }}>
        <div className="w-full h-full bg-white overflow-hidden">
          <SlideStage/>
        </div>
        
        {/* Navigation Buttons */}
        {idx > 0 && (
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all"
            title="Previous Slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}
        
        {idx < state.slides.length - 1 && (
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all"
            title="Next Slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        )}
        
        {/* Slide Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
          {idx + 1} / {state.slides.length}
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
          title="Exit Presentation (Esc)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  )
}

function SlideStage() {
  const { state } = useSlides()
  const slide = state.slides.find(s => s.id === state.currentSlideId)
  return (
    <div className="w-full h-full relative" style={{ background: slide?.background }}>
      {/* For simplicity, render a read-only clone of elements */}
      {slide?.elements.map(el => (
        <div key={el.id} className="absolute" style={{ left: el.x, top: el.y, width: el.w, height: el.h, transform: `rotate(${el.rotation}deg)` }}>
          {renderElement(el, true)}
        </div>
      ))}
    </div>
  )
}

function renderElement(el, readonly=false) {
  const bgColor = el.bgColor || 'transparent'
  switch (el.type) {
    case 'text':
      return (
        <div className="w-full h-full p-2" style={{ backgroundColor: bgColor, color: el.styles.color, fontSize: el.styles.fontSize, fontWeight: el.styles.bold ? 700 : 400, fontStyle: el.styles.italic ? 'italic' : 'normal', textDecoration: el.styles.underline ? 'underline' : 'none', textAlign: el.styles.align }}>
          {el.text}
        </div>
      )
    case 'rect':
      return <div className="w-full h-full rounded-md" style={{ background: el.fill, border: `2px solid ${el.stroke}` }} />
    case 'circle':
      return <div className="w-full h-full rounded-full" style={{ background: el.fill, border: `2px solid ${el.stroke}` }} />
    case 'arrow':
      return <div className="w-full h-3 bg-emerald-500" style={{ background: el.color }} />
    case 'image':
      return <img src={el.src} alt="" className="w-full h-full object-contain" draggable={false} />
    default:
      return null
  }
}
