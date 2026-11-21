// src/features/overtime/pages/OvertimeSummaryPage.jsx

import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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

import { useOvertimeSheetQuery } from '../hooks/useOvertimeSheetQuery';
import OvertimeSheetFilters from '../components/OvertimeSheetFilters';
import AttendanceSheetDialogTrigger from '@/features/attendanceOverview/components/AttendanceSheetDialogTrigger';

function formatMonthDisplay(date, language) {
  return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });
}

/* ============================= */
/*         Page                 */
/* ============================= */

export default function OvertimeSummaryPage() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  /* ===== current date ===== */
  const { month, year, date } = useMemo(() => {
    const m = Number(searchParams.get('month')) || new Date().getMonth() + 1;
    const y = Number(searchParams.get('year')) || new Date().getFullYear();

    return {
      month: m,
      year: y,
      date: new Date(y, m - 1, 1),
    };
  }, [searchParams]);

  const selectedMonth = `${year}-${String(month).padStart(2, '0')}`;

  /* ===== filters ===== */
  const [filters, setFilters] = useState({
    keyword: '',
    department: '',
    branch: '',
  });
  /* ===== pagination ===== */
  const currentPage = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;

  /* ===== API ===== */
  const { data, isLoading } = useOvertimeSheetQuery({
    month: selectedMonth,
    keyword: filters.keyword,
    department: filters.department,
    branch: filters.branch,
    page: currentPage,
    perPage: pageSize,
  });

  const rows = data?.data || [];
  const pagination = data?.meta || {};
  const lastPage = Number(pagination.last_page || 1);

  /* ===== date change ===== */
  const handleDateChange = (newDate) => {
    const params = new URLSearchParams(searchParams);
    params.set('month', String(newDate.getMonth() + 1));
    params.set('year', String(newDate.getFullYear()));
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
    <div className="space-y-6">
      {/* ================= DATE ================= */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* PREV */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            const newDate = new Date(date);
            newDate.setMonth(newDate.getMonth() - 1);
            handleDateChange(newDate);
          }}
        >
          <ChevronLeft className="size-4 sm:size-5" />
        </Button>

        {/* MONTH PICKER */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Calendar className="mr-2 size-4" />
              <span>{formatMonthDisplay(date)}</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="center">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={(d) => d && handleDateChange(d)}
              initialFocus
              toDate={new Date()}
            />
          </PopoverContent>
        </Popover>

        {/* NEXT */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            const newDate = new Date(date);
            newDate.setMonth(newDate.getMonth() + 1);
            handleDateChange(newDate);
          }}
        >
          <ChevronRight className="size-4 sm:size-5" />
        </Button>
      </div>

      <OvertimeSheetFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* ================= PAGE SIZE ================= */}
      <PageSizeSelect
        value={pageSize}
        onChange={handlePageSizeChange}
        options={[10, 20, 50, 100]}
      />

      {/* ================= TABLE ================= */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>{t('tables.headers.id')}</TableHead>
              <TableHead>{t('tables.headers.employee')}</TableHead>
              <TableHead>{t('tables.headers.department')}</TableHead>
              <TableHead>{t('tables.headers.position')}</TableHead>
              <TableHead>{t('overtime.title')}</TableHead>
              <TableHead>{t('tables.headers.action')}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow key={row.employee_id}>
                  <TableCell>{row.employee_code}</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-full bg-gray-200 text-xs">
                        {(row.employee_name || 'NA').slice(0, 2).toUpperCase()}
                      </div>
                      {row.employee_name || '--'}
                    </div>
                  </TableCell>

                  <TableCell>{row.employee_department || '--'}</TableCell>
                  <TableCell>{row.employee_position || '--'}</TableCell>

                  <TableCell>
                    {t('overtime.minutes', { count: row.total_overtime_minutes ?? 0 })}
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
                <TableCell colSpan={6} className="py-6 text-center">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {rows.length > 0 && lastPage > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={lastPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
