import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Trash2 } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleClearCacheAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-surface-50">
          <div className="max-w-md w-full bg-white rounded-3xl border border-surface-200 p-8 shadow-card text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-surface-900 tracking-tight">
                {this.props.fallbackTitle || 'Something went wrong'}
              </h2>
              <p className="text-xs text-surface-600 leading-relaxed">
                An unexpected display issue occurred while rendering this view. Your booking data remains safe.
              </p>
              {this.state.error?.message && (
                <div className="p-3 bg-surface-100 rounded-xl text-[11px] font-mono text-surface-600 text-left overflow-x-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full bg-emerald-700 hover:bg-emerald-800 font-bold"
                onClick={this.handleReset}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Try Again
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-1/2 font-bold text-surface-700"
                  onClick={() => {
                    window.location.href = '/';
                  }}
                  leftIcon={<Home className="w-3.5 h-3.5" />}
                >
                  Return Home
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-1/2 font-bold text-red-600 border-red-200 hover:bg-red-50"
                  onClick={this.handleClearCacheAndReload}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Clear Cache
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
