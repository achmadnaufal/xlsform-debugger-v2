import type { FieldEdit, LocalizedEdit } from "../types/editor";
import { getDefaultText } from "./xformParser";

const JR_NS = "http://openrosa.org/javarosa";
const XFORMS_NS = "http://www.w3.org/2002/xforms";
const ODK_NS = "http://www.opendatakit.org/xforms";

/** Get the correct namespace for a body element tag */
function getBodyElementNS(tag: string): string {
  if (tag === "odk:rank" || tag === "rank") return ODK_NS;
  return XFORMS_NS;
}

function findBindByName(doc: Document, fieldName: string): Element | null {
  const binds = doc.querySelectorAll("bind");
  for (const bind of Array.from(binds)) {
    const nodeset = bind.getAttribute("nodeset") ?? "";
    if (nodeset.endsWith(`/${fieldName}`)) return bind;
  }
  return null;
}

function findBodyElementByName(doc: Document, fieldName: string): Element | null {
  const selectors = ["input", "select", "select1", "trigger", "range", "upload", "group", "rank"];
  for (const tag of selectors) {
    const elements = doc.querySelectorAll(tag);
    for (const el of Array.from(elements)) {
      const ref = el.getAttribute("ref") ?? "";
      if (ref.endsWith(`/${fieldName}`)) return el;
    }
  }
  return null;
}

function findInstanceNodeByName(doc: Document, fieldName: string): Element | null {
  const instances = doc.querySelectorAll("instance");
  for (const inst of Array.from(instances)) {
    if (inst.getAttribute("id")) continue;
    const node = inst.querySelector(fieldName);
    if (node) return node;
  }
  return null;
}

function setOrRemoveAttr(el: Element, attr: string, value: string | undefined): void {
  if (value === undefined) return;
  if (value === "") {
    el.removeAttribute(attr);
  } else {
    el.setAttribute(attr, value);
  }
}

function setOrRemoveAttrNS(el: Element, ns: string, attr: string, value: string | undefined): void {
  if (value === undefined) return;
  if (value === "") {
    el.removeAttributeNS(ns, attr.split(":").pop() ?? attr);
  } else {
    el.setAttributeNS(ns, attr, value);
  }
}

// --- itext mutation ---

function setItextValue(doc: Document, itextId: string, lang: string, value: string): void {
  const translations = doc.querySelectorAll("itext translation");
  for (const translation of Array.from(translations)) {
    const translationLang = translation.getAttribute("lang") ?? "default";
    if (translationLang !== lang) continue;
    const texts = translation.querySelectorAll("text");
    for (const text of Array.from(texts)) {
      if (text.getAttribute("id") === itextId) {
        const valueEl = text.querySelector("value");
        if (valueEl) {
          valueEl.textContent = value;
        }
        return;
      }
    }
    // Text entry doesn't exist yet — create it
    const textEl = doc.createElement("text");
    textEl.setAttribute("id", itextId);
    const valueEl = doc.createElement("value");
    valueEl.textContent = value;
    textEl.appendChild(valueEl);
    translation.appendChild(textEl);
    return;
  }
}

function getItextRef(el: Element, childTag: string): string | null {
  const child = el.querySelector(childTag);
  if (!child) return null;
  const ref = child.getAttribute("ref");
  if (!ref) return null;
  const match = ref.match(/jr:itext\('([^']+)'\)/);
  return match ? match[1] : null;
}

function hasItext(doc: Document): boolean {
  return doc.querySelectorAll("itext translation").length > 0;
}

function setLocalizedText(
  doc: Document,
  bodyEl: Element,
  childTag: string,
  edits: LocalizedEdit,
): void {
  const itextId = getItextRef(bodyEl, childTag);

  if (itextId && hasItext(doc)) {
    // Update itext entries per language
    for (const [lang, value] of Object.entries(edits)) {
      setItextValue(doc, itextId, lang, value);
    }
  } else {
    // Inline text — use the default/first language value
    const text = getDefaultText(edits);
    let child = bodyEl.querySelector(childTag);
    if (text === "") {
      if (child) bodyEl.removeChild(child);
      return;
    }
    if (!child) {
      child = doc.createElement(childTag);
      bodyEl.insertBefore(child, bodyEl.firstChild);
    }
    child.textContent = text;
  }
}

function setLocalizedConstraintMsg(
  doc: Document,
  bind: Element,
  edits: LocalizedEdit,
): void {
  const nodeset = bind.getAttribute("nodeset") ?? "";
  const currentAttr = bind.getAttributeNS(JR_NS, "constraintMsg")
    ?? bind.getAttribute("jr:constraintMsg") ?? "";

  // Check if current value is an itext reference
  const itextMatch = currentAttr.match(/jr:itext\('([^']+)'\)/);
  if (itextMatch && hasItext(doc)) {
    const itextId = itextMatch[1];
    for (const [lang, value] of Object.entries(edits)) {
      setItextValue(doc, itextId, lang, value);
    }
  } else if (hasItext(doc) && Object.keys(edits).length > 1) {
    // Multiple languages but no existing itext ref — create itext entries
    const itextId = `${nodeset}:constraintMsg`;
    for (const [lang, value] of Object.entries(edits)) {
      setItextValue(doc, itextId, lang, value);
    }
    // Point bind attribute to itext
    bind.setAttributeNS(JR_NS, "jr:constraintMsg", `jr:itext('${itextId}')`);
  } else {
    // Single language — set directly on bind attribute
    const text = getDefaultText(edits);
    setOrRemoveAttrNS(bind, JR_NS, "jr:constraintMsg", text);
  }
}

// --- Insertion order helper ---

/**
 * Find the parent container and insertion point for a new body element,
 * based on bind nodeset path and bind order.
 */
function findParentContainer(doc: Document, body: Element, nodeset: string): Element {
  // nodeset e.g. "/data/grp1/fieldname" → parent path is "/data/grp1"
  const parts = nodeset.split("/");
  parts.pop(); // remove field name
  const parentPath = parts.join("/");

  // If parent is the instance root (e.g. "/data"), insert into body
  if (parts.length <= 2) return body;

  // Look for a group/repeat whose ref matches the parent path
  const bodyTags = ["group", "repeat"];
  for (const tag of bodyTags) {
    for (const el of Array.from(body.querySelectorAll(tag))) {
      const ref = el.getAttribute("ref") ?? "";
      if (ref === parentPath) return el;
    }
  }

  return body;
}

function findInsertionRef(doc: Document, container: Element, fieldName: string): Element | null {
  // Get bind order
  const bindNames: string[] = [];
  doc.querySelectorAll("bind").forEach((bind) => {
    const ns = bind.getAttribute("nodeset") ?? "";
    const name = ns.split("/").pop() ?? "";
    if (name) bindNames.push(name);
  });

  const fieldIndex = bindNames.indexOf(fieldName);
  if (fieldIndex < 0) return null;

  // Collect direct children of the container that are body elements
  const bodyTags = new Set(["input", "select", "select1", "trigger", "range", "upload", "group", "rank"]);
  const childMap = new Map<string, Element>();
  for (const el of Array.from(container.children)) {
    if (!bodyTags.has(el.tagName.toLowerCase())) continue;
    const ref = el.getAttribute("ref") ?? "";
    const name = ref.split("/").pop() ?? "";
    if (name) childMap.set(name, el);
  }

  // Find the first sibling whose bind index comes after fieldName
  for (let i = fieldIndex + 1; i < bindNames.length; i++) {
    const el = childMap.get(bindNames[i]);
    if (el) return el;
  }

  return null;
}

/**
 * Add itext label/hint references to a newly created body element
 * if the form uses itext and entries exist for this field.
 */
function addItextRefs(doc: Document, bodyEl: Element, nodeset: string): void {
  if (!hasItext(doc)) return;

  const translations = doc.querySelectorAll("itext translation");
  // Check if label itext exists for this field
  const labelId = `${nodeset}:label`;
  const hintId = `${nodeset}:hint`;

  let hasLabel = false;
  let hasHint = false;
  for (const translation of Array.from(translations)) {
    for (const text of Array.from(translation.querySelectorAll("text"))) {
      const id = text.getAttribute("id") ?? "";
      if (id === labelId) hasLabel = true;
      if (id === hintId) hasHint = true;
    }
    break; // only need to check first translation
  }

  if (hasLabel) {
    const label = doc.createElement("label");
    label.setAttribute("ref", `jr:itext('${labelId}')`);
    bodyEl.insertBefore(label, bodyEl.firstChild);
  }

  if (hasHint) {
    const hint = doc.createElement("hint");
    hint.setAttribute("ref", `jr:itext('${hintId}')`);
    bodyEl.appendChild(hint);
  }
}

// --- Apply edits ---

function applyFieldEdits(doc: Document, fieldName: string, edits: FieldEdit): void {
  const bind = findBindByName(doc, fieldName);

  if (bind) {
    setOrRemoveAttr(bind, "type", edits.type);
    setOrRemoveAttr(bind, "readonly", edits.readonly);
    setOrRemoveAttr(bind, "relevant", edits.relevant);
    setOrRemoveAttr(bind, "constraint", edits.constraint);
    setOrRemoveAttr(bind, "calculate", edits.calculation);
    setOrRemoveAttr(bind, "required", edits.required);

    if (edits.constraintMessages) {
      setLocalizedConstraintMsg(doc, bind, edits.constraintMessages);
    }
  }

  let bodyEl = findBodyElementByName(doc, fieldName);

  if (edits.bodyTag !== undefined) {
    if (bodyEl) {
      const currentTag = bodyEl.tagName.toLowerCase();
      if (edits.bodyTag && edits.bodyTag !== currentTag) {
        // Case 1: Rename existing body element
        const newEl = doc.createElementNS(bodyEl.namespaceURI, edits.bodyTag);
        for (const attr of Array.from(bodyEl.attributes)) {
          newEl.setAttribute(attr.name, attr.value);
        }
        while (bodyEl.firstChild) {
          newEl.appendChild(bodyEl.firstChild);
        }
        bodyEl.parentNode?.replaceChild(newEl, bodyEl);
        bodyEl = newEl;
      } else if (!edits.bodyTag) {
        // Case 2: Remove body element (→ hidden/calculate)
        bodyEl.parentNode?.removeChild(bodyEl);
        bodyEl = null;
      }
    } else if (edits.bodyTag) {
      // Case 3: Create body element (hidden/calculate → visible type)
      const xpath = bind?.getAttribute("nodeset") ?? "";
      if (xpath) {
        const body = doc.querySelector("h\\:body, body");
        if (body) {
          const newEl = doc.createElementNS(getBodyElementNS(edits.bodyTag), edits.bodyTag);
          newEl.setAttribute("ref", xpath);
          // Add itext label/hint refs if they exist
          addItextRefs(doc, newEl, xpath);
          // Insert at correct position based on bind order
          const container = findParentContainer(doc, body, xpath);
          const insertRef = findInsertionRef(doc, container, fieldName);
          if (insertRef) {
            container.insertBefore(newEl, insertRef);
          } else {
            container.appendChild(newEl);
          }
          bodyEl = newEl;
        }
      }
    }
  }

  if (bodyEl) {
    setOrRemoveAttr(bodyEl, "appearance", edits.appearance);
    setOrRemoveAttr(bodyEl, "mediatype", edits.mediatype);

    if (edits.labels) {
      setLocalizedText(doc, bodyEl, "label", edits.labels);
    }
    if (edits.hints) {
      setLocalizedText(doc, bodyEl, "hint", edits.hints);
    }

    if (edits.choiceFilter !== undefined) {
      const itemset = bodyEl.querySelector("itemset");
      if (itemset) {
        const currentNodeset = itemset.getAttribute("nodeset") ?? "";
        const baseNodeset = currentNodeset.replace(/\[.+\]/, "");
        const newNodeset = edits.choiceFilter
          ? `${baseNodeset}[${edits.choiceFilter}]`
          : baseNodeset;
        itemset.setAttribute("nodeset", newNodeset);
      }
    }
  }

  if (edits.defaultValue !== undefined) {
    const instanceNode = findInstanceNodeByName(doc, fieldName);
    if (instanceNode) {
      instanceNode.textContent = edits.defaultValue;
    }
  }
}

/**
 * Apply a batch of edits to XForm XML and return the new XML string.
 * Pure function — does not mutate the input string.
 */
export function applyEditsToXform(
  xmlString: string,
  edits: Map<string, FieldEdit>
): string {
  const doc = new DOMParser().parseFromString(xmlString, "application/xml");

  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error("Invalid XML: " + (parseError.textContent ?? "parse error"));
  }

  edits.forEach((fieldEdits, fieldName) => {
    applyFieldEdits(doc, fieldName, fieldEdits);
  });

  return new XMLSerializer().serializeToString(doc);
}
