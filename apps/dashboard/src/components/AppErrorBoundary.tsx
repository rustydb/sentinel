import { Component, type ErrorInfo, type ReactNode } from 'react';
import sentinelLogo from '../../../../assets/logo.svg';

const ACTION_BUTTON_CLASS =
  'sentinel-action-button border-2 border-sentinel-ink px-3 py-2 uppercase';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  message: string | null;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    message: null,
  };

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unknown dashboard error',
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('sentinel fatal render error', error, errorInfo);
  }

  private readonly handleReload = () => {
    window.location.reload();
  };

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="min-h-screen bg-sentinel-canvas px-6 py-10 text-sentinel-ink">
        <section className="mx-auto flex max-w-3xl flex-col gap-5 border-4 border-sentinel-danger bg-sentinel-shell p-8 shadow-[12px_12px_0_0_#06080b]">
          <div className="flex items-start gap-4">
            <img
              src={sentinelLogo}
              alt="Sentinel logo"
              className="h-16 w-16 border-2 border-sentinel-ink bg-sentinel-panel object-cover object-center p-1"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-sentinel-muted">
                Telemetry fault
              </p>
              <h1 className="mt-3 text-4xl uppercase leading-none text-sentinel-danger">
                Sentinel encountered a fatal error
              </h1>
            </div>
          </div>
          <p className="max-w-2xl text-sm uppercase">
            The dashboard failed to render safely. Reload the page to retry, and capture the console
            output if this keeps happening.
          </p>
          {this.state.message ? (
            <div className="border-2 border-sentinel-ink bg-sentinel-panel-inset p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">Error</p>
              <p className="mt-2 break-words text-sm uppercase">{this.state.message}</p>
            </div>
          ) : null}
          <div>
            <button type="button" className={ACTION_BUTTON_CLASS} onClick={this.handleReload}>
              Reload dashboard
            </button>
          </div>
        </section>
      </main>
    );
  }
}
