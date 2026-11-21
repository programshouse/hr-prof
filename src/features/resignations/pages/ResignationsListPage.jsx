import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { useSearchParams } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import ResignationStats from '../components/ResignationStats';
import DepartmentDateFilters from '../../../components/ui/DepartmentDateFilters';
import ResignationsTable from '../components/ResignationsTable';
import ResignationModal from '../components/ResignationModal';

import { useResignationsQuery } from '../hooks/useResignationsQuery';
import { useResignationSummaryQuery } from '../hooks/useResignationSummaryQuery';

export default function ResignationsListPage() {
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
  const [editResignation, setEditResignation] = useState(null);

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

  // reset page when filters change
  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters || {});
    setPage(1);
  };

  // handle page change without resetting filters
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const { data, isLoading } = useResignationsQuery({
    ...filters,
    page,
    limit: pageSize,
  });

  const { data: summaryData, isLoading: isSummaryLoading } = useResignationSummaryQuery();

  const hasNoData = !isLoading && (data?.rows?.length ?? 0) === 0;

  const handleEdit = (resignation) => {
    setEditResignation(resignation);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditResignation(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <ResignationStats data={summaryData} isLoading={isSummaryLoading} />

      {/* Filters and Add Button */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/*  use handleFiltersChange instead of setFilters */}
        <DepartmentDateFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          searchPlaceholder="Search"
          getDepartmentLabel={(d) => d?.name_en || d?.name_ar || d?.name}
        />

        <Button onClick={handleAdd} className="w-full xl:w-auto">
          <Plus className="size-4" />
          {t('resignations.addResignation')}
        </Button>
      </div>

      {/* Table or Empty State */}
      {hasNoData ? (
        <EmptyState
          title={t('resignations.noResignationsFound')}
          description={t('resignations.noResignationsDescription')}
          action={
            <Button onClick={handleAdd}>
              <Plus className="size-4" />
              {t('resignations.addResignation')}
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
          </div>
          <ResignationsTable data={data?.rows ?? []} loading={isLoading} onEdit={handleEdit} />

          {/* Pagination */}
          {!hasNoData && (
            <Pagination
              currentPage={page}
              totalPages={data?.meta?.last_page || 1}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Modal for Add/Edit */}
      <ResignationModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditResignation(null);
        }}
        resignation={editResignation}
      />
    </div>
  );
}
