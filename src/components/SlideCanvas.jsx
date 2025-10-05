import React, { useMemo, useRef, useState } from 'react'
import { useSlides } from '../context/SlidesContext.jsx'
import RichTextEditor from './RichTextEditor.jsx'

export default function SlideCanvas() {
  const { state, dispatch } = useSlides()
  const slide = state.slides.find(s => s.id === state.currentSlideId)
  const stageRef = useRef(null)
  const [editingTextId, setEditingTextId] = useState(null)
  
  // Store editor ref globally for toolbar access
  window.currentTextEditorRef = useRef(null)

  const stageStyle = useMemo(() => ({
    background: slide?.background || '#ffffff',
  }), [slide?.background])

  const onMouseDown = (e) => {
    if (e.target === stageRef.current) {
      dispatch({ type: 'SELECT_ELEMENT', id: null })
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center" onMouseDown={onMouseDown}>
      <div className="relative aspect-video w-full h-full shadow-lg" style={{ padding: '3px', background: '#000000' }}>
        <div ref={stageRef} className="relative bg-white w-full h-full" style={stageStyle}>
          {slide?.elements.map((el) => (
            <ElementBox key={el.id} el={el} selected={state.selectedElementId === el.id} onSelect={() => dispatch({ type: 'SELECT_ELEMENT', id: el.id })} onDelete={() => dispatch({ type: 'DELETE_ELEMENT', id: el.id })} onChange={(patch) => dispatch({ type: 'UPDATE_ELEMENT', id: el.id, patch })} editingTextId={editingTextId} setEditingTextId={setEditingTextId} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ElementBox({ el, selected, onSelect, onDelete, onChange, editingTextId, setEditingTextId }) {
  const boxRef = useRef(null)
  const [drag, setDrag] = useState(null)
  const [resize, setResize] = useState(null)

  const onMouseDown = (e) => {
    e.stopPropagation()
    onSelect()
    const rect = boxRef.current.parentElement.getBoundingClientRect()
    const startX = e.clientX
    const startY = e.clientY
    const offsetX = el.x
    const offsetY = el.y
    setDrag({ startX, startY, offsetX, offsetY, bounds: rect })
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const onMouseMove = (e) => {
    setDrag((d) => {
      if (!d) return null
      const nx = Math.max(0, Math.min(d.bounds.width - el.w, d.offsetX + (e.clientX - d.startX)))
      const ny = Math.max(0, Math.min(d.bounds.height - el.h, d.offsetY + (e.clientY - d.startY)))
      onChange({ x: nx, y: ny })
      return { ...d }
    })
  }

  const onMouseUp = () => {
    setDrag(null)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  const startResize = (e, dir) => {
    e.stopPropagation()
    onSelect()
    const startX = e.clientX
    const startY = e.clientY
    setResize({ startX, startY, dir, start: { x: el.x, y: el.y, w: el.w, h: el.h } })
    window.addEventListener('mousemove', onResizing)
    window.addEventListener('mouseup', endResize)
  }

  const onResizing = (e) => {
    setResize((r) => {
      if (!r) return null
      let { x, y, w, h } = r.start
      const dx = e.clientX - r.startX
      const dy = e.clientY - r.startY
      if (r.dir.includes('e')) w = Math.max(40, r.start.w + dx)
      if (r.dir.includes('s')) h = Math.max(40, r.start.h + dy)
      if (r.dir.includes('w')) { w = Math.max(40, r.start.w - dx); x = r.start.x + dx }
      if (r.dir.includes('n')) { h = Math.max(40, r.start.h - dy); y = r.start.y + dy }
      onChange({ x, y, w, h })
      return { ...r }
    })
  }

  const endResize = () => {
    setResize(null)
    window.removeEventListener('mousemove', onResizing)
    window.removeEventListener('mouseup', endResize)
  }

  const onDoubleClick = () => {
    if (el.type === 'text') setEditingTextId(el.id)
  }
  const stopEditing = () => setEditingTextId(null)

  const boxStyle = {
    position: 'absolute',
    left: el.x,
    top: el.y,
    width: el.w,
    height: el.h,
    transform: `rotate(${el.rotation}deg)`,
    cursor: selected ? 'move' : 'pointer',
    border: el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || '#000000'}` : undefined,
  }

  return (
    <div
      ref={boxRef}
      className={`absolute ${selected ? 'ring-2 ring-brand-500' : ''}`}
      style={boxStyle}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      {renderElement(el, { editing: editingTextId === el.id, onChange, stopEditing })}

      {selected && (
        <>
          {['n','e','s','w','ne','nw','se','sw'].map(dir => (
            <div key={dir} onMouseDown={(e)=>startResize(e, dir)} className={`absolute bg-white border border-brand-500 rounded-full w-3 h-3 -translate-x-1/2 -translate-y-1/2`}
              style={handleStyle(dir, el.w, el.h)}
            />
          ))}

          {/* Delete button */}
          <button onClick={(e)=>{e.stopPropagation(); onDelete()}} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 text-xs shadow">✕</button>
        </>
      )}
    </div>
  )
}

function handleStyle(dir, w, h) {
  const pos = {
    n: { left: w/2, top: 0 },
    s: { left: w/2, top: h },
    e: { left: w, top: h/2 },
    w: { left: 0, top: h/2 },
    ne: { left: w, top: 0 },
    nw: { left: 0, top: 0 },
    se: { left: w, top: h },
    sw: { left: 0, top: h },
  }
  return pos[dir]
}

function renderElement(el, opts={}) {
  switch (el.type) {
    case 'text':
      return <EditableText el={el} editing={opts.editing} onChange={opts.onChange} stopEditing={opts.stopEditing} />
    case 'table':
      return <TableElement el={el} editing={opts.editing} onChange={opts.onChange} stopEditing={opts.stopEditing} />
    case 'chart':
      return <ChartElement el={el} />
    case 'rect':
      return <div className="w-full h-full rounded-md" style={{ background: el.fill, border: `2px solid ${el.stroke}` }} />
    case 'circle':
      return <div className="w-full h-full rounded-full" style={{ background: el.fill, border: `2px solid ${el.stroke}` }} />
    case 'arrow':
      return <div className="w-full h-3 bg-emerald-500 mt-[calc(50%-6px)]" style={{ background: el.color }} />
    case 'image':
      return <img src={el.src} alt="" className="w-full h-full object-contain pointer-events-none" draggable={false} />
    default:
      return null
  }
}

function ChartElement({ el }) {
  const { chartType, data, labels, colors } = el
  const [hoveredIndex, setHoveredIndex] = useState(null)
  
  if (chartType === 'bar') {
    const maxValue = Math.max(...data)
    const minValue = Math.min(...data)
    const range = maxValue - minValue || 1
    
    return (
      <div className="w-full h-full bg-white p-4 flex flex-col">
        <div className="flex-1 flex items-end gap-2 relative" style={{ minHeight: '200px' }}>
          {data.map((value, index) => {
            const heightPercent = ((value - minValue) / range) * 90 + 10
            return (
              <div 
                key={index} 
                className="flex-1 flex flex-col justify-end items-center relative"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div 
                  className="w-full rounded-t cursor-pointer transition-all hover:opacity-80"
                  style={{ 
                    height: `${heightPercent}%`,
                    backgroundColor: colors[index % colors.length]
                  }}
                />
                
                {hoveredIndex === index && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded text-xs whitespace-nowrap z-10">
                    {labels[index]}: {value}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex justify-around border-t border-gray-300 pt-2 mt-2">
          {labels.map((label, index) => (
            <span key={index} className="text-[10px] text-gray-600 text-center flex-1">{label}</span>
          ))}
        </div>
      </div>
    )
  }
  
  if (chartType === 'line') {
    const maxValue = Math.max(...data)
    const minValue = Math.min(...data)
    const range = maxValue - minValue || 1
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 90 - ((value - minValue) / range) * 80
      return `${x},${y}`
    }).join(' ')
    
    return (
      <div className="w-full h-full bg-white p-4 relative flex flex-col">
        <svg viewBox="0 0 100 100" className="w-full flex-1" style={{ minHeight: '200px' }}>
          <polyline
            points={points}
            fill="none"
            stroke={colors[0]}
            strokeWidth="2"
          />
          {data.map((value, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 90 - ((value - minValue) / range) * 80
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={colors[0]}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            )
          })}
        </svg>
        <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
          {labels.map((label, index) => (
            <span key={index} className="text-[10px] text-gray-600 truncate">{label}</span>
          ))}
        </div>
        
        {hoveredIndex !== null && (
          <div 
            className="absolute bg-gray-900 text-white px-3 py-1.5 rounded text-xs whitespace-nowrap z-10 pointer-events-none"
            style={{
              left: `${(hoveredIndex / (data.length - 1)) * 80 + 10}%`,
              top: `${(90 - ((data[hoveredIndex] - minValue) / range) * 80) * 0.7}%`
            }}
          >
            {labels[hoveredIndex]}: {data[hoveredIndex]}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    )
  }
  
  if (chartType === 'pie') {
    const total = data.reduce((sum, val) => sum + val, 0)
    let currentAngle = 0
    
    return (
      <div className="w-full h-full bg-white p-4 flex gap-4 items-center justify-center relative">
        <svg viewBox="0 0 100 100" className="w-1/2 h-3/4">
          {data.map((value, index) => {
            const percentage = value / total
            const angle = percentage * 360
            const startAngle = currentAngle
            const endAngle = currentAngle + angle
            currentAngle = endAngle
            
            const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180)
            const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180)
            const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180)
            const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180)
            const largeArc = angle > 180 ? 1 : 0
            
            return (
              <path
                key={index}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={colors[index % colors.length]}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            )
          })}
        </svg>
        
        <div className="flex flex-col gap-1">
          {data.map((value, index) => (
            <div key={index} className="flex items-center gap-2 text-[10px]">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-gray-700">{labels[index]}: {value}</span>
            </div>
          ))}
        </div>
        
        {hoveredIndex !== null && (
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1.5 rounded text-xs whitespace-nowrap z-10 pointer-events-none">
            {labels[hoveredIndex]}: {data[hoveredIndex]} ({((data[hoveredIndex] / total) * 100).toFixed(1)}%)
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    )
  }
  
  return null
}

function TableElement({ el, editing, onChange, stopEditing }) {
  const [editingCellIndex, setEditingCellIndex] = useState(null)
  
  const cellWidth = el.w / el.cols
  const cellHeight = el.h / el.rows
  
  const updateCell = (cellIndex, newText) => {
    const newCells = [...el.cells]
    newCells[cellIndex] = { ...newCells[cellIndex], text: newText }
    onChange({ cells: newCells })
  }
  
  return (
    <div className="w-full h-full relative bg-white">
      {el.cells.map((cell, index) => {
        const row = Math.floor(index / el.cols)
        const col = index % el.cols
        const isEditing = editingCellIndex === index
        
        return (
          <div
            key={cell.id}
            className="absolute border border-black"
            style={{
              left: col * cellWidth,
              top: row * cellHeight,
              width: cellWidth,
              height: cellHeight,
            }}
            onDoubleClick={(e) => {
              e.stopPropagation()
              setEditingCellIndex(index)
            }}
          >
            {isEditing ? (
              <textarea
                autoFocus
                value={cell.text}
                onChange={(e) => updateCell(index, e.target.value)}
                onBlur={() => setEditingCellIndex(null)}
                className="w-full h-full resize-none outline-none p-2"
                style={{
                  fontSize: cell.styles.fontSize,
                  fontFamily: cell.styles.fontFamily,
                  color: cell.styles.color,
                  fontWeight: cell.styles.bold ? 700 : 400,
                  fontStyle: cell.styles.italic ? 'italic' : 'normal',
                  textDecoration: cell.styles.underline ? 'underline' : 'none',
                  textAlign: cell.styles.align,
                }}
              />
            ) : (
              <div
                className="w-full h-full p-2 select-none"
                style={{
                  fontSize: cell.styles.fontSize,
                  fontFamily: cell.styles.fontFamily,
                  color: cell.styles.color,
                  fontWeight: cell.styles.bold ? 700 : 400,
                  fontStyle: cell.styles.italic ? 'italic' : 'normal',
                  textDecoration: cell.styles.underline ? 'underline' : 'none',
                  textAlign: cell.styles.align,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {cell.text}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function EditableText({ el, editing, onChange, stopEditing }) {
  const [val, setVal] = useState(el.text)
  const inputRef = useRef(null)

  React.useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  React.useEffect(() => { setVal(el.text) }, [el.text])

  // Use rich text editor when editing
  if (editing) {
    return <RichTextEditor ref={window.currentTextEditorRef} el={el} onChange={onChange} onBlur={stopEditing} />
  }

  const bgColor = el.bgColor || 'transparent'
  const listStyle = el.styles?.listStyle || 'none'

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

  const formatTextWithList = (text) => {
    if (listStyle === 'none' || !text) return text
    
    const lines = text.split('\n')
    return lines.map((line, index) => {
      if (!line.trim()) return line
      
      let prefix = ''
      switch (listStyle) {
        case 'bullet':
          prefix = '• '
          break
        case 'number':
          prefix = `${index + 1}. `
          break
        case 'roman':
          prefix = `${toRoman(index + 1)}. `
          break
        case 'alpha':
          prefix = `${String.fromCharCode(65 + index)}. `
          break
        default:
          prefix = ''
      }
      
      // Don't add prefix if it already exists
      if (line.trim().startsWith('•') || /^\d+\./.test(line.trim()) || /^[A-Z]+\./.test(line.trim()) || /^[IVX]+\./.test(line.trim())) {
        return line
      }
      
      return prefix + line
    }).join('\n')
  }

  if (!editing) {
    // If HTML content exists, render it
    if (el.html) {
      return (
        <div 
          className="w-full h-full select-none p-2" 
          style={{ 
            backgroundColor: bgColor, 
            fontFamily: el.styles.fontFamily, 
            fontSize: el.styles.fontSize, 
            textAlign: el.styles.align, 
            whiteSpace: 'pre-wrap' 
          }}
          dangerouslySetInnerHTML={{ __html: el.html }}
        />
      )
    }
    
    // Otherwise render plain text with list formatting
    return (
      <div className="w-full h-full select-none p-2" style={{ backgroundColor: bgColor, fontFamily: el.styles.fontFamily, color: el.styles.color, fontSize: el.styles.fontSize, fontWeight: el.styles.bold ? 700 : 400, fontStyle: el.styles.italic ? 'italic' : 'normal', textDecoration: el.styles.underline ? 'underline' : 'none', textAlign: el.styles.align, whiteSpace: 'pre-wrap' }}>
        {formatTextWithList(el.text)}
      </div>
    )
  }

  return (
    <textarea ref={inputRef} value={val} onChange={(e)=>setVal(e.target.value)} onBlur={()=>{ onChange({ text: val }); stopEditing() }}
      className="w-full h-full resize-none outline-none p-2"
      style={{ backgroundColor: bgColor, fontFamily: el.styles.fontFamily, color: el.styles.color, fontSize: el.styles.fontSize, fontWeight: el.styles.bold ? 700 : 400, fontStyle: el.styles.italic ? 'italic' : 'normal', textDecoration: el.styles.underline ? 'underline' : 'none', textAlign: el.styles.align }}
    />
  )
}
