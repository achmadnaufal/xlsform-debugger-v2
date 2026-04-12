import { useState, useCallback } from "react";
import axios from "axios";

interface DeployModalProps {
  readonly onClose: () => void;
  readonly onDeploy: (config: DeployConfig) => Promise<void>;
}

export interface DeployConfig {
  readonly koboUrl: string;
  readonly apiToken: string;
  readonly formName: string;
}

export function DeployModal({ onClose, onDeploy }: DeployModalProps) {
  const [koboUrl, setKoboUrl] = useState("https://kf.kobotoolbox.org");
  const [apiToken, setApiToken] = useState("");
  const [formName, setFormName] = useState("New Form");
  const [status, setStatus] = useState<"idle" | "deploying" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleDeploy = useCallback(async () => {
    if (!apiToken.trim()) {
      setErrorMsg("API token is required");
      setStatus("error");
      return;
    }
    setStatus("deploying");
    setErrorMsg("");
    try {
      await onDeploy({ koboUrl, apiToken, formName });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        axios.isAxiosError(err) && err.response?.data?.detail
          ? String(err.response.data.detail)
          : err instanceof Error
            ? err.message
            : "Deploy failed"
      );
    }
  }, [apiToken, formName, koboUrl, onDeploy]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">Deploy to KoboToolbox</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-gray-600">KoboToolbox URL</span>
            <input
              className="mt-1 w-full text-xs border border-gray-300 rounded px-3 py-2"
              value={koboUrl}
              onChange={(e) => setKoboUrl(e.target.value)}
              placeholder="https://kf.kobotoolbox.org"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-gray-600">API Token</span>
            <input
              className="mt-1 w-full text-xs border border-gray-300 rounded px-3 py-2"
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Your KoboToolbox API token"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-gray-600">Form Name</span>
            <input
              className="mt-1 w-full text-xs border border-gray-300 rounded px-3 py-2"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="My Form"
            />
          </label>

          {status === "error" && (
            <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2">{errorMsg}</p>
          )}
          {status === "success" && (
            <p className="text-xs text-green-700 bg-green-50 rounded px-3 py-2">
              Deployed successfully!
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
          >
            {status === "success" ? "Close" : "Cancel"}
          </button>
          {status !== "success" && (
            <button
              type="button"
              onClick={handleDeploy}
              disabled={status === "deploying"}
              className="text-xs px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded font-medium"
            >
              {status === "deploying" ? "Deploying..." : "Deploy"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
