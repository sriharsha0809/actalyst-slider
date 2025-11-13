import React, { useState, useEffect, useRef } from 'react'
// import Draggable from 'react-draggable'

/**
 * SimpleChartEditor - Basic spreadsheet-style chart data editor
 * Renders directly in the DOM (not via portal) to avoid rendering issues
 */
export default function SimpleChartEditor({ 
  isOpen, 
  chartType,
  chartData, 
  onDataChange,
  onClose
}) {
  const [grid, setGrid] = useState([])
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [size, setSize] = useState({ width: 600, height: 400 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 })
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 })
  const nodeRef = useRef(null)

  // Initialize position to center
  useEffect(() => {
    if (isOpen && position.x === 0 && position.y === 0) {
      setPosition({
        x: (window.innerWidth - size.width) / 2,
        y: (window.innerHeight - size.height) / 2
      })
    }
  }, [isOpen, size.width, size.height])

  // Initialize grid when opened
  useEffect(() => {
    if (isOpen && chartData) {
      const newGrid = dataToGrid(chartData, chartType)
      setGrid(newGrid)
      console.log('[SimpleChartEditor] Grid initialized:', newGrid)
    }
  }, [isOpen, chartData, chartType])

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (editingCell) {
          setEditingCell(null)
        } else {
          onClose?.()
        }
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, editingCell, onClose])

  const startEdit = (row, col) => {
    if (row === 0 && col === 0) return
    setEditingCell({ row, col })
    setEditValue(String(grid[row]?.[col] || ''))
  }

  const saveEdit = () => {
    if (!editingCell) return
    const { row, col } = editingCell
    const isHeader = row === 0 || col === 0
    const newValue = isHeader ? editValue : (Number(editValue) || 0)
    
    const newGrid = grid.map((r, ri) => 
      ri === row ? r.map((c, ci) => ci === col ? newValue : c) : [...r]
    )
    
    setGrid(newGrid)
    setEditingCell(null)
    
    const chartData = gridToData(newGrid, chartType)
    onDataChange?.(chartData)
  }

  const addRow = () => {
    const cols = grid[0]?.length || 2
    const newRow = Array.from({ length: cols }, (_, i) => i === 0 ? `Item ${grid.length}` : 0)
    const newGrid = [...grid, newRow]
    setGrid(newGrid)
    onDataChange?.(gridToData(newGrid, chartType))
  }

  const addColumn = () => {
    // Disallow adding columns for pie charts (only Category | Value allowed)
    if (chartType === 'pie') return
    const newGrid = grid.map((row, ri) => 
      ri === 0 ? [...row, `Series ${row.length}`] : [...row, 0]
    )
    setGrid(newGrid)
    onDataChange?.(gridToData(newGrid, chartType))
  }

  const removeRow = () => {
    if (grid.length <= 2) return
    const newGrid = grid.slice(0, -1)
    setGrid(newGrid)
    onDataChange?.(gridToData(newGrid, chartType))
  }

  const removeColumn = () => {
    // Disallow removing columns for pie charts (must keep 2 columns)
    if (chartType === 'pie') return
    if (grid[0]?.length <= 2) return
    const newGrid = grid.map(row => row.slice(0, -1))
    setGrid(newGrid)
    onDataChange?.(gridToData(newGrid, chartType))
  }

  // Drag handlers
  const handleDragStart = (e) => {
    e.stopPropagation()
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: position.x,
      startY: position.y
    }
  }

  // Resize handlers
  const handleResizeStart = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setIsResizing(true)
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    }
  }

  useEffect(() => {
    if (!isDragging && !isResizing) return

    const handleMouseMove = (e) => {
      if (isDragging) {
        const dx = e.clientX - dragStartRef.current.x
        const dy = e.clientY - dragStartRef.current.y
        setPosition({
          x: dragStartRef.current.startX + dx,
          y: dragStartRef.current.startY + dy
        })
      } else if (isResizing) {
        const dx = e.clientX - resizeStartRef.current.x
        const dy = e.clientY - resizeStartRef.current.y
        setSize({
          width: Math.max(400, resizeStartRef.current.width + dx),
          height: Math.max(300, resizeStartRef.current.height + dy)
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing])

  if (!isOpen) return null

  console.log('[SimpleChartEditor] Rendering with grid:', grid)

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99998,
          backgroundColor: 'rgba(0,0,0,0.2)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        }}
        onClick={onClose}
      />

      {/* Spreadsheet Window - Draggable */}
      <div
        ref={nodeRef}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 99999
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Draggable */}
        <div 
          className="drag-handle"
          onMouseDown={handleDragStart}
          style={{
            padding: '12px 16px',
            background: 'linear-gradient(to bottom, #f9f9f9, #f5f5f5)',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#ff5f57',
                border: 'none',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>
              Edit Chart Data
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase' }}>
            {chartType} Chart
          </span>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
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
                        onClick={() => !isCorner && startEdit(ri, ci)}
                        style={{
                          border: '1px solid #e5e5e5',
                          padding: '8px 12px',
                          height: '36px',
                          minWidth: ci === 0 ? '120px' : '80px',
                          backgroundColor: isCorner ? '#fafafa' : isHeader ? '#f9f9f9' : '#fff',
                          fontWeight: isHeader ? 600 : 400,
                          color: isHeader ? '#555' : '#333',
                          cursor: isCorner ? 'default' : 'pointer',
                          textAlign: ci === 0 ? 'left' : 'center'
                        }}
                      >
                        {isEditing ? (
                          <input
                            autoFocus
                            type={isHeader ? 'text' : 'number'}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit()
                              if (e.key === 'Escape') setEditingCell(null)
                            }}
                            style={{
                              width: '100%',
                              border: '2px solid #007aff',
                              padding: '4px 8px',
                              fontSize: '13px',
                              outline: 'none'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          cell
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
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #ddd',
          background: '#f9f9f9',
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={addRow}
            style={{
              padding: '6px 12px',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            + Row
          </button>
          <button
            onClick={addColumn}
            disabled={chartType === 'pie'}
            style={{
              padding: '6px 12px',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: chartType === 'pie' ? 'not-allowed' : 'pointer',
              opacity: chartType === 'pie' ? 0.4 : 1
            }}
          >
            + Column
          </button>
          <button
            onClick={removeRow}
            disabled={grid.length <= 2}
            style={{
              padding: '6px 12px',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: grid.length <= 2 ? 'not-allowed' : 'pointer',
              opacity: grid.length <= 2 ? 0.4 : 1
            }}
          >
            − Row
          </button>
          <button
            onClick={removeColumn}
            disabled={chartType === 'pie' || grid[0]?.length <= 2}
            style={{
              padding: '6px 12px',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: (chartType === 'pie' || grid[0]?.length <= 2) ? 'not-allowed' : 'pointer',
              opacity: (chartType === 'pie' || grid[0]?.length <= 2) ? 0.4 : 1
            }}
          >
            − Column
          </button>
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={handleResizeStart}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '20px',
            height: '20px',
            cursor: 'se-resize',
            background: 'linear-gradient(135deg, transparent 50%, #aaa 50%)',
            borderBottomRightRadius: '12px'
          }}
        />
      </div>
    </>
  )
}

// Helper functions
function dataToGrid(data, chartType) {
  const categories = data?.categories || ['Q1', 'Q2', 'Q3']
  const series = data?.series || [{ name: 'Series 1', data: [100, 200, 150] }]

  if (chartType === 'pie') {
    const grid = [['', 'Value']]
    categories.forEach((cat, i) => {
      grid.push([cat, series[0]?.data[i] || 0])
    })
    return grid
  } else {
    const grid = [['', ...series.map(s => s.name)]]
    categories.forEach((cat, i) => {
      const row = [cat]
      series.forEach(s => row.push(s.data[i] || 0))
      grid.push(row)
    })
    return grid
  }
}

function gridToData(grid, chartType) {
  if (!grid || grid.length < 2) return { categories: [], series: [] }

  const categories = []
  const series = []

  if (chartType === 'pie') {
    for (let i = 1; i < grid.length; i++) {
      categories.push(String(grid[i][0]))
    }
    const values = []
    for (let i = 1; i < grid.length; i++) {
      values.push(Number(grid[i][1]) || 0)
    }
    series.push({ name: 'Value', data: values })
  } else {
    for (let i = 1; i < grid.length; i++) {
      categories.push(String(grid[i][0]))
    }
    for (let col = 1; col < grid[0].length; col++) {
      const seriesData = []
      for (let row = 1; row < grid.length; row++) {
        seriesData.push(Number(grid[row][col]) || 0)
      }
      series.push({ name: String(grid[0][col]), data: seriesData })
    }
  }

  return { categories, series }
}
