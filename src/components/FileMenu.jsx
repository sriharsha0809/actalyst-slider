import React from 'react'
import { useSlides } from '../context/SlidesContext.jsx'

export default function FileMenu({ isOpen, onClose }) {
  const { state } = useSlides()

  if (!isOpen) return null

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
      link.download = `presentation-${new Date().toISOString().slice(0, 10)}.ppt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
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

  const handleShare = () => {
    const data = JSON.stringify(state)
    const encodedData = btoa(data)
    const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encodedData}`
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Share link copied to clipboard!\n\nAnyone with this link can view your presentation.')
      }).catch(() => {
        prompt('Copy this link to share your presentation:', shareUrl)
      })
    } else {
      prompt('Copy this link to share your presentation:', shareUrl)
    }
  }

  const menuItems = [
    { label: 'Save', icon: '💾', action: handleSave, description: 'Download as .ppt file' },
    { label: 'Save As', icon: '📝', action: handleSaveAs, description: 'Save with custom filename' },
    { label: 'Export as PDF', icon: '📄', action: handleExportPDF, description: 'Print or save as PDF' },
    { label: 'Share', icon: '🔗', action: handleShare, description: 'Generate shareable link' },
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
              <button
                key={index}
                onClick={() => {
                  item.action()
                  onClose()
                }}
                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-100 transition-colors text-left border-b border-gray-100"
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex flex-col">
                  <span className="text-base font-medium text-gray-700">{item.label}</span>
                  <span className="text-xs text-gray-500">{item.description}</span>
                </div>
              </button>
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
    </>
  )
}
