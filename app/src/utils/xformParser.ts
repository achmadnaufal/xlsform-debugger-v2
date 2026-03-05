export interface FieldMeta {
  readonly name: string;
  readonly xpath: string;
  readonly type: string;
  readonly label: string;
  readonly hint: string;
  readonly relevant: string;
  readonly constraint: string;
  readonly calculation: string;
  readonly required: string;
  readonly choiceFilter: string;
  readonly listName: string;
}

function getLabelText(el: Element): string {
  const label = el.querySelector('label value, label');
  return label?.textContent?.trim() ?? '';
}

function getHintText(el: Element): string {
  const hint = el.querySelector('hint value, hint');
  return hint?.textContent?.trim() ?? '';
}

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

export function parseXFormFields(xmlString: string): Map<string, FieldMeta> {
  const doc = new DOMParser().parseFromString(xmlString, 'application/xml');
  const fields = new Map<string, FieldMeta>();

  const bindMap = new Map<string, Partial<FieldMeta>>();
  doc.querySelectorAll('bind').forEach((bind) => {
    const nodeset = bind.getAttribute('nodeset') ?? '';
    const name = nodeset.split('/').pop() ?? '';
    if (!name) return;
    bindMap.set(name, {
      name,
      xpath: nodeset,
      type: bind.getAttribute('type') ?? '',
      relevant: bind.getAttribute('relevant') ?? '',
      constraint: bind.getAttribute('constraint') ?? '',
      calculation: bind.getAttribute('calculate') ?? '',
      required: bind.getAttribute('required') ?? '',
    });
  });

  const bodyElements = doc.querySelectorAll('group, input, select, select1, trigger, range, upload');
  bodyElements.forEach((el) => {
    const ref = el.getAttribute('ref') ?? '';
    const name = ref.split('/').pop() ?? '';
    if (!name) return;

    const bind = bindMap.get(name) ?? { name, xpath: ref };
    fields.set(name, {
      name,
      xpath: bind.xpath ?? ref,
      type: bind.type ?? el.tagName,
      label: getLabelText(el),
      hint: getHintText(el),
      relevant: bind.relevant ?? '',
      constraint: bind.constraint ?? '',
      calculation: bind.calculation ?? '',
      required: bind.required ?? '',
      choiceFilter: getChoiceFilter(el),
      listName: getListName(el),
    });
  });

  bindMap.forEach((bind, name) => {
    if (!fields.has(name) && bind.calculation) {
      fields.set(name, {
        name,
        xpath: bind.xpath ?? '',
        type: bind.type ?? '',
        label: '',
        hint: '',
        relevant: bind.relevant ?? '',
        constraint: bind.constraint ?? '',
        calculation: bind.calculation ?? '',
        required: bind.required ?? '',
        choiceFilter: '',
        listName: '',
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
