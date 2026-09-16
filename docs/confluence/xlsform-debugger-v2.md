# XLSForm Debugger v2

> **Audience:** Entire Data & AI team — Data Engineers, Full-Stack, Data Analysts, Data Scientists, GIS/Geospatial Analysts, Product Managers, CDO.
> **Status:** Internal tool, actively maintained.
> **Maintainer:** Achmad Naufal (Data & AI)
> **Production URL:** [https://tools.dapur.dev/xlsform/](https://tools.dapur.dev/xlsform/)
> **Source:** [github.com/achmadnaufal/xlsform-debugger-v2](https://github.com/achmadnaufal/xlsform-debugger-v2)

---

## On this page

1. [Executive summary](#1-executive-summary)
2. [The problem it solves](#2-the-problem-it-solves)
3. [Who uses this tool](#3-who-uses-this-tool)
4. [How to access](#4-how-to-access)
5. [Product walkthrough](#5-product-walkthrough)
6. [Role-based playbooks](#6-role-based-playbooks)
7. [Architecture](#7-architecture)
8. [API reference](#8-api-reference)
9. [Tech stack](#9-tech-stack)
10. [Deployment & hosting](#10-deployment--hosting)
11. [Roadmap](#11-roadmap)
12. [Known limitations](#12-known-limitations)
13. [Troubleshooting FAQ](#13-troubleshooting-faq)
14. [Glossary](#14-glossary)
15. [Ownership & contribution](#15-ownership--contribution)

---

## 1. Executive summary

**XLSForm Debugger v2** is an internal web tool that lets anyone on the team preview, debug, and sanity-check an XLSForm (the spreadsheet format used by KoboToolbox / ODK) **before** it reaches the field team.

It renders the form with the exact same engine KoboToolbox uses (`enketo-core`), so what you see locally is byte-for-byte what your enumerator sees in production. On top of that it surfaces everything that normally lives hidden inside the XML model — calculated fields, skip-logic evaluations, pulldata resolutions, undefined references — in dedicated debug panels.

**Business value:**

- **Shorter iteration cycle.** Catch form bugs in minutes instead of the usual loop (deploy → enumerator reports → fix → redeploy), which used to take days.
- **Fewer field-quality incidents.** Broken `pulldata()` calls, silently-hidden questions, and mismatched choice lists are the leading causes of bad field data; this tool surfaces them pre-deployment.
- **Lower onboarding cost for non-form specialists.** Data analysts, scientists, and GIS staff can inspect forms without learning the XForm XML spec.

---

## 2. The problem it solves

### 2.1 XLSForms are hard to debug without a renderer

An XLSForm is an Excel spreadsheet that encodes a multi-page survey, complete with skip logic, calculations, validation rules, multi-language labels, and external data lookups. Writing one is straightforward — verifying one is not.

Common pain points **before** this tool existed:

| Problem | Typical consequence |
|---|---|
| Misspelled `${variable}` reference inside a `calculate` or `relevant` expression | Field silently evaluates to empty/NaN; enumerator sees wrong (or no) value |
| `pulldata('file', 'col', 'key', 'value')` with filename / column / key typo | Returns blank; enumerator waits for a pre-filled field that never fills |
| Skip logic (`relevant`) mis-scoped (e.g. wrong repeat index, missing parent reference) | Questions appear/hide in the wrong context; schema drift in the submissions |
| Constraint (`constraint`) too strict or too loose | Enumerator blocked at data entry, or garbage accepted |
| Multi-language labels fall out of sync between `survey` and `choices` sheets | One language renders blanks; enumerator uses wrong translation |
| `geopoint` / `geoshape` questions with wrong `appearance` column | Map fails to load or saves in unexpected format |

### 2.2 Why this problem has no off-the-shelf solution

KoboToolbox's own preview is a full deploy cycle. `pyxform` (the XLSForm compiler) only tells you if the XML *compiles* — not whether it behaves correctly at runtime. Running against real enumerators burns time and erodes trust in the instrument.

XLSForm Debugger v2 closes that loop: **same renderer as production**, **same logic engine**, **same data bindings** — but with every variable, calculation, and evaluation exposed in a side panel.

---

## 3. Who uses this tool

| Role | Primary use case | Frequency |
|---|---|---|
| **Data Analyst** | Validate a survey before it ships to the field; QA choice-list mappings | Per-form (weekly+) |
| **Data Engineer** | Debug `pulldata()` wiring against real CSVs before they're uploaded to Kobo | Per-form |
| **Full-Stack Engineer** | Reproduce bugs reported by the field team; fix & verify | As-needed |
| **Data Scientist** | Verify that calculated fields (scoring, indices, risk flags) produce the expected values | Per-form with derived fields |
| **GIS / Geospatial Analyst** | Inspect `geopoint`, `geoshape`, `geotrace` questions *(map rendering is a work-in-progress — see §11)* | Per spatial form |
| **PM / Project Lead** | Triage enumerator-reported "this field doesn't work" tickets; sanity-check a form before signoff | Per sprint |
| **CDO / Head of Data** | Review that data quality gates are in place before a survey goes live; audit form complexity | Governance reviews |

---

## 4. How to access

### 4.1 Production (recommended)

Open: **[https://tools.dapur.dev/xlsform/](https://tools.dapur.dev/xlsform/)**

No installation, no accounts. The URL is behind a Cloudflare Tunnel into the maintainer's local host, so availability is best-effort and tied to the host machine being online. If the page fails to load, ping the maintainer in Slack.

### 4.2 Local install (for heavy users / offline work)

```bash
git clone https://github.com/achmadnaufal/xlsform-debugger-v2.git
cd xlsform-debugger-v2

# Backend deps (Python 3.10+)
cd api && pip install -r requirements.txt && cd ..

# Frontend deps (Node 18+)
cd app && npm install && cd ..

# Start both services
./start.sh
# → http://localhost:5173
```

`./start.sh` launches the FastAPI backend (port 5050) and the Vite frontend (port 5173) in one terminal. `Ctrl+C` stops both.

### 4.3 Share on your LAN

```bash
# API
cd api && uvicorn main:app --host 0.0.0.0 --port 5050

# Frontend
cd app && npm run dev -- --host
```

Share `http://<your-LAN-IP>:5173/xlsform/` — teammates need only a browser.

---

## 5. Product walkthrough

### 5.1 The 3-panel layout

All three panels are draggable / resizable:

| Panel | Purpose |
|---|---|
| **Left — Form Structure** | Collapsible tree of every group, repeat, and question. Click to scroll the center panel to that question. Status indicators flag relevant/hidden/constraint-failing fields. |
| **Center — Rendered Form** | The actual form, rendered by `enketo-core`. Interact with it exactly as a field enumerator would — fill answers, toggle selects, draw map shapes. |
| **Right — Debug tabs** | Five tabs that expose the form's internal state (see below). |

### 5.2 The five debug tabs

Verified against `app/src/components/DebugPanel.tsx:24-30` (the `TABS` array literally wired into the tab bar). There is **no separate "Calculations" tab** — calculated fields are merged into **Values** (see the note below the table). An older revision of this doc described six tabs; that was aspirational and never matched the shipped UI.

| Tab (internal id) | What it shows | Component | Who finds it most useful |
|---|---|---|---|
| **Inspector** (`inspector`) | Click any question to see: type, label (all languages), `relevant` expression (with ✅ visible / 🚫 hidden indicator), `constraint` status, current value, dependency chips (jump-to). | `FieldEditorInspector.tsx` | Everyone |
| **Values** (`values`) | Every form variable **and** every `calculate` field in one merged, filterable table — value, live-evaluated formula result, "calc" badge. **Editable** — click a value to override it and watch the form re-evaluate live. | `MergedValuesPanel.tsx` | Analyst, Scientist, Data Engineer |
| **Warnings** (`warnings`) | Static analysis: undefined `${variable}` references, missing CSVs, malformed brackets, circular dependencies. | `WarningsPanel.tsx` | Analyst, QA |
| **External** (`external`) | Lists all uploaded pulldata CSVs with row counts and column headers. | `ExternalDataPanel.tsx` | Data Engineer |
| **XLSForm** (`source`) | Read-and-edit view of the `survey` / `choices` / `settings` sheets. Edits sync back to the Inspector and can be exported as `.xlsx`. | `XLSFormSource.tsx` | Analyst, Engineer |

**Where calculation values actually come from:** `MergedValuesPanel.tsx:12-16` reads live calc values directly off the real `enketo-core` model (`window.__enketoForm.model.node(xpath).getVal()`), polled every 2 s and on every `dataupdate` event (`MergedValuesPanel.tsx:166-184`). This is the same evaluation engine KoboToolbox runs in production — full XPath support, not an approximation. See §7.4 for where the tool's evaluation is *not* ground-truth.

**Dead code note:** `app/src/components/DebugTabs/ExpressionTracer.tsx` exists in the repo and looks like a dedicated Calculations-tab component, but it is not imported anywhere (`grep -rn "ExpressionTracer" app/src` returns only its own file). It's unused — likely a leftover from before Calculations was folded into Values. Safe to delete or revive.

### 5.3 Workflow in 30 seconds

1. Drag your `.xlsx` onto the upload bar.
2. (Optional) Click **+ CSV files** to add pulldata CSVs.
3. Form renders. Use the 3 panels to explore.
4. (Optional) Edit a field in the Inspector → the change lives in the XLSForm tab instantly.
5. Click **Export XLSX** to download the edited form.

---

## 6. Role-based playbooks

### Playbook A — Data Analyst: "Pre-flight check a new survey"

1. Load the form + all pulldata CSVs.
2. Open **Warnings** — resolve everything flagged before continuing.
3. Open **Form Structure** — walk every branch. Any question with a surprise indicator (hidden when you expect visible, or vice versa) gets inspected.
4. Open **Values** (filter: Calcs only) — scan for any formula showing `NaN`, empty, or a type mismatch.
5. Fill one complete happy-path submission in the center panel. Confirm no constraint blocks unexpectedly.
6. Export to `.xlsx` (if you made edits) and hand off for deployment.

### Playbook B — Data Engineer: "Why is `pulldata()` returning blank?"

1. Load form + the suspect CSV.
2. Open **External** — confirm the filename matches the CSV name passed to `pulldata()` *exactly* (it's case-sensitive; `.csv` extension included/excluded matters).
3. Open **Values** — find the `pulldata()` field (tagged `calc`). The live value column tells you whether it resolves.
4. In **Values**, override the key field (e.g. `producer_id`) with a value you *know* exists in the CSV. If it now resolves, the bug is in how the field was populated. If still blank, the bug is in the CSV structure (missing header, wrong key column).

### Playbook C — Data Scientist: "Does my risk score formula produce the right values?"

1. Load the form.
2. Open **Values** and set the input fields to the scenarios from your test matrix.
3. Watch the derived field's live value in the same **Values** table. Compare against your expected output.
4. Repeat for edge cases (nulls, extremes, boundary conditions).
5. If a case fails, open **Inspector** on the derived field to see its raw XPath and which dependencies fed it.

### Playbook D — GIS / Geospatial Analyst: "Check a spatial form"

> **Current limitation:** The map renderer for `geopoint` / `geoshape` / `geotrace` is not yet wired up — tiles render blank. A fix using OpenStreetMap tiles is queued as the next milestone (see §11).
>
> Until then you can still:
> - Confirm `geopoint`, `geoshape`, `geotrace` questions are present in the **Form Structure** tree
> - Verify their `appearance` settings in the **XLSForm Source** tab
> - Check that their dependencies (e.g. a `relevant` condition gating a map field) evaluate correctly via the **Inspector**
> - Sanity-check that submitted coordinates save into the model via the **Values** panel once map tiles are back

### Playbook E — PM: "Enumerator says field X doesn't show"

1. Load the exact form version the enumerator has.
2. Open **Inspector** and click field X.
3. Read the `relevant` expression and its current evaluation (✅ / 🚫).
4. Click the dependency chips to jump to the gating fields.
5. In **Values**, mirror the enumerator's inputs and watch the evaluation change.
6. You now have a minimal repro to send back to the form author, with exact variable values and the exact condition that's blocking visibility.

### Playbook F — CDO: "Governance snapshot for an active form"

Open the form and take a single screenshot of each:
- **Warnings** tab — zero warnings is the target for production forms
- **Values** tab (Calcs only filter) — quick visual audit of every derived field
- **Form Structure** — complexity indicator (depth of nesting, number of repeats)
- **External** — confirms the form's pulldata dependencies are declared

---

## 7. Architecture

```
┌────────────────────────────────┐          ┌─────────────────────────────┐
│  Browser (React 19 + Vite)     │          │  FastAPI  (Python 3.10+)    │
│                                │  HTTP    │                             │
│  ┌──────────────────────────┐  │ ───────► │  POST /convert              │
│  │  enketo-core (unmodified)│  │          │    pyxform → XForm XML      │
│  │  = same engine as Kobo   │  │          │    + parsed sheet JSON      │
│  └──────────────────────────┘  │          │                             │
│  ┌──────────────────────────┐  │          │  POST /validate             │
│  │  Debug panels (5 tabs)   │  │          │  POST /export  (openpyxl)   │
│  │  Inspector / Values /    │  │          │  GET  /health               │
│  │  Warnings / External /   │  │          │                             │
│  │  XLSForm Source          │  │          └─────────────────────────────┘
│  └──────────────────────────┘  │
│                                │
│  IndexedDB sessions + URL hash │
│  (no server-side persistence)  │
└────────────────────────────────┘
```

**Key design decisions:**

- **Unmodified `enketo-core`.** Rendering is literally the same code path KoboToolbox runs. No patches, no forks. This guarantees zero drift between what the tool shows and what an enumerator experiences.
- **Stateless backend.** The FastAPI service holds no state between requests. Everything is temp-file scoped to one request. No database, no queue, no auth.
- **Client-side persistence via IndexedDB.** Session state (source `.xlsx` as XML, warnings, external CSVs, sheet JSON) is auto-saved to an IndexedDB database named `xlsform-debugger-v2` (`app/src/lib/sessionStorage.ts:21-23`), debounced 1500 ms after any change (`app/src/hooks/useSessionPersistence.ts:5,46-67`). The active session id lives in the URL hash (`#session=<id>`, `useSessionPersistence.ts:34-38`) so a link can be shared/bookmarked to reopen a specific session locally; only a `localStorage` pointer to the *last* session id persists outside IndexedDB (`sessionStorage.ts:24,43`). Sessions are named (`SessionSwitcher.tsx`) and listed newest-first (`sessionStorage.ts:51-55`). None of this is server-side — it never leaves the browser.
- **No build-time coupling to Kobo.** The tool can run fully offline against files on disk; it doesn't talk to any Kobo server.

### 7.4 Debug engine internals — every rule, with line numbers

The three data-driven panels (Warnings, Values, Inspector) don't share one engine — they're built from three distinct pieces of logic. Knowing which is which matters because only one of them is guaranteed to match production `enketo-core` behavior.

#### 7.4.1 Two different expression evaluators — know which one you're looking at

| Where | Engine | Ground truth? |
|---|---|---|
| **Values tab** live calc results | The real `enketo-core` XPath engine, read straight off its live model (`MergedValuesPanel.tsx:12-16`) | ✅ Yes — identical to what KoboToolbox evaluates in production |
| **Inspector tab** ✅/🚫 relevant indicator and constraint pass/fail | A hand-rolled recursive-descent evaluator in `app/src/utils/expressionEvaluator.ts`, invoked at `FieldEditorInspector.tsx:303-309` | ⚠️ No — a subset re-implementation, can diverge |

`expressionEvaluator.ts` tokenizes (`:23-101`) and parses (`:110-224`) a deliberately small XPath grammar: `and`/`or`/comparison/`+ - * div mod` with standard precedence, plus exactly these functions (`:284-311`): `true`, `false`, `selected`, `string-length`, `number`, `string`, `not`, `coalesce`, `concat`, `contains`, `starts-with`, `substr`, `count-selected`, `round`, `int`, `if`. Any XPath outside that list — `regex()`, `format-date()`, `today()`, `now()`, `position()`, `indexed-repeat()`, `once()`, `instance(...)` lookups, `selected-at()` — is not recognized; unknown function calls fall through to `''` (`:310`) and unknown tokens are silently skipped during tokenizing (`:97-98`). Both `evaluateRelevant` and `evaluateConstraint` catch all errors and default to `true` (`:319-329`, `:331-343`) so a parse failure never blocks the field — but it also means the Inspector can show a question as "relevant" when the real form would hide it, or vice versa, whenever the expression uses an unsupported function. **Practical implication:** trust the Rendered Form panel and the Values tab over the Inspector's ✅/🚫 badge for any `relevant`/`constraint` expression using date functions, regex, or repeat-position logic — cross-check by actually filling the form.

#### 7.4.2 Warnings — five independent checks

All computed client-side in `WarningsPanel.tsx:28-89`, re-run on every render via `useMemo`:

| # | Check | Rule | Line |
|---|---|---|---|
| 1 | `conversion` | Every string `pyxform` returned as a compile warning is passed through verbatim | `WarningsPanel.tsx:29` |
| 2 | `undefined-ref` | For every `relevant`/`constraint`/`calculation`/`choice_filter` expression on every field, each `${var}` reference (extracted by `xformParser.ts:344-352`) is checked against the set of all known field names; unmatched → warning | `WarningsPanel.tsx:46-55` |
| 3 | `malformed` | Bracket-depth scan over the same expressions — counts `[`/`]`, flags if depth goes negative mid-string or ends non-zero | `WarningsPanel.tsx:17-25`, called at `:56-61` |
| 4 | `circular-dep` | Builds a field→field dependency graph from the same four expression types (`dependencyGraph.ts:20-41`) and runs DFS cycle detection with white/gray/black coloring (`dependencyGraph.ts:47-105`); each unique cycle (dedup'd by sorted node set, `:76-77`) becomes one warning | `WarningsPanel.tsx:64-72` |
| 5 | `missing-csv` | Extracts every `pulldata('file', ...)` filename from the XForm XML via regex (`xformParser.ts:354-362`) and checks it against the CSV ids currently loaded (`window.__externalData`); unmatched → warning | `WarningsPanel.tsx:74-83` |

Self-references are excluded from the dependency graph (`dependencyGraph.ts:32`, `ref !== name`) so a field referencing its own prior value in a `calculate` doesn't falsely trip the cycle detector.

---

## 8. API reference

Full spec in [`api/README.md`](../../api/README.md). Backend: `api/main.py` (300 lines, single file, no sub-modules).

| Endpoint | Purpose | Handler |
|---|---|---|
| `POST /convert` | XLSForm + CSVs → XForm XML + parsed sheet JSON + external data XML | `main.py:176-210` |
| `POST /validate` | XLSForm validity check (pyxform) without returning the full body | `main.py:213-235` |
| `POST /export` | Sheet JSON → rebuilt `.xlsx` download | `main.py:244-290` |
| `GET /health` | Liveness + pyxform version | `main.py:293-295` |

### 8.1 `POST /convert` — implementation detail

1. Upload is saved to a per-request temp dir; filename is sanitized to its basename and re-checked with `Path.resolve().is_relative_to()` before writing, rejecting any path-traversal attempt with `400` (`_save_upload`, `main.py:40-49`).
2. Each CSV is converted to enketo's external-data XML format by `_csv_to_xml` (`main.py:129-173`): column names are sanitized to valid XML tags (non-alnum → `_`, leading digit gets a `col_` prefix, `:162-164`), and if no `<label>` column exists, one is synthesized from the first column whose header matches `label`/`label::english*` case-insensitively (`:141-154`, `:169-170`) — this is what makes enketo `<itemset>` selects with `ref="label"` resolve even when the CSV's label column is named something else.
3. CSV bytes are decoded via `_decode_csv_bytes` (`main.py:113-126`), trying `utf-8-sig` → `cp1252` → `latin-1` in order — `latin-1` never raises (it maps every byte 0–255), so decoding always succeeds even for a mis-encoded Excel export, rather than 500ing on the request.
4. `_convert_xlsform` (`main.py:82-110`) calls `pyxform.xls2xform.xls2xform_convert(..., validate=False)` — note **`validate=False`**: this endpoint always returns whatever XML pyxform can produce, even if it wouldn't pass full pyxform validation. Title and form id are pulled out of the compiled XForm's `<h:title>` and first model instance's `id` attribute (`:96-108`); a parse failure there is swallowed (`:107-108`) and just leaves them blank.
5. `_parse_xlsform_sheets` (`main.py:52-79`) re-reads the original `.xlsx` with `openpyxl` (`read_only=True, data_only=True`) and returns every sheet as a list of row-dicts keyed by header — this is the raw material for the XLSForm Source tab, independent of what pyxform compiled.

### 8.2 `POST /export` — implementation detail

Rebuilds a workbook from `xlsform_sheets` JSON (`ExportRequest` at `main.py:238-241`): one sheet per key (name truncated to Excel's 31-char limit, `:254`), header row taken from the first row's keys with any additional keys from later rows appended in encounter order (`:258-263`) — this is why a sparse edit that adds a brand-new column to only one row still produces a consistent header. List/dict cell values are stringified (`:274-275`) since Excel cells can't hold nested structures. The original workbook's default empty sheet is removed once real sheets exist (`:279-280`). **Formatting (colors, column widths, frozen panes) from the source `.xlsx` is not preserved** — this is a fresh `openpyxl.Workbook()`, not a copy of the upload.

### 8.3 Error handling & CORS

- `pyxform.errors.PyXFormError` → `400` with the pyxform message in `detail` (`main.py:204-205`, `:229-230`).
- Any other exception → logged with full traceback server-side, but the client only gets `{type(exc).__name__}: {exc}` — internal tracebacks are never returned (`main.py:206-208`, `:231-233`).
- CORS origins are whitelisted via the `CORS_ORIGINS` env var, comma-split, defaulting to `http://localhost:5173,http://localhost:5174` (`main.py:28-30`); only `GET`/`POST` and the `Content-Type` header are allowed (`:35-36`).
- Every temp dir is removed in a `finally` block (`main.py:209-210`, `:234-235`) regardless of success or failure.

### 8.4 Testing & quality gates

```bash
cd app && npm test          # Vitest, run once
cd app && npm test -- --watch
```

| File | What it covers |
|---|---|
| `xformParser.test.ts` | Bind/body parsing, itext resolution, `${var}` and `pulldata()` extraction |
| `dependencyGraph.test.ts` | Graph construction and DFS cycle detection |
| `expressionEvaluator.test.ts` | The Inspector's subset XPath evaluator (§7.4.1) |
| `xformMutator.test.ts` | Inspector edits → mutated XForm XML |
| `xlsformSheetMutator.test.ts` | Inspector edits → mutated sheet JSON (feeds `/export`) |
| `xlsformTypes.test.ts` | XLSForm↔XForm type mapping table |

Current status (verified 2026-08-06): **6 test files, 80 tests, all passing.** No backend (`api/`) test suite exists — `_csv_to_xml`, `_decode_csv_bytes`, and the path-traversal guard in `_save_upload` are untested today.

`autotest.js` (repo root) is a separate, dev-only Puppeteer smoke script — drives a running instance against a hard-coded local form + CSV path, not wired into CI, not part of `npm test`.

---

## 9. Tech stack

| Layer | Tech | Rationale |
|---|---|---|
| Form renderer | `enketo-core` v9 | Byte-for-byte parity with KoboToolbox |
| XLSForm compiler | `pyxform` via FastAPI | The reference XLSForm → XForm compiler |
| XLSX I/O | `openpyxl` | Robust workbook read/write in Python |
| Frontend | React 19 + TypeScript + Vite | Fast dev loop, modern React |
| Styling | Tailwind CSS | Utility-first, consistent with other internal tools |
| Layout | `react-resizable-panels` | 3-panel draggable layout |
| Session storage | `idb` (v8, IndexedDB wrapper) | Client-side auto-save of sessions — see §7 |
| Backend | FastAPI + Uvicorn | Low-ceremony Python HTTP |
| Testing (frontend) | Vitest + jsdom | Same ecosystem as Vite |
| E2E smoke test | Puppeteer script (`autotest.js`) | Dev-only, not part of CI |

---

## 10. Deployment & hosting

### 10.1 Current topology

- Maintainer's Mac mini runs the API (port 5050) + frontend (port 5173)
- A Cloudflare Tunnel (`cloudflared`) terminates HTTPS at Cloudflare's edge and forwards path `/xlsform/*` on `tools.dapur.dev` to `localhost:5173`
- Vite's dev server is configured with `base: "/xlsform/"` and proxies `/xlsform/convert` + `/xlsform/export` back to `localhost:5050` so the browser only ever needs to hit port 5173

### 10.2 Co-hosted tools on the same tunnel

Verified against `~/.cloudflared/config.yml` and `~/projects/tools-landing/index.html` (2026-08-06) rather than assumed — this project shares one Cloudflare Tunnel (`tools-tunnel`, id `3772f472-1a11-4686-8abf-8b1c12ddf764`) with several sibling internal tools, each on its own `launchd` service and local port. Ingress rules are evaluated **first-match-wins**, in this order:

| Path (on `tools.dapur.dev`) | Port | App | Landing page status |
|---|---|---|---|
| `^/xlsform` | 5173 | XLSForm Debugger (**this project**) | Live |
| `^/cpo` | 8501 | CPO Dashboard (Streamlit, `cpo_streamlit_app_v2`) | Live |
| `^/registry` | 8502 | Certification Registry (manual + overlap checker) | Live |
| `^/kobo-qc` | 8506 | Kobo QC (read-only QC + Excel changelog) | Live |
| `^/kobo` | 8504 | Kobo Automation (bulk-edit / find-replace / clone submissions) | Live |
| `^/pulldata` | 8505 | Pulldata Biomass Tools | Live |
| `^/offline-maps-tiles` | 8511 | `.mbtiles` tile companion service for Offline Maps | (no landing card — internal) |
| `^/offline-maps` | 8507 | Offline Maps (ODK/KoboCollect `.mbtiles` generator) | Live |
| *(no path — fallback)* | 8080 | `tools-landing` — the landing page itself (`com.tools-landing.plist`, Python static server) | — |
| — | — | *(final fallback: `http_status:404`)* | — |

`gis.dapur.dev` (QGIS Web Client / QWC2) is a **separate hostname**, not a path rule under `tools.dapur.dev` — but it currently has **no entry at all** in `config.yml` and its `launchd` agent is disabled (`~/Library/LaunchAgents/com.gis-app.plist.disabled`). The landing page still links to it and marks it `Offline` (`is-offline` class, `index.html:523-535`) with an inline note to reload the `com.colima` and `com.gis-app` agents to bring it back — it's intentionally shut down to save local resources, not a bug. Don't trust an older mention of `gis.dapur.dev` being live without re-checking `launchctl list`.

New apps are onboarded via a documented, repeatable checklist — see [`tools-landing/ADD_APP_PROMPT.md`](../../../tools-landing/ADD_APP_PROMPT.md) (add ingress rule → `launchd` plist → landing page card → reload `cloudflared`). That file's own "current ingress routes" example predates `kobo`, `kobo-qc`, `pulldata`, and `offline-maps*` — `config.yml` is the source of truth, not the prompt template.

### 10.3 Availability

Best-effort. No SLA. If the host machine is offline or restarts, the tunnel is down until it reconnects. There is no HA failover. For production-critical usage, install locally.

---

## 11. Roadmap

| Feature | Status | Owner | Notes |
|---|---|---|---|
| Inspector ↔ XLSForm sync | ✅ Done | — | Edits flow live between panels |
| XLSX export | ✅ Done | — | Edited form downloadable |
| Scrollable sheet tabs | ✅ Done | — | Handles forms with >6 sheets |
| **Geoshape / map rendering** | 🟡 Ready to build | Maintainer | 2–3h of work; step-by-step plan in [`PLANNING.md`](../../PLANNING.md) |
| Preserve Excel formatting in export | 🟡 Planned next | — | Keep colours, widths, frozen panes from the original file |
| Multi-language switcher UI | ⚪ Backlog | — | `enketo-core` already supports it natively; we just need a selector |
| CSV inline editor | ⚪ Backlog | — | Edit pulldata rows without re-uploading |
| Form submission XML preview | ⚪ Backlog | — | See the ODK submission payload before submitting |
| Form diff (v1 vs v2) | ⚪ Backlog | — | Highlight added/removed/changed questions |
| Offline / PWA | ⚪ Backlog | — | Useful for field-adjacent offline QA |

Legend: ✅ shipped &nbsp;•&nbsp; 🟡 next up &nbsp;•&nbsp; ⚪ backlog

---

## 12. Known limitations

- **Map tiles for geo fields are blank.** Tracked as the next milestone. Won't block non-spatial form work.
- **Excel formatting is lost on export.** Column widths, header colours, conditional formatting — all stripped. If you need the original styling, keep a copy of the source `.xlsx` and merge edits manually, or wait for the styling-preservation feature.
- **No multi-user sessions.** Two people opening the prod URL at the same time are on independent browsers with independent state.
- **No backend persistence.** Refresh your browser and only the local IndexedDB session store survives (§7, "Client-side persistence via IndexedDB"). The server stores nothing.
- **Inspector's relevant/constraint indicator is not ground-truth.** It runs a hand-rolled XPath subset evaluator (§7.4.1), not `enketo-core`. Expressions using `regex()`, date functions, `position()`, `indexed-repeat()`, `once()`, or `instance()` lookups can show the wrong ✅/🚫 state. Cross-check against the actual Rendered Form or the Values tab (both use the real engine) before trusting the Inspector badge on those.
- **Best-effort hosting.** Not a production-graded deployment. See §10.3.
- **`jr://` image hints render as broken images.** Cosmetic only; form logic is unaffected.
- **Dead code:** `app/src/components/DebugTabs/ExpressionTracer.tsx` is unused (§5.2) — harmless, but a source of confusion for anyone grepping for the "Calculations" tab.
- **Not a replacement for pyxform validation in your CI.** This is a visual debugger. Keep `pyxform --validate` in your form-release pipeline. Note also that `/convert` runs pyxform with `validate=False` (§8.1) — it will render forms that wouldn't pass a strict `pyxform --validate` pass.
- **No backend test suite.** `api/main.py`'s CSV decoding, label-injection, and path-traversal guard (§8.1) are untested — only the frontend has coverage (§8.4).

---

## 13. Troubleshooting FAQ

**The page loads but says "API error"**
- The backend (port 5050) is down or unreachable. If you're on the production URL, the host machine is probably offline — ping the maintainer. If you're local, restart `./start.sh`.

**My `pulldata()` field shows `—` or `NaN`**
- See Playbook B above. 99% of the time it's a filename mismatch or the key column header differs from what the `pulldata()` call expects.

**A question is hidden when I expect it visible**
- Open the Inspector on that question. The `relevant` expression is shown with live evaluation. Follow the dependency chips back to the gating field.

**I edited the form but the Rendered Form panel didn't update**
- The Rendered Form re-renders on "Save & re-render" in the XLSForm tab (not on every keystroke, to avoid thrashing for large forms).

**Map is blank**
- Expected (see §11 / §12). Non-map fields will work normally.

**I want to share my edits with a teammate**
- Click **Export XLSX**, send the file. Or copy the browser URL — session state is encoded in it (within URL length limits).

**It worked yesterday, now the prod URL hangs**
- Cloudflare Tunnel hiccup or the host is offline. Fall back to local install (§4.2).

**Can I use it with a KoboToolbox deployment server?**
- The tool reads `.xlsx` files directly; it doesn't talk to Kobo. You'd download the `.xlsx` from Kobo's form management UI and drop it in.

---

## 14. Glossary

| Term | Definition |
|---|---|
| **XLSForm** | An Excel-based authoring format for surveys. Compiles to XForm XML. [spec](https://xlsform.org/) |
| **XForm / ODK XForm** | The XML runtime representation of a form used by ODK-family tools. |
| **pyxform** | The reference compiler from XLSForm → XForm XML. Python library. |
| **enketo-core** | JavaScript library that renders XForm XML in a browser. Used by KoboToolbox, Ona, Enketo Express. This project renders with the unmodified library. |
| **`pulldata()`** | An XPath function in XLSForms that looks up a value from an external CSV by key. Used for pre-filling producer / parcel / household data. |
| **`relevant`** | The XLSForm column for skip-logic expressions. Controls whether a question is shown. |
| **`calculate`** | An XLSForm question type that evaluates an expression and stores the result. Used for derived fields. |
| **`constraint`** | The XLSForm column for per-question validation rules. |
| **Repeat group** | An XLSForm structure that lets enumerators add 0–N instances of a sub-form (e.g. "add each family member"). |
| **`geopoint` / `geoshape` / `geotrace`** | XLSForm question types for a single coordinate / polygon / polyline. |
| **KoboToolbox** | A hosted ODK-family platform widely used for humanitarian & development surveys. |
| **ODK** | Open Data Kit — the family of open-source tools / formats for offline mobile data collection. |

---

## 15. Ownership & contribution

- **Maintainer:** Achmad Naufal
- **Slack:** ping in `#data-ai` or DM
- **Issue tracker:** [GitHub Issues](https://github.com/achmadnaufal/xlsform-debugger-v2/issues)
- **Contributions welcome.** Read [`README.md`](../../README.md) for setup, [`PLANNING.md`](../../PLANNING.md) for open roadmap items, and [`api/README.md`](../../api/README.md) for the backend contract.

### Reporting a bug

Please include:
1. The XLSForm `.xlsx` (or a minimal reproduction)
2. Any pulldata CSVs involved
3. What you did (which panel, what you clicked)
4. What you expected vs what happened
5. Browser + OS

### Requesting a feature

Open a GitHub issue with the use case first, not the proposed solution. The "what problem does this solve" framing helps prioritise against the existing roadmap.

---

_Last updated: 2026-08-06 — reconciled against source at commit `a094830` (§5.2, §7, §7.4, §8, §9, §12 corrected/expanded and verified line-by-line against the actual code, in the same style as [`cpo_streamlit_app_v2/CONFLUENCE_TEAM_OVERVIEW.md`](../../../cpo_streamlit_app_v2/CONFLUENCE_TEAM_OVERVIEW.md)). This page lives in the repo at `docs/confluence/xlsform-debugger-v2.md` — edit there and re-paste into Confluence to keep the two in sync._
