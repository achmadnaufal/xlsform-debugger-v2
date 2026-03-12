import { useRef, useEffect, useCallback } from "react";
import type { ExternalDataEntry, XlsFormSheets } from "../types";
import { saveSession, type StoredSession } from "../lib/sessionStorage";

const DEBOUNCE_MS = 1500;

interface SessionState {
  readonly sessionId: string | null;
  readonly sessionName: string;
  readonly sourceXml: string | null;
  readonly warnings: readonly string[];
  readonly externalData: readonly ExternalDataEntry[];
  readonly xlsformSheets: XlsFormSheets;
}

interface UseSessionPersistenceReturn {
  readonly setSessionId: (id: string | null) => void;
  readonly setSessionName: (name: string) => void;
  readonly sessionId: string | null;
  readonly sessionName: string;
}

export function useSessionPersistence(
  state: SessionState,
  onSessionIdChange: (id: string | null) => void,
): UseSessionPersistenceReturn {
  const sessionIdRef = useRef(state.sessionId);
  const sessionNameRef = useRef(state.sessionName);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSessionId = useCallback((id: string | null) => {
    sessionIdRef.current = id;
    onSessionIdChange(id);
    if (id) {
      window.location.hash = `session=${id}`;
    } else {
      window.location.hash = "";
    }
  }, [onSessionIdChange]);

  const setSessionName = useCallback((name: string) => {
    sessionNameRef.current = name;
  }, []);

  // Debounced save
  useEffect(() => {
    if (!state.sourceXml || !sessionIdRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const session: StoredSession = {
        id: sessionIdRef.current!,
        name: sessionNameRef.current,
        sourceXml: state.sourceXml!,
        warnings: [...state.warnings],
        externalData: state.externalData.map(e => ({ id: e.id, xml: e.xml })),
        xlsformSheets: state.xlsformSheets,
        updatedAt: Date.now(),
      };
      saveSession(session);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.sourceXml, state.warnings, state.externalData, state.xlsformSheets]);

  return {
    setSessionId,
    setSessionName,
    sessionId: sessionIdRef.current,
    sessionName: sessionNameRef.current,
  };
}
