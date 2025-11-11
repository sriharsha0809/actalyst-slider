import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react'
import { createPortal } from 'react-dom'

const RichTextEditor = forwardRef(({ el, onChange, onBlur, scale = 1 }, ref) => {
  const editorRef = useRef(null)
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false })
  const desiredTypingRef = useRef({ bold: false, italic: false, underline: false })
  const toolbarRef = useRef(null)
  const containerNodeRef = useRef(null)
  // Desired list style for upcoming text while editing ('none' | 'bullet' | 'number' | 'roman' | 'alpha')
  const desiredListRef = useRef('none')
  const [currentFontFamily, setCurrentFontFamily] = useState('')
  const [currentListStyle, setCurrentListStyle] = useState('none')
  const previousSnapshotRef = useRef(null)
  const isComposingRef = useRef(false)

  useEffect(() => {
    if (editorRef.current) {
      if (el.html) {
        editorRef.current.innerHTML = el.html
      } else if (el.text) {
        editorRef.current.textContent = el.text
      } else {
        editorRef.current.innerHTML = ''
      }
      editorRef.current.focus()
      // Place caret at end so user can continue typing after existing content
      try { setCaretToEnd() } catch {}
      captureSnapshot()
      // Initialize desired typing state to off on new element
      desiredTypingRef.current = { bold: false, italic: false, underline: false }
      // Prefer using CSS spans when styling
      try { document.execCommand('styleWithCSS', false, true) } catch {}
    }
  }, [el.id])

  // Separate useEffect to handle alignment changes
  useEffect(() => {
    if (editorRef.current) {
      // Apply alignment from element styles, default to 'left'
      const align = el.styles?.align || 'left'
      editorRef.current.style.textAlign = align
      // Use column flex so alignItems controls horizontal alignment
      editorRef.current.style.flexDirection = 'column'
      const ai = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'
      editorRef.current.style.alignItems = ai
    }
  }, [el.styles?.align])

  function emitChange() {
    if (!editorRef.current) return
    onChange({
      html: editorRef.current.innerHTML,
      text: editorRef.current.textContent,
    })
  }

  function cleanupAccidentalBreak() {
    const editor = editorRef.current
    if (!editor) return
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return
    const range = sel.getRangeAt(0)
    const container = range.startContainer
    const offset = range.startOffset
    // Case 1: element node with a <br> immediately before caret
    if (container.nodeType === Node.ELEMENT_NODE && offset > 0) {
      const prev = container.childNodes[offset - 1]
      if (prev && prev.nodeName === 'BR') {
        prev.remove()
        return
      }
    }
    // Case 2: text node with trailing newline just before caret
    if (container.nodeType === Node.TEXT_NODE && offset > 0) {
      const t = container.nodeValue || ''
      if (t.charCodeAt(offset - 1) === 10) { // '\n'
        const before = t.slice(0, offset - 1)
        const after = t.slice(offset)
        container.nodeValue = before + after
        const newRange = document.createRange()
        newRange.setStart(container, Math.max(0, offset - 1))
        newRange.collapse(true)
        sel.removeAllRanges()
        sel.addRange(newRange)
      }
    }
  }

  function setCaretToEnd() {
    const editor = editorRef.current
    if (!editor) return
    const range = document.createRange()
    let node = editor
    // Find last text node inside editor
    function getLastText(n) {
      if (n.nodeType === Node.TEXT_NODE) return n
      for (let i = n.childNodes.length - 1; i >= 0; i--) {
        const res = getLastText(n.childNodes[i])
        if (res) return res
      }
      return null
    }
    const lastText = getLastText(editor) || editor
    const len = lastText.nodeType === Node.TEXT_NODE ? (lastText.nodeValue || '').length : (lastText.childNodes?.length || 0)
    try {
      range.setStart(lastText, len)
      range.collapse(true)
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
      editor.focus()
    } catch {}
  }

  function captureSnapshot() {
    const editor = editorRef.current
    if (!editor) return
    previousSnapshotRef.current = {
      html: editor.innerHTML,
      text: editor.textContent,
      selection: getSelectionOffsets(editor),
    }
  }

  function restoreSnapshot() {
    const editor = editorRef.current
    const snapshot = previousSnapshotRef.current
    if (!editor || !snapshot) return
    editor.innerHTML = snapshot.html
    if (snapshot.selection) {
      setSelectionOffsets(editor, snapshot.selection.start, snapshot.selection.end)
    }
    emitChange()
    captureSnapshot()
    refreshActiveFormats()
  }

  function isOverflowing() {
    const editor = editorRef.current
    if (!editor) return false
    const toleranceW = 0.5
    const toleranceH = 1.0
    const overflowW = (editor.scrollWidth - editor.clientWidth) > toleranceW
    const overflowH = (editor.scrollHeight - editor.clientHeight) > toleranceH
    return overflowW || overflowH
  }

  function exceedsSlideLimits() {
    const editor = editorRef.current
    if (!editor) return false
    const REF_WIDTH = 960
    const REF_HEIGHT = 540
    const s = Number(scale || 1)
    const maxWidthPx = Math.max(0, (REF_WIDTH - (el.x || 0)) * s)
    const maxHeightPx = Math.max(0, (REF_HEIGHT - (el.y || 0)) * s)
    // use scroll sizes to measure actual content footprint
    const tooWide = editor.scrollWidth > (maxWidthPx + 0.5)
    const tooTall = editor.scrollHeight > (maxHeightPx + 1)
    return tooWide || tooTall
  }


  // Component-scope getCurrentFontFamily function
  const getCurrentFontFamily = () => {
    const editor = editorRef.current
    if (!editor) return ''
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return ''
    const range = selection.getRangeAt(0)
    if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return ''
    
    if (selection.isCollapsed) {
      const node = range.startContainer.nodeType === Node.TEXT_NODE ? range.startContainer.parentElement : range.startContainer
      if (!node || node === editor) return editor.style.fontFamily || el.styles?.fontFamily || ''
      const computedFont = window.getComputedStyle(node).fontFamily || ''
      return normalizeDisplayFont(computedFont)
    }
    
    const families = collectFontFamilies(editor, range)
    if (families.size === 0) return ''
    if (families.size === 1) {
      const fontFamily = families.values().next().value
      return normalizeDisplayFont(fontFamily)
    }
    return 'mixed'
  }

  // Helper function to normalize font family for display in dropdown
  const normalizeDisplayFont = (fontFamily) => {
    if (!fontFamily) return ''
    
    // Common font family mappings to match our dropdown options
    const fontMappings = {
      'inter': 'Inter, system-ui, sans-serif',
      'arial': 'Arial, sans-serif', 
      'times new roman': "'Times New Roman', serif",
      'courier new': "'Courier New', monospace",
      'georgia': 'Georgia, serif',
      'verdana': 'Verdana, sans-serif'
    }
    
    const normalized = fontFamily.toLowerCase().replace(/["']/g, '')
    
    // Check if it matches any of our dropdown options exactly
    const dropdownOptions = [
      'Inter, system-ui, sans-serif',
      'Arial, sans-serif',
      "'Times New Roman', serif",
      "'Courier New', monospace", 
      'Georgia, serif',
      'Verdana, sans-serif'
    ]
    
    for (const option of dropdownOptions) {
      if (fontFamily.includes(option.split(',')[0].replace(/["']/g, ''))) {
        return option
      }
    }
    
    // Check font mappings
    for (const [key, value] of Object.entries(fontMappings)) {
      if (normalized.includes(key)) {
        return value
      }
    }
    
    return fontFamily
  }

  function refreshActiveFormats() {
    const editor = editorRef.current
    if (!editor) {
      setActiveFormats({ bold: false, italic: false, underline: false })
      setCurrentFontFamily('')
      return
    }

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setActiveFormats({ bold: false, italic: false, underline: false })
      setCurrentFontFamily('')
      return
    }

    const range = selection.getRangeAt(0)
    const anchorNode = range.commonAncestorContainer
    if (!editor.contains(anchorNode)) {
      setActiveFormats({ bold: false, italic: false, underline: false })
      setCurrentFontFamily('')
      return
    }

    const next = { bold: false, italic: false, underline: false }
    let hadCmdInfo = false
    try {
      const v = document.queryCommandState('bold')
      if (typeof v === 'boolean') { next.bold = v; hadCmdInfo = true }
    } catch {}
    try {
      const v = document.queryCommandState('italic')
      if (typeof v === 'boolean') { next.italic = v; hadCmdInfo = true }
    } catch {}
    try {
      const v = document.queryCommandState('underline')
      if (typeof v === 'boolean') { next.underline = v; hadCmdInfo = true }
    } catch {}

    // Fallback via computed style on selection start
    if (!hadCmdInfo) {
      const elem = range.startContainer.nodeType === Node.TEXT_NODE ? range.startContainer.parentElement : range.startContainer
      if (elem) {
        const cs = window.getComputedStyle(elem)
        next.bold = ((parseInt(cs.fontWeight, 10) || 400) >= 600)
        next.italic = cs.fontStyle === 'italic'
        next.underline = (cs.textDecorationLine || cs.textDecoration || '').includes('underline')
      }
    }

    setActiveFormats(next)

    // Update current font family using the component-scope method
    const fontFamily = getCurrentFontFamily()
    setCurrentFontFamily(fontFamily)

    // Update current list style
    const listStyle = getCurrentListStyle()
    setCurrentListStyle(listStyle)
  }

  function computeAndSetToolbarPosition() {
    const selection = window.getSelection()
    const editor = editorRef.current
    if (!(selection && !selection.isCollapsed && editor && editor.contains(selection.anchorNode))) return false

    const range = selection.getRangeAt(0)
    const selRect = range.getBoundingClientRect()

    // Slide container bounds
    const containerEl = editor.closest('[data-slide-container]') || document.body
    const containerRect = containerEl.getBoundingClientRect()
    containerNodeRef.current = containerEl

    // Space to each edge
    const spaceTop = Math.max(0, selRect.top - containerRect.top)
    const spaceBottom = Math.max(0, containerRect.bottom - selRect.bottom)
    const spaceLeft = Math.max(0, selRect.left - containerRect.left)
    const spaceRight = Math.max(0, containerRect.right - selRect.right)

    // Current toolbar size (fallbacks before first render)
    const tw = (toolbarRef.current?.offsetWidth ?? 0) || 260
    const th = (toolbarRef.current?.offsetHeight ?? 0) || 44
    const margin = 8

    // Candidate quadrants
    const candidates = [
      { key: 'TR', availW: spaceRight, availH: spaceTop, left: () => selRect.right - tw - margin, top: () => selRect.top - th - margin },
      { key: 'TL', availW: spaceLeft,  availH: spaceTop, left: () => selRect.left + margin,      top: () => selRect.top - th - margin },
      { key: 'BR', availW: spaceRight, availH: spaceBottom, left: () => selRect.right - tw - margin, top: () => selRect.bottom + margin },
      { key: 'BL', availW: spaceLeft,  availH: spaceBottom, left: () => selRect.left + margin,      top: () => selRect.bottom + margin },
    ]

    // Primary preference per spec (more width side, more height side)
    const preferredV = spaceTop >= spaceBottom ? 'T' : 'B'
    const preferredH = spaceRight >= spaceLeft ? 'R' : 'L'
    const preferredKey = `${preferredV}${preferredH}`

    // Score and fit
    const withScores = candidates.map(c => ({
      ...c,
      fits: c.availW >= tw + margin && c.availH >= th + margin,
      score: Math.min(c.availW, c.availH), // prefer larger min dimension
      area: c.availW * c.availH,
      preferred: c.key === preferredKey,
    }))

    // Choose: preferred if fits, else best fitting by score, else max area
    let chosen = withScores.find(c => c.preferred && c.fits)
    if (!chosen) {
      const fitting = withScores.filter(c => c.fits)
      if (fitting.length) {
        fitting.sort((a,b) => b.score - a.score)
        chosen = fitting[0]
      } else {
        withScores.sort((a,b) => b.area - a.area)
        chosen = withScores[0]
      }
    }

    let left = chosen.left()
    let top = chosen.top()

    // Clamp strictly inside slide
    const minLeft = containerRect.left + 0
    const maxLeft = containerRect.right - tw
    const minTop = containerRect.top + 0
    const maxTop = containerRect.bottom - th
    left = Math.max(minLeft, Math.min(maxLeft, left))
    top = Math.max(minTop, Math.min(maxTop, top))

    // Convert to slide-local coordinates for absolute positioning within slide
    setToolbarPosition({ top: Math.round(top - containerRect.top), left: Math.round(left - containerRect.left) })
    return true
  }

  const handleSelectionChange = () => {
    const ok = computeAndSetToolbarPosition()
    if (ok) {
      setShowToolbar(true)
      refreshActiveFormats()
    } else {
      setShowToolbar(false)
      setActiveFormats({ bold: false, italic: false, underline: false })
    }
  }

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
    const onResize = () => { if (showToolbar) computeAndSetToolbarPosition() }
    const onDocDown = (e) => {
      const ed = editorRef.current
      if (!ed) return
      // Only blur when clicking inside the main slide canvas but outside the editor
      const slideContainer = (e.target instanceof Element) ? e.target.closest('[data-slide-container]') : null
      if (!slideContainer) return
      if (ed === e.target || ed.contains(e.target)) return
      if (onBlur) onBlur()
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    document.addEventListener('mousedown', onDocDown)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
      document.removeEventListener('mousedown', onDocDown)
    }
  }, [showToolbar, onBlur])

  // Normalize paragraph behavior for Enter key
  useEffect(() => {
    try { document.execCommand('defaultParagraphSeparator', false, 'div') } catch {}
  }, [])

  useEffect(() => {
    setActiveFormats({ bold: false, italic: false, underline: false })
  }, [el.id])

  // Recompute position once toolbar renders (measure real size)
  useEffect(() => {
    if (showToolbar) {
      // Next frame after render to measure
      requestAnimationFrame(() => {
        computeAndSetToolbarPosition()
      })
    }
  }, [showToolbar])

  // Track desired list style from element state (toolbar updates el.styles.listStyle)
  useEffect(() => {
    desiredListRef.current = el.styles?.listStyle || 'none'
  }, [el.styles?.listStyle])

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    applyFormat: (command, value = null) => {
      const editor = editorRef.current
      if (!editor) return

      captureSnapshot()

      const selection = window.getSelection()
      let storedRange = null

      if (selection && selection.rangeCount > 0) {
        const currentRange = selection.getRangeAt(0)
        if (editor.contains(currentRange.commonAncestorContainer)) {
          storedRange = currentRange.cloneRange()
        }
      }
      
      editorRef.current.focus()
      
      if (storedRange && selection) {
        selection.removeAllRanges()
        selection.addRange(storedRange)
      }

      document.execCommand(command, false, value)
      cleanupAccidentalBreak()
      // Update desired typing state at collapsed caret for upcoming text
      try {
        const sel = window.getSelection()
        if (sel && sel.isCollapsed) {
          const after = document.queryCommandState(command)
          if (typeof after === 'boolean') {
            desiredTypingRef.current[command] = after
          }
        }
      } catch {}

      if (isOverflowing()) {
        restoreSnapshot()
        return
      }

      emitChange()
      captureSnapshot()
      refreshActiveFormats()
    },
    applyListStyle: (listType) => {
      const editor = editorRef.current
      if (!editor) return false
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return false
      const range = selection.getRangeAt(0)
      if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return false

      captureSnapshot()
      editor.focus()
      try {
        const inAncestor = (tag) => {
          let node = selection.anchorNode
          if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement
          while (node && node !== editor) {
            if (node.tagName === tag) return node
            node = node.parentElement
          }
          return null
        }
        const setNearestListType = (cssType) => {
          const ul = inAncestor('UL')
          const ol = inAncestor('OL')
          const list = ul || ol
          if (list) {
            list.style.listStyleType = cssType
            list.style.listStylePosition = 'inside'
            list.style.paddingInlineStart = '1.25em'
            list.style.margin = '0'
          }
        }
        const bulletMap = { 'bullet': 'disc', 'bullet-circle': 'circle', 'bullet-square': 'square' }
        const orderedMap = { number: 'decimal', roman: 'upper-roman', alpha: 'upper-alpha' }
        const ulHere = inAncestor('UL')
        const olHere = inAncestor('OL')

        if (listType === 'none') {
          if (olHere) document.execCommand('insertOrderedList', false, null)
          if (ulHere) document.execCommand('insertUnorderedList', false, null)
          // unwrap remnants
          unwrapListsToPlainText(editor)
        } else if (listType in bulletMap) {
          if (olHere) document.execCommand('insertOrderedList', false, null)
          if (!inAncestor('UL')) document.execCommand('insertUnorderedList', false, null)
          setNearestListType(bulletMap[listType])
        } else if (listType in orderedMap) {
          const current = (() => {
            if (olHere) {
              const type = orderedMap[listType]
              const computed = (olHere.style.listStyleType || '').toLowerCase()
              return computed === type
            }
            return false
          })()
          if (current) {
            document.execCommand('insertOrderedList', false, null)
          } else {
            if (ulHere) document.execCommand('insertUnorderedList', false, null)
            if (!inAncestor('OL')) document.execCommand('insertOrderedList', false, null)
            setNearestListType(orderedMap[listType])
          }
        }

        emitChange()
        captureSnapshot()
        refreshActiveFormats()
        return true
      } catch (e) {
        restoreSnapshot()
        return false
      }
    },
    applyFontFamily: async (fontFamily) => {
      const editor = editorRef.current
      if (!editor) return false

      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return false

      const range = selection.getRangeAt(0)
      if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return false

      captureSnapshot()
      const selectionOffsets = getSelectionOffsets(editor)
      const normalizedFamily = fontFamily || ''

      await ensureFontLoaded(normalizedFamily)

      editor.focus()

      if (selection.isCollapsed) {
        selection.removeAllRanges()
        selection.addRange(range)
        document.execCommand('fontName', false, normalizedFamily || 'inherit')
        convertFontTags(editor)
        cleanupFontSpans(editor)
        mergeSiblingFontSpans(editor)

        if (selectionOffsets) {
          setSelectionOffsets(editor, selectionOffsets.start, selectionOffsets.end)
        }

        if (isOverflowing()) {
          restoreSnapshot()
          return false
        }

        emitChange()
        captureSnapshot()
        refreshActiveFormats()
        return true
      }

      const workingRange = range.cloneRange()
      selection.removeAllRanges()
      selection.addRange(workingRange)

      const existingFamilies = collectFontFamilies(editor, workingRange)
      if (
        normalizedFamily &&
        existingFamilies.size === 1 &&
        equalFontStacks([...existingFamilies][0], normalizedFamily)
      ) {
        if (selectionOffsets) {
          setSelectionOffsets(editor, selectionOffsets.start, selectionOffsets.end)
        }
        return true
      }

      const originalFragment = workingRange.cloneContents()
      const replacement = normalizeFontFamilyChange(originalFragment, normalizedFamily)
      workingRange.deleteContents()
      workingRange.insertNode(replacement)

      cleanupFontSpans(editor)
      mergeSiblingFontSpans(editor)

      if (selectionOffsets) {
        setSelectionOffsets(editor, selectionOffsets.start, selectionOffsets.end)
      }

      if (isOverflowing()) {
        restoreSnapshot()
        return false
      }

      emitChange()
      captureSnapshot()
      refreshActiveFormats()
      return true
    },
    getCurrentFontFamily: () => {
      const editor = editorRef.current
      if (!editor) return ''
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return ''
      const range = selection.getRangeAt(0)
      if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return ''
      if (selection.isCollapsed) {
        const node = range.startContainer.nodeType === Node.TEXT_NODE ? range.startContainer.parentElement : range.startContainer
        if (!node || node === editor) return editor.style.fontFamily || el.styles?.fontFamily || ''
        return window.getComputedStyle(node).fontFamily || ''
      }
      const families = collectFontFamilies(editor, range)
      if (families.size === 0) return ''
      if (families.size === 1) return families.values().next().value
      return 'mixed'
    },
    hasSelection: () => {
      const editor = editorRef.current
      if (!editor) return false
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return false
      const range = selection.getRangeAt(0)
      return editor.contains(range.startContainer) && editor.contains(range.endContainer)
    },
    editorNode: editorRef.current,
    focus: () => {
      editorRef.current?.focus()
    },
    emitChange: () => {
      emitChange()
    },
    setTypingState: (partial) => {
      // Update desired typing state and enforce at caret
      desiredTypingRef.current = { ...desiredTypingRef.current, ...(partial || {}) }
      try {
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0)
          const editor = editorRef.current
          const inEditor = editor && editor.contains(range.startContainer) && editor.contains(range.endContainer)
          if (inEditor && sel.isCollapsed) {
            for (const [cmd, val] of Object.entries(partial || {})) {
              if (['bold','italic','underline'].includes(cmd)) {
                let current
                try { current = document.queryCommandState(cmd) } catch { current = undefined }
                if (typeof current === 'boolean' && typeof val === 'boolean' && current !== val) {
                  document.execCommand(cmd, false, null)
                  cleanupAccidentalBreak()
                }
              }
            }
          }
        }
      } catch {}
    },
    getTypingState: () => ({ ...desiredTypingRef.current }),
    isCollapsedSelection: () => {
      const editor = editorRef.current
      if (!editor) return false
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) return false
      const range = sel.getRangeAt(0)
      const inEditor = editor.contains(range.startContainer) && editor.contains(range.endContainer)
      return inEditor && sel.isCollapsed
    },
  }))

  const handleBlur = () => {
    emitChange()
    captureSnapshot()
    desiredListRef.current = 'none'
    if (onBlur) onBlur()
  }

  const handleBeforeInput = (event) => {
    // Allow insert; block if it would exceed slide boundaries
    try {
      const t = event?.inputType || ''
      if (t.startsWith('insert') && exceedsSlideLimits()) {
        event.preventDefault?.()
        return
      }
    } catch {}

    // Enforce desired typing for upcoming text at collapsed caret (user-controlled)
    try {
      const sel = window.getSelection()
      if (sel && sel.isCollapsed) {
        ;['bold','italic','underline'].forEach((cmd) => {
          const desired = desiredTypingRef.current[cmd]
          if (typeof desired === 'boolean') {
            let current
            try { current = document.queryCommandState(cmd) } catch { current = undefined }
            if (typeof current === 'boolean' && current !== desired) {
              document.execCommand(cmd, false, null)
            }
          }
        })
      }
    } catch {}
    captureSnapshot()
  }

  const handleInput = (event) => {
    if (isComposingRef.current) return
    if (exceedsSlideLimits()) {
      const t = event?.inputType || ''
      // Block only insertions; allow deletions/undos to reduce size
      if (t.startsWith('insert')) {
        event.preventDefault?.()
        restoreSnapshot()
        setCaretToEnd()
        return
      }
    }
    emitChange()
    captureSnapshot()
    refreshActiveFormats()
  }

  const handleCompositionStart = () => {
    isComposingRef.current = true
    captureSnapshot()
  }

  const handleCompositionEnd = () => {
    isComposingRef.current = false
    requestAnimationFrame(() => {
      if (isOverflowing()) {
        restoreSnapshot()
        return
      }
      emitChange()
      captureSnapshot()
      refreshActiveFormats()
    })
  }

  // Fallback: wrap selection with a styled span
  const applyStyleToSelection = (styles) => {
    const editor = editorRef.current
    if (!editor) return false
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return false
    const range = sel.getRangeAt(0)
    if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return false
    if (sel.isCollapsed) return false

    const span = document.createElement('span')
    Object.assign(span.style, styles || {})
    span.appendChild(range.extractContents())
    range.insertNode(span)
    // Reselect the styled content
    sel.removeAllRanges()
    const newRange = document.createRange()
    newRange.selectNodeContents(span)
    sel.addRange(newRange)
    return true
  }

  const toggleStyleFallback = (command, value) => {
    const editor = editorRef.current
    if (!editor) return false
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return false
    const range = sel.getRangeAt(0)
    if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return false
    const node = range.startContainer.nodeType === Node.TEXT_NODE ? range.startContainer.parentElement : range.startContainer
    const cs = node ? window.getComputedStyle(node) : null

    if (command === 'bold') {
      const isOn = cs && (parseInt(cs.fontWeight, 10) || 400) >= 600
      return applyStyleToSelection({ fontWeight: isOn ? '' : '700' })
    }
    if (command === 'italic') {
      const isOn = cs && cs.fontStyle === 'italic'
      return applyStyleToSelection({ fontStyle: isOn ? '' : 'italic' })
    }
    if (command === 'underline') {
      const isOn = cs && (cs.textDecorationLine || cs.textDecoration || '').includes('underline')
      return applyStyleToSelection({ textDecoration: isOn ? '' : 'underline' })
    }
    if (command === 'foreColor') {
      const current = cs && cs.color
      const same = !!current && !!value && current.replace(/\s+/g,'') === (value + '').replace(/\s+/g,'')
      return applyStyleToSelection({ color: same ? '' : value })
    }
    if (command === 'backColor' || command === 'hiliteColor') {
      const current = cs && (cs.backgroundColor || '')
      const same = !!current && !!value && current.replace(/\s+/g,'') === (value + '').replace(/\s+/g,'')
      return applyStyleToSelection({ backgroundColor: same ? '' : value })
    }
    return false
  }

  const localApplyFormat = (command, value = null) => {
    captureSnapshot()

    const editor = editorRef.current
    if (!editor) return

    // Normalize command for background highlight
    const execCmd = command === 'backColor' ? 'hiliteColor' : command

    // Preserve selection if inside editor
    const sel = window.getSelection()
    let storedRange = null
    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0)
      if (editor.contains(r.commonAncestorContainer)) {
        storedRange = r.cloneRange()
      }
    }

    // Focus editor and restore selection before applying
    editor.focus()
    if (storedRange && sel) {
      sel.removeAllRanges()
      sel.addRange(storedRange)
    }

    let applied = false
    try {
      applied = document.execCommand(execCmd, false, value)
    } catch { applied = false }

    // Manual fallback with toggle behavior
    if (!applied) {
      applied = toggleStyleFallback(command, value)
    }

    cleanupAccidentalBreak()

    // Update desired typing state at collapsed caret for upcoming text
    try {
      const sel2 = window.getSelection()
      if (sel2 && sel2.isCollapsed) {
        let state
        try { state = document.queryCommandState(command) } catch { state = undefined }
        if (typeof state === 'boolean') desiredTypingRef.current[command] = state
      }
    } catch {}

    if (isOverflowing()) {
      restoreSnapshot()
      return
    }
    emitChange()
    captureSnapshot()
    refreshActiveFormats()
  }

  const getCurrentListStyle = () => {
    const editor = editorRef.current
    if (!editor) return 'none'
    
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return 'none'
    
    const range = selection.getRangeAt(0)
    if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return 'none'
    
    // Check if we're in a list context
    let element = range.startContainer
    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentElement
    }
    
    // Look for list indicators in the text
    const text = editor.textContent || ''
    const lines = text.split('\n')
    const currentLine = lines[0] // Simplified - just check first line
    
    if (currentLine.trim().startsWith('•')) return 'bullet'
    if (/^\d+\./.test(currentLine.trim())) return 'number'
    if (/^[A-Z]+\./.test(currentLine.trim())) return 'alpha'
    if (/^[IVX]+\./.test(currentLine.trim())) return 'roman'
    
    return 'none'
  }

  const handleFontFamilyChange = (fontFamily) => {
    const editor = editorRef.current
    if (!editor) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return

    const range = selection.getRangeAt(0)
    if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return

    captureSnapshot()
    
    // Simple and direct approach using execCommand
    try {
      document.execCommand('fontName', false, fontFamily)
      
      // Clean up any font tags that might be created
      const fontTags = editor.querySelectorAll('font')
      fontTags.forEach(fontTag => {
        const span = document.createElement('span')
        span.style.fontFamily = fontFamily
        span.innerHTML = fontTag.innerHTML
        fontTag.replaceWith(span)
      })
      
      emitChange()
      captureSnapshot()
      setCurrentFontFamily(fontFamily)
      refreshActiveFormats()
    } catch (error) {
      console.warn('Font application failed:', error)
      restoreSnapshot()
    }
  }

  // Case transform helpers for mini toolbar
  const toTitleCase = (s='') => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
  const applyCaseTransform = (mode /* 'upper'|'lower'|'title' */) => {
    const editor = editorRef.current
    if (!editor) return false
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return false
    const range = sel.getRangeAt(0)
    if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return false
    if (sel.isCollapsed) return false

    captureSnapshot()
    const text = sel.toString()
    const convert = (t='') => mode === 'upper' ? t.toUpperCase() : mode === 'lower' ? t.toLowerCase() : toTitleCase(t)
    const transformed = convert(text)

    // Focus and restore range, then insert transformed text (may flatten formatting across the selection)
    editor.focus()
    try {
      document.execCommand('insertText', false, transformed)
    } catch {
      // Fallback: replace contents directly
      range.deleteContents()
      range.insertNode(document.createTextNode(transformed))
    }

    emitChange()
    captureSnapshot()
    refreshActiveFormats()
    return true
  }

  // Define applyFontFamily function to be available in component scope
  const applyFontFamily = async (fontFamily) => {
    const editor = editorRef.current
    if (!editor) return false

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return false

    const range = selection.getRangeAt(0)
    if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return false

    captureSnapshot()
    const selectionOffsets = getSelectionOffsets(editor)
    const normalizedFamily = fontFamily || ''

    await ensureFontLoaded(normalizedFamily)

    editor.focus()

    if (selection.isCollapsed) {
      selection.removeAllRanges()
      selection.addRange(range)
      document.execCommand('fontName', false, normalizedFamily || 'inherit')
      convertFontTags(editor)
      cleanupFontSpans(editor)
      mergeSiblingFontSpans(editor)

      if (selectionOffsets) {
        setSelectionOffsets(editor, selectionOffsets.start, selectionOffsets.end)
      }

      if (isOverflowing()) {
        restoreSnapshot()
        return false
      }

      emitChange()
      captureSnapshot()
      refreshActiveFormats()
      return true
    }

    const workingRange = range.cloneRange()
    selection.removeAllRanges()
    selection.addRange(workingRange)

    const existingFamilies = collectFontFamilies(editor, workingRange)
    if (
      normalizedFamily &&
      existingFamilies.size === 1 &&
      equalFontStacks([...existingFamilies][0], normalizedFamily)
    ) {
      if (selectionOffsets) {
        setSelectionOffsets(editor, selectionOffsets.start, selectionOffsets.end)
      }
      return true
    }

    const originalFragment = workingRange.cloneContents()
    const replacement = normalizeFontFamilyChange(originalFragment, normalizedFamily)
    workingRange.deleteContents()
    workingRange.insertNode(replacement)

    cleanupFontSpans(editor)
    mergeSiblingFontSpans(editor)

    if (selectionOffsets) {
      setSelectionOffsets(editor, selectionOffsets.start, selectionOffsets.end)
    }

    if (isOverflowing()) {
      restoreSnapshot()
      return false
    }

    emitChange()
    captureSnapshot()
    refreshActiveFormats()
    return true
  }

  // Helpers to inspect caret context
  const inAncestor = (tag) => {
    const editor = editorRef.current
    if (!editor) return null
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return null
    let node = selection.anchorNode
    if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement
    while (node && node !== editor) {
      if (node.tagName === tag) return node
      node = node.parentElement
    }
    return null
  }

  const setNearestListType = (cssType) => {
    const ul = inAncestor('UL')
    const ol = inAncestor('OL')
    const list = ul || ol
    if (list) {
      list.style.listStyleType = cssType
      list.style.paddingInlineStart = '1.25em'
      list.style.margin = '0'
    }
  }

  const ensureListAtCaret = (style) => {
    const editor = editorRef.current
    if (!editor) return
    const ul = inAncestor('UL')
    const ol = inAncestor('OL')
    if (style === 'none') {
      if (ul) document.execCommand('insertUnorderedList', false, null)
      if (ol) document.execCommand('insertOrderedList', false, null)
      return
    }
    if (style === 'bullet') {
      if (ol) document.execCommand('insertOrderedList', false, null)
      if (!inAncestor('UL')) document.execCommand('insertUnorderedList', false, null)
      setNearestListType('disc')
      return
    }
    // Ordered variants
    if (ul) document.execCommand('insertUnorderedList', false, null)
    if (!inAncestor('OL')) document.execCommand('insertOrderedList', false, null)
    if (style === 'number') setNearestListType('decimal')
    if (style === 'roman') setNearestListType('upper-roman')
    if (style === 'alpha') setNearestListType('upper-alpha')
  }

  const handleListStyleChange = (listStyle) => {
    const editor = editorRef.current
    if (!editor) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return

    captureSnapshot()
    editor.focus()

    try {
      ensureListAtCaret(listStyle)
      desiredListRef.current = listStyle

      if (isOverflowing()) {
        restoreSnapshot()
        return
      }

      emitChange()
      captureSnapshot()
      refreshActiveFormats()
    } catch (error) {
      console.warn('List formatting error:', error)
      restoreSnapshot()
    }
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

  return (
    <>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        className="w-full h-full p-2 outline-none"
        style={{
          backgroundColor: el.bgColor || 'transparent',
          fontFamily: (el.styles?.fontFamily) || 'Inter, system-ui, sans-serif',
          fontSize: (el.styles?.fontSize || 16) * (scale || 1),
          color: el.styles?.color || '#111827',
          textAlign: el.styles?.align || 'left',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflow: 'visible',
          display: 'block'
        }}
        onBeforeInput={handleBeforeInput}
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onPaste={handleBeforeInput}
        onDrop={handleBeforeInput}
        onMouseDown={(e) => {
          // Stop propagation to prevent parent ElementBox from starting drag operations
          // This allows proper text selection and editing
          e.stopPropagation()
        }}
        onPointerDown={(e) => {
          // Same for pointer events - stop propagation to prevent drag interference
          e.stopPropagation()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            // Let browser insert the new block/line, then ensure toolbar/list state is preserved
            captureSnapshot()
            requestAnimationFrame(() => {
              if (desiredListRef.current && desiredListRef.current !== 'none') {
                ensureListAtCaret(desiredListRef.current)
              }
              emitChange()
              captureSnapshot()
              refreshActiveFormats()
            })
          }
        }}
      />

      {showToolbar && containerNodeRef.current && createPortal(
        <div
          ref={toolbarRef}
          data-mini-toolbar
          className="absolute bg-black/80 backdrop-blur-md text-white rounded-xl shadow-2xl border border-white/20 p-3 flex gap-2 z-50"
          style={{
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`
          }}
          onMouseDown={(e) => e.preventDefault()}
          onTransitionEnd={() => computeAndSetToolbarPosition()}
        >
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => localApplyFormat('bold')}
            aria-pressed={activeFormats.bold}
            className={`px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 ${activeFormats.bold ? 'bg-white/25 border-white/40 shadow-lg' : ''}`}
            title="Bold"
          >
            <span className="font-bold text-sm">B</span>
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => localApplyFormat('italic')}
            aria-pressed={activeFormats.italic}
            className={`px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 ${activeFormats.italic ? 'bg-white/25 border-white/40 shadow-lg' : ''}`}
            title="Italic"
          >
            <span className="italic text-sm">I</span>
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => localApplyFormat('underline')}
            aria-pressed={activeFormats.underline}
            className={`px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 ${activeFormats.underline ? 'bg-white/25 border-white/40 shadow-lg' : ''}`}
            title="Underline"
          >
            <span className="underline text-sm">U</span>
          </button>
          <div className="w-px bg-white/30 mx-2" />
          <input
            type="color"
            onMouseDown={(e) => e.preventDefault()}
            onChange={(e) => localApplyFormat('foreColor', e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
            title="Text Color"
          />
          <input
            type="color"
            onMouseDown={(e) => e.preventDefault()}
            onChange={(e) => localApplyFormat('backColor', e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
            title="Highlight"
          />
          <div className="w-px bg-white/30 mx-2" />
          <div className="flex gap-1 items-center">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyCaseTransform('upper')}
              className={`px-2 py-2 rounded-lg text-xs bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300`}
              title="UPPERCASE"
            >
              ABC
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyCaseTransform('title')}
              className={`px-2 py-2 rounded-lg text-xs bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300`}
              title="Title Case"
            >
              Title
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyCaseTransform('lower')}
              className={`px-2 py-2 rounded-lg text-xs bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300`}
              title="lowercase"
            >
              abc
            </button>
          </div>
        </div>,
        containerNodeRef.current
      )}
    </>
  )
})

export default RichTextEditor

async function ensureFontLoaded(fontFamily) {
  if (!fontFamily || typeof document === 'undefined' || !document.fonts) return
  const firstFamily = fontFamily.split(',')[0]?.trim().replace(/^['"]|['"]$/g, '')
  if (!firstFamily) return
  try {
    await document.fonts.load(`16px ${firstFamily}`)
  } catch (error) {
    // ignore font loading failures to avoid blocking
  }
}

function normalizeFontFamilyChange(fragment, fontFamily) {
  const result = document.createDocumentFragment()
  const children = Array.from(fragment.childNodes)
  children.forEach((child) => {
    fragment.removeChild(child)
    result.appendChild(applyFontFamilyToNode(child, fontFamily))
  })
  return result
}

function applyFontFamilyToNode(node, fontFamily) {
  if (node.nodeType === Node.TEXT_NODE) {
    if (!fontFamily) {
      return node
    }
    const span = document.createElement('span')
    span.style.fontFamily = fontFamily
    span.textContent = node.textContent
    return span
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const clone = node.cloneNode(false)
    if (fontFamily) {
      clone.style.fontFamily = fontFamily
    } else {
      clone.style.removeProperty('font-family')
    }
    Array.from(node.childNodes).forEach((child) => {
      clone.appendChild(applyFontFamilyToNode(child, fontFamily))
    })
    return clone
  }

  return node.cloneNode(true)
}

function mergeSiblingFontSpans(root) {
  if (!root || !root.querySelectorAll) return
  const spans = Array.from(root.querySelectorAll('span'))
  spans.forEach((span) => {
    const style = span.getAttribute('style') || ''
    if (!style || !style.includes('font-family')) return
    mergeAdjacentSpan(span)
  })
}


function mergeAdjacentSpan(span) {
  mergeWithNeighbor(span, 'previousSibling')
  mergeWithNeighbor(span, 'nextSibling')
}

function mergeWithNeighbor(span, direction) {
  const sibling = span[direction]
  if (
    sibling &&
    sibling.nodeType === Node.ELEMENT_NODE &&
    sibling.tagName === 'SPAN' &&
    sibling.getAttribute('style') === span.getAttribute('style')
  ) {
    if (direction === 'previousSibling') {
      while (span.firstChild) {
        sibling.appendChild(span.firstChild)
      }
      span.remove()
      mergeWithNeighbor(sibling, 'previousSibling')
      mergeWithNeighbor(sibling, 'nextSibling')
    } else {
      while (sibling.firstChild) {
        span.appendChild(sibling.firstChild)
      }
      sibling.remove()
      mergeWithNeighbor(span, 'previousSibling')
      mergeWithNeighbor(span, 'nextSibling')
    }
  }
}

function collectFontFamilies(editor, range) {
  const families = new Set()
  const textNodes = getTextNodesInRange(range, editor)
  textNodes.forEach((node) => {
    const font = resolveNodeFontFamily(node, editor)
    if (font) {
      families.add(font)
    }
  })
  return families
}

function getTextNodesInRange(range, root) {
  const nodes = []
  if (!range || !root) return nodes

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.nodeValue) return NodeFilter.FILTER_REJECT
        if (typeof range.intersectsNode === 'function') {
          return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
        }
        const nodeRange = document.createRange()
        nodeRange.selectNodeContents(node)
        const startsAfterEnd = range.compareBoundaryPoints(Range.END_TO_START, nodeRange) >= 0
        const endsBeforeStart = range.compareBoundaryPoints(Range.START_TO_END, nodeRange) <= 0
        return startsAfterEnd || endsBeforeStart ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
      },
    },
    false
  )

  while (walker.nextNode()) {
    nodes.push(walker.currentNode)
  }
  return nodes
}

function resolveNodeFontFamily(textNode, editor) {
  let element = textNode.parentElement
  while (element && element !== editor) {
    const inlineFont = element.style?.fontFamily
    if (inlineFont) {
      return normalizeFontStack(inlineFont)
    }
    element = element.parentElement
  }
  const target = textNode.parentElement || editor
  const computed = window.getComputedStyle(target).fontFamily
  return normalizeFontStack(computed)
}

function equalFontStacks(a, b) {
  return normalizeFontStack(a) === normalizeFontStack(b)
}

function normalizeFontStack(stack) {
  if (!stack) return ''
  return stack
    .split(',')
    .map((part) => part.trim().replace(/^['"]|['"]$/g, '').toLowerCase())
    .join(',')
}

function convertFontTags(root) {
  if (!root || !root.querySelectorAll) return
  const fontTags = Array.from(root.querySelectorAll('font[face]'))
  fontTags.forEach((fontTag) => {
    const span = document.createElement('span')
    span.style.fontFamily = fontTag.getAttribute('face')
    while (fontTag.firstChild) {
      span.appendChild(fontTag.firstChild)
    }
    fontTag.replaceWith(span)
  })
}

function cleanupFontSpans(root) {
  if (!root || !root.querySelectorAll) return
  const spans = Array.from(root.querySelectorAll('span'))
  spans.forEach((span) => {
    if (span.style && !span.style.fontFamily) {
      span.style.removeProperty('font-family')
    }
    if (!span.getAttribute('style') && span.attributes.length === 0) {
      unwrapSpan(span)
    }
  })
}

function unwrapSpan(span) {
  const parent = span.parentNode
  if (!parent) return
  while (span.firstChild) {
    parent.insertBefore(span.firstChild, span)
  }
  span.remove()
}

function getSelectionOffsets(editor) {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return null
  const range = selection.getRangeAt(0)
  if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return null

  const preRange = range.cloneRange()
  preRange.selectNodeContents(editor)
  preRange.setEnd(range.startContainer, range.startOffset)
  const start = preRange.toString().length

  const endRange = range.cloneRange()
  endRange.selectNodeContents(editor)
  endRange.setEnd(range.endContainer, range.endOffset)
  const end = endRange.toString().length

  return { start, end }
}

function setSelectionOffsets(editor, start, end) {
  const selection = window.getSelection()
  if (!selection) return

  const range = document.createRange()
  let current = 0
  let startNode = null
  let endNode = null
  let startOffset = 0
  let endOffset = 0

  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null)
  while (walker.nextNode()) {
    const node = walker.currentNode
    const length = node.textContent.length
    if (startNode === null && current + length >= start) {
      startNode = node
      startOffset = start - current
    }
    if (endNode === null && current + length >= end) {
      endNode = node
      endOffset = end - current
      break
    }
    current += length
  }

  if (!startNode) {
    const textNode = document.createTextNode('')
    editor.appendChild(textNode)
    startNode = textNode
    endNode = textNode
    startOffset = 0
    endOffset = 0
  } else if (!endNode) {
    endNode = startNode
    endOffset = startOffset
  }

  const safeStart = Math.max(0, Math.min(startNode.textContent.length, startOffset))
  const safeEnd = Math.max(0, Math.min(endNode.textContent.length, endOffset))
  range.setStart(startNode, safeStart)
  range.setEnd(endNode, safeEnd)

  selection.removeAllRanges()
  selection.addRange(range)
}
