import { useState, useCallback, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { StatusProvider } from "./contexts/StatusContext";
import { StatusIndicator } from "./components/StatusIndicator";
import { FileUploadBar } from "./components/FileUploadBar";
import { FormRenderer } from "./components/FormRenderer";
import { DebugPanel } from "./components/DebugPanel";
import { QuestionTree } from "./components/QuestionTree";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SessionSwitcher } from "./components/SessionSwitcher";
import { useSessionPersistence } from "./hooks/useSessionPersistence";
import { getSession, getLastSessionId, nextSessionName, type StoredSession } from "./lib/sessionStorage";
import { panel } from "./lib/styles";
import type { ExternalDataEntry, FormState, XlsFormSheets } from "./types";
import type { SheetsUpdatePayload } from "./types/editor";
import { applyEditsToSheets } from "./utils/xlsformSheetMutator";

const EMPTY_STATE: FormState = {
  variables: [],
  expressions: [],
  dataXml: "",
};

export default function App() {
  // sourceXml: the editable XML (updated on every save)
  // renderedXml: the XML that FormRenderer watches (only updated on re-render)
  const [sourceXml, setSourceXml] = useState<string | null>(null);
  const [renderedXml, setRenderedXml] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<readonly string[]>([]);
  const [formState, setFormState] = useState<FormState>(EMPTY_STATE);
  const [externalData, setExternalData] = useState<readonly ExternalDataEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [xlsformSheets, setXlsformSheets] = useState<XlsFormSheets>({});
  const [sessionId, setSessionIdState] = useState<string | null>(null);
  const [sessionName, setSessionNameState] = useState("Untitled");
  const [uploadResetKey, setUploadResetKey] = useState(0);

  useEffect(() => { if (import.meta.env.DEV) window.__xformXml = sourceXml; }, [sourceXml]);
  useEffect(() => { if (import.meta.env.DEV) window.__externalData = externalData; }, [externalData]);

  const { setSessionId, setSessionName } = useSessionPersistence(
    { sessionId, sessionName, sourceXml, warnings, externalData, xlsformSheets },
    setSessionIdState,
  );

  const loadSession = useCallback((session: StoredSession) => {
    setError(null);
    setSourceXml(session.sourceXml);
    setRenderedXml(session.sourceXml);
    setWarnings(session.warnings);
    setExternalData(session.externalData);
    setXlsformSheets(session.xlsformSheets);
    setFormState(EMPTY_STATE);
    setSelectedQuestion(null);
    setSessionId(session.id);
    setSessionName(session.name);
    setSessionNameState(session.name);
    setSessionIdState(session.id);
  }, [setSessionId, setSessionName]);

  // Restore session on mount from URL hash or localStorage
  useEffect(() => {
    const hashMatch = window.location.hash.match(/^#session=(.+)$/);
    const targetId = hashMatch?.[1] ?? getLastSessionId();
    if (!targetId) return;
    getSession(targetId).then((session) => {
      if (session) loadSession(session);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConvert = useCallback(
    (xform: string, conversionWarnings: readonly string[], extData: readonly ExternalDataEntry[], sheets: XlsFormSheets) => {
      setError(null);
      setSourceXml(xform);
      setRenderedXml(xform);
      setWarnings(conversionWarnings);
      setExternalData(extData);
      setXlsformSheets(sheets);
      setFormState(EMPTY_STATE);
      setSelectedQuestion(null);
      // Only create a new session on first upload (landing page);
      // subsequent uploads (e.g. CSV added) stay in the current session.
      if (!sessionId) {
        setSessionId(crypto.randomUUID());
        nextSessionName().then(name => {
          setSessionNameState(name);
          setSessionName(name);
        });
      }
    },
    [sessionId, setSessionId, setSessionName]
  );

  if (import.meta.env.DEV) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__loadForm = (x: string, e: ExternalDataEntry[]) => handleConvert(x, [], e ?? [], {});
  }

  const handleNewSession = useCallback(() => {
    setError(null);
    setSourceXml(null);
    setRenderedXml(null);
    setWarnings([]);
    setExternalData([]);
    setXlsformSheets({});
    setFormState(EMPTY_STATE);
    setSelectedQuestion(null);
    setUploadResetKey(k => k + 1);
    // Generate UUID eagerly so session name button stays visible
    const newId = crypto.randomUUID();
    setSessionId(newId);
    setSessionIdState(newId);
    // Generate numbered name asynchronously
    nextSessionName().then(name => {
      setSessionNameState(name);
      setSessionName(name);
    });
  }, [setSessionId, setSessionName]);

  // CSV-only update: update external data → useEnketoForm re-inits with new data
  const handleCsvUpdate = useCallback(
    (entries: readonly ExternalDataEntry[]) => {
      setExternalData(entries);
      setFormState(EMPTY_STATE);
    },
    []
  );

  const handleError = useCallback((msg: string) => { setError(msg); }, []);
  const handleModelUpdate = useCallback((state: FormState) => { setFormState(state); }, []);
  const handleQuestionSelect = useCallback((name: string) => { setSelectedQuestion(name); }, []);

  // Save only — update XML in memory, no re-render
  const handleXformSave = useCallback((xml: string, sheetsUpdate?: SheetsUpdatePayload) => {
    setSourceXml(xml);
    if (sheetsUpdate) {
      setXlsformSheets((prev) =>
        applyEditsToSheets(prev, sheetsUpdate.fieldName, sheetsUpdate.edits, sheetsUpdate.meta),
      );
    }
  }, []);

  // Save & re-render — update XML and trigger full form rebuild
  const handleXformRerender = useCallback((xml: string, sheetsUpdate?: SheetsUpdatePayload) => {
    setSourceXml(xml);
    setRenderedXml(xml);
    setFormState(EMPTY_STATE);
    if (sheetsUpdate) {
      setXlsformSheets((prev) =>
        applyEditsToSheets(prev, sheetsUpdate.fieldName, sheetsUpdate.edits, sheetsUpdate.meta),
      );
    }
  }, []);

  return (
    <ErrorBoundary>
    <StatusProvider>
      <div className="h-screen flex flex-col bg-gray-50 text-gray-900 text-xs">
        <div className="flex items-center gap-2 bg-white border-b border-gray-200">
          <StatusIndicator />
          <SessionSwitcher
            currentSessionId={sessionId}
            currentName={sessionName}
            onSwitch={loadSession}
            onRename={(name) => { setSessionName(name); setSessionNameState(name); }}
            onNew={handleNewSession}
          />
          <div className="flex-1">
            <FileUploadBar
              onConvert={handleConvert}
              onCsvUpdate={handleCsvUpdate}
              hasSourceXml={sourceXml !== null}
              onError={handleError}
              resetKey={uploadResetKey}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 text-sm flex items-center justify-between border-b border-red-200">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4">&#10005;</button>
          </div>
        )}

        <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
          <Panel defaultSize={18} minSize={10} maxSize={35}>
            <div className="h-full text-[11px]">
              <QuestionTree
                xformXml={sourceXml}
                selectedQuestion={selectedQuestion}
                onSelect={handleQuestionSelect}
              />
            </div>
          </Panel>
          <PanelResizeHandle className={panel.resizeHandle} />

          <Panel defaultSize={45} minSize={25}>
            <div className="h-full overflow-auto text-[13px]">
              <FormRenderer
                key={sessionId ?? "empty"}
                xformXml={renderedXml}
                externalData={externalData}
                onModelUpdate={handleModelUpdate}
                onError={handleError}
                onQuestionSelect={handleQuestionSelect}
              />
            </div>
          </Panel>
          <PanelResizeHandle className={panel.resizeHandle} />

          <Panel defaultSize={37} minSize={20}>
            <div className="h-full text-[11px]">
              <DebugPanel
                formState={formState}
                warnings={warnings}
                xformXml={sourceXml}
                xlsformSheets={xlsformSheets}
                selectedQuestion={selectedQuestion}
                onQuestionSelect={handleQuestionSelect}
                onXformSave={handleXformSave}
                onXformUpdate={handleXformRerender}
              />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </StatusProvider>
    </ErrorBoundary>
  );
}
