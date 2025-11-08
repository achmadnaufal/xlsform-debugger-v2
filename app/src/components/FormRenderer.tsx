import { useRef, useState, useEffect } from "react";
import { useEnketoForm } from "../hooks/useEnketoForm";
import type { ExternalDataEntry, FormState } from "../types";

interface FormRendererProps {
  readonly xformXml: string | null;
  readonly externalData: readonly ExternalDataEntry[];
  readonly onModelUpdate: (state: FormState) => void;
  readonly onError: (error: string) => void;
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
}: FormRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transformed, setTransformed] = useState<TransformOutput | null>(null);

  // Transform XForm XML using enketo-transformer (web build)
  useEffect(() => {
    if (!xformXml) {
      setTransformed(null);
      return;
    }

    let cancelled = false;

    async function doTransform() {
      try {
        console.log("[FormRenderer] xformXml received, length:", xformXml!.length);
        console.log("[FormRenderer] xformXml preview:", xformXml!.substring(0, 200));

        const { transform } = await import("enketo-transformer/web");
        const result = await transform({ xform: xformXml! });

        console.log("[FormRenderer] transform result keys:", Object.keys(result));
        console.log("[FormRenderer] form HTML length:", result.form?.length ?? "undefined");
        console.log("[FormRenderer] model XML length:", result.model?.length ?? "undefined");
        console.log("[FormRenderer] model preview:", result.model?.substring(0, 200));

        if (!cancelled) {
          setTransformed({ form: result.form, model: result.model });
        }
      } catch (err) {
        console.error("[FormRenderer] transform error:", err);
        if (!cancelled) {
          onError(
            err instanceof Error
              ? err.message
              : "XForm transformation failed"
          );
        }
      }
    }

    doTransform();
    return () => {
      cancelled = true;
    };
  }, [xformXml, onError]);

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
    }
  }, [formReady, formState, onModelUpdate]);

  // Report init errors
  useEffect(() => {
    if (errors.length > 0) {
      onError(`Form init errors: ${errors.join(", ")}`);
    }
  }, [errors, onError]);

  if (!xformXml) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No form loaded</p>
          <p className="text-sm">
            Upload an XLSForm (.xlsx) to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      {!formReady && transformed && (
        <div className="flex items-center gap-2 text-blue-600 mb-4">
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Initializing form...</span>
        </div>
      )}
      <div ref={containerRef} className="enketo-form-container" />
    </div>
  );
}
