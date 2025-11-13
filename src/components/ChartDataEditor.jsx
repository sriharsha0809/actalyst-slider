import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * ChartDataEditor - Simplified version that WORKS
 * Direct implementation without animation complexity
 */
export default function ChartDataEditor({ 
  isOpen, 
  data, 
  onDataChange, 
  onApply, 
  onClose, 
  anchor = { x: 120, y: 80 } 
}) {
  const [pos, setPos] = useState(anchor)
  const [size, setSize] = useState({ width: 700, height: 450 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  const [grid, setGrid] = useState([])
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')

  // Initialize grid only when opening
  useEffect(() => {
    if (isOpen && data && grid.length === 0) {
      const newGrid = dataToGrid(data)
      setGrid(newGrid)
      console.log('[ChartDataEditor] Grid initialized:', newGrid)
    }
  }, [isOpen])

  // Reset grid when closing
  useEffect(() => {
    if (!isOpen) {
      setGrid([])
      setEditingCell(null)
    }
  }, [isOpen])

  useEffect(() => {
    setPos(anchor)
  }, [anchor])

  // Start dragging
  const handleMouseDownHeader = (e) => {
    console.log('[ChartDataEditor] Mouse down on header')
    setIsDragging(true)
    setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y })
    e.preventDefault()
    e.stopPropagation()
  }

  // Start resizing
  const handleMouseDownResize = (e) => {
    console.log('[ChartDataEditor] Mouse down on resize handle')
    setIsResizing(true)
    setDragStart({ x: e.clientX, y: e.clientY, w: size.width, h: size.height })
    e.preventDefault()
    e.stopPropagation()
  }

  // Handle mouse move
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPos({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    } else if (isResizing) {
      const newWidth = Math.max(500, dragStart.w + (e.clientX - dragStart.x))
      const newHeight = Math.max(350, dragStart.h + (e.clientY - dragStart.y))
      setSize({ width: newWidth, height: newHeight })
    }
  }

  // Handle mouse up
  const handleMouseUp = () => {
    if (isDragging) {
      console.log('[ChartDataEditor] Drag ended')
      setIsDragging(false)
    }
    if (isResizing) {
      console.log('[ChartDataEditor] Resize ended')
      setIsResizing(false)
    }
  }

  // Add global mouse listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, dragStart, pos, size])

  // Edit cell
  const startEdit = (row, col) => {
    if (row === 0 && col === 0) return
    console.log('[ChartDataEditor] Start editing cell:', row, col)
    setEditingCell({ row, col })
    setEditValue(String(grid[row][col]))
  }

  const saveEdit = () => {
    if (editingCell) {
      const { row, col } = editingCell
      const newValue = row === 0 || col === 0 ? editValue : (Number(editValue) || 0)
      console.log('[ChartDataEditor] Saving value:', newValue)
      
      const newGrid = grid.map((r, ri) => 
        ri === row ? r.map((c, ci) => ci === col ? newValue : c) : r
      )
      setGrid(newGrid)
      setEditingCell(null)
      
      const chartData = gridToData(newGrid)
      onDataChange?.(chartData)
    }
  }

  const cancelEdit = () => {
    setEditingCell(null)
  }

  // Add/remove rows/columns
  const addColumn = () => {
    const newGrid = grid.map((row, ri) => 
      ri === 0 ? [...row, `Series ${row.length}`] : [...row, 0]
    )
    setGrid(newGrid)
    onDataChange?.(gridToData(newGrid))
  }

  const addRow = () => {
    const cols = grid[0]?.length || 1
    const newRow = Array.from({ length: cols }, (_, i) => 
      i === 0 ? `Cat ${grid.length}` : 0
    )
    setGrid([...grid, newRow])
    onDataChange?.(gridToData([...grid, newRow]))
  }

  const removeColumn = () => {
    if (grid[0]?.length <= 2) return
    const newGrid = grid.map(row => row.slice(0, -1))
    setGrid(newGrid)
    onDataChange?.(gridToData(newGrid))
  }

  const removeRow = () => {
    if (grid.length <= 2) return
    const newGrid = grid.slice(0, -1)
    setGrid(newGrid)
    onDataChange?.(gridToData(newGrid))
  }

  // Early return after all hooks are called
  if (!isOpen) {
    console.log('[ChartDataEditor] Returning null (closed)')
    return null
  }

  console.log('[ChartDataEditor] Rendering editor, grid:', grid)

  const content = (
    <>
      {/* Fullscreen backdrop to ensure we're on top and to intercept clicks behind */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.08)',
          zIndex: 2147483646,
          pointerEvents: 'auto'
        }}
        onMouseDown={(e) => { console.log('[ChartDataEditor] Backdrop mousedown'); e.stopPropagation() }}
        onClick={(e) => { console.log('[ChartDataEditor] Backdrop clicked'); e.stopPropagation() }}
      />

      {/* The spreadsheet window */}
      <div
        style={{
          position: 'fixed',
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          zIndex: 2147483647,
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: '1px solid #d1d5db',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pointerEvents: 'auto'
        }}
        ref={containerRef}
        onMouseDown={(e) => { console.log('[ChartDataEditor] Container mouse down'); e.stopPropagation() }}
        onClick={(e) => { console.log('[ChartDataEditor] Container clicked'); e.stopPropagation() }}
      >
      {/* TEST: Red bar to confirm rendering */}
      <div style={{ 
        position: 'absolute', 
        top: '-20px', 
        left: 0, 
        right: 0, 
        height: '20px', 
        backgroundColor: 'red', 
        color: 'white', 
        textAlign: 'center',
        fontSize: '12px',
        pointerEvents: 'none'
      }}>
        SPREADSHEET RENDERED - CAN YOU SEE THIS?
      </div>

      {/* Header */}
      <div
        style={{
          padding: '10px 16px',
          background: 'linear-gradient(to bottom, #f9fafb, #f3f4f6)',
          borderBottom: '1px solid #d1d5db',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onMouseDown={handleMouseDownHeader}
        onClickCapture={() => console.log('[ChartDataEditor] Header clicked!')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose?.()
            }}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#ff5f56',
              border: 'none',
              cursor: 'pointer'
            }}
          />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Chart Data</span>
        </div>
        <button
          onClick={() => onApply?.(gridToData(grid))}
          style={{
            padding: '6px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Done
        </button>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {grid.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => {
                  const isHeader = ri === 0 || ci === 0
                  const isCorner = ri === 0 && ci === 0
                  const isEditing = editingCell?.row === ri && editingCell?.col === ci

                  return (
                    <td
                      key={`${ri}-${ci}`}
                      onClick={(e) => {
                        console.log('[ChartDataEditor] Cell clicked:', ri, ci)
                        e.stopPropagation()
                        if (!isCorner) startEdit(ri, ci)
                      }}
                      onMouseDown={(e) => {
                        console.log('[ChartDataEditor] Cell mouse down:', ri, ci)
                        e.stopPropagation()
                      }}
                      style={{
                        border: '1px solid #d1d5db',
                        padding: '0',
                        minWidth: '100px',
                        height: '36px',
                        backgroundColor: isCorner ? '#f3f4f6' : isHeader ? '#f9fafb' : 'white',
                        cursor: isCorner ? 'default' : 'pointer',
                        fontWeight: isHeader ? 600 : 400,
                        fontSize: '14px',
                        color: '#374151',
                        textAlign: 'center',
                        pointerEvents: 'auto'
                      }}
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit()
                            if (e.key === 'Escape') cancelEdit()
                          }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #3b82f6',
                            padding: '8px',
                            fontSize: '14px',
                            textAlign: 'center',
                            outline: 'none'
                          }}
                        />
                      ) : (
                        <div style={{ padding: '8px' }}>{cell}</div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #d1d5db',
          background: '#f9fafb',
          display: 'flex',
          gap: '8px',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={addColumn}
            style={{
              padding: '6px 12px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            + Column
          </button>
          <button
            onClick={addRow}
            style={{
              padding: '6px 12px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            + Row
          </button>
          <button
            onClick={removeColumn}
            disabled={grid[0]?.length <= 2}
            style={{
              padding: '6px 12px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: grid[0]?.length <= 2 ? 'not-allowed' : 'pointer',
              opacity: grid[0]?.length <= 2 ? 0.5 : 1
            }}
          >
            − Column
          </button>
          <button
            onClick={removeRow}
            disabled={grid.length <= 2}
            style={{
              padding: '6px 12px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: grid.length <= 2 ? 'not-allowed' : 'pointer',
              opacity: grid.length <= 2 ? 0.5 : 1
            }}
          >
            − Row
          </button>
        </div>
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDownResize}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '16px',
          height: '16px',
          cursor: 'se-resize',
          background: 'linear-gradient(135deg, transparent 50%, #9ca3af 50%)'
        }}
      />
    </div>
    </>
  )

  // Get or create portal container
  const portalRoot = document.getElementById('portal-root') || document.body
  
  console.log('[ChartDataEditor] Portal target:', portalRoot, 'isOpen:', isOpen)
  console.log('[ChartDataEditor] Portal target exists:', !!portalRoot)
  console.log('[ChartDataEditor] Content is:', content)
  console.log('[ChartDataEditor] Grid has', grid.length, 'rows')
  
  // TEMPORARY TEST: Skip portal and return content directly
  return content
  
  // return createPortal(content, portalRoot)
}

// Helper functions
function dataToGrid(data) {
  const categories = data?.categories || ['Q1', 'Q2', 'Q3']
  const series = data?.series || [{ name: 'Sales', data: [100, 200, 150] }]
  
  const grid = []
  const headerRow = ['', ...series.map(s => s.name)]
  grid.push(headerRow)
  
  for (let r = 0; r < categories.length; r++) {
    const row = [categories[r]]
    for (let c = 0; c < series.length; c++) {
      row.push(series[c].data[r] ?? 0)
    }
    grid.push(row)
  }
  
  return grid
}

function gridToData(grid) {
  if (!grid || grid.length < 2 || grid[0].length < 2) {
    return { categories: ['Q1'], series: [{ name: 'Series 1', data: [0] }] }
  }
  
  const categories = []
  const series = []
  
  for (let c = 1; c < grid[0].length; c++) {
    series.push({ name: String(grid[0][c]), data: [] })
  }
  
  for (let r = 1; r < grid.length; r++) {
    categories.push(String(grid[r][0]))
    for (let c = 1; c < grid[r].length; c++) {
      const val = Number(grid[r][c])
      series[c - 1].data.push(Number.isFinite(val) ? val : 0)
    }
  }
  
  return { categories, series }
}
