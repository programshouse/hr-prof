import { RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';
import { router } from './routes/index.routes';
import { Toaster } from 'sonner';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useTranslation } from 'react-i18next';

import { queryClient } from '@/lib/react-query';

function App() {
  const { t } = useTranslation();

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <Suspense
        fallback={<div className="flex h-screen items-center justify-center">{t('common.loading')}</div>}
      >
        <RouterProvider router={router} />

        <Toaster position="top-right" richColors theme="light" />
      </Suspense>
    </QueryClientProvider>
  );
}

export default App;
