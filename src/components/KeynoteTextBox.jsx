import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * KeynoteTextBox
 *
 * Goals:
 * - Natural left-to-right typing with stable caret (no flicker/jumps).
 * - Editing does not zoom/scale or reflow the box — dimensions remain visually stable.
 * - Keynote-style boundary with corner/midpoint resize handles (fade in/out).
 * - Draggable, rotatable, resizable in standalone mode.
 * - Auto-resize with typing (standalone only) while keeping text scale fixed.
 * - Glassmorphism aesthetics and soft entry animation.
 *
 * Two modes:
 * 1) embed mode (embed={true})
 *    - Used inside an existing selection/transform box managed by the parent.
 *    - No drag/rotate/resize UI here (parent handles those).
 *    - No auto-resize during typing to avoid reflow conflicts with parent.
 *    - Transparent by default. If embedGlass is true, a subtle glass background is shown.
 *
 * 2) standalone mode (embed={false}, the default)
 *    - Self-managed position (x,y), size (w,h), rotation, selection state.
 *    - Shows blue boundary + handles when selected.
 *    - Draggable, rotatable, resizable.
 *    - Auto-expands with content as you type (no content scaling).
 *
 * Caret stability strategy (contentEditable):
 * - We never bind the editable content directly to React state during focus.
 * - On mount or when not focused, we sync the DOM content from props.value.
 * - While focused and typing, we read from DOM (editorRef.textContent) and call onChange,
 *   but we DO NOT write the value back to DOM until blur to avoid caret jumps.
 *
 * Props:
 * - value: string (initial or external value)
 * - onChange: function(text) => void
 * - onBlur: function() => void
 * - selected: boolean (in standalone, you can leave undefined to use internal selection)
 * - draggable: boolean (default true for standalone; ignored in embed)
 * - rotatable: boolean (default true for standalone; ignored in embed)
 * - resizable: boolean (default true for standalone; ignored in embed)
 * - x, y, w, h, rotation: optional controlled geometry (standalone). If omitted, internal state is used.
 * - minW, minH: minimum size (default 80x40)
 * - finishOnEnter: boolean (default true; Enter commits edit, Shift+Enter inserts newline)
 * - align: 'left' | 'center' | 'right' | 'justify' (horizontal alignment)
 * - valign: 'top' | 'middle' | 'bottom' (vertical alignment)
 * - fontFamily, fontSize, fontWeight, fontStyle, color, lineHeight, italic, underline
 * - embed: boolean (see above)
 * - embedGlass: boolean (default true). If false in embed mode, fully transparent.
 *
 * Styling:
 * - Tailwind classes for rounded-xl, shadows, etc.
 * - Framer Motion for entry + boundary fade.
 */

export default function KeynoteTextBox({
  // Text model
  value = '',
  onChange,
  onBlur,

  // Alignment/typography
  align = 'left',
  valign = 'top',
  fontFamily = 'Inter, system-ui, sans-serif',
  fontSize = 16,
  fontWeight = 500,
  fontStyle = 'normal',
  color = '#1f2937',
  lineHeight = 1.35,
  italic = false,
  underline = false,

  // Behavior
  finishOnEnter = true,

  // Mode
  embed = false,
  embedGlass = true,

  // Standalone geometry (uncontrolled defaults)
  x: xProp,
  y: yProp,
  w: wProp,
  h: hProp,
  rotation: rotationProp,
  selected: selectedProp,
  draggable = true,
  rotatable = true,
  resizable = true,
  minW = 80,
  minH = 40,
}) {
  // Selection/focus states
  const [isFocused, setIsFocused] = useState(false)
  const [isSelectedInternal, setIsSelectedInternal] = useState(false)
  const isSelected = selectedProp ?? isSelectedInternal

  // Geometry state (standalone only unless controlled via props)
  const [x, setX] = useState(xProp ?? 100)
  const [y, setY] = useState(yProp ?? 80)
  const [w, setW] = useState(wProp ?? 280)
  const [h, setH] = useState(hProp ?? 120)
  const [rotation, setRotation] = useState(rotationProp ?? 0)

  // Update internal geometry if controlled props change
  useEffect(() => { if (xProp != null) setX(xProp) }, [xProp])
  useEffect(() => { if (yProp != null) setY(yProp) }, [yProp])
  useEffect(() => { if (wProp != null) setW(wProp) }, [wProp])
  useEffect(() => { if (hProp != null) setH(hProp) }, [hProp])
  useEffect(() => { if (rotationProp != null) setRotation(rotationProp) }, [rotationProp])

  // Editor ref and live content management (caret-stable)
  const editorRef = useRef(null)
  const lastSyncedValRef = useRef(value)

  // Sync DOM content from value only when NOT focused, to avoid caret jumps
  useLayoutEffect(() => {
    if (!editorRef.current) return
    if (isFocused) return
    if (lastSyncedValRef.current !== value) {
      setEditorText(value)
      lastSyncedValRef.current = value
    } else if (editorRef.current.textContent == null || editorRef.current.textContent !== value) {
      setEditorText(value)
      lastSyncedValRef.current = value
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isFocused])

  function setEditorText(text) {
    // Keep pure text (not HTML) for safety and predictable caret behavior
    try {
      const el = editorRef.current
      if (!el) return
      // Preserve lines; replace innerText rather than innerHTML to avoid HTML parsing
      el.textContent = text ?? ''
    } catch {}
  }

  // Compute layout/alignment styles
  const flexJustify = useMemo(() => {
    switch (valign) {
      case 'middle': return 'center'
      case 'bottom': return 'flex-end'
      default: return 'flex-start'
    }
  }, [valign])

  const textAlignCss = useMemo(() => {
    switch (align) {
      case 'center': return 'center'
      case 'right': return 'right'
      case 'justify': return 'justify'
      default: return 'left'
    }
  }, [align])

  // Selection boundary fade-in/out
  const boundaryOpacity = isSelected ? 1 : 0

  // Track pointer rotation interactions (standalone only)
  const rotDataRef = useRef(null)

  const beginRotate = (e) => {
    if (embed || !rotatable) return
    e.preventDefault()
    e.stopPropagation()
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI
    rotDataRef.current = { startAngle, startRotation: rotation, centerX, centerY }

    window.addEventListener('mousemove', onRotMove)
    window.addEventListener('mouseup', endRotate)
    window.addEventListener('pointermove', onRotMove)
    window.addEventListener('pointerup', endRotate)
  }

  const onRotMove = (e) => {
    const r = rotDataRef.current
    if (!r) return
    e.preventDefault()
    const angle = Math.atan2(e.clientY - r.centerY, e.clientX - r.centerX) * 180 / Math.PI
    let newRot = r.startRotation + (angle - r.startAngle)
    // Normalize to [-180, 180]
    newRot = ((newRot + 180) % 360 + 360) % 360 - 180
    // Snap with Shift to 15deg increments
    if (e.shiftKey) newRot = Math.round(newRot / 15) * 15
    if (rotationProp == null) setRotation(Math.round(newRot))
  }

  const endRotate = () => {
    rotDataRef.current = null
    window.removeEventListener('mousemove', onRotMove)
    window.removeEventListener('mouseup', endRotate)
    window.removeEventListener('pointermove', onRotMove)
    window.removeEventListener('pointerup', endRotate)
  }

  // Resize handles (standalone only)
  const containerRef = useRef(null)
  const resizeRef = useRef(null)

  const beginResize = (e, dir) => {
    if (embed || !resizable) return
    e.preventDefault()
    e.stopPropagation()
    resizeRef.current = {
      dir,
      startX: e.clientX,
      startY: e.clientY,
      start: { x, y, w, h },
    }
    window.addEventListener('mousemove', onResizeMove)
    window.addEventListener('mouseup', endResize)
    window.addEventListener('pointermove', onResizeMove)
    window.addEventListener('pointerup', endResize)
  }

  const onResizeMove = (e) => {
    const r = resizeRef.current
    if (!r) return
    e.preventDefault()
    const dx = e.clientX - r.startX
    const dy = e.clientY - r.startY

    let nx = r.start.x
    let ny = r.start.y
    let nw = r.start.w
    let nh = r.start.h

    // Note: resizing is done in the unrotated box space. For simplicity,
    // we update the axis-aligned AABB; rotation is independent via rotation state.
    if (r.dir.includes('e')) nw = Math.max(minW, r.start.w + dx)
    if (r.dir.includes('s')) nh = Math.max(minH, r.start.h + dy)
    if (r.dir.includes('w')) {
      const newW = Math.max(minW, r.start.w - dx)
      const newX = r.start.x + (r.start.w - newW)
      nw = newW
      nx = newX
    }
    if (r.dir.includes('n')) {
      const newH = Math.max(minH, r.start.h - dy)
      const newY = r.start.y + (r.start.h - newH)
      nh = newH
      ny = newY
    }

    if (xProp == null) setX(nx)
    if (yProp == null) setY(ny)
    if (wProp == null) setW(nw)
    if (hProp == null) setH(nh)
  }

  const endResize = () => {
    resizeRef.current = null
    window.removeEventListener('mousemove', onResizeMove)
    window.removeEventListener('mouseup', endResize)
    window.removeEventListener('pointermove', onResizeMove)
    window.removeEventListener('pointerup', endResize)
  }

  // Auto-resize to fit content as typing (standalone only to avoid reflow in embed)
  const measureAndGrow = () => {
    if (embed) return
    const el = editorRef.current
    if (!el) return
    // Measure scroll sizes of the inner content box
    const scrollW = Math.ceil(el.scrollWidth)
    const scrollH = Math.ceil(el.scrollHeight)
    const targetW = Math.max(w, scrollW + 12)  // 6px horizontal padding on each side
    const targetH = Math.max(h, scrollH + 12)  // 6px vertical padding on each side
    if (wProp == null && targetW !== w) setW(targetW)
    if (hProp == null && targetH !== h) setH(targetH)
  }

  // Editor input handlers
  const handleInput = () => {
    const text = editorRef.current?.textContent ?? ''
    // Emit to parent immediately so its model is fresh,
    // but don't re-bind back to DOM while focused (caret-safe).
    if (typeof onChange === 'function') onChange(text)
    if (!embed) measureAndGrow()
  }

  const handleFocus = () => {
    setIsFocused(true)
    // Select this box visually when focusing (standalone)
    if (!embed) setIsSelectedInternal(true)
  }

  const commitAndBlur = () => {
    setIsFocused(false)
    const text = editorRef.current?.textContent ?? ''
    lastSyncedValRef.current = text
    if (typeof onChange === 'function') onChange(text)
    if (typeof onBlur === 'function') onBlur()
  }

  const handleKeyDown = (e) => {
    if (finishOnEnter && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      commitAndBlur()
    }
  }

  const containerStyle = useMemo(() => {
    const styleBase = {
      outline: 'none',
      userSelect: 'text',
      WebkitUserSelect: 'text',
      // Use transform only for rotation/drag translate. Do NOT scale the box.
      transform: embed ? undefined : ('rotate(' + rotation + 'deg)'),
      transformOrigin: 'center center',
    }
    return styleBase
  }, [embed, rotation])

  // Block-level wrapper alignments/styles for the editable surface
  const editorBoxStyle = useMemo(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: flexJustify,
      alignItems: (() => {
        switch (textAlignCss) {
          case 'center': return 'center'
          case 'right': return 'flex-end'
          case 'justify': return 'stretch' // flex-end/center don't apply well to justify; stretch fits
          default: return 'flex-start'
        }
      })(),
      width: '100%',
      height: '100%',
      padding: '6px',
      borderRadius: '12px', // rounded-xl
      // Glass background only when embedGlass or in standalone (non-embed)
      background: (embed ? (embedGlass ? 'rgba(255,255,255,0.5)' : 'transparent') : 'linear-gradient(180deg, rgba(255,255,255,0.65), rgba(255,255,255,0.4))'),
      backdropFilter: (embed && !embedGlass) ? undefined : 'blur(12px)',
      WebkitBackdropFilter: (embed && !embedGlass) ? undefined : 'blur(12px)',
      boxShadow: (embed && !embedGlass)
        ? 'none'
        : '0 4px 30px rgba(0,0,0,0.10)',
      border: (embed && !embedGlass) ? 'none' : '1px solid rgba(255,255,255,0.35)',
    }
  }, [embed, embedGlass, flexJustify, textAlignCss])

  const editableStyle = useMemo(() => {
    return {
      outline: 'none',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      width: '100%',
      // Let height expand naturally inside the editor box; outer container controls height
      color,
      fontFamily: fontFamily,
      fontSize: fontSize + 'px',
      fontWeight: fontWeight,
      fontStyle: italic ? 'italic' : fontStyle,
      textDecoration: underline ? 'underline' : 'none',
      lineHeight,
      textAlign: textAlignCss,
      direction: 'ltr',
      // Keep text rendering crisp during drag/rotate
      transform: 'translateZ(0)',
      willChange: 'contents',
    }
  }, [color, fontFamily, fontSize, fontWeight, fontStyle, italic, underline, lineHeight, textAlignCss])

  // Entry animation (no scaling during editing — only on initial mount)
  const enterAnim = { opacity: 1, scale: 1, transition: { duration: 0.18, ease: 'easeOut' } }
  const exitAnim = { opacity: 0, scale: 0.98, transition: { duration: 0.12, ease: 'easeIn' } }
  const initAnim = { opacity: 0, scale: 0.98 }

  // Standalone wrapper: either absolute-positioned div with drag via mouse, or keep neutral in embed
  const [dragging, setDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 })

  const onContainerMouseDown = (e) => {
    if (embed) return
    // Click selects but doesn't drag yet — drag starts when mouse moves
    setIsSelectedInternal(true)
    if (!draggable) return
    // Ignore if starting on rotate/resize handles or inside the text (allow selection)
    const target = e.target
    const onHandle = !!(target instanceof Element && target.closest('[data-ktb-handle]'))
    if (onHandle) return
    // If clicking inside the content, allow text selection; require slight move to start drag
    const onEditor = !!(target instanceof Element && target.closest('[data-ktb-editor]'))
    // Start capture after threshold
    dragStartRef.current = { x, y, startX: e.clientX, startY: e.clientY, onEditor }
    window.addEventListener('mousemove', onDragMove)
    window.addEventListener('mouseup', endDrag)
  }

  const onDragMove = (e) => {
    const d = dragStartRef.current
    const threshold = 3
    if (!dragging && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) >= threshold) {
      // If drag begins from editor text, prevent selecting text
      if (d.onEditor) {
        try { e.preventDefault(); window.getSelection()?.removeAllRanges?.() } catch {}
      }
      setDragging(true)
    }
    if (!dragging) return
    const nx = d.x + (e.clientX - d.startX)
    const ny = d.y + (e.clientY - d.startY)
    if (xProp == null) setX(nx)
    if (yProp == null) setY(ny)
  }

  const endDrag = () => {
    setDragging(false)
    window.removeEventListener('mousemove', onDragMove)
    window.removeEventListener('mouseup', endDrag)
  }

  // Render resize handles (standalone)
  const renderHandles = () => {
    if (embed || !resizable) return null
    const dirs = ['n','e','s','w','ne','nw','se','sw']
    const posStyle = (dir) => {
      const base = { position: 'absolute', width: 10, height: 10, borderRadius: 9999,
        background: '#ffffff', border: '1px solid #3b82f6', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        transform: 'translate(-50%, -50%)', cursor: resizeCursor(dir), zIndex: 3 }
      switch (dir) {
        case 'n': return { ...base, left: '50%', top: 0 }
        case 's': return { ...base, left: '50%', top: '100%' }
        case 'e': return { ...base, left: '100%', top: '50%' }
        case 'w': return { ...base, left: 0, top: '50%' }
        case 'ne': return { ...base, left: '100%', top: 0 }
        case 'nw': return { ...base, left: 0, top: 0 }
        case 'se': return { ...base, left: '100%', top: '100%' }
        case 'sw': return { ...base, left: 0, top: '100%' }
        default: return base
      }
    }
    return dirs.map(dir => (
      <div
        key={dir}
        data-ktb-handle
        style={posStyle(dir)}
        onMouseDown={(e)=>beginResize(e, dir)}
        onPointerDown={(e)=>beginResize(e, dir)}
      />
    ))
  }

  const resizeCursor = (dir) => {
    switch (dir) {
      case 'n':
      case 's': return 'ns-resize'
      case 'e':
      case 'w': return 'ew-resize'
      case 'ne':
      case 'sw': return 'nesw-resize'
      case 'nw':
      case 'se': return 'nwse-resize'
      default: return 'default'
    }
  }

  // Blue boundary and rotation handle (standalone)
  const renderBoundary = () => {
    if (embed) return null
    return (
      <AnimatePresence>
        {isSelected && (
          <motion.div
            key="ktb-boundary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              border: '2px solid rgba(59,130,246,0.9)', // brand-500-ish
              borderRadius: 12,
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
        )}
      </AnimatePresence>
    )
  }

  const renderRotationHandle = () => {
    if (embed || !rotatable) return null
    return (
      <div
        data-ktb-handle
        title="Rotate"
        onMouseDown={beginRotate}
        onPointerDown={beginRotate}
        style={{
          position: 'absolute',
          left: '50%',
          top: -16,
          transform: 'translateX(-50%)',
          width: 16,
          height: 16,
          borderRadius: 9999,
          background: '#ffffff',
          border: '1px solid #3b82f6',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          cursor: 'grab',
          zIndex: 4,
        }}
      />
    )
  }

  // Outer wrapper layout (standalone uses absolute coords; embed fills parent)
  const outerStyle = embed
    ? {
        position: 'relative',
        width: '100%',
        height: '100%',
      }
    : {
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        // Use a separate transform layer for rotation on the inner container (containerRef).
        // Keeping outer AABB axis-aligned preserves crisp text and predictable handles.
      }

  return (
    <motion.div
      className="relative"
      style={outerStyle}
      initial={initAnim}
      animate={enterAnim}
      exit={exitAnim}
      onMouseDown={onContainerMouseDown}
    >
      <div
        ref={containerRef}
        className="w-full h-full"
        style={containerStyle}
        onClick={() => { if (!embed) setIsSelectedInternal(true) }}
      >
        {/* Editor box (glass, rounded, shadow) */}
        <div className="w-full h-full" style={editorBoxStyle}>
          <div
            data-ktb-editor
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            spellCheck={false}
            style={editableStyle}
            onInput={handleInput}
            onFocus={handleFocus}
            onBlur={commitAndBlur}
            onKeyDown={handleKeyDown}
            // Prevent parent drag when selecting text
            onMouseDown={(e)=>{ e.stopPropagation() }}
          />
        </div>

        {/* Boundary and controls (standalone only) */}
        {renderBoundary()}
        {renderRotationHandle()}
        {renderHandles()}
      </div>
    </motion.div>
  )
}
