'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="card max-w-md text-center">
            <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Algo deu errado</h2>
            <p className="text-[var(--text-muted)] mb-4 text-sm">
              {this.state.error?.message || 'Ocorreu um erro inesperado.'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="btn-primary inline-flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Recarregar Pagina
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
