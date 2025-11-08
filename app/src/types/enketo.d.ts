declare module "enketo-core" {
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
      events: {
        on(event: string, callback: () => void): void;
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
