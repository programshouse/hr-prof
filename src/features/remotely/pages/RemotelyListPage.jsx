// src/features/remotely/pages/RemotelyListPage.jsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useSearchParams } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import RemotelyStats from '../components/RemotelyStats';
import RemotelyTable from '../components/RemotelyTable';
import RemotelyModal from '../components/RemotelyModal';
import { Pagination } from '@/components/ui/Pagination';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { useRemotelyQuery, useRemotelyDetailQuery } from '../hooks/useRemotelyQuery';
import { useRemotelySummaryQuery } from '../hooks/useRemotelySummaryQuery';
import DepartmentDateFilters from '../../../components/ui/DepartmentDateFilters';

export default function RemotelyListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState(() => {
    const urlFilters = {};
    searchParams.forEach((value, key) => {
      if (key !== 'page' && value !== 'all' && value !== '') {
        urlFilters[key] = value;
      }
    });
    return urlFilters;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // store id instead of whole row
  const [editId, setEditId] = useState(null);

  // Initialize page from URL parameters
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const [pageSize, setPageSize] = useState(10);

  const handlePageSizeChange = (num) => {
    setPageSize(num);
    setPage(1);
  };

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters || {});
    setPage(1); // Reset to first page when filters change
  };

  const { data, isLoading } = useRemotelyQuery({
    ...filters,
    page,
    limit: pageSize,
  });

  const { data: summaryData, isLoading: isSummaryLoading } = useRemotelySummaryQuery();

  //  fetch full record including `date`
  const { data: editRemotely } = useRemotelyDetailQuery(editId);

  const hasNoData = !isLoading && (data?.rows?.length ?? 0) === 0;

  const handleEdit = (row) => {
    setEditId(row.id);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditId(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <RemotelyStats data={summaryData} isLoading={isSummaryLoading} />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <DepartmentDateFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          searchPlaceholder="Search"
          getDepartmentLabel={(d) => d?.name_en || d?.name_ar || d?.name}
        />

        <Button onClick={handleAdd} className="w-full xl:w-auto">
          <Plus className="size-4" />
          {t('remotely.addRemoteWork')}
        </Button>
      </div>

      {hasNoData ? (
        <EmptyState
          title={t('remotely.noRemoteFound')}
          description={t('remotely.noRemoteDescription')}
          action={
            <Button onClick={handleAdd}>
              <Plus className="size-4" />
              {t('remotely.addRemoteWork')}
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
          </div>
          <RemotelyTable data={data?.rows ?? []} loading={isLoading} onEdit={handleEdit} />

          {!hasNoData && (
            <Pagination
              currentPage={page}
              totalPages={data?.meta?.last_page || 1}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <RemotelyModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditId(null);
        }}
        remotely={editRemotely || null}
      />
    </div>
  );
}
