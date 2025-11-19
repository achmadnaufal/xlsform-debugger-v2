import { useMemo } from "react";
import { parseXFormFields, extractVarRefs, extractPulldataFiles } from "../../utils/xformParser";
import type { FormVariable } from "../../types";

interface WarningsPanelProps {
  readonly warnings: readonly string[];
  readonly xformXml: string | null;
  readonly variables: readonly FormVariable[];
}

interface Warning {
  readonly type: "conversion" | "undefined-ref" | "missing-csv" | "malformed";
  readonly message: string;
}

function checkMalformedBrackets(expression: string): boolean {
  let depth = 0;
  for (const ch of expression) {
    if (ch === '[') depth++;
    if (ch === ']') depth--;
    if (depth < 0) return true;
  }
  return depth !== 0;
}

export function WarningsPanel({ warnings, xformXml, variables }: WarningsPanelProps) {
  const allWarnings = useMemo<Warning[]>(() => {
    const result: Warning[] = warnings.map((w) => ({ type: "conversion", message: w }));

    if (!xformXml) return result;

    try {
      const fields = parseXFormFields(xformXml);
      const knownNames = new Set([...fields.keys()]);
      // Also add variable names from live model
      for (const v of variables) knownNames.add(v.name);

      const expressions: Array<{ name: string; field: string; expr: string }> = [];
      fields.forEach((f) => {
        if (f.relevant) expressions.push({ name: f.name, field: "relevant", expr: f.relevant });
        if (f.constraint) expressions.push({ name: f.name, field: "constraint", expr: f.constraint });
        if (f.calculation) expressions.push({ name: f.name, field: "calculation", expr: f.calculation });
        if (f.choiceFilter) expressions.push({ name: f.name, field: "choice_filter", expr: f.choiceFilter });
      });

      // Check undefined variable references
      for (const { name, field, expr } of expressions) {
        const refs = extractVarRefs(expr);
        for (const ref of refs) {
          if (!knownNames.has(ref)) {
            result.push({
              type: "undefined-ref",
              message: `Field "${name}" ${field}: references undefined variable \${${ref}}`,
            });
          }
        }
        if (checkMalformedBrackets(expr)) {
          result.push({
            type: "malformed",
            message: `Field "${name}" ${field}: possible malformed brackets in expression`,
          });
        }
      }

      // Check missing CSV files
      const pulldataFiles = extractPulldataFiles(xformXml);
      const loadedIds = new Set((window.__externalData ?? []).map((d) => d.id));
      for (const file of pulldataFiles) {
        if (!loadedIds.has(file)) {
          result.push({
            type: "missing-csv",
            message: `pulldata() references "${file}" but no CSV with that ID is loaded`,
          });
        }
      }
    } catch {
      // parse errors are fine, just skip
    }

    return result;
  }, [warnings, xformXml, variables]);

  if (allWarnings.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        ✅ No warnings. The form looks clean.
      </div>
    );
  }

  const iconMap: Record<Warning["type"], string> = {
    conversion: "⚠️",
    "undefined-ref": "🔴",
    "missing-csv": "📄",
    malformed: "🔧",
  };

  return (
    <div className="overflow-auto h-full p-2 space-y-1">
      {allWarnings.map((w, i) => (
        <div
          key={i}
          className={`flex gap-2 rounded px-3 py-2 text-xs border ${
            w.type === "undefined-ref" || w.type === "missing-csv"
              ? "bg-red-900/20 border-red-800/30"
              : w.type === "malformed"
              ? "bg-orange-900/20 border-orange-800/30"
              : "bg-yellow-900/20 border-yellow-800/30"
          }`}
        >
          <span className="shrink-0">{iconMap[w.type]}</span>
          <span className={`${
            w.type === "undefined-ref" || w.type === "missing-csv"
              ? "text-red-200"
              : w.type === "malformed"
              ? "text-orange-200"
              : "text-yellow-200"
          }`}>{w.message}</span>
        </div>
      ))}
    </div>
  );
}
