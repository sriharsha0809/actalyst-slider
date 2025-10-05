import React from 'react'
import { useSlides } from '../context/SlidesContext.jsx'

export default function SlidePreview() {
  const { state, dispatch } = useSlides()
  return (
    <div className="px-4 py-3 overflow-x-auto scrollbar-thin bg-gray-50">
      <div className="flex items-center gap-4">
        {state.slides.map((s, i) => (
          <button 
            key={s.id} 
            onClick={() => dispatch({ type: 'SET_CURRENT_SLIDE', id: s.id })}
            className={`min-w-[160px] aspect-video rounded-lg transition-all ${
              state.currentSlideId === s.id 
                ? 'ring-2 ring-brand-500 shadow-lg' 
                : 'hover:ring-2 hover:ring-gray-300 shadow-md'
            } bg-white relative group`}
          >
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
              Slide {i + 1}
            </div>
            <div className="absolute bottom-1 right-2 text-xs text-gray-500 bg-white px-1.5 py-0.5 rounded">
              {i + 1}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
