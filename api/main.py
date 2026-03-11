"""XLSForm Debugger v2 — FastAPI backend for converting XLSForm to ODK XForm XML."""

import csv
import io
import os
import shutil
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Optional
from xml.sax.saxutils import escape as xml_escape

import pyxform
import pyxform.xls2xform
import pyxform.errors
import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="XLSForm Debugger v2 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


def _save_upload(upload: UploadFile, dest: Path) -> Path:
    safe_name = os.path.basename(upload.filename or "upload")
    if not safe_name:
        safe_name = "upload"
    filepath = dest / safe_name
    if not filepath.resolve().is_relative_to(dest.resolve()):
        raise HTTPException(status_code=400, detail="Invalid filename")
    with open(filepath, "wb") as f:
        f.write(upload.file.read())
    return filepath


def _parse_xlsform_sheets(xlsform_path: Path) -> dict[str, list[dict[str, object]]]:
    """Read raw sheet data from an XLSForm Excel file."""
    import openpyxl

    wb = openpyxl.load_workbook(str(xlsform_path), read_only=True, data_only=True)
    sheets: dict[str, list[dict[str, object]]] = {}
    for name in wb.sheetnames:
        ws = wb[name]
        rows = list(ws.iter_rows(values_only=True))
        if not rows:
            sheets[name] = []
            continue
        headers = [str(h) if h is not None else "" for h in rows[0]]
        sheet_rows: list[dict[str, object]] = []
        for row in rows[1:]:
            # Skip fully empty rows
            if all(c is None or str(c).strip() == "" for c in row):
                continue
            record: dict[str, object] = {}
            for i, header in enumerate(headers):
                if not header:
                    continue
                val = row[i] if i < len(row) else None
                record[header] = val if val is not None else ""
            sheet_rows.append(record)
        sheets[name] = sheet_rows
    wb.close()
    return sheets


def _convert_xlsform(
    xlsform_path: Path, tmp_dir: Path
) -> tuple[str, list[str], str, str]:
    xform_path = tmp_dir / "output.xml"

    warnings = pyxform.xls2xform.xls2xform_convert(
        xlsform_path=str(xlsform_path),
        xform_path=str(xform_path),
        validate=False,
    )
    warnings = warnings or []

    xform_xml = xform_path.read_text(encoding="utf-8")

    title = ""
    form_id = ""
    try:
        root = ET.fromstring(xform_xml)
        ns = {"h": "http://www.w3.org/1999/xhtml", "x": "http://www.w3.org/2002/xforms"}
        title_el = root.find(".//h:head/h:title", ns)
        if title_el is not None and title_el.text:
            title = title_el.text
        instance = root.find(".//{http://www.w3.org/2002/xforms}instance")
        if instance is not None and len(instance) > 0:
            form_id = instance[0].attrib.get("id", "")
    except ET.ParseError:
        pass

    return xform_xml, list(warnings), title, form_id


def _csv_to_xml(csv_content: str, filename: str) -> dict[str, str]:
    """Convert CSV content to enketo external data XML format.
    
    Sanitizes column names to valid XML tags.
    Also injects a plain <label> element from the first English label column
    so enketo itemsets with ref="label" work correctly.
    """
    import re as _re
    bom_stripped = csv_content.lstrip("\ufeff").lstrip("\ufffe")
    reader = csv.DictReader(io.StringIO(bom_stripped))
    fieldnames = reader.fieldnames or []
    
    # Find the label source column
    label_col = None
    if "label" in fieldnames:
        label_col = "label"
    else:
        for f in fieldnames:
            if f.lower().startswith("label::english") or f.lower() == "label":
                label_col = f
                break
        if not label_col:
            for f in fieldnames:
                if "label" in f.lower():
                    label_col = f
                    break

    items = []
    for row in reader:
        item_parts = []
        has_label = False
        for k, v in row.items():
            raw_key = k.strip().lstrip("\ufeff")
            safe_key = _re.sub(r"[^a-zA-Z0-9_]", "_", raw_key)
            if not safe_key or safe_key[0].isdigit():
                safe_key = "col_" + safe_key
            item_parts.append(f"<{safe_key}>{xml_escape(str(v))}</{safe_key}>")
            if safe_key == "label":
                has_label = True
        # Inject plain <label> from English label column if not already present
        if not has_label and label_col and label_col in row:
            item_parts.append(f"<label>{xml_escape(str(row[label_col]))}</label>")
        items.append("<item>" + "".join(item_parts) + "</item>")
    file_id = Path(filename).stem
    return {"id": file_id, "xml": "<root>" + "".join(items) + "</root>"}


@app.post("/convert")
async def convert(
    xlsx_file: UploadFile = File(...),
    csv_files: Optional[list[UploadFile]] = File(None),
):
    tmp_dir = Path(tempfile.mkdtemp())
    try:
        xlsform_path = _save_upload(xlsx_file, tmp_dir)

        external_data: list[dict[str, str]] = []
        if csv_files:
            for csv_file in csv_files:
                _save_upload(csv_file, tmp_dir)
                csv_file.file.seek(0)
                csv_content = csv_file.file.read().decode("utf-8")
                external_data.append(_csv_to_xml(csv_content, csv_file.filename or "data.csv"))

        xform_xml, warnings, title, form_id = _convert_xlsform(xlsform_path, tmp_dir)
        xlsform_sheets = _parse_xlsform_sheets(xlsform_path)

        return {
            "xform_xml": xform_xml,
            "warnings": warnings,
            "title": title,
            "id": form_id,
            "external_data": external_data,
            "xlsform_sheets": xlsform_sheets,
        }
    except pyxform.errors.PyXFormError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail="An internal error occurred")
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


@app.post("/validate")
async def validate(
    xlsx_file: UploadFile = File(...),
    csv_files: Optional[list[UploadFile]] = File(None),
):
    tmp_dir = Path(tempfile.mkdtemp())
    try:
        xlsform_path = _save_upload(xlsx_file, tmp_dir)

        if csv_files:
            for csv_file in csv_files:
                _save_upload(csv_file, tmp_dir)

        _xform_xml, warnings, _title, _form_id = _convert_xlsform(xlsform_path, tmp_dir)

        return {"valid": True, "errors": [], "warnings": warnings}
    except pyxform.errors.PyXFormError as exc:
        return {"valid": False, "errors": [str(exc)], "warnings": []}
    except Exception as exc:
        raise HTTPException(status_code=500, detail="An internal error occurred")
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


@app.get("/health")
async def health():
    return {"status": "ok", "pyxform_version": pyxform.__version__}



if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5050)
