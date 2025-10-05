import React from 'react'
import { useSlides } from '../context/SlidesContext.jsx'

export default function ChartEditor() {
  const { state, dispatch } = useSlides()
  const currentSlide = state.slides.find(s => s.id === state.currentSlideId)
  const selected = currentSlide?.elements.find(e => e.id === state.selectedElementId)

  // Table cell formatting
  if (selected && selected.type === 'table') {
    return <TableCellEditor selected={selected} dispatch={dispatch} />
  }

  if (!selected || selected.type !== 'chart') {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-sm">Select a chart or table to edit</p>
      </div>
    )
  }

  const updateChartData = (index, value) => {
    const newData = [...selected.data]
    newData[index] = Number(value)
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { data: newData } })
  }

  const updateChartLabel = (index, value) => {
    const newLabels = [...selected.labels]
    newLabels[index] = value
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { labels: newLabels } })
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <h3 className="font-semibold text-lg">Edit Chart Data</h3>
      
      <div className="space-y-2 overflow-y-auto flex-1">
        {selected.data.map((value, index) => (
          <div key={index} className="space-y-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={selected.labels[index]}
                onChange={(e) => updateChartLabel(index, e.target.value)}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                placeholder="Label"
              />
              <input
                type="number"
                value={value}
                onChange={(e) => updateChartData(index, e.target.value)}
                className="w-16 px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                placeholder="Value"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t">
        <p className="text-xs text-gray-500">
          Chart Type: <span className="font-medium capitalize">{selected.chartType}</span>
        </p>
      </div>
    </div>
  )
}

function TableCellEditor({ selected, dispatch }) {
  const updateAllCellsStyle = (styleKey, value) => {
    const updatedCells = selected.cells.map(cell => ({
      ...cell,
      styles: { ...cell.styles, [styleKey]: value }
    }))
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { cells: updatedCells } })
  }

  const toggleAllCellsStyle = (styleKey) => {
    const currentValue = selected.cells[0]?.styles?.[styleKey] || false
    updateAllCellsStyle(styleKey, !currentValue)
  }

  const currentStyles = selected.cells[0]?.styles || {}

  const btn = (active) =>
    active
      ? 'px-3 py-1.5 rounded-md bg-brand-500 text-white font-semibold'
      : 'px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50'

  return (
    <div className="space-y-4 h-full flex flex-col">
      <h3 className="font-semibold text-lg">Table Formatting</h3>
      
      <div className="space-y-4 flex-1 overflow-y-auto">
        {/* Font Family */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
          <select 
            value={currentStyles.fontFamily || 'Inter, system-ui, sans-serif'}
            onChange={(e) => updateAllCellsStyle('fontFamily', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
          >
            <option value="Inter, system-ui, sans-serif">Inter</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="'Times New Roman', serif">Times New Roman</option>
            <option value="'Courier New', monospace">Courier New</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Verdana, sans-serif">Verdana</option>
          </select>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
          <input 
            type="number" 
            min="8" 
            max="72" 
            value={currentStyles.fontSize || 14}
            onChange={(e) => updateAllCellsStyle('fontSize', Number(e.target.value))}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
          />
        </div>

        {/* Text Formatting */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Text Style</label>
          <div className="flex gap-2">
            <button 
              onClick={() => toggleAllCellsStyle('bold')} 
              className={btn(currentStyles.bold)}
              title="Bold"
            >
              <span className="font-bold">B</span>
            </button>
            <button 
              onClick={() => toggleAllCellsStyle('italic')} 
              className={btn(currentStyles.italic)}
              title="Italic"
            >
              <span className="italic">I</span>
            </button>
            <button 
              onClick={() => toggleAllCellsStyle('underline')} 
              className={btn(currentStyles.underline)}
              title="Underline"
            >
              <span className="underline">U</span>
            </button>
          </div>
        </div>

        {/* Text Alignment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Text Alignment</label>
          <div className="flex gap-2">
            <button 
              onClick={() => updateAllCellsStyle('align', 'left')} 
              className={btn(currentStyles.align === 'left')}
              title="Align Left"
            >
              ⟸
            </button>
            <button 
              onClick={() => updateAllCellsStyle('align', 'center')} 
              className={btn(currentStyles.align === 'center')}
              title="Align Center"
            >
              ≡
            </button>
            <button 
              onClick={() => updateAllCellsStyle('align', 'right')} 
              className={btn(currentStyles.align === 'right')}
              title="Align Right"
            >
              ⟹
            </button>
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
          <input 
            type="color" 
            value={currentStyles.color || '#111827'}
            onChange={(e) => updateAllCellsStyle('color', e.target.value)}
            className="w-full h-10 rounded-md border border-gray-300 cursor-pointer"
          />
        </div>
      </div>

      <div className="pt-3 border-t">
        <p className="text-xs text-gray-500">
          Formatting applies to all cells in the table
        </p>
      </div>
    </div>
  )
}
