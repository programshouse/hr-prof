import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import { Pagination } from '@/components/ui/Pagination';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { MonthNavigation } from '@/features/fingerprintIssues/components/MonthNavigation.jsx';

import { ExceptionsFilters } from '../components/ExceptionsFilters';
import { ExceptionsTable } from '../components/ExceptionsTable';
import { AddExceptionDialog } from '../components/AddExceptionDialog';
import { EditExceptionDialog } from '../components/EditExceptionDialog';
import { DeleteExceptionDialog } from '../components/DeleteExceptionDialog';
import { getExceptionsColumns } from '../components/exceptionsColumns';

import { useAllPositions } from '@/shared/hooks';
import { useExceptionsQuery } from '../hooks/useExceptionsQuery';
import { useUpsertException } from '../hooks/useUpsertException';
import { useDeleteException } from '../hooks/useDeleteException';
import { exceptionsKeys } from '../api/exceptions.keys';

export default function ExceptionsPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const monthParam = searchParams.get('month');
    if (monthParam) {
      const d = new Date(monthParam);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const p = Number(searchParams.get('page'));
    return Number.isFinite(p) && p > 0 ? p : 1;
  });

  const [pageSize, setPageSize] = useState(() => {
    const ps = Number(searchParams.get('pageSize'));
    return Number.isFinite(ps) && ps > 0 ? ps : 20;
  });

  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    company: searchParams.get('company') || 'all',
    branch: searchParams.get('branch') || 'all',
    shift: searchParams.get('shift') || 'all',
    position: searchParams.get('position') || 'all',
  }));

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedException, setSelectedException] = useState(null);

  const { data: positions = [] } = useAllPositions();

  const { data: exceptionsData, isLoading, isFetching } = useExceptionsQuery(
    currentPage,
    pageSize,
    filters.company,
    filters.search,
    filters.branch,
    filters.shift,
    selectedMonth,
    filters.position
  );

  const { create, update } = useUpsertException();
  const deleteMutation = useDeleteException();

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.company,
    filters.search,
    filters.branch,
    filters.shift,
    filters.position,
    pageSize,
    selectedMonth,
  ]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (currentPage > 1) params.set('page', String(currentPage));
    if (pageSize) params.set('pageSize', String(pageSize));
    if (selectedMonth) params.set('month', selectedMonth.toISOString());

    if (filters.search && filters.search !== 'undefined') params.set('search', filters.search);
    if (filters.company && filters.company !== 'all' && filters.company !== 'undefined') {
      params.set('company', filters.company);
    }
    if (filters.branch && filters.branch !== 'all' && filters.branch !== 'undefined') {
      params.set('branch', filters.branch);
    }
    if (filters.shift && filters.shift !== 'all' && filters.shift !== 'undefined') {
      params.set('shift', filters.shift);
    }
    if (filters.position && filters.position !== 'all' && filters.position !== 'undefined') {
      params.set('position', filters.position);
    }

    setSearchParams(params, { replace: true });
  }, [currentPage, pageSize, filters, setSearchParams, selectedMonth]);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handlePageSizeChange = useCallback((value) => {
    const num = Number(value) || 10;
    setPageSize(num);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleMonthChange = useCallback((newMonth) => {
    setSelectedMonth(newMonth);
  }, []);

  const handleEdit = useCallback((exception) => {
    if (!exception?.id && !exception?.date) return;
    setSelectedException(exception);
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((exception) => {
    if (!exception?.employee_id) return;

    const hasDate = exception?.date || exception?.from_date;
    if (!hasDate) {
      console.error('No date found for exception deletion', exception);
      return;
    }

    setSelectedException(exception);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!selectedException?.employee_id) return;

    const fromDate = selectedException.from_date || selectedException.date;
    const toDate = selectedException.to_date || selectedException.date || fromDate;

    if (!fromDate || !toDate) {
      console.error('Both from_date and to_date are required for deletion', selectedException);
      return;
    }

    deleteMutation.mutate(
      {
        id: selectedException.id,
        employee_id: selectedException.employee_id,
        from_date: fromDate,
        to_date: toDate,
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: exceptionsKeys.lists(),
            exact: false,
          });

          setIsDeleteDialogOpen(false);
          setSelectedException(null);
        },
        onError: (error) => {
          console.error('Delete failed:', error);
        },
      }
    );
  }, [deleteMutation, queryClient, selectedException]);

  const columns = useMemo(
    () => getExceptionsColumns(handleEdit, handleDelete, positions, t, isArabic),
    [handleEdit, handleDelete, positions, t, isArabic]
  );

  const tableData = useMemo(() => {
    return exceptionsData?.data || [];
  }, [exceptionsData]);

  const paginationData = exceptionsData?.meta || {};
  const totalPages = paginationData?.last_page || 1;

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
    getRowId: (row) =>
      row?.id != null
        ? `schedule-override-${row.id}`
        : `schedule-override-${row.employee_id}-${row.from_date ?? row.date}-${row.to_date ?? row.date}`,
  });

  return (
    <div dir={dir} className={`space-y-4 md:space-y-6 ${isArabic ? 'text-right' : 'text-left'}`}>
      <MonthNavigation date={selectedMonth} onDateChange={handleMonthChange} />

      <ExceptionsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onAddClick={() => setIsAddDialogOpen(true)}
      />

      <div className="flex items-center justify-between">
        <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
      </div>

      <ExceptionsTable table={table} columns={columns} isLoading={isLoading || isFetching} />

      <Pagination
        table={table}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <AddExceptionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        submitting={create.isPending}
        onSubmit={(payload) => {
          create.mutate(payload, {
            onSuccess: async () => {
              await queryClient.invalidateQueries({
                queryKey: exceptionsKeys.lists(),
                exact: false,
              });

              setIsAddDialogOpen(false);
            },
          });
        }}
      />

      <EditExceptionDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        exception={selectedException}
        submitting={update.isPending}
        onSubmit={(payload) => {
          const originalEmployeeId = selectedException?.employee_id;
          const originalFromDate = selectedException?.from_date || selectedException?.date;
          const originalToDate = selectedException?.to_date || selectedException?.date;

          if (!originalEmployeeId || !originalFromDate || !originalToDate) return;

          const employeeIds =
            payload.employee_ids && payload.employee_ids.length > 0
              ? [...new Set([String(originalEmployeeId), ...payload.employee_ids])]
              : [String(originalEmployeeId)];

          const apiPayload = {
            employee_id: String(originalEmployeeId),
            employee_ids: employeeIds,
            from_date: payload.from_date || originalFromDate,
            to_date: payload.to_date || originalToDate,
            data: payload.data,
          };

          update.mutate(apiPayload, {
            onSuccess: async () => {
              await queryClient.invalidateQueries({
                queryKey: exceptionsKeys.lists(),
                exact: false,
              });

              setIsEditDialogOpen(false);
              setSelectedException(null);
            },
          });
        }}
      />

      <DeleteExceptionDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        exception={selectedException}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}