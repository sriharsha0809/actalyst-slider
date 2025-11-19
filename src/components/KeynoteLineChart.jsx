import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area
} from 'recharts'

/**
 * KeynoteLineChart.jsx
 *
 * A smooth, Keynote-like line chart with curved line,
 * circle markers, gradient area fill, and minimal grid.
 *
 * How to reuse with your own data later:
 * - Pass data={[{ name: 'Jan', value: 120 }, ...]}
 * - Optionally set xKey/valueKey if your field names differ.
 */
export default function KeynoteLineChart({
  data,
  xKey = 'name',
  valueKey = 'value',
  showLegend = true,
  showTooltip = true,
  showAxes = true,
  showGrid = true,
  margin: marginProp = { top: 8, right: 16, left: 8, bottom: 8 },
  variant = 'simple' /* 'simple'|'smooth'|'multi'|'dashed'|'area'|'gradient' */,
  scale = 1,
  animateKey = null,
  overrideColor = null,
  overridePalette = null,
  colorMode = 'solid',
  colorblindFriendly = false,
  seriesNames = null,
  xAxisLabel = null,
  yAxisLabel = null,
  showXAxis = true,
  showYAxis = true,
  showMinorGridlines = false,
}) {
  // Demo data (used if not provided)
  const demo = [
    { name: 'Jan', value: 120 },
    { name: 'Feb', value: 180 },
    { name: 'Mar', value: 140 },
    { name: 'Apr', value: 220 },
    { name: 'May', value: 200 },
    { name: 'Jun', value: 260 },
  ]
  const lineData = Array.isArray(data) && data.length ? data : demo

  const gid = (id) => `kn-line-grad-${id}`
  const uid = React.useMemo(() => Math.random().toString(36).slice(2), [lineData?.length])
  const areaGradIdBase = `kn-line-area-${uid}`
  const strokeGradId = `kn-line-stroke-${uid}`
  
  const margin = marginProp

  // Palette (saturated) and helper for distinct colors
  const paletteDefault = ['#1E73F0', '#0BB04C', '#E07A00', '#D61F69', '#6A3FF0', '#0AA06E', '#CC1F1A']
  const paletteHC = ['#2D7DD2','#F25F5C','#FFE066','#70C1B3','#50514F']
  const basePalette = colorblindFriendly ? paletteHC : paletteDefault
  const palette = Array.isArray(overridePalette) && overridePalette.length ? overridePalette : basePalette
  const colorAt = (idx) => (overrideColor ? overrideColor : palette[idx % palette.length])
  const shade = (hex, amt = 0) => {
    try { const h=hex.replace('#',''); const n=parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16); let r=(n>>16)&255,g=(n>>8)&255,b=n&255; r=Math.max(0,Math.min(255,r+amt)); g=Math.max(0,Math.min(255,g+amt)); b=Math.max(0,Math.min(255,b+amt)); return `#${((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}`} catch { return hex }
  }
  
  // Detect value keys (value, v2, v3, ...)
  const valueKeys = React.useMemo(() => {
    if (!lineData.length) return [valueKey]
    const keys = Object.keys(lineData[0]).filter(k => k !== xKey && k !== 'name')
    return keys.length ? keys : [valueKey]
  }, [lineData, valueKey, xKey])
  const firstKey = valueKeys[0]

  // Human-readable legend labels for each series (defaults to data keys)
  const seriesLabels = React.useMemo(() => {
    if (!Array.isArray(seriesNames) || !seriesNames.length) return valueKeys
    return valueKeys.map((k, idx) => seriesNames[idx] ?? k)
  }, [seriesNames, valueKeys])
  
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart key={animateKey != null ? `line-${animateKey}` : undefined} data={lineData} margin={margin}>
          <defs>
            {valueKeys.map((_, idx) => (
              <linearGradient key={idx} id={`${areaGradIdBase}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colorAt(idx)} stopOpacity={0.50} />
                <stop offset="100%" stopColor={colorAt(idx)} stopOpacity={0.12} />
              </linearGradient>
            ))}
            <linearGradient id={strokeGradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={overrideColor ? shade(overrideColor, 28) : '#1E73F0'} />
              <stop offset="100%" stopColor={overrideColor ? shade(overrideColor, -24) : '#6A3FF0'} />
            </linearGradient>
          </defs>
  
          {showGrid && (<CartesianGrid stroke="rgba(0,0,0,0.06)" strokeDasharray={showMinorGridlines ? "3 3" : undefined} vertical={showMinorGridlines} horizontal={true} />)}
          {showAxes && (<XAxis dataKey={xKey} tick={{ fill: '#334155', fontSize: Math.max(8, Math.round(12 * (scale || 1))) }} tickMargin={6} axisLine={showXAxis ? { stroke: '#94A3B8', strokeWidth: 1.5 } : false} tickLine={showXAxis ? { stroke: '#94A3B8' } : false} label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -4, style: { fill: '#334155', fontSize: Math.max(10, Math.round(13 * (scale || 1))), fontWeight: 600 } } : undefined} />)}
          {showAxes && (<YAxis tick={{ fill: '#334155', fontSize: Math.max(8, Math.round(12 * (scale || 1))) }} axisLine={showYAxis ? { stroke: '#94A3B8', strokeWidth: 1.5 } : false} tickLine={showYAxis ? { stroke: '#94A3B8' } : false} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#334155', fontSize: Math.max(10, Math.round(13 * (scale || 1))), fontWeight: 600, textAnchor: 'middle' } } : undefined} />)}
          {showTooltip && (<Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 28px rgba(17,25,40,0.15)' }} wrapperStyle={{ outline: 'none' }} />)}
          {showLegend && (<Legend verticalAlign="top" height={24} wrapperStyle={{ color: '#334155', fontSize: Math.max(8, Math.round(12 * (scale || 1))) }} />)}
  
          {variant === 'area' && (
            <>
              {valueKeys.map((key, idx) => (
                <Area
                  key={`area-${key}`}
                  type="monotone"
                  dataKey={key}
                  name={seriesLabels[idx]}
                  stroke="none"
                  fill={`url(#${areaGradIdBase}-${idx})`}
                  isAnimationActive
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              ))}
              {/* Overlay lines for crisp edges */}
              {valueKeys.map((key, idx) => (
                <Line
                  key={`line-${key}`}
                  type="monotone"
                  dataKey={key}
                  name={seriesLabels[idx]}
                  stroke={colorAt(idx)}
                  strokeWidth={3.5}
                  dot={false}
                  isAnimationActive
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              ))}
            </>
          )}
  
          {/* multiple series lines */}
          {variant !== 'area' && (
            <>
              {valueKeys.map((key, idx) => (
                <Line
                  key={key}
                  type={variant === 'smooth' ? 'monotone' : (variant === 'step' ? 'step' : 'linear')}
                  dataKey={key}
                  name={seriesLabels[idx]}
                  stroke={(overrideColor && colorMode==='gradient') || (idx === 0 && variant === 'gradient') ? `url(#${strokeGradId})` : colorAt(idx)}
                  strokeWidth={3.5}
                  strokeDasharray={variant === 'dashed' ? '6 6' : undefined}
                  dot={variant === 'markers' ? { r: 3.2, stroke: '#ffffff', strokeWidth: 1, fill: colorAt(idx) } : false}
                  activeDot={{ r: 5 }}
                  isAnimationActive
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              ))}
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
