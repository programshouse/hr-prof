// src/features/attendance/pages/AttendancePage.jsx
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/Pagination';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { DateNavigation } from '../components/DateNavigation';
import { SummaryCards } from '../components/SummaryCards';
import { AttendanceFilters } from '../components/AttendanceFilters';
import { AttendanceTable } from '../components/AttendanceTable';
import { AddAttendanceDialog } from '../components/AddAttendanceDialog';
import { EditAttendanceDialog } from '../components/EditAttendanceDialog';
import { DeleteAttendanceDialog } from '../components/DeleteAttendanceDialog';
import { ImportFingerprintDialog } from '../components/ImportFingerprintDialog';
import { getAttendanceColumns } from '../components/attendanceColumns';
import { useAttendanceQuery } from '../hooks/useAttendanceQuery';
import { useDailySummaryCards } from '../hooks/useDailySummaryCards';
import { useUpsertAttendance } from '../hooks/useUpsertAttendance';
import { useDeleteAttendance } from '../hooks/useDeleteAttendance';
import { attendanceKeys } from '../api/attendance.keys';

export default function AttendancePage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // ---- init from URL ----
  const getDateFromParams = useCallback(() => {
    // Always use current date on page load to ensure dynamic dates on refresh
    return new Date();
  }, []);

  const [date, setDate] = useState(getDateFromParams);

  const [currentPage, setCurrentPage] = useState(() => {
    const p = Number(searchParams.get('page'));
    return Number.isFinite(p) && p > 0 ? p : 1;
  });

  const [pageSize, setPageSize] = useState(() => {
    const ps = Number(searchParams.get('pageSize'));
    return Number.isFinite(ps) && ps > 0 ? ps : 20;
  });

  const [filters, setFilters] = useState(() => ({
    keyword: searchParams.get('keyword') || searchParams.get('search') || '',
    department: searchParams.get('department') || 'all',
    branch: searchParams.get('branch') || 'all',
  }));

  // ---- dialogs ----
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  // ---- queries ----
  const { data: attendanceData, isLoading } = useAttendanceQuery(
    date,
    currentPage,
    filters.department,
    filters.keyword,
    filters.branch,
    pageSize
  );

  const { data: cardsData } = useDailySummaryCards({
    fromDate: date,
    toDate: date,
    branch: filters.branch,
  });

  const { create, update } = useUpsertAttendance();
  const deleteMutation = useDeleteAttendance();

  // ---- persist branch ----
  useEffect(() => {
    const storedBranch = localStorage.getItem('selectedBranch');
    if (storedBranch) {
      setFilters((prev) => ({ ...prev, branch: storedBranch }));
    }
  }, []);

  useEffect(() => {
    if (filters.branch && filters.branch !== 'all') {
      localStorage.setItem('selectedBranch', filters.branch);
    } else {
      localStorage.removeItem('selectedBranch');
    }
  }, [filters.branch]);

  // ---- reset page when criteria changes ----
  useEffect(() => {
    setCurrentPage(1);
  }, [date, filters.department, filters.keyword, filters.branch, pageSize]);

  // ---- sync URL ----
  useEffect(() => {
    const params = new URLSearchParams();

    if (date && date instanceof Date && !isNaN(date)) {
      params.set('date', date.toISOString().split('T')[0]);
    }

    if (currentPage > 1) params.set('page', String(currentPage));
    if (pageSize) params.set('pageSize', String(pageSize));

    if (filters.keyword && filters.keyword !== 'undefined') {
      params.set('keyword', filters.keyword);
    }

    if (
      filters.department &&
      filters.department !== 'all' &&
      filters.department !== 'undefined'
    ) {
      params.set('department', filters.department);
    }

    if (filters.branch && filters.branch !== 'all' && filters.branch !== 'undefined') {
      params.set('branch', filters.branch);
    }

    setSearchParams(params, { replace: true });
  }, [date, currentPage, pageSize, filters, setSearchParams]);

  // ---- handlers ----
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handlePageSizeChange = useCallback(
    (value) => {
      const num = Number(value) || 10;
      setPageSize(num);
      setCurrentPage(1);
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
    },
    [queryClient]
  );

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleDateChange = useCallback((newDate) => {
    setDate(newDate);
  }, []);

  const handleEdit = useCallback((attendance) => {
    // extra safety: don't open edit for rows without attendance_id
    if (!attendance?.attendance_id) return;
    setSelectedAttendance(attendance);
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((attendance) => {
    // extra safety: don't open delete for rows without attendance_id
    if (!attendance?.attendance_id) return;
    setSelectedAttendance(attendance);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleImportClick = useCallback(() => {
    setIsImportDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!selectedAttendance?.attendance_id) return;

    const employeeId =
      selectedAttendance?.employee?.id ||
      selectedAttendance?.employee_id ||
      selectedAttendance?.id;

    const dateFromRow =
      selectedAttendance?.date ||
      selectedAttendance?.day ||
      (selectedAttendance?.check_in
        ? new Date(selectedAttendance.check_in).toISOString().slice(0, 10)
        : undefined);

    const dateStr =
      dateFromRow || (date instanceof Date ? date.toISOString().slice(0, 10) : undefined);

    deleteMutation.mutate(
      { employee_id: employeeId, date: dateStr, delete_logs: false },
      {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedAttendance(null);
        },
      }
    );
  }, [deleteMutation, selectedAttendance, date]);

  // ---- columns ----
  const columns = useMemo(() => getAttendanceColumns(handleEdit, handleDelete, t), [
    handleEdit,
    handleDelete,
    t,
  ]);

  // ---- data (FILTER OUT rows without attendance) ----
  const tableData = useMemo(() => {
    const rawData =
      attendanceData?.data ||
      attendanceData?.attendances?.data ||
      [];
    
    return rawData.filter((row) => row?.attendance_id != null);
  }, [attendanceData]);

  const paginationData =
    attendanceData?.meta ||
    attendanceData?.attendances ||
    {};

  const totalPages = paginationData?.last_page || 1;

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Date Selection */}
      <DateNavigation
        date={date}
        onDateChange={handleDateChange}
        branch={filters.branch}
      />

      {/* Summary Cards */}
      <SummaryCards
        data={
          Array.isArray(cardsData)
            ? cardsData[0]
            : cardsData?.data
              ? Array.isArray(cardsData.data)
                ? cardsData.data[0]
                : cardsData.data
              : cardsData
        }
      />

      {/* Filters */}
      <AttendanceFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onAddClick={() => setIsAddDialogOpen(true)}
        onUploadClick={handleImportClick}
      />

      {/* Page size */}
      <div className="flex items-center justify-between">
        <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
      </div>

      {/* Table */}
      <AttendanceTable table={table} columns={columns} isLoading={isLoading} />

      {/* Pagination */}
      <Pagination
        table={table}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Add */}
      <AddAttendanceDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        date={date}
        onSubmit={(data) => {
          create.mutate(data, {
            onSuccess: () => setIsAddDialogOpen(false),
          });
        }}
      />

      {/* Edit */}
      <EditAttendanceDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        attendance={selectedAttendance}
        onSubmit={(data) => {
          if (!selectedAttendance?.attendance_id) return;

          const id = selectedAttendance.attendance_id; // MUST be attendance id

          update.mutate(
            { id, data },
            {
              onSuccess: () => {
                setIsEditDialogOpen(false);
                setSelectedAttendance(null);
              },
            }
          );
        }}
      />

      {/* Delete */}
      <DeleteAttendanceDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        attendance={selectedAttendance}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />

      {/* Import */}
      <ImportFingerprintDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </div>
  );
}
