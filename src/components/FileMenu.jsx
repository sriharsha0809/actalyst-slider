import React, { useRef, useState, useEffect } from 'react'
import { useSlides } from '../context/SlidesContext.jsx'
import { PRESENTATION_TEMPLATES } from '../data/templates.js'

export default function FileMenu({ isOpen, onClose, onFileOpen, onSave }) {
  const { state, dispatch } = useSlides()
  const fileInputRef = useRef(null)
  const [showShareSubmenu, setShowShareSubmenu] = useState(false)
  const [showNewConfirm, setShowNewConfirm] = useState(false)
  const [closing, setClosing] = useState(false)
  const [showThemeConfirm, setShowThemeConfirm] = useState(false)
  const [pendingTheme, setPendingTheme] = useState(null)
  const [applyThemeToAllSlides, setApplyThemeToAllSlides] = useState(false)
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false)
  const [pendingTemplate, setPendingTemplate] = useState(null)

  useEffect(() => { setClosing(false) }, [isOpen])

  if (!isOpen) return null

  const handleNew = () => {
    // Use React 18's synchronous state update for immediate rendering
    setShowNewConfirm(true)
  }

  const requestClose = () => {
    try { setClosing(true) } catch {}
    // Wait for animation to finish
    setTimeout(() => { try { onClose?.() } catch {} }, 450)
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

  // Design tab themes replicated here
  const designThemes = [
    { name: 'Sunset', background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)', preview: { header: '#ffe1e6', block1: '#ffc2cc', block2: '#ffd9e1' } },
    { name: 'Ocean', background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', preview: { header: '#d6e9ff', block1: '#cfe0ff', block2: '#e0f3ff' } },
    { name: 'Emerald', background: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', preview: { header: '#eafdd9', block1: '#dcf8c6', block2: '#c8efbb' } },
    { name: 'Slate', background: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)', preview: { header: '#e5eaed', block1: '#d3dde3', block2: '#c1cdd4' } },
    { name: 'Peach', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', preview: { header: '#fff0cc', block1: '#ffe0b3', block2: '#ffd1a6' } },
    { name: 'Grape', background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', preview: { header: '#efe6fb', block1: '#e2d3f6', block2: '#f7d8ee' } },
    { name: 'Aurora', background: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)', preview: { header: '#d9fbf5', block1: '#cdeaf4', block2: '#e3d6f0' } },
    { name: 'Mono', background: 'linear-gradient(135deg, #e0e0e0 0%, #9e9e9e 100%)', preview: { header: '#f2f2f2', block1: '#e0e0e0', block2: '#cccccc' } },
    // Additional themes
    { name: 'Citrus', background: 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)', preview: { header: '#fff3bf', block1: '#ffe8a1', block2: '#e6fffb' } },
    { name: 'Flamingo', background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', preview: { header: '#fde7f6', block1: '#f3d0ec', block2: '#d9e2fb' } },
    { name: 'Forest', background: 'linear-gradient(135deg, #38ef7d 0%, #11998e 100%)', preview: { header: '#d4ffe7', block1: '#b8f4d6', block2: '#a0ead0' } },
    { name: 'Midnight', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)', preview: { header: '#dce1e6', block1: '#cfd4da', block2: '#bfc5cc' } },
    { name: 'Lavender', background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', preview: { header: '#f0e6ff', block1: '#dfccfb', block2: '#cde3fe' } },
    { name: 'Coral', background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', preview: { header: '#fff4e3', block1: '#ffe0cf', block2: '#ffd6c9' } },
    { name: 'Aqua', background: 'linear-gradient(135deg, #13547a 0%, #80d0c7 100%)', preview: { header: '#d6f4ef', block1: '#c3ebe5', block2: '#b0e2db' } },
    { name: 'Sunrise', background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', preview: { header: '#ffe1e6', block1: '#ffd3e6', block2: '#ffe8f6' } },
    { name: 'Steel', background: 'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)', preview: { header: '#eef3f7', block1: '#e5edf2', block2: '#dde6ec' } },
    { name: 'Sand', background: 'linear-gradient(135deg, #e6dada 0%, #274046 100%)', preview: { header: '#f0eaea', block1: '#e4dbdb', block2: '#d9d1d1' } },
  ]

  const applyThemeBackground = (theme, applyToAll = false) => {
    if (!theme) return
    if (applyToAll) {
      state.slides.forEach((slide) => {
        dispatch({ type: 'UPDATE_SLIDE_BACKGROUND', slideId: slide.id, background: theme.background })
      })
      return
    }
    if (state.currentSlideId) {
      dispatch({ type: 'UPDATE_SLIDE_BACKGROUND', slideId: state.currentSlideId, background: theme.background })
    }
  }

  const openThemeConfirm = (theme) => {
    setPendingTheme(theme)
    setApplyThemeToAllSlides(false)
    setShowThemeConfirm(true)
  }

  const handleThemeProceed = () => {
    applyThemeBackground(pendingTheme, applyThemeToAllSlides)
    setShowThemeConfirm(false)
    setPendingTheme(null)
  }

  const handleThemeCancel = () => {
    setShowThemeConfirm(false)
    setPendingTheme(null)
  }

  const applyTemplate = (template) => {
    if (!template) return
    // Load template slides into the presentation
    const templateSlides = template.slides.map((slide, index) => ({
      ...slide,
      id: `slide_${Date.now()}_${index}_${Math.random()}`,
      elements: slide.elements.map((el, elIndex) => ({
        ...el,
        id: `element_${Date.now()}_${index}_${elIndex}_${Math.random()}`
      }))
    }))
    
    // Load the template as the new presentation
    const newPresentationData = {
      slides: templateSlides,
      currentSlideId: templateSlides[0]?.id || null,
      selectedElementId: null,
      clipboard: null,
      history: [],
      historyIndex: -1
    }
    
    dispatch({ type: 'LOAD_PRESENTATION', data: newPresentationData })
    onFileOpen?.(template.name)
    requestClose()
  }

  const openTemplateConfirm = (template) => {
    setPendingTemplate(template)
    setShowTemplateConfirm(true)
  }

  const handleTemplateCancel = () => {
    setShowTemplateConfirm(false)
    setPendingTemplate(null)
  }

  const handleTemplateProceed = () => {
    if (!pendingTemplate) return
    applyTemplate(pendingTemplate)
    setShowTemplateConfirm(false)
    setPendingTemplate(null)
  }

  const handleTemplateSaveAndProceed = async () => {
    if (!pendingTemplate) return
    try {
      await handleSave()
    } catch {}
    applyTemplate(pendingTemplate)
    setShowTemplateConfirm(false)
    setPendingTemplate(null)
  }

  return (
    <>
      <style>{`
        @keyframes paperFoldIn { 
          0% { transform: perspective(1200px) rotateX(-12deg) rotateY(6deg) translateY(-8px) scale(0.96); opacity: 0; }
          60% { opacity: 1; }
          100% { transform: perspective(1200px) rotateX(0) rotateY(0) translateY(0) scale(1); opacity: 1; }
        }
        .paper-fold-enter { 
          transform-origin: top left; 
          animation: paperFoldIn 480ms cubic-bezier(.2,.8,.2,1) both; 
          will-change: transform, opacity; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }
        @keyframes paperUnfoldOut { 
          0% { transform: perspective(1200px) rotateX(0) rotateY(0) translateY(0) scale(1); opacity: 1; }
          100% { transform: perspective(1200px) rotateX(-12deg) rotateY(6deg) translateY(-8px) scale(0.96); opacity: 0; }
        }
        .paper-unfold-exit {
          transform-origin: top left;
          animation: paperUnfoldOut 420ms cubic-bezier(.2,.8,.2,1) both;
          will-change: transform, opacity;
          box-shadow: 0 12px 24px rgba(0,0,0,0.06);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out forwards;
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out forwards;
        }
      `}</style>
      {/* Full-screen File View with frosted overlay */}
      <div className="fixed inset-0 z-50 flex h-screen w-full bg-white/30 backdrop-blur-xl transition-all duration-500 ease-out" onClick={() => requestClose()}>
        <div className={`flex flex-col md:flex-row w-full h-full ${closing ? 'paper-unfold-exit' : 'paper-fold-enter'}`} onClick={(e)=>e.stopPropagation()}>
          {/* Left Pane - File Actions */}
          <div className="w-full md:w-1/4 bg-white/50 backdrop-blur-2xl border-b md:border-b-0 md:border-r border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8 md:p-10 flex flex-col gap-6 text-gray-700 relative">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">File</h2>
            {menuItems.map((item, index) => (
              <div key={index} className="flex flex-col">
                <button
                  onClick={() => {
                    if (item.hasSubmenu) {
                      item.action()
                    } else if (item.label === 'New') {
                      // Don't close menu when opening New dialog
                      item.action()
                    } else {
                      item.action()
                      onClose()
                    }
                  }}
                  className="text-gray-700 transition-all duration-300 ease-in-out hover:translate-x-1 hover:text-black hover:font-medium text-left px-3 py-2 rounded-lg border border-white/50 hover:bg-white/60 hover:shadow-sm"
                  title={item.description}
                >
                  {item.label}
                </button>
                {item.hasSubmenu && item.label === 'Share' && showShareSubmenu && (
                  <div className="mt-2 ml-4 flex flex-col gap-2">
                    {shareMenuItems.map((subItem, subIndex) => (
                      <button
                        key={subIndex}
                        onClick={() => {
                        subItem.action()
                          setShowShareSubmenu(false)
                          requestClose()
                        }}
                        className="text-sm text-gray-600 transition-all duration-300 ease-in-out hover:translate-x-1 hover:text-black hover:font-medium text-left px-3 py-2 rounded-md border border-white/40 hover:bg-white/60 hover:shadow-sm"
                        title={subItem.description}
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {/* Fixed Close button at bottom of left pane */}
            <div className="pointer-events-auto absolute left-0 right-0 bottom-4 px-8 md:px-10">
              <button onClick={() => requestClose()} className="w-full px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 transition-colors shadow-md">Close</button>
            </div>
          </div>

          {/* Right Pane - Templates & Themes */}
          <div className="flex-1 bg-white/30 backdrop-blur-xl p-6 md:p-10 overflow-y-auto shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            {/* Templates Section */}
            <div className="mb-12">
              <div className="sticky top-0 z-50 -mx-6 md:-mx-10 px-6 md:px-10 py-3 bg-transparent backdrop-blur-2xl border-b border-white/40 shadow-[0_1px_8px_rgba(0,0,0,0.08)] relative overflow-hidden mb-6">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/95 to-white/25" />
                <h2 className="relative text-lg font-semibold text-gray-800">Templates</h2>
              </div>
              <div className="relative z-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {PRESENTATION_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => openTemplateConfirm(template)}
                    className="bg-white rounded-2xl shadow-sm p-4 transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-lg border border-white/60 text-left group"
                    title={template.description}
                  >
                    {/* Template Thumbnail */}
                    <div className="rounded-xl mb-3 w-full h-32 relative overflow-hidden" style={{ background: template.thumbnail.gradient }}>
                      {/* Mini slide previews */}
                      <div className="absolute inset-2 flex gap-1">
                        <div className="flex-1 bg-white/20 backdrop-blur-sm rounded border border-white/30" />
                        <div className="flex-1 bg-white/15 backdrop-blur-sm rounded border border-white/20" />
                        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded border border-white/10" />
                      </div>
                      {/* Slide count badge */}
                      <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full">
                        {template.slides.length} slides
                      </div>
                    </div>
                    {/* Template Info */}
                    <p className="text-sm font-semibold text-gray-800 mb-1">{template.name}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Themes Section */}
            <div>
              <div className="sticky top-0 z-50 -mx-6 md:-mx-10 px-6 md:px-10 py-3 bg-transparent backdrop-blur-2xl border-b border-white/40 shadow-[0_1px_8px_rgba(0,0,0,0.08)] relative overflow-hidden mb-6">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/95 to-white/25" />
                <h2 className="relative text-lg font-semibold text-gray-800">Themes</h2>
              </div>
              <div className="relative z-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {designThemes.map((th, idx) => (
                  <button
                    key={th.name}
                    onClick={() => openThemeConfirm(th)}
                    className="bg-white rounded-2xl shadow-sm p-3 transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-lg border border-white/60 text-left"
                    title={`${th.name} – click to choose how it's applied`}
                  >
                    <div className="rounded-xl mb-2 w-full h-28 relative overflow-hidden" style={{ background: th.background }}>
                      <div className="absolute left-3 right-3 top-2 h-2 rounded" style={{ background: th.preview?.header || 'rgba(255,255,255,0.7)' }} />
                      {idx % 3 === 0 && (
                        <>
                          <div className="absolute left-3 bottom-3 w-1/2 h-4 rounded" style={{ background: th.preview?.block1 || 'rgba(255,255,255,0.5)' }} />
                          <div className="absolute right-3 bottom-3 w-1/3 h-4 rounded" style={{ background: th.preview?.block2 || 'rgba(255,255,255,0.4)' }} />
                        </>
                      )}
                      {idx % 3 === 1 && (
                        <>
                          <div className="absolute left-3 right-3 top-6 h-4 rounded" style={{ background: th.preview?.block1 || 'rgba(255,255,255,0.45)' }} />
                          <div className="absolute left-3 right-3 bottom-3 h-3 rounded" style={{ background: th.preview?.block2 || 'rgba(255,255,255,0.35)' }} />
                        </>
                      )}
                      {idx % 3 === 2 && (
                        <>
                          <div className="absolute left-3 top-6 w-1/3 h-5 rounded" style={{ background: th.preview?.block1 || 'rgba(255,255,255,0.5)' }} />
                          <div className="absolute left-1/2 top-6 w-1/3 h-5 rounded" style={{ background: th.preview?.block2 || 'rgba(255,255,255,0.4)' }} />
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-800 font-medium text-center">{th.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template apply dialog */}
      {showTemplateConfirm && pendingTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-[500px] p-7 border border-white/80 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.65),_transparent_70%)] pointer-events-none" />
            <div className="relative">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Apply “{pendingTemplate.name}” Template?</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Applying this template will replace your current slides. Any unsaved edits will be lost.
                You can proceed directly, save and then apply, or cancel.
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleTemplateCancel}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTemplateSaveAndProceed}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm"
                >
                  Save & Proceed
                </button>
                <button
                  type="button"
                  onClick={handleTemplateProceed}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium shadow hover:bg-red-600 hover:shadow-lg transition-all text-sm"
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theme apply dialog */}
      {showThemeConfirm && pendingTheme && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-[480px] p-7 border border-white/80 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.65),_transparent_70%)] pointer-events-none" />
            <div className="relative">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Apply “{pendingTheme.name}” Theme</h3>
              <p className="text-sm text-gray-600 mb-4">Choose whether to update only the current slide or every slide in this presentation.</p>
              <div className="rounded-xl border border-gray-200 mb-4 overflow-hidden">
                <div className="h-28" style={{ background: pendingTheme.background }} />
                <div className="p-3 bg-white flex items-center justify-between text-xs text-gray-600">
                  <span>Preview</span>
                  <span>{applyThemeToAllSlides ? 'Will update all slides' : 'Will update current slide'}</span>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 mb-6">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={applyThemeToAllSlides}
                  onChange={(e) => setApplyThemeToAllSlides(e.target.checked)}
                />
                <span>Apply to all slides</span>
              </label>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleThemeCancel}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleThemeProceed}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-medium shadow hover:shadow-lg hover:from-blue-700 hover:to-indigo-600 transition-all"
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New confirmation dialog */}
      {showNewConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-[460px] p-8 border border-gray-200">
            <h3 className="text-xl font-bold mb-3 text-gray-900">Start New Presentation?</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">You have unsaved changes. Do you want to save your current presentation before creating a new one?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 hover:shadow-md transition-all duration-200 border border-gray-300"
                onClick={() => setShowNewConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
                onClick={async () => {
                  try { await handleSave() } catch {}
                  dispatch({ type: 'NEW_PRESENTATION' })
                  onFileOpen?.('Untitled Presentation')
                  setShowNewConfirm(false)
                  requestClose()
                }}
              >
                Save
              </button>
              <button
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
                onClick={() => {
                  dispatch({ type: 'NEW_PRESENTATION' })
                  onFileOpen?.('Untitled Presentation')
                  setShowNewConfirm(false)
                  requestClose()
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

