import { useMemo } from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const STATUS_STYLES = {
  completed: 'bg-green-100 text-green-700',
  canceled: 'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700',
  scheduled: 'bg-slate-200 text-slate-700',
  pending: 'bg-yellow-100 text-yellow-800',
};

const prettifyStatus = (s) => {
  if (!s) return '—';

  const str = String(s).toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getStatusClass = (s) => {
  const key = String(s || '').toLowerCase();
  return STATUS_STYLES[key] || 'bg-slate-200 text-slate-700';
};

function toEnglishPeriod(value) {
  return String(value || '')
    .replace(/ص/g, 'AM')
    .replace(/م/g, 'PM')
    .replace(/\bA\.M\.\b/gi, 'AM')
    .replace(/\bP\.M\.\b/gi, 'PM');
}

function formatMeetingTime(value, isArabic = false) {
  if (!value) return '—';

  const raw = toEnglishPeriod(value).trim();

  // Already 12-hour format: 09:30 AM / 09:30 PM
  const twelveHourMatch = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]);
    const minute = twelveHourMatch[2];
    const period = twelveHourMatch[3].toUpperCase();

    if (Number.isNaN(hour)) return '—';

    hour = hour % 12 || 12;

    return `${String(hour).padStart(2, '0')}:${minute} ${
      isArabic ? (period === 'AM' ? 'ص' : 'م') : period
    }`;
  }

  // Supports:
  // 13:30
  // 13:30:00
  // 2026-06-07T13:30:00.000000Z
  // 2026-06-07 13:30:00
  // Important: no new Date(), so timezone will not change the time.
  const timeMatch = raw.match(/(?:T|\s|^)(\d{1,2}):(\d{2})(?::\d{2})?/);

  if (!timeMatch) return raw || '—';

  let hour = Number(timeMatch[1]);
  const minute = timeMatch[2];

  if (Number.isNaN(hour) || hour < 0 || hour > 23) return '—';

  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;

  return `${String(hour).padStart(2, '0')}:${minute} ${
    isArabic ? (period === 'AM' ? 'ص' : 'م') : period
  }`;
}

function formatMeetingTimeRange(row, isArabic) {
  const start = row.original.startTime || row.original.start_time || row.original.from;
  const end = row.original.endTime || row.original.end_time || row.original.to;

  if (row.original.time) {
    const rawTime = String(row.original.time);

    // Supports ranges like "13:00 - 15:00" or "13:00 — 15:00"
    const parts = rawTime.split(/\s*(?:-|—|–|to|الى|إلى)\s*/i).filter(Boolean);

    if (parts.length >= 2) {
      return {
        start: formatMeetingTime(parts[0], isArabic),
        end: formatMeetingTime(parts[1], isArabic),
      };
    }

    return {
      start: formatMeetingTime(rawTime, isArabic),
      end: '',
    };
  }

  return {
    start: formatMeetingTime(start, isArabic),
    end: end ? formatMeetingTime(end, isArabic) : '',
  };
}

export default function MeetingsTable({
  data = [],
  loading = false,
  onEdit,
  onView,
  onDelete,
}) {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === 'ar' || i18n.language?.startsWith('ar');

  const columns = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: t('meetings.table.headers.meetingName'),
        cell: ({ row }) => (
          <div className="text-sm font-medium text-slate-900">
            {row.original.title || row.original.name || '—'}
          </div>
        ),
      },
      {
        accessorKey: 'date',
        header: t('meetings.table.headers.date'),
        cell: ({ row }) => (
          <div className="text-sm text-slate-700">{row.original.date || '—'}</div>
        ),
      },
      {
        id: 'time',
        header: t('meetings.table.headers.time'),
        cell: ({ row }) => {
          const { start, end } = formatMeetingTimeRange(row, isArabic);

          return (
            <div className="text-sm text-slate-700">
              <span>{start || '—'}</span>

              {end ? (
                <>
                  <span className="mx-2 text-slate-300">—</span>
                  <span className="text-amber-600">{end}</span>
                </>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: t('meetings.table.headers.status'),
        cell: ({ row }) => {
          const statusKey = String(row.original.status || '').toLowerCase();

          const translatedStatus = t(`meetings.showMeeting.statuses.${statusKey}`, {
            defaultValue: prettifyStatus(row.original.status),
          });

          return (
            <span
              className={[
                'inline-flex items-center rounded-md px-3 py-1 text-xs font-medium',
                getStatusClass(row.original.status),
              ].join(' ')}
            >
              {translatedStatus}
            </span>
          );
        },
      },
      {
        accessorKey: 'notes',
        header: t('meetings.table.headers.note'),
        cell: ({ row }) => {
          const val = row.original.notes ?? row.original.note;

          return (
            <div className="max-w-[360px] truncate text-sm text-slate-600">
              {val?.trim?.() ? val : '—'}
            </div>
          );
        },
      },
      {
        id: 'action',
        header: () => <div className="text-right">{t('meetings.table.headers.action')}</div>,
        cell: ({ row }) => {
          const meeting = row.original;

          return (
            <div className="flex justify-end">
              <div className="inline-flex overflow-hidden rounded-md border border-slate-200 bg-white">
                {onEdit && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-9 rounded-none border-r border-slate-200 text-slate-600 hover:bg-slate-50"
                    onClick={() => onEdit(meeting)}
                    title={t('meetings.table.actions.edit')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}

                {onView && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-9 rounded-none border-r border-slate-200 text-slate-600 hover:bg-slate-50"
                    onClick={() => onView(meeting)}
                    title={t('meetings.table.actions.view')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}

                {onDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-9 rounded-none text-slate-600 hover:bg-slate-50 hover:text-red-600"
                    onClick={() => onDelete(meeting)}
                    title={t('meetings.table.actions.delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        },
      },
    ],
    [onEdit, onView, onDelete, t, isArabic]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                {[
                  t('meetings.table.headers.meetingName'),
                  t('meetings.table.headers.date'),
                  t('meetings.table.headers.time'),
                  t('meetings.table.headers.status'),
                  t('meetings.table.headers.note'),
                  t('meetings.table.headers.action'),
                ].map((h) => (
                  <TableHead key={h} className="text-xs font-semibold text-slate-600">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {[...Array(6)].map((_, i) => (
                <TableRow key={i} className="border-b border-slate-100">
                  <TableCell className="py-5">
                    <Skeleton className="h-4 w-40" />
                  </TableCell>

                  <TableCell className="py-5">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>

                  <TableCell className="py-5">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>

                  <TableCell className="py-5">
                    <Skeleton className="h-6 w-20 rounded-md" />
                  </TableCell>

                  <TableCell className="py-5">
                    <Skeleton className="h-4 w-64" />
                  </TableCell>

                  <TableCell className="py-5">
                    <div className="flex justify-end">
                      <Skeleton className="h-8 w-28 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <div className="text-sm text-slate-500">{t('meetings.table.noMeetings')}</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-slate-50">
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-b border-slate-100 hover:bg-slate-50/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-5 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}