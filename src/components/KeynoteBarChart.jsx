import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts'

/**
 * KeynoteBarChart.jsx
 * Minimal, slide-friendly bar chart that fills its container.
 * No outer padding or titles, so the slide selection bounds hug the chart.
 */
export default function KeynoteBarChart({ data, xKey = 'name', valueKey = 'value', showLegend = true, showTooltip = true, showAxes = true, showGrid = true, margin: marginProp = { top: 8, right: 12, bottom: 8, left: 8 }, variant = '2d' /* '2d'|'grouped'|'stacked'|'stacked100'|'3d'|'3d-grouped'|'3d-stacked'|'3d-stacked100'|'gradient'|'rounded'|'horizontal' (alias for 2d bar) */, scale = 1, animateKey = null, overrideColor = null, overridePalette = null, colorMode = 'solid', colorblindFriendly = false, seriesNames = null, xAxisLabel = null, yAxisLabel = null, showXAxis = true, showYAxis = true, showMinorGridlines = false }) {
  const demo = [
    { name: 'Jan', value: 60 },
    { name: 'Feb', value: 55 },
    { name: 'Mar', value: 78 },
    { name: 'Apr', value: 80 },
    { name: 'May', value: 54 },
    { name: 'Jun', value: 53 },
    { name: 'Jul', value: 38 },
  ]
  const dataBar = Array.isArray(data) && data.length ? data : demo
  // Apple‑style palettes: pastel (default) and saturated (3D/standard)
  const palettePastel = ['#9BD0F5', '#A9E3B1', '#F9CD9D', '#D6B3FF', '#F7A8B8', '#BDE0FE']
  const paletteStrong = ['#1E73F0', '#0BB04C', '#E07A00', '#D61F69', '#6A3FF0', '#0AA06E', '#CC1F1A']
  const paletteHC = ['#2D7DD2','#F25F5C','#FFE066','#70C1B3','#50514F']
  const basePalette = colorblindFriendly ? paletteHC : paletteStrong
  const palette = Array.isArray(overridePalette) && overridePalette.length ? overridePalette : basePalette

  // Generate a distinct color for arbitrary index using golden-angle hue spacing
  const hslToHex = (h,s,l)=>{
    s/=100; l/=100; const k=n=> (n + h/30)%12; const a=s*Math.min(l,1-l); const f=n=> l - a*Math.max(-1, Math.min(k(n)-3, Math.min(9-k(n),1))); const toHex=x=> `#${Math.round(255*x).toString(16).padStart(2,'0')}`; return `${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
  }
  const distinctColor = (i) => {
    const hue = (i * 137.508) % 360
    return `#${hslToHex(hue, 74, 56).replace('#','')}`
  }
  const colorAt = (idx) => (idx < palette.length ? palette[idx] : distinctColor(idx))
  const shade = (hex, amt = 0) => {
    try {
      const h = hex.replace('#','')
      const n = parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16)
      let r=(n>>16)&255,g=(n>>8)&255,b=n&255; r=Math.max(0,Math.min(255,r+amt)); g=Math.max(0,Math.min(255,g+amt)); b=Math.max(0,Math.min(255,b+amt));
      return `#${((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}`
    } catch { return hex }
  }
  // Detect all value keys dynamically (value, v2, v3, ...)
  const valueKeys = React.useMemo(() => {
    if (!dataBar.length) return [valueKey]
    const keys = Object.keys(dataBar[0]).filter(k => k !== xKey && k !== 'name')
    return keys.length ? keys : [valueKey]
  }, [dataBar, valueKey, xKey])

  // Human-readable legend labels per series (defaults to data keys)
  const seriesLabels = React.useMemo(() => {
    if (!Array.isArray(seriesNames) || !seriesNames.length) return valueKeys
    return valueKeys.map((k, idx) => seriesNames[idx] ?? k)
  }, [seriesNames, valueKeys])

  const hasMultipleSeries = valueKeys.length > 1

  // Orientation detection: any variant containing 'horizontal' => horizontal bars
  const isHorizontal = typeof variant === 'string' && variant.includes('horizontal')

  // Base mode/3D/percentage detection
  const is3D = typeof variant === 'string' && (variant === '3d' || variant.startsWith('3d-') || variant.endsWith('-3d'))
  const isStacked100 = typeof variant === 'string' && (variant.includes('stacked100'))

  // Effective mode: grouped/stacked/2d
  let mode = variant
  if (variant === '2d' && hasMultipleSeries) mode = 'grouped'
  if (variant === 'horizontal' && hasMultipleSeries) mode = 'grouped'

  const margin = marginProp

  // Control spacing so single-series bars aren't thin
  const barCategoryGapValue = hasMultipleSeries ? '20%' : '8%'
  const barGapValue = hasMultipleSeries ? 2 : 4

  // Normalize for 100% stacked
  const chartData = React.useMemo(() => {
    if (!isStacked100) return dataBar
    return dataBar.map(row => {
      const total = valueKeys.reduce((s, k) => s + (Number(row[k]) || 0), 0) || 1
      const pctRow = { ...row }
      valueKeys.forEach(k => { pctRow[k] = ((Number(row[k]) || 0) / total) * 100 })
      return pctRow
    })
  }, [dataBar, valueKeys, isStacked100])

  // Axis configs per orientation and percent
  const xAxisProps = isHorizontal
    ? { type: 'number', domain: isStacked100 ? [0, 100] : ['auto', 'auto'] }
    : { dataKey: xKey }
  const yAxisProps = isHorizontal
    ? { type: 'category', dataKey: xKey }
    : { domain: isStacked100 ? [0, 100] : ['auto', 'auto'] }

  // Unique id for gradients to avoid collisions/black fills
  const gradId = React.useMemo(() => `kn-bar-grad-${Math.random().toString(36).slice(2)}`,[dataBar?.length, valueKeys.length, isHorizontal])

  // Measure container to scale bar thickness when chart element grows/shrinks
  const wrapRef = React.useRef(null)
  const [dims, setDims] = React.useState({ w: 0, h: 0 })
  React.useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const cr = entry && (entry.contentRect || el.getBoundingClientRect())
      if (!cr) return
      const w = Math.max(0, cr.width)
      const h = Math.max(0, cr.height)
      setDims(prev => (prev.w !== w || prev.h !== h ? { w, h } : prev))
    })
    try { ro.observe(el) } catch {}
    return () => { try { ro.disconnect() } catch {} }
  }, [])

  // Compute an approximate band size from container and category count
  const catCount = Math.max(1, chartData.length)
  const availW = Math.max(0, (dims.w || 0) - (margin.left || 0) - (margin.right || 0))
  const availH = Math.max(0, (dims.h || 0) - (margin.top || 0) - (margin.bottom || 0))
  const perBand = isHorizontal ? (availH / catCount) : (availW / catCount)
  const seriesCount = Math.max(1, valueKeys.length)
  const isGrouped = (mode === 'grouped')
  const thicknessBase = perBand * (isGrouped ? 0.7 : 0.6) / (isGrouped ? seriesCount : 1)
  const dynamicBarSize = Math.max(12, Math.round((thicknessBase || 12) * (scale || 1)))

  return (
    <div ref={wrapRef} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
<BarChart key={animateKey != null ? `bar-${animateKey}` : undefined} data={chartData} margin={margin} layout={isHorizontal ? 'vertical' : 'horizontal'} barCategoryGap={barCategoryGapValue} barGap={barGapValue}>
          <defs>
            {/* Series gradients blend between adjacent palette colors */}
            {valueKeys.map((_, idx) => (
              <linearGradient key={idx} id={`${gradId}-s-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={overrideColor ? shade(overrideColor, 24) : colorAt(idx)} stopOpacity={0.98} />
                <stop offset="100%" stopColor={overrideColor ? shade(overrideColor, -28) : colorAt(idx+1)} stopOpacity={0.85} />
              </linearGradient>
            ))}
            <filter id="kn-soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.18"/>
            </filter>
          </defs>
          {showGrid && (<CartesianGrid stroke="rgba(0,0,0,0.06)" strokeDasharray={showMinorGridlines ? "3 3" : undefined} vertical={showMinorGridlines} horizontal={true} />)}
          {showAxes && (isHorizontal ? (
            <>
              <XAxis {...xAxisProps} tick={{ fill: '#334155', fontSize: Math.max(8, Math.round(12 * (scale || 1))) }} tickMargin={6} axisLine={showXAxis ? { stroke: '#94A3B8', strokeWidth: 1.5 } : false} tickLine={showXAxis ? { stroke: '#94A3B8' } : false} label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -4, style: { fill: '#334155', fontSize: Math.max(10, Math.round(13 * (scale || 1))), fontWeight: 600 } } : undefined} />
              <YAxis {...yAxisProps} tick={{ fill: '#334155', fontSize: Math.max(8, Math.round(12 * (scale || 1))) }} axisLine={showYAxis ? { stroke: '#94A3B8', strokeWidth: 1.5 } : false} tickLine={showYAxis ? { stroke: '#94A3B8' } : false} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#334155', fontSize: Math.max(10, Math.round(13 * (scale || 1))), fontWeight: 600, textAnchor: 'middle' } } : undefined} />
            </>
          ) : (
            <>
              <XAxis {...xAxisProps} tick={{ fill: '#334155', fontSize: Math.max(8, Math.round(12 * (scale || 1))) }} tickMargin={6} axisLine={showXAxis ? { stroke: '#94A3B8', strokeWidth: 1.5 } : false} tickLine={showXAxis ? { stroke: '#94A3B8' } : false} label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -4, style: { fill: '#334155', fontSize: Math.max(10, Math.round(13 * (scale || 1))), fontWeight: 600 } } : undefined} />
              <YAxis {...yAxisProps} tick={{ fill: '#334155', fontSize: Math.max(8, Math.round(12 * (scale || 1))) }} axisLine={showYAxis ? { stroke: '#94A3B8', strokeWidth: 1.5 } : false} tickLine={showYAxis ? { stroke: '#94A3B8' } : false} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#334155', fontSize: Math.max(10, Math.round(13 * (scale || 1))), fontWeight: 600, textAnchor: 'middle' } } : undefined} />
            </>
          ))}
          {showTooltip && (<Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 28px rgba(17,25,40,0.15)' }} wrapperStyle={{ outline: 'none' }} />)}
          {showLegend && <Legend verticalAlign="top" height={24} wrapperStyle={{ color: '#334155', fontSize: Math.max(8, Math.round(12 * (scale || 1))) }} />}

          {/* Stacked (including 100%) */}
          {(mode === 'stacked' || isStacked100 || mode === '3d-stacked' || mode === '3d-stacked100') && !is3D && valueKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              name={seriesLabels[idx]}
              stackId="s"
              radius={idx === valueKeys.length - 1 ? [8,8,2,2] : [0,0,0,0]}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
              fill={overrideColor ? (colorMode==='gradient' ? `url(#${gradId}-s-${idx})` : overrideColor) : (variant === 'gradient' ? `url(#${gradId}-s-${idx})` : colorAt(idx))}
            />
          ))}

          {/* Grouped */}
          {(mode === 'grouped' || mode === '3d-grouped' || (!is3D && (variant === '2d' || variant === 'horizontal') && hasMultipleSeries)) && !is3D && valueKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              name={seriesLabels[idx]}
              barSize={dynamicBarSize}
              radius={[8,8,2,2]}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
              fill={variant === 'gradient' ? `url(#${gradId}-s-${idx})` : colorAt(idx)}
            />
          ))}

          {/* Single-series decorative styles (2d gradient/rounded) */}
          {!is3D && mode !== 'stacked' && !isStacked100 && mode !== 'grouped' && valueKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              name={seriesLabels[idx]}
              barSize={dynamicBarSize}
              radius={variant === 'rounded' ? [12,12,4,4] : [8,8,4,4]}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
              // Set a solid color as a fallback; cells below will apply gradient per series
              fill={overrideColor ? (colorMode==='gradient' ? `url(#${gradId}-s-${idx})` : overrideColor) : colorAt(idx)}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={overrideColor ? (colorMode==='gradient' ? `url(#${gradId}-s-${idx})` : overrideColor) : (variant === 'gradient' ? `url(#${gradId}-s-${idx})` : colorAt(i))} fillOpacity={1} />
              ))}
            </Bar>
          ))}

          {/* 3D modes */}
          {is3D && (mode === '3d' || mode === '3d-grouped') && valueKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              name={seriesLabels[idx]}
              barSize={isHorizontal ? 16 : 16}
              shape={(props) => <ThreeDBarShape {...props} fill={overrideColor ? overrideColor : palette[idx % palette.length]} />}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            />
          ))}

          {is3D && (mode === '3d-stacked' || mode === '3d-stacked100') && valueKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              name={seriesLabels[idx]}
              stackId="s"
              barSize={isHorizontal ? 16 : 16}
              shape={(props) => <ThreeDBarShape {...props} fill={overrideColor ? overrideColor : palette[idx % palette.length]} />}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Custom 3D bar shape for richer 3D look
function ThreeDBarShape(props) {
  const { x, y, width, height, fill } = props
  const shadow = '#00000022'
  const topHighlightH = Math.max(3, Math.min(8, height * 0.18))
  return (
    <g filter="url(#kn-soft-shadow)">
      {/* Back offset shadow block to simulate depth */}
      <rect x={x + 3} y={y + 3} width={width} height={height} fill={shadow} rx={6} ry={6} />
      {/* Main colored block */}
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={6} ry={6} />
      {/* Top highlight */}
      <rect x={x} y={y} width={width} height={topHighlightH} fill="rgba(255,255,255,0.25)" rx={6} ry={6} />
      {/* Edge stroke for thickness */}
      <rect x={x} y={y} width={width} height={height} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="0.6" rx={6} ry={6} />
    </g>
  )
}
