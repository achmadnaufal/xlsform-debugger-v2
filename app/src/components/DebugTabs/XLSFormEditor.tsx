import { useState, useMemo, useCallback, useEffect } from "react";

type RowData = Record<string, unknown>;

interface XLSFormEditorProps {
  readonly surveyRows: readonly RowData[];
  readonly choicesRows: readonly RowData[];
  readonly settingsRows: readonly RowData[];
  readonly onApply: (
    survey: readonly RowData[],
    choices: readonly RowData[],
    settings: readonly RowData[],
  ) => Promise<void>;
}

type SheetTab = "survey" | "choices" | "settings";

// Preferred column order for survey sheet
const PREFERRED_SURVEY_ORDER = [
  "type", "name", "label", "hint", "relevant", "constraint",
  "calculation", "required", "read_only", "choice_filter", "appearance",
];

function getColumnOrder(rows: readonly RowData[], preferredOrder: readonly string[]): string[] {
  const allCols = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      allCols.add(key);
    }
  }

  const ordered: string[] = [];
  for (const col of preferredOrder) {
    if (allCols.has(col)) {
      ordered.push(col);
      allCols.delete(col);
    }
  }
  // Add remaining columns in their natural order
  for (const col of allCols) {
    ordered.push(col);
  }
  return ordered;
}

function EditableCell({
  value,
  onChange,
}: {
  readonly value: string;
  readonly onChange: (newValue: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const startEdit = () => {
    setDraft(String(value));
    setEditing(true);
  };

  const commit = () => {
    onChange(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        className="w-full bg-white border border-blue-500 rounded px-1 py-0.5 font-mono focus:outline-none"
      />
    );
  }

  return (
    <span
      onClick={startEdit}
      className="block w-full cursor-pointer hover:bg-blue-50 px-1 py-0.5 rounded font-mono truncate min-h-[1.25rem]"
      title={String(value) || "(empty) — click to edit"}
    >
      {value || <span className="text-gray-300">-</span>}
    </span>
  );
}

function SheetTable({
  rows,
  columns,
  onCellChange,
  onDeleteRow,
  onAddRow,
}: {
  readonly rows: readonly RowData[];
  readonly columns: readonly string[];
  readonly onCellChange: (rowIndex: number, column: string, value: string) => void;
  readonly onDeleteRow: (rowIndex: number) => void;
  readonly onAddRow: () => void;
}) {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  if (rows.length === 0 && columns.length === 0) {
    return (
      <div className="p-4 text-gray-400 ">
        No data in this sheet.
        <button
          type="button"
          onClick={onAddRow}
          className="ml-2 text-blue-600 hover:underline"
        >
          Add a row
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-auto flex-1">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-gray-100 z-10">
          <tr className="border-b border-gray-200">
            <th className="px-1 py-1.5 text-center text-gray-400 w-8">#</th>
            {columns.map((col) => (
              <th
                key={col}
                className="px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-600 whitespace-nowrap"
              >
                {col}
              </th>
            ))}
            <th className="px-1 py-1.5 w-8" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-1 py-0.5 text-center text-gray-400 text-[10px]">
                {rowIdx + 1}
              </td>
              {columns.map((col) => (
                <td key={col} className="px-1 py-0.5 max-w-40">
                  <EditableCell
                    value={String(row[col] ?? "")}
                    onChange={(newVal) => onCellChange(rowIdx, col, newVal)}
                  />
                </td>
              ))}
              <td className="px-1 py-0.5 text-center">
                {deleteConfirm === rowIdx ? (
                  <span className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => { onDeleteRow(rowIdx); setDeleteConfirm(null); }}
                      className="text-red-600 hover:text-red-800 text-[10px] font-medium"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(null)}
                      className="text-gray-400 hover:text-gray-600 text-[10px]"
                    >
                      No
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(rowIdx)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    title="Delete row"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-2 border-t border-gray-200">
        <button
          type="button"
          onClick={onAddRow}
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          + Add row
        </button>
      </div>
    </div>
  );
}

export function XLSFormEditor({
  surveyRows,
  choicesRows,
  settingsRows,
  onApply,
}: XLSFormEditorProps) {
  const [activeSheet, setActiveSheet] = useState<SheetTab>("survey");
  const [editSurvey, setEditSurvey] = useState<RowData[]>([]);
  const [editChoices, setEditChoices] = useState<RowData[]>([]);
  const [editSettings, setEditSettings] = useState<RowData[]>([]);
  const [dirty, setDirty] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Reset editor state when source rows change
  useEffect(() => {
    setEditSurvey(surveyRows.map((r) => ({ ...r })));
    setEditChoices(choicesRows.map((r) => ({ ...r })));
    setEditSettings(settingsRows.map((r) => ({ ...r })));
    setDirty(false);
    setApplyError(null);
  }, [surveyRows, choicesRows, settingsRows]);

  const surveyColumns = useMemo(
    () => getColumnOrder(editSurvey, PREFERRED_SURVEY_ORDER),
    [editSurvey]
  );
  const choicesColumns = useMemo(
    () => getColumnOrder(editChoices, ["list_name", "name", "label"]),
    [editChoices]
  );
  const settingsColumns = useMemo(
    () => getColumnOrder(editSettings, ["form_title", "form_id"]),
    [editSettings]
  );

  const makeOnCellChange = useCallback(
    (setter: React.Dispatch<React.SetStateAction<RowData[]>>) =>
      (rowIndex: number, column: string, value: string) => {
        setter((prev) => {
          const updated = [...prev];
          updated[rowIndex] = { ...updated[rowIndex], [column]: value };
          return updated;
        });
        setDirty(true);
        setApplyError(null);
      },
    []
  );

  const makeOnDeleteRow = useCallback(
    (setter: React.Dispatch<React.SetStateAction<RowData[]>>) =>
      (rowIndex: number) => {
        setter((prev) => prev.filter((_, i) => i !== rowIndex));
        setDirty(true);
        setApplyError(null);
      },
    []
  );

  const makeOnAddRow = useCallback(
    (setter: React.Dispatch<React.SetStateAction<RowData[]>>, columns: readonly string[]) =>
      () => {
        const emptyRow: RowData = {};
        for (const col of columns) {
          emptyRow[col] = "";
        }
        setter((prev) => [...prev, emptyRow]);
        setDirty(true);
      },
    []
  );

  const handleApply = useCallback(async () => {
    setApplying(true);
    setApplyError(null);
    try {
      await onApply(editSurvey, editChoices, editSettings);
      setDirty(false);
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setApplying(false);
    }
  }, [onApply, editSurvey, editChoices, editSettings]);

  const hasData = surveyRows.length > 0 || choicesRows.length > 0 || settingsRows.length > 0;

  if (!hasData) {
    return (
      <div className="p-4 text-gray-400 ">
        No form loaded. Upload an XLSForm to edit it here.
      </div>
    );
  }

  const sheets: { id: SheetTab; label: string; count: number }[] = [
    { id: "survey", label: "Survey", count: editSurvey.length },
    { id: "choices", label: "Choices", count: editChoices.length },
    { id: "settings", label: "Settings", count: editSettings.length },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Sheet tabs + Apply button */}
      <div className="flex items-center justify-between border-b border-gray-200 px-2 shrink-0">
        <div className="flex">
          {sheets.map((sheet) => (
            <button
              key={sheet.id}
              type="button"
              onClick={() => setActiveSheet(sheet.id)}
              className={`px-3 py-1.5 font-medium transition-colors ${
                activeSheet === sheet.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {sheet.label}
              {sheet.count > 0 && (
                <span className="ml-1 text-[10px] text-gray-400">({sheet.count})</span>
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleApply}
          disabled={!dirty || applying}
          className={`px-3 py-1 rounded transition-colors ${
            applying
              ? "bg-blue-100 text-blue-500 cursor-wait"
              : dirty
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {applying ? "Converting..." : dirty ? "Apply Changes" : "No changes"}
        </button>
      </div>

      {/* Error display */}
      {applyError && (
        <div className="px-3 py-2 bg-red-50 border-b border-red-200 text-red-700">
          <span className="font-medium">Conversion error: </span>
          {applyError}
        </div>
      )}

      {/* Active sheet table */}
      {activeSheet === "survey" && (
        <SheetTable
          rows={editSurvey}
          columns={surveyColumns}
          onCellChange={makeOnCellChange(setEditSurvey)}
          onDeleteRow={makeOnDeleteRow(setEditSurvey)}
          onAddRow={makeOnAddRow(setEditSurvey, surveyColumns)}
        />
      )}
      {activeSheet === "choices" && (
        <SheetTable
          rows={editChoices}
          columns={choicesColumns}
          onCellChange={makeOnCellChange(setEditChoices)}
          onDeleteRow={makeOnDeleteRow(setEditChoices)}
          onAddRow={makeOnAddRow(setEditChoices, choicesColumns)}
        />
      )}
      {activeSheet === "settings" && (
        <SheetTable
          rows={editSettings}
          columns={settingsColumns}
          onCellChange={makeOnCellChange(setEditSettings)}
          onDeleteRow={makeOnDeleteRow(setEditSettings)}
          onAddRow={makeOnAddRow(setEditSettings, settingsColumns)}
        />
      )}
    </div>
  );
}
