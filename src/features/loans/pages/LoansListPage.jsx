// src/features/loans/pages/LoansListPage.jsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { useSearchParams } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import LoanStats from '../components/LoanStats';
import LoansTable from '../components/LoansTable';
import LoanModal from '../components/LoanModal';

import { useLoansQuery } from '../hooks/useLoansQuery';
import { useLoanSummaryQuery } from '../hooks/useLoanSummaryQuery';
import DepartmentDateFilters from '../../../components/ui/DepartmentDateFilters';

export default function LoansListPage() {
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
  const [editLoan, setEditLoan] = useState(null);

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

  const { data, isLoading } = useLoansQuery({
    ...filters,
    page,
    limit: pageSize,
  });

  const { data: summaryData, isLoading: isSummaryLoading } = useLoanSummaryQuery();

  const hasNoData = !isLoading && (data?.rows?.length ?? 0) === 0;

  const handleEdit = (loan) => {
    setEditLoan(loan);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditLoan(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <LoanStats data={summaryData} isLoading={isSummaryLoading} />

      {/* Filters + Add */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <DepartmentDateFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          searchPlaceholder="Search"
          getDepartmentLabel={(d) => d?.name_en || d?.name_ar || d?.name}
        />

        <Button onClick={handleAdd} className="w-full xl:w-auto">
          <Plus className="size-4" />
          {t('loans.addLoan')}
        </Button>
      </div>

      {/* Table / Empty */}
      {hasNoData ? (
        <EmptyState
          title={t('loans.noLoansFound')}
          description={t('loans.noLoansDescription')}
          action={
            <Button onClick={handleAdd}>
              <Plus className="size-4" />
              {t('loans.addLoan')}
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
          </div>
          <LoansTable data={data?.rows ?? []} loading={isLoading} onEdit={handleEdit} />

          <Pagination
            currentPage={page}
            totalPages={data?.meta?.last_page || 1}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Modal */}
      <LoanModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditLoan(null);
        }}
        loan={editLoan}
      />
    </div>
  );
}
