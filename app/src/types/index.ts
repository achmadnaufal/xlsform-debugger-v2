export interface ExternalDataEntry {
  readonly id: string;
  readonly xml: string;
}

export type XlsFormSheets = Record<string, readonly Record<string, unknown>[]>;

export interface ConvertResponse {
  readonly xform_xml: string;
  readonly warnings: readonly string[];
  readonly external_data?: readonly ExternalDataEntry[];
  readonly xlsform_sheets?: XlsFormSheets;
}

export interface TransformResult {
  readonly form: string;
  readonly model: string;
  readonly languageMap: Record<string, string>;
}

export interface FormVariable {
  readonly name: string;
  readonly xpath: string;
  readonly value: string;
}

export interface ExpressionEntry {
  readonly name: string;
  readonly type: "calculate" | "constraint" | "relevant" | "required";
  readonly expression: string;
  readonly result: string;
}

export interface FormState {
  readonly variables: readonly FormVariable[];
  readonly expressions: readonly ExpressionEntry[];
  readonly dataXml: string;
}

export interface UploadedFiles {
  readonly xlsxFile: File | null;
  readonly csvFiles: readonly File[];
}

export type DebugTab = "variables" | "question" | "warnings" | "external" | "source";

