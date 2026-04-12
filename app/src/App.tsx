import { useState, useCallback, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { FileUploadBar } from "./components/FileUploadBar";
import { FormRenderer } from "./components/FormRenderer";
import { DebugPanel } from "./components/DebugPanel";
import { QuestionTree } from "./components/QuestionTree";
import { ErrorBoundary } from "./components/ErrorBoundary";
import axios from "axios";
import type { DebugTab, ExternalDataEntry, FormState, XlsRows } from "./types";

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
  const [xlsRows, setXlsRows] = useState<XlsRows | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [activeDebugTab, setActiveDebugTab] = useState<DebugTab>("values");
  const [exporting, setExporting] = useState(false);

  useEffect(() => { window.__xformXml = xformXml; }, [xformXml]);
  useEffect(() => { window.__externalData = externalData; }, [externalData]);

  const handleConvert = useCallback(
    (xform: string, conversionWarnings: readonly string[], extData: readonly ExternalDataEntry[], rows: XlsRows) => {
      setError(null);
      setXformXml(xform);
      setWarnings(conversionWarnings);
      setExternalData(extData);
      setXlsRows(rows);
      setFormState(EMPTY_STATE);
      setSelectedQuestion(null);
    },
    []
  );

  const handleUpdateField = useCallback(
    (fieldName: string, updates: Record<string, string>) => {
      setXlsRows((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          survey: prev.survey.map((row) =>
            row.name === fieldName ? { ...row, ...updates } : row
          ),
        };
      });
    },
    []
  );

  const handleApplyCurrentEdits = useCallback(async () => {
    if (!xlsRows) return;
    try {
      const response = await axios.post("http://localhost:5050/convert-json", {
        survey: xlsRows.survey,
        choices: xlsRows.choices,
        settings: xlsRows.settings,
      });
      setXformXml(response.data.xform_xml);
      setWarnings(response.data.warnings ?? []);
      setFormState(EMPTY_STATE);
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.detail
          ? String(err.response.data.detail)
          : err instanceof Error
            ? err.message
            : "Re-conversion failed";
      setError(message);
    }
  }, [xlsRows]);

  const handleRowsChange = useCallback((rows: XlsRows) => {
    setXlsRows(rows);
  }, []);

  const handleNewForm = useCallback(() => {
    const blankRows: XlsRows = {
      survey: [{ type: "text", name: "name", label: "Full Name", required: "yes" }],
      choices: [],
      settings: [{ form_title: "New Form", form_id: "new_form" }],
    };
    setXlsRows(blankRows);
    setXformXml(null);
    setWarnings([]);
    setExternalData([]);
    setFormState(EMPTY_STATE);
    setError(null);
    setSelectedQuestion(null);
    setActiveDebugTab("builder");
  }, []);

  const handleExport = useCallback(async () => {
    if (!xlsRows) return;
    setExporting(true);
    try {
      const response = await axios.post(
        "http://localhost:5050/export",
        { survey: xlsRows.survey, choices: xlsRows.choices, settings: xlsRows.settings },
        { responseType: "blob" }
      );
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      const title = xlsRows.settings[0]?.form_title ?? "form";
      a.download = `${title}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.detail
          ? String(err.response.data.detail)
          : err instanceof Error
            ? err.message
            : "Export failed";
      setError(message);
    } finally {
      setExporting(false);
    }
  }, [xlsRows]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__loadForm = (x: string, e: ExternalDataEntry[]) => handleConvert(x, [], e ?? [], { survey: [], choices: [], settings: [] });

  const handleError = useCallback((msg: string) => { setError(msg); }, []);
  const handleModelUpdate = useCallback((state: FormState) => { setFormState(state); }, []);
  const handleQuestionSelect = useCallback((name: string | null) => { setSelectedQuestion(name); }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 text-xs">
      <a href="#main-content" className="sr-only focus:not-sr-only">Skip to main content</a>

      <header>
        <h1 className="sr-only">XLSForm Debugger</h1>
        <FileUploadBar
          onConvert={handleConvert}
          onError={handleError}
          onNewForm={handleNewForm}
          onExport={handleExport}
          exporting={exporting}
          hasForm={xlsRows !== null}
        />
      </header>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 text-sm flex items-center justify-between border-b border-red-200">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4">&#10005;</button>
        </div>
      )}

      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        <Panel defaultSize={18} minSize={10} maxSize={35}>
          <nav aria-label="Form structure">
            <QuestionTree
              xformXml={xformXml}
              selectedQuestion={selectedQuestion}
              onSelect={handleQuestionSelect}
            />
          </nav>
        </Panel>
        <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors" />

        <Panel defaultSize={45} minSize={25}>
          <main id="main-content" className="h-full overflow-auto">
            <ErrorBoundary label="Form renderer">
              <FormRenderer
                xformXml={xformXml}
                externalData={externalData}
                onModelUpdate={handleModelUpdate}
                onError={handleError}
                onQuestionSelect={handleQuestionSelect}
              />
            </ErrorBoundary>
          </main>
        </Panel>
        <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors" />

        <Panel defaultSize={37} minSize={20}>
          <DebugPanel
            formState={formState}
            warnings={warnings}
            xformXml={xformXml}
            selectedQuestion={selectedQuestion}
            onQuestionSelect={handleQuestionSelect}
            xlsRows={xlsRows}
            onUpdateField={handleUpdateField}
            onApplyEdits={handleApplyCurrentEdits}
            onRowsChange={handleRowsChange}
            activeTab={activeDebugTab}
            onTabChange={setActiveDebugTab}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}
