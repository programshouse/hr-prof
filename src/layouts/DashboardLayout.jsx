import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Topbar } from '@/components/navigation/Topbar';
import { SYSTEM_DOCUMENT_TITLE } from '@/lib/constants/documentTitle';

export default function DashboardLayout() {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t('app.title', SYSTEM_DOCUMENT_TITLE);
  }, [location.pathname, i18n.language, t]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="bg-background flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
