import { useMemo, useState } from 'react';
import { Pencil, Trash } from 'lucide-react';
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
import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import DeleteLeaveModal from './DeleteLeaveModal';
import {
  formatRequestTimeRange,
  getRequestStatusColorClass,
  translateLeaveType,
  translateRequestStatus,
} from '@/utils/requestLabels';

export default function LeavesTable({ data = [], loading, onEdit }) {
  const { t, i18n } = useTranslation();
  const { data: departments = [] } = useAllDepartments();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState(null);

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
        accessorKey: 'employeeName',
        header: t('tables.headers.employee'),
        cell: ({ row }) => {
          const emp = row.original.employee;

          const department = departments.find(
            (d) => String(d.id) === String(emp?.department_id)
          );

          const deptName = department
            ? department.name
            : '—';

          const fullName =
            emp?.full_name ||
            row.original.employeeName ||
            '';

          const initials = fullName
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');

          return (
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-700">
                {initials || 'NA'}
              </div>

              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {fullName || '—'}
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
        accessorKey: 'type',
        header: t('tables.headers.type'),
        cell: ({ row }) => (
          <span>{translateLeaveType(t, row.original.type)}</span>
        ),
      },

      {
        accessorKey: 'date',
        header: t('tables.headers.date'),
        cell: ({ row }) => (
          <span>{row.original.date || '—'}</span>
        ),
      },

      {
        accessorKey: 'time',
        header: t('tables.headers.time'),
        cell: ({ row }) => (
          <span>
            {formatRequestTimeRange(row.original.from, row.original.to, i18n.language)}
          </span>
        ),
      },

      {
        accessorKey: 'replaced_employee.full_name',
        header: t('tables.headers.replacement'),
        cell: ({ row }) => (
          <span>
            {row.original.replaced_employee?.full_name || '—'}
          </span>
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
        accessorKey: 'manager_status',
        header: t('tables.headers.managerStatus', 'Manager Status'),
        cell: ({ row }) => {
          const status = row.original.manager_status || 'pending';
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
              type="button"
              className="bg-tertiary text-primary flex size-8 items-center justify-center rounded-full border border-gray-200"
              onClick={() => onEdit(row.original)}
            >
              <Pencil className="size-4" />
            </button>

            <button
              type="button"
              className="bg-light-error text-pink flex size-8 items-center justify-center rounded-full border border-gray-200"
              onClick={() => {
                setLeaveToDelete(row.original);
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
                {Array.from({ length: columns.length }).map((_, i) => (
                  <TableCell key={i}>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-gray-50/60">
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
                {t('emptyStates.noLeaves')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DeleteLeaveModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        leave={leaveToDelete}
      />
    </div>
  );
}