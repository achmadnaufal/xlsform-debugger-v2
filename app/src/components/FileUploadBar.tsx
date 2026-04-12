import { useState, useCallback, useRef, type DragEvent } from "react";
import axios from "axios";
import type { ConvertResponse, ExternalDataEntry, XlsRows } from "../types";

const API_URL = "http://localhost:5050/convert";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface FileUploadBarProps {
  readonly onConvert: (xformXml: string, warnings: readonly string[], externalData: readonly ExternalDataEntry[], xlsRows: XlsRows) => void;
  readonly onError: (error: string) => void;
  readonly onNewForm?: () => void;
  readonly onExport?: () => void;
  readonly exporting?: boolean;
  readonly hasForm?: boolean;
}

function validateXlsxFile(file: File): string | null {
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return "Only .xlsx files are supported";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File too large (max 10 MB)";
  }
  return null;
}

export function FileUploadBar({ onConvert, onError, onNewForm, onExport, exporting, hasForm }: FileUploadBarProps) {
  const [loading, setLoading] = useState(false);
  const [xlsxFile, setXlsxFile] = useState<File | null>(null);
  const [csvFiles, setCsvFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const xlsxInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const convertingRef = useRef(false);

  const doConvert = useCallback(
    async (xlsx: File, csvs: File[]) => {
      if (!xlsx || xlsx.size === 0) return;
      if (convertingRef.current) return;
      convertingRef.current = true;
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("xlsx_file", xlsx);
        csvs.forEach((csv) => formData.append("csv_files", csv));

        const response = await axios.post<ConvertResponse>(API_URL, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const xlsRows: XlsRows = {
          survey: response.data.survey ?? [],
          choices: response.data.choices ?? [],
          settings: response.data.settings ?? [],
        };
        onConvert(response.data.xform_xml, response.data.warnings, response.data.external_data ?? [], xlsRows);
      } catch (err) {
        const message =
          axios.isAxiosError(err) && err.response?.data?.detail
            ? String(err.response.data.detail)
            : err instanceof Error
              ? err.message
              : "Conversion failed";
        onError(message);
      } finally {
        setLoading(false);
        convertingRef.current = false;
      }
    },
    [onConvert, onError]
  );

  const handleXlsxFile = useCallback(
    (file: File) => {
      const error = validateXlsxFile(file);
      if (error) {
        setValidationError(error);
        return;
      }
      setValidationError(null);
      setXlsxFile(file);
      setCsvFiles(prev => {
        doConvert(file, prev);
        return prev;
      });
    },
    [doConvert]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file?.name.endsWith(".xlsx")) {
        handleXlsxFile(file);
      } else {
        onError("Please drop an .xlsx file");
      }
    },
    [handleXlsxFile, onError]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleXlsxFile(file);
      e.target.value = "";
    },
    [handleXlsxFile]
  );

  const handleCsvSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const newCsvs = Array.from(e.target.files);
      setCsvFiles(prev => {
        // Merge: replace files with same name, add new ones
        const merged = [...prev];
        for (const f of newCsvs) {
          const idx = merged.findIndex(x => x.name === f.name);
          if (idx >= 0) merged[idx] = f;
          else merged.push(f);
        }
        // Re-convert if xlsx already loaded
        if (xlsxFile) doConvert(xlsxFile, merged);
        return merged;
      });
      e.target.value = "";
    },
    [xlsxFile, doConvert]
  );

  const handleRemoveCsv = useCallback(
    (name: string) => {
      setCsvFiles(prev => {
        const next = prev.filter(f => f.name !== name);
        if (xlsxFile) doConvert(xlsxFile, next);
        return next;
      });
    },
    [xlsxFile, doConvert]
  );

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex flex-col gap-1">
      <div className="flex items-center gap-3">
        {/* XLSX drop zone */}
        <div
          className={`flex-1 border-2 border-dashed rounded-lg px-4 py-2 text-center cursor-pointer transition-colors ${
            dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => xlsxInputRef.current?.click()}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-blue-600 text-sm">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Converting...</span>
            </div>
          ) : (
            <span className="text-gray-500 text-sm">
              {xlsxFile
                ? `📄 ${xlsxFile.name} — click to replace`
                : "Drop XLSForm (.xlsx) here or click to upload"}
            </span>
          )}
          <input ref={xlsxInputRef} type="file" accept=".xlsx" className="hidden" onChange={handleFileSelect} />
        </div>

        {/* CSV button */}
        <button
          type="button"
          className="text-sm px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors whitespace-nowrap border border-gray-200"
          onClick={() => csvInputRef.current?.click()}
        >
          + CSV files
          <input ref={csvInputRef} type="file" accept=".csv" multiple className="hidden" onChange={handleCsvSelect} />
        </button>

        {/* New Form button */}
        {onNewForm && (
          <button
            type="button"
            className="text-sm px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors whitespace-nowrap"
            onClick={onNewForm}
          >
            + New Form
          </button>
        )}

        {/* Export button */}
        {hasForm && onExport && (
          <button
            type="button"
            className="text-sm px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors whitespace-nowrap disabled:opacity-50"
            onClick={onExport}
            disabled={exporting}
          >
            {exporting ? "Exporting..." : "Export .xlsx"}
          </button>
        )}
      </div>

      {/* Validation error */}
      {validationError && (
        <p className="text-red-600 text-xs px-1">{validationError}</p>
      )}

      {/* CSV chips */}
      {csvFiles.length > 0 && (
        <div className="flex flex-wrap gap-1 px-1">
          {csvFiles.map(f => (
            <span key={f.name} className="flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-0.5">
              {f.name}
              <button
                type="button"
                className="text-blue-400 hover:text-red-500 ml-0.5 leading-none"
                onClick={() => handleRemoveCsv(f.name)}
                title="Remove"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
