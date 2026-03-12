import { useMemo, useState } from "react";

interface QuestionTreeProps {
  readonly xformXml: string | null;
  readonly selectedQuestion: string | null;
  readonly onSelect: (name: string, xpath?: string) => void;
}

type NodeType =
  | "group"
  | "repeat"
  | "text"
  | "integer"
  | "decimal"
  | "select_one"
  | "select_multiple"
  | "calculate"
  | "geopoint"
  | "note"
  | "date"
  | "time"
  | "datetime"
  | "image"
  | "audio"
  | "video"
  | "barcode"
  | "hidden"
  | "unknown";

interface TreeNode {
  readonly name: string;
  readonly xpath: string;
  readonly label: string;
  readonly nodeType: NodeType;
  readonly children: TreeNode[];
}

const TYPE_ICONS: Record<NodeType, string> = {
  group: "▸",
  repeat: "↻",
  text: "Aa",
  integer: "#",
  decimal: "#.#",
  select_one: "◉",
  select_multiple: "☑",
  calculate: "ƒ",
  geopoint: "📍",
  note: "📝",
  date: "📅",
  time: "⏱",
  datetime: "🕐",
  image: "🖼",
  audio: "🔊",
  video: "🎬",
  barcode: "▦",
  hidden: "⚙",
  unknown: "?",
};

function getNodeType(tag: string, bindType: string, hasCalculate = false): NodeType {
  if (tag === "group") return "group";
  if (tag === "repeat") return "repeat";
  if (tag === "select1") return "select_one";
  if (tag === "select") return "select_multiple";
  if (hasCalculate) return "calculate";
  const t = bindType.toLowerCase();
  if (["text", "integer", "decimal", "geopoint", "date", "time", "datetime", "image", "audio", "video", "barcode"].includes(t)) {
    return t as NodeType;
  }
  if (t === "string") return "text";
  return "unknown";
}

function getLabelText(el: Element): string {
  const label = el.querySelector("label value, label");
  return label?.textContent?.trim() ?? "";
}

function parseChildren(parent: Element, bindMap: Map<string, string>, prefix: string): TreeNode[] {
  const nodes: TreeNode[] = [];
  for (const el of Array.from(parent.children)) {
    const tag = el.tagName.toLowerCase();
    if (["label", "hint", "output", "value", "itemset", "item"].includes(tag)) continue;
    const ref = el.getAttribute("ref") ?? el.getAttribute("nodeset") ?? "";
    const name = ref.split("/").pop() ?? "";
    const xpath = ref.startsWith("/") ? ref : prefix ? `${prefix}/${name}` : name;
    const bindType = bindMap.get(name) ?? "";
    const nodeType = getNodeType(tag, bindType);
    const label = getLabelText(el);
    const children =
      tag === "group" || tag === "repeat"
        ? parseChildren(el, bindMap, xpath)
        : [];
    if (name) {
      nodes.push({ name, xpath, label, nodeType, children });
    }
  }
  return nodes;
}

function collectNames(nodes: TreeNode[], names: Set<string>): void {
  for (const node of nodes) {
    names.add(node.name);
    collectNames(node.children, names);
  }
}

function buildTree(xmlString: string): TreeNode[] {
  const doc = new DOMParser().parseFromString(xmlString, "application/xml");
  const bindMap = new Map<string, string>();
  const bindNodesets = new Map<string, string>();
  const bindHasCalc = new Map<string, boolean>();
  doc.querySelectorAll("bind").forEach((bind) => {
    const nodeset = bind.getAttribute("nodeset") ?? "";
    const name = nodeset.split("/").pop() ?? "";
    if (!name) return;
    bindMap.set(name, bind.getAttribute("type") ?? "");
    bindNodesets.set(name, nodeset);
    bindHasCalc.set(name, !!(bind.getAttribute("calculate")
      || bind.getAttributeNS("http://www.opendatakit.org/xforms", "calculate")
      || bind.getAttribute("odk:calculate")));
  });
  // Build itext lookup for hidden field labels
  const itextLabels = new Map<string, string>();
  const translations = doc.querySelectorAll("itext translation");
  if (translations.length > 0) {
    // Use the first translation for tree display
    const firstTranslation = translations[0];
    for (const text of Array.from(firstTranslation.querySelectorAll("text"))) {
      const id = text.getAttribute("id") ?? "";
      if (id.endsWith(":label")) {
        const valueEl = text.querySelector("value");
        const val = valueEl?.textContent?.trim() ?? "";
        if (val) itextLabels.set(id, val);
      }
    }
  }

  const body = doc.querySelector("h\\:body, body");
  const bodyNodes = body ? parseChildren(body, bindMap, "") : [];

  // Find bind-only fields not present in body
  const bodyNames = new Set<string>();
  collectNames(bodyNodes, bodyNames);

  const hiddenNodes: TreeNode[] = [];
  bindMap.forEach((type, name) => {
    if (!bodyNames.has(name)) {
      const hasCalc = bindHasCalc.get(name) ?? false;
      const nodeType = hasCalc ? "calculate" as NodeType : "hidden" as NodeType;
      const nodeset = bindNodesets.get(name) ?? name;
      const itextLabel = itextLabels.get(`${nodeset}:label`) ?? "";
      hiddenNodes.push({
        name,
        xpath: nodeset,
        label: itextLabel,
        nodeType,
        children: [],
      });
    }
  });

  if (hiddenNodes.length > 0) {
    bodyNodes.push({
      name: "__meta__",
      xpath: "",
      label: "Meta / Hidden",
      nodeType: "group",
      children: hiddenNodes,
    });
  }

  return bodyNodes;
}

function getQuestionStatus(name: string): "active" | "hidden" | "answered" | "empty" {
  const el =
    document.querySelector(`.question[data-name*="${name}"]`) ??
    document.querySelector(`.question [name*="${name}"]`)?.closest(".question");
  if (!el) return "empty";
  if (el.classList.contains("disabled") || el.classList.contains("hidden") || el.closest(".disabled")) return "hidden";
  const input = el.querySelector("input, select, textarea") as HTMLInputElement | null;
  if (input?.value) return "answered";
  return "empty";
}

function TreeNodeItem({
  node,
  selectedQuestion,
  onSelect,
  depth,
}: {
  node: TreeNode;
  selectedQuestion: string | null;
  onSelect: (name: string, xpath?: string) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const isGroup = node.nodeType === "group" || node.nodeType === "repeat";
  const isSelected = node.name === selectedQuestion;
  const status = !isGroup ? getQuestionStatus(node.name) : null;

  const statusDot =
    status === "answered"
      ? "bg-green-500"
      : status === "hidden"
      ? "bg-orange-400"
      : "bg-gray-400";

  const handleClick = () => {
    if (isGroup) {
      setExpanded((e) => !e);
    } else {
      onSelect(node.name, node.xpath);
      const el =
        document.querySelector(`.question[data-name*="${node.name}"]`) ??
        document.querySelector(`.question [name*="${node.name}"]`)?.closest(".question");
      if (el) {
        (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("question--highlighted");
        setTimeout(() => el.classList.remove("question--highlighted"), 1500);
      }
    }
  };

  return (
    <div role={isGroup ? "group" : undefined}>
      <div
        role="treeitem"
        tabIndex={0}
        aria-selected={isSelected}
        aria-expanded={isGroup ? expanded : undefined}
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } }}
        title={node.name}
        className={`flex items-center gap-1 px-2 py-0.5 cursor-pointer rounded text-xs select-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
          isSelected
            ? "bg-blue-100 text-blue-700"
            : isGroup
            ? "text-gray-700 hover:bg-blue-50"
            : "text-gray-600 hover:bg-blue-50"
        }`}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        {isGroup && (
          <span className="text-gray-400 text-[10px] w-3">{expanded ? "▾" : "▸"}</span>
        )}
        <span className="text-gray-400 font-mono text-[10px] w-6 shrink-0 text-center">
          {TYPE_ICONS[node.nodeType] ?? "?"}
        </span>
        {!isGroup && (
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot}`} />
        )}
        <span className="truncate" title={node.label || node.name}>
          {node.label || node.name}
        </span>
      </div>
      {isGroup && expanded && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.xpath || child.name}
              node={child}
              selectedQuestion={selectedQuestion}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function QuestionTree({ xformXml, selectedQuestion, onSelect }: QuestionTreeProps) {
  const tree = useMemo(() => {
    if (!xformXml) return [];
    try {
      return buildTree(xformXml);
    } catch {
      return [];
    }
  }, [xformXml]);

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50 border-b border-gray-200 shrink-0">
        <span className="text-xs font-medium text-gray-700">Form Structure</span>
      </div>
      {/* Tree */}
      <div className="overflow-auto flex-1 py-1" role="tree">
        {!xformXml ? (
          <div className="px-3 py-2 text-xs text-gray-400">No form loaded</div>
        ) : tree.length === 0 ? (
          <div className="px-3 py-2 text-xs text-gray-400">No questions found</div>
        ) : (
          tree.map((node) => (
            <TreeNodeItem
              key={node.xpath || node.name}
              node={node}
              selectedQuestion={selectedQuestion}
              onSelect={onSelect}
              depth={0}
            />
          ))
        )}
      </div>
    </div>
  );
}
