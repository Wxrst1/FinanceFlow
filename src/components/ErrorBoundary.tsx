
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-red-500/10 p-4 rounded-full mb-6">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Algo correu mal</h1>
          <p className="text-zinc-400 mb-8 max-w-md">
            Ocorreu um erro crítico na aplicação. Isto pode dever-se a problemas de conexão ou dados corrompidos.
          </p>
          
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-8 max-w-lg w-full overflow-auto text-left">
            <p className="font-mono text-xs text-red-400">
                {this.state.error?.message || 'Unknown Error'}
            </p>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-bold transition-colors"
          >
            <RefreshCw size={20} />
            Recarregar Aplicação
          </button>
          
          <button 
            onClick={() => {
                localStorage.clear();
                window.location.reload();
            }}
            className="mt-4 text-xs text-zinc-500 hover:text-red-400 underline"
          >
            Limpar dados locais e reiniciar (Hard Reset)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}