# XLSForm Debugger v2 — API

FastAPI microservice that converts XLSForm (.xlsx) to ODK XForm XML using pyxform.

## Endpoints

- `POST /convert` — Convert XLSForm to XForm XML
- `POST /validate` — Validate an XLSForm
- `GET /health` — Health check with pyxform version

## Run

```bash
pip install -r requirements.txt
python main.py
```

Server starts on http://localhost:5050
