import { useState } from "react";
import { FieldEditorInspector } from "./DebugTabs/FieldEditorInspector";
import { MergedValuesPanel } from "./DebugTabs/MergedValuesPanel";
import { WarningsPanel } from "./DebugTabs/WarningsPanel";
import { XLSFormSource } from "./DebugTabs/XLSFormSource";
import { ExternalDataPanel } from "./DebugTabs/ExternalDataPanel";
import { tab } from "../lib/styles";
import type { FormState, XlsFormSheets } from "../types";
import type { SheetsUpdatePayload } from "../types/editor";

type DebugTab = "inspector" | "values" | "warnings" | "external" | "source";

interface DebugPanelProps {
  readonly formState: FormState;
  readonly warnings: readonly string[];
  readonly xformXml: string | null;
  readonly xlsformSheets: XlsFormSheets;
  readonly selectedQuestion: string | null;
  readonly onQuestionSelect: (name: string) => void;
  readonly onXformSave: (xml: string, sheetsUpdate?: SheetsUpdatePayload) => void;
  readonly onXformUpdate: (xml: string, sheetsUpdate?: SheetsUpdatePayload) => void;
}

const TABS: readonly { readonly id: DebugTab; readonly label: string }[] = [
  { id: "inspector", label: "Inspector" },
  { id: "values", label: "Values" },
  { id: "warnings", label: "Warnings" },
  { id: "external", label: "External" },
  { id: "source", label: "XLSForm" },
];

export function DebugPanel({
  formState,
  warnings,
  xformXml,
  xlsformSheets,
  selectedQuestion,
  onQuestionSelect,
  onXformSave,
  onXformUpdate,
}: DebugPanelProps) {
  const [activeTab, setActiveTab] = useState<DebugTab>("inspector");

  return (
    <div className="flex flex-col h-full bg-white text-gray-900 border-l border-gray-200">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 shrink-0 overflow-x-auto scrollbar-none" role="tablist">
        {TABS.map((t) => {
          const isActive = activeTab === t.id;
          const count =
            t.id === "values"
              ? formState.variables.length
              : t.id === "warnings"
              ? warnings.length
              : null;

          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${t.id}`}
              onClick={() => setActiveTab(t.id)}
              className={`${tab.base} ${isActive ? tab.active : tab.inactive}`}
            >
              {t.label}
              {count !== null && count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-200 text-[10px]">
                  {count}
                </span>
              )}
              {t.id === "inspector" && selectedQuestion && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-mono">
                  {selectedQuestion}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden" role="tabpanel" id={`tabpanel-${activeTab}`}>
        {activeTab === "inspector" && (
          <FieldEditorInspector
            xformXml={xformXml}
            selectedQuestion={selectedQuestion}
            onQuestionSelect={onQuestionSelect}
            onXformSave={onXformSave}
            onXformUpdate={onXformUpdate}
            variables={formState.variables}
          />
        )}
        {activeTab === "values" && (
          <MergedValuesPanel
            variables={formState.variables}
            xformXml={xformXml}
            onQuestionSelect={onQuestionSelect}
          />
        )}
        {activeTab === "warnings" && (
          <WarningsPanel
            warnings={warnings}
            xformXml={xformXml}
            variables={formState.variables}
          />
        )}
        {activeTab === "external" && (
          <ExternalDataPanel xformXml={xformXml} />
        )}
        {activeTab === "source" && (
          <XLSFormSource xlsformSheets={xlsformSheets} selectedQuestion={selectedQuestion} />
        )}
      </div>
    </div>
  );
}
