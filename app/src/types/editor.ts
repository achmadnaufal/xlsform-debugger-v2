import type { LocalizedText } from "../utils/xformParser";

/** Per-language edits for localized fields */
export type LocalizedEdit = LocalizedText;

/** Per-field edits supporting both localized and plain string properties */
export interface FieldEdit {
  readonly type?: string;
  readonly bodyTag?: string;
  readonly readonly?: string;
  readonly mediatype?: string;
  readonly labels?: LocalizedEdit;
  readonly hints?: LocalizedEdit;
  readonly constraintMessages?: LocalizedEdit;
  readonly relevant?: string;
  readonly constraint?: string;
  readonly calculation?: string;
  readonly required?: string;
  readonly appearance?: string;
  readonly choiceFilter?: string;
  readonly defaultValue?: string;
  readonly repeatCount?: string;
  readonly parameters?: string;
}

/** Maps field names to their pending edits */
export type EditsMap = Map<string, FieldEdit>;

/** Payload for syncing Inspector edits back to XLSForm sheets */
export interface SheetsUpdatePayload {
  readonly fieldName: string;
  readonly edits: FieldEdit;
  readonly meta: {
    readonly bodyTag: string;
    readonly hasCalc: boolean;
    readonly isReadonly: boolean;
    readonly mediatype: string;
    readonly listName: string;
  };
}

/** Properties that can be edited on a field */
export type EditableProperty =
  | "type"
  | "labels"
  | "hints"
  | "constraintMessages"
  | "relevant"
  | "constraint"
  | "calculation"
  | "required"
  | "appearance"
  | "choiceFilter"
  | "defaultValue"
  | "repeatCount"
  | "parameters"
  | "readonly";
