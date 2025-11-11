import React from 'react'
import { useSlides } from '../context/SlidesContext.jsx'

export default function SymbolStylePanel() {
  const { state, dispatch } = useSlides()
  const currentSlide = state.slides.find(s => s.id === state.currentSlideId)
  const selected = currentSlide?.elements.find(e => e.id === state.selectedElementId)

if (!selected || !['rect','square','circle','triangle','diamond','star','message','roundRect','parallelogram','trapezoid','pentagon','hexagon','octagon','chevron','arrowRight','cloud'].includes(selected.type)) {
    return (
      <div className="text-sm text-gray-600">Select a shape to edit its colors.</div>
    )
  }

  const onChange = (patch) => dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch })

  const Row = ({ label, children }) => (
    <div className="space-y-1">
      <div className="text-xs font-medium text-gray-600">{label}</div>
      {children}
    </div>
  )

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Shape Style</h3>

      <Row label="Text">
        <div className="flex gap-2">
          <button
            onClick={() => {
              try { window.dispatchEvent(new CustomEvent('editShapeText', { detail: { id: selected.id } })) } catch {}
            }}
            className="px-3 py-1.5 rounded-md text-sm border bg-white border-gray-300 hover:bg-gray-50"
            title="Edit text in shape"
          >
            Edit Text
          </button>
        </div>
      </Row>

      {/* Text styling */}
      <Row label="Font Family">
        <select 
          value={selected.fontFamily || 'Inter, system-ui, sans-serif'}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
        >
          <option value="Inter, system-ui, sans-serif">Inter</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="'Courier New', monospace">Courier New</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="Verdana, sans-serif">Verdana</option>
        </select>
      </Row>

      <Row label="Emphasis">
        <div className="flex gap-2">
          <button onClick={() => onChange({ bold: !selected.bold })} className={`px-3 py-1.5 rounded-md text-sm border ${selected.bold ? 'bg-black text-white border-black' : 'bg-white border-gray-300 hover:bg-gray-50'}`}>
            <span className="font-bold">B</span>
          </button>
          <button onClick={() => onChange({ italic: !selected.italic })} className={`px-3 py-1.5 rounded-md text-sm border ${selected.italic ? 'bg-black text-white border-black' : 'bg-white border-gray-300 hover:bg-gray-50'}`}>
            <span className="italic">I</span>
          </button>
          <button onClick={() => onChange({ underline: !selected.underline })} className={`px-3 py-1.5 rounded-md text-sm border ${selected.underline ? 'bg-black text-white border-black' : 'bg-white border-gray-300 hover:bg-gray-50'}`}>
            <span className="underline">U</span>
          </button>
        </div>
      </Row>

      <Row label="Horizontal Alignment">
        <div className="flex gap-2">
          <button onClick={() => onChange({ textAlign: 'left' })} className={`px-3 py-1.5 rounded-md text-sm border ${(selected.textAlign || 'center') === 'left' ? 'bg-black text-white border-black' : 'bg-white border-gray-300 hover:bg-gray-50'}`}>⟸</button>
          <button onClick={() => onChange({ textAlign: 'center' })} className={`px-3 py-1.5 rounded-md text-sm border ${(selected.textAlign || 'center') === 'center' ? 'bg-black text-white border-black' : 'bg-white border-gray-300 hover:bg-gray-50'}`}>≡</button>
          <button onClick={() => onChange({ textAlign: 'right' })} className={`px-3 py-1.5 rounded-md text-sm border ${(selected.textAlign || 'center') === 'right' ? 'bg-black text-white border-black' : 'bg-white border-gray-300 hover:bg-gray-50'}`}>⟹</button>
        </div>
      </Row>

      <Row label="Vertical Alignment">
        <div className="flex gap-2">
          <button onClick={() => onChange({ textVAlign: 'top' })} className={`px-3 py-1.5 rounded-md text-sm border ${(selected.textVAlign || 'middle') === 'top' ? 'bg-black text-white border-black' : 'bg-white border-gray-300 hover:bg-gray-50'}`}>⤒</button>
          <button onClick={() => onChange({ textVAlign: 'middle' })} className={`px-3 py-1.5 rounded-md text-sm border ${(selected.textVAlign || 'middle') === 'middle' ? 'bg-black text-white border-black' : 'bg-white border-gray-300 hover:bg-gray-50'}`}>↕</button>
          <button onClick={() => onChange({ textVAlign: 'bottom' })} className={`px-3 py-1.5 rounded-md text-sm border ${(selected.textVAlign || 'middle') === 'bottom' ? 'bg-black text-white border-black' : 'bg-white border-gray-300 hover:bg-gray-50'}`}>⤓</button>
        </div>
      </Row>

      <Row label="Border Color">
        <input
          type="color"
          value={selected.stroke || '#000000'}
          onChange={(e) => onChange({ stroke: e.target.value })}
          className="w-full h-10 rounded border border-gray-300 cursor-pointer"
        />
      </Row>

      <Row label="Background Color">
        <input
          type="color"
          value={selected.fill || '#ffffff'}
          onChange={(e) => onChange({ fill: e.target.value })}
          className="w-full h-10 rounded border border-gray-300 cursor-pointer"
        />
      </Row>

      <Row label="Text Color">
        <input
          type="color"
          value={selected.textColor || '#111827'}
          onChange={(e) => onChange({ textColor: e.target.value })}
          className="w-full h-10 rounded border border-gray-300 cursor-pointer"
        />
      </Row>
    </div>
  )
}
