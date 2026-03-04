import { useState, useCallback, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { FileUploadBar } from "./components/FileUploadBar";
import { FormRenderer } from "./components/FormRenderer";
import { DebugPanel } from "./components/DebugPanel";
import { QuestionTree } from "./components/QuestionTree";
import type { ExternalDataEntry, FormState } from "./types";

const EMPTY_STATE: FormState = {
  variables: [],
  expressions: [],
  dataXml: "",
};

export default function App() {
  const [xformXml, setXformXml] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<readonly string[]>([]);
  const [formState, setFormState] = useState<FormState>(EMPTY_STATE);
  const [externalData, setExternalData] = useState<readonly ExternalDataEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  useEffect(() => { window.__xformXml = xformXml; }, [xformXml]);
  useEffect(() => { window.__externalData = externalData; }, [externalData]);

  const handleConvert = useCallback(
    (xform: string, conversionWarnings: readonly string[], extData: readonly ExternalDataEntry[]) => {
      setError(null);
      setXformXml(xform);
      setWarnings(conversionWarnings);
      setExternalData(extData);
      setFormState(EMPTY_STATE);
      setSelectedQuestion(null);
    },
    []
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__loadForm = (x: string, e: ExternalDataEntry[]) => handleConvert(x, [], e ?? []);

  const handleError = useCallback((msg: string) => { setError(msg); }, []);
  const handleModelUpdate = useCallback((state: FormState) => { setFormState(state); }, []);
  const handleQuestionSelect = useCallback((name: string) => { setSelectedQuestion(name); }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100 text-xs">
      <FileUploadBar onConvert={handleConvert} onError={handleError} />

      {error && (
        <div className="bg-red-900/90 text-red-200 px-4 py-2 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-200 ml-4">&#10005;</button>
        </div>
      )}

      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        <Panel defaultSize={15} minSize={8} maxSize={30}>
          <QuestionTree
            xformXml={xformXml}
            selectedQuestion={selectedQuestion}
            onSelect={handleQuestionSelect}
          />
        </Panel>
        <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors" />

        <Panel defaultSize={45} minSize={25}>
          <div className="h-full overflow-auto">
            <FormRenderer
              xformXml={xformXml}
              externalData={externalData}
              onModelUpdate={handleModelUpdate}
              onError={handleError}
            />
          </div>
        </Panel>
        <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors" />

        <Panel defaultSize={40} minSize={20}>
          <DebugPanel
            formState={formState}
            warnings={warnings}
            xformXml={xformXml}
            selectedQuestion={selectedQuestion}
            onQuestionSelect={handleQuestionSelect}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}
