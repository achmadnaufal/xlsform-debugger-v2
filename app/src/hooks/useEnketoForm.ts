import { useEffect, useRef, useState, useCallback } from "react";
import type { ExternalDataEntry, FormState, FormVariable, ExpressionEntry } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EnketoForm = any;

interface UseEnketoFormOptions {
  readonly formHtml: string;
  readonly modelXml: string;
  readonly externalData: readonly ExternalDataEntry[];
  readonly containerRef: React.RefObject<HTMLDivElement | null>;
}

interface UseEnketoFormReturn {
  readonly formReady: boolean;
  readonly formState: FormState;
  readonly errors: readonly string[];
  readonly resetForm: () => void;
}

const EMPTY_STATE: FormState = {
  variables: [],
  expressions: [],
  dataXml: "",
};

function parseVariablesFromModel(form: EnketoForm): readonly FormVariable[] {
  try {
    const dataStr: string = form.getDataStr();
    const parser = new DOMParser();
    const doc = parser.parseFromString(dataStr, "text/xml");
    const variables: FormVariable[] = [];

    function walk(node: Element, path: string) {
      const currentPath = `${path}/${node.localName}`;
      if (node.children.length === 0) {
        variables.push({
          name: node.localName,
          xpath: currentPath,
          value: node.textContent ?? "",
        });
      } else {
        Array.from(node.children).forEach((child) =>
          walk(child, currentPath)
        );
      }
    }

    const root = doc.documentElement;
    if (root) {
      Array.from(root.children).forEach((child) => walk(child, ""));
    }

    return variables;
  } catch {
    return [];
  }
}

function parseExpressionsFromHtml(
  container: HTMLElement
): readonly ExpressionEntry[] {
  const entries: ExpressionEntry[] = [];

  const fields = container.querySelectorAll("[data-calculate], [data-relevant], [data-constraint], [data-required]");
  fields.forEach((field) => {
    const name =
      field.getAttribute("name") ??
      field.getAttribute("data-name") ??
      "unknown";

    const types: Array<ExpressionEntry["type"]> = [
      "calculate",
      "relevant",
      "constraint",
      "required",
    ];

    types.forEach((type) => {
      const expr = field.getAttribute(`data-${type}`);
      if (expr) {
        entries.push({ name, type, expression: expr, result: "" });
      }
    });
  });

  return entries;
}

export function useEnketoForm({
  formHtml,
  modelXml,
  externalData,
  containerRef,
}: UseEnketoFormOptions): UseEnketoFormReturn {
  const formInstanceRef = useRef<EnketoForm | null>(null);
  const [formReady, setFormReady] = useState(false);
  const [formState, setFormState] = useState<FormState>(EMPTY_STATE);
  const [errors, setErrors] = useState<readonly string[]>([]);

  const updateFormState = useCallback(() => {
    const form = formInstanceRef.current;
    if (!form) return;

    const variables = parseVariablesFromModel(form);
    const dataXml: string = form.getDataStr();
    const container = containerRef.current;
    const expressions = container ? parseExpressionsFromHtml(container) : [];

    setFormState({ variables, expressions, dataXml });
  }, [containerRef]);

  const resetForm = useCallback(() => {
    if (formInstanceRef.current) {
      try {
        formInstanceRef.current.resetView();
        updateFormState();
      } catch {
        // form may already be destroyed
      }
    }
  }, [updateFormState]);

  useEffect(() => {
    if (!formHtml || !modelXml || !containerRef.current) {
      // Inputs cleared — destroy any existing form and reset state
      if (formInstanceRef.current) {
        try { formInstanceRef.current.destroy(); } catch { /* ignore */ }
        formInstanceRef.current = null;
      }
      setFormReady(false);
      setFormState(EMPTY_STATE);
      setErrors([]);
      return;
    }

    let destroyed = false;

    async function initForm() {
      // Dynamic import to avoid SSR issues
      const { Form } = await import("enketo-core");

      // Destroy previous instance
      if (formInstanceRef.current) {
        try {
          formInstanceRef.current.destroy();
        } catch {
          // ignore cleanup errors
        }
        formInstanceRef.current = null;
      }

      const container = containerRef.current;
      if (!container || destroyed) return;

      // Insert form HTML into container
      container.innerHTML = formHtml;
      const formEl = container.querySelector("form");
      if (!formEl) {
        setErrors(["No <form> element found in transformed HTML"]);
        return;
      }

      try {
        if (import.meta.env.DEV) console.log("[useEnketoForm] Creating Form instance...");
        if (import.meta.env.DEV) console.log("[useEnketoForm] modelXml length:", modelXml.length);

        const external = externalData.map(({ id, xml }) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(xml, "text/xml");
          const rootEl = doc.documentElement;
          const parseErr = rootEl?.querySelector?.("parsererror");
          if (parseErr && import.meta.env.DEV) console.error("[useEnketoForm] XML parse error for", id, parseErr.textContent?.slice(0,100));
          else if (import.meta.env.DEV) console.log("[useEnketoForm] external", id, "items:", rootEl?.querySelectorAll?.("item")?.length ?? 0);
          return { id, xml: doc };
        });

        const form = new Form(formEl, {
          modelStr: modelXml,
          external,
        });

        if (import.meta.env.DEV) console.log("[useEnketoForm] Form created, calling init()...");
        const initErrors = form.init();
        if (import.meta.env.DEV) console.log("[useEnketoForm] init() completed, errors:", initErrors);

        formInstanceRef.current = form;
        if (import.meta.env.DEV) (window as any).__enketoForm = form;

        if (destroyed) {
          form.destroy();
          return;
        }

        setErrors(
          initErrors && initErrors.length > 0 ? initErrors : []
        );
        setFormReady(true);

        // Listen for changes
        formEl.addEventListener("dataupdate", () => {
          if (!destroyed) updateFormState();
        });
        formEl.addEventListener("valuechange", () => {
          if (!destroyed) updateFormState();
        });

        // Initial state capture
        updateFormState();
      } catch (err) {
        console.error("[useEnketoForm] init error:", err);
        if (!destroyed) {
          setErrors([
            err instanceof Error ? err.message : "Failed to initialize form",
          ]);
        }
      }
    }

    initForm();

    return () => {
      destroyed = true;
      if (formInstanceRef.current) {
        try {
          formInstanceRef.current.destroy();
        } catch {
          // ignore
        }
        formInstanceRef.current = null;
      }
      // Clear container DOM to prevent stale form content on re-render
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      setFormReady(false);
    };
  }, [formHtml, modelXml, externalData, containerRef, updateFormState]);

  return { formReady, formState, errors, resetForm };
}
