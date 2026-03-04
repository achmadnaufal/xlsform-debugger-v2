import { useState, useEffect, useMemo, useCallback } from "react";
import { parseXFormFields } from "../../utils/xformParser";
import type { FieldMeta } from "../../utils/xformParser";

interface CalculationsPanelProps {
  readonly xformXml: string | null;
}

interface CalcRow {
  readonly name: string;
  readonly xpath: string;
  readonly label: string;
  readonly formula: string;
  liveValue: string;
  overridden?: boolean;
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

function triggerDataUpdate(): void {
  try {
    const form = window.__enketoForm;
    if (!form) return;
    form.view.$.trigger("dataupdate");
  } catch {
    // ignore
  }
}

function setLiveValue(xpath: string, value: string): void {
  try {
    const form = window.__enketoForm;
    if (!form) return;
    form.model.node(xpath).setVal(value, null, "string");
    triggerDataUpdate();
  } catch {
    // ignore
  }
}

function ValueCell({
  row,
  overrides,
  onOverride,
}: {
  row: CalcRow;
  overrides: Record<string, string>;
  onOverride: (xpath: string, value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const isNaN_ = row.liveValue === "NaN";
  const isEmpty = row.liveValue === "" || row.liveValue === "-";
  const isOverridden = (xp: string) => !!overrides[xp];

  const commit = () => {
    setLiveValue(row.xpath, draft);
    onOverride(row.xpath, draft);
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
        className="w-full bg-gray-700 border border-blue-500 rounded px-1 py-0.5 text-xs font-mono text-blue-200 focus:outline-none"
      />
    );
  }

  return (
    <span
      className={`font-mono text-xs cursor-pointer hover:underline ${
        isNaN_ ? "text-red-400" : isEmpty ? "text-gray-600" : "text-green-300"
      }`}
      title="Click to override value"
      onClick={() => {
        setDraft(row.liveValue);
        setEditing(true);
      }}
    >
      {isEmpty ? "—" : row.liveValue}
      {isOverridden(row.xpath) && (
        <span className="ml-1 text-[10px] bg-orange-800/50 text-orange-300 px-1 rounded">override</span>
      )}
    </span>
  );
}

export function CalculationsPanel({ xformXml }: CalculationsPanelProps) {
  const [search, setSearch] = useState("");
  const [liveValues, setLiveValues] = useState<Record<string, string>>({});
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const calcFields = useMemo<FieldMeta[]>(() => {
    if (!xformXml) return [];
    try {
      const map = parseXFormFields(xformXml);
      return [...map.values()].filter((f) => !!f.calculation);
    } catch {
      return [];
    }
  }, [xformXml]);

  const refresh = useCallback(() => {
    const updated: Record<string, string> = {};
    for (const f of calcFields) {
      updated[f.xpath] = getLiveValue(f.xpath);
    }
    setLiveValues(updated);
  }, [calcFields]);

  // Auto-refresh every 2 seconds
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [refresh]);

  // Also listen for enketo dataupdate events
  useEffect(() => {
    const handler = () => refresh();
    document.addEventListener("dataupdate", handler);
    return () => document.removeEventListener("dataupdate", handler);
  }, [refresh]);

  const rows: CalcRow[] = calcFields.map((f) => ({
    name: f.name,
    xpath: f.xpath,
    label: f.label,
    formula: f.calculation,
    liveValue: liveValues[f.xpath] ?? "",
  }));

  const filtered = rows.filter(
    (r) =>
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.formula.toLowerCase().includes(search.toLowerCase()) ||
      r.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleOverride = (xpath: string, value: string) => {
    setOverrides((prev) => ({ ...prev, [xpath]: value }));
    setTimeout(refresh, 100);
  };

  if (!xformXml) {
    return <div className="p-4 text-gray-500 text-sm">No form loaded.</div>;
  }

  if (calcFields.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        No calculate fields found in this form.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-gray-700 shrink-0 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Search calculations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <span className="text-xs text-gray-500 shrink-0">{calcFields.length} calcs</span>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-gray-800">
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Name</th>
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Label</th>
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 max-w-48">Formula</th>
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Live Value</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const isNaN_ = row.liveValue === "NaN";
              const isEmpty = row.liveValue === "" || row.liveValue === "-";
              return (
                <tr key={row.xpath} className={`border-b border-gray-800 hover:bg-gray-800/50 ${!isEmpty && !isNaN_ ? "bg-gray-800/10" : ""}`}>
                  <td className="px-3 py-1.5 text-blue-300 font-mono whitespace-nowrap">{row.name}</td>
                  <td className="px-3 py-1.5 text-gray-400 max-w-32 truncate">{row.label || "—"}</td>
                  <td className="px-3 py-1.5 text-yellow-200/70 font-mono max-w-48 truncate" title={row.formula}>{row.formula}</td>
                  <td className="px-3 py-1.5 min-w-24">
                    <ValueCell row={row} overrides={overrides} onOverride={handleOverride} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-4 text-gray-500 text-sm text-center">No matches.</div>
        )}
      </div>
    </div>
  );
}
