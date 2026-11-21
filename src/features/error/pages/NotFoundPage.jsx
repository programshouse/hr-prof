import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-2xl text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-primary text-[150px] leading-none font-bold md:text-[200px]">404</h1>
          <div className="from-primary to-tertiary mx-auto h-1 w-32 bg-linear-to-r"></div>
        </div>

        {/* Message */}
        <div className="mb-8 space-y-4">
          <h2 className="text-2xl font-semibold text-slate-800 md:text-3xl">Page Not Found</h2>
          <p className="mx-auto max-w-md text-slate-600">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or
            deleted.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
            className="w-full gap-2 sm:w-auto"
          >
            <ArrowLeft className="size-4" />
            Go Back
          </Button>
          <Button onClick={() => navigate('/')} size="lg" className="w-full gap-2 sm:w-auto">
            <Home className="size-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Illustration */}
        <div className="mt-12">
          <svg
            className="mx-auto h-48 w-48 text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
