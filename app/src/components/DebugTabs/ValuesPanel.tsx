import { useState, useEffect, useMemo, useCallback } from "react";
import type { FormVariable, XlsRows } from "../../types";
import type { FieldMeta } from "../../utils/xformParser";
import { parseXFormFields } from "../../utils/xformParser";
import { FieldInspector } from "../FieldInspector";

// --- Enketo helpers ---

function getEnketoValue(xpath: string): string {
  try {
    const form = window.__enketoForm;
    if (!form) return "";
    return String(form.model.node(xpath).getVal() ?? "");
  } catch {
    return "";
  }
}

function setEnketoValue(xpath: string, value: string): void {
  try {
    const form = window.__enketoForm;
    if (!form) return;
    form.model.node(xpath).setVal(value, null, "string");
    form.view.$.trigger("dataupdate");
  } catch {
    // ignore — field may not exist in model
  }
}

// --- Merged row type ---

interface ValueRow {
  readonly name: string;
  readonly xpath: string;
  readonly value: string;
  readonly formula: string;
  readonly isCalculate: boolean;
  readonly fieldMeta: FieldMeta | null;
}

// --- Inline edit component ---

function InlineValueEditor({
  xpath,
  value,
  isOverridden,
  onOverride,
}: {
  readonly xpath: string;
  readonly value: string;
  readonly isOverridden: boolean;
  readonly onOverride: (xpath: string, value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const isEmpty = value === "" || value === "-" || value === undefined || value === "NaN";

  const commit = () => {
    setEnketoValue(xpath, draft);
    onOverride(xpath, draft);
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
        className="w-full bg-gray-100 border border-blue-500 rounded px-1 py-0.5 font-mono text-blue-700 focus:outline-none"
      />
    );
  }

  return (
    <span
      title="Click to edit value"
      className={`font-mono cursor-pointer hover:underline ${
        isEmpty ? "text-gray-400" : "text-green-700"
      }`}
      onClick={() => {
        setDraft(isEmpty ? "" : value);
        setEditing(true);
      }}
    >
      {isEmpty ? "\u2014" : value}
      {isOverridden && (
        <span className="ml-1 bg-orange-100 text-orange-600 px-1 rounded">
          override
        </span>
      )}
    </span>
  );
}

// --- Main component ---

interface ValuesPanelProps {
  readonly variables: readonly FormVariable[];
  readonly xformXml: string | null;
  readonly selectedQuestion: string | null;
  readonly onQuestionSelect: (name: string | null) => void;
  readonly xlsRows: XlsRows;
  readonly onUpdateField: (fieldName: string, updates: Record<string, string>) => void;
  readonly onApplyEdits: () => Promise<void>;
}

export function ValuesPanel({
  variables,
  xformXml,
  selectedQuestion,
  onQuestionSelect,
  xlsRows,
  onUpdateField,
  onApplyEdits,
}: ValuesPanelProps) {
  const [search, setSearch] = useState("");
  const [nonEmptyOnly, setNonEmptyOnly] = useState(false);
  const [calcsOnly, setCalcsOnly] = useState(false);
  const [overrides, setOverrides] = useState<Set<string>>(new Set());
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [liveCalcValues, setLiveCalcValues] = useState<Record<string, string>>({});

  // Parse fields from xform
  const fields = useMemo<Map<string, FieldMeta>>(() => {
    if (!xformXml) return new Map();
    try {
      return parseXFormFields(xformXml);
    } catch {
      return new Map();
    }
  }, [xformXml]);

  // Build form values lookup
  const formValues = useMemo(() => {
    const values: Record<string, string> = {};
    for (const v of variables) {
      values[v.name] = v.value;
    }
    return values;
  }, [variables]);

  // Identify calculate fields for live polling
  const calcFields = useMemo(() => {
    return [...fields.values()].filter((f) => !!f.calculation);
  }, [fields]);

  // Live polling for calculate fields
  const refreshCalcValues = useCallback(() => {
    const updated: Record<string, string> = {};
    for (const f of calcFields) {
      updated[f.xpath] = getEnketoValue(f.xpath);
    }
    setLiveCalcValues(updated);
  }, [calcFields]);

  useEffect(() => {
    refreshCalcValues();
    const id = setInterval(refreshCalcValues, 2000);
    return () => clearInterval(id);
  }, [refreshCalcValues]);

  useEffect(() => {
    const handler = () => refreshCalcValues();
    document.addEventListener("dataupdate", handler);
    return () => document.removeEventListener("dataupdate", handler);
  }, [refreshCalcValues]);

  // When selectedQuestion changes, sync expanded row (reset on null)
  useEffect(() => {
    setExpandedRow(selectedQuestion);
  }, [selectedQuestion]);

  // Build merged rows
  const rows = useMemo<ValueRow[]>(() => {
    const variableMap = new Map<string, FormVariable>();
    for (const v of variables) {
      variableMap.set(v.name, v);
    }

    // Start with all variables from formState
    const seen = new Set<string>();
    const result: ValueRow[] = [];

    for (const v of variables) {
      seen.add(v.name);
      const meta = fields.get(v.name) ?? null;
      const isCalc = !!meta?.calculation;
      result.push({
        name: v.name,
        xpath: v.xpath,
        value: isCalc ? (liveCalcValues[meta!.xpath] ?? v.value) : v.value,
        formula: meta?.calculation ?? "",
        isCalculate: isCalc,
        fieldMeta: meta,
      });
    }

    // Add calculate-only fields not in variables list
    for (const f of calcFields) {
      if (!seen.has(f.name)) {
        seen.add(f.name);
        result.push({
          name: f.name,
          xpath: f.xpath,
          value: liveCalcValues[f.xpath] ?? "",
          formula: f.calculation,
          isCalculate: true,
          fieldMeta: f,
        });
      }
    }

    return result;
  }, [variables, fields, calcFields, liveCalcValues]);

  // Filter
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (nonEmptyOnly && (r.value === "" || r.value === "-" || r.value === "\u2014" || r.value == null || r.value === "NaN")) return false;
      if (calcsOnly && !r.isCalculate) return false;
      if (
        search &&
        !r.name.toLowerCase().includes(search.toLowerCase()) &&
        !r.value.toLowerCase().includes(search.toLowerCase()) &&
        !r.formula.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [rows, search, nonEmptyOnly, calcsOnly]);

  const handleOverride = (xpath: string, _value: string) => {
    setOverrides((prev) => new Set([...prev, xpath]));
    setTimeout(refreshCalcValues, 100);
  };

  const handleSelectField = (name: string) => {
    setExpandedRow(name);
    onQuestionSelect(name);
  };

  const handleCloseInspector = () => {
    setExpandedRow(null);
  };

  const selectedField = selectedQuestion ? fields.get(selectedQuestion) ?? null : null;

  const handleUpdate = async (fieldName: string, updates: Record<string, string>) => {
    onUpdateField(fieldName, updates);
    await onApplyEdits();
  };

  if (variables.length === 0 && calcFields.length === 0) {
    return (
      <div className="p-4 text-gray-400 ">
        No variables yet. Load a form and interact with it.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-3 py-2 border-b border-gray-200 flex gap-2 items-center shrink-0">
        <input
          type="text"
          placeholder="Search fields..."
          aria-label="Search fields"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
        <label className="flex items-center gap-1.5 text-gray-600 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={nonEmptyOnly}
            onChange={(e) => setNonEmptyOnly(e.target.checked)}
            className="accent-blue-500"
          />
          Non-empty
        </label>
        <label className="flex items-center gap-1.5 text-gray-600 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={calcsOnly}
            onChange={(e) => setCalcsOnly(e.target.checked)}
            className="accent-blue-500"
          />
          Calcs only
        </label>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1 min-h-0">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr className="text-left text-gray-600 border-b border-gray-200">
              <th className="px-3 py-2 font-semibold uppercase tracking-wider w-5" />
              <th className="px-3 py-2 font-semibold uppercase tracking-wider text-gray-600">
                Field
              </th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wider text-gray-600">
                Value
              </th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wider text-gray-600">
                Formula
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const isEmpty = r.value === "" || r.value === "-" || r.value === undefined || r.value === "NaN";
              const isSelected = expandedRow === r.name;

              return (
                <tr
                  key={r.xpath}
                  className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !isEmpty ? "bg-blue-50/30" : ""
                  } ${isSelected ? "bg-blue-100 border-l-4 border-l-blue-500" : ""}`}
                  onClick={() => handleSelectField(r.name)}
                >
                  <td className="px-3 py-1.5 text-gray-400">
                    <span className={`transition-transform inline-block ${isSelected ? "rotate-90" : ""}`}>
                      {"\u25B6"}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-blue-700 font-mono whitespace-nowrap">
                    {r.name}
                    {r.isCalculate && (
                      <span className="ml-1.5 text-[9px] bg-purple-100 text-purple-600 px-1 rounded">
                        calc
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                    <InlineValueEditor
                      xpath={r.xpath}
                      value={r.value}
                      isOverridden={overrides.has(r.xpath)}
                      onOverride={handleOverride}
                    />
                  </td>
                  <td className="px-3 py-1.5 text-yellow-600 font-mono max-w-48 truncate" title={r.formula}>
                    {r.formula || "\u2014"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-4 text-gray-400 text-center">No matching fields.</div>
        )}
      </div>

      {/* Bottom: Field Inspector (shown when a row is selected) */}
      {expandedRow !== null && (
        <div className="h-72 shrink-0 border-t border-gray-200 bg-white overflow-auto relative">
          <button
            onClick={handleCloseInspector}
            className="absolute top-2 right-2 z-10 text-gray-400 hover:text-gray-700 bg-white rounded-full w-6 h-6 flex items-center justify-center border border-gray-200"
            title="Close inspector"
          >
            {"\u2715"}
          </button>
          <FieldInspector
            selectedFieldName={selectedQuestion}
            field={selectedField}
            formValues={formValues}
            fields={fields}
            xlsRows={xlsRows}
            onFieldSelect={handleSelectField}
            onClose={handleCloseInspector}
            onUpdate={handleUpdate}
          />
        </div>
      )}
    </div>
  );
}

