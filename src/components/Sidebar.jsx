import React from 'react'
import { useSlides } from '../context/SlidesContext.jsx'
import SlideView from './SlideView.jsx'
import { motion } from 'framer-motion'

export default function Sidebar() {
  const { state, dispatch } = useSlides()

  // Track per-slide delete animation
  const [deletingIds, setDeletingIds] = React.useState({})
  const [poppingIds, setPoppingIds] = React.useState({})
  const [dupPoppingIds, setDupPoppingIds] = React.useState({})
  const [glowIds, setGlowIds] = React.useState({})
  const prevIdsRef = React.useRef(new Set())
  const prevOrderRef = React.useRef([])
  const pendingDupSourceRef = React.useRef(null)
  const DELETE_DURATION_MS = 180
  const POP_DURATION_MS = 200 // allow slight headroom

  const requestDeleteSlide = (slideId) => {
    // Start animation
    setDeletingIds(prev => ({ ...prev, [slideId]: true }))
    // After animation completes, remove from store
    setTimeout(() => {
      dispatch({ type: 'DELETE_SLIDE', id: slideId })
      // Clean up local flag after list updates
      setDeletingIds(prev => { const c = { ...prev }; delete c[slideId]; return c })
    }, DELETE_DURATION_MS)
  }

  const requestDuplicateSlide = (slideId) => {
    // Pulse the source briefly
    setGlowIds(prev => ({ ...prev, [slideId]: true }))
    setTimeout(() => setGlowIds(prev => { const n = { ...prev }; delete n[slideId]; return n }), 150)
    // Mark the source so we can tag the next slide that appears beneath it
    pendingDupSourceRef.current = slideId
    dispatch({ type: 'DUPLICATE_SLIDE', id: slideId })
  }

  // Detect newly added slides and trigger pop-in only for them (and choose dup style when applicable)
  React.useEffect(() => {
    const currentIds = new Set(state.slides.map(s => s.id))
    const currentOrder = state.slides.map(s => s.id)
    const prevIds = prevIdsRef.current
    const prevOrder = prevOrderRef.current
    const newlyAdded = state.slides.filter(s => !prevIds.has(s.id))
    if (newlyAdded.length) {
      const srcId = pendingDupSourceRef.current
      // Split new ids into duplicate or general pop-in
      const dupIds = []
      const genIds = []
      newlyAdded.forEach(n => {
        if (srcId) {
          const idx = currentOrder.indexOf(n.id)
          const srcIdx = currentOrder.indexOf(srcId)
          if (srcIdx !== -1 && idx === srcIdx + 1) dupIds.push(n.id)
          else genIds.push(n.id)
        } else {
          genIds.push(n.id)
        }
      })
      if (genIds.length) {
        setPoppingIds(prev => { const next = { ...prev }; genIds.forEach(id => next[id] = true); return next })
        setTimeout(() => setPoppingIds(prev => { const next = { ...prev }; genIds.forEach(id => delete next[id]); return next }), POP_DURATION_MS)
      }
      if (dupIds.length) {
        setDupPoppingIds(prev => { const next = { ...prev }; dupIds.forEach(id => next[id] = true); return next })
        setTimeout(() => setDupPoppingIds(prev => { const next = { ...prev }; dupIds.forEach(id => delete next[id]); return next }), POP_DURATION_MS)
      }
      // Clear pending source if we consumed it
      if (srcId && dupIds.length) pendingDupSourceRef.current = null
    }
    // Update refs for next comparison
    prevIdsRef.current = currentIds
    prevOrderRef.current = currentOrder
  }, [state.slides])

  // Drag and drop state for reordering slides
  const dragIndexRef = React.useRef(null)
  const [dragOverIndex, setDragOverIndex] = React.useState(null)
  const [isDragging, setIsDragging] = React.useState(false)

  // Scroll container ref and autoscroll state
  const scrollRef = React.useRef(null)
  const autoScrollRef = React.useRef({ rafId: null, speed: 0 })

  const ensureAutoScrollLoop = () => {
    if (autoScrollRef.current.rafId) return
    const step = () => {
      const { speed } = autoScrollRef.current
      const el = scrollRef.current
      if (el && speed) {
        el.scrollTop += speed
      }
      autoScrollRef.current.rafId = isDragging ? requestAnimationFrame(step) : null
    }
    autoScrollRef.current.rafId = requestAnimationFrame(step)
  }
  const stopAutoScroll = () => {
    if (autoScrollRef.current.rafId) cancelAnimationFrame(autoScrollRef.current.rafId)
    autoScrollRef.current.rafId = null
    autoScrollRef.current.speed = 0
  }

  const handleContainerDragOver = (e) => {
    // Enable autoscroll near edges while dragging
    e.preventDefault()
    if (!scrollRef.current || !isDragging) return
    const rect = scrollRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top
    const threshold = Math.min(80, rect.height / 4)
    const maxSpeed = 16 // px per frame
    let speed = 0
    if (y < threshold) {
      speed = -Math.round(((threshold - y) / threshold) * maxSpeed)
    } else if (y > rect.height - threshold) {
      speed = Math.round(((y - (rect.height - threshold)) / threshold) * maxSpeed)
    }
    autoScrollRef.current.speed = speed
    if (speed !== 0) ensureAutoScrollLoop()
    else if (speed === 0 && autoScrollRef.current.rafId) {
      // Pause loop until needed again
      stopAutoScroll()
    }
  }

  const handleDragStart = (e, index) => {
    dragIndexRef.current = index
    setIsDragging(true)
    try { e.dataTransfer.setData('text/plain', String(index)) } catch {}
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIndex !== index) setDragOverIndex(index)
  }

  const handleDragLeave = (e, index) => {
    // Only clear when leaving the item if it's the current highlighted one
    if (dragOverIndex === index) setDragOverIndex(null)
  }

  const handleDrop = (e, index) => {
    e.preventDefault()
    const fromIndexStr = (() => { try { return e.dataTransfer.getData('text/plain') } catch { return '' } })()
    const fromIndex = Number.isInteger(Number(fromIndexStr)) ? parseInt(fromIndexStr, 10) : dragIndexRef.current
    const toIndex = index
    if (typeof fromIndex === 'number' && typeof toIndex === 'number' && fromIndex !== toIndex) {
      dispatch({ type: 'REORDER_SLIDES', fromIndex, toIndex })
    }
    dragIndexRef.current = null
    setDragOverIndex(null)
    setIsDragging(false)
    stopAutoScroll()
  }

  const handleDragEnd = () => {
    dragIndexRef.current = null
    setDragOverIndex(null)
    setIsDragging(false)
    stopAutoScroll()
  }

  return (
    <div className="h-full flex flex-col">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-auto p-2 space-y-1"
        onDragOver={handleContainerDragOver}
        onDragLeave={() => { autoScrollRef.current.speed = 0 }}
      >
        {state.slides.map((s, i) => {
          const isActive = state.currentSlideId === s.id
          const isDragOver = dragOverIndex === i && dragIndexRef.current !== i
          const isDeleting = !!deletingIds[s.id]
          const isPopping = !!poppingIds[s.id]
          const isDupPopping = !!dupPoppingIds[s.id]
          const isGlowing = !!glowIds[s.id]
          const thumbnailStyle = isActive
            ? {
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.10)',
              }
            : {
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.14)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              }

          return (
          <motion.div 
            key={s.id} 
            className={`w-full group rounded-lg p-1 border transition-all duration-200 ease-in-out ${isDeleting ? 'opacity-0 translate-x-3 scale-[0.96] ring-1 ring-black/5 pointer-events-none' : ''} ${isDupPopping ? 'thumb-dup-in' : isPopping ? 'thumb-pop-in' : ''} ${isGlowing ? 'thumb-source-glow ring-1 ring-black/5' : ''}`}
            style={{ overflow: 'hidden', willChange: 'opacity, transform' }}
            initial={{ backgroundColor: isActive ? 'rgba(0,0,0,0.12)' : 'transparent', borderColor: isActive ? 'rgba(0,0,0,0.25)' : 'transparent' }}
            animate={{ backgroundColor: isActive ? 'rgba(0,0,0,0.12)' : 'transparent', borderColor: isActive ? 'rgba(0,0,0,0.25)' : 'transparent' }}
            whileHover={!isActive ? { backgroundColor: 'rgba(0,0,0,0.06)', borderColor: 'rgba(0,0,0,0.15)', scale: 1 } : undefined}
            whileTap={!isActive ? { backgroundColor: 'rgba(0,0,0,0.10)' } : undefined}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            onDragOver={(e)=>handleDragOver(e, i)}
            onDragLeave={(e)=>handleDragLeave(e, i)}
            onDrop={(e)=>handleDrop(e, i)}
          >
            <button
              draggable
              onDragStart={(e)=>handleDragStart(e, i)}
              onDragEnd={handleDragEnd}
              onClick={() => dispatch({ type: 'SET_CURRENT_SLIDE', id: s.id })}
              className="w-full text-left"
              disabled={isDeleting}
            >
              <div className="thumb-3d-wrap">
                <motion.div
                  className={`thumb-3d overflow-hidden rounded-xl shadow-sm ${isActive ? 'is-selected border-2' : 'border'} `}
                  style={{ borderColor: isActive ? 'rgba(0,0,0,0.25)' : 'transparent', backgroundColor: isActive ? 'rgba(0,0,0,0.12)' : '#ffffff' }}
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 1, opacity: 1, borderColor: isActive ? 'rgba(0,0,0,0.25)' : 'transparent', backgroundColor: isActive ? 'rgba(0,0,0,0.12)' : '#ffffff' }}
                  whileHover={!isActive ? { scale: 1.015, backgroundColor: 'rgba(0,0,0,0.06)', borderColor: 'rgba(0,0,0,0.15)' } : undefined}
                  whileTap={!isActive ? { scale: 0.985, backgroundColor: 'rgba(0,0,0,0.10)' } : undefined}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                >
                  <div className="aspect-video relative overflow-hidden p-2">
                    <SlideThumbnail slide={s} slideNumber={i + 1} isActive={isActive} />
                  </div>
                </motion.div>
              </div>
            </button>
            <div className={`mt-1 flex items-center gap-1 transition ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <button className={`text-xs px-2 py-1 rounded border-0 text-black ${isActive ? 'bg-transparent' : 'hover:bg-black/5'}`} disabled={isDeleting} onClick={(e)=>{e.stopPropagation(); requestDuplicateSlide(s.id)}}>Duplicate</button>
              <button className={`text-xs px-2 py-1 rounded border-0 text-black ${isActive ? 'bg-transparent' : 'hover:bg-black/5'}`} disabled={isDeleting} onClick={(e)=>{e.stopPropagation(); requestDeleteSlide(s.id)}}>Delete</button>
            </div>
          </motion.div>
        )})}
      </div>
    </div>
  )
}

// SlideThumbnail component to render miniature version of slide content
function SlideThumbnail({ slide, slideNumber, isActive }) {
  const containerRef = React.useRef(null)
  const [scale, setScale] = React.useState(0.18)
  const [liveOverrides, setLiveOverrides] = React.useState({})
  const [animKey, setAnimKey] = React.useState(null)
  const wasActiveRef = React.useRef(isActive)
  React.useEffect(() => {
    // When this slide becomes active (selected), retrigger animations once
    if (isActive && !wasActiveRef.current) {
      setAnimKey(`${slide.id}-${Date.now()}`)
    }
    wasActiveRef.current = isActive
  }, [isActive, slide.id])

  // Compute a lightweight signature for the slide to drive memoized SlideView re-render
  const sig = React.useMemo(() => {
    try {
      const bg = (typeof slide.background === 'string')
        ? slide.background
        : slide.background && typeof slide.background === 'object'
          ? JSON.stringify({ t: slide.background.type, src: slide.background.src, m: slide.background.mode, c: slide.background.color })
          : ''
      const els = Array.isArray(slide.elements) ? slide.elements : []
      const parts = [bg, String(slide.id || ''), String(els.length)]
      for (let i = 0; i < els.length; i++) {
        const e = els[i] || {}
        // Include stable fields that affect visuals
        if (e.type === 'text') {
          parts.push(`t:${e.id}:${e.x},${e.y},${e.w},${e.h},${e.rotation}|${e.text}|${e.html}|${e.styles?.fontSize}|${e.styles?.align}`)
        } else if (e.type === 'chart') {
          const sd = e.structuredData || {}
          parts.push(`c:${e.id}:${e.chartType}:${e.chartStyle}:${e.x},${e.y},${e.w},${e.h},${e.rotation}|${(sd.categories||[]).length}|${(sd.series||[]).length}|${(e.data||[]).length}`)
        } else if (e.type === 'image') {
          parts.push(`i:${e.id}:${e.src}:${e.x},${e.y},${e.w},${e.h},${e.rotation}`)
        } else if (e.type === 'table') {
          parts.push(`b:${e.id}:${e.rows}x${e.cols}:${e.x},${e.y},${e.w},${e.h}`)
        } else {
          parts.push(`s:${e.id}:${e.type}:${e.x},${e.y},${e.w},${e.h},${e.rotation}:${e.fill}:${e.stroke}`)
        }
      }
      return parts.join(';')
    } catch {
      return String(slide?.id || '')
    }
  }, [slide])

  React.useEffect(() => {
    const calcScale = () => {
      if (!containerRef.current) return
      // Fit the fixed 960x540 slide into the container using transform scale
      const w = containerRef.current.clientWidth || 0
      const h = containerRef.current.clientHeight || 0
      if (w && h) {
        const sx = w / 960
        const sy = h / 540
        setScale(Math.min(sx, sy))
      }
    }
    calcScale()
    const ro = new ResizeObserver(calcScale)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Listen for live element movement from the canvas to mirror during drag/inertia
  React.useEffect(() => {
    const onLive = (e) => {
      const d = e?.detail || {}
      if (!d || d.slideId !== slide.id) return
      setLiveOverrides(prev => ({ ...prev, [d.id]: { x: d.x, y: d.y, rotation: d.rotation } }))
    }
    const onEnd = (e) => {
      const d = e?.detail || {}
      if (!d || d.slideId !== slide.id) return
      setLiveOverrides(prev => { const n = { ...prev }; delete n[d.id]; return n })
    }
    window.addEventListener('liveElementMove', onLive)
    window.addEventListener('liveElementMoveEnd', onEnd)
    return () => {
      window.removeEventListener('liveElementMove', onLive)
      window.removeEventListener('liveElementMoveEnd', onEnd)
    }
  }, [slide.id])

  const liveSig = React.useMemo(() => {
    try { return JSON.stringify(liveOverrides) } catch { return '' }
  }, [liveOverrides])

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden select-none" style={{ pointerEvents: 'none' }}>
      {/* SlideView renders the same visuals as the main slide; we only scale it */}
      <SlideView data={slide} scale={scale} isThumbnailView={true} mode="viewer" animateKey={animKey} liveOverrides={liveOverrides} />
      {/* Slide number overlay */}
      <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[8px] px-1 py-0.5 rounded" style={{ pointerEvents: 'none' }}>
        {slideNumber}
      </div>
    </div>
  )
}

// Old per-element thumbnail renderer has been replaced by SlideView to ensure exact fidelity with main slide.

/*
  Keeping previous implementation removed to follow the requirement: use one universal Slide component
  for both main canvas and thumbnails (scaled). The SlideView component is a read-only renderer that
  mirrors the main slide visuals and accepts a `scale` prop.
*/
