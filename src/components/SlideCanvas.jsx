import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { useSlides } from '../context/SlidesContext.jsx'
import RichTextEditor from './RichTextEditor.jsx'

export default function SlideCanvas() {
  const { state, dispatch } = useSlides()
  const slide = state.slides.find(s => s.id === state.currentSlideId)
  const stageRef = useRef(null)
  const containerRef = useRef(null)
  const [editingTextId, setEditingTextId] = useState(null)
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Store editor ref globally for toolbar access
  window.currentTextEditorRef = useRef(null)

  // Track container dimensions for responsive scaling
  const updateContainerDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const newDimensions = { width: rect.width, height: rect.height }
      
      setContainerDimensions(prev => {
        if (Math.abs(prev.width - newDimensions.width) > 1 || Math.abs(prev.height - newDimensions.height) > 1) {
          return newDimensions
        }
        return prev
      })
      
      if (!isInitialized && rect.width > 0 && rect.height > 0) {
        setIsInitialized(true)
      }
    }
  }, [isInitialized])

  // Listen for container size changes
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      updateContainerDimensions()
    })
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    
    // Initial measurement
    updateContainerDimensions()
    
    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Listen for custom updateElement events from shape components
  React.useEffect(() => {
    const handleUpdateElement = (event) => {
      dispatch({ type: 'UPDATE_ELEMENT', id: event.detail.id, patch: event.detail.patch })
    }
    
    window.addEventListener('updateElement', handleUpdateElement)
    return () => window.removeEventListener('updateElement', handleUpdateElement)
  }, [dispatch])

  const frameStyle = useMemo(() => ({
    padding: '4px',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0.08))',
    border: '0, 0, 255, 0.45',
    borderRadius: '0px 0px 28px 28px',
    boxShadow: '0 24px 48px rgba(17, 25, 40, 0.35)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  }), [])

  const stageStyle = useMemo(() => ({
    background: slide?.background || '#ffffff',
    borderRadius: '0px 0px 24px 24px',
  }), [slide?.background])

  const onMouseDown = (e) => {
    if (e.target === stageRef.current) {
      dispatch({ type: 'SELECT_ELEMENT', id: null })
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center" onMouseDown={onMouseDown}>
      <div className="relative aspect-video w-full h-full shadow-lg rounded-[28px]" style={frameStyle}>
        <div ref={containerRef} className="relative bg-white w-full h-full" style={stageStyle}>
          <div ref={stageRef} className="absolute inset-0">
            {isInitialized && slide?.elements.map((el) => (
              <ElementBox 
                key={el.id} 
                el={el} 
                selected={state.selectedElementId === el.id} 
                onSelect={() => dispatch({ type: 'SELECT_ELEMENT', id: el.id })} 
                onDelete={() => dispatch({ type: 'DELETE_ELEMENT', id: el.id })} 
                onChange={(patch) => dispatch({ type: 'UPDATE_ELEMENT', id: el.id, patch })} 
                editingTextId={editingTextId} 
                setEditingTextId={setEditingTextId}
                containerDimensions={containerDimensions}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ElementBox({ el, selected, onSelect, onDelete, onChange, editingTextId, setEditingTextId, containerDimensions }) {
  const boxRef = useRef(null)
  const [drag, setDrag] = useState(null)
  const [resize, setResize] = useState(null)

  // Convert element coordinates to responsive values
  const getResponsiveStyle = useCallback(() => {
    if (!containerDimensions.width || !containerDimensions.height) {
      return {
        left: `${el.x}px`,
        top: `${el.y}px`,
        width: `${el.w}px`,
        height: `${el.h}px`,
      }
    }

    // Use reference dimensions (960x540) to calculate proportional scaling
    const REF_WIDTH = 960
    const REF_HEIGHT = 540
    
    // Calculate scale factors based on current container vs reference
    const scaleX = containerDimensions.width / REF_WIDTH
    const scaleY = containerDimensions.height / REF_HEIGHT
    
    // Apply uniform scaling (use smaller scale to maintain aspect ratio)
    const scale = Math.min(scaleX, scaleY)
    
    return {
      left: `${el.x * scale}px`,
      top: `${el.y * scale}px`,
      width: `${el.w * scale}px`,
      height: `${el.h * scale}px`,
      scale, // Pass scale factor for font scaling
    }
  }, [el.x, el.y, el.w, el.h, containerDimensions])

  const onMouseDown = (e) => {
    e.stopPropagation()
    onSelect()
    const rect = boxRef.current.parentElement.getBoundingClientRect()
    const startX = e.clientX
    const startY = e.clientY
    const offsetX = el.x
    const offsetY = el.y
    setDrag({ startX, startY, offsetX, offsetY, bounds: rect, containerDimensions })
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const onMouseMove = (e) => {
    setDrag((d) => {
      if (!d) return null
      
      // Calculate movement in pixels
      const deltaX = e.clientX - d.startX
      const deltaY = e.clientY - d.startY
      
      // Calculate scale factor to convert screen pixels to logical coordinates
      const REF_WIDTH = 960
      const REF_HEIGHT = 540
      const scaleX = d.containerDimensions.width / REF_WIDTH
      const scaleY = d.containerDimensions.height / REF_HEIGHT
      const scale = Math.min(scaleX, scaleY)
      
      // Convert pixel movement back to logical coordinates
      const logicalDeltaX = deltaX / scale
      const logicalDeltaY = deltaY / scale
      
      // Calculate new position in logical coordinates
      // Restrict element to stay completely within slide boundaries
      const nx = Math.max(0, Math.min(REF_WIDTH - el.w+50, d.offsetX + logicalDeltaX))
      const ny = Math.max(0, Math.min(REF_HEIGHT - el.h, d.offsetY + logicalDeltaY))
      
      onChange({ x: nx, y: ny })
      return { ...d }
    })
  }

  const onMouseUp = () => {
    setDrag(null)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  const startResize = (e, dir) => {
    e.stopPropagation()
    onSelect()
    const startX = e.clientX
    const startY = e.clientY
    setResize({ startX, startY, dir, start: { x: el.x, y: el.y, w: el.w, h: el.h } })
    window.addEventListener('mousemove', onResizing)
    window.addEventListener('mouseup', endResize)
  }

  const onResizing = (e) => {
    setResize((r) => {
      if (!r) return null
      let { x, y, w, h } = r.start
      
      // Calculate scale factor to convert screen pixels to logical coordinates
      const REF_WIDTH = 960
      const REF_HEIGHT = 540
      const scaleX = containerDimensions.width / REF_WIDTH
      const scaleY = containerDimensions.height / REF_HEIGHT
      const scale = Math.min(scaleX, scaleY)
      const MARGIN=50 
      
      // Convert pixel deltas to logical coordinates
      const logicalDx = (e.clientX - r.startX) / scale
      const logicalDy = (e.clientY - r.startY) / scale
      
      if (r.dir.includes('e')) {
        // Expanding eastward - stay within slide boundary
        w = Math.max(40, Math.min(REF_WIDTH - x, r.start.w + logicalDx))
      }
      if (r.dir.includes('s')) {
        // Expanding southward - stay within slide boundary
        h = Math.max(40, Math.min(REF_HEIGHT - y, r.start.h + logicalDy))
      }
      if (r.dir.includes('w')) { 
        // Expanding westward - allow slight negative position to reach edge
        const newW = Math.max(40, r.start.w - logicalDx)
        const newX = Math.max(-MARGIN, r.start.x + logicalDx) // Allow slight negative
        // Apply with generous bounds
        if (newX + newW <= REF_WIDTH + MARGIN * 2) {
          w = newW
          x = newX
        }
      }
      if (r.dir.includes('n')) { 
        // Expanding northward - allow slight negative position to reach edge
        const newH = Math.max(40, r.start.h - logicalDy)
        const newY = Math.max(-MARGIN, r.start.y + logicalDy) // Allow slight negative
        // Apply with generous bounds
        if (newY + newH <= REF_HEIGHT + MARGIN * 2) {
          h = newH
          y = newY
        }
      }
      
      // Final safety check with very generous boundaries
      x = Math.max(-MARGIN, Math.min(REF_WIDTH + MARGIN, x))
      y = Math.max(-MARGIN, Math.min(REF_HEIGHT + MARGIN, y))
      w = Math.min(w, REF_WIDTH + MARGIN * 2)
      h = Math.min(h, REF_HEIGHT + MARGIN * 2)
      
      onChange({ x, y, w, h })
      return { ...r }
    })
  }

  const endResize = () => {
    setResize(null)
    window.removeEventListener('mousemove', onResizing)
    window.removeEventListener('mouseup', endResize)
  }

  const onDoubleClick = () => {
    if (el.type === 'text') setEditingTextId(el.id)
  }
  const stopEditing = () => setEditingTextId(null)

  const responsiveCoords = getResponsiveStyle()
  
  const boxStyle = {
    position: 'absolute',
    ...responsiveCoords,
    transform: `rotate(${el.rotation}deg)`,
    cursor: selected ? 'move' : 'pointer',
    border: el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || '#000000'}` : undefined,
  }

  return (
    <div
      ref={boxRef}
      className={`absolute ${selected ? 'ring-2 ring-brand-500' : ''}`}
      style={boxStyle}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      {renderElement(el, { editing: editingTextId === el.id, onChange, stopEditing, scale: responsiveCoords.scale || 1 })}

          {selected && (
        <>
          {['n','e','s','w','ne','nw','se','sw'].map(dir => (
            <div key={dir} onMouseDown={(e)=>startResize(e, dir)} className={`absolute bg-white border border-brand-500 rounded-full w-3 h-3 -translate-x-1/2 -translate-y-1/2`}
              style={handleStyle(dir, el.w, el.h, containerDimensions)}
            />
          ))}

          {/* Delete button */}
          <button onClick={(e)=>{e.stopPropagation(); onDelete()}} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 text-xs shadow">✕</button>
        </>
      )}
    </div>
  )
}

function handleStyle(dir, w, h, containerDimensions) {
  // Calculate the actual rendered dimensions
  const REF_WIDTH = 960
  const REF_HEIGHT = 540
  const scaleX = containerDimensions.width / REF_WIDTH
  const scaleY = containerDimensions.height / REF_HEIGHT
  const scale = Math.min(scaleX, scaleY)
  
  const scaledW = w * scale
  const scaledH = h * scale
  
  const pos = {
    n: { left: scaledW/2, top: 0 },
    s: { left: scaledW/2, top: scaledH },
    e: { left: scaledW, top: scaledH/2 },
    w: { left: 0, top: scaledH/2 },
    ne: { left: scaledW, top: 0 },
    nw: { left: 0, top: 0 },
    se: { left: scaledW, top: scaledH },
    sw: { left: 0, top: scaledH },
  }
  return pos[dir]
}

function renderElement(el, opts={}) {
  const scale = opts.scale || 1
  switch (el.type) {
    case 'text':
      return <EditableText el={el} editing={opts.editing} onChange={opts.onChange} stopEditing={opts.stopEditing} scale={scale} />
    case 'table':
      return <TableElement el={el} editing={opts.editing} onChange={opts.onChange} stopEditing={opts.stopEditing} scale={scale} />
    case 'chart':
      return <ChartElement el={el} scale={scale} />
    case 'rect':
      return <ShapeWithText el={el} shapeClass="rounded-md" scale={scale} />
    case 'square':
      return <ShapeWithText el={el} shapeClass="rounded-md" scale={scale} />
    case 'circle':
      return <ShapeWithText el={el} shapeClass="rounded-full" scale={scale} />
    case 'triangle':
      return <ShapeWithText el={el} shapeClass="" clipPath="polygon(50% 0%, 0% 100%, 100% 100%)" scale={scale} />
    case 'diamond':
      return <ShapeWithText el={el} shapeClass="" clipPath="polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" scale={scale} />
    case 'star':
      return <ShapeWithText el={el} shapeClass="" clipPath="polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" scale={scale} />
    case 'message':
      return <MessageShape el={el} scale={scale} />
    case 'image':
      return <img src={el.src} alt="" className="w-full h-full object-contain pointer-events-none" draggable={false} />
    default:
      return null
  }
}

function ShapeWithText({ el, shapeClass, clipPath, scale = 1 }) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(el.text || '')
  const inputRef = useRef(null)

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  React.useEffect(() => {
    setText(el.text || '')
  }, [el.text])

  const handleDoubleClick = (e) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (text !== el.text) {
      // Update the element with new text
      window.dispatchEvent(new CustomEvent('updateElement', { 
        detail: { id: el.id, patch: { text } } 
      }))
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleBlur()
    }
    if (e.key === 'Escape') {
      setText(el.text || '')
      setIsEditing(false)
    }
  }

  const shapeStyle = {
    background: el.fill,
    border: `2px solid ${el.stroke}`,
    ...(clipPath && { clipPath })
  }

  return (
    <div 
      className={`w-full h-full ${shapeClass}`}
      style={shapeStyle}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full h-full resize-none outline-none bg-transparent text-center p-2"
          style={{
            color: el.textColor,
            fontSize: `${el.fontSize * scale}px`,
            fontFamily: 'Inter, system-ui, sans-serif'
          }}
        />
      ) : (
        <div 
          className="w-full h-full flex items-center justify-center p-2 cursor-pointer"
          style={{
            color: el.textColor,
            fontSize: `${el.fontSize * scale}px`,
            fontFamily: 'Inter, system-ui, sans-serif',
            wordWrap: 'break-word',
            textAlign: 'center'
          }}
        >
          {text || 'Double-click to edit'}
        </div>
      )}
    </div>
  )
}

function MessageShape({ el, scale = 1 }) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(el.text || 'Message')
  const inputRef = useRef(null)

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  React.useEffect(() => {
    setText(el.text || 'Message')
  }, [el.text])

  const handleDoubleClick = (e) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (text !== el.text) {
      window.dispatchEvent(new CustomEvent('updateElement', { 
        detail: { id: el.id, patch: { text } } 
      }))
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleBlur()
    }
    if (e.key === 'Escape') {
      setText(el.text || 'Message')
      setIsEditing(false)
    }
  }

  return (
    <div 
      className="w-full h-full relative"
      onDoubleClick={handleDoubleClick}
    >
      {/* Message bubble shape */}
      <div 
        className="w-full h-full rounded-lg relative"
        style={{
          background: el.fill,
          border: `2px solid ${el.stroke}`
        }}
      >
        {isEditing ? (
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full resize-none outline-none bg-transparent p-2"
            style={{
              color: el.textColor,
              fontSize: `${el.fontSize * scale}px`,
              fontFamily: 'Inter, system-ui, sans-serif'
            }}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center p-2 cursor-pointer"
            style={{
              color: el.textColor,
              fontSize: `${el.fontSize * scale}px`,
              fontFamily: 'Inter, system-ui, sans-serif',
              wordWrap: 'break-word',
              textAlign: 'center'
            }}
          >
            {text}
          </div>
        )}
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

function ChartElement({ el, scale = 1 }) {
  const { chartType, data, labels, colors } = el
  const [hoveredIndex, setHoveredIndex] = useState(null)
  
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
                className="flex-1 flex flex-col justify-end items-center relative group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ height: '180px' }}
              >
                {/* Bar container */}
                <div 
                  className="w-full rounded-t cursor-pointer transition-all hover:opacity-80 relative"
                  style={{ 
                    height: `${actualHeight}px`,
                    backgroundColor: colors[index % colors.length],
                    minHeight: '2px'
                  }}
                />
                
                {/* Tooltip */}
                {hoveredIndex === index && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded text-xs whitespace-nowrap z-10 shadow-lg">
                    {labels[index]}: {value}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-around border-t border-gray-300 pt-2 mt-2 h-8">
          {labels.map((label, index) => (
            <span 
              key={index} 
              className="text-gray-600 text-center flex-1 truncate" 
              style={{ fontSize: `${10 * scale}px` }}
              title={label}
            >
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
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            )
          })}
        </svg>
        <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
          {labels.map((label, index) => (
            <span 
              key={index} 
              className="text-gray-600 truncate" 
              style={{ fontSize: `${10 * scale}px` }}
            >
              {label}
            </span>
          ))}
        </div>
        
        {hoveredIndex !== null && (
          <div 
            className="absolute bg-gray-900 text-white px-3 py-1.5 rounded text-xs whitespace-nowrap z-10 pointer-events-none"
            style={{
              left: `${(hoveredIndex / (data.length - 1)) * 80 + 10}%`,
              top: `${(90 - ((data[hoveredIndex] - minValue) / range) * 80) * 0.7}%`
            }}
          >
            {labels[hoveredIndex]}: {data[hoveredIndex]}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
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
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            )
          })}
        </svg>
        
        <div className="flex flex-col gap-1">
          {data.map((value, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span 
                className="text-gray-700" 
                style={{ fontSize: `${10 * scale}px` }}
              >
                {labels[index]}: {value}
              </span>
            </div>
          ))}
        </div>
        
        {hoveredIndex !== null && (
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1.5 rounded text-xs whitespace-nowrap z-10 pointer-events-none">
            {labels[hoveredIndex]}: {data[hoveredIndex]} ({((data[hoveredIndex] / total) * 100).toFixed(1)}%)
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    )
  }
  
  return null
}

function TableElement({ el, editing, onChange, stopEditing, scale = 1 }) {
  const [editingCellIndex, setEditingCellIndex] = useState(null)
  
  const cellWidth = el.w / el.cols
  const cellHeight = el.h / el.rows
  
  const updateCell = (cellIndex, newText) => {
    const newCells = [...el.cells]
    newCells[cellIndex] = { ...newCells[cellIndex], text: newText }
    onChange({ cells: newCells })
  }
  
  return (
    <div className="w-full h-full relative bg-white">
      {el.cells.map((cell, index) => {
        const row = Math.floor(index / el.cols)
        const col = index % el.cols
        const isEditing = editingCellIndex === index
        
        return (
          <div
            key={cell.id}
            className="absolute border border-black"
            style={{
              left: col * cellWidth,
              top: row * cellHeight,
              width: cellWidth,
              height: cellHeight,
            }}
            onDoubleClick={(e) => {
              e.stopPropagation()
              setEditingCellIndex(index)
            }}
          >
            {isEditing ? (
              <textarea
                autoFocus
                value={cell.text}
                onChange={(e) => updateCell(index, e.target.value)}
                onBlur={() => setEditingCellIndex(null)}
                className="w-full h-full resize-none outline-none p-2"
                style={{
                  fontSize: `${cell.styles.fontSize * scale}px`,
                  fontFamily: cell.styles.fontFamily,
                  color: cell.styles.color,
                  fontWeight: cell.styles.bold ? 700 : 400,
                  fontStyle: cell.styles.italic ? 'italic' : 'normal',
                  textDecoration: cell.styles.underline ? 'underline' : 'none',
                  textAlign: cell.styles.align,
                  display: 'flex',
                  alignItems: cell.styles.valign === 'middle' ? 'center' : 
                            cell.styles.valign === 'bottom' ? 'flex-end' : 'flex-start'
                }}
              />
            ) : (
              <div
                className="w-full h-full p-2 select-none"
                style={{
                  fontSize: `${cell.styles.fontSize * scale}px`,
                  fontFamily: cell.styles.fontFamily,
                  color: cell.styles.color,
                  fontWeight: cell.styles.bold ? 700 : 400,
                  fontStyle: cell.styles.italic ? 'italic' : 'normal',
                  textDecoration: cell.styles.underline ? 'underline' : 'none',
                  textAlign: cell.styles.align,
                  whiteSpace: 'pre-wrap',
                  display: 'flex',
                  alignItems: cell.styles.valign === 'middle' ? 'center' : 
                            cell.styles.valign === 'bottom' ? 'flex-end' : 'flex-start'
                }}
              >
                {cell.text}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function EditableText({ el, editing, onChange, stopEditing, scale = 1 }) {
  const [val, setVal] = useState(el.text)
  const inputRef = useRef(null)

  React.useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  React.useEffect(() => { setVal(el.text) }, [el.text])

  // Use rich text editor when editing
  if (editing) {
    return <RichTextEditor ref={window.currentTextEditorRef} el={el} onChange={onChange} onBlur={stopEditing} />
  }

  const bgColor = el.bgColor || 'transparent'
  const listStyle = el.styles?.listStyle || 'none'

  const toRoman = (num) => {
    const romanNumerals = [
      ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
    ]
    let result = ''
    for (const [roman, value] of romanNumerals) {
      while (num >= value) {
        result += roman
        num -= value
      }
    }
    return result
  }

  const formatTextWithList = (text) => {
    if (listStyle === 'none' || !text) return text
    
    const lines = text.split('\n')
    return lines.map((line, index) => {
      if (!line.trim()) return line
      
      let prefix = ''
      switch (listStyle) {
        case 'bullet':
          prefix = '• '
          break
        case 'number':
          prefix = `${index + 1}. `
          break
        case 'roman':
          prefix = `${toRoman(index + 1)}. `
          break
        case 'alpha':
          prefix = `${String.fromCharCode(65 + index)}. `
          break
        default:
          prefix = ''
      }
      
      // Don't add prefix if it already exists
      if (line.trim().startsWith('•') || /^\d+\./.test(line.trim()) || /^[A-Z]+\./.test(line.trim()) || /^[IVX]+\./.test(line.trim())) {
        return line
      }
      
      return prefix + line
    }).join('\n')
  }

  // Helper function to get vertical alignment styles
  const getVerticalAlignStyle = () => {
    const valign = el.styles?.valign || 'top'
    switch (valign) {
      case 'top':
        return { justifyContent: 'flex-start' }
      case 'middle':
        return { justifyContent: 'center' }
      case 'bottom':
        return { justifyContent: 'flex-end' }
      default:
        return { justifyContent: 'flex-start' }
    }
  }
  if (!editing) {
    // If HTML content exists, render it
    if (el.html) {
      const align = el.styles.align || 'left'
      const getHorizontalAlignment = () => {
        switch (align) {
          case 'center': return 'center'
          case 'right': return 'flex-end'
          case 'justify': return 'space-between'
          default: return 'flex-start'
        }
      }
      
      return (
        <div 
          className="w-full h-full select-none p-2" 
          style={{ 
            backgroundColor: bgColor, 
            fontFamily: el.styles.fontFamily, 
            fontSize: `${el.styles.fontSize * scale}px`, 
            whiteSpace: 'nowrap', // Keep text in single line
            overflow: 'hidden', // Hide overflow
            textOverflow: 'ellipsis', // Add ellipsis for long text
            display: 'flex',
            justifyContent: getHorizontalAlignment(),
            alignItems: el.styles?.valign === 'middle' ? 'center' : 
                        el.styles?.valign === 'bottom' ? 'flex-end' : 'flex-start',
          }}
          dangerouslySetInnerHTML={{ __html: el.html }}
        />
      )
    }
    
    // Otherwise render plain text with list formatting
    const align = el.styles.align || 'left'
    const getHorizontalAlignment = () => {
      switch (align) {
        case 'center': return 'center'
        case 'right': return 'flex-end'
        case 'justify': return 'space-between'
        default: return 'flex-start'
      }
    }
    
    return (
      <div className="w-full h-full select-none p-2" style={{ 
        backgroundColor: bgColor, 
        fontFamily: el.styles.fontFamily, 
        color: el.styles.color, 
        fontSize: `${el.styles.fontSize * scale}px`, 
        fontWeight: el.styles.bold ? 700 : 400, 
        fontStyle: el.styles.italic ? 'italic' : 'normal', 
        textDecoration: el.styles.underline ? 'underline' : 'none', 
        whiteSpace: 'nowrap', // Keep text in single line like before editing
        overflow: 'hidden', // Hide overflow to prevent text from spilling out
        textOverflow: 'ellipsis', // Add ellipsis for long text
        display: 'flex',
        justifyContent: getHorizontalAlignment(),
        alignItems: el.styles?.valign === 'middle' ? 'center' : 
                    el.styles?.valign === 'bottom' ? 'flex-end' : 'flex-start',
      }}>
        {formatTextWithList(el.text)}
      </div>
    )
  }

  return (
    <textarea ref={inputRef} value={val} onChange={(e)=>setVal(e.target.value)} onBlur={()=>{ onChange({ text: val }); stopEditing() }}
      className="w-full h-full resize-none outline-none p-2"
      style={{ 
        backgroundColor: bgColor, 
        fontFamily: el.styles.fontFamily, 
        color: el.styles.color, 
        fontSize: `${el.styles.fontSize * scale}px`, 
        fontWeight: el.styles.bold ? 700 : 400, 
        fontStyle: el.styles.italic ? 'italic' : 'normal', 
        textDecoration: el.styles.underline ? 'underline' : 'none', 
        textAlign: el.styles.align || 'left',
      }}
    />
  )
}
