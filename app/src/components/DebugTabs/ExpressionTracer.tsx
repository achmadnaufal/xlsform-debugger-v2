import type { ExpressionEntry } from "../../types";

interface ExpressionTracerProps {
  readonly expressions: readonly ExpressionEntry[];
}

const TYPE_COLORS: Record<ExpressionEntry["type"], string> = {
  calculate: "bg-purple-900/50 text-purple-300",
  constraint: "bg-red-900/50 text-red-300",
  relevant: "bg-yellow-900/50 text-yellow-300",
  required: "bg-orange-900/50 text-orange-300",
};

export function ExpressionTracer({ expressions }: ExpressionTracerProps) {
  if (expressions.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        No expressions detected. Load a form with calculates, constraints, or
        relevance conditions.
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full p-2 space-y-1">
      {expressions.map((expr, i) => (
        <div
          key={`${expr.name}-${expr.type}-${i}`}
          className="bg-gray-800/50 rounded px-3 py-2 text-xs"
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${TYPE_COLORS[expr.type]}`}
            >
              {expr.type}
            </span>
            <span className="text-gray-300 font-mono">{expr.name}</span>
          </div>
          <div className="font-mono text-gray-400 pl-2 border-l border-gray-700">
            {expr.expression}
          </div>
          {expr.result && (
            <div className="mt-1 text-green-400 font-mono pl-2">
              = {expr.result}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
