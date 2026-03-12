export interface LocalizedText {
  readonly [lang: string]: string;
}

export interface FieldMeta {
  readonly name: string;
  readonly xpath: string;
  readonly type: string;
  readonly bodyTag: string;
  readonly readonly: string;
  readonly mediatype: string;
  readonly labels: LocalizedText;
  readonly hints: LocalizedText;
  readonly constraintMessages: LocalizedText;
  readonly relevant: string;
  readonly constraint: string;
  readonly calculation: string;
  readonly required: string;
  readonly appearance: string;
  readonly choiceFilter: string;
  readonly listName: string;
  readonly defaultValue: string;
  readonly repeatCount: string;
  readonly parameters: string;
  readonly trigger: string;
  readonly mediaImages: LocalizedText;
}

/** Get first language value from LocalizedText, or empty string. */
export function getDefaultText(localized: LocalizedText): string {
  const keys = Object.keys(localized);
  return keys.length > 0 ? localized[keys[0]] : '';
}

// --- itext parsing ---

type ItextMap = Map<string, LocalizedText>;
type ItextMediaMap = Map<string, LocalizedText>;

function parseItextMap(doc: Document): ItextMap {
  const map: ItextMap = new Map();
  const translations = doc.querySelectorAll('itext translation');
  for (const translation of Array.from(translations)) {
    const lang = translation.getAttribute('lang') ?? 'default';
    const texts = translation.querySelectorAll('text');
    for (const text of Array.from(texts)) {
      const id = text.getAttribute('id') ?? '';
      if (!id) continue;
      // Only pick up the default (no form attr) or form="long" value element
      const valueEl = text.querySelector('value:not([form])') ?? text.querySelector('value[form="long"]');
      const value = valueEl?.textContent?.trim() ?? '';
      const existing = map.get(id) ?? {};
      map.set(id, { ...existing, [lang]: value });
    }
  }
  return map;
}

/** Parse itext media images: <value form="image">jr://images/file.png</value> */
function parseItextMediaImages(doc: Document): ItextMediaMap {
  const map: ItextMediaMap = new Map();
  const translations = doc.querySelectorAll('itext translation');
  for (const translation of Array.from(translations)) {
    const lang = translation.getAttribute('lang') ?? 'default';
    const texts = translation.querySelectorAll('text');
    for (const text of Array.from(texts)) {
      const id = text.getAttribute('id') ?? '';
      if (!id) continue;
      const imageEl = text.querySelector('value[form="image"]');
      if (!imageEl) continue;
      const value = imageEl.textContent?.trim() ?? '';
      if (!value) continue;
      const existing = map.get(id) ?? {};
      map.set(id, { ...existing, [lang]: value });
    }
  }
  return map;
}

/** Parse <setvalue> elements from the model, indexed by target ref. */
function parseSetValues(doc: Document): Map<string, string> {
  const map = new Map<string, string>();
  const setvalues = doc.querySelectorAll('setvalue');
  for (const sv of Array.from(setvalues)) {
    const ref = sv.getAttribute('ref') ?? sv.getAttribute('event') ?? '';
    const event = sv.getAttribute('event') ?? '';
    const value = sv.getAttribute('value') ?? sv.textContent?.trim() ?? '';
    if (!ref) continue;
    const name = ref.split('/').pop() ?? '';
    if (!name) continue;
    const display = event ? `${event}: ${value}` : value;
    map.set(name, display);
  }
  return map;
}

/** Parse repeat jr:count attributes from body <repeat> elements. */
function parseRepeatCounts(doc: Document): Map<string, string> {
  const map = new Map<string, string>();
  const repeats = doc.querySelectorAll('repeat');
  for (const repeat of Array.from(repeats)) {
    const ref = repeat.getAttribute('nodeset') ?? repeat.getAttribute('ref') ?? '';
    const name = ref.split('/').pop() ?? '';
    const jrCount = repeat.getAttributeNS('http://openrosa.org/javarosa', 'count')
      ?? repeat.getAttribute('jr:count') ?? '';
    if (name && jrCount) {
      map.set(name, jrCount);
    }
  }
  return map;
}

/** Extract non-standard body element attributes as a parameters string. */
function getParameters(el: Element): string {
  const skipAttrs = new Set(['ref', 'nodeset', 'appearance', 'mediatype', 'class', 'intent']);
  const params: string[] = [];
  for (const attr of Array.from(el.attributes)) {
    // Skip standard attributes and namespace declarations
    if (skipAttrs.has(attr.name) || attr.name.startsWith('xmlns')) continue;
    // Include things like max-pixels, accuracy, etc.
    if (attr.name.includes(':') && !attr.name.startsWith('odk:')) continue;
    if (attr.name === 'max-pixels' || attr.name === 'orx:max-pixels'
      || attr.name.startsWith('odk:') || attr.name === 'rows'
      || attr.name === 'accuracy' || attr.name === 'unacceptedAccuracy') {
      params.push(`${attr.name}=${attr.value}`);
    }
  }
  return params.join(' ');
}

/** Extract available form languages from XForm XML. */
export function parseFormLanguages(xmlString: string): string[] {
  const doc = new DOMParser().parseFromString(xmlString, 'application/xml');
  const translations = doc.querySelectorAll('itext translation');
  return Array.from(translations).map(t => t.getAttribute('lang') ?? 'default');
}

// --- Localized text extraction ---

function getItextRef(el: Element, childTag: string): string | null {
  const child = el.querySelector(childTag);
  if (!child) return null;
  const ref = child.getAttribute('ref');
  if (!ref) return null;
  const match = ref.match(/jr:itext\('([^']+)'\)/);
  return match ? match[1] : null;
}

function getLocalizedLabels(el: Element, itextMap: ItextMap): LocalizedText {
  const itextId = getItextRef(el, 'label');
  if (itextId) {
    const localized = itextMap.get(itextId);
    if (localized && Object.keys(localized).length > 0) return localized;
  }
  // Inline text fallback
  const label = el.querySelector('label value, label');
  const text = label?.textContent?.trim() ?? '';
  return text ? { default: text } : {};
}

function getLocalizedHints(el: Element, itextMap: ItextMap): LocalizedText {
  const itextId = getItextRef(el, 'hint');
  if (itextId) {
    const localized = itextMap.get(itextId);
    if (localized && Object.keys(localized).length > 0) return localized;
  }
  const hint = el.querySelector('hint value, hint');
  const text = hint?.textContent?.trim() ?? '';
  return text ? { default: text } : {};
}

function getLocalizedConstraintMessages(
  bindNodeset: string,
  itextMap: ItextMap,
  bindConstraintMsg: string,
): LocalizedText {
  // Check itext for constraint message (id pattern: /data/field:constraintMsg)
  const fieldPath = bindNodeset;
  const itextId = `${fieldPath}:constraintMsg`;
  const localized = itextMap.get(itextId);
  if (localized && Object.keys(localized).length > 0) return localized;
  // Fallback: check if the bind attribute itself is an itext ref
  if (bindConstraintMsg) {
    const match = bindConstraintMsg.match(/jr:itext\('([^']+)'\)/);
    if (match) {
      const refLocalized = itextMap.get(match[1]);
      if (refLocalized && Object.keys(refLocalized).length > 0) return refLocalized;
    }
    return { default: bindConstraintMsg };
  }
  return {};
}

// --- Other helpers ---

function getChoiceFilter(el: Element): string {
  const itemset = el.querySelector('itemset');
  if (itemset) {
    const nodeset = itemset.getAttribute('nodeset') ?? '';
    const match = nodeset.match(/\[(.+)\]/);
    return match ? match[1] : '';
  }
  return '';
}

function getListName(el: Element): string {
  const itemset = el.querySelector('itemset');
  if (itemset) {
    const nodeset = itemset.getAttribute('nodeset') ?? '';
    const match = nodeset.match(/instance\('([^']+)'\)/);
    return match ? match[1] : '';
  }
  return '';
}

function getDefaultValue(doc: Document, fieldName: string): string {
  const instances = doc.querySelectorAll('instance');
  for (const inst of Array.from(instances)) {
    if (inst.getAttribute('id')) continue;
    const node = inst.querySelector(fieldName);
    if (node) return node.textContent?.trim() ?? '';
  }
  return '';
}

// --- Main parser ---

export function parseXFormFields(xmlString: string): Map<string, FieldMeta> {
  const doc = new DOMParser().parseFromString(xmlString, 'application/xml');
  const fields = new Map<string, FieldMeta>();
  const itextMap = parseItextMap(doc);
  const mediaImageMap = parseItextMediaImages(doc);
  const setValueMap = parseSetValues(doc);
  const repeatCountMap = parseRepeatCounts(doc);

  const bindMap = new Map<string, Partial<FieldMeta> & { constraintMsg?: string; nodeset?: string }>();
  doc.querySelectorAll('bind').forEach((bind) => {
    const nodeset = bind.getAttribute('nodeset') ?? '';
    const name = nodeset.split('/').pop() ?? '';
    if (!name) return;
    const constraintMsg = bind.getAttributeNS('http://openrosa.org/javarosa', 'constraintMsg')
      ?? bind.getAttribute('jr:constraintMsg') ?? '';
    // Check both standard calculate and odk:calculate namespace variant
    const calculation = bind.getAttribute('calculate')
      ?? bind.getAttributeNS('http://www.opendatakit.org/xforms', 'calculate')
      ?? bind.getAttribute('odk:calculate')
      ?? '';
    bindMap.set(name, {
      name,
      xpath: nodeset,
      type: bind.getAttribute('type') ?? '',
      readonly: bind.getAttribute('readonly') ?? '',
      relevant: bind.getAttribute('relevant') ?? '',
      constraint: bind.getAttribute('constraint') ?? '',
      calculation,
      required: bind.getAttribute('required') ?? '',
      constraintMsg,
      nodeset,
    });
  });

  /** Get media images for a field from itext. */
  function getMediaImages(nodeset: string): LocalizedText {
    const labelId = `${nodeset}:label`;
    return mediaImageMap.get(labelId) ?? {};
  }

  const bodyElements = doc.querySelectorAll('group, repeat, input, select, select1, trigger, range, upload, rank');
  bodyElements.forEach((el) => {
    const ref = el.getAttribute('ref') ?? el.getAttribute('nodeset') ?? '';
    const name = ref.split('/').pop() ?? '';
    if (!name) return;

    const bind = bindMap.get(name) ?? { name, xpath: ref };
    const nodeset = bind.nodeset ?? bind.xpath ?? ref;
    fields.set(name, {
      name,
      xpath: bind.xpath ?? ref,
      type: bind.type ?? el.tagName,
      bodyTag: el.tagName.toLowerCase(),
      readonly: bind.readonly ?? '',
      mediatype: el.getAttribute('mediatype') ?? '',
      labels: getLocalizedLabels(el, itextMap),
      hints: getLocalizedHints(el, itextMap),
      constraintMessages: getLocalizedConstraintMessages(
        nodeset,
        itextMap,
        (bind as { constraintMsg?: string }).constraintMsg ?? '',
      ),
      relevant: bind.relevant ?? '',
      constraint: bind.constraint ?? '',
      calculation: bind.calculation ?? '',
      required: bind.required ?? '',
      appearance: el.getAttribute('appearance') ?? '',
      choiceFilter: getChoiceFilter(el),
      listName: getListName(el),
      defaultValue: getDefaultValue(doc, name),
      repeatCount: repeatCountMap.get(name) ?? '',
      parameters: getParameters(el),
      trigger: setValueMap.get(name) ?? '',
      mediaImages: getMediaImages(nodeset),
    });
  });

  // Add bind-only fields not in body (calculate, meta, hidden, etc.)
  bindMap.forEach((bind, name) => {
    if (!fields.has(name)) {
      const nodeset = bind.nodeset ?? bind.xpath ?? '';
      const itextLabels = itextMap.get(`${nodeset}:label`) ?? {};
      const itextHints = itextMap.get(`${nodeset}:hint`) ?? {};
      fields.set(name, {
        name,
        xpath: bind.xpath ?? '',
        type: bind.type ?? '',
        bodyTag: '',
        readonly: bind.readonly ?? '',
        mediatype: '',
        labels: itextLabels,
        hints: itextHints,
        constraintMessages: getLocalizedConstraintMessages(
          nodeset,
          itextMap,
          (bind as { constraintMsg?: string }).constraintMsg ?? '',
        ),
        relevant: bind.relevant ?? '',
        constraint: bind.constraint ?? '',
        calculation: bind.calculation ?? '',
        required: bind.required ?? '',
        appearance: '',
        choiceFilter: '',
        listName: '',
        defaultValue: getDefaultValue(doc, name),
        repeatCount: '',
        parameters: '',
        trigger: setValueMap.get(name) ?? '',
        mediaImages: getMediaImages(nodeset),
      });
    }
  });

  return fields;
}

export function extractVarRefs(expression: string): string[] {
  const refs: string[] = [];
  const regex = /\$\{([^}]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(expression)) !== null) {
    refs.push(match[1]);
  }
  return refs;
}

export function extractPulldataFiles(xmlString: string): string[] {
  const files = new Set<string>();
  const regex = /pulldata\s*\(\s*'([^']+)'/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xmlString)) !== null) {
    files.add(match[1]);
  }
  return [...files];
}
