import { useState, useMemo } from "react";
import type { XlsFormSheets } from "../../types";

interface XLSFormSourceProps {
  readonly xlsformSheets: XlsFormSheets;
  readonly selectedQuestion: string | null;
}

export function XLSFormSource({ xlsformSheets, selectedQuestion }: XLSFormSourceProps) {
  const sheetNames = useMemo(() => Object.keys(xlsformSheets), [xlsformSheets]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [search, setSearch] = useState("");

  // Default to first sheet
  const currentSheet = activeSheet && sheetNames.includes(activeSheet)
    ? activeSheet
    : sheetNames[0] ?? "";

  const rows = xlsformSheets[currentSheet] ?? [];

  // Collect all column headers from the sheet
  const columns = useMemo(() => {
    const cols = new Set<string>();
    for (const row of rows) {
      for (const key of Object.keys(row)) {
        cols.add(key);
      }
    }
    return [...cols];
  }, [rows]);

  // Filter rows by search
  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((v) =>
        String(v ?? "").toLowerCase().includes(q)
      )
    );
  }, [rows, search]);

  if (sheetNames.length === 0) {
    return <div className="p-4 text-gray-400 text-sm">No XLSForm data loaded.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sheet tabs + search */}
      <div className="flex items-center gap-2 px-2 py-1.5 border-b border-gray-200 bg-gray-50 shrink-0">
        <div className="flex gap-0.5">
          {sheetNames.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setActiveSheet(name)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                name === currentSheet
                  ? "bg-white text-blue-600 border border-gray-200 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {name}
              <span className="ml-1 text-[10px] text-gray-400">
                ({(xlsformSheets[name] ?? []).length})
              </span>
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 w-40"
        />
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr className="border-b border-gray-200">
              <th className="px-2 py-1.5 text-left text-gray-400 font-normal w-8">#</th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-2 py-1.5 text-left text-gray-600 font-medium whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => {
              const name = String(row["name"] ?? "");
              const isSelected = selectedQuestion !== null && name === selectedQuestion;
              return (
                <tr
                  key={i}
                  className={`border-b border-gray-100 ${
                    isSelected
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-2 py-1 text-gray-300 font-mono">{i + 1}</td>
                  {columns.map((col) => {
                    const val = String(row[col] ?? "");
                    const isName = col === "name";
                    const isType = col === "type";
                    const isExpression = ["relevant", "constraint", "calculation", "required", "choice_filter"].includes(col);
                    return (
                      <td
                        key={col}
                        className={`px-2 py-1 max-w-48 truncate font-mono ${
                          isName
                            ? "text-blue-600 font-medium"
                            : isType
                            ? "text-purple-600"
                            : isExpression
                            ? "text-yellow-700"
                            : "text-gray-700"
                        }`}
                        title={val}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-4 text-gray-400 text-sm text-center">
            {search ? "No matching rows." : "Empty sheet."}
          </div>
        )}
      </div>
    </div>
  );
}
