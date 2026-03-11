# Development Planning

## Next: Geoshape / Map Rendering

### Problem
Geopoint, geoshape, and geotrace widgets currently render as a broken map — no tiles, no draw tools.

### Root Cause
`enketo-core`'s geo widget (`geopicker.js`) depends on three map libraries:
```js
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet.gridlayer.googlemutant'; // ← stubbed to {} in vite.config.ts
```

`leaflet.gridlayer.googlemutant` requires a Google Maps API key. Rather than block the initial build on an API key, it was stubbed out with an empty export. This causes:
1. No tile provider gets registered → blank gray map
2. Draw tools fail to initialize → polygon/point drawing doesn't work
3. Leaflet's default marker icons break under Vite's asset bundler

`leaflet` and `leaflet-draw` themselves are bundled correctly — only the tile layer is missing.

### Fix Plan

**Step 1: Switch to OpenStreetMap tiles (no API key)**

Override `enketo/config` to use OSM instead of Google:
```js
// app/node_modules/enketo-core/config.js
maps: [{
  tiles: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  name: 'OpenStreetMap',
  attribution: '© OpenStreetMap contributors'
}]
```
Or better: expose as a Vite alias override so it survives `npm install`.

**Step 2: Replace the googlemutant stub with a no-op shim**

`src/stubs/empty.ts` currently exports `{}`. Replace with a minimal shim that satisfies Leaflet without crashing:
```ts
// Returns a dummy GridLayer so L.gridLayer.googleMutant() doesn't throw
export default function GoogleMutant() {
  return { addTo: () => {}, remove: () => {}, setOpacity: () => {} };
}
```

**Step 3: Import Leaflet CSS**

Add to `app/src/main.tsx`:
```ts
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
```

**Step 4: Fix Leaflet marker icons under Vite**

Standard fix — add to app entry point:
```ts
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow });
```

**Step 5: Test**

Use a form with `geopoint`, `geoshape`, or `geotrace` fields. Verify:
- Map tiles load (OSM satellite/street view)
- Draw tools appear (polygon, polyline, point marker)
- Coordinates save to the model and appear in the Variables panel

### Files to change
| File | Change |
|---|---|
| `app/src/stubs/empty.ts` | Replace `{}` with googlemutant no-op shim |
| `app/vite.config.ts` | Add `resolve.alias` for `enketo/config` → custom config file |
| `app/src/config/enketo-config.js` (new) | OSM tile config |
| `app/src/main.tsx` | Add Leaflet + leaflet-draw CSS imports + marker icon fix |

### Estimated effort
2–3 hours. Most logic is in enketo-core already; this is purely wiring.

---

## Next: Preserve Excel Formatting in XLSX Export

### Problem
The XLSX export creates a plain workbook from the sheet data JSON. The original uploaded Excel file often has formatting (column colors, header backgrounds, column widths, frozen panes, conditional formatting) that makes it readable. The exported file loses all of this.

### Fix Plan

**Step 1: Store the original workbook styles on upload**

In `api/main.py` `_parse_xlsform_sheets()`, also extract formatting metadata from the original workbook:
- Column widths per sheet
- Header row fill colors and font styles
- Cell number formats
- Frozen panes

Store as a separate `xlsform_styles` dict alongside `xlsform_sheets`.

**Step 2: Apply styles during export**

In `POST /export`, accept an optional `xlsform_styles` payload and apply the stored formatting when building the workbook:
- Set column widths
- Apply header fill/font
- Set number formats on data cells
- Freeze panes

**Step 3: Alternative — keep original workbook bytes**

A simpler approach: store the original `.xlsx` bytes (base64) and at export time, load the original workbook with openpyxl (preserving styles), then patch only the changed cell values. This preserves all formatting, conditional formatting, merged cells, etc. with zero style extraction logic.

### Files to change
| File | Change |
|---|---|
| `api/main.py` | Store original workbook bytes or styles; apply during export |
| `app/src/App.tsx` | Pass original workbook data through state |
| `app/src/types/index.ts` | Add style/workbook types if needed |

---

## Backlog

### Offline / PWA support
Bundle the app as a PWA so field teams can use it without internet after first load.
- Leaflet tile caching (service worker)
- XLSForm file stored in IndexedDB

### Form submission preview
Show what the final XML submission would look like before submitting to KoboToolbox.
Useful for checking that calculated fields and metadata are correct.

### CSV data editor
Inline editor for pulldata CSVs — add/edit/remove rows without leaving the debugger.
Currently you have to edit the CSV externally and re-upload.

### Multi-language support
Forms with `label::English (en)` and `label::French (fr)` etc. — add a language switcher in the debugger UI (enketo-core supports this natively via `form.langs`).

### Form diff
Compare two versions of the same form (e.g. v0.6 vs v0.7):
- Show added/removed/changed questions
- Highlight breaking changes (renamed fields, changed types)

### Export filled form as XML
After testing a form by filling it in the debugger, export the current model state as a valid ODK submission XML. Useful for testing your server-side processing pipeline.
