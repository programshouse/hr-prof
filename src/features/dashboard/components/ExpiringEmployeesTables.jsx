import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  CloudUpload,
  CreditCard,
  FileClock,
} from 'lucide-react';

import { dashboardApi } from '../api/dashboard.api';
import EmployeeFilters from '@/features/employees/components/EmployeeFilters';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Skeleton } from '@/components/ui/skeleton';
import ExportDialog from '@/components/ui/exportDialog.jsx';

import {
  exportToExcel,
  exportToPdf,
  printTable,
} from '@/lib/export/tableExport.js';

/* =========================================================
 * Helpers
 * ======================================================= */

const dateOnly = (value) =>
  value
    ? String(value).slice(0, 10)
    : '—';

const employeeName = (row) =>
  row?.full_name ||
  row?.name ||
  row?.full_name_ar ||
  row?.applicant?.full_name ||
  '—';

const departmentName = (row) =>
  row?.department?.name_en ||
  row?.department?.name_ar ||
  row?.department?.name ||
  row?.department ||
  '—';

const unwrapRows = (payload) => {
  const data =
    payload?.data ?? payload;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
};

const initials = (row) =>
  employeeName(row)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || '—';

/* =========================================================
 * Expiry Table
 * ======================================================= */

function ExpiryTable({
  type,
  rows,
  loading,
  compact,
  filters,
  setFilters,
  onOpen,
  highlightId,
}) {
  const { t } = useTranslation();

  const rowKey = (row) => String(row?.id ?? row?.employee_id ?? '');
  const isHighlighted = (row) =>
    !compact &&
    highlightId != null &&
    highlightId !== '' &&
    [row?.id, row?.employee_id].some(
      (v) => v != null && String(v) === String(highlightId)
    );

  // Scroll to the employee coming from a notification once rows are loaded
  useEffect(() => {
    if (compact || loading || !highlightId) return;
    const el = document.getElementById(`expiry-row-${type}-${highlightId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [compact, loading, highlightId, rows, type]);

  const isContracts =
    type === 'contracts';

  const dateKey = isContracts
    ? 'end_date'
    : 'national_id_expiry_date';

  const title = isContracts
    ? t(
        'expiryDates.contracts.title',
        'Expiring Contracts'
      )
    : t(
        'expiryDates.nationalIds.title',
        'Expiring National IDs'
      );

  const Icon = isContracts
    ? FileClock
    : CreditCard;

  const detailsPath = isContracts
    ? '/expiring-contracts'
    : '/expiring-national-ids';

  /*
   * Dashboard:
   * Show only first 3 employees.
   *
   * Full page:
   * Show all returned employees.
   */
  const visibleRows = compact
    ? rows.slice(0, 3)
    : rows;

  /* =======================================================
   * Export
   * ===================================================== */

  // Same headers, same order as the on-screen table
  const exportColumns = useMemo(
    () => [
      {
        key: 'full_name',
        label: t(
          'tables.headers.name',
          'Name'
        ),
      },
      {
        key: 'department',
        label: t(
          'tables.headers.department',
          'Department'
        ),
      },
      {
        key: 'position',
        label: t(
          'tables.headers.job',
          'Position'
        ),
      },
      {
        key: dateKey,
        label: t(
          'expiryDates.expiryDate',
          'Expiry Date'
        ),
      },
    ],
    [dateKey, t]
  );

  const exportRows = useMemo(
    () =>
      rows.map((row) => ({
        ...row,

        full_name:
          employeeName(row),

        department:
          departmentName(row),

        [dateKey]: dateOnly(
          row?.[dateKey]
        ),
      })),
    [rows, dateKey]
  );

  const exportArgs = {
    rows: exportRows,
    columns: exportColumns,
    title,

    fileName: isContracts
      ? 'expiring-contracts'
      : 'expiring-national-ids',
  };

  /* =======================================================
   * Render
   * ===================================================== */

  return (
    <Card className="w-full min-w-0 overflow-hidden">
      {/* ================= Header ================= */}

      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="size-5 shrink-0 text-primary" />

          <CardTitle className="truncate">
            {title}
          </CardTitle>
        </div>

        {compact ? (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="shrink-0"
          >
            <Link to={detailsPath}>
              {t(
                'common.seeDetails',
                'See details'
              )}
            </Link>
          </Button>
        ) : (
          <ExportDialog
            trigger={
              <Button
                variant="outline"
                size="lg"
              >
                <CloudUpload className="size-4" />

                <span>
                  {t(
                    'employees.actions.export',
                    'Export'
                  )}
                </span>
              </Button>
            }
            onPdf={() =>
              exportRows.length &&
              exportToPdf(
                exportArgs
              )
            }
            onExcel={() =>
              exportRows.length &&
              exportToExcel(
                exportArgs
              )
            }
            onPrintTable={() =>
              exportRows.length &&
              printTable(
                exportArgs
              )
            }
          />
        )}
      </CardHeader>

      {/* ================= Filters ================= */}

      {!compact && (
        <div className="border-y bg-white px-4 py-4">
          <EmployeeFilters
            filters={filters}
            onFiltersChange={
              setFilters
            }
            hideType
            showStatus={false}
          />
        </div>
      )}

      {/* ================= Table ================= */}

      <div className="w-full overflow-x-auto border-t">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="px-4 py-3">
                {t(
                  'tables.headers.name',
                  'Name'
                )}
              </TableHead>

              <TableHead className="px-4 py-3">
                {t(
                  'tables.headers.department',
                  'Department'
                )}
              </TableHead>

              <TableHead className="px-4 py-3">
                {t(
                  'tables.headers.job',
                  'Position'
                )}
              </TableHead>

              <TableHead className="px-4 py-3">
                {t(
                  'expiryDates.expiryDate',
                  'Expiry Date'
                )}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* ================= Loading ================= */}

            {loading ? (
              Array.from({
                length: compact
                  ? 3
                  : 5,
              }).map((_, i) => (
                <TableRow
                  key={`skeleton-${i}`}
                >
                  {Array.from({
                    length: 4,
                  }).map(
                    (__, j) => (
                      <TableCell
                        key={`skeleton-${i}-${j}`}
                        className="px-4 py-3"
                      >
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    )
                  )}
                </TableRow>
              ))
            ) : visibleRows.length ? (
              /* ================= Rows ================= */

              visibleRows.map(
                (row) => (
                  <TableRow
                    key={`${
                      row?.id ||
                      row?.employee_id
                    }-${dateKey}`}
                    id={`expiry-row-${type}-${rowKey(row)}`}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      isHighlighted(row)
                        ? 'bg-primary/10 ring-2 ring-inset ring-primary/50'
                        : ''
                    }`}
                    onClick={() =>
                      onOpen(row)
                    }
                  >
                    {/* Employee */}

                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {row?.image ? (
                          <img
                            src={
                              row.image
                            }
                            alt={employeeName(
                              row
                            )}
                            className="size-10 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700">
                            {initials(
                              row
                            )}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-900">
                            {employeeName(
                              row
                            )}
                          </div>

                          <div className="text-xs text-primary">
                            {row?.code ||
                              '—'}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Department */}

                    <TableCell className="px-4 py-3 text-sm font-medium text-slate-900">
                      {departmentName(
                        row
                      )}
                    </TableCell>

                    {/* Position */}

                    <TableCell className="px-4 py-3">
                      <span className="inline-flex rounded-lg bg-indigo-100 px-3 py-1.5 text-sm font-medium text-primary">
                        {row?.position ||
                          '—'}
                      </span>
                    </TableCell>

                    {/* Expiry date */}

                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2 whitespace-nowrap text-sm text-slate-600">
                        <Calendar className="size-4 shrink-0 text-default" />

                        {dateOnly(
                          row?.[
                            dateKey
                          ]
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )
            ) : (
              /* ================= Empty ================= */

              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-muted-foreground"
                >
                  {t(
                    'expiryDates.noData',
                    'No expiry data found'
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

/* =========================================================
 * Expiring Employees Tables
 * ======================================================= */

export default function ExpiringEmployeesTables({
  compact = false,
  type = 'both',
}) {
  const navigate =
    useNavigate();

  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('employee');

  const [
    contracts,
    setContracts,
  ] = useState([]);

  const [
    nationalIds,
    setNationalIds,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    filters,
    setFilters,
  ] = useState({});

  /* =======================================================
   * Load Data
   * ===================================================== */

  useEffect(() => {
    let active = true;

    const params = compact
      ? {}
      : filters;

    const requests = [];

    if (
      type === 'both' ||
      type === 'contracts'
    ) {
      requests.push(
        dashboardApi
          .getExpiringContracts(
            params
          )
          .then((response) => [
            'contracts',
            unwrapRows(response),
          ])
      );
    }

    if (
      type === 'both' ||
      type ===
        'nationalIds'
    ) {
      requests.push(
        dashboardApi
          .getExpiringNationalIds(
            params
          )
          .then((response) => [
            'nationalIds',
            unwrapRows(response),
          ])
      );
    }

    setLoading(true);

    Promise.all(requests)
      .then((results) => {
        if (!active) {
          return;
        }

        results.forEach(
          ([key, data]) => {
            if (
              key ===
              'contracts'
            ) {
              setContracts(
                data
              );
            } else {
              setNationalIds(
                data
              );
            }
          }
        );
      })
      .catch((error) => {
        console.error(
          'Failed to load expiry data',
          error
        );

        if (!active) {
          return;
        }

        if (
          type !==
          'nationalIds'
        ) {
          setContracts([]);
        }

        if (
          type !==
          'contracts'
        ) {
          setNationalIds([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [
    compact,
    filters,
    type,
  ]);

  /* =======================================================
   * Employee Profile
   * ===================================================== */

  const openEmployee = (
    row
  ) => {
    const id =
      row?.id ||
      row?.employee_id;

    if (id) {
      navigate(
        `/employees/${id}`
      );
    }
  };

  /* =======================================================
   * Render
   * ===================================================== */

  return (
    <div
      className={
        compact
          ? 'grid grid-cols-1 gap-6 lg:grid-cols-2'
          : 'space-y-6'
      }
    >
      {/* ================= Contracts ================= */}

      {(type === 'both' ||
        type ===
          'contracts') && (
        <ExpiryTable
          type="contracts"
          rows={contracts}
          loading={loading}
          compact={compact}
          filters={filters}
          setFilters={
            setFilters
          }
          onOpen={
            openEmployee
          }
          highlightId={highlightId}
        />
      )}

      {/* ================= National ID ================= */}

      {(type === 'both' ||
        type ===
          'nationalIds') && (
        <ExpiryTable
          type="nationalIds"
          rows={
            nationalIds
          }
          loading={loading}
          compact={compact}
          filters={filters}
          setFilters={
            setFilters
          }
          onOpen={
            openEmployee
          }
          highlightId={highlightId}
        />
      )}
    </div>
  );
}