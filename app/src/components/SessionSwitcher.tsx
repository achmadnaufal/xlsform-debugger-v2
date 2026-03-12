import { useState, useEffect, useCallback, useRef } from "react";
import { listSessions, deleteSession, renameSession, type StoredSession } from "../lib/sessionStorage";
import { btn } from "../lib/styles";

interface SessionSwitcherProps {
  readonly currentSessionId: string | null;
  readonly currentName: string;
  readonly onSwitch: (session: StoredSession) => void;
  readonly onRename: (name: string) => void;
  readonly onNew: () => void;
}

export function SessionSwitcher({ currentSessionId, currentName, onSwitch, onRename, onNew }: SessionSwitcherProps) {
  const [sessions, setSessions] = useState<readonly StoredSession[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const list = await listSessions();
    setSessions(list);
  }, []);

  useEffect(() => { refresh(); }, [refresh, currentSessionId]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteSession(id);
    refresh();
  }, [refresh]);

  const handleRenameSubmit = useCallback(async (id: string) => {
    if (!editValue.trim()) {
      setEditingId(null);
      return;
    }
    await renameSession(id, editValue.trim());
    if (id === currentSessionId) onRename(editValue.trim());
    setEditingId(null);
    refresh();
  }, [editValue, currentSessionId, onRename, refresh]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="relative flex items-center gap-1" ref={dropdownRef}>
      <button
        type="button"
        className={btn.sm.secondary}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {currentName || "Untitled"} ▾
      </button>
      <button
        type="button"
        className={btn.sm.ghost}
        onClick={() => { onNew(); setOpen(false); }}
        title="New session"
      >
        + New
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-auto"
          role="listbox"
        >
          {sessions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400">No saved sessions</div>
          ) : (
            sessions.map(s => (
              <div
                key={s.id}
                className={`flex items-center gap-1 px-3 py-2 text-xs border-b border-gray-100 last:border-0 ${
                  s.id === currentSessionId ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
                role="option"
                aria-selected={s.id === currentSessionId}
              >
                {editingId === s.id ? (
                  <input
                    className="flex-1 rounded border border-gray-300 px-1.5 py-0.5 text-xs focus:outline-none focus:border-blue-500"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(s.id)}
                    onKeyDown={e => {
                      if (e.key === "Enter") handleRenameSubmit(s.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    className="flex-1 text-left truncate text-gray-700 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    onClick={() => { onSwitch(s); setOpen(false); }}
                  >
                    <span className="font-medium">{s.name || "Untitled"}</span>
                    <span className="ml-2 text-gray-400">{formatTime(s.updatedAt)}</span>
                  </button>
                )}
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  title="Rename"
                  onClick={() => { setEditingId(s.id); setEditValue(s.name); }}
                >
                  ✎
                </button>
                {s.id !== currentSessionId && (
                  <button
                    type="button"
                    className="text-gray-500 hover:text-red-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    title="Delete"
                    onClick={() => handleDelete(s.id)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
