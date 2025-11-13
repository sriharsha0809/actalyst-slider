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
  variant = 'simple' /* 'simple'|'smooth'|'multi'|'dashed'|'area'|'gradient' */,
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
  
  const margin = { top: 8, right: 16, left: 8, bottom: 8 }

  // Palette (saturated) and helper for distinct colors
  const palette = ['#1E73F0', '#0BB04C', '#E07A00', '#D61F69', '#6A3FF0', '#0AA06E', '#CC1F1A']
  const colorAt = (idx) => palette[idx % palette.length]
  
  // Detect value keys (value, v2, v3, ...)
  const valueKeys = React.useMemo(() => {
    if (!lineData.length) return [valueKey]
    const keys = Object.keys(lineData[0]).filter(k => k !== xKey && k !== 'name')
    return keys.length ? keys : [valueKey]
  }, [lineData, valueKey, xKey])
  const firstKey = valueKeys[0]
  
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={lineData} margin={margin}>
          <defs>
            {valueKeys.map((_, idx) => (
              <linearGradient key={idx} id={`${areaGradIdBase}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colorAt(idx)} stopOpacity={0.50} />
                <stop offset="100%" stopColor={colorAt(idx)} stopOpacity={0.12} />
              </linearGradient>
            ))}
            <linearGradient id={strokeGradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1E73F0" />
              <stop offset="100%" stopColor="#6A3FF0" />
            </linearGradient>
          </defs>
  
          <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fill: '#334155' }} tickMargin={6} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#334155' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 28px rgba(17,25,40,0.15)' }} wrapperStyle={{ outline: 'none' }} />
          {showLegend && (<Legend verticalAlign="top" height={24} wrapperStyle={{ color: '#334155' }} />)}
  
          {variant === 'area' && (
            <>
              {valueKeys.map((key, idx) => (
                <Area
                  key={`area-${key}`}
                  type="monotone"
                  dataKey={key}
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
                  stroke={idx === 0 && variant === 'gradient' ? `url(#${strokeGradId})` : colorAt(idx)}
                  strokeWidth={3.5}
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
