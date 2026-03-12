import { useRef, useState, useEffect } from "react";
import { useEnketoForm } from "../hooks/useEnketoForm";
import type { ExternalDataEntry, FormState } from "../types";
import { useStatus } from "../contexts/StatusContext";

interface FormRendererProps {
  readonly xformXml: string | null;
  readonly externalData: readonly ExternalDataEntry[];
  readonly onModelUpdate: (state: FormState) => void;
  readonly onError: (error: string) => void;
  readonly onQuestionSelect?: (name: string) => void;
}

interface TransformOutput {
  readonly form: string;
  readonly model: string;
}

export function FormRenderer({
  xformXml,
  externalData,
  onModelUpdate,
  onError,
  onQuestionSelect,
}: FormRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transformed, setTransformed] = useState<TransformOutput | null>(null);
  const { setStatus } = useStatus();

  // Clear transformed state immediately when xformXml becomes null
  // (useEffect would be too late — stale formHtml would reach useEnketoForm)
  const prevXmlRef = useRef(xformXml);
  if (prevXmlRef.current !== xformXml) {
    prevXmlRef.current = xformXml;
    if (!xformXml) {
      setTransformed(null);
    }
  }

  // Transform XForm XML using enketo-transformer (web build)
  useEffect(() => {
    if (!xformXml) {
      // Clear container DOM so no residual form is shown
      if (containerRef.current) containerRef.current.innerHTML = "";
      return;
    }

    let cancelled = false;

    async function doTransform() {
      setStatus("rendering");
      try {
        const { transform } = await import("enketo-transformer/web");
        const result = await transform({ xform: xformXml! });
        if (!cancelled) {
          setTransformed({ form: result.form, model: result.model });
        }
      } catch (err) {
        if (!cancelled) {
          onError(err instanceof Error ? err.message : "XForm transformation failed");
          setStatus("idle");
        }
      }
    }

    doTransform();
    return () => { cancelled = true; };
  }, [xformXml, onError, setStatus]);

  const { formReady, formState, errors } = useEnketoForm({
    formHtml: transformed?.form ?? "",
    modelXml: transformed?.model ?? "",
    externalData,
    containerRef,
  });

  // Forward form state to parent
  useEffect(() => {
    if (formReady) {
      onModelUpdate(formState);
      setStatus("idle");
    }
  }, [formReady, formState, onModelUpdate, setStatus]);

  // Report init errors
  useEffect(() => {
    if (errors.length > 0) {
      onError(`Form init errors: ${errors.join(", ")}`);
    }
  }, [errors, onError]);

  // Wire question click → Inspector
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onQuestionSelect) return;
    const handler = (e: MouseEvent) => {
      const question = (e.target as Element).closest('.question');
      if (!question) return;

      // Strategy 1: input/select/textarea name attribute
      const input = question.querySelector('input, select, textarea');
      const inputName = input?.getAttribute('name') ?? '';
      // Strategy 2: data-name attribute on the question element
      const dataName = question.getAttribute('data-name') ?? '';

      // Try extracting a clean field name from multiple sources
      const candidates: string[] = [];

      // From input name — strip repeat indices like [1], then take last segment
      if (inputName) {
        const cleaned = inputName.replace(/\[\d+\]/g, '');
        const last = cleaned.split('/').pop() ?? '';
        if (last) candidates.push(last);
        // Also try full xpath for lookup (without repeat indices)
        if (cleaned.includes('/')) candidates.push(cleaned);
      }

      // From data-name — same treatment
      if (dataName) {
        const cleaned = dataName.replace(/\[\d+\]/g, '');
        const last = cleaned.split('/').pop() ?? '';
        if (last && !candidates.includes(last)) candidates.push(last);
        if (cleaned.includes('/') && !candidates.includes(cleaned)) candidates.push(cleaned);
      }

      // Try the first candidate that exists
      for (const name of candidates) {
        if (name) {
          onQuestionSelect(name);
          return;
        }
      }
    };
    container.addEventListener('click', handler);
    return () => container.removeEventListener('click', handler);
  }, [formReady, onQuestionSelect]);

  if (!xformXml) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No form loaded</p>
          <p className="text-sm">Upload an XLSForm (.xlsx) to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      {!formReady && transformed && (
        <div className="flex items-center gap-2 text-blue-600 mb-4">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Initializing form...</span>
        </div>
      )}
      <div ref={containerRef} className="enketo-form-container" />
    </div>
  );
}
