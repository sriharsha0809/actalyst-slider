import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Draggable from 'react-draggable'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * KeynoteSpreadsheet - Apple Keynote-style data editor
 * Renders as a floating, draggable, resizable spreadsheet
 * Updates chart data in real-time
 */
export default function KeynoteSpreadsheet({ 
  isOpen, 
  chartType,
  chartData, 
  onDataChange,
  onClose,
  chartId
}) {
  const [grid, setGrid] = useState([])
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [selectedCell, setSelectedCell] = useState(null)
  const [size, setSize] = useState({ width: 600, height: 400 })
  const [isResizing, setIsResizing] = useState(false)
  const inputRef = useRef(null)
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 })

  // Initialize grid from chart data
  useEffect(() => {
    if (isOpen && chartData) {
      const newGrid = chartDataToGrid(chartData, chartType)
      setGrid(newGrid)
    }
  }, [isOpen, chartType])

  // Auto-focus input when editing
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (editingCell) {
          setEditingCell(null)
        } else {
          onClose?.()
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, editingCell, onClose])

  // Start editing cell
  const startEdit = (row, col) => {
    if (row === 0 && col === 0) return // Skip corner cell
    setEditingCell({ row, col })
    setEditValue(String(grid[row]?.[col] || ''))
    setSelectedCell({ row, col })
  }

  // Save cell edit
  const saveEdit = () => {
    if (!editingCell || !grid[editingCell.row]) return
    
    const { row, col } = editingCell
    const isHeader = row === 0 || col === 0
    const newValue = isHeader ? editValue : (Number(editValue) || 0)
    
    const newGrid = grid.map((r, ri) => 
      ri === row ? r.map((c, ci) => ci === col ? newValue : c) : [...r]
    )
    
    setGrid(newGrid)
    setEditingCell(null)
    
    // Convert grid back to chart data and notify parent
    const updatedChartData = gridToChartData(newGrid, chartType)
    onDataChange?.(updatedChartData)
  }

  // Add column
  const addColumn = () => {
    // For pie charts, disallow adding columns (only Category | Value allowed)
    if (chartType === 'pie') return
    const newGrid = grid.map((row, ri) => 
      ri === 0 ? [...row, `Series ${row.length}`] : [...row, 0]
    )
    setGrid(newGrid)
    onDataChange?.(gridToChartData(newGrid, chartType))
  }

  // Add row
  const addRow = () => {
    const cols = grid[0]?.length || 2
    const newRow = Array.from({ length: cols }, (_, i) => 
      i === 0 ? `Item ${grid.length}` : 0
    )
    setGrid([...grid, newRow])
    onDataChange?.(gridToChartData([...grid, newRow], chartType))
  }

  // Remove column
  const removeColumn = () => {
    // For pie charts, disallow removing columns (must keep 2 columns)
    if (chartType === 'pie') return
    if (grid[0]?.length <= 2) return
    const newGrid = grid.map(row => row.slice(0, -1))
    setGrid(newGrid)
    onDataChange?.(gridToChartData(newGrid, chartType))
  }

  // Remove row
  const removeRow = () => {
    if (grid.length <= 2) return
    const newGrid = grid.slice(0, -1)
    setGrid(newGrid)
    onDataChange?.(gridToChartData(newGrid, chartType))
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
    if (!isResizing) return

    const handleMouseMove = (e) => {
      const dx = e.clientX - resizeStartRef.current.x
      const dy = e.clientY - resizeStartRef.current.y
      setSize({
        width: Math.max(400, resizeStartRef.current.width + dx),
        height: Math.max(300, resizeStartRef.current.height + dy)
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  if (!isOpen) return null

  const spreadsheet = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
              zIndex: 9998,
              backdropFilter: 'blur(2px)'
            }}
          />

          {/* Spreadsheet Window */}
          <Draggable
            handle=".drag-handle"
            bounds="parent"
            onStart={(e) => e.stopPropagation()}
            onDrag={(e) => e.stopPropagation()}
            onStop={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${size.width}px`,
                height: `${size.height}px`,
                zIndex: 9999,
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif'
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="drag-handle"
                style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(to bottom, #fafafa, #f5f5f5)',
                  borderBottom: '1px solid #e0e0e0',
                  cursor: 'move',
                  userSelect: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={onClose}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#ff5f57',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.15)'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#ff4136'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#ff5f57'}
                  />
                  <span style={{ 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    color: '#333',
                    letterSpacing: '-0.01em'
                  }}>
                    Edit Chart Data
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {chartType} Chart
                </span>
              </div>

              {/* Spreadsheet Grid */}
              <div style={{ 
                flex: 1, 
                overflow: 'auto', 
                backgroundColor: '#ffffff',
                padding: '0'
              }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: '13px'
                }}>
                  <tbody>
                    {grid.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => {
                          const isHeader = ri === 0 || ci === 0
                          const isCorner = ri === 0 && ci === 0
                          const isEditing = editingCell?.row === ri && editingCell?.col === ci
                          const isSelected = selectedCell?.row === ri && selectedCell?.col === ci

                          return (
                            <td
                              key={`${ri}-${ci}`}
                              onClick={() => !isCorner && startEdit(ri, ci)}
                              style={{
                                border: '1px solid #e5e5e5',
                                padding: '0',
                                height: '32px',
                                minWidth: ci === 0 ? '120px' : '80px',
                                backgroundColor: isCorner ? '#fafafa' : isHeader ? '#f9f9f9' : isSelected ? '#e3f2fd' : '#ffffff',
                                fontWeight: isHeader ? 600 : 400,
                                color: isHeader ? '#555' : '#333',
                                cursor: isCorner ? 'default' : 'pointer',
                                transition: 'background-color 0.15s ease',
                                position: 'relative'
                              }}
                              onMouseEnter={(e) => {
                                if (!isCorner && !isEditing) {
                                  e.target.style.backgroundColor = isSelected ? '#e3f2fd' : '#f5f5f5'
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isEditing) {
                                  e.target.style.backgroundColor = isCorner ? '#fafafa' : isHeader ? '#f9f9f9' : isSelected ? '#e3f2fd' : '#ffffff'
                                }
                              }}
                            >
                              {isEditing ? (
                                <input
                                  ref={inputRef}
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
                                    height: '100%',
                                    border: '2px solid #007aff',
                                    padding: '0 8px',
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    backgroundColor: '#ffffff',
                                    boxShadow: '0 0 0 3px rgba(0, 122, 255, 0.1)'
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <div style={{ 
                                  padding: '0 8px',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: ci === 0 ? 'flex-start' : 'center'
                                }}>
                                  {cell}
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Controls */}
              <div style={{
                padding: '10px 16px',
                borderTop: '1px solid #e0e0e0',
                background: '#fafafa',
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-start',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={addRow}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    color: '#333',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f5f5f5'
                    e.target.style.borderColor = '#007aff'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ffffff'
                    e.target.style.borderColor = '#d0d0d0'
                  }}
                >
                  + Row
                </button>
                <button
                  onClick={addColumn}
                  disabled={chartType === 'pie'}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: chartType === 'pie' ? 'not-allowed' : 'pointer',
                    color: '#333',
                    opacity: chartType === 'pie' ? 0.4 : 1,
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    if (chartType !== 'pie') {
                      e.target.style.backgroundColor = '#f5f5f5'
                      e.target.style.borderColor = '#007aff'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ffffff'
                    e.target.style.borderColor = '#d0d0d0'
                  }}
                >
                  + Column
                </button>
                <button
                  onClick={removeRow}
                  disabled={grid.length <= 2}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: grid.length <= 2 ? 'not-allowed' : 'pointer',
                    color: '#333',
                    opacity: grid.length <= 2 ? 0.4 : 1,
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    if (grid.length > 2) {
                      e.target.style.backgroundColor = '#fff5f5'
                      e.target.style.borderColor = '#ff3b30'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ffffff'
                    e.target.style.borderColor = '#d0d0d0'
                  }}
                >
                  − Row
                </button>
                <button
                  onClick={removeColumn}
                  disabled={chartType === 'pie' || grid[0]?.length <= 2}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: (chartType === 'pie' || grid[0]?.length <= 2) ? 'not-allowed' : 'pointer',
                    color: '#333',
                    opacity: (chartType === 'pie' || grid[0]?.length <= 2) ? 0.4 : 1,
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    if (chartType !== 'pie' && grid[0]?.length > 2) {
                      e.target.style.backgroundColor = '#fff5f5'
                      e.target.style.borderColor = '#ff3b30'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ffffff'
                    e.target.style.borderColor = '#d0d0d0'
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
                  background: 'linear-gradient(135deg, transparent 50%, #ccc 50%)',
                  borderBottomRightRadius: '12px'
                }}
              />
            </motion.div>
          </Draggable>
        </>
      )}
    </AnimatePresence>
  )

  // Render to portal
  const portalRoot = document.getElementById('portal-root')
  if (!portalRoot) {
    console.error('[KeynoteSpreadsheet] portal-root not found')
    return null
  }

  return createPortal(spreadsheet, portalRoot)
}

// Convert chart data to spreadsheet grid
function chartDataToGrid(data, chartType) {
  const categories = data?.categories || ['Q1', 'Q2', 'Q3']
  const series = data?.series || [{ name: 'Series 1', data: [100, 200, 150] }]

  if (chartType === 'pie') {
    // Pie chart: Category | Value
    const grid = [['', 'Value']]
    categories.forEach((cat, i) => {
      grid.push([cat, series[0]?.data[i] || 0])
    })
    return grid
  } else {
    // Bar/Line: '' | Series1 | Series2 | ...
    const grid = [['', ...series.map(s => s.name)]]
    categories.forEach((cat, i) => {
      const row = [cat]
      series.forEach(s => {
        row.push(s.data[i] || 0)
      })
      grid.push(row)
    })
    return grid
  }
}

// Convert spreadsheet grid back to chart data
function gridToChartData(grid, chartType) {
  if (!grid || grid.length < 2) {
    return { categories: [], series: [] }
  }

  const categories = []
  const series = []

  if (chartType === 'pie') {
    // Pie chart format
    for (let i = 1; i < grid.length; i++) {
      categories.push(String(grid[i][0]))
    }
    const values = []
    for (let i = 1; i < grid.length; i++) {
      values.push(Number(grid[i][1]) || 0)
    }
    series.push({ name: 'Value', data: values })
  } else {
    // Bar/Line format
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
