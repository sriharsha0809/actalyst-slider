import React from 'react'
import { useSlides } from '../context/SlidesContext.jsx'

export default function TextColorControl() {
  const { state, dispatch } = useSlides()
  const slide = state.slides.find(s => s.id === state.currentSlideId)
  const selected = slide?.elements.find(e => e.id === state.selectedElementId)
  if (!selected || selected.type !== 'text') return null
  const styles = selected.styles || {}
  const setColor = (e) => {
    const color = e.target.value
    const next = { ...styles, color }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { styles: next } })
  }
  return (
    <div className="mt-4 space-y-2">
      <h4 className="text-sm font-semibold">Text Color</h4>
      <div className="flex items-center gap-2">
        <input type="color" value={styles.color || '#111827'} onChange={setColor} className="h-9 w-9 p-1 rounded border" />
        <input type="text" value={styles.color || '#111827'} onChange={setColor} className="flex-1 border rounded px-2 py-1 text-sm" />
      </div>
    </div>
  )
}
