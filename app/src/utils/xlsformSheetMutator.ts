/**
 * Patches XLSForm sheet data based on Inspector field edits.
 *
 * Maps FieldEdit properties to XLSForm column names and updates the
 * matching survey row immutably.
 */

import type { FieldEdit } from "../types/editor";
import type { XlsFormSheets } from "../types";
import { bindTypeToXlsType } from "./xlsformTypes";

export interface SheetEditMeta {
  readonly bodyTag: string;
  readonly hasCalc: boolean;
  readonly isReadonly: boolean;
  readonly mediatype: string;
  readonly listName: string;
}

/**
 * Apply Inspector edits to the xlsformSheets data, returning a new
 * XlsFormSheets object with the matching survey row patched.
 *
 * Only properties with defined values in `edits` are patched.
 * Returns the original sheets reference if nothing changed.
 */
export function applyEditsToSheets(
  sheets: XlsFormSheets,
  fieldName: string,
  edits: FieldEdit,
  meta: SheetEditMeta,
): XlsFormSheets {
  const surveyRows = sheets["survey"];
  if (!surveyRows || surveyRows.length === 0) return sheets;

  const rowIndex = surveyRows.findIndex(
    (row) => String(row["name"] ?? "") === fieldName,
  );
  if (rowIndex === -1) return sheets;

  const originalRow = surveyRows[rowIndex];
  const patches: Record<string, unknown> = {};

  // --- Type ---
  if (edits.type !== undefined || edits.bodyTag !== undefined || edits.readonly !== undefined || edits.mediatype !== undefined) {
    const bindType = edits.type ?? "";
    const bodyTag = edits.bodyTag ?? meta.bodyTag;
    const isReadonly = edits.readonly !== undefined
      ? edits.readonly === "true()"
      : meta.isReadonly;
    const mediatype = edits.mediatype ?? meta.mediatype;
    const hasCalc = meta.hasCalc;

    let xlsType = bindTypeToXlsType(bindType, hasCalc, bodyTag, isReadonly, mediatype);

    // Preserve list_name suffix for select types
    const listName = meta.listName;
    if (listName && (xlsType === "select_one" || xlsType === "select_multiple")) {
      xlsType = `${xlsType} ${listName}`;
    }

    patches["type"] = xlsType;
  }

  // --- Localized fields ---
  applyLocalizedPatches(patches, "label", edits.labels, originalRow);
  applyLocalizedPatches(patches, "hint", edits.hints, originalRow);
  applyLocalizedPatches(patches, "constraint_message", edits.constraintMessages, originalRow);

  // --- Simple string fields ---
  if (edits.relevant !== undefined) patches["relevant"] = edits.relevant;
  if (edits.constraint !== undefined) patches["constraint"] = edits.constraint;
  if (edits.calculation !== undefined) patches["calculation"] = edits.calculation;
  if (edits.appearance !== undefined) patches["appearance"] = edits.appearance;
  if (edits.choiceFilter !== undefined) patches["choice_filter"] = edits.choiceFilter;
  if (edits.defaultValue !== undefined) patches["default"] = edits.defaultValue;

  // --- Required: XForm "true()" → XLS "yes", empty → empty ---
  if (edits.required !== undefined) {
    patches["required"] = edits.required === "true()" ? "yes" : edits.required;
  }

  if (Object.keys(patches).length === 0) return sheets;

  const newRow: Record<string, unknown> = { ...originalRow, ...patches };
  const newSurvey = surveyRows.map((row, i) => (i === rowIndex ? newRow : row));

  return { ...sheets, survey: newSurvey };
}

/**
 * Maps localized edits to the correct XLS column names.
 *
 * If the sheet has columns like `label::English`, uses that pattern.
 * If only `label` column exists (single language), uses `label`.
 */
function applyLocalizedPatches(
  patches: Record<string, unknown>,
  baseCol: string,
  localizedEdits: Record<string, string> | undefined,
  row: Record<string, unknown>,
): void {
  if (!localizedEdits) return;

  const rowKeys = Object.keys(row);

  for (const [lang, value] of Object.entries(localizedEdits)) {
    // Try exact column match: `label::LangName`
    const langCol = `${baseCol}::${lang}`;
    if (rowKeys.includes(langCol)) {
      patches[langCol] = value;
      continue;
    }

    // If lang is "default" or only a bare column exists, use bare column
    if (lang === "default" || rowKeys.includes(baseCol)) {
      patches[baseCol] = value;
      continue;
    }

    // Column doesn't exist yet — create the lang-specific one
    patches[langCol] = value;
  }
}
