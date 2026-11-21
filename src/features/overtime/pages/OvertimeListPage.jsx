// src/features/overtime/pages/OvertimeListPage.jsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import PageSizeSelect from '@/components/shared/PageSizeSelect';

import { useTranslation } from 'react-i18next';
import OvertimeStats from '../components/OvertimeStats';
import OvertimeTable from '../components/OvertimeTable';
import OvertimeModal from '../components/OvertimeModal';

import { useOvertimeQuery } from '../hooks/useOvertimeQuery';
import { useOvertimeSummaryQuery } from '../hooks/useOvertimeSummaryQuery';
import DepartmentDateFilters from '../../../components/ui/DepartmentDateFilters';

export default function OvertimeListPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editOvertime, setEditOvertime] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handlePageSizeChange = (num) => {
    setPageSize(num);
    setPage(1);
  };

  // ✅ reset page when filters change
  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters || {});
    setPage(1);
  };

  const { data, isLoading } = useOvertimeQuery({
    ...filters,
    page,
    limit: pageSize,
  });

  const { data: summaryData, isLoading: isSummaryLoading } = useOvertimeSummaryQuery();

  const hasNoData = !isLoading && (data?.rows?.length ?? 0) === 0;

  const handleEdit = (overtime) => {
    setEditOvertime(overtime);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditOvertime(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <OvertimeStats data={summaryData} isLoading={isSummaryLoading} />

      {/* Filters and Add Button */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* ✅ shared filters directly (NO OvertimeFilters component anymore) */}
        <DepartmentDateFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          searchPlaceholder="Search"
          getDepartmentLabel={(d) => d?.name_en} // same as your old OvertimeFilters
        />

        <Button onClick={handleAdd} className="w-full xl:w-auto">
          <Plus className="size-4" />
          {t('overtime.addOvertime')}
        </Button>
      </div>

      {/* Table or Empty State */}
      {hasNoData ? (
        <EmptyState
          title={t('overtime.noOvertimeFound')}
          description={t('overtime.noOvertimeDescription')}
          action={
            <Button onClick={handleAdd}>
              <Plus className="size-4" />
              {t('overtime.addOvertime')}
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
          </div>
          <OvertimeTable data={data?.rows ?? []} loading={isLoading} onEdit={handleEdit} />

          <Pagination
            currentPage={page}
            totalPages={data?.meta?.last_page || 1}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Modal for Add/Edit */}
      <OvertimeModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditOvertime(null);
        }}
        overtime={editOvertime}
      />
    </div>
  );
}
