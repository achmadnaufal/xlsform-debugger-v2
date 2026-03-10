import { useState, useMemo, useEffect } from "react";
import type { FieldMeta } from "../utils/xformParser";
import { extractVarRefs } from "../utils/xformParser";
import type { XlsRows } from "../types";

// --- Formula evaluation badge ---

type FormulaStatus = "valid" | "error" | "incomplete" | "none";

function getFormulaStatus(formula: string, formValues: Record<string, string>): FormulaStatus {
  if (!formula) return "none";

  try {
    if (formula.includes("${")) {
      // Check if all variables are present
      const refs = extractVarRefs(formula);
      const missing = refs.filter((ref) => !(ref in formValues));
      if (missing.length > 0) return "incomplete";
    }

    // Try to evaluate
    if (formula.startsWith("if(") || formula.startsWith("selected(")) {
      // These need actual evaluation, hard to validate without context
      return "valid";
    }

    return "valid";
  } catch {
    return "error";
  }
}

function StatusBadge({ status }: { readonly status: FormulaStatus }) {
  if (status === "none") return null;

  const config = {
    valid: { icon: "✅", label: "Valid", bg: "bg-green-100", text: "text-green-700" },
    error: { icon: "❌", label: "Error", bg: "bg-red-100", text: "text-red-700" },
    incomplete: { icon: "⚠️", label: "Incomplete", bg: "bg-yellow-100", text: "text-yellow-700" },
  };

  const cfg = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// --- Editable formula field ---

function EditableFormula({
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
          <div className="text-gray-400 italic">—</div>
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
        <div className="text-gray-400 italic hover:text-gray-600">— (click to add)</div>
      )}
    </div>
  );
}

// --- Editable text field ---

function EditableTextField({
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
        {value || <span className="text-gray-400 italic">—</span>}
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
      {value || <span className="text-gray-400 italic">—</span>}
    </div>
  );
}

// --- Type dropdown ---

const XFORM_TYPES = [
  "text",
  "integer",
  "decimal",
  "select_one",
  "select_multiple",
  "date",
  "time",
  "datetime",
  "geopoint",
  "geoshape",
  "image",
  "audio",
  "video",
  "barcode",
  "file",
  "note",
  "group",
  "repeat",
  "calculate",
  "hidden",
  "acknowledge",
] as const;

function TypeDropdown({
  value,
  onChange,
  readOnly = false,
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly readOnly?: boolean;
}) {
  if (readOnly) {
    return <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{value || "—"}</div>;
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-gray-900 focus:outline-none focus:border-blue-500 font-mono text-sm"
    >
      <option value="">— select type —</option>
      {XFORM_TYPES.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}

// --- Toggle checkbox ---

function RequiredToggle({
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

function DependencyChips({
  deps,
  title,
  onSelect,
}: {
  readonly deps: string[];
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

// --- Main component ---

interface FieldInspectorProps {
  readonly selectedFieldName: string | null;
  readonly field: FieldMeta | null;
  readonly formValues: Record<string, string>;
  readonly fields: Map<string, FieldMeta>;
  readonly xlsRows: XlsRows;
  readonly onFieldSelect: (name: string) => void;
  readonly onClose: () => void;
  readonly onUpdate: (fieldName: string, updates: Record<string, string>) => Promise<void>;
}

export function FieldInspector({
  selectedFieldName,
  field,
  formValues,
  fields,
  xlsRows,
  onFieldSelect,
  onClose,
  onUpdate,
}: FieldInspectorProps) {
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync edits when field changes
  useEffect(() => {
    if (field) {
      setEdits({
        type: String(field.type ?? ""),
        label: String(field.label ?? ""),
        hint: String(field.hint ?? ""),
        required: String(field.required ?? ""),
        relevant: String(field.relevant ?? ""),
        constraint: String(field.constraint ?? ""),
        calculation: String(field.calculation ?? ""),
      });
      setHasChanges(false);
    }
  }, [field, xlsRows]);

  const handleEditChange = (key: string, value: string) => {
    setEdits((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!field || !selectedFieldName) return;

    setIsSaving(true);
    try {
      // Only include changed fields
      const updates: Record<string, string> = {};
      const surveyRow = xlsRows.survey.find(
        (r) => String(r["name"] ?? "") === field.name
      ) as Record<string, unknown> | undefined;

      Object.keys(edits).forEach((key) => {
        const currentValue = String(surveyRow?.[key] ?? field[key as keyof FieldMeta] ?? "");
        if (edits[key] !== currentValue) {
          updates[key] = edits[key];
        }
      });

      if (Object.keys(updates).length > 0) {
        await onUpdate(field.name, updates);
      }

      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevert = () => {
    if (field) {
      setEdits({
        type: String(field.type ?? ""),
        label: String(field.label ?? ""),
        hint: String(field.hint ?? ""),
        required: String(field.required ?? ""),
        relevant: String(field.relevant ?? ""),
        constraint: String(field.constraint ?? ""),
        calculation: String(field.calculation ?? ""),
      });
      setHasChanges(false);
    }
  };

  // Compute dependencies
  const deps = useMemo(() => {
    if (!field) return new Set<string>();
    const depExprFields = ["relevant", "constraint", "calculation", "choiceFilter"] as const;
    const result = new Set<string>();
    for (const f of depExprFields) {
      for (const ref of extractVarRefs(field[f])) {
        result.add(ref);
      }
    }
    return result;
  }, [field]);

  const usedBy = useMemo(() => {
    if (!field) return [];
    const depExprFields = ["relevant", "constraint", "calculation", "choiceFilter"] as const;
    const result: string[] = [];
    fields.forEach((f) => {
      if (f.name === field.name) return;
      for (const df of depExprFields) {
        if (extractVarRefs(f[df]).includes(field.name)) {
          result.push(f.name);
          return; // Add once
        }
      }
    });
    return result;
  }, [field, fields]);

  // Formula statuses
  const relevantStatus = useMemo(() => {
    if (!edits.relevant) return "none" as FormulaStatus;
    return getFormulaStatus(edits.relevant, formValues);
  }, [edits.relevant, formValues]);

  const constraintStatus = useMemo(() => {
    if (!edits.constraint) return "none" as FormulaStatus;
    return getFormulaStatus(edits.constraint, formValues);
  }, [edits.constraint, formValues]);

  const calculationStatus = useMemo(() => {
    if (!edits.calculation) return "none" as FormulaStatus;
    return getFormulaStatus(edits.calculation, formValues);
  }, [edits.calculation, formValues]);

  // Empty state
  if (!field || !selectedFieldName) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="px-6 py-8 flex flex-col items-center justify-center flex-1 text-center">
          <div className="text-6xl mb-4">👈</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Field Selected</h2>
          <p className="text-gray-500 max-w-sm">
            Click on a field in the Form Structure or Form to inspect its properties.
          </p>
        </div>
      </div>
    );
  }

  const currentValue = formValues[selectedFieldName] ?? "";

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-mono">{selectedFieldName}</h2>
          <p className="text-xs text-gray-500 font-mono mt-1">{field.xpath}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
          title="Close inspector"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-4 space-y-6">
        {/* Current Value */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Current Value
          </h3>
          <div className={`font-mono text-sm px-3 py-2 rounded ${
            currentValue
              ? "bg-green-50 text-green-900 border border-green-200"
              : "bg-gray-50 text-gray-500 border border-gray-200"
          }`}>
            {currentValue || "— (empty)"}
          </div>
        </div>

        {/* Type */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Type
          </h3>
          <TypeDropdown
            value={edits.type}
            onChange={(v) => handleEditChange("type", v)}
          />
        </div>

        {/* Label */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Label
          </h3>
          <EditableTextField
            value={edits.label}
            onChange={(v) => handleEditChange("label", v)}
          />
        </div>

        {/* Hint */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Hint
          </h3>
          <EditableTextField
            value={edits.hint}
            onChange={(v) => handleEditChange("hint", v)}
          />
        </div>

        {/* Required */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Required
          </h3>
          <RequiredToggle
            value={edits.required === "true()" || edits.required === "1" || edits.required === "yes"}
            onChange={(v) => handleEditChange("required", v ? "true()" : "")}
          />
        </div>

        {/* Relevant */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Relevant
          </h3>
          <EditableFormula
            value={edits.relevant}
            status={relevantStatus}
            onChange={(v) => handleEditChange("relevant", v)}
          />
        </div>

        {/* Constraint */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Constraint
          </h3>
          <EditableFormula
            value={edits.constraint}
            status={constraintStatus}
            onChange={(v) => handleEditChange("constraint", v)}
          />
        </div>

        {/* Calculation */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Calculation
          </h3>
          <EditableFormula
            value={edits.calculation}
            status={calculationStatus}
            onChange={(v) => handleEditChange("calculation", v)}
          />
        </div>

        {/* Dependencies */}
        {deps.size > 0 && (
          <div className="pt-2">
            <DependencyChips
              deps={[...deps]}
              title="Depends On"
              onSelect={onFieldSelect}
            />
          </div>
        )}

        {/* Used By */}
        {usedBy.length > 0 && (
          <div className="pt-2">
            <DependencyChips
              deps={usedBy}
              title="Used By"
              onSelect={onFieldSelect}
            />
          </div>
        )}
      </div>

      {/* Footer with actions */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3 shrink-0">
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`px-4 py-2 rounded font-semibold transition-colors flex items-center gap-2 ${
            isSaving
              ? "bg-gray-100 text-gray-400 cursor-wait"
              : hasChanges
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          💾 {isSaving ? "Saving..." : "Save"}
        </button>

        {hasChanges && (
          <button
            onClick={handleRevert}
            disabled={isSaving}
            className="px-4 py-2 rounded font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            ↺ Revert
          </button>
        )}

        {hasChanges && <span className="text-orange-600 text-sm font-semibold">● Unsaved</span>}
      </div>
    </div>
  );
}
