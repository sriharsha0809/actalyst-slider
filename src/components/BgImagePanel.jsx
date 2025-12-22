import React, { useRef, useState } from 'react'
import { useSlides } from '../context/SlidesContext.jsx'

export default function BgImagePanel() {
  const { state, dispatch } = useSlides()
  const slide = state.slides.find(s => s.id === state.currentSlideId)
  const bg = (slide && typeof slide.background === 'object' && slide.background.type === 'image') ? slide.background : null
  const fileRef = useRef(null)

  const [isFitOpen, setIsFitOpen] = useState(false)
  const [fitClosing, setFitClosing] = useState(false)

  if (!bg) {
    return <div className="text-sm text-gray-600">No background image on this slide.</div>
  }

  const updateBg = (patch) => {
    dispatch({ type: 'UPDATE_SLIDE_BACKGROUND', slideId: slide.id, background: { ...bg, ...patch } })
  }

  const handleReplace = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      updateBg({ src: dataUrl })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const mode = bg.mode || 'cover'
  const scale = typeof bg.scale === 'number' ? bg.scale : 100
  const rawPosition = bg.position || 'center'
  const opacity = typeof bg.opacity === 'number' ? bg.opacity : 1

  const fitOptions = [
    { value: 'cover', label: 'Cover (fill)' },
    { value: 'contain', label: 'Contain' },
    { value: 'stretch', label: 'Stretch' },
    { value: 'custom', label: 'Custom Scale' },
  ]

  // Percentage-based position controls (0–100%)
  const posX = typeof bg.posX === 'number' ? bg.posX : 50
  const posY = typeof bg.posY === 'number' ? bg.posY : 50

  const setPosX = (next) => updateBg({ posX: Math.max(0, Math.min(100, next)) })
  const setPosY = (next) => updateBg({ posY: Math.max(0, Math.min(100, next)) })

  const openFit = () => {
    setFitClosing(false)
    setIsFitOpen(true)
  }

  const closeFit = () => {
    setFitClosing(true)
    setTimeout(() => {
      setIsFitOpen(false)
      setFitClosing(false)
    }, 150)
  }

  const toggleFit = () => {
    if (isFitOpen && !fitClosing) closeFit()
    else if (!isFitOpen && !fitClosing) openFit()
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-gray-900">Background Image</h3>

      {/* Fit / mode (custom grey dropdown) */}
      <div className="space-y-1">
        <div className="text-xs font-medium text-black">Fit</div>
        <div className="relative">
          <button
            type="button"
            onClick={toggleFit}
            className="w-full text-sm rounded-lg border border-gray-300 bg-white/90 px-2 py-1.5 shadow-sm flex items-center justify-between text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-700"
          >
            <span>
              {mode === 'cover' && 'Cover (fill)'}
              {mode === 'contain' && 'Contain'}
              {mode === 'stretch' && 'Stretch'}
              {mode === 'custom' && 'Custom Scale'}
            </span>
            <span className="ml-2 text-[10px] text-gray-500">▴▾</span>
          </button>

          {isFitOpen && (
            <div
              className={`${fitClosing ? 'bg-dropdown-menu-close' : 'bg-dropdown-menu-open'} absolute left-0 right-0 mt-1 rounded-lg border border-gray-300 bg-white shadow-lg overflow-hidden z-10`}
            >
              {fitOptions.map((opt) => {
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      updateBg({ mode: opt.value })
                      closeFit()
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${mode === opt.value
                      ? 'bg-gray-100 text-black'
                      : 'bg-white text-gray-800 hover:bg-gray-100'
                      }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Custom scale */}
      {mode === 'custom' && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-black">
            <span className="font-medium">Scale</span>
            <span className="font-medium">{scale}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="200"
            step="1"
            value={scale}
            onChange={(e) => updateBg({ scale: Number(e.target.value) })}
            className="w-full accent-gray-700"
          />
        </div>
      )}

      {/* Opacity */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-black">
          <span className="font-medium">Opacity</span>
          <span className="font-medium">{Math.round(Math.max(0, Math.min(1, opacity)) * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={opacity}
          onChange={(e) => updateBg({ opacity: Number(e.target.value) })}
          className="w-full accent-gray-700"
        />
      </div>

      {/* Position */}
      <div className="space-y-3">
        <div className="text-xs font-medium text-black">Position</div>

        {/* Horizontal position (left/right) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-black">
            <span>Horizontal</span>
            <span className="font-medium">{Math.round(posX)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={posX}
            onChange={(e) => setPosX(Number(e.target.value))}
            className="w-full accent-gray-700"
          />
        </div>

        {/* Vertical position (top/bottom) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-black">
            <span>Vertical</span>
            <span className="font-medium">{Math.round(posY)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={posY}
            onChange={(e) => setPosY(Number(e.target.value))}
            className="w-full accent-gray-700"
          />
        </div>

      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white/80 text-sm text-gray-800 shadow-sm hover:bg-gray-100 transition"
        >
          Replace Image
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'UPDATE_SLIDE_BACKGROUND', slideId: slide.id, background: null })}
          className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-sm text-red-600 shadow-sm hover:bg-red-100 transition"
        >
          Remove
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleReplace} />
    </div>
  )
}
