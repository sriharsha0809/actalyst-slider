// Install:
//   npm i recharts
//   # or: yarn add recharts, pnpm add recharts

import React from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts'

/**
 * KeynotePieChart.jsx
 *
 * A standalone, Keynote-style pie chart (FULL pie — not donut).
 * - Soft Apple-like pastel colors + subtle gradients
 * - Smooth, sequential entry animation (Keynote-style)
 * - Soft drop-shadow for a gentle 3D feel
 * - Clean percentage labels
 *
 * Reuse with dynamic data:
 *   <KeynotePieChart data={[{ name: 'A', value: 40 }, { name: 'B', value: 60 }]} />
 *   // 'data' expects an array of { name: string, value: number }
 */
export default function KeynotePieChart({
  data,
  outerRadius = 84, // target size (recharts scales to container)
  showLegend = true,
  sliceDelayMs = 120, // delay between slice reveals (sequential animation)
  durationMs = 800,   // per-slice animation duration
  animateKey = null,  // when this value changes (e.g., slideId), run animation; otherwise no re-anim
  variant = '2d' /* '2d'|'3d'|'donut'|'exploded'|'percent'|'flat'|'flat-mono'|'gradient'|'minimal'|'labels'|'no-labels'|'leader-lines'|'no-shadow' */,
}) {
  // Demo data (used if not provided)
  const demo = [
    { name: 'Marketing', value: 35 },
    { name: 'Sales', value: 25 },
    { name: 'Product', value: 20 },
    { name: 'Support', value: 12 },
    { name: 'R&D', value: 8 },
  ]
  const fullData = Array.isArray(data) && data.length ? data : demo

  // Stronger palette for thick colors
  const palette = ['#1E73F0', '#0BB04C', '#E07A00', '#D61F69', '#6A3FF0', '#0AA06E']
  const distinctColor = (i) => {
    const hue = (i * 137.508) % 360
    const hslToHex = (h,s,l)=>{ s/=100; l/=100; const k=n=> (n + h/30)%12; const a=s*Math.min(l,1-l); const f=n=> l - a*Math.max(-1, Math.min(k(n)-3, Math.min(9-k(n),1))); const toHex=x=> `#${Math.round(255*x).toString(16).padStart(2,'0')}`; return `${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}` }
    return `#${hslToHex(hue, 74, 56).replace('#','')}`
  }
  const colorAt = (idx) => (idx < palette.length ? palette[idx] : distinctColor(idx))

  // Compute total for percentage labels
  const total = Math.max(1, fullData.reduce((s, d) => s + (Number(d.value) || 0), 0))

  // Sequential reveal gated by animateKey (e.g., current slide id)
  const [visibleCount, setVisibleCount] = React.useState(fullData.length)
  const animatingRef = React.useRef(false)
  const timeoutsRef = React.useRef([])

  // Run animation ONLY when animateKey changes
  React.useEffect(() => {
    // Clear any pending timeouts
    timeoutsRef.current.forEach(id => { try { clearTimeout(id) } catch {} })
    timeoutsRef.current = []

    if (animateKey == null) {
      // No animation trigger — show full pie
      animatingRef.current = false
      setVisibleCount(fullData.length)
      return
    }

    animatingRef.current = true
    let i = 0
    setVisibleCount(0)
    const tick = () => {
      i += 1
      setVisibleCount(i)
      if (i < fullData.length) {
        const id = setTimeout(tick, sliceDelayMs)
        timeoutsRef.current.push(id)
      } else {
        animatingRef.current = false
      }
    }
    const first = setTimeout(tick, sliceDelayMs)
    timeoutsRef.current.push(first)

    return () => {
      timeoutsRef.current.forEach(id => { try { clearTimeout(id) } catch {} })
      timeoutsRef.current = []
      animatingRef.current = false
    }
  }, [animateKey, sliceDelayMs, fullData.length])

  // If data changes without a new animateKey, show final state immediately (no re-anim)
  React.useEffect(() => {
    if (!animatingRef.current) {
      setVisibleCount(fullData.length)
    }
  }, [fullData.length])

  // Only feed the first N slices to Pie so they animate in sequence
  const pieData = fullData.slice(0, Math.max(0, Math.min(fullData.length, visibleCount)))

  // Minimal, elegant percentage labels (font-medium, gray-800)
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
    const RAD = Math.PI / 180
    const r = (innerRadius || 0) + (outerRadius - (innerRadius || 0)) * 0.66
    const x = cx + r * Math.cos(-midAngle * RAD)
    const y = cy + r * Math.sin(-midAngle * RAD)
    const pct = ((Number(value) || 0) / total) * 100
    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 12, fontWeight: 500, fill: '#1f2937' }} // Tailwind: text-gray-800 font-medium
      >
        {pct.toFixed(0)}%
      </text>
    )
  }

  const is3D = variant === '3d'
  const isDonut = variant === 'donut' || variant === 'ring'
  const isMinimal = variant === 'minimal'
  const isMono = variant === 'flat-mono'
  const useLabels = variant !== 'no-labels'
  const leaderLines = variant === 'leader-lines'
  const dropShadow = variant !== 'no-shadow'

  // Unique id to avoid gradient clashes
  const gid = React.useMemo(() => Math.random().toString(36).slice(2), [])
  // Simple color shade helper (lighten/darken hex)
  const shade = (hex, amt = 0) => {
    try {
      const h = hex.replace('#','')
      const num = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16)
      let r = (num >> 16) & 255
      let g = (num >> 8) & 255
      let b = num & 255
      r = Math.max(0, Math.min(255, r + amt))
      g = Math.max(0, Math.min(255, g + amt))
      b = Math.max(0, Math.min(255, b + amt))
      return `#${((1<<24) + (r<<16) + (g<<8) + b).toString(16).slice(1)}`
    } catch { return hex }
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        {/* Optional drop-shadow */}
        <PieChart style={{ filter: dropShadow ? 'drop-shadow(0 8px 22px rgba(17,25,40,0.18))' : 'none' }}>
          {/* Per-slice radial gradients for visible shading */}
          <defs>
            {fullData.map((_, i) => {
              const base = colorAt(i)
              const lighter = shade(base, 35)
              const darker = shade(base, -25)
              return (
                <radialGradient key={`g-${gid}-${i}`} id={`kp-grad-${gid}-${i}`} cx="50%" cy="50%" r="65%">
                  <stop offset="0%" stopColor={lighter} stopOpacity={1} />
                  <stop offset="100%" stopColor={darker} stopOpacity={1} />
                </radialGradient>
              )
            })}
          </defs>

          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 8px 28px rgba(17,25,40,0.15)'
            }}
            wrapperStyle={{ outline: 'none' }}
          />
          {showLegend && (
            <Legend verticalAlign="bottom" height={24} wrapperStyle={{ color: '#334155' }} />
          )}

          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={isMinimal ? outerRadius - 18 : (isDonut ? outerRadius - 22 : 0)}
            outerRadius={outerRadius}
            labelLine={leaderLines}
            label={useLabels ? renderLabel : false}
            paddingAngle={variant === 'exploded' ? 3 : 0}
            isAnimationActive
            animationDuration={durationMs}
            animationEasing="ease-out"
          >
            {pieData.map((entry, i) => (
              <Cell
                key={`cell-${i}`}
                fill={variant === 'gradient' ? `url(#kp-grad-${gid}-${i})` : (isMono ? '#1E73F0' : colorAt(i))}
                stroke={isMinimal ? (isMono ? '#1E73F0' : palette[i % palette.length]) : 'rgba(255,255,255,0.85)'}
                strokeWidth={isMinimal ? 3 : 1}
                style={{ filter: dropShadow ? 'drop-shadow(0 2px 4px rgba(17,25,40,0.12))' : 'none' }}
              />
            ))}
          </Pie>
          {/* Simple fake 3D rim */}
          {variant === '3d' && (
            <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={outerRadius} outerRadius={outerRadius + 4} isAnimationActive={false}>
              {pieData.map((_, i) => (<Cell key={i} fill="#00000010" stroke="transparent" />))}
            </Pie>
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
