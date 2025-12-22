import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSlides, factories } from '../context/SlidesContext.jsx'
import ChartSelectionDialog from './ChartSelectionDialog.jsx'
import { SlideThumbnail } from './Sidebar.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { VscListOrdered } from 'react-icons/vsc'
import { RiPaintBrushLine, RiZoomInLine, RiZoomOutLine } from 'react-icons/ri'
import { IoFolderOutline } from 'react-icons/io5'

import { ChartPie, Table, FileType, Shapes, Image as ImageIcon, Paintbrush, Stamp, MonitorPlay, FolderOpen, CirclePlus, Undo2, Redo2 } from 'lucide-react'


export default function Toolbar({ activeTab, isSidebarOpen, onToggleSidebar, onPresent, onSlideShow, fileName = 'Untitled Presentation', onRenameFile, zoom = 1, onZoomIn, onZoomOut, onResetZoom, onZoomChange, onNavigateHome }) {
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
    return `flex flex-col items-center gap-[2px] px-2 py-1.5 rounded-lg tool-btn anim-zoom ${colors.toolbarText} ${glass}`
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
  const [isWatermarkDialogClosing, setIsWatermarkDialogClosing] = useState(false)
  const [wmText, setWmText] = useState('CONFIDENTIAL')
  const [wmOpacity, setWmOpacity] = useState(0.15)
  const [wmRotation, setWmRotation] = useState(-30)
  const [wmSize, setWmSize] = useState(64)
  const [wmColor, setWmColor] = useState('#111827')
  const [wmAllSlides, setWmAllSlides] = useState(true)
  const [inlineFormats, setInlineFormats] = useState({ bold: false, italic: false, underline: false })
  const [showMoreShapes, setShowMoreShapes] = useState(false)
  const [isShapesDialogClosing, setIsShapesDialogClosing] = useState(false)
  const [isNarrowScreen, setIsNarrowScreen] = useState(false)
  const fileInputRef = useRef(null)
  const bgFileInputRef = useRef(null)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [isImageDialogClosing, setIsImageDialogClosing] = useState(false)
  const [showSidebarMenu, setShowSidebarMenu] = useState(false)
  const sidebarBtnRef = useRef(null)
  const [sidebarMenuPos, setSidebarMenuPos] = useState({ top: 0, left: 0 })
  const [showSlideDashboard, setShowSlideDashboard] = useState(false)
  const [isSlideDashboardClosing, setIsSlideDashboardClosing] = useState(false)

  // Slide dashboard drag-reorder state
  const dashDragIndexRef = useRef(null)
  const [dashDragOverIndex, setDashDragOverIndex] = useState(null)
  const [isDashDragging, setIsDashDragging] = useState(false)
  const dashScrollRef = useRef(null)
  const dashAutoScrollRef = useRef({ rafId: null, speed: 0 })
  const [name, setName] = useState(fileName)
  useEffect(() => setName(fileName), [fileName])

  // Shapes button / mini dashboard
  const shapesBtnRef = useRef(null)

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
            try { window.dispatchEvent(new CustomEvent('editTextBox', { detail: { id: selected.id } })) } catch { }
            setTimeout(() => {
              const editorHandle = getActiveEditorHandle()
              const node = editorHandle?.editorNode
              if (node) selectAllIn(node)
            }, 30)
            return
          }
          // Shape element: ensure edit mode then select all in its textarea
          const shapeTypes = ['rect', 'square', 'circle', 'triangle', 'diamond', 'star', 'message', 'roundRect', 'parallelogram', 'trapezoid', 'pentagon', 'hexagon', 'octagon', 'chevron', 'arrowRight', 'cloud']
          if (shapeTypes.includes(selected.type)) {
            try { window.dispatchEvent(new CustomEvent('editShapeText', { detail: { id: selected.id } })) } catch { }
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

      // In Toolbar.jsx, update the handleKeyDown function
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Avoid deleting while typing inside an input/contenteditable
        const active = document.activeElement
        const inEditable = active && (
          active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.isContentEditable
        )
        if (!inEditable && selected) {
          e.preventDefault()
          dispatch({ type: 'DELETE_ELEMENT', id: selected.id })
          return // Add return to prevent other handlers
        }
      } if (e.key === 'F6') {
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
    const fallback = {
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

    const editorHandle = getActiveEditorHandle()
    const hasSelection = (() => {
      try {
        if (editorHandle && typeof editorHandle.hasSelection === 'function') return editorHandle.hasSelection()
      } catch { }
      return false
    })()

    if (editorHandle && hasSelection) {
      // Toggle based on current selection state
      const desired = !inlineFormats[styleKey]
      applyInlineFormat(command)
      if (typeof editorHandle.setTypingState === 'function') {
        editorHandle.setTypingState({ [styleKey]: desired })
      }
      setTimeout(updateInlineFormats, 20)
      return
    }

    // Apply to whole input box (element-level); compute from source of truth (selected.styles)
    const currentVal = !!(selected.styles && selected.styles[styleKey])
    const desired = !currentVal
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
  const toTitleCase = (s = '') => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
  const applyCaseTransform = (mode /* 'upper'|'lower'|'title' */) => {
    const editorHandle = getActiveEditorHandle()
    const convert = (t = '') => mode === 'upper' ? t.toUpperCase() : mode === 'lower' ? t.toLowerCase() : toTitleCase(t)
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

  // Close sidebar menu on outside click
  useEffect(() => {
    const onDocDown = (e) => {
      if (!showSidebarMenu) return;
      const btn = sidebarBtnRef.current;
      const menu = document.getElementById('sidebar-toggle-menu');
      const inBtn = btn && (btn === e.target || btn.contains(e.target));
      const inMenu = menu && (menu === e.target || menu.contains(e.target));
      if (!(inBtn || inMenu)) setShowSidebarMenu(false);
    }
    if (showSidebarMenu) document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [showSidebarMenu])

  const ensureDashAutoScrollLoop = () => {
    if (dashAutoScrollRef.current.rafId) return
    const step = () => {
      const { speed } = dashAutoScrollRef.current
      const el = dashScrollRef.current
      if (el && speed) {
        el.scrollTop += speed
      }
      dashAutoScrollRef.current.rafId = isDashDragging ? requestAnimationFrame(step) : null
    }
    dashAutoScrollRef.current.rafId = requestAnimationFrame(step)
  }

  const stopDashAutoScroll = () => {
    if (dashAutoScrollRef.current.rafId) cancelAnimationFrame(dashAutoScrollRef.current.rafId)
    dashAutoScrollRef.current.rafId = null
    dashAutoScrollRef.current.speed = 0
  }

  const handleDashContainerDragOver = (e) => {
    // Autoscroll near top/bottom while dragging
    e.preventDefault()
    if (!dashScrollRef.current || !isDashDragging) return
    const rect = dashScrollRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top
    const threshold = Math.min(80, rect.height / 4)
    const maxSpeed = 16
    let speed = 0
    if (y < threshold) {
      speed = -Math.round(((threshold - y) / threshold) * maxSpeed)
    } else if (y > rect.height - threshold) {
      speed = Math.round(((y - (rect.height - threshold)) / threshold) * maxSpeed)
    }
    dashAutoScrollRef.current.speed = speed
    if (speed !== 0) ensureDashAutoScrollLoop()
    else if (speed === 0 && dashAutoScrollRef.current.rafId) {
      stopDashAutoScroll()
    }
  }

  const handleDashDragStart = (e, index) => {
    dashDragIndexRef.current = index
    setIsDashDragging(true)
    try { e.dataTransfer.setData('text/plain', String(index)) } catch { }
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
  }

  const handleDashDragOver = (e, index) => {
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    if (dashDragOverIndex !== index) setDashDragOverIndex(index)
  }

  const handleDashDragLeave = (e, index) => {
    if (dashDragOverIndex === index) setDashDragOverIndex(null)
  }

  const handleDashDrop = (e, index) => {
    e.preventDefault()
    const fromIndexStr = (() => { try { return e.dataTransfer.getData('text/plain') } catch { return '' } })()
    const fromIndex = Number.isInteger(Number(fromIndexStr)) ? parseInt(fromIndexStr, 10) : dashDragIndexRef.current
    const toIndex = index
    if (typeof fromIndex === 'number' && typeof toIndex === 'number' && fromIndex !== toIndex) {
      dispatch({ type: 'REORDER_SLIDES', fromIndex, toIndex })
    }
    dashDragIndexRef.current = null
    setDashDragOverIndex(null)
    setIsDashDragging(false)
    stopDashAutoScroll()
  }

  const handleDashDragEnd = () => {
    dashDragIndexRef.current = null
    setDashDragOverIndex(null)
    setIsDashDragging(false)
    stopDashAutoScroll()
  }

  const openSlideDashboard = () => {
    setShowSidebarMenu(false)
    setIsSlideDashboardClosing(false)
    setShowSlideDashboard(true)
  }

  const closeSlideDashboard = () => {
    setIsSlideDashboardClosing(true)
    // Match CSS animation duration
    setTimeout(() => {
      setShowSlideDashboard(false)
      setIsSlideDashboardClosing(false)
    }, 220)
  }

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setShowSidebarMenu(false) }
    if (showSidebarMenu) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showSidebarMenu])

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
    try { console.log('[ChartPicker] Selected:', type, variant) } catch { }
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
    }
    const onDocMouseDown = (e) => {
      if (showTableGrid) {
        const btn = tableBtnRef.current
        const grid = tableGridRef.current
        const inBtn = btn && (btn === e.target || btn.contains(e.target))
        const inGrid = grid && (grid === e.target || grid.contains(e.target))
        if (!(inBtn || inGrid)) setShowTableGrid(false)
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
  }, [showTableGrid])

  return (
    <div
      className={`toolbar w-full px-3 py-0 mt-0 flex flex-col transition-all duration-300 animate-slideInDown responsive-toolbar`}
      style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        paddingTop: '0px',
        paddingBottom: '-2px',
        marginTop: '0px',
        gap: '0px'
      }}
    >
      {/* Nav: app icon + label + filename (inline) */}
      <div className="relative flex items-center" style={{ marginBottom: '-8px' }}>
        <div className="flex items-center gap-0 cursor-pointer hover:opacity-70 transition-opacity relative z-10" onClick={onNavigateHome}>
          <div className="w-6 h-6 rounded flex items-center justify-center bg-white">
            <svg viewBox="0 0 24 24" fill="black" aria-hidden="true" className="w-4 h-4">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
            </svg>
          </div>
          <span className={`${colors.toolbarText} text-sm font-semibold`}>PPT-Slider</span>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
            onBlur={() => { const v = (name || '').trim() || 'Untitled Presentation'; setName(v); onRenameFile?.(v) }}
            className={`${colors.toolbarText} text-sm font-medium px-2 py-0.5 rounded-md bg-transparent outline-none border border-transparent focus:border-gray-400 text-center`}
            style={{ minWidth: 220, lineHeight: 1 }}
          />
        </div>
      </div>

      {/* Tools row container */}
      <div className="grid items-center w-full" style={{ paddingTop: '0px', marginTop: '0px', paddingBottom: '0px', gridTemplateColumns: '1fr auto 1fr', columnGap: '8px' }}>
        <div className="flex items-center gap-2 justify-self-start">
          <button ref={sidebarBtnRef} onClick={() => {
            const rect = sidebarBtnRef.current?.getBoundingClientRect();
            if (rect) setSidebarMenuPos({ top: rect.bottom + 8, left: rect.left });
            setShowSidebarMenu(true);
          }} className={`px-2 py-1.5 rounded-lg ${colors.glassButton} ${colors.toolbarText} responsive-toolbar-button no-hover-outline no-hover-bg`} aria-label="Toggle sidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>


          {/* Undo and Redo Buttons - Always Visible */}
          <button
            onClick={() => dispatch({ type: 'UNDO' })}
            disabled={state.historyIndex <= 0}
            className={`${state.historyIndex <= 0 ? colors.glassButtonDisabled : colors.glassButton} ${colors.toolbarText} responsive-toolbar-button no-hover-outline no-hover-bg px-2 py-1.5 rounded-lg flex items-center justify-center anim-zoom`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={20} className="text-current" />
          </button>
          <button
            onClick={() => dispatch({ type: 'REDO' })}
            disabled={state.historyIndex >= state.history.length - 1}
            className={`${state.historyIndex >= state.history.length - 1 ? colors.glassButtonDisabled : colors.glassButton} ${colors.toolbarText} responsive-toolbar-button no-hover-outline no-hover-bg px-2 py-1.5 rounded-lg flex items-center justify-center anim-zoom`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={20} className="text-current" />
          </button>


          <button onClick={() => dispatch({ type: 'ADD_SLIDE' })} className={`px-2 py-1.5 rounded-lg tool-btn anim-zoom ${colors.toolbarText} font-medium responsive-toolbar-button responsive-toolbar-text keep-default w-20 flex flex-col items-center gap-[2px]`}>
            <CirclePlus size={20} className="text-current" />
            <span className="text-[10px] whitespace-nowrap">Add Slide</span>
          </button>

          {/* File Button */}
          <button onClick={() => { try { window.openFileDashboard?.() } catch { } }} className={`px-2 py-1.5 rounded-lg tool-btn anim-zoom ${colors.toolbarText} font-medium responsive-toolbar-button responsive-toolbar-text keep-default w-16 flex flex-col items-center gap-0`} title="File">
            <FolderOpen size={20} className="text-current" />
            <span className="text-[10px] responsive-toolbar-text keep-default show-label">File</span>
          </button>

        </div>
        {/* Center tools */}
        <div className="justify-self-center">
          <div className="flex items-center gap-2 whitespace-nowrap">
            {/* Text */}
            <button
              onClick={() => dispatch({ type: 'ADD_ELEMENT', element: factories.text() })}
              className={`px-3 py-1.5 rounded-lg tool-btn anim-zoom font-medium transition-all duration-300 ${colors.toolbarText} responsive-toolbar-button responsive-toolbar-text keep-default w-16 flex flex-col items-center gap-0`}
            >
              <FileType size={20} className="text-current" />
              <span className="text-[10px] responsive-toolbar-text keep-default show-label">Text</span>
            </button>

            {/* Shapes dropdown (icon grid) */}
            <div className="flex items-center gap-2 responsive-toolbar-gap">
              <div className="relative">
                <button
                  ref={shapesBtnRef}
                  onClick={() => setShowMoreShapes(true)}
                  className={`${elementBtn('shapes')} w-16 responsive-toolbar-button responsive-toolbar-text keep-default group`}
                  title="Add shape"
                >
                  <Shapes size={20} className="text-current transition-transform duration-200 ease-in-out group-hover:scale-110" />
                  <span className="text-[10px] responsive-toolbar-text keep-default show-label">Shapes</span>
                </button>
              </div>
            </div>
            {/* Image / Background combined */}
            <button
              onClick={() => { setIsImageDialogClosing(false); setShowImageDialog(true) }}
              className={`${elementBtn('image')} w-16 responsive-toolbar-button keep-default flex flex-col items-center gap-0`}
              title="Insert Image or Set Background Image"
            >
              <ImageIcon size={20} className="text-current" />
              <span className="text-[10px] responsive-toolbar-text keep-default show-label">Image</span>
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
            {(showImageDialog || isImageDialogClosing) && createPortal(
              <div className="fixed inset-0 z-[1000] bg-black/40 flex items-end md:items-center justify-center" onClick={() => {
                setIsImageDialogClosing(true)
                setTimeout(() => { setShowImageDialog(false); setIsImageDialogClosing(false) }, 220)
              }}>
                <div
                  className={`w-full md:w-[520px] bg-white/70 backdrop-blur-2xl border border-white/60 rounded-t-2xl md:rounded-2xl shadow-2xl p-5 transform transition-all duration-300 ease-out md:translate-y-0 translate-y-0 ${isImageDialogClosing ? 'modal-zoom-exit' : 'modal-zoom-enter'}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-base font-semibold mb-3">Choose Action</div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { setShowImageDialog(false); setTimeout(() => fileInputRef.current?.click(), 0) }}
                      className="rounded-xl border border-white/60 bg-white/60 hover:bg-white/80 backdrop-blur-xl p-4 flex flex-col items-center gap-2 shadow-sm transition-all duration-200"
                      title="Insert Image Element"
                    >
                      <ImageIcon size={36} className="text-current" />
                      <span className="text-sm font-medium">Image</span>
                    </button>
                    <button
                      onClick={() => { setShowImageDialog(false); setTimeout(() => bgFileInputRef.current?.click(), 0) }}
                      className="rounded-xl border border-white/60 bg-white/50 hover:bg-white/70 backdrop-blur-xl p-4 flex flex-col items-center gap-2 shadow-sm transition-all duration-200"
                      title="Set Slide Background Image"
                    >
                      <ImageIcon size={36} className="text-current" />
                      <span className="text-sm font-medium">Background</span>
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}

            {/* Watermark Button (Keynote-style lock icon) */}
            <button
              onClick={() => { setIsWatermarkDialogClosing(false); setShowWatermarkDialog(true) }}
              className={`${elementBtn('watermark')} w-16 responsive-toolbar-button keep-default flex flex-col items-center gap-0`}
              title="Insert Watermark"
            >
              <Stamp size={20} className="text-current" />
              <span className="text-[10px] responsive-toolbar-text keep-default show-label">Watermark</span>
            </button>

            {/* Watermark Dialog */}
            {(showWatermarkDialog || isWatermarkDialogClosing) && createPortal(
              <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div
                  className="absolute inset-0"
                  onClick={() => {
                    setIsWatermarkDialogClosing(true)
                    setTimeout(() => { setShowWatermarkDialog(false); setIsWatermarkDialogClosing(false) }, 220)
                  }}
                />
                <div
                  className={`relative w-[440px] max-w-full rounded-2xl bg-gradient-to-br from-white/95 via-gray-50/95 to-gray-100/95 backdrop-blur-2xl border border-white/70 shadow-[0_18px_60px_rgba(15,23,42,0.35)] p-5 ${isWatermarkDialogClosing ? 'modal-zoom-exit' : 'modal-zoom-enter'}`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Insert Watermark</div>
                      <div className="text-xs text-gray-500 mt-0.5">Add a subtle label across your slides</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Text</label>
                      <input
                        type="text"
                        value={wmText}
                        onChange={(e) => setWmText(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500/60 transition-colors"
                        placeholder="CONFIDENTIAL"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Font Size</label>
                        <input
                          type="number"
                          min="12"
                          max="200"
                          value={wmSize}
                          onChange={(e) => setWmSize(Number(e.target.value) || 64)}
                          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500/60 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Opacity</label>
                        <input
                          type="number"
                          step="0.05"
                          min="0.05"
                          max="1"
                          value={wmOpacity}
                          onChange={(e) => setWmOpacity(Math.max(0.05, Math.min(1, Number(e.target.value) || 0.15)))}
                          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500/60 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Rotation (deg)</label>
                        <input
                          type="number"
                          min="-90"
                          max="90"
                          value={wmRotation}
                          onChange={(e) => setWmRotation(Number(e.target.value) || -30)}
                          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500/60 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                        <input
                          type="color"
                          value={wmColor}
                          onChange={(e) => setWmColor(e.target.value)}
                          className="w-full h-[34px] rounded-lg border border-gray-200 cursor-pointer hover:border-gray-500/60 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        id="wmAll"
                        type="checkbox"
                        checked={wmAllSlides}
                        onChange={(e) => setWmAllSlides(e.target.checked)}
                        className="rounded border-gray-300 text-gray-700 focus:ring-gray-500/60"
                      />
                      <label htmlFor="wmAll" className="text-xs text-gray-700">Apply to all slides</label>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setIsWatermarkDialogClosing(true)
                        setTimeout(() => { setShowWatermarkDialog(false); setIsWatermarkDialogClosing(false) }, 220)
                      }}
                      className="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white/90 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-100 hover:border-gray-300 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { dispatch({ type: 'REMOVE_WATERMARK', scope: wmAllSlides ? 'all' : 'current' }) }}
                      className="px-3.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-xs font-medium text-red-600 shadow-sm hover:bg-red-100 hover:border-red-300 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 transition-all"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => {
                        handleApplyWatermark()
                        setIsWatermarkDialogClosing(true)
                        setTimeout(() => { setShowWatermarkDialog(false); setIsWatermarkDialogClosing(false) }, 220)
                      }}
                      className="px-4 py-1.5 rounded-lg bg-gray-900 text-xs font-semibold text-white shadow-sm hover:bg-gray-800 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 transition-all"
                    >
                      Apply
                    </button>
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
                className={`${elementBtn('table')} w-16 responsive-toolbar-button keep-default group flex flex-col items-center gap-0`}
              >
                <Table size={20} className="text-current" />
                <span className="text-[10px] responsive-toolbar-text keep-default show-label">Table</span>
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
                        className={`w-5 h-5 border border-gray-300 cursor-pointer ${isHovered ? 'bg-brand-400' : 'bg-white hover:bg-gray-100'
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
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="3" y1="15" x2="21" y2="15" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                      <line x1="15" y1="3" x2="15" y2="21" />
                    </svg>
                    Insert Table...
                  </button>
                </div>
              </div>,
              document.body
            )}

            {/* Chart Button */}
            <button
              onClick={() => setShowChartChild(true)}
              className={`${elementBtn('chart')} w-16 responsive-toolbar-button keep-default flex flex-col items-center gap-0`}
            >
              <ChartPie size={20} className="text-current" />
              <span className="text-[10px] responsive-toolbar-text keep-default show-label">Chart</span>
            </button>

            {/* Background Color Button (match size with Image/Table/Chart) */}
            <label className={`${elementBtn('background')} w-16 cursor-pointer responsive-toolbar-button keep-default flex flex-col items-center gap-0`}>
              <Paintbrush size={20} className="text-current" />
              <span className="text-[10px] responsive-toolbar-text keep-default show-label">Background</span>
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
          </div>
        </div>

        <div className="flex items-center gap-2 responsive-toolbar-gap justify-self-end mr-12">
          {/* Zoom controls */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-full border border-[rgba(0,0,0,0.12)] bg-white/70 backdrop-blur">
            <button onClick={onZoomOut} title="Zoom Out (Ctrl/Cmd -)" className="p-1 rounded-md responsive-toolbar-button no-hover-outline no-hover-bg" aria-label="Zoom out">
              <RiZoomOutLine className="w-4 h-4" />
            </button>
            <button onClick={onResetZoom} title="Reset Zoom (Ctrl/Cmd 0)" className="px-1 text-xs font-medium text-[#1c1c1e] no-hover-outline no-hover-bg" aria-label="Reset zoom">
              {Math.round((zoom || 1) * 100)}%
            </button>
            <button onClick={onZoomIn} title="Zoom In (Ctrl/Cmd +)" className="p-1 rounded-md responsive-toolbar-button no-hover-outline no-hover-bg" aria-label="Zoom in">
              <RiZoomInLine className="w-4 h-4" />
            </button>
            <input type="range" min={0.1} max={4} step={0.1} value={zoom || 1} onChange={(e) => onZoomChange?.(parseFloat(e.target.value) || 1)} className="w-24 h-1 accent-[#007aff]" />
          </div>

          <button
            onClick={onPresent}
            className={`px-2 py-1.5 rounded-lg tool-btn anim-zoom ${colors.toolbarText} font-medium responsive-toolbar-button responsive-toolbar-text keep-default w-16 flex flex-col items-center justify-center gap-0 text-center`}
            title="Play (F6)"
          >
            <MonitorPlay size={20} className="text-current" />
            <span className="text-[10px] responsive-toolbar-text keep-default show-label">Play</span>
          </button>
        </div>

        {activeTab === 'Home' && null}

        {showSidebarMenu && createPortal(
          <div id="sidebar-toggle-menu" className="fixed z-[1100] px-2 py-2 text-sm rounded-2xl shadow-2xl border border-white/60 bg-white/70 backdrop-blur-2xl" style={{ top: sidebarMenuPos.top, left: sidebarMenuPos.left }}>
            <div className="flex flex-col items-stretch gap-2">
              <button className="px-3 py-2 rounded-xl bg-white/60 hover:bg-white/80 border border-white/70 shadow-sm text-gray-800 text-left" onClick={() => { setShowSidebarMenu(false); onToggleSidebar(); }}>
                {isSidebarOpen ? 'Hide left sidebar' : 'Unhide left sidebar'}
              </button>
              <button className="px-3 py-2 rounded-xl bg-white/60 hover:bg-white/80 border border-white/70 shadow-sm text-gray-800 text-left" onClick={openSlideDashboard}>
                Slide dashboard
              </button>
            </div>
          </div>,
          document.body
        )}

        {(showSlideDashboard || isSlideDashboardClosing) && createPortal(
          <div
            className="fixed inset-0 z-[1150] flex items-center justify-center bg-black/50 backdrop-blur-md"
            onClick={closeSlideDashboard}
          >
            <div
              className={`relative w-full h-full max-w-6xl max-h-[90vh] mx-4 my-6 rounded-3xl bg-white/90 border border-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.55)] overflow-hidden ${isSlideDashboardClosing ? 'slide-dashboard-exit' : 'slide-dashboard-enter'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/90">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Slide Dashboard</div>
                  <div className="text-xs text-gray-500 mt-0.5">Click a slide to jump to it</div>
                </div>
                <button
                  type="button"
                  onClick={closeSlideDashboard}
                  className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-700 shadow-sm"
                >
                  Close
                </button>
              </div>
              <div
                className="px-6 py-4 h-[calc(100%-56px)] overflow-auto scrollbar-thin smooth-scroll"
                ref={dashScrollRef}
                onDragOver={handleDashContainerDragOver}
                onDragLeave={() => { dashAutoScrollRef.current.speed = 0 }}
              >
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {state.slides.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`group text-left focus:outline-none ${dashDragOverIndex === idx && dashDragIndexRef.current !== idx ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white' : ''}`}
                      draggable
                      onDragStart={(e) => handleDashDragStart(e, idx)}
                      onDragEnd={handleDashDragEnd}
                      onDragOver={(e) => handleDashDragOver(e, idx)}
                      onDragLeave={(e) => handleDashDragLeave(e, idx)}
                      onDrop={(e) => handleDashDrop(e, idx)}
                      onClick={() => {
                        dispatch({ type: 'SET_CURRENT_SLIDE', id: s.id })
                        closeSlideDashboard()
                      }}
                    >
                      <div className="w-full aspect-video bg-white rounded-2xl shadow-md overflow-hidden flex items-center justify-center group-hover:shadow-xl group-hover:-translate-y-0.5 transition-all duration-200 p-2">
                        <SlideThumbnail slide={s} slideNumber={idx + 1} isActive={s.id === state.currentSlideId} />
                      </div>
                      <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
                        <span className="font-medium">Slide {idx + 1}</span>
                        <span className="text-[10px] text-gray-400 truncate max-w-[140px]">{s.name || ''}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

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
                      <path d="M8 10v7" />
                      <path d="M12 7v10" />
                      <path d="M16 13v4" />
                    </svg>
                    <span className="text-xs">Bar Chart</span>
                  </button>

                  <button
                    onClick={() => setChartType('line')}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 ${chartType === 'line' ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-300'}`}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="4 17 8 13 12 15 16 9 20 13" />
                    </svg>
                    <span className="text-xs">Line Chart</span>
                  </button>

                  <button
                    onClick={() => setChartType('pie')}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 ${chartType === 'pie' ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-300'}`}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2v10l7 4" />
                    </svg>
                    <span className="text-xs">Pie Chart</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => { setShowChartChild(true); try { console.log('[ChartPicker] Open child for type:', chartType) } catch { } }}
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


      {/* Shapes Dashboard (modal, similar to chart picker style) */}
      {(showMoreShapes || isShapesDialogClosing) && createPortal(
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40"
          onClick={() => {
            setIsShapesDialogClosing(true)
            setTimeout(() => { setShowMoreShapes(false); setIsShapesDialogClosing(false) }, 220)
          }}
        >
          <div
            className={`bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl p-6 w-[720px] max-w-[90vw] ${isShapesDialogClosing ? 'modal-zoom-exit' : 'modal-zoom-enter'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Insert Shape</h3>
              <button
                onClick={() => {
                  setIsShapesDialogClosing(true)
                  setTimeout(() => { setShowMoreShapes(false); setIsShapesDialogClosing(false) }, 220)
                }}
                className="text-gray-500 hover:text-gray-800 text-xl leading-none"
                aria-label="Close shapes panel"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {/* Rectangle */}
              <button
                onClick={() => { const el = factories.rect(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                title="Rectangle"
              >
                <div className="w-14 h-8 rounded-md" style={{ background: '#f3f4f6', border: '1px solid #9ca3af' }}></div>
                <span className="text-xs text-gray-700 font-medium">Rectangle</span>
              </button>

              {/* Rounded Rect */}
              <button
                onClick={() => { const el = factories.roundRect(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                title="Rounded Rectangle"
              >
                <div className="w-14 h-8 rounded-full" style={{ background: '#e5e7eb', border: '1px solid #9ca3af' }}></div>
                <span className="text-xs text-gray-700 font-medium text-center">Rounded Rect</span>
              </button>

              {/* Square */}
              <button
                onClick={() => { const el = factories.square(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                title="Square"
              >
                <div className="w-10 h-10 rounded-md" style={{ background: '#f3f4f6', border: '1px solid #9ca3af' }}></div>
                <span className="text-xs text-gray-700 font-medium">Square</span>
              </button>

              {/* Circle */}
              <button
                onClick={() => { const el = factories.circle(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                title="Circle"
              >
                <div className="w-10 h-10 rounded-full" style={{ background: '#e5e7eb', border: '1px solid #9ca3af' }}></div>
                <span className="text-xs text-gray-700 font-medium">Circle</span>
              </button>

              {/* Triangle */}
              <button
                onClick={() => { const el = factories.triangle(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                title="Triangle"
              >
                <div className="w-10 h-10" style={{ background: '#fee2e2', border: '1px solid #f97316', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                <span className="text-xs text-gray-700 font-medium">Triangle</span>
              </button>

              {/* Diamond */}
              <button
                onClick={() => { const el = factories.diamond(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                title="Diamond"
              >
                <div className="w-10 h-10" style={{ background: '#e5e7eb', border: '1px solid #9ca3af', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>
                <span className="text-xs text-gray-700 font-medium">Diamond</span>
              </button>

              {/* Star */}
              <button
                onClick={() => { const el = factories.star(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                title="Star"
              >
                <div className="w-10 h-10" style={{ background: '#fef3c7', border: '1px solid #eab308', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}></div>
                <span className="text-xs text-gray-700 font-medium">Star</span>
              </button>

              {/* Speech Bubble */}
              <button
                onClick={() => { const el = factories.message(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                title="Speech Bubble"
              >
                <div className="w-14 h-8 rounded-lg relative" style={{ background: '#e0f2fe', border: '1px solid #38bdf8' }}>
                  <div className="absolute bottom-0 left-1 w-0 h-0" style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #38bdf8' }}></div>
                </div>
                <span className="text-xs text-gray-700 font-medium text-center">Speech Bubble</span>
              </button>

              {/* Parallelogram */}
              <button
                onClick={() => { const el = factories.parallelogram(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                title="Parallelogram"
              >
                <div className="w-14 h-8" style={{ background: '#dcfce7', border: '1px solid #22c55e', clipPath: 'polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)' }}></div>
                <span className="text-xs text-gray-700 font-medium">Parallelogram</span>
              </button>

              {/* Trapezoid */}
              <button
                onClick={() => { const el = factories.trapezoid(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                title="Trapezoid"
              >
                <div className="w-14 h-8" style={{ background: '#e0f2fe', border: '1px solid #3b82f6', clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)' }}></div>
                <span className="text-xs text-gray-700 font-medium">Trapezoid</span>
              </button>

              {/* Pentagon */}
              <button
                onClick={() => { const el = factories.pentagon(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                title="Pentagon"
              >
                <div className="w-10 h-10" style={{ background: '#fef3c7', border: '1px solid #eab308', clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)' }}></div>
                <span className="text-xs text-gray-700 font-medium">Pentagon</span>
              </button>

              {/* Hexagon */}
              <button
                onClick={() => { const el = factories.hexagon(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                title="Hexagon"
              >
                <div className="w-14 h-8" style={{ background: '#fef2f2', border: '1px solid #f97316', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}></div>
                <span className="text-xs text-gray-700 font-medium">Hexagon</span>
              </button>

              {/* Octagon */}
              <button
                onClick={() => { const el = factories.octagon(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                title="Octagon"
              >
                <div className="w-10 h-10" style={{ background: '#fee2e2', border: '1px solid #ef4444', clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}></div>
                <span className="text-xs text-gray-700 font-medium">Octagon</span>
              </button>

              {/* Chevron */}
              <button
                onClick={() => { const el = factories.chevron(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                title="Chevron"
              >
                <div className="w-14 h-8" style={{ background: '#e0e7ff', border: '1px solid #4f46e5', clipPath: 'polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%)' }}></div>
                <span className="text-xs text-gray-700 font-medium">Chevron</span>
              </button>

              {/* Arrow Right */}
              <button
                onClick={() => { const el = factories.arrowRight(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                title="Arrow Right"
              >
                <div className="w-14 h-8" style={{ background: '#dcfce7', border: '1px solid #22c55e', clipPath: 'polygon(0% 0%, 80% 0%, 80% 25%, 100% 50%, 80% 75%, 80% 100%, 0% 100%, 0% 0%)' }}></div>
                <span className="text-xs text-gray-700 font-medium">Arrow</span>
              </button>

              {/* Cloud */}
              <button
                onClick={() => { const el = factories.cloud(); dispatch({ type: 'ADD_ELEMENT', element: el }); dispatch({ type: 'SELECT_ELEMENT', id: el.id }); setShowMoreShapes(false) }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                title="Cloud"
              >
                <div className="w-14 h-8" style={{ background: '#e0f2fe', border: '1px solid #38bdf8', clipPath: 'polygon(10% 60%, 20% 45%, 35% 40%, 45% 25%, 60% 30%, 70% 45%, 85% 50%, 90% 65%, 80% 80%, 60% 85%, 40% 80%, 25% 75%)' }}></div>
                <span className="text-xs text-gray-700 font-medium">Cloud</span>
              </button>

            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowMoreShapes(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

