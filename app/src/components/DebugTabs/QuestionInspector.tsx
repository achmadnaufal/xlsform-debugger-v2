import { useEffect, useMemo } from "react";
import type { FormVariable } from "../../types";
import type { FieldMeta } from "../../utils/xformParser";
import { parseXFormFields, extractVarRefs } from "../../utils/xformParser";
import { evaluateRelevant, evaluateConstraint } from "../../utils/expressionEvaluator";

interface QuestionInspectorProps {
  readonly selectedQuestion: string | null;
  readonly onQuestionSelect: (name: string | null) => void;
  readonly xformXml: string | null;
  readonly variables: readonly FormVariable[];
}

function getFormValues(variables: readonly FormVariable[]): Record<string, string> {
  const values: Record<string, string> = {};
  for (const v of variables) {
    values[v.name] = v.value;
  }
  return values;
}

function findField(fields: Map<string, FieldMeta>, name: string): FieldMeta | undefined {
  if (fields.has(name)) return fields.get(name);
  const last = name.split('/').pop() || '';
  if (fields.has(last)) return fields.get(last);
  for (const [key, val] of fields) {
    if (key.endsWith('/' + last) || val.xpath?.endsWith('/' + name)) return val;
  }
  return undefined;
}

interface Choice {
  name: string;
  label: string;
}

function parseChoices(xformXml: string, listName: string): Choice[] {
  if (!listName) return [];
  try {
    const doc = new DOMParser().parseFromString(xformXml, 'application/xml');
    const instance = doc.querySelector(`instance[id="${listName}"]`);
    if (instance) {
      const items = Array.from(instance.querySelectorAll('item, *'));
      return items.slice(0, 200).map((el) => ({
        name: el.querySelector('name')?.textContent?.trim() ?? el.getAttribute('name') ?? '',
        label: el.querySelector('label')?.textContent?.trim() ?? '',
      })).filter(c => c.name);
    }
    const selects = doc.querySelectorAll('select1, select');
    for (const sel of Array.from(selects)) {
      const items = sel.querySelectorAll(':scope > item');
      if (items.length > 0) {
        const ref = sel.getAttribute('ref') ?? '';
        const fieldName = ref.split('/').pop() ?? '';
        if (fieldName === listName || listName === '') {
          return Array.from(items).map((item) => ({
            name: item.querySelector('value')?.textContent?.trim() ?? '',
            label: item.querySelector('label value, label')?.textContent?.trim() ?? '',
          })).filter(c => c.name);
        }
      }
    }
    return [];
  } catch {
    return [];
  }
}

function parseChoicesForField(xformXml: string, field: FieldMeta): Choice[] {
  try {
    const doc = new DOMParser().parseFromString(xformXml, 'application/xml');
    const selects = doc.querySelectorAll('select1, select');
    for (const sel of Array.from(selects)) {
      const ref = sel.getAttribute('ref') ?? '';
      const fieldName = ref.split('/').pop() ?? '';
      if (fieldName === field.name) {
        const items = sel.querySelectorAll(':scope > item');
        if (items.length > 0) {
          return Array.from(items).map((item) => ({
            name: item.querySelector('value')?.textContent?.trim() ?? '',
            label: item.querySelector('label value, label')?.textContent?.trim() ?? '',
          })).filter(c => c.name);
        }
        const itemset = sel.querySelector('itemset');
        if (itemset) {
          const nodeset = itemset.getAttribute('nodeset') ?? '';
          const instanceMatch = nodeset.match(/instance\('([^']+)'\)/);
          if (instanceMatch) {
            return parseChoices(xformXml, instanceMatch[1]);
          }
        }
      }
    }
    return [];
  } catch {
    return [];
  }
}

export function QuestionInspector({
  selectedQuestion,
  onQuestionSelect,
  xformXml,
  variables,
}: QuestionInspectorProps) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const question = (e.target as Element).closest?.('.question');
      if (!question) return;
      const input = question.querySelector('input, select, textarea');
      const rawName =
        input?.getAttribute('name') ??
        question.getAttribute('data-name') ??
        '';
      const name = rawName.split('/').pop() ?? '';
      if (name) onQuestionSelect(name);
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [onQuestionSelect]);

  const fields = useMemo<Map<string, FieldMeta>>(() => {
    if (!xformXml) return new Map();
    try {
      return parseXFormFields(xformXml);
    } catch {
      return new Map();
    }
  }, [xformXml]);

  const formValues = useMemo(() => getFormValues(variables), [variables]);

  if (!selectedQuestion) {
    return (
      <div className="p-4 text-gray-400 text-xs">
        Click a question in the form to inspect it.
      </div>
    );
  }

  const field = findField(fields, selectedQuestion);
  if (!field) {
    return (
      <div className="p-4 text-gray-600 text-xs">
        <p className="font-mono text-blue-600 mb-1">{selectedQuestion}</p>
        <p className="text-gray-400">No XForm metadata found for this field.</p>
      </div>
    );
  }

  const currentValue = formValues[field.name] ?? '';
  const relevantResult = field.relevant
    ? evaluateRelevant(field.relevant, formValues)
    : null;
  const constraintResult =
    field.constraint && currentValue
      ? evaluateConstraint(field.constraint, currentValue, formValues)
      : null;

  const depFields = ['relevant', 'constraint', 'calculation', 'choiceFilter'] as const;
  const deps = new Set<string>();
  depFields.forEach((f) => {
    extractVarRefs(field[f]).forEach((r) => deps.add(r));
  });

  const dependents: Array<{ name: string; field: string }> = [];
  fields.forEach((f) => {
    if (f.name === field.name) return;
    depFields.forEach((df) => {
      if (extractVarRefs(f[df]).includes(field.name)) {
        dependents.push({ name: f.name, field: df });
      }
    });
  });

  const isSelectType = field.type.startsWith('select_one') || field.type.startsWith('select_multiple') ||
    field.type === 'select1' || field.type === 'select';
  const choices = isSelectType && xformXml ? parseChoicesForField(xformXml, field) : [];

  const allMeta: Array<{ label: string; value: string; mono?: boolean }> = [
    { label: 'name', value: field.name, mono: true },
    { label: 'type', value: field.type, mono: true },
    { label: 'xpath', value: field.xpath, mono: true },
    { label: 'label', value: field.label },
    { label: 'hint', value: field.hint },
    { label: 'required', value: field.required, mono: true },
    { label: 'appearance', value: (field as any).appearance ?? '' },
  ].filter(m => m.value);

  return (
    <div className="overflow-auto h-full p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-blue-600 font-mono font-medium">{field.name}</span>
        <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono">{field.type || 'unknown'}</span>
      </div>

      {/* Current value */}
      <div className="bg-gray-50 border border-gray-200 rounded p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-1">Current Value</div>
        <div className={`font-mono text-sm ${currentValue ? 'text-green-700' : 'text-gray-400'}`}>
          {currentValue || '— (empty)'}
        </div>
      </div>

      {/* All metadata table */}
      <div className="bg-gray-50 border border-gray-200 rounded p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-2">Field Metadata</div>
        <div className="space-y-0.5">
          {allMeta.map(m => (
            <div key={m.label} className="flex gap-2 py-1 border-b border-gray-200/50">
              <span className="text-[11px] font-semibold text-gray-600 w-24 shrink-0">{m.label}</span>
              <span className={`text-xs break-all ${m.mono ? 'font-mono text-gray-900' : 'text-gray-900'}`}>{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expressions */}
      {(field.relevant || field.constraint || field.calculation || field.choiceFilter) && (
        <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Expressions</div>

          {field.relevant && (
            <div>
              <div className="text-[11px] font-semibold text-gray-600 mb-1">relevant</div>
              <div className="font-mono text-xs text-yellow-600 break-all mb-1">{field.relevant}</div>
              {relevantResult !== null && (
                <div className={`text-xs font-medium ${relevantResult ? 'text-green-700' : 'text-red-600'}`}>
                  {relevantResult ? '✅ Visible' : '🚫 Hidden'}
                </div>
              )}
            </div>
          )}

          {field.constraint && (
            <div>
              <div className="text-[11px] font-semibold text-gray-600 mb-1">constraint</div>
              <div className="font-mono text-xs text-yellow-600 break-all mb-1">{field.constraint}</div>
              {constraintResult !== null && (
                <div className={`text-xs font-medium ${constraintResult ? 'text-green-700' : 'text-red-600'}`}>
                  {constraintResult ? '✅ Passes' : '❌ Fails'}
                </div>
              )}
              {!currentValue && <div className="text-xs text-gray-400">No value — can't evaluate</div>}
            </div>
          )}

          {field.calculation && (
            <div>
              <div className="text-[11px] font-semibold text-gray-600 mb-1">calculation</div>
              <div className="font-mono text-xs text-yellow-600 break-all">{field.calculation}</div>
            </div>
          )}

          {field.choiceFilter && (
            <div>
              <div className="text-[11px] font-semibold text-gray-600 mb-1">choice_filter</div>
              <div className="font-mono text-xs text-yellow-600 break-all">{field.choiceFilter}</div>
            </div>
          )}
        </div>
      )}

      {/* Choices for select types */}
      {isSelectType && (
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-2">
            Choices {field.choiceFilter && <span className="ml-1 px-1 bg-yellow-100 text-yellow-600 rounded normal-case">filtered</span>}
            {choices.length > 0 && <span className="ml-1 text-gray-400 normal-case">({choices.length})</span>}
          </div>
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
                {choices.map(c => (
                  <tr key={c.name} className="border-b border-gray-100 hover:bg-gray-100">
                    <td className="py-1 px-1 font-mono text-xs text-blue-600">{c.name}</td>
                    <td className="py-1 px-1 text-xs text-gray-700">{c.label || c.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Dependencies */}
      {deps.size > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-2">
            Depends On ({deps.size})
          </div>
          <div className="flex flex-wrap gap-1">
            {[...deps].map((dep) => (
              <button
                key={dep}
                onClick={() => onQuestionSelect(dep)}
                className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-blue-600 text-xs font-mono rounded transition-colors"
              >
                {dep}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dependents */}
      {dependents.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-2">
            Used By ({dependents.length})
          </div>
          <div className="flex flex-wrap gap-1">
            {dependents.map((d) => (
              <button
                key={`${d.name}:${d.field}`}
                onClick={() => onQuestionSelect(d.name)}
                className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-purple-600 text-xs font-mono rounded transition-colors"
                title={`via ${d.field}`}
              >
                {d.name}
                <span className="text-gray-400 ml-1">({d.field})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
