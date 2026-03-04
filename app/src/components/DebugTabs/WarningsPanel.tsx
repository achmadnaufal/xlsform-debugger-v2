interface WarningsPanelProps {
  readonly warnings: readonly string[];
}

export function WarningsPanel({ warnings }: WarningsPanelProps) {
  if (warnings.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        No warnings. The form converted cleanly.
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full p-2 space-y-1">
      {warnings.map((warning, i) => (
        <div
          key={i}
          className="flex gap-2 bg-yellow-900/20 border border-yellow-800/30 rounded px-3 py-2 text-xs"
        >
          <span className="text-yellow-500 shrink-0">&#9888;</span>
          <span className="text-yellow-200">{warning}</span>
        </div>
      ))}
    </div>
  );
}
