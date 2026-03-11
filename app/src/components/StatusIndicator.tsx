import { useStatus } from "../contexts/StatusContext";

const STATUS_LABELS: Record<string, string> = {
  converting: "Converting XLSForm...",
  rendering: "Rendering form...",
  applying: "Applying edits...",
};

export function StatusIndicator() {
  const { status } = useStatus();

  if (status === "idle") return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-medium shrink-0">
      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span>{STATUS_LABELS[status] ?? status}</span>
    </div>
  );
}
