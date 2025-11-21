import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
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

export default function SlideCanvas({ zoom = 100 }) {
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
    background: 'transparent',
    border: 'transparent',
    borderRadius: '0px',
    boxShadow: '0 32px 64px rgba(17, 25, 40, 0.5)',
  }), [])

  const stageStyle = useMemo(() => ({
    background: 'transparent', // allow outer workspace bg to show (#F5F5F7)
    borderRadius: '0px',
    overflow: 'hidden',
  }), [])

  const onMouseDown = (e) => {
    if (e.target === stageRef.current) {
      // Deselect any selected element and exit text editing
      dispatch({ type: 'SELECT_ELEMENT', id: null })
      setEditingTextId(null)
    }
  }

  // Alignment guide state (rendered within the slide area)
  const [guides, setGuides] = useState({ v: [], h: [], visible: false })

  return (
    <div className="w-full h-full flex items-center justify-center" onMouseDown={onMouseDown}>
      <div className="relative w-full h-full shadow-lg" style={frameStyle}>
        <div
          ref={containerRef}
          data-slide-container
          className="relative w-full h-full"
          style={stageStyle}
          onMouseDown={(e) => {
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
          }}
        >
          {/* Centered, transform-scaled slide wrapper */}
          {(() => {
            const REF_WIDTH = 960
            const REF_HEIGHT = 540
            const base = Math.min(
              (containerDimensions.width || 0) / REF_WIDTH,
              (containerDimensions.height || 0) / REF_HEIGHT,
            ) || 0
            const visualScale = base * Math.max(0.1, Math.min(4, zoom || 1))
            return (
              <div
                className="absolute top-1/2 left-1/2"
                style={{
                  width: REF_WIDTH,
                  height: REF_HEIGHT,
                  transform: `translate(-50%, -50%) scale(${visualScale})`,
                  transformOrigin: 'center',
                  transition: 'transform 0.3s ease-in-out',
                }}
              >
                <div ref={stageRef} className="absolute inset-0">
                  {/* Slide background rectangle */}
                  <SlideBackground background={slide?.background || '#ffffff'} />


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
                      zoom={zoom}
                      allElements={slide?.elements || []}
                      setGuides={setGuides}
                    />
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

function ElementBox({ el, selected, onSelect, onDelete, onChange, editingTextId, setEditingTextId, containerDimensions, shapeEditingId, slideId, zoom = 100, allElements = [], setGuides }) {
  const boxRef = useRef(null)
  const [drag, setDrag] = useState(null)
  const [resize, setResize] = useState(null)
  const [rotating, setRotating] = useState(null)
  const xMv = useMotionValue(el.x || 0)
  const yMv = useMotionValue(el.y || 0)
  // For images, animate width/height via motion values for smooth, pixel-accurate resizing
  const wMv = useMotionValue(el.w || 0)
  const hMv = useMotionValue(el.h || 0)
  const isDraggingRef = useRef(false)
  const lastMoveRef = useRef({ x: el.x || 0, y: el.y || 0, t: performance.now() })
  const dragStartTimerRef = useRef(null)
  const isPressedRef = useRef(false)
  // Refs to hold live interaction data to avoid dispatching during render
  const dragDataRef = useRef(null)
  const rotateDataRef = useRef(null)
  const resizeDataRef = useRef(null)
  // For image resizing, stream live size via RAF without spamming reducer
  const resizeRafRef = useRef(null)
  const resizeLatestRef = useRef(null)
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
    // With transform-based zoom, element coords stay in reference pixels
    return {
      left: `${el.x}px`,
      top: `${el.y}px`,
      width: `${el.w}px`,
      height: `${el.h}px`,
      scale: 1,
    }
  }, [el.x, el.y, el.w, el.h])

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
    isDraggingRef.current = true
    setGlobalNoSelect(true)

    // Prefer pointer events when available to avoid duplicate mouse + pointer handlers
    const usePointer = typeof ev.pointerType === 'string'
    if (usePointer) {
      window.addEventListener('pointermove', onMouseMove)
      window.addEventListener('pointerup', onMouseUp)
      window.addEventListener('pointercancel', onMouseUp)
    } else {
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('blur', onMouseUp)
  }

  const onMouseDown = (e) => {
    // Only respond to primary/primary-like pointer across input types
    if (!isPrimaryPointer(e)) return

    // Do not start dragging when interacting with inline editors/inputs inside the box
    const target = e.target instanceof Element ? e.target : null
    const interactive = target ? target.closest('[contenteditable="true"], textarea, input') : null
    if (interactive) return

    // If shape text editing is active for this element, do not drag
    if (shapeEditingId === el.id) return

    // For tables, we want Keynote-like behavior:
    // - Single click selects the table.
    // - Double click enters cell edit.
    // - A real drag (mouse move beyond a small threshold) moves the table.
    if (el.type === 'table') {
      // If this is clearly part of a double-click, don't arm drag.
      try { if (e.detail && e.detail >= 2) return } catch {}

      // Record the initial down position and arm a small movement threshold.
      const start = { x: e.clientX, y: e.clientY }
      downPosRef.current = start

      const moveHandler = (moveEvt) => {
        if (!downPosRef.current) return
        const dx = (moveEvt.clientX ?? start.x) - start.x
        const dy = (moveEvt.clientY ?? start.y) - start.y
        const distSq = dx * dx + dy * dy
        const THRESHOLD_PX = 4
        if (distSq < THRESHOLD_PX * THRESHOLD_PX) return

        // Threshold exceeded: start a real drag
        try { moveEvt.stopPropagation(); moveEvt.preventDefault() } catch {}
        window.removeEventListener('mousemove', moveHandler)
        window.removeEventListener('mouseup', upHandler)
        thresholdMoveHandlerRef.current = null
        thresholdUpHandlerRef.current = null
        downPosRef.current = null

        isPressedRef.current = true
        onSelect()
        startDragFromEvent(moveEvt)
      }

      const upHandler = () => {
        window.removeEventListener('mousemove', moveHandler)
        window.removeEventListener('mouseup', upHandler)
        thresholdMoveHandlerRef.current = null
        thresholdUpHandlerRef.current = null
        downPosRef.current = null
      }

      thresholdMoveHandlerRef.current = moveHandler
      thresholdUpHandlerRef.current = upHandler
      window.addEventListener('mousemove', moveHandler)
      window.addEventListener('mouseup', upHandler)
      return
    }

    // Non-table elements keep the immediate drag behavior (Keynote-style)
    // but still avoid interfering with double-clicks on text editors.
    try { if (e.detail && e.detail >= 2) return } catch {}

    try { e.stopPropagation(); e.preventDefault(); } catch {}
    isPressedRef.current = true
    onSelect()
    startDragFromEvent(e)
  }

  const softClamp = (val, min, max, margin = 24) => {
    // Compress movement near edges but never allow crossing bounds
    if (val <= min) return min
    if (val >= max) return max
    if (val - min < margin) {
      const t = (val - min) / margin // 0..1
      return min + margin * (t * t) // ease-in toward edge
    }
    if (max - val < margin) {
      const t = (max - val) / margin // 0..1
      return max - margin * (t * t)
    }
    return val
  }

  const computeSnap = (nx, ny, snapRange = 8) => {
    const REF_WIDTH = 960, REF_HEIGHT = 540
    const linesV = [0, REF_WIDTH / 2, REF_WIDTH] // slide left, center, right
    const linesH = [0, REF_HEIGHT / 2, REF_HEIGHT] // slide top, middle, bottom
    // Include other elements' edges/centers
    try {
      for (const t of allElements) {
        if (!t || t.id === el.id) continue
        const l = t.x, r = t.x + t.w, c = t.x + t.w / 2
        linesV.push(l, c, r)
        const tt = t.y, bb = t.y + t.h, mm = t.y + t.h / 2
        linesH.push(tt, mm, bb)
      }
    } catch {}
    const elL = nx, elR = nx + el.w, elC = nx + el.w / 2
    const elT = ny, elB = ny + el.h, elM = ny + el.h / 2
    let snapX = nx, snapY = ny, gv = [], gh = []
    for (const lx of linesV) {
      if (Math.abs(elL - lx) <= snapRange) { snapX += (lx - elL); gv.push(lx) }
      else if (Math.abs(elC - lx) <= snapRange) { snapX += (lx - elC); gv.push(lx) }
      else if (Math.abs(elR - lx) <= snapRange) { snapX += (lx - elR); gv.push(lx) }
    }
    for (const ly of linesH) {
      if (Math.abs(elT - ly) <= snapRange) { snapY += (ly - elT); gh.push(ly) }
      else if (Math.abs(elM - ly) <= snapRange) { snapY += (ly - elM); gh.push(ly) }
      else if (Math.abs(elB - ly) <= snapRange) { snapY += (ly - elB); gh.push(ly) }
    }
    return { x: snapX, y: snapY, gv, gh }
  }

  const liveRafRef = useRef(null)
  const animatingCountRef = useRef(0)
  const emitLive = (x, y) => {
    try { window.dispatchEvent(new CustomEvent('liveElementMove', { detail: { slideId, id: el.id, x, y, rotation: Number.isFinite(el.rotation) ? el.rotation : 0 } })) } catch {}
  }
  const stopLive = () => {
    if (liveRafRef.current) { try { cancelAnimationFrame(liveRafRef.current) } catch {}; liveRafRef.current = null }
    try { window.dispatchEvent(new CustomEvent('liveElementMoveEnd', { detail: { slideId, id: el.id } })) } catch {}
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

    // Rotated AABB containment bounds (for soft pushback calculation)
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
    // Soft pushback by easing the center toward bounds, then map back to top-left
    cx = softClamp(cx, minCx, maxCx)
    cy = softClamp(cy, minCy, maxCy)
    nx = cx - halfW
    ny = cy - halfH
    // Apply snapping (Keynote-like magnetic guides)
    const { x: sx, y: sy, gv, gh } = computeSnap(nx, ny, 6)
    // Soften snap during active drag to avoid harsh jumps, but keep motion fluid
    nx = nx + (sx - nx) * 0.45
    ny = ny + (sy - ny) * 0.45
    // Update motion values (GPU translate3d)
    xMv.set(nx)
    yMv.set(ny)
    // Emit live movement for thumbnails to mirror without store churn
    emitLive(nx, ny)
    // Track velocity
    lastMoveRef.current = { x: nx, y: ny, t: performance.now() }
  }

  const onMouseUp = () => {
    isPressedRef.current = false
    isDraggingRef.current = false
    if (dragStartTimerRef.current) {
      try { clearTimeout(dragStartTimerRef.current) } catch {}
      dragStartTimerRef.current = null
    }
    // Inertial glide toward final position with spring, then commit
    const REF_WIDTH = 960, REF_HEIGHT = 540
    const now = performance.now()
    const prev = lastMoveRef.current
    const currX = xMv.get(), currY = yMv.get()
    // Estimate velocity (px/ms in logical space)
    const dt = Math.max(1, now - prev.t)
    const vx = (currX - prev.x) / dt // px/ms
    const vy = (currY - prev.y) / dt
    // Predict target and clamp (slightly shorter glide for a tighter, Keynote-like feel)
    const predict = (p, v) => p + v * 160 // ~0.16s horizon
    let tx = predict(currX, vx)
    let ty = predict(currY, vy)
    // Clamp to hard bounds of rotated AABB
    const rot = Number.isFinite(el.rotation) ? el.rotation : 0
    const rad = (rot * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const halfW = (el.w || 0) / 2
    const halfH = (el.h || 0) / 2
    const extX = Math.abs(halfW * cos) + Math.abs(halfH * sin)
    const extY = Math.abs(halfW * sin) + Math.abs(halfH * cos)
    let cx = tx + halfW, cy = ty + halfH
    cx = Math.max(extX, Math.min(REF_WIDTH - extX, cx))
    cy = Math.max(extY, Math.min(REF_HEIGHT - extY, cy))
    tx = Math.max(0, Math.min(REF_WIDTH - el.w, cx - halfW))
    ty = Math.max(0, Math.min(REF_HEIGHT - el.h, cy - halfH))
    // Final snap at rest
    const { x: fx, y: fy } = computeSnap(tx, ty, 8)

    // Start a RAF loop to stream live inertial positions
    animatingCountRef.current = 2
    const tick = () => {
      const cx2 = xMv.get()
      const cy2 = yMv.get()
      emitLive(cx2, cy2)
      if (animatingCountRef.current > 0) {
        liveRafRef.current = requestAnimationFrame(tick)
      }
    }
    liveRafRef.current = requestAnimationFrame(tick)

    const controlsX = animate(xMv, fx, { type: 'spring', stiffness: 320, damping: 32, mass: 0.9 }).then(() => { animatingCountRef.current -= 1 })
    const controlsY = animate(yMv, fy, { type: 'spring', stiffness: 320, damping: 32, mass: 0.9 }).then(() => { animatingCountRef.current -= 1 })
    // After both animations settle, commit position and stop live stream
    Promise.all([
      new Promise(res => controlsX.then(res)),
      new Promise(res => controlsY.then(res))
    ]).then(() => {
      onChange({ x: Math.round(xMv.get()), y: Math.round(yMv.get()) })
      stopLive()
    }).catch(() => { stopLive() })

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
    const isImage = el.type === 'image'
    const aspect = isImage && el.h ? (el.w / el.h) : null
    const data = { startX, startY, dir, start: { x: el.x, y: el.y, w: el.w, h: el.h }, isImage, aspect }
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
    
    const hasH = r.dir.includes('e') || r.dir.includes('w')
    const hasV = r.dir.includes('n') || r.dir.includes('s')
    const isCorner = hasH && hasV
    // For images, only corner handles preserve aspect ratio (side handles resize a single dimension)
    const preserveAspect = r.isImage && isCorner && !e.shiftKey

    if (preserveAspect && r.aspect) {
      const aspect = r.aspect || 1
      let newW = r.start.w
      let newH = r.start.h

      // Use horizontal movement as the primary driver (like Keynote)
      const signX = r.dir.includes('e') ? 1 : -1
      newW = r.start.w + signX * logicalDx
      newW = Math.max(40, Math.min(newW, REF_WIDTH))
      newH = newW / aspect

      // Position so the opposite corner stays anchored
      x = r.start.x
      y = r.start.y
      if (r.dir.includes('w')) x = r.start.x + (r.start.w - newW)
      if (r.dir.includes('n')) y = r.start.y + (r.start.h - newH)
      w = newW
      h = newH
    } else {
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
    
    if (el.type === 'image') {
      // Live visual update via motion values
      xMv.set(x)
      yMv.set(y)
      wMv.set(w)
      hMv.set(h)

      // Throttle store updates to once per frame using requestAnimationFrame
      resizeLatestRef.current = { x, y, w, h }
      if (!resizeRafRef.current) {
        const step = () => {
          const latest = resizeLatestRef.current
          if (latest) {
            onChange(latest)
            resizeRafRef.current = requestAnimationFrame(step)
          } else {
            resizeRafRef.current = null
          }
        }
        resizeRafRef.current = requestAnimationFrame(step)
      }
      return
    }

    onChange({ x, y, w, h })
  }

  const endResize = () => {
    // Stop RAF streaming and commit the last size for images
    if (resizeRafRef.current) {
      try { cancelAnimationFrame(resizeRafRef.current) } catch {}
      resizeRafRef.current = null
    }
    if (resizeLatestRef.current) {
      onChange(resizeLatestRef.current)
      resizeLatestRef.current = null
    }

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

    // Text boxes: hand off to RichTextEditor-based flow
    if (el.type === 'text') {
      e?.stopPropagation?.()
      e?.preventDefault?.()
      onSelect()
      setEditingTextId(el.id)
      return
    }
     // Tables: when the user double‑clicks the table frame (but *not* an individual
    // cell), we *let* the event bubble to the inner TableElement, which owns
    // cell‑level editing logic. That component will either hit‑test the cell under
    // the pointer or fall back to the active cell.
    if (el.type === 'table') {
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
  
  // Keep motion values in sync when props change (and not actively dragging)
  useEffect(() => { if (!isDraggingRef.current) xMv.set(el.x || 0) }, [el.x])
  useEffect(() => { if (!isDraggingRef.current) yMv.set(el.y || 0) }, [el.y])
  useEffect(() => { if (!resize && el.type === 'image') wMv.set(el.w || 0) }, [el.w, el.type, resize])
  useEffect(() => { if (!resize && el.type === 'image') hMv.set(el.h || 0) }, [el.h, el.type, resize])

  // When a text box reaches the slide bottom, stop animating height changes so it
  // feels like a hard boundary, just like Keynote.
  const REF_HEIGHT = 540
  const atSlideHeightLimit = (el.y || 0) + (el.h || 0) >= (REF_HEIGHT - 0.5)

  const boxStyle = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: `${el.w}px`,
    height: `${el.h}px`,
    transformOrigin: 'center center',
    border: (() => {
      if (el.type === 'text') {
        const s = el.styles || {}
        if (!s.showBorder) return undefined
        const bw = s.borderWidth ?? 1
        const base = s.borderColor || '#111827'
        const opacity = s.borderOpacity == null ? 1 : s.borderOpacity
        if (!base || opacity <= 0) return 'none'
        if (String(base).startsWith('rgba')) return `${bw}px solid ${base}`
        const makeRgba = (color, a) => {
          if (String(color).startsWith('rgb(')) return String(color).replace('rgb(', 'rgba(').replace(/\)$/,'') + `, ${a})`
          if (String(color)[0] === '#') {
            const hex = String(color).replace('#','')
            const v = hex.length === 3 ? hex.split('').map(ch=>ch+ch).join('') : hex
            const int = parseInt(v, 16)
            const r = (int >> 16) & 255
            const g = (int >> 8) & 255
            const b = int & 255
            return `rgba(${r}, ${g}, ${b}, ${a})`
          }
          return color
        }
        const col = opacity >= 1 ? base : makeRgba(base, opacity)
        return `${bw}px solid ${col}`
      }
      return el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || '#000000'}` : undefined
    })(),
    willChange: 'transform',
    boxShadow: drag
      ? '0 4px 14px rgba(0,0,0,0.18)'
      : (el.type === 'image' && resize
          ? '0 0 0 2px rgba(37,99,235,0.55)'
          : 'none'),
    cursor: el.isWatermark ? 'default' : (drag ? 'grabbing' : (selected ? 'grab' : 'pointer')),
    // Smooth resizing: text boxes keep height animation; images animate both width and height
    transition: (() => {
      if (el.type === 'image') {
        return 'width 0.18s ease-out, height 0.18s ease-out, box-shadow 0.18s ease-in-out'
      }
      if (atSlideHeightLimit) {
        return 'box-shadow 0.18s ease-in-out'
      }
      return 'height 0.18s ease-in-out, box-shadow 0.18s ease-in-out'
    })(),
  }

  return (
    <motion.div
      ref={boxRef}
      data-el-box
      data-el-id={el.id}
      draggable={false}
      className={`absolute`}
      style={{
        ...boxStyle,
        zIndex: el.isWatermark ? 5 : (selected ? 20 : 10),
        pointerEvents: el.isWatermark ? 'none' : 'auto',
        userSelect: el.isWatermark ? 'none' : 'auto',
        WebkitUserSelect: el.isWatermark ? 'none' : 'auto',
        touchAction: 'none',
        x: xMv,
        y: yMv,
        rotate: Number.isFinite(el.rotation) ? el.rotation : 0,
        scale: drag ? 1.015 : 1,
        // For images, width/height animate via motion values
        width: el.type === 'image' ? wMv : el.w,
        height: el.type === 'image' ? hMv : el.h,
      }}
      onMouseDown={onMouseDown}
      onPointerDown={(e)=>{
        // Tables manage their own hit-testing and editing; let their inner
        // component receive pointer events directly without capture/drag.
        if (el.type === 'table') return

        // If interacting with an inline editor, don't capture or start drag
        const target = e.target instanceof Element ? e.target : null
        const interactive = target ? target.closest('[contenteditable="true"], textarea, input') : null
        if (interactive) return
        // Prefer pointer events for reliable capture across devices
        try { if (e.isPrimary) e.currentTarget.setPointerCapture(e.pointerId) } catch {}
        // Skip initiating drag if this is a double tap/click
        if ((e.detail && e.detail >= 2)) return
        // Emulate the same behavior as mouse down for dragging across devices
        if (isPrimaryPointer(e)) onMouseDown(e)
      }}
      onDoubleClick={onDoubleClick}
      transition={{
        duration: el.type === 'image' ? 0.12 : 0.16,
        ease: el.type === 'image' ? [0.25, 0.46, 0.45, 0.94] : 'easeOut',
      }}
    >
      {renderElement(el, { editing: ((editingTextId === el.id || shapeEditingId === el.id) && selected), onChange, stopEditing, scale: localScale, selected, onSelect, slideId })}

      {/* Selected boundary overlay (never for watermark) */}
      {selected && !el.isWatermark && (
        <div className="pointer-events-none absolute inset-0" style={{ border: '1px solid rgba(0,0,0,0.25)' }} />
      )}

      {selected && !el.isWatermark && (
        <>
          {['n','e','s','w','ne','nw','se','sw'].map(dir => (
              <div
                key={dir}
                onMouseDown={(e)=>startResize(e, dir)}
                onPointerDown={(e)=>{ try { if (e.isPrimary) e.currentTarget.setPointerCapture(e.pointerId) } catch {}; if (isPrimaryPointer(e)) startResize(e, dir) }}
                className={`absolute bg-white rounded-full w-3 h-3 -translate-x-1/2 -translate-y-1/2`}
                style={{
                  ...handleStyle(dir, el.w, el.h, containerDimensions),
                  border: '1px solid rgba(0,0,0,0.25)',
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
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow"
            style={{ cursor: 'grab', pointerEvents: 'auto', zIndex: 25, touchAction: 'none', border: '1px solid rgba(0,0,0,0.25)' }}
          />

          {/* Delete button */}
          <button
            type="button"
            onPointerDown={(e)=>{ 
              e.stopPropagation(); 
              e.preventDefault(); 
            }}
            onMouseDown={(e)=>{ 
              e.stopPropagation(); 
              e.preventDefault(); 
            }}
            onClick={(e)=>{ 
              e.stopPropagation(); 
              e.preventDefault();
              onDelete(); 
            }}
            onPointerUp={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 text-xs shadow flex items-center justify-center"
            style={{ 
              zIndex: 99, 
              pointerEvents: 'auto', 
              touchAction: 'none',
              border: 'none',
              outline: 'none',
              lineHeight: '1',
              padding: 0
            }}
            title="Delete"
            aria-label="Delete element"
          >
            ✕
          </button>
        </>
      )}
    </motion.div>
  )
}

function SlideBackground({ background }) {
  const { isDark } = useTheme()
  const REF_WIDTH = 960
  const REF_HEIGHT = 540

  // Support string (color/gradient) or image object { type:'image', src, mode }
  const baseStyle = { position: 'absolute', left: 0, top: 0, width: REF_WIDTH, height: REF_HEIGHT, borderRadius: 20, boxShadow: '0 0 0 1px rgba(0,0,0,0.05)' }
  let bgStyle = {}
  if (background && typeof background === 'object' && background.type === 'image' && background.src) {
    const size = (background.mode === 'stretch') ? '100% 100%' : (background.mode === 'custom' && typeof background.scale === 'number') ? `${background.scale}% auto` : (background.mode || 'cover')
    const bgOpacity = typeof background.opacity === 'number' ? Math.max(0, Math.min(1, background.opacity)) : 1

    const hasPercentPos = typeof background.posX === 'number' || typeof background.posY === 'number'
    const position = hasPercentPos
      ? `${typeof background.posX === 'number' ? background.posX : 50}% ${typeof background.posY === 'number' ? background.posY : 50}%`
      : (background.position || 'center')

    bgStyle = { backgroundImage: `url(${background.src})`, backgroundSize: size, backgroundPosition: position, backgroundRepeat: 'no-repeat', opacity: bgOpacity }
  } else if (typeof background === 'string') {
    bgStyle = { background: background }
  } else {
    bgStyle = { background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)' }
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

function getImageFilterCss(preset, strength = 1) {
  const s = Number.isFinite(strength) ? Math.max(0, Math.min(1, strength)) : 1
  if (!preset || preset === 'original' || s <= 0) return 'none'

  if (preset === 'hdr') {
    const sat = 1 + (1.35 - 1) * s
    const contrast = 1 + (1.25 - 1) * s
    const bright = 1 + (1.05 - 1) * s
    return `saturate(${sat}) contrast(${contrast}) brightness(${bright})`
  }
  if (preset === 'landscape' || preset === 'cinematic') {
    const sat = 1 + (1.1 - 1) * s
    const contrast = 1 + (1.2 - 1) * s
    const bright = 1 + (0.9 - 1) * s
    return `saturate(${sat}) contrast(${contrast}) brightness(${bright})`
  }
  if (preset === 'bw') {
    const contrast = 1 + (1.15 - 1) * s
    return `grayscale(${s}) contrast(${contrast})`
  }
  return 'none'
}

function handleStyle(dir, w, h, _containerDimensions) {
  // With transform-based zoom, element box is in reference coords; handles should use unscaled size
  const scaledW = Number(w) || 0
  const scaledH = Number(h) || 0
  const pos = {
    n: { left: scaledW / 2, top: 0 },
    s: { left: scaledW / 2, top: scaledH },
    e: { left: scaledW, top: scaledH / 2 },
    w: { left: 0, top: scaledH / 2 },
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
            <div
            className="w-full h-full relative flex items-center justify-center"
            style={{
              boxShadow: (() => {
                const raw = typeof el.shadowOpacity === 'number'
                  ? Math.max(0, Math.min(1, el.shadowOpacity))
                  : 0.35
                const alpha = el.showShadow ? raw : 0
                return `0 10px 30px rgba(15,23,42,${alpha})`
              })(),
              borderRadius: `${el.cornerRadiusTL ?? 8}px ${el.cornerRadiusTR ?? 8}px ${el.cornerRadiusBR ?? 8}px ${el.cornerRadiusBL ?? 8}px`,
              transition: 'box-shadow 180ms ease-out, border-radius 160ms ease-out',
            }}
          >
            {/* Title strictly above the image box */}
            {el.showTitle && (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 font-semibold text-center max-w-full truncate pointer-events-none"
                style={{
                  color: el.titleColor || '#111827',
                  opacity: 1,
                  fontSize: el.titleFontSize || 12,
                }}
              >
                {el.title || 'Image Title'}
              </div>
            )}

            {/* Image centered in the box; width can grow independently */}
            <div
              className="relative w-full h-full overflow-hidden flex items-center justify-center"
              style={{
                borderRadius: `${el.cornerRadiusTL ?? 8}px ${el.cornerRadiusTR ?? 8}px ${el.cornerRadiusBR ?? 8}px ${el.cornerRadiusBL ?? 8}px`,
                transition: 'border-radius 160ms ease-out',
              }}
            >
              <img
                src={el.src}
                alt=""
                className="w-full h-full object-fill pointer-events-none"
                draggable={false}
                style={{
                  opacity: el.opacity == null ? 1 : el.opacity,
                  filter: getImageFilterCss(el.filterPreset, el.filterStrength),
                  transition: 'opacity 180ms ease-out, filter 180ms ease-out'
                }}
              />
            </div>

            {/* Caption strictly below the image box, spanning full image width */}
            {el.showCaption && (
              <div
                className="absolute top-full left-0 mt-1 w-full text-left pointer-events-none"
                style={{
                  color: el.captionColor || '#4b5563',
                  opacity: 1,
                  fontSize: el.captionFontSize || 11,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {el.caption || 'Image caption'}
              </div>
            )}
          </div>
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

  const strokeBase = 2
  const strokePx = Math.max(1, Math.round(strokeBase * scale))
  const shapeStyle = {
    background: el.fill,
    border: `${strokePx}px solid ${el.stroke}`,
    ...(clipPath && { clipPath }),
    opacity: el.opacity == null ? 1 : el.opacity,
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
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflow: 'hidden',
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
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflow: 'hidden',
            textAlign,
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
          border: `2px solid ${el.stroke}`,
          opacity: el.opacity == null ? 1 : el.opacity,
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
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflow: 'hidden',
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
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflow: 'hidden',
              textAlign,
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

  const legendOpts = el.legendOptions || {}
  const showLegend = legendOpts.show !== false
  const showTitle = !!legendOpts.titleEnabled
  const showContext = !!legendOpts.contextEnabled
  const titleText = legendOpts.titleText || ''
  const contextText = legendOpts.contextText || ''
  const bgMode = legendOpts.bgMode || 'transparent'
  const bgColor = legendOpts.bgColor || '#ffffff'
  const borderMode = legendOpts.borderMode || 'transparent'
  const borderColor = legendOpts.borderColor || 'rgba(148,163,184,0.7)'
  const xAxisEnabled = !!legendOpts.xAxisEnabled
  const xAxisLabel = xAxisEnabled ? (legendOpts.xAxisLabel || '') : null
  const yAxisEnabled = !!legendOpts.yAxisEnabled
  const yAxisLabel = yAxisEnabled ? (legendOpts.yAxisLabel || '') : null
  const showXAxis = legendOpts.showXAxis !== false
  const showYAxis = legendOpts.showYAxis !== false
  const showMinorGridlines = !!legendOpts.showMinorGridlines
  const minorGridlineOpacity = legendOpts.minorGridlineOpacity ?? 0.45

  const frameStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'stretch',
  }
  const chartBoxStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'stretch',
    padding: (bgMode === 'color' || borderMode === 'color') ? 6 : 0,
    boxSizing: 'border-box',
    backgroundColor: bgMode === 'color' ? bgColor : 'transparent',
    borderRadius: 10,
    border: borderMode === 'color' ? `1px solid ${borderColor}` : 'none',
  }
  const innerChartStyle = {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  }

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
    const seriesNames = allSeries.map((s, idx) => s?.name || `Series ${idx + 1}`)
    
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
    const overrideColor = el.chartColor?.color || null
    const colorMode = el.chartColor?.mode || 'solid'
    const colorblindFriendly = !!el.chartColorblindFriendly
    const overridePalette = Array.isArray(el.chartPalette?.colors) ? el.chartPalette.colors : null
    return (
      <div ref={contRef} className="w-full h-full relative" style={{ boxSizing: 'border-box', backgroundColor: 'transparent', border: 'none', borderRadius: 2, minHeight: '200px', minWidth: '200px' }} onDoubleClick={(e)=>{ console.log('[ChartElement] Double clicked'); openEditor() }}>
        <div className="w-full h-full" style={frameStyle}>
          {showTitle && titleText && (
            <div className="mb-1 text-xs font-semibold text-gray-800 text-center truncate">{titleText}</div>
          )}
          <div style={chartBoxStyle}>
            <div style={innerChartStyle}>
              <KeynoteBarChart
                data={dataBar}
                variant={variant}
                overrideColor={overrideColor}
                overridePalette={overridePalette}
                colorMode={colorMode}
                colorblindFriendly={colorblindFriendly}
                showLegend={showLegend}
                seriesNames={seriesNames}
                xAxisLabel={xAxisLabel}
                yAxisLabel={yAxisLabel}
                showXAxis={showXAxis}
                showYAxis={showYAxis}
                showMinorGridlines={showMinorGridlines}
                minorGridlineOpacity={minorGridlineOpacity}
              />
            </div>
          </div>
          {showContext && contextText && (
            <div className="mt-1 text-[11px] text-gray-600 text-center">{contextText}</div>
          )}
        </div>
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
    const seriesNames = allSeries.map((s, idx) => s?.name || `Series ${idx + 1}`)

    // Build data with all series dynamically (value, v2, v3, ...)
    const dataLine = cats.map((name, i) => {
      const point = { name }
      allSeries.forEach((series, sIdx) => {
        const key = sIdx === 0 ? 'value' : `v${sIdx + 1}`
        point[key] = Number(series.data[i]) || 0
      })
      return point
    })

    const overrideColor = el.chartColor?.color || null
    const colorMode = el.chartColor?.mode || 'solid'
    const colorblindFriendly = !!el.chartColorblindFriendly
    const overridePalette = Array.isArray(el.chartPalette?.colors) ? el.chartPalette.colors : null
    return (
      <div ref={contRef} className="w-full h-full relative" style={{ boxSizing: 'border-box', backgroundColor: 'transparent', border: 'none', borderRadius: 2, minHeight: '200px', minWidth: '200px' }} onDoubleClick={(e)=>{ console.log('[ChartElement] Double clicked'); openEditor() }}>
        <div className="w-full h-full" style={frameStyle}>
          {showTitle && titleText && (
            <div className="mb-1 text-xs font-semibold text-gray-800 text-center truncate">{titleText}</div>
          )}
          <div style={chartBoxStyle}>
            <div style={innerChartStyle}>
              <KeynoteLineChart
                data={dataLine}
                variant={variant}
                overrideColor={overrideColor}
                overridePalette={overridePalette}
                colorMode={colorMode}
                colorblindFriendly={colorblindFriendly}
                showLegend={showLegend}
                seriesNames={seriesNames}
                xAxisLabel={xAxisLabel}
                yAxisLabel={yAxisLabel}
                showXAxis={showXAxis}
                showYAxis={showYAxis}
                showMinorGridlines={showMinorGridlines}
                minorGridlineOpacity={minorGridlineOpacity}
              />
            </div>
          </div>
          {showContext && contextText && (
            <div className="mt-1 text-[11px] text-gray-600 text-center">{contextText}</div>
          )}
        </div>
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
    const overrideColor = el.chartColor?.color || null
    const colorMode = el.chartColor?.mode || 'solid'
    const colorblindFriendly = !!el.chartColorblindFriendly
    const overridePalette = Array.isArray(el.chartPalette?.colors) ? el.chartPalette.colors : null
    return (
      <div ref={contRef} className="w-full h-full relative" style={{ boxSizing: 'border-box', backgroundColor: 'transparent', border: 'none', borderRadius: 2, minHeight: '200px', minWidth: '200px' }} onDoubleClick={(e)=>{ console.log('[ChartElement] Double clicked'); openEditor() }}>
        <div className="w-full h-full" style={frameStyle}>
          {showTitle && titleText && (
            <div className="mb-1 text-xs font-semibold text-gray-800 text-center truncate">{titleText}</div>
          )}
          <div style={chartBoxStyle}>
            <div style={innerChartStyle}>
              <KeynotePieChart
                data={dataPie}
                animateKey={slideId}
                variant={variant}
                overrideColor={overrideColor}
                overridePalette={overridePalette}
                colorMode={colorMode}
                colorblindFriendly={colorblindFriendly}
                showLegend={showLegend}
              />
            </div>
          </div>
          {showContext && contextText && (
            <div className="mt-1 text-[11px] text-gray-600 text-center">{contextText}</div>
          )}
        </div>
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
    // Double‑click anywhere on the table frame enters edit mode. We start with
    // the first cell (0,0); cell‑specific double‑clicks are handled on each
    // cell wrapper below.
    console.log('[TableElement] wrapper double-click for table', el.id)
    e.stopPropagation()
    if (typeof onSelect === 'function') onSelect()
    if (!Array.isArray(el.cells) || el.cells.length === 0) return
    setEditingCellIndex(0)
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
              console.log('[TableElement] cell double-click index', index, 'table', el.id)
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

  // Shared helper to apply element text opacity to a base color
  const resolveTextColorWithOpacity = (color, opacity) => {
    const base = color || '#111827'
    const a = opacity == null ? 1 : opacity
    if (!base || a == null || a >= 1) return base
    const s = String(base)
    if (s.startsWith('rgba')) return base
    if (s.startsWith('rgb(')) return s.replace('rgb(', 'rgba(').replace(/\)$/,'') + `, ${a})`
    if (s[0] === '#') {
      const hex = s.replace('#','')
      const v = hex.length === 3 ? hex.split('').map(ch=>ch+ch).join('') : hex
      const int = parseInt(v, 16)
      const r = (int >> 16) & 255
      const g = (int >> 8) & 255
      const b = int & 255
      return `rgba(${r}, ${g}, ${b}, ${a})`
    }
    return base
  }

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
      const baseColor = stylesSafe.color || '#111827'
      const opacity = stylesSafe.opacity == null ? 1 : stylesSafe.opacity
      const textColor = resolveTextColorWithOpacity(baseColor, opacity)
      const shadowColor = (() => {
        if (!stylesSafe.shadowEnabled) return 'none'
        const a = stylesSafe.shadowOpacity == null ? 0.5 : stylesSafe.shadowOpacity
        const alpha = Math.max(0, Math.min(1, a))
        return resolveTextColorWithOpacity(baseColor, alpha)
      })()
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
          lineHeight: stylesSafe.lineHeight || 1.2,
          color: textColor,
          textShadow: shadowColor === 'none' ? 'none' : `0 2px 6px ${shadowColor}`,
          fontWeight: stylesSafe.bold ? 700 : 400,
          fontStyle: stylesSafe.italic ? 'italic' : 'normal',
          textDecoration: stylesSafe.underline ? 'underline' : 'none',
          overflow: 'hidden', // never let rendered text extend beyond the box
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
    const baseColor2 = stylesSafe2.color || '#111827'
    const opacity2 = stylesSafe2.opacity == null ? 1 : stylesSafe2.opacity
    const textColor2 = resolveTextColorWithOpacity(baseColor2, opacity2)
    const shadowColor2 = (() => {
      if (!stylesSafe2.shadowEnabled) return 'none'
      const a = stylesSafe2.shadowOpacity == null ? 0.5 : stylesSafe2.shadowOpacity
      const alpha = Math.max(0, Math.min(1, a))
      return resolveTextColorWithOpacity(baseColor2, alpha)
    })()
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
        color: textColor2, 
        textShadow: shadowColor2 === 'none' ? 'none' : `0 2px 6px ${shadowColor2}`,
        fontSize: `${(stylesSafe2.fontSize || 16) * scale}px`, 
        lineHeight: stylesSafe2.lineHeight || 1.2,
        fontWeight: stylesSafe2.bold ? 700 : 400, 
        fontStyle: stylesSafe2.italic ? 'italic' : 'normal', 
        textDecoration: stylesSafe2.underline ? 'underline' : 'none', 
        overflow: 'hidden', // clamp visible text to the box bounds
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
