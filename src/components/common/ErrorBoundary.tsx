import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** Called when the visitor asks to leave the broken section. */
  onBack?: () => void;
  /** Label for the back button, defaults to "ফিরে যান". */
  backLabel?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Catches render errors of a section and shows a friendly message instead of
 * leaving the visitor with a blank screen. The optional back button makes
 * sure there is always a way out — a reload is never the only option.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Component error caught by boundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="my-6 flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-900 shadow-soft dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-bold">দুঃখিত, এই সেকশনটি লোড করতে সমস্যা হয়েছে</h3>
            <p className="mt-1 max-w-sm text-xs text-rose-700/80 dark:text-rose-300/80">
              অপ্রত্যাশিত ত্রুটির কারণে অংশবিশেষ লোড করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন অথবা পিছনে ফিরে যান।
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 rounded-xl bg-forest px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-forest-dark"
              >
                <RotateCcw size={14} /> পুনরায় চেষ্টা করুন
              </button>
              {this.props.onBack && (
                <button
                  onClick={this.props.onBack}
                  className="flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-rose-800 dark:bg-white/5 dark:text-rose-200"
                >
                  <ArrowLeft size={14} /> {this.props.backLabel ?? 'ফিরে যান'}
                </button>
              )}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
