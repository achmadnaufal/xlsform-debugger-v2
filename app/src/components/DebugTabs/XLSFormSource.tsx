import { useMemo, useState } from "react";
import { parseXFormFields } from "../../utils/xformParser";

interface XLSFormSourceProps {
  readonly xformXml: string | null;
  readonly selectedQuestion: string | null;
}

export function XLSFormSource({ xformXml, selectedQuestion }: XLSFormSourceProps) {
  const [search, setSearch] = useState("");

  const fields = useMemo(() => {
    if (!xformXml) return [];
    try {
      const map = parseXFormFields(xformXml);
      return [...map.values()];
    } catch {
      return [];
    }
  }, [xformXml]);

  const filtered = useMemo(() => {
    if (!search) return fields;
    const q = search.toLowerCase();
    return fields.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.label.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q)
    );
  }, [fields, search]);

  if (!xformXml) {
    return <div className="p-4 text-gray-400 text-sm">No form loaded.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-gray-200 shrink-0">
        <input
          type="text"
          placeholder="Search fields..."
          aria-label="Search fields"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-gray-100">
            <tr className="text-left text-gray-600 border-b border-gray-200">
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Label</th>
              <th className="px-3 py-2 font-medium">Relevant</th>
              <th className="px-3 py-2 font-medium">Constraint</th>
              <th className="px-3 py-2 font-medium">Calculation</th>
              <th className="px-3 py-2 font-medium">Required</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => {
              const isSelected = f.name === selectedQuestion;
              return (
                <tr
                  key={f.xpath || f.name}
                  className={`border-b border-gray-100 ${isSelected ? "bg-blue-100 border-blue-200" : "hover:bg-gray-50"}`}
                >
                  <td className="px-3 py-1.5 text-gray-600 font-mono">{f.type}</td>
                  <td className={`px-3 py-1.5 font-mono font-medium ${isSelected ? "text-blue-700" : "text-blue-600"}`}>{f.name}</td>
                  <td className="px-3 py-1.5 text-gray-700 max-w-32 truncate">{f.label}</td>
                  <td className="px-3 py-1.5 text-yellow-600 font-mono max-w-40 truncate" title={f.relevant}>{f.relevant}</td>
                  <td className="px-3 py-1.5 text-orange-600 font-mono max-w-40 truncate" title={f.constraint}>{f.constraint}</td>
                  <td className="px-3 py-1.5 text-purple-600 font-mono max-w-40 truncate" title={f.calculation}>{f.calculation}</td>
                  <td className="px-3 py-1.5 text-gray-600">{f.required}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-4 text-gray-400 text-sm text-center">No fields found.</div>
        )}
      </div>
    </div>
  );
}
