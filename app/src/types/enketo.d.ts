declare module "enketo-core" {
  interface ModelNode {
    getVal(): string;
    setVal(value: string, constraint?: null, type?: string): boolean;
  }
  export class Form {
    constructor(
      formEl: HTMLFormElement,
      options: {
        modelStr: string;
        instanceStr?: string;
        external?: Array<{ id: string; xml: XMLDocument } | null | undefined>;
      }
    );
    init(): string[];
    destroy(): void;
    getDataStr(): string;
    resetView(): void;
    model: {
      xml: Document;
      node(xpath: string, index?: number): ModelNode;
      events: {
        on(event: string, callback: () => void): void;
      };
    };
    view: {
      $: {
        trigger(event: string): void;
      };
    };
  }
}

declare module "enketo-transformer/web" {
  export function transform(options: {
    xform: string;
  }): Promise<{
    form: string;
    model: string;
    transformerVersion: string;
    languageMap: Record<string, string>;
  }>;
}
