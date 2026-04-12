# XLSForm Debugger v3.1 - Font Size Proportions Update

## Summary
Fixed font size hierarchy across the three-panel layout to create visual hierarchy while maintaining readability.

## Font Size Configuration

### Panel Base Sizes
| Panel | Font Size | Purpose |
|-------|-----------|---------|
| **Middle (FormRenderer)** | **16px** | Primary content - main form UI |
| **Left (QuestionTree)** | **13px** (81% of middle) | Secondary content - structure tree |
| **Right (DebugPanel)** | **13px** (81% of middle) | Secondary content - values/debug info |

### Relative Sizing Within Panels
| Element Type | Size | Example |
|--------------|------|---------|
| Headers/Labels | 92% of base (0.92em) | "Form Structure", "Values" |
| Icons/Metadata | 77% of base (0.77em) | Type icons, status indicators |
| Main Text | 100% of base (1em) | Tree items, field names |

## Files Modified

### Core Layout
- **src/App.tsx**
  - Removed global `text-xs` class
  - Added `className="panel-left"` to left Panel
  - Added `className="panel-middle"` to middle Panel
  - Added `className="panel-right"` to right Panel
  - Added inline `fontSize: '0.75em'` to action buttons

- **src/App.css**
  - Created `.panel-left` rule: `font-size: 13px; line-height: 1.5;`
  - Created `.panel-middle` rule: `font-size: 16px; line-height: 1.6;`
  - Created `.panel-right` rule: `font-size: 13px; line-height: 1.5;`
  - Added proportional sizing rules for headings, labels, and metadata
  - Ensured form inputs inherit panel font-size

### Component Updates
- **src/components/QuestionTree.tsx**
  - TreeNodeItem: Removed `text-xs`, added `fontSize: '1em'` to main items
  - Icons: Set `fontSize: '0.77em'` for type indicators
  - Header: Set `fontSize: '0.92em'` for "Form Structure" label

- **src/components/DebugPanel.tsx**
  - Tab buttons: Set `fontSize: '0.92em'` for labels
  - Count badges: Set `fontSize: '0.77em'` for metadata

- **Debug Tab Components** (ValuesPanel, WarningsPanel, etc.)
  - Removed all `text-xs` and `text-sm` Tailwind classes
  - Text now inherits panel base font-size
  - All relative sizing via `em` units (responsive to panel context)

## Visual Hierarchy Achieved

✅ **Clear three-level hierarchy:**
1. **Middle panel (16px)** - Primary, draws attention
2. **Left/Right panels (13px)** - Secondary, supports primary
3. **Icons/Labels (< base size)** - Tertiary, provides context

✅ **Consistency & Proportionality:**
- All panels use consistent ratio (13:16 = 81%)
- Headings and labels scale proportionally within each panel
- Icons and metadata remain visually subordinate

✅ **Readability:**
- Left panel stays readable despite smaller size (tree navigation)
- Right panel stays readable despite smaller size (values display)
- Middle panel maintains primary focus with larger, clearer text

## Build Status
✅ Build successful - no TypeScript or Vite errors
✅ All components compile correctly
✅ Ready for visual testing and deployment

## Next Steps for Verification
1. Run `npm run dev` to test visually
2. Verify three panels have clear visual weight: middle > left/right
3. Confirm left/right panels are still readable at 13px
4. Check that headings and labels scale proportionally within each panel
5. Test responsive behavior when panels are resized
