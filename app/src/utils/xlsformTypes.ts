/**
 * Bidirectional mapping between XLSForm types and XForm bind/body representations.
 *
 * XLSForm types (text, note, calculate, etc.) map to combinations of:
 *   - bind type (string, int, decimal, ...)
 *   - body element tag (input, select1, trigger, upload, ...)
 *   - bind readonly attribute (note = readonly)
 *   - body mediatype attribute (image/*, audio/*, video/*)
 */

export const XLSFORM_TYPES = [
  "text",
  "integer",
  "decimal",
  "note",
  "calculate",
  "select_one",
  "select_multiple",
  "date",
  "time",
  "datetime",
  "geopoint",
  "geotrace",
  "geoshape",
  "image",
  "audio",
  "video",
  "barcode",
  "acknowledge",
  "rank",
  "hidden",
] as const;

export type XlsFormType = (typeof XLSFORM_TYPES)[number];

/** Map XForm bind type + body tag + attributes → XLSForm type */
export function bindTypeToXlsType(
  bindType: string,
  hasCalculation: boolean,
  bodyTag: string,
  isReadonly: boolean,
  mediatype: string,
): XlsFormType | string {
  if (!bodyTag) {
    if (hasCalculation) return "calculate";
    return "hidden";
  }
  if (bodyTag === "trigger") return "acknowledge";
  if (bodyTag === "input" && isReadonly) return "note";
  if (bodyTag === "select1") return "select_one";
  if (bodyTag === "select") return "select_multiple";
  if (bodyTag === "upload") {
    if (mediatype.startsWith("audio")) return "audio";
    if (mediatype.startsWith("video")) return "video";
    return "image";
  }
  if (bodyTag === "rank" || bodyTag === "odk:rank") return "rank";

  const t = bindType.toLowerCase();
  const mapping: Record<string, XlsFormType> = {
    string: "text",
    int: "integer",
    integer: "integer",
    decimal: "decimal",
    date: "date",
    time: "time",
    datetime: "datetime",
    geopoint: "geopoint",
    geotrace: "geotrace",
    geoshape: "geoshape",
    barcode: "barcode",
  };
  return mapping[t] ?? (bindType || "text");
}

/** Map XLSForm type → XForm bind type */
export function xlsTypeToBindType(xlsType: string): string {
  const mapping: Record<string, string> = {
    text: "string",
    integer: "int",
    decimal: "decimal",
    note: "string",
    calculate: "string",
    select_one: "select1",
    select_multiple: "select",
    date: "date",
    time: "time",
    datetime: "dateTime",
    geopoint: "geopoint",
    geotrace: "geotrace",
    geoshape: "geoshape",
    image: "binary",
    audio: "binary",
    video: "binary",
    barcode: "barcode",
    acknowledge: "string",
    rank: "odk:rank",
    hidden: "string",
  };
  return mapping[xlsType] ?? xlsType;
}

/** Map XLSForm type → body element tag (empty string = no body element) */
export function xlsTypeToBodyTag(xlsType: string): string {
  const mapping: Record<string, string> = {
    text: "input",
    integer: "input",
    decimal: "input",
    note: "input",
    calculate: "",
    select_one: "select1",
    select_multiple: "select",
    date: "input",
    time: "input",
    datetime: "input",
    geopoint: "input",
    geotrace: "input",
    geoshape: "input",
    image: "upload",
    audio: "upload",
    video: "upload",
    barcode: "input",
    acknowledge: "trigger",
    rank: "odk:rank",
    hidden: "",
  };
  return mapping[xlsType] ?? "input";
}

/** Map XLSForm type → mediatype attribute for upload elements */
export function xlsTypeToMediatype(xlsType: string): string {
  const mapping: Record<string, string> = {
    image: "image/*",
    audio: "audio/*",
    video: "video/*",
  };
  return mapping[xlsType] ?? "";
}

/** Whether bind needs readonly="true()" for this XLSForm type */
export function xlsTypeNeedsReadonly(xlsType: string): boolean {
  return xlsType === "note";
}

export interface TypeChangeResult {
  readonly bindType: string;
  readonly bodyTag: string;
  readonly readonly: string;
  readonly mediatype: string;
}

export function xlsTypeToChangeResult(xlsType: string): TypeChangeResult {
  return {
    bindType: xlsTypeToBindType(xlsType),
    bodyTag: xlsTypeToBodyTag(xlsType),
    readonly: xlsTypeNeedsReadonly(xlsType) ? "true()" : "",
    mediatype: xlsTypeToMediatype(xlsType),
  };
}
