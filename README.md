# XLSForm Debugger v2

> Debug your KoboToolbox / ODK XLSForms locally before deployment.
> Uses the same enketo-core renderer as KoboToolbox — what you see here is exactly what your field team sees.

---

## What it does

- Renders your XLSForm exactly as KoboToolbox would, using enketo-core
- Shows all form variables and their live values as you fill in the form
- Inspects skip logic (relevant), constraints, and calculations in real time
- Highlights undefined variable references and broken expressions
- Lets you inspect any question's full metadata, dependencies, and dependents
- Supports `pulldata()` debugging with uploadable CSV files
- Shows the raw XLSForm source (survey + choices sheets)

---

## Quick Start (Local)

**Requirements:** Python 3.9+, Node 18+

```bash
# 1. Start the API (converts XLSForm → XForm XML)
cd api/
pip install -r requirements.txt
uvicorn main:app --reload --port 5050

# 2. Start the frontend
cd app/
npm install
npm run dev
# Opens at http://localhost:5174
```

---

## How to use

### Loading your form

1. Click **Upload XLSForm** in the top bar and select your `.xlsx` file
2. If your form uses `pulldata()`, upload the CSV files when prompted
3. The form renders immediately in the center panel

### The 3 panels

| Panel | What it shows |
|---|---|
| **Left** | Form structure tree — click to jump to any question |
| **Center** | Live enketo form — fill it in like a data collector would |
| **Right** | Debug tabs — variables, calculations, inspector, warnings |

All panels are drag-to-resize.

### Debug tabs

**Variables**
Live table of every field name, XPath, and current value. Click any value to override it manually — useful for testing skip logic without filling the whole form. Use "Non-empty only" to filter clutter.

**Calculations**
All `calculate` fields with their formulas and live computed values. Click a value to override it for debugging downstream dependencies.

**Inspector**
Click any question in the center panel to inspect it. Shows:
- Current value (live from enketo model)
- All XForm metadata (type, label, hint, required, appearance)
- Relevant/constraint/calculation expressions with evaluated results (✅/🚫/❌)
- Choice list for select_one / select_multiple fields
- Dependencies: what variables this field depends on (clickable chips)
- Dependents: what other fields reference this one

**Warnings**
Automatically detected issues:
- Undefined variable references (e.g. `${stm_confirmaion}` — typo)
- Missing CSV files for `pulldata()`
- Malformed XPath expressions

**External Data**
Shows all loaded CSV files and their row counts. Use this to confirm your `pulldata()` CSVs loaded correctly.

**XLSForm Source**
Raw view of your survey and choices sheets — useful for cross-referencing while debugging.

---

### Tips for debugging pulldata()

1. Upload your CSV alongside the XLSForm
2. Go to **External Data** tab — confirm the file appears and row count looks right
3. Go to **Variables** tab — find the calculate field using `pulldata()` and check its value
4. If the value is empty or `NaN`: check that the lookup key matches exactly (case-sensitive)
5. Use **Inspector** → click the calculate field → see the formula and its current evaluated value

### Tips for debugging relevance / skip logic

1. Fill in the form until the question you expect to appear should show
2. Click the hidden/visible question in the **tree** (left panel) to inspect it
3. In **Inspector**, check the `relevant` expression and whether it evaluates to ✅ Visible or 🚫 Hidden
4. Click any dependency chip to jump to that field and check its current value
5. Use **Variables** tab to manually override a value and see if the question appears

---

## Running for your team (local network)

**API:**
```bash
cd api/
uvicorn main:app --host 0.0.0.0 --port 5050
```

**Frontend (build + serve):**
```bash
cd app/
npm run build
npx serve dist -p 5174
# or with nginx: point root to app/dist/
```

**Share the URL:**
```
http://<your-machine-ip>:5174
```

Anyone on the same network can open the debugger. The API must be running on port 5050 — the frontend is pre-configured to call it there.

> **Note:** This is a local debug tool, not a production deployment. No authentication, no data persistence. Form data stays in the browser.

---

## Tech stack

| Layer | Technology |
|---|---|
| Form renderer | enketo-core + enketo-transformer |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| XLSForm → XForm | pyxform (via FastAPI) |
| API | FastAPI (Python) |
| Layout | react-resizable-panels |

---

*Built for the PUR Projet data team. Questions → Naufal.*
