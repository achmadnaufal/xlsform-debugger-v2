# XLSForm Debugger v2 — API

FastAPI microservice that converts XLSForm (`.xlsx`) to ODK XForm XML using
[pyxform](https://github.com/XLSForm/pyxform), and round-trips edits back into
`.xlsx` for the frontend's inline editor.

## Run

```bash
pip install -r requirements.txt
python main.py
# → http://localhost:5050
```

CORS origins default to `http://localhost:5173,http://localhost:5174`.
Override with the `CORS_ORIGINS` env var (comma-separated).

## Endpoints

### `POST /convert`
Convert an XLSForm (plus optional pulldata CSVs) to XForm XML and raw sheet data.

**Request** (`multipart/form-data`):
- `xlsx_file` — the XLSForm workbook (required)
- `csv_files` — zero or more pulldata CSVs (optional)

**Response** (`application/json`):
```json
{
  "xform_xml": "<h:html>...</h:html>",
  "warnings": ["..."],
  "title": "Form title",
  "id": "form_id",
  "external_data": [{"id": "pulldata_name", "xml": "<root>...</root>"}],
  "xlsform_sheets": {"survey": [ {...} ], "choices": [ {...} ], "settings": [ {...} ]}
}
```

CSV columns are sanitised to valid XML tag names. A plain `<label>` element is
injected from the first English label column so enketo itemsets with
`ref="label"` resolve correctly.

### `POST /validate`
Validate an XLSForm without returning the full XML body.

**Request**: same shape as `/convert`.

**Response**:
```json
{ "valid": true,  "errors": [],           "warnings": ["..."] }
{ "valid": false, "errors": ["pyxform error"], "warnings": [] }
```

### `POST /export`
Rebuild an `.xlsx` workbook from edited sheet data (used by the frontend's
"Export XLSX" button after in-app edits).

**Request** (`application/json`):
```json
{
  "xlsform_sheets": {
    "survey":   [ { "type": "text", "name": "q1", "label": "..." } ],
    "choices":  [ { "list_name": "yesno", "name": "yes", "label": "Yes" } ],
    "settings": [ { "form_title": "...", "form_id": "..." } ]
  }
}
```

**Response**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
with `Content-Disposition: attachment; filename="xlsform_export.xlsx"`.

Styling from the original workbook is **not** preserved — see
[`PLANNING.md`](../PLANNING.md) for the planned improvement.

### `GET /health`
Liveness check.

**Response**:
```json
{ "status": "ok", "pyxform_version": "x.y.z" }
```

## Error handling

- Invalid XLSForm syntax → `400` with pyxform error message in `detail`.
- Unexpected failures → `500` with a generic message (details are logged, not
  leaked to the client).
