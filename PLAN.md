# XLSForm Debugger — Next Feature Plan

## Goal
Wire the already-built `ValuesPanel` into `DebugPanel`, replacing the three separate tabs
(Variables, Calculations, Inspector) with a single unified "Values" tab that has:
- Merged variable list with live values
- Click-to-expand detail (XPath, relevant eval, constraint eval, depends-on, used-by)
- Inline field editing (label, hint, relevant, constraint, calculation, required)
- Apply button that re-converts and re-renders the form live

## Current State

### Tab structure (running today)
```
DebugPanel
  ├── Variables tab  → VariableInspector.tsx (live values, click-to-edit value)
  ├── Calculations tab → CalculationsPanel.tsx (calculate fields + formulas)
  ├── Inspector tab  → QuestionInspector.tsx (click form field → metadata)
  ├── Warnings tab   → WarningsPanel.tsx ✅
  ├── External tab   → ExternalDataPanel.tsx ✅
  └── XLSForm tab    → XLSFormSource.tsx ✅ (read-only source viewer)
```

### Already built but unwired (v3.1 commit, Mar 10)
```
app/src/components/DebugTabs/
  ├── ValuesPanel.tsx       826 lines — merged Variables+Calculations+Inspector+inline editor
  ├── ValuesTable.tsx       371 lines — table subcomponent
  └── XLSFormEditor.tsx     384 lines — structure editor (add/delete/reorder rows)

app/src/components/
  └── FieldInspector.tsx    646 lines — field detail panel (used by ValuesPanel)
```

### ValuesPanel props interface
```ts
interface ValuesPanelProps {
  readonly xlsRows: XlsRows;                                          // ← NEW: not in App.tsx yet
  readonly onUpdateField: (fieldName: string, updates: Record<string, string>) => void;  // ← NEW
  readonly onApplyEdits: () => Promise<void>;                         // ← NEW
}

interface XlsRows {   // already in types/index.ts
  readonly survey: readonly Record<string, string>[];
  readonly choices: readonly Record<string, string>[];
  readonly settings: readonly Record<string, string>[];
}
```

### What's missing to wire it up

**1. API: `/convert-json` endpoint** (new endpoint needed)
- Accepts edited `xlsRows` (JSON body) → returns `xform_xml`, `warnings`, `external_data`
- Allows live re-render after inline field edits without re-uploading the file
- Alternative: modify `/convert` to also return raw sheet rows as JSON alongside XML

**2. App.tsx state**
- Add `xlsRows` state (`useState<XlsRows | null>`)
- Populate it when a form is uploaded (from API response)
- Add `handleUpdateField(fieldName, updates)` callback
- Add `handleApplyCurrentEdits()` callback (calls `/convert-json`)

**3. FileUploadBar.tsx**
- Update `onConvert` callback signature to also pass `xlsRows` from API response
- OR: add separate `onXlsRowsLoaded` callback

**4. DebugPanel.tsx**
- Add `xlsRows`, `onUpdateField`, `onApplyEdits` to props
- Replace "variables" + "calculations" + "question" tabs with single "values" tab
- Render `ValuesPanel` for "values" tab

**5. API main.py**
- `/convert` endpoint: also return `survey`, `choices`, `settings` rows from the xlsxfile
- OR add `/convert-json` that accepts JSON xlsRows and returns xform_xml

## Files to change

| File | Change | Lines affected |
|------|--------|----------------|
| `api/main.py` | Return survey/choices/settings rows from `/convert` | ~10 lines |
| `app/src/App.tsx` | Add xlsRows state + 2 callbacks | ~30 lines |
| `app/src/components/FileUploadBar.tsx` | Pass xlsRows to onConvert | ~5 lines |
| `app/src/components/DebugPanel.tsx` | Add props, swap to ValuesPanel tab | ~20 lines |

No new files needed. Total diff: ~65 lines across 4 files.

## Data flow (after change)

```
User uploads .xlsx
      │
      ▼
FileUploadBar → POST /convert
      │
      ▼
API returns {
  xform_xml,     → FormRenderer (renders form)
  warnings,      → WarningsPanel
  external_data, → ExternalDataPanel
  survey,        ← NEW: raw rows
  choices,       ← NEW: raw rows
  settings,      ← NEW: raw rows
}
      │
      ▼
App.tsx stores xlsRows in state
      │
      ├── DebugPanel → ValuesPanel
      │       ├── displays merged variable list
      │       └── on "Apply" → POST /convert-json with modified xlsRows
      │                  │
      │                  ▼
      │           API returns new xform_xml → form re-renders live
      │
      └── (XLSFormEditor tab — future, uses same xlsRows)
```

## What NOT to change
- WarningsPanel, ExternalDataPanel, XLSFormSource — leave untouched
- ValuesPanel.tsx, ValuesTable.tsx, FieldInspector.tsx — already built, don't rewrite
- FormRenderer.tsx — no changes needed
- enketo-core integration — no changes needed

## Out of scope (defer)
- XLSFormEditor tab (add/delete/reorder rows) — needs more API work, separate task
- Expressions tab — separate task
- Offline/PWA support
- CSV data editor

## Success criteria
1. "Values" tab shows merged list of all variables with live values
2. Click a row → expands to show XPath, relevant eval (✅/🚫), constraint eval, depends-on, used-by chips
3. Inline edit (label, constraint, etc.) → click Apply → form re-renders with new XForm
4. Old Variable/Calculations/Inspector tabs are gone
5. Build passes, no TypeScript errors
6. Geo, Warnings, External, XLSForm tabs unaffected
