import { Network } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/feedback/EmptyState';
import { useStructureQuery } from '../hooks/useStructureQuery';
import StructureOrgChart from '../components/StructureOrgChart';

export default function StructurePage() {
  const { t } = useTranslation();
  const { data: managers = [], isLoading, isError } = useStructureQuery();

  return (
    <div >
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <Network className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('structure.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('structure.description')}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <p className="text-sm text-muted-foreground">{t('structure.loading')}</p>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <EmptyState title={t('structure.errorTitle')} description={t('structure.errorDescription')} />
        </div>
      ) : managers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <EmptyState title={t('structure.emptyTitle')} description={t('structure.emptyDescription')} />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <StructureOrgChart managers={managers} />
        </div>
      )}
    </div>
  );
}
