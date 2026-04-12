# QA Report: XLSForm Debugger v3.1 (Final Pass)

| Field | Value |
|-------|-------|
| **URL** | http://localhost:5173 |
| **Date** | 2026-03-15 (run c) |
| **Duration** | ~10 minutes |
| **Mode** | Full |
| **Framework** | React SPA (Vite + TypeScript + Tailwind) |
| **Pages visited** | 1 (SPA with 5 tabs) |
| **Screenshots** | 12 |
| **Test file** | sample-form.xlsx |

---

## Health Score: 88/100

| Category | Weight | Score | Notes |
|----------|--------|-------|-------|
| Console | 15% | 100 | 0 JS errors, 0 network errors. Only XSLTProcessor deprecation warning (upstream, excluded per instructions) |
| Links | 10% | 100 | No broken links |
| Visual | 10% | 92 | Minor: label text clipped behind form field annotations on desktop |
| Functional | 20% | 97 | All 5 tabs render correctly, filters work, detail panel resets on tab switch, upload clean (single 200) |
| UX | 15% | 85 | Values require blur+2s poll to update; Non-empty filter includes calc fields with empty values |
| Performance | 10% | 100 | 104ms total load time, no runtime JS errors, responsive interactions |
| Content | 5% | 85 | Page title is generic "app" (should be "XLSForm Debugger"); all labels readable |
| Accessibility | 15% | 70 | ARIA tabs excellent (controls, labelledby, arrow keys, sr-only badges). Missing: landmarks, skip link, h1, search input label, 3 enketo buttons without labels |

**Weighted score: 88/100** (+4 from previous score of 84)

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 4 |
| Low | 3 |

---

## Top 3 Things to Fix

1. **ISSUE-001** — No ARIA landmark roles (`<main>`, `<nav>`, `<header>`) and missing skip-to-content link
2. **ISSUE-002** — Mobile layout breaks at 375px — tabs overflow, sidebar crushed, debug panel unusable
3. **ISSUE-003** — Page title is generic "app" instead of descriptive "XLSForm Debugger"

---

## Issues

### ISSUE-001: Missing ARIA landmarks and skip-to-content link
**Severity:** MEDIUM | **Category:** Accessibility

Page has no `<main>`, `<nav>`, or `<header>` landmark elements. No skip-to-content link. Heading hierarchy starts at `<h3>` (form title) with no `<h1>`. Screen reader users cannot navigate by landmark regions.

**File:** `app/src/App.tsx`

**Repro:**
1. Load any form
2. Inspect accessibility tree — no landmark roles found
3. Check headings: h3 "Survei Petani PUR", h4 "Informasi Rumah Tangga", h4 "Informasi Lahan" — no h1 or h2

**Evidence:** Accessibility tree dump shows `text`, `separator`, `heading [level=3]` — no `main`, `nav`, or `banner` regions

---

### ISSUE-002: Mobile layout breaks at 375px viewport
**Severity:** MEDIUM | **Category:** Visual / UX

At 375px (iPhone SE/standard mobile):
- Form Structure sidebar is crushed to ~50px, all field names truncated to "Nama...", "Umur..."
- Debug tab labels overflow — "External" becomes "Exte...", Expressions tab is partially off-screen
- "Calcs only" checkbox label is cut off
- FORMULA column in Values table is completely hidden (no horizontal scroll)
- Large empty vertical gap between form sections

The app is a developer tool and desktop-primary, but basic mobile usability would be beneficial.

**Repro:**
1. Set viewport to 375x812
2. Observe sidebar, tab bar, and Values table

**Evidence:** screenshots/mobile-375.png

---

### ISSUE-003: Page title is generic "app"
**Severity:** MEDIUM | **Category:** Content

`document.title` is "app" (default Vite template). Should be "XLSForm Debugger" for bookmarks, browser tabs, and screen readers.

**File:** `app/index.html` (or `app/src/main.tsx`)

**Repro:**
1. Check browser tab — shows "app"

---

### ISSUE-004: Search input field missing accessible label
**Severity:** MEDIUM | **Category:** Accessibility

The search field in the Values/XLSForm tabs has `placeholder="Search fields..."` but no associated `<label>`, `aria-label`, or `aria-labelledby`. Screen readers may announce it as just "edit text".

**File:** `app/src/components/DebugTabs/ValuesPanel.tsx`

**Repro:**
1. Inspect search input — no label element or aria-label attribute
2. Only has `placeholder` attribute

---

### ISSUE-005: Non-empty filter includes calc fields with dash value
**Severity:** LOW | **Category:** UX

When "Non-empty" checkbox is checked, `total_score` (a calc field) appears in the filtered list with value "—" (dash). The field technically exists in the model but has no computed value yet. Users may expect "Non-empty" to only show fields with actual values.

**Repro:**
1. Upload form (don't fill all fields)
2. Check "Non-empty" filter
3. `total_score` appears with value "—"

**Evidence:** screenshots/values-nonempty-filter.png

---

### ISSUE-006: Values update requires blur + 2s polling delay
**Severity:** LOW | **Category:** UX

After typing in a form field, the Values tab does not update in real time. The user must blur the field, then wait up to 2 seconds (polling interval) for the value to appear. Known design trade-off.

**File:** `app/src/components/DebugTabs/ValuesPanel.tsx` (setInterval refresh)

---

### ISSUE-007: Three enketo-core map buttons missing accessible labels
**Severity:** LOW | **Category:** Accessibility (upstream)

Three buttons rendered by enketo-core for geopoint/geoshape fields have no accessible name — `hide-map-btn`, `geodetect`, and `search-btn`. These are upstream enketo-core elements, not directly fixable in this app.

---

## Console Health

- **JS Errors:** 0 runtime errors
- **Network Errors:** 0 (previous double-400 on /convert is fixed — single 200 now)
- **Warnings:** 1 (XSLTProcessor deprecation from enketo-core — upstream, excluded from score)
- **After interactions:** No new errors after form fill, tab switches, filter toggles, detail expand/collapse

---

## What Works Well

- **All 5 tabs render correctly** — Values (15 fields with search/filters), Warnings (clean check), External (empty state message), XLSForm (spreadsheet with all columns), Expressions (42 items with REQUIRED/CONSTRAINT badges)
- **Excellent ARIA tab implementation** — `role=tab/tablist/tabpanel`, `aria-controls`, `aria-selected`, `aria-labelledby`, proper `tabindex` management, Arrow Left/Right keyboard navigation
- **Tab badge screen reader text** — Badges use `aria-hidden="true"` with `sr-only` span ("15 items") for proper announcement
- **Calculated fields work** — `survey_date` shows `2026-03-15` with formula `today()`
- **NaN properly handled** — Empty calc fields show "—" (dash), not "NaN"
- **Detail panel resets on tab switch** — No more stale detail state
- **Clean upload flow** — Single POST /convert with 200 response, no double-fire
- **Form rendering** — enketo-core renders all field types correctly (text, integer, radio, date, geopoint)
- **Sidebar tree structure** — Properly nested groups with icons, highlights sync with Values selection
- **Non-empty and Calcs-only filters** — Work correctly to narrow field list
- **Search** — Filters fields by name in real time
- **Performance** — 104ms total load time, instant tab switches

---

## Comparison to Previous Score (84 → 88)

| Category | Previous (84) | Current (88) | Change |
|----------|---------------|--------------|--------|
| Console | 85 | 100 | **+15** — Double 400 errors on /convert fixed |
| Links | 100 | 100 | Stable |
| Visual | 92 | 92 | Stable |
| Functional | 92 | 97 | **+5** — Detail panel reset fixed, clean upload |
| UX | 77 | 85 | **+8** — Detail panel no longer persists across tab switches |
| Performance | 100 | 100 | Stable |
| Content | 100 | 85 | **-15** — Deeper check found generic "app" page title |
| Accessibility | 62 | 70 | **+8** — ARIA tabs fully implemented (controls, labelledby, keyboard, sr-only badges) |

### Issues Fixed Since Last Run (84 → 88)
| Previous ID | Title | Status |
|-------------|-------|--------|
| ISSUE-001 | Incomplete ARIA tab pattern (controls, labelledby, keyboard) | **FIXED** — Full ARIA tab implementation now in place |
| ISSUE-002 | Detail panel persists across tab switches | **FIXED** — Detail closes on tab switch |
| ISSUE-003 | Tab badge text concatenated in accessible name | **FIXED** — Badge has aria-hidden + sr-only span |
| ISSUE-004 | Two 400 errors on /convert during upload | **FIXED** — Single clean 200 now |

### Persisting Issues
| Previous ID | Title | Current ID |
|-------------|-------|------------|
| ISSUE-005 | Values update requires blur + 2s polling delay | ISSUE-006 |
| ISSUE-006 | XSLTProcessor deprecation warning (upstream) | Excluded per instructions |

### New Issues Found
| Current ID | Title | Severity |
|------------|-------|----------|
| ISSUE-001 | Missing ARIA landmarks and skip-to-content link | MEDIUM |
| ISSUE-002 | Mobile layout breaks at 375px | MEDIUM |
| ISSUE-003 | Page title is generic "app" | MEDIUM |
| ISSUE-004 | Search input missing accessible label | MEDIUM |
| ISSUE-005 | Non-empty filter includes calc fields with dash value | LOW |
| ISSUE-007 | Three enketo-core buttons missing labels (upstream) | LOW |

---

## Score Progression

| Run | Date | Score | Key Changes |
|-----|------|-------|-------------|
| #1 | 2026-03-14 | 78 | Baseline |
| #2 | 2026-03-15 (b) | 84 | +6: Expressions tab, NaN fix, ARIA foundation |
| #3 | 2026-03-15 (c) | **88** | +4: Full ARIA tabs, clean upload, detail reset, no console errors |

**Net: +4 points.** All 4 previous issues fixed. 6 new issues found (mostly accessibility depth and mobile), none critical or high severity. The app is in solid shape for a developer tool.
