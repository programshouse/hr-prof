// src/features/overtime/components/OvertimeTable.jsx

import { useMemo, useState } from 'react';
import { Pencil, Trash } from 'lucide-react';

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

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

import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import { formatTimeAMPMFromAPI } from '../../../lib/formatTime';
import {
  getRequestStatusColorClass,
  translateRequestStatus,
} from '@/utils/requestLabels';

import DeleteOvertimeModal from './DeleteOvertimeModal';

export default function OvertimeTable({
  data = [],
  loading,
  onEdit,
}) {
  const { t, i18n } = useTranslation();
  const { data: departments = [] } = useAllDepartments();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [overtimeToDelete, setOvertimeToDelete] = useState(null);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: t('tables.headers.id'),
        cell: ({ row }) => (
          <span className="font-medium">
            #{row.original.employee?.code || '—'}
          </span>
        ),
      },

      {
        accessorKey: 'employee',
        header: t('tables.headers.employee'),
        cell: ({ row }) => {
          const emp = row.original.employee;

          const department = departments.find(
            (d) => String(d.id) === String(emp?.department_id)
          );

          // ✅ FIXED: auto language department name
          const deptName = department
            ? i18n.language === 'ar'
              ? department.name_ar || department.name_en || '—'
              : department.name_en || '—'
            : '—';

          const fullName = emp?.full_name || '—';

          const initials = fullName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase())
            .join('');

          const avatarUrl =
            row.original.avatarUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              fullName || 'Employee'
            )}`;

          return (
            <div className="flex items-center gap-3 text-nowrap">
              <img
                src={avatarUrl}
                alt={fullName}
                className="size-9 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=Employee`;
                }}
              />

              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {fullName }
                </span>

                <span className="text-primary text-xs font-medium">
                  {deptName}
                </span>
              </div>
            </div>
          );
        },
      },

      {
        accessorKey: 'date',
        header: t('tables.headers.date'),
        cell: ({ row }) => (
          <span className="text-nowrap">
            {row.original.date || '—'}
          </span>
        ),
      },

      {
        accessorKey: 'from',
        header: t('tables.headers.from'),
        cell: ({ row }) => (
          <span className="text-nowrap">
            {row.original.from
              ? formatTimeAMPMFromAPI(
                  row.original.from,
                  i18n.language
                )
              : '—'}
          </span>
        ),
      },

      {
        accessorKey: 'to',
        header: t('tables.headers.time'),
        cell: ({ row }) => (
          <span className="text-nowrap">
            {row.original.to
              ? formatTimeAMPMFromAPI(
                  row.original.to,
                  i18n.language
                )
              : '—'}
          </span>
        ),
      },

      {
        accessorKey: 'reason',
        header: t('tables.headers.duration'),
        cell: ({ row }) => (
          <div
            className="max-w-[200px] truncate"
            title={row.original.reason}
          >
            {row.original.reason || '—'}
          </div>
        ),
      },

      {
        accessorKey: 'status',
        header: t('tables.headers.status'),
        cell: ({ row }) => {
          const status = row.original.status || 'pending';
          const colorClass = getRequestStatusColorClass(status);

          return (
            <span
              className={`inline-flex min-w-24 justify-center rounded-md px-2 py-1 text-xs font-medium md:rounded-lg md:px-3 md:py-1.5 md:text-sm ${colorClass}`}
            >
              {translateRequestStatus(t, status)}
            </span>
          );
        },
      },

      {
        id: 'actions',
        header: t('tables.headers.action'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              className="bg-tertiary text-primary flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200"
              onClick={() => onEdit(row.original)}
            >
              <Pencil className="size-4" />
            </button>

            <button
              className="bg-light-error text-pink flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200"
              onClick={() => {
                setOvertimeToDelete(row.original);
                setDeleteModalOpen(true);
              }}
            >
              <Trash className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    [onEdit, departments, t, i18n.language]
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
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>

                {Array.from({ length: 4 }).map((_, idx) => (
                  <TableCell key={idx}>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                ))}

                <TableCell>
                  <div className="flex gap-2">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="size-8 rounded-full" />
                  </div>
                </TableCell>
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
                {t('emptyStates.noOvertime')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DeleteOvertimeModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        overtime={overtimeToDelete}
      />
    </div>
  );
}