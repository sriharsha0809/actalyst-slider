import React from 'react'
import { useSlides } from '../context/SlidesContext.jsx'

export default function Sidebar() {
  const { state, dispatch } = useSlides()

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-white/20">
        <div className="text-sm text-white font-medium">Slides</div>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {state.slides.map((s, i) => {
          const isActive = state.currentSlideId === s.id
          const thumbnailStyle = isActive
            ? {
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.55)',
                boxShadow: '0 12px 24px rgba(17, 25, 40, 0.25)',
              }
            : {
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.05))',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                boxShadow: '0 10px 30px rgba(17, 25, 40, 0.18)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }

          return (
          <div key={s.id} className={`w-full group ${isActive ? 'ring-2 ring-white/80 rounded-lg' : ''}`}>
            <button
              onClick={() => dispatch({ type: 'SET_CURRENT_SLIDE', id: s.id })}
              className="w-full text-left"
            >
              <div
                className="rounded-lg overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
                style={thumbnailStyle}
              >
                <div className="aspect-video flex items-center justify-center text-gray-100 text-sm font-medium">
                  Slide {i + 1}
                </div>
              </div>
            </button>
            <div className="mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              <button className="text-xs px-2 py-1 rounded text-white hover:bg-white/20" onClick={(e)=>{e.stopPropagation(); dispatch({type:'DUPLICATE_SLIDE', id:s.id})}}>Duplicate</button>
              <button className="text-xs px-2 py-1 rounded text-white hover:bg-white/20" onClick={(e)=>{e.stopPropagation(); dispatch({type:'DELETE_SLIDE', id:s.id})}}>Delete</button>
            </div>
          </div>
        )})}
      </div>
    </div>
  )
}
