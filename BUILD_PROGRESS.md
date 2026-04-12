# XLSForm Debugger v3.1 — Build Progress

## Phase 0: Audit — COMPLETE

### Current Tab Structure (DebugPanel.tsx)
7 tabs: Variables | Calculations | Inspector | Warnings | External | XLSForm | Expressions

### Component Analysis

**VariableInspector.tsx (161 lines)**
- Props: `variables: FormVariable[]` (from formState)
- Table: field, xpath, value (click-to-edit via EditableValue)
- Features: search, non-empty filter, override badge (orange), NaN red
- Local state: overrides Set<string>, search, nonEmptyOnly
- Sets values via `window.__enketoForm.model.node(xpath).setVal()`

**CalculationsPanel.tsx (219 lines)**
- Props: `xformXml: string | null`
- Parses xformXml -> FieldMeta[] (calculate fields only)
- Live polling: `setInterval(refresh, 2000)` + dataupdate event listener
- Table: name, label, formula, live value (click-to-edit via ValueCell)
- Local state: overrides Record<string, string>, search, liveValues
- Copy-pasted EditableValue/ValueCell pattern from VariableInspector

**QuestionInspector.tsx (390 lines)**
- Props: selectedQuestion, onQuestionSelect, xformXml, variables
- Click handler: listens for clicks on `.question` DOM elements -> extracts name
- Shows for selected field: header, current value, metadata table, expressions with eval badges, choices, depends-on chips (with hidden ! indicator), used-by chips
- Key helpers: isFieldHidden(), findField(), parseChoices(), parseChoicesForField()
- Uses: evaluateRelevant, evaluateConstraint from expressionEvaluator

**XLSFormEditor.tsx (384 lines)** — UNCHANGED in v3.1
- Props: surveyRows, choicesRows, settingsRows, onApply

### State Flow
- `xlsRows` lives in App.tsx (source of truth)
- XlsRows interface was duplicated in App.tsx and DebugPanel.tsx -> **extracted to types/index.ts**
- FormRenderer already has question click handler -> no migration needed from QuestionInspector

---

## Phase 1: Merge Variables + Calculations -> "Values" tab — COMPLETE

### Created: `ValuesPanel.tsx` (826 lines)

**List view:**
- [x] Merged table: field, value (click-to-edit), formula column
- [x] "Non-empty" filter toggle
- [x] "Calcs only" filter toggle
- [x] NaN values highlighted red
- [x] Live polling for calculate fields (2s interval + dataupdate listener)
- [x] Override badge (orange) when value manually set
- [x] "calc" badge on calculate-type fields
- [x] Expand/collapse triangle indicator per row

**Detail panel (click to expand):**
- [x] XPath + current value
- [x] Relevant expression with evaluated pass/fail badge
- [x] Constraint expression with evaluated pass/fail badge
- [x] Calculation formula
- [x] Choice filter expression
- [x] "Depends On" chips with orange "!" for hidden dependencies
- [x] "Used By" chips with orange "!" for hidden dependents
- [x] Choices list for select types
- [x] Inline XLSForm field editor (Phase 2 — built in same component)

**Ported from QuestionInspector:**
- isFieldHidden() — DOM visibility check
- parseChoicesForField() / parseChoicesFromInstance() — choice parsing
- Expression evaluation with evaluateRelevant/evaluateConstraint
- Dependency analysis with extractVarRefs

**Unified from VariableInspector + CalculationsPanel:**
- InlineValueEditor — single component replacing EditableValue and ValueCell
- Combined overrides tracking
- Live value polling only for calculate fields

---

## Phase 2: Inline XLSForm editing in Values detail panel — COMPLETE

- [x] Editable inputs for: label, hint, relevant, constraint, calculation, required
- [x] Single source of truth: edits call `onUpdateField(fieldName, updates)` -> updates `xlsRows.survey` in App
- [x] Apply button calls `onApplyCurrentEdits` (POST /convert-json with current xlsRows)
- [x] XLSFormEditor tab reads same `xlsRows` -> reflects changes immediately
- [x] Dirty state tracking with "Unsaved changes" indicator
- [x] Loading state ("Applying...") on Apply button

### New App.tsx callbacks:
- `handleUpdateField(fieldName, updates)` — updates matching row in xlsRows.survey
- `handleApplyCurrentEdits()` — applies current xlsRows via /convert-json (uses ref + tick delay for batched state)

---

## Phase 3: Remove Inspector tab — COMPLETE

- [x] Inspector tab removed from DebugPanel.tsx
- [x] QuestionInspector.tsx still exists but no longer imported
- [x] Question click handler already exists in FormRenderer.tsx (line 86-99) — no loss of functionality

---

## Phase 4: Final tab structure — COMPLETE

5 tabs:
1. **Values** — merged Variables + Calculations + Inspector detail
2. **Warnings** — unchanged
3. **External** — unchanged
4. **XLSForm** — unchanged (structure editing: add/delete/reorder rows)
5. **Expressions** — unchanged

Badge counts: Values (variable count), Warnings (warning count), Expressions (expression count)

---

## Phase 5: Self-review

### Code quality
- [x] No `any` types without justification
- [x] No empty catch blocks in new code
- [x] Single source of truth confirmed: edit in Values detail -> `onUpdateField` -> xlsRows in App -> reflected in XLSForm tab and vice versa
- [x] Override badge works in Values (Set<string> tracks overridden xpaths)
- [x] NaN shown red in Values (conditional class in InlineValueEditor)
- [x] Dependency "!" indicator works in Values detail (isFieldHidden ported)
- [x] Detail panel opens/closes correctly (expandedRow state, Fragment wrapper)
- [x] Apply in detail panel triggers re-conversion
- [x] TypeScript compiles cleanly (`tsc --noEmit`)
- [x] Vite build succeeds

### Technical notes
- ValuesPanel.tsx is 826 lines (slightly over 800 guideline). Contains main component, detail panel, inline editor, and helpers — all tightly coupled. Splitting would be premature abstraction.
- XlsRows type extracted from App.tsx and DebugPanel.tsx to types/index.ts
- VariableInspector.tsx, CalculationsPanel.tsx, QuestionInspector.tsx are now dead code (not imported anywhere)
