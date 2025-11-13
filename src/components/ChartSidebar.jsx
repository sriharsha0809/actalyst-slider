import React, { useMemo } from 'react'
import { useSlides } from '../context/SlidesContext.jsx'

// Keynote-style Chart Sidebar
// Tabs: Style | Data | Legend
// - Style: choose chart variant per type
// - Data: open data editor, transpose
// - Legend: show/hide legend

export default function ChartSidebar() {
  const { state, dispatch } = useSlides()
  const currentSlide = state.slides.find(s => s.id === state.currentSlideId)
  const selected = currentSlide?.elements.find(e => e.id === state.selectedElementId)
  const [tab, setTab] = React.useState('Style')

  if (!selected || selected.type !== 'chart') {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-sm">Select a chart to edit</p>
      </div>
    )
  }

  const chartType = selected.chartType
  const variant = selected.chartStyle || (chartType === 'line' ? 'simple' : '2d')
  const legendShow = selected.legendOptions?.show !== false

  const variants = useMemo(() => {
    if (chartType === 'bar') {
      return [
        { key: '2d', title: '2D Standard' },
        { key: 'stacked', title: '2D Stacked' },
        { key: 'gradient', title: '2D Gradient' },
        { key: 'rounded', title: '2D Rounded' },
        { key: 'horizontal', title: 'Horizontal' },
        { key: 'horizontal-stacked', title: 'Horizontal Stacked' },
      ]
    } else if (chartType === 'pie') {
      return [
        { key: '2d', title: '2D Pie' },
        { key: 'donut', title: 'Doughnut' },
        { key: 'flat-mono', title: 'Monochrome' },
        { key: 'gradient', title: 'Gradient' },
        { key: 'minimal', title: 'Minimal' },
      ]
    } else {
      // line
      return [
        { key: 'simple', title: '2D Line' },
        { key: 'smooth', title: 'Smooth' },
        { key: 'markers', title: 'Markers' },
        { key: 'dashed', title: 'Dashed' },
        { key: 'step', title: 'Step' },
        { key: 'gradient', title: 'Gradient Stroke' },
      ]
    }
  }, [chartType])

  const setVariant = (v) => {
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { chartStyle: v } })
  }

  const openDataEditor = () => {
    try {
      const structured = selected.structuredData || toStructured(selected)
      window.openChartEditor?.(selected.id, chartType, structured)
    } catch {}
  }

  const transpose = () => {
    const structured = selected.structuredData || toStructured(selected)
    const seriesCount = structured.series.length
    const catCount = structured.categories.length
    const nextSeries = Array.from({ length: catCount }, (_, i) => ({ name: String(structured.categories[i] ?? `S${i+1}`), data: [] }))
    const nextCategories = Array.from({ length: seriesCount }, (_, i) => structured.series[i]?.name ?? `Cat ${i+1}`)
    for (let r = 0; r < seriesCount; r++) {
      for (let c = 0; c < catCount; c++) {
        const val = Number(structured.series[r]?.data?.[c]) || 0
        nextSeries[c].data.push(val)
      }
    }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { structuredData: { categories: nextCategories, series: nextSeries } } })
  }

  const setLegendShow = (show) => {
    const next = { ...(selected.legendOptions || {}), show }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { legendOptions: next } })
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Top nav */}
      <nav className="text-sm border-b border-gray-200">
        <ul className="flex">
          {['Style','Data','Legend'].map((t) => (
            <li key={t}>
              <button
                onClick={() => setTab(t)}
                className={`px-4 py-2 -mb-px border-b-2 ${tab===t ? 'border-black text-black font-semibold' : 'border-transparent text-gray-600 hover:text-black hover:border-gray-300'}`}
              >
                {t}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {tab === 'Style' && (
        <div className="flex-1 overflow-auto space-y-3">
          <div>
            <div className="text-xs text-gray-600 mb-2">Variant</div>
            <div className="grid grid-cols-2 gap-2">
              {variants.map(v => (
                <button key={v.key} onClick={() => setVariant(v.key)} className={`px-2 py-2 rounded-md text-sm border ${variant===v.key?'border-blue-600 bg-blue-50':'border-gray-300 hover:bg-gray-50'}`}>{v.title}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'Data' && (
        <div className="flex-1 overflow-auto space-y-3">
          <div className="flex gap-2">
            <button onClick={openDataEditor} className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm">Open Data Editor</button>
            <button onClick={transpose} className="px-3 py-2 rounded-md border border-gray-300 text-sm">Transpose</button>
          </div>
          <p className="text-xs text-gray-500">Use the data editor to add/remove series and categories.</p>
        </div>
      )}

      {tab === 'Legend' && (
        <div className="flex-1 overflow-auto space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={legendShow} onChange={(e)=> setLegendShow(e.target.checked)} />
            Show legend
          </label>
        </div>
      )}
    </div>
  )
}

function toStructured(el){
  const labels = Array.isArray(el.labels) ? el.labels : []
  const data = Array.isArray(el.data) ? el.data : []
  return { categories: labels, series: [{ name: 'Series 1', data }] }
}
