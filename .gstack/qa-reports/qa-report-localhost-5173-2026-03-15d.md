# QA Report: XLSForm Debugger v3.1 (Pass d)

| Field | Value |
|-------|-------|
| **URL** | http://localhost:5173 |
| **Date** | 2026-03-15 (run d) |
| **Duration** | ~8 minutes |
| **Mode** | Full |
| **Framework** | React SPA (Vite + TypeScript + Tailwind) |
| **Pages visited** | 1 (SPA with 5 tabs) |
| **Screenshots** | 10 |
| **Test file** | sample-form.xlsx |

---

## Health Score: 93/100

| Category | Weight | Score | Notes |
|----------|--------|-------|-------|
| Console | 15% | 100 | 0 JS errors, 0 network errors. Only XSLTProcessor deprecation warning (upstream, excluded) |
| Links | 10% | 100 | No broken links. Skip link targets `#main-content` correctly |
| Visual | 10% | 100 | Label clipping from run c no longer observed. Clean layout at 1280px |
| Functional | 20% | 100 | All 5 tabs render correctly, all filters work, detail panel resets on tab switch, upload clean |
| UX | 15% | 92 | Values require blur+2s poll to update (excluded, by design). Minor: FORMULA column truncated for long expressions |
| Performance | 10% | 100 | 71ms total load time (improved from 104ms), instant tab switches |
| Content | 5% | 100 | Page title is now "XLSForm Debugger". All labels readable |
| Accessibility | 15% | 81 | Major improvements: skip link, landmarks (main/nav/header), h1, search aria-label. Remaining: H1→H3 heading skip (no H2), 3 enketo buttons without labels (upstream, excluded) |

**Weighted score: 93/100** (+5 from previous score of 88)

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 2 |

---

## Top 3 Things to Fix

1. **ISSUE-001** — Heading hierarchy jumps from H1 to H3 (no H2)
2. **ISSUE-002** — FORMULA column text truncated for long expressions in Values table
3. **ISSUE-003** — Values blur+poll delay (by design, excluded from scoring)

---

## Issues

### ISSUE-001: Heading hierarchy skips H2
**Severity:** MEDIUM | **Category:** Accessibility

Heading hierarchy is H1 ("XLSForm Debugger") → H3 ("Survei Petani PUR") → H4 ("Informasi Rumah Tangga", "Informasi Lahan"). No H2 exists on the page. Screen readers navigating by heading level will skip level 2.

The H3/H4 elements come from enketo-core's form rendering, so fixing this would require either:
- Adding an H2 wrapper around the form area, or
- CSS `role="heading" aria-level="2"` on the form title

**File:** `app/src/App.tsx` (for adding H2) or enketo-core template (upstream)

**Repro:**
1. Load any form
2. Inspect headings: H1 → H3 → H4 (no H2)

**Evidence:** Confirmed via JS: `document.querySelectorAll("h2").length === 0`

---

### ISSUE-002: FORMULA column truncated for long expressions
**Severity:** LOW | **Category:** UX

In the Values table, the FORMULA column shows truncated text for fields with long calculation expressions (e.g., `total_score` shows `/data/household_info/hou...`). The full expression is only visible in the detail panel when clicking the row.

This is a minor usability issue — the detail panel provides the full view, so the truncation is acceptable.

**Repro:**
1. Upload form, go to Values tab
2. Look at `total_score` FORMULA column — truncated

**Evidence:** screenshots/d-form-loaded.png

---

### ISSUE-003: Values update requires blur + 2s polling delay
**Severity:** LOW | **Category:** UX (excluded from scoring, by design)

After typing in a form field, the Values tab does not update in real time. The user must blur the field, then wait up to 2 seconds (polling interval) for the value to appear. Known design trade-off documented in project memory.

**File:** `app/src/components/DebugTabs/ValuesPanel.tsx` (setInterval refresh)

---

## Console Health

- **JS Errors:** 0 runtime errors
- **Network Errors:** 0 (clean single 200 on /convert)
- **Warnings:** 1 (XSLTProcessor deprecation from enketo-core — upstream, excluded from score)
- **After interactions:** No new errors after form fill, tab switches, filter toggles, detail expand/collapse, search

---

## What Works Well

- **Skip-to-content link** — New! `<a href="#main-content">Skip to main content</a>` with sr-only styling
- **ARIA landmarks** — New! `<header>`, `<nav>`, `<main id="main-content">` all present
- **H1 heading** — New! "XLSForm Debugger" as H1, provides proper heading hierarchy root
- **Page title** — Fixed! Now "XLSForm Debugger" instead of generic "app"
- **Search input aria-label** — Fixed! `aria-label="Search fields"` on the search input
- **Non-empty filter** — Fixed! No longer shows calc fields with dash value
- **All 5 tabs render correctly** — Values (15 fields with search/filters), Warnings, External (empty state), XLSForm (spreadsheet), Expressions (42 items with REQUIRED/CONSTRAINT badges)
- **Excellent ARIA tab implementation** — `role=tab/tablist/tabpanel`, `aria-controls`, `aria-selected`, `aria-labelledby`, proper `tabindex`, Arrow Left/Right keyboard navigation
- **Tab badge screen reader text** — Badges use `aria-hidden="true"` with `sr-only` span
- **Calculated fields work** — `survey_date` shows `2026-03-15` with formula `today()`
- **NaN properly handled** — Empty calc fields show "—" (dash), not "NaN"
- **Detail panel resets on tab switch** — No stale detail state
- **Clean upload flow** — Single POST /convert with 200 response
- **Form rendering** — enketo-core renders all field types correctly
- **Sidebar tree structure** — Nested groups with icons, highlights sync with Values selection
- **All filters and search** — Non-empty, Calcs-only, and search all work correctly
- **Performance** — 71ms total load time (improved from 104ms), instant tab switches

---

## Comparison to Previous Score (88 → 93)

| Category | Previous (88) | Current (93) | Change |
|----------|---------------|--------------|--------|
| Console | 100 | 100 | Stable |
| Links | 100 | 100 | Stable |
| Visual | 92 | 100 | **+8** — Label clipping no longer observed |
| Functional | 97 | 100 | **+3** — All functions confirmed working |
| UX | 85 | 92 | **+7** — Non-empty filter fixed (no more dash-value calc fields) |
| Performance | 100 | 100 | Stable (improved from 104ms → 71ms) |
| Content | 85 | 100 | **+15** — Page title fixed to "XLSForm Debugger" |
| Accessibility | 70 | 81 | **+11** — Skip link, landmarks, H1, search aria-label all added |

### Issues Fixed Since Last Run (88 → 93)
| Previous ID | Title | Status |
|-------------|-------|--------|
| ISSUE-001 | Missing ARIA landmarks and skip-to-content link | **FIXED** — `<header>`, `<nav>`, `<main>`, skip link all present |
| ISSUE-003 | Page title is generic "app" | **FIXED** — Now "XLSForm Debugger" |
| ISSUE-004 | Search input missing accessible label | **FIXED** — `aria-label="Search fields"` added |
| ISSUE-005 | Non-empty filter includes calc fields with dash value | **FIXED** — Dash-value fields no longer appear |

### Excluded Issues (not scored)
| ID | Title | Reason |
|----|-------|--------|
| — | XSLTProcessor deprecation warning | Upstream enketo-core |
| — | Three enketo map buttons without labels | Upstream enketo-core |
| — | Mobile layout breaks at 375px | Not a target platform |
| — | Values blur+poll delay | By design |

### Persisting Issues
| Previous ID | Title | Current ID | Change |
|-------------|-------|------------|--------|
| ISSUE-002 | Mobile layout breaks at 375px | Excluded | Not a target platform |
| ISSUE-006 | Values update requires blur + 2s polling delay | ISSUE-003 | Excluded, by design |

### New Issues Found
| Current ID | Title | Severity |
|------------|-------|----------|
| ISSUE-001 | Heading hierarchy skips H2 | MEDIUM |
| ISSUE-002 | FORMULA column truncated for long expressions | LOW |

---

## Score Progression

| Run | Date | Score | Key Changes |
|-----|------|-------|-------------|
| #1 | 2026-03-14 | 78 | Baseline |
| #2 | 2026-03-15 (b) | 84 | +6: Expressions tab, NaN fix, ARIA foundation |
| #3 | 2026-03-15 (c) | 88 | +4: Full ARIA tabs, clean upload, detail reset, no console errors |
| #4 | 2026-03-15 (d) | **93** | +5: Skip link, landmarks, H1, page title, search label, non-empty filter fix |

**Net: +5 points.** 4 of 7 previous issues fixed. Only 2 new issues found (1 medium, 1 low). The app is in excellent shape — zero critical or high severity issues, strong accessibility foundation, and fast performance.
