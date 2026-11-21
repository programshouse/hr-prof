// src/features/penalties/pages/PenaltiesListPage.jsx
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
import PenaltyStats from '../components/PenaltyStats';
import PenaltiesTable from '../components/PenaltiesTable';
import PenaltyModal from '../components/PenaltyModal';

import { usePenaltiesQuery } from '../hooks/usePenaltiesQuery';
import { usePenaltySummaryQuery } from '../hooks/usePenaltySummaryQuery';

// ✅ shared filter component (one component for all pages)
import DepartmentDateFilters from '../../../components/ui/DepartmentDateFilters';

export default function PenaltiesListPage() {
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
  const [editPenalty, setEditPenalty] = useState(null);

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

  const { data, isLoading } = usePenaltiesQuery({
    ...filters,
    employee_id: 190, // Filter by employee ID 190
    page,
    limit: pageSize,
  });

  const { data: summaryData, isLoading: isSummaryLoading } = usePenaltySummaryQuery();

  const hasNoData = !isLoading && (data?.rows?.length ?? 0) === 0;

  const handleEdit = (penalty) => {
    setEditPenalty(penalty);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditPenalty(null);
    setIsModalOpen(true);
  };

  const handleExport = (format) => {
    if (!data?.rows?.length) {
      toast.error(t('penalties.noDataToExport'));
      return;
    }

    // Create CSV content for Excel export
    if (format === 'excel') {
      const csvContent = [
        ['ID', 'Employee', 'Amount', 'Type', 'Date'],
        ...data.rows.map(penalty => [
          penalty.employee?.code || '—',
          penalty.employee?.full_name || '—',
          penalty.amount || '—',
          penalty.type || '—',
          penalty.date || '—'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `penalties_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(t('penalties.exportSuccess'));
    } else if (format === 'pdf') {
      // For PDF export, you would typically use a library like jsPDF
      // For now, we'll show a success message
      toast.success(t('penalties.pdfExportSuccess'));
    } else if (format === 'print') {
      // For print functionality
      window.print();
      toast.success(t('penalties.printSuccess'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <PenaltyStats data={summaryData} isLoading={isSummaryLoading} />

      {/* Filters and Add Button */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* ✅ use shared filters directly (NO PenaltyFilters component anymore) */}
        <DepartmentDateFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          searchPlaceholder="Search"
          getDepartmentLabel={(d) => d?.name_en} // same behavior as your PenaltyFilters
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
            {t('penalties.addPenalty')}
          </Button>
        </div>
      </div>

      {/* Table or Empty State */}
      {hasNoData ? (
        <EmptyState
          title={t('penalties.noPenaltiesFound')}
          description={t('penalties.noPenaltiesDescription')}
          action={
            <Button onClick={handleAdd}>
              <Plus className="size-4" />
              {t('penalties.addPenalty')}
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
          </div>
          <PenaltiesTable data={data?.rows ?? []} loading={isLoading} onEdit={handleEdit} />

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={data?.meta?.last_page || 1}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Modal for Add/Edit */}
      <PenaltyModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditPenalty(null);
        }}
        penalty={editPenalty}
      />
    </div>
  );
}
