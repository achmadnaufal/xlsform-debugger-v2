# Geoshape & Geopoint Map Rendering Implementation

## Overview

This implementation adds interactive map rendering for **geopoint**, **geoshape**, and **geotrace** questions in XLSForms using OpenStreetMap tiles and Leaflet.js.

## Architecture

### Components

1. **MapWidget.tsx** - Base reusable Leaflet map component
   - Initializes OpenStreetMap map
   - Provides base functionality for map interactions
   - Used as foundation for specialized widgets

2. **GeopointWidget.tsx** - Single point placement widget
   - Allows clicking on map to place a marker
   - Displays latitude/longitude/altitude/accuracy values
   - Syncs with form data in format: `lat lon alt acc`

3. **GeoshapeWidget.tsx** - Polygon drawing widget
   - Uses Leaflet.Draw for polygon creation
   - Allows drawing, editing, and deleting polygons
   - Stores coordinates as space-separated pairs: `lat1 lon1 lat2 lon2 ... latN lonN`

4. **EnketoGeoIntegration.tsx** - Bridge between enketo-core and React components
   - Monitors form for geo input elements
   - Enhances enketo-core's built-in geopicker
   - Provides styling and UI improvements

## Features

### Geopoint Widget
- ✅ Interactive map with zoom/pan
- ✅ Click-to-place marker
- ✅ Display lat/lon/alt/accuracy values
- ✅ Load existing geopoint data
- ✅ Read-only mode
- ✅ OpenStreetMap tiles (no API key needed)

### Geoshape Widget
- ✅ Interactive map with zoom/pan
- ✅ Draw, edit, and delete polygons using Leaflet.Draw
- ✅ Display coordinates list
- ✅ Load existing polygon data
- ✅ Polygon intersection detection (via enketo-core)
- ✅ OpenStreetMap tiles
- ✅ Auto-fit map to drawn polygon

## Dependencies

All required dependencies are already installed through `enketo-core`:
- ✅ `leaflet@1.9.4` - Map library
- ✅ `leaflet-draw@1.0.4` - Polygon drawing plugin
- ✅ TypeScript types: `@types/leaflet`, `@types/leaflet-draw`

### Installation

If types are not yet installed:
```bash
cd app
npm install --save-dev @types/leaflet @types/leaflet-draw
```

## Integration with enketo-core

The implementation works with **enketo-core v9.0.1**'s built-in geopicker widget:

1. **enketo-core provides**: Widget initialization, data handling, validation
2. **Our enhancement**: Visual improvements via Leaflet and responsive design

### How It Works

1. When a form loads, enketo-core transforms XLSForm to HTML/XML
2. enketo-core detects `geopoint`, `geoshape`, `geotrace` input types
3. enketo-core initializes its built-in Geopicker widget
4. Our components enhance/wrap the widget rendering (optional)
5. Data flows: Form → enketo-core → Our components → Form

## XLSForm Question Types

### Geopoint
```
| type     | name           | label                    |
|----------|----------------|--------------------------|
| geopoint | location       | Where are you?           |
```

Stores: `latitude longitude altitude accuracy`

### Geoshape (Polygon)
```
| type     | name          | label                   |
|----------|---------------|-------------------------|
| geoshape | survey_area   | Draw survey boundary    |
```

Stores: `lat1 lon1 lat2 lon2 lat3 lon3 lat1 lon1` (closed polygon)

### Geotrace (Polyline/Path)
```
| type    | name        | label              |
|---------|-------------|-------------------|
| geotrace| route       | Draw route taken   |
```

## Styling & Layout

### CSS Classes
- `.geo-widget-mount` - Container for geo widgets
- `.geopoint-widget` - Geopoint-specific wrapper
- `.geoshape-widget` - Geoshape-specific wrapper
- `.leaflet-map-container` - Base map container

### Responsive Design
Maps are responsive and adapt to:
- Desktop (400px height)
- Mobile (300px height)
- Custom widths (fits container)

### Dark Mode
Automatic styling adjustments for dark mode via CSS media queries

## Usage in Forms

### Basic Geopoint Form
```
| type     | name     | label              |
|----------|----------|-------------------|
| start    | begin    |                    |
| geopoint | site_loc | Site location      |
| end      | end      |                    |
```

### Advanced Geoshape Form with Constraints
```
| type     | name      | label            | constraint      |
|----------|-----------|------------------|-----------------|
| geoshape | boundary  | Plot boundary    | . != ''         |
| integer  | area_m2   | Area (m²)        | . >= 100        |
```

## Testing

### Test Forms Included
- `geoshape-test-form.xlsx` - Comprehensive test form with all geo question types

### How to Test
1. Open the XLSForm Debugger
2. Upload the test form
3. Verify maps render in the form
4. For **geopoint**: Click to place marker, check coordinates display
5. For **geoshape**: Use draw tools to create polygon, verify coordinates update

### Expected Behavior

#### Geopoint
- Map loads centered at [0, 0]
- Click anywhere to place marker
- Coordinates appear below map
- Values persist when form is saved

#### Geoshape
- Map loads centered at [0, 0]
- Draw toolbar appears (polygon tool active)
- Draw polygon by clicking points
- Double-click to finish polygon
- Coordinates list updates dynamically
- Can edit/delete polygon using toolbar

## Configuration

### Map Configuration (Optional)
Edit `app/src/components/MapWidget.tsx` to customize:

```typescript
// Change default zoom level
const zoom = 13; // 0-19

// Change default center
const center = [0, 0]; // [lat, lon]

// Change map height
height = "400px" // Can be "300px", "500px", etc.
```

### Tile Provider (Optional)
To use different map tiles, modify the L.tileLayer URL:

```typescript
// Current: OpenStreetMap
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { ... })

// Alternative: Stamen Terrain
L.tileLayer("https://tile.opentopomap.org/{z}/{x}/{y}.png", { ... })

// Alternative: CartoDB
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { ... })
```

## Known Limitations

1. **geotrace (polyline)** - Currently handled by enketo-core but not yet with dedicated UI enhancements
2. **Altitude/Accuracy** - Only available for geopoint if device provides them
3. **Offline maps** - Requires internet for tile download (caching not implemented)
4. **Large polygons** - Very complex polygons may impact performance

## Troubleshooting

### Map not showing
- Check browser console for errors
- Verify Leaflet CSS is imported in `main.tsx`
- Ensure enketo-core styles are loaded

### Markers not appearing
- Check icon path in MapWidget component
- Verify CDN URLs are accessible

### Draw tools not working
- Ensure `leaflet-draw` is installed: `npm list leaflet-draw`
- Check that Leaflet.Draw CSS is imported

### Data not persisting
- Verify enketo-core is capturing change events
- Check browser DevTools → Network tab for form submission
- Look at console for JavaScript errors

## File Structure

```
src/
├── components/
│   ├── MapWidget.tsx              # Base map component
│   ├── GeopointWidget.tsx          # Geopoint implementation
│   ├── GeoshapeWidget.tsx          # Geoshape implementation
│   ├── EnketoGeoIntegration.tsx    # Integration with enketo-core
│   └── FormRenderer.tsx            # (existing) Uses geopoint/geoshape
├── main.tsx                        # Updated: imports Leaflet CSS
├── enketo.scss                     # (existing) Imports enketo-core styles
└── index.css                       # (existing) App styles

docs/
├── geoshape-test-form.xlsx        # Test form with all geo types
└── GEO-WIDGETS-IMPLEMENTATION.md  # This file
```

## Browser Support

| Feature    | Chrome | Firefox | Safari | Edge |
|-----------|--------|---------|--------|------|
| Leaflet   | ✅     | ✅      | ✅     | ✅   |
| Leaflet.Draw | ✅ | ✅      | ✅     | ✅   |
| Geolocation API | ✅ | ✅    | ✅     | ✅   |

## Performance

- Maps lazy-load tiles (only visible area)
- Marker clustering available for many points
- Polygon rendering optimized for <1000 vertices
- Mobile-optimized touch interactions

## Future Enhancements

- [ ] Geolocation auto-center (with permission)
- [ ] Satellite imagery option
- [ ] Route optimization for geotrace
- [ ] Area calculation for geoshape
- [ ] Offline map tiles (service worker)
- [ ] Multi-polygon support
- [ ] GPS recording playback

## Contributing

When adding new geo widget features:
1. Keep components small and focused
2. Maintain backward compatibility with enketo-core
3. Test on mobile and desktop
4. Document new configuration options
5. Add TypeScript types for all props

## Resources

- [Leaflet Documentation](https://leafletjs.com/)
- [Leaflet.Draw Documentation](https://github.com/Leaflet/Leaflet.draw)
- [OpenStreetMap Tiles](https://wiki.openstreetmap.org/wiki/Tiles)
- [enketo-core Geopicker](https://github.com/enketo/enketo-core/tree/master/src/widget/geo)
- [XLSForm Geo Types](https://xlsform.org/en/#geopoint)

---

**Last Updated**: 2026-03-08
**Status**: Implementation Complete ✅
