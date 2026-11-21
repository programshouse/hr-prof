import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import SystemSettingsEditDeleteActions from '@/components/ui/EditDeleteActions';
import AllowanceBadge from './AllowanceBadge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return '—';

  const first = parts[0]?.charAt(0) || '';
  const last =
    parts.length > 1
      ? parts[parts.length - 1]?.charAt(0)
      : parts[0]?.charAt(1) || '';

  return `${first}${last}`.toUpperCase();
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function EmployeeMiniCard({ employee }) {
  const name = employee?.full_name || '—';
  const code = employee?.code || '—';

  return (
    <div className="flex items-center gap-3">
      <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full text-xs font-semibold">
        {getInitials(name)}
      </div>

      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-slate-900">
          {name}
        </div>
        <div className="truncate text-xs text-indigo-600">
          {code}
        </div>
      </div>
    </div>
  );
}

export default function AllowancesTable({
  data = [],
  loading = false,
  onEdit,
  onDelete,
}) {
  const { t } = useTranslation();
  const rows = useMemo(() => data || [], [data]);

  if (loading && rows.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="space-y-3 p-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-14 w-full rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Table containerClassName="overflow-x-auto">
        <TableHeader className="bg-slate-50/70">
          <TableRow className="border-b border-slate-200 bg-slate-50/70 hover:bg-slate-50/70">
            <TableHead className="h-12 py-4 text-xs font-semibold text-slate-700">
              {t('allowances.headers.id')}
            </TableHead>

            <TableHead className="h-12 py-4 text-xs font-semibold text-slate-700">
              {t('allowances.headers.name')}
            </TableHead>

            <TableHead className="h-12 py-4 text-xs font-semibold text-slate-700">
              {t('allowances.headers.department')}
            </TableHead>

            <TableHead className="h-12 py-4 text-xs font-semibold text-slate-700">
              {t('allowances.headers.allowanceType')}
            </TableHead>

            <TableHead className="h-12 py-4 text-xs font-semibold text-slate-700">
              {t('allowances.headers.amount')}
            </TableHead>

            <TableHead className="h-12 py-4 text-xs font-semibold text-slate-700">
              {t('allowances.headers.startDate')}
            </TableHead>

            <TableHead className="h-12 py-4 text-xs font-semibold text-slate-700">
              {t('allowances.headers.endDate')}
            </TableHead>

            <TableHead className="h-12 py-4 text-xs font-semibold text-slate-700">
              {t('allowances.headers.action')}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.length ? (
            rows.map((row) => {
              const allowanceType =
                !row.type ||
                String(row.type).trim().toLowerCase() === 'n/a'
                  ? t('allowances.noAllowances')
                  : row.type;

              return (
                <TableRow
                  key={row.id}
                  className="border-b border-slate-100 hover:bg-slate-50/40"
                >
                  <TableCell className="text-sm text-slate-700">
                    {row.employee?.code || row.id}
                  </TableCell>

                  <TableCell>
                    <EmployeeMiniCard employee={row.employee} />
                  </TableCell>

                  <TableCell className="text-sm text-slate-700">
                    {row.employee?.department_name ||
                      row.employee?.department?.name ||
                      'Programs'}
                  </TableCell>

                  <TableCell>
                    <AllowanceBadge type={allowanceType} />
                  </TableCell>

                  <TableCell className="text-sm text-slate-700">
                    {formatMoney(row.amount)}
                  </TableCell>

                  <TableCell className="text-sm text-slate-700">
                    {row.from_date || '—'}
                  </TableCell>

                  <TableCell className="text-sm text-slate-700">
                    {row.to_date || '—'}
                  </TableCell>

                  <TableCell>
                    <SystemSettingsEditDeleteActions
                      onEdit={() => onEdit(row)}
                      onDelete={() => onDelete(row)}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={8}
                className="h-28 text-center text-sm text-slate-500"
              >
                {t('allowances.noAllowances')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}