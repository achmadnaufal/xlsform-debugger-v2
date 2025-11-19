import { useEffect, useMemo } from "react";
import type { FormVariable } from "../../types";
import type { FieldMeta } from "../../utils/xformParser";
import { parseXFormFields, extractVarRefs } from "../../utils/xformParser";
import { evaluateRelevant, evaluateConstraint } from "../../utils/expressionEvaluator";

interface QuestionInspectorProps {
  readonly selectedQuestion: string | null;
  readonly onQuestionSelect: (name: string) => void;
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

function MetaRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 py-1 border-b border-gray-800">
      <span className="text-gray-500 text-xs w-28 shrink-0">{label}</span>
      <span className="text-gray-200 text-xs font-mono break-all">{value}</span>
    </div>
  );
}

export function QuestionInspector({
  selectedQuestion,
  onQuestionSelect,
  xformXml,
  variables,
}: QuestionInspectorProps) {
  // Attach global click listener to detect question selection
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
      <div className="p-4 text-gray-500 text-sm">
        Click a question in the form to inspect it.
      </div>
    );
  }

  const field = fields.get(selectedQuestion);
  if (!field) {
    return (
      <div className="p-4 text-gray-400 text-sm">
        <p className="font-mono text-blue-300 mb-1">{selectedQuestion}</p>
        <p className="text-gray-500">No XForm metadata found for this field.</p>
      </div>
    );
  }

  const currentValue = formValues[selectedQuestion] ?? '';
  const relevantResult = field.relevant
    ? evaluateRelevant(field.relevant, formValues)
    : null;
  const constraintResult =
    field.constraint && currentValue
      ? evaluateConstraint(field.constraint, currentValue, formValues)
      : null;

  // Dependencies: vars referenced in any expression
  const depFields = ['relevant', 'constraint', 'calculation', 'choiceFilter'] as const;
  const deps = new Set<string>();
  depFields.forEach((f) => {
    extractVarRefs(field[f]).forEach((r) => deps.add(r));
  });

  // Dependents: fields that reference selectedQuestion
  const dependents: Array<{ name: string; field: string }> = [];
  fields.forEach((f) => {
    if (f.name === selectedQuestion) return;
    depFields.forEach((df) => {
      if (extractVarRefs(f[df]).includes(selectedQuestion)) {
        dependents.push({ name: f.name, field: df });
      }
    });
  });

  return (
    <div className="overflow-auto h-full p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-blue-300 font-mono font-medium">{field.name}</span>
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{field.type || 'unknown'}</span>
      </div>

      {/* Metadata */}
      <div className="bg-gray-800/50 rounded p-2 space-y-0.5">
        <MetaRow label="Label" value={field.label} />
        <MetaRow label="Hint" value={field.hint} />
        <MetaRow label="Current value" value={currentValue || '—'} />
        <MetaRow label="Required" value={field.required} />
      </div>

      {/* Expressions */}
      {field.relevant && (
        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-xs text-gray-400 mb-1">relevant</div>
          <div className="font-mono text-xs text-yellow-200 break-all mb-1">{field.relevant}</div>
          {relevantResult !== null && (
            <div className={`text-xs font-medium ${relevantResult ? 'text-green-400' : 'text-red-400'}`}>
              {relevantResult ? '✅ Visible' : '🚫 Hidden'}
            </div>
          )}
        </div>
      )}

      {field.constraint && (
        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-xs text-gray-400 mb-1">constraint</div>
          <div className="font-mono text-xs text-yellow-200 break-all mb-1">{field.constraint}</div>
          {constraintResult !== null && (
            <div className={`text-xs font-medium ${constraintResult ? 'text-green-400' : 'text-red-400'}`}>
              {constraintResult ? '✅ Passes' : '❌ Fails'}
            </div>
          )}
          {!currentValue && <div className="text-xs text-gray-500">No value to evaluate</div>}
        </div>
      )}

      {field.calculation && (
        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-xs text-gray-400 mb-1">calculation</div>
          <div className="font-mono text-xs text-yellow-200 break-all">{field.calculation}</div>
        </div>
      )}

      {field.choiceFilter && (
        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-xs text-gray-400 mb-1">choice_filter</div>
          <div className="font-mono text-xs text-yellow-200 break-all">{field.choiceFilter}</div>
        </div>
      )}

      {/* Dependencies */}
      {deps.size > 0 && (
        <div>
          <div className="text-xs text-gray-400 mb-1.5">Dependencies ({deps.size})</div>
          <div className="flex flex-wrap gap-1">
            {[...deps].map((dep) => (
              <button
                key={dep}
                onClick={() => onQuestionSelect(dep)}
                className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-blue-300 text-xs font-mono rounded transition-colors"
              >
                {dep}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dependents */}
      {dependents.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 mb-1.5">Used by ({dependents.length})</div>
          <div className="flex flex-wrap gap-1">
            {dependents.map((d) => (
              <button
                key={`${d.name}:${d.field}`}
                onClick={() => onQuestionSelect(d.name)}
                className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-purple-300 text-xs font-mono rounded transition-colors"
                title={d.field}
              >
                {d.name}
                <span className="text-gray-500 ml-1">({d.field})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
