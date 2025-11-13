import React, { createContext, useContext, useMemo, useReducer } from 'react'
import { nanoid } from '../utils/nanoid.js'

const SlidesContext = createContext(null)

// Standard reference dimensions for proportional scaling (16:9 aspect ratio)
const REF_WIDTH = 960
const REF_HEIGHT = 540

const defaultText = (text = '', x = REF_WIDTH * 0.083, y = REF_HEIGHT * 0.148, w = REF_WIDTH * 0.33, h = REF_HEIGHT * 0.148, fontSize = 28, bgColor = 'transparent') => ({
  id: nanoid(),
  type: 'text',
  x,
  y,
  w,
  h,
  rotation: 0,
  text,
  placeholder: 'Double-click to edit',
  placeholderBold: false,
  bgColor,
  styles: { fontFamily: 'Inter, system-ui, sans-serif', fontSize, color: '#111827', bold: false, italic: false, underline: false, align: 'left', listStyle: 'none', valign: 'top' },
})

let slideCounter = 1

const defaultSlide = () => {
  const slideNum = slideCounter++
  const title = defaultText('', REF_WIDTH * 0.1, REF_HEIGHT * 0.18, REF_WIDTH * 0.8, REF_HEIGHT * 0.18, 44)
  title.styles = { ...title.styles, align: 'center' }
  title.placeholder = 'Click here to add title'
  title.placeholderBold = true
  const subtitle = defaultText('', REF_WIDTH * 0.18, REF_HEIGHT * 0.38, REF_WIDTH * 0.64, REF_HEIGHT * 0.16, 24)
  subtitle.styles = { ...subtitle.styles, align: 'center' }
  subtitle.placeholder = 'Click here to add sub title'
  subtitle.placeholderBold = false
  return { 
    id: nanoid(), 
    name: `Slide ${slideNum}`,
    background: '#ffffff', 
    elements: [title, subtitle] 
  }
}

const initialState = {
  slides: [defaultSlide()],
  currentSlideId: null, // set to first on init
  selectedElementId: null,
  clipboard: null,
  history: [],
  historyIndex: -1,
}

function init(state) {
  const initializedState = { ...state, currentSlideId: state.slides[0].id }
  return {
    ...initializedState,
    history: [{ slides: initializedState.slides, currentSlideId: initializedState.currentSlideId }],
    historyIndex: 0,
  }
}

function addToHistory(state, newSlides, newCurrentSlideId) {
  const newHistory = state.history.slice(0, state.historyIndex + 1)
  newHistory.push({ slides: newSlides, currentSlideId: newCurrentSlideId || state.currentSlideId })
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'UNDO': {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1
        const historyState = state.history[newIndex]
        return {
          ...state,
          slides: historyState.slides,
          currentSlideId: historyState.currentSlideId,
          historyIndex: newIndex,
          selectedElementId: null,
        }
      }
      return state
    }
    case 'REDO': {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1
        const historyState = state.history[newIndex]
        return {
          ...state,
          slides: historyState.slides,
          currentSlideId: historyState.currentSlideId,
          historyIndex: newIndex,
          selectedElementId: null,
        }
      }
      return state
    }
    case 'ADD_SLIDE': {
      const slide = defaultSlide()
      const idx = state.slides.findIndex(s => s.id === state.currentSlideId)
      const insertAt = idx >= 0 ? idx + 1 : state.slides.length
      const newSlides = [...state.slides.slice(0, insertAt), slide, ...state.slides.slice(insertAt)]
      return { 
        ...state, 
        slides: newSlides, 
        currentSlideId: slide.id, 
        selectedElementId: null,
        ...addToHistory(state, newSlides, slide.id)
      }
    }
    case 'ADD_SLIDE_WITH_TEMPLATE': {
      const newSlides = [...state.slides, action.slide]
      return { 
        ...state, 
        slides: newSlides, 
        currentSlideId: action.slide.id, 
        selectedElementId: null,
        ...addToHistory(state, newSlides, action.slide.id)
      }
    }
    case 'DELETE_SLIDE': {
      if (state.slides.length <= 1) return state
      const slides = state.slides.filter(s => s.id !== action.id)
      const currentSlideId = slides[Math.max(0, slides.length - 1)].id
      return { 
        ...state, 
        slides, 
        currentSlideId, 
        selectedElementId: null,
        ...addToHistory(state, slides, currentSlideId)
      }
    }
    case 'DUPLICATE_SLIDE': {
      const idx = state.slides.findIndex(s => s.id === action.id)
      if (idx === -1) return state
      const src = state.slides[idx]
      const copy = { ...src, id: nanoid(), elements: src.elements.map(e => ({ ...e, id: nanoid() })) }
      const slides = [...state.slides.slice(0, idx + 1), copy, ...state.slides.slice(idx + 1)]
      return { 
        ...state, 
        slides, 
        currentSlideId: copy.id, 
        selectedElementId: null,
        ...addToHistory(state, slides, copy.id)
      }
    }
    case 'SET_CURRENT_SLIDE':
      return { ...state, currentSlideId: action.id, selectedElementId: null }
    case 'UPDATE_SLIDE_BACKGROUND': {
      const slides = state.slides.map(s => 
        s.id === action.slideId ? { ...s, background: action.background } : s
      )
      return { 
        ...state, 
        slides,
        ...addToHistory(state, slides)
      }
    }
    case 'MOVE_SLIDE_UP': {
      const currentIndex = state.slides.findIndex(s => s.id === action.slideId)
      if (currentIndex <= 0) return state
      const slides = [...state.slides]
      const temp = slides[currentIndex]
      slides[currentIndex] = slides[currentIndex - 1]
      slides[currentIndex - 1] = temp
      return {
        ...state,
        slides,
        ...addToHistory(state, slides)
      }
    }
    case 'MOVE_SLIDE_DOWN': {
      const currentIndex = state.slides.findIndex(s => s.id === action.slideId)
      if (currentIndex >= state.slides.length - 1) return state
      const slides = [...state.slides]
      const temp = slides[currentIndex]
      slides[currentIndex] = slides[currentIndex + 1]
      slides[currentIndex + 1] = temp
      return {
        ...state,
        slides,
        ...addToHistory(state, slides)
      }
    }
    case 'REORDER_SLIDES': {
      const { fromIndex, toIndex } = action
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || 
          fromIndex >= state.slides.length || toIndex >= state.slides.length) {
        return state
      }
      const slides = [...state.slides]
      const [movedSlide] = slides.splice(fromIndex, 1)
      slides.splice(toIndex, 0, movedSlide)
      return {
        ...state,
        slides,
        ...addToHistory(state, slides)
      }
    }
    case 'ADD_ELEMENT': {
      return updateCurrentSlide(state, slide => ({ ...slide, elements: [...slide.elements, action.element] }))
    } 
    case 'UPDATE_ELEMENT': {
      return updateCurrentSlide(state, slide => ({
        ...slide,
        elements: slide.elements.map(e => {
          if (e.id === action.id) {
            const prev = e
            const next = { ...e, ...action.patch }
            // Compute combined clamps so x/w and y/h keep element fully within slide
            const nx = Math.max(0, Math.min(REF_WIDTH - (next.w ?? prev.w), next.x ?? prev.x))
            const ny = Math.max(0, Math.min(REF_HEIGHT - (next.h ?? prev.h), next.y ?? prev.y))
            const nw = Math.max(1, Math.min(next.w ?? prev.w, REF_WIDTH - nx))
            const nh = Math.max(1, Math.min(next.h ?? prev.h, REF_HEIGHT - ny))
            return { ...next, x: nx, y: ny, w: nw, h: nh }
          }
          return e
        }),
      }))
    }
    case 'DELETE_ELEMENT': {
      return updateCurrentSlide(state, slide => ({ ...slide, elements: slide.elements.filter(e => e.id !== action.id) }))
    }
    case 'SELECT_ELEMENT':
      return { ...state, selectedElementId: action.id }
    case 'SET_BACKGROUND': {
      return updateCurrentSlide(state, slide => ({ ...slide, background: action.color }))
    }
    case 'APPLY_TEMPLATE': {
      return updateCurrentSlide(state, slide => ({ 
        ...slide, 
        elements: action.elements,
        background: action.background || slide.background 
      }))
    }
    case 'LOAD_PRESENTATION': {
      const newState = {
        ...state,
        slides: action.data.slides || [defaultSlide()],
        currentSlideId: action.data.currentSlideId || action.data.slides?.[0]?.id || null,
        selectedElementId: null,
        clipboard: null,
        history: [{ slides: action.data.slides || [defaultSlide()], currentSlideId: action.data.currentSlideId || action.data.slides?.[0]?.id || null }],
        historyIndex: 0,
      }
      return newState
    }
    case 'APPLY_WATERMARK': {
      const { settings = {}, scope = 'current', replace = true } = action
      const targetIds = scope === 'all' ? state.slides.map(s=>s.id) : [state.currentSlideId]
      const slides = state.slides.map(s => {
        if (!targetIds.includes(s.id)) return s
        const filtered = replace ? s.elements.filter(e => !e.isWatermark) : s.elements
        const wm = factories.watermark(settings)
        return { ...s, elements: [...filtered, wm] }
      })
      return { 
        ...state,
        slides,
        ...addToHistory(state, slides)
      }
    }
    case 'REMOVE_WATERMARK': {
      const { scope = 'current' } = action
      const targetIds = scope === 'all' ? state.slides.map(s=>s.id) : [state.currentSlideId]
      const slides = state.slides.map(s => {
        if (!targetIds.includes(s.id)) return s
        return { ...s, elements: s.elements.filter(e => !e.isWatermark) }
      })
      return {
        ...state,
        slides,
        ...addToHistory(state, slides)
      }
    }
    case 'NEW_PRESENTATION': {
      const first = defaultSlide()
      const slides = [first]
      return {
        slides,
        currentSlideId: first.id,
        selectedElementId: null,
        clipboard: null,
        ...addToHistory(state, slides, first.id)
      }
    }
    default:
      return state
  }
}

function updateCurrentSlide(state, updater) {
  const idx = state.slides.findIndex(s => s.id === state.currentSlideId)
  if (idx === -1) return state
  const slide = state.slides[idx]
  const next = updater(slide)
  const slides = [...state.slides]
  slides[idx] = next
  return { 
    ...state, 
    slides,
    ...addToHistory(state, slides)
  }
}

export function SlidesProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, init)
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <SlidesContext.Provider value={value}>{children}</SlidesContext.Provider>
}

export function useSlides() {
  const ctx = useContext(SlidesContext)
  if (!ctx) throw new Error('useSlides must be used within SlidesProvider')
  return ctx
}

export const factories = {
  text: defaultText,
  watermark: ({
    text = 'CONFIDENTIAL',
    fontSize = 64,
    color = '#111827',
    opacity = 0.15,
    rotation = -30,
  } = {}) => {
    const w = Math.round(REF_WIDTH * 0.8)
    const h = Math.round(REF_HEIGHT * 0.22)
    const x = Math.round((REF_WIDTH - w) / 2)
    const y = Math.round((REF_HEIGHT - h) / 2)
    const toRgba = (hex, a) => {
      try {
        const h = hex.replace('#','')
        const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16)
        const r = (bigint >> 16) & 255
        const g = (bigint >> 8) & 255
        const b = bigint & 255
        return `rgba(${r}, ${g}, ${b}, ${a})`
      } catch { return hex }
    }
    const rgba = color.startsWith('#') ? toRgba(color, opacity) : color
    return {
      id: nanoid(),
      type: 'text',
      x, y, w, h,
      rotation,
      isWatermark: true,
      text,
      bgColor: 'transparent',
      styles: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize,
        color: rgba,
        bold: true,
        italic: false,
        underline: false,
        align: 'center',
        listStyle: 'none',
        valign: 'middle',
      },
    }
  },
  rect: () => ({ id: nanoid(), type: 'rect', x: REF_WIDTH*0.1, y: REF_HEIGHT*0.18, w: REF_WIDTH*0.21, h: REF_HEIGHT*0.22, rotation: 0, fill: '#fde68a', stroke: '#f59e0b', text: '', placeholder: 'Double-click to edit', textColor: '#111827', fontSize: 16 }),
  square: () => ({ id: nanoid(), type: 'square', x: REF_WIDTH*0.1, y: REF_HEIGHT*0.18, w: REF_WIDTH*0.16, h: REF_HEIGHT*0.28, rotation: 0, fill: '#fde68a', stroke: '#f59e0b', text: '', placeholder: 'Double-click to edit', textColor: '#111827', fontSize: 16 }),
  circle: () => ({ id: nanoid(), type: 'circle', x: REF_WIDTH*0.15, y: REF_HEIGHT*0.26, w: REF_WIDTH*0.17, h: REF_HEIGHT*0.3, rotation: 0, fill: '#bfdbfe', stroke: '#3b82f6', text: '', placeholder: 'Double-click to edit', textColor: '#111827', fontSize: 16 }),
  triangle: () => ({ id: nanoid(), type: 'triangle', x: REF_WIDTH*0.1, y: REF_HEIGHT*0.18, w: REF_WIDTH*0.16, h: REF_HEIGHT*0.28, rotation: 0, fill: '#fecaca', stroke: '#ef4444', text: '', placeholder: 'Double-click to edit', textColor: '#111827', fontSize: 16 }),
  diamond: () => ({ id: nanoid(), type: 'diamond', x: REF_WIDTH*0.1, y: REF_HEIGHT*0.18, w: REF_WIDTH*0.16, h: REF_HEIGHT*0.28, rotation: 0, fill: '#d8b4fe', stroke: '#8b5cf6', text: '', placeholder: 'Double-click to edit', textColor: '#111827', fontSize: 16 }),
  star: () => ({ id: nanoid(), type: 'star', x: REF_WIDTH*0.1, y: REF_HEIGHT*0.18, w: REF_WIDTH*0.16, h: REF_HEIGHT*0.28, rotation: 0, fill: '#fef3c7', stroke: '#f59e0b', text: '', placeholder: 'Double-click to edit', textColor: '#111827', fontSize: 16 }),
  roundRect: () => ({ id: nanoid(), type: 'roundRect', x: REF_WIDTH*0.1, y: REF_HEIGHT*0.18, w: REF_WIDTH*0.21, h: REF_HEIGHT*0.22, rotation: 0, fill: '#e5e7eb', stroke: '#6b7280', text: '', placeholder: 'Double-click to edit', textColor: '#111827', fontSize: 16 }),
  parallelogram: () => ({ id: nanoid(), type: 'parallelogram', x: REF_WIDTH*0.12, y: REF_HEIGHT*0.20, w: REF_WIDTH*0.22, h: REF_HEIGHT*0.20, rotation: 0, fill: '#d1fae5', stroke: '#10b981', text: '', placeholder: 'Double-click to edit', textColor: '#111827', fontSize: 16 }),
  trapezoid: () => ({ id: nanoid(), type: 'trapezoid', x: REF_WIDTH*0.14, y: REF_HEIGHT*0.22, w: REF_WIDTH*0.24, h: REF_HEIGHT*0.20, rotation: 0, fill: '#bae6fd', stroke: '#3b82f6', text: '', placeholder: 'Double-click to edit', textColor: '#111827', fontSize: 16 }),
  pentagon: () => ({ id: nanoid(), type: 'pentagon', x: REF_WIDTH*0.1, y: REF_HEIGHT*0.18, w: REF_WIDTH*0.18, h: REF_HEIGHT*0.24, rotation: 0, fill: '#fde68a', stroke: '#f59e0b', text: '', placeholder: 'Double-click to edit', textColor: '#111827', fontSize: 16 }),
  hexagon: () => ({ id: nanoid(), type: 'hexagon', x: REF_WIDTH*0.1, y: REF_HEIGHT*0.18, w: REF_WIDTH*0.20, h: REF_HEIGHT*0.22, rotation: 0, fill: '#fbcfe8', stroke: '#ec4899', text: '', placeholder: 'Double-click to edit', textColor: '#111827', fontSize: 16 }),
  octagon: () => ({ id: nanoid(), type: 'octagon', x: REF_WIDTH*0.12, y: REF_HEIGHT*0.20, w: REF_WIDTH*0.20, h: REF_HEIGHT*0.20, rotation: 0, fill: '#fecaca', stroke: '#ef4444', text: '', placeholder: 'Double-click to edit', textColor: '#111827', fontSize: 16 }),
  chevron: () => ({ id: nanoid(), type: 'chevron', x: REF_WIDTH*0.12, y: REF_HEIGHT*0.20, w: REF_WIDTH*0.24, h: REF_HEIGHT*0.18, rotation: 0, fill: '#ddd6fe', stroke: '#8b5cf6', text: '', placeholder: 'Double-click to edit', textColor: '#111827', fontSize: 16 }),
  arrowRight: () => ({ id: nanoid(), type: 'arrowRight', x: REF_WIDTH*0.12, y: REF_HEIGHT*0.20, w: REF_WIDTH*0.26, h: REF_HEIGHT*0.16, rotation: 0, fill: '#bbf7d0', stroke: '#22c55e', text: '', placeholder: 'Double-click to edit', textColor: '#111827', fontSize: 16 }),
  cloud: () => ({ id: nanoid(), type: 'cloud', x: REF_WIDTH*0.12, y: REF_HEIGHT*0.20, w: REF_WIDTH*0.24, h: REF_HEIGHT*0.16, rotation: 0, fill: '#e0f2fe', stroke: '#38bdf8', text: '', placeholder: 'Double-click to edit', textColor: '#111827', fontSize: 16 }),
  message: () => ({ id: nanoid(), type: 'message', x: REF_WIDTH*0.19, y: REF_HEIGHT*0.33, w: REF_WIDTH*0.21, h: REF_HEIGHT*0.15, rotation: 0, fill: '#d1fae5', stroke: '#10b981', text: '', placeholder: 'Double-click to edit', textColor: '#111827', fontSize: 14 }),
  image: (src, w=REF_WIDTH*0.33, h=REF_HEIGHT*0.44) => ({ id: nanoid(), type: 'image', x: REF_WIDTH*0.125, y: REF_HEIGHT*0.22, w, h, rotation: 0, src }),
  table: (rows, cols, x, y, w, h, headerRow = true) => ({
    id: nanoid(),
    type: 'table',
    x, y, w, h,
    rotation: 0,
    rows, cols,
    headerRow,
    headerBg: '#f3f4f6',
    headerTextColor: '#111827',
    cellBg: '#ffffff',
    borderColor: '#000000',
    cells: Array.from({ length: rows*cols }, () => ({ id: nanoid(), text: '', styles: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, color: '#111827', bold: false, italic: false, underline: false, align: 'center', valign: 'middle' } }))
  }),
  chart: (chartType, x, y, w, h, opts = {}) => {
    const baseData = chartType === 'pie' ? [30, 25, 20, 15, 10] : [65, 59, 80, 81, 56, 55, 40]
    const baseLabels = chartType === 'pie'
      ? ['Category A', 'Category B', 'Category C', 'Category D', 'Category E']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

    // Seed structuredData for charts that need multiple series by default (e.g., stacked)
    let structuredData = undefined
    if (chartType === 'bar') {
      const style = String(opts.chartStyle || '2d')
      const needsMulti = style.includes('stacked') // stacked or stacked100 or 3d-stacked or horizontal-stacked
      const s1 = baseData
      const s2 = s1.map(v => Math.max(1, Math.round(Number(v || 0) * 0.6)))
      structuredData = {
        categories: baseLabels,
        series: needsMulti
          ? [ { name: 'Series 1', data: s1 }, { name: 'Series 2', data: s2 } ]
          : [ { name: 'Series 1', data: s1 } ]
      }
    } else if (chartType === 'line') {
      structuredData = {
        categories: baseLabels,
        series: [ { name: 'Series 1', data: baseData } ]
      }
    } else if (chartType === 'pie') {
      structuredData = undefined
    }

    return ({
      id: nanoid(),
      type: 'chart',
      chartType,
      x, y, w, h,
      rotation: 0,
      // default style per type; can be overridden by opts.chartStyle
      chartStyle: opts.chartStyle ?? (chartType === 'line' ? 'simple' : '2d'),
      data: baseData,
      labels: baseLabels,
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'],
      ...(structuredData ? { structuredData } : {}),
    })
  },
}
