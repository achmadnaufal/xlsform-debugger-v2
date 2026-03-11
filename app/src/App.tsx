import { useState, useCallback, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { StatusProvider } from "./contexts/StatusContext";
import { StatusIndicator } from "./components/StatusIndicator";
import { FileUploadBar } from "./components/FileUploadBar";
import { FormRenderer } from "./components/FormRenderer";
import { DebugPanel } from "./components/DebugPanel";
import { QuestionTree } from "./components/QuestionTree";
import type { ExternalDataEntry, FormState, XlsFormSheets } from "./types";

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

  useEffect(() => { window.__xformXml = sourceXml; }, [sourceXml]);
  useEffect(() => { window.__externalData = externalData; }, [externalData]);

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
    },
    []
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__loadForm = (x: string, e: ExternalDataEntry[]) => handleConvert(x, [], e ?? [], {});

  const handleError = useCallback((msg: string) => { setError(msg); }, []);
  const handleModelUpdate = useCallback((state: FormState) => { setFormState(state); }, []);
  const handleQuestionSelect = useCallback((name: string) => { setSelectedQuestion(name); }, []);

  // Save only — update XML in memory, no re-render
  const handleXformSave = useCallback((xml: string) => {
    setSourceXml(xml);
  }, []);

  // Save & re-render — update XML and trigger full form rebuild
  const handleXformRerender = useCallback((xml: string) => {
    setSourceXml(xml);
    setRenderedXml(xml);
    setFormState(EMPTY_STATE);
  }, []);

  return (
    <StatusProvider>
      <div className="h-screen flex flex-col bg-gray-50 text-gray-900 text-xs">
        <div className="flex items-center gap-2 bg-white border-b border-gray-200">
          <StatusIndicator />
          <div className="flex-1">
            <FileUploadBar onConvert={handleConvert} onError={handleError} />
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
            <div className="h-full" style={{ fontSize: '11px' }}>
              <QuestionTree
                xformXml={sourceXml}
                selectedQuestion={selectedQuestion}
                onSelect={handleQuestionSelect}
              />
            </div>
          </Panel>
          <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors" />

          <Panel defaultSize={45} minSize={25}>
            <div className="h-full overflow-auto" style={{ fontSize: '13px' }}>
              <FormRenderer
                xformXml={renderedXml}
                externalData={externalData}
                onModelUpdate={handleModelUpdate}
                onError={handleError}
                onQuestionSelect={handleQuestionSelect}
              />
            </div>
          </Panel>
          <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors" />

          <Panel defaultSize={37} minSize={20}>
            <div className="h-full" style={{ fontSize: '11px' }}>
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
  );
}
