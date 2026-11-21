// src/features/attendance/components/MonthlySummary.jsx
import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { Pagination } from '@/components/ui/Pagination';
import { MonthNavigation } from '@/features/fingerprintIssues/components/MonthNavigation.jsx';
import { AddExceptionDialog } from '@/features/exceptions/components/AddExceptionDialog';
import { useUpsertException } from '@/features/exceptions/hooks/useUpsertException';
import { startOfMonth, parseISO, format } from 'date-fns';
import { useMonthlySummary } from '../hooks/useMonthlySummary';

function formatTimeTo12h(timeStr, language = 'en') {
  if (!timeStr) return '--';
  const [hours, minutes] = String(timeStr).split(':');
  const h = parseInt(hours, 10);
  if (Number.isNaN(h)) return timeStr;
  const isAr = String(language).startsWith('ar');
  const suffix = h >= 12 ? (isAr ? 'م' : 'PM') : (isAr ? 'ص' : 'AM');
  const h12 = h % 12 || 12;
  return `${h12}:${(minutes || '00').slice(0, 2)} ${suffix}`;
}

function StatusBadge({ status, t }) {
  const base = 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium';

  const statusLower = String(status || '').toLowerCase().replace(/_/g, '');

  // Map status to translation key
  const statusMap = {
    present: 'present',
    attend: 'attend',
    attendance: 'present',
    attended: 'present',
    absent: 'absent',
    weekend: 'weekend',
    officialholiday: 'officialHoliday',
    future: 'future',
    leaveapproved: 'leaveApproved',
    leavepending: 'leavePending',
    permissionapproved: 'permissionApproved',
    permissionpending: 'permissionPending',
    missingpunch: 'missingPunch',
    sickleave: 'sickLeave',
    leave: 'leave',
  };

  const translationKey = statusMap[statusLower];
  const label = translationKey ? t(`attendance.attendanceSheet.${translationKey}`) : (status || '--');

  if (
    statusLower === 'present' ||
    statusLower === 'attend' ||
    statusLower === 'attendance' ||
    statusLower === 'attended'
  ) {
    return <Badge className={`${base} bg-green-100 text-green-700`}>{label}</Badge>;
  }
  if (statusLower === 'absent') {
    return <Badge className={`${base} bg-red-100 text-red-600`}>{label}</Badge>;
  }
  if (statusLower === 'weekend') {
    return <Badge className={`${base} bg-yellow-100 text-yellow-700`}>{label}</Badge>;
  }
  if (statusLower === 'officialholiday') {
    return <Badge className={`${base} bg-purple-100 text-purple-700`}>{label}</Badge>;
  }
  if (statusLower === 'future') {
    return <Badge className={`${base} bg-gray-100 text-gray-600`}>{label}</Badge>;
  }
  if (statusLower === 'leaveapproved') {
    return <Badge className={`${base} bg-blue-100 text-blue-700`}>{label}</Badge>;
  }
  if (statusLower === 'leavepending') {
    return <Badge className={`${base} bg-orange-100 text-orange-700`}>{label}</Badge>;
  }
  if (statusLower === 'permissionapproved') {
    return <Badge className={`${base} bg-teal-100 text-teal-700`}>{label}</Badge>;
  }
  if (statusLower === 'permissionpending') {
    return <Badge className={`${base} bg-amber-100 text-amber-700`}>{label}</Badge>;
  }
  if (statusLower === 'missingpunch') {
    return <Badge className={`${base} bg-red-100 text-red-700`}>{label}</Badge>;
  }
  if (statusLower === 'sickleave' || statusLower === 'sick leave' || statusLower === 'sick_leave') {
    return <Badge className={`${base} bg-orange-100 text-orange-700`}>{label}</Badge>;
  }
  if (statusLower === 'leave') {
    return <Badge className={`${base} bg-blue-100 text-blue-700`}>{label}</Badge>;
  }

  return <Badge className={`${base} bg-slate-100 text-slate-600`}>{label}</Badge>;
}

function toMonthDate(month) {
  if (!month) return startOfMonth(new Date());
  if (month instanceof Date) return startOfMonth(month);
  if (typeof month === 'string' && /^\d{4}-\d{2}$/.test(month)) {
    return parseISO(`${month}-01`);
  }
  return startOfMonth(new Date(month));
}

export default function MonthlySummary({ employeeId, month, onMonthChange, data: dataProp }) {
  const { t, i18n } = useTranslation();

  const translateDayName = (dayName) => {
    if (!dayName) return '--';
    const key = String(dayName).toLowerCase().trim();
    const map = { monday: 'monday', tuesday: 'tuesday', wednesday: 'wednesday', thursday: 'thursday', friday: 'friday', saturday: 'saturday', sunday: 'sunday' };
    return map[key] ? t(`common.daysOfWeek.${map[key]}`) : dayName;
  };

  const translateType = (type) => {
    if (!type) return '--';
    const key = String(type).toLowerCase().trim();
    if (key === 'computed') return t('attendance.attendanceSheet.computed');
    if (key === 'attendance') return t('attendance.attendanceSheet.typeAttendance');
    return type;
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [exceptionOpen, setExceptionOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const { create } = useUpsertException();

  const monthDate = useMemo(() => toMonthDate(month), [month]);
  const monthStr = useMemo(() => format(monthDate, 'yyyy-MM'), [monthDate]);

  // Call summury-monthly-sheet API when employeeId and month are provided
  const { data: fetchedData, isLoading } = useMonthlySummary(
    employeeId ? String(employeeId) : undefined,
    monthStr
  );

  // Use fetched data when we have employeeId + month; otherwise use data prop (e.g. from dialog)
  const data = (employeeId && monthStr ? fetchedData : dataProp) ?? dataProp;
  const summaryData = data?.data ?? data;
  const employeeIdFromResponse = summaryData?.employee_id;

  // Show all rows for the selected month (API returns month-scoped data)
  const filteredRows = useMemo(() => {
    return summaryData?.rows ?? [];
  }, [summaryData]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredRows.slice(startIndex, endIndex);
  }, [filteredRows, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRows.length / pageSize);

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const handleMonthChange = (newDate) => {
    setCurrentPage(1);
    onMonthChange?.(newDate);
  };

  const handleOpenException = (row) => {
    if (row.status !== 'present') return;
    setSelectedRow(row);
    setExceptionOpen(true);
  };

  const handleSubmitException = (payload) => {
    create.mutate(payload, {
      onSuccess: () => {
        setExceptionOpen(false);
        setSelectedRow(null);
      },
    });
  };

  const exceptionInitialValues = useMemo(() => {
    if (!selectedRow || !employeeIdFromResponse) return null;

    return {
      employee_ids: [String(employeeIdFromResponse)],
      from_date: selectedRow.date || '',
      to_date: selectedRow.date || '',
      start_time: selectedRow.check_in ? String(selectedRow.check_in).slice(0, 5) : '',
      end_time: selectedRow.check_out ? String(selectedRow.check_out).slice(0, 5) : '',
      reason: '',
    };
  }, [selectedRow, employeeIdFromResponse]);

  return (
    <div className="space-y-6">
      {/* Attendance Table */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {onMonthChange && (
            <MonthNavigation
              date={monthDate}
              onDateChange={handleMonthChange}
              disableFutureMonths={false}
            />
          )}

          <div className="flex items-center gap-2">
            <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold text-slate-500">
                  {t('attendance.attendanceSheet.date')}
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  {t('attendance.attendanceSheet.day')}
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  {t('attendance.attendanceSheet.checkIn')}
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  {t('attendance.attendanceSheet.checkOut')}
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  {t('attendance.attendanceSheet.status')}
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  {t('attendance.attendanceSheet.type')}
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  {t('attendance.attendanceSheet.source')}
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">
                  {t('attendance.attendanceSheet.exception')}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && employeeId ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-slate-500">
                    {t('attendance.attendanceSheet.loading')}
                  </TableCell>
                </TableRow>
              ) : paginatedRows.length > 0 ? (
                paginatedRows.map((row, index) => (
                  <TableRow key={index} className="hover:bg-slate-50">
                    <TableCell className="text-sm font-medium">{row.date}</TableCell>
                    <TableCell className="text-sm">{translateDayName(row.day_name)}</TableCell>
                    <TableCell className="text-sm">{formatTimeTo12h(row.check_in, i18n.language)}</TableCell>
                    <TableCell className="text-sm">{formatTimeTo12h(row.check_out, i18n.language)}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} t={t} />
                    </TableCell>
                    <TableCell className="text-sm">{translateType(row.type)}</TableCell>
                    <TableCell className="text-sm">{row.source || '--'}</TableCell>
                    <TableCell>
                      {row.status === 'present' ? (
                        <Button
                          type="button"
                          variant="default"
                          size="icon"
                          onClick={() => handleOpenException(row)}
                          title={t('attendance.attendanceSheet.addException')}
                        >
                          <Plus />
                        </Button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-slate-500">
                    {t('attendance.attendanceSheet.noData')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <AddExceptionDialog
        open={exceptionOpen}
        onOpenChange={setExceptionOpen}
        onSubmit={handleSubmitException}
        initialValues={exceptionInitialValues}
        lockEmployeeSelection
        submitting={create.isPending}
      />
    </div>
  );
}
