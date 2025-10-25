import React, { useState, useRef, useEffect } from 'react'
import { useSlides, factories } from '../context/SlidesContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'


export default function Toolbar({ activeTab, onToggleSidebar, onPresent, onSlideShow }) {
  const { state, dispatch } = useSlides()
  const { getThemeColors, isDark } = useTheme()
  const colors = getThemeColors()
  
  // Helper function for glassmorphism button styling
  const btn = (active) => {
    return `px-2 py-1 rounded-md ${active ? colors.glassButtonActive : colors.glassButton} ${colors.toolbarText}`
  }
  
  // Helper function for element selection button styling (when element is selected)
  const elementBtn = (elementType) => {
    const isSelected = selected && selected.type === elementType
    return `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 ${
      isSelected 
        ? 'bg-white text-black border-2 border-black shadow-xl backdrop-blur-md' 
        : `${colors.glassButton} ${colors.toolbarTextSecondary}`
    }`
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
  const [showChartDialog, setShowChartDialog] = useState(false)
  const [chartType, setChartType] = useState('bar')
  const [inlineFormats, setInlineFormats] = useState({ bold: false, italic: false, underline: false })
  const [showMoreShapes, setShowMoreShapes] = useState(false)
  const [isNarrowScreen, setIsNarrowScreen] = useState(false)
  const fileInputRef = useRef(null)

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

  // Keyboard shortcuts for undo/redo and slide show
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        dispatch({ type: 'UNDO' })
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        dispatch({ type: 'REDO' })
      }
      if (e.key === 'F5') {
        e.preventDefault()
        onSlideShow() // F5 triggers auto slideshow
      }
      if (e.key === 'F6') {
        e.preventDefault() 
        onPresent() // F6 triggers manual present
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dispatch, onPresent, onSlideShow])

  const getActiveEditorHandle = () => window.currentTextEditorRef?.current ?? null

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
    const fallback = {
      bold: !!selected?.styles?.bold,
      italic: !!selected?.styles?.italic,
      underline: !!selected?.styles?.underline,
    }

    if (!editorHandle) {
      setInlineFormats(fallback)
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
      console.warn('No active text editor found')
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
    if (!selected || selected.type !== 'text') return

    if (hasActiveEditorSelection() && applyInlineFormat(command)) {
      setTimeout(updateInlineFormats, 20)
      return
    }

    toggleStyle(styleKey)
    setInlineFormats((prev) => ({
      ...prev,
      [styleKey]: !selected?.styles?.[styleKey],
    }))
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
      
      // Apply the alignment style directly to the editor
      editorNode.style.textAlign = align
      // Also set flex horizontal alignment so it visibly moves while editing
      const jc = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'
      editorNode.style.display = 'flex'
      editorNode.style.justifyContent = jc
      
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
      // Update element's default font family for new content
      const styles = { ...selected.styles, fontFamily }
      dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles } })
      
      // If there's an active editor, set the editor's style for future typing
      if (editorHandle && editorHandle.editorNode) {
        setTimeout(() => {
          editorHandle.editorNode.style.fontFamily = fontFamily
        }, 10)
      }
      return
    }

    // For tables, apply to all cells
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
      list.style.paddingInlineStart = '1.25em';
      list.style.margin = '0';
    } else if (list.tagName === 'OL') {
      list.style.listStyleType = cssType;
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
    
    // Select all content if no selection exists
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      selectAllIn(editorNode)
    }
    
    setTimeout(() => {
      try {
        if (listType === 'none') {
          // Remove any existing lists
          document.execCommand('insertOrderedList', false, null)
          document.execCommand('insertUnorderedList', false, null)
          unwrapListsToPlainText(editorNode)
        } else if (listType === 'bullet') {
          // Remove any existing ordered lists first
          if (editorNode.querySelector('ol')) {
            document.execCommand('insertOrderedList', false, null)
          }
          document.execCommand('insertUnorderedList', false, null)
          applyListStyleType(editorNode, 'disc')
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
      // Force re-render to update alignment and list button states
      if (selected?.type === 'text') {
        // Trigger a state update to refresh button highlighting
        const currentAlign = getCurrentAlignment()
        const currentList = getCurrentListStyle()
        // These calls will trigger re-renders with updated button states
      }
    }
    document.addEventListener('selectionchange', handleSelectionUpdate)
    return () => document.removeEventListener('selectionchange', handleSelectionUpdate)
  }, [selected?.id, selected?.styles?.bold, selected?.styles?.italic, selected?.styles?.underline, selected?.styles?.align, selected?.styles?.listStyle])

  // Handle ESC key to close more shapes modal
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
      dispatch({ type: 'ADD_ELEMENT', element: factories.image(reader.result) })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleInsertTable = (rows, cols) => {
    // Slide dimensions (standard 16:9 aspect ratio)
    const slideWidth = 960
    const slideHeight = 540
    const margin = 40
    
    // Calculate available space
    const availableWidth = slideWidth - (2 * margin)
    const availableHeight = slideHeight - (2 * margin)
    
    // Calculate cell dimensions to fit within slide
    const cellWidth = Math.floor(availableWidth / cols)
    const cellHeight = Math.floor(availableHeight / rows)
    
    // Ensure minimum cell size
    const minCellWidth = Math.max(cellWidth, 60)
    const minCellHeight = Math.max(cellHeight, 30)
    
    // Calculate actual table dimensions
    const tableWidth = minCellWidth * cols
    const tableHeight = minCellHeight * rows
    
    // Center the table on the slide
    const tableX = Math.max(margin, (slideWidth - tableWidth) / 2)
    const tableY = Math.max(margin, (slideHeight - tableHeight) / 2)
    
    // Create table as a single element
    const table = factories.table(rows, cols, tableX, tableY, tableWidth, tableHeight)
    dispatch({ type: 'ADD_ELEMENT', element: table })
    
    setShowTableGrid(false)
    setShowTableDialog(false)
  }

  const handleInsertChart = () => {
    const chart = factories.chart(chartType, 150, 100, 600, 350)
    dispatch({ type: 'ADD_ELEMENT', element: chart })
    setShowChartDialog(false)
  }

  return (
    <div className={`w-full border-b px-1 py-1 flex items-center gap-2 sticky top-0 z-10 transition-all duration-500 ${colors.border} animate-slideInDown responsive-toolbar overflow-hidden`} style={{background: colors.toolbarBg, minHeight: '60px',maxHeight: '86px',height:'86px'}}>
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
          <path d="M3 17a9 9 0 919-9 9 9 0 616 2.3l3 2.7"/>
        </svg>
      </button>

      {activeTab !== 'Insert' && (
        <>
          <div className={`h-6 w-px mx-1 ${colors.toolbarTextMuted} opacity-30`} style={{backgroundColor: 'currentColor'}} />

          <button onClick={() => dispatch({ type: 'ADD_SLIDE' })} className={`px-3 py-1.5 rounded-lg ${colors.glassButton} ${colors.toolbarText} font-medium responsive-toolbar-button responsive-toolbar-text`}>+ New Slide</button>
          
          <button 
            onClick={() => dispatch({ type: 'ADD_ELEMENT', element: factories.text() })} 
            className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-300 responsive-toolbar-button responsive-toolbar-text ${
              selected && selected.type === 'text'
                ? 'bg-white text-black border-2 border-black shadow-xl backdrop-blur-md'
                : `${colors.glassButton} ${colors.toolbarText}`
            }`}
          >
            + Text
          </button>

          <div className={`h-6 w-px mx-1 ${colors.toolbarTextMuted} opacity-30`} style={{backgroundColor: 'currentColor'}} />
        </>
      )}
      
      {activeTab === 'Insert' && (
        <>
          <div className={`h-6 w-px mx-1 ${colors.toolbarTextMuted} opacity-30`} style={{backgroundColor: 'currentColor'}} />
          
          {/* Image Button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={elementBtn('image')}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1.5"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="#fbbf24"/>
              <path d="M21 15 L16 10 L5 21" fill="#86efac" stroke="#22c55e" strokeWidth="1.5"/>
              <path d="M21 15 L21 19 C21 20.1 20.1 21 19 21 L5 21 L16 10 L21 15 Z" fill="#86efac"/>
            </svg>
            <span className="text-xs">Image</span>
          </button>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageUpload}
          />
          
          {/* Table Button */}
          <div className="relative">
            <button 
              onClick={() => setShowTableGrid(!showTableGrid)}
              className={elementBtn('table')}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="3" y1="15" x2="21" y2="15"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
                <line x1="15" y1="3" x2="15" y2="21"/>
              </svg>
              <span className="text-xs">Table</span>
            </button>
            
            {/* Table Grid Selector */}
            {showTableGrid && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-4 z-50" onClick={(e) => e.stopPropagation()}>
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
                        onClick={() => handleInsertTable(row, col)}
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
                    onClick={() => setShowTableDialog(true)}
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
              </div>
            )}
          </div>

          {/* Chart Button */}
          <button 
            onClick={() => setShowChartDialog(true)}
            className={elementBtn('chart')}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5"/>
              <rect x="7" y="10" width="2" height="7" fill="#3b82f6" rx="0.5"/>
              <rect x="11" y="7" width="2" height="10" fill="#10b981" rx="0.5"/>
              <rect x="15" y="13" width="2" height="4" fill="#ef4444" rx="0.5"/>
            </svg>
            <span className="text-xs">Chart</span>
          </button>

          {/* Background Color Button */}
          <label className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${colors.glassButton} cursor-pointer`}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill={currentSlide?.background || '#ffffff'} stroke="#9ca3af" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="6" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="2 2"/>
              <path d="M12 8 L12 16 M8 12 L16 12" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className={`text-xs ${colors.toolbarTextSecondary}`}>Background</span>
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
          <span className={`text-[10px] ${colors.toolbarTextSecondary} font-medium`}>List Items</span>
          <div className="flex gap-1">
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

      {activeTab === 'Design' && (
        <div className="flex items-center gap-2 text-sm">
          {/* Slide Ordering Controls */}
          {/*<div className="flex items-center gap-2">
            <span className="text-gray-600 text-xs">Slide Order:</span>
            <button 
              onClick={() => dispatch({ type: 'MOVE_SLIDE_UP', slideId: state.currentSlideId })}
              className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
              title="Move Slide Up"
            >
              ↑
            </button>
            <button 
              onClick={() => dispatch({ type: 'MOVE_SLIDE_DOWN', slideId: state.currentSlideId })}
              className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
              title="Move Slide Down"
            >
              ↓
            </button>
            <span className="text-xs text-gray-500">
              Slide {state.slides.findIndex(s => s.id === state.currentSlideId) + 1} of {state.slides.length}
            </span>
          </div>}

          <div className={`h-6 w-px mx-2 ${colors.toolbarTextMuted} opacity-30`} style={{backgroundColor: 'currentColor'}} />

          {/* Shape Tools - Responsive Design */}
          <div className="flex items-center gap-2 responsive-toolbar-gap">
            {!isNarrowScreen && <span className={`${colors.toolbarTextSecondary} text-xs responsive-toolbar-text`}>Shapes:</span>}
            
            {/* Always visible shapes (first 3) */}
            {/* Rectangle */}
            <button 
              onClick={() => dispatch({ type: 'ADD_ELEMENT', element: factories.rect() })}
              className={`${elementBtn('rect')} responsive-toolbar-button`}
              title="Rectangle"
            >
              <div className="w-5 h-3 rounded-sm" style={{ background: '#fde68a', border: '1px solid #f59e0b' }}></div>
              <span className="text-xs responsive-toolbar-text">Rect</span>
            </button>

            {/* Circle */}
            <button 
              onClick={() => dispatch({ type: 'ADD_ELEMENT', element: factories.circle() })}
              className={`${elementBtn('circle')} responsive-toolbar-button`}
              title="Circle"
            >
              <div className="w-3 h-3 rounded-full" style={{ background: '#bfdbfe', border: '1px solid #3b82f6' }}></div>
              <span className="text-xs responsive-toolbar-text">Circle</span>
            </button>

            {/* Triangle */}
            <button 
              onClick={() => dispatch({ type: 'ADD_ELEMENT', element: factories.triangle() })}
              className={`${elementBtn('triangle')} responsive-toolbar-button`}
              title="Triangle"
            >
              <div className="w-3 h-3" style={{ 
                background: '#fecaca', 
                border: '1px solid #ef4444',
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
              }}></div>
              <span className="text-xs responsive-toolbar-text">Triangle</span>
            </button>

            {/* Conditional shapes and More button */}
            {!isNarrowScreen ? (
              <>
                {/* Square */}
                <button 
                  onClick={() => dispatch({ type: 'ADD_ELEMENT', element: factories.square() })}
                  className={`${elementBtn('square')} responsive-toolbar-button`}
                  title="Square"
                >
                  <div className="w-3 h-3 rounded-sm" style={{ background: '#fde68a', border: '1px solid #f59e0b' }}></div>
                  <span className="text-xs responsive-toolbar-text">Square</span>
                </button>

                {/* Diamond */}
                <button 
                  onClick={() => dispatch({ type: 'ADD_ELEMENT', element: factories.diamond() })}
                  className={`${elementBtn('diamond')} responsive-toolbar-button`}
                  title="Diamond"
                >
                  <div className="w-3 h-3" style={{ 
                    background: '#d8b4fe', 
                    border: '1px solid #8b5cf6',
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                  }}></div>
                  <span className="text-xs responsive-toolbar-text">Diamond</span>
                </button>

                {/* Star */}
                <button 
                  onClick={() => dispatch({ type: 'ADD_ELEMENT', element: factories.star() })}
                  className={`${elementBtn('star')} responsive-toolbar-button`}
                  title="Star"
                >
                  <div className="w-3 h-3" style={{ 
                    background: '#fef3c7', 
                    border: '1px solid #f59e0b',
                    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                  }}></div>
                  <span className="text-xs responsive-toolbar-text">Star</span>
                </button>

                {/* Message */}
                <button 
                  onClick={() => dispatch({ type: 'ADD_ELEMENT', element: factories.message() })}
                  className={`${elementBtn('message')} responsive-toolbar-button`}
                  title="Message"
                >
                  <div className="w-5 h-3 rounded-lg relative" style={{ background: '#d1fae5', border: '1px solid #10b981' }}>
                    <div className="absolute bottom-0 left-0.5 w-0 h-0" style={{ borderLeft: '2px solid transparent', borderRight: '2px solid transparent', borderTop: '3px solid #10b981' }}></div>
                  </div>
                  <span className="text-xs responsive-toolbar-text">Message</span>
                </button>
              </>
            ) : (
              /* More button for narrow screens */
              <div className="relative">
                <button 
                  onClick={() => setShowMoreShapes(!showMoreShapes)}
                  className={`${elementBtn('more')} responsive-toolbar-button`}
                  title="More Shapes"
                >
                  <div className="w-3 h-3 bg-gray-300 rounded flex items-center justify-center">
                    <span className="text-[8px] font-bold text-gray-600">⋯</span>
                  </div>
                  <span className="text-xs responsive-toolbar-text">More</span>
                </button>
                
              </div>
            )}
          </div>

          

          {/* Shape Color Controls */}
          {selected && ['rect', 'square', 'circle', 'triangle', 'diamond', 'star', 'message'].includes(selected.type) && (
            <div className="flex items-center gap-2">
              <span className={`${colors.toolbarTextSecondary} text-xs`}>Colors:</span>
              
              {/* Fill Color */}
              <div className="flex flex-col items-center gap-1">
                <input
                  type="color"
                  value={selected.fill || '#fde68a'}
                  onChange={(e) => dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { fill: e.target.value } })}
                  className={`w-10 h-10 rounded-lg cursor-pointer ${colors.glassButton} border-2`}
                  title="Fill Color"
                />
                <span className={`text-[9px] ${colors.toolbarTextMuted}`}>Fill</span>
              </div>

              {/* Stroke Color */}
              <div className="flex flex-col items-center gap-1">
                <input
                  type="color"
                  value={selected.stroke || '#f59e0b'}
                  onChange={(e) => dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { stroke: e.target.value } })}
                  className={`w-10 h-10 rounded-lg cursor-pointer ${colors.glassButton} border-2`}
                  title="Border Color"
                />
                <span className={`text-[9px] ${colors.toolbarTextMuted}`}>Border</span>
              </div>

              {/* Text Color */}
              <div className="flex flex-col items-center gap-1">
                <input
                  type="color"
                  value={selected.textColor || '#111827'}
                  onChange={(e) => dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { textColor: e.target.value } })}
                  className={`w-10 h-10 rounded-lg cursor-pointer ${colors.glassButton} border-2`}
                  title="Text Color"
                />
                <span className={`text-[9px] ${colors.toolbarTextMuted}`}>Text</span>
              </div>
            </div>
          )}

          <div className={`h-6 w-px mx-2 ${colors.toolbarTextMuted} opacity-30`} style={{backgroundColor: 'currentColor'}} />

          {/* Present Button (Manual) */}
          
          {/* Slide Show Button (Auto) */}
          <button 
            onClick={onSlideShow}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${colors.glassButton} ${colors.toolbarText} shadow-sm`}
            title="Start Auto Slide Show (F5)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span className="font-medium">Slide Show</span>
          </button>
          
          <div className="flex-1"></div>
        </div>
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
          className={`px-2 py-1 rounded-lg ${colors.glassButton} ${colors.toolbarText} text-sm min-w-[100px] responsive-toolbar-button responsive-toolbar-text ${isDark ? 'dark-theme-dropdown' : 'light-theme-dropdown'}`}
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
          className={`w-16 px-1 py-1 rounded-lg ${colors.glassButton} ${colors.toolbarText} text-sm responsive-toolbar-button responsive-toolbar-text`}
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
        
          <button onMouseDown={preventToolbarMouseDown} onClick={() => handleInlineStyleToggle('bold', 'bold')} className={`${btn(inlineFormats.bold)} responsive-toolbar-button responsive-toolbar-text`} disabled={!selected || selected.type !== 'text'}>B</button>
          <button onMouseDown={preventToolbarMouseDown} onClick={() => handleInlineStyleToggle('italic', 'italic')} className={`${btn(inlineFormats.italic)} responsive-toolbar-button responsive-toolbar-text`} disabled={!selected || selected.type !== 'text'}><i>I</i></button>
          <button onMouseDown={preventToolbarMouseDown} onClick={() => handleInlineStyleToggle('underline', 'underline')} className={`${btn(inlineFormats.underline)} responsive-toolbar-button responsive-toolbar-text`} disabled={!selected || selected.type !== 'text'}><u>U</u></button>
        <div className={`h-6 w-px mx-1 ${colors.toolbarTextMuted} opacity-30`} style={{backgroundColor: 'currentColor'}} />
        
        {/*Horizontal Alignment Section */}
        <div className="flex flex-col items-center gap-1 responsive-alignment-section">
          <span className={`text-[8px] ${colors.toolbarTextMuted} font-medium responsive-alignment-text`}>H-Alignment</span>
          <div className="flex gap-1 responsive-toolbar-gap">
            <div className="flex flex-col items-center responsive-alignment-section">
              <button onMouseDown={preventToolbarMouseDown} onClick={() => setAlign('left')} className={`${btn(getCurrentAlignment() === 'left')} responsive-toolbar-button`} disabled={!selected || selected.type !== 'text'}>⟸</button>
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

        
        {/* List Items Section */}
        </div>
      )}

      <div className="ml-auto flex items-center gap-2 responsive-toolbar-gap">
        <button 
          onClick={onPresent} 
          className={`px-3 py-1.5 rounded-lg ${colors.glassButton} ${colors.toolbarText} font-medium shine-button pulse-glow relative z-10 responsive-toolbar-button responsive-toolbar-text`}
          title="Start Manual Presentation (F6)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="mr-1.5 relative z-20">
            <path d="M15 3l4 6-4 6-1.5-1.5L16 10H4V8h12l-2.5-3.5z"/>
          </svg>
          <span className="relative z-20">Present</span>
        </button>
      </div>

      {/* Chart Dialog */}
      {showChartDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowChartDialog(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-96" onClick={(e) => e.stopPropagation()}>
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
                onClick={handleInsertChart}
                className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
              >
                Insert
              </button>
              <button 
                onClick={() => setShowChartDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
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
              {/* Square */}
              <button 
                onClick={() => {
                  dispatch({ type: 'ADD_ELEMENT', element: factories.square() })
                  setShowMoreShapes(false)
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                title="Square"
              >
                <div className="w-8 h-8 rounded-sm" style={{ background: '#fde68a', border: '2px solid #f59e0b' }}></div>
                <span className="text-sm text-gray-700 font-medium">Square</span>
              </button>

              {/* Diamond */}
              <button 
                onClick={() => {
                  dispatch({ type: 'ADD_ELEMENT', element: factories.diamond() })
                  setShowMoreShapes(false)
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                title="Diamond"
              >
                <div className="w-8 h-8" style={{ 
                  background: '#d8b4fe', 
                  border: '2px solid #8b5cf6',
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                }}></div>
                <span className="text-sm text-gray-700 font-medium">Diamond</span>
              </button>

              {/* Star */}
              <button 
                onClick={() => {
                  dispatch({ type: 'ADD_ELEMENT', element: factories.star() })
                  setShowMoreShapes(false)
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                title="Star"
              >
                <div className="w-8 h-8" style={{ 
                  background: '#fef3c7', 
                  border: '2px solid #f59e0b',
                  clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                }}></div>
                <span className="text-sm text-gray-700 font-medium">Star</span>
              </button>

              {/* Message */}
              <button 
                onClick={() => {
                  dispatch({ type: 'ADD_ELEMENT', element: factories.message() })
                  setShowMoreShapes(false)
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                title="Message"
              >
                <div className="w-10 h-6 rounded-lg relative" style={{ background: '#d1fae5', border: '2px solid #10b981' }}>
                  <div className="absolute bottom-0 left-2 w-0 h-0" style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '6px solid #10b981' }}></div>
                </div>
                <span className="text-sm text-gray-700 font-medium">Message</span>
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

