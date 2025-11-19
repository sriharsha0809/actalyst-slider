import React from 'react'
import { useSlides } from '../context/SlidesContext.jsx'
import { nanoid } from '../utils/nanoid.js'

export default function ShapeToolbox({ applyToCurrent = false }) {
  const { dispatch } = useSlides()

  const createTextElement = (text, x, y, w, h, fontSize = 28, bgColor = 'transparent', align = 'left') => ({
    id: nanoid(),
    type: 'text',
    x, y, w, h,
    rotation: 0,
    text,
    bgColor,
    styles: { 
      fontFamily: 'Inter, system-ui, sans-serif', 
      fontSize, 
      color: '#111827', 
      bold: false, 
      italic: false, 
      underline: false, 
      align 
    }
  })

  const slideLayouts = [
    {
      name: 'Title Slide',
      description: 'First slide',
      preview: (
        <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center">
          <div className="w-3/4 h-2 bg-gray-500 mb-2 rounded-full"></div>
          <div className="w-1/2 h-1.5 bg-gray-300 rounded-full"></div>
        </div>
      )
    },
    {
      name: 'Title + Subtitle',
      description: 'Most common',
      preview: (
        <div className="w-full h-full bg-white p-2">
          <div className="w-full h-1.5 bg-gray-500 mb-2 rounded-full"></div>
          <div className="w-full h-8 bg-gray-100 rounded"></div>
        </div>
      )
    },
    {
      name: 'Section Header',
      description: 'New section',
      preview: (
        <div className="w-full h-full bg-white p-2 flex flex-col justify-center">
          <div className="w-3/4 h-2 bg-gray-600 mb-1 rounded-full"></div>
          <div className="w-1/2 h-1 bg-gray-400 rounded-full"></div>
        </div>
      )
    },
    {
      name: 'Title Only',
      description: 'Minimal layout',
      preview: (
        <div className="w-full h-full bg-white p-2">
          <div className="w-full h-1.5 bg-gray-500 rounded-full"></div>
        </div>
      )
    },
    {
      name: 'Two Content',
      description: 'Side by side',
      preview: (
        <div className="w-full h-full bg-white p-2">
          <div className="w-full h-1.5 bg-gray-500 mb-1 rounded-full"></div>
          <div className="flex gap-1 h-8">
            <div className="flex-1 bg-gray-100 rounded"></div>
            <div className="flex-1 bg-gray-200 rounded"></div>
          </div>
        </div>
      )
    },
    {
      name: 'Comparison',
      description: 'Labeled boxes',
      preview: (
        <div className="w-full h-full bg-white p-2">
          <div className="w-full h-1.5 bg-gray-500 mb-1 rounded-full"></div>
          <div className="flex gap-1 h-8">
            <div className="flex-1">
              <div className="h-1 bg-gray-500 mb-0.5 rounded-full"></div>
              <div className="h-6 bg-gray-100 rounded"></div>
            </div>
            <div className="flex-1">
              <div className="h-1 bg-gray-400 mb-0.5 rounded-full"></div>
              <div className="h-6 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      name: 'Blank Slide',
      description: 'Custom content',
      preview: (
        <div className="w-full h-full bg-white border-2 border-dashed border-gray-300"></div>
      )
    },
    {
      name: 'Content + Caption',
      description: 'Text beside',
      preview: (
        <div className="w-full h-full bg-white p-2">
          <div className="w-full h-1.5 bg-gray-500 mb-1 rounded-full"></div>
          <div className="flex gap-1 h-8">
            <div className="w-2/3 bg-gray-100 rounded"></div>
            <div className="w-1/3 bg-gray-200 rounded"></div>
          </div>
        </div>
      )
    },
    {
      name: 'Picture + Caption',
      description: 'Large image',
      preview: (
        <div className="w-full h-full bg-white p-2">
          <div className="w-full h-1.5 bg-gray-500 mb-1 rounded-full"></div>
          <div className="flex gap-1 h-8">
            <div className="w-3/4 bg-gray-200 rounded"></div>
            <div className="w-1/4 bg-gray-100 rounded"></div>
          </div>
        </div>
      )
    },
    {
      name: 'Title + Picture',
      description: 'Image focus',
      preview: (
        <div className="w-full h-full bg-white p-2">
          <div className="w-full h-1.5 bg-gray-500 mb-1 rounded-full"></div>
          <div className="w-full h-8 bg-gray-200 rounded"></div>
        </div>
      )
    },
    {
      name: 'Quote Slide',
      description: 'Quotations',
      preview: (
        <div className="w-full h-full bg-white p-2 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-1 bg-gray-500 mx-auto mb-1 rounded-full"></div>
            <div className="w-6 h-0.5 bg-gray-300 mx-auto rounded-full"></div>
          </div>
        </div>
      )
    },
    {
      name: 'Chart / Graph',
      description: 'Data visuals',
      preview: (
        <div className="w-full h-full bg-white p-2">
          <div className="w-full h-1.5 bg-gray-500 mb-1 rounded-full"></div>
          <div className="w-full h-8 bg-gray-100 rounded flex items-end justify-around p-1">
            <div className="w-1 bg-gray-400 h-4 rounded"></div>
            <div className="w-1 bg-gray-500 h-6 rounded"></div>
            <div className="w-1 bg-gray-300 h-3 rounded"></div>
            <div className="w-1 bg-gray-600 h-5 rounded"></div>
          </div>
        </div>
      )
    },
    {
      name: 'SmartArt / Process',
      description: 'Workflows',
      preview: (
        <div className="w-full h-full bg-white p-2">
          <div className="w-full h-1.5 bg-gray-500 mb-1 rounded-full"></div>
          <div className="flex items-center justify-around h-8">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-0.5 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-0.5 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          </div>
        </div>
      )
    },
    {
      name: 'Thank You',
      description: 'Closing slide',
      preview: (
        <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center">
          <div className="w-3/4 h-2 bg-gray-600 mb-1 rounded-full"></div>
          <div className="w-1/2 h-1 bg-gray-400 rounded-full"></div>
        </div>
      )
    }
  ]

  // Standard reference dimensions for proportional scaling (16:9 aspect ratio)
  const REF_WIDTH = 960
  const REF_HEIGHT = 540

  const getTemplateElements = (layoutName) => {
    switch (layoutName) {
      case 'Title Slide':
        return {
          elements: [
            createTextElement('Click to add title', REF_WIDTH * 0.208, REF_HEIGHT * 0.278, REF_WIDTH * 0.583, REF_HEIGHT * 0.185, 48, 'transparent', 'center'),
            createTextElement('Click to add subtitle', REF_WIDTH * 0.26, REF_HEIGHT * 0.519, REF_WIDTH * 0.479, REF_HEIGHT * 0.111, 32, 'transparent', 'center')
          ],
          background: '#ffffff'
        }
      case 'Title + Subtitle':
        return {
          elements: [
            createTextElement('Click to add title', REF_WIDTH * 0.083, REF_HEIGHT * 0.111, REF_WIDTH * 0.833, REF_HEIGHT * 0.148, 36, 'transparent', 'left'),
            createTextElement('Click to add content', REF_WIDTH * 0.083, REF_HEIGHT * 0.333, REF_WIDTH * 0.833, REF_HEIGHT * 0.519, 24, 'transparent', 'left')
          ],
          background: '#ffffff'
        }
      case 'Section Header':
        return {
          elements: [
            createTextElement('Section Title', REF_WIDTH * 0.104, REF_HEIGHT * 0.333, REF_WIDTH * 0.792, REF_HEIGHT * 0.185, 44, 'transparent', 'center'),
            createTextElement('Section Description', REF_WIDTH * 0.156, REF_HEIGHT * 0.556, REF_WIDTH * 0.688, REF_HEIGHT * 0.111, 28, 'transparent', 'center')
          ],
          background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
        }
      case 'Title Only':
        return {
          elements: [
            createTextElement('Click to add title', REF_WIDTH * 0.083, REF_HEIGHT * 0.111, REF_WIDTH * 0.833, REF_HEIGHT * 0.148, 36, 'transparent', 'left')
          ],
          background: '#ffffff'
        }
      case 'Two Content':
        return {
          elements: [
            createTextElement('Click to add title', REF_WIDTH * 0.083, REF_HEIGHT * 0.111, REF_WIDTH * 0.833, REF_HEIGHT * 0.148, 36, 'transparent', 'left'),
            createTextElement('Content 1', REF_WIDTH * 0.083, REF_HEIGHT * 0.333, REF_WIDTH * 0.396, REF_HEIGHT * 0.519, 24, 'transparent', 'left'),
            createTextElement('Content 2', REF_WIDTH * 0.521, REF_HEIGHT * 0.333, REF_WIDTH * 0.396, REF_HEIGHT * 0.519, 24, 'transparent', 'left')
          ],
          background: '#ffffff'
        }
      case 'Comparison':
        return {
          elements: [
            createTextElement('Click to add title', REF_WIDTH * 0.083, REF_HEIGHT * 0.111, REF_WIDTH * 0.833, REF_HEIGHT * 0.148, 36, 'transparent', 'left'),
            createTextElement('Option A', REF_WIDTH * 0.083, REF_HEIGHT * 0.296, REF_WIDTH * 0.396, REF_HEIGHT * 0.074, 28, '#d4edda', 'center'),
            createTextElement('Content A', REF_WIDTH * 0.083, REF_HEIGHT * 0.407, REF_WIDTH * 0.396, REF_HEIGHT * 0.444, 24, 'transparent', 'left'),
            createTextElement('Option B', REF_WIDTH * 0.521, REF_HEIGHT * 0.296, REF_WIDTH * 0.396, REF_HEIGHT * 0.074, 28, '#f8d7da', 'center'),
            createTextElement('Content B', REF_WIDTH * 0.521, REF_HEIGHT * 0.407, REF_WIDTH * 0.396, REF_HEIGHT * 0.444, 24, 'transparent', 'left')
          ],
          background: '#ffffff'
        }
      case 'Blank Slide':
        return {
          elements: [],
          background: '#ffffff'
        }
      case 'Content + Caption':
        return {
          elements: [
            createTextElement('Click to add title', REF_WIDTH * 0.083, REF_HEIGHT * 0.111, REF_WIDTH * 0.833, REF_HEIGHT * 0.148, 36, 'transparent', 'left'),
            createTextElement('Main Content', REF_WIDTH * 0.083, REF_HEIGHT * 0.333, REF_WIDTH * 0.542, REF_HEIGHT * 0.519, 24, 'transparent', 'left'),
            createTextElement('Caption text', REF_WIDTH * 0.667, REF_HEIGHT * 0.333, REF_WIDTH * 0.25, REF_HEIGHT * 0.519, 20, 'transparent', 'left')
          ],
          background: '#ffffff'
        }
      case 'Picture + Caption':
        return {
          elements: [
            createTextElement('Click to add title', REF_WIDTH * 0.083, REF_HEIGHT * 0.111, REF_WIDTH * 0.833, REF_HEIGHT * 0.148, 36, 'transparent', 'left'),
            {
              id: nanoid(),
              type: 'image',
              x: REF_WIDTH * 0.083,
              y: REF_HEIGHT * 0.333,
              w: REF_WIDTH * 0.625,
              h: REF_HEIGHT * 0.519,
              rotation: 0,
              src: null,
            },
            createTextElement('Caption', REF_WIDTH * 0.75, REF_HEIGHT * 0.333, REF_WIDTH * 0.167, REF_HEIGHT * 0.519, 20, 'transparent', 'left')
          ],
          background: '#ffffff'
        }
      case 'Title + Picture':
        return {
          elements: [
            createTextElement('Click to add title', REF_WIDTH * 0.083, REF_HEIGHT * 0.111, REF_WIDTH * 0.833, REF_HEIGHT * 0.148, 36, 'transparent', 'left'),
            {
              id: nanoid(),
              type: 'image',
              x: REF_WIDTH * 0.083,
              y: REF_HEIGHT * 0.333,
              w: REF_WIDTH * 0.833,
              h: REF_HEIGHT * 0.519,
              rotation: 0,
              src: null,
            }
          ],
          background: '#ffffff'
        }
      case 'Quote Slide':
        return {
          elements: [
            createTextElement('"Click to add quote"', REF_WIDTH * 0.156, REF_HEIGHT * 0.333, REF_WIDTH * 0.688, REF_HEIGHT * 0.222, 32, 'transparent', 'center'),
            createTextElement('- Author Name', REF_WIDTH * 0.313, REF_HEIGHT * 0.593, REF_WIDTH * 0.375, REF_HEIGHT * 0.074, 24, 'transparent', 'center')
          ],
          background: 'linear-gradient(135deg, #fff9e6 0%, #ffe6cc 100%)'
        }
      case 'Chart / Graph':
        return {
          elements: [
            createTextElement('Click to add title', REF_WIDTH * 0.083, REF_HEIGHT * 0.111, REF_WIDTH * 0.833, REF_HEIGHT * 0.148, 36, 'transparent', 'left'),
            createTextElement('Chart Area\n(Add chart/graph here)', REF_WIDTH * 0.083, REF_HEIGHT * 0.333, REF_WIDTH * 0.833, REF_HEIGHT * 0.519, 24, '#f5f5f5', 'center')
          ],
          background: '#ffffff'
        }
      case 'SmartArt / Process':
        return {
          elements: [
            createTextElement('Click to add title', REF_WIDTH * 0.083, REF_HEIGHT * 0.111, REF_WIDTH * 0.833, REF_HEIGHT * 0.148, 36, 'transparent', 'left'),
            createTextElement('Step 1', REF_WIDTH * 0.104, REF_HEIGHT * 0.444, REF_WIDTH * 0.188, REF_HEIGHT * 0.148, 20, '#bbdefb', 'center'),
            createTextElement('Step 2', REF_WIDTH * 0.406, REF_HEIGHT * 0.444, REF_WIDTH * 0.188, REF_HEIGHT * 0.148, 20, '#c8e6c9', 'center'),
            createTextElement('Step 3', REF_WIDTH * 0.708, REF_HEIGHT * 0.444, REF_WIDTH * 0.188, REF_HEIGHT * 0.148, 20, '#e1bee7', 'center')
          ],
          background: '#ffffff'
        }
      case 'Thank You':
        return {
          elements: [
            createTextElement('Thank You!', REF_WIDTH * 0.208, REF_HEIGHT * 0.370, REF_WIDTH * 0.583, REF_HEIGHT * 0.185, 48, 'transparent', 'center'),
            createTextElement('Questions?', REF_WIDTH * 0.313, REF_HEIGHT * 0.593, REF_WIDTH * 0.375, REF_HEIGHT * 0.111, 32, 'transparent', 'center')
          ],
          background: 'linear-gradient(135deg, #fce4ec 0%, #e1bee7 100%)'
        }
      default:
        return {
          elements: [
            createTextElement('Click to add title', REF_WIDTH * 0.104, REF_HEIGHT * 0.148, REF_WIDTH * 0.625, REF_HEIGHT * 0.185, 44, 'transparent', 'left'),
            createTextElement('Click to add subtitle', REF_WIDTH * 0.104, REF_HEIGHT * 0.407, REF_WIDTH * 0.625, REF_HEIGHT * 0.148, 28, 'transparent', 'left')
          ],
          background: '#ffffff'
        }
    }
  }

  const applyLayout = (layout) => {
    const template = getTemplateElements(layout.name)
    if (applyToCurrent) {
      // Apply template to the current slide
      dispatch({ type: 'APPLY_TEMPLATE', elements: template.elements, background: template.background })
    } else {
      // Add a new slide with the selected template
      const newSlide = {
        id: nanoid(),
        background: template.background,
        elements: template.elements,
      }
      dispatch({ type: 'ADD_SLIDE_WITH_TEMPLATE', slide: newSlide })
    }
  }

  const allowedDesignTemplates = ['Title Slide','Title + Subtitle','Two Content','Picture + Caption','Thank You']
  const layouts = applyToCurrent ? slideLayouts.filter(l => allowedDesignTemplates.includes(l.name)) : slideLayouts

  return (
    <div className="h-full overflow-y-auto">
      <div className="font-semibold text-gray-800 mb-3 text-base">{applyToCurrent ? 'Templates' : 'Slide Layouts'}</div>
      <div className="grid grid-cols-2 gap-2">
        {layouts.map((layout, index) => (
          <button
            key={index}
            onClick={() => applyLayout(layout)}
            className="group flex flex-col"
          >
            <div className="aspect-video rounded-lg bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 hover:border-white/40 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl">
              {layout.preview}
            </div>
            <div className="mt-1 text-center">
              <div className="text-xs font-medium text-gray-800 group-hover:text-brand-600">
                {layout.name}
              </div>
              <div className="text-[10px] text-gray-600">
                {layout.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function ToolButton({ children, onClick }) {
  return (
    <button onClick={onClick} className="px-3 py-2 rounded-lg border border-gray-200 hover:border-brand-500 hover:bg-brand-50 shadow-soft text-sm">
      {children}
    </button>
  )
}

function BackgroundPicker() {
  const { state, dispatch } = useSlides()
  const slide = state.slides.find(s => s.id === state.currentSlideId)
  return (
    <div className="mt-2 flex items-center gap-2">
      <input type="color" value={slide?.background || '#ffffff'} onChange={(e)=>dispatch({type:'SET_BACKGROUND', color: e.target.value})} className="h-9 w-9 p-1 rounded-md border" />
      <input type="text" value={slide?.background || '#ffffff'} onChange={(e)=>dispatch({type:'SET_BACKGROUND', color: e.target.value})} className="flex-1 rounded-md border-gray-300" />
    </div>
  )
}
