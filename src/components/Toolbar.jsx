import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSlides, factories } from '../context/SlidesContext.jsx'
import ChartSelectionDialog from './ChartSelectionDialog.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { VscListOrdered } from 'react-icons/vsc'


export default function Toolbar({ activeTab, onToggleSidebar, onPresent, onSlideShow }) {
  const { state, dispatch } = useSlides()
  const { getThemeColors, isDark } = useTheme()
  const colors = getThemeColors()
  
  // Helper function for inline/text controls: transparent bg + hover zoom
  const btn = (active) => {
    return `px-2 py-1 rounded-md tool-btn anim-zoom ${colors.toolbarText} ${active ? 'is-active' : ''}`
  }
  
  // Helper for Insert/Design tool buttons: transparent + hover zoom + unified hover/active bg
  const elementBtn = (elementType) => {
    const isSelected = selected && selected.type === elementType
    const glass = isDark ? `${colors.elementGlass} ${isSelected ? colors.elementActiveGlass : ''}` : ''
    return `flex flex-col items-center gap-1 px-3 py-2 rounded-lg tool-btn anim-zoom ${colors.toolbarText} ${glass}`
  }
  
  const currentSlide = state.slides.find(s => s.id === state.currentSlideId)
  const selected = currentSlide?.elements.find(e => e.id === state.selectedElementId)
  const [showListDropdown, setShowListDropdown] = useState(false)
  const [showTableDialog, setShowTableDialog] = useState(false)
  const [showTableGrid, setShowTableGrid] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)
  const [hoverRows, setHoverRows] = useState(1)
  const [hoverCols, setHoverCols] = useState(1)
  const tableBtnRef = useRef(null)
  const tableGridRef = useRef(null)
  const [tableGridPos, setTableGridPos] = useState({ top: 0, left: 0 })
  const [showChartDialog, setShowChartDialog] = useState(false)
  const [chartType, setChartType] = useState('bar')
  const [showChartChild, setShowChartChild] = useState(false)
  const [showWatermarkDialog, setShowWatermarkDialog] = useState(false)
  const [wmText, setWmText] = useState('CONFIDENTIAL')
  const [wmOpacity, setWmOpacity] = useState(0.15)
  const [wmRotation, setWmRotation] = useState(-30)
  const [wmSize, setWmSize] = useState(64)
  const [wmColor, setWmColor] = useState('#111827')
  const [wmAllSlides, setWmAllSlides] = useState(true)
  const [inlineFormats, setInlineFormats] = useState({ bold: false, italic: false, underline: false })
  const [showMoreShapes, setShowMoreShapes] = useState(false)
  const [isNarrowScreen, setIsNarrowScreen] = useState(false)
  const fileInputRef = useRef(null)
  const bgFileInputRef = useRef(null)

  // Shapes dropdown (icon grid) state
  const [showShapesMenu, setShowShapesMenu] = useState(false)
  const shapesBtnRef = useRef(null)
  const shapesMenuRef = useRef(null)
  const [shapesMenuPos, setShapesMenuPos] = useState({ top: 0, left: 0 })

  // Design templates (5) and helpers
  const REF_WIDTH = 960
  const REF_HEIGHT = 540
  const makeText = (t, x, y, w, h, fontSize = 28, bgColor = 'transparent', align = 'left') => {
    const el = factories.text(t, x, y, w, h, fontSize, bgColor)
    el.styles = { ...el.styles, align }
    return el
  }
  // 5 four-slide themes (distinct from right sidebar templates)
  const designThemes = [
    { name: 'Sunset', background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)', preview: { header: '#ffe1e6', block1: '#ffc2cc', block2: '#ffd9e1' } },
    { name: 'Ocean', background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', preview: { header: '#d6e9ff', block1: '#cfe0ff', block2: '#e0f3ff' } },
    { name: 'Emerald', background: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', preview: { header: '#eafdd9', block1: '#dcf8c6', block2: '#c8efbb' } },
    { name: 'Slate', background: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)', preview: { header: '#e5eaed', block1: '#d3dde3', block2: '#c1cdd4' } },
    { name: 'Peach', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', preview: { header: '#fff0cc', block1: '#ffe0b3', block2: '#ffd1a6' } },
    { name: 'Grape', background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', preview: { header: '#efe6fb', block1: '#e2d3f6', block2: '#f7d8ee' } },
    { name: 'Aurora', background: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)', preview: { header: '#d9fbf5', block1: '#cdeaf4', block2: '#e3d6f0' } },
    { name: 'Mono', background: 'linear-gradient(135deg, #e0e0e0 0%, #9e9e9e 100%)', preview: { header: '#f2f2f2', block1: '#e0e0e0', block2: '#cccccc' } },
  ]

  const applyThemeToFour = (theme) => {
    const startIdx = state.slides.findIndex(s => s.id === state.currentSlideId)
    if (startIdx < 0) return
    const originalId = state.currentSlideId
    // Ensure there are 4 slides from startIdx
    const needed = Math.max(0, (startIdx + 4) - state.slides.length)
    for (let i = 0; i < needed; i++) {
      dispatch({ type: 'ADD_SLIDE' })
    }
    // Restore current slide selection
    if (needed > 0) dispatch({ type: 'SET_CURRENT_SLIDE', id: originalId })
    // Apply background to 4 consecutive slides
    const ids = state.slides.slice(startIdx, startIdx + 4).map(s => s.id)
    ids.forEach((id) => {
      dispatch({ type: 'UPDATE_SLIDE_BACKGROUND', slideId: id, background: theme.background })
    })
  }

  // Window resize listener for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsNarrowScreen(window.innerWidth < 1030)
    }
    
    // Initial check
    checkScreenSize()
    
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Keyboard shortcuts for undo/redo, slideshow, and delete element
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        dispatch({ type: 'UNDO' })
        return
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        dispatch({ type: 'REDO' })
        return
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
        // Ctrl/Cmd + A: select content within active editor or selected element only
        const currentSlide = state.slides.find(s => s.id === state.currentSlideId)
        const selected = currentSlide?.elements.find(e => e.id === state.selectedElementId)
        if (selected) {
          e.preventDefault()
          // Text element: ensure editor is active then select all
          if (selected.type === 'text') {
            try { window.dispatchEvent(new CustomEvent('editTextBox', { detail: { id: selected.id } })) } catch {}
            setTimeout(() => {
              const editorHandle = getActiveEditorHandle()
              const node = editorHandle?.editorNode
              if (node) selectAllIn(node)
            }, 30)
            return
          }
          // Shape element: ensure edit mode then select all in its textarea
          const shapeTypes = ['rect','square','circle','triangle','diamond','star','message','roundRect','parallelogram','trapezoid','pentagon','hexagon','octagon','chevron','arrowRight','cloud']
          if (shapeTypes.includes(selected.type)) {
            try { window.dispatchEvent(new CustomEvent('editShapeText', { detail: { id: selected.id } })) } catch {}
            setTimeout(() => {
              const ta = document.querySelector(`[data-el-box][data-el-id="${selected.id}"] textarea`)
              if (ta) { ta.focus(); ta.select() }
            }, 30)
            return
          }
        }
        // If nothing selected and not in an editor, let default behavior or noop (prevent selecting outside slide)
        e.preventDefault()
        return
      }

      if (e.key === 'Delete') {
        e.preventDefault()
        onSlideShow() // F5 triggers auto slideshow
        return
      }
      if (e.key === 'F6') {
        e.preventDefault() 
        onPresent() // F6 triggers manual present
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Avoid deleting while typing inside an input/contenteditable
        const active = document.activeElement
        const inEditable = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)
        if (!inEditable && selected) {
          e.preventDefault()
          dispatch({ type: 'DELETE_ELEMENT', id: selected.id })
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dispatch, onPresent, onSlideShow, selected])

  const getActiveEditorHandle = () => window.currentTextEditorRef?.current ?? null
  const isTextEditing = !!(selected && selected.type === 'text' && getActiveEditorHandle())

  const readCommandState = (command) => {
    try {
      return document.queryCommandState(command)
    } catch (error) {
      return false
    }
  }

  const updateInlineFormats = () => {
    if (!selected || selected.type !== 'text') {
      setInlineFormats({ bold: false, italic: false, underline: false })
      return
    }

    const editorHandle = getActiveEditorHandle()
    const isRich = !!selected?.html
    const fallback = isRich ? {
      // For rich HTML content, default inactive outside the editor
      bold: false,
      italic: false,
      underline: false,
    } : {
      bold: !!selected?.styles?.bold,
      italic: !!selected?.styles?.italic,
      underline: !!selected?.styles?.underline,
    }

    if (!editorHandle) {
      setInlineFormats(fallback)
      return
    }

    // If caret is inside editor and collapsed, prefer user-controlled typing state
    if (typeof editorHandle.isCollapsedSelection === 'function' && editorHandle.isCollapsedSelection()) {
      if (typeof editorHandle.getTypingState === 'function') {
        setInlineFormats(editorHandle.getTypingState())
      }
      return
    }

    if (typeof editorHandle.hasSelection === 'function' && editorHandle.hasSelection()) {
      setInlineFormats({
        bold: readCommandState('bold'),
        italic: readCommandState('italic'),
        underline: readCommandState('underline'),
      })
      return
    }

    const editorNode = editorHandle.editorNode ?? null
    const selection = window.getSelection()
    if (!editorNode || !selection || selection.rangeCount === 0) {
      setInlineFormats(fallback)
      return
    }

    const range = selection.getRangeAt(0)
    if (editorNode.contains(range.startContainer) && editorNode.contains(range.endContainer)) {
      setInlineFormats({
        bold: readCommandState('bold'),
        italic: readCommandState('italic'),
        underline: readCommandState('underline'),
      })
    } else {
      setInlineFormats(fallback)
    }
  }

  const applyInlineFormat = (command, value = null) => {
    const editorHandle = getActiveEditorHandle()
    if (!editorHandle) {
      return false
    }

    setTimeout(() => {
      editorHandle.applyFormat(command, value)
      updateInlineFormats()
    }, 10)

    return true
  }

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

  const preventToolbarMouseDown = (event) => {
    event.preventDefault()
  }

  const getCurrentAlignment = () => {
    // Always use the element's stored alignment as the source of truth
    return selected?.styles?.align || 'left'
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
        
        // Check if we're inside a list
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

  const handleInlineStyleToggle = (styleKey, command) => {
    if (!selected) return

    // Determine desired new state based on current toolbar state
    const desired = !inlineFormats[styleKey]

    // If a rich text editor is active, prefer selection-only when there is an active selection;
    // otherwise apply to the entire input box (whole element), without disturbing existing per-selection behavior.
    const editorHandle = getActiveEditorHandle()
    const hasSelection = (() => {
      try {
        if (editorHandle && typeof editorHandle.hasSelection === 'function') return editorHandle.hasSelection()
      } catch {}
      return false
    })()

    if (editorHandle && hasSelection) {
      // Apply to current selection and typing state
      applyInlineFormat(command)
      if (typeof editorHandle.setTypingState === 'function') {
        editorHandle.setTypingState({ [styleKey]: desired })
      }
      setTimeout(updateInlineFormats, 20)
      return
    }

    // Apply to whole input box (element-level)
    const nextStyles = { ...selected.styles, [styleKey]: desired }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles: nextStyles } })

    // If an editor is mounted, reflect the whole-box style immediately in the editor node for live preview
    if (editorHandle && editorHandle.editorNode) {
      const node = editorHandle.editorNode
      if (styleKey === 'bold') node.style.fontWeight = desired ? '700' : '400'
      if (styleKey === 'italic') node.style.fontStyle = desired ? 'italic' : 'normal'
      if (styleKey === 'underline') node.style.textDecoration = desired ? 'underline' : 'none'
    }

    setInlineFormats((prev) => ({ ...prev, [styleKey]: desired }))
    setTimeout(updateInlineFormats, 20)
  }

  const toggleStyle = (key) => {
    if (!selected || selected.type !== 'text') return
    
    // In Home tab, always apply to whole element
    const styles = { ...selected.styles, [key]: !selected.styles[key] }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles } })
  }

  const setAlign = (align) => {
    if (!selected || selected.type !== 'text') return

    // Update the element styles directly - this is the source of truth
    const styles = { ...selected.styles, align }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles } })
    
    // If there's an active rich text editor, apply the alignment to the editor immediately
    const editorHandle = getActiveEditorHandle()
    if (editorHandle && editorHandle.editorNode) {
      const editorNode = editorHandle.editorNode
      
      // Apply the alignment style directly to the editor (no flex to avoid line-break quirks)
      editorNode.style.textAlign = align
      
      // Focus the editor to ensure the change is visible
      editorNode.focus()
      
      // Trigger a change event to save the content with the new alignment
      if (typeof editorHandle.emitChange === 'function') {
        setTimeout(() => {
          editorHandle.emitChange()
        }, 0)
      }
    }
  }
  const setVAlign = (valign /* 'top' | 'middle' | 'bottom' */) => {
  if (!selected || selected.type !== 'text') return;
  const styles = { ...selected.styles, valign };
  dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles } });
};

  // Case transform helpers for Home tab
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
    // Fallback: transform plain text element when not actively editing
    if (selected && selected.type === 'text' && !selected.html) {
      const nextText = convert(selected.text || '')
      dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { text: nextText } })
      return true
    }
    return false
  }


  const setFontFamily = (fontFamily) => {
    if (!selected) return

    const editorHandle = getActiveEditorHandle()

    // If we have an active selection in the rich text editor, apply to selected text only
    if (selected.type === 'text' && editorHandle?.applyFontFamily && hasActiveEditorSelection()) {
      editorHandle.applyFontFamily(fontFamily)
      return
    }

    // For text elements, set the default font family for new content
    if (selected.type === 'text') {
      const styles = { ...selected.styles, fontFamily }
      dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles } })
      if (editorHandle && editorHandle.editorNode) {
        setTimeout(() => { editorHandle.editorNode.style.fontFamily = fontFamily }, 10)
      }
      return
    }

    // For tables, prefer applying to the active cell only
    if (selected.type === 'table') {
      const updatedCells = selected.cells.map(cell => ({
        ...cell,
        styles: { ...cell.styles, fontFamily }
      }))
      dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { cells: updatedCells } })
    }
  }

  const setFontSize = (e) => {
    if (!selected || selected.type !== 'text') return
    const styles = { ...selected.styles, fontSize: Number(e.target.value) }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles } })
  }

  const setColor = (e) => {
    if (!selected || selected.type !== 'text') return
    const styles = { ...selected.styles, color: e.target.value }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles } })
  }

  const setBgColor = (e) => {
    if (!selected || selected.type !== 'text') return
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { bgColor: e.target.value } })
  }

  // Utilities to work on the contenteditable of the selected element
const getEditableEl = () => {
  const editorHandle = getActiveEditorHandle()
  return editorHandle?.editorNode || null
}

const selectAllIn = (el) => {
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
};

// Finds all UL/OL directly inside the editable
const findTopLists = (root) => {
  const lists = [];
  root.childNodes.forEach((n) => {
    if (n.nodeType === 1 && (n.tagName === 'UL' || n.tagName === 'OL')) lists.push(n);
  });
  return lists;
};

const unwrapListsToPlainText = (root) => {
  const lists = root.querySelectorAll('ul, ol');
  lists.forEach((list) => {
    const frag = document.createDocumentFragment();
    list.querySelectorAll(':scope > li').forEach((li, idx, arr) => {
      // move li children as plain text + newline
      while (li.firstChild) frag.appendChild(li.firstChild);
      if (idx < arr.length - 1) frag.appendChild(document.createTextNode('\n'));
    });
    list.replaceWith(frag);
  });
};

const applyListStyleType = (root, cssType /* e.g., 'disc', 'decimal', 'upper-roman', 'upper-alpha' */) => {
  // style top-level lists in the box
  findTopLists(root).forEach((list) => {
    if (list.tagName === 'UL' && (cssType === 'disc' || cssType === 'circle' || cssType === 'square')) {
      list.style.listStyleType = cssType;
      list.style.listStylePosition = 'inside';
      list.style.paddingInlineStart = '1.25em';
      list.style.margin = '0';
    } else if (list.tagName === 'OL') {
      list.style.listStyleType = cssType;
      list.style.listStylePosition = 'inside';
      list.style.paddingInlineStart = '1.25em';
      list.style.margin = '0';
    }
  });
};

  const setListStyle = (listType) => {
  if (!selected || selected.type !== 'text') return

  const editorHandle = getActiveEditorHandle()
  
  // If we have an active rich text editor, handle it through the editor
  if (editorHandle && editorHandle.editorNode) {
    const editorNode = editorHandle.editorNode
    
    // Focus the editor first
    editorNode.focus()

    const selection = window.getSelection()
    
    setTimeout(() => {
      try {
        if (listType === 'none') {
          // Remove any existing lists
          document.execCommand('insertOrderedList', false, null)
          document.execCommand('insertUnorderedList', false, null)
          unwrapListsToPlainText(editorNode)
        } else if (listType === 'bullet' || listType === 'bullet-circle' || listType === 'bullet-square') {
          // Remove any existing ordered lists first
          if (editorNode.querySelector('ol')) {
            document.execCommand('insertOrderedList', false, null)
          }
          document.execCommand('insertUnorderedList', false, null)
          const cssType = listType === 'bullet-circle' ? 'circle' : listType === 'bullet-square' ? 'square' : 'disc'
          applyListStyleType(editorNode, cssType)
        } else if (listType === 'number') {
          // Remove any existing unordered lists first
          if (editorNode.querySelector('ul')) {
            document.execCommand('insertUnorderedList', false, null)
          }
          document.execCommand('insertOrderedList', false, null)
          applyListStyleType(editorNode, 'decimal')
        } else if (listType === 'roman') {
          // Remove any existing unordered lists first
          if (editorNode.querySelector('ul')) {
            document.execCommand('insertUnorderedList', false, null)
          }
          document.execCommand('insertOrderedList', false, null)
          applyListStyleType(editorNode, 'upper-roman')
        } else if (listType === 'alpha') {
          // Remove any existing unordered lists first
          if (editorNode.querySelector('ul')) {
            document.execCommand('insertUnorderedList', false, null)
          }
          document.execCommand('insertOrderedList', false, null)
          applyListStyleType(editorNode, 'upper-alpha')
        }
        
        // Trigger change event to save the content
        const event = new Event('input', { bubbles: true })
        editorNode.dispatchEvent(event)
        
      } catch (error) {
        console.warn('List formatting error:', error)
      }
    }, 10)
  }
  
  // Update the element styles for UI state tracking
  const styles = { ...(selected.styles || {}), listStyle: listType }
  dispatch({
    type: 'UPDATE_ELEMENT',
    id: selected.id,
    patch: { styles },
  })
}

  useEffect(() => {
    updateInlineFormats()
  }, [selected?.id, selected?.styles?.bold, selected?.styles?.italic, selected?.styles?.underline])

  useEffect(() => {
    const handleSelectionUpdate = () => {
      updateInlineFormats()
    }
    document.addEventListener('selectionchange', handleSelectionUpdate)
    return () => document.removeEventListener('selectionchange', handleSelectionUpdate)
  }, [selected?.id, selected?.styles?.bold, selected?.styles?.italic, selected?.styles?.underline, selected?.styles?.align, selected?.styles?.listStyle])

  // Handle ESC key to close more shapes modal
  const handleBgImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      // Set current slide background to image cover
      dispatch({ type: 'UPDATE_SLIDE_BACKGROUND', slideId: state.currentSlideId, background: { type: 'image', src: dataUrl, mode: 'cover' } })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showMoreShapes) {
        setShowMoreShapes(false)
      }
    }
    
    if (showMoreShapes) {
      document.addEventListener('keydown', handleEscKey)
      return () => document.removeEventListener('keydown', handleEscKey)
    }
  }, [showMoreShapes])

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      const img = new Image()
      img.onload = () => {
        const naturalW = img.naturalWidth || 1
        const naturalH = img.naturalHeight || 1
        const aspect = naturalW / naturalH

        // Target sizes relative to slide, preserving aspect so the selection box hugs the image
        const slideWidth = 960
        const slideHeight = 540
        const targetW = slideWidth * 0.33
        const maxW = slideWidth * 0.6
        const maxH = slideHeight * 0.6

        let w = Math.min(targetW, maxW)
        let h = w / aspect
        if (h > maxH) {
          h = maxH
          w = h * aspect
        }

        const element = factories.image(dataUrl, Math.round(w), Math.round(h))
        dispatch({ type: 'ADD_ELEMENT', element })
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleInsertTable = (rows, cols) => {
    const slideWidth = 960
    const slideHeight = 540
    const maxW = Math.round(slideWidth * 0.6)
    const maxH = Math.round(slideHeight * 0.5)

    // Target cell size aiming for readable density
    let cellW = Math.max(50, Math.floor(maxW / cols))
    let cellH = Math.max(28, Math.floor(maxH / rows))

    // Compute table size and clamp to caps
    let tableWidth = cellW * cols
    let tableHeight = cellH * rows
    if (tableWidth > maxW) { cellW = Math.floor(maxW / cols); tableWidth = cellW * cols }
    if (tableHeight > maxH) { cellH = Math.floor(maxH / rows); tableHeight = cellH * rows }

    const tableX = Math.round((slideWidth - tableWidth) / 2)
    const tableY = Math.round((slideHeight - tableHeight) / 2)

    const table = factories.table(rows, cols, tableX, tableY, tableWidth, tableHeight)
    dispatch({ type: 'ADD_ELEMENT', element: table })
    dispatch({ type: 'SELECT_ELEMENT', id: table.id })

    setShowTableGrid(false)
    setShowTableDialog(false)
  }

  const handleInsertChart = () => {
    const chart = factories.chart(chartType, 150, 100, 600, 350)
    dispatch({ type: 'ADD_ELEMENT', element: chart })
    setShowChartDialog(false)
  }

  // Called after child variation is chosen
  const handleSelectChartVariant = (type, variant) => {
    try { console.log('[ChartPicker] Selected:', type, variant) } catch {}
    const chart = factories.chart(type || chartType, 150, 100, 600, 350, { chartStyle: variant })
    dispatch({ type: 'ADD_ELEMENT', element: chart })
    setShowChartChild(false)
    setShowChartDialog(false)
  }

  const handleApplyWatermark = () => {
    const settings = { text: wmText, fontSize: wmSize, color: wmColor, opacity: wmOpacity, rotation: wmRotation }
    dispatch({ type: 'APPLY_WATERMARK', settings, scope: wmAllSlides ? 'all' : 'current', replace: true })
  }

  useEffect(() => {
    const onWindowEvents = () => {
      if (showTableGrid) {
        const rect = tableBtnRef.current?.getBoundingClientRect()
        if (rect) setTableGridPos({ top: rect.bottom + 8, left: rect.left })
      }
      if (showShapesMenu) {
        const rect2 = shapesBtnRef.current?.getBoundingClientRect()
        if (rect2) setShapesMenuPos({ top: rect2.bottom + 8, left: rect2.left })
      }
    }
    const onDocMouseDown = (e) => {
      if (showTableGrid) {
        const btn = tableBtnRef.current
        const grid = tableGridRef.current
        const inBtn = btn && (btn === e.target || btn.contains(e.target))
        const inGrid = grid && (grid === e.target || grid.contains(e.target))
        if (!(inBtn || inGrid)) setShowTableGrid(false)
      }
      if (showShapesMenu) {
        const btn2 = shapesBtnRef.current
        const menu = shapesMenuRef.current
        const inBtn2 = btn2 && (btn2 === e.target || btn2.contains(e.target))
        const inMenu = menu && (menu === e.target || menu.contains(e.target))
        if (!(inBtn2 || inMenu)) setShowShapesMenu(false)
      }
    }
    window.addEventListener('resize', onWindowEvents)
    window.addEventListener('scroll', onWindowEvents, true)
    document.addEventListener('mousedown', onDocMouseDown)
    return () => {
      window.removeEventListener('resize', onWindowEvents)
      window.removeEventListener('scroll', onWindowEvents, true)
      document.removeEventListener('mousedown', onDocMouseDown)
    }
  }, [showTableGrid, showShapesMenu])

  return (
    <div className={`w-full border-b px-1 py-1 flex items-center gap-2 sticky top-0 z-10 transition-all duration-500 ${colors.border} animate-slideInDown responsive-toolbar overflow-hidden toolbar`} style={{background: colors.toolbarBg, minHeight: '60px',maxHeight: '86px',height:'86px'}}>
      <button onClick={onToggleSidebar} className={`px-2 py-1 rounded-lg ${colors.glassButton} ${colors.toolbarText} responsive-toolbar-button`}>☰</button>

      <div className={`h-6 w-px mx-1 ${colors.toolbarTextMuted} opacity-30`} style={{backgroundColor: 'currentColor'}} />

      {/* Undo and Redo Buttons - Always Visible */}
      <button 
        onClick={() => dispatch({ type: 'UNDO' })}
        disabled={state.historyIndex <= 0}
        className={`px-2 py-1 rounded-lg ${state.historyIndex <= 0 ? colors.glassButtonDisabled : colors.glassButton} ${colors.toolbarText} responsive-toolbar-button`}
        title="Undo (Ctrl+Z)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7v6h6"/>
          <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
        </svg>
      </button>
      <button 
        onClick={() => dispatch({ type: 'REDO' })}
        disabled={state.historyIndex >= state.history.length - 1}
        className={`px-2 py-1 rounded-lg ${state.historyIndex >= state.history.length - 1 ? colors.glassButtonDisabled : colors.glassButton} ${colors.toolbarText} responsive-toolbar-button`}
        title="Redo (Ctrl+Y)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 7v6h-6"/>
          <path d="M3 17 C 6 12, 9 8, 12 8 C 15 8, 18 9.7, 21 13"/>
        </svg>
      </button>

      {activeTab !== 'Insert' && (
        <>
          <div className={`h-6 w-px mx-1 ${colors.toolbarTextMuted} opacity-30`} style={{backgroundColor: 'currentColor'}} />

          <button onClick={() => dispatch({ type: 'ADD_SLIDE' })} className={`px-3 py-1.5 rounded-lg tool-btn anim-zoom ${colors.toolbarText} font-medium responsive-toolbar-button responsive-toolbar-text keep-default`}>+ New Slide</button>
          
          <button 
            onClick={() => dispatch({ type: 'ADD_ELEMENT', element: factories.text() })} 
            className={`px-3 py-1.5 rounded-lg tool-btn anim-zoom font-medium transition-all duration-300 ${colors.toolbarText} responsive-toolbar-button responsive-toolbar-text keep-default ${
              selected && selected.type === 'text' ? 'is-active' : ''
            }`}
          >
            + Text
          </button>

          <div className={`h-6 w-px mx-1 ${colors.toolbarTextMuted} opacity-30`} style={{backgroundColor: 'currentColor'}} />
        </>
)}
      

      {activeTab === 'Design' && (
        <>
          <div className="flex items-center gap-2 responsive-toolbar-gap">
            <span className={`${colors.toolbarTextSecondary} text-xs responsive-toolbar-text`}>Themes:</span>
            <div className="flex items-center gap-2">
              {designThemes.map((th, idx) => (
                <button
                  key={th.name}
                  onClick={() => applyThemeToFour(th)}
                  className={`${elementBtn('theme')} responsive-toolbar-button`}
                  title={`${th.name} – applies to 4 slides`}
                >
                  <div className="w-16 h-10 rounded border border-gray-300 overflow-hidden shadow-sm relative" style={{ background: th.background }}>
                    {/* Header bar */}
                    <div className="absolute left-1 right-1 top-1 h-1.5 rounded" style={{ background: th.preview?.header || 'rgba(255,255,255,0.7)' }} />
                    {/* Content blocks vary slightly per theme index to look distinct */}
                    {idx % 3 === 0 && (
                      <>
                        <div className="absolute left-1 top-3 w-1/2 h-4 rounded" style={{ background: th.preview?.block1 || 'rgba(255,255,255,0.5)' }} />
                        <div className="absolute right-1 top-3 w-1/3 h-4 rounded" style={{ background: th.preview?.block2 || 'rgba(255,255,255,0.4)' }} />
                      </>
                    )}
                    {idx % 3 === 1 && (
                      <>
                        <div className="absolute left-1 right-1 top-3 h-4 rounded" style={{ background: th.preview?.block1 || 'rgba(255,255,255,0.45)' }} />
                        <div className="absolute left-1 right-1 bottom-1 h-3 rounded" style={{ background: th.preview?.block2 || 'rgba(255,255,255,0.35)' }} />
                      </>
                    )}
                    {idx % 3 === 2 && (
                      <>
                        <div className="absolute left-1 top-3 w-1/3 h-5 rounded" style={{ background: th.preview?.block1 || 'rgba(255,255,255,0.5)' }} />
                        <div className="absolute left-1/2 top-3 w-1/3 h-5 rounded" style={{ background: th.preview?.block2 || 'rgba(255,255,255,0.4)' }} />
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      
      {activeTab === 'Insert' && (
        <>
          <div className={`h-6 w-px mx-1 ${colors.toolbarTextMuted} opacity-30`} style={{backgroundColor: 'currentColor'}} />
          
          {/* Also show New Slide and Text in Insert */}
          <button onClick={() => dispatch({ type: 'ADD_SLIDE' })} className={`px-3 py-1.5 rounded-lg tool-btn anim-zoom ${colors.toolbarText} font-medium responsive-toolbar-button responsive-toolbar-text keep-default`}>+ New Slide</button>
          
          <button 
            onClick={() => dispatch({ type: 'ADD_ELEMENT', element: factories.text() })} 
            className={`px-3 py-1.5 rounded-lg tool-btn anim-zoom font-medium transition-all duration-300 ${colors.toolbarText} responsive-toolbar-button responsive-toolbar-text keep-default ${
              selected && selected.type === 'text' ? 'is-active' : ''
            }`}
          >
            + Text
          </button>

          <div className={`h-6 w-px mx-1 ${colors.toolbarTextMuted} opacity-30`} style={{backgroundColor: 'currentColor'}} />
          
          {/* Shapes dropdown (icon grid) */}
          <div className="flex items-center gap-2 responsive-toolbar-gap">
            <div className="relative">
              <button
                ref={shapesBtnRef}
                onClick={() => {
                  const rect = shapesBtnRef.current?.getBoundingClientRect()
                  if (rect) setShapesMenuPos({ top: rect.bottom + 8, left: rect.left })
                  setShowShapesMenu((s) => !s)
                }}
                className={`${elementBtn('shapes')} responsive-toolbar-button`}
                title="Add shape"
              >
                <div className="w-5 h-3 rounded-sm" style={{ background: '#d1d5db', border: '1px solid #9ca3af' }}></div>
                <span className="text-xs responsive-toolbar-text">Shapes</span>
              </button>
            </div>
          </div>
          {showShapesMenu && createPortal(
            <div
              ref={shapesMenuRef}
              className="fixed bg-white border border-gray-300 rounded-lg shadow-xl p-3 z-[1000] grid grid-cols-4 gap-2"
              style={{ top: shapesMenuPos.top, left: shapesMenuPos.left }}
            >
              {/* Rect */}
              <button
                onClick={() => { const el = factories.rect(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowShapesMenu(false) }}
                className="p-2 rounded hover:bg-gray-100"
                title="Rectangle"
              >
                <div className="w-8 h-5 rounded-sm" style={{ background: '#fde68a', border: '1px solid #f59e0b' }}></div>
              </button>
              {/* Square */}
              <button
                onClick={() => { const el = factories.square(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowShapesMenu(false) }}
                className="p-2 rounded hover:bg-gray-100"
                title="Square"
              >
                <div className="w-6 h-6 rounded-sm" style={{ background: '#fde68a', border: '1px solid #f59e0b' }}></div>
              </button>
              {/* Circle */}
              <button
                onClick={() => { const el = factories.circle(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowShapesMenu(false) }}
                className="p-2 rounded hover:bg-gray-100"
                title="Circle"
              >
                <div className="w-6 h-6 rounded-full" style={{ background: '#bfdbfe', border: '1px solid #3b82f6' }}></div>
              </button>
              {/* Triangle */}
              <button
                onClick={() => { const el = factories.triangle(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowShapesMenu(false) }}
                className="p-2 rounded hover:bg-gray-100"
                title="Triangle"
              >
                <div className="w-6 h-6" style={{ background: '#fecaca', border: '1px solid #ef4444', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
              </button>
              {/* Diamond */}
              <button
                onClick={() => { const el = factories.diamond(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowShapesMenu(false) }}
                className="p-2 rounded hover:bg-gray-100"
                title="Diamond"
              >
                <div className="w-6 h-6" style={{ background: '#d8b4fe', border: '1px solid #8b5cf6', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>
              </button>
              {/* Star */}
              <button
                onClick={() => { const el = factories.star(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowShapesMenu(false) }}
                className="p-2 rounded hover:bg-gray-100"
                title="Star"
              >
                <div className="w-6 h-6" style={{ background: '#fef3c7', border: '1px solid #f59e0b', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}></div>
              </button>
              {/* Message */}
              <button
                onClick={() => { const el = factories.message(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowShapesMenu(false) }}
                className="p-2 rounded hover:bg-gray-100"
                title="Message"
              >
                <div className="w-10 h-6 rounded relative" style={{ background: '#d1fae5', border: '1px solid #10b981' }}>
                  <div className="absolute bottom-0 left-1 w-0 h-0" style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #10b981' }}></div>
                </div>
              </button>
              {/* Rounded Rect */}
              <button
                onClick={() => { const el = factories.roundRect(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowShapesMenu(false) }}
                className="p-2 rounded hover:bg-gray-100"
                title="Rounded Rect"
              >
                <div className="w-8 h-5 rounded-lg" style={{ background: '#e5e7eb', border: '1px solid #6b7280' }}></div>
              </button>
              {/* Parallelogram */}
              <button
                onClick={() => { const el = factories.parallelogram(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowShapesMenu(false) }}
                className="p-2 rounded hover:bg-gray-100"
                title="Parallelogram"
              >
                <div className="w-8 h-5" style={{ background: '#d1fae5', border: '1px solid #10b981', clipPath: 'polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)' }}></div>
              </button>
              {/* Trapezoid */}
              <button
                onClick={() => { const el = factories.trapezoid(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowShapesMenu(false) }}
                className="p-2 rounded hover:bg-gray-100"
                title="Trapezoid"
              >
                <div className="w-8 h-5" style={{ background: '#bae6fd', border: '1px solid #3b82f6', clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)' }}></div>
              </button>
              {/* Pentagon */}
              <button
                onClick={() => { const el = factories.pentagon(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowShapesMenu(false) }}
                className="p-2 rounded hover:bg-gray-100"
                title="Pentagon"
              >
                <div className="w-6 h-6" style={{ background: '#fde68a', border: '1px solid #f59e0b', clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)' }}></div>
              </button>
              {/* Hexagon */}
              <button
                onClick={() => { const el = factories.hexagon(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowShapesMenu(false) }}
                className="p-2 rounded hover:bg-gray-100"
                title="Hexagon"
              >
                <div className="w-8 h-5" style={{ background: '#fbcfe8', border: '1px solid #ec4899', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}></div>
              </button>
              {/* Octagon */}
              <button
                onClick={() => { const el = factories.octagon(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowShapesMenu(false) }}
                className="p-2 rounded hover:bg-gray-100"
                title="Octagon"
              >
                <div className="w-6 h-6" style={{ background: '#fecaca', border: '1px solid #ef4444', clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}></div>
              </button>
              {/* Chevron */}
              <button
                onClick={() => { const el = factories.chevron(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowShapesMenu(false) }}
                className="p-2 rounded hover:bg-gray-100"
                title="Chevron"
              >
                <div className="w-8 h-5" style={{ background: '#ddd6fe', border: '1px solid #8b5cf6', clipPath: 'polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%)' }}></div>
              </button>
              {/* Arrow Right */}
              <button
                onClick={() => { const el = factories.arrowRight(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowShapesMenu(false) }}
                className="p-2 rounded hover:bg-gray-100"
                title="Arrow Right"
              >
                <div className="w-8 h-5" style={{ background: '#bbf7d0', border: '1px solid #22c55e', clipPath: 'polygon(0% 0%, 80% 0%, 80% 25%, 100% 50%, 80% 75%, 80% 100%, 0% 100%, 0% 0%)' }}></div>
              </button>
              {/* Cloud */}
              <button
                onClick={() => { const el = factories.cloud(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowShapesMenu(false) }}
                className="p-2 rounded hover:bg-gray-100"
                title="Cloud"
              >
                <div className="w-8 h-5" style={{ background: '#e0f2fe', border: '1px solid #38bdf8', clipPath: 'polygon(10% 60%, 20% 45%, 35% 40%, 45% 25%, 60% 30%, 70% 45%, 85% 50%, 90% 65%, 80% 80%, 60% 85%, 40% 80%, 25% 75%)' }}></div>
              </button>
            </div>, document.body)
          }
          
          {/* Image Button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
className={`${elementBtn('image')} w-16 responsive-toolbar-button keep-default`}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
              <path d="M6 17 L11 12 L18 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
            <span className="text-xs responsive-toolbar-text keep-default show-label">Image</span>
          </button>
          {/* BG Image Button */}
          <button 
            onClick={() => bgFileInputRef.current?.click()}
className={`${elementBtn('bgimage')} w-20 responsive-toolbar-button keep-default`}
            title="Set Slide Background Image"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 16 L10 10 L14 14 L20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
            <span className="text-xs responsive-toolbar-text keep-default show-label">BG Image</span>
          </button>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageUpload}
          />
          <input 
            ref={bgFileInputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleBgImageUpload}
          />

          {/* Watermark Button */}
          <button 
            onClick={() => setShowWatermarkDialog(true)}
className={`${elementBtn('watermark')} w-16 responsive-toolbar-button keep-default`}
            title="Insert Watermark"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5"/>
              <text x="6" y="16" fontSize="8" fill="currentColor" opacity="0.6">WM</text>
</svg>
            <span className="text-xs responsive-toolbar-text keep-default show-label">Watermark</span>
          </button>

          {/* Watermark Dialog */}
          {showWatermarkDialog && createPortal(
            <div className="fixed inset-0 z-[1000] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/30" onClick={() => setShowWatermarkDialog(false)} />
              <div className="relative bg-white rounded-lg shadow-2xl border border-gray-300 w-[420px] p-4">
                <div className="text-base font-semibold mb-3">Insert Watermark</div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Text</label>
                    <input type="text" value={wmText} onChange={(e)=>setWmText(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="CONFIDENTIAL" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Font Size</label>
                      <input type="number" min="12" max="200" value={wmSize} onChange={(e)=>setWmSize(Number(e.target.value)||64)} className="w-full border rounded px-2 py-1" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Opacity</label>
                      <input type="number" step="0.05" min="0.05" max="1" value={wmOpacity} onChange={(e)=>setWmOpacity(Math.max(0.05, Math.min(1, Number(e.target.value)||0.15)))} className="w-full border rounded px-2 py-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Rotation (deg)</label>
                      <input type="number" min="-90" max="90" value={wmRotation} onChange={(e)=>setWmRotation(Number(e.target.value)||-30)} className="w-full border rounded px-2 py-1" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Color</label>
                      <input type="color" value={wmColor} onChange={(e)=>setWmColor(e.target.value)} className="w-full h-[34px] border rounded" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="wmAll" type="checkbox" checked={wmAllSlides} onChange={(e)=>setWmAllSlides(e.target.checked)} />
                    <label htmlFor="wmAll" className="text-sm">Apply to all slides</label>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button onClick={() => setShowWatermarkDialog(false)} className="px-3 py-1.5 rounded border">Cancel</button>
                  <button onClick={() => { dispatch({ type:'REMOVE_WATERMARK', scope: wmAllSlides ? 'all' : 'current' }) }} className="px-3 py-1.5 rounded border text-red-600">Remove</button>
                  <button onClick={() => { handleApplyWatermark(); setShowWatermarkDialog(false) }} className="px-3 py-1.5 rounded bg-black text-white">Apply</button>
                </div>
              </div>
            </div>, document.body)
          }
          
          {/* Table Button */}
          <div className="relative">
            <button 
              ref={tableBtnRef}
              onClick={() => {
                const rect = tableBtnRef.current?.getBoundingClientRect()
                if (rect) {
                  setTableGridPos({ top: rect.bottom + 8, left: rect.left })
                }
                setShowTableGrid((s) => !s)
              }}
className={`${elementBtn('table')} w-16 responsive-toolbar-button keep-default`}
            >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="3" y1="15" x2="21" y2="15"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
              <line x1="15" y1="3" x2="15" y2="21"/>
</svg>
              <span className="text-xs responsive-toolbar-text keep-default show-label">Table</span>
            </button>
          </div>

          {/* Import Table Data (visible when a table is selected) */}
          
          {/* Table Grid Selector (portal to avoid clipping by overflow) */}
          {showTableGrid && createPortal(
            <div 
              ref={tableGridRef}
              className="fixed bg-white border border-gray-300 rounded-lg shadow-xl p-4 z-[1000]"
              style={{ top: tableGridPos.top, left: tableGridPos.left }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-sm font-semibold mb-3">Insert Table</div>
              <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
                {Array.from({ length: 80 }, (_, i) => {
                  const row = Math.floor(i / 10) + 1
                  const col = (i % 10) + 1
                  const isHovered = row <= hoverRows && col <= hoverCols
                  return (
                    <div
                      key={i}
                      onMouseEnter={() => {
                        setHoverRows(row)
                        setHoverCols(col)
                      }}
                      onClick={() => { handleInsertTable(row, col); setShowTableGrid(false) }}
                      className={`w-5 h-5 border border-gray-300 cursor-pointer ${
                        isHovered ? 'bg-brand-400' : 'bg-white hover:bg-gray-100'
                      }`}
                    />
                  )
                })}
              </div>
              <div className="text-xs text-gray-600 mt-2 text-center">
                {hoverRows} × {hoverCols} Table
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => { setShowTableDialog(true); setShowTableGrid(false) }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="3" y1="15" x2="21" y2="15"/>
                    <line x1="9" y1="3" x2="9" y2="21"/>
                    <line x1="15" y1="3" x2="15" y2="21"/>
                  </svg>
                  Insert Table...
                </button>
              </div>
            </div>,
            document.body
          )}

          {/* Chart Button */}
          <button 
            onClick={() => setShowChartDialog(true)}
className={`${elementBtn('chart')} w-16 responsive-toolbar-button keep-default`}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="7" y="10" width="2" height="7" fill="currentColor" rx="0.5"/>
              <rect x="11" y="7" width="2" height="10" fill="currentColor" rx="0.5"/>
              <rect x="15" y="13" width="2" height="4" fill="currentColor" rx="0.5"/>
</svg>
            <span className="text-xs responsive-toolbar-text keep-default show-label">Chart</span>
          </button>

          {/* Background Color Button (match size with Image/Table/Chart) */}
<label className={`${elementBtn('background')} w-16 cursor-pointer responsive-toolbar-button keep-default`}>
            <svg width="32" height="32" viewBox="0 0 512 512" fill="none">
              <path fill="currentColor" d="M512 256c0 .9 0 1.8 0 2.7-.4 36.5-33.6 61.3-70.1 61.3L344 320c-26.5 0-48 21.5-48 48 0 3.4 .4 6.7 1 9.9 2.1 10.2 6.5 20 10.8 29.9 6.1 13.8 12.1 27.5 12.1 42 0 31.8-21.6 60.7-53.4 62-3.5 .1-7 .2-10.6 .2-141.4 0-256-114.6-256-256S114.6 0 256 0 512 114.6 512 256zM128 288a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm0-96a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM288 96a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 96a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
</svg>
            <span className="text-xs responsive-toolbar-text keep-default show-label">Background</span>
            <input 
              type="color" 
              value={currentSlide?.background || '#ffffff'}
              onChange={(e) => {
                dispatch({ 
                  type: 'UPDATE_SLIDE_BACKGROUND', 
                  slideId: state.currentSlideId, 
                  background: e.target.value 
                })
              }}
              className="absolute opacity-0 w-0 h-0"
            />
          </label>
           <div className={`h-6 w-px mx-1 ${colors.toolbarTextMuted} opacity-30`} style={{backgroundColor: 'currentColor'}} />
           

         <div className="flex flex-col items-center gap-1">
          <span className={`text-[10px] ${colors.toolbarTextSecondary} font-medium`}></span>
          <div className="flex gap-1" id="list-itmes">
            <div className="flex flex-col items-center">
              <button 
                onMouseDown={preventToolbarMouseDown} onClick={() => setListStyle('none')}
                className={btn(getCurrentListStyle() === 'none')}
                title="No List"
                disabled={!selected || selected.type !== 'text'}
              >
                —
              </button>
              <span className={`text-[9px] ${colors.toolbarTextMuted}`}>None</span>
            </div>
            <div className="flex flex-col items-center">
              <button 
                onMouseDown={preventToolbarMouseDown} onClick={() => setListStyle('bullet')}
                className={btn(getCurrentListStyle() === 'bullet')}
                title="Bullet List"
                disabled={!selected || selected.type !== 'text'}
              >
                •
              </button>
              <span className={`text-[9px] ${colors.toolbarTextMuted}`}>Dots</span>
            </div>
            <div className="flex flex-col items-center">
              <button 
                onMouseDown={preventToolbarMouseDown} onClick={() => setListStyle('number')} 
                className={btn(getCurrentListStyle() === 'number')}
                title="Numbered List"
                disabled={!selected || selected.type !== 'text'}
              >
                1.
              </button>
              <span className={`text-[9px] ${colors.toolbarTextMuted}`}>Numbers</span>
            </div>
            <div className="flex flex-col items-center">
              <button 
                onMouseDown={preventToolbarMouseDown} onClick={() => setListStyle('roman')} 
                className={btn(getCurrentListStyle() === 'roman')}
                title="Roman Numerals"
                disabled={!selected || selected.type !== 'text'}
              >
                I.
              </button>
              <span className={`text-[9px] ${colors.toolbarTextMuted}`}>Roman</span>
            </div>
            <div className="flex flex-col items-center">
              <button 
                onMouseDown={preventToolbarMouseDown} onClick={() => setListStyle('alpha')} 
                className={btn(getCurrentListStyle() === 'alpha')}
                title="Alphabetical List"
                disabled={!selected || selected.type !== 'text'}
              >
                A.
              </button>
              <span className={`text-[9px] ${colors.toolbarTextMuted}`}>Alphabets</span>
            </div>
          </div>
        </div>
          <div className="flex-1"></div>
          
        </>
      )}


      {activeTab === 'Home' && (
        <div className="flex items-center gap-2 text-sm responsive-toolbar-gap overflow-hidden">
        {/* Font Family Dropdown */}
        <select 
          value={
            selected?.type === 'text' 
              ? (selected?.styles?.fontFamily || 'Inter, system-ui, sans-serif')
              : selected?.type === 'table' 
                ? (selected?.cells?.[0]?.styles?.fontFamily || 'Inter, system-ui, sans-serif')
                : 'Inter, system-ui, sans-serif'
          }
          onChange={(e) => setFontFamily(e.target.value)}
          className={`px-2 py-1 rounded-lg ${colors.glassButton} ${colors.toolbarText} text-sm min-w-[100px] responsive-toolbar-button responsive-toolbar-text ${isDark ? 'dark-theme-dropdown' : 'light-theme-dropdown'} keep-default`}
          disabled={!selected || (selected.type !== 'text' && selected.type !== 'table')}
        >
          <option value="Inter, system-ui, sans-serif">Inter</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="'Courier New', monospace">Courier New</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="Verdana, sans-serif">Verdana</option>
        </select>
        
        <label className={`${colors.toolbarTextSecondary} text-xs responsive-toolbar-text`}>Size</label>
          <input 
          type="number" 
          min="8" 
          max="96" 
          step="1" 
          value={selected?.styles?.fontSize ?? 28} 
          onChange={setFontSize} 
          className={`w-16 px-1 py-1 rounded-lg ${colors.glassButton} ${colors.toolbarText} text-sm responsive-toolbar-button responsive-toolbar-text keep-default`}
          disabled={!selected || selected.type !== 'text'} 
        />
        
        {/* Text Color Picker with Bucket Icon */}
        <label className={`${colors.toolbarTextSecondary} text-xs responsive-toolbar-text`}>Text</label>
          <label className={`relative cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg ${colors.glassButton} hover:${colors.glassButton} responsive-toolbar-button`} title="Text Color">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={selected?.styles?.color ?? '#111827'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/>
            <path d="m5 2 5 5"/>
            <path d="M2 13h15"/>
            <path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/>
          </svg>
          <input type="color" value={selected?.styles?.color ?? '#111827'} onChange={setColor} className="absolute opacity-0 w-0 h-0" disabled={!selected || selected.type !== 'text'} />
        </label>
        
          <button onMouseDown={preventToolbarMouseDown} onClick={() => handleInlineStyleToggle('bold', 'bold')} className={`${btn(inlineFormats.bold)} responsive-toolbar-button responsive-toolbar-text ${!isTextEditing ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!isTextEditing}>B</button>
          <button onMouseDown={preventToolbarMouseDown} onClick={() => handleInlineStyleToggle('italic', 'italic')} className={`${btn(inlineFormats.italic)} responsive-toolbar-button responsive-toolbar-text ${!isTextEditing ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!isTextEditing}><i>I</i></button>
          <button onMouseDown={preventToolbarMouseDown} onClick={() => handleInlineStyleToggle('underline', 'underline')} className={`${btn(inlineFormats.underline)} responsive-toolbar-button responsive-toolbar-text ${!isTextEditing ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!isTextEditing}><u>U</u></button>
        <div className={`h-6 w-px mx-1 ${colors.toolbarTextMuted} opacity-30`} style={{backgroundColor: 'currentColor'}} />
        
        {/* Case Transform */}
        <div className="flex items-center gap-1">
          <button onMouseDown={preventToolbarMouseDown} onClick={() => applyCaseTransform('title')} className={`${btn(false)} responsive-toolbar-button responsive-toolbar-text ${!isTextEditing ? 'opacity-50 cursor-not-allowed' : ''}`} title="Title Case" disabled={!isTextEditing}>Aa</button>
          <button onMouseDown={preventToolbarMouseDown} onClick={() => applyCaseTransform('upper')} className={`${btn(false)} responsive-toolbar-button responsive-toolbar-text ${!isTextEditing ? 'opacity-50 cursor-not-allowed' : ''}`} title="UPPER CASE" disabled={!isTextEditing}>AA</button>
          <button onMouseDown={preventToolbarMouseDown} onClick={() => applyCaseTransform('lower')} className={`${btn(false)} responsive-toolbar-button responsive-toolbar-text ${!isTextEditing ? 'opacity-50 cursor-not-allowed' : ''}`} title="lower case" disabled={!isTextEditing}>aa</button>
        </div>
        
        <div className={`h-6 w-px mx-1 ${colors.toolbarTextMuted} opacity-30`} style={{backgroundColor: 'currentColor'}} />
        
        {/*Horizontal Alignment Section */}
        <div className="flex flex-col items-center gap-1 responsive-alignment-section">
          <span className={`text-[8px] ${colors.toolbarTextMuted} font-medium responsive-alignment-text`}>H-Alignment</span>
          <div className="flex gap-1 responsive-toolbar-gap">
            <div className="flex flex-col items-center responsive-alignment-section">
              <button onMouseDown={preventToolbarMouseDown} onClick={() => setAlign('left')} className={`${btn(getCurrentAlignment() === 'left')} responsive-toolbar-button force-black`} disabled={!selected || selected.type !== 'text'}>⟸</button>
              <span className={`text-[7px] ${colors.toolbarTextMuted} responsive-alignment-text`}>Left</span>
            </div>
            <div className="flex flex-col items-center responsive-alignment-section">
              <button onMouseDown={preventToolbarMouseDown} onClick={() => setAlign('center')} className={`${btn(getCurrentAlignment() === 'center')} responsive-toolbar-button`} disabled={!selected || selected.type !== 'text'}>≡</button>
              <span className={`text-[7px] ${colors.toolbarTextMuted} responsive-alignment-text`}>Center</span>
            </div>
            <div className="flex flex-col items-center responsive-alignment-section">
              <button onMouseDown={preventToolbarMouseDown} onClick={() => setAlign('right')} className={`${btn(getCurrentAlignment() === 'right')} responsive-toolbar-button`} disabled={!selected || selected.type !== 'text'}>⟹</button>
              <span className={`text-[7px] ${colors.toolbarTextMuted} responsive-alignment-text`}>Right</span>
            </div>
          </div>
        </div>
        {/*Vertical Alignment section */}
        <div className="flex flex-col items-center gap-1 responsive-alignment-section">
          <span className={`text-[8px] ${colors.toolbarTextMuted} font-medium responsive-alignment-text`}>V-Alignment</span>
          <div className="flex gap-1 responsive-toolbar-gap">
            <div className="flex flex-col items-center responsive-alignment-section">
              <button onMouseDown={preventToolbarMouseDown} onClick={() => setVAlign('top')} className={`${btn(selected?.styles?.valign  === 'top')} responsive-toolbar-button`} disabled={!selected || selected.type !== 'text'}>⤒</button>
              <span className={`text-[7px] ${colors.toolbarTextMuted} responsive-alignment-text`}>Top</span>
            </div>
            <div className="flex flex-col items-center responsive-alignment-section">
              <button onMouseDown={preventToolbarMouseDown} onClick={() => setVAlign('middle')} className={`${btn(selected?.styles?.valign === 'middle')} responsive-toolbar-button`} disabled={!selected || selected.type !== 'text'}>↕</button>
              <span className={`text-[7px] ${colors.toolbarTextMuted} responsive-alignment-text`}>Middle</span>
            </div>
            <div className="flex flex-col items-center responsive-alignment-section">
              <button onMouseDown={preventToolbarMouseDown} onClick={() => setVAlign('bottom')} className={`${btn(selected?.styles?.valign  === 'bottom')} responsive-toolbar-button`} disabled={!selected || selected.type !== 'text'}>⤓</button>
              <span className={`text-[7px] ${colors.toolbarTextMuted} responsive-alignment-text`}>Bottom</span>
            </div>
          </div>
        </div>
        
        <div className={`h-6 w-px mx-1 ${colors.toolbarTextMuted} opacity-30`} style={{backgroundColor: 'currentColor'}} />
  </div>
      )}

      <div className="ml-auto flex items-center gap-2 responsive-toolbar-gap">
        <button 
          onClick={onPresent} 
          className={`px-3 py-1.5 rounded-lg ${colors.glassButton} ${colors.toolbarText} font-medium responsive-toolbar-button responsive-toolbar-text force-border items-center justify-center gap-2 text-center`}
          title="Start Manual Presentation (F6)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 3l4 6-4 6-1.5-1.5L16 10H4V8h12l-2.5-3.5z"/>
          </svg>
          <span>Present</span>
        </button>
      </div>

      {/* Chart Dialog */}
      {showChartDialog && createPortal(
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center" onClick={() => setShowChartDialog(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 relative z-[1001]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Insert Chart</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setChartType('bar')}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 ${chartType === 'bar' ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-300'}`}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 10v7"/>
                      <path d="M12 7v10"/>
                      <path d="M16 13v4"/>
                    </svg>
                    <span className="text-xs">Bar Chart</span>
                  </button>
                  
                  <button
                    onClick={() => setChartType('line')}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 ${chartType === 'line' ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-300'}`}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="4 17 8 13 12 15 16 9 20 13"/>
                    </svg>
                    <span className="text-xs">Line Chart</span>
                  </button>
                  
                  <button
                    onClick={() => setChartType('pie')}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 ${chartType === 'pie' ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-300'}`}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 2v10l7 4"/>
                    </svg>
                    <span className="text-xs">Pie Chart</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => { setShowChartChild(true); try { console.log('[ChartPicker] Open child for type:', chartType) } catch {} }}
                className="flex-1 px-4 py-2 bg-black text-white rounded hover:bg-gray-900"
              >
                Select
              </button>
              <button 
                onClick={() => setShowChartDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Child Chart Variations Dialog (nested) */}
      {createPortal(
        <ChartSelectionDialog
          isOpen={showChartChild}
          initialType={chartType}
          onClose={() => setShowChartChild(false)}
          onChartSelect={(type, variant) => handleSelectChartVariant(type, variant)}
        />,
        document.body
      )}

      {/* Table Dialog */}
      {showTableDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowTableDialog(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-80" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Insert Table</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rows</label>
                <input 
                  type="number" 
                  min="1" 
                  max="20" 
                  value={tableRows}
                  onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Columns</label>
                <input 
                  type="number" 
                  min="1" 
                  max="20" 
                  value={tableCols}
                  onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => {
                  handleInsertTable(tableRows, tableCols)
                  setShowTableGrid(false)
                }}
                className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
              >
                Insert
              </button>
              <button 
                onClick={() => {
                  setShowTableDialog(false)
                  setShowTableGrid(false)
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* More Shapes Modal Popup */}
      {showMoreShapes && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowMoreShapes(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-80" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Select Shape</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Rounded Rect */}
              <button 
                onClick={() => { dispatch({ type: 'ADD_ELEMENT', element: factories.roundRect() }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                title="Rounded Rectangle"
              >
                <div className="w-10 h-6 rounded-lg" style={{ background: '#e5e7eb', border: '2px solid #6b7280' }}></div>
                <span className="text-sm text-gray-700 font-medium">Rounded Rect</span>
              </button>

              {/* Parallelogram */}
              <button 
                onClick={() => { dispatch({ type: 'ADD_ELEMENT', element: factories.parallelogram() }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                title="Parallelogram"
              >
                <div className="w-10 h-6" style={{ background: '#d1fae5', border: '2px solid #10b981', clipPath: 'polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)' }}></div>
                <span className="text-sm text-gray-700 font-medium">Parallelogram</span>
              </button>

              {/* Trapezoid */}
              <button 
                onClick={() => { dispatch({ type: 'ADD_ELEMENT', element: factories.trapezoid() }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                title="Trapezoid"
              >
                <div className="w-10 h-6" style={{ background: '#bae6fd', border: '2px solid #3b82f6', clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)' }}></div>
                <span className="text-sm text-gray-700 font-medium">Trapezoid</span>
              </button>

              {/* Pentagon */}
              <button 
                onClick={() => { dispatch({ type: 'ADD_ELEMENT', element: factories.pentagon() }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                title="Pentagon"
              >
                <div className="w-8 h-8" style={{ background: '#fde68a', border: '2px solid #f59e0b', clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)' }}></div>
                <span className="text-sm text-gray-700 font-medium">Pentagon</span>
              </button>

              {/* Hexagon */}
              <button 
                onClick={() => { dispatch({ type: 'ADD_ELEMENT', element: factories.hexagon() }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                title="Hexagon"
              >
                <div className="w-10 h-6" style={{ background: '#fbcfe8', border: '2px solid #ec4899', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}></div>
                <span className="text-sm text-gray-700 font-medium">Hexagon</span>
              </button>

              {/* Octagon */}
              <button 
                onClick={() => { dispatch({ type: 'ADD_ELEMENT', element: factories.octagon() }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                title="Octagon"
              >
                <div className="w-8 h-8" style={{ background: '#fecaca', border: '2px solid #ef4444', clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}></div>
                <span className="text-sm text-gray-700 font-medium">Octagon</span>
              </button>

              {/* Chevron */}
              <button 
                onClick={() => { dispatch({ type: 'ADD_ELEMENT', element: factories.chevron() }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                title="Chevron"
              >
                <div className="w-10 h-6" style={{ background: '#ddd6fe', border: '2px solid #8b5cf6', clipPath: 'polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%)' }}></div>
                <span className="text-sm text-gray-700 font-medium">Chevron</span>
              </button>

              {/* Arrow Right */}
              <button 
                onClick={() => { dispatch({ type: 'ADD_ELEMENT', element: factories.arrowRight() }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                title="Arrow Right"
              >
                <div className="w-10 h-6" style={{ background: '#bbf7d0', border: '2px solid #22c55e', clipPath: 'polygon(0% 0%, 80% 0%, 80% 25%, 100% 50%, 80% 75%, 80% 100%, 0% 100%, 0% 0%)' }}></div>
                <span className="text-sm text-gray-700 font-medium">Arrow</span>
              </button>

              {/* Cloud */}
              <button 
                onClick={() => { dispatch({ type: 'ADD_ELEMENT', element: factories.cloud() }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                title="Cloud"
              >
                <div className="w-10 h-6" style={{ background: '#e0f2fe', border: '2px solid #38bdf8', clipPath: 'polygon(10% 60%, 20% 45%, 35% 40%, 45% 25%, 60% 30%, 70% 45%, 85% 50%, 90% 65%, 80% 80%, 60% 85%, 40% 80%, 25% 75%)' }}></div>
                <span className="text-sm text-gray-700 font-medium">Cloud</span>
              </button>
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setShowMoreShapes(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper components for Insert tab list menus
function UnorderedListInsert({ colors, onChoose }) {
  const [open, setOpen] = React.useState(false)
  const btnRef = React.useRef(null)
  const [pos, setPos] = React.useState({ top: 0, left: 0 })
  React.useEffect(() => {
    const onDoc = (e) => { if (!open) return; const btn = btnRef.current; if (btn && !btn.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])
  const toggle = () => { const r = btnRef.current?.getBoundingClientRect(); if (r) setPos({ top: r.bottom + 6, left: r.left }); setOpen(v=>!v) }
  return (
    <>
      <button ref={btnRef} onMouseDown={(e)=>e.preventDefault()} onClick={toggle} className={`tool-btn anim-zoom ${colors.toolbarText} px-2 py-1.5 rounded-lg responsive-toolbar-button`} title="Insert unordered list">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="5" cy="6" r="1.6" fill="currentColor" />
          <line x1="9" y1="6" x2="20" y2="6" />
          <circle cx="5" cy="12" r="1.6" fill="currentColor" />
          <line x1="9" y1="12" x2="20" y2="12" />
          <circle cx="5" cy="18" r="1.6" fill="currentColor" />
          <line x1="9" y1="18" x2="20" y2="18" />
        </svg>
      </button>
      {open && createPortal(
        <div className="fixed z-[1000] bg-white border border-gray-300 rounded-md shadow-xl p-2" style={{ top: pos.top, left: pos.left }}>
          <div className="text-xs text-gray-500 mb-1">Bullets</div>
          <div className="flex flex-col gap-1">
            <button className= 'px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-2' title="Disc" onMouseDown={(e)=>e.preventDefault()} onClick={()=>{ setListStyle('bullet'); setOpen(false) }}>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-black inline-block"></span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-black inline-block"></span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-black inline-block"></span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
              </div>
            </button>
            <button className="px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-2" title="Circle" onMouseDown={(e)=>e.preventDefault()} onClick={()=>{ onChoose('bullet-circle'); setOpen(false) }}>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full border border-black inline-block"></span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full border border-black inline-block"></span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full border border-black inline-block"></span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
              </div>
            </button>
            <button className="px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-2" title="Square" onMouseDown={(e)=>e.preventDefault()} onClick={()=>{ onChoose('bullet-square'); setOpen(false) }}>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-black inline-block"></span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-black inline-block"></span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-black inline-block"></span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
              </div>
            </button>
          </div>
        </div>, document.body)
      }
    </>
  )
}

function ListInsert({ colors, onChoose }) {
  const [open, setOpen] = React.useState(false)
  const btnRef = React.useRef(null)
  const [pos, setPos] = React.useState({ top: 0, left: 0 })
  React.useEffect(() => {
    const onDoc = (e) => { if (!open) return; const btn = btnRef.current; if (btn && !btn.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])
  const toggle = () => { const r = btnRef.current?.getBoundingClientRect(); if (r) setPos({ top: r.bottom + 6, left: r.left }); setOpen(v=>!v) }
  return (
    <>
      <button ref={btnRef} onMouseDown={(e)=>e.preventDefault()} onClick={toggle} className={`tool-btn anim-zoom ${colors.toolbarText} px-2 py-1.5 rounded-lg responsive-toolbar-button`} title="Insert list">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="5" cy="6" r="1.6" fill="currentColor" />
          <line x1="9" y1="6" x2="20" y2="6" />
          <circle cx="5" cy="12" r="1.6" fill="currentColor" />
          <line x1="9" y1="12" x2="20" y2="12" />
          <circle cx="5" cy="18" r="1.6" fill="currentColor" />
          <line x1="9" y1="18" x2="20" y2="18" />
        </svg>
      </button>
      {open && createPortal(
        <div className="fixed z-[1000] bg-white border border-gray-300 rounded-md shadow-xl p-3" style={{ top: pos.top, left: pos.left }}>
          <div className="text-xs text-gray-500 mb-2">Bullets</div>
          <div className="flex flex-col gap-1 mb-2">
            <button className="px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-2" title="Disc" onClick={()=>{ onChoose('bullet'); setOpen(false) }}>   
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-black inline-block"></span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-black inline-block"></span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-black inline-block"></span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
              </div>
            </button>
            <button className="px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-2" title="Circle" onClick={()=>{ onChoose('bullet-circle'); setOpen(false) }}>
              <div className="flex flex-col gap-0.5">
                {console.log('rendering disc')}
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full border border-black inline-block"></span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full border border-black inline-block"></span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full border border-black inline-block"></span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
              </div>
            </button>
            <button className="px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-2" title="Square" onClick={()=>{ onChoose('bullet-square'); setOpen(false) }}>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-black inline-block"></span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-black inline-block"></span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-black inline-block"></span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
              </div>
            </button>
          </div>
          <div className="text-xs text-gray-500 mb-2">Numbering</div>
          <div className="flex flex-col gap-1">
            <button className="px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-2" title="1. 2. 3." onClick={()=>{ onChoose('number'); setOpen(false) }}>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1"><span className="text-[10px]">1.</span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
                <div className="flex items-center gap-1"><span className="text-[10px]">2.</span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
                <div className="flex items-center gap-1"><span className="text-[10px]">3.</span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
              </div>
            </button>
            <button className="px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-2" title="I. II. III." onClick={()=>{ onChoose('roman'); setOpen(false) }}>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1"><span className="text-[10px]">I.</span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
                <div className="flex items-center gap-1"><span className="text-[10px]">II.</span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
                <div className="flex items-center gap-1"><span className="text-[10px]">III.</span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
              </div>
            </button>
            <button className="px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-2" title="A. B. C." onClick={()=>{ onChoose('alpha'); setOpen(false) }}>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1"><span className="text-[10px]">A.</span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
                <div className="flex items-center gap-1"><span className="text-[10px]">B.</span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
                <div className="flex items-center gap-1"><span className="text-[10px]">C.</span><span className="w-12 h-1 bg-gray-400 inline-block rounded"></span></div>
              </div>
            </button>
          </div>
        </div>, document.body)
      }
    </>
  )
}

