import type { FormVariable } from "../../types";

interface VariableInspectorProps {
  readonly variables: readonly FormVariable[];
}

export function VariableInspector({ variables }: VariableInspectorProps) {
  if (variables.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        No variables yet. Load a form and interact with it.
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-gray-800">
          <tr className="text-left text-gray-400 border-b border-gray-700">
            <th className="px-3 py-2 font-medium">Field</th>
            <th className="px-3 py-2 font-medium">XPath</th>
            <th className="px-3 py-2 font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {variables.map((v) => (
            <tr
              key={v.xpath}
              className="border-b border-gray-800 hover:bg-gray-800/50"
            >
              <td className="px-3 py-1.5 text-blue-300 font-mono text-xs">
                {v.name}
              </td>
              <td className="px-3 py-1.5 text-gray-500 font-mono text-xs truncate max-w-48">
                {v.xpath}
              </td>
              <td className="px-3 py-1.5 text-green-300 font-mono text-xs">
                {v.value || <span className="text-gray-600">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
