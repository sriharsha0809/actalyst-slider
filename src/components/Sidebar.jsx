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
                <div className="aspect-video relative overflow-hidden">
                  <SlideThumbnail slide={s} slideNumber={i + 1} isActive={isActive} />
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

// SlideThumbnail component to render miniature version of slide content
function SlideThumbnail({ slide, slideNumber, isActive }) {
  const renderElement = (el, scale = 0.25) => {
    const elementStyle = {
      position: 'absolute',
      left: `${el.x * scale}px`,
      top: `${el.y * scale}px`,
      width: `${el.w * scale}px`,
      height: `${el.h * scale}px`,
      transform: `rotate(${el.rotation || 0}deg)`,
      pointerEvents: 'none'
    }

    switch (el.type) {
      case 'text':
        return (
          <div
            key={el.id}
            style={{
              ...elementStyle,
              backgroundColor: el.bgColor || 'transparent',
              color: el.styles?.color || '#111827',
              fontSize: `${(el.styles?.fontSize || 28) * scale}px`,
              fontWeight: el.styles?.bold ? 700 : 400,
              fontStyle: el.styles?.italic ? 'italic' : 'normal',
              textDecoration: el.styles?.underline ? 'underline' : 'none',
              textAlign: el.styles?.align || 'left',
              fontFamily: el.styles?.fontFamily || 'Inter, system-ui, sans-serif',
              display: 'flex',
              alignItems: el.styles?.valign === 'middle' ? 'center' : el.styles?.valign === 'bottom' ? 'flex-end' : 'flex-start',
              padding: `${2 * scale}px`,
              borderRadius: '2px',
              overflow: 'hidden',
              lineHeight: '1.2'
            }}
          >
            <div className="truncate text-[8px]" style={{ fontSize: `${Math.max((el.styles?.fontSize || 28) * scale, 6)}px` }}>
              {el.text || el.html || 'Text'}
            </div>
          </div>
        )
      
      case 'image':
        return (
          <div
            key={el.id}
            style={{
              ...elementStyle,
              backgroundImage: el.src ? `url(${el.src})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '2px'
            }}
          >
            {!el.src && (
              <div className="w-full h-full flex items-center justify-center text-gray-400" style={{ fontSize: '8px' }}>
                📷
              </div>
            )}
          </div>
        )
      
      case 'rect':
      case 'square':
        return (
          <div
            key={el.id}
            style={{
              ...elementStyle,
              backgroundColor: el.fill || '#fde68a',
              border: `${Math.max(1, 2 * scale)}px solid ${el.stroke || '#f59e0b'}`,
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: el.textColor || '#111827',
              fontSize: `${Math.max((el.fontSize || 16) * scale, 6)}px`,
              fontWeight: '500'
            }}
          >
            <span className="truncate" style={{ fontSize: `${Math.max((el.fontSize || 16) * scale, 6)}px` }}>
              {el.text || ''}
            </span>
          </div>
        )
      
      case 'circle':
        return (
          <div
            key={el.id}
            style={{
              ...elementStyle,
              backgroundColor: el.fill || '#ddd6fe',
              border: `${Math.max(1, 2 * scale)}px solid ${el.stroke || '#8b5cf6'}`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: el.textColor || '#111827',
              fontSize: `${Math.max((el.fontSize || 16) * scale, 6)}px`,
              fontWeight: '500'
            }}
          >
            <span className="truncate" style={{ fontSize: `${Math.max((el.fontSize || 16) * scale, 6)}px` }}>
              {el.text || ''}
            </span>
          </div>
        )
      
      case 'triangle':
        return (
          <div
            key={el.id}
            style={{
              ...elementStyle,
              backgroundColor: el.fill || '#fecaca',
              border: `${Math.max(1, 2 * scale)}px solid ${el.stroke || '#ef4444'}`,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: el.textColor || '#111827',
              fontSize: `${Math.max((el.fontSize || 16) * scale, 6)}px`,
              fontWeight: '500'
            }}
          >
            <span className="truncate" style={{ fontSize: `${Math.max((el.fontSize || 16) * scale, 6)}px` }}>
              {el.text || ''}
            </span>
          </div>
        )
      
      case 'diamond':
        return (
          <div
            key={el.id}
            style={{
              ...elementStyle,
              backgroundColor: el.fill || '#d8b4fe',
              border: `${Math.max(1, 2 * scale)}px solid ${el.stroke || '#8b5cf6'}`,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: el.textColor || '#111827',
              fontSize: `${Math.max((el.fontSize || 16) * scale, 6)}px`,
              fontWeight: '500'
            }}
          >
            <span className="truncate" style={{ fontSize: `${Math.max((el.fontSize || 16) * scale, 6)}px` }}>
              {el.text || ''}
            </span>
          </div>
        )
      
      case 'star':
        return (
          <div
            key={el.id}
            style={{
              ...elementStyle,
              backgroundColor: el.fill || '#fef3c7',
              border: `${Math.max(1, 2 * scale)}px solid ${el.stroke || '#f59e0b'}`,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: el.textColor || '#111827',
              fontSize: `${Math.max((el.fontSize || 16) * scale, 6)}px`,
              fontWeight: '500'
            }}
          >
            <span className="truncate" style={{ fontSize: `${Math.max((el.fontSize || 16) * scale, 6)}px` }}>
              {el.text || ''}
            </span>
          </div>
        )
      
      case 'message':
        return (
          <div key={el.id} style={elementStyle}>
            <div
              style={{
                width: '100%',
                height: '85%',
                backgroundColor: el.fill || '#d1fae5',
                border: `${Math.max(1, 2 * scale)}px solid ${el.stroke || '#10b981'}`,
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: el.textColor || '#111827',
                fontSize: `${Math.max((el.fontSize || 16) * scale, 6)}px`,
                fontWeight: '500'
              }}
            >
              <span className="truncate" style={{ fontSize: `${Math.max((el.fontSize || 16) * scale, 6)}px` }}>
                {el.text || 'Message'}
              </span>
            </div>
            {/* Message tail - simplified for thumbnail */}
            <div
              style={
                {
                  position: 'absolute',
                  bottom: 0,
                  left: `${10 * scale}px`,
                  width: 0,
                  height: 0,
                  borderLeft: `${5 * scale}px solid transparent`,
                  borderRight: `${5 * scale}px solid transparent`,
                  borderTop: `${7 * scale}px solid ${el.stroke || '#10b981'}`
                }
              }
            />
          </div>
        )
      
      case 'chart':
        return (
          <div
            key={el.id}
            style={{
              ...elementStyle,
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              fontSize: `${Math.max(8 * scale, 6)}px`
            }}
          >
            📊
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div
      className="w-full h-full relative"
      style={{
        backgroundColor: slide.background || '#ffffff',
        transform: 'scale(1)',
        transformOrigin: 'top left'
      }}
    >
      {/* Slide content */}
      {slide.elements && slide.elements.length > 0 ? (
        slide.elements.map(el => renderElement(el))
      ) : (
        // Empty slide placeholder
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-xs mb-1">Slide {slideNumber}</div>
            <div className="text-gray-300 text-[10px]">Empty Slide</div>
          </div>
        </div>
      )}
      
      {/* Slide number overlay */}
      <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[8px] px-1 py-0.5 rounded">
        {slideNumber}
      </div>
    </div>
  )
}
