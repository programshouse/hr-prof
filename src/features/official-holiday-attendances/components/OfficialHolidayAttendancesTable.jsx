import { useMemo, useState } from 'react';
import { Pencil, Trash } from 'lucide-react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { resolveEmployeeDisplayName } from '@/lib/utils/employeeDisplayName';
import { useAllEmployees } from '@/shared/hooks/useAllEmployees';

import DeleteOfficialHolidayAttendanceModal from './DeleteOfficialHolidayAttendanceModal';
import {
  formatOfficialHolidayDate,
  getOfficialHolidayEmployeeId,
} from './officialHolidayAttendanceUtils';

const resolveEmployeeName = (employee, preferArabic, employeeLookup) => {
  const source = employee?.employee ?? employee;
  const employeeId = getOfficialHolidayEmployeeId(employee);
  const lookupEmployee = employeeId != null ? employeeLookup.get(String(employeeId)) : null;
  const lookupSource = lookupEmployee?.employee ?? lookupEmployee;

  return (
    resolveEmployeeDisplayName(source, { preferArabic }) ||
    resolveEmployeeDisplayName(lookupSource, { preferArabic }) ||
    String(
      source?.code ||
        source?.employee_code ||
        lookupSource?.code ||
        lookupSource?.employee_code ||
        employeeId ||
        ''
    )
  );
};

export default function OfficialHolidayAttendancesTable({
  data = [],
  loading = false,
  onEdit,
}) {
  const { t, i18n } = useTranslation();
  const preferArabic = i18n.language?.startsWith('ar');
  const { data: allEmployees = [] } = useAllEmployees(true);

  const employeeLookup = useMemo(() => {
    return new Map(
      allEmployees
        .map((employee) => [getOfficialHolidayEmployeeId(employee), employee])
        .filter(([id]) => id != null)
        .map(([id, employee]) => [String(id), employee])
    );
  }, [allEmployees]);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: t('officialHolidayAttendance.headers.id'),
        cell: ({ row }) => <span className="font-medium">#{row.original.id}</span>,
      },
      {
        accessorKey: 'start_date',
        header: t('officialHolidayAttendance.headers.from'),
        cell: ({ row }) => (
          <span>{formatOfficialHolidayDate(row.original.start_date, i18n.language)}</span>
        ),
      },
      {
        accessorKey: 'end_date',
        header: t('officialHolidayAttendance.headers.to'),
        cell: ({ row }) => (
          <span>{formatOfficialHolidayDate(row.original.end_date, i18n.language)}</span>
        ),
      },
      {
        accessorKey: 'duration_days',
        header: t('officialHolidayAttendance.headers.duration'),
        cell: ({ row }) => <span>{row.original.duration_days ?? '—'}</span>,
      },
      {
        accessorKey: 'day_multiplier',
        header: t('officialHolidayAttendance.headers.multiplier'),
        cell: ({ row }) => (
          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            ×{row.original.day_multiplier ?? '—'}
          </span>
        ),
      },
      {
        accessorKey: 'calculated_days',
        header: t('officialHolidayAttendance.headers.calculatedDays'),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.calculated_days ?? '—'}</span>
        ),
      },
      {
        id: 'employees',
        header: t('officialHolidayAttendance.headers.employees'),
        cell: ({ row }) => {
          const employees = Array.isArray(row.original.employees) ? row.original.employees : [];
          const labels = employees
            .map((employee) => resolveEmployeeName(employee, preferArabic, employeeLookup))
            .filter(Boolean);

          if (!labels.length) return <span>—</span>;

          const shown = labels.slice(0, 2);
          const remaining = labels.length - shown.length;
          const display = shown.join(', ') + (remaining > 0 ? `, ... +${remaining}` : '');

          return (
            <span className="block max-w-[280px] truncate" title={labels.join(', ')}>
              {display}
            </span>
          );
        },
      },
      {
        accessorKey: 'notes',
        header: t('officialHolidayAttendance.headers.notes'),
        cell: ({ row }) => (
          <span className="block max-w-[260px] truncate" title={row.original.notes || ''}>
            {row.original.notes || '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: t('officialHolidayAttendance.headers.action'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="bg-tertiary text-primary flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200"
              onClick={() => onEdit?.(row.original)}
              title={t('officialHolidayAttendance.actions.edit')}
            >
              <Pencil className="size-4" />
            </button>

            <button
              type="button"
              className="bg-light-error text-pink flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200"
              onClick={() => {
                setAttendanceToDelete(row.original);
                setDeleteModalOpen(true);
              }}
              title={t('officialHolidayAttendance.actions.delete')}
            >
              <Trash className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    [employeeLookup, i18n.language, onEdit, preferArabic, t]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="relative">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-gray-50">
              {headerGroup.headers.map((header) => (
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
          {loading ? (
            Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns.length }).map((__, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-4 w-16" />
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
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t('officialHolidayAttendance.empty')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DeleteOfficialHolidayAttendanceModal
        open={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open);
          if (!open) setAttendanceToDelete(null);
        }}
        attendance={attendanceToDelete}
      />
    </div>
  );
}
