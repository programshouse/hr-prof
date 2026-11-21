// src/features/attendance/pages/EmployeeAttendancePage.jsx
import { useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { startOfMonth } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { buildAvatarUrl } from '@/lib/utils/avatarUtils';

import { useAttendanceQuery } from '../hooks/useAttendanceQuery';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { Pagination } from '@/components/ui/Pagination';
import MonthlySummary from '../components/MonthlySummary';
import { employeeProfileApi } from '@/features/employees/api/employeeProfile.api';
import { getHeaderEmployeeData } from '@/features/employees/pages/employeesUtils';
import { useAllShifts } from '@/shared/hooks';

import { EmptyState } from '@/components/error/EmptyState';

// Fetch employee profile for header (same API as employee details page)
const useEmployeeHeaderQuery = (employeeId) => {
  return useQuery({
    queryKey: ['employeeProfile', employeeId],
    queryFn: () => employeeProfileApi.getEmployeeProfile(employeeId),
    enabled: !!employeeId,
    select: (res) => res?.data?.employee ?? res?.data ?? res ?? null,
    retry: false,
    onError: (error) => {
      // Silently handle errors without showing toasts
      console.error(t('common.errors.failedToLoad'), error);
    },
  });
};

function toApiDate(d) {
  if (!d) return '';
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d);
}

// normalize different API shapes into the fields we need
function mapAttendanceRow(r) {
  const day =
    r?.day ||
    r?.day_name ||
    r?.weekday ||
    r?.dayOfWeek ||
    r?.attendance_day ||
    '--';

  const date =
    r?.date ||
    r?.day_date ||
    r?.attendance_date ||
    r?.created_at ||
    '--';

  const checkIn =
    r?.check_in ||
    r?.checkIn ||
    r?.checkin ||
    r?.in_time ||
    r?.time_in ||
    '--';

  const checkOut =
    r?.check_out ||
    r?.checkOut ||
    r?.checkout ||
    r?.out_time ||
    r?.time_out ||
    '--';

  const statusRaw = r?.status || r?.attendance_status || r?.state || r?.type || '';

  return {
    day: String(day),
    date: String(date),
    checkIn: checkIn ? String(checkIn) : '--',
    checkOut: checkOut ? String(checkOut) : '--',
    status: String(statusRaw || ''),
  };
}

export default function EmployeeAttendancePage() {
  const { t } = useTranslation();

  function StatusBadge({ status }) {
    const base = 'inline-flex items-center rounded-md px-3 py-1 text-xs font-medium';
    const s = String(status || '').toLowerCase();

    if (['present', 'attend', 'attendance', 'attended'].includes(s)) {
      return <span className={`${base} bg-blue-100 text-blue-700`}>{t('attendance.attendanceSheet.present')}</span>;
    }
    if (s === 'absent') {
      return <span className={`${base} bg-red-100 text-red-600`}>{t('attendance.attendanceSheet.absent')}</span>;
    }
    if (s === 'weekend') {
      return <span className={`${base} bg-yellow-100 text-yellow-700`}>{t('attendance.attendanceSheet.weekend')}</span>;
    }
    if (s === 'sick leave' || s === 'sickleave') {
      return <span className={`${base} bg-orange-100 text-orange-700`}>{t('attendance.attendanceSheet.sickLeave')}</span>;
    }
    if (s === 'holidays' || s === 'holiday') {
      return <span className={`${base} bg-purple-100 text-purple-700`}>{t('attendance.attendanceSheet.holidays')}</span>;
    }

    return <span className={`${base} bg-slate-100 text-slate-600`}>{status || '--'}</span>;
  }
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const monthParam = searchParams.get('month'); // expected: YYYY-MM
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split('-').map(Number);
      return startOfMonth(new Date(y, m - 1, 1));
    }
    return startOfMonth(new Date());
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const handleMonthChange = (next) => {
    setSelectedMonth(next);
    const y = next.getFullYear();
    const m = String(next.getMonth() + 1).padStart(2, '0');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('month', `${y}-${m}`);
    setSearchParams(nextParams, { replace: true });
  };

  const { data: profile, isLoading: employeeLoading } = useEmployeeHeaderQuery(employeeId);
  const { data: shifts = [] } = useAllShifts();
  const headerEmployee = useMemo(
    () => getHeaderEmployeeData(profile, shifts),
    [profile, shifts]
  );

  const { data: attendanceData, isLoading: attendanceLoading } = useAttendanceQuery(
    selectedMonth,
    currentPage,
    'all',
    employeeId,
    'all',
    pageSize
  );

  // ✅ keep only this employee rows if API returns mixed employees
  const filteredAttendanceData = useMemo(() => {
    const list = attendanceData?.data || attendanceData?.data?.data || attendanceData || [];
    if (!Array.isArray(list)) return [];

    return list.filter(
      (record) =>
        String(record.employee_id) === String(employeeId) ||
        String(record.employee?.id) === String(employeeId)
    );
  }, [attendanceData, employeeId]);

  const tableRows = useMemo(
    () => filteredAttendanceData.map(mapAttendanceRow),
    [filteredAttendanceData]
  );

  const handleGoBack = () => navigate(-1);

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  if (employeeLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="animate-pulse space-y-3">
          <div className="h-28 rounded bg-slate-200" />
          <div className="h-72 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ✅ Header like overview style */}
      <Card className="px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="h-9 w-9 text-slate-600 hover:text-slate-900"
            title={t('common.back')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <img
            src={buildAvatarUrl(headerEmployee?.name, headerEmployee?.avatarUrl)}
            alt={headerEmployee?.name || t('common.employee')}
            className="h-12 w-12 rounded-full object-cover bg-slate-100"
          />

          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-900 md:text-base">
              {headerEmployee?.employeeId || employeeId} -{' '}
              <span className="text-primary">{headerEmployee?.name || '—'}</span>
            </div>
            <div className="text-xs text-slate-500 md:text-sm">
              {headerEmployee?.role || '—'}
              <span className="mx-2 text-slate-300">|</span>
              {headerEmployee?.employmentType || t('common.dash')}
            </div>
          </div>
        </div>
      </Card>

      {/* Monthly Summary Section */}
      <MonthlySummary
        employeeId={employeeId}
        month={selectedMonth}
        onMonthChange={handleMonthChange}
      />

      {/* Pagination for main attendance records */}
      {tableRows.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(tableRows.length / pageSize)}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}