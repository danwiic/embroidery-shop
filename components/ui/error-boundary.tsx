"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-3">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Something went wrong</h3>
            <p className="text-sm text-muted mt-1 max-w-xs text-center">
              {this.state.error?.message ?? "An unexpected error occurred."}
            </p>
            <Button
              size="sm"
              variant="outlined"
              className="mt-4"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              Try again
            </Button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
