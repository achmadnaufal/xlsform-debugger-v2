import { useState, useCallback, useRef } from "react";
import { BuilderPanel } from "./DebugTabs/BuilderPanel";
import { ValuesPanel } from "./DebugTabs/ValuesPanel";
import { WarningsPanel } from "./DebugTabs/WarningsPanel";
import { XLSFormSource } from "./DebugTabs/XLSFormSource";
import { ExternalDataPanel } from "./DebugTabs/ExternalDataPanel";
import { ExpressionTracer } from "./DebugTabs/ExpressionTracer";
import { ErrorBoundary } from "./ErrorBoundary";
import type { DebugTab, FormState, XlsRows } from "../types";

interface DebugPanelProps {
  readonly formState: FormState;
  readonly warnings: readonly string[];
  readonly xformXml: string | null;
  readonly selectedQuestion: string | null;
  readonly onQuestionSelect: (name: string | null) => void;
  readonly xlsRows: XlsRows | null;
  readonly onUpdateField: (fieldName: string, updates: Record<string, string>) => void;
  readonly onApplyEdits: () => Promise<void>;
  readonly onRowsChange: (rows: XlsRows) => void;
  readonly activeTab?: DebugTab;
  readonly onTabChange?: (tab: DebugTab) => void;
}

const TABS: readonly { readonly id: DebugTab; readonly label: string }[] = [
  { id: "builder", label: "Builder" },
  { id: "values", label: "Values" },
  { id: "warnings", label: "Warnings" },
  { id: "external", label: "External" },
  { id: "source", label: "XLSForm" },
  { id: "expressions", label: "Expressions" },
];

export function DebugPanel({
  formState,
  warnings,
  xformXml,
  selectedQuestion,
  onQuestionSelect,
  xlsRows,
  onUpdateField,
  onApplyEdits,
  onRowsChange,
  activeTab: controlledTab,
  onTabChange,
}: DebugPanelProps) {
  const [internalTab, setInternalTab] = useState<DebugTab>("values");
  const activeTab = controlledTab ?? internalTab;
  const tabListRef = useRef<HTMLDivElement>(null);

  const setActiveTab = useCallback(
    (tabId: DebugTab) => {
      if (onTabChange) {
        onTabChange(tabId);
      } else {
        setInternalTab(tabId);
      }
    },
    [onTabChange]
  );

  const handleTabSwitch = useCallback(
    (tabId: DebugTab) => {
      setActiveTab(tabId);
      onQuestionSelect(null);
    },
    [setActiveTab, onQuestionSelect]
  );

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = TABS.findIndex((t) => t.id === activeTab);
      let nextIndex = currentIndex;

      if (e.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % TABS.length;
      } else if (e.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
      } else if (e.key === "Home") {
        nextIndex = 0;
      } else if (e.key === "End") {
        nextIndex = TABS.length - 1;
      } else {
        return;
      }

      e.preventDefault();
      const nextTab = TABS[nextIndex];
      handleTabSwitch(nextTab.id);
      const btn = tabListRef.current?.querySelector<HTMLButtonElement>(
        `#tab-${nextTab.id}`
      );
      btn?.focus();
    },
    [activeTab, handleTabSwitch]
  );

  return (
    <div className="flex flex-col h-full bg-white text-gray-900 border-l border-gray-200">
      {/* Tab bar */}
      <div
        ref={tabListRef}
        role="tablist"
        className="flex border-b border-gray-200 shrink-0 overflow-x-auto scrollbar-none"
        onKeyDown={handleTabKeyDown}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count =
            tab.id === "values"
              ? formState.variables.length
              : tab.id === "warnings"
              ? warnings.length
              : tab.id === "expressions"
              ? formState.expressions.length
              : null;

          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleTabSwitch(tab.id)}
              className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              {count !== null && count > 0 && (
                <>
                  <span aria-hidden="true" className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-200 text-[10px]">
                    {count}
                  </span>
                  <span className="sr-only"> {count} items</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="flex-1 overflow-hidden"
      >
        {activeTab === "builder" && xlsRows && (
          <ErrorBoundary label="Builder">
            <BuilderPanel xlsRows={xlsRows} onRowsChange={onRowsChange} />
          </ErrorBoundary>
        )}
        {activeTab === "values" && xlsRows && (
          <ErrorBoundary label="Values">
            <ValuesPanel
              variables={formState.variables}
              xformXml={xformXml}
              selectedQuestion={selectedQuestion}
              onQuestionSelect={onQuestionSelect}
              xlsRows={xlsRows}
              onUpdateField={onUpdateField}
              onApplyEdits={onApplyEdits}
            />
          </ErrorBoundary>
        )}
        {activeTab === "warnings" && (
          <ErrorBoundary label="Warnings">
            <WarningsPanel
              warnings={warnings}
              xformXml={xformXml}
              variables={formState.variables}
            />
          </ErrorBoundary>
        )}
        {activeTab === "external" && (
          <ErrorBoundary label="External">
            <ExternalDataPanel xformXml={xformXml} />
          </ErrorBoundary>
        )}
        {activeTab === "source" && (
          <ErrorBoundary label="XLSForm">
            <XLSFormSource xformXml={xformXml} selectedQuestion={selectedQuestion} />
          </ErrorBoundary>
        )}
        {activeTab === "expressions" && (
          <ErrorBoundary label="Expressions">
            <ExpressionTracer expressions={formState.expressions} />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}
