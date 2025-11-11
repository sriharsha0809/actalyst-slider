import React, { useRef, useState } from 'react'
import { useSlides } from '../context/SlidesContext.jsx'

export default function FileMenu({ isOpen, onClose, onFileOpen, onSave }) {
  const { state, dispatch } = useSlides()
  const fileInputRef = useRef(null)
  const [showShareSubmenu, setShowShareSubmenu] = useState(false)
  const [showNewConfirm, setShowNewConfirm] = useState(false)

  if (!isOpen) return null

  const handleNew = () => {
    setShowNewConfirm(true)
  }

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target.result
        let presentationData

        // Try to parse as JSON first (our custom format)
        try {
          presentationData = JSON.parse(content)
        } catch {
          // If not JSON, try to parse as HTML/PPT format
          const parser = new DOMParser()
          const doc = parser.parseFromString(content, 'text/html')
          
          // Extract slides from HTML
          const slides = []
          const slideElements = doc.querySelectorAll('.slide')
          
          slideElements.forEach((slideEl, index) => {
      const elements = []
            // Charts
            const chartEls = slideEl.querySelectorAll('[data-el-type="chart"][data-el-chart]')
            chartEls.forEach(node => {
              const style = node.style
              let payload = null
              try { payload = JSON.parse(decodeURIComponent(node.getAttribute('data-el-chart') || '')) } catch {}
              if (payload) {
                elements.push({
                  id: `element_${Date.now()}_${Math.random()}`,
                  type: 'chart',
                  chartType: payload.chartType || 'bar',
                  x: parseInt(style.left) || 0,
                  y: parseInt(style.top) || 0,
                  w: parseInt(style.width) || 400,
                  h: parseInt(style.height) || 300,
                  rotation: 0,
                  data: Array.isArray(payload.data) ? payload.data : [],
                  labels: Array.isArray(payload.labels) ? payload.labels : [],
                  colors: Array.isArray(payload.colors) ? payload.colors : ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
                })
              }
            })
            
            // Text blocks
            const textElements = slideEl.querySelectorAll('div[style*="position: absolute"]:not([data-el-type])')
            
            textElements.forEach(textEl => {
              const style = textEl.style
              
              elements.push({
                id: `element_${Date.now()}_${Math.random()}`,
                type: 'text',
                x: parseInt(style.left) || 0,
                y: parseInt(style.top) || 0,
                w: parseInt(style.width) || 200,
                h: parseInt(style.height) || 50,
                text: textEl.textContent || '',
                bgColor: style.backgroundColor || 'transparent',
                styles: {
                  fontFamily: style.fontFamily || 'Inter, system-ui, sans-serif',
                  fontSize: parseInt(style.fontSize) || 28,
                  color: style.color || '#111827',
                  bold: style.fontWeight === '700' || style.fontWeight === 'bold',
                  italic: style.fontStyle === 'italic',
                  underline: (style.textDecoration || '').includes('underline'),
                  align: style.textAlign || 'left',
                  listStyle: 'none'
                }
              })
            })
            
            slides.push({
              id: `slide_${Date.now()}_${index}`,
              name: `Slide ${index + 1}`,
              background: slideEl.style.background || '#ffffff',
              elements: elements.length > 0 ? elements : [{
                id: `element_${Date.now()}_${Math.random()}`,
                type: 'text',
                x: 80,
                y: 80,
                w: 320,
                h: 80,
                text: 'Double-click to edit',
                bgColor: 'transparent',
                styles: {
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: 28,
                  color: '#111827',
                  bold: false,
                  italic: false,
                  underline: false,
                  align: 'left',
                  listStyle: 'none'
                }
              }]
            })
          })
          
          presentationData = {
            slides: slides.length > 0 ? slides : [{
              id: `slide_${Date.now()}`,
              name: 'Slide 1',
              background: '#ffffff',
              elements: [{
                id: `element_${Date.now()}`,
                type: 'text',
                x: 80,
                y: 80,
                w: 320,
                h: 80,
                text: 'Double-click to edit',
                bgColor: 'transparent',
                styles: {
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: 28,
                  color: '#111827',
                  bold: false,
                  italic: false,
                  underline: false,
                  align: 'left',
                  listStyle: 'none'
                }
              }]
            }],
            currentSlideId: slides.length > 0 ? slides[0].id : null,
            selectedElementId: null,
            clipboard: null,
            history: [],
            historyIndex: -1
          }
        }

        // Load the presentation data
        dispatch({ type: 'LOAD_PRESENTATION', data: presentationData })
        
        // Extract filename and notify parent
        const fileName = file.name.replace(/\.(ppt|json|html)$/i, '')
        onFileOpen?.(fileName)
        
        alert(`Presentation "${fileName}" loaded successfully!`)
      } catch (error) {
        alert('Error loading file: ' + error.message)
      }
    }
    
    reader.readAsText(file)
    event.target.value = '' // Reset file input
  }

  // Utilities for saving via File System Access API or fallback
  const supportsFilePicker = () => typeof window !== 'undefined' && window.isSecureContext && 'showSaveFilePicker' in window
  const saveBlob = async (blob, suggestedName) => {
    // Legacy IE/Edge fallback
    if (typeof navigator !== 'undefined' && navigator.msSaveOrOpenBlob) {
      try { navigator.msSaveOrOpenBlob(blob, suggestedName); return suggestedName } catch {}
    }

    if (supportsFilePicker()) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName,
          types: [{ description: 'PowerPoint Presentation', accept: { 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'] } }],
          excludeAcceptAllOption: false
        })
        const writable = await handle.createWritable()
        // ensure overwrite
        try { await writable.truncate(0) } catch {}
        // write blob (ArrayBuffer path for broader compat)
        const ab = await blob.arrayBuffer()
        await writable.write(new Uint8Array(ab))
        await writable.close()
        // Use the actual name chosen in the dialog
        return handle?.name || suggestedName
      } catch (e) {
        // User cancelled or API failed; fall through to download
      }
    }

    // Standard download fallback
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = suggestedName
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 0)
    return suggestedName
  }

  const loadPptxLib = async () => {
    if (window.PptxGenJS) return window.PptxGenJS
    // Dynamically load from CDN
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js'
      s.onload = resolve
      s.onerror = reject
      document.head.appendChild(s)
    })
    return window.PptxGenJS
  }

  const buildPptxBlob = async () => {
    const PptxGenJS = await loadPptxLib()
    const pptx = new PptxGenJS()
    // Set size to 10in x 5.625in (16:9)
    pptx.defineLayout({ name: 'WIDE', width: 10, height: 5.625 })
    pptx.layout = 'WIDE'
    const PX_PER_IN = 96

    state.slides.forEach((slide) => {
      const s = pptx.addSlide()
      // Background
      if (slide.background && typeof slide.background === 'object' && slide.background.type === 'image' && slide.background.src) {
        s.addImage({ data: slide.background.src, x: 0, y: 0, w: 10, h: 5.625 })
      } else if (typeof slide.background === 'string') {
        s.background = { color: slide.background }
      }
      // Elements: text, images, shapes, charts (best-effort mapping)
      slide.elements.forEach(el => {
        const x = (el.x || 0) / PX_PER_IN
        const y = (el.y || 0) / PX_PER_IN
        const w = (el.w || 200) / PX_PER_IN
        const h = (el.h || 80) / PX_PER_IN

        if (el.type === 'text') {
          s.addText(el.html ? stripHtml(el.html) : (el.text || ''), {
            x, y, w, h,
            rotate: Number.isFinite(el.rotation) ? el.rotation : 0,
            fontFace: el.styles?.fontFamily || 'Arial',
            fontSize: el.styles?.fontSize || 24,
            bold: !!el.styles?.bold,
            italic: !!el.styles?.italic,
            underline: !!el.styles?.underline,
            color: (el.styles?.color || '#111827').replace(/rgba\((.*),(.*),(.*),(.*)\)/, '#111827'),
            align: (el.styles?.align || 'left')
          })
        }
        else if (el.type === 'image' && el.src) {
          s.addImage({ data: el.src, x, y, w, h, rotate: Number.isFinite(el.rotation) ? el.rotation : 0 })
        }
        else if ([ 'rect','square','circle','triangle','diamond','star','message' ].includes(el.type)) {
          let shape = 'rect'
          if (el.type === 'circle') shape = 'ellipse'
          else if (el.type === 'triangle') shape = 'triangle'
          else if (el.type === 'diamond') shape = 'diamond'
          else if (el.type === 'star') shape = 'star5'
          else if (el.type === 'message') shape = 'wedgeRoundRectCallout'
          // square = rect with equal sides
          const opts = {
            x, y, w, h,
            rotate: Number.isFinite(el.rotation) ? el.rotation : 0,
            fill: { color: el.fill || '#fde68a' },
            line: { color: el.stroke || '#f59e0b', width: 1 },
          }
          s.addShape(shape, opts)
          // center text inside shape if provided
          if (el.text) {
            s.addText(el.text, {
              x, y, w, h,
              align: (el.styles?.align || 'center'),
              fontSize: el.fontSize || el.styles?.fontSize || 16,
              color: el.textColor || el.styles?.color || '#111827',
              bold: !!el.styles?.bold,
              italic: !!el.styles?.italic,
              underline: !!el.styles?.underline,
              valign: 'middle'
            })
          }
        }
        else if (el.type === 'chart' && Array.isArray(el.labels) && Array.isArray(el.data)) {
          try {
            const toSeries = (data) => {
              // data can be number[] or number[][]
              if (Array.isArray(data) && data.length && Array.isArray(data[0])) {
                return data.map((arr, i) => ({ name: `Series ${i+1}`, labels: el.labels, values: arr }))
              }
              return [{ name: 'Series 1', labels: el.labels, values: data }]
            }
            const series = toSeries(el.data)
            const chartTypeMap = { bar: 'bar', column: 'bar', line: 'line', pie: 'pie', area: 'area' }
            const cType = chartTypeMap[el.chartType] || 'bar'
            s.addChart(cType, series, { x, y, w, h, chartColors: Array.isArray(el.colors) ? el.colors : undefined })
          } catch {}
        }
      })
    })

    const blob = await pptx.write('blob')
    return blob
  }

  const stripHtml = (html='') => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const handleSave = async () => {
    try {
      const blob = await buildPptxBlob()
      const name = `presentation-${new Date().toISOString().slice(0, 10)}.pptx`
      const savedName = await saveBlob(blob, name)
      const display = String(savedName || name).replace(/\.(pptx)$/i, '').trim() || 'Untitled Presentation'
      onSave?.(display)
    } catch (error) {
      alert('Error saving presentation: ' + error.message)
    }
  }

  const handleSaveAs = async () => {
    try {
      const blob = await buildPptxBlob()
      let name = `presentation-${new Date().toISOString().slice(0, 10)}.pptx`
      if (supportsFilePicker()) {
        const chosen = await saveBlob(blob, name)
        if (chosen) name = chosen
      } else {
        // Fallback: prompt for filename only affects download name
        const input = prompt('Enter filename for the presentation (without extension):', name.replace(/\.pptx$/i, ''))
        if (input && input.trim()) name = `${input.trim()}.pptx`
        await saveBlob(blob, name)
      }
      const display = String(name || '').replace(/\.(pptx)$/i, '').trim() || 'Untitled Presentation'
      onSave?.(display)
    } catch (error) {
      alert('Error saving presentation: ' + error.message)
    }
  }

  const handleExportPDF = () => {
    // Create a simple HTML representation for PDF export
    const printWindow = window.open('', '_blank')
    const slides = state.slides.map((slide, index) => {
      const elementsHTML = slide.elements.map(el => {
        if (el.type === 'text') {
          return `
            <div style="position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.w}px; height: ${el.h}px; 
                        color: ${el.styles.color}; font-size: ${el.styles.fontSize}px; 
                        font-weight: ${el.styles.bold ? 700 : 400}; 
                        font-style: ${el.styles.italic ? 'italic' : 'normal'};
                        text-decoration: ${el.styles.underline ? 'underline' : 'none'};
                        text-align: ${el.styles.align};
                        background-color: ${el.bgColor || 'transparent'};
                        padding: 8px;">
              ${el.text}
            </div>
          `
        }
        return ''
      }).join('')

      return `
        <div style="page-break-after: always; width: 960px; height: 540px; position: relative; 
                    background: ${slide.background || '#ffffff'}; margin: 20px auto; 
                    border: 3px solid #000000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          ${elementsHTML}
          <div style="position: absolute; bottom: 10px; right: 10px; font-size: 12px; color: #666;">
            Slide ${index + 1}
          </div>
        </div>
      `
    }).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Presentation Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            @media print {
              body { margin: 0; padding: 0; }
            }
          </style>
        </head>
        <body>
          ${slides}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 100);
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleShareAsWord = async () => {
    try {
      // Create enhanced HTML content for Word document
      const slidesHTML = state.slides.map((slide, index) => {
        const elementsHTML = slide.elements.map(el => {
          if (el.type === 'text') {
            return `
              <div style="position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.w}px; height: ${el.h}px; 
                          color: ${el.styles.color}; font-family: '${el.styles.fontFamily}'; font-size: ${el.styles.fontSize}px; 
                          font-weight: ${el.styles.bold ? 700 : 400}; 
                          font-style: ${el.styles.italic ? 'italic' : 'normal'};
                          text-decoration: ${el.styles.underline ? 'underline' : 'none'};
                          text-align: ${el.styles.align};
                          background-color: ${el.bgColor || 'transparent'};
                          padding: 8px; box-sizing: border-box; border-radius: 4px;">
                ${el.html || el.text}
              </div>
            `
          } else if (el.type === 'image' && el.src) {
            return `
              <img src="${el.src}" style="position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.w}px; height: ${el.h}px; object-fit: contain;" />
            `
          } else if (['rect', 'square', 'circle', 'triangle', 'diamond', 'star', 'message'].includes(el.type)) {
            return `
              <div style="position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.w}px; height: ${el.h}px;
                          background: ${el.fill || '#fde68a'}; border: 2px solid ${el.stroke || '#f59e0b'};
                          ${el.type === 'circle' ? 'border-radius: 50%;' : ''}
                          display: flex; align-items: center; justify-content: center;
                          color: ${el.textColor || '#111827'}; font-size: ${el.fontSize || '16'}px; font-weight: 500;">
                ${el.text || ''}
              </div>
            `
          }
          return ''
        }).join('')

        return `
          <div style="width: 960px; height: 540px; position: relative; margin: 20px auto;
                      background: ${slide.background || '#ffffff'}; 
                      border: 2px solid #e5e7eb; border-radius: 8px;
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1); page-break-after: always;">
            <div style="position: absolute; top: -25px; left: 0; font-size: 14px; font-weight: 600; color: #374151;">
              ${slide.name || `Slide ${index + 1}`}
            </div>
            ${elementsHTML}
          </div>
        `
      }).join('')

      // Create Word-compatible HTML document
      const wordContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <title>PPT Slide Maker - Presentation Export</title>
  <style>
    body { 
      font-family: 'Segoe UI', sans-serif;
      margin: 0;
      padding: 20px;
      background: #ffffff;
    }
    h1 {
      color: #1f2937;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 10px;
    }
    .info {
      background: #f8fafc;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
  </style>
</head>
<body>
  <h1>📊 PPT Slide Maker - Presentation Export</h1>
  
  <div class="info">
    <p><strong>📋 Total Slides:</strong> ${state.slides.length}</p>
    <p><strong>📅 Export Date:</strong> ${new Date().toLocaleString()}</p>
  </div>
  
  ${slidesHTML}
</body>
</html>
      `

      // Create and download Word document
      const blob = new Blob([wordContent], { type: 'application/msword' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const fileName = `PPT-Presentation-${new Date().toISOString().slice(0, 10)}.doc`
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      alert('✅ Presentation exported as Word document successfully!')
    } catch (error) {
      alert('❌ Error exporting to Word: ' + error.message)
    }
  }

  const handleShareAsImage = async () => {
    try {
      // Create canvas for image export
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const slideWidth = 960
      const slideHeight = 540
      const padding = 40
      const slideSpacing = 60
      
      canvas.width = slideWidth + (padding * 2)
      canvas.height = (slideHeight + slideSpacing) * state.slides.length + padding * 2
      
      // White background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Title
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 24px Arial'
      ctx.fillText('📊 PPT Slide Maker Presentation', padding, padding + 20)
      
      // Info
      ctx.font = '16px Arial'
      ctx.fillText(`📋 Total Slides: ${state.slides.length}`, padding, padding + 50)
      ctx.fillText(`📅 ${new Date().toLocaleString()}`, padding, padding + 75)
      
      let yOffset = padding + 100
      
      // Draw each slide
      state.slides.forEach((slide, index) => {
        // Slide background
        ctx.fillStyle = slide.background || '#ffffff'
        ctx.fillRect(padding, yOffset, slideWidth, slideHeight)
        
        // Slide border
        ctx.strokeStyle = '#e5e7eb'
        ctx.lineWidth = 2
        ctx.strokeRect(padding, yOffset, slideWidth, slideHeight)
        
        // Slide title
        ctx.fillStyle = '#374151'
        ctx.font = 'bold 16px Arial'
        ctx.fillText(slide.name || `Slide ${index + 1}`, padding, yOffset - 10)
        
        // Draw elements (simplified for canvas)
        slide.elements.forEach(el => {
          if (el.type === 'text') {
            ctx.fillStyle = el.styles.color || '#111827'
            ctx.font = `${el.styles.bold ? 'bold ' : ''}${el.styles.fontSize || 20}px Arial`
            ctx.fillText(el.text || '', padding + el.x, yOffset + el.y + 20)
          }
        })
        
        yOffset += slideHeight + slideSpacing
      })
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const fileName = `PPT-Presentation-${new Date().toISOString().slice(0, 10)}.png`
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        alert('✅ Presentation exported as image successfully!')
      }, 'image/png')

    } catch (error) {
      alert('❌ Error exporting to image: ' + error.message)
    }
  }

  const handleShare = () => {
    setShowShareSubmenu(!showShareSubmenu)
  }

  const menuItems = [
    { label: 'New', icon: '🆕', action: handleNew, description: 'Start a new presentation' },
    { label: 'Save', icon: '💾', action: handleSave, description: 'Save as .pptx (opens file picker)' },
    { label: 'Save As', icon: '📝', action: handleSaveAs, description: 'Save as .pptx with name' },
    { label: 'Export as PDF', icon: '📄', action: handleExportPDF, description: 'Print or save as PDF' },
    { label: 'Share', icon: '🔗', action: handleShare, description: 'Share as Word or Image', hasSubmenu: true },
  ]

  const shareMenuItems = [
    { label: 'Share as Word', icon: '📄', action: handleShareAsWord, description: 'Export as Word document (.doc)' },
    { label: 'Share as Image', icon: '🖼️', action: handleShareAsImage, description: 'Export as PNG image' },
  ]

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40" 
        onClick={onClose}
      />
      
      {/* Side Panel */}
      <div className="fixed left-0 top-[49px] bottom-0 w-80 bg-white shadow-2xl z-50 border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#9B5DE0' }}>
            <h2 className="text-xl font-semibold text-white">File</h2>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-2">
            {menuItems.map((item, index) => (
              <div key={index}>
                <button
                  onClick={() => {
                    if (item.hasSubmenu) {
                      item.action()
                    } else {
                      item.action()
                      onClose()
                    }
                  }}
                  className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-100 transition-colors text-left border-b border-gray-100"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex flex-col flex-1">
                    <span className="text-base font-medium text-gray-700">{item.label}</span>
                    <span className="text-xs text-gray-500">{item.description}</span>
                  </div>
                  {item.hasSubmenu && (
                    <span className={`text-gray-400 transition-transform ${showShareSubmenu && item.label === 'Share' ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                  )}
                </button>
                
                {/* Submenu for Share */}
                {item.hasSubmenu && item.label === 'Share' && showShareSubmenu && (
                  <div className="bg-gray-50 border-l-4 border-blue-500">
                    {shareMenuItems.map((subItem, subIndex) => (
                      <button
                        key={subIndex}
                        onClick={() => {
                          subItem.action()
                          setShowShareSubmenu(false)
                          onClose()
                        }}
                        className="w-full px-10 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left"
                      >
                        <span className="text-lg">{subItem.icon}</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">{subItem.label}</span>
                          <span className="text-xs text-gray-500">{subItem.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      
      {/* New confirmation dialog */}
      {showNewConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-2xl w-[420px] p-6">
            <h3 className="text-lg font-semibold mb-2">Start New Presentation?</h3>
            <p className="text-sm text-gray-600 mb-4">You have unsaved changes. Do you want to save your current presentation before creating a new one?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                onClick={() => setShowNewConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={async () => {
                  try { await handleSave() } catch {}
                  dispatch({ type: 'NEW_PRESENTATION' })
                  onFileOpen?.('Untitled Presentation')
                  setShowNewConfirm(false)
                  onClose()
                }}
              >
                Save
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={() => {
                  dispatch({ type: 'NEW_PRESENTATION' })
                  onFileOpen?.('Untitled Presentation')
                  setShowNewConfirm(false)
                  onClose()
                }}
              >
                Don't Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

