import React, { useRef } from 'react'
import { useSlides } from '../context/SlidesContext.jsx'

export default function BgImagePanel() {
  const { state, dispatch } = useSlides()
  const slide = state.slides.find(s => s.id === state.currentSlideId)
  const bg = (slide && typeof slide.background === 'object' && slide.background.type === 'image') ? slide.background : null
  const fileRef = useRef(null)

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
  const position = bg.position || 'center'

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Background Image</h3>

      <div className="space-y-1">
        <div className="text-xs text-gray-600">Fit</div>
        <select
          value={mode}
          onChange={(e)=>updateBg({ mode: e.target.value })}
          className="w-full border rounded px-2 py-1 text-sm"
        >
          <option value="cover">Cover (fill)</option>
          <option value="contain">Contain</option>
          <option value="stretch">Stretch</option>
          <option value="custom">Custom Scale</option>
        </select>
      </div>

      {mode === 'custom' && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600"><span>Scale</span><span>{scale}%</span></div>
          <input type="range" min="50" max="200" step="1" value={scale} onChange={(e)=>updateBg({ scale: Number(e.target.value) })} className="w-full" />
        </div>
      )}

      <div className="space-y-1">
        <div className="text-xs text-gray-600">Position</div>
        <select
          value={position}
          onChange={(e)=>updateBg({ position: e.target.value })}
          className="w-full border rounded px-2 py-1 text-sm"
        >
          <option value="center">Center</option>
          <option value="left top">Top Left</option>
          <option value="center top">Top</option>
          <option value="right top">Top Right</option>
          <option value="left center">Left</option>
          <option value="right center">Right</option>
          <option value="left bottom">Bottom Left</option>
          <option value="center bottom">Bottom</option>
          <option value="right bottom">Bottom Right</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => fileRef.current?.click()} className="px-3 py-1.5 rounded border text-sm">Replace Image</button>
        <button onClick={() => dispatch({ type: 'UPDATE_SLIDE_BACKGROUND', slideId: slide.id, background: '#ffffff' })} className="px-3 py-1.5 rounded border text-sm text-red-600">Remove</button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleReplace} />
    </div>
  )
}
