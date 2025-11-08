import { useState, useCallback, useRef, type DragEvent } from "react";
import axios from "axios";
import type { ConvertResponse, ExternalDataEntry } from "../types";

const API_URL = "http://localhost:5050/convert";

interface FileUploadBarProps {
  readonly onConvert: (xformXml: string, warnings: readonly string[], externalData: readonly ExternalDataEntry[]) => void;
  readonly onError: (error: string) => void;
}

export function FileUploadBar({ onConvert, onError }: FileUploadBarProps) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const xlsxInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const csvFilesRef = useRef<File[]>([]);

  const handleUpload = useCallback(
    async (xlsxFile: File) => {
      setLoading(true);
      setFileName(xlsxFile.name);

      try {
        const formData = new FormData();
        formData.append("xlsx_file", xlsxFile);
        csvFilesRef.current.forEach((csv) => {
          formData.append("csv_files", csv);
        });

        const response = await axios.post<ConvertResponse>(API_URL, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        onConvert(response.data.xform_xml, response.data.warnings, response.data.external_data ?? []);
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
      }
    },
    [onConvert, onError]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file?.name.endsWith(".xlsx")) {
        handleUpload(file);
      } else {
        onError("Please drop an .xlsx file");
      }
    },
    [handleUpload, onError]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleCsvSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        csvFilesRef.current = Array.from(e.target.files);
      }
    },
    []
  );

  return (
    <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center gap-4">
      <div
        className={`flex-1 border-2 border-dashed rounded-lg px-4 py-2 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-blue-400 bg-blue-900/30"
            : "border-gray-600 hover:border-gray-400"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => xlsxInputRef.current?.click()}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-blue-400">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Converting...</span>
          </div>
        ) : (
          <span className="text-gray-300 text-sm">
            {fileName
              ? `${fileName} — Drop or click to replace`
              : "Drop XLSForm (.xlsx) here or click to upload"}
          </span>
        )}
        <input
          ref={xlsxInputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      <button
        type="button"
        className="text-sm px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors whitespace-nowrap"
        onClick={() => csvInputRef.current?.click()}
      >
        + CSV files
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv"
          multiple
          className="hidden"
          onChange={handleCsvSelect}
        />
      </button>
      {csvFilesRef.current.length > 0 && (
        <span className="text-xs text-gray-500">
          {csvFilesRef.current.length} CSV
          {csvFilesRef.current.length > 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
