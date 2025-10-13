# Alignment and List Functionality Testing Guide

## Testing the Fixed Horizontal Alignment

### Test Case 1: Basic Alignment in Rich Text Editor
1. **Start the application:** `npm run dev` → `http://localhost:5175/`
2. **Create a text element:** Click `+ Text` button
3. **Enter edit mode:** Double-click the text element
4. **Test alignment buttons:** Go to Home tab, test each alignment button:
   - **Left Align (⟸):** Text should align to the left
   - **Center Align (≡):** Text should center horizontally
   - **Right Align (⟹):** Text should align to the right
5. **Verify button states:** Active alignment button should be highlighted
6. **Test with selections:** Select part of text and apply different alignments

### Test Case 2: Alignment Persistence
1. **Set alignment:** Apply center alignment to text
2. **Exit edit mode:** Click outside the text element
3. **Re-enter edit mode:** Double-click the text again
4. **Verify:** Alignment should be maintained and button should show active state

### Test Case 3: Mixed Content Alignment
1. **Create rich content:** Add text with formatting (bold, italic, etc.)
2. **Apply alignment:** Test all alignment options
3. **Verify:** Alignment should work regardless of text formatting

## Testing List Functionality

### Test Case 1: Basic List Creation
1. **In Insert tab:** Navigate to the Insert tab
2. **Create text element:** Click `+ Text` button  
3. **Enter edit mode:** Double-click the text element
4. **Test each list type:**
   - **None (—):** Should remove any list formatting
   - **Bullet (•):** Should create bulleted list
   - **Numbers (1.):** Should create numbered list  
   - **Roman (I.):** Should create roman numeral list
   - **Alpha (A.):** Should create alphabetical list

### Test Case 2: List Type Switching
1. **Create bullet list:** Click bullet list button
2. **Add some items:** Type several lines of text
3. **Switch to numbers:** Click numbered list button
4. **Verify:** List should convert from bullets to numbers
5. **Test all combinations:** Try switching between all list types

### Test Case 3: List Removal
1. **Create any list:** Choose any list type and add items
2. **Remove formatting:** Click "None" button
3. **Verify:** All list formatting should be removed, text should remain

## Testing Button State Management

### Test Case 1: Real-time State Updates
1. **Select text element:** Click on a text element
2. **Enter edit mode:** Double-click to edit
3. **Change alignment:** Apply different alignments
4. **Observe buttons:** Alignment buttons should highlight correctly for active state
5. **Change lists:** Apply different list types
6. **Observe buttons:** List buttons should highlight correctly for active type

### Test Case 2: Selection-based States  
1. **Enter edit mode:** Double-click text element
2. **Make text selection:** Select some text within the editor
3. **Apply formatting:** Use alignment and list buttons
4. **Change selection:** Select different text portions
5. **Verify:** Button states should update based on current selection formatting

## Expected Results

### ✅ **Working Horizontal Alignment**
- Left, center, and right alignment buttons work immediately
- Text visually aligns correctly in the editor
- Alignment persists when exiting/re-entering edit mode
- Button highlights show current alignment state
- Works with both selected text and entire content

### ✅ **Working List Functionality**  
- All list types (bullet, number, roman, alpha) create proper lists
- List type switching works seamlessly
- "None" button removes all list formatting
- List formatting persists across edit sessions
- Button highlights show current list type

### ✅ **Proper Button States**
- Alignment buttons highlight correctly for active alignment
- List buttons highlight correctly for active list type
- States update in real-time as formatting changes
- No focus loss when clicking toolbar buttons

## Troubleshooting

### If Alignment Doesn't Work:
1. **Check browser console** for any JavaScript errors
2. **Ensure text element is selected** before trying alignment
3. **Make sure you're in edit mode** (double-clicked the text)
4. **Try refreshing the page** and testing again

### If Lists Don't Work:
1. **Verify you're in the Insert tab** (not Home tab)
2. **Ensure text element is selected and in edit mode**
3. **Check browser console** for errors
4. **Try typing some text first**, then applying list formatting

### If Button States Don't Update:
1. **Click directly on the text** to ensure proper selection
2. **Move cursor around** within the text to trigger state updates  
3. **Check that text element is properly selected** (blue outline)

## Performance Notes

- All alignment and list operations should be **immediate** (no delay)
- Button state changes should be **instant** when selection changes
- **No browser lag** should occur when switching between formats
- Memory usage should remain stable during extended formatting sessions

## Browser Compatibility

This functionality has been tested and optimized for:
- ✅ **Chrome/Edge** (Chromium-based browsers)
- ✅ **Firefox** 
- ✅ **Safari** (WebKit-based browsers)

The implementation uses standard web APIs (`document.execCommand`, `getSelection`) that are well-supported across modern browsers.