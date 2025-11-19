import React from 'react'
import { useSlides } from '../context/SlidesContext.jsx'
import { MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight, MdVerticalAlignTop, MdVerticalAlignCenter, MdVerticalAlignBottom } from 'react-icons/md'

export default function TextStylePanel() {
  const { state, dispatch } = useSlides()

  const colorSectionRef = React.useRef(null)
  const currentSlide = state.slides.find(s => s.id === state.currentSlideId)
  const selected = currentSlide?.elements.find(e => e.id === state.selectedElementId)

  if (!selected || selected.type !== 'text') {
    return <div className="text-sm text-gray-600">Select a text box to edit its style.</div>
  }

  const styles = selected.styles || {}
  const bgFillEnabled = styles.enableBgColor ?? (!!selected.bgColor && selected.bgColor !== 'transparent')

  const getBgColorFallback = () => {
    if (selected.bgColor && selected.bgColor !== 'transparent') return selected.bgColor
    if (styles.highlightColor) return styles.highlightColor
    return '#fef08a'
  }

  // Shared helpers copied from Toolbar to preserve functionality
  const getActiveEditorHandle = () => window.currentTextEditorRef?.current ?? null

  const hasActiveEditorSelection = () => {
    const editorHandle = getActiveEditorHandle()
    if (!editorHandle) return false
    if (typeof editorHandle.hasSelection === 'function') {
      return editorHandle.hasSelection()
    }
    const editorNode = editorHandle.editorNode ?? null
    if (!editorNode) return false
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return false
    const range = selection.getRangeAt(0)
    return editorNode.contains(range.startContainer) && editorNode.contains(range.endContainer)
  }

  const applyInlineFormat = (command, value = null) => {
    const editorHandle = getActiveEditorHandle()
    if (!editorHandle) return false
    setTimeout(() => {
      editorHandle.applyFormat(command, value)
    }, 10)
    return true
  }

  const setFontFamily = (fontFamily) => {
    const editorHandle = getActiveEditorHandle()
    if (selected.type === 'text' && editorHandle?.applyFontFamily && hasActiveEditorSelection()) {
      editorHandle.applyFontFamily(fontFamily)
      return
    }
    const next = { ...styles, fontFamily }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles: next } })
    if (editorHandle && editorHandle.editorNode) {
      setTimeout(() => { editorHandle.editorNode.style.fontFamily = fontFamily }, 10)
    }
  }

  const setFontSize = (sizeVal) => {
    const next = { ...styles, fontSize: Number(sizeVal) }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles: next } })
  }

  const setColor = (colorVal) => {
    const next = { ...styles, color: colorVal }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles: next } })
  }

  const setBorderColor = (colorVal) => {
    const next = { ...styles, borderColor: colorVal }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles: next } })
  }

  const setBgFillEnabled = (enabled) => {
    const baseColor = getBgColorFallback()
    const nextStyles = { ...styles, enableBgColor: enabled }
    if (enabled) nextStyles.highlightColor = baseColor
    dispatch({
      type: 'UPDATE_ELEMENT',
      id: selected.id,
      patch: {
        bgColor: enabled ? baseColor : 'transparent',
        styles: nextStyles,
      }
    })
  }

  const applyBackgroundColor = (colorVal) => {
    const nextStyles = { ...styles, highlightColor: colorVal }
    const patch = { styles: nextStyles }
    if (bgFillEnabled) {
      patch.bgColor = colorVal
    }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch })
  }

  const setTextOpacity = (opacityVal) => {
    const value = Math.max(0, Math.min(1, Number(opacityVal) || 0))
    const next = { ...styles, opacity: value }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles: next } })
  }

  const setLineHeight = (lhVal) => {
    const base = styles.lineHeight ?? 1.2
    const raw = lhVal == null ? base : Number(lhVal)
    const value = Math.max(0.8, Math.min(2, isNaN(raw) ? base : raw))
    const next = { ...styles, lineHeight: value }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles: next } })
  }

  const setShadowEnabled = (enabled) => {
    const next = { ...styles, shadowEnabled: !!enabled }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles: next } })
  }

  const setShadowOpacity = (opacityVal) => {
    const value = Math.max(0, Math.min(1, Number(opacityVal) || 0))
    const next = { ...styles, shadowOpacity: value }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles: next } })
  }

  const setAlign = (align) => {
    const next = { ...styles, align }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles: next } })
    const editorHandle = getActiveEditorHandle()
    if (editorHandle && editorHandle.editorNode) {
      const editorNode = editorHandle.editorNode
      editorNode.style.textAlign = align
      editorNode.focus()
      if (typeof editorHandle.emitChange === 'function') {
        setTimeout(() => editorHandle.emitChange(), 0)
      }
    }
  }

  const setVAlign = (valign) => {
    const next = { ...styles, valign }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles: next } })
  }

  const toTitleCase = (s='') => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
  const applyCaseTransform = (mode /* 'upper'|'lower'|'title' */) => {
    const editorHandle = getActiveEditorHandle()
    const convert = (t='') => mode === 'upper' ? t.toUpperCase() : mode === 'lower' ? t.toLowerCase() : toTitleCase(t)
    if (editorHandle && editorHandle.editorNode) {
      const ed = editorHandle.editorNode
      const transformNodes = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          node.nodeValue = convert(node.nodeValue)
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          node.childNodes.forEach(transformNodes)
        }
      }
      transformNodes(ed)
      if (typeof editorHandle.emitChange === 'function') editorHandle.emitChange()
      return true
    }
    if (selected && selected.type === 'text' && !selected.html) {
      const nextText = convert(selected.text || '')
      dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { text: nextText } })
      return true
    }
    return false
  }

  // Inline formats state (reflect toolbar behavior)
  const [inlineFormats, setInlineFormats] = React.useState({ bold: !!styles.bold, italic: !!styles.italic, underline: !!styles.underline })
  const readCommandState = (command) => {
    try { return document.queryCommandState(command) } catch { return false }
  }
  const updateInlineFormats = () => {
    const editorHandle = getActiveEditorHandle()
    if (!editorHandle) {
      setInlineFormats({ bold: !!styles.bold, italic: !!styles.italic, underline: !!styles.underline })
      return
    }
    if (typeof editorHandle.hasSelection === 'function' && editorHandle.hasSelection()) {
      setInlineFormats({ bold: readCommandState('bold'), italic: readCommandState('italic'), underline: readCommandState('underline') })
      return
    }
    const editorNode = editorHandle.editorNode ?? null
    const selection = window.getSelection()
    if (!editorNode || !selection || selection.rangeCount === 0) {
      setInlineFormats({ bold: !!styles.bold, italic: !!styles.italic, underline: !!styles.underline })
      return
    }
    const range = selection.getRangeAt(0)
    if (editorNode.contains(range.startContainer) && editorNode.contains(range.endContainer)) {
      setInlineFormats({ bold: readCommandState('bold'), italic: readCommandState('italic'), underline: readCommandState('underline') })
    } else {
      setInlineFormats({ bold: !!styles.bold, italic: !!styles.italic, underline: !!styles.underline })
    }
  }
  React.useEffect(() => {
    updateInlineFormats()
  }, [selected?.id, styles.bold, styles.italic, styles.underline])
  React.useEffect(() => {
    const onSel = () => updateInlineFormats()
    document.addEventListener('selectionchange', onSel)
    return () => document.removeEventListener('selectionchange', onSel)
  }, [selected?.id])

  const handleInlineStyleToggle = (styleKey, command) => {
    const editorHandle = getActiveEditorHandle()
    const hasSel = hasActiveEditorSelection()
    if (editorHandle && hasSel) {
      const desired = !inlineFormats[styleKey]
      applyInlineFormat(command)
      if (typeof editorHandle.setTypingState === 'function') {
        editorHandle.setTypingState({ [styleKey]: desired })
      }
      setTimeout(updateInlineFormats, 20)
      return
    }
    // Compute from element styles when not editing
    const currentVal = !!(styles && styles[styleKey])
    const desired = !currentVal
    const next = { ...styles, [styleKey]: desired }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles: next } })
    if (editorHandle && editorHandle.editorNode) {
      const node = editorHandle.editorNode
      if (styleKey === 'bold') node.style.fontWeight = desired ? '700' : '400'
      if (styleKey === 'italic') node.style.fontStyle = desired ? 'italic' : 'normal'
      if (styleKey === 'underline') node.style.textDecoration = desired ? 'underline' : 'none'
    }
    setInlineFormats((prev) => ({ ...prev, [styleKey]: desired }))
    setTimeout(updateInlineFormats, 20)
  }

  const preventMouseDown = (e) => e.preventDefault()

  // List helpers (ported from Toolbar)
  const findTopLists = (root) => {
    const lists = []
    root.childNodes.forEach((n) => {
      if (n.nodeType === 1 && (n.tagName === 'UL' || n.tagName === 'OL')) lists.push(n)
    })
    return lists
  }
  const unwrapListsToPlainText = (root) => {
    const lists = root.querySelectorAll('ul, ol')
    lists.forEach((list) => {
      const frag = document.createDocumentFragment()
      list.querySelectorAll(':scope > li').forEach((li, idx, arr) => {
        while (li.firstChild) frag.appendChild(li.firstChild)
        if (idx < arr.length - 1) frag.appendChild(document.createTextNode('\n'))
      })
      list.replaceWith(frag)
    })
  }
  const applyListStyleType = (root, cssType) => {
    findTopLists(root).forEach((list) => {
      if (list.tagName === 'UL' && (cssType === 'disc' || cssType === 'circle' || cssType === 'square')) {
        list.style.listStyleType = cssType
        list.style.listStylePosition = 'inside'
        list.style.paddingInlineStart = '1.25em'
        list.style.margin = '0'
      } else if (list.tagName === 'OL') {
        list.style.listStyleType = cssType
        list.style.listStylePosition = 'inside'
        list.style.paddingInlineStart = '1.25em'
        list.style.margin = '0'
      }
    })
  }

  const getCurrentListStyle = () => {
    const editorHandle = getActiveEditorHandle()
    if (editorHandle && editorHandle.editorNode) {
      const editorNode = editorHandle.editorNode
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        let element = range.startContainer
        if (element.nodeType === Node.TEXT_NODE) {
          element = element.parentElement
        }
        while (element && element !== editorNode) {
          if (element.tagName === 'UL') {
            const listStyle = element.style.listStyleType || 'disc'
            return listStyle === 'disc' ? 'bullet' : 'bullet'
          }
          if (element.tagName === 'OL') {
            const listStyle = element.style.listStyleType || 'decimal'
            if (listStyle === 'upper-roman') return 'roman'
            if (listStyle === 'upper-alpha') return 'alpha'
            return 'number'
          }
          element = element.parentElement
        }
      }
    }
    return selected?.styles?.listStyle || 'none'
  }

  const setListStyle = (listType) => {
    if (!selected || selected.type !== 'text') return
    const current = getCurrentListStyle()
    const editorHandle = getActiveEditorHandle()
    if (editorHandle && editorHandle.editorNode) {
      const editorNode = editorHandle.editorNode
      editorNode.focus()
      setTimeout(() => {
        try {
          if (listType === 'none') {
            document.execCommand('insertOrderedList', false, null)
            document.execCommand('insertUnorderedList', false, null)
            unwrapListsToPlainText(editorNode)
          } else if (listType === current) {
            // Already this style: just enforce visual style, do not toggle off
            if (listType === 'bullet' || listType === 'bullet-circle' || listType === 'bullet-square') {
              const cssType = listType === 'bullet-circle' ? 'circle' : listType === 'bullet-square' ? 'square' : 'disc'
              applyListStyleType(editorNode, cssType)
            } else if (listType === 'number') {
              applyListStyleType(editorNode, 'decimal')
            } else if (listType === 'roman') {
              applyListStyleType(editorNode, 'upper-roman')
            } else if (listType === 'alpha') {
              applyListStyleType(editorNode, 'upper-alpha')
            }
          } else if (listType === 'bullet' || listType === 'bullet-circle' || listType === 'bullet-square') {
            if (editorNode.querySelector('ol')) {
              document.execCommand('insertOrderedList', false, null)
            }
            document.execCommand('insertUnorderedList', false, null)
            const cssType = listType === 'bullet-circle' ? 'circle' : listType === 'bullet-square' ? 'square' : 'disc'
            applyListStyleType(editorNode, cssType)
          } else if (listType === 'number') {
            if (editorNode.querySelector('ul')) {
              document.execCommand('insertUnorderedList', false, null)
            }
            document.execCommand('insertOrderedList', false, null)
            applyListStyleType(editorNode, 'decimal')
          } else if (listType === 'roman') {
            // Always apply Roman style; do not toggle ordered list off.
            const hasOrdered = !!editorNode.querySelector('ol')
            const hasUnordered = !!editorNode.querySelector('ul')
            if (!hasOrdered) {
              if (hasUnordered) {
                document.execCommand('insertUnorderedList', false, null)
              }
              document.execCommand('insertOrderedList', false, null)
            }
            applyListStyleType(editorNode, 'upper-roman')
          } else if (listType === 'alpha') {
            // Always apply Alpha style; do not toggle ordered list off.
            const hasOrdered = !!editorNode.querySelector('ol')
            const hasUnordered = !!editorNode.querySelector('ul')
            if (!hasOrdered) {
              if (hasUnordered) {
                document.execCommand('insertUnorderedList', false, null)
              }
              document.execCommand('insertOrderedList', false, null)
            }
            applyListStyleType(editorNode, 'upper-alpha')
          }
          const event = new Event('input', { bubbles: true })
          editorNode.dispatchEvent(event)
        } catch (error) {
          console.warn('List formatting error:', error)
        }
      }, 10)
    }
    const stylesNext = { ...(selected.styles || {}), listStyle: listType }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles: stylesNext } })
  }

  const editorHandleForFlags = getActiveEditorHandle()
  const isEditing = !!editorHandleForFlags
  const canEditLists = isEditing

  const Btn = ({ active, title, onClick, children, disabled }) => (
    <button
      title={title}
      onMouseDown={preventMouseDown}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
        border transition-all duration-150 ease-out
        ${disabled ? 'opacity-40 cursor-not-allowed' : active ? '' : 'hover:bg-gray-50 hover:border-gray-300'}
        ${active ? 'bg-black text-white border-black shadow-sm' : 'bg-white/80 border-gray-200 text-gray-800'}
      `}
    >
      {children}
    </button>
  )

  const fontFamilies = [
    { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
    { label: 'SF Pro / System', value: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Times New Roman', value: "'Times New Roman', serif" },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Courier New', value: "'Courier New', monospace" },
  ]

  const [fontMenuOpen, setFontMenuOpen] = React.useState(false)
  const [showColorPalette, setShowColorPalette] = React.useState(false)
  const [colorPaletteMode, setColorPaletteMode] = React.useState('text') // 'text' | 'background'

  const fontMenuRef = React.useRef(null)
  const colorInputRef = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      // Only close the font menu on outside clicks; keep the color palette open
      if (fontMenuRef.current && fontMenuRef.current.contains(e.target)) return
      setFontMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // When the color palette opens, immediately trigger the native color picker
  React.useEffect(() => {
    if (showColorPalette && colorInputRef.current) {
      try {
        colorInputRef.current.focus()
        colorInputRef.current.click()
      } catch {}
    }
  }, [showColorPalette, colorPaletteMode])

  return (
    <div className="space-y-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/70 pl-2 pr-3 py-3 shadow-sm overflow-x-hidden">
      <div className="flex items-center justify-between mb-1 px-2 py-1 rounded-xl bg-gradient-to-r from-white/95 via-white/80 to-white/90 shadow-[0_1px_4px_rgba(15,23,42,0.12)] border border-white/80 backdrop-blur-sm">
        <h3 className="font-semibold text-sm tracking-tight text-gray-900">Text Style</h3>
        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">INSPECTOR</span>
      </div>

      {/* Font family + size row */}
      <div className="flex items-end gap-3">
        {/* Font family */}
        <div className="flex-1 space-y-1" ref={fontMenuRef}>
          <div className="text-[11px] font-medium text-gray-600">Font</div>
          <div className="relative">
            <button
              type="button"
              onMouseDown={preventMouseDown}
              onClick={() => setFontMenuOpen((o) => !o)}
              className={`
                w-full inline-flex items-center justify-between rounded-xl border bg-white/90 px-3 py-2 text-xs
                shadow-[0_1px_1.5px_rgba(15,23,42,0.08)] transition-all duration-150 ease-out
                ${fontMenuOpen ? 'border-black/80 shadow-[0_6px_18px_rgba(15,23,42,0.2)]' : 'border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_12px_rgba(15,23,42,0.12)]'}
              `}
            >
              <span className="truncate" style={{ fontFamily: styles.fontFamily || 'Inter, system-ui, sans-serif' }}>
                {fontFamilies.find((f) => f.value === (styles.fontFamily || 'Inter, system-ui, sans-serif'))?.label || 'Font'}
              </span>
              <span className={`ml-2 inline-flex h-4 w-4 items-center justify-center text-[9px] text-gray-500 transition-transform duration-150 ${fontMenuOpen ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </button>
            <div
              className={`
                absolute z-[20] mt-1 left-0 right-0 origin-top rounded-xl border border-gray-200 bg-white/95
                shadow-[0_8px_24px_rgba(15,23,42,0.18)] max-h-56 overflow-auto
                transition-all duration-150 ease-out
                ${fontMenuOpen ? 'opacity-100 translate-y-0 scale-y-100 pointer-events-auto' : 'opacity-0 -translate-y-1 scale-y-95 pointer-events-none'}
              `}
            >
              {fontFamilies.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onMouseDown={preventMouseDown}
                  onClick={() => {
                    setFontFamily(f.value)
                    setFontMenuOpen(false)
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100"
                  style={{ fontFamily: f.value }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Font size */}
        <div className="w-28 space-y-1">
          <div className="text-[11px] font-medium text-gray-600">Size</div>
          <div className="flex items-center rounded-xl border border-gray-200 bg-white/90 px-1.5 py-1.5 shadow-[0_1px_1.5px_rgba(15,23,42,0.08)] text-xs h-8">
            <button
              type="button"
              onMouseDown={preventMouseDown}
              onClick={() => setFontSize((styles.fontSize ?? 28) - 1)}
              className="h-4 w-4 rounded-lg text-[10px] text-gray-500 hover:bg-gray-100 flex items-center justify-center"
            >
              −
            </button>
            <input
              type="number"
              min="8"
              max="96"
              step="1"
              value={styles.fontSize ?? 28}
              onChange={(e) => setFontSize(e.target.value)}
              className="flex-1 border-none bg-transparent px-1 text-center text-xs text-gray-900 focus:outline-none focus:ring-0"
            />
            <button
              type="button"
              onMouseDown={preventMouseDown}
              onClick={() => setFontSize((styles.fontSize ?? 28) + 1)}
              className="h-4 w-4 rounded-lg text-[10px] text-gray-500 hover:bg-gray-100 flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Text, Background & Border Color */}
      <div className="space-y-1" ref={colorSectionRef}>
        <div className="text-[11px] font-medium text-gray-600 flex items-center gap-2 flex-wrap">
          <span>Text Color</span>
          <span className="text-[10px] text-gray-400">/ Background</span>
          <div className="ml-auto flex items-center gap-3">
            <label className="flex items-center gap-1 text-[10px] text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={bgFillEnabled}
                onChange={(e) => setBgFillEnabled(e.target.checked)}
              />
              <span>Fill</span>
            </label>
            <label className="flex items-center gap-1 text-[10px] text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={!!styles.showBorder}
                onChange={(e) => {
                  const next = { ...styles, showBorder: e.target.checked }
                  dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles: next } })
                }}
              />
              <span>Border</span>
            </label>
          </div>
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 pl-0">
            {/* Text color chip */}
            <button
              type="button"
              onMouseDown={preventMouseDown}
              onClick={() => {
                setColorPaletteMode('text')
                setShowColorPalette((open) => !open)
              }}
              className="h-6 w-6 rounded-full border border-black/10"
              style={{ backgroundColor: styles.color || '#111827' }}
            />
            {/* Background (highlight) color chip */}
            <button
              type="button"
              disabled={!bgFillEnabled}
              onMouseDown={(e) => {
                if (!bgFillEnabled) return
                preventMouseDown(e)
              }}
              onClick={() => {
                if (!bgFillEnabled) return
                setColorPaletteMode('background')
                setShowColorPalette((open) => !open)
              }}
              className={`h-6 w-6 rounded-full border ${bgFillEnabled ? 'border-black/10' : 'border-gray-200 opacity-40 cursor-not-allowed'}`}
              style={
                bgFillEnabled
                  ? { backgroundColor: selected.bgColor || styles.highlightColor || '#fef08a' }
                  : {
                      backgroundColor: 'transparent',
                      backgroundImage: 'linear-gradient(135deg, #e5e7eb 25%, transparent 25%, transparent 50%, #e5e7eb 50%, #e5e7eb 75%, transparent 75%, transparent)',
                      backgroundSize: '6px 6px'
                    }
              }
            />
            {/* Border color chip (enabled when border is on) */}
            <button
              type="button"
              disabled={!styles.showBorder}
              onMouseDown={preventMouseDown}
              onClick={() => {
                setColorPaletteMode('border')
                setShowColorPalette((open) => !open)
              }}
              className={`h-6 w-6 rounded-full border ${styles.showBorder ? 'border-black/10' : 'border-gray-200 opacity-40 cursor-not-allowed'}`}
              style={{ backgroundColor: styles.borderColor || '#111827' }}
            />
          </div>

          {showColorPalette && (
            <div className="mt-2 ml-1 rounded-xl border border-gray-200 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.18)] p-2 w-52 text-[11px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-[0.15em] text-gray-500">Color Picker</span>
                <button
                  type="button"
                  onMouseDown={preventMouseDown}
                  onClick={() => setShowColorPalette(false)}
                  className="text-[11px] text-gray-400 hover:text-gray-700 px-1"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-6 gap-1 mb-2">
                {['#111827','#6b7280','#9ca3af','#f97316','#ef4444','#facc15','#22c55e','#0ea5e9','#6366f1','#ec4899','#ffffff','#000000'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={preventMouseDown}
                    onClick={() => {
                      if (colorPaletteMode === 'text') {
                        setColor(c)
                      } else if (colorPaletteMode === 'background') {
                        applyBackgroundColor(c)
                      } else if (colorPaletteMode === 'border') {
                        setBorderColor(c)
                      }
                      // Keep palette open; user will close explicitly via the close button
                    }}
                    className="h-5 w-5 rounded-full border border-black/5"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Custom</span>
                <input
                  ref={colorInputRef}
                  type="color"
                  value={
                    colorPaletteMode === 'text'
                      ? (styles.color || '#111827')
                      : colorPaletteMode === 'background'
                        ? getBgColorFallback()
                        : (styles.borderColor || '#111827')
                  }
                  onChange={(e) => {
                    const c = e.target.value
                    if (colorPaletteMode === 'text') {
                      setColor(c)
                    } else if (colorPaletteMode === 'background') {
                      applyBackgroundColor(c)
                    } else if (colorPaletteMode === 'border') {
                      setBorderColor(c)
                    }
                  }}
                  className="h-6 w-8 cursor-pointer border border-gray-200 rounded"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Line spacing */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-medium text-gray-600">
          <span>Line Spacing</span>
          <span className="text-[10px] text-gray-400">
            {(styles.lineHeight ?? 1.2).toFixed(2)}x
          </span>
        </div>
        <div className="inline-flex rounded-xl border border-gray-200 bg-white/80 p-0.5 shadow-[0_1px_1.5px_rgba(15,23,42,0.08)] gap-1">
          <Btn
            title="Decrease line spacing"
            onClick={() => setLineHeight((styles.lineHeight ?? 1.2) - 0.1)}
          >
            <span className="text-xs">−</span>
          </Btn>
          <Btn
            title="Increase line spacing"
            onClick={() => setLineHeight((styles.lineHeight ?? 1.2) + 0.1)}
          >
            <span className="text-xs">+</span>
          </Btn>
        </div>
      </div>

      {/* Text Opacity */}
      <div className="space-y-1">
        <div className="text-[11px] font-medium text-gray-600 flex items-center gap-2">
          <span>Text Opacity</span>
          <span className="text-[10px] text-gray-400">
            {Math.round((styles.opacity ?? 1) * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={styles.opacity ?? 1}
          onChange={(e) => setTextOpacity(e.target.value)}
          className="w-full accent-[#111827]"
        />
      </div>

      {/* Emphasis & Case */}
      <div className="space-y-1">
        <div className="text-[11px] font-medium text-gray-600">Emphasis & Case</div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-gray-200 bg-white/80 p-0.5 shadow-[0_1px_1.5px_rgba(15,23,42,0.08)]">
            <Btn
              title="Bold"
              active={isEditing ? !!inlineFormats.bold : !!styles.bold}
              onClick={() => handleInlineStyleToggle('bold', 'bold')}
              disabled={!selected}
            >
              <span className="text-sm font-semibold">B</span>
            </Btn>
            <Btn
              title="Italic"
              active={isEditing ? !!inlineFormats.italic : !!styles.italic}
              onClick={() => handleInlineStyleToggle('italic', 'italic')}
              disabled={!selected}
            >
              <span className="text-sm italic">I</span>
            </Btn>
            <Btn
              title="Underline"
              active={isEditing ? !!inlineFormats.underline : !!styles.underline}
              onClick={() => handleInlineStyleToggle('underline', 'underline')}
              disabled={!selected}
            >
              <span className="text-sm underline">U</span>
            </Btn>
          </div>
          <div className="inline-flex items-center gap-2">
            <Btn title="Title Case" onClick={() => applyCaseTransform('title')} disabled={!selected}>Title</Btn>
            <Btn title="UPPERCASE" onClick={() => applyCaseTransform('upper')} disabled={!selected}>ABC</Btn>
            <Btn title="lowercase" onClick={() => applyCaseTransform('lower')} disabled={!selected}>abc</Btn>
          </div>
        </div>
      </div>

      {/* Alignment */}
      <div className="space-y-1">
        <div className="text-[11px] font-medium text-gray-600">Alignment</div>
        <div className="inline-flex rounded-xl border border-gray-200 bg-white/80 p-0.5 shadow-[0_1px_1.5px_rgba(15,23,42,0.08)] gap-1">
          <Btn title="Align Left" active={(styles.align || 'left') === 'left'} onClick={() => setAlign('left')}>
            <MdFormatAlignLeft className="h-4 w-4" />
          </Btn>
          <Btn title="Align Center" active={styles.align === 'center'} onClick={() => setAlign('center')}>
            <MdFormatAlignCenter className="h-4 w-4" />
          </Btn>
          <Btn title="Align Right" active={styles.align === 'right'} onClick={() => setAlign('right')}>
            <MdFormatAlignRight className="h-4 w-4" />
          </Btn>
          <Btn title="Top" active={(styles.valign || 'top') === 'top'} onClick={() => setVAlign('top')}>
            <MdVerticalAlignTop className="h-4 w-4" />
          </Btn>
          <Btn title="Middle" active={styles.valign === 'middle'} onClick={() => setVAlign('middle')}>
            <MdVerticalAlignCenter className="h-4 w-4" />
          </Btn>
          <Btn title="Bottom" active={styles.valign === 'bottom'} onClick={() => setVAlign('bottom')}>
            <MdVerticalAlignBottom className="h-4 w-4" />
          </Btn>
        </div>
      </div>

      {/* Lists */}
      <div className="space-y-1">
        <div className="text-[11px] font-medium text-gray-600">Lists</div>
        <div className="flex gap-2 flex-wrap">
          <Btn title="No List" active={getCurrentListStyle() === 'none'} onClick={() => setListStyle('none')} disabled={!canEditLists}>—</Btn>
          <Btn title="Bullets" active={getCurrentListStyle() === 'bullet'} onClick={() => setListStyle('bullet')} disabled={!canEditLists}>•</Btn>
          <Btn title="Numbers" active={getCurrentListStyle() === 'number'} onClick={() => setListStyle('number')} disabled={!canEditLists}>1.</Btn>
          <Btn title="Roman" active={getCurrentListStyle() === 'roman'} onClick={() => setListStyle('roman')} disabled={!canEditLists}>I.</Btn>
          <Btn title="Alpha" active={getCurrentListStyle() === 'alpha'} onClick={() => setListStyle('alpha')} disabled={!canEditLists}>A.</Btn>
        </div>
      </div>

      {/* Text Shadow */}
      <div className="space-y-1 mt-1">
        <div className="flex items-center justify-between text-[11px] font-medium text-gray-600">
          <span>Text Shadow</span>
          <label className="flex items-center gap-1 text-[10px] text-gray-600">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              checked={!!styles.shadowEnabled}
              onChange={(e) => setShadowEnabled(e.target.checked)}
            />
            <span>Enable</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={styles.shadowOpacity ?? 0.5}
            onChange={(e) => setShadowOpacity(e.target.value)}
            disabled={!styles.shadowEnabled}
            className="flex-1 accent-[#111827] disabled:opacity-40"
          />
          <span className="text-[10px] text-gray-500 w-10 text-right">
            {Math.round(((styles.shadowOpacity ?? 0.5) * 100))}%
          </span>
        </div>
      </div>
    </div>
  )
}
