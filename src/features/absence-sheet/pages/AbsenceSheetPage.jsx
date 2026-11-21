import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';
import { Pagination } from '@/components/ui/Pagination';

import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { EmptyState } from '@/components/feedback/EmptyState';

import { MonthNavigation } from '@/features/fingerprintIssues/components/MonthNavigation.jsx';
import SheetFilters from '../../../features/sheets/components/SheetFilters.jsx';
import {
  formatFilterDate,
  getInitialSheetFilters,
  getMonthDateRange,
} from '@/features/sheets/utils/dateFilter';

import { absenceSheetApi } from '../api/absence-sheet.api';

/* =========================================================
 * Helpers
 * ======================================================= */

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

/* =========================================================
 * Default Filters
 * ======================================================= */

const DEFAULT_FILTERS = {
  search: '',
  branch: 'all',
  department: 'all',
  position: 'all',
  shift: 'all',
  from: null,
  to: null,
};

/* =========================================================
 * Get Month From URL
 * ======================================================= */

const getMonthDate = (searchParams) => {
  const year =
    Number(searchParams.get('year')) ||
    new Date().getFullYear();

  const month =
    Number(searchParams.get('month')) ||
    new Date().getMonth() + 1;

  return new Date(year, month - 1, 1);
};

/* =========================================================
 * Status Badge
 * ======================================================= */

const StatusBadge = ({ status }) => {
  const styles =
    status === 'absent'
      ? 'border-none bg-rose-50 text-rose-600'
      : 'border-none bg-slate-100 text-slate-600';

  return (
    <Badge className={styles}>
      {status || '-'}
    </Badge>
  );
};

/* =========================================================
 * Reason Badge
 * ======================================================= */

const ReasonBadge = ({ reason }) => {
  const styles =
    reason === 'absent_without_request'
      ? 'border-none bg-amber-50 text-amber-700'
      : 'border-none bg-blue-50 text-blue-700';

  return (
    <Badge className={styles}>
      {reason || '-'}
    </Badge>
  );
};

/* =========================================================
 * Absence Sheet Page
 * ======================================================= */

export default function AbsenceSheetPage() {
  const { t } = useTranslation();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [filters, setFilters] = useState(() =>
    getInitialSheetFilters(searchParams, DEFAULT_FILTERS)
  );

  /* =======================================================
   * Pagination
   * ===================================================== */

  const page =
    Number(searchParams.get('page')) || 1;

  const pageSize =
    Number(searchParams.get('per_page')) || 10;

  /* =======================================================
   * Current Month
   * ===================================================== */

  const date = useMemo(
    () => getMonthDate(searchParams),
    [searchParams]
  );

  /* =======================================================
   * Change Month
   * ===================================================== */

  const changeDate = (newDate) => {
    const params = new URLSearchParams(
      searchParams
    );

    params.set(
      'month',
      String(newDate.getMonth() + 1)
    );

    params.set(
      'year',
      String(newDate.getFullYear())
    );

    params.delete('page');

    setSearchParams(params);
  };

  /* =======================================================
   * Change Page Size
   * ===================================================== */

  const changePageSize = (value) => {
    const params = new URLSearchParams(
      searchParams
    );

    params.set(
      'per_page',
      String(value)
    );

    params.delete('page');

    setSearchParams(params);
  };

  /* =======================================================
   * Filters
   * ===================================================== */

  const changeFilter = useCallback(
    (key, value) => {
      const normalizedValue =
        key === 'from' || key === 'to'
          ? formatFilterDate(value) || null
          : value;

      setFilters((prev) => ({
        ...prev,
        [key]: normalizedValue,
      }));

      const params =
        new URLSearchParams(searchParams);

      if (
        normalizedValue !== null &&
        normalizedValue !== undefined &&
        normalizedValue !== '' &&
        normalizedValue !== 'all'
      ) {
        params.set(
          key,
          String(normalizedValue)
        );
      } else {
        params.delete(key);
      }

      params.delete('page');

      setSearchParams(params);
    },
    [
      searchParams,
      setSearchParams,
    ]
  );

  /* =======================================================
   * Reset Filters
   * ===================================================== */

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);

    const params = new URLSearchParams();

    /*
     * Keep the current selected month/year when clearing
     * the employee filters.
     */
    params.set(
      'month',
      String(date.getMonth() + 1)
    );

    params.set(
      'year',
      String(date.getFullYear())
    );

    params.set(
      'per_page',
      String(pageSize)
    );

    setSearchParams(params);
  };

  /* =======================================================
   * Date Range
   * ===================================================== */

  const monthRange = useMemo(
    () => getMonthDateRange(date),
    [date]
  );

  /* =======================================================
   * Query
   * ===================================================== */

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      'absence-sheet',
      page,
      pageSize,
      filters,
      date.getFullYear(),
      date.getMonth() + 1,
    ],

    queryFn: () =>
      absenceSheetApi.get({
        page,

        per_page: pageSize,

        from:
          formatFilterDate(filters.from) ||
          monthRange.from,

        to:
          formatFilterDate(filters.to) ||
          monthRange.to,

        keyword:
          filters.search || '',

        branch:
          filters.branch === 'all'
            ? ''
            : filters.branch,

        department:
          filters.department === 'all'
            ? ''
            : filters.department,

        position:
          filters.position === 'all'
            ? ''
            : filters.position,

        shift:
          filters.shift === 'all'
            ? ''
            : filters.shift,
      }),
  });

  /* =======================================================
   * Response
   * ===================================================== */

  const rows = Array.isArray(data?.data)
    ? data.data
    : [];

  const meta = data?.meta || {};

  /* =======================================================
   * Change Page
   * ===================================================== */

  const changePage = (newPage) => {
    const params = new URLSearchParams(
      searchParams
    );

    params.set(
      'page',
      String(newPage)
    );

    setSearchParams(params);
  };

  /* =======================================================
   * Render
   * ===================================================== */

  return (
    <div className="space-y-8">
      {/* ================= Month Navigation ================= */}

      <MonthNavigation
        date={date}
        onDateChange={changeDate}
      />

      {/* ================= Filters ================= */}

      <SheetFilters
        filters={filters}
        onFilterChange={changeFilter}
        onReset={resetFilters}
      />

      {/* ================= Page Size ================= */}

      <PageSizeSelect
        value={pageSize}
        onChange={changePageSize}
      />

      {/* ================= Table ================= */}

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t(
                    'absenceSheet.columns.employee',
                    'Employee'
                  )}
                </TableHead>

                <TableHead>
                  {t(
                    'absenceSheet.columns.date',
                    'Date'
                  )}
                </TableHead>

                <TableHead>
                  {t(
                    'absenceSheet.columns.status',
                    'Status'
                  )}
                </TableHead>

                <TableHead>
                  {t(
                    'absenceSheet.columns.reason',
                    'Reason'
                  )}
                </TableHead>

                <TableHead>
                  {t(
                    'absenceSheet.columns.paid',
                    'Paid'
                  )}
                </TableHead>

                <TableHead>
                  {t(
                    'absenceSheet.columns.amount',
                    'Amount'
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* ================= Loading ================= */}

              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-muted-foreground"
                  >
                    {t(
                      'common.loading',
                      'Loading...'
                    )}
                  </TableCell>
                </TableRow>
              )}

              {/* ================= Error ================= */}

              {!isLoading && isError && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-red-500"
                  >
                    {t(
                      'absenceSheet.error',
                      'Failed to load absence data.'
                    )}
                  </TableCell>
                </TableRow>
              )}

              {/* ================= Empty ================= */}

              {!isLoading &&
                !isError &&
                rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="p-0"
                    >
                      <EmptyState
                        title={t(
                          'absenceSheet.noData.title',
                          'No absence records'
                        )}
                        description={t(
                          'absenceSheet.noData.description',
                          'No absence records were found for the selected period.'
                        )}
                      />
                    </TableCell>
                  </TableRow>
                )}

              {/* ================= Data ================= */}

              {!isLoading &&
                !isError &&
                rows.map((row, index) => {
                  const name =
                    row?.employee_name ||
                    row?.name ||
                    '-';

                  return (
                    <TableRow
                      key={
                        row?.id ||
                        `${row?.employee_id || 'employee'}-${row?.from || 'date'}-${index}`
                      }
                    >
                      {/* Employee */}

                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(
                                name
                              ) || '—'}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {name}
                            </div>

                            <div className="text-xs text-muted-foreground">
                              {row?.code ||
                                '-'}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Date */}

                      <TableCell className="whitespace-nowrap">
                        {row?.from || '-'}

                        {row?.to &&
                          row.to !==
                            row.from &&
                          ` - ${row.to}`}
                      </TableCell>

                      {/* Status */}

                      <TableCell>
                        <StatusBadge
                          status={
                            row?.status
                          }
                        />
                      </TableCell>

                      {/* Reason */}

                      <TableCell>
                        <ReasonBadge
                          reason={
                            row?.reason
                          }
                        />
                      </TableCell>

                      {/* Paid */}

                      <TableCell>
                        {row?.paid
                          ? t(
                              'common.yes',
                              'Yes'
                            )
                          : t(
                              'common.no',
                              'No'
                            )}
                      </TableCell>

                      {/* Amount */}

                      <TableCell className="font-semibold">
                        {row?.amount ??
                          '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ================= Pagination ================= */}

      {!isLoading &&
        !isError &&
        Number(
          meta.last_page || 1
        ) > 1 && (
          <Pagination
            currentPage={Number(
              meta.current_page ||
                page
            )}
            totalPages={Number(
              meta.last_page || 1
            )}
            onPageChange={
              changePage
            }
          />
        )}
    </div>
  );
}