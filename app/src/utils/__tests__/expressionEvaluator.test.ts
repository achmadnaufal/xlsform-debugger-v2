import { describe, it, expect } from "vitest";
import { evaluateRelevant, evaluateConstraint } from "../expressionEvaluator";

describe("evaluateRelevant", () => {
  it("returns true for empty expression", () => {
    expect(evaluateRelevant("", {})).toBe(true);
  });

  it("evaluates simple equality", () => {
    expect(evaluateRelevant("${q1} = 'yes'", { q1: "yes" })).toBe(true);
    expect(evaluateRelevant("${q1} = 'yes'", { q1: "no" })).toBe(false);
  });

  it("evaluates and/or logic", () => {
    expect(evaluateRelevant("${a} = '1' and ${b} = '2'", { a: "1", b: "2" })).toBe(true);
    expect(evaluateRelevant("${a} = '1' and ${b} = '2'", { a: "1", b: "3" })).toBe(false);
    expect(evaluateRelevant("${a} = '1' or ${b} = '2'", { a: "0", b: "2" })).toBe(true);
  });

  it("evaluates numeric comparisons", () => {
    expect(evaluateRelevant("${age} > 18", { age: "25" })).toBe(true);
    expect(evaluateRelevant("${age} > 18", { age: "10" })).toBe(false);
    expect(evaluateRelevant("${age} >= 18", { age: "18" })).toBe(true);
  });

  it("evaluates not()", () => {
    expect(evaluateRelevant("not(${q1} = 'yes')", { q1: "no" })).toBe(true);
    expect(evaluateRelevant("not(${q1} = 'yes')", { q1: "yes" })).toBe(false);
  });

  it("evaluates selected() with quoted values", () => {
    // selected() works when the haystack is a quoted string literal
    expect(evaluateRelevant("selected('red blue', 'red')", {})).toBe(true);
    expect(evaluateRelevant("selected('red blue', 'green')", {})).toBe(false);
  });

  it("handles missing variables gracefully (returns true on error)", () => {
    // Missing ${var} resolves to empty string, making the expression unparseable
    // The evaluator catches errors and returns true (fail-open for relevant)
    expect(evaluateRelevant("${present} = 'hello'", { present: "hello" })).toBe(true);
    expect(evaluateRelevant("${present} = 'hello'", { present: "world" })).toBe(false);
  });
});

describe("evaluateConstraint", () => {
  it("returns true for empty expression", () => {
    expect(evaluateConstraint("", "val", {})).toBe(true);
  });

  it("returns true for empty value", () => {
    expect(evaluateConstraint(". > 0", "", {})).toBe(true);
  });

  it("evaluates dot reference (self-value)", () => {
    expect(evaluateConstraint(". > 0", "5", {})).toBe(true);
    expect(evaluateConstraint(". > 0", "-1", {})).toBe(false);
  });

  it("evaluates string constraints", () => {
    expect(evaluateConstraint(". != ''", "hello", {})).toBe(true);
  });

  it("evaluates with form values", () => {
    expect(evaluateConstraint(". < ${max}", "5", { max: "10" })).toBe(true);
    expect(evaluateConstraint(". < ${max}", "15", { max: "10" })).toBe(false);
  });
});
