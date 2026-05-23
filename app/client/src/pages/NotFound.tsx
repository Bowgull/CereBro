import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cerebroColors as C } from "@/lib/keepConfig";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4" style={{ background: C.background }}>
      <Card className="mx-4 w-full max-w-lg">
        <CardContent className="py-6 text-center">
          <div className="mb-4 flex justify-center">
            <AlertCircle className="h-8 w-8" style={{ color: C.warning }} />
          </div>

          <h1 className="mb-2 font-mono text-2xl font-semibold" style={{ color: C.gold }}>404</h1>

          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-widest" style={{ color: C.textPrimary }}>
            Page Not Found
          </h2>

          <p className="mb-5 text-[12px] leading-snug" style={{ color: C.textSecondary }}>
            This route is not wired.
            <br />
            Return to the Keep.
          </p>

          <div
            id="not-found-button-group"
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              onClick={handleGoHome}
              variant="default"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
