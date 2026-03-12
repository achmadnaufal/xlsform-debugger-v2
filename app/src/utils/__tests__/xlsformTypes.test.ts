import { describe, it, expect } from "vitest";
import {
  bindTypeToXlsType,
  xlsTypeToBindType,
  xlsTypeToBodyTag,
  xlsTypeToMediatype,
  xlsTypeNeedsReadonly,
  xlsTypeToChangeResult,
} from "../xlsformTypes";

describe("bindTypeToXlsType", () => {
  it("maps string/input → text", () => {
    expect(bindTypeToXlsType("string", false, "input", false, "")).toBe("text");
  });

  it("maps string/input/readonly → note", () => {
    expect(bindTypeToXlsType("string", false, "input", true, "")).toBe("note");
  });

  it("maps calculate (no body)", () => {
    expect(bindTypeToXlsType("string", true, "", false, "")).toBe("calculate");
  });

  it("maps hidden (no body, no calculate)", () => {
    expect(bindTypeToXlsType("string", false, "", false, "")).toBe("hidden");
  });

  it("maps select1 → select_one", () => {
    expect(bindTypeToXlsType("select1", false, "select1", false, "")).toBe("select_one");
  });

  it("maps select → select_multiple", () => {
    expect(bindTypeToXlsType("select", false, "select", false, "")).toBe("select_multiple");
  });

  it("maps trigger → acknowledge", () => {
    expect(bindTypeToXlsType("string", false, "trigger", false, "")).toBe("acknowledge");
  });

  it("maps upload with mediatypes", () => {
    expect(bindTypeToXlsType("binary", false, "upload", false, "image/*")).toBe("image");
    expect(bindTypeToXlsType("binary", false, "upload", false, "audio/*")).toBe("audio");
    expect(bindTypeToXlsType("binary", false, "upload", false, "video/*")).toBe("video");
  });

  it("maps rank", () => {
    expect(bindTypeToXlsType("odk:rank", false, "rank", false, "")).toBe("rank");
  });
});

describe("xlsTypeToBindType", () => {
  it("maps common types", () => {
    expect(xlsTypeToBindType("text")).toBe("string");
    expect(xlsTypeToBindType("integer")).toBe("int");
    expect(xlsTypeToBindType("decimal")).toBe("decimal");
    expect(xlsTypeToBindType("image")).toBe("binary");
  });

  it("returns input for unknown", () => {
    expect(xlsTypeToBindType("unknown_type")).toBe("unknown_type");
  });
});

describe("xlsTypeToBodyTag", () => {
  it("maps visible types to body tags", () => {
    expect(xlsTypeToBodyTag("text")).toBe("input");
    expect(xlsTypeToBodyTag("select_one")).toBe("select1");
    expect(xlsTypeToBodyTag("acknowledge")).toBe("trigger");
    expect(xlsTypeToBodyTag("image")).toBe("upload");
  });

  it("returns empty for hidden types", () => {
    expect(xlsTypeToBodyTag("calculate")).toBe("");
    expect(xlsTypeToBodyTag("hidden")).toBe("");
  });
});

describe("xlsTypeToMediatype", () => {
  it("returns mediatypes for upload types", () => {
    expect(xlsTypeToMediatype("image")).toBe("image/*");
    expect(xlsTypeToMediatype("audio")).toBe("audio/*");
    expect(xlsTypeToMediatype("video")).toBe("video/*");
  });

  it("returns empty for non-upload types", () => {
    expect(xlsTypeToMediatype("text")).toBe("");
  });
});

describe("xlsTypeNeedsReadonly", () => {
  it("returns true only for note", () => {
    expect(xlsTypeNeedsReadonly("note")).toBe(true);
    expect(xlsTypeNeedsReadonly("text")).toBe(false);
  });
});

describe("xlsTypeToChangeResult", () => {
  it("returns complete change result for note", () => {
    const result = xlsTypeToChangeResult("note");
    expect(result).toEqual({
      bindType: "string",
      bodyTag: "input",
      readonly: "true()",
      mediatype: "",
    });
  });

  it("returns complete change result for image", () => {
    const result = xlsTypeToChangeResult("image");
    expect(result).toEqual({
      bindType: "binary",
      bodyTag: "upload",
      readonly: "",
      mediatype: "image/*",
    });
  });
});
