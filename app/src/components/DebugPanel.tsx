import { useState } from "react";
import { VariableInspector } from "./DebugTabs/VariableInspector";
import { ExpressionTracer } from "./DebugTabs/ExpressionTracer";
import { WarningsPanel } from "./DebugTabs/WarningsPanel";
import { XFormViewer } from "./DebugTabs/XFormViewer";
import type { DebugTab, FormState } from "../types";

interface DebugPanelProps {
  readonly formState: FormState;
  readonly warnings: readonly string[];
  readonly xformXml: string | null;
}

const TABS: readonly { readonly id: DebugTab; readonly label: string }[] = [
  { id: "variables", label: "Variables" },
  { id: "expressions", label: "Expressions" },
  { id: "warnings", label: "Warnings" },
  { id: "xform", label: "XForm" },
];

export function DebugPanel({
  formState,
  warnings,
  xformXml,
}: DebugPanelProps) {
  const [activeTab, setActiveTab] = useState<DebugTab>("variables");

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      {/* Tab bar */}
      <div className="flex border-b border-gray-700 shrink-0">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count =
            tab.id === "variables"
              ? formState.variables.length
              : tab.id === "expressions"
                ? formState.expressions.length
                : tab.id === "warnings"
                  ? warnings.length
                  : null;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
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
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "variables" && (
          <VariableInspector variables={formState.variables} />
        )}
        {activeTab === "expressions" && (
          <ExpressionTracer expressions={formState.expressions} />
        )}
        {activeTab === "warnings" && <WarningsPanel warnings={warnings} />}
        {activeTab === "xform" && <XFormViewer xformXml={xformXml} />}
      </div>
    </div>
  );
}
