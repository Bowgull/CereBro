import { cn } from "@/lib/utils";
import { cerebroColors as C } from "@/lib/keepConfig";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4" style={{ background: C.background }}>
          <div
            className="flex w-full max-w-2xl flex-col items-center rounded-md p-4"
            style={{ background: C.surface, border: `1px solid ${C.borderSoft}`, color: C.textPrimary }}
          >
            <AlertTriangle
              size={32}
              className="mb-3 flex-shrink-0"
              style={{ color: C.danger }}
            />

            <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-widest">Unexpected Error</h2>

            <div
              className="mb-4 w-full overflow-auto rounded p-3"
              style={{ background: C.surfaceMuted, border: `1px solid ${C.borderSoft}` }}
            >
              <pre className="whitespace-break-spaces font-mono text-[11px]" style={{ color: C.textMuted }}>
                {this.state.error?.stack}
              </pre>
            </div>

            <Button
              type="button"
              onClick={() => window.location.reload()}
              variant="destructive"
              className={cn(
                "cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
