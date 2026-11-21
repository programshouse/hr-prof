import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function UserMiniCard({ name = '—', code = '' }) {
  const safeName = String(name || '—');

  const initials = safeName
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
        {initials || 'NA'}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900">
          {safeName}
        </p>

        {code ? (
          <p className="text-xs text-primary">
            {code}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function ActivityLogsTable({
  data = [],
  loading = false,
  onView,
}) {
  const { t, i18n } = useTranslation();

  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';

  const formatDate = (dateString) => {
    if (!dateString) return '—';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '—';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const columns = useMemo(
    () => [
      {
        id: 'admin',
        header: t('activityLogs.headers.name'),
        cell: ({ row }) => (
          <UserMiniCard
            name={
              row.original.hr?.name ||
              row.original.new_values?.employee?.full_name ||
              row.original.old_values?.employee?.full_name ||
              '—'
            }
          />
        ),
      },

      {
        accessorKey: 'created_at',
        header: t('activityLogs.headers.date'),
        cell: ({ row }) => {
          const dateValue =
            row.original.created_at ||
            row.original.created_at_formatted;

          return <span>{formatDate(dateValue)}</span>;
        },
      },

      {
        id: 'time',
        header: t('activityLogs.headers.time'),
        cell: ({ row }) => {
          const dateValue =
            row.original.created_at ||
            row.original.created_at_formatted;

          return <span>{formatTime(dateValue)}</span>;
        },
      },

      {
        accessorKey: 'action',
        header: t('activityLogs.headers.action'),
        cell: ({ row }) => {
          const rawAction = String(row.original.action || '');

          const actionKey = rawAction
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/-/g, '_');

          return (
            <span className="capitalize">
              {t(`activityLogs.actions.${actionKey}`, {
                defaultValue: rawAction,
              })}
            </span>
          );
        },
      },

      {
        accessorKey: 'description',
        header: t('activityLogs.headers.description'),
        cell: ({ row }) => (
          <span>
            {row.original.description || '—'}
          </span>
        ),
      },

      {
        id: 'target_employee',
        header: t('activityLogs.headers.targetEmployee'),
        cell: ({ row }) => (
          <UserMiniCard
            name={
              row.original.new_values?.employee?.full_name ||
              row.original.old_values?.employee?.full_name ||
              row.original.new_values?.applicant?.full_name ||
              row.original.old_values?.applicant?.full_name ||
              '—'
            }
            code={
              row.original.new_values?.employee?.code ||
              row.original.old_values?.employee?.code ||
              ''
            }
          />
        ),
      },

      {
        id: 'actions',
        header: t('activityLogs.headers.actions'),
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onView?.(row.original)}
            className="size-8 cursor-pointer rounded-xl text-gray-500 hover:bg-primary/10 hover:text-primary border border-gray-300"
            title={t('activityLogs.actions.view')}
          >
            <Eye className="size-4" />
          </Button>
        ),
      },
    ],
    [t, locale, onView]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="relative overflow-x-auto rounded-xl border bg-white">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="bg-gray-50"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="whitespace-nowrap"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {loading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <TableRow
                key={idx}
                className="border-b last:border-0"
              >
                {Array.from({ length: 7 }).map((__, cellIdx) => (
                  <TableCell key={cellIdx}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-b last:border-0 hover:bg-gray-50/60"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="align-middle"
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                {t('activityLogs.empty.title')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}