<<<<<<< HEAD
// src/components/ErrorBoundary/index.tsx
import React from "react";
=======
import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa

interface Props {
  children: React.ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
<<<<<<< HEAD
=======
  errorType: "gateway" | "network" | "general";
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
<<<<<<< HEAD
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
=======
    this.state = {
      hasError: false,
      error: null,
      errorType: "general",
    };
  }

  static getDerivedStateFromError(error: Error): State {
    let errorType: "gateway" | "network" | "general" = "general";

    if (
      error.message.includes("502") ||
      error.message.includes("Bad Gateway")
    ) {
      errorType = "gateway";
    } else if (
      error.message.includes("network") ||
      error.message.includes("fetch")
    ) {
      errorType = "network";
    }

    return {
      hasError: true,
      error,
      errorType,
    };
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.props.onError?.(error);
  }

<<<<<<< HEAD
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">
              Something went wrong
            </h2>
            <p className="text-gray-400">
              Please try again. If the problem persists, contact support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Reload Page
            </button>
=======
  getErrorMessage() {
    switch (this.state.errorType) {
      case "gateway":
        return {
          title: "Gateway Error",
          message:
            "We're having trouble connecting to our servers. This might be due to maintenance or high traffic.",
        };
      case "network":
        return {
          title: "Network Error",
          message: "Please check your internet connection and try again.",
        };
      default:
        return {
          title: "Something went wrong",
          message:
            "An unexpected error occurred. Please try again or contact support if the problem persists.",
        };
    }
  }

  render() {
    if (this.state.hasError) {
      const errorInfo = this.getErrorMessage();

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>

            <h2 className="text-2xl font-bold text-white">{errorInfo.title}</h2>
            <p className="text-gray-400">{errorInfo.message}</p>

            <div className="pt-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </button>
            </div>

            {this.state.errorType === "gateway" && (
              <p className="text-sm text-gray-500 mt-4">
                If the problem persists, our team has been notified and is
                working on it.
              </p>
            )}
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
