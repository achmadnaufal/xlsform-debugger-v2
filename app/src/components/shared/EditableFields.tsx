import { useState, useEffect } from "react";
import { extractVarRefs } from "../../utils/xformParser";

// --- Formula status ---

export type FormulaStatus = "valid" | "error" | "incomplete" | "none";

export function getFormulaStatus(formula: string, formValues: Record<string, string>): FormulaStatus {
  if (!formula) return "none";

  try {
    if (formula.includes("${")) {
      const refs = extractVarRefs(formula);
      const missing = refs.filter((ref) => !(ref in formValues));
      if (missing.length > 0) return "incomplete";
    }

    if (formula.startsWith("if(") || formula.startsWith("selected(")) {
      return "valid";
    }

    return "valid";
  } catch {
    return "error";
  }
}

// --- Status badge ---

export function StatusBadge({ status }: { readonly status: FormulaStatus }) {
  if (status === "none") return null;

  const config = {
    valid: { icon: "\u2705", label: "Valid", bg: "bg-green-100", text: "text-green-700" },
    error: { icon: "\u274C", label: "Error", bg: "bg-red-100", text: "text-red-700" },
    incomplete: { icon: "\u26A0\uFE0F", label: "Incomplete", bg: "bg-yellow-100", text: "text-yellow-700" },
  };

  const cfg = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// --- Editable formula field ---

export function EditableFormula({
  value,
  status,
  onChange,
  readOnly = false,
}: {
  readonly value: string;
  readonly status: FormulaStatus;
  readonly onChange: (value: string) => void;
  readonly readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  if (readOnly) {
    return (
      <div className="space-y-1">
        {value ? (
          <>
            <div className="font-mono text-sm bg-gray-50 border border-gray-200 rounded p-2 text-gray-700 break-all whitespace-pre-wrap max-h-24 overflow-auto">
              {value}
            </div>
            <div className="flex justify-between items-center">
              <StatusBadge status={status} />
            </div>
          </>
        ) : (
          <div className="text-gray-400 italic">&mdash;</div>
        )}
      </div>
    );
  }

  if (editing) {
    return (
      <div className="space-y-1">
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            onChange(draft);
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setEditing(false);
            }
            if (e.key === "Enter" && e.ctrlKey) {
              onChange(draft);
              setEditing(false);
            }
          }}
          className="w-full font-mono text-sm bg-white border-2 border-blue-500 rounded p-2 text-gray-900 focus:outline-none resize-none"
          rows={3}
        />
        <div className="text-xs text-gray-500">(Ctrl+Enter to save, Esc to cancel)</div>
      </div>
    );
  }

  return (
    <div
      className="space-y-1 cursor-pointer"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
    >
      {value ? (
        <>
          <div className="font-mono text-sm bg-gray-50 border border-gray-200 rounded p-2 text-gray-700 break-all whitespace-pre-wrap max-h-24 overflow-auto hover:bg-gray-100 transition-colors">
            {value}
          </div>
          <div className="flex justify-between items-center">
            <StatusBadge status={status} />
            <span className="text-xs text-blue-600 hover:underline">edit</span>
          </div>
        </>
      ) : (
        <div className="text-gray-400 italic hover:text-gray-600">&mdash; (click to add)</div>
      )}
    </div>
  );
}

// --- Editable text field ---

export function EditableTextField({
  value,
  onChange,
  readOnly = false,
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  if (readOnly) {
    return (
      <div className="text-gray-700">
        {value || <span className="text-gray-400 italic">&mdash;</span>}
      </div>
    );
  }

  if (editing) {
    return (
      <input
        autoFocus
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          onChange(draft);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onChange(draft);
            setEditing(false);
          }
          if (e.key === "Escape") {
            setEditing(false);
          }
        }}
        className="w-full bg-white border-2 border-blue-500 rounded px-2 py-1 text-gray-900 focus:outline-none font-mono text-sm"
      />
    );
  }

  return (
    <div
      className="text-gray-700 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 transition-colors"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
    >
      {value || <span className="text-gray-400 italic">&mdash;</span>}
    </div>
  );
}

// --- Required toggle ---

export function RequiredToggle({
  value,
  onChange,
  readOnly = false,
}: {
  readonly value: boolean;
  readonly onChange: (value: boolean) => void;
  readonly readOnly?: boolean;
}) {
  if (readOnly) {
    return (
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={value} disabled className="accent-blue-500" />
        <span className="text-gray-600">{value ? "Required" : "Optional"}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-blue-500 cursor-pointer w-4 h-4"
      />
      <label className="text-gray-600 cursor-pointer">{value ? "Required" : "Optional"}</label>
    </div>
  );
}

// --- Dependency chips ---

export function DependencyChips({
  deps,
  title,
  onSelect,
}: {
  readonly deps: readonly string[];
  readonly title: string;
  readonly onSelect: (name: string) => void;
}) {
  if (deps.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
        {title} ({deps.length})
      </h4>
      <div className="flex flex-wrap gap-2">
        {deps.map((dep) => (
          <button
            key={dep}
            onClick={() => onSelect(dep)}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-mono hover:bg-blue-200 transition-colors cursor-pointer"
          >
            {dep}
          </button>
        ))}
      </div>
    </div>
  );
}
