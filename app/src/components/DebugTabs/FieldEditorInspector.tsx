import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { FormVariable } from "../../types";
import type { FieldEdit, SheetsUpdatePayload } from "../../types/editor";
import type { FieldMeta, LocalizedText } from "../../utils/xformParser";
import { parseXFormFields, extractVarRefs, getDefaultText, parseFormLanguages } from "../../utils/xformParser";
import { applyEditsToXform } from "../../utils/xformMutator";
import { evaluateRelevant, evaluateConstraint } from "../../utils/expressionEvaluator";
import {
  EditableFormula,
  EditableTextField,
  RequiredToggle,
  getFormulaStatus,
} from "../shared/EditableFields";
import { LanguageSelector } from "../shared/LanguageSelector";
import { useStatus } from "../../contexts/StatusContext";
import { btn } from "../../lib/styles";
import {
  XLSFORM_TYPES,
  type XlsFormType,
  type TypeChangeResult,
  bindTypeToXlsType,
  xlsTypeToChangeResult,
} from "../../utils/xlsformTypes";

// --- Choice parsing (from QuestionInspector) ---

interface Choice {
  readonly name: string;
  readonly label: string;
}

function parseChoicesForField(xformXml: string, field: FieldMeta): Choice[] {
  try {
    const doc = new DOMParser().parseFromString(xformXml, "application/xml");
    const selects = doc.querySelectorAll("select1, select");
    for (const sel of Array.from(selects)) {
      const ref = sel.getAttribute("ref") ?? "";
      const fieldName = ref.split("/").pop() ?? "";
      if (fieldName !== field.name) continue;

      const items = sel.querySelectorAll(":scope > item");
      if (items.length > 0) {
        return Array.from(items).map((item) => ({
          name: item.querySelector("value")?.textContent?.trim() ?? "",
          label: item.querySelector("label value, label")?.textContent?.trim() ?? "",
        })).filter((c) => c.name);
      }

      const itemset = sel.querySelector("itemset");
      if (itemset) {
        const nodeset = itemset.getAttribute("nodeset") ?? "";
        const instanceMatch = nodeset.match(/instance\('([^']+)'\)/);
        if (instanceMatch) {
          const instance = doc.querySelector(`instance[id="${instanceMatch[1]}"]`);
          if (instance) {
            const instanceItems = Array.from(instance.querySelectorAll("item, *"));
            return instanceItems.slice(0, 200).map((el) => ({
              name: el.querySelector("name")?.textContent?.trim() ?? el.getAttribute("name") ?? "",
              label: el.querySelector("label")?.textContent?.trim() ?? "",
            })).filter((c) => c.name);
          }
        }
      }
    }
    return [];
  } catch {
    return [];
  }
}

// --- Field finder ---

function findField(fields: Map<string, FieldMeta>, name: string): FieldMeta | undefined {
  if (fields.has(name)) return fields.get(name);
  const last = name.split("/").pop() ?? "";
  if (fields.has(last)) return fields.get(last);
  for (const [key, val] of fields) {
    if (key.endsWith("/" + last) || val.xpath?.endsWith("/" + name)) return val;
  }
  return undefined;
}

// --- Props ---

interface FieldEditorInspectorProps {
  readonly xformXml: string | null;
  readonly selectedQuestion: string | null;
  readonly onQuestionSelect: (name: string) => void;
  readonly onXformSave: (xml: string, sheetsUpdate?: SheetsUpdatePayload) => void;
  readonly onXformUpdate: (xml: string, sheetsUpdate?: SheetsUpdatePayload) => void;
  readonly variables: readonly FormVariable[];
}

// --- Helper to get effective value ---

function getEffective(field: FieldMeta, edits: FieldEdit, prop: string): string {
  const editVal = edits[prop as keyof FieldEdit];
  if (typeof editVal === "string") return editVal;
  return (field[prop as keyof FieldMeta] as string) ?? "";
}

function getEffectiveLocalized(
  fieldLocalized: LocalizedText,
  editLocalized: LocalizedText | undefined,
  lang: string,
): string {
  if (editLocalized && lang in editLocalized) return editLocalized[lang];
  return fieldLocalized[lang] ?? "";
}

function hasEdits(edits: FieldEdit): boolean {
  return Object.keys(edits).some((k) => {
    const val = edits[k as keyof FieldEdit];
    return val !== undefined;
  });
}

// --- Main component ---

export function FieldEditorInspector({
  xformXml,
  selectedQuestion,
  onQuestionSelect,
  onXformSave,
  onXformUpdate,
  variables,
}: FieldEditorInspectorProps) {
  const [edits, setEdits] = useState<FieldEdit>({});
  const [error, setError] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<string>("");
  const pendingSelectRef = useRef<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const { setStatus } = useStatus();

  const fields = useMemo(() => {
    if (!xformXml) return new Map<string, FieldMeta>();
    try {
      return parseXFormFields(xformXml);
    } catch {
      return new Map<string, FieldMeta>();
    }
  }, [xformXml]);

  const languages = useMemo(() => {
    if (!xformXml) return [];
    try {
      return parseFormLanguages(xformXml);
    } catch {
      return [];
    }
  }, [xformXml]);

  const field = useMemo(() => {
    if (!selectedQuestion) return undefined;
    return findField(fields, selectedQuestion);
  }, [fields, selectedQuestion]);

  const formValues = useMemo(() => {
    const values: Record<string, string> = {};
    for (const v of variables) {
      values[v.name] = v.value;
    }
    return values;
  }, [variables]);

  // Reset edits + language when field changes
  useEffect(() => {
    setEdits({});
    setError(null);
    if (languages.length > 0 && !languages.includes(activeLang)) {
      setActiveLang(languages[0]);
    }
  }, [selectedQuestion, xformXml]);

  // Set initial language
  useEffect(() => {
    if (languages.length > 0 && !activeLang) {
      setActiveLang(languages[0]);
    }
  }, [languages, activeLang]);

  // Handle question selection with unsaved edits confirmation
  const handleQuestionSelect = useCallback(
    (name: string) => {
      if (hasEdits(edits)) {
        pendingSelectRef.current = name;
        setShowConfirm(true);
      } else {
        onQuestionSelect(name);
      }
    },
    [edits, onQuestionSelect],
  );

  const confirmDiscard = useCallback(() => {
    setShowConfirm(false);
    setEdits({});
    if (pendingSelectRef.current) {
      onQuestionSelect(pendingSelectRef.current);
      pendingSelectRef.current = null;
    }
  }, [onQuestionSelect]);

  const cancelDiscard = useCallback(() => {
    setShowConfirm(false);
    pendingSelectRef.current = null;
  }, []);

  // --- Edit handlers ---

  const handleEditString = useCallback((prop: string, value: string) => {
    setEdits((prev) => ({ ...prev, [prop]: value }));
  }, []);

  const handleEditLocalized = useCallback(
    (prop: "labels" | "hints" | "constraintMessages", lang: string, value: string) => {
      setEdits((prev) => {
        const existing = prev[prop] ?? {};
        return { ...prev, [prop]: { ...existing, [lang]: value } };
      });
    },
    [],
  );

  // --- Save ---

  const applyEdits = useCallback((): string | null => {
    if (!xformXml || !field) return null;
    setError(null);
    try {
      const editsMap = new Map<string, FieldEdit>();
      editsMap.set(field.name, edits);
      return applyEditsToXform(xformXml, editsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply edits");
      return null;
    }
  }, [xformXml, field, edits]);

  const buildSheetsUpdate = useCallback((): SheetsUpdatePayload | undefined => {
    if (!field || !hasEdits(edits)) return undefined;
    return {
      fieldName: field.name,
      edits,
      meta: {
        bodyTag: edits.bodyTag ?? field.bodyTag,
        hasCalc: !!(edits.calculation ?? field.calculation),
        isReadonly: (edits.readonly ?? field.readonly) === "true()",
        mediatype: edits.mediatype ?? field.mediatype,
        listName: field.listName,
      },
    };
  }, [field, edits]);

  const handleSave = useCallback(() => {
    const newXml = applyEdits();
    if (newXml) {
      onXformSave(newXml, buildSheetsUpdate());
      setEdits({});
    }
  }, [applyEdits, onXformSave, buildSheetsUpdate]);

  const handleSaveAndRerender = useCallback(() => {
    setStatus("applying");
    const newXml = applyEdits();
    if (newXml) {
      onXformUpdate(newXml, buildSheetsUpdate());
      setEdits({});
    }
    setStatus("idle");
  }, [applyEdits, onXformUpdate, setStatus, buildSheetsUpdate]);

  const handleRevert = useCallback(() => {
    setEdits({});
    setError(null);
  }, []);

  // --- Computed values ---

  const modified = hasEdits(edits);

  const currentValue = field ? (formValues[field.name] ?? "") : "";

  const effectiveRelevant = field ? getEffective(field, edits, "relevant") : "";
  const effectiveConstraint = field ? getEffective(field, edits, "constraint") : "";
  const effectiveCalculation = field ? getEffective(field, edits, "calculation") : "";
  const effectiveChoiceFilter = field ? getEffective(field, edits, "choiceFilter") : "";

  const relevantResult = effectiveRelevant
    ? evaluateRelevant(effectiveRelevant, formValues)
    : null;
  const constraintResult =
    effectiveConstraint && currentValue
      ? evaluateConstraint(effectiveConstraint, currentValue, formValues)
      : null;

  const deps = useMemo(() => {
    if (!field) return [];
    const depFields = ["relevant", "constraint", "calculation", "choiceFilter"] as const;
    const result = new Set<string>();
    for (const f of depFields) {
      for (const ref of extractVarRefs(field[f])) {
        result.add(ref);
      }
    }
    return [...result];
  }, [field]);

  const usedBy = useMemo(() => {
    if (!field) return [];
    const depFields = ["relevant", "constraint", "calculation", "choiceFilter"] as const;
    const result: Array<{ name: string; field: string }> = [];
    fields.forEach((f) => {
      if (f.name === field.name) return;
      for (const df of depFields) {
        if (extractVarRefs(f[df]).includes(field.name)) {
          result.push({ name: f.name, field: df });
          return;
        }
      }
    });
    return result;
  }, [field, fields]);

  const isSelectType = field
    ? field.type.startsWith("select_one") ||
      field.type.startsWith("select_multiple") ||
      field.type === "select1" ||
      field.type === "select"
    : false;

  const choices = useMemo(() => {
    if (!isSelectType || !xformXml || !field) return [];
    return parseChoicesForField(xformXml, field);
  }, [isSelectType, xformXml, field]);

  // Determine current language for editing
  const editLang = activeLang || (languages.length > 0 ? languages[0] : "default");

  // --- Render ---

  if (!field || !selectedQuestion) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-xs p-4 text-center">
        Click a question in the form or tree to inspect and edit it.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Confirm dialog */}
      {showConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-lg shadow-lg p-4 mx-4 max-w-sm">
            <p className="text-sm text-gray-900 mb-3">
              Discard unsaved changes to <strong className="font-mono">{field.name}</strong>?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={cancelDiscard}
                className={btn.sm.secondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDiscard}
                className={btn.sm.danger}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 font-mono font-medium text-xs">{field.name}</span>
          <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono">
            {bindTypeToXlsType(
              getEffective(field, edits, "type"),
              !!field.calculation,
              edits.bodyTag ?? field.bodyTag,
              (edits.readonly ?? field.readonly) === "true()",
              edits.mediatype ?? field.mediatype,
            )}
          </span>
          {modified && (
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" title="Modified" />
          )}
        </div>
        <div className="text-[10px] font-mono text-gray-400 mt-0.5 break-all">{field.xpath}</div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-3 mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
            &#10005;
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto px-3 py-3 space-y-4">
        {/* Current Value */}
        <Section title="Current Value">
          <div className={`font-mono text-xs px-2 py-1.5 rounded ${
            currentValue
              ? "bg-green-50 text-green-900 border border-green-200"
              : "bg-gray-50 text-gray-400 border border-gray-200"
          }`}>
            {currentValue || "— (empty)"}
          </div>
        </Section>

        {/* Labels & Text */}
        <Section title="Labels & Text">
          {languages.length > 1 && (
            <div className="mb-2">
              <LanguageSelector languages={languages} active={editLang} onChange={setActiveLang} />
            </div>
          )}
          <FieldRow label="Label">
            <EditableTextField
              value={getEffectiveLocalized(field.labels, edits.labels, editLang)}
              onChange={(v) => handleEditLocalized("labels", editLang, v)}
            />
          </FieldRow>
          <FieldRow label="Hint">
            <EditableTextField
              value={getEffectiveLocalized(field.hints, edits.hints, editLang)}
              onChange={(v) => handleEditLocalized("hints", editLang, v)}
            />
          </FieldRow>
          <FieldRow label="Constraint Msg">
            <EditableTextField
              value={getEffectiveLocalized(field.constraintMessages, edits.constraintMessages, editLang)}
              onChange={(v) => handleEditLocalized("constraintMessages", editLang, v)}
            />
          </FieldRow>
        </Section>

        {/* Properties */}
        <Section title="Properties">
          <FieldRow label="Type">
            <TypeSelector
              value={getEffective(field, edits, "type")}
              hasCalculation={!!field.calculation}
              bodyTag={field.bodyTag}
              isReadonly={field.readonly === "true()"}
              mediatype={field.mediatype}
              onChange={(result) => {
                setEdits((prev) => ({
                  ...prev,
                  type: result.bindType,
                  bodyTag: result.bodyTag,
                  readonly: result.readonly,
                  mediatype: result.mediatype,
                }));
              }}
            />
          </FieldRow>
          <FieldRow label="Required">
            <RequiredToggle
              value={
                getEffective(field, edits, "required") === "true()" ||
                getEffective(field, edits, "required") === "1" ||
                getEffective(field, edits, "required") === "yes"
              }
              onChange={(v) => handleEditString("required", v ? "true()" : "")}
            />
          </FieldRow>
          <FieldRow label="Appearance">
            <EditableTextField
              value={getEffective(field, edits, "appearance")}
              onChange={(v) => handleEditString("appearance", v)}
            />
          </FieldRow>
          <FieldRow label="Default">
            <EditableTextField
              value={getEffective(field, edits, "defaultValue")}
              onChange={(v) => handleEditString("defaultValue", v)}
            />
          </FieldRow>
        </Section>

        {/* Expressions */}
        <Section title="Expressions">
          <FieldRow label="Relevant">
            <EditableFormula
              value={effectiveRelevant}
              status={getFormulaStatus(effectiveRelevant, formValues)}
              onChange={(v) => handleEditString("relevant", v)}
            />
            {relevantResult !== null && (
              <div className={`text-xs font-medium mt-1 ${relevantResult ? "text-green-700" : "text-red-600"}`}>
                {relevantResult ? "Visible" : "Hidden"}
              </div>
            )}
          </FieldRow>
          <FieldRow label="Constraint">
            <EditableFormula
              value={effectiveConstraint}
              status={getFormulaStatus(effectiveConstraint, formValues)}
              onChange={(v) => handleEditString("constraint", v)}
            />
            {constraintResult !== null && (
              <div className={`text-xs font-medium mt-1 ${constraintResult ? "text-green-700" : "text-red-600"}`}>
                {constraintResult ? "Passes" : "Fails"}
              </div>
            )}
            {effectiveConstraint && !currentValue && (
              <div className="text-xs text-gray-400 mt-1">No value — can't evaluate</div>
            )}
          </FieldRow>
          <FieldRow label="Calculation">
            <EditableFormula
              value={effectiveCalculation}
              status={getFormulaStatus(effectiveCalculation, formValues)}
              onChange={(v) => handleEditString("calculation", v)}
            />
          </FieldRow>
          {isSelectType && (
            <FieldRow label="Choice Filter">
              <EditableFormula
                value={effectiveChoiceFilter}
                status={getFormulaStatus(effectiveChoiceFilter, formValues)}
                onChange={(v) => handleEditString("choiceFilter", v)}
              />
            </FieldRow>
          )}
        </Section>

        {/* Choices */}
        {isSelectType && (
          <Section title={`Choices${choices.length > 0 ? ` (${choices.length})` : ""}`}>
            {choices.length === 0 ? (
              <div className="text-gray-400 text-xs">No inline choices found (may be external/itemset)</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600">Value</th>
                    <th className="text-left py-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600">Label</th>
                  </tr>
                </thead>
                <tbody>
                  {choices.map((c) => (
                    <tr key={c.name} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-1 px-1 font-mono text-xs text-blue-600">{c.name}</td>
                      <td className="py-1 px-1 text-xs text-gray-700">{c.label || c.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>
        )}

        {/* Dependencies */}
        {deps.length > 0 && (
          <Section title={`Depends On (${deps.length})`}>
            <div className="flex flex-wrap gap-1">
              {deps.map((dep) => (
                <button
                  key={dep}
                  onClick={() => handleQuestionSelect(dep)}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-blue-600 text-xs font-mono rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  {dep}
                </button>
              ))}
            </div>
          </Section>
        )}

        {usedBy.length > 0 && (
          <Section title={`Used By (${usedBy.length})`}>
            <div className="flex flex-wrap gap-1">
              {usedBy.map((d) => (
                <button
                  key={`${d.name}:${d.field}`}
                  onClick={() => handleQuestionSelect(d.name)}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-purple-600 text-xs font-mono rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  title={`via ${d.field}`}
                >
                  {d.name}
                  <span className="text-gray-400 ml-1">({d.field})</span>
                </button>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleSave}
          disabled={!modified}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
            modified
              ? "bg-blue-50 border border-blue-600 text-blue-700 hover:bg-blue-100"
              : "bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed"
          }`}
        >
          Save
        </button>
        <button
          type="button"
          onClick={handleSaveAndRerender}
          disabled={!modified}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
            modified
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              : "bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed"
          }`}
        >
          Save & Re-render
        </button>

        {modified && (
          <>
            <button
              type="button"
              onClick={handleRevert}
              className={`${btn.sm.secondary} font-semibold`}
            >
              Revert
            </button>
            <span className="text-xs text-orange-600 font-medium">Modified</span>
          </>
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

function Section({
  title,
  children,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function FieldRow({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
        {label}
      </div>
      {children}
    </div>
  );
}

// --- Type selector component ---

function TypeSelector({
  value,
  hasCalculation,
  bodyTag,
  isReadonly,
  mediatype,
  onChange,
}: {
  readonly value: string;
  readonly hasCalculation: boolean;
  readonly bodyTag: string;
  readonly isReadonly: boolean;
  readonly mediatype: string;
  readonly onChange: (result: TypeChangeResult) => void;
}) {
  const xlsType = bindTypeToXlsType(value, hasCalculation, bodyTag, isReadonly, mediatype);
  const isKnown = XLSFORM_TYPES.includes(xlsType as XlsFormType);
  return (
    <select
      value={isKnown ? xlsType : "__custom__"}
      onChange={(e) => {
        if (e.target.value === "__custom__") return;
        onChange(xlsTypeToChangeResult(e.target.value));
      }}
      className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs font-mono text-gray-900 focus:outline-none focus:border-blue-500"
    >
      {XLSFORM_TYPES.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
      {!isKnown && (
        <option value="__custom__">{xlsType}</option>
      )}
    </select>
  );
}
