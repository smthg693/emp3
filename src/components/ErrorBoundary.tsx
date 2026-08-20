import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in Mission Control app:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white p-8 flex flex-col items-center justify-center font-mono">
          <div className="bg-red-950 border border-red-500/50 p-6 rounded-2xl max-w-xl text-center space-y-4 shadow-2xl">
            <span className="text-4xl">⚠️</span>
            <h2 className="text-xl font-bold text-red-400">Mission Control Interface Error</h2>
            <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded border border-slate-800 break-all text-left">
              {this.state.error?.toString()}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs"
            >
              Reload Interface
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
