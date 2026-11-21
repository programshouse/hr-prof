import { useCallback, useMemo, useState } from 'react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { FingerprintIssuesTable } from '@/features/fingerprintIssues/components/FingerprintIssuesTable';
import { getFingerprintIssuesColumns } from '@/features/fingerprintIssues/components/fingerprintIssuesColumns.jsx';
import { EditAttendanceDialog } from '@/features/attendance/components/EditAttendanceDialog';
import { DeleteAttendanceDialog } from '@/features/attendance/components/DeleteAttendanceDialog';
import { fingerprintIssuesApi } from '@/features/fingerprintIssues/api/fingerprintIssues.api';
import { useAllPositions } from '@/shared/hooks/useAllPositions';

const toHHmm = (value) => {
  if (!value) return '';

  const raw = String(value).trim();

  if (/^\d{2}:\d{2}:\d{2}$/.test(raw)) return raw.slice(0, 5);
  if (/^\d{2}:\d{2}$/.test(raw)) return raw;

  const match = raw.match(/(?:T|\s|^)(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (match) {
    return `${String(Number(match[1])).padStart(2, '0')}:${match[2]}`;
  }

  if (raw.includes('T')) {
    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) {
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
  }

  return '';
};

function getEmployeeCode(employee) {
  return (
    employee?.employee_code ??
    employee?.code ??
    employee?.employee?.employee_code ??
    employee?.employee?.code ??
    employee?.applicant?.code ??
    ''
  );
}

function getEmployeeShift(employee) {
  const value =
    employee?.shift_id ??
    employee?.shift?.id ??
    employee?.employee?.shift_id ??
    employee?.employee?.shift?.id ??
    (typeof employee?.shift === 'string' || typeof employee?.shift === 'number'
      ? employee.shift
      : '');

  return value == null ? '' : String(value);
}

function getRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
}

function belongsToEmployee(issue, employeeId, employeeCode) {
  const issueEmployeeId = issue?.employee_id ?? issue?.employee?.id ?? issue?.attendance?.employee_id;

  if (issueEmployeeId != null && issueEmployeeId !== '') {
    return String(issueEmployeeId) === String(employeeId);
  }

  const issueEmployeeCode = issue?.employee_code ?? issue?.employee?.code;
  if (issueEmployeeCode && employeeCode) {
    return String(issueEmployeeCode) === String(employeeCode);
  }

  // The request itself is employee-scoped. Keep rows when the response
  // doesn't repeat employee_id/employee_code on each record.
  return true;
}

export default function EmployeeFingerprintIssuesCrudModal({
  employeeId,
  employee,
  employeeName,
  month,
  year,
}) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const isArabic = i18n.language?.startsWith('ar');

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFingerprintIssue, setSelectedFingerprintIssue] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const employeeCode = getEmployeeCode(employee);
  const employeeShift = getEmployeeShift(employee);
  const { data: allPositions } = useAllPositions();

  // Same idea as EmployeeAllRequests: this query is scoped to ONE employee.
  //
  // Unlike leaves/loans/holidays/etc., the finger-print-issues endpoint has
  // never been called anywhere in this app without month/year — the main
  // FingerprintIssuesPage hook (`useFingerprintIssuesQuery`) sets
  // `enabled: !!month && !!year`, so month/year have always been required on
  // every real request that's ever hit this route. Calling it with
  // month/year omitted 422s, so we keep them and scope this modal to the
  // month currently open on the overtime sheet rather than "all time".
  // If the backend is updated to make month/year optional when employee_id
  // is present (matching how leaves/loans/holidays behave), these two args
  // can be dropped to show the employee's full history instead.
  //
  // `limit` is capped server-side at 200 (confirmed via 422: "The limit
  // field must not be greater than 200."), so a single employee/month is
  // always well under that and one page is enough.
  const FINGERPRINT_ISSUES_MAX_LIMIT = 200;

  const issuesQuery = useQuery({
    queryKey: ['fingerprint-issues', 'employee', String(employeeId), year, month],
    queryFn: () =>
      fingerprintIssuesApi.getFingerprintIssues(month, year, 1, FINGERPRINT_ISSUES_MAX_LIMIT, {
        employee_id: employeeId,
        employee_code: employeeCode || undefined,
      }),
    enabled: Boolean(employeeId) && Boolean(month) && Boolean(year),
    staleTime: 0,
  });

  const rows = useMemo(
    () =>
      getRows(issuesQuery.data).filter((issue) =>
        belongsToEmployee(issue, employeeId, employeeCode)
      ),
    [issuesQuery.data, employeeId, employeeCode]
  );

  const refreshRelatedData = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['fingerprint-issues'] }),
      queryClient.invalidateQueries({ queryKey: ['overtimeSheet'] }),
      queryClient.invalidateQueries({ queryKey: ['overtimeSheetEmployee'] }),
      queryClient.invalidateQueries({ queryKey: ['employeePayrollSheet'] }),
    ]);
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: fingerprintIssuesApi.createAttendance,
    onSuccess: async (data) => {
      toast.success(
        data?.message || t('fingerprintIssues.attendanceCreated', 'Attendance created successfully')
      );
      setIsEditDialogOpen(false);
      setSelectedFingerprintIssue(null);
      await refreshRelatedData();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          t('fingerprintIssues.failedToCreate', 'Failed to create attendance')
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: fingerprintIssuesApi.updateAttendance,
    onSuccess: async (data) => {
      toast.success(
        data?.message || t('fingerprintIssues.attendanceUpdated', 'Attendance updated successfully')
      );
      setIsEditDialogOpen(false);
      setSelectedFingerprintIssue(null);
      await refreshRelatedData();
    },
    onError: (error) => {
      const status = error?.response?.status;
      const message = error?.response?.data?.error || error?.response?.data?.message || '';

      if (status === 404 || message.includes('Attendance not found')) return;

      toast.error(message || t('fingerprintIssues.failedToUpdate', 'Failed to update attendance'));
    },
  });

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

    const issueEmployeeId =
      selectedFingerprintIssue.employee_id || selectedFingerprintIssue.employee?.id || employeeId;
    const issueDate =
      selectedFingerprintIssue.date ||
      (selectedFingerprintIssue.first_in_at
        ? String(selectedFingerprintIssue.first_in_at).slice(0, 10)
        : '');

    if (!issueEmployeeId || !issueDate) {
      toast.error(t('common.error', 'Something went wrong'));
      return;
    }

    setIsDeleting(true);

    try {
      const data = await fingerprintIssuesApi.deleteAttendance({
        employee_id: issueEmployeeId,
        date: issueDate,
        delete_logs: false,
      });

      toast.success(
        data?.message || t('fingerprintIssues.attendanceDeleted', 'Attendance deleted successfully')
      );
      setIsDeleteDialogOpen(false);
      setSelectedFingerprintIssue(null);
      await refreshRelatedData();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          t('common.error', 'Something went wrong')
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo(
    () => getFingerprintIssuesColumns(handleEdit, handleDelete, allPositions, t),
    [handleEdit, handleDelete, allPositions, t]
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const editAttendanceModel = selectedFingerprintIssue
    ? {
        employee_id: selectedFingerprintIssue.employee_id || Number(employeeId),
        employee: {
          id: Number(employeeId),
          code:
            selectedFingerprintIssue.employee_code || employeeCode || String(employeeId || ''),
          name:
            selectedFingerprintIssue.employee_name ||
            employeeName ||
            employee?.name ||
            employee?.full_name ||
            '',
          shift: selectedFingerprintIssue.employee?.shift || employeeShift,
        },
        date: selectedFingerprintIssue.date,
        check_in: selectedFingerprintIssue.first_in_at,
        check_out: selectedFingerprintIssue.last_out_at,
        shift: selectedFingerprintIssue.employee?.shift || employeeShift,
      }
    : null;

  return (
    <div className="space-y-4" dir={isArabic ? 'rtl' : 'ltr'}>
      <FingerprintIssuesTable
        table={table}
        columns={columns}
        isLoading={issuesQuery.isLoading}
      />

      <EditAttendanceDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setSelectedFingerprintIssue(null);
        }}
        disableDate
        isSubmitting={updateMutation.isPending || createMutation.isPending}
        attendance={editAttendanceModel}
        onSubmit={async (payload) => {
          if (!selectedFingerprintIssue) return;

          const existingIn = toHHmm(selectedFingerprintIssue.first_in_at);
          const existingOut = toHHmm(selectedFingerprintIssue.last_out_at);
          const checkIn = toHHmm(payload.check_in) || existingIn;
          const checkOut = toHHmm(payload.check_out) || existingOut;

          if (!checkIn || !checkOut) {
            toast.error(
              t('fingerprintIssues.checkInOutRequired', 'Check-in and check-out are required')
            );
            return;
          }

          const dataToSend = {
            employee_id: selectedFingerprintIssue.employee_id || Number(employeeId),
            employee_code: selectedFingerprintIssue.employee_code || employeeCode || undefined,
            date: selectedFingerprintIssue.date,
            check_in: checkIn,
            check_out: checkOut,
            shift: payload.shift || selectedFingerprintIssue.employee?.shift || employeeShift || '1',
          };

          const attendanceId =
            selectedFingerprintIssue.attendance_id || selectedFingerprintIssue.id;

          if (!attendanceId) {
            createMutation.mutate(dataToSend);
            return;
          }

          try {
            await updateMutation.mutateAsync({
              id: attendanceId,
              data: dataToSend,
            });
          } catch (error) {
            const status = error?.response?.status;
            const message = error?.response?.data?.error || error?.response?.data?.message || '';

            if (status === 404 || message.includes('Attendance not found')) {
              createMutation.mutate(dataToSend);
            }
          }
        }}
      />

      <DeleteAttendanceDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setSelectedFingerprintIssue(null);
        }}
        attendance={selectedFingerprintIssue}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
