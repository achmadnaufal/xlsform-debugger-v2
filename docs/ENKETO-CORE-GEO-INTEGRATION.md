# enketo-core Geoshape/Geopoint Integration Guide

## Overview

This document explains how the geoshape/geopoint implementation integrates with **enketo-core v9.0.1**.

## How enketo-core Handles Geopoint/Geoshape

### Built-in Support ✅

enketo-core includes a comprehensive **Geopicker widget** that:
1. Detects question types: `geopoint`, `geoshape`, `geotrace`
2. Renders interactive Leaflet maps automatically
3. Handles user input (click for point, draw for polygon)
4. Validates coordinate data
5. Stores values in XForm model

### Widget Location
```
node_modules/enketo-core/src/widget/geo/geopicker.js
```

### Supported Question Types

| Type | Widget | Interaction | Stores |
|------|--------|-------------|--------|
| `geopoint` | Geopicker | Click to place marker | `lat lon alt acc` |
| `geoshape` | Geopicker | Draw polygon | `lat1 lon1 ... latN lonN lat1 lon1` |
| `geotrace` | Geopicker | Draw polyline | `lat1 lon1 lat2 lon2 ... latN lonN` |

## XLSForm to enketo-core Flow

```
┌─────────────────────┐
│   XLSForm (.xlsx)   │
│  - survey sheet     │
│  - choices sheet    │
│  - settings sheet   │
└──────────┬──────────┘
           │
    enketo-transformer
           │
           ▼
┌─────────────────────┐
│   XForm XML         │
│ - form HTML         │
│ - model XML         │
└──────────┬──────────┘
           │
    enketo-core
           │
           ▼
┌─────────────────────┐
│  Form Rendered      │
│  - Geopicker widget │
│  - Maps initialized │
│  - Ready for input  │
└──────────┬──────────┘
           │
    User interaction
           │
           ▼
┌─────────────────────┐
│  Form Data          │
│ - Coordinates stored│
│ - Ready to submit   │
└─────────────────────┘
```

## XLSForm Syntax

### Geopoint Question
```
| type     | name       | label         |
|----------|------------|---------------|
| geopoint | my_point   | Your location |
```

**Result**: Input field with map button → Opens Leaflet map for coordinate selection

### Geoshape Question
```
| type     | name       | label         |
|----------|------------|---------------|
| geoshape | my_polygon | Property line |
```

**Result**: Input field with map button → Opens Leaflet map for polygon drawing

### Geotrace Question
```
| type    | name       | label         |
|---------|------------|---------------|
| geotrace| my_path    | Route walked  |
```

**Result**: Input field with map button → Opens Leaflet map for polyline drawing

## Configuration

### Default Configuration (Automatic)
enketo-core automatically:
- Uses OpenStreetMap tiles
- Centers map at [0, 0]
- Sets zoom level to 15
- Includes Leaflet and Leaflet.Draw libraries

### Custom Configuration (Optional)

In `FormRenderer.tsx`, you can pass custom config to enketo-core:

```tsx
const external = externalData.map(({ id, xml }) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  return { id, xml: doc };
});

const form = new Form(formEl, {
  modelStr: modelXml,
  external,
  // Custom config (optional):
  // maps: [ { name: 'streets', ... } ]
  // googleApiKey: 'YOUR_KEY'
});
```

## CSS Styling

### enketo-core CSS Chain
```
main.tsx
├── imports "enketo.scss"
│   └── imports "enketo-core/src/sass/grid/grid.scss"
│       ├── widget styles (including geopicker)
│       ├── map container styles
│       ├── leaflet integration
│       └── responsive design
├── imports "leaflet.css" (new)
└── imports "leaflet-draw.css" (new)
```

### What's Included in enketo-core Styles

1. **Map Container**
   - `.or-appearance-placement-map` - Main map container
   - `.geopoint-map`, `.geoshape-map` - Type-specific containers

2. **Form Elements**
   - Input field for coordinate display
   - Buttons to open/close map dialog
   - Coordinate validation feedback

3. **Leaflet Integration**
   - Map initialization
   - Tile layer styling
   - Marker and polygon styling

4. **Draw Controls**
   - Toolbar styling
   - Button icons and states
   - Editing mode styling

## Data Flow

### Geopoint Input to Storage
```
User clicks map
    ↓
Leaflet maps marker position
    ↓
enketo-core captures: L.LatLng → {lat, lng}
    ↓
Formats: "latitude longitude"
    ↓
Updates input value
    ↓
Triggers 'valuechange' event
    ↓
XForm model updates
    ↓
Ready to submit
```

### Geoshape Drawing to Storage
```
User draws polygon
    ↓
Leaflet.Draw creates shape
    ↓
enketo-core extracts polygon vertices
    ↓
Formats: "lat1 lon1 lat2 lon2 ... close polygon"
    ↓
Validates polygon (no self-intersections)
    ↓
Updates input value
    ↓
Triggers 'valuechange' event
    ↓
XForm model updates
    ↓
Ready to submit
```

## Our Enhancements

### What We Added

1. **Enhanced Components**
   - `GeopointWidget.tsx` - Additional UI improvements
   - `GeoshapeWidget.tsx` - Better polygon handling
   - `MapWidget.tsx` - Reusable base component

2. **CSS Improvements**
   - Dark mode support
   - Responsive mobile styling
   - Better visual hierarchy

3. **Types & Documentation**
   - TypeScript types for geo components
   - Comprehensive implementation guide
   - Integration examples

### What enketo-core Provides

- Core widget logic
- Form integration
- Data validation
- XForm model handling
- Browser compatibility

### Relationship

```
enketo-core (Core)
    ↓
    ├── Geopicker widget ✓ (built-in)
    ├── Leaflet integration ✓ (built-in)
    └── OpenStreetMap tiles ✓ (built-in)
    
Our Enhancement (Optional Layer)
    ├── Better styling
    ├── Responsive design
    └── TypeScript components
```

## Form Initialization Sequence

When FormRenderer loads a form with geopoint/geoshape:

```
1. XForm XML transformation (enketo-transformer)
   ↓
2. HTMLElement creation in FormRenderer
   ↓
3. Form instantiation: new Form(element, options)
   ↓
4. form.init() - initializes all widgets
   │  ├── Geopicker.init() for geopoint inputs
   │  ├── Geopicker.init() for geoshape inputs
   │  └── ... other widgets
   │
5. Maps render with OpenStreetMap tiles
   │
6. Leaflet.Draw controls injected
   │
7. Event listeners attached (change, input, valuechange)
   │
8. Form ready for user interaction ✓
```

## Browser Geolocation (Optional)

enketo-core's Geopicker can automatically center maps on device location if:

1. User grants permission
2. Browser supports Geolocation API
3. Feature enabled in config

### How to Use
Users will see an option in the map dialog to:
- "Use current location" button
- "Use my location" link

When clicked:
```javascript
navigator.geolocation.getCurrentPosition(position => {
  // Map centers on [lat, lng]
  // Marker placed at device location
});
```

## Validation

### enketo-core Validates

1. **Geopoint**
   - Latitude range: -90 to 90
   - Longitude range: -180 to 180
   - Required vs optional
   - Constraint expressions

2. **Geoshape**
   - Minimum 4 points (3 + closing point)
   - No self-intersecting polygons
   - Closed ring validation
   - Constraint expressions

3. **Geotrace**
   - Minimum 2 points
   - No special requirements
   - Constraint expressions

### Error Messages
enketo-core displays user-friendly messages for:
- Invalid coordinates
- Self-intersecting polygons
- Missing required geo data
- Constraint violations

## Testing with Sample Forms

### Minimal Geopoint Form
```
survey:
| type     | name     | label    |
|----------|----------|----------|
| geopoint | location | Location |

Expected: Map renders, click places marker
```

### Minimal Geoshape Form
```
survey:
| type     | name     | label   |
|----------|----------|---------|
| geoshape | boundary | Boundary|

Expected: Map renders, draw toolbar visible, can create polygon
```

### Complete Form (geoshape-test-form)
See: `docs/geoshape-test-form-survey.csv`

## Troubleshooting enketo-core Integration

### Issue: Maps Not Showing
**Debug**:
1. Check browser console: `window.__enketoForm`
2. Verify: `console.log(__enketoForm.model.xml.documentElement)`
3. Look for errors in initialization

**Solution**:
- Ensure Leaflet CSS imported in main.tsx
- Check enketo-core styles loaded
- Verify form HTML contains input[data-type-xml="geopoint"]

### Issue: Map Looks Wrong
**Debug**:
1. Check tile layer: `window.__enketoForm._map.getPane('tilePane')`
2. Verify attribution visible at bottom-right

**Solution**:
- Clear browser cache
- Check OpenStreetMap tile server status
- Verify internet connection

### Issue: Values Not Saving
**Debug**:
1. Check form state: `window.__enketoForm.getDataStr()`
2. Look for the question in XML
3. Inspect input element value

**Solution**:
- Ensure 'valuechange' event fired after placing marker
- Check XForm model binding for question
- Verify question name in survey sheet

## Performance Considerations

### enketo-core Optimization
- Lazy loads Leaflet only for geo questions
- Caches tile layers
- Efficient polygon rendering

### Our Components Optimization
- React re-render only on value changes
- Lazy map initialization
- Event debouncing for pan/zoom

### Production Tips
- Preload Leaflet + Leaflet.Draw
- Enable browser caching for tiles
- Use CDN for map tiles (already done)
- Monitor bundle size (Leaflet is ~30KB gzipped)

## Resource Limits

| Resource | Limit | Notes |
|----------|-------|-------|
| Polygon Points | 1000 | Beyond this, performance degrades |
| Map Zoom | 0-19 | OpenStreetMap standard |
| Tile Cache | Browser default | Typically 100+ tiles |
| API Calls | Unlimited | Using free OSM tiles |

## Version Compatibility

| Component | Version | Status |
|-----------|---------|--------|
| enketo-core | 9.0.1 | ✅ Tested |
| leaflet | 1.9.4 | ✅ Works |
| leaflet-draw | 1.0.4 | ✅ Works |
| React | 19.2.0 | ✅ Compatible |
| TypeScript | 5.9.3 | ✅ Types available |

## Migration Notes

If upgrading from older enketo-core versions:

- **v8.x → v9.0**: Geopicker API unchanged, Leaflet version bumped
- **v7.x → v9.0**: May need CSS adjustments
- **Older**: Ensure Leaflet is properly imported

## Contributing to Integration

### To Enhance Geopicker
1. Modify `src/components/MapWidget.tsx` for base functionality
2. Update `GeopointWidget.tsx` or `GeoshapeWidget.tsx` for specific types
3. Test with sample forms
4. Update documentation

### To Add Features
1. Keep enketo-core compatibility
2. Add feature flags if major changes
3. Update version number
4. Add tests

## References

- **enketo-core Source**: `/app/node_modules/enketo-core/src/widget/geo/`
- **enketo Documentation**: https://github.com/enketo/enketo-core
- **Our Implementation**: `/app/src/components/`
- **XLSForm Spec**: https://xlsform.org/

---

**Document Version**: 1.0.0
**Date**: 2026-03-08
**Tested with**: enketo-core 9.0.1, React 19.2.0
