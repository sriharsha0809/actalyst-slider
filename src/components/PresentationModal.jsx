import React, { useEffect, useRef, useState } from 'react'
import { useSlides } from '../context/SlidesContext.jsx'

export default function PresentationModal({ onClose }) {
  const { state, dispatch } = useSlides()
  const idx = state.slides.findIndex(s => s.id === state.currentSlideId)
  const [isPaused, setIsPaused] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(5)
  const intervalRef = useRef(null)
  const timerRef = useRef(null)

  // Initialize slideshow to start from first slide
  useEffect(() => {
    if (state.slides.length > 0) {
      dispatch({ type: 'SET_CURRENT_SLIDE', id: state.slides[0].id })
    }
  }, [])

  const goToNext = () => {
    if (idx < state.slides.length - 1) {
      dispatch({ type: 'SET_CURRENT_SLIDE', id: state.slides[idx + 1].id })
    } else {
      // If at last slide, loop back to first slide
      dispatch({ type: 'SET_CURRENT_SLIDE', id: state.slides[0].id })
    }
  }

  const goToPrevious = () => {
    if (idx > 0) {
      dispatch({ type: 'SET_CURRENT_SLIDE', id: state.slides[idx - 1].id })
    }
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (!isPaused) {
      setTimeRemaining(5) // Reset timer when slide changes
      
      // Countdown timer
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            goToNext()
            return 5 // Reset to 5 seconds for next slide
          }
          return prev - 1
        })
      }, 1000) // Update every second
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPaused, idx, state.slides, dispatch])

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' || e.key === 'PageDown') goToNext()
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') goToPrevious()
      if (e.key === ' ') { // Spacebar to pause/resume
        e.preventDefault()
        togglePause()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [idx, state.slides, dispatch, onClose, isPaused])

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
        
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all"
          title={idx === state.slides.length - 1 ? "Loop to First Slide" : "Next Slide"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        
        {/* Slide Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
          {idx + 1} / {state.slides.length}
          {isPaused && <span className="ml-2 text-yellow-300">⏸️ PAUSED</span>}
          {!isPaused && <span className="ml-2 text-green-300">⏱️ {timeRemaining}s</span>}
        </div>
        
        {/* Progress Bar */}
        {!isPaused && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
            <div 
              className="h-full bg-white transition-all duration-1000 ease-linear"
              style={{ width: `${((5 - timeRemaining) / 5) * 100}%` }}
            />
          </div>
        )}
        
        {/* Pause/Resume Button */}
        <button
          onClick={togglePause}
          className="absolute top-4 left-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
          title={isPaused ? "Resume (Space)" : "Pause (Space)"}
        >
          {isPaused ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"></polygon>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          )}
        </button>
        
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
  
  // Helper function to get vertical alignment styles
  const getVerticalAlignStyle = () => {
    const valign = el.styles?.valign || 'top'
    switch (valign) {
      case 'top':
        return { alignItems: 'flex-start' }
      case 'middle':
        return { alignItems: 'center' }
      case 'bottom':
        return { alignItems: 'flex-end' }
      default:
        return { alignItems: 'flex-start' }
    }
  }

  switch (el.type) {
    case 'text':
      return (
        <div className="w-full h-full p-2" style={{ 
          backgroundColor: bgColor, 
          color: el.styles.color, 
          fontSize: el.styles.fontSize, 
          fontWeight: el.styles.bold ? 700 : 400, 
          fontStyle: el.styles.italic ? 'italic' : 'normal', 
          textDecoration: el.styles.underline ? 'underline' : 'none', 
          textAlign: el.styles.align,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: el.styles?.valign === 'middle' ? 'center' : el.styles?.valign === 'bottom' ? 'flex-end' : 'flex-start',
        }}>
          {el.text}
        </div>
      )
    case 'rect':
      return <PresentationShapeWithText el={el} shapeClass="rounded-md" />
    case 'square':
      return <PresentationShapeWithText el={el} shapeClass="rounded-md" />
    case 'circle':
      return <PresentationShapeWithText el={el} shapeClass="rounded-full" />
    case 'triangle':
      return <PresentationShapeWithText el={el} shapeClass="" clipPath="polygon(50% 0%, 0% 100%, 100% 100%)" />
    case 'diamond':
      return <PresentationShapeWithText el={el} shapeClass="" clipPath="polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" />
    case 'star':
      return <PresentationShapeWithText el={el} shapeClass="" clipPath="polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" />
    case 'message':
      return <PresentationMessageShape el={el} />
    case 'chart':
      return <PresentationChartElement el={el} />
    case 'image':
      return <img src={el.src} alt="" className="w-full h-full object-contain" draggable={false} />
    default:
      return null
  }
}

function PresentationShapeWithText({ el, shapeClass, clipPath }) {
  const shapeStyle = {
    background: el.fill,
    border: `2px solid ${el.stroke}`,
    ...(clipPath && { clipPath })
  }

  return (
    <div 
      className={`w-full h-full ${shapeClass}`}
      style={shapeStyle}
    >
      <div 
        className="w-full h-full flex items-center justify-center p-2"
        style={{
          color: el.textColor,
          fontSize: el.fontSize,
          fontFamily: 'Inter, system-ui, sans-serif',
          wordWrap: 'break-word',
          textAlign: 'center'
        }}
      >
        {el.text || ''}
      </div>
    </div>
  )
}

function PresentationMessageShape({ el }) {
  return (
    <div className="w-full h-full relative">
      {/* Message bubble shape */}
      <div 
        className="w-full h-full rounded-lg relative"
        style={{
          background: el.fill,
          border: `2px solid ${el.stroke}`
        }}
      >
        <div 
          className="w-full h-full flex items-center justify-center p-2"
          style={{
            color: el.textColor,
            fontSize: el.fontSize,
            fontFamily: 'Inter, system-ui, sans-serif',
            wordWrap: 'break-word',
            textAlign: 'center'
          }}
        >
          {el.text || 'Message'}
        </div>
      </div>
      {/* Message tail */}
      <div 
        className="absolute bottom-0 left-4 w-0 h-0"
        style={{
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: `15px solid ${el.stroke}`
        }}
      />
      <div 
        className="absolute bottom-1 left-5 w-0 h-0"
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: `12px solid ${el.fill}`
        }}
      />
    </div>
  )
}

function PresentationChartElement({ el }) {
  const { chartType, data, labels, colors } = el
  
  if (chartType === 'bar') {
    const maxValue = Math.max(...data)
    const minValue = Math.min(...data)
    const range = maxValue - minValue || 1
    
    return (
      <div className="w-full h-full bg-white p-4 flex flex-col">
        {/* Chart area with proper height */}
        <div className="flex-1 flex items-end gap-1 relative" style={{ minHeight: '180px', height: '180px' }}>
          {data.map((value, index) => {
            // Calculate height as percentage of the chart area
            const heightPercent = range > 0 ? ((value - minValue) / range) * 100 : 50
            const actualHeight = Math.max((heightPercent / 100) * 180, 2) // Minimum 2px height
            
            return (
              <div 
                key={index} 
                className="flex-1 flex flex-col justify-end items-center relative"
                style={{ height: '180px' }}
              >
                {/* Bar container */}
                <div 
                  className="w-full rounded-t"
                  style={{ 
                    height: `${actualHeight}px`,
                    backgroundColor: colors[index % colors.length],
                    minHeight: '2px'
                  }}
                />
              </div>
            )
          })}
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-around border-t border-gray-300 pt-2 mt-2 h-8">
          {labels.map((label, index) => (
            <span key={index} className="text-[10px] text-gray-600 text-center flex-1 truncate" title={label}>
              {label}
            </span>
          ))}
        </div>
      </div>
    )
  }
  
  if (chartType === 'line') {
    const maxValue = Math.max(...data)
    const minValue = Math.min(...data)
    const range = maxValue - minValue || 1
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 90 - ((value - minValue) / range) * 80
      return `${x},${y}`
    }).join(' ')
    
    return (
      <div className="w-full h-full bg-white p-4 relative flex flex-col">
        <svg viewBox="0 0 100 100" className="w-full flex-1" style={{ minHeight: '200px' }}>
          <polyline
            points={points}
            fill="none"
            stroke={colors[0]}
            strokeWidth="2"
          />
          {data.map((value, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 90 - ((value - minValue) / range) * 80
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={colors[0]}
                />
              </g>
            )
          })}
        </svg>
        <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
          {labels.map((label, index) => (
            <span key={index} className="text-[10px] text-gray-600 truncate">{label}</span>
          ))}
        </div>
      </div>
    )
  }
  
  if (chartType === 'pie') {
    const total = data.reduce((sum, val) => sum + val, 0)
    let currentAngle = 0
    
    return (
      <div className="w-full h-full bg-white p-4 flex gap-4 items-center justify-center relative">
        <svg viewBox="0 0 100 100" className="w-1/2 h-3/4">
          {data.map((value, index) => {
            const percentage = value / total
            const angle = percentage * 360
            const startAngle = currentAngle
            const endAngle = currentAngle + angle
            currentAngle = endAngle
            
            const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180)
            const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180)
            const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180)
            const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180)
            const largeArc = angle > 180 ? 1 : 0
            
            return (
              <path
                key={index}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={colors[index % colors.length]}
              />
            )
          })}
        </svg>
        
        <div className="flex flex-col gap-1">
          {data.map((value, index) => (
            <div key={index} className="flex items-center gap-2 text-[10px]">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-gray-700">{labels[index]}: {value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  return null
}
