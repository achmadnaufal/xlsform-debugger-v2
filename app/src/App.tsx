import { useState, useCallback } from "react";
import { FileUploadBar } from "./components/FileUploadBar";
import { FormRenderer } from "./components/FormRenderer";
import { DebugPanel } from "./components/DebugPanel";
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

  const handleConvert = useCallback(
    (xform: string, conversionWarnings: readonly string[], extData: readonly ExternalDataEntry[]) => {
      setError(null);
      setXformXml(xform);
      setWarnings(conversionWarnings);
      setExternalData(extData);
      setFormState(EMPTY_STATE);
    },
    []
  );

  // @ts-ignore
  (window as any).__loadForm = (x: string, e: any[]) => handleConvert(x, [], e ?? []);

  const handleError = useCallback((msg: string) => {
    setError(msg);
  }, []);

  const handleModelUpdate = useCallback((state: FormState) => {
    setFormState(state);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <FileUploadBar onConvert={handleConvert} onError={handleError} />

      {/* Error toast */}
      {error && (
        <div className="bg-red-900/90 text-red-200 px-4 py-2 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-200 ml-4"
          >
            &#10005;
          </button>
        </div>
      )}

      {/* Main content: form (60%) + debugger (40%) */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-3/5 border-r border-gray-200 overflow-hidden">
          <FormRenderer
            xformXml={xformXml}
            externalData={externalData}
            onModelUpdate={handleModelUpdate}
            onError={handleError}
          />
        </div>
        <div className="w-2/5 overflow-hidden">
          <DebugPanel
            formState={formState}
            warnings={warnings}
            xformXml={xformXml}
          />
        </div>
      </div>
    </div>
  );
}
