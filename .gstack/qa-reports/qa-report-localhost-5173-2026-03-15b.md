# QA Report: XLSForm Debugger v3.1 (Re-run)

| Field | Value |
|-------|-------|
| **URL** | http://localhost:5173 |
| **Date** | 2026-03-15 (re-run) |
| **Duration** | ~12 minutes |
| **Mode** | Full |
| **Framework** | React SPA (Vite + TypeScript) |
| **Pages visited** | 1 (SPA with 5 tabs) |
| **Screenshots** | 15 |
| **Test file** | sample-form.xlsx |

---

## Health Score: 84/100

| Category | Weight | Score | Notes |
|----------|--------|-------|-------|
| Console | 15% | 85 | 2 x 400 errors on /convert during upload (double-fire), 1 XSLT deprecation warning (upstream) |
| Links | 10% | 100 | No broken links |
| Visual | 10% | 92 | Sidebar indentation stable, tab badge text concatenated with label |
| Functional | 20% | 92 | All 5 tabs render, calcs work (today()=2026-03-15), values update after blur+poll, expressions show 42 items |
| UX | 15% | 77 | Detail panel persists across tab switches, values require blur+2s poll to update |
| Performance | 10% | 100 | Fast load, no JS runtime errors |
| Content | 5% | 100 | All labels readable, no truncation |
| Accessibility | 15% | 62 | Has role=tab/tablist/tabpanel + aria-selected, but missing aria-controls, aria-labelledby, tabindex=-1 on inactive tabs, arrow key navigation |

**Weighted score: 84/100** (+6 from previous score of 78)

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 1 |
| Medium | 3 |
| Low | 2 |

---

## Top 3 Things to Fix

1. **ISSUE-001** — Tabs missing `aria-controls`, `id`, `aria-labelledby`, and arrow-key navigation (accessibility)
2. **ISSUE-002** — Detail panel does not reset/close when switching debug tabs
3. **ISSUE-003** — Tab badge text concatenates with label for screen readers ("Values15" instead of "Values 15")

---

## Issues

### ISSUE-001: Incomplete ARIA tab pattern
**Severity:** HIGH | **Category:** Accessibility

Tabs have `role="tab"`, `role="tablist"`, `role="tabpanel"`, and `aria-selected` — good foundation. However:
- No `aria-controls` on any tab (should point to tabpanel id)
- No `id` on tabs (needed for `aria-labelledby` on tabpanel)
- Tabpanel has no `aria-labelledby`
- Inactive tabs have `tabindex=0` instead of `tabindex=-1`
- Arrow Left/Right keyboard navigation between tabs does not work

**File:** `app/src/components/DebugPanel.tsx`

**Repro:**
1. Load form
2. Inspect tabs in accessibility tree — `aria-controls` is null on all 5 tabs
3. Press Arrow Right while focused on Values tab — focus does not move

**Evidence:** screenshots/current-state.png

---

### ISSUE-002: Detail panel persists across tab switches
**Severity:** MEDIUM | **Category:** UX

When a field is expanded in the Values tab detail panel, switching to another tab (Warnings, External, etc.) and returning to Values keeps the detail panel open. Expected: detail should close on tab switch to avoid stale context.

**File:** `app/src/components/DebugTabs/ValuesPanel.tsx` (selectedField state not reset on tab change)

**Repro:**
1. Upload sample-form.xlsx
2. Click on any field row in Values tab to expand detail
3. Switch to Warnings tab, then back to Values
4. Detail panel is still open

**Evidence:** screenshots/detail-reset-test.png

---

### ISSUE-003: Tab badge text concatenated with label in accessible name
**Severity:** MEDIUM | **Category:** Accessibility

Tab text content reads "Values15" and "Expressions42" as single strings. Screen readers will announce these as "Values fifteen" or "Expressions forty-two" without separation. The badge span should have `aria-label` or be hidden with `aria-hidden` + a separate `aria-label` on the tab.

**File:** `app/src/components/DebugPanel.tsx`

**Repro:**
1. Load form
2. Inspect tab text content: `document.querySelectorAll("[role=tab]")` returns `"Values15"`, `"Expressions42"`

**Evidence:** screenshots/after-upload.png — badge numbers visually separated but textContent is joined

---

### ISSUE-004: Two 400 errors on /convert during upload
**Severity:** MEDIUM | **Category:** Performance

Two `400 Bad Request` errors fire against `POST /convert` during file upload before the successful conversion. This appears to be a double-dispatch of the change event or an initial empty-body request.

**File:** `app/src/components/FileUploadBar.tsx` (upload handler), `api/main.py` (/convert endpoint)

**Repro:**
1. Upload sample-form.xlsx via drop zone
2. Check console — 2x "Failed to load resource: 400"
3. Form still loads successfully after

**Evidence:** Console output, `performance.getEntriesByType("resource")` confirms both 400s target `/convert`

---

### ISSUE-005: Values update requires blur + 2s polling delay
**Severity:** LOW | **Category:** UX

After typing in a form field, the Values tab does not update in real time. The user must blur the field, then wait up to 2 seconds (polling interval) for the value to appear. This is a known design trade-off (setInterval refresh) but adds perceptible lag.

**Repro:**
1. Upload form, switch to Values tab
2. Type "Test User" in Nama Responden field
3. Values panel still shows "—" until Tab is pressed and ~2s passes

**Evidence:** screenshots/values-after-input.png (still —), screenshots/values-after-blur.png (shows "Test User")

---

### ISSUE-006: XSLT deprecation warning from enketo-core
**Severity:** LOW | **Category:** Content (upstream)

Console shows: "XSLTProcessor and XSLT Processing Instructions have been deprecated by all browsers." Originates from enketo-core's XForm transformation. Not actionable in this app but flagged for awareness — may break in future Chrome versions.

**Evidence:** Console output

---

## Console Health

- **JS Errors:** 0 runtime errors
- **Network Errors:** 2 x 400 on `/convert` during upload (form still loads)
- **Warnings:** 1 (XSLTProcessor deprecation from enketo-core — upstream)
- **After interactions:** No new errors after form fill, tab switches, detail expand/collapse

---

## What Works Well

- **All 5 tabs render correctly** — Values (15 fields), Warnings (clean), External (empty state), XLSForm (spreadsheet), Expressions (42 items with color-coded badges)
- **Calculated fields work** — `survey_date` shows `2026-03-15` with formula `today()`, `total_score` shows formula `/data/household_info/household_size * 10 + ...`
- **NaN handled correctly** — Empty calc fields show `—` (dash), not "NaN" (previously a HIGH issue, now fixed)
- **Sidebar tree indentation is stable** — Groups properly nested, icons aligned
- **Detail panel expand works** — Shows field name, xpath, current value, type dropdown, required checkbox, Save button
- **Sidebar highlights synced** — Clicking a field in Values highlights corresponding tree item in blue
- **Tab labels clean visually** — Badges are separate styled spans (though accessible text is concatenated)
- **Form rendering** — enketo-core renders all field types correctly (text, integer, radio, date)

---

## Comparison to Previous Score (78 → 84)

| Area | Previous (78) | Current (84) | Change |
|------|---------------|--------------|--------|
| Functional | 70 | 92 | **+22** — Expressions tab now renders (was missing), NaN fixed |
| Visual | 77 | 92 | **+15** — Tab label text bleed fixed, sidebar stable |
| UX | 70 | 77 | **+7** — Detail panel works better, but still doesn't reset on tab switch |
| Accessibility | 70 | 62 | **-8** — Deeper audit found more ARIA gaps (controls, labelledby, keyboard) |
| Console | 100 | 85 | **-15** — 2x 400 errors during upload now caught |
| Performance | 100 | 100 | Stable |
| Content | 92 | 100 | **+8** — No truncation issues |
| Links | 100 | 100 | Stable |

### Issues Fixed Since Last Run
| Previous ID | Title | Status |
|-------------|-------|--------|
| ISSUE-001 | Tab button text includes leaked field name ("land_type") | **FIXED** — Tab labels now clean |
| ISSUE-002 | Calculated field shows "NaN" when source empty | **FIXED** — Now shows "—" dash |
| ISSUE-004 | Missing Expressions tab (5th tab) | **FIXED** — Expressions tab renders with 42 items |
| ISSUE-006 | No ARIA roles on tab buttons | **PARTIAL FIX** — role=tab, tablist, tabpanel now present; still missing controls/labelledby |
| ISSUE-007 | Sidebar loses tree indentation on resize | **FIXED** — Indentation stable |

### Persisting Issues
| Previous ID | Title | Current ID |
|-------------|-------|------------|
| ISSUE-005 | Detail panel shows stale field after tab switch | ISSUE-002 |
| ISSUE-008 | XSLTProcessor deprecation warning | ISSUE-006 |

### New Issues
| Current ID | Title | Severity |
|------------|-------|----------|
| ISSUE-001 | Incomplete ARIA tab pattern (controls, labelledby, keyboard) | HIGH |
| ISSUE-003 | Tab badge text concatenated in accessible name | MEDIUM |
| ISSUE-004 | Two 400 errors on /convert during upload | MEDIUM |
| ISSUE-005 | Values update requires blur + 2s polling delay | LOW |

**Net: +6 points.** Major functional improvements (Expressions tab, NaN fix, tab label fix). Accessibility foundation is in place but needs completion. The 400 errors during upload are new findings from deeper network inspection.
