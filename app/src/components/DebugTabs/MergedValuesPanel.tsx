import { useState, useEffect, useMemo, useCallback } from "react";
import type { FormVariable } from "../../types";
import type { FieldMeta } from "../../utils/xformParser";
import { parseXFormFields, getDefaultText } from "../../utils/xformParser";

interface MergedValuesPanelProps {
  readonly variables: readonly FormVariable[];
  readonly xformXml: string | null;
  readonly onQuestionSelect: (name: string) => void;
}

function getLiveValue(xpath: string): string {
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
    // ignore
  }
}

// --- Editable value cell ---

function EditableValue({
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

  const isNaN_ = value === "NaN";
  const isEmpty = value === "" || value === "-";

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
        className="w-full bg-gray-100 border border-blue-500 rounded px-1 py-0.5 text-xs font-mono text-blue-700 focus:outline-none"
      />
    );
  }

  return (
    <span
      title="Click to edit value"
      className={`font-mono text-xs cursor-pointer hover:underline ${
        isNaN_ ? "text-red-600" : isEmpty ? "text-gray-400" : "text-green-700"
      }`}
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
    >
      {isEmpty ? "—" : value}
      {isOverridden && (
        <span className="ml-1 text-[10px] bg-orange-100 text-orange-600 px-1 rounded">override</span>
      )}
    </span>
  );
}

// --- Main component ---

export function MergedValuesPanel({
  variables,
  xformXml,
  onQuestionSelect,
}: MergedValuesPanelProps) {
  const [search, setSearch] = useState("");
  const [nonEmptyOnly, setNonEmptyOnly] = useState(false);
  const [calcsOnly, setCalcsOnly] = useState(false);
  const [overrides, setOverrides] = useState<Set<string>>(new Set());
  const [liveCalcValues, setLiveCalcValues] = useState<Record<string, string>>({});

  const fields = useMemo(() => {
    if (!xformXml) return new Map<string, FieldMeta>();
    try {
      return parseXFormFields(xformXml);
    } catch {
      return new Map<string, FieldMeta>();
    }
  }, [xformXml]);

  // Build merged rows: all variables + calculate-only fields
  const rows = useMemo(() => {
    const variableMap = new Map<string, FormVariable>();
    for (const v of variables) {
      variableMap.set(v.name, v);
    }

    const result: Array<{
      name: string;
      xpath: string;
      label: string;
      value: string;
      formula: string;
      isCalc: boolean;
    }> = [];

    // Add all variables (they include regular fields)
    for (const v of variables) {
      const field = fields.get(v.name);
      result.push({
        name: v.name,
        xpath: v.xpath,
        label: field ? getDefaultText(field.labels) : "",
        value: v.value,
        formula: field?.calculation ?? "",
        isCalc: !!field?.calculation,
      });
    }

    // Add calculate-only fields not already in variables
    fields.forEach((field) => {
      if (field.calculation && !variableMap.has(field.name)) {
        result.push({
          name: field.name,
          xpath: field.xpath,
          label: getDefaultText(field.labels),
          value: liveCalcValues[field.xpath] ?? "",
          formula: field.calculation,
          isCalc: true,
        });
      }
    });

    return result;
  }, [variables, fields, liveCalcValues]);

  // Poll live values for calc fields
  const calcXpaths = useMemo(() => {
    return [...fields.values()].filter((f) => f.calculation).map((f) => f.xpath);
  }, [fields]);

  const refreshCalcValues = useCallback(() => {
    const updated: Record<string, string> = {};
    for (const xpath of calcXpaths) {
      updated[xpath] = getLiveValue(xpath);
    }
    setLiveCalcValues(updated);
  }, [calcXpaths]);

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

  // Filtering
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (calcsOnly && !r.isCalc) return false;
      if (nonEmptyOnly && (r.value === "" || r.value === "-")) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.name.toLowerCase().includes(q) &&
          !r.value.toLowerCase().includes(q) &&
          !r.formula.toLowerCase().includes(q) &&
          !r.label.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [rows, search, nonEmptyOnly, calcsOnly]);

  const handleOverride = (xpath: string, _value: string) => {
    setOverrides((prev) => new Set([...prev, xpath]));
    setTimeout(refreshCalcValues, 100);
  };

  const calcCount = rows.filter((r) => r.isCalc).length;

  if (variables.length === 0 && fields.size === 0) {
    return (
      <div className="p-4 text-gray-400 text-sm">
        No variables yet. Load a form and interact with it.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="px-3 py-2 border-b border-gray-200 flex gap-2 items-center shrink-0 flex-wrap">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[120px] bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
        <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={nonEmptyOnly}
            onChange={(e) => setNonEmptyOnly(e.target.checked)}
            className="accent-blue-500"
          />
          Non-empty
        </label>
        {calcCount > 0 && (
          <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={calcsOnly}
              onChange={(e) => setCalcsOnly(e.target.checked)}
              className="accent-blue-500"
            />
            Calcs only
          </label>
        )}
        <span className="text-xs text-gray-400 shrink-0">
          {filtered.length}/{rows.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-gray-100">
            <tr className="text-left text-gray-600 border-b border-gray-200">
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600">Field</th>
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                Value <span className="font-normal text-gray-400 normal-case">(click to edit)</span>
              </th>
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-600 max-w-48">Formula</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const isEmpty = row.value === "" || row.value === "-";
              const isNaN_ = row.value === "NaN";
              return (
                <tr
                  key={row.xpath || row.name}
                  className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !isEmpty && !isNaN_ ? "bg-blue-50/20" : ""
                  }`}
                  onClick={() => onQuestionSelect(row.name)}
                >
                  <td className="px-3 py-1.5">
                    <span className="text-blue-700 font-mono text-xs">{row.name}</span>
                    {row.isCalc && (
                      <span className="ml-1 text-[9px] bg-purple-100 text-purple-600 px-1 rounded">calc</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                    <EditableValue
                      xpath={row.xpath}
                      value={row.isCalc ? (liveCalcValues[row.xpath] ?? row.value) : row.value}
                      isOverridden={overrides.has(row.xpath)}
                      onOverride={handleOverride}
                    />
                  </td>
                  <td className="px-3 py-1.5 text-yellow-600 font-mono max-w-48 truncate" title={row.formula}>
                    {row.formula || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-4 text-gray-400 text-sm text-center">No matching variables.</div>
        )}
      </div>
    </div>
  );
}
