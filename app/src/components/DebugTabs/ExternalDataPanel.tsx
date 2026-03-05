import { useMemo } from "react";

interface ExternalDataPanelProps {
  readonly xformXml: string | null;
}

interface CsvInfo {
  readonly id: string;
  readonly rowCount: number;
  readonly columns: readonly string[];
  readonly usedByFields: readonly string[];
}

function parseXmlItems(xmlStr: string): { rowCount: number; columns: string[] } {
  try {
    const doc = new DOMParser().parseFromString(xmlStr, 'text/xml');
    const items = doc.querySelectorAll('item');
    if (items.length === 0) return { rowCount: 0, columns: [] };
    const firstItem = items[0];
    const columns = Array.from(firstItem.children).map((c) => c.tagName);
    return { rowCount: items.length, columns };
  } catch {
    return { rowCount: 0, columns: [] };
  }
}

export function ExternalDataPanel({ xformXml }: ExternalDataPanelProps) {
  const csvInfos = useMemo<CsvInfo[]>(() => {
    const externalData = window.__externalData ?? [];
    if (externalData.length === 0) return [];

    const pulldataRefs: Record<string, string[]> = {};
    if (xformXml) {
      try {
        const regex = /pulldata\s*\(\s*'([^']+)'\s*,[^)]+\)/g;
        const doc = new DOMParser().parseFromString(xformXml, 'application/xml');
        doc.querySelectorAll('bind').forEach((bind) => {
          const calc = bind.getAttribute('calculate') ?? '';
          const name = (bind.getAttribute('nodeset') ?? '').split('/').pop() ?? '';
          const fileMatch = calc.match(/pulldata\s*\(\s*'([^']+)'/);
          if (fileMatch) {
            const file = fileMatch[1];
            if (!pulldataRefs[file]) pulldataRefs[file] = [];
            if (name && !pulldataRefs[file].includes(name)) pulldataRefs[file].push(name);
          }
        });
        void regex;
      } catch {
        // ignore
      }
    }

    return externalData.map((entry) => {
      const { rowCount, columns } = parseXmlItems(entry.xml);
      return {
        id: entry.id,
        rowCount,
        columns,
        usedByFields: pulldataRefs[entry.id] ?? [],
      };
    });
  }, [xformXml]);

  if (csvInfos.length === 0) {
    return (
      <div className="p-4 text-gray-400 text-sm">
        No external CSV data loaded. Upload CSV files alongside your XLSForm.
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full p-3 space-y-4">
      {csvInfos.map((csv) => (
        <div key={csv.id} className="bg-gray-50 border border-gray-200 rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-sm font-medium text-blue-600">{csv.id}</span>
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
              {csv.rowCount} rows
            </span>
          </div>
          {csv.columns.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-gray-400 mb-1">Columns</div>
              <div className="flex flex-wrap gap-1">
                {csv.columns.map((col) => (
                  <span key={col} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-mono rounded border border-gray-200">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}
          {csv.usedByFields.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 mb-1">Used by</div>
              <div className="flex flex-wrap gap-1">
                {csv.usedByFields.map((f) => (
                  <span key={f} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-mono rounded">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
