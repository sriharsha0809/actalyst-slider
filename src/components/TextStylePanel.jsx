import React from 'react'
import { useSlides } from '../context/SlidesContext.jsx'

export default function TextStylePanel() {
  const { state, dispatch } = useSlides()
  const currentSlide = state.slides.find(s => s.id === state.currentSlideId)
  const selected = currentSlide?.elements.find(e => e.id === state.selectedElementId)

  if (!selected || selected.type !== 'text') {
    return <div className="text-sm text-gray-600">Select a text box to edit its style.</div>
  }

  const styles = selected.styles || {}
  const updateStyles = (patch) => {
    const next = { ...styles, ...patch }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles: next } })
  }

  const Btn = ({ active, title, onClick, children }) => (
    <button
      title={title}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm border ${active ? 'bg-black text-white border-black' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
    >
      {children}
    </button>
  )

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Text Style</h3>

      {/* Font family */}
      <div className="space-y-1">
        <div className="text-xs font-medium text-gray-600">Font Family</div>
        <select 
          value={styles.fontFamily || 'Inter, system-ui, sans-serif'}
          onChange={(e) => updateStyles({ fontFamily: e.target.value })}
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

      {/* Bold/Italic/Underline */}
      <div className="space-y-1">
        <div className="text-xs font-medium text-gray-600">Emphasis</div>
        <div className="flex gap-2">
          <Btn title="Bold" active={!!styles.bold} onClick={() => updateStyles({ bold: !styles.bold })}>
            <span className="font-bold">B</span>
          </Btn>
          <Btn title="Italic" active={!!styles.italic} onClick={() => updateStyles({ italic: !styles.italic })}>
            <span className="italic">I</span>
          </Btn>
          <Btn title="Underline" active={!!styles.underline} onClick={() => updateStyles({ underline: !styles.underline })}>
            <span className="underline">U</span>
          </Btn>
        </div>
      </div>

      {/* Text Color */}
      <div className="space-y-1">
        <div className="text-xs font-medium text-gray-600">Text Color</div>
        <div className="flex items-center gap-2">
          <input type="color" value={styles.color || '#111827'} onChange={(e)=>updateStyles({ color: e.target.value })} className="h-9 w-9 p-1 rounded border" />
          <input type="text" value={styles.color || '#111827'} onChange={(e)=>updateStyles({ color: e.target.value })} className="flex-1 border rounded px-2 py-1 text-sm" />
        </div>
      </div>

      {/* Alignment */}
      <div className="space-y-1">
        <div className="text-xs font-medium text-gray-600">Horizontal Alignment</div>
        <div className="flex gap-2">
          <Btn title="Align Left" active={(styles.align || 'left') === 'left'} onClick={() => updateStyles({ align: 'left' })}>⟸</Btn>
          <Btn title="Align Center" active={styles.align === 'center'} onClick={() => updateStyles({ align: 'center' })}>≡</Btn>
          <Btn title="Align Right" active={styles.align === 'right'} onClick={() => updateStyles({ align: 'right' })}>⟹</Btn>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs font-medium text-gray-600">Vertical Alignment</div>
        <div className="flex gap-2">
          <Btn title="Top" active={(styles.valign || 'top') === 'top'} onClick={() => updateStyles({ valign: 'top' })}>⤒</Btn>
          <Btn title="Middle" active={styles.valign === 'middle'} onClick={() => updateStyles({ valign: 'middle' })}>↕</Btn>
          <Btn title="Bottom" active={styles.valign === 'bottom'} onClick={() => updateStyles({ valign: 'bottom' })}>⤓</Btn>
        </div>
      </div>
    </div>
  )
}
