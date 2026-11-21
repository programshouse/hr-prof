import { useRouteError, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="size-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Oops! Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Don&apos;t worry, we&apos;re on it!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Details */}
          {error && (
            <div className="rounded-lg bg-slate-100 p-4">
              <p className="mb-2 text-sm font-semibold text-slate-700">Error Details:</p>
              <p className="text-sm text-slate-600">
                {error.message || error.statusText || 'Unknown error occurred'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={handleReload} className="w-full">
              <RefreshCw className="mr-2 size-4" />
              Reload Page
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full">
              <Home className="mr-2 size-4" />
              Go to Home
            </Button>
          </div>

          {/* Development Info */}
          {import.meta.env.DEV && error?.stack && (
            <details className="rounded-lg border border-slate-200 p-3">
              <summary className="cursor-pointer text-sm font-medium text-slate-700">
                Stack Trace (Dev Only)
              </summary>
              <pre className="mt-2 overflow-auto text-xs text-slate-600">{error.stack}</pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
