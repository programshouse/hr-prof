import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { Pagination } from '@/components/ui/Pagination';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { MonthNavigation } from '../components/MonthNavigation';
import { FingerprintIssuesFilters } from '../components/FingerprintIssuesFilters';
import { FingerprintIssuesTable } from '../components/FingerprintIssuesTable';
import { getFingerprintIssuesColumns } from '../components/fingerprintIssuesColumns.jsx';

import { EditAttendanceDialog } from '@/features/attendance/components/EditAttendanceDialog';
import { DeleteAttendanceDialog } from '@/features/attendance/components/DeleteAttendanceDialog';
import { useFingerprintIssuesQuery } from '../hooks/useFingerprintIssuesQuery';
import { fingerprintIssuesApi } from '../api/fingerprintIssues.api';
import { useAllPositions } from '@/shared/hooks/useAllPositions';

const toHHmm = (v) => {
  if (!v) return '';
  const s = String(v).trim();
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s.slice(0, 5);
  if (/^\d{2}:\d{2}$/.test(s)) return s;
  if (s.includes('T')) {
    const d = new Date(s);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return s.slice(0, 5);
};

export default function FingerprintIssuesPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const getCurrentMonthYear = () => {
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    const dateParam = searchParams.get('date');

    if (monthParam && yearParam) {
      const m = Number(monthParam);
      const y = Number(yearParam);
      const d = new Date(y, m - 1, 1);
      return { month: m, year: y, date: d };
    }

    const d = dateParam ? new Date(dateParam) : new Date();
    return { month: d.getMonth() + 1, year: d.getFullYear(), date: d };
  };

  const { month, year, date } = getCurrentMonthYear();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFingerprintIssue, setSelectedFingerprintIssue] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create mutation for when attendance doesn't exist
  const createMutation = useMutation({
    mutationFn: fingerprintIssuesApi.createAttendance,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['fingerprint-issues'] });
      toast.success(data.message || t('fingerprintIssues.attendanceCreated'));
      setIsEditDialogOpen(false);
      setSelectedFingerprintIssue(null);
    },
    onError: (error) => {
      const message = error?.response?.data?.message || t('fingerprintIssues.failedToCreate');
      toast.error(message);
      console.error('Create failed:', error);
    },
  });

  // Update mutation using the same pattern as the attendance page
  const updateMutation = useMutation({
    mutationFn: fingerprintIssuesApi.updateAttendance,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['fingerprint-issues'] });
      toast.success(data.message || t('fingerprintIssues.attendanceUpdated'));
      setIsEditDialogOpen(false);
      setSelectedFingerprintIssue(null);
    },
    onError: (error) => {
      // If attendance not found (404), don't show error - it will be handled in onSubmit by creating
      const status = error?.response?.status;
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || '';
      if (status === 404 || errorMessage.includes('Attendance not found')) {
        // Error will be handled in onSubmit by creating instead
        return;
      }
      const message = error?.response?.data?.message || t('fingerprintIssues.failedToUpdate');
      toast.error(message);
      console.error('Update failed:', error);
      console.error('Error response:', error.response?.data);
    },
  });

  const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(() => Number(searchParams.get('pageSize')) || 20);

  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    company: searchParams.get('company') || 'all',
    branch: searchParams.get('branch') || 'all',
    shift: searchParams.get('shift') || 'all',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
  }));

  const { data: allPositions } = useAllPositions();

  const { data: fingerprintIssuesData, isLoading } = useFingerprintIssuesQuery(
    month,
    year,
    currentPage,
    pageSize,
    filters
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.company, filters.branch, filters.shift, filters.from, filters.to]);

  const handlePageSizeChange = (value) => {
    const num = Number(value) || 10;
    setPageSize(num);
    setCurrentPage(1);
    // Invalidate query to force refetch with new page size
    queryClient.invalidateQueries({ queryKey: ['fingerprint-issues'] });
  };

  useEffect(() => {
    const params = new URLSearchParams();

    if (month) params.set('month', String(month));
    if (year) params.set('year', String(year));
    if (currentPage > 1) params.set('page', String(currentPage));
    if (pageSize) params.set('pageSize', String(pageSize));

    if (filters.search) params.set('search', filters.search);
    if (filters.company && filters.company !== 'all')
      params.set('company', String(filters.company));
    if (filters.branch && filters.branch !== 'all') params.set('branch', String(filters.branch));
    if (filters.shift && filters.shift !== 'all') params.set('shift', String(filters.shift));
    if (filters.from) params.set('from', String(filters.from));
    if (filters.to) params.set('to', String(filters.to));

    setSearchParams(params);
  }, [month, year, currentPage, pageSize, filters, setSearchParams]);

  const handlePageChange = (newPage) => {
    const totalPages =
      fingerprintIssuesData?.meta?.last_page || fingerprintIssuesData?.pagination?.last_page || 1;

    const safe = Math.min(Math.max(1, newPage), totalPages);
    setCurrentPage(safe);
  };

  const handleDateChange = (newDate) => {
    const params = new URLSearchParams(searchParams);
    params.set('month', String(newDate.getMonth() + 1));
    params.set('year', String(newDate.getFullYear()));
    params.delete('date');
    setSearchParams(params);
  };

  const handleEdit = useCallback((fingerprintIssue) => {
    setSelectedFingerprintIssue(fingerprintIssue);
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((fingerprintIssue) => {
    setSelectedFingerprintIssue(fingerprintIssue);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!selectedFingerprintIssue) return;

    setIsDeleting(true);
    try {
      const employee_id =
        selectedFingerprintIssue.employee_id || selectedFingerprintIssue.employee?.id;
      const date =
        selectedFingerprintIssue.date ||
        (selectedFingerprintIssue.first_in_at
          ? new Date(selectedFingerprintIssue.first_in_at).toISOString().slice(0, 10)
          : undefined);

      await fingerprintIssuesApi.deleteAttendance({ employee_id, date, delete_logs: false });
      toast.success(t('fingerprintIssues.attendanceDeleted'));
      setIsDeleteDialogOpen(false);
      setSelectedFingerprintIssue(null);
      await queryClient.invalidateQueries({ queryKey: ['fingerprint-issues'] });
    } catch (error) {
      console.error('Delete failed:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo(
    () => getFingerprintIssuesColumns(handleEdit, handleDelete, allPositions, t),
    [handleEdit, handleDelete, allPositions, t]
  );

  const rows = fingerprintIssuesData?.data || fingerprintIssuesData?.items || [];
  const lastPage =
    fingerprintIssuesData?.meta?.last_page || fingerprintIssuesData?.pagination?.last_page || 1;

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: lastPage,
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <MonthNavigation date={date} onDateChange={handleDateChange} />

      <FingerprintIssuesFilters month={month} year={year} filters={filters} onFiltersChange={setFilters} />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} options={[10, 20, 50, 100]} />
        </div>

        <FingerprintIssuesTable table={table} columns={columns} isLoading={isLoading} />

        <Pagination
          table={table}
          currentPage={currentPage}
          totalPages={lastPage}
          onPageChange={handlePageChange}
        />
      </div>

      <EditAttendanceDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        disableDate // ✅ IMPORTANT: prevent date change
        isSubmitting={updateMutation.isPending || createMutation.isPending}
        attendance={
          selectedFingerprintIssue
            ? {
                employee_id: selectedFingerprintIssue.employee_id,
                employee: {
                  code: selectedFingerprintIssue.employee_code,
                  name: selectedFingerprintIssue.employee_name,
                  shift: selectedFingerprintIssue.employee?.shift || '',
                },
                date: selectedFingerprintIssue.date,
                check_in: selectedFingerprintIssue.first_in_at,
                check_out: selectedFingerprintIssue.last_out_at,
              }
            : null
        }
        onSubmit={async (payload) => {
          if (!selectedFingerprintIssue) return;

          const existingIn = toHHmm(selectedFingerprintIssue.first_in_at);
          const existingOut = toHHmm(selectedFingerprintIssue.last_out_at);

          const checkIn = toHHmm(payload.check_in) || existingIn;
          const checkOut = toHHmm(payload.check_out) || existingOut;

          if (!checkIn || !checkOut) {
            toast.error(t('fingerprintIssues.checkInOutRequired'));
            return;
          }

          // Format the data to match what the API expects
          const dataToSend = {
            employee_id: selectedFingerprintIssue.employee_id,
            employee_code: selectedFingerprintIssue.employee_code,
            date: selectedFingerprintIssue.date,
            check_in: checkIn,
            check_out: checkOut,
            shift: payload.shift || selectedFingerprintIssue.employee?.shift || '1',
          };

          const attendanceId =
            selectedFingerprintIssue.attendance_id || selectedFingerprintIssue.id;

          // If no attendance_id exists, create new attendance
          if (!attendanceId) {
            createMutation.mutate(dataToSend);
            return;
          }

          // Try to update first
          try {
            await updateMutation.mutateAsync({
              id: attendanceId,
              data: { ...dataToSend, _method: 'PATCH' },
            });
          } catch (error) {
            // If attendance not found, create instead
            const errorMessage =
              error?.response?.data?.error || error?.response?.data?.message || '';
            if (error.response?.status === 404 || errorMessage.includes('Attendance not found')) {
              createMutation.mutate(dataToSend);
            }
            // Otherwise, error is already handled by mutation's onError
          }
        }}
      />

      <DeleteAttendanceDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        attendance={selectedFingerprintIssue}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
