import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell,
} from 'recharts'

/**
 * Install (safe to re-run):
 *   npm i framer-motion recharts
 *
 * Usage:
 *   <ChartSelectionDialog
 *     isOpen={isChartPickerOpen}
 *     onClose={() => setChartPickerOpen(false)}
 *     onChartSelect={(type, style) => {
 *       // type: 'bar' | 'pie' | 'line'
 *       // style: one of the variations below (e.g., '2d', 'stacked', 'gradient', ...)
 *       // Add your element to the current slide with this configuration
 *     }}
 *   />
 *
 * This component renders a parent dialog with chart type choices (Bar, Pie, Line)
 * and, once a type is selected, a child dialog with multiple Apple Keynote–style
 * chart previews. Clicking a preview calls onChartSelect(type, style) and closes
 * both layers.
 */
export default function ChartSelectionDialog({ isOpen, onClose, onChartSelect, initialType = null }) {
  const [parentType, setParentType] = useState(initialType)

  useEffect(() => {
    if (!isOpen) {
      setParentType(initialType)
    }
  }, [isOpen, initialType])

  useEffect(() => {
    // Close on ESC
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    if (isOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleChooseType = (t) => setParentType(t)
  const handlePickVariation = (style) => {
    if (typeof onChartSelect === 'function') onChartSelect(parentType, style)
    onClose?.()
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="chart-picker-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          style={{ background: 'rgba(17,23,41,0.35)', backdropFilter: 'blur(4px)' }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.() }}
        >
          {/* Parent dialog */}
          <motion.div
            key="chart-parent"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-[720px] max-w-[90vw] rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.15)] bg-white/60 backdrop-blur-lg border border-white/40 p-5"
          >
            <div className="text-lg font-semibold text-gray-800 text-center">Insert Chart</div>
            <div className={`mt-3 flex items-center justify-center gap-4 transition-opacity ${parentType ? 'opacity-65' : 'opacity-100'}`}>
              <TypeCard label="Bar Chart" active={parentType === 'bar'} onClick={() => handleChooseType('bar')}>
                <MiniBarIcon />
              </TypeCard>
              <TypeCard label="Pie Chart" active={parentType === 'pie'} onClick={() => handleChooseType('pie')}>
                <MiniPieIcon />
              </TypeCard>
              <TypeCard label="Line Chart" active={parentType === 'line'} onClick={() => handleChooseType('line')}>
                <MiniLineIcon />
              </TypeCard>
            </div>

            {/* Child dialog: a nested layer within parent, sliding in smoothly */}
            <AnimatePresence>
              {parentType && (
                <motion.div
                  key="chart-child"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="relative mt-5"
                >
                  {/* floating panel */}
                  <div className="rounded-2xl bg-white/70 backdrop-blur-lg border border-white/50 shadow-[0_12px_48px_rgba(0,0,0,0.15)] p-4">
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      {parentType === 'bar' && 'Choose a Bar Chart style'}
                      {parentType === 'pie' && 'Choose a Pie Chart style'}
                      {parentType === 'line' && 'Choose a Line Chart style'}
                    </div>
                    {/* Limit height for bar variant to avoid dialog growing too tall */}
                    <div style={parentType === 'bar' ? { maxHeight: '260px', overflowY: 'auto', paddingRight: '4px', scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' } : undefined}>
                      <ChartVariationsGrid type={parentType} onSelect={handlePickVariation} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 flex justify-end">
              <button onClick={onClose} className="px-4 py-2 rounded-md bg-black text-white text-sm">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function TypeCard({ children, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group w-44 h-28 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
        active ? 'border-brand-500 bg-white/70 shadow-lg' : 'border-white/50 bg-white/50 hover:shadow-md'
      }`}
      style={{ boxShadow: active ? '0 10px 30px rgba(17,25,40,0.15)' : undefined }}
    >
      <div className="w-10 h-10 text-gray-700 group-hover:scale-[1.03] transition-transform">{children}</div>
      <div className="text-xs text-gray-800 font-medium">{label}</div>
    </button>
  )
}

function ChartVariationsGrid({ type, onSelect }) {
  // Small demo dataset shared by previews
  const data = useMemo(() => (
    [
      { name: 'A', v1: 30, v2: 20 },
      { name: 'B', v1: 50, v2: 35 },
      { name: 'C', v1: 40, v2: 28 },
    ]
  ), [])

  const pieData = useMemo(() => (
    [
      { name: 'A', value: 35 },
      { name: 'B', value: 25 },
      { name: 'C', value: 40 },
    ]
  ), [])

  const palette = ['#1E73F0', '#0BB04C', '#E07A00', '#D61F69', '#6A3FF0']

  // Expanded variation sets inspired by Keynote presets
  const variations = type === 'bar'
    ? [
        { key: '2d', title: '2D Standard' },
        { key: 'stacked', title: '2D Stacked' },
        { key: 'gradient', title: '2D Gradient' },
        { key: 'rounded', title: '2D Rounded' },
        { key: 'horizontal', title: 'Horizontal' },
        { key: 'horizontal-stacked', title: 'Horizontal Stacked' },
      ]
    : type === 'pie'
    ? [
        { key: '2d', title: '2D Pie' },
        { key: 'donut', title: 'Doughnut (Ring) Pie' },
        { key: 'flat-mono', title: 'Flat Monochrome Pie' },
        { key: 'gradient', title: 'Gradient Pie' },
        { key: 'minimal', title: 'Minimal/Outline Pie' },
      ]
    : [
        { key: 'simple', title: '2D Line' },
        { key: 'smooth', title: 'Smooth/Curved Line' },
        { key: 'markers', title: 'Line with Markers' },
        { key: 'dashed', title: 'Dashed Line' },
        { key: 'step', title: 'Step Line' },
        { key: 'gradient', title: 'Gradient Stroke' },
      ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {variations.map((v) => (
        <motion.button
          key={v.key}
          whileHover={{ scale: 1.04, boxShadow: '0 10px 24px rgba(17,25,40,0.18)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect?.(v.key)}
          className="w-[112px] h-[112px] rounded-xl bg-white/70 border border-white/60 shadow-sm overflow-hidden flex flex-col"
          title={v.title}
        >
          <div className="relative flex-1" style={{filter: 'none'}}>
            {/* Inner plot frame to surround the chart area with a clear perimeter */}
            <div className="absolute inset-1 rounded-md border border-black/15 pointer-events-none" />
            <ResponsiveContainer width="100%" height="100%">
              {type === 'bar' && (
                <BarPreview variant={v.key} data={data} palette={palette} />
              )}
              {type === 'pie' && (
                <PiePreview variant={v.key} data={pieData} palette={palette} />
              )}
              {type === 'line' && (
                <LinePreview variant={v.key} data={data} palette={palette} />
              )}
            </ResponsiveContainer>
          </div>
          <div className="p-1 text-[10px] text-center text-gray-700 font-medium">{v.title}</div>
        </motion.button>
      ))}
    </div>
  )
}

/* Mini Icons (non-chart) for parent cards */
function MiniBarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="6" y="11" width="2.4" height="7" fill="currentColor" />
      <rect x="10.8" y="7" width="2.4" height="11" fill="currentColor" />
      <rect x="15.6" y="13" width="2.4" height="5" fill="currentColor" />
    </svg>
  )
}
function MiniPieIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" stroke="currentColor" />
      <path d="M12 3v9l6.8 3.9" stroke="currentColor" />
    </svg>
  )
}
function MiniLineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <polyline points="3 17 8 12 12 14 16 8 21 12" stroke="currentColor" />
    </svg>
  )
}

/* Reusable preview renderers (powered by Recharts) */
function BarPreview({ variant, data, palette }) {
  const common = { margin: { top: 6, right: 6, bottom: 6, left: 6 } }
  const isHorizontal = variant.startsWith('horizontal')
  const base = isHorizontal ? variant.replace('horizontal-', '') || '2d' : variant
  const normalized = (base === 'stacked100' || base === '3d-stacked100')
    ? data.map(d => { const t = (d.v1 + (d.v2 || 0)) || 1; return { ...d, v1: (d.v1/t)*100, v2: ((d.v2||0)/t)*100 } })
    : data
  return (
    <BarChart data={normalized} {...common} layout={isHorizontal ? 'vertical' : 'horizontal'}>
      <defs>
        {['v1','v2'].map((k, i) => (
          <linearGradient key={k} id={`bp-grad-${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette[i % palette.length]} stopOpacity={0.95} />
            <stop offset="100%" stopColor={palette[i % palette.length]} stopOpacity={0.7} />
          </linearGradient>
        ))}
      </defs>
      <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
      {isHorizontal ? (
        <>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" hide />
        </>
      ) : (
        <>
          <XAxis dataKey="name" hide tick={{ fontSize: 8 }} />
          <YAxis hide />
        </>
      )}
      {base === 'stacked' || base === 'stacked100' ? (
        <>
          <Bar dataKey="v1" stackId="s" fill="url(#bp-grad-v1)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="v2" stackId="s" fill="url(#bp-grad-v2)" radius={[4, 4, 0, 0]} />
        </>
      ) : base === 'grouped' ? (
        <>
          <Bar dataKey="v1" fill={palette[0]} radius={[4,4,2,2]} barSize={10} />
          <Bar dataKey="v2" fill={palette[3]} radius={[4,4,2,2]} barSize={10} />
        </>
      ) : base === 'gradient' ? (
        <Bar dataKey="v1" fill="url(#bp-grad-v1)" radius={[6, 6, 2, 2]} fillOpacity={1} />
      ) : base === 'rounded' ? (
        <Bar dataKey="v1" fill={palette[0]} radius={[10,10,4,4]} />
      ) : base === '3d' || base === '3d-grouped' ? (
        <>
          <Bar dataKey="v1" fill="#00000015" radius={[6, 6, 2, 2]} barSize={14} />
          <Bar dataKey="v1" fill="url(#bp-grad-v1)" radius={[6, 6, 2, 2]} barSize={12} />
          {base === '3d-grouped' && (
            <>
              <Bar dataKey="v2" fill="#00000015" radius={[6, 6, 2, 2]} barSize={14} />
              <Bar dataKey="v2" fill="url(#bp-grad-v2)" radius={[6, 6, 2, 2]} barSize={12} />
            </>
          )}
        </>
      ) : base === '3d-stacked' || base === '3d-stacked100' ? (
        <>
          <Bar dataKey="v1" stackId="s" fill="#00000015" radius={[6, 6, 2, 2]} barSize={14} />
          <Bar dataKey="v1" stackId="s" fill="url(#bp-grad-v1)" radius={[6, 6, 2, 2]} barSize={12} />
          <Bar dataKey="v2" stackId="s" fill="#00000015" radius={[6, 6, 2, 2]} barSize={14} />
          <Bar dataKey="v2" stackId="s" fill="url(#bp-grad-v2)" radius={[6, 6, 2, 2]} barSize={12} />
        </>
      ) : (
        <Bar dataKey="v1" fill={palette[0]} radius={[6, 6, 2, 2]} fillOpacity={1} />
      )}
    </BarChart>
  )
}

function PiePreview({ variant, data, palette }) {
  const prepared = data.map((d) => ({ ...d }))
  const is3D = variant === '3d'
  const isExploded = variant === 'exploded'
  const isMinimal = variant === 'minimal'
  const isDonut = variant === 'donut' || variant === 'ring'
  const isMono = variant === 'flat-mono'
  const useLabels = variant !== 'no-labels'
  const leaderLines = variant === 'leader-lines'
  const toFill = (i) => (
    variant === 'gradient' ? `url(#pp-grad-${i})` : (isMono ? '#1E73F0' : palette[i % palette.length])
  )
  const inner = isDonut ? 22 : (isMinimal ? 34 : 0)
  const outer = 40
  return (
    <PieChart margin={{ top: 6, right: 6, bottom: 6, left: 6 }}>
      <defs>
        {prepared.map((_, i) => (
          <linearGradient key={i} id={`pp-grad-${i}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={palette[i % palette.length]} stopOpacity={0.95} />
            <stop offset="100%" stopColor={palette[i % palette.length]} stopOpacity={0.75} />
          </linearGradient>
        ))}
      </defs>

      {/* Base pie */}
      <Pie
        data={prepared}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        innerRadius={inner}
        outerRadius={outer}
        isAnimationActive={false}
        labelLine={leaderLines}
        label={useLabels}
      >
        {prepared.map((_, i) => (
          <Cell
            key={i}
            fill={variant === 'gradient' ? toFill(i) : (variant === 'flat' || variant === 'minimal' || variant === '2d' || variant === '3d' ? palette[i % palette.length] : toFill(i))}
            stroke={isMinimal ? palette[i % palette.length] : 'rgba(255,255,255,0.85)'}
            strokeWidth={isMinimal ? 3 : 1}
          />
        ))}
      </Pie>

      {/* Exploded slice */}
      {isExploded && (
        <Pie
          data={[prepared[1]]}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={inner}
          outerRadius={outer + 6}
          isAnimationActive={false}
        >
          <Cell fill={toFill(1)} stroke="rgba(255,255,255,0.9)" />
        </Pie>
      )}

      {/* Fake 3D rim */}
      {is3D && (
        <Pie
          data={prepared}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={outer}
          outerRadius={outer + 4}
          isAnimationActive={false}
        >
          {prepared.map((_, i) => (
            <Cell key={i} fill="#00000010" stroke="transparent" />
          ))}
        </Pie>
      )}
    </PieChart>
  )
}

function LinePreview({ variant, data, palette }) {
  const common = { margin: { top: 6, right: 6, bottom: 6, left: 6 } }
  const strokeId = 'lp-stroke'
  return (
    <>
      {variant === 'area' ? (
        <AreaChart data={data} {...common}>
          <defs>
            <linearGradient id="lp-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette[0]} stopOpacity={0.35} />
              <stop offset="100%" stopColor={palette[0]} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Area type="monotone" dataKey="v1" stroke={palette[0]} fill="url(#lp-grad)" strokeWidth={2} />
        </AreaChart>
      ) : (
        <LineChart data={data} {...common}>
          <defs>
            <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={palette[0]} />
              <stop offset="100%" stopColor={palette[3]} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Line
            type={variant === 'smooth' ? 'monotone' : (variant === 'step' ? 'step' : 'linear')}
            dataKey="v1"
            stroke={variant === 'gradient' ? `url(#${strokeId})` : palette[0]}
            strokeWidth={3}
            strokeDasharray={variant === 'dashed' ? '4 4' : undefined}
            dot={variant === 'markers'}
          />
        </LineChart>
      )}
    </>
  )
}
