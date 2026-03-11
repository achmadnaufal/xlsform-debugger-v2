import { describe, it, expect } from "vitest";
import { applyEditsToSheets, type SheetEditMeta } from "../xlsformSheetMutator";
import type { XlsFormSheets } from "../../types";
import type { FieldEdit } from "../../types/editor";

const baseMeta: SheetEditMeta = {
  bodyTag: "input",
  hasCalc: false,
  isReadonly: false,
  mediatype: "",
  listName: "",
};

function makeSheets(surveyRows: Record<string, unknown>[]): XlsFormSheets {
  return {
    survey: surveyRows,
    choices: [{ list_name: "colors", name: "red", "label::English": "Red" }],
  };
}

describe("applyEditsToSheets", () => {
  it("updates the correct row by field name", () => {
    const sheets = makeSheets([
      { name: "age", type: "integer", label: "Age" },
      { name: "name", type: "text", label: "Name" },
    ]);
    const edits: FieldEdit = { relevant: "${age} > 18" };
    const result = applyEditsToSheets(sheets, "name", edits, baseMeta);
    expect(result.survey![1]).toEqual(
      expect.objectContaining({ name: "name", relevant: "${age} > 18" }),
    );
    // Other row unchanged
    expect(result.survey![0]).toBe(sheets.survey[0]);
  });

  it("maps label edits to the correct column (default language)", () => {
    const sheets = makeSheets([{ name: "q1", type: "text", label: "Old" }]);
    const edits: FieldEdit = { labels: { default: "New Label" } };
    const result = applyEditsToSheets(sheets, "q1", edits, baseMeta);
    expect(result.survey![0]["label"]).toBe("New Label");
  });

  it("maps label edits to named language columns", () => {
    const sheets = makeSheets([
      { name: "q1", type: "text", "label::English": "Hello", "label::French": "Bonjour" },
    ]);
    const edits: FieldEdit = { labels: { English: "Hi" } };
    const result = applyEditsToSheets(sheets, "q1", edits, baseMeta);
    expect(result.survey![0]["label::English"]).toBe("Hi");
    expect(result.survey![0]["label::French"]).toBe("Bonjour");
  });

  it("maps hint edits to correct columns", () => {
    const sheets = makeSheets([{ name: "q1", type: "text", "hint::English": "old hint" }]);
    const edits: FieldEdit = { hints: { English: "new hint" } };
    const result = applyEditsToSheets(sheets, "q1", edits, baseMeta);
    expect(result.survey![0]["hint::English"]).toBe("new hint");
  });

  it("maps constraint_message edits", () => {
    const sheets = makeSheets([{ name: "q1", type: "text", "constraint_message::English": "bad" }]);
    const edits: FieldEdit = { constraintMessages: { English: "Invalid!" } };
    const result = applyEditsToSheets(sheets, "q1", edits, baseMeta);
    expect(result.survey![0]["constraint_message::English"]).toBe("Invalid!");
  });

  it("maps relevant, constraint, calculation, appearance, choice_filter, default", () => {
    const sheets = makeSheets([
      { name: "q1", type: "text", relevant: "", constraint: "", calculation: "", appearance: "", choice_filter: "", default: "" },
    ]);
    const edits: FieldEdit = {
      relevant: "${x} > 1",
      constraint: ". > 0",
      calculation: "1 + 2",
      appearance: "minimal",
      choiceFilter: "x = 1",
      defaultValue: "hello",
    };
    const result = applyEditsToSheets(sheets, "q1", edits, baseMeta);
    const row = result.survey![0];
    expect(row["relevant"]).toBe("${x} > 1");
    expect(row["constraint"]).toBe(". > 0");
    expect(row["calculation"]).toBe("1 + 2");
    expect(row["appearance"]).toBe("minimal");
    expect(row["choice_filter"]).toBe("x = 1");
    expect(row["default"]).toBe("hello");
  });

  it("converts required true() to yes", () => {
    const sheets = makeSheets([{ name: "q1", type: "text", required: "" }]);
    const edits: FieldEdit = { required: "true()" };
    const result = applyEditsToSheets(sheets, "q1", edits, baseMeta);
    expect(result.survey![0]["required"]).toBe("yes");
  });

  it("converts required empty to empty", () => {
    const sheets = makeSheets([{ name: "q1", type: "text", required: "yes" }]);
    const edits: FieldEdit = { required: "" };
    const result = applyEditsToSheets(sheets, "q1", edits, baseMeta);
    expect(result.survey![0]["required"]).toBe("");
  });

  it("preserves list_name suffix for select types", () => {
    const sheets = makeSheets([{ name: "color", type: "select_one colors" }]);
    const meta: SheetEditMeta = { ...baseMeta, bodyTag: "select1", listName: "colors" };
    const edits: FieldEdit = { type: "select1" };
    const result = applyEditsToSheets(sheets, "color", edits, meta);
    expect(result.survey![0]["type"]).toBe("select_one colors");
  });

  it("maps type change correctly", () => {
    const sheets = makeSheets([{ name: "q1", type: "text" }]);
    const meta: SheetEditMeta = { ...baseMeta, bodyTag: "" };
    const edits: FieldEdit = { type: "string", bodyTag: "", calculation: "1+1" };
    const result = applyEditsToSheets(sheets, "q1", edits, { ...meta, hasCalc: true });
    expect(result.survey![0]["type"]).toBe("calculate");
  });

  it("returns original sheets when field not found", () => {
    const sheets = makeSheets([{ name: "q1", type: "text" }]);
    const edits: FieldEdit = { relevant: "x" };
    const result = applyEditsToSheets(sheets, "nonexistent", edits, baseMeta);
    expect(result).toBe(sheets);
  });

  it("returns original sheets when survey sheet missing", () => {
    const sheets: XlsFormSheets = { choices: [] };
    const edits: FieldEdit = { relevant: "x" };
    const result = applyEditsToSheets(sheets, "q1", edits, baseMeta);
    expect(result).toBe(sheets);
  });

  it("returns original sheets when no edits have defined values", () => {
    const sheets = makeSheets([{ name: "q1", type: "text" }]);
    const edits: FieldEdit = {};
    const result = applyEditsToSheets(sheets, "q1", edits, baseMeta);
    expect(result).toBe(sheets);
  });

  it("produces immutable result (does not mutate original)", () => {
    const originalRow = { name: "q1", type: "text", label: "Old" };
    const sheets = makeSheets([originalRow]);
    const edits: FieldEdit = { labels: { default: "New" } };
    const result = applyEditsToSheets(sheets, "q1", edits, baseMeta);
    // Original is untouched
    expect(originalRow.label).toBe("Old");
    expect(sheets.survey[0]["label"]).toBe("Old");
    // Result is different object
    expect(result).not.toBe(sheets);
    expect(result.survey).not.toBe(sheets.survey);
    expect(result.survey![0]).not.toBe(sheets.survey[0]);
    // But choices sheet is same reference
    expect(result.choices).toBe(sheets.choices);
  });
});
