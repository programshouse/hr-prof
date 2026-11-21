import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import PageSizeSelect from '@/components/shared/PageSizeSelect';

import { useWeekendsQuery } from '../hooks/useWeekendsQuery';
import WeekendsTable from '../components/WeekendsTable';
import WeekendModal from '../components/WeekendModal';

export default function WeekendsListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });

  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWeekend, setEditingWeekend] = useState(null);

  const { data, isLoading } = useWeekendsQuery({
    page,
    limit: pageSize,
  });

  const rows = data?.rows ?? [];
  const meta = data?.meta ?? { last_page: 1 };

  const hasNoData = !isLoading && (rows?.length ?? 0) === 0;

  const handlePageSizeChange = (num) => {
    setPageSize(num);
    setPage(1);
  };

  const handleAdd = () => {
    setEditingWeekend(null);
    setIsModalOpen(true);
  };

  const handleEdit = (weekend) => {
    setEditingWeekend(weekend);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('navigation.weekends')}</h1>
        <Button onClick={handleAdd} className="w-auto">
          <Plus className="size-4" />
          {t('weekends.add')}
        </Button>
      </div>

      {hasNoData ? (
        <EmptyState
          title={t('weekends.emptyTitle')}
          description={t('weekends.emptyDesc')}
          action={
            <Button onClick={handleAdd}>
              <Plus className="size-4" />
              {t('weekends.add')}
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
          </div>

          <WeekendsTable data={rows} loading={isLoading} onEdit={handleEdit} />

          <Pagination
            currentPage={page}
            totalPages={meta?.last_page || 1}
            onPageChange={setPage}
          />
        </>
      )}

      <WeekendModal
        open={isModalOpen}
        onOpenChange={(value) => {
          setIsModalOpen(value);
          if (!value) setEditingWeekend(null);
        }}
        weekend={editingWeekend}
      />
    </div>
  );
}

