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
  PieChart,
  Pie,
  Cell
} from 'recharts'

/**
 * KeynoteChart.jsx
 *
 * A reusable, presentation-quality chart component using Recharts
 * with soft colors, gradients, clean labels, and smooth transitions.
 *
 * Usage (example):
 *   import KeynoteChart from './KeynoteChart'
 *   
 *   // Inside any slide or page component JSX (without changing routes/layout):
 *   <div className="w-full max-w-xl">
 *     <KeynoteChart />
 *   </div>
 *
 * Reuse tips:
 * - Pass your own data via the dataBar and dataPie props.
 * - Choose what to render with the `variant` prop: 'both' | 'bar' | 'pie'.
 * - You can style the outer wrapper with any classes; this component only draws charts.
 *
 * Props:
 * - variant?: 'both' | 'bar' | 'pie'  (default: 'both')
 * - dataBar?: Array<{ name: string; value: number }>
 * - dataPie?: Array<{ name: string; value: number }>
 */
export default function KeynoteChart({
  variant = 'both',
  dataBar,
  dataPie,
}) {
  // Demo data (used if props are not provided)
  const demoBar = [
    { name: 'Q1', value: 420 },
    { name: 'Q2', value: 560 },
    { name: 'Q3', value: 480 },
    { name: 'Q4', value: 610 },
  ]
  const demoPie = [
    { name: 'Marketing', value: 35 },
    { name: 'Sales', value: 25 },
    { name: 'Product', value: 20 },
    { name: 'Support', value: 12 },
    { name: 'R&D', value: 8 },
  ]

  const barData = Array.isArray(dataBar) && dataBar.length ? dataBar : demoBar
  const pieData = Array.isArray(dataPie) && dataPie.length ? dataPie : demoPie

  // Soft/pastel palette
  const palette = ['#9BD0F5', '#A9E3B1', '#F9CD9D', '#F7A8B8', '#CDB4DB', '#BDE0FE']

  // Helper for gradient IDs to avoid collisions
  const gid = (id) => `keynote-grad-${id}`

  const BarDemo = (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={barData} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
          {/* Subtle grid */}
          <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#334155' }} tickMargin={6} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#334155' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 28px rgba(17,25,40,0.15)' }}
            wrapperStyle={{ outline: 'none' }}
          />
          <Legend verticalAlign="top" height={24} wrapperStyle={{ color: '#334155' }} />

          {/* Gradients for Keynote-style bars */}
          <defs>
            <linearGradient id={gid('bar')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.55} />
            </linearGradient>
          </defs>

          <Bar
            dataKey="value"
            name="Value"
            fill={`url(#${gid('bar')})`}
            radius={[8, 8, 4, 4]}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
          >
            {barData.map((entry, index) => (
              <Cell key={`bar-cell-${index}`} fill={palette[index % palette.length]} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  const PieDemo = (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 28px rgba(17,25,40,0.15)' }}
            wrapperStyle={{ outline: 'none' }}
          />
          <Legend verticalAlign="bottom" height={24} wrapperStyle={{ color: '#334155' }} />

          <defs>
            <linearGradient id={gid('pie')} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.55} />
            </linearGradient>
          </defs>

          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={82}
            innerRadius={42}
            padAngle={2}
            cornerRadius={6}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
          >
            {pieData.map((entry, index) => (
              <Cell key={`pie-cell-${index}`} fill={palette[index % palette.length]} fillOpacity={0.9} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )

  return (
    <div className="w-full">
      {/* Keep this component self-contained; do not alter parent layouts or routes */}
      {variant === 'bar' && (
        <div className="rounded-xl border border-black/5 bg-white/70 backdrop-blur-sm p-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Bar Chart</h3>
          {BarDemo}
        </div>
      )}

      {variant === 'pie' && (
        <div className="rounded-xl border border-black/5 bg-white/70 backdrop-blur-sm p-4 shadow-sm">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Pie Chart</h3>
          {PieDemo}
        </div>
      )}

      {variant === 'both' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-black/5 bg-white/70 backdrop-blur-sm p-4 shadow-sm">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Bar Chart</h3>
            {BarDemo}
          </div>
          <div className="rounded-xl border border-black/5 bg-white/70 backdrop-blur-sm p-4 shadow-sm">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Pie Chart</h3>
            {PieDemo}
          </div>
        </div>
      )}

      {/* How to reuse with custom data:
         <KeynoteChart
           variant="bar"
           dataBar={[{ name: 'Jan', value: 120 }, { name: 'Feb', value: 200 }]}
         />

         <KeynoteChart
           variant="pie"
           dataPie={[{ name: 'A', value: 40 }, { name: 'B', value: 60 }]}
         />
      */}
    </div>
  )
}
