// src/features/branchTransfers/pages/BranchTransfersListPage.jsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { useSearchParams } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import BranchTransferStats from '../components/BranchTransferStats';
import BranchTransfersTable from '../components/BranchTransfersTable';
import BranchTransferModal from '../components/BranchTransferModal';

import { useBranchTransfersQuery } from '../hooks/useBranchTransfersQuery';
import { useBranchTransferSummaryQuery } from '../hooks/useBranchTransferSummaryQuery';

// ✅ shared filter component (use ONE path everywhere in the app)
import DepartmentDateFilters from '../../../components/ui/DepartmentDateFilters';

export default function BranchTransfersListPage() {
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
  const [editTransfer, setEditTransfer] = useState(null);

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

  // ✅ reset page when filters change
  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters || {});
    setPage(1);
  };

  // ✅ handle page change without resetting filters
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const { data, isLoading } = useBranchTransfersQuery({
    ...filters,
    page,
    limit: pageSize,
  });

  const { data: summaryData, isLoading: isSummaryLoading } = useBranchTransferSummaryQuery();

  const hasNoData = !isLoading && (data?.rows?.length ?? 0) === 0;

  const handleEdit = (transfer) => {
    setEditTransfer(transfer);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditTransfer(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <BranchTransferStats data={summaryData} isLoading={isSummaryLoading} />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <DepartmentDateFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          searchPlaceholder="Search"
          getDepartmentLabel={(d) => d?.name_en || d?.name_ar || d?.name}
        />

        <Button onClick={handleAdd} className="w-full xl:w-auto">
          <Plus className="size-4" />
          {t('branchTransfers.addBranchTransfer')}
        </Button>
      </div>

      {hasNoData ? (
        <EmptyState
          title={t('branchTransfers.noBranchTransfersFound')}
          description={t('branchTransfers.noBranchTransfersDescription')}
          action={
            <Button onClick={handleAdd}>
              <Plus className="size-4" />
              {t('branchTransfers.addBranchTransfer')}
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
          </div>

          <BranchTransfersTable data={data?.rows ?? []} loading={isLoading} onEdit={handleEdit} />

          <Pagination
            currentPage={page}
            totalPages={data?.meta?.last_page || 1}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <BranchTransferModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditTransfer(null);
        }}
        transfer={editTransfer}
      />
    </div>
  );
}
