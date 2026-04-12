# QA Report: XLSForm Debugger v3.1

| Field | Value |
|-------|-------|
| **URL** | http://localhost:5173 |
| **Date** | 2026-03-15 |
| **Duration** | ~10 minutes |
| **Mode** | Full |
| **Framework** | React SPA (Vite + TypeScript) |
| **Pages visited** | 1 (SPA with 4 tabs) |
| **Screenshots** | 14 |
| **Test file** | field_survey.xlsx |

---

## Health Score: 78/100

| Category | Weight | Score | Notes |
|----------|--------|-------|-------|
| Console | 15% | 100 | 0 JS errors, 1 deprecation warning (XSLTProcessor from enketo-core — expected) |
| Links | 10% | 100 | No broken links |
| Visual | 10% | 77 | Tab label text bleed, NaN display issue |
| Functional | 20% | 70 | Calc shows NaN when source empty, missing 5th tab (Expressions) |
| UX | 15% | 70 | Mobile layout broken, detail panel stale after field change |
| Performance | 10% | 100 | 157ms total load — excellent |
| Content | 5% | 92 | Minor: truncated text in sidebar |
| Accessibility | 15% | 70 | No ARIA roles on tabs, no keyboard trap management in detail panel |

**Weighted score: 78/100** (+4 from previous score of 74)

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 2 |
| Medium | 4 |
| Low | 2 |

---

## Top 3 Things to Fix

1. **ISSUE-001** — Values tab button label shows leaked field name ("land_type" appended)
2. **ISSUE-002** — parcel_area_m2 calc displays "NaN" in red when source field is empty
3. **ISSUE-003** — Mobile layout is broken — sidebar truncated, debug panel overlaps form

---

## Issues

### ISSUE-001: Tab button text includes leaked field name
**Severity:** HIGH | **Category:** Visual / Functional

The Values tab button renders as `Values 12 land_type` instead of just `Values 12`. The last-selected field name in the detail panel bleeds into the tab button text.

**Repro:**
1. Upload field_survey.xlsx
2. Click Values tab
3. Click on any field row (e.g., land_type)
4. Observe tab button text includes the field name

**Evidence:** screenshots/form-filled.png, screenshots/values-tab-filled.png

---

### ISSUE-002: Calculated field shows "NaN" when source field is empty
**Severity:** HIGH | **Category:** Functional

`parcel_area_m2` (calc: `parcel_area * 10000`) displays "NaN" in red when `parcel_area` has no value. Should display "—" or empty instead. After filling parcel_area with 2.5, the value correctly updates to 25000 on the next polling cycle (~2s).

**Repro:**
1. Upload field_survey.xlsx
2. Look at Values tab → parcel_area_m2 shows "NaN" in red
3. Fill Parcel Area with 2.5 → wait 2-3s → updates to 25000

**Evidence:** screenshots/form-loaded.png (NaN visible), screenshots/parcel-area-after-wait.png (25000 after fix)

---

### ISSUE-003: Mobile layout completely broken
**Severity:** MEDIUM | **Category:** UX / Visual

At 375x812 viewport:
- Form Structure sidebar items truncated to 3-4 chars
- Debug panel overlaps the form area
- Detail panel text cut off ("land_t..." / "CURREN...")
- No responsive breakpoint handling

**Repro:**
1. Load app at 375x812 viewport
2. Upload a form
3. Observe overlapping panels

**Evidence:** screenshots/mobile-view.png

---

### ISSUE-004: Missing Expressions tab (5th tab)
**Severity:** MEDIUM | **Category:** Functional

Project memory documents 5 tabs: Values | Warnings | External | XLSForm | Expressions. Only 4 tabs are rendered — Expressions tab is missing from the UI.

**Evidence:** screenshots/form-loaded.png — only 4 tabs visible

---

### ISSUE-005: Detail panel shows stale field after tab switch
**Severity:** MEDIUM | **Category:** UX

After clicking on `land_type` in Values tab, switching to External or XLSForm tab, then back to Values — the detail panel for land_type is still open. The detail panel should either persist intentionally (with clear visual cue) or close on tab switch.

**Evidence:** screenshots/external-tab.png, screenshots/values-tab-filled.png

---

### ISSUE-006: No ARIA roles on tab buttons
**Severity:** MEDIUM | **Category:** Accessibility

Tab buttons (Values, Warnings, External, XLSForm) are plain `<button>` elements without `role="tab"`, `aria-selected`, or `aria-controls` attributes. Tab panel lacks `role="tabpanel"`.

**Evidence:** Observed via `snapshot -i` — tabs rendered as generic buttons

---

### ISSUE-007: Form Structure sidebar loses tree indentation on resize
**Severity:** LOW | **Category:** Visual

After viewport changes or certain interactions, the sidebar tree structure loses proper indentation for nested items like "Calculated: m²" under Parcel Information.

**Evidence:** screenshots/detail-closed.png

---

### ISSUE-008: XSLTProcessor deprecation warning from enketo-core
**Severity:** LOW | **Category:** Content

Console shows: "XSLTProcessor and XSLT Processing Instructions have been deprecated by all browsers." This originates from enketo-core's XForm processing. Not actionable in this app but may break in future browser versions.

**Evidence:** Console output check

---

## Console Health

- **JS Errors:** 0
- **Warnings:** 1 (XSLTProcessor deprecation from enketo-core — upstream dependency)
- **After interactions:** No new errors after form fill, tab switches, filter toggles

---

## Comparison to Previous Score (74 → 78)

| Area | Change | Detail |
|------|--------|--------|
| Form rendering | Stable | All fields render correctly, validation works |
| Calc display | Improved | Calcs now update via polling (was broken before) |
| Tab system | Regression | "land_type" text leaks into tab button |
| Filters | New/Working | Non-empty and Calcs-only filters work correctly |
| Search | New/Working | Field search filters correctly |
| Detail panel | Improved | Expand/collapse works, inline editor visible |
| Mobile | Unchanged | Still broken |

**Net: +4 points.** Core functionality improved (calc updates, filters, search), but new UI bugs introduced (tab label bleed). Mobile remains unaddressed.

---

## Regression: vs Baseline 2026-03-14 (74 → 78)

### Fixed Issues (from previous baseline)
| Previous ID | Title | Status |
|-------------|-------|--------|
| ISSUE-001 | Tab structure doesn't match v3.1 design spec | **FIXED** — 4 tabs now render correctly |
| ISSUE-008 | Drop zone upload requires precise targeting | **FIXED** — file input accepts upload cleanly |
| ISSUE-009 | Variables badge count includes non-fillable fields | **FIXED** — badge shows "12" consistently |

### Persisting Issues
| Previous ID | Title | Current ID |
|-------------|-------|------------|
| ISSUE-002 | Mobile layout completely broken | ISSUE-003 |
| ISSUE-003 | XSLTProcessor deprecation warning | ISSUE-008 |
| ISSUE-004 | parcel_area_m2 shows NaN before area is entered | ISSUE-002 |
| ISSUE-005 | Form tree lacks keyboard navigation and ARIA roles | ISSUE-006 |
| ISSUE-006 | No visible Expressions tab | ISSUE-004 |
| ISSUE-007 | Inspector tab label shows stale field name | ISSUE-001 (escalated to HIGH — now more prominent) |

### New Issues
| Current ID | Title | Severity |
|------------|-------|----------|
| ISSUE-005 | Detail panel shows stale field after tab switch | MEDIUM |
| ISSUE-007 | Form Structure sidebar loses tree indentation on resize | LOW |

### Category Score Delta
| Category | Previous | Current | Delta |
|----------|----------|---------|-------|
| Console | 100 | 100 | — |
| Links | 100 | 100 | — |
| Visual | 77 | 77 | — |
| Functional | 85 | 70 | -15 |
| UX | 77 | 70 | -7 |
| Performance | 92 | 100 | +8 |
| Content | 97 | 92 | -5 |
| Accessibility | 55 | 70 | +15 |

**Overall: 74 → 78 (+4).** Accessibility improved significantly. Performance now perfect. Functional and UX scores dipped due to persisting NaN display and new detail panel stale state issue.
