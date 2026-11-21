import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { Pagination } from '@/components/ui/Pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import AttendanceSheetDialogTrigger from '@/features/attendanceOverview/components/AttendanceSheetDialogTrigger';
import SalaryOvertimeSummaryFilters from './SalaryOvertimeSummaryFilters';
import { useSalaryOvertimeSummary } from '../../hooks/useSalaries';

function formatMonthDisplay(date, language) {
  return date.toLocaleDateString(
    language?.startsWith('ar') ? 'ar-EG' : 'en-US',
    {
      month: 'long',
      year: 'numeric',
    }
  );
}

function formatNumber(value, language) {
  const number = Number(value || 0);

  return number.toLocaleString(
    language?.startsWith('ar') ? 'ar-EG' : 'en-US',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  );
}

export default function SalaryOvertimePage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  const [searchParams, setSearchParams] = useSearchParams();

  const { month, year, date } = useMemo(() => {
    const now = new Date();

    const currentMonth =
      Number(searchParams.get('month')) || now.getMonth() + 1;
    const currentYear =
      Number(searchParams.get('year')) || now.getFullYear();

    return {
      month: currentMonth,
      year: currentYear,
      date: new Date(currentYear, currentMonth - 1, 1),
    };
  }, [searchParams]);

  const companyId = Number(searchParams.get('company_id')) || 1;
  const selectedMonth = `${year}-${String(month).padStart(2, '0')}`;

  const [filters, setFilters] = useState({
    keyword: '',
    department: '',
    branch: '',
  });

  const currentPage = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;

  const { data: response, isLoading } = useSalaryOvertimeSummary({
    year,
    month,
    companyId,
  });

  const payload = response?.data?.employees
    ? response.data
    : response?.data?.data?.employees
    ? response.data.data
    : response?.employees
    ? response
    : {};

  const summary = payload?.summary || {};
  const apiRows = Array.isArray(payload?.employees) ? payload.employees : [];

  const filteredRows = useMemo(() => {
    const keyword = String(filters.keyword || '').trim().toLowerCase();
    const department = String(filters.department || '').trim().toLowerCase();
    const branch = String(filters.branch || '').trim().toLowerCase();

    return apiRows.filter((row) => {
      const matchesKeyword =
        !keyword ||
        [
          row?.name,
          row?.code,
          row?.position,
          row?.department,
          row?.branch,
        ].some((value) =>
          String(value || '').toLowerCase().includes(keyword)
        );

      const matchesDepartment =
        !department ||
        String(row?.department || '').toLowerCase().includes(department);

      const matchesBranch =
        !branch ||
        String(row?.branch || '').toLowerCase().includes(branch);

      return matchesKeyword && matchesDepartment && matchesBranch;
    });
  }, [apiRows, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const rows = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, safeCurrentPage, pageSize]);

  const handleDateChange = (newDate) => {
    const params = new URLSearchParams(searchParams);

    params.set('month', String(newDate.getMonth() + 1));
    params.set('year', String(newDate.getFullYear()));
    params.set('company_id', String(companyId));
    params.delete('page');

    setSearchParams(params);
  };

  const handlePageSizeChange = (value) => {
    const params = new URLSearchParams(searchParams);

    params.set('pageSize', String(value));
    params.delete('page');

    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);

    params.set('page', String(page));

    setSearchParams(params);
  };

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters);

    const params = new URLSearchParams(searchParams);

    params.delete('page');

    setSearchParams(params);
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            const newDate = new Date(date);
            newDate.setMonth(newDate.getMonth() - 1);
            handleDateChange(newDate);
          }}
        >
          {isRTL ? (
            <ChevronRight className="size-4 sm:size-5" />
          ) : (
            <ChevronLeft className="size-4 sm:size-5" />
          )}
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Calendar className="me-2 size-4" />
              <span>{formatMonthDisplay(date, i18n.language)}</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="center">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={(selectedDate) =>
                selectedDate && handleDateChange(selectedDate)
              }
              initialFocus
              toDate={new Date()}
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            const newDate = new Date(date);
            newDate.setMonth(newDate.getMonth() + 1);
            handleDateChange(newDate);
          }}
        >
          {isRTL ? (
            <ChevronLeft className="size-4 sm:size-5" />
          ) : (
            <ChevronRight className="size-4 sm:size-5" />
          )}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
          <p className="text-xs font-medium text-slate-500">
            {t('salaries.overtimeSummary.employeesCount')}
          </p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {isLoading
              ? '--'
              : formatNumber(summary?.employees_count, i18n.language)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
          <p className="text-xs font-medium text-slate-500">
            {t('salaries.overtimeSummary.totalMinutes')}
          </p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {isLoading
              ? '--'
              : formatNumber(summary?.total_minutes, i18n.language)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
          <p className="text-xs font-medium text-slate-500">
            {t('salaries.overtimeSummary.totalHours')}
          </p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {isLoading
              ? '--'
              : formatNumber(summary?.total_hours, i18n.language)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
          <p className="text-xs font-medium text-slate-500">
            {t('salaries.overtimeSummary.totalAmount')}
          </p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {isLoading
              ? '--'
              : formatNumber(summary?.total_amount, i18n.language)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <SalaryOvertimeSummaryFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Page Size */}
      <PageSizeSelect
        value={pageSize}
        onChange={handlePageSizeChange}
        options={[10, 20, 50, 100]}
      />

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>{t('tables.headers.id')}</TableHead>
              <TableHead>{t('tables.headers.employee')}</TableHead>
              <TableHead>{t('salaries.overtimeSummary.overtime')}</TableHead>
              <TableHead>{t('salaries.overtimeSummary.amount')}</TableHead>
              <TableHead>{t('tables.headers.action')}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow key={row.employee_id}>
                  <TableCell>{row.code || '--'}</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs">
                        {(row.name || 'NA').slice(0, 2).toUpperCase()}
                      </div>
                      <span>{row.name || '--'}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {formatNumber(row.overtime_hours, i18n.language)}{' '}
                    {t('common.hours')}{' '}
                    ({formatNumber(row.overtime_minutes, i18n.language)}{' '}
                    {t('common.minutes')})
                  </TableCell>

                  <TableCell>
                    {formatNumber(row.overtime_amount, i18n.language)}
                  </TableCell>

                  <TableCell>
                    <AttendanceSheetDialogTrigger
                      employeeId={row.employee_id}
                      month={selectedMonth}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredRows.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}