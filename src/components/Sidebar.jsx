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
        {state.slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => dispatch({ type: 'SET_CURRENT_SLIDE', id: s.id })}
            className={`w-full text-left group ${state.currentSlideId === s.id ? 'ring-2 ring-white' : ''}`}
          >
            <div className="bg-white rounded-lg border border-gray-200 shadow-soft overflow-hidden">
              <div className="aspect-video bg-white flex items-center justify-center text-gray-400 text-sm">
                Slide {i + 1}
              </div>
            </div>
            <div className="mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              <button className="text-xs px-2 py-1 rounded text-white hover:bg-white/20" onClick={(e)=>{e.stopPropagation(); dispatch({type:'DUPLICATE_SLIDE', id:s.id})}}>Duplicate</button>
              <button className="text-xs px-2 py-1 rounded text-white hover:bg-white/20" onClick={(e)=>{e.stopPropagation(); dispatch({type:'DELETE_SLIDE', id:s.id})}}>Delete</button>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
