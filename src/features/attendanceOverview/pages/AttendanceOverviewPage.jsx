// src/features/attendanceOverview/pages/AttendanceOverviewPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Pagination } from '@/components/ui/Pagination';
import { formatDateToLocal } from '@/shared/utils/dateUtils';
import PageSizeSelect from '@/components/shared/PageSizeSelect';

import { useMonthlyReportQuery } from '../hooks/useMonthlyReportQuery'; // FULL TIME
import { usePartTimeMonthlyReportQuery } from '../hooks/usePartTimeMonthlyReportQuery'; // PART TIME

import { OverviewSummaryCards } from '../components/OverviewSummaryCards';
import { useDailySummaryCards } from '../../attendance/hooks/useDailySummaryCards';
import OverviewFilters from '../components/OverviewFilters';
import OverviewTable from '../components/OverviewTable';
import PartTimeOverviewTable from '../components/PartTimeOverviewTable';
import { formatMinutesDurationLong } from '@/utils/durationLabels';

/* ---------------- Helpers: normalize API shape ---------------- */
/**
 * Supports both shapes:
 * 1) { data: [...], meta: {...} }
 * 2) { data: { data: [...], current_page, last_page, per_page, total } }
 */
const getApiRows = (res) => {
  if (!res) return [];

  // Handle array data (normal case)
  if (Array.isArray(res?.data)) return res.data;

  // Handle nested array data
  if (Array.isArray(res?.data?.data)) return res.data.data;

  // Handle object with numeric keys (like page 2 response)
  if (res?.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
    // Convert object values to array
    const values = Object.values(res.data);
    // Check if the values look like employee data objects
    if (values.length > 0 && values[0]?.employee_id) {
      return values;
    }
  }

  return [];
};

const getApiMeta = (res) => {
  if (!res) return null;

  // { meta: {...} }
  if (res?.meta && typeof res.meta === 'object') return res.meta;

  // { data: { current_page, last_page, per_page, total, data: [...] } }
  if (
    res?.data &&
    typeof res.data === 'object' &&
    !Array.isArray(res.data) &&
    (res.data.current_page || res.data.last_page || res.data.per_page || res.data.total)
  ) {
    return {
      current_page: res.data.current_page,
      last_page: res.data.last_page,
      per_page: res.data.per_page,
      total: res.data.total,
    };
  }

  // Handle direct pagination properties on response (for part-time API)
  if (
    res &&
    typeof res === 'object' &&
    !Array.isArray(res) &&
    (res.current_page || res.last_page || res.per_page || res.total)
  ) {
    return {
      current_page: res.current_page,
      last_page: res.last_page,
      per_page: res.per_page,
      total: res.total,
    };
  }

  return null;
};

/* ---------------------- MAIN PAGE ---------------------- */
export default function AttendanceOverviewPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    from: searchParams.get('from') || formatDateToLocal(startOfMonth),
    to: searchParams.get('to') || formatDateToLocal(endOfMonth),
    company: searchParams.get('company') || 'all',
    branch: searchParams.get('branch') || 'all',
    timeFilter: searchParams.get('timeFilter') || 'days', // days => full-time, hours => part-time
  }));

  const [page, setPage] = useState(() => parseInt(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(() => Number(searchParams.get('pageSize')) || 10);

  const handlePageSizeChange = (num) => {
    setPageSize(num);
    setPage(1);
    // Invalidate queries to force refetch with new page size
    queryClient.invalidateQueries({ queryKey: ['attendanceMonthlyReport'] });
    queryClient.invalidateQueries({ queryKey: ['attendancePartTimeMonthlyReport'] });
  };

  // persist branch
  useEffect(() => {
    if (filters.branch && filters.branch !== 'all') {
      localStorage.setItem('selectedBranch', filters.branch);
    } else {
      localStorage.removeItem('selectedBranch');
    }
  }, [filters.branch]);

  // Update URL parameters when state changes
  useEffect(() => {
    const params = new URLSearchParams();

    // Add filter parameters (skip undefined, null, 'undefined' string, empty, and 'all')
    if (filters.search && filters.search !== 'undefined') {
      params.set('search', filters.search);
    }
    if (filters.from && filters.from !== 'undefined') {
      params.set('from', filters.from);
    }
    if (filters.to && filters.to !== 'undefined') {
      params.set('to', filters.to);
    }
    if (filters.company && filters.company !== 'all' && filters.company !== 'undefined') {
      params.set('company', filters.company);
    }
    if (filters.branch && filters.branch !== 'all' && filters.branch !== 'undefined') {
      params.set('branch', filters.branch);
    }
    if (filters.timeFilter && filters.timeFilter !== 'days' && filters.timeFilter !== 'undefined') {
      params.set('timeFilter', filters.timeFilter);
    }

    // Add page parameter
    if (page > 1) {
      params.set('page', page.toString());
    }

    // Add pageSize parameter
    if (pageSize) {
      params.set('pageSize', pageSize.toString());
    }

    setSearchParams(params);
  }, [filters, page, pageSize, setSearchParams]);

  // reset page when filters change
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    const safe = Math.min(Math.max(1, nextPage), totalPages || 1);
    setPage(safe);
  };

  const queryParams = useMemo(
    () => ({
      fromDate: filters.from,
      toDate: filters.to,
      company: filters.company !== 'all' ? filters.company : undefined,
      branch: filters.branch !== 'all' ? filters.branch : undefined,
      keyword: filters.search || undefined,
      name_code_phone: filters.search || undefined,
      page,
      perPage: pageSize,
    }),
    [filters.from, filters.to, filters.company, filters.branch, filters.search, page, pageSize]
  );

  // choose API (Days = Full-Time, Hours = Part-Time)
  const fullQuery = useMonthlyReportQuery(queryParams);
  const partTimeQuery = usePartTimeMonthlyReportQuery(queryParams);
  const activeQuery = filters.timeFilter === 'days' ? fullQuery : partTimeQuery;

  // ✅ IMPORTANT: isFetching fixes "empty page" during page change refetch
  const { data: activeData, isLoading, isFetching } = activeQuery;
  const loading = isLoading || isFetching;

  // daily summary cards
  const { data: cardsData } = useDailySummaryCards({
    fromDate: filters.from,
    toDate: filters.to,
    branch: filters.branch,
  });

  // normalize rows/meta
  const apiRowsRaw = getApiRows(activeData);
  const apiMeta = getApiMeta(activeData);

  // map rows for FULL TIME only; PART TIME keep as-is
  const rows =
    filters.timeFilter === 'days'
      ? apiRowsRaw.map((item) => {
          const incompleteDays =
            item.late_days ?? item.days_with_incomplete_shifts ?? item.incomplete_days ?? 0;

          const incompleteMinutes =
            item.total_late_minutes ?? item.total_incomplete_shifts ?? item.incomplete_minutes ?? 0;

          const overtimeDays =
            item.overtime_days ?? item.days_with_overtime ?? item.overtime_count ?? 0;

          const overtimeMinutes =
            item.total_overtime ?? item.total_overtime_minutes ?? item.overtime_minutes ?? 0;

          return {
            id: item.employee_code ?? item.employee_id,
            employeeId: item.employee_id,
            name: item.employee_name,
            role: item.employee_position,

            attendanceDays: item.present_days ?? item.attendance_days ?? 0,
            absenceDays: item.absent_days ?? item.absence_days ?? 0,

            incompleteShifts: {
              value: incompleteDays,
              duration: formatMinutesDurationLong(t, incompleteMinutes),
            },

            overtimeWorked: {
              value: overtimeDays,
              duration: formatMinutesDurationLong(t, overtimeMinutes),
            },
          };
        })
      : apiRowsRaw;

  // pagination (server-side when meta exists)
  const total = apiMeta?.total ?? rows.length;
  const perPage = apiMeta?.per_page ?? pageSize;
  const currentPage = apiMeta?.current_page ?? page;
  const totalPages =
    apiMeta?.last_page ?? Math.max(1, Math.ceil((Number(total) || 0) / (Number(perPage) || 1)));

  // ✅ IMPORTANT: do NOT show EmptyState while fetching next page
  const hasNoData = !loading && (!rows || rows.length === 0);

  const getMonthFromDateRange = () => {
    if (filters.from) {
      const date = new Date(filters.from);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const month = getMonthFromDateRange();

  const handleRowClick = (row) => {
    console.log('Row clicked:', row);
    // Add any row click logic here
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">{t('attendance.overview')}</h1>

      <OverviewSummaryCards
        data={Array.isArray(cardsData) ? cardsData[0] : cardsData?.[0] || cardsData}
      />

      <OverviewFilters filters={filters} onFiltersChange={handleFiltersChange} />

      <div className="flex items-center justify-between">
        <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
      </div>

      <Card>
        {filters.timeFilter === 'days' ? (
          <OverviewTable 
            rows={rows} 
            isLoading={loading} 
            month={month} 
            fromDate={filters.from} 
            toDate={filters.to}
            onRowClick={handleRowClick}
          />
        ) : (
          <PartTimeOverviewTable rows={rows} isLoading={loading} month={month} />
        )}
      </Card>

      {/* Pagination */}
      {!hasNoData && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
