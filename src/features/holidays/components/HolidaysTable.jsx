// src/features/holidays/components/HolidaysTable.jsx

import { useMemo, useState } from 'react';
import { Pencil, Trash } from 'lucide-react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import {
  resolveHolidayTypeValue,
  resolveHolidayTypeLabel,
} from '@/lib/utils/employeeDisplayName';
import DeleteHolidayModal from './DeleteHolidayModal';
import { useTranslation } from 'react-i18next';

export default function HolidaysTable({ data = [], loading, onEdit }) {
  const { t, i18n } = useTranslation();
  const { data: departments = [] } = useAllDepartments();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState(null);

  const isAr = i18n.language === 'ar' || i18n.language?.startsWith('ar');

  const normalizeKey = (value) =>
    String(value || '')
      .toLowerCase()
      .replace(/[\s-]+/g, '_');

  const formatDateOnly = (value) => {
    if (!value) return '—';

    const raw = String(value).trim();

    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return raw;

    const [, year, month, day] = match;
    return `${year}-${month}-${day}`;
  };

  const getDepartmentName = (emp) => {
    if (!emp) return '—';

    if (emp.department?.name_ar || emp.department?.name_en || emp.department?.name) {
      return isAr
        ? emp.department.name_ar || emp.department.name || emp.department.name_en || '—'
        : emp.department.name_en || emp.department.name || emp.department.name_ar || '—';
    }

    const department = departments.find(
      (d) => String(d.id) === String(emp.department_id)
    );

    if (!department) return '—';

    return isAr
      ? department.name_ar || department.name || department.name_en || '—'
      : department.name_en || department.name || department.name_ar || '—';
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: t('holidays.headers.id'),
        cell: ({ row }) => (
          <span className="font-medium">
            #{row.original.employee?.code || '—'}
          </span>
        ),
      },

      {
        accessorKey: 'employeeName',
        header: t('holidays.headers.employee'),
        cell: ({ row }) => {
          const emp = row.original.employee;

          const fullName = emp?.full_name || row.original.employeeName || '';

          const initials = fullName
            .split(' ')
            .filter(Boolean)
            .map((w) => w.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');

          const employeeImage = emp?.image;
          const departmentName = getDepartmentName(emp);

          return (
            <div className="flex items-center gap-3">
              {employeeImage ? (
                <img
                  src={employeeImage}
                  alt={fullName || 'Employee'}
                  className="size-9 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';

                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}

              <div
                className="flex size-9 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-700"
                style={{ display: employeeImage ? 'none' : 'flex' }}
              >
                {initials || 'NA'}
              </div>

              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {fullName || '—'}
                </span>

                <span className="text-primary text-xs font-medium">
                  {departmentName}
                </span>
              </div>
            </div>
          );
        },
      },

      {
        accessorKey: 'date',
        header: t('holidays.headers.date'),
        cell: ({ row }) => <span>{formatDateOnly(row.original.date)}</span>,
      },

      {
        accessorKey: 'from',
        header: t('holidays.headers.from'),
        cell: ({ row }) => <span>{formatDateOnly(row.original.from)}</span>,
      },

      {
        accessorKey: 'to',
        header: t('holidays.headers.to'),
        cell: ({ row }) => <span>{formatDateOnly(row.original.to)}</span>,
      },

      {
        accessorKey: 'type',
        header: t('holidays.headers.type'),
        cell: ({ row }) => {
          const rawType = resolveHolidayTypeValue(row.original);
          const typeLabel = resolveHolidayTypeLabel(rawType, t);

          return <span className="font-medium">{typeLabel}</span>;
        },
      },

      {
        accessorKey: 'status',
        header: t('holidays.headers.status'),
        cell: ({ row }) => {
          const statusKey = normalizeKey(row.original.status);

          const statusColors = {
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
            pending: 'bg-gray-100 text-gray-700',
          };

          return (
            <span
              className={`inline-flex min-w-24 justify-center rounded-md px-2 py-1 text-xs font-medium md:rounded-lg md:px-3 md:py-1.5 md:text-sm ${
                statusColors[statusKey] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {t(`holidays.status.${statusKey}`, {
                defaultValue: row.original.status || '—',
              })}
            </span>
          );
        },
      },

      {
        accessorKey: 'manager_status',
        header: t('holidays.headers.managerStatus', 'Manager Status'),
        cell: ({ row }) => {
          const statusKey = normalizeKey(row.original.manager_status || 'pending');

          const statusColors = {
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
            pending: 'bg-gray-100 text-gray-700',
          };

          return (
            <span
              className={`inline-flex min-w-24 justify-center rounded-md px-2 py-1 text-xs font-medium md:rounded-lg md:px-3 md:py-1.5 md:text-sm ${
                statusColors[statusKey] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {t(`holidays.status.${statusKey}`, {
                defaultValue: row.original.manager_status || '—',
              })}
            </span>
          );
        },
      },

      {
        id: 'actions',
        header: t('holidays.headers.action'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="bg-tertiary text-primary flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200"
              onClick={() => onEdit(row.original)}
            >
              <Pencil className="size-4" />
            </button>

            <button
              type="button"
              className="bg-light-error text-pink flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200"
              onClick={() => {
                setHolidayToDelete(row.original);
                setDeleteModalOpen(true);
              }}
            >
              <Trash className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    [onEdit, departments, t, isAr]
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
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                {Array.from({ length: columns.length }).map((_, i) => (
                  <TableCell key={i}>
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
                {t('holidays.noHolidaysFound')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DeleteHolidayModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        holiday={holidayToDelete}
      />
    </div>
  );
}