import React, { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSlides } from '../context/SlidesContext.jsx'
import KeynoteBarChart from './KeynoteBarChart.jsx'
import KeynoteLineChart from './KeynoteLineChart.jsx'
import KeynotePieChart from './KeynotePieChart.jsx'

// Keynote-style Chart Sidebar
// Tabs: Style | Legend
// - Style: choose chart variant per type, edit data (open editor / transpose)
// - Legend: show/hide legend

class PreviewBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError: false } }
  static getDerivedStateFromError(){ return { hasError: true } }
  componentDidCatch(err){ try { console.error('[Chart preview error]', err) } catch {}
  }
  render(){ if (this.state.hasError) return <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Preview unavailable</div>; return this.props.children }
}

export default function ChartSidebar() {
  const { state, dispatch } = useSlides()
  const currentSlide = state.slides.find(s => s.id === state.currentSlideId)
  const selected = currentSlide?.elements.find(e => e.id === state.selectedElementId)

  // If no chart is selected, show a friendly message and avoid accessing selected/chartType.
  if (!selected || selected.type !== 'chart') {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-sm">Select a chart to edit</p>
      </div>
    )
  }

  const [tab, setTab] = React.useState('Style')
  const [hoveredKey, setHoveredKey] = React.useState(null)
  const [hoveredPalette, setHoveredPalette] = React.useState(null)
  const [hoveredGradient, setHoveredGradient] = React.useState(null)
  // Keynote-like palette sets
  const PALETTES_ALL = [
    { key: 'classic', label: 'Keynote Classic Bright', colors: ['#007AFF','#34C759','#FF9500','#FF3B30','#AF52DE','#5856D6','#5AC8FA','#FFCC00'] },
    { key: 'professional', label: 'Keynote Professional', colors: ['#4A90E2','#50E3C2','#F5A623','#D0021B','#7B4397','#417505'] },
    { key: 'pastel', label: 'Keynote Pastel', colors: ['#A4C6FF','#B8F1D6','#FFE3A4','#FFBED1','#DCCAFF','#D0E8FF'] },
    { key: 'dark', label: 'Keynote Dark Mode', colors: ['#5AC8FA','#4CD964','#FF9500','#FF3B30','#5856D6','#8E8E93'] },
    { key: 'minimal', label: 'Keynote Minimal/Neutral', colors: ['#3A7BF6','#F06292','#7986CB','#4DB6AC','#BA68C8','#E57373'] },
    { key: 'colorblind', label: 'Keynote Colorblind Friendly', colors: ['#2D7DD2','#F25F5C','#FFE066','#70C1B3','#50514F','#247BA0'] },
  ]
  const GRADIENTS = [
    { key: 'grad-blue', label: 'Blue Gradient', base: '#007AFF', from: '#64B5FF', to: '#007AFF' },
    { key: 'grad-green', label: 'Green Gradient', base: '#34C759', from: '#81F5A3', to: '#34C759' },
    { key: 'grad-purple', label: 'Purple Gradient', base: '#AF52DE', from: '#C7AFFF', to: '#AF52DE' },
    { key: 'grad-orange', label: 'Orange Gradient', base: '#FF9500', from: '#FFC68A', to: '#FF9500' },
  ]

  const applyPalette = (colors) => {
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { chartPalette: { colors }, chartColor: null } })
  }
  const applyGradient = (base) => {
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { chartColor: { color: base, mode: 'gradient' }, chartPalette: null } })
  }

  // Chart type and basic options (must be defined before they're used below)
  const chartType = selected.chartType
  const variant = selected.chartStyle || (chartType === 'line' ? 'simple' : '2d')
  const legendShow = selected.legendOptions?.show !== false
  const legendOpts = selected.legendOptions || {}
  const legendTitleEnabled = !!legendOpts.titleEnabled
  const legendContextEnabled = !!legendOpts.contextEnabled
  const legendTitleText = legendOpts.titleText || ''
  const legendContextText = legendOpts.contextText || ''
  const legendBgMode = legendOpts.bgMode || 'transparent'
  const legendBgColor = legendOpts.bgColor || '#ffffff'
  const legendBorderMode = legendOpts.borderMode || 'transparent'
  const legendBorderColor = legendOpts.borderColor || '#CBD5E1'
  const xAxisEnabled = !!legendOpts.xAxisEnabled
  const xAxisLabel = legendOpts.xAxisLabel || ''
  const yAxisEnabled = !!legendOpts.yAxisEnabled
  const yAxisLabel = legendOpts.yAxisLabel || ''
  const showXAxis = legendOpts.showXAxis !== false
  const showYAxis = legendOpts.showYAxis !== false
  const showMinorGridlines = !!legendOpts.showMinorGridlines
  const minorGridlineOpacity = legendOpts.minorGridlineOpacity ?? 0.45

  // Recommended subsets per chart type
  const isDonut = chartType === 'pie' && (selected.chartStyle === 'donut' || selected.chartStyle === 'ring')
  const palettesForType = React.useMemo(() => {
    // Always offer the full palette families, but we will prepend a "Recommended" card per type optionally later.
    return PALETTES_ALL
  }, [chartType, isDonut])

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

  const updateLegendOptions = (patch) => {
    const next = { ...(selected.legendOptions || {}), ...patch }
    dispatch({ type: 'UPDATE_ELEMENT', id: selected.id, patch: { legendOptions: next } })
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Top nav */}
      <nav className="text-sm border-b border-gray-200">
        <ul className="flex">
          {['Style','Legend'].map((t) => (
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

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex-1"
        >
          {tab === 'Style' && (
            <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3">
              <div>
                <div className="text-xs text-gray-600 mb-2">Variant</div>
                <div className="grid grid-cols-2 gap-2" style={{ overflowX: 'hidden' }}>
                  {variants.map(v => {
                    const isSel = variant === v.key
                    const isHover = hoveredKey === v.key
                    const baseStyle = {
                      background: '#ffffff',
                      border: '1px solid rgba(0,0,0,0.10)',
                      borderRadius: 10,
                      padding: '6px 8px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      transform: 'scale(1)',
                      transition: 'transform 160ms ease, background-color 160ms ease, border 160ms ease, box-shadow 160ms ease'
                    }
                    const hoverStyle = isHover ? {
                      transform: 'scale(1.01)',
                      background: '#ffffff',
                      border: '1px solid rgba(0,0,0,0.18)',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.10)'
                    } : {}
                    const selectedStyle = isSel ? {
                      transform: 'scale(1.01)',
                      background: '#ffffff',
                      border: '1px solid rgba(0,122,255,0.55)',
                      boxShadow: '0 0 0 2px rgba(0,122,255,0.25) inset',
                    } : {}
                    const style = { ...baseStyle, ...(isSel ? selectedStyle : hoverStyle) }
                    return (
                      <button
                        key={v.key}
                        onMouseEnter={() => setHoveredKey(v.key)}
                        onMouseLeave={() => setHoveredKey(null)}
                        onFocus={() => setHoveredKey(v.key)}
                        onBlur={() => setHoveredKey(null)}
                        onClick={() => setVariant(v.key)}
                        className="rounded-lg focus:outline-none focus:ring-0 flex items-center justify-center text-center"
                        style={{ ...style, minHeight: 32, width: 104, overflow: 'hidden' }}
                        title={v.title}
                      >
                        <span className="text-[12px] font-medium text-gray-800 truncate w-full">{v.title}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Color presets (multi-color palettes) */}
              <div className="mt-3">
                <div className="text-xs text-gray-600 mb-2">Colors</div>
                <div className="grid grid-cols-3 gap-2 px-1" style={{ overflowX: 'hidden' }}>
                  {palettesForType.map((p) => {
                    const isSel = Array.isArray(selected?.chartPalette?.colors) && JSON.stringify(selected.chartPalette.colors) === JSON.stringify(p.colors)
                    const isHover = hoveredPalette === p.key
                    const baseStyle = {
                      background: '#ffffff',
                      border: '1px solid rgba(0,0,0,0.10)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      borderRadius: 10,
                      padding: 6,
                      boxSizing: 'border-box',
                      transition: 'transform 160ms ease, box-shadow 160ms ease, border 160ms ease, background-color 160ms ease',
                      transform: 'scale(1)',
                      minHeight: 64,
                      width: '100%',
                      overflow: 'hidden',
                    }
                    const hoverStyle = isHover ? {
                      transform: 'scale(1.01)',
                      border: '1px solid rgba(0,0,0,0.18)',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.10)',
                    } : {}
                    const selectedStyle = isSel ? {
                      transform: 'scale(1.01)',
                      border: '1px solid rgba(0,122,255,0.55)',
                      boxShadow: '0 0 0 2px rgba(0,122,255,0.25) inset',
                    } : {}
                    const cardStyle = { ...baseStyle, ...(isSel ? selectedStyle : hoverStyle) }
                    const cols = p.colors
                    return (
                      <button
                        key={p.key}
                        onMouseEnter={() => setHoveredPalette(p.key)}
                        onMouseLeave={() => setHoveredPalette(null)}
                        onFocus={() => setHoveredPalette(p.key)}
                        onBlur={() => setHoveredPalette(null)}
                        onClick={()=>applyPalette(p.colors)}
                        title={p.label}
                        className="rounded-lg focus:outline-none focus:ring-0 flex items-center justify-center"
                        style={cardStyle}
                      >
                        {/* Chart-style thumbnail using palette colors, matching current chart type */}
                        {chartType === 'pie' && (
                          <svg width="56" height="28" viewBox="0 0 56 28" aria-hidden>
                            {/* Base circle */}
                            <circle cx="28" cy="14" r="10" fill={cols[0]} />
                            {/* Slice 1 */}
                            <path d="M28 14 L28 4 A 10 10 0 0 1 38 14 Z" fill={cols[1 % cols.length]} />
                            {/* Slice 2 */}
                            <path d="M28 14 L38 14 A 10 10 0 0 1 28 24 Z" fill={cols[2 % cols.length]} />
                          </svg>
                        )}
                        {chartType === 'line' && (
                          <svg width="56" height="28" viewBox="0 0 56 28" aria-hidden>
                            {/* Simple axes */}
                            <line x1="6" y1="22" x2="50" y2="22" stroke="#E0E0E0" strokeWidth="1" />
                            <line x1="8" y1="4" x2="8" y2="22" stroke="#E0E0E0" strokeWidth="1" />
                            {/* Line 1 */}
                            <polyline
                              points="8,20 18,14 28,16 38,10 48,12"
                              fill="none"
                              stroke={cols[0]}
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {/* Line 2 */}
                            <polyline
                              points="8,18 18,16 28,12 38,14 48,8"
                              fill="none"
                              stroke={cols[1 % cols.length]}
                              strokeWidth="1.3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                        {chartType === 'bar' && (
                          <svg width="56" height="28" viewBox="0 0 56 28" aria-hidden>
                            {/* Baseline */}
                            <line x1="6" y1="22" x2="50" y2="22" stroke="#E0E0E0" strokeWidth="1" />
                            {/* Bars using first few palette colors */}
                            <rect x="8"  y="12" width="6" height="10" rx="2" fill={cols[0]} />
                            <rect x="18" y="8"  width="6" height="14" rx="2" fill={cols[1 % cols.length]} />
                            <rect x="28" y="6"  width="6" height="16" rx="2" fill={cols[2 % cols.length]} />
                            <rect x="38" y="10" width="6" height="12" rx="2" fill={cols[3 % cols.length]} />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Gradients (bar, pie; modern themes) */}
              {(chartType === 'bar' || chartType === 'pie') && (
                <div className="mt-3">
                  <div className="text-xs text-gray-600 mb-2">Gradients</div>
                  <div className="grid grid-cols-2 gap-2 px-1" style={{ overflowX: 'hidden' }}>
                    {GRADIENTS.map((g) => {
                      const isSel = selected?.chartColor?.mode==='gradient' && selected?.chartColor?.color===g.base
                      const isHover = hoveredGradient === g.key
                      const baseStyle = {
                        background: '#ffffff',
                        border: '1px solid rgba(0,0,0,0.10)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        borderRadius: 10,
                        padding: 6,
                        boxSizing: 'border-box',
                        transition: 'transform 160ms ease, box-shadow 160ms ease, border 160ms ease, background-color 160ms ease',
                        transform: 'scale(1)',
                        minHeight: 64,
                        width: '100%',
                        overflow: 'hidden',
                      }
                      const hoverStyle = isHover ? {
                        transform: 'scale(1.01)',
                        border: '1px solid rgba(0,0,0,0.18)',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.10)',
                      } : {}
                      const selectedStyle = isSel ? {
                        transform: 'scale(1.01)',
                        border: '1px solid rgba(0,122,255,0.55)',
                        boxShadow: '0 0 0 2px rgba(0,122,255,0.25) inset',
                      } : {}
                      const cardStyle = { ...baseStyle, ...(isSel ? selectedStyle : hoverStyle) }
                      return (
                        <button
                          key={g.key}
                          onMouseEnter={() => setHoveredGradient(g.key)}
                          onMouseLeave={() => setHoveredGradient(null)}
                          onFocus={() => setHoveredGradient(g.key)}
                          onBlur={() => setHoveredGradient(null)}
                          onClick={()=>applyGradient(g.base)}
                          title={g.label}
                          className="rounded-lg focus:outline-none focus:ring-0 flex items-center justify-center"
                          style={cardStyle}
                        >
                          <svg width="56" height="28" viewBox="0 0 56 28" aria-hidden>
                            <defs>
                              <linearGradient id={`g-${g.key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={g.from}/>
                                <stop offset="100%" stopColor={g.to}/>
                              </linearGradient>
                            </defs>
                            <rect x="8" y="8" width="40" height="12" rx="3" fill={`url(#g-${g.key})`} />
                          </svg>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Data controls moved into Style tab */}
              <div className="mt-3">
                <div className="text-xs text-gray-600 mb-2">Data</div>
                <div className="flex gap-2 mb-1">
                  <button onClick={openDataEditor} className="px-3 py-2 rounded-md bg-blue-600 text-white text-xs font-medium">Open Data Editor</button>
                  <button onClick={transpose} className="px-3 py-2 rounded-md border border-gray-300 text-xs">Transpose</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'Legend' && (
            <div className="flex-1 overflow-auto space-y-3 px-1">
              {/* Legend visibility */}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={legendShow} onChange={(e)=> setLegendShow(e.target.checked)} />
                Show legend labels
              </label>

              {/* Chart title toggle + input */}
              <div className="space-y-1 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={legendTitleEnabled}
                    onChange={(e)=> updateLegendOptions({ titleEnabled: e.target.checked })}
                  />
                  Title
                </label>
                {legendTitleEnabled && (
                  <input
                    type="text"
                    value={legendTitleText}
                    onChange={(e)=> updateLegendOptions({ titleText: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs"
                    placeholder="Chart title"
                  />
                )}
              </div>

              {/* Chart context toggle + input */}
              <div className="space-y-1 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={legendContextEnabled}
                    onChange={(e)=> updateLegendOptions({ contextEnabled: e.target.checked })}
                  />
                  Context
                </label>
                {legendContextEnabled && (
                  <textarea
                    value={legendContextText}
                    onChange={(e)=> updateLegendOptions({ contextText: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs resize-none"
                    rows={2}
                    placeholder="Describe what this chart shows"
                  />
                )}
              </div>

              {/* Chart background options */}
              <div className="space-y-1 text-sm">
                <div className="text-xs text-gray-600">Chart background</div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name="chart-bg-mode"
                      checked={legendBgMode === 'transparent'}
                      onChange={() => updateLegendOptions({ bgMode: 'transparent' })}
                    />
                    Transparent
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name="chart-bg-mode"
                      checked={legendBgMode === 'color'}
                      onChange={() => updateLegendOptions({ bgMode: 'color' })}
                    />
                    Colorful
                  </label>
                  {legendBgMode === 'color' && (
                    <input
                      type="color"
                      value={legendBgColor}
                      onChange={(e)=> updateLegendOptions({ bgColor: e.target.value })}
                      className="w-6 h-6 border border-gray-300 rounded"
                    />
                  )}
                </div>
              </div>

              {/* Chart border options */}
              <div className="space-y-1 text-sm">
                <div className="text-xs text-gray-600">Chart border</div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name="chart-border-mode"
                      checked={legendBorderMode === 'transparent'}
                      onChange={() => updateLegendOptions({ borderMode: 'transparent' })}
                    />
                    Transparent
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name="chart-border-mode"
                      checked={legendBorderMode === 'color'}
                      onChange={() => updateLegendOptions({ borderMode: 'color' })}
                    />
                    Colorful
                  </label>
                  {legendBorderMode === 'color' && (
                    <input
                      type="color"
                      value={legendBorderColor}
                      onChange={(e)=> updateLegendOptions({ borderColor: e.target.value })}
                      className="w-6 h-6 border border-gray-300 rounded"
                    />
                  )}
                </div>
              </div>

              {/* Only show axis options for bar and line charts */}
              {(chartType === 'bar' || chartType === 'line') && (
                <>
                  {/* X-axis visibility */}
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showXAxis}
                      onChange={(e)=> updateLegendOptions({ showXAxis: e.target.checked })}
                    />
                    Show X-axis
                  </label>

                  {/* Y-axis visibility */}
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showYAxis}
                      onChange={(e)=> updateLegendOptions({ showYAxis: e.target.checked })}
                    />
                    Show Y-axis
                  </label>

                  {/* Minor gridlines */}
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showMinorGridlines}
                      onChange={(e)=> updateLegendOptions({ showMinorGridlines: e.target.checked })}
                    />
                    Show minor gridlines
                  </label>
                  {showMinorGridlines && (
                    <div className="pl-6 space-y-1 text-xs text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Opacity</span>
                        <span>{Math.round((minorGridlineOpacity ?? 0.45) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={minorGridlineOpacity}
                        onChange={(e)=> {
                          const value = parseFloat(e.target.value)
                          updateLegendOptions({ minorGridlineOpacity: Number.isFinite(value) ? value : 0.45 })
                        }}
                        className="w-full accent-black"
                      />
                    </div>
                  )}

                  {/* X-axis name toggle + input */}
                  <div className="space-y-1 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={xAxisEnabled}
                        onChange={(e)=> updateLegendOptions({ xAxisEnabled: e.target.checked })}
                      />
                      Name of the X-axis
                    </label>
                    {xAxisEnabled && (
                      <input
                        type="text"
                        value={xAxisLabel}
                        onChange={(e)=> updateLegendOptions({ xAxisLabel: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs"
                        placeholder="Enter X-axis label"
                      />
                    )}
                  </div>

                  {/* Y-axis name toggle + input */}
                  <div className="space-y-1 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={yAxisEnabled}
                        onChange={(e)=> updateLegendOptions({ yAxisEnabled: e.target.checked })}
                      />
                      Name of the Y-axis
                    </label>
                    {yAxisEnabled && (
                      <input
                        type="text"
                        value={yAxisLabel}
                        onChange={(e)=> updateLegendOptions({ yAxisLabel: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs"
                        placeholder="Enter Y-axis label"
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function toStructured(el){
  const labels = Array.isArray(el.labels) ? el.labels : []
  const data = Array.isArray(el.data) ? el.data : []
  return { categories: labels, series: [{ name: 'Series 1', data }] }
}

function ChartVariantPreview({ el, chartType, variantKey }){
  if (!el || chartType == null) return null
  try {
  // Build small data sample from element's structuredData to reflect live colors/labels
  const structured = el.structuredData || toStructured(el)
  const isHorizontal = chartType === 'bar' && typeof variantKey === 'string' && variantKey.includes('horizontal')
  const cats = structured.categories.slice(0, isHorizontal ? 4 : 6)
  const series = structured.series && structured.series.length ? structured.series : [{ name: 'Series 1', data: el.data || [] }]
  const legend = false // hide legend in previews
  const centerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }
  if (chartType === 'bar') {
    const data = cats.map((name, i) => {
      const point = { name }
      series.forEach((s, idx) => { point[idx === 0 ? 'value' : `v${idx+1}`] = Number(s.data?.[i]) || 0 })
      return point
    })
return <div style={centerStyle}><div style={{ width: 'calc(100% - 6px)', height: 'calc(100% - 6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><KeynoteBarChart data={data} variant={variantKey} showLegend={legend} showTooltip={false} showAxes={false} showGrid={false} margin={isHorizontal ? { top: 2, right: 6, bottom: 2, left: 6 } : { top: 0, right: 0, bottom: 0, left: 0 }} scale={0.95} /></div></div>
  }
  if (chartType === 'line') {
    const data = cats.map((name, i) => {
      const point = { name }
      series.forEach((s, idx) => { point[idx === 0 ? 'value' : `v${idx+1}`] = Number(s.data?.[i]) || 0 })
      return point
    })
return <div style={centerStyle}><div style={{ width: 'calc(100% - 6px)', height: 'calc(100% - 6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><KeynoteLineChart data={data} variant={variantKey} showLegend={legend} showTooltip={false} showAxes={false} showGrid={false} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} scale={0.85} /></div></div>
  }
  if (chartType === 'pie') {
    const s0 = series[0]?.data || []
    const data = cats.map((name, i) => ({ name, value: Number(s0[i]) || 0 }))
    return <div style={centerStyle}><div style={{ width: 'calc(100% - 6px)', height: 'calc(100% - 6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><KeynotePieChart data={data} variant={variantKey} animateKey={el.id} showLegend={legend} showTooltip={false} /></div></div>
  }
  return null
  } catch (e) {
    try { console.error('[ChartVariantPreview] failed:', e) } catch {}
    return <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Preview error</div>
  }
}
