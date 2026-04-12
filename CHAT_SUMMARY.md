# XLSForm Debugger v2 — Chat Summary

## Topics Covered

### 1. v1 → v2 Rollback
- **v1 Problem**: Custom React renderer diverged from ODK spec, unfixable technical debt
- **v2 Solution**: Switched to `enketo-core` (actual Kobo/ODK renderer) + FastAPI backend
- **Architecture**: XLSForm → pyxform (FastAPI) → XForm XML + external_data JSON → enketo-core → browser render

### 2. Geoshape/Geopoint Maps (Failed Integration, Mar 8)
- **Attempt**: Add Leaflet.js + OpenStreetMap rendering for geopoint/geoshape questions
- **Status**: ❌ Removed due to:
  - TypeScript compilation errors (lat/lon type mismatches in GeopointWidget, GeoshapeWidget)
  - Components created in isolation, never integrated into ValuesPanel
  - One generalist agent created 4 map components + 2000+ lines of docs → unmergeable code
  
- **Key Lesson**: Specialize agent work by domain
  - Frontend agent: UI only, isolated component
  - Backend agent: State + API, no UI imports
  - Integration agent: Wire them together cleanly

### 3. Font Size Consistency (Current)
- **Current**: `text-xs` (11px) at root, re-declared in children
- **Issue**: Nested text becomes unpredictable, badges undersized
- **Better Approach**:
  - Set `text-xs` once at root
  - Remove redundant re-declarations (inherit instead)
  - Consistent scaling for badges (e.g., `text-[10px]` for all)

## Next Steps (For Claude Code)
- Review ValuesPanel structure + FieldInspector integration
- Revisit geoshape rendering with specialized agent strategy
- Audit font size inheritance chain (App → DebugPanel → Tab Panels)
