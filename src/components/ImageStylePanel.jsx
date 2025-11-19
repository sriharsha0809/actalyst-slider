import React from 'react'
import { useSlides } from '../context/SlidesContext.jsx'

export default function ImageStylePanel() {
  const { state, dispatch } = useSlides()
  const [shapeMenuOpen, setShapeMenuOpen] = React.useState(false)
  const currentSlide = state.slides.find(s => s.id === state.currentSlideId)
  const selected = currentSlide?.elements.find(e => e.id === state.selectedElementId)

  if (!selected || selected.type !== 'image') {
    return <div className="text-sm text-gray-600">Select an image to edit its style.</div>
  }

  const opacity = selected.opacity == null ? 1 : selected.opacity
  const showTitle = !!selected.showTitle
  const showCaption = !!selected.showCaption
  const showShadow = !!selected.showShadow
  const title = selected.title || ''
  const caption = selected.caption || ''
  const titleColor = selected.titleColor || '#111827'
  const titleFontSize = selected.titleFontSize || 12
  const captionColor = selected.captionColor || '#4b5563'
  const captionFontSize = selected.captionFontSize || 11
  const shadowOpacity = typeof selected.shadowOpacity === 'number' ? selected.shadowOpacity : 0.35
  const cornerRadiusTL = typeof selected.cornerRadiusTL === 'number' ? selected.cornerRadiusTL : 8
  const cornerRadiusTR = typeof selected.cornerRadiusTR === 'number' ? selected.cornerRadiusTR : 8
  const cornerRadiusBR = typeof selected.cornerRadiusBR === 'number' ? selected.cornerRadiusBR : 8
  const cornerRadiusBL = typeof selected.cornerRadiusBL === 'number' ? selected.cornerRadiusBL : 8
  const shapePreset = selected.shapePreset || 'rounded'
  const rawFilterPreset = selected.filterPreset || 'original'
  const filterPreset = rawFilterPreset === 'cinematic' ? 'landscape' : rawFilterPreset
  const filterStrength = typeof selected.filterStrength === 'number' ? selected.filterStrength : 1

  const update = (patch) => {
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch })
  }

  const setOpacity = (val) => {
    const value = Math.max(0, Math.min(1, Number(val) || 0))
    update({ opacity: value })
  }

  const toggleTitle = (checked) => {
    update({ showTitle: !!checked })
  }

  const toggleCaption = (checked) => {
    update({ showCaption: !!checked })
  }

  const toggleShadow = (checked) => {
    update({ showShadow: !!checked })
  }

  const setShadowOpacity = (value) => {
    const n = Number(value)
    if (!Number.isFinite(n)) return
    // clamp 0..1
    const clamped = Math.max(0, Math.min(1, n))
    update({ shadowOpacity: clamped })
  }

  const setTitle = (value) => {
    update({ title: value })
  }

  const setCaption = (value) => {
    update({ caption: value })
  }

  const setTitleColor = (value) => {
    update({ titleColor: value })
  }

  const setCaptionColor = (value) => {
    update({ captionColor: value })
  }

  const setTitleFontSize = (value) => {
    const n = parseInt(value, 10)
    if (!Number.isFinite(n)) return
    update({ titleFontSize: Math.max(8, Math.min(72, n)) })
  }

  const setCaptionFontSize = (value) => {
    const n = parseInt(value, 10)
    if (!Number.isFinite(n)) return
    update({ captionFontSize: Math.max(8, Math.min(72, n)) })
  }

  const applyFilterPreset = (preset) => {
    // Mark non-original as preset; user tweaks later become 'custom' if needed
    update({ filterPreset: preset })
  }

  const setFilterStrength = (val) => {
    const n = Number(val)
    if (!Number.isFinite(n)) return
    const clamped = Math.max(0, Math.min(1, n))
    update({ filterStrength: clamped })
  }

  const setCornerRadius = (corner, value) => {
    const n = parseInt(value, 10)
    if (!Number.isFinite(n)) return
    const clamped = Math.max(0, Math.min(200, n))
    update({ [corner]: clamped, shapePreset: 'custom' })
  }

  const applyShapePreset = (preset) => {
    const w = typeof selected.w === 'number' ? selected.w : 0
    const h = typeof selected.h === 'number' ? selected.h : 0
    const minSide = Math.max(1, Math.min(w || h || 1, 4000))

    let patch = { shapePreset: preset }

    if (preset === 'rectangle') {
      // Force a non-square, landscape-oriented rectangle: height < width
      const base = minSide || 1
      const height = base
      const width = Math.round(base * 1.5)
      patch = {
        ...patch,
        w: width,
        h: height,
        cornerRadiusTL: 0,
        cornerRadiusTR: 0,
        cornerRadiusBR: 0,
        cornerRadiusBL: 0,
      }
    } else if (preset === 'square') {
      // Perfect square: width === height
      const side = minSide
      patch = {
        ...patch,
        w: side,
        h: side,
        cornerRadiusTL: 0,
        cornerRadiusTR: 0,
        cornerRadiusBR: 0,
        cornerRadiusBL: 0,
      }
    } else if (preset === 'circle') {
      const side = minSide
      const r = Math.round(side / 2)
      patch = {
        ...patch,
        w: side,
        h: side,
        cornerRadiusTL: r,
        cornerRadiusTR: r,
        cornerRadiusBR: r,
        cornerRadiusBL: r,
      }
    } else if (preset === 'rounded') {
      const r = 12
      patch = {
        ...patch,
        cornerRadiusTL: r,
        cornerRadiusTR: r,
        cornerRadiusBR: r,
        cornerRadiusBL: r,
      }
    } else if (preset === 'squircle') {
      const r = 24
      patch = {
        ...patch,
        cornerRadiusTL: r,
        cornerRadiusTR: r,
        cornerRadiusBR: r,
        cornerRadiusBL: r,
      }
    } else {
      patch = { ...patch, shapePreset: 'custom' }
    }

    update(patch)
  }

  return (
    <div className="image-inspector space-y-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/70 pl-2 pr-3 py-3 shadow-sm overflow-x-hidden">
      <div className="flex items-center justify-between mb-1 px-2 py-1 rounded-xl bg-gradient-to-r from-white/95 via-white/80 to-white/90 shadow-[0_1px_4px_rgba(15,23,42,0.12)] border border-white/80 backdrop-blur-sm">
        <h3 className="font-semibold text-sm tracking-tight text-gray-900">Image</h3>
        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">INSPECTOR</span>
      </div>

      {/* Image color presets / looks */}
      <div className="space-y-1 mb-1">
        <div className="text-[11px] font-medium text-gray-600 mb-1">Looks</div>
        <div className="grid grid-cols-4 gap-2">
          {[{ key: 'original', label: 'Original' }, { key: 'hdr', label: 'HDR' }, { key: 'landscape', label: 'Landscape' }, { key: 'bw', label: 'B & W' }].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => applyFilterPreset(opt.key)}
              className={`group flex flex-col items-center gap-1 text-[10px] ${filterPreset === opt.key ? 'text-gray-900' : 'text-gray-500'}`}
            >
              <div
                className={`w-full aspect-[4/3] rounded-md border ${filterPreset === opt.key ? 'border-black ring-1 ring-black/70' : 'border-gray-200'} overflow-hidden bg-gray-100 shadow-sm`}
              >
                {selected.src ? (
                  <img
                    src={selected.src}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{
                      filter:
                        opt.key === 'hdr'
                          ? 'saturate(1.35) contrast(1.25) brightness(1.05)'
                          : opt.key === 'landscape'
                            ? 'saturate(1.1) contrast(1.2) brightness(0.9)'
                            : opt.key === 'bw'
                              ? 'grayscale(1) contrast(1.15)'
                              : 'none',
                      transition: 'filter 180ms ease-out',
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300" />
                )}
              </div>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter intensity */}
      <div className="space-y-1 mb-1">
        <div className="flex items-center justify-between text-[11px] font-medium text-gray-600">
          <span>Filter intensity</span>
          <span className="text-[10px] text-gray-400">{Math.round(filterStrength * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={filterStrength}
          onChange={(e) => setFilterStrength(e.target.value)}
          className="w-full accent-[#111827]"
        />
      </div>

      {/* Opacity */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-medium text-gray-600">
          <span>Image Opacity</span>
          <span className="text-[10px] text-gray-400">{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={opacity}
          onChange={(e) => setOpacity(e.target.value)}
          className="w-full accent-[#111827]"
        />
      </div>

      {/* Title & Caption toggles */}
      <div className="space-y-2">
        <div className="text-[11px] font-medium text-gray-600">Labels</div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              checked={showTitle}
              onChange={(e) => toggleTitle(e.target.checked)}
            />
            <span>Show title above image</span>
          </label>
          {showTitle && (
            <div className="space-y-2 pl-5">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter image title"
                className="w-full rounded-md border border-gray-200 bg-white/70 px-2 py-1 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
              <div className="flex items-center gap-3 text-[10px] text-gray-600">
                {/* Title color - round chip only */}
                <div className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/90 px-1.5 py-1 shadow-[0_1px_1.5px_rgba(15,23,42,0.08)]">
                  <input
                    type="color"
                    value={titleColor}
                    onChange={(e) => setTitleColor(e.target.value)}
                    className="color-circle h-4 w-4 rounded-full border border-black/10 cursor-pointer p-0"
                    aria-label="Title color"
                  />
                </div>
                {/* Title font size - compact pill with reduced height */}
                <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white/90 px-1.5 py-0.5 shadow-[0_1px_1.5px_rgba(15,23,42,0.08)]">
                  <span className="mr-1 text-[9px] text-gray-500">Size</span>
                  <input
                    type="number"
                    min="8"
                    max="72"
                    value={titleFontSize}
                    onChange={(e) => setTitleFontSize(e.target.value)}
                    className="h-5 w-10 border-none bg-transparent px-0.5 text-center text-[9px] text-gray-900 focus:outline-none focus:ring-0"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              checked={showCaption}
              onChange={(e) => toggleCaption(e.target.checked)}
            />
            <span>Show content below image</span>
          </label>
          {showCaption && (
            <div className="space-y-2 pl-5">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Enter content to show below the image"
                rows={3}
                className="w-full rounded-md border border-gray-200 bg-white/70 px-2 py-1 text-xs text-gray-800 resize-none focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              />
              <div className="flex items-center gap-3 text-[10px] text-gray-600">
                {/* Caption color - round chip only */}
                <div className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/90 px-1.5 py-1 shadow-[0_1px_1.5px_rgba(15,23,42,0.08)]">
                  <input
                    type="color"
                    value={captionColor}
                    onChange={(e) => setCaptionColor(e.target.value)}
                    className="color-circle h-4 w-4 rounded-full border border-black/10 cursor-pointer p-0"
                    aria-label="Caption color"
                  />
                </div>
                {/* Caption font size - compact pill with reduced height */}
                <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white/90 px-1.5 py-0.5 shadow-[0_1px_1.5px_rgba(15,23,42,0.08)]">
                  <span className="mr-1 text-[9px] text-gray-500">Size</span>
                  <input
                    type="number"
                    min="8"
                    max="72"
                    value={captionFontSize}
                    onChange={(e) => setCaptionFontSize(e.target.value)}
                    className="h-5 w-10 border-none bg-transparent px-0.5 text-center text-[9px] text-gray-900 focus:outline-none focus:ring-0"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shape presets */}
        <div className="pt-1 space-y-1 relative">
          <div className="flex items-center justify-between text-[11px] font-medium text-gray-600">
            <span>Image Shape</span>
          </div>
          <button
            type="button"
            onClick={() => setShapeMenuOpen((o) => !o)}
            className="shape-dropdown-trigger w-full flex items-center justify-between rounded-lg border border-gray-200 bg-white/90 px-2 py-1 text-[11px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 transition-colors duration-150"
          >
            <span>
              {shapePreset === 'rectangle' && 'Rectangle'}
              {shapePreset === 'square' && 'Square'}
              {shapePreset === 'circle' && 'Circle'}
              {shapePreset === 'rounded' && 'Rounded Rectangle'}
              {shapePreset === 'squircle' && 'Super Rounded'}
              {(!shapePreset || shapePreset === 'custom') && 'Custom'}
            </span>
            <span className="ml-1 text-[9px] text-gray-500">▾</span>
          </button>
          {shapeMenuOpen && (
            <div className="dropdown-panel absolute left-0 mt-1 z-20 w-full bg-white/95 rounded-xl text-[11px] text-gray-800 overflow-hidden">
              {[
                { key: 'rectangle', label: 'Rectangle' },
                { key: 'square', label: 'Square' },
                { key: 'circle', label: 'Circle' },
                { key: 'rounded', label: 'Rounded Rectangle' },
                { key: 'squircle', label: 'Super Rounded' },
                { key: 'custom', label: 'Custom' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    applyShapePreset(opt.key)
                    setShapeMenuOpen(false)
                  }}
                  className={`w-full text-left px-3 py-1.5 transition-colors duration-150 ${
                    shapePreset === opt.key ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Corners (per-corner radius) */}
        <div className="pt-1 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-gray-600">
            <span>Corners</span>
            <span className="text-[10px] text-gray-400">px</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600">
            <div className="space-y-1">
              <span className="block text-[10px] text-gray-500">Top Left</span>
              <input
                type="number"
                min="0"
                max="200"
                value={cornerRadiusTL}
                onChange={(e) => setCornerRadius('cornerRadiusTL', e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white/80 px-2 py-0.5 text-[10px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
              />
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] text-gray-500">Top Right</span>
              <input
                type="number"
                min="0"
                max="200"
                value={cornerRadiusTR}
                onChange={(e) => setCornerRadius('cornerRadiusTR', e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white/80 px-2 py-0.5 text-[10px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
              />
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] text-gray-500">Bottom Left</span>
              <input
                type="number"
                min="0"
                max="200"
                value={cornerRadiusBL}
                onChange={(e) => setCornerRadius('cornerRadiusBL', e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white/80 px-2 py-0.5 text-[10px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
              />
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] text-gray-500">Bottom Right</span>
              <input
                type="number"
                min="0"
                max="200"
                value={cornerRadiusBR}
                onChange={(e) => setCornerRadius('cornerRadiusBR', e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white/80 px-2 py-0.5 text-[10px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Shadow toggle & opacity */}
        <div className="pt-1 space-y-1">
          <label className="flex items-center gap-2 text-[11px] text-gray-700">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              checked={showShadow}
              onChange={(e) => toggleShadow(e.target.checked)}
            />
            <span>Image shadow</span>
          </label>
          {showShadow && (
            <div className="pl-5 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span>Shadow opacity</span>
                <span>{Math.round(shadowOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={shadowOpacity}
                onChange={(e) => setShadowOpacity(e.target.value)}
                className="w-full accent-[#111827]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
