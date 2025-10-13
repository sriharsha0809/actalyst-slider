# 🎭 PPT Slide Maker

A modern, feature-rich presentation editor built with React and Vite, featuring glassmorphism UI design, dark/light themes, and professional slideshow capabilities.

![PPT Slide Maker](https://img.shields.io/badge/React-18-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.4-green.svg)
![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)

## ✨ Key Features

### 🎨 **Modern UI Design**
- **Glassmorphism Effects**: Beautiful backdrop blur and transparency throughout
- **Dark & Light Themes**: Perfect contrast and readability in both modes
- **Premium Gradients**: Sophisticated black-to-gray gradient in dark theme
- **Smooth Animations**: Fluid transitions and hover effects
- **Professional Polish**: Industry-standard design patterns

### 🖼️ **Slide Creation & Editing**
- **Multi-Slide Management**: Create, duplicate, delete, and reorder slides
- **Rich Text Editor**: Advanced text formatting with font families, sizes, colors
- **Shape Library**: Rectangles, circles, triangles, diamonds, stars, message bubbles
- **Media Support**: Image insertion and positioning
- **Chart Integration**: Bar, line, and pie charts with customizable data
- **Background Customization**: Solid colors and gradient backgrounds

### 🎬 **Professional Slideshow**
- **Auto-Advance**: Slides change automatically every 5 seconds
- **Continuous Loop**: Seamlessly transitions from last slide back to first
- **Visual Timer**: Countdown display (5→4→3→2→1→next slide)
- **Progress Bar**: Visual indicator of slide timing
- **Pause/Resume**: Spacebar or button control for presentation flow
- **Manual Navigation**: Arrow keys and Previous/Next buttons
- **Always Start from Beginning**: Ensures consistent presentation experience

### 🛠️ **Smart Element Selection**
- **Visual Feedback**: Selected elements highlight corresponding toolbar buttons
- **Dynamic Highlighting**: Real-time button state updates based on selection
- **Professional Workflow**: Clear connection between canvas and controls
- **Enhanced UX**: White background + black text for active selections

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sriharsha0809/ppt-slide-maker.git
   cd ppt-slide-maker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## 🎯 Usage Guide

### **Creating Your First Presentation**

1. **Launch the Application**
   - Open the app and click "Start Creating" on the landing page
   - You'll see the main editor with toolbar and slide panel

2. **Add Content**
   - **Text**: Click "+ Text" to add text elements
   - **Shapes**: Use Design tab to add rectangles, circles, etc.
   - **Images**: Insert tab → Image to add pictures
   - **Charts**: Insert tab → Chart for data visualization

3. **Format Content**
   - Select any element to see formatting options
   - Use Home tab for text styling (font, size, color, alignment)
   - Shape elements show color controls when selected

4. **Manage Slides**
   - Left sidebar shows all slides
   - Click "+" to add new slides
   - Drag slides to reorder
   - Right-click for duplicate/delete options

5. **Start Slideshow**
   - Click "Slide Show" button in toolbar
   - Presentation starts from slide 1
   - Auto-advances every 5 seconds
   - Press spacebar to pause/resume
   - Press Escape to exit

### **Advanced Features**

#### **Font Family Management**
- **With Text Selection**: Font applies to selected text only
- **Without Selection**: Sets default font for new typing
- **Smart Behavior**: Preserves existing text formatting

#### **Theme Switching**
- Toggle between light and dark themes
- All elements automatically adapt colors
- Glassmorphism effects work in both modes

#### **Element Selection Feedback**
- Select any element on canvas
- Corresponding toolbar button highlights with white background
- Clear visual connection between canvas and controls

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏹️ Project Structure

```
ppt-slide-maker/
├── src/
│   ├── components/          # React components
│   │   ├── SlideCanvas.jsx     # Main slide editor
│   │   ├── Toolbar.jsx         # Top toolbar with controls
│   │   ├── Sidebar.jsx         # Slide management panel
│   │   ├── PresentationModal.jsx # Slideshow interface
│   │   └── ...
│   ├── context/             # React contexts
│   │   ├── SlidesContext.jsx   # Slide state management
│   │   └── ThemeContext.jsx    # Theme system
│   ├── styles/              # CSS files
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── glassmorphism-update.md  # Detailed feature documentation
└── package.json
```

## 🎨 Design System

### **Glassmorphism Effects**
```css
/* Primary glass button */
.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

/* Active state */
.glass-button-active {
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### **Color System**
- **Dark Theme**: White text (#ffffff) on dark backgrounds
- **Light Theme**: Dark text (#111827) on light backgrounds
- **Active States**: High contrast white/black combinations
- **Glassmorphism**: Semi-transparent overlays with backdrop blur

## 🧪 Testing

### **Slideshow Testing Checklist**

✅ **Basic Slideshow**
- Starts from slide 1
- Auto-advances every 5 seconds
- Shows countdown timer (5→1)
- Loops back to first slide after last
- Pause/resume functionality works
- Manual navigation with keys/buttons

✅ **Advanced Features**
- Element selection highlights toolbar buttons
- Font family changes apply correctly
- Theme switching works properly
- All glassmorphism effects render correctly

## 🔧 Technical Details

### **Built With**
- **React 18** - Modern React with hooks and context
- **Vite 5.4** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** - State management for slides and themes

### **Key Features**
- **Glassmorphism CSS** - Backdrop filter and transparency effects
- **Modern Layout** - CSS Grid & Flexbox
- **React Hooks** - useState, useEffect, useContext, useRef
- **Event Handling** - Mouse, keyboard, and drag events
- **Performance** - Component memoization and efficient rendering

## 🎆 What Makes This Special

🎨 **Visual Excellence**
- Premium glassmorphism design language
- Perfect dark theme with white text throughout
- Sophisticated gradients and transparency effects

🎬 **Professional Slideshow**
- Industry-standard 5-second auto-advance
- Continuous looping for unattended presentations
- Professional controls with visual feedback

🧠 **Smart User Experience**
- Element selection feedback connects canvas to toolbar
- Context-aware font family application
- Intelligent text formatting preservation

## 📋 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/sriharsha0809/ppt-slide-maker/issues).

## 👥 Author

**Harsha** - [@sriharsha0809](https://github.com/sriharsha0809)

---

**🚀 Start creating beautiful presentations with modern design and professional features!**
