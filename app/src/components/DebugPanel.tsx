import { useState } from "react";
import { VariableInspector } from "./DebugTabs/VariableInspector";
import { CalculationsPanel } from "./DebugTabs/CalculationsPanel";
import { QuestionInspector } from "./DebugTabs/QuestionInspector";
import { WarningsPanel } from "./DebugTabs/WarningsPanel";
import { XLSFormSource } from "./DebugTabs/XLSFormSource";
import { ExternalDataPanel } from "./DebugTabs/ExternalDataPanel";
import type { FormState } from "../types";

type DebugTab = "variables" | "calculations" | "question" | "warnings" | "external" | "source";

interface DebugPanelProps {
  readonly formState: FormState;
  readonly warnings: readonly string[];
  readonly xformXml: string | null;
  readonly selectedQuestion: string | null;
  readonly onQuestionSelect: (name: string) => void;
}

const TABS: readonly { readonly id: DebugTab; readonly label: string }[] = [
  { id: "variables", label: "Variables" },
  { id: "calculations", label: "Calculations" },
  { id: "question", label: "Inspector" },
  { id: "warnings", label: "Warnings" },
  { id: "external", label: "External" },
  { id: "source", label: "XLSForm" },
];

export function DebugPanel({
  formState,
  warnings,
  xformXml,
  selectedQuestion,
  onQuestionSelect,
}: DebugPanelProps) {
  const [activeTab, setActiveTab] = useState<DebugTab>("variables");

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      {/* Tab bar */}
      <div className="flex border-b border-gray-700 shrink-0 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count =
            tab.id === "variables"
              ? formState.variables.length
              : tab.id === "warnings"
              ? warnings.length
              : null;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "text-blue-400 border-b-2 border-blue-400 bg-gray-800"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              }`}
            >
              {tab.label}
              {count !== null && count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-700 text-[10px]">
                  {count}
                </span>
              )}
              {tab.id === "question" && selectedQuestion && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-blue-800 text-blue-300 text-[10px] font-mono">
                  {selectedQuestion}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "variables" && (
          <VariableInspector variables={formState.variables} />
        )}
        {activeTab === "calculations" && (
          <CalculationsPanel xformXml={xformXml} />
        )}
        {activeTab === "question" && (
          <QuestionInspector
            selectedQuestion={selectedQuestion}
            onQuestionSelect={onQuestionSelect}
            xformXml={xformXml}
            variables={formState.variables}
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
          <XLSFormSource xformXml={xformXml} selectedQuestion={selectedQuestion} />
        )}
      </div>
    </div>
  );
}
