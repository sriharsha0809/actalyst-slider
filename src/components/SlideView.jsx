import React from 'react'
import KeynoteBarChart from './KeynoteBarChart.jsx'
import KeynoteLineChart from './KeynoteLineChart.jsx'
import KeynotePieChart from './KeynotePieChart.jsx'

// Reference size used across the app
const REF_WIDTH = 960
const REF_HEIGHT = 540

function getImageFilterCss(preset, strength = 1) {
  const s = Number.isFinite(strength) ? Math.max(0, Math.min(1, strength)) : 1
  if (!preset || preset === 'original' || s <= 0) return 'none'

  if (preset === 'hdr') {
    const sat = 1 + (1.35 - 1) * s
    const contrast = 1 + (1.25 - 1) * s
    const bright = 1 + (1.05 - 1) * s
    return `saturate(${sat}) contrast(${contrast}) brightness(${bright})`
  }
  if (preset === 'landscape' || preset === 'cinematic') {
    const sat = 1 + (1.1 - 1) * s
    const contrast = 1 + (1.2 - 1) * s
    const bright = 1 + (0.9 - 1) * s
    return `saturate(${sat}) contrast(${contrast}) brightness(${bright})`
  }
  if (preset === 'bw') {
    const contrast = 1 + (1.15 - 1) * s
    return `grayscale(${s}) contrast(${contrast})`
  }
  return 'none'
}

function SlideBackground({ background }) {
  let style = { position: 'absolute', left: 0, top: 0, width: REF_WIDTH, height: REF_HEIGHT, borderRadius: 20, boxShadow: '0 0 0 1px rgba(0,0,0,0.05)', background: '#ffffff' }
  if (background && typeof background === 'object' && background.type === 'image' && background.src) {
    const size = (background.mode === 'stretch')
      ? '100% 100%'
      : (background.mode === 'custom' && typeof background.scale === 'number')
        ? `${background.scale}% auto`
        : (background.mode || 'cover')
    const bgOpacity = typeof background.opacity === 'number' ? Math.max(0, Math.min(1, background.opacity)) : 1

    // If percentage position is provided, build "X% Y%"; otherwise fall back to string position/center.
    const hasPercentPos = typeof background.posX === 'number' || typeof background.posY === 'number'
    const position = hasPercentPos
      ? `${typeof background.posX === 'number' ? background.posX : 50}% ${typeof background.posY === 'number' ? background.posY : 50}%`
      : (background.position || 'center')

    style = {
      ...style,
      backgroundImage: `url(${background.src})`,
      backgroundSize: size,
      backgroundPosition: position,
      backgroundRepeat: 'no-repeat',
      opacity: bgOpacity,
    }
  } else if (typeof background === 'string') {
    style = { ...style, background }
  }
  return <div style={style} />
}

const SHAPE_FONT_FAMILY = 'Inter, system-ui, sans-serif'

const getHAlign = (align) => {
  switch (align) {
    case 'right': return 'flex-end'
    case 'center': return 'center'
    default: return 'flex-start'
  }
}

const getVAlign = (valign) => {
  switch (valign) {
    case 'bottom': return 'flex-end'
    case 'middle': return 'center'
    default: return 'flex-start'
  }
}

const renderShapeElement = (el, { clipPath, borderRadius } = {}) => {
  const opacity = el.opacity == null ? 1 : el.opacity
  const shapeStyle = {
    background: el.fill || '#e5e7eb',
    border: `2px solid ${el.stroke || 'transparent'}`,
    borderRadius: borderRadius || 0,
    clipPath,
    opacity,
  }
  const textContent = (el.text || '').trim()
  const fontWeight = el.bold ? 700 : 400
  const fontStyle = el.italic ? 'italic' : 'normal'
  const textAlign = el.textAlign || 'center'
  const textVAlign = el.textVAlign || 'middle'

  return (
    <div className="w-full h-full relative">
      <div className="w-full h-full" style={shapeStyle} />
      {textContent ? (
        <div
          className="absolute inset-0 p-2"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: getHAlign(textAlign),
            justifyContent: getVAlign(textVAlign),
            color: el.textColor || '#111827',
            fontSize: el.fontSize || 18,
            fontFamily: el.fontFamily || SHAPE_FONT_FAMILY,
            fontWeight,
            fontStyle,
            textDecoration: el.underline ? 'underline' : 'none',
            textAlign,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            pointerEvents: 'none',
          }}
        >
          {textContent}
        </div>
      ) : null}
    </div>
  )
}

function RenderElement({ el, animateKey, hidePlaceholders = false }) {
  switch (el.type) {
    case 'text': {
      const styles = el.styles || {}
      const bgColor = el.bgColor || 'transparent'
      const hasHtml = !!(el.html && String(el.html).trim().length)
      const plainText = String(el.text || '').trim()
      const showText = hasHtml ? null : (plainText ? plainText : null)
      const baseColor = styles.color || '#111827'
      const opacity = styles.opacity == null ? 1 : styles.opacity
      const resolveColor = (color, a) => {
        if (!color || a == null || a >= 1) return color
        if (color.startsWith('rgba')) return color
        if (color.startsWith('rgb(')) return color.replace('rgb(', 'rgba(').replace(/\)$/, '') + `, ${a})`
        if (color[0] === '#') {
          const hex = color.replace('#', '')
          const v = hex.length === 3 ? hex.split('').map(ch => ch + ch).join('') : hex
          const int = parseInt(v, 16)
          const r = (int >> 16) & 255
          const g = (int >> 8) & 255
          const b = int & 255
          return `rgba(${r}, ${g}, ${b}, ${a})`
        }
        return color
      }
      const textColor = resolveColor(baseColor, opacity)
      const shadowColor = (() => {
        if (!styles.shadowEnabled) return 'none'
        const a = styles.shadowOpacity == null ? 0.5 : styles.shadowOpacity
        const alpha = Math.max(0, Math.min(1, a))
        return resolveColor(baseColor, alpha)
      })()
      return (
        <div className="w-full h-full p-2" style={{
          backgroundColor: bgColor,
          color: textColor,
          textShadow: shadowColor === 'none' ? 'none' : `0 2px 6px ${shadowColor}`,
          fontSize: styles.fontSize || 16,
          lineHeight: styles.lineHeight || 1.2,
          fontWeight: styles.bold ? 700 : 400,
          fontStyle: styles.italic ? 'italic' : 'normal',
          textDecoration: styles.underline ? 'underline' : 'none',
          textAlign: styles.align || 'left',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: styles?.valign === 'middle' ? 'center' : styles?.valign === 'bottom' ? 'flex-end' : 'flex-start',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {hasHtml ? (
            <div dangerouslySetInnerHTML={{ __html: el.html }} />
          ) : (
            hidePlaceholders ? (showText) : (showText)
          )}
        </div>
      )
    }
    case 'chart': {
      const chartType = el.chartType || 'bar'
      const variant = el.chartStyle || '2d'
      const structured = el.structuredData || null
      const legendOpts = el.legendOptions || {}
      const showLegend = legendOpts.show !== false
      const showTitle = !!legendOpts.titleEnabled
      const showContext = !!legendOpts.contextEnabled
      const titleText = legendOpts.titleText || ''
      const contextText = legendOpts.contextText || ''
      const bgMode = legendOpts.bgMode || 'transparent'
      const bgColor = legendOpts.bgColor || '#ffffff'
      const borderMode = legendOpts.borderMode || 'transparent'
      const borderColor = legendOpts.borderColor || 'rgba(148,163,184,0.7)'
      const xAxisEnabled = !!legendOpts.xAxisEnabled
      const xAxisLabel = xAxisEnabled ? (legendOpts.xAxisLabel || '') : null
      const yAxisEnabled = !!legendOpts.yAxisEnabled
      const yAxisLabel = yAxisEnabled ? (legendOpts.yAxisLabel || '') : null
      const showXAxis = legendOpts.showXAxis !== false
      const showYAxis = legendOpts.showYAxis !== false
      const showMinorGridlines = !!legendOpts.showMinorGridlines
      const minorGridlineOpacity = legendOpts.minorGridlineOpacity ?? 0.45

      const frameStyle = {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'stretch',
      }
      const chartBoxStyle = {
        flex: 1,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        padding: (bgMode === 'color' || borderMode === 'color') ? 6 : 0,
        boxSizing: 'border-box',
        backgroundColor: bgMode === 'color' ? bgColor : 'transparent',
        borderRadius: 10,
        border: borderMode === 'color' ? `1px solid ${borderColor}` : 'none',
      }
      const innerChartStyle = {
        flex: 1,
        minWidth: 0,
        minHeight: 0,
      }

      if (chartType === 'bar') {
        const cats = structured?.categories || el.labels || []
        const allSeries = structured?.series || [{ name: 'Series 1', data: el.data || [] }]
        const seriesNames = allSeries.map((s, idx) => s?.name || `Series ${idx + 1}`)
        const data = cats.map((name, i) => {
          const point = { name }
          allSeries.forEach((s, idx) => { point[idx === 0 ? 'value' : `v${idx + 1}`] = Number(s?.data?.[i]) || 0 })
          return point
        })
        const overrideColor = el.chartColor?.color || null
        const colorMode = el.chartColor?.mode || 'solid'
        const colorblindFriendly = !!el.chartColorblindFriendly
        const overridePalette = Array.isArray(el.chartPalette?.colors) ? el.chartPalette.colors : null
        return (
          <div className="w-full h-full" style={frameStyle}>
            {showTitle && titleText && (
              <div className="mb-1 text-xs font-semibold text-gray-800 text-center truncate">{titleText}</div>
            )}
            <div style={chartBoxStyle}>
              <div style={innerChartStyle}>
                <KeynoteBarChart
                  data={data}
                  variant={variant}
                  animateKey={animateKey}
                  overrideColor={overrideColor}
                  overridePalette={overridePalette}
                  colorMode={colorMode}
                  colorblindFriendly={colorblindFriendly}
                  showLegend={showLegend}
                  seriesNames={seriesNames}
                  xAxisLabel={xAxisLabel}
                  yAxisLabel={yAxisLabel}
                  showXAxis={showXAxis}
                  showYAxis={showYAxis}
                  showMinorGridlines={showMinorGridlines}
                  minorGridlineOpacity={minorGridlineOpacity}
                />
              </div>
            </div>
            {showContext && contextText && (
              <div className="mt-1 text-[11px] text-gray-600 text-center">{contextText}</div>
            )}
          </div>
        )
      }
      if (chartType === 'line') {
        const cats = structured?.categories || el.labels || []
        const allSeries = structured?.series || [{ name: 'Series 1', data: el.data || [] }]
        const seriesNames = allSeries.map((s, idx) => s?.name || `Series ${idx + 1}`)
        const data = cats.map((name, i) => {
          const point = { name }
          allSeries.forEach((s, idx) => { point[idx === 0 ? 'value' : `v${idx + 1}`] = Number(s?.data?.[i]) || 0 })
          return point
        })
        const overrideColor = el.chartColor?.color || null
        const colorMode = el.chartColor?.mode || 'solid'
        const colorblindFriendly = !!el.chartColorblindFriendly
        const overridePalette = Array.isArray(el.chartPalette?.colors) ? el.chartPalette.colors : null
        return (
          <div className="w-full h-full" style={frameStyle}>
            {showTitle && titleText && (
              <div className="mb-1 text-xs font-semibold text-gray-800 text-center truncate">{titleText}</div>
            )}
            <div style={chartBoxStyle}>
              <div style={innerChartStyle}>
                <KeynoteLineChart
                  data={data}
                  variant={variant}
                  animateKey={animateKey}
                  overrideColor={overrideColor}
                  overridePalette={overridePalette}
                  colorMode={colorMode}
                  colorblindFriendly={colorblindFriendly}
                  showLegend={showLegend}
                  seriesNames={seriesNames}
                  xAxisLabel={xAxisLabel}
                  yAxisLabel={yAxisLabel}
                  showXAxis={showXAxis}
                  showYAxis={showYAxis}
                  showMinorGridlines={showMinorGridlines}
                  minorGridlineOpacity={minorGridlineOpacity}
                />
              </div>
            </div>
            {showContext && contextText && (
              <div className="mt-1 text-[11px] text-gray-600 text-center">{contextText}</div>
            )}
          </div>
        )
      }
      if (chartType === 'pie') {
        const cats = structured?.categories || el.labels || []
        const s0 = structured?.series?.[0]?.data || el.data || []
        const data = cats.map((name, i) => ({ name, value: Number(s0?.[i]) || 0 }))
        const overrideColor = el.chartColor?.color || null
        const colorMode = el.chartColor?.mode || 'solid'
        const colorblindFriendly = !!el.chartColorblindFriendly
        const overridePalette = Array.isArray(el.chartPalette?.colors) ? el.chartPalette.colors : null
        return (
          <div className="w-full h-full" style={frameStyle}>
            {showTitle && titleText && (
              <div className="mb-1 text-xs font-semibold text-gray-800 text-center truncate">{titleText}</div>
            )}
            <div style={chartBoxStyle}>
              <div style={innerChartStyle}>
                <KeynotePieChart
                  data={data}
                  animateKey={animateKey ?? el.id}
                  variant={variant}
                  overrideColor={overrideColor}
                  overridePalette={overridePalette}
                  colorMode={colorMode}
                  colorblindFriendly={colorblindFriendly}
                  showLegend={showLegend}
                />
              </div>
            </div>
            {showContext && contextText && (
              <div className="mt-1 text-[11px] text-gray-600 text-center">{contextText}</div>
            )}
          </div>
        )
      }
      return null
    }
    case 'rect':
    case 'square':
      return renderShapeElement(el, { borderRadius: 8 })
    case 'roundRect':
      return renderShapeElement(el, { borderRadius: 18 })
    case 'circle':
      return renderShapeElement(el, { borderRadius: '50%' })
    case 'triangle':
      return renderShapeElement(el, { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' })
    case 'diamond':
      return renderShapeElement(el, { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' })
    case 'star':
      return renderShapeElement(el, { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' })
    case 'parallelogram':
      return renderShapeElement(el, { clipPath: 'polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)' })
    case 'trapezoid':
      return renderShapeElement(el, { clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)' })
    case 'pentagon':
      return renderShapeElement(el, { clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)' })
    case 'hexagon':
      return renderShapeElement(el, { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' })
    case 'octagon':
      return renderShapeElement(el, { clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' })
    case 'chevron':
      return renderShapeElement(el, { clipPath: 'polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%)' })
    case 'arrowRight':
      return renderShapeElement(el, { clipPath: 'polygon(0% 0%, 80% 0%, 80% 25%, 100% 50%, 80% 75%, 80% 100%, 0% 100%, 0% 0%)' })
    case 'cloud':
      return renderShapeElement(el, { clipPath: 'polygon(10% 60%, 20% 45%, 35% 40%, 45% 25%, 60% 30%, 70% 45%, 85% 50%, 90% 65%, 80% 80%, 60% 85%, 40% 80%, 25% 75%)' })
    case 'message': {
      const opacity = el.opacity == null ? 1 : el.opacity
      return (
        <div className="w-full h-full relative" style={{ opacity }}>
          <div className="w-full h-full rounded-lg" style={{ background: el.fill, border: `2px solid ${el.stroke}` }} />
          <div className="absolute bottom-0 left-4 w-0 h-0" style={{ borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: `15px solid ${el.stroke}` }} />
          <div className="absolute bottom-1 left-5 w-0 h-0" style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: `12px solid ${el.fill}` }} />
        </div>
      )
    }
    case 'image':
      return (
        el.src ? (
          <div
            className="w-full h-full relative flex items-center justify-center"
            style={{
              boxShadow: (() => {
                const raw = typeof el.shadowOpacity === 'number'
                  ? Math.max(0, Math.min(1, el.shadowOpacity))
                  : 0.35
                const alpha = el.showShadow ? raw : 0
                return `0 10px 30px rgba(15,23,42,${alpha})`
              })(),
              borderRadius: `${el.cornerRadiusTL ?? 8}px ${el.cornerRadiusTR ?? 8}px ${el.cornerRadiusBR ?? 8}px ${el.cornerRadiusBL ?? 8}px`,
              transition: 'box-shadow 180ms ease-out, border-radius 160ms ease-out',
            }}
          >
            {/* Title strictly above the image box */}
            {el.showTitle && (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 font-semibold text-center max-w-full truncate"
                style={{
                  color: el.titleColor || '#111827',
                  opacity: 1,
                  fontSize: el.titleFontSize || 12,
                }}
              >
                {el.title || 'Image Title'}
              </div>
            )}

            {/* Image centered in the box; width can grow independently */}
            <div
              className="relative w-full h-full overflow-hidden flex items-center justify-center"
              style={{
                borderRadius: `${el.cornerRadiusTL ?? 8}px ${el.cornerRadiusTR ?? 8}px ${el.cornerRadiusBR ?? 8}px ${el.cornerRadiusBL ?? 8}px`,
                transition: 'border-radius 160ms ease-out',
              }}
            >
              <img
                src={el.src}
                alt=""
                className="w-full h-full object-fill"
                draggable={false}
                style={{
                  opacity: el.opacity == null ? 1 : el.opacity,
                  filter: getImageFilterCss(el.filterPreset, el.filterStrength),
                  transition: 'opacity 180ms ease-out, filter 180ms ease-out'
                }}
              />
            </div>

            {/* Caption strictly below the image box, spanning full image width */}
            {el.showCaption && (
              <div
                className="absolute top-full left-0 mt-1 w-full text-left"
                style={{
                  color: el.captionColor || '#4b5563',
                  opacity: 1,
                  fontSize: el.captionFontSize || 11,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {el.caption || 'Image caption'}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-white" />
        )
      )
    case 'table': {
      // Simple non-interactive table rendering
      const rows = el.rows || 0
      const cols = el.cols || 0
      const cw = el.w / (cols || 1)
      const ch = el.h / (rows || 1)
      const hexToRgb = (hex) => {
        try { const m = String(hex || '').replace('#', ''); const v = m.length === 3 ? m.split('').map(ch => ch + ch).join('') : m; const int = parseInt(v, 16); return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 } } catch { return { r: 0, g: 0, b: 0 } }
      }
      const withAlpha = (hex, aPct = 100) => { const a = Math.max(0, Math.min(100, aPct)); if (a >= 100 || !hex || /^rgba?/i.test(hex)) return hex || '#000'; const { r, g, b } = hexToRgb(hex); return `rgba(${r}, ${g}, ${b}, ${a / 100})` }
      return (
        <div className="w-full h-full" style={{ background: '#fff', border: `1px solid ${el.borderColor || '#000'}`, position: 'relative', boxSizing: 'border-box', overflow: 'hidden' }}>
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} style={{ position: 'absolute', left: 0, top: r * ch, width: '100%', height: ch }}>
              {Array.from({ length: cols }).map((__, c) => {
                const idx = r * cols + c
                const cell = el.cells?.[idx]
                const isHeader = !!el.headerRow && r === 0
                const bgBase = (cell?.styles?.bgColor) ? cell.styles.bgColor : (isHeader ? (el.headerBg || '#f3f4f6') : (el.cellBg || '#ffffff'))
                const bgAlpha = (cell?.styles?.bgColorAlpha != null) ? cell.styles.bgColorAlpha : (isHeader ? (el.headerBgAlpha != null ? el.headerBgAlpha : 100) : 100)
                const bg = withAlpha(bgBase, bgAlpha)
                const fgBase = isHeader ? (el.headerTextColor || '#111827') : (cell?.styles?.color || '#111827')
                const fgAlpha = isHeader ? (el.headerTextAlpha != null ? el.headerTextAlpha : 100) : (cell?.styles?.colorAlpha != null ? cell.styles.colorAlpha : 100)
                const fg = withAlpha(fgBase, fgAlpha)
                const align = cell?.styles?.align || 'center'
                const valign = cell?.styles?.valign || 'middle'
                return (
                  <div key={c} style={{ position: 'absolute', left: c * cw, top: 0, width: cw, height: ch, boxSizing: 'border-box', borderRight: `1px solid ${el.borderColor || '#000'}`, borderBottom: `1px solid ${el.borderColor || '#000'}`, background: bg, color: fg, display: 'flex', alignItems: valign === 'middle' ? 'center' : (valign === 'bottom' ? 'flex-end' : 'flex-start'), justifyContent: align === 'right' ? 'flex-end' : (align === 'center' ? 'center' : 'flex-start'), padding: 6, overflow: 'hidden' }}>
                    <span className="truncate" style={{ fontSize: (cell?.styles?.fontSize || 12) }}>{cell?.text || ''}</span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )
    }
    default:
      return null
  }
}

function SlideViewBase({ data, scale = 1, animateKey = null, mode = 'viewer', liveOverrides = null }) {
  const hidePlaceholders = mode === 'presentation' || mode === 'viewer'
  return (
    <div className="relative" style={{ width: REF_WIDTH, height: REF_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
      <SlideBackground background={data?.background || '#ffffff'} />
      {Array.isArray(data?.elements) && data.elements.map((el, index) => {
        const ov = liveOverrides && el?.id ? liveOverrides[el.id] : null
        const ex = Number.isFinite(ov?.x) ? ov.x : el.x
        const ey = Number.isFinite(ov?.y) ? ov.y : el.y
        const er = Number.isFinite(ov?.rotation) ? ov.rotation : (el.rotation || 0)

        // Animation props
        const isPresentation = mode === 'presentation'
        const animClass = isPresentation ? 'element-anim-enter' : ''
        const animDelay = isPresentation ? `${index * 100}ms` : '0ms'
        // Force remount on slide change to replay animation
        const key = isPresentation ? `${el.id}-${animateKey}` : el.id

        return (
          <div
            key={key}
            className={`absolute ${animClass}`}
            style={{
              left: ex,
              top: ey,
              width: el.w,
              height: el.h,
              transform: `rotate(${er}deg)`,
              animationDelay: animDelay
            }}
          >
            <RenderElement el={el} animateKey={animateKey} hidePlaceholders={hidePlaceholders} />
          </div>
        )
      })}
    </div>
  )
}

const SlideView = React.memo(function SlideView({ data, scale = 1, isThumbnailView = false, mode = 'viewer', animateKey = null, liveOverrides = null }) {
  // mode: 'viewer' | 'presentation' | 'editor' (viewer/presentation are read-only)
  return <SlideViewBase data={data} scale={scale} isThumbnailView={isThumbnailView} animateKey={animateKey} mode={mode} liveOverrides={liveOverrides} />
}, (prev, next) => {
  // Re-render only when relevant inputs change
  return prev.data === next.data && prev.scale === next.scale && prev.isThumbnailView === next.isThumbnailView && prev.mode === next.mode && prev.animateKey === next.animateKey && prev.liveOverrides === next.liveOverrides
})

export default SlideView
