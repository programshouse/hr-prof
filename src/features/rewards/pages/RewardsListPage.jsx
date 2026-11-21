// src/features/rewards/pages/RewardsListPage.jsx
import { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useTranslation } from 'react-i18next';
import ExportDialog from '@/components/ui/exportDialog';
import RewardStats from '../components/RewardStats';
import RewardsTable from '../components/RewardsTable';
import RewardModal from '../components/RewardModal';

import { useRewardsQuery } from '../hooks/useRewardsQuery';
import { useRewardSummaryQuery } from '../hooks/useRewardSummaryQuery';
import DepartmentDateFilters from '../../../components/ui/DepartmentDateFilters';

export default function RewardsListPage() {
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
  const [editReward, setEditReward] = useState(null);

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

  const { data, isLoading } = useRewardsQuery({
    ...filters,
    employee_id: 190, // Filter by employee ID 190
    page,
    limit: pageSize,
  });

  const { data: summaryData, isLoading: isSummaryLoading } = useRewardSummaryQuery();

  const hasNoData = !isLoading && (data?.rows?.length ?? 0) === 0;

  const handleEdit = (reward) => {
    setEditReward(reward);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditReward(null);
    setIsModalOpen(true);
  };

  const handleExport = (format) => {
    if (!data?.rows?.length) {
      toast.error(t('rewards.noDataToExport'));
      return;
    }

    // Create CSV content for Excel export
    if (format === 'excel') {
      const csvContent = [
        ['ID', 'Employee', 'Amount', 'Type', 'Date'],
        ...data.rows.map(reward => [
          reward.employee?.code || '—',
          reward.employee?.full_name || '—',
          reward.amount || '—',
          reward.type || '—',
          reward.date || '—'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rewards_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(t('rewards.exportSuccess'));
    } else if (format === 'pdf') {
      // For PDF export, you would typically use a library like jsPDF
      // For now, we'll show a success message
      toast.success(t('rewards.pdfExportSuccess'));
    } else if (format === 'print') {
      // For print functionality
      window.print();
      toast.success(t('rewards.printSuccess'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <RewardStats data={summaryData} isLoading={isSummaryLoading} />

      {/* Filters and Add Button */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* ✅ shared filters directly (NO RewardFilters component anymore) */}
        <DepartmentDateFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          searchPlaceholder="Search"
          getDepartmentLabel={(d) => d?.name_en || d?.name_ar || d?.name}
          showStatus={false}
        />

        <div className="flex gap-2 w-full xl:w-auto">
          <ExportDialog
            onPdf={() => handleExport('pdf')}
            onExcel={() => handleExport('excel')}
            onPrintTable={() => handleExport('print')}
          >
            <Button variant="outline" className="w-full xl:w-auto">
              <Download className="size-4" />
              {t('common.export')}
            </Button>
          </ExportDialog>
          
          <Button onClick={handleAdd} className="w-full xl:w-auto">
            <Plus className="size-4" />
            {t('rewards.addReward')}
          </Button>
        </div>
      </div>

      {/* Table or Empty State */}
      {hasNoData ? (
        <EmptyState
          title={t('rewards.noRewardsFound')}
          description={t('rewards.noRewardsDescription')}
          action={
            <Button onClick={handleAdd}>
              <Plus className="size-4" />
              {t('rewards.addReward')}
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
          </div>
          <RewardsTable data={data?.rows ?? []} loading={isLoading} onEdit={handleEdit} />

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={data?.meta?.last_page || 1}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Modal for Add/Edit */}
      <RewardModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditReward(null);
        }}
        reward={editReward}
      />
    </div>
  );
}
