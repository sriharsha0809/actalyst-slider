# PowerPoint Clone (React + Vite + Tailwind)

A modern, responsive slide editor inspired by Microsoft PowerPoint. Create, edit, and present slides without a backend.

## Features
- Sidebar slide navigation with add/duplicate/delete
- Toolbar with text formatting (size, color, bold/italic/underline, align)
- Insert text, rectangle, circle, arrow, images (local file)
- Drag and resize elements on the canvas
- Presentation mode (fullscreen overlay + arrow key navigation)
- Responsive layout, smooth shadows/hover, rounded UI

## Getting Started

1. Install dependencies
```bash
npm install
```

2. Start dev server
```bash
npm run dev
```

3. Build for production
```bash
npm run build && npm run preview
```

## Project Structure
- `src/App.jsx` App layout (Toolbar, Sidebar, SlideCanvas, ShapeToolbox, SlidePreview)
- `src/context/SlidesContext.jsx` Slide state and actions
- `src/components/*` UI components
- `tailwind.config.js`, `postcss.config.js` Tailwind setup

## Notes
- Reordering slides, undo/redo, localStorage persistence, and export to PDF/HTML can be added next.
- This project uses minimal utilities and no backend.
