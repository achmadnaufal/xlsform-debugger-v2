/**
 * Convert CSV text to enketo external-data XML string.
 * Mirrors the server-side _csv_to_xml logic so CSV-only uploads
 * can be handled client-side without an API round-trip.
 */
import type { ExternalDataEntry } from "../types";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sanitizeTag(raw: string): string {
  let safe = raw.trim().replace(/^\ufeff/, "").replace(/[^a-zA-Z0-9_]/g, "_");
  if (!safe || /^\d/.test(safe)) safe = "col_" + safe;
  return safe;
}

export function csvTextToXml(csvText: string, filename: string): ExternalDataEntry {
  const stripped = csvText.replace(/^\ufeff/, "").replace(/^\ufffe/, "");
  const lines = stripped.split(/\r?\n/);
  if (lines.length === 0) return { id: filename.replace(/\.\w+$/, ""), xml: "<root/>" };

  const headers = lines[0].split(",").map((h) => h.trim());
  const safeHeaders = headers.map(sanitizeTag);

  // Find a label source column
  let labelIdx = -1;
  const lowerHeaders = headers.map((h) => h.toLowerCase());
  labelIdx = lowerHeaders.indexOf("label");
  if (labelIdx < 0) {
    labelIdx = lowerHeaders.findIndex((h) => h.startsWith("label::english"));
  }
  if (labelIdx < 0) {
    labelIdx = lowerHeaders.findIndex((h) => h.includes("label"));
  }

  const items: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCsvLine(line);
    const parts: string[] = [];
    let hasLabel = false;
    for (let j = 0; j < safeHeaders.length; j++) {
      const tag = safeHeaders[j];
      const val = j < values.length ? values[j] : "";
      parts.push(`<${tag}>${escapeXml(val)}</${tag}>`);
      if (tag === "label") hasLabel = true;
    }
    if (!hasLabel && labelIdx >= 0 && labelIdx < values.length) {
      parts.push(`<label>${escapeXml(values[labelIdx])}</label>`);
    }
    items.push(`<item>${parts.join("")}</item>`);
  }

  const id = filename.replace(/\.\w+$/, "");
  return { id, xml: `<root>${items.join("")}</root>` };
}

/** Simple CSV line parser that handles quoted fields. */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/** Read a File as text and convert to ExternalDataEntry. */
export async function csvFileToXml(file: File): Promise<ExternalDataEntry> {
  const text = await file.text();
  return csvTextToXml(text, file.name);
}
