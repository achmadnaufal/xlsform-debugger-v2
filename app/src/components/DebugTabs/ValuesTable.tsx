import { Fragment, useState, useMemo, useCallback, useEffect } from "react";
import type { FormVariable, XlsRows } from "../../types";
import type { FieldMeta } from "../../utils/xformParser";
import { parseXFormFields } from "../../utils/xformParser";
import { FieldInspector } from "../FieldInspector";

interface ValueRow {
  readonly name: string;
  readonly xpath: string;
  readonly value: string;
  readonly type: string;
  readonly formula: string;
  readonly isCalculate: boolean;
  readonly fieldMeta: FieldMeta | null;
}

type StatusType = "empty" | "answered" | "calculated" | "hidden";

function getStatusType(row: ValueRow): StatusType {
  if (isFieldHidden(row.name)) return "hidden";
  if (row.isCalculate) return "calculated";
  if (row.value === "" || row.value === "-") return "empty";
  return "answered";
}

function isFieldHidden(name: string): boolean {
  try {
    const form = window.__enketoForm;
    if (form) {
      const el =
        document.querySelector(`.question[data-name*="${name}"]`) ??
        document.querySelector(`.question [name*="${name}"]`)?.closest(".question");
      if (!el) return false;
      return (
        el.classList.contains("disabled") ||
        el.classList.contains("hidden") ||
        el.closest(".disabled") !== null
      );
    }
  } catch {
    // fall through
  }
  const el =
    document.querySelector(`.question[data-name*="${name}"]`) ??
    document.querySelector(`.question [name*="${name}"]`)?.closest(".question");
  if (!el) return false;
  return (
    el.classList.contains("disabled") ||
    el.classList.contains("hidden") ||
    el.closest(".disabled") !== null
  );
}

function getEnketoValue(xpath: string): string {
  try {
    const form = window.__enketoForm;
    if (!form) return "";
    return String(form.model.node(xpath).getVal() ?? "");
  } catch {
    return "";
  }
}

function StatusBadge({ status }: { readonly status: StatusType }) {
  const styles = {
    empty: "bg-gray-200 text-gray-700",
    answered: "bg-green-100 text-green-700",
    calculated: "bg-blue-100 text-blue-700",
    hidden: "bg-orange-100 text-orange-700",
  };

  const labels = {
    empty: "empty",
    answered: "answered",
    calculated: "calculated",
    hidden: "hidden",
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}
      style={{ fontSize: "11px" }}
    >
      {labels[status]}
    </span>
  );
}

interface ValuesTableProps {
  readonly variables: readonly FormVariable[];
  readonly xformXml: string | null;
  readonly selectedQuestion: string | null;
  readonly onQuestionSelect: (name: string | null) => void;
  readonly xlsRows?: XlsRows;
}

export function ValuesTable({
  variables,
  xformXml,
  selectedQuestion,
  onQuestionSelect,
  xlsRows: _xlsRows,
}: ValuesTableProps) {
  const [filterText, setFilterText] = useState("");
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

  // When selectedQuestion changes, expand that row
  useEffect(() => {
    if (selectedQuestion) {
      setExpandedRow(selectedQuestion);
    }
  }, [selectedQuestion]);

  // Build merged rows
  const rows = useMemo<ValueRow[]>(() => {
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
        type: meta?.type ?? "unknown",
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
          type: f.type,
          formula: f.calculation,
          isCalculate: true,
          fieldMeta: f,
        });
      }
    }

    return result;
  }, [variables, fields, calcFields, liveCalcValues]);

  // Filter rows by name (case-insensitive)
  const filteredRows = useMemo(() => {
    if (!filterText.trim()) return rows;
    const query = filterText.toLowerCase();
    return rows.filter((r) => r.name.toLowerCase().includes(query));
  }, [rows, filterText]);

  // Export function
  const handleExport = () => {
    const csv = [
      "Name,Type,Current Value,Status",
      ...filteredRows.map((r) => {
        const status = getStatusType(r);
        return `"${r.name}","${r.type}","${r.value || ""}","${status}"`;
      }),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `variables-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (variables.length === 0 && calcFields.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
        <span>No variables yet. Load a form and interact with it.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-gray-700 shrink-0"
        style={{ minHeight: "60px" }}
      >
        <input
          type="text"
          placeholder="Filter variables..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          style={{ fontSize: "13px" }}
        />
        <button
          type="button"
          onClick={handleExport}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
          style={{ fontSize: "12px" }}
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filteredRows.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <span>No matching variables</span>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-gray-800 border-b border-gray-700 z-10">
              <tr>
                <th className="w-8" />
                <th
                  className="text-left font-semibold text-gray-300 px-4 py-3 border-r border-gray-700"
                  style={{ fontSize: "12px" }}
                >
                  Name
                </th>
                <th
                  className="text-left font-semibold text-gray-300 px-4 py-3 border-r border-gray-700"
                  style={{ fontSize: "12px" }}
                >
                  Type
                </th>
                <th
                  className="text-left font-semibold text-gray-300 px-4 py-3 border-r border-gray-700"
                  style={{ fontSize: "12px" }}
                >
                  Current Value
                </th>
                <th
                  className="text-left font-semibold text-gray-300 px-4 py-3"
                  style={{ fontSize: "12px" }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r) => {
                const status = getStatusType(r);
                const isExpanded = expandedRow === r.name;

                return (
                  <Fragment key={r.xpath}>
                    <tr
                      className={`border-b border-gray-700 hover:bg-gray-800 cursor-pointer transition-colors ${
                        isExpanded ? "bg-gray-800" : ""
                      }`}
                      onClick={() =>
                        setExpandedRow((prev) => (prev === r.name ? null : r.name))
                      }
                    >
                      <td className="px-4 py-3 text-gray-500 w-8">
                        <span
                          className={`inline-block transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        >
                          ▶
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 font-mono text-blue-400 border-r border-gray-700"
                        style={{ fontSize: "13px" }}
                      >
                        {r.name}
                      </td>
                      <td
                        className="px-4 py-3 text-gray-400 border-r border-gray-700"
                        style={{ fontSize: "11px" }}
                      >
                        {r.type}
                      </td>
                      <td
                        className="px-4 py-3 font-mono text-gray-200 border-r border-gray-700 max-w-xs truncate"
                        title={r.value}
                        style={{ fontSize: "13px" }}
                      >
                        {r.value || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <div className="bg-gray-50 border-t border-gray-200">
                            <FieldInspector
                              selectedFieldName={r.name}
                              field={r.fieldMeta}
                              formValues={formValues}
                              fields={fields}
                              xlsRows={_xlsRows || { survey: [], choices: [], settings: [] }}
                              onFieldSelect={onQuestionSelect}
                              onClose={() => setExpandedRow(null)}
                              onUpdate={async () => {
                                // Read-only for now - edits would go to XLSFormEditor
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
