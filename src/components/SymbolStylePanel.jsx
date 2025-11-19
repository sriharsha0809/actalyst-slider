import React from 'react'
import { useSlides } from '../context/SlidesContext.jsx'

export default function SymbolStylePanel() {
  const { state, dispatch } = useSlides()
  const currentSlide = state.slides.find(s => s.id === state.currentSlideId)
  const selected = currentSlide?.elements.find(e => e.id === state.selectedElementId)

  const shapeTypes = ['rect','square','circle','triangle','diamond','star','message','roundRect','parallelogram','trapezoid','pentagon','hexagon','octagon','chevron','arrowRight','cloud']
  const [isFontOpen, setIsFontOpen] = React.useState(false)

  if (!selected || !shapeTypes.includes(selected.type)) {
    return (
      <div className="text-sm text-gray-600">Select a shape to edit its style.</div>
    )
  }

  const onChange = (patch) => dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch })

  const Row = ({ label, children }) => (
    <div className="space-y-1">
      <div className="text-xs font-medium text-gray-600">{label}</div>
      {children}
    </div>
  )

  const swatchColors = ['#111827','#4b5563','#9ca3af','#f97316','#3b82f6','#10b981','#ef4444']

  const fontOptions = [
    { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: "'Times New Roman', serif", label: 'Times New Roman' },
    { value: "'Courier New', monospace", label: 'Courier New' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
  ]

  // Gradient presets applied to the selected shape via the preview thumbnails
  const gradientPresets = [
    {
      id: 'sunset',
      fill: 'linear-gradient(135deg, #f97316 0%, #ec4899 45%, #6366f1 100%)',
      stroke: '#f97316',
    },
    {
      id: 'aurora',
      fill: 'linear-gradient(135deg, #22c55e 0%, #0ea5e9 40%, #6366f1 100%)',
      stroke: '#0ea5e9',
    },
    {
      id: 'peach',
      fill: 'linear-gradient(135deg, #f97316 0%, #facc15 40%, #f97316 100%)',
      stroke: '#ea580c',
    },
    {
      id: 'grape',
      fill: 'linear-gradient(135deg, #6366f1 0%, #a855f7 40%, #ec4899 100%)',
      stroke: '#4f46e5',
    },
    {
      id: 'aqua',
      fill: 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 50%, #facc15 100%)',
      stroke: '#0ea5e9',
    },
    {
      id: 'mono',
      fill: 'linear-gradient(135deg, #0f172a 0%, #4b5563 50%, #e5e7eb 100%)',
      stroke: '#111827',
    },
  ]

  const SwatchRow = ({ value, onPick }) => (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {swatchColors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onPick(c)}
            className={`w-5 h-5 rounded-full border transition-transform duration-150 ease-out hover:scale-105 ${
              value === c ? 'border-black' : 'border-gray-300'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  )

  // Map shape types to thumbnail shape styles so previews match the selected shape
  const getGradientThumbStyle = () => {
    const base = {
      width: '42px',
      height: '28px',
      borderRadius: '10px',
    }
    switch (selected.type) {
      case 'circle':
        return { ...base, width: '32px', height: '32px', borderRadius: '9999px', clipPath: 'none' }
      case 'triangle':
        return { ...base, borderRadius: '0px', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }
      case 'diamond':
        return { ...base, borderRadius: '0px', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }
      case 'star':
        return { ...base, borderRadius: '0px', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }
      case 'message':
        return { ...base, borderRadius: '10px' }
      case 'rect':
      case 'roundRect':
      case 'parallelogram':
      case 'trapezoid':
      case 'pentagon':
      case 'hexagon':
      case 'octagon':
      case 'chevron':
      case 'arrowRight':
      case 'cloud':
      case 'square':
      default:
        return base
    }
  }

  const gradientThumbStyle = getGradientThumbStyle()

  return (
    <div className="space-y-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/70 pl-2 pr-3 py-3 shadow-sm overflow-x-hidden">
      <h3 className="font-semibold text-lg text-gray-900">Shape Style</h3>

      {/* Gradient previews that match the selected shape silhouette */}
      <div className="mt-2 grid grid-cols-3 gap-2">
        {gradientPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="flex items-center justify-center rounded-xl border border-transparent bg-transparent p-1 hover:bg-gray-50 transition-colors"
            onClick={() => onChange({ fill: preset.fill, stroke: preset.stroke })}
          >
            <div
              className="shadow-sm border border-white/70"
              style={{
                background: preset.fill,
                width: gradientThumbStyle.width,
                height: gradientThumbStyle.height,
                borderRadius: gradientThumbStyle.borderRadius,
                clipPath: gradientThumbStyle.clipPath || 'none',
              }}
            />
          </button>
        ))}
      </div>

      <Row label="Text">
        <div className="flex gap-2">
          <button
            onClick={() => {
              try { window.dispatchEvent(new CustomEvent('editShapeText', { detail: { id: selected.id } })) } catch {}
            }}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 border border-white/70 shadow-sm hover:bg-white/100 hover:shadow-md transition-all duration-150"
            title="Edit text in shape"
          >
            Edit Text
          </button>
        </div>
      </Row>

      {/* Text styling */}
      <Row label="Font Family">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFontOpen((v) => !v)}
            className="w-full px-3 pr-7 py-1.5 text-sm rounded-lg border border-gray-300 bg-white/90 shadow-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-700 transition-all duration-150"
          >
            <span className="truncate text-gray-900">
              {fontOptions.find(f => f.value === (selected.fontFamily || 'Inter, system-ui, sans-serif'))?.label || 'Inter'}
            </span>
            <span className="ml-2 text-[10px] text-gray-400">▴▾</span>
          </button>
          {isFontOpen && (
            <div className="bg-dropdown-menu-open absolute left-0 right-0 mt-1 rounded-lg border border-gray-300 bg-white shadow-lg overflow-hidden z-10">
              {fontOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange({ fontFamily: opt.value })
                    setIsFontOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors duration-150 ${
                    (selected.fontFamily || 'Inter, system-ui, sans-serif') === opt.value
                      ? 'bg-gray-100 text-black'
                      : 'bg-white text-gray-800 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  style={{ fontFamily: opt.value }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
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
          {/* Left */}
          <button
            onClick={() => onChange({ textAlign: 'left' })}
            className={`px-2 py-1.5 rounded-md border flex items-center justify-center ${
              (selected.textAlign || 'center') === 'left'
                ? 'bg-black text-white border-black'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <rect x="4" y="6" width="10" height="2" rx="1" fill="currentColor" />
              <rect x="4" y="11" width="14" height="2" rx="1" fill="currentColor" />
              <rect x="4" y="16" width="8" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>
          {/* Center */}
          <button
            onClick={() => onChange({ textAlign: 'center' })}
            className={`px-2 py-1.5 rounded-md border flex items-center justify-center ${
              (selected.textAlign || 'center') === 'center'
                ? 'bg-black text-white border-black'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <rect x="5" y="6" width="14" height="2" rx="1" fill="currentColor" />
              <rect x="7" y="11" width="10" height="2" rx="1" fill="currentColor" />
              <rect x="6" y="16" width="12" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>
          {/* Right */}
          <button
            onClick={() => onChange({ textAlign: 'right' })}
            className={`px-2 py-1.5 rounded-md border flex items-center justify-center ${
              (selected.textAlign || 'center') === 'right'
                ? 'bg-black text-white border-black'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <rect x="10" y="6" width="10" height="2" rx="1" fill="currentColor" />
              <rect x="6" y="11" width="14" height="2" rx="1" fill="currentColor" />
              <rect x="12" y="16" width="8" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </Row>

      <Row label="Vertical Alignment">
        <div className="flex gap-2">
          {/* Top */}
          <button
            onClick={() => onChange({ textVAlign: 'top' })}
            className={`px-2 py-1.5 rounded-md border flex items-center justify-center ${
              (selected.textVAlign || 'middle') === 'top'
                ? 'bg-black text-white border-black'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <rect x="6" y="4" width="12" height="2" rx="1" fill="currentColor" />
              <rect x="8" y="8" width="8" height="2" rx="1" fill="currentColor" />
              <rect x="9" y="13" width="6" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>
          {/* Middle */}
          <button
            onClick={() => onChange({ textVAlign: 'middle' })}
            className={`px-2 py-1.5 rounded-md border flex items-center justify-center ${
              (selected.textVAlign || 'middle') === 'middle'
                ? 'bg-black text-white border-black'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <rect x="6" y="7" width="12" height="2" rx="1" fill="currentColor" />
              <rect x="8" y="11" width="8" height="2" rx="1" fill="currentColor" />
              <rect x="9" y="15" width="6" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>
          {/* Bottom */}
          <button
            onClick={() => onChange({ textVAlign: 'bottom' })}
            className={`px-2 py-1.5 rounded-md border flex items-center justify-center ${
              (selected.textVAlign || 'middle') === 'bottom'
                ? 'bg-black text-white border-black'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <rect x="6" y="18" width="12" height="2" rx="1" fill="currentColor" />
              <rect x="8" y="14" width="8" height="2" rx="1" fill="currentColor" />
              <rect x="9" y="9" width="6" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </Row>

      <Row label="Opacity">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={selected.opacity == null ? 1 : selected.opacity}
            onChange={(e) => {
              const raw = Number(e.target.value)
              const value = Number.isFinite(raw) ? Math.max(0, Math.min(1, raw)) : 1
              onChange({ opacity: value })
            }}
            className="flex-1"
          />
          <span className="text-xs text-gray-600 w-10 text-right">
            {Math.round(((selected.opacity == null ? 1 : selected.opacity) * 100))}%
          </span>
        </div>
      </Row>

      <Row label="Border Color">
        <div className="flex items-center gap-2">
          <SwatchRow value={selected.stroke || '#000000'} onPick={(c) => onChange({ stroke: c })} />
        </div>
      </Row>

      <Row label="Background Color">
        <div className="flex items-center gap-2">
          <SwatchRow value={selected.fill || '#ffffff'} onPick={(c) => onChange({ fill: c })} />
        </div>
      </Row>

      <Row label="Text Color">
        <div className="flex items-center gap-2">
          <SwatchRow value={selected.textColor || '#111827'} onPick={(c) => onChange({ textColor: c })} />
        </div>
      </Row>
    </div>
  )
}
