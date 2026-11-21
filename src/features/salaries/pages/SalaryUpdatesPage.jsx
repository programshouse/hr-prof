import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { Pagination } from '@/components/ui/Pagination';
import { MonthNavigation } from '@/features/fingerprintIssues/components/MonthNavigation.jsx';
import { EmptyState } from '@/components/error/EmptyState';

import SalaryUpdatesFilters from '../components/SalaryUpdatesFilters';
import SalaryUpdatesTable from '../components/SalaryUpdatesTable';
import AddSalaryUpdateModal from '../components/AddSalaryUpdateModal';
import EditSalaryUpdateModal from '../components/EditSalaryUpdateModal';
import SalaryHistoryModal from '../components/SalaryHistoryModal';
import { DeleteSalaryUpdateDialog } from '../components/DeleteSalaryUpdateDialog';
import { salariesApi } from '../api/salariesApi';

function formatMonth(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function monthToDate(monthStr) {
  // monthStr = "YYYY-MM"
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) return new Date();
  // use first day of month
  const d = new Date(`${monthStr}-01T00:00:00`);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export default function SalaryUpdatesPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSalaryUpdate, setEditingSalaryUpdate] = useState(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingSalaryUpdate, setDeletingSalaryUpdate] = useState(null);

  /* ---------------- URL state ---------------- */

  // ✅ month comes from URL (month=YYYY-MM)
  const currentMonth = useMemo(() => {
    const monthParam = searchParams.get('month');
    return monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : formatMonth(new Date());
  }, [searchParams]);

  // MonthNavigation still needs Date object
  const currentDate = useMemo(() => monthToDate(currentMonth), [currentMonth]);

  const [page, setPage] = useState(() => {
    const p = searchParams.get('page');
    return p ? parseInt(p, 10) : 1;
  });

  const [pageSize, setPageSize] = useState(() => {
    const l = searchParams.get('limit');
    return l ? parseInt(l, 10) : 10;
  });

  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    shift_id: searchParams.get('shift_id') || '',
    company_id: searchParams.get('company_id') || '',
    branch_id: searchParams.get('branch_id') || '',
  }));

  const syncParams = (next) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(next).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // ✅ hard-remove any legacy "date" param
    params.delete('date');
    setSearchParams(params);
  };

  /* ---------------- handlers ---------------- */

  const handleDateChange = (newDate) => {
    // ✅ reset to page 1
    setPage(1);

    syncParams({
      month: formatMonth(newDate),
      page: 1,
    });
  };

  const handleFiltersChange = (newFilters) => {
    const next = newFilters || {};

    setFilters(next);
    setPage(1);

    syncParams({
      ...next,
      page: 1,
    });
  };

  const handlePageSizeChange = (num) => {
    setPageSize(num);
    setPage(1);

    syncParams({
      limit: num,
      page: 1,
    });
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    syncParams({ page: nextPage });
  };

  /* ---------------- mutations ---------------- */

  const deleteMutation = useMutation({
    mutationFn: salariesApi.deleteSalaryChange,
    onSuccess: () => {
      toast.success(t('salaries.messages.deleteSuccess'));
      queryClient.invalidateQueries({ queryKey: ['salaryUpdatesAll'] });
    },
    onError: (error) => {
      toast.error(t('salaries.messages.deleteError'));
      console.error('Delete error:', error);
    },
  });

  const handleView = (row) => {
    const employeeId = row?.employee_id || row?.employee?.id;

    if (!employeeId) {
      toast.error(t('salaries.messages.employeeIdNotFound'));
      return;
    }

    setSelectedEmployeeId(employeeId);
    setIsHistoryModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditingSalaryUpdate(row);
    setIsEditModalOpen(true);
  };

  const handleDelete = (row) => {
    setDeletingSalaryUpdate(row);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingSalaryUpdate?.id) return;

    deleteMutation.mutate(deletingSalaryUpdate.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setDeletingSalaryUpdate(null);
      },
    });
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setDeletingSalaryUpdate(null);
  };

  const handleAddNew = () => {
    setIsAddModalOpen(true);
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['salaryUpdatesAll'] });
  };

  const handleEditModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['salaryUpdatesAll'] });
    setIsEditModalOpen(false);
    setEditingSalaryUpdate(null);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingSalaryUpdate(null);
  };

  /* ---------------- query ---------------- */

  const queryParams = useMemo(() => {
    const clean = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== 'all' && v != null)
    );

    return {
      ...clean,
      month: currentMonth,
      page,
      limit: pageSize,
    };
  }, [filters, currentMonth, page, pageSize]);

  const { data: salaryUpdatesData, isLoading: salaryUpdatesLoading } = useQuery({
    queryKey: ['salaryUpdatesAll', queryParams],
    queryFn: () => salariesApi.getSalaryChanges(queryParams),
    keepPreviousData: true,
  });

  /**
   * API response format:
   * { data: { current_page, data: [...], per_page, total, ... } }
   */
  const apiResponse = salaryUpdatesData?.data || salaryUpdatesData || {};

  const salaryUpdates = Array.isArray(apiResponse?.data)
    ? apiResponse.data
    : Array.isArray(apiResponse)
      ? apiResponse
      : [];

  const totalPages = Math.ceil((apiResponse?.total || 0) / (apiResponse?.per_page || pageSize));
  const hasNoData = !salaryUpdatesLoading && (salaryUpdates?.length ?? 0) === 0;

  // Check if any filters are applied (other than default values)
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((value) => value && value !== '' && value !== 'all');
  }, [filters]);

  const finalTitle = hasActiveFilters
    ? t('salaries.messages.noUpdatesWithFilters')
    : t('salaries.messages.noUpdates');

  return (
    <div className="space-y-6" dir={dir}>
      <MonthNavigation date={currentDate} onDateChange={handleDateChange} disableFutureMonths />

      {/* Filters */}
      <SalaryUpdatesFilters filters={filters} onFiltersChange={handleFiltersChange} onAddNew={handleAddNew} />

      {hasNoData ? (
        <div className="pt-6">
          <EmptyState title={finalTitle} description="" />
        </div>
      ) : (
        <>
          {/* Page size */}
          <div className="flex items-center justify-between">
            <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
          </div>

          {/* Table */}
          <SalaryUpdatesTable
            title={t('salaries.allSalaries')}
            data={salaryUpdates}
            loading={salaryUpdatesLoading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            defaultShowExtras={false}
            showToggle
          />

          {/* Pagination */}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}

      {/* Add Salary Update Modal */}
      <AddSalaryUpdateModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={handleModalSuccess}
      />

      {/* Edit Salary Update Modal */}
      <EditSalaryUpdateModal
        open={isEditModalOpen}
        onOpenChange={handleEditModalClose}
        onSuccess={handleEditModalSuccess}
        salaryUpdateId={editingSalaryUpdate?.id}
        initialData={editingSalaryUpdate}
      />

      <SalaryHistoryModal
        open={isHistoryModalOpen}
        onOpenChange={setIsHistoryModalOpen}
        employeeId={selectedEmployeeId}
      />

      <DeleteSalaryUpdateDialog
        open={isDeleteDialogOpen}
        onOpenChange={handleDeleteDialogClose}
        salaryUpdate={deletingSalaryUpdate}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isLoading || deleteMutation.isPending}
      />
    </div>
  );
}