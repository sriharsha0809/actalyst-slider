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
export default function KeynoteBarChart({ data, xKey = 'name', valueKey = 'value', showLegend = true, variant = '2d' /* '2d'|'grouped'|'stacked'|'stacked100'|'3d'|'3d-grouped'|'3d-stacked'|'3d-stacked100'|'gradient'|'rounded'|'horizontal' (alias for 2d bar) */ }) {
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
  const palette = paletteStrong

  // Generate a distinct color for arbitrary index using golden-angle hue spacing
  const hslToHex = (h,s,l)=>{
    s/=100; l/=100; const k=n=> (n + h/30)%12; const a=s*Math.min(l,1-l); const f=n=> l - a*Math.max(-1, Math.min(k(n)-3, Math.min(9-k(n),1))); const toHex=x=> `#${Math.round(255*x).toString(16).padStart(2,'0')}`; return `${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
  }
  const distinctColor = (i) => {
    const hue = (i * 137.508) % 360
    return `#${hslToHex(hue, 74, 56).replace('#','')}`
  }
  const colorAt = (idx) => (idx < palette.length ? palette[idx] : distinctColor(idx))
  
  // Detect all value keys dynamically (value, v2, v3, ...)
  const valueKeys = React.useMemo(() => {
    if (!dataBar.length) return [valueKey]
    const keys = Object.keys(dataBar[0]).filter(k => k !== xKey && k !== 'name')
    return keys.length ? keys : [valueKey]
  }, [dataBar, valueKey, xKey])

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

  const margin = { top: 8, right: 12, bottom: 8, left: 8 }

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

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={margin} layout={isHorizontal ? 'vertical' : 'horizontal'}>
          <defs>
            {/* Series gradients blend between adjacent palette colors */}
            {valueKeys.map((_, idx) => (
              <linearGradient key={idx} id={`${gradId}-s-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colorAt(idx)} stopOpacity={0.98} />
                <stop offset="100%" stopColor={colorAt(idx+1)} stopOpacity={0.85} />
              </linearGradient>
            ))}
            <filter id="kn-soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.18"/>
            </filter>
          </defs>
          <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
          {isHorizontal ? (
            <>
              <XAxis {...xAxisProps} tick={{ fill: '#334155', fontSize: 12 }} tickMargin={6} axisLine={false} tickLine={false} />
              <YAxis {...yAxisProps} tick={{ fill: '#334155', fontSize: 12 }} axisLine={false} tickLine={false} />
            </>
          ) : (
            <>
              <XAxis {...xAxisProps} tick={{ fill: '#334155', fontSize: 12 }} tickMargin={6} axisLine={false} tickLine={false} />
              <YAxis {...yAxisProps} tick={{ fill: '#334155', fontSize: 12 }} axisLine={false} tickLine={false} />
            </>
          )}
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 28px rgba(17,25,40,0.15)' }} wrapperStyle={{ outline: 'none' }} />
          {showLegend && <Legend verticalAlign="top" height={24} wrapperStyle={{ color: '#334155' }} />}

          {/* Stacked (including 100%) */}
          {(mode === 'stacked' || isStacked100 || mode === '3d-stacked' || mode === '3d-stacked100') && !is3D && valueKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="s"
              radius={idx === valueKeys.length - 1 ? [8,8,2,2] : [0,0,0,0]}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
              fill={variant === 'gradient' ? `url(#${gradId}-s-${idx})` : colorAt(idx)}
            />
          ))}

          {/* Grouped */}
          {(mode === 'grouped' || mode === '3d-grouped' || (!is3D && (variant === '2d' || variant === 'horizontal') && hasMultipleSeries)) && !is3D && valueKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              barSize={12}
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
              radius={variant === 'rounded' ? [12,12,4,4] : [8,8,4,4]}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
              // Set a solid color as a safety fallback; cells below will apply gradient per series
              fill={colorAt(idx)}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={variant === 'gradient' ? `url(#${gradId}-s-${idx})` : colorAt(i)} fillOpacity={1} />
              ))}
            </Bar>
          ))}

          {/* 3D modes */}
          {is3D && (mode === '3d' || mode === '3d-grouped') && valueKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              barSize={isHorizontal ? 16 : 16}
              shape={(props) => <ThreeDBarShape {...props} fill={palette[idx % palette.length]} />}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            />
          ))}

          {is3D && (mode === '3d-stacked' || mode === '3d-stacked100') && valueKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="s"
              barSize={isHorizontal ? 16 : 16}
              shape={(props) => <ThreeDBarShape {...props} fill={palette[idx % palette.length]} />}
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
