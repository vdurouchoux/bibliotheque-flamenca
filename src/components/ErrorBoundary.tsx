import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public props: Props;
  public state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
          for (const reg of regs) reg.unregister();
        });
      }
      sessionStorage.clear();
      window.location.href = window.location.origin + window.location.pathname;
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f0e0d] text-[#f4efe6] flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-[#181512] border border-[#3b3228] rounded-2xl p-6 text-center shadow-2xl space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-[#c53d2d]/20 text-[#ef4444] mb-1">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-serif text-[#f4efe6]">
              Oups ! Un petit problème est survenu
            </h2>
            <p className="text-xs text-[#a69c8f] leading-relaxed">
              L'application a rencontré une interruption inattendue. Vous pouvez la relancer immédiatement.
            </p>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#e5a93b] hover:bg-[#d4972c] text-[#121110] font-bold text-sm transition-colors cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>Recharger l'application</span>
              </button>

              <button
                onClick={this.handleResetCache}
                className="w-full py-2.5 px-4 rounded-xl bg-[#26211c] hover:bg-[#342e26] text-[#b8ada0] text-xs font-semibold transition-colors cursor-pointer border border-[#3b342c]"
              >
                Réinitialiser le cache & relancer
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
