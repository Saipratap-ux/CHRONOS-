import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chronos Root Error Caught:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('chronos_time_vault_v1');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-amber-500/40 p-6 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 text-3xl font-black">
              ⏳
            </div>
            <h1 className="text-xl font-bold font-serif text-amber-300">
              Temporal Portal Needs Realignment
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Chronos encountered a startup issue. Click below to reload the app with fresh state.
            </p>
            {this.state.error && (
              <pre className="text-[10px] font-mono text-left bg-slate-950 p-3 rounded-xl border border-slate-800 text-red-300 overflow-x-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
              >
                Reload App
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Reset Storage
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  );
} else {
  console.error('Fatal: Failed to find #root element in index.html');
}
