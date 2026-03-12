import { Component, type ReactNode } from "react";
import { btn } from "../lib/styles";

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg border border-red-200 p-6 text-center">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600 mb-4">{this.state.error.message}</p>
            <button
              type="button"
              className={btn.primary}
              onClick={() => { this.setState({ error: null }); }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
