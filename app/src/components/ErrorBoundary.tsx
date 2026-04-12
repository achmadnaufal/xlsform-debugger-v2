import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly label?: string;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  render() {
    if (this.state.hasError) {
      const label = this.props.label ?? "this section";
      return (
        <div className="flex items-center justify-center h-full p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
            <h3 className="text-red-700 font-semibold text-sm mb-2">
              Something went wrong in {label}
            </h3>
            <p className="text-red-600 text-xs mb-4">{this.state.errorMessage}</p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, errorMessage: "" })}
              className="px-4 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
