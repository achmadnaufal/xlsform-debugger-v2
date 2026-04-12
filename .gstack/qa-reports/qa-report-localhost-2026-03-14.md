# QA Report: XLSForm Debugger v3.1

| Field | Value |
|-------|-------|
| **URL** | http://localhost:5173 |
| **Date** | 2026-03-14 |
| **Mode** | Full |
| **Framework** | React SPA (Vite + Tailwind) |
| **Pages visited** | 1 (SPA with 6 debug tabs) |
| **Screenshots** | 16 |
| **Duration** | ~10 minutes |

---

## Health Score: 74 / 100

### Category Breakdown

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Console | 100 | 15% | 15.0 |
| Links | 100 | 10% | 10.0 |
| Visual | 77 | 10% | 7.7 |
| Functional | 85 | 20% | 17.0 |
| UX | 77 | 15% | 11.6 |
| Performance | 92 | 10% | 9.2 |
| Content | 97 | 5% | 4.9 |
| Accessibility | 55 | 15% | 8.3 |
| **Total** | | | **73.7 → 74** |

### Severity Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 2 |
| Medium | 4 |
| Low | 3 |

---

## Top 3 Things to Fix

1. **ISSUE-001** — Tab naming mismatch with v3.1 design (6 tabs vs expected 5 merged tabs)
2. **ISSUE-002** — Mobile layout completely broken — three-panel layout doesn't collapse
3. **ISSUE-005** — No keyboard navigation or ARIA labels on the form structure tree

---

## Issues

### ISSUE-001: Tab structure doesn't match v3.1 design spec
**Severity:** HIGH | **Category:** Functional

The debug panel shows 6 separate tabs: Variables, Calculations, Inspector, Warnings, External, XLSForm. According to the v3.1 design notes, Variables + Calculations + Inspector should have been merged into a single "Values" tab, with "Expressions" as a separate tab. The current implementation retains the pre-v3.1 tab structure.

**Evidence:** [screenshots/initial.png](screenshots/initial.png) — 6 tabs visible
**Expected:** 5 tabs: Values | Warnings | External | XLSForm | Expressions

---

### ISSUE-002: Mobile layout completely broken
**Severity:** HIGH | **Category:** Visual / Responsiveness

At 375px viewport width, the three-panel layout (tree + form + debug) doesn't collapse or stack. All three panels are squeezed horizontally, making:
- Tree labels truncated to 3-4 characters ("Farm...", "Fu...", "La...")
- Debug panel tabs cut off — only 2 of 6 tabs visible
- VALUE column in variables table completely hidden
- No way to toggle/collapse panels on mobile

**Evidence:** [screenshots/mobile-view.png](screenshots/mobile-view.png)
**Expected:** Panels should stack vertically or be toggleable on narrow viewports.

---

### ISSUE-003: XSLTProcessor deprecation warning
**Severity:** MEDIUM | **Category:** Performance / Future-proofing

Console shows: `XSLTProcessor and XSLT Processing Instructions have been deprecated by all browsers. These features will be removed from this browser soon.`

This comes from enketo-core's XForm processing. When browsers remove XSLTProcessor support, the form rendering will break entirely.

**Evidence:** Console output after form load
**Impact:** Not broken today, but will break when browsers remove the API.

---

### ISSUE-004: parcel_area_m2 shows NaN before area is entered
**Severity:** MEDIUM | **Category:** UX

The Calculations tab shows `parcel_area_m2` LIVE VALUE as **NaN** (in red) when no parcel area has been entered. While technically correct (undefined * 10000 = NaN), a better UX would show "—" or "N/A" for calculations that depend on unfilled inputs.

**Evidence:** [screenshots/calculations-tab.png](screenshots/calculations-tab.png) — NaN shown in red
**Expected:** Show "—" or "(waiting for parcel_area)" instead of NaN.

---

### ISSUE-005: Form tree lacks keyboard navigation and ARIA roles
**Severity:** MEDIUM | **Category:** Accessibility

The form structure tree on the left uses cursor:pointer divs (`@c26`, `@c34`, etc.) rather than proper ARIA tree roles. The tree items:
- Are not in the ARIA accessibility tree (found only via `snapshot -C`)
- Have no `role="treeitem"` or `role="tree"`
- Cannot be navigated via keyboard (arrow keys, Tab)
- No focus indicators visible

**Evidence:** `snapshot -C` output shows tree items as `cursor-interactive (not in ARIA tree)`
**Expected:** Tree should use `role="tree"` / `role="treeitem"` with keyboard navigation support.

---

### ISSUE-006: No visible "Expressions" tab
**Severity:** MEDIUM | **Category:** Functional

The v3.1 design calls for an "Expressions" tab, but no such tab exists in the UI. The 6 tabs are: Variables, Calculations, Inspector, Warnings, External, XLSForm. Expression data may be partially covered by Calculations and Inspector, but the dedicated tab is missing.

**Evidence:** [screenshots/initial.png](screenshots/initial.png), [screenshots/geopoint-view.png](screenshots/geopoint-view.png)

---

### ISSUE-007: Inspector tab label shows stale field name
**Severity:** LOW | **Category:** UX

After clicking a form field, the Inspector tab label displays the inspected field name (e.g., "farmer_name", "parcel_gps"). This persists even when switching to other tabs. While this provides useful context, it's visually inconsistent — no other tab label changes dynamically, and the text can overflow the tab button.

**Evidence:** [screenshots/variables-with-age.png](screenshots/variables-with-age.png) — Inspector tab shows "farmer_name"

---

### ISSUE-008: Drop zone upload requires precise targeting
**Severity:** LOW | **Category:** UX

The initial file upload required targeting a hidden `<input type="file">` element. The visual drop zone ("Drop XLSForm (.xlsx) here or click to upload") uses a click-to-open-dialog pattern, but the drag-and-drop didn't respond to programmatic drop events. There are also 2 file inputs found in the DOM, which is potentially confusing.

**Evidence:** Upload succeeded only via `input.files = dt.files` + change event, not via DragEvent on the visible drop zone.

---

### ISSUE-009: Variables tab badge count shows "12" but list shows fewer unique user fields
**Severity:** LOW | **Category:** Content

The Variables tab badge shows "12" but this includes group nodes (farmer_info, parcel_info, observation) and the calculated instanceID. From a user perspective, the count could be misleading — they might expect it to match the number of fillable fields (8).

**Evidence:** [screenshots/variables-with-age.png](screenshots/variables-with-age.png) — "Variables 12" badge

---

## What Works Well

1. **Form rendering** — enketo-core renders all field types correctly: text, integer, radio, decimal, geopoint, geoshape, select_multiple, file upload, notes
2. **Constraint validation** — Age constraint (18-99) triggers correctly with age=15, showing clear error message "Age must be between 18 and 99" with visual highlighting
3. **Live calculations** — parcel_area_m2 updates in real-time (5.5 ha → 55000 m²), shown both in the form ("CALCULATED: 55000 M²") and in the Calculations tab
4. **Form tree navigation** — Clicking tree items scrolls to the correct field and highlights it
5. **Inspector tab** — Shows comprehensive field metadata (name, type, xpath, label, hint, required)
6. **Search + filter** — Variables tab search ("parcel") and Non-empty filter work correctly together
7. **Geo widgets** — Both geopoint (single point with lat/lon/alt/accuracy) and geoshape (polygon with KML export) render with OpenStreetMap tiles
8. **XLSForm tab** — Clean spreadsheet view showing all columns (Type, Name, Label, Relevant, Constraint, Calculation)
9. **Warnings** — Correctly surfaces pyxform warnings (max-pixels parameter recommendation)
10. **No JS errors** — Zero console errors during the entire test session

---

## Console Health Summary

- **Errors:** 0
- **Warnings:** 1 (XSLTProcessor deprecation — browser-level, from enketo-core)
- **Verdict:** Clean console. No application-level errors detected across all interactions.
