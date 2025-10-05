import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react'

const RichTextEditor = forwardRef(({ el, onChange, onBlur }, ref) => {
  const editorRef = useRef(null)
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (editorRef.current) {
      if (el.html) {
        editorRef.current.innerHTML = el.html
      } else if (el.text) {
        editorRef.current.textContent = el.text
      }
      editorRef.current.focus()
    }
  }, [el.id])

  const handleSelectionChange = () => {
    const selection = window.getSelection()
    if (selection && !selection.isCollapsed && editorRef.current?.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setToolbarPosition({
        top: rect.top - 50,
        left: rect.left + rect.width / 2
      })
      setShowToolbar(true)
    } else {
      setShowToolbar(false)
    }
  }

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [])

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    applyFormat: (command, value = null) => {
      if (editorRef.current) {
        // Save current selection
        const selection = window.getSelection()
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null
        
        // Focus the editor
        editorRef.current.focus()
        
        // Restore selection if it was lost
        if (range) {
          selection.removeAllRanges()
          selection.addRange(range)
        }
        
        // Execute the command
        const success = document.execCommand(command, false, value)
        console.log(`execCommand(${command}, ${value}): ${success}`)
        
        // Update content
        if (editorRef.current) {
          onChange({ 
            html: editorRef.current.innerHTML,
            text: editorRef.current.textContent 
          })
        }
      }
    },
    focus: () => {
      editorRef.current?.focus()
    }
  }))

  const handleBlur = () => {
    if (editorRef.current) {
      onChange({ 
        html: editorRef.current.innerHTML,
        text: editorRef.current.textContent 
      })
    }
    if (onBlur) onBlur()
  }

  const handleInput = () => {
    if (editorRef.current) {
      onChange({ 
        html: editorRef.current.innerHTML,
        text: editorRef.current.textContent 
      })
    }
  }

  const localApplyFormat = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    if (editorRef.current) {
      onChange({ 
        html: editorRef.current.innerHTML,
        text: editorRef.current.textContent 
      })
    }
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
          fontFamily: el.styles.fontFamily,
          fontSize: el.styles.fontSize,
          color: el.styles.color,
          textAlign: el.styles.align,
          whiteSpace: 'pre-wrap',
          overflowWrap: 'break-word'
        }}
        onInput={handleInput}
      />

      {showToolbar && (
        <div
          className="fixed bg-gray-900 text-white rounded-lg shadow-xl p-2 flex gap-1 z-50"
          style={{
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
            transform: 'translateX(-50%)'
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <button
            onClick={() => localApplyFormat('bold')}
            className="px-2 py-1 hover:bg-gray-700 rounded"
            title="Bold"
          >
            <span className="font-bold">B</span>
          </button>
          <button
            onClick={() => localApplyFormat('italic')}
            className="px-2 py-1 hover:bg-gray-700 rounded"
            title="Italic"
          >
            <span className="italic">I</span>
          </button>
          <button
            onClick={() => localApplyFormat('underline')}
            className="px-2 py-1 hover:bg-gray-700 rounded"
            title="Underline"
          >
            <span className="underline">U</span>
          </button>
          <div className="w-px bg-gray-600 mx-1" />
          <input
            type="color"
            onChange={(e) => localApplyFormat('foreColor', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
            title="Text Color"
          />
          <input
            type="color"
            onChange={(e) => localApplyFormat('backColor', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer"
            title="Highlight"
          />
          <div className="w-px bg-gray-600 mx-1" />
          <select
            onChange={(e) => localApplyFormat('fontName', e.target.value)}
            className="px-2 py-1 bg-gray-800 text-white rounded text-xs"
            title="Font"
          >
            <option value="">Font</option>
            <option value="Inter">Inter</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
          </select>
        </div>
      )}
    </>
  )
})

export default RichTextEditor
