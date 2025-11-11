import React from 'react'
import { createPortal } from 'react-dom'
import { useSlides } from '../context/SlidesContext.jsx'

export default function TableStylePanel() {
  const { state, dispatch } = useSlides()
  const slide = state.slides.find(s => s.id === state.currentSlideId)
  const table = slide?.elements.find(e => e.id === state.selectedElementId && e.type === 'table')

  if (!table) {
    return <div className="text-sm text-gray-600">Select a table to edit its style.</div>
  }

  const update = (patch) => dispatch({ type: 'UPDATE_ELEMENT', id: table.id, patch })
  // Keep table editing focus while interacting with this panel
  const holdEditing = () => {
    if (typeof window !== 'undefined') {
      window.keepTableEditing = true
      // Give enough time for mousedown -> blur -> click handlers to complete
      setTimeout(() => { window.keepTableEditing = false }, 250)
    }
  }

  const activeCellIndex = () => {
    if (typeof window === 'undefined') return null
    const edit = window.currentEditingTableCell
    if (edit && edit.id === table.id && Number.isInteger(edit.cellIndex)) return edit.cellIndex
    const sel = window.currentSelectedTableCell
    if (sel && sel.id === table.id && Number.isInteger(sel.cellIndex)) return sel.cellIndex
    return null
  }

  const liveApplyToDom = (cellId, patch = {}) => {
    try {
      const el = document.getElementById(`table-cell-${cellId}`)
      if (!el) return
      if (patch.fontFamily) el.style.fontFamily = patch.fontFamily
      if (patch.color) el.style.color = patch.color
      if (typeof patch.bold === 'boolean') el.style.fontWeight = patch.bold ? '700' : '400'
      if (typeof patch.italic === 'boolean') el.style.fontStyle = patch.italic ? 'italic' : 'normal'
      if (typeof patch.underline === 'boolean') el.style.textDecoration = patch.underline ? 'underline' : 'none'
      if (patch.bgColor) el.style.background = patch.bgColor
      if (patch.align) {
        el.style.textAlign = patch.align
        el.style.justifyContent = patch.align === 'right' ? 'flex-end' : (patch.align === 'center' ? 'center' : 'flex-start')
      }
      if (patch.valign) {
        el.style.alignItems = patch.valign === 'middle' ? 'center' : (patch.valign === 'bottom' ? 'flex-end' : 'flex-start')
      }
      // fontSize applied via state rerender; optional live tweak if provided
      if (patch.fontSize) el.style.fontSize = `${patch.fontSize}px`
    } catch {}
  }

  const genId = () => {
    try {
      const w = typeof window !== 'undefined' ? window : null
      if (w && w.crypto && typeof w.crypto.randomUUID === 'function') return w.crypto.randomUUID()
    } catch {}
    return `cell-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
  }

  const updateCellStyles = (cellIndex, stylesPatch) => {
    const cells = [...table.cells]
    const cell = cells[cellIndex]
    cells[cellIndex] = { ...cell, styles: { ...(cell?.styles || {}), ...(stylesPatch || {}) } }
    update({ cells })
    // Live apply if this is the actively edited cell
    try {
      const info = typeof window !== 'undefined' ? window.currentEditingTableCell : null
      if (info && info.id === table.id && info.cellIndex === cellIndex) liveApplyToDom(cell.id, stylesPatch)
    } catch {}
  }

  const updateAllCellsStyles = (stylesPatch) => {
    const cells = table.cells.map(cell => ({ ...cell, styles: { ...(cell.styles || {}), ...(stylesPatch || {}) } }))
    update({ cells })
  }

  const updateHeaderStyles = (stylesPatch) => {
    const cols = table.cols
    const cells = table.cells.map((cell, idx) => idx < cols ? ({ ...cell, styles: { ...(cell.styles || {}), ...(stylesPatch || {}) } }) : cell)
    update({ cells })
    // Live update if actively editing a header cell
    try {
      const info = typeof window !== 'undefined' ? window.currentEditingTableCell : null
      if (info && info.id === table.id && info.cellIndex < cols) {
        const cell = table.cells[info.cellIndex]
        liveApplyToDom(cell.id, stylesPatch)
      }
    } catch {}
  }

  const updateBodyStyles = (stylesPatch) => {
    const cols = table.cols
    const cells = table.cells.map((cell, idx) => idx >= cols ? ({ ...cell, styles: { ...(cell.styles || {}), ...(stylesPatch || {}) } }) : cell)
    update({ cells })
    // Live update if actively editing a body cell
    try {
      const info = typeof window !== 'undefined' ? window.currentEditingTableCell : null
      if (info && info.id === table.id && info.cellIndex >= cols) {
        const cell = table.cells[info.cellIndex]
        liveApplyToDom(cell.id, stylesPatch)
      }
    } catch {}
  }
  
  const dispatchEditCell = (index) => {
    try { window.dispatchEvent(new CustomEvent('editTableCell', { detail: { tableId: table.id, cellIndex: index } })) } catch {}
  }

  const minCellH = 24
  const minCellW = 36

  const addRow = () => {
    const cols = table.cols
    const info = typeof window !== 'undefined' ? window.currentEditingTableCell : null
    const currentRow = (info && info.id === table.id) ? Math.floor(info.cellIndex / cols) : (table.rows - 1)

    if (scope === 'cell' && info && info.id === table.id) {
      const insertAfter = currentRow
      const rows = table.rows + 1
      const newCells = []
      for (let r = 0; r < table.rows; r++) {
        const rowStart = r * cols
        newCells.push(...table.cells.slice(rowStart, rowStart + cols))
        if (r === insertAfter) {
for (let c = 0; c < cols; c++) newCells.push({ id: genId(), text: '', styles: { ...(table.cells[0]?.styles || {}) } })
        }
      }
      update({ rows, cells: newCells })
      setTimeout(() => dispatchEditCell(Math.min(rows * cols - 1, (insertAfter + 1) * cols + (info.cellIndex % cols))), 0)
      return
    }

    // default: insert after current row or last row
    const insertAfter = currentRow
    const rows = table.rows + 1
    const newCells = []
    for (let r = 0; r < table.rows; r++) {
      const rowStart = r * cols
      newCells.push(...table.cells.slice(rowStart, rowStart + cols))
      if (r === insertAfter) {
        for (let c = 0; c < cols; c++) newCells.push({ id: crypto.randomUUID?.() || `${Date.now()}-${r}-${c}`, text: '', styles: { ...(table.cells[0]?.styles || {}) } })
      }
    }
    update({ rows, cells: newCells })
  }

  const removeRow = () => {
    if (table.rows <= 1) {
      openWarn('Removing the last row will delete the table. Do you want to proceed?', () => {
        try { dispatch({ type: 'DELETE_ELEMENT', id: table.id }) } catch {}
      })
      return
    }
    const cols = table.cols
    const info = typeof window !== 'undefined' ? window.currentEditingTableCell : null
    const currentRow = (info && info.id === table.id) ? Math.floor(info.cellIndex / cols) : (table.rows - 1)

    if (scope === 'cell' && info && info.id === table.id) {
      const targetRow = currentRow
      const rows = table.rows - 1
      const newCells = []
      for (let r = 0; r < table.rows; r++) {
        if (r === targetRow) continue
        const rowStart = r * cols
        newCells.push(...table.cells.slice(rowStart, rowStart + cols))
      }
      update({ rows, cells: newCells })
      const newFocusRow = Math.max(0, targetRow - 1)
      setTimeout(() => dispatchEditCell(Math.min(rows * cols - 1, newFocusRow * cols + (info.cellIndex % cols))), 0)
      return
    }

    const rows = table.rows - 1
    const newCells = table.cells.slice(0, rows * cols)
    update({ rows, cells: newCells })
  }

  const addCol = () => {
    const rows = table.rows
    const maxCols = Math.max(1, Math.floor((table.w || 0) / minCellW))
    if ((table.cols + 1) > maxCols) {
      openWarn(`Cannot add more columns. Reached the maximum for this table width (max ${maxCols}).`)
      return
    }
    const info = typeof window !== 'undefined' ? window.currentEditingTableCell : null
    const currentCol = (info && info.id === table.id) ? (info.cellIndex % table.cols) : (table.cols - 1)

    if (scope === 'cell' && info && info.id === table.id) {
      const insertAfter = currentCol
      const cols = table.cols + 1
      const newCells = []
      for (let r = 0; r < rows; r++) {
        const rowStart = r * table.cols
        for (let c = 0; c < table.cols; c++) {
          const idx = rowStart + c
          newCells.push(table.cells[idx])
if (c === insertAfter) newCells.push({ id: genId(), text: '', styles: { ...(table.cells[idx]?.styles || table.cells[0]?.styles || {}) } })
        }
      }
      update({ cols, cells: newCells })
      setTimeout(() => {
        const newCols = cols
        const row = Math.floor(info.cellIndex / (cols - 1))
        dispatchEditCell(row * newCols + (insertAfter + 1))
      }, 0)
      return
    }

    const insertAfter = currentCol
    const cols = table.cols + 1
    const newCells = []
    for (let r = 0; r < rows; r++) {
      const rowStart = r * table.cols
      for (let c = 0; c < table.cols; c++) {
        const idx = rowStart + c
        newCells.push(table.cells[idx])
        if (c === insertAfter) {
newCells.push({ id: genId(), text: '', styles: { ...(table.cells[idx]?.styles || table.cells[0]?.styles || {}) } })
        }
      }
    }
    update({ cols, cells: newCells })
  }

  const removeCol = () => {
    if (table.cols <= 1) {
      openWarn('Removing the last column will delete the table. Do you want to proceed?', () => {
        try { dispatch({ type: 'DELETE_ELEMENT', id: table.id }) } catch {}
      })
      return
    }
    const rows = table.rows
    const info = typeof window !== 'undefined' ? window.currentEditingTableCell : null
    const currentCol = (info && info.id === table.id) ? (info.cellIndex % table.cols) : (table.cols - 1)

    if (scope === 'cell' && info && info.id === table.id) {
      const targetCol = currentCol
      const cols = table.cols - 1
      const newCells = []
      for (let r = 0; r < rows; r++) {
        const rowStart = r * table.cols
        for (let c = 0; c < table.cols; c++) {
          if (c === targetCol) continue
          const idx = rowStart + c
          newCells.push(table.cells[idx])
        }
      }
      update({ cols, cells: newCells })
      setTimeout(() => {
        const row = Math.floor(info.cellIndex / (cols + 1))
        const newCol = Math.max(0, Math.min(cols - 1, targetCol - 1))
        dispatchEditCell(row * cols + newCol)
      }, 0)
      return
    }

    const cols = table.cols - 1
    const newCells = []
    for (let r = 0; r < rows; r++) {
      const rowStart = r * table.cols
      const rowCells = table.cells.slice(rowStart, rowStart + cols)
      newCells.push(...rowCells)
    }
    update({ cols, cells: newCells })
  }

  const Row = ({ label, children }) => (
    <div className="space-y-1">
      <div className="text-xs font-medium text-gray-600">{label}</div>
      {children}
    </div>
  )

  const [scope, setScope] = React.useState('cell') // 'cell' | 'header' | 'body'
  const [rowCount, setRowCount] = React.useState(1)
  const [colCount, setColCount] = React.useState(1)
  const [showOps, setShowOps] = React.useState(false)
  const [showHeaderDrop, setShowHeaderDrop] = React.useState(false)
  const [showColorsDrop, setShowColorsDrop] = React.useState(false)
  const opsBtnRef = React.useRef(null)
  const opsMenuRef = React.useRef(null)
  const [opsMenuPos, setOpsMenuPos] = React.useState(null) // {top,left,width}
  const [opsAnim, setOpsAnim] = React.useState(false)
  const [subPos, setSubPos] = React.useState(null) // {top,left}
  const [activeOp, setActiveOp] = React.useState(null) // 'addRow'|'removeRow'|'addCol'|'removeCol'|null
  const [warn, setWarn] = React.useState({ open: false, text: '', confirm: null })
  React.useEffect(() => {
    if (!showOps) return
    const sync = () => {
      const r = opsBtnRef.current?.getBoundingClientRect()
      if (r) setOpsMenuPos({ top: r.bottom + 8, left: r.left, width: r.width })
    }
    // ensure visible even if the open-time setTimeout didn't run
    const t = setTimeout(() => setOpsAnim(true), 0)
    sync()
    window.addEventListener('resize', sync)
    window.addEventListener('scroll', sync, true)
    const onDocDown = (e) => {
      const btn = opsBtnRef.current
      const menu = opsMenuRef.current
      const inBtn = btn && (btn === e.target || btn.contains(e.target))
      const inMenu = menu && (menu === e.target || menu.contains(e.target))
      if (!(inBtn || inMenu)) { setShowOps(false); setOpsAnim(false) }
    }
    document.addEventListener('mousedown', onDocDown)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', sync)
      window.removeEventListener('scroll', sync, true)
      document.removeEventListener('mousedown', onDocDown)
    }
  }, [showOps])
  const closeWarn = () => setWarn({ open: false, text: '', confirm: null })
  const openWarn = (text, confirm=null) => setWarn({ open: true, text, confirm })
  // Close sub popover on outside click / escape / scroll resize
  React.useEffect(() => {
    const onDown = (e) => {
      if (!activeOp) return
      // if click is inside a popover, ignore (we rely on stopPropagation via onPointerDown above)
      setActiveOp(null); setSubPos(null)
    }
    const onKey = (e) => { if (e.key === 'Escape') { setActiveOp(null); setSubPos(null) } }
    const onWin = () => { if (activeOp) { setActiveOp(null); setSubPos(null) } }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onWin)
    window.addEventListener('scroll', onWin, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onWin)
      window.removeEventListener('scroll', onWin, true)
    }
  }, [activeOp])

  const applyByScope = (stylesPatch) => {
    const idx = activeCellIndex()
    if (scope === 'cell' && idx !== null) return updateCellStyles(idx, stylesPatch)
    if (scope === 'header') return updateHeaderStyles(stylesPatch)
    if (scope === 'body') return updateBodyStyles(stylesPatch)
  }

  const toTitleCase = (s='') => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
  const transformText = (text='', mode='upper') => (mode==='upper'?text.toUpperCase():mode==='lower'?text.toLowerCase():toTitleCase(text))

  const transformCaseByScope = (mode /* 'upper'|'lower'|'title' */) => {
    const cols = table.cols
    const cells = table.cells.map((cell, idx) => {
      const inScope = scope==='cell' ? (idx === activeCellIndex()) : scope==='header' ? (idx < cols) : (idx >= cols)
      if (!inScope) return cell
      return { ...cell, text: transformText(cell.text || '', mode) }
    })
    update({ cells })
    // Live update active editing cell text if any
    try {
      const info = typeof window !== 'undefined' ? window.currentEditingTableCell : null
      if (info && info.id === table.id) {
        const c = cells[info.cellIndex]
        const el = document.getElementById(`table-cell-${c.id}`)
        if (el) el.textContent = c.text || ''
      }
    } catch {}
  }

  const addRowAt = (pos) => {
    const cols = table.cols
    const idx = activeCellIndex()
    const currentRow = (idx !== null) ? Math.floor(idx / cols) : (table.rows - 1)
    const insertAfter = pos === 'above' ? (currentRow - 1) : currentRow // allow -1 to mean prepend
    addRowsN(1, insertAfter)
  }
  const removeRowAt = (pos) => {
    if (table.rows <= 1) return removeRow()
    const target = pos === 'top' ? 0 : pos === 'bottom' ? (table.rows - 1) : (()=>{
      const cols = table.cols
      const idx = activeCellIndex()
      return (idx !== null) ? Math.floor(idx / cols) : 0
    })()
    // Remove specific row index
    const cols = table.cols
    const rows = table.rows - 1
    const newCells = []
    for (let r = 0; r < table.rows; r++) {
      if (r === target) continue
      const rowStart = r * cols
      newCells.push(...table.cells.slice(rowStart, rowStart + cols))
    }
    update({ rows, cells: newCells })
    setTimeout(() => dispatchEditCell(Math.max(0, Math.min(rows * cols - 1, target * cols))), 0)
  }
  const addColAt = (pos) => {
    const rows = table.rows
    const idx = activeCellIndex()
    const currentCol = (idx !== null) ? (idx % table.cols) : (table.cols - 1)
    const insertAfter = pos === 'left' ? (currentCol - 1) : currentCol // allow -1 to mean prepend at far left
    addColsN(1, insertAfter)
  }
  const removeColAt = (pos) => {
    if (table.cols <= 1) return removeCol()
    const rows = table.rows
    const tcol = pos === 'leftmost' ? 0 : pos === 'rightmost' ? (table.cols - 1) : (()=>{
      const idx = activeCellIndex()
      return (idx !== null) ? (idx % table.cols) : 0
    })()
    const cols = table.cols - 1
    const newCells = []
    for (let r = 0; r < rows; r++) {
      const rowStart = r * table.cols
      for (let c = 0; c < table.cols; c++) {
        if (c === tcol) continue
        const idx = rowStart + c
        newCells.push(table.cells[idx])
      }
    }
    update({ cols, cells: newCells })
    setTimeout(() => {
      const info = typeof window !== 'undefined' ? window.currentEditingTableCell : null
      const row = info && info.id === table.id ? Math.floor(info.cellIndex / (cols + 1)) : 0
      const newCol = Math.max(0, Math.min(cols - 1, tcol))
      dispatchEditCell(row * cols + newCol)
    }, 0)
  }

  const addRowsN = (n, insertAfter = null) => {
    if (!Number.isFinite(n) || n <= 0) return
    const cols = table.cols

    // Capture editing state BEFORE mutating rows so we can restore caret correctly
    const wasEditing = (() => {
      try {
        const info = typeof window !== 'undefined' ? window.currentEditingTableCell : null
        return (info && info.id === table.id && Number.isInteger(info.cellIndex)) ? info.cellIndex : null
      } catch { return null }
    })()

    const idx = activeCellIndex()
    const insertAfterCalc = (idx !== null)
      ? Math.floor(idx / cols)
      : (table.rows - 1)
    const whereParam = (insertAfter === null || insertAfter === undefined) ? insertAfterCalc : insertAfter

    const rows = table.rows + n
    const newCells = []

    const finalizeFocus = () => {
      if (wasEditing === null) return // only adjust caret if a cell was being edited
      const origRow = Math.floor(wasEditing / cols)
      const insertedAbove = (whereParam < 0) || (whereParam < origRow)
      const newIndex = insertedAbove ? (wasEditing + n * cols) : wasEditing
      setTimeout(() => dispatchEditCell(Math.min(rows * cols - 1, newIndex)), 0)
    }

    if (whereParam < 0) {
      // Prepend rows at the top (above first row)
      for (let k = 0; k < n; k++) {
        for (let c = 0; c < cols; c++) newCells.push({ id: genId(), text: '', styles: { ...(table.cells[0]?.styles || {}) } })
      }
      // then append all existing rows
      for (let r = 0; r < table.rows; r++) {
        const rowStart = r * cols
        newCells.push(...table.cells.slice(rowStart, rowStart + cols))
      }
      update({ rows, cells: newCells })
      finalizeFocus()
      return
    }

    const where = Math.max(0, Math.min(table.rows - 1, whereParam))
    for (let r = 0; r < table.rows; r++) {
      const rowStart = r * cols
      newCells.push(...table.cells.slice(rowStart, rowStart + cols))
      if (r === where) {
        for (let k = 0; k < n; k++) {
          for (let c = 0; c < cols; c++) newCells.push({ id: genId(), text: '', styles: { ...(table.cells[0]?.styles || {}) } })
        }
      }
    }
    update({ rows, cells: newCells })
    finalizeFocus()
  }

  const addColsN = (n, insertAfter=null) => {
    if (!Number.isFinite(n) || n <= 0) return
    const rows = table.rows

    // Capture editing state before mutation to keep caret on the same logical cell
    const wasEditing = (() => {
      try {
        const info = typeof window !== 'undefined' ? window.currentEditingTableCell : null
        return (info && info.id === table.id && Number.isInteger(info.cellIndex)) ? info.cellIndex : null
      } catch { return null }
    })()

    const idx = activeCellIndex()
    const insertAfterCalc = (idx !== null)
      ? (idx % table.cols)
      : (table.cols - 1)
    const whereParam = (insertAfter === null || insertAfter === undefined) ? insertAfterCalc : insertAfter

    const cols = table.cols + n
    const newCells = []

    const finalizeFocus = () => {
      if (wasEditing === null) return
      const origRow = Math.floor(wasEditing / (cols - n)) // original cols before update
      const origCol = wasEditing % (cols - n)
      const insertedLeft = (whereParam < 0) || (whereParam < origCol)
      const newCol = insertedLeft ? (origCol + n) : origCol
      const newIndex = origRow * cols + newCol
      setTimeout(() => dispatchEditCell(Math.min(rows * cols - 1, newIndex)), 0)
    }

    if (whereParam < 0) {
      // Prepend new columns at the far left
      for (let r = 0; r < rows; r++) {
        // new cells first
        for (let k = 0; k < n; k++) newCells.push({ id: genId(), text: '', styles: { ...(table.cells[r * table.cols]?.styles || table.cells[0]?.styles || {}) } })
        // then existing row cells
        const rowStart = r * table.cols
        for (let c = 0; c < table.cols; c++) newCells.push(table.cells[rowStart + c])
      }
      update({ cols, cells: newCells })
      finalizeFocus()
      return
    }

    const where = Math.max(0, Math.min(table.cols - 1, whereParam))
    for (let r = 0; r < rows; r++) {
      const rowStart = r * table.cols
      for (let c = 0; c < table.cols; c++) {
        const idxCell = rowStart + c
        newCells.push(table.cells[idxCell])
        if (c === where) {
          for (let k = 0; k < n; k++) newCells.push({ id: genId(), text: '', styles: { ...(table.cells[idxCell]?.styles || table.cells[0]?.styles || {}) } })
        }
      }
    }
    update({ cols, cells: newCells })
    finalizeFocus()
  }

  return (
    <div className="space-y-4 overflow-x-hidden" onMouseDown={holdEditing}>
      <h3 className="font-semibold text-lg">Table Style</h3>

      <Row label="Structure">
        <div className="relative" onMouseDown={holdEditing}>
          <button
            ref={opsBtnRef}
            onMouseDown={(e)=>{ 
              holdEditing(); 
              e.preventDefault(); 
              setShowOps((prev) => {
                const next = !prev
                const r = opsBtnRef.current?.getBoundingClientRect()
                if (r) setOpsMenuPos({ top: r.bottom + 8, left: r.left, width: r.width })
                if (!next) setOpsAnim(false)
                return next
              })
            }}
            className="px-3 py-2 rounded-lg border bg-white/70 backdrop-blur-sm shadow-sm text-sm flex items-center gap-2 w-full hover:shadow-md transition-all duration-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.6 15a1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 3.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.04 3.3l.06.06A1.65 1.65 0 0 0 8 3.6 1.65 1.65 0 0 0 9 2.09V2a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 3.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20.4 8c0 .62.24 1.2.6 1.64V9.7a2 2 0 1 1 0 4 v-.06A1.65 1.65 0 0 0 19.4 15z"/></svg>
            Rows / Columns
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
          </button>
          {showOps && (
            <div
              ref={opsMenuRef}
              className={`absolute z-[1000] ${opsAnim ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'} transition-all duration-150 ease-out`}
              style={{ top: 'calc(100% + 8px)', left: 0, width: opsMenuPos?.width || '100%' }}
            >
              <div className="w-full bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl p-2 space-y-2">
                <div className="text-[11px] uppercase tracking-wide text-gray-500 px-2">Quick actions</div>
                <button type="button" title="Insert a row relative to current cell" onPointerDown={(e)=>{ e.preventDefault(); e.stopPropagation(); holdEditing(); setActiveOp('addRow'); const r=e.currentTarget.getBoundingClientRect(); setSubPos({top:r.bottom+6,left:r.left}); }} onMouseDown={holdEditing} className="w-full text-left px-2 py-2 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-700">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                  </span>
                  <span className="flex-1">Add row</span>
                  <span className="text-[11px] text-gray-400">above / below</span>
                </button>
                <button type="button" title="Remove a row" onPointerDown={(e)=>{ e.preventDefault(); e.stopPropagation(); holdEditing(); setActiveOp('removeRow'); const r=e.currentTarget.getBoundingClientRect(); setSubPos({top:r.bottom+6,left:r.left}); }} onMouseDown={holdEditing} className="w-full text-left px-2 py-2 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rose-100 text-rose-700">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14"/></svg>
                  </span>
                  <span className="flex-1">Remove row</span>
                  <span className="text-[11px] text-gray-400">top / current / bottom</span>
                </button>
                <button type="button" title="Insert a column relative to current cell" onPointerDown={(e)=>{ e.preventDefault(); e.stopPropagation(); holdEditing(); setActiveOp('addCol'); const r=e.currentTarget.getBoundingClientRect(); setSubPos({top:r.bottom+6,left:r.left}); }} onMouseDown={holdEditing} className="w-full text-left px-2 py-2 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-700">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                  </span>
                  <span className="flex-1">Add column</span>
                  <span className="text-[11px] text-gray-400">left / right</span>
                </button>
                <button type="button" title="Remove a column" onPointerDown={(e)=>{ e.preventDefault(); e.stopPropagation(); holdEditing(); setActiveOp('removeCol'); const r=e.currentTarget.getBoundingClientRect(); setSubPos({top:r.bottom+6,left:r.left}); }} onMouseDown={holdEditing} className="w-full text-left px-2 py-2 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rose-100 text-rose-700">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14"/></svg>
                  </span>
                  <span className="flex-1">Remove column</span>
                  <span className="text-[11px] text-gray-400">leftmost / current / rightmost</span>
                </button>
                <div className="h-px bg-gray-200" />
                <div className="text-[11px] uppercase tracking-wide text-gray-500 px-2">Bulk insert</div>
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <label className="text-xs text-gray-600">Rows</label>
                  <input onMouseDown={holdEditing} type="number" min="1" value={rowCount} onChange={(e)=>setRowCount(Math.max(1, parseInt(e.target.value||'1',10)))} className="w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                  <button type="button" title="Insert N rows after current row (or end)" onPointerDown={(e)=>{ e.preventDefault(); e.stopPropagation(); holdEditing(); addRowsN(rowCount) }} onMouseDown={holdEditing} className="px-2 py-1 rounded-md border hover:bg-gray-50 inline-flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                    <span>Add</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <label className="text-xs text-gray-600">Columns</label>
                  <input onMouseDown={holdEditing} type="number" min="1" value={colCount} onChange={(e)=>setColCount(Math.max(1, parseInt(e.target.value||'1',10)))} className="w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                  <button type="button" title="Insert N columns after current column (or end)" onPointerDown={(e)=>{ e.preventDefault(); e.stopPropagation(); holdEditing(); addColsN(colCount) }} onMouseDown={holdEditing} className="px-2 py-1 rounded-md border hover:bg-gray-50 inline-flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
)}
</div>
{(activeOp && subPos) ? createPortal(
  <div className="fixed z-[1000] bg-white border border-gray-200 rounded-md shadow-lg p-2 transform transition-all duration-150 ease-out opacity-100 scale-100" style={{ top: subPos.top, left: subPos.left, minWidth: '220px' }} onMouseDown={holdEditing}>
    {activeOp === 'addRow' && (
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="px-2 py-2 rounded-md border hover:bg-gray-50 text-xs flex items-center gap-2" onPointerDown={(e)=>{e.preventDefault();e.stopPropagation();holdEditing(); addRowAt('above'); setActiveOp(null); setSubPos(null)}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4l-4 4M12 4l4 4M12 4v12"/></svg>
          <span>Above current</span>
        </button>
        <button type="button" className="px-2 py-2 rounded-md border hover:bg-gray-50 text-xs flex items-center gap-2" onPointerDown={(e)=>{e.preventDefault();e.stopPropagation();holdEditing(); addRowAt('below'); setActiveOp(null); setSubPos(null)}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20l-4-4M12 20l4-4M12 8v12"/></svg>
          <span>Below current</span>
        </button>
      </div>
    )}
    {activeOp === 'removeRow' && (
      <div className="grid grid-cols-3 gap-2">
        <button type="button" className="px-2 py-2 rounded-md border hover:bg-gray-50 text-xs flex items-center gap-2" onPointerDown={(e)=>{e.preventDefault();e.stopPropagation();holdEditing(); removeRowAt('top'); setActiveOp(null); setSubPos(null)}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 12h12"/></svg>
          <span>Top</span>
        </button>
        <button type="button" className="px-2 py-2 rounded-md border hover:bg-gray-50 text-xs flex items-center gap-2" onPointerDown={(e)=>{e.preventDefault();e.stopPropagation();holdEditing(); removeRowAt('current'); setActiveOp(null); setSubPos(null)}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="2"/><path d="M6 12h12"/></svg>
          <span>Current</span>
        </button>
        <button type="button" className="px-2 py-2 rounded-md border hover:bg-gray-50 text-xs flex items-center gap-2" onPointerDown={(e)=>{e.preventDefault();e.stopPropagation();holdEditing(); removeRowAt('bottom'); setActiveOp(null); setSubPos(null)}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 12h12"/></svg>
          <span>Bottom</span>
        </button>
      </div>
    )}
    {activeOp === 'addCol' && (
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="px-2 py-2 rounded-md border hover:bg-gray-50 text-xs flex items-center gap-2" onPointerDown={(e)=>{e.preventDefault();e.stopPropagation();holdEditing(); addColAt('left'); setActiveOp(null); setSubPos(null)}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12l4-4M4 12l4 4M4 12h12"/></svg>
          <span>Left of current</span>
        </button>
        <button type="button" className="px-2 py-2 rounded-md border hover:bg-gray-50 text-xs flex items-center gap-2" onPointerDown={(e)=>{e.preventDefault();e.stopPropagation();holdEditing(); addColAt('right'); setActiveOp(null); setSubPos(null)}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 12l-4-4M20 12l-4 4M20 12H8"/></svg>
          <span>Right of current</span>
        </button>
      </div>
    )}
    {activeOp === 'removeCol' && (
      <div className="grid grid-cols-3 gap-2">
        <button type="button" className="px-2 py-2 rounded-md border hover:bg-gray-50 text-xs flex items-center gap-2" onPointerDown={(e)=>{e.preventDefault();e.stopPropagation();holdEditing(); removeColAt('leftmost'); setActiveOp(null); setSubPos(null)}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 12h12"/></svg>
          <span>Leftmost</span>
        </button>
        <button type="button" className="px-2 py-2 rounded-md border hover:bg-gray-50 text-xs flex items-center gap-2" onPointerDown={(e)=>{e.preventDefault();e.stopPropagation();holdEditing(); removeColAt('current'); setActiveOp(null); setSubPos(null)}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="2"/><path d="M6 12h12"/></svg>
          <span>Current</span>
        </button>
        <button type="button" className="px-2 py-2 rounded-md border hover:bg-gray-50 text-xs flex items-center gap-2" onPointerDown={(e)=>{e.preventDefault();e.stopPropagation();holdEditing(); removeColAt('rightmost'); setActiveOp(null); setSubPos(null)}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 12h12"/></svg>
          <span>Rightmost</span>
        </button>
      </div>
    )}
  </div>, document.body)
: null}
        
        <div className="text-xs text-gray-600 mt-2">{table.rows} × {table.cols}</div>
      </Row>

      <Row label="Format">
        {/* Line 1: text styles & case transforms */}
        <div className="flex items-center gap-1 flex-wrap">
          <button onMouseDown={holdEditing} className="px-2 py-1 rounded border" title="Bold" onClick={()=>applyByScope({ bold: true })}>B</button>
          <button onMouseDown={holdEditing} className="px-2 py-1 rounded border" title="Italic" onClick={()=>applyByScope({ italic: true })}><span style={{fontStyle:'italic'}}>I</span></button>
          <button onMouseDown={holdEditing} className="px-2 py-1 rounded border" title="Underline" onClick={()=>applyByScope({ underline: true })}><span style={{textDecoration:'underline'}}>U</span></button>
          <button onMouseDown={holdEditing} className="px-2 py-1 rounded border" title="UPPERCASE" onClick={()=>transformCaseByScope('upper')}>Aa</button>
          <button onMouseDown={holdEditing} className="px-2 py-1 rounded border" title="lowercase" onClick={()=>transformCaseByScope('lower')}>aa</button>
          <button onMouseDown={holdEditing} className="px-2 py-1 rounded border" title="Title Case" onClick={()=>transformCaseByScope('title')}>Ab</button>
        </div>
        {/* Line 2: font family, font size, horizontal & vertical alignment dropdowns */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <select onMouseDown={holdEditing} className="mini-toolbar-dropdown border rounded px-2 py-1" defaultValue={table.cells[0]?.styles?.fontFamily || 'Inter, system-ui, sans-serif'} onChange={(e)=>applyByScope({ fontFamily: e.target.value })}>
            <option value="Inter, system-ui, sans-serif">Inter</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="'Times New Roman', serif">Times New Roman</option>
            <option value="'Courier New', monospace">Courier New</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Verdana, sans-serif">Verdana</option>
          </select>
          <input onMouseDown={holdEditing} type="number" min="8" max="120" className="w-20 px-2 py-1 border rounded" defaultValue={table.cells[0]?.styles?.fontSize || 14} onChange={(e)=>applyByScope({ fontSize: Number(e.target.value)||14 })} />
          <select onMouseDown={holdEditing} className="mini-toolbar-dropdown border rounded px-2 py-1" defaultValue={table.cells[0]?.styles?.align || 'center'} onChange={(e)=>applyByScope({ align: e.target.value })}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
          <select onMouseDown={holdEditing} className="mini-toolbar-dropdown border rounded px-2 py-1" defaultValue={table.cells[0]?.styles?.valign || 'middle'} onChange={(e)=>applyByScope({ valign: e.target.value })}>
            <option value="top">Top</option>
            <option value="middle">Middle</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
        {/* Line 3: header toggle under alignment */}
        <div className="mt-2">
          <label className="flex items-center gap-2">
            <input onMouseDown={holdEditing} type="checkbox" checked={!!table.headerRow} onChange={(e)=>update({ headerRow: e.target.checked })} />
            <span className="text-sm">Enable header row</span>
          </label>
        </div>
      </Row>

      {/* Header combined dropdown */}
      <Row label="Header styles">
        <div className="relative">
          <button onMouseDown={holdEditing} className="px-3 py-1.5 rounded border bg-white shadow-sm text-sm flex items-center gap-2" onClick={()=>setShowHeaderDrop(v=>!v)}>
            <span className="inline-block w-4 h-4 rounded" style={{ background: table.headerBg || '#f3f4f6' }} />
            <span className="inline-block w-4 h-4 rounded" style={{ background: table.headerTextColor || '#111827' }} />
            Header styles
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
          </button>
          {showHeaderDrop && (
            <div onMouseDown={holdEditing} className="absolute z-10 mt-2 right-0 w-64 p-3 rounded-lg border dropdown-panel bg-white">
              <div className="text-xs text-gray-600 mb-1">Header background</div>
              <input onMouseDown={holdEditing} type="color" value={table.headerBg || '#f3f4f6'} onChange={(e)=>update({ headerBg: e.target.value })} className="w-full h-10 rounded border bg-white/80" />
              <div className="text-xs text-gray-600 mt-3 mb-1">Header text color</div>
              <input onMouseDown={holdEditing} type="color" value={table.headerTextColor || '#111827'} onChange={(e)=>update({ headerTextColor: e.target.value })} className="w-full h-10 rounded border bg-white/80" />
            </div>
          )}
        </div>
      </Row>

      {/* Colors combined dropdown */}
      <Row label="Colors">
        <div className="relative">
          <button onMouseDown={holdEditing} className="px-3 py-1.5 rounded border bg-white shadow-sm text-sm flex items-center gap-2" onClick={()=>setShowColorsDrop(v=>!v)}>
            <span className="inline-block w-4 h-4 rounded" style={{ background: (activeCellIndex() !== null && table.cells[activeCellIndex()]?.styles?.bgColor) || table.cellBg || '#ffffff' }} />
            <span className="inline-block w-4 h-4 rounded" style={{ background: table.borderColor || '#000000' }} />
            Cell / Border
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
          </button>
          {showColorsDrop && (
            <div onMouseDown={holdEditing} className="absolute z-10 mt-2 right-0 w-64 p-3 rounded-lg border dropdown-panel bg-white">
              <div className="text-xs text-gray-600 mb-1">Cell background</div>
              <input
                onMouseDown={holdEditing}
                type="color"
                value={(activeCellIndex() !== null && table.cells[activeCellIndex()]?.styles?.bgColor) || table.cellBg || '#ffffff'}
                onChange={(e)=>{
                  const idx = activeCellIndex()
                  if (scope==='cell' && idx !== null) updateCellStyles(idx, { bgColor: e.target.value })
                  else if (scope==='header') updateHeaderStyles({ bgColor: e.target.value })
                  else updateBodyStyles({ bgColor: e.target.value })
                }}
                className="w-full h-10 rounded border bg-white/80"
              />
              <div className="text-xs text-gray-600 mt-3 mb-1">Border color</div>
              <input onMouseDown={holdEditing} type="color" value={table.borderColor || '#000000'} onChange={(e)=>update({ borderColor: e.target.value })} className="w-full h-10 rounded border bg-white/80" />
            </div>
          )}
        </div>
      </Row>

      <div className="pt-3 border-t border-gray-200">
        <div className="text-xs font-medium text-gray-600 mb-2">Apply styles to</div>
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1"><input type="radio" name="tbl-scope" checked={scope==='cell'} onChange={()=>setScope('cell')} /> cell</label>
          <label className="flex items-center gap-1"><input type="radio" name="tbl-scope" checked={scope==='header'} onChange={()=>setScope('header')} /> header rows</label>
          <label className="flex items-center gap-1"><input type="radio" name="tbl-scope" checked={scope==='body'} onChange={()=>setScope('body')} /> body rows</label>
        </div>
      </div>

      {/* Sticky bottom tip */}
      <div className="sticky bottom-0 pt-2 mt-4 bg-gradient-to-t from-white/80 to-transparent backdrop-blur-sm">
        <div className="text-xs text-gray-600">
          Tip: Choose the scope (cell/header/body). Header and body styles are independent and only apply when you select them explicitly
        </div>
      </div>

      {/* Lightweight warn modal */}
      {warn.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(0,0,0,0.35)'}} onMouseDown={(e)=>{ e.stopPropagation(); }}>
          <div className="bg-white rounded-lg shadow-xl border p-4 w-80">
            <div className="text-sm text-gray-800">{warn.text}</div>
            <div className="mt-3 flex justify-end gap-2">
              <button className="px-3 py-1.5 rounded border" onClick={()=>closeWarn()}>Cancel</button>
              {warn.confirm && <button className="px-3 py-1.5 rounded bg-black text-white" onClick={()=>{ try { warn.confirm() } catch {}; closeWarn() }}>Proceed</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
