import React, { useRef, useState } from 'react'
import { useSlides } from '../context/SlidesContext.jsx'

export default function FileMenu({ isOpen, onClose, onFileOpen, onSave }) {
  const { state, dispatch } = useSlides()
  const fileInputRef = useRef(null)
  const [showShareSubmenu, setShowShareSubmenu] = useState(false)

  if (!isOpen) return null

  const handleOpen = () => {
    fileInputRef.current?.click()
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
            const textElements = slideEl.querySelectorAll('div[style*="position: absolute"]')
            
            textElements.forEach(textEl => {
              const style = textEl.style
              const rect = textEl.getBoundingClientRect()
              
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
                  underline: style.textDecoration === 'underline',
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

  const handleSave = async () => {
    try {
      // Create HTML content for each slide
      const slidesHTML = state.slides.map((slide, index) => {
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
                          padding: 8px; box-sizing: border-box;">
                ${el.text}
              </div>
            `
          }
          return ''
        }).join('')

        return `
          <div class="slide" style="width: 960px; height: 540px; position: relative; 
                      background: ${slide.background || '#ffffff'}; 
                      border: 3px solid #000000; margin: 20px 0; page-break-after: always;">
            ${elementsHTML}
          </div>
        `
      }).join('')

      // Create complete HTML document
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Presentation</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .slide { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    @media print {
      body { margin: 0; }
      .slide { margin: 0; box-shadow: none; }
    }
  </style>
</head>
<body>
  <h1>Presentation Export</h1>
  <p>Total Slides: ${state.slides.length}</p>
  <hr>
  ${slidesHTML}
</body>
</html>
      `

      // Create blob and download as .ppt file (HTML format that can be opened in PowerPoint)
      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-powerpoint' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const fileName = `presentation-${new Date().toISOString().slice(0, 10)}`
      link.download = `${fileName}.ppt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      onSave?.(fileName)
      alert('Presentation saved successfully as .ppt file!')
    } catch (error) {
      alert('Error saving presentation: ' + error.message)
    }
  }

  const handleSaveAs = () => {
    // Prompt user for filename
    const defaultName = `presentation-${new Date().toISOString().slice(0, 10)}`
    const userFileName = prompt('Enter filename for the presentation:', defaultName)
    
    // If user cancels or enters empty string, abort
    if (!userFileName || userFileName.trim() === '') {
      return
    }

    // Remove any file extension user might have added
    const cleanFileName = userFileName.replace(/\.(ppt|json)$/i, '')

    // Create HTML content for PowerPoint file
    const slidesHTML = state.slides.map((slide, index) => {
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
                        padding: 8px; box-sizing: border-box;">
              ${el.text}
            </div>
          `
        }
        return ''
      }).join('')

      return `
        <div class="slide" style="width: 960px; height: 540px; position: relative; 
                    background: ${slide.background || '#ffffff'}; 
                    border: 3px solid #000000; margin: 20px 0; page-break-after: always;">
          ${elementsHTML}
        </div>
      `
    }).join('')

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${cleanFileName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .slide { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    @media print {
      body { margin: 0; }
      .slide { margin: 0; box-shadow: none; }
    }
  </style>
</head>
<body>
  <h1>${cleanFileName}</h1>
  <p>Total Slides: ${state.slides.length}</p>
  <hr>
  ${slidesHTML}
</body>
</html>
    `

    // Download as .ppt file
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-powerpoint' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${cleanFileName}.ppt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    onSave?.(cleanFileName)
    alert(`Presentation saved as "${cleanFileName}.ppt"!`)
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
    { label: 'Open', icon: '📂', action: handleOpen, description: 'Open existing presentation file' },
    { label: 'Save', icon: '💾', action: handleSave, description: 'Download as .ppt file' },
    { label: 'Save As', icon: '📝', action: handleSaveAs, description: 'Save with custom filename' },
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
      
      {/* Hidden file input for opening files */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".ppt,.json,.html"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  )
}
