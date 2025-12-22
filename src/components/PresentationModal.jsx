import React, { useEffect, useRef, useState } from 'react'
import { useSlides } from '../context/SlidesContext.jsx'
import SlideView from './SlideView.jsx'
import KeynoteBarChart from './KeynoteBarChart.jsx'
import KeynoteLineChart from './KeynoteLineChart.jsx'
import KeynotePieChart from './KeynotePieChart.jsx'

export default function PresentationModal({ mode = 'auto', onClose }) {
  const { state, dispatch } = useSlides()
  const idx = state.slides.findIndex(s => s.id === state.currentSlideId)
  const [isPaused, setIsPaused] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(5)
  const [localMode, setLocalMode] = useState(mode) // 'manual' | 'auto'
  const [showControls, setShowControls] = useState(false)
  const [showEndOverlay, setShowEndOverlay] = useState(false)
  const intervalRef = useRef(null)
  const timerRef = useRef(null)
  const endOverlayRef = useRef(null)
  const containerRef = useRef(null)

  // Sync local mode when prop changes
  useEffect(() => { setLocalMode(mode) }, [mode])

  // On open, start from the first slide
  useEffect(() => {
    if (state.slides.length > 0) {
      const firstId = state.slides[0].id
      if (state.currentSlideId !== firstId) {
        dispatch({ type: 'SET_CURRENT_SLIDE', id: firstId })
      }
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearEndOverlay = () => {
    setShowEndOverlay(false)
    if (endOverlayRef.current) {
      clearTimeout(endOverlayRef.current)
      endOverlayRef.current = null
    }
  }

  const goToNext = () => {
    clearEndOverlay()
    if (idx < state.slides.length - 1) {
      dispatch({ type: 'SET_CURRENT_SLIDE', id: state.slides[idx + 1].id })
    } else {
      // At last slide: show end overlay for 5s, then keep last slide
      setShowEndOverlay(true)
      endOverlayRef.current = setTimeout(() => {
        setShowEndOverlay(false)
      }, 5000)
      // Stop auto playback if it was running
      setLocalMode('manual')
      setIsPaused(true)
    }
  }

  const goToPrevious = () => {
    clearEndOverlay()
    if (idx > 0) {
      dispatch({ type: 'SET_CURRENT_SLIDE', id: state.slides[idx - 1].id })
    }
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  // Auto-advance slides every 5 seconds (only in auto mode)
  useEffect(() => {
    if (localMode === 'auto' && !isPaused) {
      setTimeRemaining(5)
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (idx < state.slides.length - 1) {
              dispatch({ type: 'SET_CURRENT_SLIDE', id: state.slides[idx + 1].id })
              return 5
            }
            // End reached in auto: show overlay and stop
            setShowEndOverlay(true)
            endOverlayRef.current = setTimeout(() => setShowEndOverlay(false), 5000)
            setLocalMode('manual')
            setIsPaused(true)
            return 5
          }
          return prev - 1
        })
      }, 1000)
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
  }, [localMode, isPaused, idx, state.slides, dispatch])

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

  // Try to enter fullscreen on mount; exit on unmount
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const tryFs = async () => {
      try {
        if (!document.fullscreenElement && el.requestFullscreen) {
          await el.requestFullscreen({ navigationUI: 'hide' }).catch(() => { })
        }
      } catch { }
    }
    // Attempt shortly after mount to still be within user gesture timing
    const t = setTimeout(tryFs, 0)
    return () => {
      clearTimeout(t)
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => { })
        }
      } catch { }
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        // If user navigates manually during auto, switch to manual
        if (localMode === 'auto' && !isPaused) { setLocalMode('manual'); setIsPaused(true) }
        goToNext()
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (localMode === 'auto' && !isPaused) { setLocalMode('manual'); setIsPaused(true) }
        goToPrevious()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [idx, state.slides, dispatch, onClose, isPaused, localMode])

  const [isFullscreen, setIsFullscreen] = useState(!!(typeof document !== 'undefined' && document.fullscreenElement))
  useEffect(() => {
    const onFs = () => {
      const fs = !!document.fullscreenElement
      setIsFullscreen(fs)
      // If user exited fullscreen (Esc or OS minimize), close presentation
      if (!fs) {
        try { onClose && onClose() } catch { }
      }
    }
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [onClose])

  const triedFsRef = useRef(false)
  const requestFS = async () => {
    try {
      if (!document.fullscreenElement && containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen({ navigationUI: 'hide' })
        triedFsRef.current = true
      }
    } catch { }
  }
  const exitFS = async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen()
    } catch { }
    // After minimizing (exiting fullscreen), navigate back to main page
    try { onClose && onClose() } catch { }
  }

  const onHoverZoneEnter = () => setShowControls(true)
  const onHoverZoneLeave = () => setShowControls(false)

  // Fallback: try to enter fullscreen on first user interaction inside modal
  const handleFirstInteract = () => { if (!document.fullscreenElement && !triedFsRef.current) requestFS() }

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-black" onPointerDownCapture={handleFirstInteract} onMouseMove={handleFirstInteract}>
      <div className="absolute inset-0">
        <SlideStage />

        {/* Bottom hover zone to reveal controls */}
        <div className="absolute left-0 right-0 bottom-0" style={{ height: 80 }} onMouseEnter={onHoverZoneEnter} onMouseLeave={onHoverZoneLeave} />

        {/* Bottom control bar (visible on hover) */}
        {showControls && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-3 bg-black/70 text-white rounded-full px-4 py-2 flex items-center gap-3 shadow-lg" onMouseEnter={onHoverZoneEnter} onMouseLeave={onHoverZoneLeave}>
            {/* Page representation */}
            <div className="text-sm whitespace-nowrap">{idx + 1} / {state.slides.length}</div>

            {/* Fullscreen toggle */}
            <button
              onClick={(e) => { e.stopPropagation(); isFullscreen ? exitFS() : requestFS() }}
              className="w-7 h-7 rounded-full bg-white/90 text-black flex items-center justify-center hover:bg-white"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                // Minimize icon
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 15H5v4" />
                  <path d="M15 9h4V5" />
                  <path d="M15 19l4-4" />
                  <path d="M9 5L5 9" />
                </svg>
              ) : (
                // Maximize icon
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H5v4" />
                  <path d="M15 19h4v-4" />
                  <path d="M5 9l4-4" />
                  <path d="M19 15l-4 4" />
                </svg>
              )}
            </button>

            {/* Play or Pause */}
            {localMode === 'auto' && !isPaused ? (
              <button
                onClick={(e) => { e.stopPropagation(); setLocalMode('manual'); setIsPaused(true); if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } clearEndOverlay() }}
                className="w-7 h-7 rounded-full bg-white/90 text-black flex items-center justify-center hover:bg-white"
                title="Pause slideshow"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setLocalMode('auto'); setIsPaused(false); setTimeRemaining(5); clearEndOverlay() }}
                className="w-7 h-7 rounded-full bg-white/90 text-black flex items-center justify-center hover:bg-white"
                title="Play slideshow from current"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21"></polygon>
                </svg>
              </button>
            )}

            {/* Progress bar (visible only when auto and not paused) */}
            {localMode === 'auto' && !isPaused && (
              <div className="h-1 w-24 bg-white/40 rounded overflow-hidden">
                <div className="h-full bg-white" style={{ width: `${((5 - timeRemaining) / 5) * 100}%`, transition: 'width 1s linear' }} />
              </div>
            )}
          </div>
        )}

        {/* Close with Esc — no visible close button per requirements */}

        {/* End-of-presentation overlay */}
        {showEndOverlay && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }} onClick={(e) => { e.stopPropagation(); clearEndOverlay() }}>
            <div className="text-white text-xl font-semibold px-6 py-4 rounded-lg keynote-pop" style={{ background: 'rgba(0,0,0,0.65)' }}>
              This is your last slide
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SlideStage() {
  const { state } = useSlides()
  const slide = state.slides.find(s => s.id === state.currentSlideId)

  // Compute viewport size to scale 960x540 slide to fit the screen
  const [viewport, setViewport] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const onResize = () => {
      try {
        setViewport({ w: window.innerWidth || 0, h: window.innerHeight || 0 })
      } catch {
        setViewport({ w: 0, h: 0 })
      }
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const REF_WIDTH = 960
  const REF_HEIGHT = 540
  const vw = viewport.w || (typeof window !== 'undefined' ? window.innerWidth : REF_WIDTH)
  const vh = viewport.h || (typeof window !== 'undefined' ? window.innerHeight : REF_HEIGHT)
  const scale = Math.min(vw / REF_WIDTH, vh / REF_HEIGHT)
  const contentW = REF_WIDTH * scale
  const contentH = REF_HEIGHT * scale
  const offsetX = Math.max(0, (vw - contentW) / 2)
  const offsetY = Math.max(0, (vh - contentH) / 2)

  // Simple fade transition for the slide container itself
  // Content animations handle the rest
  const animClass = 'slide-anim-fade'

  // Listen for live element movement to mirror in presentation mode
  const [liveOverrides, setLiveOverrides] = useState({})
  useEffect(() => {
    const onLive = (e) => {
      const d = e?.detail || {}
      if (!d || !slide || d.slideId !== slide.id) return
      setLiveOverrides(prev => ({ ...prev, [d.id]: { x: d.x, y: d.y, w: d.w, h: d.h, rotation: d.rotation } }))
    }
    const onEnd = (e) => {
      const d = e?.detail || {}
      if (!d || !slide || d.slideId !== slide.id) return
      setLiveOverrides(prev => { const n = { ...prev }; delete n[d.id]; return n })
    }
    window.addEventListener('liveElementMove', onLive)
    window.addEventListener('liveElementMoveEnd', onEnd)
    return () => {
      window.removeEventListener('liveElementMove', onLive)
      window.removeEventListener('liveElementMoveEnd', onEnd)
    }
  }, [slide?.id])

  return (
    <div className="absolute inset-0" style={{ background: 'transparent' }}>
      {/* Outer wrapper handles centering and scaling only */}
      <div
        style={{
          position: 'absolute',
          left: offsetX,
          top: offsetY,
          width: REF_WIDTH,
          height: REF_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Inner wrapper handles slide-in animation (does not affect scale) */}
        <div className={animClass} style={{ position: 'absolute', inset: 0 }}>
          {slide && (
            <SlideView data={slide} scale={1} mode="presentation" animateKey={slide.id} liveOverrides={liveOverrides} />
          )}
        </div>
      </div>
    </div>
  )
}

function PresentationShapeWithText({ el, shapeClass, clipPath }) {
  const shapeStyle = {
    background: el.fill,
    border: `2px solid ${el.stroke}`,
    ...(clipPath && { clipPath }),
    opacity: el.opacity == null ? 1 : el.opacity,
  }

  const textAlign = el.textAlign || 'center'
  const textVAlign = el.textVAlign || 'middle'
  const alignItems = textAlign === 'right' ? 'flex-end' : (textAlign === 'center' ? 'center' : 'flex-start')
  const justifyContent = textVAlign === 'bottom' ? 'flex-end' : (textVAlign === 'middle' ? 'center' : 'flex-start')

  return (
    <div
      className={`w-full h-full ${shapeClass}`}
      style={shapeStyle}
    >
      <div
        className="w-full h-full flex p-2"
        style={{
          color: el.textColor,
          fontSize: el.fontSize,
          fontFamily: 'Inter, system-ui, sans-serif',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflow: 'hidden',
          textAlign,
          alignItems,
          justifyContent,
          flexDirection: 'column',
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
          border: `2px solid ${el.stroke}`,
          opacity: el.opacity == null ? 1 : el.opacity,
        }}
      >
        <div
          className="w-full h-full flex p-2"
          style={{
            color: el.textColor,
            fontSize: el.fontSize,
            fontFamily: 'Inter, system-ui, sans-serif',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflow: 'hidden',
            textAlign: el.textAlign || 'center',
            alignItems: (el.textAlign || 'center') === 'right' ? 'flex-end' : ((el.textAlign || 'center') === 'center' ? 'center' : 'flex-start'),
            justifyContent: (el.textVAlign || 'middle') === 'bottom' ? 'flex-end' : ((el.textVAlign || 'middle') === 'middle' ? 'center' : 'flex-start'),
            flexDirection: 'column',
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

function PresentationTableElement({ el }) {
  const rows = el.rows || 0
  const cols = el.cols || 0
  const cw = (el.w) / (cols || 1)
  const ch = (el.h) / (rows || 1)
  const cellBorder = `1px solid ${el.borderColor || '#000000'}`

  return (
    <div className="w-full h-full" style={{ position: 'relative', background: '#ffffff', border: `1px solid ${el.borderColor || '#000000'}` }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ position: 'absolute', left: 0, top: r * ch, width: '100%', height: ch }}>
          {Array.from({ length: cols }).map((__, c) => {
            const idx = r * cols + c
            const cell = el.cells?.[idx]
            const isHeader = !!el.headerRow && r === 0
            const bg = (cell?.styles?.bgColor) ? cell.styles.bgColor : (isHeader ? (el.headerBg || '#f3f4f6') : (el.cellBg || '#ffffff'))
            const fg = isHeader ? (el.headerTextColor || '#111827') : (cell?.styles?.color || '#111827')
            const valign = cell?.styles?.valign || 'middle'
            const align = cell?.styles?.align || 'center'
            return (
              <div key={c} style={{
                position: 'absolute',
                left: c * cw,
                top: 0,
                width: cw,
                height: ch,
                boxSizing: 'border-box',
                borderRight: cellBorder,
                borderBottom: cellBorder,
                padding: 8,
                background: bg,
                color: fg,
                display: 'flex',
                alignItems: valign === 'middle' ? 'center' : (valign === 'bottom' ? 'flex-end' : 'flex-start'),
                justifyContent: align === 'right' ? 'flex-end' : (align === 'center' ? 'center' : 'flex-start'),
                overflow: 'hidden',
                fontSize: `${cell?.styles?.fontSize || 12}px`,
                fontFamily: cell?.styles?.fontFamily || 'Inter, system-ui, sans-serif',
                fontWeight: cell?.styles?.bold ? 700 : 400,
                fontStyle: cell?.styles?.italic ? 'italic' : 'normal',
                textDecoration: cell?.styles?.underline ? 'underline' : 'none',
                textAlign: align,
              }}>
                <span className="truncate">{cell?.text || ''}</span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function PresentationChartElement({ el, slideId }) {
  const { chartType, data = [], labels = [], colors = [] } = el
  const legendOpts = el.legendOptions || {}
  const xAxisEnabled = !!legendOpts.xAxisEnabled
  const xAxisLabel = xAxisEnabled ? (legendOpts.xAxisLabel || '') : null
  const yAxisEnabled = !!legendOpts.yAxisEnabled
  const yAxisLabel = yAxisEnabled ? (legendOpts.yAxisLabel || '') : null
  const showXAxis = legendOpts.showXAxis !== false
  const showYAxis = legendOpts.showYAxis !== false
  const showMinorGridlines = !!legendOpts.showMinorGridlines

  if (chartType === 'bar') {
    const structured = el.structuredData
    const cats = structured?.categories || el.labels || []
    const allSeries = structured?.series || [{ name: 'Series 1', data: el.data || [] }]
    const seriesNames = allSeries.map((s, idx) => s?.name || `Series ${idx + 1}`)
    // Build bar-friendly data rows
    const dataBar = cats.map((name, i) => {
      const row = { name }
      allSeries.forEach((s, idx) => { row[idx === 0 ? 'value' : `v${idx + 1}`] = Number(s.data[i]) || 0 })
      return row
    })
    return (
      <div className="w-full h-full" style={{ background: 'transparent' }}>
        <KeynoteBarChart key={`${el.id}-${slideId}-${el.chartStyle || '2d'}`} data={dataBar} variant={el.chartStyle || '2d'} showLegend={legendOpts.show !== false} seriesNames={seriesNames} xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel} showXAxis={showXAxis} showYAxis={showYAxis} showMinorGridlines={showMinorGridlines} />
      </div>
    )
  }

  if (chartType === 'line') {
    const structured = el.structuredData
    const cats = structured?.categories || el.labels || []
    const allSeries = structured?.series || [{ name: 'Series 1', data: el.data || [] }]
    const seriesNames = allSeries.map((s, idx) => s?.name || `Series ${idx + 1}`)
    const dataLine = cats.map((name, i) => {
      const row = { name }
      allSeries.forEach((s, idx) => { row[idx === 0 ? 'value' : `v${idx + 1}`] = Number(s.data[i]) || 0 })
      return row
    })
    return (
      <div className="w-full h-full" style={{ background: 'transparent' }}>
        <KeynoteLineChart key={`${el.id}-${slideId}-${el.chartStyle || 'simple'}`} data={dataLine} variant={el.chartStyle || 'simple'} showLegend={legendOpts.show !== false} seriesNames={seriesNames} xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel} showXAxis={showXAxis} showYAxis={showYAxis} showMinorGridlines={showMinorGridlines} />
      </div>
    )
  }

  if (chartType === 'pie') {
    const structured = el.structuredData
    const cats = structured?.categories || el.labels || []
    const s0 = structured?.series?.[0]?.data || el.data || []
    const dataPie = cats.map((name, i) => ({ name, value: Number(s0[i]) || 0 }))
    return (
      <div className="w-full h-full" style={{ background: 'transparent' }}>
        <KeynotePieChart key={`${el.id}-${slideId}-${el.chartStyle || '2d'}`} data={dataPie} variant={el.chartStyle || '2d'} showLegend={el.legendOptions?.show !== false} animateKey={slideId} />
      </div>
    )
  }

  return null
}
