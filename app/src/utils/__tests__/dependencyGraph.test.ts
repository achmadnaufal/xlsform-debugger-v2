import { describe, it, expect } from "vitest";
import { buildDependencyGraph, detectCycles, getFieldsInCycles } from "../dependencyGraph";
import type { FieldMeta } from "../xformParser";

function makeField(name: string, overrides: Partial<FieldMeta> = {}): FieldMeta {
  return {
    name,
    xpath: `/data/${name}`,
    type: "string",
    bodyTag: "input",
    readonly: "",
    mediatype: "",
    labels: {},
    hints: {},
    constraintMessages: {},
    relevant: "",
    constraint: "",
    calculation: "",
    required: "",
    appearance: "",
    choiceFilter: "",
    listName: "",
    defaultValue: "",
    repeatCount: "",
    parameters: "",
    trigger: "",
    mediaImages: {},
    ...overrides,
  };
}

describe("buildDependencyGraph", () => {
  it("extracts dependencies from expressions", () => {
    const fields = new Map<string, FieldMeta>();
    fields.set("a", makeField("a", { calculation: "${b} + ${c}" }));
    fields.set("b", makeField("b"));
    fields.set("c", makeField("c", { relevant: "${a} > 0" }));

    const graph = buildDependencyGraph(fields);
    expect(graph.get("a")).toEqual(["b", "c"]);
    expect(graph.get("b")).toEqual([]);
    expect(graph.get("c")).toEqual(["a"]);
  });

  it("ignores references to unknown fields", () => {
    const fields = new Map<string, FieldMeta>();
    fields.set("a", makeField("a", { calculation: "${unknown_field}" }));

    const graph = buildDependencyGraph(fields);
    expect(graph.get("a")).toEqual([]);
  });
});

describe("detectCycles", () => {
  it("detects simple A→B→A cycle", () => {
    const graph = new Map<string, readonly string[]>();
    graph.set("a", ["b"]);
    graph.set("b", ["a"]);

    const cycles = detectCycles(graph);
    expect(cycles.length).toBe(1);
    expect(cycles[0].path).toEqual(["a", "b", "a"]);
  });

  it("detects longer A→B→C→A cycle", () => {
    const graph = new Map<string, readonly string[]>();
    graph.set("a", ["b"]);
    graph.set("b", ["c"]);
    graph.set("c", ["a"]);

    const cycles = detectCycles(graph);
    expect(cycles.length).toBe(1);
    expect(cycles[0].path).toEqual(["a", "b", "c", "a"]);
  });

  it("returns empty for acyclic graph", () => {
    const graph = new Map<string, readonly string[]>();
    graph.set("a", ["b"]);
    graph.set("b", ["c"]);
    graph.set("c", []);

    const cycles = detectCycles(graph);
    expect(cycles.length).toBe(0);
  });

  it("detects self-referential field", () => {
    const graph = new Map<string, readonly string[]>();
    graph.set("a", ["a"]);

    const cycles = detectCycles(graph);
    expect(cycles.length).toBe(1);
    expect(cycles[0].path).toEqual(["a", "a"]);
  });

  it("handles mixed: some cycles, some clean fields", () => {
    const graph = new Map<string, readonly string[]>();
    graph.set("a", ["b"]);
    graph.set("b", ["a"]);
    graph.set("c", ["d"]);
    graph.set("d", []);

    const cycles = detectCycles(graph);
    expect(cycles.length).toBe(1);
    expect(cycles[0].path).toEqual(["a", "b", "a"]);
  });
});

describe("getFieldsInCycles", () => {
  it("returns all fields that participate in cycles", () => {
    const cycles = [
      { path: ["a", "b", "a"], expressions: ["a → b", "b → a"] },
      { path: ["c", "d", "e", "c"], expressions: ["c → d", "d → e", "e → c"] },
    ];

    const inCycles = getFieldsInCycles(cycles);
    expect(inCycles).toEqual(new Set(["a", "b", "c", "d", "e"]));
  });

  it("returns empty set for no cycles", () => {
    const inCycles = getFieldsInCycles([]);
    expect(inCycles).toEqual(new Set());
  });
});
