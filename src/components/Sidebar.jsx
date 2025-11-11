import React from 'react'
import { useSlides } from '../context/SlidesContext.jsx'

export default function Sidebar() {
  const { state, dispatch } = useSlides()

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
      <div className="p-3">
        <div className="text-sm text-black font-medium">Slides</div>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-auto p-3 space-y-3"
        onDragOver={handleContainerDragOver}
        onDragLeave={() => { autoScrollRef.current.speed = 0 }}
      >
        {state.slides.map((s, i) => {
          const isActive = state.currentSlideId === s.id
          const isDragOver = dragOverIndex === i && dragIndexRef.current !== i
          const thumbnailStyle = isActive
            ? {
                background: '#ffffff',
                border: '2px solid #000000',
                boxShadow: 'none',
              }
            : {
                background: '#ffffff',
                border: '1px solid #cccccc',
                boxShadow: 'none',
              }

          return (
          <div 
            key={s.id} 
            className={`w-full group ${isActive ? 'ring-2 ring-white/80 rounded-lg' : ''} ${isDragOver ? 'outline outline-2 outline-white/80 rounded-lg' : ''}`}
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
              <button className="text-xs px-2 py-1 rounded text-black hover:bg-gray-200" onClick={(e)=>{e.stopPropagation(); dispatch({type:'DUPLICATE_SLIDE', id:s.id})}}>Duplicate</button>
              <button className="text-xs px-2 py-1 rounded text-black hover:bg-gray-200" onClick={(e)=>{e.stopPropagation(); dispatch({type:'DELETE_SLIDE', id:s.id})}}>Delete</button>
            </div>
          </div>
        )})}
      </div>
    </div>
  )
}

// SlideThumbnail component to render miniature version of slide content
function SlideThumbnail({ slide, slideNumber, isActive }) {
  const containerRef = React.useRef(null)
  const [scale, setScale] = React.useState(0.25)

  React.useEffect(() => {
    const calcScale = () => {
      if (!containerRef.current) return
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

  const renderElement = (el) => {
    const elementStyle = {
      position: 'absolute',
      left: `${el.x * scale}px`,
      top: `${el.y * scale}px`,
      width: `${el.w * scale}px`,
      height: `${el.h * scale}px`,
      transform: `rotate(${el.rotation || 0}deg)`,
      pointerEvents: 'none',
      overflow: 'hidden',
      boxSizing: 'border-box'
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
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
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
      
      case 'chart': {
        const chartType = el.chartType || 'bar'
        const data = Array.isArray(el.data) ? el.data : []
        const labels = Array.isArray(el.labels) ? el.labels : []
        const colors = Array.isArray(el.colors) && el.colors.length ? el.colors : ['#60a5fa', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']
        const padding = 4 * scale

        if (chartType === 'bar') {
          // Prefer numeric labels when present; otherwise use data
          const parsedFromLabels = labels.map((l) => {
            const v = parseFloat(l)
            return Number.isFinite(v) ? v : null
          })
          const preferLabelValues = parsedFromLabels.some(v => v !== null)
          const series = (preferLabelValues ? parsedFromLabels : data).map((v, i) => {
            if (v === null || !Number.isFinite(v)) return Number.isFinite(data[i]) ? data[i] : 0
            return v
          })

          const min = Math.min(...series, 0)
          const max = Math.max(...series, 1)
          const range = Math.max(1e-6, max - min)
          const barCount = series.length
          const barGap = 2 * scale
          const innerW = el.w * scale - padding * 2
          const innerH = el.h * scale - padding * 2
          const barW = barCount ? Math.max(1, (innerW - (barCount - 1) * barGap) / barCount) : 0
          const axisT = Math.max(1, Math.round(1 * scale))
          const labelFS = Math.max(6, Math.round(8 * scale))
          return (
            <div
              key={el.id}
              style={{
                ...elementStyle,
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '2px',
              }}
            >
              <div style={{ position: 'absolute', left: padding, right: padding, bottom: padding, top: padding }}>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  {series.map((v, i) => {
                    const h = Math.max(2, ((v - min) / range) * innerH)
                    const left = i * (barW + barGap)
                    return (
                      <div key={i} style={{
                        position: 'absolute',
                        left,
                        bottom: 0,
                        width: barW,
                        height: h,
                        backgroundColor: colors[i % colors.length] || '#9ca3af',
                        borderRadius: `${1 * scale}px`
                      }} />
                    )
                  })}
                  {/* Y tick labels */}
                  {Array.from({ length: 5 }).map((_, tIndex) => {
                    const t = tIndex / 4
                    const val = (min + (1 - t) * range)
                    const y = t * innerH
                    return (
                      <div key={`yt-${tIndex}`} style={{ position: 'absolute', left: 0, top: y - 6, fontSize: Math.max(6, Math.round(8 * scale)), color: '#374151' }}>
                        {Math.round(val)}
                      </div>
                    )
                  })}
                  {/* X labels */}
                  {(preferLabelValues ? labels : labels).map((lbl, i) => {
                    const left = i * (barW + barGap) + barW / 2
                    return (
                      <div key={`lbl-${i}`} style={{
                        position: 'absolute',
                        left,
                        bottom: axisT + Math.max(1, Math.round(1 * scale)),
                        transform: 'translateX(-50%)',
                        fontSize: labelFS,
                        color: '#6b7280',
                        maxWidth: barW,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'center'
                      }}>
                        {lbl}
                      </div>
                    )
                  })}
                  {/* Axes */}
                  <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: axisT, backgroundColor: '#d1d5db' }} />
                  <div style={{ position: 'absolute', left: 0, bottom: 0, width: axisT, height: '100%', backgroundColor: '#d1d5db' }} />
                </div>
              </div>
            </div>
          )
        }

        if (chartType === 'line') {
          const max = Math.max(...data)
          const min = Math.min(...data)
          const range = (max - min) || 1
          const points = data.map((v, i) => {
            const x = (i / Math.max(1, (data.length - 1))) * 100
            const y = 90 - ((v - min) / range) * 80
            return `${x},${y}`
          }).join(' ')
          return (
            <div
              key={el.id}
              style={{
                ...elementStyle,
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '2px',
              }}
            >
              <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none" style={{ position: 'absolute', left: padding, right: padding, top: padding, bottom: padding }}>
                {/* Axes */}
                <line x1="5" y1="90" x2="95" y2="90" stroke="#d1d5db" strokeWidth={Math.max(1, Math.round(1 * scale))} />
                <line x1="5" y1="10" x2="5" y2="90" stroke="#d1d5db" strokeWidth={Math.max(1, Math.round(1 * scale))} />
                {/* Y tick labels */}
                {Array.from({ length: 5 }).map((_, tIndex) => {
                  const t = tIndex / 4
                  const val = (min + (1 - t) * range)
                  const y = 90 - t * 80
                  return (
                    <text key={`yt-${tIndex}`} x={3} y={y} fontSize={Math.max(6, Math.round(8 * scale))} fill="#6b7280" textAnchor="end">{Math.round(val)}</text>
                  )
                })}
                {/* Line */}
                <polyline points={data.map((v, i) => {
                  const x = 5 + (i / Math.max(1, (data.length - 1))) * 90
                  const y = 90 - ((v - min) / range) * 80
                  return `${x},${y}`
                }).join(' ')} fill="none" stroke={colors[0]} strokeWidth="2" />
                {data.map((v, i) => {
                  const x = 5 + (i / Math.max(1, (data.length - 1))) * 90
                  const y = 90 - ((v - min) / range) * 80
                  return <circle key={i} cx={x} cy={y} r="2" fill={colors[0]} />
                })}
                {/* X labels */}
                {labels.map((lbl, i) => {
                  const n = Math.max(1, labels.length - 1)
                  const x = labels.length > 1 ? (i / n) * 90 + 5 : 50
                  return (
                    <text key={`lbl-${i}`} x={x} y={96} fontSize={Math.max(6, Math.round(8 * scale))} fill="#6b7280" textAnchor="middle">
                      {lbl}
                    </text>
                  )
                })}
              </svg>
            </div>
          )
        }

        if (chartType === 'pie') {
          const total = data.reduce((sum, val) => sum + val, 0) || 1
          let currentAngle = 0
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
              }}
            >
              <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ padding: `${padding}px` }}>
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
              {/* Legend */}
              <div style={{ position: 'absolute', right: padding, top: padding, display: 'flex', flexDirection: 'column', gap: Math.max(1, Math.round(2 * scale)), maxWidth: '45%' }}>
                {labels.map((lbl, i) => (
                  <div key={`lg-${i}`} style={{ display: 'flex', alignItems: 'center', gap: Math.max(2, Math.round(4 * scale)) }}>
                    <div style={{ width: Math.max(6, Math.round(8 * scale)), height: Math.max(6, Math.round(8 * scale)), backgroundColor: colors[i % colors.length], borderRadius: 2 }} />
                    <div style={{ fontSize: Math.max(6, Math.round(8 * scale)), color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        // Fallback (unknown chart type)
        return (
          <div key={el.id} style={{ ...elementStyle, backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '2px' }} />
        )
      }
      
      case 'table': {
        const rows = el.rows || 0
        const cols = el.cols || 0
        const cw = (el.w * scale) / (cols || 1)
        const ch = (el.h * scale) / (rows || 1)
        return (
          <div key={el.id} style={{ ...elementStyle, backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
            {Array.from({ length: rows }).map((_, r) => (
              <div key={r} style={{ position: 'absolute', left: 0, top: r * ch, width: '100%', height: ch }}>
                {Array.from({ length: cols }).map((__, c) => {
                  const idx = r * cols + c
                  const cell = el.cells?.[idx]
                  return (
                    <div key={c} style={{
                      position: 'absolute',
                      left: c * cw,
                      top: 0,
                      width: cw,
                      height: ch,
                      boxSizing: 'border-box',
                      borderRight: '1px solid #e5e7eb',
                      borderBottom: '1px solid #e5e7eb',
                      padding: `${2 * scale}px`,
                      overflow: 'hidden',
                      fontSize: `${Math.max((cell?.styles?.fontSize || 12) * scale, 6)}px`,
                      color: '#111827',
                      display: 'flex',
                      alignItems: cell?.styles?.valign === 'bottom' ? 'flex-end' : cell?.styles?.valign === 'middle' ? 'center' : 'flex-start',
                      justifyContent: (cell?.styles?.align === 'right') ? 'flex-end' : (cell?.styles?.align === 'center') ? 'center' : 'flex-start'
                    }}>
                      <span className="truncate" style={{ fontSize: `${Math.max((cell?.styles?.fontSize || 12) * scale, 6)}px` }}>
                        {cell?.text || ''}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={
        (slide && typeof slide.background === 'object' && slide.background.type === 'image' && slide.background.src)
          ? {
              backgroundImage: `url(${slide.background.src})`,
              backgroundSize: (slide.background.mode === 'stretch') ? '100% 100%' : (slide.background.mode === 'custom' && typeof slide.background.scale === 'number') ? `${slide.background.scale}% auto` : (slide.background.mode || 'cover'),
              backgroundPosition: (slide.background.position || 'center'),
              backgroundRepeat: 'no-repeat',
              transform: 'scale(1)',
              transformOrigin: 'top left'
            }
          : {
              background: (typeof slide?.background === 'string' ? slide.background : '#ffffff'),
              transform: 'scale(1)',
              transformOrigin: 'top left'
            }
      }
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
