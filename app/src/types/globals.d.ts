import type { ExternalDataEntry } from './index';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __enketoForm: any;
    __xformXml: string | null;
    __externalData: readonly ExternalDataEntry[];
    __loadForm?: (x: string, e: ExternalDataEntry[]) => void;
  }
}

export {};
