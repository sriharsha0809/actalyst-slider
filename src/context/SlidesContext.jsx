import React, { createContext, useContext, useMemo, useReducer } from 'react'
import { nanoid } from '../utils/nanoid.js'

const SlidesContext = createContext(null)

// Standard reference dimensions for proportional scaling (16:9 aspect ratio)
const REF_WIDTH = 960
const REF_HEIGHT = 540

const defaultText = (text = 'Double-click to edit', x = REF_WIDTH * 0.083, y = REF_HEIGHT * 0.148, w = REF_WIDTH * 0.33, h = REF_HEIGHT * 0.148, fontSize = 28, bgColor = 'transparent') => ({
  id: nanoid(),
  type: 'text',
  x,
  y,
  w,
  h,
  text,
  bgColor,
  styles: { fontFamily: 'Inter, system-ui, sans-serif', fontSize, color: '#111827', bold: false, italic: false, underline: false, align: 'left', listStyle: 'none' },
})

let slideCounter = 1

const defaultSlide = () => {
  const slideNum = slideCounter++
  return { 
    id: nanoid(), 
    name: `Slide ${slideNum}`,
    background: '#ffffff', 
    elements: [defaultText()] 
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
      const newSlides = [...state.slides, slide]
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
            const updated = { ...e, ...action.patch }
            // Ensure element stays within very generous slide boundaries
            const MARGIN = 50
            if (updated.x !== undefined) {
              updated.x = Math.max(-MARGIN, Math.min(REF_WIDTH + MARGIN, updated.x))
            }
            if (updated.y !== undefined) {
              updated.y = Math.max(-MARGIN, Math.min(REF_HEIGHT + MARGIN, updated.y))
            }
            if (updated.w !== undefined) {
              updated.w = Math.min(updated.w, REF_WIDTH + MARGIN * 2)
            }
            if (updated.h !== undefined) {
              updated.h = Math.min(updated.h, REF_HEIGHT + MARGIN * 2)
            }
            return updated
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
  rect: () => ({ 
    id: nanoid(), 
    type: 'rect', 
    x: REF_WIDTH * 0.1, 
    y: REF_HEIGHT * 0.18, 
    w: REF_WIDTH * 0.21, 
    h: REF_HEIGHT * 0.22, 
    rotation: 0, 
    fill: '#fde68a', 
    stroke: '#f59e0b', 
    text: '', 
    textColor: '#111827', 
    fontSize: 16 
  }),
  square: () => ({ 
    id: nanoid(), 
    type: 'square', 
    x: REF_WIDTH * 0.1, 
    y: REF_HEIGHT * 0.18, 
    w: REF_WIDTH * 0.16, 
    h: REF_HEIGHT * 0.28, 
    rotation: 0, 
    fill: '#fde68a', 
    stroke: '#f59e0b', 
    text: '', 
    textColor: '#111827', 
    fontSize: 16 
  }),
  circle: () => ({ 
    id: nanoid(), 
    type: 'circle', 
    x: REF_WIDTH * 0.15, 
    y: REF_HEIGHT * 0.26, 
    w: REF_WIDTH * 0.17, 
    h: REF_HEIGHT * 0.3, 
    rotation: 0, 
    fill: '#bfdbfe', 
    stroke: '#3b82f6', 
    text: '', 
    textColor: '#111827', 
    fontSize: 16 
  }),
  triangle: () => ({ 
    id: nanoid(), 
    type: 'triangle', 
    x: REF_WIDTH * 0.1, 
    y: REF_HEIGHT * 0.18, 
    w: REF_WIDTH * 0.16, 
    h: REF_HEIGHT * 0.28, 
    rotation: 0, 
    fill: '#fecaca', 
    stroke: '#ef4444', 
    text: '', 
    textColor: '#111827', 
    fontSize: 16 
  }),
  diamond: () => ({ 
    id: nanoid(), 
    type: 'diamond', 
    x: REF_WIDTH * 0.1, 
    y: REF_HEIGHT * 0.18, 
    w: REF_WIDTH * 0.16, 
    h: REF_HEIGHT * 0.28, 
    rotation: 0, 
    fill: '#d8b4fe', 
    stroke: '#8b5cf6', 
    text: '', 
    textColor: '#111827', 
    fontSize: 16 
  }),
  star: () => ({ 
    id: nanoid(), 
    type: 'star', 
    x: REF_WIDTH * 0.1, 
    y: REF_HEIGHT * 0.18, 
    w: REF_WIDTH * 0.16, 
    h: REF_HEIGHT * 0.28, 
    rotation: 0, 
    fill: '#fef3c7', 
    stroke: '#f59e0b', 
    text: '', 
    textColor: '#111827', 
    fontSize: 16 
  }),
  message: () => ({ 
    id: nanoid(), 
    type: 'message', 
    x: REF_WIDTH * 0.19, 
    y: REF_HEIGHT * 0.33, 
    w: REF_WIDTH * 0.21, 
    h: REF_HEIGHT * 0.15, 
    rotation: 0, 
    fill: '#d1fae5', 
    stroke: '#10b981', 
    text: 'Message', 
    textColor: '#111827', 
    fontSize: 14 
  }),
  image: (src, w=REF_WIDTH * 0.33, h=REF_HEIGHT * 0.44) => ({ 
    id: nanoid(), 
    type: 'image', 
    x: REF_WIDTH * 0.125, 
    y: REF_HEIGHT * 0.22, 
    w, 
    h, 
    rotation: 0, 
    src 
  }),
  table: (rows, cols, x, y, w, h) => ({
    id: nanoid(),
    type: 'table',
    x,
    y,
    w,
    h,
    rotation: 0,
    rows,
    cols,
    cells: Array.from({ length: rows * cols }, (_, i) => ({
      id: nanoid(),
      text: '',
      styles: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 14,
        color: '#111827',
        bold: false,
        italic: false,
        underline: false,
        align: 'center',
      }
    }))
  }),
  chart: (chartType, x, y, w, h) => ({
    id: nanoid(),
    type: 'chart',
    chartType,
    x,
    y,
    w,
    h,
    rotation: 0,
    data: chartType === 'pie' 
      ? [30, 25, 20, 15, 10]
      : [65, 59, 80, 81, 56, 55, 40],
    labels: chartType === 'pie'
      ? ['Category A', 'Category B', 'Category C', 'Category D', 'Category E']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
  }),
}
