# Geoshape/Geopoint Implementation Checklist

## ✅ Completed Tasks

### Dependencies & Setup
- [x] Verify `leaflet` (1.9.4) installed via enketo-core ✅
- [x] Verify `leaflet-draw` (1.0.4) installed via enketo-core ✅
- [x] Install TypeScript types: `@types/leaflet`, `@types/leaflet-draw` ✅
- [x] Import Leaflet CSS in `main.tsx` ✅
- [x] Import Leaflet.Draw CSS in `main.tsx` ✅

### Components Created
- [x] `MapWidget.tsx` - Base Leaflet map component ✅
- [x] `GeopointWidget.tsx` - Single point placement widget ✅
- [x] `GeoshapeWidget.tsx` - Polygon drawing widget ✅
- [x] `EnketoGeoIntegration.tsx` - Bridge component for enketo-core ✅

### CSS & Styling
- [x] Import Leaflet base CSS ✅
- [x] Import Leaflet.Draw CSS ✅
- [x] Add responsive map styling ✅
- [x] Add dark mode support ✅
- [x] Create geo-widget-specific CSS classes ✅

### Documentation
- [x] Create `GEO-WIDGETS-IMPLEMENTATION.md` ✅
- [x] Document all components and features ✅
- [x] Add configuration examples ✅
- [x] Add troubleshooting guide ✅

### Test Materials
- [x] Create test form CSV (`geoshape-test-form-survey.csv`) ✅
- [x] Document how to test each feature ✅

### Build Verification
- [x] TypeScript compilation check (no errors) ✅
- [x] Dependencies installed successfully ✅
- [x] All imports resolvable ✅

---

## 🔄 Integration Options

### Option 1: Use enketo-core's Built-in Geopicker (Recommended)
**Status**: Ready to use - no additional configuration needed
**How**: enketo-core automatically detects geopoint/geoshape/geotrace types

**Steps**:
1. Create/upload form with geopoint/geoshape questions
2. enketo-core renders its built-in Geopicker widget
3. Maps work automatically (Leaflet + OpenStreetMap)

**Requirements**:
- ✅ CSS imports in place (main.tsx)
- ✅ Leaflet/leaflet-draw installed
- ✅ Forms with correct question types

### Option 2: Use Our React Components Directly (Advanced)
**Status**: Components ready, requires manual integration
**How**: Import and use GeopointWidget/GeoshapeWidget in custom components

**Example**:
```tsx
import { GeopointWidget } from './components/GeopointWidget';

<GeopointWidget 
  value={existingValue}
  onChange={handleChange}
  height="400px"
/>
```

### Option 3: Auto-Enhance enketo Widgets with EnketoGeoIntegration (Optional)
**Status**: Component ready, can be integrated into FormRenderer
**How**: Wrap form with EnketoGeoIntegration component

**Implementation**:
```tsx
// In FormRenderer.tsx
<EnketoGeoIntegration formElement={containerRef.current} />
```

---

## 📋 Testing Checklist

### Setup
- [ ] Start dev server: `npm run dev`
- [ ] Application loads without errors
- [ ] Check browser console - no Leaflet/map errors

### Geopoint Testing
- [ ] Upload form with geopoint question
- [ ] Verify map renders in form
- [ ] Click on map to place marker
- [ ] Verify marker appears at clicked location
- [ ] Check lat/lon values display correctly
- [ ] Load form again - verify geopoint persists

### Geoshape Testing
- [ ] Upload form with geoshape question
- [ ] Verify map renders in form
- [ ] Look for draw toolbar
- [ ] Click polygon tool (if visible)
- [ ] Draw polygon by clicking points on map
- [ ] Double-click to complete polygon
- [ ] Verify coordinates list appears
- [ ] Edit polygon using toolbar tools
- [ ] Delete polygon and redraw
- [ ] Load form again - verify polygon persists

### Mobile/Responsive Testing
- [ ] Open on mobile device (or use dev tools device emulation)
- [ ] Verify map is visible and interactive
- [ ] Touch interactions work (pan, zoom)
- [ ] Map resizes with viewport

### Edge Cases
- [ ] Form with multiple geopoint questions
- [ ] Form with multiple geoshape questions
- [ ] Mix of geopoint and geoshape in same form
- [ ] Read-only mode (if supported by enketo-core)
- [ ] Very high zoom levels
- [ ] Very low zoom levels
- [ ] Large polygons (>10 points)

---

## 🚀 Deployment Checklist

### Before Production
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] TypeScript builds without errors
- [ ] CSS files properly bundled
- [ ] Map tiles load from CDN (not localhost)
- [ ] Performance acceptable on mobile
- [ ] Offline graceful degradation (optional)

### Performance Optimization
- [ ] Lazy load Leaflet only when needed
- [ ] Cache tiles in service worker (optional)
- [ ] Minimize re-renders in geo components
- [ ] Profile with DevTools Performance tab

### Browser Compatibility
- [ ] Test on Chrome (latest)
- [ ] Test on Firefox (latest)
- [ ] Test on Safari (latest)
- [ ] Test on Edge (latest)
- [ ] Test on mobile Safari (iOS)
- [ ] Test on Chrome Mobile (Android)

---

## 📝 Configuration Defaults

### Map Setup
- **Tile Provider**: OpenStreetMap
- **API Key Required**: No ✅
- **Default Zoom**: 13-15
- **Default Center**: [0, 0] (world center)
- **Attribution**: OpenStreetMap copyright notice

### Geopoint
- **Marker Color**: Blue (Leaflet default)
- **Marker Size**: 24x16 pixels
- **Click Interaction**: Place single marker
- **Data Format**: `lat lon alt acc`

### Geoshape
- **Draw Tool**: Polygon (Leaflet.Draw)
- **Edit Capability**: Yes
- **Delete Capability**: Yes
- **Intersection Detection**: Enabled (via enketo-core)
- **Data Format**: Space-separated lat/lon pairs (closed polygon)

---

## 🐛 Known Issues & Workarounds

### Issue 1: Icon Files Not Found
**Symptom**: Markers don't appear, console shows 404 for marker-icon.png
**Solution**: ✅ Already handled in MapWidget.tsx with CDN fallback

### Issue 2: Map Not Showing
**Symptom**: Gray/blank area where map should be
**Solution**: Check Leaflet CSS import, ensure container has height
**Workaround**: `div { height: 400px; width: 100%; }`

### Issue 3: Draw Controls Not Visible
**Symptom**: No toolbar for drawing shapes
**Solution**: Verify leaflet-draw CSS imported, check browser console
**Workaround**: Manually adjust z-index in CSS if covered by other elements

### Issue 4: Data Not Persisting After Form Save
**Symptom**: Geopoint/geoshape values disappear after reload
**Solution**: Verify enketo-core is capturing 'valuechange' events
**Workaround**: Force update via `element.dispatchEvent(new Event('change'))`

---

## 📚 Next Steps

### Immediate (Verification)
1. Start dev server: `cd app && npm run dev`
2. Open in browser
3. Upload test form with geoshape/geopoint
4. Verify maps render and interact

### Short Term (Enhancement)
- [ ] Add geolocation auto-center feature
- [ ] Implement area calculation for geoshape
- [ ] Add satellite imagery toggle
- [ ] Create form builder UI for geo fields

### Long Term (Advanced Features)
- [ ] Offline map tiles via service worker
- [ ] GPS data import/export
- [ ] Batch coordinate upload
- [ ] Map layer management
- [ ] GeoJSON import/export

---

## 📞 Support Resources

### Files to Review
- `src/components/MapWidget.tsx` - Base functionality
- `src/components/GeopointWidget.tsx` - Single point widget
- `src/components/GeoshapeWidget.tsx` - Polygon widget
- `src/main.tsx` - CSS imports
- `docs/GEO-WIDGETS-IMPLEMENTATION.md` - Full documentation

### External References
- [Leaflet Quick Start Guide](https://leafletjs.com/examples/quick-start/)
- [Leaflet.Draw Documentation](https://github.com/Leaflet/Leaflet.draw)
- [XLSForm Geo Types](https://xlsform.org/en/#geopoint)
- [enketo-core API](https://github.com/enketo/enketo-core)

---

**Status**: Ready for Testing ✅
**Date**: 2026-03-08
**Version**: 1.0.0
