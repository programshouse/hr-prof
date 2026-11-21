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
import DeleteLoanModal from './DeleteLoanModal';
import { useTranslation } from 'react-i18next';

import {
  getRequestStatusColorClass,
  translateRequestStatus,
} from '@/utils/requestLabels';

import { formatCountWithUnit } from '@/utils/durationLabels';

/* =========================
   Helpers
========================= */

function getDepartmentName(dept, i18n) {
  if (!dept) return '—';

  // Arabic UI → try Arabic name if exists
  if (i18n.language === 'ar') {
    return dept.name_ar || dept.name_en;
  }

  // English default
  return dept.name_en;
}

export default function LoansTable({ data = [], loading, onEdit }) {
  const { t, i18n } = useTranslation();
  const { data: departments = [] } = useAllDepartments();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState(null);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: t('loans.headers.id'),
        cell: ({ row }) => (
          <span className="font-medium">
            #{row.original.employee?.code || '—'}
          </span>
        ),
      },

      {
        accessorKey: 'employee',
        header: t('loans.headers.employee'),
        cell: ({ row }) => {
          const emp = row.original.employee;

          const department = departments.find(
            (d) => String(d.id) === String(emp?.department_id)
          );

          const deptName = getDepartmentName(department, i18n);

          return (
            <div className="flex items-center gap-3">
              <img
                src={`https://ui-avatars.com/api/?name=${emp?.full_name || 'Employee'}`}
                alt={emp?.full_name || 'Employee'}
                className="size-9 rounded-full object-cover"
              />

              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {emp?.full_name || 'Unknown Employee'}
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
        header: t('loans.headers.date'),
        cell: ({ row }) => <span>{row.original.date || '—'}</span>,
      },

      {
        accessorKey: 'amount',
        header: t('loans.headers.amount'),
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.amount || '0.00'}
          </span>
        ),
      },

      {
        accessorKey: 'paymentPeriod',
        header: t('loans.headers.paymentPeriod'),
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCountWithUnit(t, row.original.months || 0, 'month')}
          </span>
        ),
      },

      {
        accessorKey: 'status',
        header: t('loans.headers.status'),
        cell: ({ row }) => {
          const status = row.original.status || 'pending';
          const colorClass = getRequestStatusColorClass(status);

          return (
            <span
              className={`inline-flex min-w-24 justify-center rounded-md px-2 py-1 text-xs font-medium ${colorClass}`}
            >
              {translateRequestStatus(t, status)}
            </span>
          );
        },
      },

      {
        id: 'actions',
        header: t('loans.headers.action'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              className="bg-tertiary text-primary flex size-8 items-center justify-center rounded-full border"
              onClick={() => onEdit(row.original)}
            >
              <Pencil className="size-4" />
            </button>

            <button
              className="bg-light-error text-pink flex size-8 items-center justify-center rounded-full border"
              onClick={() => {
                setLoanToDelete(row.original);
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
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="bg-gray-50">
              {hg.headers.map((h) => (
                <TableHead key={h.id}>
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={6}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                {t('loans.noLoansFound')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DeleteLoanModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        loan={loanToDelete}
      />
    </div>
  );
}