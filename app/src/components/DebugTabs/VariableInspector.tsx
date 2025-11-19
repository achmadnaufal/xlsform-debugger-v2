import { useState, useMemo } from "react";
import type { FormVariable } from "../../types";

interface VariableInspectorProps {
  readonly variables: readonly FormVariable[];
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

function EditableValue({
  variable,
  overrides,
  onOverride,
}: {
  variable: FormVariable;
  overrides: Set<string>;
  onOverride: (xpath: string, value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const isNaN_ = variable.value === "NaN";
  const isEmpty = variable.value === "" || variable.value === "-";
  const isOverridden = overrides.has(variable.xpath);

  const commit = () => {
    setEnketoValue(variable.xpath, draft);
    onOverride(variable.xpath, draft);
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
      title="Click to edit value"
      className={`font-mono text-xs cursor-pointer hover:underline ${
        isNaN_ ? "text-red-400" : isEmpty ? "text-gray-600" : "text-green-300"
      }`}
      onClick={() => {
        setDraft(variable.value);
        setEditing(true);
      }}
    >
      {isEmpty ? "—" : variable.value}
      {isOverridden && (
        <span className="ml-1 text-[10px] bg-orange-800/50 text-orange-300 px-1 rounded">override</span>
      )}
    </span>
  );
}

export function VariableInspector({ variables }: VariableInspectorProps) {
  const [search, setSearch] = useState("");
  const [nonEmptyOnly, setNonEmptyOnly] = useState(false);
  const [overrides, setOverrides] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return variables.filter((v) => {
      const matchSearch =
        !search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.value.toLowerCase().includes(search.toLowerCase());
      const matchNonEmpty = !nonEmptyOnly || (v.value !== "" && v.value !== "-");
      return matchSearch && matchNonEmpty;
    });
  }, [variables, search, nonEmptyOnly]);

  const handleOverride = (xpath: string, _value: string) => {
    setOverrides((prev) => new Set([...prev, xpath]));
  };

  if (variables.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        No variables yet. Load a form and interact with it.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-gray-700 flex gap-2 items-center shrink-0">
        <input
          type="text"
          placeholder="Search field or value..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={nonEmptyOnly}
            onChange={(e) => setNonEmptyOnly(e.target.checked)}
            className="accent-blue-500"
          />
          Non-empty only
        </label>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-800">
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="px-3 py-2 font-medium">Field</th>
              <th className="px-3 py-2 font-medium">XPath</th>
              <th className="px-3 py-2 font-medium">Value <span className="font-normal text-gray-600">(click to edit)</span></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const isEmpty = v.value === "" || v.value === "-";
              return (
                <tr
                  key={v.xpath}
                  className={`border-b border-gray-800 hover:bg-gray-800/50 ${!isEmpty ? "bg-gray-800/20" : ""}`}
                >
                  <td className="px-3 py-1.5 text-blue-300 font-mono text-xs">{v.name}</td>
                  <td className="px-3 py-1.5 text-gray-500 font-mono text-xs truncate max-w-48">{v.xpath}</td>
                  <td className="px-3 py-1.5 text-xs">
                    <EditableValue
                      variable={v}
                      overrides={overrides}
                      onOverride={handleOverride}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-4 text-gray-500 text-sm text-center">No matching variables.</div>
        )}
      </div>
    </div>
  );
}
