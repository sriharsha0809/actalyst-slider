import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { useSlides } from '../context/SlidesContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import RichTextEditor from './RichTextEditor.jsx'
import KeynoteChart from './KeynoteChart.jsx'
import KeynotePieChart from './KeynotePieChart.jsx'
import KeynoteLineChart from './KeynoteLineChart.jsx'
import KeynoteBarChart from './KeynoteBarChart.jsx'

// Global no-select helper shared by all element interactions
let __noSelectCount = 0
function setGlobalNoSelect(enable) {
  const root = typeof document !== 'undefined' ? document.documentElement : null
  if (!root) return
  if (enable) {
    __noSelectCount += 1
    if (__noSelectCount === 1) root.classList.add('no-user-select')
  } else {
    __noSelectCount = Math.max(0, __noSelectCount - 1)
    if (__noSelectCount === 0) root.classList.remove('no-user-select')
  }
}

export default function SlideCanvas() {
  const { state, dispatch } = useSlides()
  const slide = state.slides.find(s => s.id === state.currentSlideId)
  const stageRef = useRef(null)
  const containerRef = useRef(null)
  const [editingTextId, setEditingTextId] = useState(null)
  const [editingShapeId, setEditingShapeId] = useState(null)
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
    const handleEditShapeText = (event) => {
      const id = event?.detail?.id
      if (id) setEditingShapeId(id)
    }
    const handleEditTextBox = (event) => {
      const id = event?.detail?.id
      if (id) setEditingTextId(id)
    }
    const handleStopShapeText = (event) => {
      const id = event?.detail?.id
      // If id matches or unspecified, clear editing state
      if (!id || id === editingShapeId) setEditingShapeId(null)
    }
    
    window.addEventListener('updateElement', handleUpdateElement)
    window.addEventListener('editShapeText', handleEditShapeText)
    window.addEventListener('stopShapeText', handleStopShapeText)
    window.addEventListener('editTextBox', handleEditTextBox)
    return () => {
      window.removeEventListener('updateElement', handleUpdateElement)
      window.removeEventListener('editShapeText', handleEditShapeText)
      window.removeEventListener('stopShapeText', handleStopShapeText)
      window.removeEventListener('editTextBox', handleEditTextBox)
    }
  }, [dispatch, editingShapeId])

  // Ensure only the selected text box is editable
  React.useEffect(() => {
    if (editingTextId && state.selectedElementId !== editingTextId) {
      setEditingTextId(null)
    }
  }, [state.selectedElementId, editingTextId])

  // Relaxed: do not interfere with selection/caret. This prevents editors from losing focus/caret.
  React.useEffect(() => {
    const onSelectionChange = () => {}
    document.addEventListener('selectionchange', onSelectionChange)
    return () => document.removeEventListener('selectionchange', onSelectionChange)
  }, [])

  const frameStyle = useMemo(() => ({
    padding: '0px',
    background: '#f2f2f2', // unify gap bg
    border: 'transparent',
    borderRadius: '0px',
    boxShadow: '0 32px 64px rgba(17, 25, 40, 0.5)',
  }), [])

  const stageStyle = useMemo(() => ({
    background: '#f2f2f2', // 95% white + 5% black gap background
    borderRadius: '0px',
  }), [])

  const onMouseDown = (e) => {
    if (e.target === stageRef.current) {
      // Deselect any selected element and exit text editing
      dispatch({ type: 'SELECT_ELEMENT', id: null })
      setEditingTextId(null)
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center" onMouseDown={onMouseDown}>
      <div className="relative w-full h-full shadow-lg" style={frameStyle}>
        <div ref={containerRef} data-slide-container className="relative w-full h-full" style={stageStyle} onMouseDown={(e) => {
            const withinBox = (e.target instanceof Element) ? e.target.closest('[data-el-box]') : null
            if (!withinBox) {
              dispatch({ type: 'SELECT_ELEMENT', id: null })
              try {
                const sel = window.getSelection?.()
                if (sel && sel.removeAllRanges) sel.removeAllRanges()
                if (document && document.activeElement && typeof document.activeElement.blur === 'function') {
                  document.activeElement.blur()
                }
              } catch {}
              setEditingTextId(null)
              setEditingShapeId(null)
            }
          }}>
          <div ref={stageRef} className="absolute inset-0">
            {/* Centered slide background rectangle */}
            <SlideBackground containerDimensions={containerDimensions} background={slide?.background || '#ffffff'} />
            {isInitialized && slide?.elements.map((el, idx) => (
              <ElementBox 
                key={el.id || `el-${idx}`} 
                el={el} 
                selected={state.selectedElementId === el.id} 
                onSelect={() => dispatch({ type: 'SELECT_ELEMENT', id: el.id })} 
                onDelete={() => dispatch({ type: 'DELETE_ELEMENT', id: el.id })} 
                onChange={(patch) => dispatch({ type: 'UPDATE_ELEMENT', id: el.id, patch })} 
                editingTextId={editingTextId} 
                setEditingTextId={setEditingTextId}
                containerDimensions={containerDimensions}
                shapeEditingId={editingShapeId}
                slideId={slide?.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ElementBox({ el, selected, onSelect, onDelete, onChange, editingTextId, setEditingTextId, containerDimensions, shapeEditingId, slideId }) {
  const boxRef = useRef(null)
  const [drag, setDrag] = useState(null)
  const [resize, setResize] = useState(null)
  const [rotating, setRotating] = useState(null)
  const dragStartTimerRef = useRef(null)
  const isPressedRef = useRef(false)
  // Refs to hold live interaction data to avoid dispatching during render
  const dragDataRef = useRef(null)
  const rotateDataRef = useRef(null)
  const resizeDataRef = useRef(null)
  // Drag threshold helpers to avoid stealing double-clicks and typing focus
  const downPosRef = useRef(null)
  const thresholdMoveHandlerRef = useRef(null)
  const thresholdUpHandlerRef = useRef(null)

  // Helper: determine if the event is a primary activation across mouse/pen/touch
  const isPrimaryPointer = (evt) => {
    try {
      if (typeof evt.pointerType === 'string') return !!evt.isPrimary
      if (typeof evt.button === 'number') return evt.button === 0
    } catch {}
    return false
  }

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

    // Center the slide content within the container (letterboxing offsets)
    const contentW = REF_WIDTH * scale
    const contentH = REF_HEIGHT * scale
    const offsetX = Math.max(0, (containerDimensions.width - contentW) / 2)
    const offsetY = Math.max(0, (containerDimensions.height - contentH) / 2)
    
    return {
      left: `${offsetX + el.x * scale}px`,
      top: `${offsetY + el.y * scale}px`,
      width: `${el.w * scale}px`,
      height: `${el.h * scale}px`,
      scale, // Pass scale factor for font scaling
    }
  }, [el.x, el.y, el.w, el.h, containerDimensions])

  const startDragFromEvent = (ev) => {
    const containerEl = document.querySelector('[data-slide-container]')
    const containerRect = containerEl?.getBoundingClientRect()
    if (!containerRect) return
    const startX = ev.clientX
    const startY = ev.clientY
    const REF_WIDTH = 960
    const REF_HEIGHT = 540
    const scaleX = (containerRect.width) / REF_WIDTH
    const scaleY = (containerRect.height) / REF_HEIGHT
    const scale = Math.min(scaleX, scaleY)
    const data = { containerRect, startX, startY, startElX: el.x, startElY: el.y, scale }
    dragDataRef.current = data
    setDrag(data)
    setGlobalNoSelect(true)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('pointermove', onMouseMove)
    window.addEventListener('pointerup', onMouseUp)
    window.addEventListener('pointercancel', onMouseUp)
    window.addEventListener('blur', onMouseUp)
  }

  const onMouseDown = (e) => {
    // Only respond to primary/primary-like pointer across input types
    if (!isPrimaryPointer(e)) return
    // If this is part of a double-click (detail >= 2), don't start a drag so editing handlers can run
    try { if (e.detail && e.detail >= 2) return } catch {}

    // Do not start dragging when interacting with inline editors/inputs inside the box
    const target = e.target instanceof Element ? e.target : null
    const interactive = target ? target.closest('[contenteditable="true"], textarea, input') : null
    if (interactive) return

    // Special case: inside a table cell wrapper
    const insideTableCell = !!(target && target.closest('[data-table-cell]'))
    if (insideTableCell) {
      e.stopPropagation()
      e.preventDefault()
      onSelect()
      return // Don't start dragging when clicking table cells
    }

    // If shape text editing is active for this element, do not drag
    if (shapeEditingId === el.id) return

    isPressedRef.current = true
    onSelect()

    // Defer drag start until pointer moves beyond a small threshold to preserve double-clicks/typing
    downPosRef.current = { x: e.clientX, y: e.clientY }
    const threshold = 4
    const maybeStart = (ev) => {
      if (!downPosRef.current) return
      const dx = (ev.clientX ?? 0) - downPosRef.current.x
      const dy = (ev.clientY ?? 0) - downPosRef.current.y
      if (Math.hypot(dx, dy) >= threshold) {
        // Start drag using current pointer location for freshest layout
        startDragFromEvent(ev)
        // Cleanup threshold listeners (startDragFromEvent installs its own)
        try {
          window.removeEventListener('mousemove', thresholdMoveHandlerRef.current)
          window.removeEventListener('pointermove', thresholdMoveHandlerRef.current)
          window.removeEventListener('mouseup', thresholdUpHandlerRef.current)
          window.removeEventListener('pointerup', thresholdUpHandlerRef.current)
        } catch {}
        thresholdMoveHandlerRef.current = null
        thresholdUpHandlerRef.current = null
        downPosRef.current = null
      }
    }
    const clearPending = () => {
      try {
        window.removeEventListener('mousemove', thresholdMoveHandlerRef.current)
        window.removeEventListener('pointermove', thresholdMoveHandlerRef.current)
        window.removeEventListener('mouseup', thresholdUpHandlerRef.current)
        window.removeEventListener('pointerup', thresholdUpHandlerRef.current)
      } catch {}
      thresholdMoveHandlerRef.current = null
      thresholdUpHandlerRef.current = null
      downPosRef.current = null
    }
    // Prevent text selection and other handlers during pending drag (but not when inside a table cell to preserve dblclick)
    if (!insideTableCell) { try { e.stopPropagation(); e.preventDefault() } catch {} }
    thresholdMoveHandlerRef.current = maybeStart
    thresholdUpHandlerRef.current = clearPending
    window.addEventListener('mousemove', thresholdMoveHandlerRef.current)
    window.addEventListener('pointermove', thresholdMoveHandlerRef.current)
    window.addEventListener('mouseup', thresholdUpHandlerRef.current)
    window.addEventListener('pointerup', thresholdUpHandlerRef.current)
  }

  const onMouseMove = (e) => {
    // Continue dragging until explicit mouseup
    e.preventDefault()
    const d = dragDataRef.current
    if (!d) return
    const { startX, startY, startElX, startElY, scale } = d

    const REF_WIDTH = 960
    const REF_HEIGHT = 540

    // Compute logical deltas from pointer movement
    const dxLogical = (e.clientX - startX) / scale
    const dyLogical = (e.clientY - startY) / scale

    let nx = startElX + dxLogical
    let ny = startElY + dyLogical

    // Clamp using rotated AABB so the element stays within slide while dragging
    const rot = Number.isFinite(el.rotation) ? el.rotation : 0
    const rad = (rot * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const halfW = (el.w || 0) / 2
    const halfH = (el.h || 0) / 2
    const extX = Math.abs(halfW * cos) + Math.abs(halfH * sin)
    const extY = Math.abs(halfW * sin) + Math.abs(halfH * cos)
    let cx = nx + halfW
    let cy = ny + halfH
    const minCx = extX
    const maxCx = REF_WIDTH - extX
    const minCy = extY
    const maxCy = REF_HEIGHT - extY
    if (minCx > maxCx) { cx = REF_WIDTH / 2 } else { cx = Math.max(minCx, Math.min(maxCx, cx)) }
    if (minCy > maxCy) { cy = REF_HEIGHT / 2 } else { cy = Math.max(minCy, Math.min(maxCy, cy)) }
    nx = Math.max(0, Math.min(REF_WIDTH - el.w, cx - halfW))
    ny = Math.max(0, Math.min(REF_HEIGHT - el.h, cy - halfH))

    onChange({ x: nx, y: ny })
  }

  const onMouseUp = () => {
    isPressedRef.current = false
    if (dragStartTimerRef.current) {
      try { clearTimeout(dragStartTimerRef.current) } catch {}
      dragStartTimerRef.current = null
    }
    dragDataRef.current = null
    setDrag(null)
    setGlobalNoSelect(false)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('pointermove', onMouseMove)
    window.removeEventListener('pointerup', onMouseUp)
    window.removeEventListener('pointercancel', onMouseUp)
    window.removeEventListener('blur', onMouseUp)
  }

  const startRotate = (e) => {
    if (!isPrimaryPointer(e)) return
    e.stopPropagation()
    e.preventDefault()
    onSelect()
    if (!boxRef.current) return
    const rect = boxRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const angleFromCenter = (clientX, clientY) => Math.atan2(clientY - centerY, clientX - centerX) * 180 / Math.PI
    const startAngle = angleFromCenter(e.clientX, e.clientY)
    const startRotation = Number.isFinite(el.rotation) ? el.rotation : 0
    const data = { centerX, centerY, startAngle, startRotation }
    rotateDataRef.current = data
    setRotating(data)
    setGlobalNoSelect(true)
    window.addEventListener('mousemove', onRotating)
    window.addEventListener('mouseup', endRotate)
    window.addEventListener('pointermove', onRotating)
    window.addEventListener('pointerup', endRotate)
  }

  const onRotating = (e) => {
    // Continue rotating until explicit mouseup
    e.preventDefault()
    const r = rotateDataRef.current
    if (!r) return
    const angle = Math.atan2(e.clientY - r.centerY, e.clientX - r.centerX) * 180 / Math.PI
    let newRot = r.startRotation + (angle - r.startAngle)
    // Normalize to [-180, 180]
    newRot = ((newRot + 180) % 360 + 360) % 360 - 180
    // Snap with Shift to 15deg
    if (e.shiftKey) newRot = Math.round(newRot / 15) * 15

    // Keep rotated AABB within slide bounds by adjusting center (cx, cy)
    const REF_WIDTH = 960
    const REF_HEIGHT = 540
    const rad = (newRot * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const halfW = (el.w || 0) / 2
    const halfH = (el.h || 0) / 2
    // Rotated AABB half-extents
    const extX = Math.abs(halfW * cos) + Math.abs(halfH * sin)
    const extY = Math.abs(halfW * sin) + Math.abs(halfH * cos)
    // Current center from element logical x,y
    let cx = (el.x || 0) + halfW
    let cy = (el.y || 0) + halfH
    // Clamp center so AABB stays inside slide
    const minCx = extX
    const maxCx = REF_WIDTH - extX
    const minCy = extY
    const maxCy = REF_HEIGHT - extY
    // If element is too large to fully fit, center it as best effort
    if (minCx > maxCx) { cx = REF_WIDTH / 2 } else { cx = Math.max(minCx, Math.min(maxCx, cx)) }
    if (minCy > maxCy) { cy = REF_HEIGHT / 2 } else { cy = Math.max(minCy, Math.min(maxCy, cy)) }
    const nx = Math.max(0, Math.min(REF_WIDTH - el.w, cx - halfW))
    const ny = Math.max(0, Math.min(REF_HEIGHT - el.h, cy - halfH))

    onChange({ rotation: Math.round(newRot), x: Math.round(nx), y: Math.round(ny) })
  }

  const endRotate = () => {
    rotateDataRef.current = null
    setRotating(null)
    setGlobalNoSelect(false)
    window.removeEventListener('mousemove', onRotating)
    window.removeEventListener('mouseup', endRotate)
    window.removeEventListener('pointermove', onRotating)
    window.removeEventListener('pointerup', endRotate)
  }

  const startResize = (e, dir) => {
    if (!isPrimaryPointer(e)) return
    e.stopPropagation()
    e.preventDefault()
    onSelect()
    const startX = e.clientX
    const startY = e.clientY
    const data = { startX, startY, dir, start: { x: el.x, y: el.y, w: el.w, h: el.h } }
    resizeDataRef.current = data
    setResize(data)
    setGlobalNoSelect(true)
    window.addEventListener('mousemove', onResizing)
    window.addEventListener('mouseup', endResize)
    window.addEventListener('pointermove', onResizing)
    window.addEventListener('pointerup', endResize)
  }

  const onResizing = (e) => {
    // Continue resizing until explicit mouseup
    e.preventDefault()
    const r = resizeDataRef.current
    if (!r) return
    let { x, y, w, h } = r.start
    
    // Calculate scale factor to convert screen pixels to logical coordinates
    const REF_WIDTH = 960
    const REF_HEIGHT = 540
    const scaleX = containerDimensions.width / REF_WIDTH
    const scaleY = containerDimensions.height / REF_HEIGHT
    const scale = Math.min(scaleX, scaleY)
    const MARGIN=0 
    
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
    
    // Final safety check within slide boundaries
    // Ensure position is not negative; if it is, reduce size accordingly
    if (x < 0) { w += x; x = 0 }
    if (y < 0) { h += y; y = 0 }
    // Ensure size is within bounds and element stays inside the slide
    w = Math.max(40, Math.min(w, REF_WIDTH - x))
    h = Math.max(40, Math.min(h, REF_HEIGHT - y))
    x = Math.max(0, Math.min(x, REF_WIDTH - w))
    y = Math.max(0, Math.min(y, REF_HEIGHT - h))
    
    onChange({ x, y, w, h })
  }

  const endResize = () => {
    resizeDataRef.current = null
    setResize(null)
    setGlobalNoSelect(false)
    window.removeEventListener('mousemove', onResizing)
    window.removeEventListener('mouseup', endResize)
    window.removeEventListener('pointermove', onResizing)
    window.removeEventListener('pointerup', endResize)
  }

  const onDoubleClick = (e) => {
    // Cancel any pending drag timer so dblclick can enter edit
    if (dragStartTimerRef.current) { try { clearTimeout(dragStartTimerRef.current) } catch {}; dragStartTimerRef.current = null }
    try { onMouseUp() } catch {}
    if (el.type === 'text') {
      e?.stopPropagation?.()
      e?.preventDefault?.()
      onSelect()
      setEditingTextId(el.id)
    }
    // For tables, double-click is handled by the TableElement component itself
    if (el.type === 'table') {
      // Let the event propagate to table cells
      return
    }
    // For non-text (shapes), allow event to bubble to the shape's own double-click handler
  }
  const stopEditing = () => {
    try {
      const sel = window.getSelection?.()
      if (sel && sel.removeAllRanges) sel.removeAllRanges()
      if (document && document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur()
      }
    } catch {}
    setEditingTextId(null)
  }

  const responsiveCoords = getResponsiveStyle()
  const localScale = responsiveCoords.scale || 1
  const { scale: _omitScale, ...coords } = responsiveCoords
  
  const boxStyle = {
    position: 'absolute',
    ...coords,
    transform: `rotate(${Number.isFinite(el.rotation) ? el.rotation : 0}deg)`,
    transformOrigin: 'center center',
    cursor: selected ? 'move' : 'pointer',
    border: el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || '#000000'}` : undefined,
  }

  return (
    <div
      ref={boxRef}
      data-el-box
      data-el-id={el.id}
      draggable={false}
      className={`absolute ${selected ? 'ring-2 ring-brand-500' : ''}`}
      style={{ ...boxStyle, zIndex: selected ? 20 : 10, pointerEvents: 'auto', userSelect: 'auto', WebkitUserSelect: 'auto', touchAction: 'none' }}
      onMouseDown={onMouseDown}
      onPointerDown={(e)=>{
        // If interacting with an editor or table cell, don't capture or start drag
        const target = e.target instanceof Element ? e.target : null
        const interactive = target ? target.closest('[contenteditable="true"], textarea, input') : null
        const inTableCell = target ? target.closest('[data-table-cell]') : null
        if (interactive || inTableCell) return
        // Prefer pointer events for reliable capture across devices
        try { if (e.isPrimary) e.currentTarget.setPointerCapture(e.pointerId) } catch {}
        // Skip initiating drag if this is a double tap/click
        if ((e.detail && e.detail >= 2)) return
        // Emulate the same behavior as mouse down for dragging across devices
        if (isPrimaryPointer(e)) onMouseDown(e)
      }}
      onDoubleClick={onDoubleClick}
    >
      {renderElement(el, { editing: ((editingTextId === el.id || shapeEditingId === el.id) && selected), onChange, stopEditing, scale: localScale, selected, onSelect, slideId })}

          {selected && (
        <>
          {['n','e','s','w','ne','nw','se','sw'].map(dir => (
              <div
                key={dir}
                onMouseDown={(e)=>startResize(e, dir)}
                onPointerDown={(e)=>{ try { if (e.isPrimary) e.currentTarget.setPointerCapture(e.pointerId) } catch {}; if (isPrimaryPointer(e)) startResize(e, dir) }}
                className={`absolute bg-white border border-brand-500 rounded-full w-3 h-3 -translate-x-1/2 -translate-y-1/2`}
                style={{
                  ...handleStyle(dir, el.w, el.h, containerDimensions),
                  cursor: resizeCursor(dir),
                  pointerEvents: 'auto',
                  zIndex: 25,
                  touchAction: 'none',
                }}
              />
          ))}

          {/* Rotation handle */}
          <div
            onMouseDown={startRotate}
            onPointerDown={(e)=>{ try { if (e.isPrimary) e.currentTarget.setPointerCapture(e.pointerId) } catch {}; if (isPrimaryPointer(e)) startRotate(e) }}
            title="Rotate"
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border border-brand-500 rounded-full shadow"
            style={{ cursor: 'grab', pointerEvents: 'auto', zIndex: 25, touchAction: 'none' }}
          />

          {/* Move handle */}
          <div
            onMouseDown={(e)=>{ e.preventDefault(); e.stopPropagation(); startDragFromEvent(e) }}
            onPointerDown={(e)=>{ e.preventDefault(); e.stopPropagation(); try { if (e.isPrimary) e.currentTarget.setPointerCapture(e.pointerId) } catch {}; startDragFromEvent(e) }}
            title="Move"
            className="absolute -top-3 left-3 w-6 h-6 bg-white border border-brand-500 rounded-full shadow flex items-center justify-center"
            style={{ cursor: 'move', pointerEvents: 'auto', zIndex: 25, touchAction: 'none' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>

          {/* Delete button */}
          <button
            type="button"
            onPointerDown={(e)=>{ e.preventDefault(); e.stopPropagation(); }}
            onMouseDown={(e)=>{ e.preventDefault(); e.stopPropagation(); }}
            onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); onDelete() }}
            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 text-xs shadow"
            style={{ zIndex: 99, pointerEvents: 'auto', touchAction: 'none' }}
            title="Delete"
            aria-label="Delete element"
          >
            ✕
          </button>
        </>
      )}
    </div>
  )
}

function SlideBackground({ containerDimensions, background }) {
  const { isDark } = useTheme()
  const REF_WIDTH = 960
  const REF_HEIGHT = 540
  const scale = Math.min(
    (containerDimensions.width || 0) / REF_WIDTH,
    (containerDimensions.height || 0) / REF_HEIGHT,
  ) || 0
  const contentW = REF_WIDTH * scale
  const contentH = REF_HEIGHT * scale
  const offsetX = Math.max(0, (containerDimensions.width - contentW) / 2)
  const offsetY = Math.max(0, (containerDimensions.height - contentH) / 2)

  // Support string (color/gradient) or image object { type:'image', src, mode }
  const baseStyle = { position: 'absolute', left: offsetX, top: offsetY, width: contentW, height: contentH, border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 28px rgba(0,0,0,0.35), 0 2px 10px rgba(0,0,0,0.25)' }
  let bgStyle = {}
  if (background && typeof background === 'object' && background.type === 'image' && background.src) {
    const size = (background.mode === 'stretch') ? '100% 100%' : (background.mode === 'custom' && typeof background.scale === 'number') ? `${background.scale}% auto` : (background.mode || 'cover')
    bgStyle = { backgroundImage: `url(${background.src})`, backgroundSize: size, backgroundPosition: (background.position || 'center'), backgroundRepeat: 'no-repeat' }
  } else if (typeof background === 'string') {
    bgStyle = { background: background }
  } else {
    bgStyle = { background: '#ffffff' }
  }

  return (
    <div style={{ ...baseStyle, ...bgStyle }} />
  )
}

function resizeCursor(dir) {
  switch (dir) {
    case 'n':
    case 's':
      return 'ns-resize'
    case 'e':
    case 'w':
      return 'ew-resize'
    case 'ne':
    case 'sw':
      return 'nesw-resize'
    case 'nw':
    case 'se':
      return 'nwse-resize'
    default:
      return 'default'
  }
}

function handleStyle(dir, w, h, containerDimensions) {
  // Calculate the actual rendered dimensions with safe fallback
  const REF_WIDTH = 960
  const REF_HEIGHT = 540
  let scale = 1
  if (containerDimensions && containerDimensions.width > 0 && containerDimensions.height > 0) {
    const scaleX = containerDimensions.width / REF_WIDTH
    const scaleY = containerDimensions.height / REF_HEIGHT
    scale = Math.min(scaleX, scaleY) || 1
  }
  
  const scaledW = (Number(w) || 0) * scale
  const scaledH = (Number(h) || 0) * scale
  
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
      return <TableElement el={el} editing={opts.editing} selected={opts.selected} onSelect={opts.onSelect} onChange={opts.onChange} stopEditing={opts.stopEditing} scale={scale} />
    case 'chart':
      return <ChartElement el={el} scale={scale} slideId={opts.slideId} selected={opts.selected} />
    case 'rect':
      return <ShapeWithText el={el} shapeClass="rounded-md" scale={scale} onChange={opts.onChange} editing={opts.editing} />
    case 'square':
      return <ShapeWithText el={el} shapeClass="rounded-md" scale={scale} onChange={opts.onChange} editing={opts.editing} />
    case 'circle':
      return <ShapeWithText el={el} shapeClass="rounded-full" scale={scale} onChange={opts.onChange} editing={opts.editing} />
    case 'triangle':
      return <ShapeWithText el={el} shapeClass="" clipPath="polygon(50% 0%, 0% 100%, 100% 100%)" scale={scale} onChange={opts.onChange} editing={opts.editing} />
    case 'diamond':
      return <ShapeWithText el={el} shapeClass="" clipPath="polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" scale={scale} onChange={opts.onChange} editing={opts.editing} />
    case 'star':
      return <ShapeWithText el={el} shapeClass="" clipPath="polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" scale={scale} onChange={opts.onChange} editing={opts.editing} />
    case 'roundRect':
      return <ShapeWithText el={el} shapeClass="rounded-xl" scale={scale} onChange={opts.onChange} editing={opts.editing} />
    case 'parallelogram':
      return <ShapeWithText el={el} clipPath="polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)" scale={scale} onChange={opts.onChange} editing={opts.editing} />
    case 'trapezoid':
      return <ShapeWithText el={el} clipPath="polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)" scale={scale} onChange={opts.onChange} editing={opts.editing} />
    case 'pentagon':
      return <ShapeWithText el={el} clipPath="polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)" scale={scale} onChange={opts.onChange} editing={opts.editing} />
    case 'hexagon':
      return <ShapeWithText el={el} clipPath="polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" scale={scale} onChange={opts.onChange} editing={opts.editing} />
    case 'octagon':
      return <ShapeWithText el={el} clipPath="polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" scale={scale} onChange={opts.onChange} editing={opts.editing} />
    case 'chevron':
      return <ShapeWithText el={el} clipPath="polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%)" scale={scale} onChange={opts.onChange} editing={opts.editing} />
    case 'arrowRight':
      return <ShapeWithText el={el} clipPath="polygon(0% 0%, 80% 0%, 80% 25%, 100% 50%, 80% 75%, 80% 100%, 0% 100%, 0% 0%)" scale={scale} onChange={opts.onChange} editing={opts.editing} />
    case 'cloud':
      return <ShapeWithText el={el} clipPath="polygon(10% 60%, 20% 45%, 35% 40%, 45% 25%, 60% 30%, 70% 45%, 85% 50%, 90% 65%, 80% 80%, 60% 85%, 40% 80%, 25% 75%)" scale={scale} onChange={opts.onChange} editing={opts.editing} />
    case 'message':
      return <MessageShape el={el} scale={scale} onChange={opts.onChange} editing={opts.editing} />
    case 'image':
      return (
        el.src ? (
          <img src={el.src} alt="" className="w-full h-full object-contain pointer-events-none" draggable={false} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-gray-300 bg-white/70 text-gray-500 select-none">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <path d="M6 17 L11 12 L18 19" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-xs mt-1">Add image</div>
          </div>
        )
      )
    default:
      return null
  }
}

function ShapeWithText({ el, shapeClass, clipPath, scale = 1, onChange, editing }) {
  const [isEditing, setIsEditing] = useState(!!editing)
  const [text, setText] = useState(el.text || '')
  const inputRef = useRef(null)

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  React.useEffect(() => {
    if (typeof editing === 'boolean') setIsEditing(editing)
  }, [editing])

  React.useEffect(() => {
    setText(el.text || '')
  }, [el.text])

  const handleDoubleClick = (e) => {
    // Allow bubbling so parent can cancel drag; just flip into editing
    setIsEditing(true)
  }

  const handleBlur = (e) => {
    // Only exit editing when user clicks inside the slide container but outside this textarea
    const target = e?.relatedTarget || document.activeElement
    const withinSlide = (target instanceof Element) ? !!target.closest('[data-slide-container]') : false
    const withinThis = (target instanceof Element) ? (inputRef.current && (target === inputRef.current || inputRef.current.contains(target))) : false
    if (!withinSlide || withinThis) {
      // Restore focus to keep editing when clicking outside slide (e.g., toolbar/nav)
      requestAnimationFrame(() => { try { inputRef.current && inputRef.current.focus() } catch {} })
      return
    }
    setIsEditing(false)
    if (text !== (el.text || '')) {
      if (typeof onChange === 'function') {
        onChange({ text })
      } else {
        try {
          window.dispatchEvent(new CustomEvent('updateElement', { detail: { id: el.id, patch: { text } } }))
        } catch {}
      }
    }
    try { window.dispatchEvent(new CustomEvent('stopShapeText', { detail: { id: el.id } })) } catch {}
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

  const fontFamily = el.fontFamily || 'Inter, system-ui, sans-serif'
  const fontWeight = el.bold ? 700 : 400
  const fontStyle = el.italic ? 'italic' : 'normal'
  const textAlign = el.textAlign || 'center'
  const textVAlign = el.textVAlign || 'middle'
  const alignItems = textAlign === 'right' ? 'flex-end' : (textAlign === 'center' ? 'center' : 'flex-start')
  const justifyContent = textVAlign === 'bottom' ? 'flex-end' : (textVAlign === 'middle' ? 'center' : 'flex-start')

  return (
    <div 
      className={`w-full h-full ${shapeClass}`}
      style={shapeStyle}
      onDoubleClick={handleDoubleClick}
    >
        {isEditing ? (
          <div className="w-full h-full p-1" onMouseDown={(e)=>e.stopPropagation()}>
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e)=> setText(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full h-full resize-none outline-none bg-transparent p-1"
              style={{
                color: el.textColor,
                fontSize: `${el.fontSize * scale}px`,
                fontFamily,
                fontWeight,
                fontStyle,
                textDecoration: el.underline ? 'underline' : 'none',
                textAlign: el.textAlign || 'center',
              }}
            />
          </div>
        ) : (
        <div 
          className="w-full h-full p-2 cursor-pointer"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent,
            alignItems,
            color: el.textColor,
            fontSize: `${el.fontSize * scale}px`,
            fontFamily,
            fontWeight,
            fontStyle,
            textDecoration: el.underline ? 'underline' : 'none',
            wordWrap: 'break-word',
            textAlign
          }}
        >
          {text}
        </div>
      )}
    </div>
  )
}

function MessageShape({ el, scale = 1, onChange, editing }) {
  const [isEditing, setIsEditing] = useState(!!editing)
  const [text, setText] = useState(el.text || '')
  const inputRef = useRef(null)
  const fontFamily = el.fontFamily || 'Inter, system-ui, sans-serif'
  const fontWeight = el.bold ? 700 : 400
  const fontStyle = el.italic ? 'italic' : 'normal'
  const textAlign = el.textAlign || 'center'
  const textVAlign = el.textVAlign || 'middle'
  const alignItems = textAlign === 'right' ? 'flex-end' : (textAlign === 'center' ? 'center' : 'flex-start')
  const justifyContent = textVAlign === 'bottom' ? 'flex-end' : (textVAlign === 'middle' ? 'center' : 'flex-start')

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  React.useEffect(() => {
    if (typeof editing === 'boolean') setIsEditing(editing)
  }, [editing])

  React.useEffect(() => {
    setText(el.text || '')
  }, [el.text])

  const handleDoubleClick = (e) => {
    // Allow bubbling so parent can cancel drag; just flip into editing
    setIsEditing(true)
  }

  const handleBlur = (e) => {
    const target = e?.relatedTarget || document.activeElement
    const withinSlide = (target instanceof Element) ? !!target.closest('[data-slide-container]') : false
    const withinThis = (target instanceof Element) ? (inputRef.current && (target === inputRef.current || inputRef.current.contains(target))) : false
    if (!withinSlide || withinThis) {
      requestAnimationFrame(() => { try { inputRef.current && inputRef.current.focus() } catch {} })
      return
    }
    setIsEditing(false)
    if (text !== (el.text || '')) {
      if (typeof onChange === 'function') {
        onChange({ text })
      } else {
        try {
          window.dispatchEvent(new CustomEvent('updateElement', { detail: { id: el.id, patch: { text } } }))
        } catch {}
      }
    }
    try { window.dispatchEvent(new CustomEvent('stopShapeText', { detail: { id: el.id } })) } catch {}
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
          <div className="w-full h-full p-1" onMouseDown={(e)=>e.stopPropagation()}>
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e)=> setText(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full h-full resize-none outline-none bg-transparent p-1"
              style={{
                color: el.textColor,
                fontSize: `${el.fontSize * scale}px`,
                fontFamily,
                fontWeight,
                fontStyle,
                textDecoration: el.underline ? 'underline' : 'none',
                textAlign: el.textAlign || 'center',
              }}
            />
          </div>
        ) : (
          <div 
            className="w-full h-full p-2 cursor-pointer"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent,
              alignItems,
              color: el.textColor,
              fontSize: `${el.fontSize * scale}px`,
              fontFamily,
              fontWeight,
              fontStyle,
              textDecoration: el.underline ? 'underline' : 'none',
              wordWrap: 'break-word',
              textAlign
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

function ChartElement({ el, scale = 1, slideId, selected }) {
  const { chartType, data, labels, colors } = el
  const structured = el.structuredData || null
  const contRef = React.useRef(null)

  const openEditor = () => {
    console.log('[ChartElement] openEditor called for chart:', el.id, chartType)
    const chartData = structured || toStructuredFromFlat(el)
    console.log('[ChartElement] chartData:', chartData)
    console.log('[ChartElement] window.openChartEditor exists?', typeof window.openChartEditor === 'function')
    if (typeof window.openChartEditor === 'function') {
      window.openChartEditor(el.id, chartType, chartData)
    } else {
      console.error('[ChartElement] window.openChartEditor is not a function!')
    }
  }

  // Safe arrays and defaults (fallbacks to legacy flat fields)
  const dataArr = Array.isArray(data) ? data : []
  const labelsArr = Array.isArray(labels) ? labels : []
  const xLabels = labelsArr.length ? labelsArr : dataArr.map((_, i) => String(i + 1))

  if (chartType === 'bar') {
    const variant = el.chartStyle || '2d'
    const cats = structured?.categories || xLabels
    const allSeries = structured?.series || [{ name: 'Series 1', data: dataArr }]
    
    // Build data with all series dynamically
    const dataBar = cats.map((name, i) => {
      const point = { name }
      allSeries.forEach((series, sIdx) => {
        const key = sIdx === 0 ? 'value' : `v${sIdx + 1}`
        point[key] = Number(series.data[i]) || 0
      })
      return point
    })
    
    console.log('[ChartElement] Bar chart data with all series:', dataBar)
    return (
      <div ref={contRef} className="w-full h-full relative" style={{ boxSizing: 'border-box', backgroundColor: 'transparent', border: 'none', borderRadius: 2, minHeight: '200px', minWidth: '200px' }} onDoubleClick={(e)=>{ console.log('[ChartElement] Double clicked'); openEditor() }}>
        <KeynoteBarChart data={dataBar} variant={variant} showLegend={el.legendOptions?.show !== false} />
        {selected && (
          <button
            type="button"
            className="absolute top-2 right-2 z-[100] px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-lg"
            style={{ pointerEvents: 'auto' }}
            onMouseDown={(e)=>{ console.log('[ChartElement] Button mousedown'); e.stopPropagation(); e.preventDefault() }}
            onClick={(e)=>{ console.log('[ChartElement] Button clicked!'); e.stopPropagation(); e.preventDefault(); openEditor() }}
            onPointerDown={(e)=>{ console.log('[ChartElement] Button pointerdown'); e.stopPropagation() }}
            title="Edit Data"
          >
            📊 Edit Data
          </button>
        )}
      </div>
    )
  }

  if (chartType === 'line') {
    const variant = el.chartStyle || 'simple'
    const cats = structured?.categories || xLabels
    const allSeries = structured?.series || [{ name: 'Series 1', data: dataArr }]

    // Build data with all series dynamically (value, v2, v3, ...)
    const dataLine = cats.map((name, i) => {
      const point = { name }
      allSeries.forEach((series, sIdx) => {
        const key = sIdx === 0 ? 'value' : `v${sIdx + 1}`
        point[key] = Number(series.data[i]) || 0
      })
      return point
    })

    return (
      <div ref={contRef} className="w-full h-full relative" style={{ boxSizing: 'border-box', backgroundColor: 'transparent', border: 'none', borderRadius: 2, minHeight: '200px', minWidth: '200px' }} onDoubleClick={(e)=>{ console.log('[ChartElement] Double clicked'); openEditor() }}>
        <KeynoteLineChart data={dataLine} variant={variant} showLegend={el.legendOptions?.show !== false} />
        {selected && (
          <button
            type="button"
            className="absolute top-2 right-2 z-[100] px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-lg"
            style={{ pointerEvents: 'auto' }}
            onMouseDown={(e)=>{ console.log('[ChartElement] Button mousedown'); e.stopPropagation(); e.preventDefault() }}
            onClick={(e)=>{ console.log('[ChartElement] Button clicked!'); e.stopPropagation(); e.preventDefault(); openEditor() }}
            onPointerDown={(e)=>{ console.log('[ChartElement] Button pointerdown'); e.stopPropagation() }}
            title="Edit Data"
          >
            📊 Edit Data
          </button>
        )}
      </div>
    )
  }

  if (chartType === 'pie') {
    const variant = el.chartStyle || '2d'
    const cats = structured?.categories || xLabels
    const s0 = structured?.series?.[0]?.data || dataArr
    const dataPie = cats.map((name, i) => ({ name, value: Number(s0[i]) || 0 }))
    return (
      <div ref={contRef} className="w-full h-full relative" style={{ boxSizing: 'border-box', backgroundColor: 'transparent', border: 'none', borderRadius: 2, minHeight: '200px', minWidth: '200px' }} onDoubleClick={(e)=>{ console.log('[ChartElement] Double clicked'); openEditor() }}>
        <KeynotePieChart data={dataPie} animateKey={slideId} variant={variant} showLegend={el.legendOptions?.show !== false} />
        {selected && (
          <button
            type="button"
            className="absolute top-2 right-2 z-[100] px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-lg"
            style={{ pointerEvents: 'auto' }}
            onMouseDown={(e)=>{ console.log('[ChartElement] Button mousedown'); e.stopPropagation(); e.preventDefault() }}
            onClick={(e)=>{ console.log('[ChartElement] Button clicked!'); e.stopPropagation(); e.preventDefault(); openEditor() }}
            onPointerDown={(e)=>{ console.log('[ChartElement] Button pointerdown'); e.stopPropagation() }}
            title="Edit Data"
          >
            📊 Edit Data
          </button>
        )}
      </div>
    )
  }

  return null
}

function toStructuredFromFlat(el){
  const labels = Array.isArray(el.labels) ? el.labels : []
  const data = Array.isArray(el.data) ? el.data : []
  return { categories: labels, series: [{ name: 'Series 1', data }] }
}

function TableElement({ el, editing, selected = true, onSelect, onChange, stopEditing, scale = 1 }) {
  const [editingCellIndex, setEditingCellIndex] = useState(null)
  const tableRef = useRef(null)

  // Use scaled cell dimensions so positioning matches the rendered size
  const cellWidthPx = (el.w * scale) / el.cols
  const cellHeightPx = (el.h * scale) / el.rows
  // Default table border color; header cells may override with el.headerBorderColor
  const hexToRgb = (hex) => {
    try {
      const m = String(hex || '').replace('#','')
      const v = m.length === 3 ? m.split('').map(ch=>ch+ch).join('') : m
      const int = parseInt(v, 16)
      return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
    } catch { return { r: 0, g: 0, b: 0 } }
  }
  const withAlpha = (hex, alphaPct) => {
    const a = Number.isFinite(alphaPct) ? Math.max(0, Math.min(100, alphaPct)) : 100
    if (a >= 100 || !hex || /^rgba?\(/i.test(hex)) return hex || '#000000'
    const { r, g, b } = hexToRgb(hex)
    return `rgba(${r}, ${g}, ${b}, ${a/100})`
  }

  // Track the currently edited cell globally so sidebar tools can act on it
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (editingCellIndex !== null) {
        window.currentEditingTableCell = { id: el.id, cellIndex: editingCellIndex }
      }
    }
  }, [editingCellIndex, el.id])

  const commitCell = (cellIndex, newText) => {
    const newCells = [...el.cells]
    newCells[cellIndex] = { ...newCells[cellIndex], text: newText }
    onChange({ cells: newCells })
  }

  const handleWrapperDblClick = (e) => {
    e.stopPropagation()
    if (typeof onSelect === 'function') onSelect()
    const rect = tableRef.current?.getBoundingClientRect()
    if (!rect) return
    const rx = e.clientX - rect.left
    const ry = e.clientY - rect.top
    const col = Math.max(0, Math.min(el.cols - 1, Math.floor(rx / (rect.width / el.cols))))
    const row = Math.max(0, Math.min(el.rows - 1, Math.floor(ry / (rect.height / el.rows))))
    const idx = row * el.cols + col
    setEditingCellIndex(idx)
  }

  // Ensure textarea receives focus when entering edit mode
  React.useEffect(() => {
    if (editingCellIndex === null) return
    const cell = el.cells?.[editingCellIndex]
    if (!cell) return
    const id = `table-cell-${cell.id}`
    const focusLater = () => {
      const ta = document.getElementById(id)
      if (ta) { try { ta.focus(); /* do not select to avoid caret jumps */ } catch {} }
    }
    const raf = requestAnimationFrame(focusLater)
    return () => { try { cancelAnimationFrame(raf) } catch {} }
  }, [editingCellIndex, el.cells])

  // Stop editing when the table is deselected
  React.useEffect(() => {
    if (selected) return
    if (editingCellIndex === null) return
    try {
      const cell = el.cells?.[editingCellIndex]
      const id = cell ? `table-cell-${cell.id}` : null
      const node = id ? document.getElementById(id) : null
      const txt = node ? (node.textContent || '') : (cell?.text || '')
      commitCell(editingCellIndex, txt)
    } catch {}
    setEditingCellIndex(null)
  }, [selected, editingCellIndex, el.cells])

  // Allow external requests to edit a specific cell (from sidebar)
  React.useEffect(() => {
    const onEditCell = (e) => {
      const tId = e?.detail?.tableId
      const cIdx = e?.detail?.cellIndex
      if (tId === el.id && Number.isInteger(cIdx)) {
        if (typeof onSelect === 'function') onSelect()
        setEditingCellIndex(Math.max(0, Math.min(el.rows * el.cols - 1, cIdx)))
      }
    }
    window.addEventListener('editTableCell', onEditCell)
    return () => window.removeEventListener('editTableCell', onEditCell)
  }, [el.id, el.rows, el.cols])

  return (
    <div
      ref={tableRef}
      className="w-full h-full relative"
      style={{ boxSizing: 'border-box', overflow: 'hidden', background: '#ffffff', border: `1px solid ${el.borderColor || '#000000'}` }}
      onClick={(e) => {
        e.stopPropagation()
        if (typeof onSelect === 'function') onSelect()
      }}
      onDoubleClick={handleWrapperDblClick}
    >
      {el.cells.map((cell, index) => {
        const row = Math.floor(index / el.cols)
        const col = index % el.cols
        const isEditing = editingCellIndex === index
        const isHeader = !!el.headerRow && row === 0

        const bgBase = (cell.styles?.bgColor)
          ? cell.styles.bgColor
          : (isHeader ? (el.headerBg || '#f3f4f6') : (el.cellBg || '#ffffff'))
        const bgAlpha = (cell.styles?.bgColorAlpha != null)
          ? cell.styles.bgColorAlpha
          : (isHeader ? (el.headerBgAlpha != null ? el.headerBgAlpha : 100) : 100)
        const bg = withAlpha(bgBase, bgAlpha)

        const fgBase = isHeader ? (el.headerTextColor || '#111827') : (cell.styles?.color || '#111827')
        const fgAlpha = isHeader ? (el.headerTextAlpha != null ? el.headerTextAlpha : 100) : (cell.styles?.colorAlpha != null ? cell.styles.colorAlpha : 100)
        const fg = withAlpha(fgBase, fgAlpha)

        const valign = cell.styles?.valign || 'middle'
        const align = cell.styles?.align || 'center'
        const borderBase = isHeader && el.headerBorderColor ? el.headerBorderColor : (el.borderColor || '#000000')
        const borderAlpha = isHeader && el.headerBorderColor ? (el.headerBorderAlpha != null ? el.headerBorderAlpha : 100) : (el.borderAlpha != null ? el.borderAlpha : 100)
        const cellBorderColor = withAlpha(borderBase, borderAlpha)

        return (
          <div
            key={cell.id}
            id={`table-cell-wrap-${cell.id}`}
            data-table-cell
            className="absolute"
            style={{
              boxSizing: 'border-box',
              left: col * cellWidthPx,
              top: row * cellHeightPx,
              width: cellWidthPx,
              height: cellHeightPx,
              borderRight: `1px solid ${cellBorderColor}`,
              borderBottom: `1px solid ${cellBorderColor}`,
            }}
            onMouseDown={(e) => {
              // Track selected cell even when not editing so sidebar ops can use it
              try { if (typeof window !== 'undefined') window.currentSelectedTableCell = { id: el.id, cellIndex: index } } catch {}
            }}
            onDoubleClick={(e) => {
              e.stopPropagation()
              setEditingCellIndex(index)
            }}
          >
            {isEditing ? (
              <div
                id={`table-cell-${cell.id}`}
                contentEditable
                suppressContentEditableWarning
                aria-label={`Table cell ${index + 1}`}
                onBlur={(e) => { 
                  commitCell(index, e.currentTarget.textContent || '')
                  // Keep editing unless user clicks inside slide container but outside this table
                  const target = e?.relatedTarget || document.activeElement
                  const withinSlide = (target instanceof Element) ? !!target.closest('[data-slide-container]') : false
                  const withinTable = (target instanceof Element) ? !!target.closest('[data-table-cell]') : false
                  const keepSidebar = typeof window !== 'undefined' && window.keepTableEditing
                  // If user interacted with sidebar/tools, do NOT refocus immediately to allow dropdowns/inputs to work
                  if (keepSidebar) {
                    // Preserve editing state by not clearing editingCellIndex
                    return
                  }
                  if (!withinSlide || withinTable) {
                    const id = `table-cell-${cell.id}`
                    requestAnimationFrame(() => {
                      const ta = document.getElementById(id)
                      if (ta) { try { ta.focus() } catch {} }
                    })
                  } else {
                    setEditingCellIndex(null)
                  }
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault() } }}
                onPaste={(e) => {
                  try {
                    e.preventDefault()
                    const txt = (e.clipboardData || window.clipboardData).getData('text') || ''
                    const sanitized = txt.replace(/\r?\n/g, ' ')
                    const ok = document.execCommand && document.execCommand('insertText', false, sanitized)
                    if (!ok) {
                      const sel = window.getSelection && window.getSelection()
                      if (sel && sel.getRangeAt && sel.rangeCount) {
                        const r = sel.getRangeAt(0); r.deleteContents(); r.insertNode(document.createTextNode(sanitized))
                      } else {
                        e.currentTarget.textContent += sanitized
                      }
                    }
                  } catch {}
                }}
                className="w-full h-full p-2 outline-none"
                style={{
                  boxSizing: 'border-box',
                  background: bg,
                  color: fg,
                  fontSize: `${(cell.styles?.fontSize || 14) * scale}px`,
                  fontFamily: cell.styles?.fontFamily || 'Inter, system-ui, sans-serif',
                  fontWeight: cell.styles?.bold ? 700 : 400,
                  fontStyle: cell.styles?.italic ? 'italic' : 'normal',
                  textDecoration: cell.styles?.underline ? 'underline' : 'none',
                  textAlign: align,
                  display: 'flex',
                  alignItems: valign === 'middle' ? 'center' : (valign === 'bottom' ? 'flex-end' : 'flex-start'),
                  justifyContent: align === 'right' ? 'flex-end' : (align === 'center' ? 'center' : 'flex-start'),
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflow: 'hidden'
                }}
              >{cell.text}</div>
            ) : (
              <div
                className="w-full h-full p-2 select-none"
                style={{
                  background: bg,
                  color: fg,
                  fontSize: `${(cell.styles?.fontSize || 14) * scale}px`,
                  fontFamily: cell.styles?.fontFamily || 'Inter, system-ui, sans-serif',
                  fontWeight: cell.styles?.bold ? 700 : 400,
                  fontStyle: cell.styles?.italic ? 'italic' : 'normal',
                  textDecoration: cell.styles?.underline ? 'underline' : 'none',
                  textAlign: align,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: valign === 'middle' ? 'center' : (valign === 'bottom' ? 'flex-end' : 'flex-start'),
                  justifyContent: align === 'right' ? 'flex-end' : (align === 'center' ? 'center' : 'flex-start')
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
      const stylesSafe = el.styles || {}
      const align = stylesSafe.align || 'left'
      const isEmpty = !(el.text && String(el.text).trim().length)
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
          fontFamily: (stylesSafe.fontFamily || 'Inter, system-ui, sans-serif'), 
          fontSize: `${(stylesSafe.fontSize || 16) * scale}px`, 
          color: stylesSafe.color || '#111827',
          fontWeight: stylesSafe.bold ? 700 : 400,
          fontStyle: stylesSafe.italic ? 'italic' : 'normal',
          textDecoration: stylesSafe.underline ? 'underline' : 'none',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          alignItems: getHorizontalAlignment(),
          ...getVerticalAlignStyle(),
          pointerEvents: 'none', // let wrapper capture drag/resize when not editing
        }}
      >
          {isEmpty ? (
            <div style={{ width: '100%', textAlign: stylesSafe.align || 'left' }}>
              {el.placeholder ? (
                <span style={{ color: '#9ca3af', fontWeight: el.placeholderBold ? 700 : 400 }}>
                  {el.placeholder}
                </span>
              ) : 'Double-click to edit'}
            </div>
          ) : (
            <div
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                textAlign: stylesSafe.align || 'left',
                textOverflow: 'ellipsis',
                width: '100%'
              }}
              dangerouslySetInnerHTML={{ __html: el.html }}
            />
          )}
        </div>
      )
    }
    
    // Otherwise render plain text with list formatting
    const stylesSafe2 = el.styles || {}
    const align = stylesSafe2.align || 'left'
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
        fontFamily: stylesSafe2.fontFamily || 'Inter, system-ui, sans-serif', 
        color: stylesSafe2.color || '#111827', 
        fontSize: `${(stylesSafe2.fontSize || 16) * scale}px`, 
        fontWeight: stylesSafe2.bold ? 700 : 400, 
        fontStyle: stylesSafe2.italic ? 'italic' : 'normal', 
        textDecoration: stylesSafe2.underline ? 'underline' : 'none', 
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        alignItems: getHorizontalAlignment(),
        ...getVerticalAlignStyle(),
      }}>
        <div style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          textAlign: stylesSafe2.align || 'left',
          textOverflow: 'ellipsis',
          width: '100%',
          pointerEvents: 'none',
        }}>
          {(el.text && el.text.trim().length)
            ? formatTextWithList(el.text)
            : (el.placeholder ? (
                <span style={{ color: '#9ca3af', fontWeight: el.placeholderBold ? 700 : 400 }}>
                  {el.placeholder}
                </span>
              ) : 'Double-click to edit')}
        </div>
      </div>
    )
  }

  // Use RichTextEditor for editing so toolbar inline styles work
  return (
    <RichTextEditor
      ref={window.currentTextEditorRef}
      el={el}
      scale={scale}
      onChange={(patch) => onChange(patch)}
      onBlur={stopEditing}
    />
  )
}
